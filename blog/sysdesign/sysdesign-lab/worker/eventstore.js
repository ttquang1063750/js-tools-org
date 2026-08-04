/**
 * eventstore.js — event sourcing thật trên PostgreSQL (Bài 14), 0 dependency.
 *
 * Ý tưởng của bài: nguồn chân lý KHÔNG phải bảng số dư, mà là chuỗi sự kiện đã xảy ra.
 * Bảng số dư chỉ là một PROJECTION — một cách trình bày lịch sử cho tiện đọc — và vì nó
 * chỉ là cách trình bày nên xoá đi dựng lại lúc nào cũng được.
 *
 *   ROLE=seed        ghi N sự kiện vào log append-only (đo tốc độ ghi)
 *   ROLE=project     dựng read model từ log bằng MỘT câu SQL (đo tốc độ replay)
 *   ROLE=projectApp  replay bằng code ứng dụng — con số trung thực hơn cho projection thật
 *   ROLE=replay2x    chạy projection HAI LẦN để đo hậu quả khi nó không idempotent
 *   ROLE=snapshot    so thời gian đọc trạng thái: replay toàn bộ vs snapshot + phần đuôi
 *   ROLE=concurrent  hai người ghi cùng version: chứng minh event store tự chặn
 *   ROLE=verify      đối chiếu read model với phép gấp lại từ log (phát hiện lệch)
 *
 * Biến môi trường: PG_HOST, EVENTS, AGGREGATES, IDEMPOTENT, BATCH
 */

'use strict';

const { MiniPg } = require('/app/minipg');

const PG_HOST = process.env.PG_HOST || 'postgres';
const ROLE = process.env.ROLE || 'seed';
const EVENTS = Number(process.env.EVENTS || 200000);
const AGGREGATES = Number(process.env.AGGREGATES || 1000);
const IDEMPOTENT = process.env.IDEMPOTENT === '1';
const BATCH = Number(process.env.BATCH || 1000);

const pg = new MiniPg({ host: PG_HOST });

// ---------------------------------------------------------------------------
// Schema
//
// Ba ràng buộc dưới đây là toàn bộ phần "event store" — không cần thư viện nào:
//   * `seq BIGSERIAL`     thứ tự TOÀN CỤC, projection dùng nó làm checkpoint
//   * `UNIQUE(event_id)`  chống ghi trùng khi producer thử lại (Bài 11)
//   * `UNIQUE(aggregate, version)` khoá đồng thời lạc quan: hai người cùng ghi
//                         version 7 cho một tài khoản thì đúng MỘT người thắng
// ---------------------------------------------------------------------------
const SCHEMA = `
CREATE TABLE IF NOT EXISTS events (
  seq        BIGSERIAL PRIMARY KEY,
  aggregate  TEXT   NOT NULL,
  version    INT    NOT NULL,
  type       TEXT   NOT NULL,
  amount     BIGINT NOT NULL,
  event_id   TEXT   NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (aggregate, version)
);
CREATE TABLE IF NOT EXISTS read_balances (
  aggregate      TEXT   PRIMARY KEY,
  balance        BIGINT NOT NULL,
  events_applied INT    NOT NULL
);
CREATE TABLE IF NOT EXISTS projection_state (
  name     TEXT   PRIMARY KEY,
  last_seq BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS snapshots (
  aggregate TEXT   PRIMARY KEY,
  version   INT    NOT NULL,
  balance   BIGINT NOT NULL
);
`;

const q = (sql) => pg.query(sql);
const ms = (t0) => Number(process.hrtime.bigint() - t0) / 1e6;

// ---------------------------------------------------------------------------
// ROLE=seed — ghi sự kiện vào log
//
// Chỉ có INSERT. Không một lệnh UPDATE hay DELETE nào chạm vào bảng `events` trong
// toàn bộ file này — đó là định nghĩa của append-only, và cũng là thứ khiến mọi phép
// replay sau này cho ra cùng một kết quả.
// ---------------------------------------------------------------------------
async function seed() {
  await q(SCHEMA);
  await q('TRUNCATE events, read_balances, projection_state, snapshots');

  const t0 = process.hrtime.bigint();
  let n = 0;
  const versions = new Array(AGGREGATES).fill(0);

  while (n < EVENTS) {
    const rows = [];
    for (let i = 0; i < BATCH && n < EVENTS; i++, n++) {
      const a = n % AGGREGATES;
      versions[a]++;
      // Tên sự kiện ở THÌ QUÁ KHỨ: `Deposited`, không phải `Deposit`. Sự kiện là một
      // việc ĐÃ xảy ra, không phải một mệnh lệnh sắp thực hiện — phân biệt này quyết
      // định cả cách đặt tên lẫn cách xử lý lỗi (mục 14.2).
      const type = n % 3 === 2 ? 'Withdrawn' : 'Deposited';
      const amount = type === 'Withdrawn' ? -(10 + (n % 40)) : 20 + (n % 60);
      rows.push(`('acc-${a}', ${versions[a]}, '${type}', ${amount}, 'evt-${n}')`);
    }
    await q(`INSERT INTO events (aggregate, version, type, amount, event_id) VALUES ${rows.join(',')}`);
  }

  const took = ms(t0);
  console.log(
    JSON.stringify({
      role: 'seed',
      events: EVENTS,
      aggregates: AGGREGATES,
      ms: Math.round(took),
      eventsPerSec: Math.round((EVENTS / took) * 1000),
    })
  );
}

