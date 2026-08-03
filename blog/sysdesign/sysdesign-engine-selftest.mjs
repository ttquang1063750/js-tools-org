/**
 * sysdesign-engine-selftest.mjs
 * Bộ kiểm chứng cho `sysdesign-sim-engine.js` — chạy bằng Node, không cần cài gì thêm:
 *
 *   node sysdesign-engine-selftest.mjs
 *
 * Vì sao cần file này? Một bộ mô phỏng sai vẫn cho ra những con số "trông rất hợp lý",
 * và mọi bài học trong series đều dựa vào các con số đó. Nên engine phải được đối chiếu
 * với thứ đã biết chắc: công thức lý thuyết hàng đợi M/M/1 và định luật Little.
 *
 * Bài học kèm theo (chính là nội dung Bài 2 — "đo cho đúng"): một phép đo chỉ đáng tin khi
 * bạn có một mốc độc lập để đối chiếu. Ở đây mốc đó là toán học.
 */

import { Simulator, mm1Theory, percentile } from './sysdesign-sim-engine.js';
import { HashRing, moduloAssign, countMigrations, compareAddNode, makeKeys } from './sysdesign-hashring.js';

let failed = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failed++;
};

// ---------------------------------------------------------------------------
// 1. M/M/1: thời gian trong hệ phải khớp W = 1 / (mu - lambda)
// ---------------------------------------------------------------------------
console.log('\n[1] M/M/1 — mô phỏng vs lý thuyết (dung sai 8%)');
{
  const mu = 100; // serviceMs = 10ms => 100 request/giây
  for (const lambda of [20, 50, 80, 90, 95]) {
    const sim = new Simulator({ seed: 12345 });
    sim.addStage({
      id: 'app',
      replicas: 1,
      servers: 1,
      serviceMs: 1000 / mu,
      serviceDist: 'exponential',
      queueLimit: 1e9,
    });
    const m = sim.run({ rps: lambda, durationMs: 600000, warmupMs: 60000 });
    const wTheoryMs = mm1Theory(lambda, mu).W * 1000;
    const err = Math.abs(m.latency.mean - wTheoryMs) / wTheoryMs;
    check(
      `lambda=${lambda} (rho=${(lambda / mu).toFixed(2)})`,
      err < 0.08,
      `lý thuyết ${wTheoryMs.toFixed(1)}ms vs mô phỏng ${m.latency.mean.toFixed(1)}ms (lệch ${(err * 100).toFixed(1)}%)`
    );
  }
}

// ---------------------------------------------------------------------------
// 2. Định luật Little: L = lambda * W, và utilization = rho
// ---------------------------------------------------------------------------
console.log("\n[2] Little's Law & utilization");
{
  const sim = new Simulator({ seed: 7 });
  sim.addStage({ id: 'app', replicas: 1, servers: 1, serviceMs: 10, queueLimit: 1e9 });
  const m = sim.run({ rps: 80, durationMs: 600000, warmupMs: 60000 });
  const th = mm1Theory(80, 100);
  const lSim = 80 * (m.latency.mean / 1000);
  check('L = lambda * W', Math.abs(lSim - th.L) / th.L < 0.08, `${th.L.toFixed(3)} vs ${lSim.toFixed(3)}`);
  check(
    'utilization = rho',
    Math.abs(m.stages[0].utilization - th.rho) / th.rho < 0.05,
    `${th.rho.toFixed(3)} vs ${m.stages[0].utilization.toFixed(3)}`
  );
}

// ---------------------------------------------------------------------------
// 3. Bộ sinh tải KHÔNG được tự nhân tải khi có nhiều tầng
//
//    Đây là bug thật đã từng lọt lưới: các chặng nội bộ (tầng k -> k+1) dùng chung
//    event 'arrival' với bộ sinh tải, nên mỗi request lại sinh thêm một request mới
//    => hệ 3 tầng tự nhân tải theo cấp số. Bug này KHÔNG bị phát hiện bởi mục [1]
//    vì M/M/1 chỉ có một tầng. Bài học: test phải phủ đúng cấu hình mình sẽ dùng.
// ---------------------------------------------------------------------------
console.log('\n[3] Nhiều tầng — tải đưa vào phải đúng bằng rps (chống bug tự nhân tải)');
{
  for (const nStages of [1, 2, 3, 5]) {
    const sim = new Simulator({ seed: 5 });
    for (let i = 0; i < nStages; i++) {
      // Công suất mỗi tầng rất lớn để không tầng nào nghẽn => completed ~ offered.
      sim.addStage({ id: `s${i}`, replicas: 4, servers: 16, serviceMs: 1, queueLimit: 100000 });
    }
    const rps = 100;
    const durationMs = 60000;
    const m = sim.run({ rps, durationMs });
    const expected = (rps * durationMs) / 1000;
    const err = Math.abs(m.offered - expected) / expected;
    check(
      `${nStages} tầng`,
      err < 0.05,
      `offered=${m.offered} (kỳ vọng ~${expected}), throughput=${m.throughput.toFixed(1)}/s`
    );
  }
}

