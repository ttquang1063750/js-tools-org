// Kỹ Thuật Hệ Thống AI — Series 18, Track B (Bài 10–12)
// Engine điều phối nhiều "agent vai trò" (rule-based, tất định) giao tiếp qua 1
// message bus chung. Bài 11 sẽ thêm Blackboard, Bài 12 thêm deadlock/circuit-breaker
// — cả hai đều mở rộng CHÍNH file này, không tạo file riêng (xem check-lesson.md PHẦN A #6).

export class MessageBus {
  constructor() {
    this.log = [];
  }
  send(from, to, content) {
    const msg = { id: this.log.length, from, to, content };
    this.log.push(msg);
    return msg;
  }
  history() {
    return this.log;
  }
  clear() {
    this.log = [];
  }
}

export function definePlanner() {
  return {
    name: 'Planner',
    respond: (task) =>
      `Kế hoạch cho "${task}": (1) viết thân hàm xử lý logic chính, (2) thêm validate kiểu dữ liệu đầu vào.`,
  };
}

// Cố ý mô phỏng Coder "quên" validate input ở lần viết đầu tiên, để Critic có lý do
// từ chối và tạo ra 1 vòng phản hồi (feedback loop) thực sự quan sát được trong demo.
export function defineCoder() {
  let attempt = 0;
  return {
    name: 'Coder',
    respond: () => {
      attempt++;
      if (attempt === 1) {
        return 'function add(a, b) {\n  return a + b;\n}';
      }
      return (
        'function add(a, b) {\n' +
        "  if (typeof a !== 'number' || typeof b !== 'number') throw new Error('invalid input');\n" +
        '  return a + b;\n' +
        '}'
      );
    },
  };
}

export function defineCritic() {
  return {
    name: 'Critic',
    respond: (code) => {
      const hasValidation = /typeof|instanceof|throw/.test(code);
      return hasValidation
        ? '✅ Duyệt: code đã có validate input, đạt yêu cầu.'
        : '❌ Từ chối: thiếu validate kiểu dữ liệu cho tham số a/b — Coder cần sửa lại.';
    },
  };
}

// routingMode: "centralized" (mọi message đi qua "orchestrator" trung gian, tốn gấp
// đôi số message) vs "decentralized" (agent gửi thẳng cho nhau) — xem mục 3.
export function runMultiAgentRound(bus, { planner, coder, critic }, task, routingMode) {
  const steps = [];

  function relay(from, to, content) {
    if (routingMode === 'centralized') {
      bus.send(from, 'Orchestrator', content);
      bus.send('Orchestrator', to, content);
    } else {
      bus.send(from, to, content);
    }
  }

  const plan = planner.respond(task);
  relay(planner.name, coder.name, plan);
  steps.push({ agent: planner.name, output: plan });

  let code = coder.respond(plan);
  relay(coder.name, critic.name, code);
  steps.push({ agent: coder.name, output: code });

  let review = critic.respond(code);
  relay(critic.name, coder.name, review);
  steps.push({ agent: critic.name, output: review });

  if (review.startsWith('❌')) {
    code = coder.respond(review);
    relay(coder.name, critic.name, code);
    steps.push({ agent: coder.name, output: code });

    review = critic.respond(code);
    relay(critic.name, coder.name, review);
    steps.push({ agent: critic.name, output: review });
  }

  return steps;
}

// ───────────────────────── Bài 11: Blackboard Pattern & Shared State ─────────────────────────

// Không gian trạng thái CHUNG mọi agent cùng đọc/ghi — khác message passing (Bài 10)
// ở chỗ agent không cần biết TÊN của agent khác, chỉ cần biết TÊN KEY cần đọc/ghi.
export class Blackboard {
  constructor() {
    this.state = {};
    this.locks = new Set();
    this.log = [];
  }
  read(key) {
    const entry = this.state[key];
    this.log.push({ type: 'read', key, value: entry ? entry.value : undefined });
    return entry ? entry.value : undefined;
  }
  // requireLock=true mô phỏng chiến lược "khoá trước khi ghi" — chặn race condition
  // bằng cách từ chối ghi đè nếu key đang bị agent KHÁC khoá.
  write(agentName, key, value, { requireLock = false } = {}) {
    const existing = this.state[key];
    if (requireLock && this.locks.has(key) && existing && existing.owner !== agentName) {
      this.log.push({
        type: 'write-rejected',
        agent: agentName,
        key,
        reason: `Key "${key}" đang bị khoá bởi ${existing.owner}`,
      });
      return { accepted: false, reason: `Key "${key}" đang bị khoá bởi ${existing.owner}` };
    }
    const overwroteAgent = existing && existing.owner !== agentName ? existing.owner : null;
    this.state[key] = { value, owner: agentName };
    if (requireLock) this.locks.add(key);
    this.log.push({ type: 'write', agent: agentName, key, value, overwroteAgent });
    return { accepted: true, overwroteAgent };
  }
  releaseLock(key) {
    this.locks.delete(key);
  }
}

// ───────────────────────── Bài 12: Deadlock, Livelock & Circuit Breaker ─────────────────────────

// Phát hiện DEADLOCK: dựng đồ thị "chờ ai" (waitForGraph: agent -> agent nó đang chờ)
// rồi tìm chu trình — nếu A chờ B và B chờ A (trực tiếp hoặc qua chuỗi dài hơn), đó
// chính là deadlock kinh điển. Đây là kỹ thuật thật (wait-for graph cycle detection).
export function detectDeadlock(waitForGraph) {
  for (const start of Object.keys(waitForGraph)) {
    const path = [start];
    let current = start;
    while (waitForGraph[current]) {
      current = waitForGraph[current];
      if (current === start) return { deadlock: true, cycle: [...path, current] };
      if (path.includes(current)) break; // chu trình không chứa "start" -> không phải deadlock của start
      path.push(current);
    }
  }
  return { deadlock: false, cycle: null };
}

// Phát hiện LIVELOCK bằng phương pháp KHÁC HẲN deadlock: không dò đồ thị chờ (vì
// livelock không có ai thực sự "bị khoá") mà theo dõi TIẾN ĐỘ thật qua nhiều bước —
// nếu tiến độ không đổi suốt 1 cửa sổ thời gian dù các agent vẫn "hoạt động", nghi
// ngờ livelock (các agent liên tục nhường nhau mà không ai tiến lên).
export function checkLivelock(progressHistory, windowSize = 4) {
  if (progressHistory.length < windowSize) return false;
  const recent = progressHistory.slice(-windowSize);
  return recent.every((p) => p === recent[0]);
}

export class LockManager {
  constructor() {
    this.locks = new Map(); // resource -> agent đang giữ
  }
  request(agent, resource) {
    const holder = this.locks.get(resource);
    if (!holder || holder === agent) {
      this.locks.set(resource, agent);
      return { granted: true };
    }
    return { granted: false, holder };
  }
  release(agent, resource) {
    if (this.locks.get(resource) === agent) this.locks.delete(resource);
  }
  // Circuit-breaker: phá vỡ deadlock/livelock bằng cách CƯỠNG CHẾ giải phóng lock của
  // 1 agent (thường là agent chờ lâu nhất) để bên còn lại có thể tiếp tục.
  forceRelease(resource) {
    this.locks.delete(resource);
  }
}
