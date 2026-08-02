/**
 * sysdesign-topology.js
 * Bộ vẽ Canvas dùng chung cho Series 20 — Thiết Kế Hệ Thống.
 *
 * Tách hoàn toàn khỏi `sysdesign-sim-engine.js`: engine chỉ tính, file này chỉ vẽ.
 * Nhờ vậy engine test được bằng Node (không cần DOM), còn mỗi bài học chỉ việc cấu hình
 * topology khác nhau rồi đưa `liveSnapshot()` vào đây.
 *
 * Gồm 3 bộ vẽ:
 *   - TopologyRenderer  : sơ đồ topology + hàng đợi + "gói tin" chạy động (dùng ở hầu hết các bài)
 *   - LatencyHistogram  : histogram latency có vạch p50/p95/p99 (Bài 1, 2, 16)
 *   - UtilLatencyChart  : đồ thị utilization ↔ latency, vẽ đường lý thuyết 1/(mu-lambda) (Bài 1)
 *
 * Nền canvas dùng màu ĐẶC #0b0f19 (không dùng nền trong suốt): trang blog có nền trắng, nếu
 * canvas trong suốt thì chữ trắng vẽ trên đó sẽ gần như vô hình.
 *
 * @author js-tools.org
 */

// ==========================================
// 1. BẢNG MÀU & TIỆN ÍCH
// ==========================================

export const THEME = {
  bg: '#0b0f19',
  panel: '#151d30',
  border: '#24324f',
  text: '#f3f4f6',
  textMuted: '#9ca3af',
  accent: '#38bdf8', // accent của series
  ok: '#22c55e',
  warn: '#f59e0b',
  danger: '#ef4444',
  packet: '#e0f2fe',
  queue: '#818cf8',
  dead: '#4b5563',
};

/** Màu theo mức chiếm dụng: xanh (thoải mái) → vàng (cảnh báo) → đỏ (sắp bùng nổ latency). */
export function utilizationColor(u) {
  if (u >= 0.9) return THEME.danger;
  if (u >= 0.7) return THEME.warn;
  return THEME.ok;
}

