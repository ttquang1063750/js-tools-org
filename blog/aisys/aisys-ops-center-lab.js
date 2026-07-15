// Bài 13 — Dự Án: AI Ops Center
// Capstone: TÁI SỬ DỤNG NGUYÊN VẸN 3 track — pipeline (Bài 6: computeCanaryMetrics),
// blackboard (Bài 11: ghi log quyết định), và mẫu hình ReAct (Bài 9: Thought/Action/
// Observation) — để dựng 1 agent giám sát tự động, không cần con người bấm rollback.
import { STABLE_METRICS, ERROR_THRESHOLD_PCT, computeCanaryMetrics } from './aisys-fleet-dashboard.js';
import { Blackboard } from './aisys-orchestrator.js';

export function renderOpsCenterLab(root) {
  const buggyToggle = root.querySelector('.opscenter-buggy-toggle');
  const stepBtn = root.querySelector('.opscenter-step-btn');
  const resetBtn = root.querySelector('.opscenter-reset-btn');
  const logBox = root.querySelector('.opscenter-log');
  const dashboardBox = root.querySelector('.opscenter-dashboard');
  const blackboardBox = root.querySelector('.opscenter-blackboard');

  let bb = new Blackboard();
  let step = 0;
  let rolledBack = false;

  function log(cssClass, html) {
    const line = document.createElement('div');
    line.className = `opscenter-log-line ${cssClass}`;
    line.innerHTML = html;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  }

  function renderDashboard(canary, canaryTrafficPct) {
    dashboardBox.innerHTML = `
      <div class="opscenter-card">
        <h5>🟢 v2 (Stable)</h5>
        <div>Traffic: ${100 - canaryTrafficPct}%</div>
        <div>Lỗi: ${STABLE_METRICS.errorRatePct}%</div>
      </div>
      <div class="opscenter-card ${!rolledBack && canary.errorRatePct > ERROR_THRESHOLD_PCT ? 'is-danger' : ''}">
        <h5>${rolledBack ? '⚪' : '🟡'} v3 (Canary)</h5>
        <div>Traffic: ${rolledBack ? 0 : canaryTrafficPct}%</div>
        <div>Lỗi: ${rolledBack ? '—' : canary.errorRatePct.toFixed(1) + '%'}</div>
      </div>
    `;
  }

  function renderBlackboardView() {
    blackboardBox.textContent = JSON.stringify(
      Object.fromEntries(Object.entries(bb.state).map(([k, v]) => [k, v.value])),
      null,
      2
    );
  }

  function tick() {
    if (rolledBack) return;
    step++;
    const buggy = buggyToggle.checked;
    const canary = computeCanaryMetrics(step, buggy);
    const preRollbackTrafficPct = Math.min(100, 5 + step * 15);

    log(
      'opscenter-log-line--thought',
      `<strong>[Bước ${step}] 🤔 OpsAgent Thought:</strong> Kiểm tra canary — tỷ lệ lỗi hiện tại ${canary.errorRatePct.toFixed(1)}%, ngưỡng an toàn ${ERROR_THRESHOLD_PCT}%.`
    );
    bb.write('OpsAgent', 'last_check', { step, errorRatePct: canary.errorRatePct });

    if (canary.errorRatePct > ERROR_THRESHOLD_PCT) {
      log(
        'opscenter-log-line--action',
        `<strong>[Bước ${step}] ⚡ OpsAgent Action:</strong> Vượt ngưỡng! Tự động gọi <code>rollback()</code> — KHÔNG chờ con người xác nhận.`
      );
      rolledBack = true; // ĐẶT TRƯỚC khi tính traffic hiển thị, để dashboard phản ánh đúng trạng thái SAU rollback
      bb.write('OpsAgent', 'system_status', 'rolled_back');
      bb.write(
        'OpsAgent',
        'incident_report',
        `Regression phát hiện ở bước ${step} (lỗi ${canary.errorRatePct.toFixed(1)}%) — đã tự động rollback về v2.`
      );
      log(
        'opscenter-log-line--observation',
        `<strong>[Bước ${step}] 👁️ Observation:</strong> Rollback thành công — 100% traffic đã quay về v2 (stable).`
      );
    } else {
      bb.write('OpsAgent', 'system_status', 'healthy');
      log(
        'opscenter-log-line--observation',
        `<strong>[Bước ${step}] 👁️ Observation:</strong> Trong ngưỡng an toàn — tiếp tục giám sát, tăng traffic canary lên ${preRollbackTrafficPct}%.`
      );
    }

    // Tính traffic hiển thị SAU CÙNG, dựa trên trạng thái rolledBack đã chốt ở trên —
    // tránh lệch pha giữa card canary (0%) và card stable (100 - x%) ngay tick rollback.
    const canaryTrafficPct = rolledBack ? 0 : preRollbackTrafficPct;
    renderDashboard(canary, canaryTrafficPct);
    renderBlackboardView();
  }

  function reset() {
    bb = new Blackboard();
    step = 0;
    rolledBack = false;
    logBox.innerHTML = '';
    renderDashboard(computeCanaryMetrics(0, false), 5);
    renderBlackboardView();
  }

  stepBtn.addEventListener('click', tick);
  resetBtn.addEventListener('click', reset);
  buggyToggle.addEventListener('change', reset);

  reset();
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('ops-center-lab-root');
  if (root) renderOpsCenterLab(root);
});