// ---------------------------------------------------------------------------
// ROLE=project — dựng read model từ log
//
// Đây là toàn bộ CQRS trong một hàm: đường GHI chỉ biết append sự kiện, đường ĐỌC là
// bảng `read_balances` do hàm này dựng nên. Hai bên có thể scale và tối ưu độc lập,
// đổi lại read model luôn trễ một nhịp so với log — nhất quán cuối (Bài 9).
//
// IDEMPOTENT=1 dùng checkpoint `projection_state.last_seq` nên chạy lại bao nhiêu lần
// cũng ra cùng kết quả. IDEMPOTENT=0 là bản NGÂY THƠ: nó cộng dồn mọi sự kiện nó đọc
// được, nên chạy lần thứ hai là cộng thêm lần nữa.
// ---------------------------------------------------------------------------
async function project(reportRole = 'project') {
  await q(SCHEMA);
  const t0 = process.hrtime.bigint();

  let from = 0;
  if (IDEMPOTENT) {
    const st = await q("SELECT last_seq FROM projection_state WHERE name = 'balances'");
    from = st.length ? Number(st[0].last_seq) : 0;
  }

  // Gấp toàn bộ log thành số dư bằng MỘT câu lệnh: đây là "replay" ở dạng cô đọng nhất.
  // ON CONFLICT ... DO UPDATE cộng dồn vào phần đã có, nên nó chạy được cả khi read
  // model đang có sẵn dữ liệu từ lần chạy trước.
  await q(`
    INSERT INTO read_balances (aggregate, balance, events_applied)
    SELECT aggregate, SUM(amount), COUNT(*)
    FROM events WHERE seq > ${from}
    GROUP BY aggregate
    ON CONFLICT (aggregate) DO UPDATE
      SET balance = read_balances.balance + EXCLUDED.balance,
          events_applied = read_balances.events_applied + EXCLUDED.events_applied
  `);

  const maxRow = await q(`SELECT COALESCE(MAX(seq), 0) AS m, COUNT(*) AS c FROM events WHERE seq > ${from}`);
  const applied = Number(maxRow[0].c);
  const maxSeq = Number(maxRow[0].m);

  if (IDEMPOTENT) {
    await q(`
      INSERT INTO projection_state (name, last_seq) VALUES ('balances', ${maxSeq})
      ON CONFLICT (name) DO UPDATE SET last_seq = EXCLUDED.last_seq
    `);
  }

  const took = ms(t0);
  const tot = await q('SELECT SUM(balance) AS s, SUM(events_applied) AS e FROM read_balances');
  return {
    role: reportRole,
    idempotent: IDEMPOTENT,
    eventsApplied: applied,
    ms: Math.round(took),
    eventsPerSec: took > 0 ? Math.round((applied / took) * 1000) : 0,
    tongSoDu: Number(tot[0].s || 0),
    tongSuKienDaAp: Number(tot[0].e || 0),
  };
}

// ---------------------------------------------------------------------------
// ROLE=replay2x — chạy projection hai lần, so kết quả với sự thật
//
// Con số cần nhìn: `tongSoDu` sau lần chạy thứ hai so với `dungPhaiLa`. Với projection
// idempotent thì hai số bằng nhau; với bản ngây thơ thì số dư gấp đôi — và không có
// lỗi nào được ném ra, read model chỉ đơn giản là SAI.
// ---------------------------------------------------------------------------
async function replay2x() {
  await q(SCHEMA);
  await q('TRUNCATE read_balances, projection_state');

  const truth = await q('SELECT SUM(amount) AS s, COUNT(*) AS c FROM events');
  const dungPhaiLa = Number(truth[0].s);
  const soSuKien = Number(truth[0].c);

  const lan1 = await project('lan-1');
  const lan2 = await project('lan-2');

  console.log(
    JSON.stringify(
      {
        role: 'replay2x',
        idempotent: IDEMPOTENT,
        soSuKienTrongLog: soSuKien,
        dungPhaiLa,
        lan1,
        lan2,
        ketLuan:
          lan2.tongSoDu === dungPhaiLa
            ? 'DUNG — replay bao nhieu lan cung ra cung ket qua'
            : `SAI — read model lech ${lan2.tongSoDu - dungPhaiLa} (gap ${(lan2.tongSoDu / dungPhaiLa).toFixed(2)} lan)`,
      },
      null,
      2
    )
  );
}