/** Định dạng thời gian ms cho gọn: 1234ms -> "1.23s". */
export function formatMs(ms) {
  if (!isFinite(ms)) return '∞';
  if (ms >= 1000) return (ms / 1000).toFixed(2) + 's';
  if (ms >= 10) return ms.toFixed(0) + 'ms';
  return ms.toFixed(1) + 'ms';
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * Tự vẽ lại khi canvas có kích thước.
 *
 * Cần thiết vì hai tình huống xảy ra thường xuyên trong series này:
 *  1. Demo nằm trong `.code-tabs__panel` không active (`display: none`) → kích thước 0; khi
 *     người học bấm sang tab "Xem trước" thì phải vẽ lại.
 *  2. Render một lần ngay lúc module chạy, khi layout chưa hoàn tất → cũng ra kích thước 0.
 *
 * Nhờ helper này, mỗi bài học chỉ cần gọi `render(...)` một lần và không phải tự lo hai ca trên.
 */
function attachAutoRedraw(instance) {
  if (typeof ResizeObserver === 'undefined') return;
  let redrawing = false;
  const ro = new ResizeObserver(() => {
    if (redrawing || !instance._lastArgs) return;
    const r = instance.canvas.getBoundingClientRect();
    if (!(r.width > 0) || !(r.height > 0)) return;
    redrawing = true;
    try {
      instance.render(...instance._lastArgs);
    } finally {
      redrawing = false;
    }
  });
  ro.observe(instance.canvas);
  instance._resizeObserver = ro;
}

/**
 * Chuẩn hoá canvas theo devicePixelRatio để nét trên màn hình Retina.
 * Trả về kích thước LOGIC (CSS pixel) để code vẽ không phải quan tâm tới dpr.
 *
 * Trả về `null` nếu canvas đang có kích thước 0 (panel bị `display: none`, hoặc layout chưa
 * xong). Nếu cứ vẽ tiếp thì canvas bị đặt width/height = 0 và trắng xoá vĩnh viễn ngay cả
 * sau khi panel hiện lại — `attachAutoRedraw` ở trên lo việc vẽ lại khi có kích thước.
 */
function setupHiDpi(canvas) {
  const rect = canvas.getBoundingClientRect();
  if (!(rect.width > 0) || !(rect.height > 0)) return null;
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  const cssW = rect.width;
  const cssH = rect.height;
  const needW = Math.round(cssW * dpr);
  const needH = Math.round(cssH * dpr);
  if (canvas.width !== needW || canvas.height !== needH) {
    canvas.width = needW;
    canvas.height = needH;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: cssW, h: cssH };
}

// ==========================================
// 2. TOPOLOGY RENDERER
// ==========================================

/**
 * Vẽ sơ đồ topology từ `liveSnapshot()` của Simulator.
 *
 * Về utilization: engine trả về giá trị TỨC THỜI (busy/servers) nên nhảy rất mạnh giữa các
 * khung hình (0.00 ↔ 1.00). Renderer làm mượt bằng EMA để người học đọc được xu hướng —
 * nhưng con số hiển thị vẫn là số đo thật đã làm mượt, không phải số bịa. Hệ số làm mượt
 * đặt ở `smoothing` (0 = không làm mượt).
 */
export class TopologyRenderer {
  constructor(canvas, { smoothing = 0.12, showLegend = true, labels = {} } = {}) {
    if (!canvas) throw new Error('TopologyRenderer cần một <canvas>');
    this.canvas = canvas;
    this.smoothing = smoothing;
    this.showLegend = showLegend;
    // Nhãn tiếng Việt tuỳ chọn cho từng stage id, vd { app: 'App Server' }.
    this.labels = labels;
    this._emaUtil = new Map(); // stageId -> utilization đã làm mượt
    this._boxes = []; // vị trí các stage box của khung hình gần nhất
    this._lastArgs = null;
    attachAutoRedraw(this);
  }

  _smooth(key, value) {
    if (this.smoothing <= 0) return value;
    const prev = this._emaUtil.get(key);
    const next = prev === undefined ? value : prev + this.smoothing * (value - prev);
    this._emaUtil.set(key, next);
    return next;
  }

  /**
   * Mức chiếm dụng đã làm mượt của một tầng — chính con số đang hiển thị trên canvas.
   * Trang gọi hàm này khi cần viết nhận xét, để chữ và hình KHÔNG nói hai số khác nhau
   * (giá trị tức thời trong snapshot nhảy 0↔100% nên không dùng để kết luận được).
   */
  smoothedUtilization(stageId) {
    return this._emaUtil.has(stageId) ? this._emaUtil.get(stageId) : null;
  }

  /**
   * Vẽ một khung hình. `snapshot` là kết quả của Simulator.liveSnapshot().
   * Trả về false nếu bỏ qua khung hình (canvas đang bị ẩn) để người gọi biết mà vẽ lại sau.
   */
  render(snapshot) {
    this._lastArgs = [snapshot];
    const dims = setupHiDpi(this.canvas);
    if (!dims) return false;
    const { ctx, w, h } = dims;

    ctx.fillStyle = THEME.bg;
    ctx.fillRect(0, 0, w, h);

    if (!snapshot || !snapshot.stages || snapshot.stages.length === 0) {
      ctx.fillStyle = THEME.textMuted;
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chưa có dữ liệu mô phỏng', w / 2, h / 2);
      return true;
    }

    const pad = 10;
    const legendH = this.showLegend ? 16 : 0;
    const clientW = 46; // cột "Client" bên trái
    const gap = 14;
    const stages = snapshot.stages;
    const areaY = pad;
    const areaH = h - pad * 2 - legendH;
    const boxW = Math.max(52, (w - pad * 2 - clientW - gap * stages.length) / stages.length);

    // ---- Cột Client ----
    ctx.fillStyle = THEME.textMuted;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Client', pad + clientW / 2, areaY + areaH / 2 - 6);
    ctx.fillStyle = THEME.accent;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(`${Math.round(snapshot.rps)} rps`, pad + clientW / 2, areaY + areaH / 2 + 9);

    // ---- Các stage box ----
    this._boxes = [];
    let x = pad + clientW + gap;
    for (let i = 0; i < stages.length; i++) {
      const st = stages[i];
      const box = { x, y: areaY, w: boxW, h: areaH, stage: st };
      this._boxes.push(box);
      this._drawStage(ctx, box, st);
      x += boxW + gap;
    }

    // ---- Mũi tên nối giữa các tầng ----
    ctx.strokeStyle = THEME.border;
    ctx.lineWidth = 1;
    const midY = areaY + areaH / 2;
    let prevRight = pad + clientW;
    for (const box of this._boxes) {
      ctx.beginPath();
      ctx.moveTo(prevRight + 2, midY);
      ctx.lineTo(box.x - 3, midY);
      ctx.stroke();
      // đầu mũi tên
      ctx.beginPath();
      ctx.moveTo(box.x - 3, midY);
      ctx.lineTo(box.x - 8, midY - 3);
      ctx.lineTo(box.x - 8, midY + 3);
      ctx.closePath();
      ctx.fillStyle = THEME.border;
      ctx.fill();
      prevRight = box.x + box.w;
    }

    // ---- Gói tin đang được phục vụ ----
    this._drawPackets(ctx, snapshot);

    if (this.showLegend) this._drawLegend(ctx, w, h, snapshot);
    return true;
  }

  _drawStage(ctx, box, st) {
    const { x, y, w, h } = box;
    const util = this._smooth(st.id, st.utilization);
    const allDead = st.replicas.length > 0 && st.replicas.every((r) => !r.alive);

    // Khung tầng
    ctx.fillStyle = THEME.panel;
    roundRect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = allDead ? THEME.danger : THEME.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tên tầng + utilization
    ctx.textAlign = 'left';
    ctx.fillStyle = THEME.text;
    ctx.font = 'bold 11px system-ui, sans-serif';
    const label = this.labels[st.id] || st.id;
    ctx.fillText(this._fit(ctx, label, w - 12), x + 6, y + 14);

    ctx.fillStyle = utilizationColor(util);
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(`${Math.round(util * 100)}%`, x + 6, y + 27);

    // Thanh utilization
    const barW = w - 12;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x + 6, y + 31, barW, 3);
    ctx.fillStyle = utilizationColor(util);
    ctx.fillRect(x + 6, y + 31, barW * Math.min(1, Math.max(0, util)), 3);

    // Cache hit ratio (nếu là tầng cache)
    let infoY = y + 46;
    if (st.hitRatio !== null && st.hitRatio !== undefined) {
      ctx.fillStyle = THEME.accent;
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillText(`hit ${(st.hitRatio * 100).toFixed(0)}%`, x + 6, infoY);
      infoY += 11;
    }
    if (st.slowFactor > 1) {
      ctx.fillStyle = THEME.danger;
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.fillText(`chậm ${st.slowFactor}×`, x + 6, infoY);
      infoY += 11;
    }

    // ---- Các replica ----
    // Căn giữa theo chiều dọc trong phần không gian còn lại: nếu chỉ có 1-2 replica mà box
    // cao thì việc dồn hết lên trên để lại một vùng trống rất lớn, trông như bị lỗi.
    const rows = st.replicas.length;
    const availTop = infoY + 2;
    const availH = y + h - 8 - availTop;
    const rowH = rows > 0 ? Math.min(24, availH / rows) : 0;
    const blockH = rowH * rows;
    const rowTop = availTop + Math.max(0, (availH - blockH) / 2);
    box.rowTop = rowTop;
    box.rowH = rowH;

    for (let i = 0; i < rows; i++) {
      const r = st.replicas[i];
      const ry = rowTop + i * rowH;
      const rh = Math.max(6, rowH - 3);

      ctx.fillStyle = r.alive ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.10)';
      roundRect(ctx, x + 6, ry, w - 12, rh, 3);
      ctx.fill();

      if (!r.alive) {
        // Replica chết: gạch chéo
        ctx.strokeStyle = THEME.danger;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 6, ry);
        ctx.lineTo(x + w - 6, ry + rh);
        ctx.moveTo(x + w - 6, ry);
        ctx.lineTo(x + 6, ry + rh);
        ctx.stroke();
        continue;
      }

      // Phần server đang bận. Dùng màu accent trung tính — KHÔNG dùng thang đỏ/vàng ở đây:
      // với `servers = 1` thì busy/servers chỉ có thể là 0 hoặc 1, nên thang cảnh báo sẽ làm
      // mọi replica đang làm việc bình thường trông như đang quá tải. Tín hiệu quá tải thật
      // nằm ở utilization của cả tầng (đã làm mượt) và ở độ dâng của hàng đợi.
      const frac = r.servers > 0 ? Math.min(1, r.busy / r.servers) : 0;
      if (frac > 0) {
        ctx.fillStyle = THEME.accent;
        ctx.globalAlpha = 0.3;
        roundRect(ctx, x + 6, ry, (w - 12) * frac, rh, 3);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Hàng đợi: vẽ thành các vạch nhỏ dồn ở mép phải — càng dâng càng dễ thấy.
      // Đổi sang đỏ khi hàng đợi gần đầy: đó mới là lúc request bắt đầu bị drop.
      if (r.queueDepth > 0) {
        const maxTicks = Math.floor((w - 16) / 3);
        const ticks = Math.min(maxTicks, r.queueDepth);
        const nearFull = r.queueDepth >= 0.8 * (r.queueLimit ?? Infinity);
        ctx.fillStyle = nearFull ? THEME.danger : THEME.queue;
        for (let t = 0; t < ticks; t++) {
          ctx.fillRect(x + w - 8 - t * 3, ry + 1, 2, rh - 2);
        }
        if (rowH >= 14) {
          ctx.fillStyle = THEME.text;
          ctx.font = '8px system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(String(r.queueDepth), x + 9, ry + rh - 2);
        }
      }
    }

    // Số request bị drop ở tầng này
    if (st.dropped > 0) {
      ctx.fillStyle = THEME.danger;
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`drop ${st.dropped}`, x + w - 6, y + 27);
      ctx.textAlign = 'left';
    }
  }

  _drawPackets(ctx, snapshot) {
    if (!snapshot.inFlight) return;
    for (const p of snapshot.inFlight) {
      const box = this._boxes[p.stageIdx];
      if (!box || !box.rowH) continue;
      const px = box.x + 8 + (box.w - 16) * p.progress;
      const py = box.rowTop + p.replicaIndex * box.rowH + Math.max(3, (box.rowH - 3) / 2);
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = THEME.packet;
      ctx.fill();
    }
  }

  _drawLegend(ctx, w, h, snapshot) {
    const y = h - 5;
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'left';
    let x = 10;
    const item = (color, text) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 7, 6, 6);
      ctx.fillStyle = THEME.textMuted;
      ctx.fillText(text, x + 9, y - 1);
      x += 12 + ctx.measureText(text).width + 8;
    };
    item(THEME.packet, 'đang xử lý');
    item(THEME.queue, 'hàng đợi');
    item(THEME.danger, 'quá tải / chết');
    ctx.fillStyle = THEME.textMuted;
    ctx.textAlign = 'right';
    ctx.fillText(
      `p99 ${formatMs(snapshot.latency.p99)} · drop ${(snapshot.dropRate * 100).toFixed(1)}%`,
      w - 10,
      y - 1
    );
  }

  _fit(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let s = text;
    while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
    return s + '…';
  }
}

