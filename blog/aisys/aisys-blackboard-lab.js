// Bài 11 — Blackboard Pattern & Shared State
// Wiring DOM cho kịch bản: AgentA ghi bản nháp -> AgentC đọc (giữ bản cache) -> AgentB
// ghi đè lên CÙNG key. Không khoá -> ghi đè âm thầm + AgentC cầm dữ liệu CŨ (stale
// read). Có khoá -> AgentB bị từ chối rõ ràng, không mất dữ liệu của AgentA.
import { Blackboard } from './aisys-orchestrator.js';

export function renderBlackboardLab(root) {
  const lockToggle = root.querySelector('.bblab-lock-toggle');
  const runBtn = root.querySelector('.bblab-run-btn');
  const timelineBox = root.querySelector('.bblab-timeline');
  const staleBox = root.querySelector('.bblab-stale-check');
  const stateBox = root.querySelector('.bblab-state');

  function run() {
    const bb = new Blackboard();
    const requireLock = lockToggle.checked;
    const timeline = [];

    const w1 = bb.write('AgentA', 'draft_answer', 'Bản nháp A: Trái đất hình cầu.', { requireLock });
    timeline.push(
      `1. AgentA ghi "draft_answer" = "Bản nháp A: Trái đất hình cầu." → ${w1.accepted ? '✅ Chấp nhận' : '🛑 Từ chối'}`
    );

    const cachedByC = bb.read('draft_answer');
    timeline.push(`2. AgentC đọc "draft_answer" và LƯU LẠI bản cache: "${cachedByC}"`);

    const w2 = bb.write('AgentB', 'draft_answer', 'Bản nháp B: Trái đất hình elip.', { requireLock });
    if (w2.accepted) {
      timeline.push(
        `3. AgentB ghi "draft_answer" = "Bản nháp B: Trái đất hình elip." → ✅ Chấp nhận` +
          (w2.overwroteAgent ? ` (⚠️ ghi đè âm thầm lên bản của ${w2.overwroteAgent}!)` : '')
      );
    } else {
      timeline.push(`3. AgentB cố ghi "draft_answer" → 🛑 Từ chối: ${w2.reason}`);
    }

    const currentValue = bb.read('draft_answer');
    const stale = cachedByC !== currentValue;
    timeline.push(`4. Giá trị THẬT trên blackboard hiện tại: "${currentValue}"`);

    timelineBox.innerHTML = timeline.map((line) => `<div class="bblab-timeline-line">${line}</div>`).join('');

    staleBox.innerHTML = stale
      ? `<div class="bblab-stale-warning">⚠️ STALE READ: AgentC vẫn đang dùng bản cache "${cachedByC}" — KHÔNG biết giá trị thật đã đổi thành "${currentValue}". Nếu AgentC dùng bản cache này để ra quyết định tiếp theo, nó đang hành động dựa trên dữ liệu đã lỗi thời.</div>`
      : `<div class="bblab-stale-ok">✅ Không có stale read trong kịch bản này (ghi bị từ chối nên giá trị không đổi so với lúc AgentC đọc).</div>`;

    stateBox.textContent = JSON.stringify(
      Object.fromEntries(Object.entries(bb.state).map(([k, v]) => [k, { value: v.value, owner: v.owner }])),
      null,
      2
    );
  }

  lockToggle.addEventListener('change', run);
  runBtn.addEventListener('click', run);
  run();
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('blackboard-lab-root');
  if (root) renderBlackboardLab(root);
});
