// Bài 10 — Kiến Trúc Multi-Agent: Vai Trò & Giao Tiếp
// Wiring DOM cho demo "Planner–Coder–Critic": chạy 1 vòng phối hợp, hiển thị từng
// bước + toàn bộ message log, so sánh số lượng message giữa điều phối tập trung và
// phi tập trung (minh hoạ cạm bẫy over-engineering ở mục 4).
import { MessageBus, definePlanner, defineCoder, defineCritic, runMultiAgentRound } from './aisys-orchestrator.js';

export function renderMultiAgentLab(root) {
  const routingSelect = root.querySelector('.magent-routing-select');
  const runBtn = root.querySelector('.magent-run-btn');
  const nodesBox = root.querySelector('.magent-nodes');
  const stepsBox = root.querySelector('.magent-steps');
  const logBox = root.querySelector('.magent-log');
  const statsBox = root.querySelector('.magent-stats');

  function run() {
    const bus = new MessageBus();
    const agents = { planner: definePlanner(), coder: defineCoder(), critic: defineCritic() };
    const routingMode = routingSelect.value;
    const steps = runMultiAgentRound(bus, agents, 'hàm cộng 2 số có validate', routingMode);

    nodesBox.querySelectorAll('.magent-node').forEach((n) => n.classList.remove('is-active'));

    stepsBox.innerHTML = steps
      .map(
        (s, i) => `
      <div class="magent-step">
        <span class="magent-step__agent">[Bước ${i + 1}] ${s.agent}</span>
        <pre class="magent-step__output">${s.output.replace(/</g, '&lt;')}</pre>
      </div>
    `
      )
      .join('');

    logBox.innerHTML = bus
      .history()
      .map(
        (m) =>
          `<div class="magent-log-line">#${m.id} ${m.from} → ${m.to}: <em>${m.content.slice(0, 50).replace(/</g, '&lt;')}${m.content.length > 50 ? '…' : ''}</em></div>`
      )
      .join('');

    const messageCount = bus.history().length;
    const singleAgentEquivalentSteps = 1; // 1 agent đơn có thể tự viết + validate luôn, không cần trao đổi
    statsBox.innerHTML = `
      <div class="magent-stat">
        <span class="magent-stat__value">${messageCount}</span>
        <span class="magent-stat__label">Message trao đổi (${routingMode === 'centralized' ? 'tập trung qua Orchestrator' : 'phi tập trung, gửi thẳng'})</span>
      </div>
      <div class="magent-stat">
        <span class="magent-stat__value">${steps.length}</span>
        <span class="magent-stat__label">Lượt xử lý của 3 agent (so với ${singleAgentEquivalentSteps} bước nếu dùng 1 agent đơn)</span>
      </div>
    `;
  }

  routingSelect.addEventListener('change', run);
  runBtn.addEventListener('click', run);
  run();
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('multiagent-lab-root');
  if (root) renderMultiAgentLab(root);
});
