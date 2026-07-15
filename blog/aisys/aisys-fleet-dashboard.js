// Bài 6 — Model Versioning, Rollback & Chi Phí Hạ Tầng
// Mô phỏng "fleet dashboard" đồ chơi: 1 phiên bản stable (v2) phục vụ ổn định, 1 phiên bản
// canary (v3) nhận dần traffic. Nếu bật "Có lỗi tiềm ẩn", canary sẽ suy giảm dần theo mỗi
// bước thời gian, minh hoạ đúng lý do cần canary deploy + rollback tức thời (mục 6.2-6.3).
export const STABLE_METRICS = { errorRatePct: 0.5, latencyMs: 120 };
export const ERROR_THRESHOLD_PCT = 5;

export function computeCanaryMetrics(step, buggy) {
  if (!buggy) {
    return {
      errorRatePct: Math.min(1.2, 0.4 + step * 0.02),
      latencyMs: Math.min(130, 115 + step * 1),
    };
  }
  const regressionSteps = Math.max(0, step - 1); // 1 bước đầu vẫn ổn, "bug" lộ ra từ bước 2
  return {
    errorRatePct: 0.5 + regressionSteps * 1.8,
    latencyMs: 120 + regressionSteps * 20,
  };
}

export function computeCanaryTrafficPct(step, rolledBack, regressionDetected) {
  if (rolledBack) return 0;
  if (regressionDetected) return Math.min(100, 5 + (step - 1) * 15); // ngừng tăng traffic khi phát hiện lỗi
  return Math.min(100, 5 + step * 15);
}

export function renderFleetDashboard(root) {
  const buggyToggle = root.querySelector('.fleet-buggy-toggle');
  const stepBtn = root.querySelector('.fleet-step-btn');
  const rollbackBtn = root.querySelector('.fleet-rollback-btn');
  const resetBtn = root.querySelector('.fleet-reset-btn');
  const stableCard = root.querySelector('.fleet-card--stable');
  const canaryCard = root.querySelector('.fleet-card--canary');
  const alertBox = root.querySelector('.fleet-alert');
  const stepLabel = root.querySelector('.fleet-step-label');

  let step = 0;
  let rolledBack = false;

  function render() {
    const buggy = buggyToggle.checked;
    const canary = computeCanaryMetrics(step, buggy);
    const regressionDetected = canary.errorRatePct > ERROR_THRESHOLD_PCT;
    const canaryTraffic = rolledBack ? 0 : computeCanaryTrafficPct(step, false, regressionDetected);
    const stableTraffic = 100 - canaryTraffic;

    stepLabel.textContent = rolledBack ? `Đã rollback ở bước ${step}` : `Bước hiện tại: ${step}`;

    stableCard.innerHTML = `
      <h4>🟢 Phiên bản v2 (Stable)</h4>
      <div class="fleet-metric">Traffic: <strong>${stableTraffic}%</strong></div>
      <div class="fleet-metric">Tỷ lệ lỗi: <strong>${STABLE_METRICS.errorRatePct}%</strong></div>
      <div class="fleet-metric">Độ trễ p99: <strong>${STABLE_METRICS.latencyMs}ms</strong></div>
    `;

    canaryCard.innerHTML = `
      <h4>${rolledBack ? '⚪' : regressionDetected ? '🔴' : '🟡'} Phiên bản v3 (Canary)</h4>
      <div class="fleet-metric">Traffic: <strong>${rolledBack ? 0 : canaryTraffic}%</strong></div>
      <div class="fleet-metric">Tỷ lệ lỗi: <strong>${rolledBack ? '—' : canary.errorRatePct.toFixed(1) + '%'}</strong></div>
      <div class="fleet-metric">Độ trễ p99: <strong>${rolledBack ? '—' : canary.latencyMs.toFixed(0) + 'ms'}</strong></div>
    `;
    canaryCard.classList.toggle('is-regression', !rolledBack && regressionDetected);

    if (!rolledBack && regressionDetected) {
      alertBox.innerHTML = `🚨 <strong>Regression phát hiện</strong> ở v3: tỷ lệ lỗi ${canary.errorRatePct.toFixed(1)}% vượt ngưỡng an toàn ${ERROR_THRESHOLD_PCT}%. Traffic đã ngừng tăng thêm — bấm "Rollback ngay" để đưa 100% traffic về v2.`;
      alertBox.classList.add('is-active');
      rollbackBtn.removeAttribute('disabled');
    } else if (!rolledBack) {
      alertBox.textContent = '';
      alertBox.classList.remove('is-active');
    }
  }

  stepBtn.addEventListener('click', () => {
    if (rolledBack) return;
    step++;
    render();
  });

  rollbackBtn.addEventListener('click', () => {
    rolledBack = true;
    render();
  });

  resetBtn.addEventListener('click', () => {
    step = 0;
    rolledBack = false;
    alertBox.textContent = '';
    alertBox.classList.remove('is-active');
    render();
  });

  buggyToggle.addEventListener('change', () => {
    step = 0;
    rolledBack = false;
    render();
  });

  render();
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('fleet-dashboard-root');
  if (root) renderFleetDashboard(root);
});
