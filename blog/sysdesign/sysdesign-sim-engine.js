/**
 * sysdesign-sim-engine.js
 * Lõi mô phỏng sự kiện rời rạc (discrete-event simulation) cho Series 20 — Thiết Kế Hệ Thống.
 *
 * Mục tiêu: mô phỏng một đường đi request qua nhiều tầng (LB → app → cache → DB → queue),
 * mỗi tầng có số replica, số server đồng thời, hàng đợi hữu hạn và thời gian phục vụ ngẫu nhiên.
 * Engine KHÔNG phụ thuộc DOM để có thể chạy/kiểm thử bằng Node.
 *
 * Điểm quan trọng cho việc dạy học: với cấu hình 1 tầng / 1 replica / 1 server và thời gian
 * phục vụ phân phối exponential, engine tái tạo đúng hàng đợi M/M/1, nên số mô phỏng có thể
 * đối chiếu trực tiếp với công thức lý thuyết W = 1 / (mu - lambda) (xem Bài 1).
 *
 * Toàn bộ ngẫu nhiên đi qua một PRNG có seed => cùng seed cho ra cùng kết quả, nhờ đó con số
 * in trong bài học luôn tái lập được (không dùng Math.random).
 *
 * @author js-tools.org
 */

// ==========================================
// 1. PRNG CÓ SEED & CÁC PHÂN PHỐI
// ==========================================

/**
 * mulberry32 — PRNG 32-bit nhỏ gọn, chất lượng đủ tốt cho mô phỏng dạy học.
 * Dùng seed để mọi lần chạy đều cho kết quả giống nhau.
 */
export class Rng {
  constructor(seed = 1) {
    this.state = seed >>> 0;
  }

  /** Số thực ngẫu nhiên trong [0, 1) */
  next() {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Mẫu từ phân phối exponential với trung bình `mean`.
   * Đây là phân phối của khoảng thời gian giữa 2 sự kiện trong tiến trình Poisson,
   * và là giả định "M" (Markovian) trong ký hiệu M/M/1.
   */
  exponential(mean) {
    // Tránh log(0) = -Infinity
    let u = this.next();
    if (u <= 0) u = Number.EPSILON;
    return -Math.log(u) * mean;
  }
}

// ==========================================
// 2. HÀNG ĐỢI SỰ KIỆN (MIN-HEAP THEO THỜI GIAN)
// ==========================================

/**
 * Min-heap để luôn lấy ra sự kiện có mốc thời gian nhỏ nhất.
 * Dùng heap thay vì sort mảng để mô phỏng vẫn nhanh khi có hàng trăm nghìn sự kiện.
 */
class EventQueue {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  push(event) {
    const items = this.items;
    items.push(event);
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (items[parent].t <= items[i].t) break;
      [items[parent], items[i]] = [items[i], items[parent]];
      i = parent;
    }
  }

  pop() {
    const items = this.items;
    if (items.length === 0) return null;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let smallest = i;
        if (l < items.length && items[l].t < items[smallest].t) smallest = l;
        if (r < items.length && items[r].t < items[smallest].t) smallest = r;
        if (smallest === i) break;
        [items[smallest], items[i]] = [items[i], items[smallest]];
        i = smallest;
      }
    }
    return top;
  }
}

// ==========================================
// 3. PHÂN VỊ (PERCENTILE)
// ==========================================

/**
 * Tính phân vị từ mảng số.
 * Dùng phương pháp "nearest-rank" trên mảng đã sắp xếp — đơn giản, không nội suy,
 * khớp với cách hầu hết công cụ đo tải (wrk, ab) báo cáo.
 *
 * @param {number[]} values - mảng giá trị (sẽ KHÔNG bị thay đổi)
 * @param {number} p - phân vị cần tính, trong khoảng 0..100
 */
export function percentile(values, p) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  if (p <= 0) return sorted[0];
  if (p >= 100) return sorted[sorted.length - 1];
  const rank = Math.ceil((p / 100) * sorted.length);
  const idx = Math.min(sorted.length - 1, Math.max(0, rank - 1));
  return sorted[idx];
}

// ==========================================
// 4. REPLICA — MỘT INSTANCE THẬT CỦA MỘT TẦNG
// ==========================================

/**
 * Một replica = một tiến trình/container. Có:
 *  - `servers`: số việc xử lý ĐỒNG THỜI được (vd connection pool, số worker).
 *  - `queueLimit`: độ dài hàng đợi tối đa; vượt quá thì request bị drop (nhanh hơn là chờ vô hạn).
 *  - `alive`: bị giết bởi fault injection thì không nhận request nữa.
 */
