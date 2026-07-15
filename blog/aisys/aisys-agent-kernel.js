// Kỹ Thuật Hệ Thống AI — Series 18, Track C (Bài 7–9)
// Engine dùng chung, KHÔNG chứa code DOM — mỗi bài có file "*-lab.js" riêng import
// từ đây để wiring giao diện demo của chính bài đó (xem check-lesson.md PHẦN A #6).
// Bài 7 thêm Tool/ToolRegistry. Bài 8 thêm Memory/PromptTemplate. Bài 9 thêm Agent +
// vòng lặp ReAct (dùng chung "bộ não" quyết định trong aisys-mock-llm.js).

import { mockDecide } from './aisys-mock-llm.js';

// ───────────────────────── Bài 7: Tool-Calling ─────────────────────────

export class ToolValidationError extends Error {}

export function defineTool({ name, description, schema, execute }) {
  return { name, description, schema, execute };
}

export function validateArgs(schema, args) {
  for (const key of schema.required || []) {
    if (!(key in args)) throw new ToolValidationError(`Thiếu tham số bắt buộc: "${key}"`);
  }
  for (const [key, value] of Object.entries(args)) {
    const propSchema = schema.properties && schema.properties[key];
    if (!propSchema) throw new ToolValidationError(`Tham số không được khai báo trong schema: "${key}"`);
    if (propSchema.type === 'string' && typeof value !== 'string') {
      throw new ToolValidationError(`Tham số "${key}" phải là chuỗi (string)`);
    }
    if (propSchema.pattern && !new RegExp(propSchema.pattern).test(value)) {
      throw new ToolValidationError(
        `Tham số "${key}" chứa ký tự không hợp lệ (vi phạm sandbox pattern: ${propSchema.pattern})`
      );
    }
  }
}

export class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }
  register(tool) {
    this.tools.set(tool.name, tool);
  }
  get(name) {
    return this.tools.get(name);
  }
  list() {
    return [...this.tools.values()];
  }
  execute(name, args) {
    const tool = this.get(name);
    if (!tool) throw new ToolValidationError(`Không tìm thấy tool đã đăng ký: "${name}"`);
    validateArgs(tool.schema, args);
    return tool.execute(args);
  }
}

// Bộ tính toán AN TOÀN — recursive-descent parser thủ công, KHÔNG dùng eval()/Function()
// nên dù input có lọt qua bước validate schema, vẫn không thể thực thi mã tuỳ ý.
export function safeCalculate(expression) {
  const s = expression.replace(/\s+/g, '');
  let pos = 0;

  function peek() {
    return s[pos];
  }
  function consume(ch) {
    if (s[pos] !== ch) throw new Error(`Kỳ vọng '${ch}' tại vị trí ${pos}`);
    pos++;
  }
  function parseNumber() {
    const start = pos;
    while (pos < s.length && /[0-9.]/.test(s[pos])) pos++;
    if (pos === start) throw new Error(`Kỳ vọng số tại vị trí ${pos}`);
    return parseFloat(s.slice(start, pos));
  }
  function parseFactor() {
    if (peek() === '(') {
      consume('(');
      const value = parseExpr();
      consume(')');
      return value;
    }
    if (peek() === '-') {
      consume('-');
      return -parseFactor();
    }
    return parseNumber();
  }
  function parseTerm() {
    let value = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = peek();
      consume(op);
      const rhs = parseFactor();
      value = op === '*' ? value * rhs : value / rhs;
    }
    return value;
  }
  function parseExpr() {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = peek();
      consume(op);
      const rhs = parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  if (s.length === 0) throw new Error('Biểu thức rỗng');
  const result = parseExpr();
  if (pos !== s.length) throw new Error(`Ký tự thừa tại vị trí ${pos}`);
  return result;
}

// ───────────────────────── Bài 8: Memory & Prompt Template ─────────────────────────

