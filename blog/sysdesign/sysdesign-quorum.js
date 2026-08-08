/**
 * sysdesign-quorum.js — simulates read/write quorums and how last-write-wins loses data.
 * Used by Lesson 9 (CAP & Consistency Models) of Series 20.
 *
 * NO DOM dependency: run it directly with `node sysdesign-quorum.js` to print every figure
 * used in the lesson. All the numbers in Lesson 9 sections 9.4 and 9.5 come from this file.
 *
 * Three things this file demonstrates numerically:
 *   1. Why R + W > N is a SUFFICIENT condition for the read set and write set to overlap.
 *   2. What read-repair does: it does not reduce the stale-read rate immediately, it makes
 *      the divergence CONVERGE.
 *   3. Why last-write-wins loses data when two machines' clocks are skewed.
 */

'use strict';

// ---------------------------------------------------------------------------
// Deterministic RNG: same seed, same result, so the lesson's numbers reproduce.
// ---------------------------------------------------------------------------
function makeRng(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// 1. Quorum: do the read set and the write set overlap or not
// ---------------------------------------------------------------------------

/**
 * Pick `k` distinct nodes at random out of `n`.
 *
 * This is the easily missed point: the client CANNOT choose which nodes hold the fresh
 * data. It only picks `k` arbitrary nodes and hopes at least one of them already has it.
 */
function pickNodes(n, k, rng) {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, k);
}

/**
 * Simulation: each round writes to W nodes then immediately reads from R nodes, counting
 * how many reads do NOT see the newest version. This is the measurement for R + W > N.
 *
 * A note on `readRepair` in this function: it improves NOTHING here, and that is correct
 * rather than a bug. Because every round issues a new write, repairing nodes to an older
 * version does not help the next round. Read-repair's real effect is in
 * `simulateConvergence` below.
 */
function simulateQuorum({ n, w, r, rounds = 100000, seed = 42, readRepair = false }) {
  const rng = makeRng(seed);
  // version[i] = the newest version node i is currently holding.
  const version = new Array(n).fill(0);
  let staleReads = 0;

  for (let round = 1; round <= rounds; round++) {
    // WRITE: pick W nodes and set version = round.
    for (const i of pickNodes(n, w, rng)) version[i] = round;

    // READ: pick R nodes and take the HIGHEST version among them (this is how a quorum
    // read resolves conflicts: the higher version wins).
    const readSet = pickNodes(n, r, rng);
    let best = -1;
    for (const i of readSet) best = Math.max(best, version[i]);

    if (best < round) staleReads++;
    if (readRepair) for (const i of readSet) version[i] = Math.max(version[i], best);
  }

  return {
    n,
    w,
    r,
    condition: `R + W = ${r + w} ${r + w > n ? '>' : '<='} N = ${n}`,
    guaranteesOverlap: r + w > n,
    staleReads,
    staleRatio: staleReads / rounds,
  };
}

/**
 * Write ONCE to W nodes, then read `reads` times in a row. Returns the stale-read rate per
 * read index, so you can see whether it DECREASES or not.
 *
 * This is where read-repair shows its effect: every read that finds a node holding the
 * fresh version writes it across to the stale nodes in the same read set. After enough
 * reads, every node is fresh. WITHOUT read-repair the stale rate stays put forever — which
 * is what it means for an "eventual consistency" system to never actually be eventual.
 */
function simulateConvergence({ n, w, r, reads = 40, trials = 20000, seed = 7, readRepair = false }) {
  const rng = makeRng(seed);
  const buckets = new Array(reads).fill(0);
  for (let t = 0; t < trials; t++) {
    const version = new Array(n).fill(0);
    for (const i of pickNodes(n, w, rng)) version[i] = 1; // exactly ONE write
    for (let k = 0; k < reads; k++) {
      const readSet = pickNodes(n, r, rng);
      let best = 0;
      for (const i of readSet) best = Math.max(best, version[i]);
      if (best < 1) buckets[k]++;
      if (readRepair) for (const i of readSet) version[i] = Math.max(version[i], best);
    }
  }
  return buckets.map((c) => c / trials);
}

// ---------------------------------------------------------------------------
// 2. Last-write-wins loses data when clocks are skewed
// ---------------------------------------------------------------------------