// ---------------------------------------------------------------------------
// 4. Chế độ live: đổi rps giữa lúc chạy phải có hiệu lực ngay
// ---------------------------------------------------------------------------
console.log('\n[4] Chế độ live — setRps() có hiệu lực và không dồn sự kiện');
{
  const sim = new Simulator({ seed: 2024 });
  sim.addStage({ id: 'app', replicas: 8, servers: 8, serviceMs: 5, queueLimit: 100000 });
  sim.beginLive({ rps: 60 });
  const tick = (n) => {
    let s;
    for (let i = 0; i < n; i++) s = sim.advance(16);
    return s;
  };

  tick(700); // ~11s
  let before = sim.liveSnapshot().completed;
  let tBefore = sim.liveSnapshot().t;
  sim.setRps(200);
  tick(700);
  let snap = sim.liveSnapshot();
  const tpHigh = ((snap.completed - before) / (snap.t - tBefore)) * 1000;
  check('sau setRps(200)', Math.abs(tpHigh - 200) / 200 < 0.15, `throughput đo được ${tpHigh.toFixed(1)}/s`);

  before = snap.completed;
  tBefore = snap.t;
  sim.setRps(60);
  tick(700);
  snap = sim.liveSnapshot();
  const tpLow = ((snap.completed - before) / (snap.t - tBefore)) * 1000;
  check('sau setRps(60)', Math.abs(tpLow - 60) / 60 < 0.15, `throughput đo được ${tpLow.toFixed(1)}/s`);

  // Nếu bộ sinh tải bị dồn, hàng đợi sự kiện sẽ phình ra hàng nghìn phần tử.
  const pending = sim._st.events.size;
  check('không dồn sự kiện tương lai', pending < 50, `${pending} sự kiện đang chờ`);
}

// ---------------------------------------------------------------------------
// 5. Cache short-circuit: hit ratio thực đo phải khớp cấu hình
// ---------------------------------------------------------------------------
console.log('\n[5] Tầng cache — hit ratio thực đo khớp cấu hình');
{
  for (const hr of [0.5, 0.9, 0.99]) {
    const sim = new Simulator({ seed: 42 });
    sim.addStage({ id: 'cache', replicas: 1, servers: 64, serviceMs: 0.5, hitRatio: hr, shortCircuit: true });
    sim.addStage({ id: 'db', replicas: 1, servers: 16, serviceMs: 10, queueLimit: 10000 });
    const m = sim.run({ rps: 200, durationMs: 120000, warmupMs: 5000 });
    const measured = m.stages[0].hitRatio;
    check(`hitRatio=${hr}`, Math.abs(measured - hr) < 0.02, `đo được ${(measured * 100).toFixed(1)}%`);
  }
}

// ---------------------------------------------------------------------------
// 6. Determinism: cùng seed phải cho cùng kết quả (để số trong bài tái lập được)
// ---------------------------------------------------------------------------
console.log('\n[6] Determinism — cùng seed cho cùng kết quả');
{
  const runOnce = () => {
    const sim = new Simulator({ seed: 999 });
    sim.addStage({ id: 'app', replicas: 3, servers: 2, serviceMs: 15, lb: 'round-robin' });
    sim.addStage({ id: 'db', replicas: 1, servers: 8, serviceMs: 4 });
    return sim.run({ rps: 200, durationMs: 30000 });
  };
  const a = runOnce();
  const b = runOnce();
  check('p99 giống nhau', a.latency.p99 === b.latency.p99, `${a.latency.p99.toFixed(4)}ms`);
  check('completed giống nhau', a.completed === b.completed, `${a.completed}`);
}

// ---------------------------------------------------------------------------
// 7. percentile(): kiểm tra biên
// ---------------------------------------------------------------------------
console.log('\n[7] percentile() — các trường hợp biên');
{
  check('mảng rỗng => 0', percentile([], 99) === 0);
  check('một phần tử', percentile([42], 50) === 42);
  check('p100 = max', percentile([1, 2, 3, 100], 100) === 100);
  check('p0 = min', percentile([5, 1, 9], 0) === 1);
  const ten = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  check('p50 của 1..10 = 5', percentile(ten, 50) === 5, `nearest-rank: ceil(0.5*10)=5 => phần tử thứ 5`);
  check('không làm thay đổi mảng đầu vào', ten[0] === 1 && ten[9] === 10);
}

