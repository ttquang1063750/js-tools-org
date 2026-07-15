// Bài 12 — Orchestration Nâng Cao: Xung Đột & Deadlock
// Wiring DOM cho 2 kịch bản: Deadlock (2 agent chờ CHÉO nhau, phát hiện bằng chu
// trình đồ thị chờ) và Livelock (2 agent liên tục "nhường nhau", phát hiện bằng
// theo dõi tiến độ đứng yên) — cả hai được giải quyết bằng circuit-breaker.
import { LockManager, detectDeadlock, checkLivelock } from './aisys-orchestrator.js';

export function renderDeadlockLab(root) {
  const scenarioSelect = root.querySelector('.dlock-scenario-select');
  const stepBtn = root.querySelector('.dlock-step-btn');
  const breakerBtn = root.querySelector('.dlock-breaker-btn');
  const resetBtn = root.querySelector('.dlock-reset-btn');
  const logBox = root.querySelector('.dlock-log');
  const statusBox = root.querySelector('.dlock-status');

  let lockManager = new LockManager();
  let tick = 0;
  let progressHistory = [];
  let resolved = false;

  function log(line) {
    const div = document.createElement('div');
    div.className = 'dlock-log-line';
    div.innerHTML = line;
    logBox.appendChild(div);
    logBox.scrollTop = logBox.scrollHeight;
  }

  function reset() {
    lockManager = new LockManager();
    tick = 0;
    progressHistory = [];
    resolved = false;
    logBox.innerHTML = '';
    statusBox.innerHTML = '';
    breakerBtn.setAttribute('disabled', 'true');

    if (scenarioSelect.value === 'deadlock') {
      lockManager.request('AgentX', 'DB_Lock');
      lockManager.request('AgentY', 'Cache_Lock');
      log('Khởi tạo: AgentX giữ <strong>DB_Lock</strong>, AgentY giữ <strong>Cache_Lock</strong>.');
    } else {
      log("Khởi tạo kịch bản Livelock: 2 agent sẽ liên tục 'nhường' nhau xử lý cùng 1 việc.");
    }
  }

  function stepDeadlock() {
    tick++;
    const reqX = lockManager.request('AgentX', 'Cache_Lock');
    const reqY = lockManager.request('AgentY', 'DB_Lock');
    log(
      `Tick ${tick}: AgentX xin <strong>Cache_Lock</strong> → ${reqX.granted ? '✅ được cấp' : `🛑 bị chặn bởi ${reqX.holder}`}; ` +
        `AgentY xin <strong>DB_Lock</strong> → ${reqY.granted ? '✅ được cấp' : `🛑 bị chặn bởi ${reqY.holder}`}`
    );

    const waitForGraph = {};
    if (!reqX.granted) waitForGraph['AgentX'] = reqX.holder;
    if (!reqY.granted) waitForGraph['AgentY'] = reqY.holder;
    const result = detectDeadlock(waitForGraph);

    if (result.deadlock) {
      statusBox.innerHTML = `<div class="dlock-alert dlock-alert--danger">🔒 DEADLOCK phát hiện: chu trình chờ ${result.cycle.join(' → ')}. Cả hai agent sẽ KHÔNG BAO GIỜ tự thoát nếu không có can thiệp.</div>`;
      breakerBtn.removeAttribute('disabled');
    }
  }

  function stepLivelock() {
    tick++;
    // Cả 2 agent đều "lịch sự nhường" — không ai thực sự làm việc, tiến độ đứng yên ở 0
    progressHistory.push(0);
    log(
      `Tick ${tick}: AgentX nói "Bạn làm trước đi" → AgentY nói "Không, bạn làm trước đi" → không ai tiến hành. Tiến độ: 0.`
    );

    const suspected = checkLivelock(progressHistory, 4);
    if (suspected) {
      statusBox.innerHTML = `<div class="dlock-alert dlock-alert--warning">🔁 LIVELOCK nghi ngờ: tiến độ đứng yên (0) suốt ${progressHistory.slice(-4).length} tick liên tiếp dù cả 2 agent vẫn "hoạt động" (không hề bị khoá cứng như deadlock).</div>`;
      breakerBtn.removeAttribute('disabled');
    }
  }

  stepBtn.addEventListener('click', () => {
    if (resolved) return;
    if (scenarioSelect.value === 'deadlock') stepDeadlock();
    else stepLivelock();
  });

  breakerBtn.addEventListener('click', () => {
    resolved = true;
    if (scenarioSelect.value === 'deadlock') {
      lockManager.forceRelease('DB_Lock');
      const retryY = lockManager.request('AgentY', 'DB_Lock');
      log(
        `⚡ Circuit-breaker: cưỡng chế giải phóng <strong>DB_Lock</strong> khỏi AgentX (agent chờ lâu hơn được ưu tiên). AgentY xin lại DB_Lock → ${retryY.granted ? '✅ được cấp, tiếp tục xử lý' : 'vẫn bị chặn'}.`
      );
    } else {
      log("⚡ Circuit-breaker: buộc AgentX PHẢI xử lý trước (bỏ qua vòng 'nhường nhau'), phá vỡ livelock.");
    }
    statusBox.innerHTML += `<div class="dlock-alert dlock-alert--ok">✅ Đã phá vỡ tình huống — hệ thống có thể tiếp tục.</div>`;
    breakerBtn.setAttribute('disabled', 'true');
  });

  scenarioSelect.addEventListener('change', reset);
  resetBtn.addEventListener('click', reset);

  reset();
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('deadlock-lab-root');
  if (root) renderDeadlockLab(root);
});