// ==========================================
// 3. HISTOGRAM LATENCY
// ==========================================

/**
 * Vẽ histogram latency kèm vạch p50/p95/p99.
 * Mục đích dạy học: cho thấy phân phối latency LỆCH PHẢI (đuôi dài), nên giá trị trung bình
 * nằm ở chỗ không đại diện cho ai — đúng luận điểm của Bài 1.
 */
export class LatencyHistogram {
  constructor(canvas, { bins = 40 } = {}) {
    if (!canvas) throw new Error('LatencyHistogram cần một <canvas>');
    this.canvas = canvas;
    this.bins = bins;
    this._lastArgs = null;
    attachAutoRedraw(this);
  }

  /**
   * @param {number[]} latencies - mảng latency (ms)
   * @param {{p50:number,p95:number,p99:number,mean:number}} marks - các mốc cần vẽ vạch
   */
  render(latencies, marks = {}) {
    this._lastArgs = [latencies, marks];
    const dims = setupHiDpi(this.canvas);
    if (!dims) return false;
    const { ctx, w, h } = dims;
    ctx.fillStyle = THEME.bg;
    ctx.fillRect(0, 0, w, h);

    if (!latencies || latencies.length === 0) {
      ctx.fillStyle = THEME.textMuted;
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chưa có dữ liệu latency', w / 2, h / 2);
      return;
    }

    const padL = 8;
    const padR = 8;
    const padT = 8;
    const padB = 22;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Giới hạn trục X ở p99 * 1.15 để đuôi cực dài không nén bẹp toàn bộ biểu đồ.
    const p99 = marks.p99 || Math.max(...latencies);
    const xMax = Math.max(1, p99 * 1.15);
    const counts = new Array(this.bins).fill(0);
    for (const v of latencies) {
      let b = Math.floor((v / xMax) * this.bins);
      if (b >= this.bins) b = this.bins - 1; // dồn phần vượt vào bin cuối
      if (b < 0) b = 0;
      counts[b]++;
    }
    const maxCount = Math.max(...counts, 1);

    // Các cột
    const barW = plotW / this.bins;
    for (let i = 0; i < this.bins; i++) {
      const bh = (counts[i] / maxCount) * plotH;
      ctx.fillStyle = THEME.accent;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(padL + i * barW, padT + plotH - bh, Math.max(1, barW - 1), bh);
      ctx.globalAlpha = 1;
    }

    // Vạch mốc. Các mốc rất hay nằm sát nhau (avg và p50 thường cách nhau vài ms) nên nhãn
    // phải tự tránh nhau theo chiều dọc, và không được tràn ra ngoài mép phải.
    ctx.font = '9px system-ui, sans-serif';
    const placed = []; // [{ x1, x2, line }]
    const drawMark = (value, color, label) => {
      if (!value || value <= 0) return;
      const mx = padL + Math.min(plotW, (value / xMax) * plotW);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(mx, padT);
      ctx.lineTo(mx, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      const text = `${label} ${formatMs(value)}`;
      const tw = ctx.measureText(text).width;
      // Nếu nhãn vẽ sang phải sẽ tràn khung thì đổi sang vẽ về bên trái vạch.
      const alignRight = mx + 3 + tw > w - 2;
      const x1 = alignRight ? mx - 3 - tw : mx + 3;
      const x2 = x1 + tw;
      // Tìm dòng chưa bị nhãn khác chiếm chỗ theo trục ngang.
      let line = 0;
      while (placed.some((p) => p.line === line && x1 < p.x2 + 4 && x2 > p.x1 - 4)) line++;
      placed.push({ x1, x2, line });

      ctx.fillStyle = color;
      ctx.textAlign = alignRight ? 'right' : 'left';
      ctx.fillText(text, alignRight ? mx - 3 : mx + 3, padT + 9 + line * 11);
    };
    // Vẽ p99 trước để nó luôn được dòng trên cùng (mốc quan trọng nhất, xem Bài 1).
    drawMark(marks.p99, THEME.danger, 'p99');
    drawMark(marks.p95, THEME.warn, 'p95');
    drawMark(marks.p50, THEME.ok, 'p50');
    drawMark(marks.mean, THEME.textMuted, 'avg');

    // Trục X
    ctx.strokeStyle = THEME.border;
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();
    ctx.fillStyle = THEME.textMuted;
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('0', padL, h - 8);
    ctx.textAlign = 'right';
    ctx.fillText(formatMs(xMax), padL + plotW, h - 8);
    ctx.textAlign = 'center';
    ctx.fillText(`${latencies.length} mẫu`, padL + plotW / 2, h - 8);
  }
}

// ==========================================
// 4. ĐỒ THỊ UTILIZATION ↔ LATENCY
// ==========================================

/**
 * Đồ thị hình ảnh trung tâm của Bài 1: latency KHÔNG tăng tuyến tính theo tải.
 * Vẽ đường lý thuyết M/M/1  W = 1/(mu - lambda)  với tiệm cận đứng tại rho = 1,
 * rồi chấm các điểm đo được từ mô phỏng lên cùng hệ trục để đối chiếu.
 */
export class UtilLatencyChart {
  constructor(canvas) {
    if (!canvas) throw new Error('UtilLatencyChart cần một <canvas>');
    this.canvas = canvas;
    this.points = []; // [{ rho, latencyMs }]
    this._lastArgs = null;
    attachAutoRedraw(this);
  }

