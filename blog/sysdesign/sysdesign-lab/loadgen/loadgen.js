/**
 * loadgen.js — Bộ đo tải cho Traffic Lab (Series 20: Thiết Kế Hệ Thống).
 *
 * Vì sao tự viết thay vì dùng `wrk`/`ab`?
 * Vì Bài 2 dạy "ĐO CHO ĐÚNG", và nếu công cụ đo là hộp đen thì mất luôn bài học đó.
 * Ở đây bạn đọc được chính xác: warm-up bỏ bao nhiêu, dùng bao nhiêu kết nối, percentile
 * tính theo phương pháp nào, và vì sao con số ra như vậy.
 *
 * GIỚI HẠN PHẢI BIẾT (đừng bỏ qua — nó ảnh hưởng tới cách đọc số):
 *  1. Đây là đo KIỂU ĐÓNG (closed-loop): mỗi kết nối gửi request kế tiếp chỉ SAU KHI nhận
 *     được phản hồi. Vì vậy số connection chính là số request đồng thời tối đa (đúng bằng
 *     `L` trong định luật Little ở Bài 1), và khi server chậm thì tải gửi vào TỰ ĐỘNG GIẢM.
 *     Hệ quả: công cụ này KHÔNG tái tạo được cảnh "người dùng thật vẫn ập vào dù server đang
 *     chết" (đo kiểu mở / open-loop). Đó cũng chính là hiện tượng coordinated omission.
 *  2. Bản thân loadgen chạy trên Node một luồng. Ở tải rất cao (vài nghìn req/s) NÓ có thể
 *     trở thành nút cổ chai chứ không phải server. Nếu thấy CPU của container loadgen chạm
 *     100% thì con số đo được đã vô nghĩa — hãy giảm tải hoặc chạy nhiều loadgen.
 *  3. Đừng chạy loadgen và server tranh cùng lõi CPU rồi kết luận (Bài 2, mục 2.3).
 *
 * Dùng:
 *   node loadgen.js --url http://app1:3000/fast --connections 20 --duration 15 --warmup 3
 */

'use strict';

const http = require('http');

// ---------------------------------------------------------------------------
// Tham số dòng lệnh
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const out = {
    url: 'http://app1:3000/fast',
    connections: 20,
    duration: 15,
    warmup: 3,
    json: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--url') out.url = next();
    else if (a === '--connections' || a === '-c') out.connections = Number(next());
    else if (a === '--duration' || a === '-d') out.duration = Number(next());
    else if (a === '--warmup' || a === '-w') out.warmup = Number(next());
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log('node loadgen.js --url <URL> [-c connections] [-d giây] [-w warmupGiây] [--json]');
      process.exit(0);
    }
  }
  return out;
}

const cfg = parseArgs(process.argv);

// ---------------------------------------------------------------------------
// Percentile — cùng phương pháp "nearest-rank" với engine mô phỏng in-browser,
// để số của lab và số của Traffic Lab so sánh được với nhau.
// ---------------------------------------------------------------------------
function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0) return 0;
  if (p <= 0) return sortedAsc[0];
  if (p >= 100) return sortedAsc[sortedAsc.length - 1];
  const rank = Math.ceil((p / 100) * sortedAsc.length);
  return sortedAsc[Math.min(sortedAsc.length - 1, Math.max(0, rank - 1))];
}

// ---------------------------------------------------------------------------
// Trạng thái đo
// ---------------------------------------------------------------------------
const target = new URL(cfg.url);
// Kết nối bền: nếu mở TCP mới cho từng request thì phần lớn thời gian đo được là chi phí
// bắt tay TCP, không phải thời gian server xử lý.
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: cfg.connections,
  maxFreeSockets: cfg.connections,
});

let counting = false; // chỉ tính số sau khi hết warm-up
let running = true;
const latencies = [];
let sent = 0;
let ok = 0;
let errors = 0;
const statusCounts = new Map();
let countingStartedAt = 0;

