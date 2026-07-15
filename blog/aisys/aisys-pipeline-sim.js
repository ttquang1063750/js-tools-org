// Bài 3 — Huấn Luyện Phân Tán (Khái Niệm)
// Mô phỏng "distributed training" đơn giản hoá: data parallelism với N worker chia batch cố
// định, cộng chi phí đồng bộ gradient (all-reduce) tăng dần theo số worker. Mục đích minh hoạ
// đúng đánh đổi compute vs communication ở mục 3.4 — KHÔNG phải benchmark GPU thật.
const BASE_COMPUTE_MS_PER_STEP = 200; // thời gian tính gradient/step với 1 worker duy nhất
const FIXED_SYNC_LATENCY_MS = 10; // độ trễ cố định của 1 vòng all-reduce (network round-trip)
const SYNC_COST_PER_EXTRA_WORKER_MS = 8; // chi phí giao tiếp tăng thêm mỗi khi thêm 1 worker
const TOTAL_STEPS = 500;

export const WORKER_COUNTS = [1, 2, 4, 8, 16, 32, 64];

export function simulateStep(workerCount) {
  const computePerStep = BASE_COMPUTE_MS_PER_STEP / workerCount;
  const syncOverhead = workerCount > 1 ? FIXED_SYNC_LATENCY_MS + SYNC_COST_PER_EXTRA_WORKER_MS * (workerCount - 1) : 0;
  return {
    computePerStep,
    syncOverhead,
    stepTime: computePerStep + syncOverhead,
  };
}

export function simulateTraining(workerCount) {
  const { computePerStep, syncOverhead, stepTime } = simulateStep(workerCount);
  const totalTimeMs = stepTime * TOTAL_STEPS;
  const idealTimeMs = (BASE_COMPUTE_MS_PER_STEP * TOTAL_STEPS) / workerCount; // song song hoá hoàn hảo, không overhead
  return {
    workerCount,
    computePerStep,
    syncOverhead,
    stepTime,
    totalTimeMs,
    idealTimeMs,
    overheadShare: syncOverhead / stepTime,
  };
}

export function renderPipelineSimDemo(root) {
  const buttons = root.querySelectorAll('.pipeline-sim-worker-btn');
  const resultPanel = root.querySelector('.pipeline-sim-result');
  const barsPanel = root.querySelector('.pipeline-sim-bars');

  const allResults = WORKER_COUNTS.map(simulateTraining);
  const maxTime = Math.max(...allResults.map((r) => r.totalTimeMs));

  function fmt(ms) {
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
  }

  function render(workerCount) {
    const r = allResults.find((x) => x.workerCount === workerCount);
    buttons.forEach((b) => b.classList.toggle('is-active', Number(b.dataset.workers) === workerCount));

    resultPanel.innerHTML = `
      <div class="pipeline-sim-stat">
        <span class="pipeline-sim-stat__value">${fmt(r.stepTime)}</span>
        <span class="pipeline-sim-stat__label">Thời gian/step (compute ${fmt(r.computePerStep)} + sync ${fmt(r.syncOverhead)})</span>
      </div>
      <div class="pipeline-sim-stat">
        <span class="pipeline-sim-stat__value">${fmt(r.totalTimeMs)}</span>
        <span class="pipeline-sim-stat__label">Tổng thời gian huấn luyện (${TOTAL_STEPS} bước)</span>
      </div>
      <div class="pipeline-sim-stat">
        <span class="pipeline-sim-stat__value">${(r.overheadShare * 100).toFixed(0)}%</span>
        <span class="pipeline-sim-stat__label">Tỷ lệ thời gian tiêu tốn cho đồng bộ (sync overhead)</span>
      </div>
    `;

    barsPanel.innerHTML = allResults
      .map((res) => {
        const actualPct = (res.totalTimeMs / maxTime) * 100;
        const idealPct = (res.idealTimeMs / maxTime) * 100;
        return `
        <div class="pipeline-sim-bar-row ${res.workerCount === workerCount ? 'is-active' : ''}">
          <span class="pipeline-sim-bar-row__label">${res.workerCount} worker</span>
          <div class="pipeline-sim-bar-row__track">
            <div class="pipeline-sim-bar-row__ideal" style="width:${idealPct}%"></div>
            <div class="pipeline-sim-bar-row__actual" style="width:${actualPct}%"></div>
          </div>
          <span class="pipeline-sim-bar-row__time">${fmt(res.totalTimeMs)}</span>
        </div>
      `;
      })
      .join('');
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => render(Number(btn.dataset.workers)));
  });

  render(1);
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('pipeline-sim-root');
  if (root) renderPipelineSimDemo(root);
});