class Replica {
  constructor(stageId, index, { servers, queueLimit }) {
    this.stageId = stageId;
    this.index = index;
    this.servers = servers;
    this.queueLimit = queueLimit;
    this.busy = 0;
    this.queue = [];
    this.alive = true;
    // Tổng thời gian các server thực sự làm việc — dùng để tính utilization.
    this.busyTimeMs = 0;
    this.completed = 0;
    this.maxQueueSeen = 0;
  }

  get queueDepth() {
    return this.queue.length;
  }

  /** Còn khe server rảnh để nhận việc ngay không? */
  get hasFreeServer() {
    return this.busy < this.servers;
  }

  /** Hàng đợi còn chỗ không? */
  get hasQueueRoom() {
    return this.queue.length < this.queueLimit;
  }
}

// ==========================================
// 5. TẦNG (STAGE)
// ==========================================

const LB_POLICIES = ['round-robin', 'least-connections', 'random', 'random-two-choices'];

/**
 * Một tầng trong đường đi request: LB, app, cache, DB, worker...
 *
 * `hitRatio` + `shortCircuit`: dùng cho tầng cache. Nếu request "hit", nó kết thúc ngay tại
 * tầng này và KHÔNG đi xuống các tầng sau (đó chính là giá trị của cache). Nếu "miss", nó
 * chịu thêm thời gian phục vụ của tầng cache rồi tiếp tục đi xuống.
 */
class Stage {
  constructor({
    id,
    replicas = 1,
    servers = 1,
    serviceMs = 1,
    serviceDist = 'exponential',
    queueLimit = 1000,
    lb = 'round-robin',
    hitRatio = 0,
    shortCircuit = false,
  }) {
    if (!id) throw new Error('Stage cần có id');
    if (!LB_POLICIES.includes(lb)) {
      throw new Error(`Thuật toán LB không hợp lệ: "${lb}". Hợp lệ: ${LB_POLICIES.join(', ')}`);
    }
    if (serviceDist !== 'exponential' && serviceDist !== 'constant') {
      throw new Error(`serviceDist phải là "exponential" hoặc "constant", nhận: "${serviceDist}"`);
    }
    this.id = id;
    this.serviceMs = serviceMs;
    this.serviceDist = serviceDist;
    this.lb = lb;
    this.hitRatio = hitRatio;
    this.shortCircuit = shortCircuit;
    // Hệ số làm chậm do fault injection (1 = bình thường, 10 = chậm gấp 10 lần).
    this.slowFactor = 1;
    this.rrCursor = 0;
    this.dropped = 0;
    this.hits = 0;
    this.misses = 0;
    this.replicas = [];
    for (let i = 0; i < replicas; i++) {
      this.replicas.push(new Replica(id, i, { servers, queueLimit }));
    }
  }

  get aliveReplicas() {
    return this.replicas.filter((r) => r.alive);
  }

  /** Chọn replica theo thuật toán LB đã cấu hình. Trả về null nếu không còn replica nào sống. */
  pickReplica(rng) {
    const alive = this.aliveReplicas;
    if (alive.length === 0) return null;
    if (alive.length === 1) return alive[0];

    switch (this.lb) {
      case 'round-robin': {
        const r = alive[this.rrCursor % alive.length];
        this.rrCursor++;
        return r;
      }
      case 'least-connections': {
        let best = alive[0];
        for (const r of alive) {
          if (r.busy + r.queueDepth < best.busy + best.queueDepth) best = r;
        }
        return best;
      }
      case 'random':
        return alive[Math.floor(rng.next() * alive.length)];
      case 'random-two-choices': {
        // Chọn ngẫu nhiên 2 replica rồi lấy cái ít việc hơn — rẻ như random
        // nhưng chất lượng cân bằng gần bằng least-connections ("power of two choices").
        const a = alive[Math.floor(rng.next() * alive.length)];
        const b = alive[Math.floor(rng.next() * alive.length)];
        return a.busy + a.queueDepth <= b.busy + b.queueDepth ? a : b;
      }
      default:
        return alive[0];
    }
  }

  sampleServiceMs(rng) {
    const mean = this.serviceMs * this.slowFactor;
    if (mean <= 0) return 0;
    return this.serviceDist === 'constant' ? mean : rng.exponential(mean);
  }
}

// ==========================================
// 6. BỘ MÔ PHỎNG
// ==========================================

/**
 * Simulator — chạy mô phỏng một đường đi request qua các tầng đã khai báo theo thứ tự.
 *
 * Cách dùng:
 *   const sim = new Simulator({ seed: 42 });
 *   sim.addStage({ id: 'app', replicas: 1, servers: 1, serviceMs: 10 });
 *   const m = sim.run({ rps: 80, durationMs: 60000 });
 *   console.log(m.latency.p99, m.throughput);
 */
export class Simulator {
  constructor({ seed = 1 } = {}) {
    this.rng = new Rng(seed);
    this.stages = [];
    this.faults = [];
    this.queueSamples = [];
  }

