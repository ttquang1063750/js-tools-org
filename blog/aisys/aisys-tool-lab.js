// Bài 7 — Tool-Calling: Thiết Kế Interface Tool
// Wiring DOM cho demo "Tool Registry Playground". Logic thật (ToolRegistry, validate,
// safeCalculate) nằm trong aisys-agent-kernel.js — file dùng chung cho cả Track C.
import { defineTool, ToolRegistry, safeCalculate, ToolValidationError } from './aisys-agent-kernel.js';

const DICTIONARY = {
  entropy: 'Đại lượng đo độ bất định/hỗn loạn của một hệ thống hoặc phân bố xác suất.',
  gradient: 'Vector chỉ hướng tăng nhanh nhất của một hàm số — dùng để cập nhật trọng số trong huấn luyện.',
  checkpoint: 'Bản lưu trạng thái model/optimizer tại một thời điểm, dùng để phục hồi khi có sự cố.',
  canary: 'Kỹ thuật triển khai dần cho một phần nhỏ traffic trước khi rollout toàn bộ.',
  dedup: 'Khử trùng lặp — loại bỏ tài liệu trùng/gần trùng khỏi tập dữ liệu.',
};

export function createDemoRegistry() {
  const registry = new ToolRegistry();

  registry.register(
    defineTool({
      name: 'calculator',
      description: 'Tính biểu thức số học cơ bản (+ - * / và dấu ngoặc)',
      schema: {
        type: 'object',
        required: ['expression'],
        properties: { expression: { type: 'string', pattern: '^[0-9+\\-*/(). ]+$' } },
      },
      execute: (args) => safeCalculate(args.expression),
    })
  );

  registry.register(
    defineTool({
      name: 'dictionary',
      description: 'Tra định nghĩa 1 thuật ngữ trong danh sách thuật ngữ series này',
      schema: {
        type: 'object',
        required: ['term'],
        properties: { term: { type: 'string', pattern: '^[a-zA-Zà-ỹ ]+$' } },
      },
      execute: (args) => DICTIONARY[args.term.trim().toLowerCase()] || `Không tìm thấy định nghĩa cho "${args.term}".`,
    })
  );

  return registry;
}

const PRESETS = [
  { label: 'Máy tính: 15 * 23', tool: 'calculator', value: '15 * 23' },
  { label: 'Máy tính: (8 + 2) / 5', tool: 'calculator', value: '(8 + 2) / 5' },
  { label: 'Từ điển: entropy', tool: 'dictionary', value: 'entropy' },
  { label: 'Từ điển: canary', tool: 'dictionary', value: 'canary' },
  { label: "🧪 Thử tấn công: require('fs')", tool: 'calculator', value: "1); require('fs').readFileSync('/etc/passwd" },
];

export function renderToolLab(root) {
  const registry = createDemoRegistry();

  const toolSelect = root.querySelector('.tool-lab-select');
  const argInput = root.querySelector('.tool-lab-arg');
  const runBtn = root.querySelector('.tool-lab-run');
  const resultBox = root.querySelector('.tool-lab-result');
  const schemaBox = root.querySelector('.tool-lab-schema');
  const presetsBox = root.querySelector('.tool-lab-presets');
  const registryList = root.querySelector('.tool-lab-registry-list');

  function updateSchemaPreview() {
    const tool = registry.get(toolSelect.value);
    schemaBox.textContent = JSON.stringify(tool.schema, null, 2);
  }

  function runTool() {
    const toolName = toolSelect.value;
    const argKey = toolName === 'calculator' ? 'expression' : 'term';
    try {
      const result = registry.execute(toolName, { [argKey]: argInput.value });
      resultBox.innerHTML = `<span class="tool-lab-result__ok">✅ Kết quả:</span> ${result}`;
    } catch (err) {
      const isValidation = err instanceof ToolValidationError;
      resultBox.innerHTML = `<span class="tool-lab-result__err">${isValidation ? '🛑 Validation/Sandbox từ chối:' : '⚠️ Lỗi:'}</span> ${err.message}`;
    }
  }

  registryList.innerHTML = registry
    .list()
    .map((t) => `<li><strong>${t.name}</strong> — ${t.description}</li>`)
    .join('');

  presetsBox.innerHTML = '';
  PRESETS.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tool-lab-preset-btn';
    btn.textContent = p.label;
    btn.addEventListener('click', () => {
      toolSelect.value = p.tool;
      argInput.value = p.value;
      updateSchemaPreview();
      runTool();
    });
    presetsBox.appendChild(btn);
  });

  toolSelect.addEventListener('change', updateSchemaPreview);
  runBtn.addEventListener('click', runTool);

  updateSchemaPreview();
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('tool-lab-root');
  if (root) renderToolLab(root);
});
