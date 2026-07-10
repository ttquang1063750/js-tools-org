// q_learning_gridworld.js — Tabular Q-learning trên gridworld 5×5 có bẫy
// Bài 17: Học tăng cường: Q-learning
// js-tools.org/blog/ai/ai-q-learning
//
// Cách chạy self-test (cần Node.js):
//   node q_learning_gridworld.js
// Kỳ vọng in ra: "SELF-TEST PASS (N checks)"

// ---------------------------------------------------------------------------
// Gridworld 5x5:  S . . . .        S=(0,0) start
//                 . . . . .        G=(4,4) goal, reward +10, terminal
//                 . . T . .        T=(2,2) trap, reward -10, terminal
//                 . . . . .        mọi bước khác: reward -1 (ép tìm đường NGẮN nhất)
//                 . . . . G
// Actions: 0=lên 1=xuống 2=trái 3=phải
// ---------------------------------------------------------------------------
const SIZE = 5;
const GOAL = [4, 4];
const TRAP = [2, 2];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function step(state, action) {
  let [r, c] = state;
  if (action === 0) r = Math.max(0, r - 1);
  else if (action === 1) r = Math.min(SIZE - 1, r + 1);
  else if (action === 2) c = Math.max(0, c - 1);
  else if (action === 3) c = Math.min(SIZE - 1, c + 1);
  const next = [r, c];
  if (r === GOAL[0] && c === GOAL[1]) return { next, reward: 10, done: true };
  if (r === TRAP[0] && c === TRAP[1]) return { next, reward: -10, done: true };
  return { next, reward: -1, done: false };
}
function key(s) {
  return s[0] * SIZE + s[1];
}

// Bảng Q lưu dưới dạng Map: key ô -> [Q(lên), Q(xuống), Q(trái), Q(phải)].
// Cập nhật đúng phương trình Bellman: Q(s,a) <- Q(s,a) + α[r + γ·max Q(s') - Q(s,a)]
function trainQLearning({ episodes, alpha, gamma, epsilonStart, epsilonMin, epsilonDecay, maxStepsPerEp, seed }) {
  const rng = mulberry32(seed);
  const Q = new Map();
  function getQ(s) {
    const k = key(s);
    if (!Q.has(k)) Q.set(k, [0, 0, 0, 0]);
    return Q.get(k);
  }
  let epsilon = epsilonStart;
  for (let ep = 0; ep < episodes; ep++) {
    let state = [0, 0];
    for (let t = 0; t < maxStepsPerEp; t++) {
      const qs = getQ(state);
      let action;
      if (rng() < epsilon) {
        action = Math.floor(rng() * 4); // KHÁM PHÁ (exploration): hành động ngẫu nhiên
      } else {
        let best = 0; // KHAI THÁC (exploitation): hành động Q cao nhất
        for (let a = 1; a < 4; a++) if (qs[a] > qs[best]) best = a;
        action = best;
      }
      const { next, reward, done } = step(state, action);
      const qNext = getQ(next);
      const maxNext = done ? 0 : Math.max(...qNext); // terminal: không còn tương lai
      qs[action] = qs[action] + alpha * (reward + gamma * maxNext - qs[action]);
      state = next;
      if (done) break;
    }
    epsilon = Math.max(epsilonMin, epsilon * (epsilonDecay ?? 1)); // decay: giảm khám phá dần
  }
  return Q;
}

function greedyPath(Q, maxSteps) {
  let state = [0, 0];
  const path = [state];
  for (let t = 0; t < maxSteps; t++) {
    const qs = Q.get(key(state)) || [0, 0, 0, 0];
    let best = 0;
    for (let a = 1; a < 4; a++) if (qs[a] > qs[best]) best = a;
    const { next, done } = step(state, best);
    path.push(next);
    state = next;
    if (done) break;
    if (next[0] === TRAP[0] && next[1] === TRAP[1]) break;
  }
  return path;
}
function greedyReaches(Q, maxSteps) {
  const path = greedyPath(Q, maxSteps);
  const last = path[path.length - 1];
  return last[0] === GOAL[0] && last[1] === GOAL[1];
}

// ---------------------------------------------------------------------------
// Self-test
// ---------------------------------------------------------------------------
let errors = 0;
let checks = 0;
function check(name, cond, detail) {
  checks++;
  if (!cond) {
    console.log('LOI', name, detail !== undefined ? detail : '');
    errors++;
  }
}

// Train với seed cố định — verify hội tụ đúng đường tối ưu 8 bước, tránh bẫy
{
  const Q = trainQLearning({
    episodes: 500,
    alpha: 0.1,
    gamma: 0.9,
    epsilonStart: 1.0,
    epsilonMin: 0.05,
    epsilonDecay: 0.98,
    maxStepsPerEp: 100,
    seed: 42,
  });
  const path = greedyPath(Q, 20);
  check('toi duoc goal', greedyReaches(Q, 20));
  check('dung duong toi uu (8 buoc, 9 o)', path.length === 9, 'got ' + path.length + ' o');
  check('khong di qua bay', !path.some((p) => p[0] === TRAP[0] && p[1] === TRAP[1]));
}

// Ổn định qua nhiều seed khác nhau (không phải may mắn 1 lần)
{
  let ok = 0;
  for (let seed = 1; seed <= 10; seed++) {
    const Q = trainQLearning({
      episodes: 500,
      alpha: 0.1,
      gamma: 0.9,
      epsilonStart: 1.0,
      epsilonMin: 0.05,
      epsilonDecay: 0.98,
      maxStepsPerEp: 100,
      seed,
    });
    const path = greedyPath(Q, 20);
    if (greedyReaches(Q, 20) && path.length === 9) ok++;
  }
  check('hoi tu on dinh tren 10 seed khac nhau', ok >= 8, ok + '/10');
}

// Pitfall: budget CỐ ĐỊNH 40 episode — epsilon=0 thất bại hoàn toàn, epsilon=0.2 thành công đáng kể
{
  const BUDGET = 40;
  const results = {};
  for (const epsilon of [0, 0.2]) {
    let ok = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const Q = trainQLearning({
        episodes: BUDGET,
        alpha: 0.1,
        gamma: 0.9,
        epsilonStart: epsilon,
        epsilonMin: epsilon,
        epsilonDecay: 1,
        maxStepsPerEp: 100,
        seed,
      });
      if (greedyReaches(Q, 20)) ok++;
    }
    results[epsilon] = ok;
  }
  console.log(`Budget=${BUDGET} episode: epsilon=0 -> ${results[0]}/20 seed; epsilon=0.2 -> ${results[0.2]}/20 seed`);
  check('epsilon=0 that bai hoan toan trong budget nho', results[0] === 0, results[0] + '/20');
  check('epsilon=0.2 thanh cong dang ke cung budget', results[0.2] >= 4, results[0.2] + '/20');
}

console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');

export { trainQLearning, greedyPath, step, SIZE, GOAL, TRAP };