  addStage(config) {
    const stage = new Stage(config);
    this.stages.push(stage);
    return this;
  }

  getStage(id) {
    return this.stages.find((s) => s.id === id) || null;
  }

  /**
   * Hẹn một sự cố xảy ra tại thời điểm `atMs`.
   *  - `{ action: 'kill', stageId, replicaIndex }`  — giết một replica.
   *  - `{ action: 'slow', stageId, factor }`        — làm tầng đó chậm đi `factor` lần.
   *  - `{ action: 'cache-down', stageId }`          — cache mất tác dụng (hitRatio về 0).
   */
  scheduleFault(fault) {
    this.faults.push(fault);
    return this;
  }

  applyFault(fault) {
    const stage = this.getStage(fault.stageId);
    if (!stage) return;
    if (fault.action === 'kill') {
      const idx = fault.replicaIndex ?? 0;
      if (stage.replicas[idx]) stage.replicas[idx].alive = false;
    } else if (fault.action === 'slow') {
      stage.slowFactor = fault.factor ?? 10;
    } else if (fault.action === 'cache-down') {
      stage.hitRatio = 0;
    }
  }

  /**
   * Chạy mô phỏng.
   *
   * @param {number} rps        - tốc độ request đến (tiến trình Poisson).
   * @param {number} durationMs - thời lượng mô phỏng.
   * @param {number} warmupMs   - bỏ qua số liệu trong giai đoạn đầu (hệ chưa vào trạng thái ổn định).
   *                              Đây chính là "warm-up" mà Bài 2 dạy khi đo tải thật.
   * @param {number} sampleEveryMs - chu kỳ lấy mẫu queue depth để vẽ đồ thị.
   */
  run({ rps, durationMs, warmupMs = 0, sampleEveryMs = 100 }) {
    if (this.stages.length === 0) throw new Error('Chưa khai báo tầng nào (addStage)');
    if (!(rps > 0)) throw new Error('rps phải > 0');
    if (!(durationMs > 0)) throw new Error('durationMs phải > 0');

    const rng = this.rng;
    const events = new EventQueue();
    const latencies = [];
    let offered = 0;
    let completed = 0;
    let dropped = 0;
    let nextSampleAt = sampleEveryMs;
    this.queueSamples = [];

    const pendingFaults = [...this.faults].sort((a, b) => a.atMs - b.atMs);
    let faultCursor = 0;

    // Sinh sự kiện đến đầu tiên. Khoảng cách giữa các request theo phân phối exponential
    // với trung bình 1000/rps (ms) => đúng định nghĩa tiến trình Poisson cường độ lambda.
    const meanInterArrivalMs = 1000 / rps;
    let tArrival = rng.exponential(meanInterArrivalMs);
    if (tArrival < durationMs) {
      events.push({ t: tArrival, type: 'arrival', stageIdx: 0, req: { t0: tArrival } });
      offered++;
    }

    const startService = (stage, replica, req, now) => {
      const serviceMs = stage.sampleServiceMs(rng);
      replica.busy++;
      replica.busyTimeMs += serviceMs;
      events.push({
        t: now + serviceMs,
        type: 'departure',
        stageIdx: this.stages.indexOf(stage),
        replica,
        req,
      });
    };

    const admit = (stageIdx, req, now) => {
      const stage = this.stages[stageIdx];
      const replica = stage.pickReplica(rng);
      // Không còn replica sống => request bị drop (toàn tầng chết).
      if (!replica) {
        stage.dropped++;
        dropped++;
        return;
      }
      if (replica.hasFreeServer) {
        startService(stage, replica, req, now);
      } else if (replica.hasQueueRoom) {
        replica.queue.push(req);
        if (replica.queueDepth > replica.maxQueueSeen) replica.maxQueueSeen = replica.queueDepth;
      } else {
        // Hàng đợi đầy => drop. Thà từ chối nhanh còn hơn để client chờ tới timeout (Bài 13).
        stage.dropped++;
        dropped++;
      }
    };

    while (events.size > 0) {
      const ev = events.pop();
      const now = ev.t;
      if (now > durationMs) break;

      // Kích hoạt các sự cố đã tới hạn.
      while (faultCursor < pendingFaults.length && pendingFaults[faultCursor].atMs <= now) {
        this.applyFault(pendingFaults[faultCursor]);
        faultCursor++;
      }

      // Lấy mẫu queue depth theo chu kỳ để vẽ đồ thị.
      while (now >= nextSampleAt && nextSampleAt <= durationMs) {
        this.queueSamples.push({
          t: nextSampleAt,
          depths: this.stages.map((s) => ({
            id: s.id,
            depth: s.replicas.reduce((sum, r) => sum + r.queueDepth, 0),
          })),
        });
        nextSampleAt += sampleEveryMs;
      }

      if (ev.type === 'arrival') {
        admit(ev.stageIdx, ev.req, now);

        // Hẹn request đến tiếp theo.
        tArrival += rng.exponential(meanInterArrivalMs);
        if (tArrival < durationMs) {
          events.push({ t: tArrival, type: 'arrival', stageIdx: 0, req: { t0: tArrival } });
          offered++;
        }
      } else if (ev.type === 'departure') {
        const stage = this.stages[ev.stageIdx];
        const replica = ev.replica;
        replica.busy--;
        replica.completed++;

        // Tầng cache: quyết định hit/miss SAU khi đã trả phí thời gian tra cache.
        let finishHere = ev.stageIdx === this.stages.length - 1;
        if (stage.shortCircuit && stage.hitRatio > 0) {
          if (rng.next() < stage.hitRatio) {
            stage.hits++;
            finishHere = true; // HIT => không đi xuống tầng sau nữa.
          } else {
            stage.misses++;
          }
        } else if (stage.shortCircuit) {
          stage.misses++;
        }

        if (finishHere) {
          completed++;
          if (now >= warmupMs) latencies.push(now - ev.req.t0);
        } else {
          events.push({ t: now, type: 'arrival', stageIdx: ev.stageIdx + 1, req: ev.req });
        }

        // Server vừa rảnh => kéo việc kế tiếp trong hàng đợi ra làm.
        if (replica.queue.length > 0 && replica.hasFreeServer) {
          const nextReq = replica.queue.shift();
          startService(stage, replica, nextReq, now);
        }
      }
    }

    return this.buildMetrics({ latencies, offered, completed, dropped, durationMs, warmupMs, rps });
  }