/**
 * Two clients write to the same key at almost the same moment, on two different nodes.
 * The node decides "who wins" using the timestamp the CLIENT sent up — that is LWW.
 *
 * The problem: two machines' wall clocks never agree exactly. If client B writes AFTER
 * client A but B's clock is behind, then B's timestamp is lower — and B's write is
 * silently dropped. No error, no log, nobody knows.
 */
function lastWriteWins({ clockSkewMs }) {
  // The REAL moment (by an imaginary perfect clock), in ms.
  const realTimeA = 1000;
  const realTimeB = 1050; // B writes exactly 50 ms AFTER A

  // But each client stamps using ITS OWN clock.
  const stampA = realTimeA + 0;
  const stampB = realTimeB + clockSkewMs; // B's clock is skewed

  const writes = [
    { client: 'A', value: 'balance = 100', realTime: realTimeA, stamp: stampA },
    { client: 'B', value: 'balance = 150', realTime: realTimeB, stamp: stampB },
  ];

  // LWW: the version with the HIGHEST timestamp wins.
  const winner = writes.reduce((a, b) => (b.stamp > a.stamp ? b : a));
  // What causality actually requires: the write that happened LATER in real time wins.
  const shouldWin = writes.reduce((a, b) => (b.realTime > a.realTime ? b : a));

  return {
    clockSkewMs,
    stampA,
    stampB,
    lwwWinner: winner.client,
    correctWinner: shouldWin.client,
    lostWrite: winner.client !== shouldWin.client,
    lostValue: winner.client !== shouldWin.client ? shouldWin.value : null,
  };
}

// ---------------------------------------------------------------------------
// Run directly: print every figure used in Lesson 9
// ---------------------------------------------------------------------------
function main() {
  console.log('=== 9.4 · Quorum R + W > N, N = 3, 100,000 rounds ===');
  console.log('N  W  R  condition           stale reads');
  const configs = [
    { n: 3, w: 1, r: 1 },
    { n: 3, w: 1, r: 2 },
    { n: 3, w: 2, r: 1 },
    { n: 3, w: 2, r: 2 },
    { n: 3, w: 3, r: 1 },
    { n: 3, w: 1, r: 3 },
    { n: 5, w: 2, r: 2 },
    { n: 5, w: 3, r: 3 },
  ];
  for (const c of configs) {
    const res = simulateQuorum(c);
    console.log(
      `${res.n}  ${res.w}  ${res.r}  ${res.condition.padEnd(18)} ${String(res.staleReads).padStart(7)}` +
        `  (${(res.staleRatio * 100).toFixed(2)}%)`
    );
  }

  console.log();
  console.log('=== 9.4 · What read-repair does: N=3, W=1, R=2, write ONCE then read 40 times ===');
  console.log('    (R must be >= 2 to have any effect: a read set of one node has nothing to repair)');
  console.log('    (stale-read rate at read number 1, 2, 5, 10, 20, 40)');
  for (const rr of [false, true]) {
    const b = simulateConvergence({ n: 3, w: 1, r: 2, reads: 40, readRepair: rr });
    const at = [0, 1, 4, 9, 19, 39].map((i) => (b[i] * 100).toFixed(1) + '%');
    console.log(`  read-repair OFF: ${at.join('  ')}`.replace('OFF:', rr ? 'ON :' : 'OFF:'));
  }

  console.log();
  console.log('=== 9.5 · Last-write-wins with a skewed clock ===');
  console.log('skew (ms)  stampA  stampB  LWW picks  should have picked  data lost?');
  for (const skew of [0, -20, -50, -80, -200]) {
    const r = lastWriteWins({ clockSkewMs: skew });
    console.log(
      String(r.clockSkewMs).padStart(9),
      String(r.stampA).padStart(7),
      String(r.stampB).padStart(7),
      r.lwwWinner.padStart(10),
      r.correctWinner.padStart(19),
      '  ' + (r.lostWrite ? 'YES — lost "' + r.lostValue + '"' : 'no')
    );
  }
}

// Run main when invoked directly by node, but not when imported into a web page.
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  main();
}

if (typeof module !== 'undefined') {
  module.exports = { simulateQuorum, lastWriteWins, pickNodes, makeRng };
}