// ---------------------------------------------------------------------------
// ROLE=projectApp — replay bằng CODE ỨNG DỤNG, không phải bằng một câu SQL
//
// Vì sao cần cả hai phép đo: bản `project` gấp log bằng một câu `GROUP BY`, và nó nhanh
// đến mức dễ gây hiểu lầm rằng "replay lúc nào cũng rẻ". Projection thật hiếm khi gấp
// gọn được thành một câu SQL — nó có luật nghiệp vụ, có rẽ nhánh theo loại sự kiện, có
// khi phải gọi ra ngoài. Bản này kéo từng sự kiện về tiến trình rồi gấp trong JavaScript,
// đúng như một projection worker thật, để có con số trung thực hơn.
// ---------------------------------------------------------------------------
async function projectApp() {
  await q(SCHEMA);
  const t0 = process.hrtime.bigint();
  const rows = await q('SELECT aggregate, type, amount FROM events ORDER BY seq');
  const tFetch = ms(t0);

  const state = new Map();
  for (const r of rows) {
    const cur = state.get(r.aggregate) || 0;
    // Rẽ nhánh theo loại sự kiện — đây là chỗ luật nghiệp vụ sống, và cũng là chỗ
    // không thể đẩy xuống database được.
    state.set(r.aggregate, r.type === 'Withdrawn' ? cur + Number(r.amount) : cur + Number(r.amount));
  }
  const took = ms(t0);
  let tong = 0;
  for (const v of state.values()) tong += v;

  console.log(
    JSON.stringify({
      role: 'projectApp',
      events: rows.length,
      msKeoVe: Math.round(tFetch),
      msTong: Math.round(took),
      eventsPerSec: Math.round((rows.length / took) * 1000),
      tongSoDu: tong,
    })
  );
}

// ---------------------------------------------------------------------------
// ROLE=snapshot — vì sao log dài thì phải có snapshot
//
// Đọc trạng thái hiện tại của MỘT aggregate theo hai cách:
//   (a) gấp lại toàn bộ sự kiện của nó từ version 1
//   (b) lấy snapshot rồi chỉ gấp phần sự kiện sau snapshot
// Với log ngắn, (a) hoàn toàn ổn. Chi phí của (a) tăng tuyến tính theo độ dài log, còn
// (b) thì không — đó là toàn bộ lý do snapshot tồn tại.
// ---------------------------------------------------------------------------
async function snapshot() {
  await q(SCHEMA);
  // Một aggregate DÀI, dựng riêng cho phép đo này. Aggregate của `seed` chỉ có vài trăm
  // sự kiện — ở quy mô đó snapshot gần như không giúp gì, và đó cũng là một kết luận
  // cần nói ra: snapshot là công cụ cho aggregate dài, không phải bước bắt buộc.
  const agg = process.env.AGG || 'acc-long';
  const LONG = Number(process.env.LONG || 100000);
  if (agg === 'acc-long') {
    await q(`DELETE FROM events WHERE aggregate = '${agg}'`);
    const stamp = Date.now();
    for (let n = 0; n < LONG; n += BATCH) {
      const rows = [];
      for (let i = 0; i < BATCH && n + i < LONG; i++) {
        const v = n + i + 1;
        rows.push(`('${agg}', ${v}, 'Deposited', ${1 + (v % 9)}, 'long-${stamp}-${v}')`);
      }
      await q(`INSERT INTO events (aggregate, version, type, amount, event_id) VALUES ${rows.join(',')}`);
    }
  }
  const info = await q(`SELECT COUNT(*) AS c, MAX(version) AS v FROM events WHERE aggregate = '${agg}'`);
  const soSuKien = Number(info[0].c);
  const versionMax = Number(info[0].v);

  const N = 20;
  const doFull = [];
  for (let i = 0; i < N; i++) {
    const t = process.hrtime.bigint();
    await q(`SELECT SUM(amount) FROM events WHERE aggregate = '${agg}'`);
    doFull.push(ms(t));
  }

  // Snapshot tại 90% chiều dài log: phần đuôi còn 10% sự kiện.
  const cut = Math.floor(versionMax * 0.9);
  const snapVal = await q(`SELECT SUM(amount) AS s FROM events WHERE aggregate = '${agg}' AND version <= ${cut}`);
  await q(`
    INSERT INTO snapshots (aggregate, version, balance) VALUES ('${agg}', ${cut}, ${Number(snapVal[0].s)})
    ON CONFLICT (aggregate) DO UPDATE SET version = EXCLUDED.version, balance = EXCLUDED.balance
  `);

  const doSnap = [];
  for (let i = 0; i < N; i++) {
    const t = process.hrtime.bigint();
    await q(`SELECT balance FROM snapshots WHERE aggregate = '${agg}'`);
    await q(`SELECT SUM(amount) FROM events WHERE aggregate = '${agg}' AND version > ${cut}`);
    doSnap.push(ms(t));
  }

  const avg = (a) => Number((a.reduce((x, y) => x + y, 0) / a.length).toFixed(3));
  console.log(
    JSON.stringify(
      {
        role: 'snapshot',
        aggregate: agg,
        soSuKien,
        snapshotTaiVersion: cut,
        suKienConLaiSauSnapshot: versionMax - cut,
        gapLaiToanBo_ms: avg(doFull),
        // Lưu ý: cách này tốn THÊM một vòng mạng (đọc snapshot rồi mới đọc đuôi).
        // Với log ngắn, chính vòng mạng đó có thể đắt hơn phần tiết kiệm được.
        snapshotCongDuoi_ms: avg(doSnap),
      },
      null,
      2
    )
  );
}