function oneRequest() {
  if (!running) return;
  const t0 = process.hrtime.bigint();
  sent++;
  const req = http.get(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || 80,
      path: target.pathname + target.search,
      agent,
      headers: { Connection: 'keep-alive' },
    },
    (res) => {
      // PHẢI đọc hết body, nếu không socket không được giải phóng và phép đo sẽ sai.
      res.resume();
      res.on('end', () => {
        const ms = Number(process.hrtime.bigint() - t0) / 1e6;
        statusCounts.set(res.statusCode, (statusCounts.get(res.statusCode) || 0) + 1);
        if (counting) {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            ok++;
            latencies.push(ms);
          } else {
            errors++;
          }
        }
        oneRequest(); // closed-loop: gửi tiếp ngay khi vừa nhận xong
      });
    }
  );
  req.on('error', () => {
    if (counting) errors++;
    // Lỗi kết nối (server chết, hàng đợi đầy) — nghỉ một nhịp rồi thử lại để không
    // quay vòng bận vô nghĩa khi server đang sập.
    setTimeout(oneRequest, 20);
  });
}

// ---------------------------------------------------------------------------
// Chạy
// ---------------------------------------------------------------------------
if (!cfg.json) {
  console.log(`\n▶ Đo tải: ${cfg.url}`);
  console.log(`  ${cfg.connections} kết nối · warm-up ${cfg.warmup}s · đo ${cfg.duration}s · closed-loop\n`);
}

for (let i = 0; i < cfg.connections; i++) oneRequest();

setTimeout(() => {
  // Hết warm-up: xoá sạch số liệu giai đoạn đầu (JIT chưa nóng, cache chưa ấm, pool chưa mở)
  counting = true;
  countingStartedAt = Date.now();
  latencies.length = 0;
  ok = 0;
  errors = 0;
  if (!cfg.json) console.log('  (hết warm-up, bắt đầu tính số liệu)');
}, cfg.warmup * 1000);

setTimeout(
  () => {
    running = false;
    const elapsedSec = (Date.now() - countingStartedAt) / 1000;
    latencies.sort((a, b) => a - b);
    const result = {
      url: cfg.url,
      connections: cfg.connections,
      durationSec: Number(elapsedSec.toFixed(2)),
      requests: ok,
      errors,
      throughputRps: Number((ok / elapsedSec).toFixed(1)),
      latencyMs: {
        min: Number((latencies[0] || 0).toFixed(2)),
        mean: Number((latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1)).toFixed(2)),
        p50: Number(percentile(latencies, 50).toFixed(2)),
        p95: Number(percentile(latencies, 95).toFixed(2)),
        p99: Number(percentile(latencies, 99).toFixed(2)),
        max: Number((latencies[latencies.length - 1] || 0).toFixed(2)),
      },
      statusCodes: Object.fromEntries(statusCounts),
    };

    if (cfg.json) {
      console.log(JSON.stringify(result));
    } else {
      const L = result.latencyMs;
      console.log('\n────────── KẾT QUẢ ──────────');
      console.log(`  Throughput      ${result.throughputRps} req/s`);
      console.log(`  Request tính    ${result.requests}   Lỗi: ${result.errors}`);
      console.log(`  Latency  p50    ${L.p50} ms`);
      console.log(`           p95    ${L.p95} ms`);
      console.log(`           p99    ${L.p99} ms`);
      console.log(`           mean   ${L.mean} ms   (min ${L.min} / max ${L.max})`);
      console.log(`  Mã trạng thái   ${JSON.stringify(result.statusCodes)}`);
      console.log('─────────────────────────────');
      console.log('  Nhắc: đây là đo closed-loop —', cfg.connections, 'kết nối = số request đồng thời tối đa.');
      console.log('  So p99 với p50: chênh càng lớn thì hàng đợi càng sâu (Bài 1).\n');
    }
    // Cho các socket keep-alive đóng lại rồi mới thoát.
    agent.destroy();
    setTimeout(() => process.exit(0), 100);
  },
  (cfg.warmup + cfg.duration) * 1000
);