// ---------------------------------------------------------------------------
// 8. Consistent hashing (Bài 8) — tỉ lệ di trú phải khớp lý thuyết
// ---------------------------------------------------------------------------
console.log('\n[8] Consistent hashing — số key phải di trú khi thêm 1 node');
{
  const keys = makeKeys(20000);
  for (const n of [2, 4, 8]) {
    const nodesBefore = Array.from({ length: n }, (_, i) => `node${i + 1}`);
    const r = compareAddNode(keys, nodesBefore, `node${n + 1}`, 200);
    // modulo: kỳ vọng (N-1)/N  |  consistent: kỳ vọng 1/(N+1)
    const modOk = Math.abs(r.modulo.ratio - r.theory.moduloRatio) < 0.05;
    const chOk = Math.abs(r.consistent.ratio - r.theory.consistentRatio) < 0.05;
    check(
      `${n} → ${n + 1} node: modulo`,
      modOk,
      `di trú ${(r.modulo.ratio * 100).toFixed(1)}% (lý thuyết ${(r.theory.moduloRatio * 100).toFixed(1)}%)`
    );
    check(
      `${n} → ${n + 1} node: consistent hashing`,
      chOk,
      `di trú ${(r.consistent.ratio * 100).toFixed(1)}% (lý thuyết ${(r.theory.consistentRatio * 100).toFixed(1)}%)`
    );
  }
}

console.log('\n[9] Virtual node — càng nhiều vnode thì tải càng đều');
{
  const keys = makeKeys(20000);
  const spreads = [];
  for (const v of [1, 10, 100, 500]) {
    const ring = new HashRing({ vnodes: v });
    for (let i = 1; i <= 5; i++) ring.addNode(`node${i}`);
    const d = ring.loadDistribution(keys);
    spreads.push({ v, spread: d.spread });
    console.log(`       vnodes=${String(v).padStart(3)} → độ lệch tải ${(d.spread * 100).toFixed(1)}%`);
  }
  // Phải giảm ĐƠN ĐIỆU theo số vnode, không chỉ hai đầu tốt hơn nhau.
  let monotonic = true;
  for (let i = 1; i < spreads.length; i++) {
    if (spreads[i].spread >= spreads[i - 1].spread) monotonic = false;
  }
  check('độ lệch giảm đơn điệu khi tăng vnode', monotonic);
  const s1 = spreads.find((s) => s.v === 1).spread;
  const s500 = spreads.find((s) => s.v === 500).spread;
  check('vnodes=1 lệch nặng (>100%)', s1 > 1.0, `${(s1 * 100).toFixed(1)}%`);
  check('vnodes=500 chấp nhận được (<25%)', s500 < 0.25, `${(s500 * 100).toFixed(1)}%`);
}

console.log('\n[10] HashRing — tính tất định & các trường hợp biên');
{
  const ring = new HashRing({ vnodes: 50 });
  check('vòng rỗng trả null', ring.getNode('bất kỳ') === null);
  ring.addNode('a').addNode('b').addNode('c');
  const k = 'user:12345';
  const first = ring.getNode(k);
  check('cùng key luôn về cùng node', ring.getNode(k) === first, `→ ${first}`);

  // Bớt rồi thêm lại đúng node đó phải tái lập vòng cũ (vị trí vnode là tất định).
  const before = ring.assignAll(makeKeys(500));
  ring.removeNode('b');
  ring.addNode('b');
  const after = ring.assignAll(makeKeys(500));
  const m = countMigrations(before, after);
  check('bớt rồi thêm lại cùng node → vòng tái lập y nguyên', m.moved === 0, `${m.moved} key bị di chuyển`);

  // Xoá node thì key của nó phải chuyển sang node khác, không được biến mất.
  const assigned = ring.assignAll(makeKeys(500));
  ring.removeNode('c');
  const reassigned = ring.assignAll(makeKeys(500));
  const orphan = [...reassigned.values()].filter((v) => v === 'c' || v == null).length;
  check('xoá node không để key nào mất chủ', orphan === 0, `${orphan} key không có node`);
  check('key cũ của node bị xoá được nhận lại', countMigrations(assigned, reassigned).moved > 0);
}

console.log('\n[11] moduloAssign — mọi key phải có node');
{
  const keys = makeKeys(100);
  const m = moduloAssign(keys, ['n1', 'n2', 'n3']);
  check('gán đủ 100 key', m.size === 100);
  check(
    'không có key nào undefined',
    [...m.values()].every((v) => typeof v === 'string')
  );
  check('danh sách node rỗng → map rỗng', moduloAssign(keys, []).size === 0);
}

console.log(
  failed === 0 ? '\n==> TẤT CẢ ĐỀU ĐẠT\n' : `\n==> CÓ ${failed} MỤC KHÔNG ĐẠT — engine đang sai, KHÔNG dùng số của nó\n`
);
process.exit(failed === 0 ? 0 : 1);