export class ShortTermMemory {
  constructor(maxTurns = 3) {
    this.maxTurns = maxTurns; // số LƯỢT (1 lượt = 1 cặp user+agent), không phải số dòng
    this.turns = [];
  }
  add(role, content) {
    this.turns.push({ role, content });
    const maxMessages = this.maxTurns * 2;
    while (this.turns.length > maxMessages) {
      this.turns.shift(); // cắt bớt (truncate) tin nhắn CŨ NHẤT trước tiên
    }
  }
  getContext() {
    return this.turns.map((t) => `${t.role}: ${t.content}`).join('\n');
  }
}

// Mô phỏng "vector recall" bằng so khớp từ khoá (KHÔNG phải embedding/similarity
// search thật) — đủ để dạy đúng Ý TƯỞNG recall mà không cần model embedding.
export class LongTermMemory {
  constructor() {
    this.records = [];
  }
  remember(text) {
    const keywords = new Set(
      text
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2)
    );
    this.records.push({ text, keywords });
  }
  recall(query, topK = 2) {
    const queryWords = new Set(
      query
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2)
    );
    return this.records
      .map((r) => {
        let overlap = 0;
        for (const w of queryWords) if (r.keywords.has(w)) overlap++;
        return { text: r.text, score: overlap };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

// Escape để chống "prompt injection qua biến" — biến người dùng nhập không được
// phép chèn cú pháp điều khiển prompt như "### System:" để giả lập vai trò mới.
export function escapeForPrompt(text) {
  return text.replace(/\n/g, ' ').replace(/#{2,}/g, (m) => '#​' + m.slice(1)); // chèn zero-width space phá cú pháp "##.."
}

export class PromptTemplate {
  constructor(template) {
    this.template = template;
  }
  render(vars, { escape = true } = {}) {
    return this.template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (!(key in vars)) throw new Error(`Thiếu biến template: "${key}"`);
      const raw = String(vars[key]);
      return escape ? escapeForPrompt(raw) : raw;
    });
  }
}

// ───────────────────────── Bài 9: Agent & ReAct Loop ─────────────────────────

export class Agent {
  constructor({ toolRegistry, maxSteps = 4 }) {
    this.toolRegistry = toolRegistry;
    this.maxSteps = maxSteps;
  }

  // callbacks: onThought/onAction/onObservation/onError/onFinish — mô phỏng
  // event emitter cho streaming (mỗi callback là 1 "token/sự kiện" phát ra ngay
  // khi có, thay vì đợi toàn bộ vòng lặp chạy xong mới trả về 1 cục).
  run(userQuery, callbacks = {}) {
    const { onThought, onAction, onObservation, onError, onFinish } = callbacks;
    const toolNames = this.toolRegistry.list().map((t) => t.name);
    let step = 0;
    let retriedThisStep = false;

    while (step < this.maxSteps) {
      const decision = mockDecide(userQuery, toolNames);
      onThought && onThought(decision.thought, step);

      if (!decision.action) {
        onFinish && onFinish(decision.finalAnswer, step);
        return { finalAnswer: decision.finalAnswer, steps: step + 1 };
      }

      onAction && onAction(decision.action, step);
      try {
        const observation = this.toolRegistry.execute(decision.action.tool, decision.action.args);
        onObservation && onObservation(observation, step);
        const finalAnswer = `Kết quả: ${observation}`;
        onFinish && onFinish(finalAnswer, step);
        return { finalAnswer, steps: step + 1 };
      } catch (err) {
        onError && onError(err, step);
        if (retriedThisStep) {
          const giveUpMsg = `Đã thử lại nhưng vẫn lỗi ("${err.message}") — dừng lại, không lặp vô hạn.`;
          onFinish && onFinish(giveUpMsg, step);
          return { finalAnswer: giveUpMsg, steps: step + 1 };
        }
        retriedThisStep = true; // cho phép retry đúng 1 lần rồi bỏ cuộc (backoff đơn giản)
        step++;
      }
    }
    const timeoutMsg = 'Đã đạt giới hạn số bước tối đa — dừng lại để tránh vòng lặp vô hạn.';
    onFinish && onFinish(timeoutMsg, step);
    return { finalAnswer: timeoutMsg, steps: step };
  }
}
