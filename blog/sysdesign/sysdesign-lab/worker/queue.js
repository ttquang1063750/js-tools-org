/**
 * queue.js — producer/consumer Redis Streams cho Bài 12, không dependency.
 *
 *   ROLE=producer  bơm N job vào stream
 *   ROLE=consumer  đọc job trong consumer group, xử lý, rồi XACK
 *   ROLE=depth     in queue depth theo thời gian (chỉ số sức khoẻ số một)
 *
 * Biến môi trường chính:
 *   REDIS_URL, STREAM (mặc định lab:jobs), GROUP (mặc định g1), CONSUMER
 *   COUNT        producer: số job bơm vào
 *   POISON_EVERY producer: cứ bao nhiêu job thì chèn một job "độc" không xử lý được
 *   WORK_MS      consumer: thời gian xử lý mỗi job
 *   ACK_MODE     'after' (đúng) | 'on-receive' (sai — để đo thiệt hại)
 *   MAX_ATTEMPTS consumer: quá số lần này thì đẩy sang DLQ (0 = không có DLQ)
 *   IDEMPOTENT   '1' = dedup theo event_id trước khi gây side-effect
 *   DURATION_MS  consumer/depth: chạy bao lâu rồi thoát
 */

'use strict';

const net = require('net');

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const ROLE = process.env.ROLE || 'consumer';
const STREAM = process.env.STREAM || 'lab:jobs';
const DLQ = process.env.DLQ || 'lab:jobs:dlq';
const GROUP = process.env.GROUP || 'g1';
const CONSUMER = process.env.CONSUMER || 'c1';
const COUNT = Number(process.env.COUNT || 10000);
const POISON_EVERY = Number(process.env.POISON_EVERY || 0);
const WORK_MS = Number(process.env.WORK_MS || 2);
const ACK_MODE = process.env.ACK_MODE || 'after';
const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS || 0);
const IDEMPOTENT = process.env.IDEMPOTENT === '1';
const DURATION_MS = Number(process.env.DURATION_MS || 30000);
// How many jobs to read ahead per XREADGROUP (the prefetch). Larger means fewer
// round-trips, but with ACK_MODE=on-receive this is EXACTLY the number of jobs that can
// be lost when a worker dies (Lesson 12, section 12.2).
const BATCH = Number(process.env.BATCH || 32);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Client Redis tối giản, có hỗ trợ mảng lồng nhau (cần cho XREADGROUP)
// ---------------------------------------------------------------------------
class MiniRedis {
  constructor(url) {
    const u = new URL(url);
    this.host = u.hostname;
    this.port = Number(u.port || 6379);
    this.buf = Buffer.alloc(0);
    this.queue = [];
  }
  connect() {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      const s = net.createConnection({ host: this.host, port: this.port }, () => resolve(this));
      s.setNoDelay(true);
      s.on('data', (d) => {
        this.buf = Buffer.concat([this.buf, d]);
        this._pump();
      });
      s.on('error', reject);
      this.sock = s;
    });
    return this.ready;
  }
  /** Phân tích một giá trị RESP tại vị trí i. Trả [giá trị, vị trí kế tiếp] hoặc null nếu chưa đủ. */
  _parse(i) {
    const b = this.buf;
    if (i >= b.length) return null;
    const nl = b.indexOf('\r\n', i);
    if (nl < 0) return null;
    const t = String.fromCharCode(b[i]);
    const head = b.toString('utf8', i + 1, nl);
    if (t === '+') return [head, nl + 2];
    if (t === '-') return [new Error(head), nl + 2];
    if (t === ':') return [Number(head), nl + 2];
    if (t === '$') {
      const len = Number(head);
      if (len === -1) return [null, nl + 2];
      if (b.length < nl + 2 + len + 2) return null;
      return [b.toString('utf8', nl + 2, nl + 2 + len), nl + 2 + len + 2];
    }
    if (t === '*') {
      const n = Number(head);
      if (n === -1) return [null, nl + 2];
      const out = [];
      let p = nl + 2;
      for (let k = 0; k < n; k++) {
        const r = this._parse(p);
        if (!r) return null;
        out.push(r[0]);
        p = r[1];
      }
      return [out, p];
    }
    return [head, nl + 2];
  }
  _pump() {
    for (;;) {
      if (!this.queue.length) return;
      const r = this._parse(0);
      if (!r) return;
      this.buf = this.buf.subarray(r[1]);
      const q = this.queue.shift();
      if (r[0] instanceof Error) q.reject(r[0]);
      else q.resolve(r[0]);
    }
  }
  cmd(...args) {
    return this.connect().then(
      () =>
        new Promise((resolve, reject) => {
          this.queue.push({ resolve, reject });
          let out = `*${args.length}\r\n`;
          for (const a of args) {
            const s = String(a);
            out += `$${Buffer.byteLength(s)}\r\n${s}\r\n`;
          }
          this.sock.write(out);
        })
    );
  }
}

const redis = new MiniRedis(REDIS_URL);

// ---------------------------------------------------------------------------
// PRODUCER
// ---------------------------------------------------------------------------
async function produce() {
  // MKSTREAM để tạo stream nếu chưa có. Bỏ qua lỗi BUSYGROUP nếu group đã tồn tại.
  await redis.cmd('XGROUP', 'CREATE', STREAM, GROUP, '$', 'MKSTREAM').catch(() => {});
  const t0 = Date.now();
  for (let i = 1; i <= COUNT; i++) {
    // event_id là khoá dedup của consumer (Bài 11 mục 11.5). Nó phải ổn định theo Ý ĐỊNH,
    // nên nó gắn với job, không gắn với lần giao.
    const poison = POISON_EVERY > 0 && i % POISON_EVERY === 0;
    await redis.cmd('XADD', STREAM, '*', 'event_id', `evt-${i}`, 'payload', poison ? 'POISON' : `job-${i}`);
  }
  const ms = Date.now() - t0;
  console.log(JSON.stringify({ role: 'producer', count: COUNT, ms, rate: Math.round((COUNT / ms) * 1000) }));
}