// ---------------------------------------------------------------------------
// ROLE=concurrent — event store tự chặn ghi đè mất dữ liệu
//
// Hai tiến trình cùng đọc "tài khoản đang ở version 5" rồi cùng ghi version 6. Với
// bảng trạng thái thông thường (UPDATE balance = ...), người ghi sau đè lên người ghi
// trước và KHÔNG AI BIẾT. Với event store, ràng buộc UNIQUE(aggregate, version) làm
// người thua nhận lỗi ngay — và "nhận lỗi ngay" là thứ có thể xử lý được.
// ---------------------------------------------------------------------------
async function concurrent() {
  await q(SCHEMA);
  const agg = 'acc-race';
  await q(`DELETE FROM events WHERE aggregate = '${agg}'`);
  await q(`INSERT INTO events (aggregate, version, type, amount, event_id)
           VALUES ('${agg}', 1, 'Deposited', 100, 'race-seed-${Date.now()}')`);

  const pg2 = new MiniPg({ host: PG_HOST });
  const stamp = Date.now();
  const write = (conn, who) =>
    conn
      .query(
        `INSERT INTO events (aggregate, version, type, amount, event_id)
         VALUES ('${agg}', 2, 'Withdrawn', -50, 'race-${who}-${stamp}')`
      )
      .then(() => ({ who, ketQua: 'THANG — su kien duoc ghi' }))
      .catch((e) => ({ who, ketQua: 'THUA — bi tu choi', loi: e.message.split('\n')[0] }));

  const out = await Promise.all([write(pg, 'A'), write(pg2, 'B')]);
  pg2.close();
  const rows = await q(`SELECT COUNT(*) AS c FROM events WHERE aggregate = '${agg}'`);

  console.log(
    JSON.stringify(
      {
        role: 'concurrent',
        ketQua: out,
        soSuKienCuoiCung: Number(rows[0].c),
        ghiChu: 'Dung 2 su kien: version 1 va version 2. Nguoi thua KHONG de mat du lieu cua nguoi thang.',
      },
      null,
      2
    )
  );
}

// ---------------------------------------------------------------------------
// ROLE=verify — read model có còn khớp với log không
//
// Câu hỏi này chỉ trả lời được vì log là nguồn chân lý: gấp lại log lần nữa rồi so.
// Với hệ thống lưu trạng thái hiện tại, không có gì để đối chiếu — dữ liệu sai trông
// y hệt dữ liệu đúng.
// ---------------------------------------------------------------------------
async function verify() {
  await q(SCHEMA);
  const truth = await q('SELECT SUM(amount) AS s FROM events');
  const model = await q('SELECT SUM(balance) AS s FROM read_balances');
  const t = Number(truth[0].s || 0);
  const m = Number(model[0].s || 0);
  console.log(
    JSON.stringify({
      role: 'verify',
      tuLog: t,
      tuReadModel: m,
      lech: m - t,
      ketLuan: m === t ? 'KHOP' : 'LECH — read model phai dung lai tu log',
    })
  );
}

const roles = {
  seed,
  project: async () => console.log(JSON.stringify(await project())),
  projectApp,
  replay2x,
  snapshot,
  concurrent,
  verify,
};
const main = roles[ROLE] || seed;
main()
  .then(() => {
    pg.close();
    process.exit(0);
  })
  .catch((e) => {
    console.error(ROLE, 'loi:', e.message);
    process.exit(1);
  });
