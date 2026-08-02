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
  // ---- Trạng thái chạy dùng chung cho cả run() (batch) và chế độ live ----

  _initState({ rps, durationMs, warmupMs, sampleEveryMs, live }) {
    this.queueSamples = [];
    this._st = {
      events: new EventQueue(),
      latencies: [],
      offered: 0,
      completed: 0,
      dropped: 0,
      nextSampleAt: sampleEveryMs,
      sampleEveryMs,
      warmupMs,
      durationMs,
      rps,
      live: !!live,
      now: 0,
      pendingFaults: [...this.faults].sort((a, b) => a.atMs - b.atMs),
      faultCursor: 0,
      tArrival: 0,
      // Chỉ theo dõi ở chế độ live: các request đang được phục vụ, để renderer vẽ
      // được "hạt sáng" đang đi qua từng tầng. Batch mode bỏ qua cho nhanh.
      activeServices: [],
      nextReqId: 1,
      // Cửa sổ trượt THEO THỜI GIAN cho số liệu live: p99 phải phản ánh "mấy giây vừa rồi",
      // giống dashboard thật. Nếu dùng cửa sổ theo số mẫu thì ở RPS thấp nó sẽ còn giữ dữ liệu
      // của giai đoạn quá tải rất lâu, khiến p99 hiển thị sai lệch sau khi hệ đã hồi phục.
      rollingWindowMs: 5000,
      rollingSamples: [], // [{ t, lat }] — đã sắp tăng dần theo t
      rollingDropEvents: [], // [t] các lần drop, cũng trong cửa sổ
    };
    // Request đầu tiên. Khoảng cách giữa các request theo phân phối exponential với
    // trung bình 1000/rps (ms) => đúng định nghĩa tiến trình Poisson cường độ lambda.
    const st = this._st;
    st.tArrival = this.rng.exponential(1000 / rps);
    if (st.tArrival < durationMs) {
      st.events.push({
        t: st.tArrival,
        type: 'arrival',
        stageIdx: 0,
        gen: true,
        req: { t0: st.tArrival, id: st.nextReqId++ },
      });
      st.offered++;
    }
  }

  _startService(stage, replica, req, now) {
    const st = this._st;
    const serviceMs = stage.sampleServiceMs(this.rng);
    replica.busy++;
    replica.busyTimeMs += serviceMs;
    const stageIdx = this.stages.indexOf(stage);
    const ev = { t: now + serviceMs, type: 'departure', stageIdx, replica, req };
    st.events.push(ev);
    if (st.live) {
      st.activeServices.push({
        reqId: req.id,
        stageIdx,
        replicaIndex: replica.index,
        tStart: now,
        tEnd: now + serviceMs,
      });
    }
  }

  _admit(stageIdx, req, now) {
    const st = this._st;
    const stage = this.stages[stageIdx];
    const replica = stage.pickReplica(this.rng);
    // Không còn replica sống => request bị drop (toàn tầng chết).
    if (!replica) {
      stage.dropped++;
      st.dropped++;
      if (st.live) st.rollingDropEvents.push(now);
      return;
    }
    if (replica.hasFreeServer) {
      this._startService(stage, replica, req, now);
    } else if (replica.hasQueueRoom) {
      replica.queue.push(req);
      if (replica.queueDepth > replica.maxQueueSeen) replica.maxQueueSeen = replica.queueDepth;
    } else {
      // Hàng đợi đầy => drop. Thà từ chối nhanh còn hơn để client chờ tới timeout (Bài 13).
      stage.dropped++;
      st.dropped++;
      if (st.live) st.rollingDropEvents.push(now);
    }
  }

  /** Loại bỏ mẫu đã ra khỏi cửa sổ thời gian (chỉ dùng ở chế độ live). */
  _trimRollingWindow(now) {
    const st = this._st;
    const cutoff = now - st.rollingWindowMs;
    let i = 0;
    while (i < st.rollingSamples.length && st.rollingSamples[i].t < cutoff) i++;
    if (i > 0) st.rollingSamples.splice(0, i);
    let j = 0;
    while (j < st.rollingDropEvents.length && st.rollingDropEvents[j] < cutoff) j++;
    if (j > 0) st.rollingDropEvents.splice(0, j);
  }

  _applyDueFaults(now) {
    const st = this._st;
    while (st.faultCursor < st.pendingFaults.length && st.pendingFaults[st.faultCursor].atMs <= now) {
      this.applyFault(st.pendingFaults[st.faultCursor]);
      st.faultCursor++;
    }
  }

  _maybeSample(now) {
    const st = this._st;
    while (now >= st.nextSampleAt && st.nextSampleAt <= st.durationMs) {
      this.queueSamples.push({
        t: st.nextSampleAt,
        depths: this.stages.map((s) => ({
          id: s.id,
          depth: s.replicas.reduce((sum, r) => sum + r.queueDepth, 0),
        })),
      });
      st.nextSampleAt += st.sampleEveryMs;
    }
  }

  _recordCompletion(now, req) {
    const st = this._st;
    st.completed++;
    const lat = now - req.t0;
    if (now >= st.warmupMs) st.latencies.push(lat);
    if (st.live) st.rollingSamples.push({ t: now, lat });
  }

  /**
   * Xử lý MỘT sự kiện. Dùng chung cho batch và live để hai chế độ không thể phân kỳ logic.
   * Thứ tự gọi RNG bên trong được giữ nguyên tuyệt đối (pickReplica → sampleServiceMs →
   * arrival kế tiếp; ở departure: hit/miss → kéo hàng đợi) vì đổi thứ tự sẽ làm mọi con số
   * đã kiểm chứng trong bài học lệch đi.
   */
  _processEvent(ev) {
    const st = this._st;
    const now = ev.t;
    st.now = now;

    if (ev.type === 'arrival') {
      this._admit(ev.stageIdx, ev.req, now);

      // CHỈ request do bộ sinh tải tạo ra (`gen: true`) mới kéo theo request kế tiếp.
      // Các chặng nội bộ (tầng k -> k+1) cũng dùng event 'arrival' nhưng KHÔNG được sinh
      // thêm tải mới — nếu không, một hệ 3 tầng sẽ tự nhân tải lên 3 lần.
      if (ev.gen) {
        st.tArrival += this.rng.exponential(1000 / st.rps);
        if (st.tArrival < st.durationMs) {
          st.events.push({
            t: st.tArrival,
            type: 'arrival',
            stageIdx: 0,
            gen: true,
            req: { t0: st.tArrival, id: st.nextReqId++ },
          });
          st.offered++;
        }
      }
      return;
    }

    if (ev.type === 'departure') {
      const stage = this.stages[ev.stageIdx];
      const replica = ev.replica;
      replica.busy--;
      replica.completed++;
      if (st.live) {
        const i = st.activeServices.findIndex((a) => a.reqId === ev.req.id && a.stageIdx === ev.stageIdx);
        if (i !== -1) st.activeServices.splice(i, 1);
      }

      // Tầng cache: quyết định hit/miss SAU khi đã trả phí thời gian tra cache.
      let finishHere = ev.stageIdx === this.stages.length - 1;
      if (stage.shortCircuit && stage.hitRatio > 0) {
        if (this.rng.next() < stage.hitRatio) {
          stage.hits++;
          finishHere = true; // HIT => không đi xuống tầng sau nữa.
        } else {
          stage.misses++;
        }
      } else if (stage.shortCircuit) {
        stage.misses++;
      }

      if (finishHere) {
        this._recordCompletion(now, ev.req);
      } else {
        st.events.push({ t: now, type: 'arrival', stageIdx: ev.stageIdx + 1, req: ev.req });
      }

      // Server vừa rảnh => kéo việc kế tiếp trong hàng đợi ra làm.
      if (replica.queue.length > 0 && replica.hasFreeServer) {
        const nextReq = replica.queue.shift();
        this._startService(stage, replica, nextReq, now);
      }
    }
  }

  run({ rps, durationMs, warmupMs = 0, sampleEveryMs = 100 }) {
    if (this.stages.length === 0) throw new Error('Chưa khai báo tầng nào (addStage)');
    if (!(rps > 0)) throw new Error('rps phải > 0');
    if (!(durationMs > 0)) throw new Error('durationMs phải > 0');

    this._initState({ rps, durationMs, warmupMs, sampleEveryMs, live: false });
    const st = this._st;

    while (st.events.size > 0) {
      const ev = st.events.pop();
      if (ev.t > durationMs) break;
      this._applyDueFaults(ev.t);
      this._maybeSample(ev.t);
      this._processEvent(ev);
    }

    return this.buildMetrics({
      latencies: st.latencies,
      offered: st.offered,
      completed: st.completed,
      dropped: st.dropped,
      durationMs,
      warmupMs,
      rps,
    });
  }

  // ==========================================
  // CHẾ ĐỘ LIVE — cho Traffic Lab animate và đổi tham số giữa lúc chạy
  // ==========================================

  /**
   * Bắt đầu một phiên mô phỏng "sống": không chạy tới hết mà chờ `advance(dt)` đẩy đồng hồ.
   * Nhờ vậy người học kéo slider là thấy hệ phản ứng ngay, không phải chạy lại từ đầu.
   */
  beginLive({ rps, sampleEveryMs = 250 } = {}) {
    if (this.stages.length === 0) throw new Error('Chưa khai báo tầng nào (addStage)');
    if (!(rps > 0)) throw new Error('rps phải > 0');
    this._initState({
      rps,
      durationMs: Number.POSITIVE_INFINITY,
      warmupMs: 0,
      sampleEveryMs,
      live: true,
    });
    return this;
  }

  /** Đổi tốc độ request đến giữa lúc đang chạy (slider RPS). */
  setRps(rps) {
    if (!this._st) throw new Error('Phải gọi beginLive() trước');
    if (!(rps > 0)) throw new Error('rps phải > 0');
    this._st.rps = rps;
    return this;
  }

  /** Áp một sự cố ngay lập tức (nút "Giết 1 app server", "DB chậm 10x", "Cache sập"). */
  injectNow(fault) {
    this.applyFault(fault);
    return this;
  }

  /** Hồi sinh toàn bộ replica đã bị giết và bỏ hệ số làm chậm. */
  healAll() {
    for (const s of this.stages) {
      s.slowFactor = 1;
      for (const r of s.replicas) r.alive = true;
    }
    return this;
  }

  /**
   * Đẩy đồng hồ mô phỏng thêm `dtMs` và xử lý mọi sự kiện trong khoảng đó.
   * `maxEvents` chặn trường hợp quá tải nặng sinh quá nhiều sự kiện làm treo khung hình.
   */
  advance(dtMs, maxEvents = 20000) {
    if (!this._st) throw new Error('Phải gọi beginLive() trước');
    const st = this._st;
    const target = st.now + dtMs;
    let n = 0;
    while (st.events.size > 0 && n < maxEvents) {
      const peek = st.events.items[0];
      if (!peek || peek.t > target) break;
      const ev = st.events.pop();
      this._applyDueFaults(ev.t);
      this._maybeSample(ev.t);
      this._processEvent(ev);
      n++;
    }
    st.now = target;
    return this.liveSnapshot();
  }

  /**
   * Ảnh chụp trạng thái hiện tại để renderer vẽ.
   * Lưu ý: `utilization` ở đây là mức chiếm dụng TỨC THỜI (busy/servers) — đúng thứ một
   * đồng hồ đo trực tiếp hiển thị, khác với utilization bình quân cả phiên ở buildMetrics().
   */
  liveSnapshot() {
    const st = this._st;
    if (!st) return null;
    this._trimRollingWindow(st.now);
    const lats = st.rollingSamples.map((s) => s.lat);
    const nDrop = st.rollingDropEvents.length;
    const rollDropRate = lats.length + nDrop === 0 ? 0 : nDrop / (lats.length + nDrop);
    const windowSec = st.rollingWindowMs / 1000;
    return {
      t: st.now,
      rps: st.rps,
      completed: st.completed,
      dropped: st.dropped,
      dropRate: rollDropRate,
      // Throughput thực nhận trong cửa sổ vừa rồi — so với `rps` gửi vào sẽ thấy phần bị mất.
      throughput: lats.length / windowSec,
      windowMs: st.rollingWindowMs,
      latency: {
        count: lats.length,
        p50: percentile(lats, 50),
        p95: percentile(lats, 95),
        p99: percentile(lats, 99),
        mean: lats.length === 0 ? 0 : lats.reduce((a, b) => a + b, 0) / lats.length,
      },
      stages: this.stages.map((s, idx) => {
        const servers = s.replicas.reduce((sum, r) => sum + (r.alive ? r.servers : 0), 0);
        const busy = s.replicas.reduce((sum, r) => sum + r.busy, 0);
        return {
          id: s.id,
          index: idx,
          utilization: servers === 0 ? 1 : busy / servers,
          queueDepth: s.replicas.reduce((sum, r) => sum + r.queueDepth, 0),
          dropped: s.dropped,
          hitRatio: s.hits + s.misses === 0 ? null : s.hits / (s.hits + s.misses),
          slowFactor: s.slowFactor,
          replicas: s.replicas.map((r) => ({
            index: r.index,
            alive: r.alive,
            busy: r.busy,
            servers: r.servers,
            queueDepth: r.queueDepth,
            queueLimit: r.queueLimit,
            utilization: r.alive && r.servers > 0 ? r.busy / r.servers : 0,
          })),
        };
      }),
      // Các request đang được phục vụ — renderer nội suy vị trí theo (now - tStart)/(tEnd - tStart).
      inFlight: st.activeServices.map((a) => ({
        reqId: a.reqId,
        stageIdx: a.stageIdx,
        replicaIndex: a.replicaIndex,
        progress: a.tEnd === a.tStart ? 1 : Math.min(1, Math.max(0, (st.now - a.tStart) / (a.tEnd - a.tStart))),
      })),
    };
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