// ---------------------------------------------------------------------------
// CONSUMER
// ---------------------------------------------------------------------------
async function consume() {
  await redis.cmd('XGROUP', 'CREATE', STREAM, GROUP, '$', 'MKSTREAM').catch(() => {});
  const t0 = Date.now();
  let done = 0;
  let dup = 0;
  let toDlq = 0;
  let failed = 0;
  // msActive = from the start until the LAST job was processed. It excludes time spent
  // waiting on an empty stream — counting that would make "rate" depend on DURATION_MS
  // rather than reflect real consumption capacity.
  let lastJobAt = t0;

  while (Date.now() - t0 < DURATION_MS) {
    // BLOCK 1000: wait up to 1s if the stream is empty, instead of spinning and burning CPU.
    const res = await redis.cmd(
      'XREADGROUP',
      'GROUP',
      GROUP,
      CONSUMER,
      'COUNT',
      String(BATCH),
      'BLOCK',
      '1000',
      'STREAMS',
      STREAM,
      '>'
    );
    if (!res) continue;
    const entries = res[0][1] || [];

    // THE WRONG ACK (auto-ack / auto-commit): ack the WHOLE batch right after reading it,
    // before processing any job. This is the default in many clients and the biggest trap in
    // Lesson 12: if the worker dies mid-batch, EVERYTHING unprocessed vanishes unnoticed.
    if (ACK_MODE === 'on-receive' && entries.length) {
      await redis.cmd('XACK', STREAM, GROUP, ...entries.map(([id]) => id));
    }

    for (const [id, fields] of entries) {
      const f = {};
      for (let i = 0; i < fields.length; i += 2) f[fields[i]] = fields[i + 1];

      // Dedup on event_id BEFORE causing any side effect (the precondition of at-least-once).
      if (IDEMPOTENT) {
        const fresh = await redis.cmd('SET', `lab:q:seen:${f.event_id}`, '1', 'NX', 'EX', '3600');
        if (fresh !== 'OK') {
          dup++;
          if (ACK_MODE !== 'on-receive') await redis.cmd('XACK', STREAM, GROUP, id);
          continue;
        }
      }

      // "Process" it. A poison job always fails — that is the definition of a poison message.
      let ok = true;
      if (f.payload === 'POISON') ok = false;
      else if (WORK_MS > 0) await sleep(WORK_MS);

      lastJobAt = Date.now();
      if (ok) {
        done++;
        if (ACK_MODE !== 'on-receive') await redis.cmd('XACK', STREAM, GROUP, id);
      } else {
        failed++;
        // DLQ: after MAX_ATTEMPTS tries, move the job to another stream and then ACK it so it
        // does NOT hold a slot any longer. Without this step a poison job returns forever.
        if (MAX_ATTEMPTS > 0) {
          const pend = await redis.cmd('XPENDING', STREAM, GROUP, '-', '+', '1', CONSUMER).catch(() => null);
          const attempts = pend && pend[0] ? Number(pend[0][3]) : 1;
          if (attempts >= MAX_ATTEMPTS) {
            await redis.cmd(
              'XADD',
              DLQ,
              '*',
              'event_id',
              f.event_id,
              'payload',
              f.payload,
              'attempts',
              String(attempts)
            );
            await redis.cmd('XACK', STREAM, GROUP, id);
            toDlq++;
          }
        }
      }
    }
  }

  const ms = Date.now() - t0;
  console.log(
    JSON.stringify({
      role: 'consumer',
      consumer: CONSUMER,
      ackMode: ACK_MODE,
      batch: BATCH,
      idempotent: IDEMPOTENT,
      maxAttempts: MAX_ATTEMPTS,
      done,
      msActive: lastJobAt - t0,
      rateActive: lastJobAt > t0 ? Math.round((done / (lastJobAt - t0)) * 1000) : 0,
      duplicatesSkipped: dup,
      failed,
      movedToDlq: toDlq,
      ms,
      rate: Math.round((done / ms) * 1000),
    })
  );
}

// ---------------------------------------------------------------------------
// DEPTH — theo dõi queue depth theo thời gian
// ---------------------------------------------------------------------------
async function watchDepth() {
  const t0 = Date.now();
  const samples = [];
  while (Date.now() - t0 < DURATION_MS) {
    // Depth = số job CHƯA được giao (XLEN trừ đi phần đã đọc) cộng phần đang treo.
    // Cách gần đúng và đủ dùng: XLEN của stream và XPENDING của group.
    const len = Number(await redis.cmd('XLEN', STREAM));
    const pend = await redis.cmd('XPENDING', STREAM, GROUP).catch(() => null);
    const pending = pend ? Number(pend[0]) : 0;
    samples.push({ t: Math.round((Date.now() - t0) / 1000), xlen: len, pending });
    await sleep(1000);
  }
  console.log(JSON.stringify({ role: 'depth', samples }));
}

const main = ROLE === 'producer' ? produce : ROLE === 'depth' ? watchDepth : consume;
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(ROLE, 'loi:', e.message);
    process.exit(1);
  });