  buildMetrics({ latencies, offered, completed, dropped, durationMs, warmupMs, rps }) {
    const effectiveSec = Math.max(1e-9, (durationMs - warmupMs) / 1000);
    return {
      offered,
      completed,
      dropped,
      offeredRps: rps,
      // Throughput thực nhận — có thể THẤP HƠN rps gửi vào khi hệ quá tải và bắt đầu drop.
      throughput: completed / (durationMs / 1000),
      dropRate: offered === 0 ? 0 : dropped / offered,
      latency: {
        count: latencies.length,
        mean: latencies.length === 0 ? 0 : latencies.reduce((a, b) => a + b, 0) / latencies.length,
        p50: percentile(latencies, 50),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
        max: latencies.length === 0 ? 0 : Math.max(...latencies),
      },
      stages: this.stages.map((s) => {
        const totalServers = s.replicas.reduce((sum, r) => sum + (r.alive ? r.servers : 0), 0);
        const totalBusyMs = s.replicas.reduce((sum, r) => sum + r.busyTimeMs, 0);
        return {
          id: s.id,
          dropped: s.dropped,
          hits: s.hits,
          misses: s.misses,
          hitRatio: s.hits + s.misses === 0 ? null : s.hits / (s.hits + s.misses),
          // Utilization = phần thời gian các server thực sự làm việc. Tiến tới 1 là dấu hiệu
          // sắp bùng nổ latency (xem Bài 1: W = 1/(mu - lambda)).
          utilization: totalServers === 0 ? 1 : totalBusyMs / (durationMs * totalServers),
          replicas: s.replicas.map((r) => ({
            index: r.index,
            alive: r.alive,
            completed: r.completed,
            maxQueueSeen: r.maxQueueSeen,
            utilization: r.alive && r.servers > 0 ? r.busyTimeMs / (durationMs * r.servers) : 0,
          })),
        };
      }),
      queueSamples: this.queueSamples,
      effectiveSec,
    };
  }
}

// ==========================================
// 7. CÔNG THỨC LÝ THUYẾT ĐỂ ĐỐI CHIẾU
// ==========================================

/**
 * Lý thuyết hàng đợi M/M/1 — dùng để vẽ đường lý thuyết chồng lên số mô phỏng (Bài 1).
 *
 * @param {number} lambda - tốc độ đến (request/giây)
 * @param {number} mu     - tốc độ phục vụ tối đa (request/giây)
 * @returns {{rho:number, W:number|null, Wq:number|null, L:number|null, stable:boolean}}
 *   rho = utilization; W = thời gian tổng trong hệ (chờ + phục vụ);
 *   Wq  = thời gian chờ trong hàng đợi; L = số request trung bình trong hệ (Little's Law).
 */
export function mm1Theory(lambda, mu) {
  const rho = lambda / mu;
  if (rho >= 1) {
    // lambda >= mu: hàng đợi tăng vô hạn, không có trạng thái ổn định.
    return { rho, W: null, Wq: null, L: null, stable: false };
  }
  const W = 1 / (mu - lambda); // giây
  const Wq = rho / (mu - lambda); // giây
  const L = lambda * W; // Little's Law: L = lambda * W
  return { rho, W, Wq, L, stable: true };
}