  addPoint(rho, latencyMs) {
    this.points.push({ rho, latencyMs });
    return this;
  }

  clearPoints() {
    this.points = [];
    return this;
  }

  /**
   * @param {number} muPerSec - tốc độ phục vụ tối đa (request/giây), để vẽ đường lý thuyết
   * @param {number} yMaxMs   - trần trục Y; mặc định 8 lần thời gian phục vụ
   * @param {boolean} showTheory - có vẽ đường lý thuyết M/M/1 hay không.
   *   ĐẶT false khi tầng đang đo có NHIỀU server song song: lúc đó hệ là M/M/c chứ không
   *   phải M/M/1, và ở cùng một mức rho thì M/M/c cho độ trễ thấp hơn hẳn. Vẽ đường M/M/1
   *   chồng lên số đo M/M/c sẽ khiến người học tưởng mô phỏng sai, trong khi thực ra là
   *   so sai mô hình.
   */
  render(muPerSec, yMaxMs = null, showTheory = true) {
    this._lastArgs = [muPerSec, yMaxMs, showTheory];
    const dims = setupHiDpi(this.canvas);
    if (!dims) return false;
    const { ctx, w, h } = dims;
    ctx.fillStyle = THEME.bg;
    ctx.fillRect(0, 0, w, h);

    const padL = 34;
    const padR = 10;
    const padT = 10;
    const padB = 24;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Trần trục Y: mặc định = 8 lần thời gian phục vụ đơn lẻ.
    // CỐ TÌNH không nới trần theo điểm đo cao nhất: nếu nới, vùng thú vị (rho từ 0 tới 0.8)
    // bị nén bẹp xuống đáy và mất hẳn thông điệp "phẳng rồi đột ngột dựng đứng". Điểm nào
    // vượt trần sẽ được vẽ ghim ở mép trên kèm dấu mũi nhọn để người đọc biết nó ra ngoài khung.
    const serviceMs = 1000 / muPerSec;
    const yMax = yMaxMs || serviceMs * 8;

    const X = (rho) => padL + Math.min(1, Math.max(0, rho)) * plotW;
    const Y = (ms) => padT + plotH - Math.min(1, Math.max(0, ms / yMax)) * plotH;

    // Lưới + nhãn trục
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.fillStyle = THEME.textMuted;
    ctx.font = '9px system-ui, sans-serif';
    for (let i = 0; i <= 4; i++) {
      const rho = i / 4;
      const gx = X(rho);
      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, padT + plotH);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(rho.toFixed(2), gx, h - 10);
    }
    for (let i = 0; i <= 4; i++) {
      const ms = (yMax * i) / 4;
      const gy = Y(ms);
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(padL + plotW, gy);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(formatMs(ms), padL - 4, gy + 3);
    }

