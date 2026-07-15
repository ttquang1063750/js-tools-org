// Bài 9 — ReAct Loop, Callback & Streaming
// Wiring DOM cho demo "ReAct Runtime" — dùng lại NGUYÊN VẸN ToolRegistry (Bài 7) và
// Agent (mới thêm ở aisys-agent-kernel.js) — không viết lại logic nào.
import { Agent } from './aisys-agent-kernel.js';
import { createDemoRegistry } from './aisys-tool-lab.js';

const PRESETS = [
  { label: '✅ Tính toán thành công', query: '127 * 8 bằng bao nhiêu?' },
  { label: '✅ Tra từ điển thành công', query: 'định nghĩa của checkpoint là gì?' },
  { label: '✅ Trả lời trực tiếp (không cần tool)', query: 'Bạn khoẻ không?' },
  { label: '🧪 Bơm lỗi: biểu thức sai cú pháp', query: '5 + (3 nhân với gì đó' },
];

function appendLogLine(logEl, cssClass, html) {
  const line = document.createElement('div');
  line.className = `react-lab-log-line ${cssClass}`;
  line.innerHTML = html;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

export function renderReactLab(root) {
  const registry = createDemoRegistry();
  const agent = new Agent({ toolRegistry: registry, maxSteps: 4 });

  const presetsBox = root.querySelector('.react-lab-presets');
  const logEl = root.querySelector('.react-lab-log');
  const finalBox = root.querySelector('.react-lab-final');
  const stepCounter = root.querySelector('.react-lab-step-counter');

  function runQuery(query) {
    logEl.innerHTML = '';
    finalBox.textContent = '';
    stepCounter.textContent = 'Đang chạy...';
    appendLogLine(logEl, 'react-lab-log-line--query', `<strong>Câu hỏi:</strong> ${query}`);

    const result = agent.run(query, {
      onThought: (thought, step) =>
        appendLogLine(logEl, 'react-lab-log-line--thought', `<strong>[Bước ${step}] 🤔 Thought:</strong> ${thought}`),
      onAction: (action, step) =>
        appendLogLine(
          logEl,
          'react-lab-log-line--action',
          `<strong>[Bước ${step}] ⚡ Action:</strong> ${action.tool}(${JSON.stringify(action.args)})`
        ),
      onObservation: (obs, step) =>
        appendLogLine(
          logEl,
          'react-lab-log-line--observation',
          `<strong>[Bước ${step}] 👁️ Observation:</strong> ${obs}`
        ),
      onError: (err, step) =>
        appendLogLine(
          logEl,
          'react-lab-log-line--error',
          `<strong>[Bước ${step}] ⚠️ Error (sẽ retry 1 lần):</strong> ${err.message}`
        ),
      onFinish: () => {},
    });

    finalBox.textContent = result.finalAnswer;
    stepCounter.textContent = `Hoàn thành sau ${result.steps} bước (giới hạn tối đa: ${agent.maxSteps} bước).`;
  }

  PRESETS.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'react-lab-preset-btn';
    btn.textContent = p.label;
    btn.addEventListener('click', () => runQuery(p.query));
    presetsBox.appendChild(btn);
  });

  runQuery(PRESETS[0].query);
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('react-lab-root');
  if (root) renderReactLab(root);
});