    // Đường lý thuyết W = 1/(mu - lambda), với lambda = rho * mu
    ctx.strokeStyle = THEME.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let started = false;
    for (let px = 0; showTheory && px <= plotW; px++) {
      const rho = px / plotW;
      if (rho >= 0.999) break;
      const lambda = rho * muPerSec;
      const wMs = (1 / (muPerSec - lambda)) * 1000;
      if (wMs > yMax * 1.2) {
        // Vượt khỏi khung: dừng vẽ để không tạo đường thẳng đứng giả.
        break;
      }
      const gx = padL + px;
      const gy = Y(wMs);
      if (!started) {
        ctx.moveTo(gx, gy);
        started = true;
      } else {
        ctx.lineTo(gx, gy);
      }
    }
    ctx.stroke();

    // Tiệm cận đứng tại rho = 1
    ctx.strokeStyle = THEME.danger;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(X(1), padT);
    ctx.lineTo(X(1), padT + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = THEME.danger;
    ctx.textAlign = 'right';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillText('ρ = 1', X(1) - 3, padT + 10);

    // Các điểm đo từ mô phỏng
    for (const p of this.points) {
      const px = X(p.rho);
      const outOfRange = p.latencyMs > yMax;
      const py = outOfRange ? padT + 3 : Y(p.latencyMs);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = THEME.warn;
      ctx.fill();
      ctx.strokeStyle = THEME.bg;
      ctx.lineWidth = 1;
      ctx.stroke();
      if (outOfRange) {
        // Mũi nhọn hướng lên: giá trị thật nằm ngoài khung, không phải bằng trần.
        ctx.beginPath();
        ctx.moveTo(px, padT - 4);
        ctx.lineTo(px - 3, padT + 1);
        ctx.lineTo(px + 3, padT + 1);
        ctx.closePath();
        ctx.fillStyle = THEME.warn;
        ctx.fill();
      }
    }

    // Chú giải
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'left';
    let legendY = padT + 10;
    if (showTheory) {
      ctx.fillStyle = THEME.accent;
      ctx.fillText('— lý thuyết W = 1/(μ−λ)', padL + 4, legendY);
      legendY += 11;
    } else {
      ctx.fillStyle = THEME.textMuted;
      ctx.fillText('nhiều server song song (M/M/c)', padL + 4, legendY);
      legendY += 11;
    }
    if (this.points.length > 0) {
      ctx.fillStyle = THEME.warn;
      ctx.fillText('● đo từ mô phỏng', padL + 4, legendY);
    }
    ctx.fillStyle = THEME.textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('utilization ρ = λ/μ', padL + plotW / 2, h - 1);
  }
}
