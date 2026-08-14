// cpu-core.js - "CPUJS": a minimal, entirely hand-written computer-architecture
// library, built up lesson by lesson through Series 15 (Computer Architecture:
// From Logic to Quantum). Same discipline as dsp-core.js (Series 14), vmcu.js
// (Series 13) and ai-neuro.js (Series 12) - verify with real numbers before
// writing: every function below has a self-test at the end of the file, run
//
// The rule: EVERY number appearing in a lesson (ALU results, status flags,
// pipeline latency, AMAT, quantum probabilities...) must be produced and checked
// by this engine FIRST, then copied into the prose or quiz - never invented.
//
// Lesson 1 - From logic gates to the ALU. Build-out: half/full adder, a
// ripple-carry adder, a 4-bit ALU (ADD/SUB/AND/OR/XOR) + the 4 status flags.

// ---------------------------------------------------------------------------
// Helpers for N-bit binary representation (4-bit by default for the Lesson 1 demo).
// ---------------------------------------------------------------------------

// The N-bit binary string of a value (taking exactly the low N bits) - e.g.
// toBinString(5, 4) === "0101".
function toBinString(value, bits = 4) {
  return (value & ((1 << bits) - 1)).toString(2).padStart(bits, '0');
}

// Interpret N bits as two's complement: the top bit is the sign bit.
// e.g. toSigned(0b1001, 4) === -7 (not 9).
function toSigned(value, bits = 4) {
  const half = 1 << (bits - 1);
  const masked = value & ((1 << bits) - 1);
  return masked >= half ? masked - (1 << bits) : masked;
}

// ---------------------------------------------------------------------------
// Adders - the arithmetic building block of every CPU (Lesson 1, section 2).
// ---------------------------------------------------------------------------

// Half adder: 2 input bits, giving a sum (XOR) and a carry (AND). It has NO
// carry-in so it cannot be chained - only usable for the lowest bit.
function halfAdder(a, b) {
  return { sum: a ^ b, carry: a & b };
}

// Full adder: 3 input bits (a, b, carry-in), giving a sum and a carry-out.
// Chaining N of these in series makes an N-bit ripple-carry adder.
function fullAdder(a, b, cin) {
  const sum = a ^ b ^ cin;
  const cout = (a & b) | (cin & (a ^ b));
  return { sum, cout };
}

// N-bit ripple-carry adder: N full adders chained, the carry rippling from low
// to high. Returns the truncated N-bit result and the final carry-out (unsigned overflow).
function rippleCarryAdd(a, b, cin = 0, bits = 4) {
  let carry = cin;
  let result = 0;
  for (let i = 0; i < bits; i++) {
    const ai = (a >> i) & 1;
    const bi = (b >> i) & 1;
    const { sum, cout } = fullAdder(ai, bi, carry);
    result |= sum << i;
    carry = cout;
  }
  return { result, cout: carry };
}

// ---------------------------------------------------------------------------
// N-bit ALU (Lesson 1, section 3) - takes 2 operands + an opcode, returns the
// result and 4 status flags. This is the "decision" block every branch relies on.
// ---------------------------------------------------------------------------

const ALU_OPS = ['ADD', 'SUB', 'AND', 'OR', 'XOR'];

// Execute one ALU operation on N-bit numbers (4-bit by default). Flags:
//   Z (Zero)     : the result is 0.
//   S (Sign)     : the top bit of the result is 1 (negative in two's complement).
//   C (Carry)    : UNSIGNED overflow - ADD produces a carry-out, SUB a borrow.
//   V (Overflow) : SIGNED (two's complement) overflow - the result has the wrong sign.
// For the logical operations AND/OR/XOR, C and V are always false.
function aluExecute(a, b, op, bits = 4) {
  // Luu y: "1 << 32" trong JS KHONG cho 2^32 - toan tu dich bit chi dung 32-bit
  // va so bit dich duoc lay MOD 32, nen "1 << 32" === "1 << 0" === 1 (bug that
  // neu viet mask = (1<<bits)-1 truc tiep cho bits=32). Tach truong hop bits=32.
  const mask = bits >= 32 ? 0xffffffff : (1 << bits) - 1;
  const signBit = bits >= 32 ? 0x80000000 : 1 << (bits - 1);
  const aM = a & mask;
  const bM = b & mask;
  let result = 0;
  let carry = false;
  let overflow = false;

  if (op === 'ADD') {
    const rc = rippleCarryAdd(aM, bM, 0, bits);
    result = rc.result;
    carry = rc.cout === 1; // carry-out = unsigned overflow
    const sA = aM & signBit;
    const sB = bM & signBit;
    const sR = result & signBit;
    overflow = sA === sB && sA !== sR; // same input signs, different output sign
  } else if (op === 'SUB') {
    // A - B = A + (~B + 1) in two's complement.
    const negB = (~bM + 1) & mask;
    const rc = rippleCarryAdd(aM, negB, 0, bits);
    result = rc.result;
    carry = aM < bM; // borrow: A is less than B (unsigned)
    const sA = aM & signBit;
    const sB = bM & signBit;
    const sR = result & signBit;
    overflow = sA !== sB && sA !== sR; // different input signs, result differs from A's
  } else if (op === 'AND') {
    result = aM & bM;
  } else if (op === 'OR') {
    result = aM | bM;
  } else if (op === 'XOR') {
    result = aM ^ bM;
  } else {
    throw new Error('Invalid ALU op: ' + op);
  }

  return {
    result,
    flags: {
      z: result === 0,
      s: (result & signBit) !== 0,
      c: carry,
      v: overflow,
    },
  };
}

// ---------------------------------------------------------------------------
// Lesson 2 - The Von Neumann architecture & the ISA. A toy CPU: the fetch-
// decode-execute cycle running on ONE shared RAM (`ram`) holding BOTH code and
// data - the Von Neumann principle of section 2.1 (as opposed to Harvard, with
// 2 separate buses and memories). Lesson 1's ALU is REUSED directly for ADD/SUB.
// ---------------------------------------------------------------------------

// Initialise the CPU state: RAM is a copy of `program` (the instruction array at
// low addresses), 4 general-purpose registers R0-R3, the program counter PC, and
// the instruction register IR (holding the instruction just fetched).
function createCpuState(program) {
  return { ram: [...program], regs: [0, 0, 0, 0], pc: 0, ir: null, halted: false, flags: null };
}

// Run EXACTLY one fetch-decode-execute cycle (section 2.2):
//   FETCH   : read the instruction at RAM[PC] into IR.
//   (PC increments by 1 RIGHT AFTER the fetch - BEFORE the instruction is decoded
//    or executed; this is the section 2.2 pitfall: for JMP/BEQ the freshly
//    incremented PC is OVERWRITTEN at execute, and forgetting this order gives
//   DECODE  : switch on `op` to find which registers or addresses are needed.
//   EXECUTE : update the registers, RAM or PC accordingly.
function cpuStep(state) {
  const instr = state.ram[state.pc];
  if (!instr || typeof instr.op !== 'string') {
    throw new Error('Invalid instruction: ' + (instr && instr.op));
  }
  state.ir = instr;
  state.pc = state.pc + 1;
  switch (instr.op) {
    case 'LOADI':
      state.regs[instr.rd] = instr.imm;
      break;
    case 'ADD': {
      const r = aluExecute(state.regs[instr.rs1], state.regs[instr.rs2], 'ADD', 8);
      state.regs[instr.rd] = r.result;
      state.flags = r.flags;
      break;
    }
    case 'SUB': {
      const r = aluExecute(state.regs[instr.rs1], state.regs[instr.rs2], 'SUB', 8);
      state.regs[instr.rd] = r.result;
      state.flags = r.flags;
      break;
    }
    case 'STORE':
      state.ram[instr.addr] = state.regs[instr.rs];
      break;
    case 'LOAD':
      state.regs[instr.rd] = state.ram[instr.addr];
      break;
    case 'JMP':
      state.pc = instr.addr; // OVERWRITE the PC incremented at fetch - an ABSOLUTE jump
      break;
    case 'BEQ':
      if (state.regs[instr.rs1] === state.regs[instr.rs2]) state.pc = instr.addr;
      break;
    case 'HALT':
      state.halted = true;
      break;
    default:
      throw new Error('Invalid instruction: ' + instr.op);
  }
  return state;
}

// Run a whole program until HALT (or until maxSteps, guarding against an infinite
// loop in a faulty program). Returns the final state and the cycle count.
function runProgram(program, maxSteps = 1000) {
  const state = createCpuState(program);
  let steps = 0;
  while (!state.halted && steps < maxSteps) {
    cpuStep(state);
    steps++;
  }
  return { state, steps };
}

// ---------------------------------------------------------------------------
// Lesson 3 - RISC-V assembly (RV32I) & the single-cycle datapath. The Lesson 2
// toy CPU used a MADE-UP mini instruction set (objects {op,...}) - this lesson
// replaces it with the REAL RV32I set, encoded to standard 32-bit words exactly
// as any real RISC-V chip does (sections 3.1-3.2). The executor (section 3.3)
// REUSES Lesson 1's aluExecute() directly for every ADD/SUB/AND/OR/XOR.
// ---------------------------------------------------------------------------

// The 4 standard 7-bit RV32I opcodes used here (REAL values from the RISC-V spec,
// not invented): R-type (ADD/SUB/AND/OR/XOR), I-type ALU (ADDI/ANDI/
// ORI/XORI), I-type LOAD (LW), S-type (SW).
const RV32I_OPCODE = { R: 0b0110011, I_ALU: 0b0010011, I_LOAD: 0b0000011, S: 0b0100011 };

// Lookup table mnemonic -> {type, funct3, funct7} - funct3 and funct7 are the
// "sub-codes" distinguishing instructions that SHARE an opcode (ADD and SUB share
// the R opcode but differ in funct7: 0000000 against 0100000 - bit 30 is the "subtract flag").
const RV32I_MNEMONIC = {
  ADD: { type: 'R', funct3: 0b000, funct7: 0b0000000 },
  SUB: { type: 'R', funct3: 0b000, funct7: 0b0100000 },
  AND: { type: 'R', funct3: 0b111, funct7: 0b0000000 },
  OR: { type: 'R', funct3: 0b110, funct7: 0b0000000 },
  XOR: { type: 'R', funct3: 0b100, funct7: 0b0000000 },
  ADDI: { type: 'I', funct3: 0b000 },
  ANDI: { type: 'I', funct3: 0b111 },
  ORI: { type: 'I', funct3: 0b110 },
  XORI: { type: 'I', funct3: 0b100 },
  LW: { type: 'ILOAD', funct3: 0b010 },
  SW: { type: 'S', funct3: 0b010 },
};

// The matching ALU mnemonic passed to aluExecute() (Lesson 1) - ADDI/ANDI/ORI/XORI
// are just ADD/AND/OR/XOR with an IMMEDIATE as the second operand instead of a register.
const RV32I_ALU_OP = {
  ADD: 'ADD',
  SUB: 'SUB',
  AND: 'AND',
  OR: 'OR',
  XOR: 'XOR',
  ADDI: 'ADD',
  ANDI: 'AND',
  ORI: 'OR',
  XORI: 'XOR',
};

// Assemble ONE assembly instruction into a 32-bit machine word (section 3.2).
// `args` depends on the form: R-type {rd,rs1,rs2}; I-type ALU {rd,rs1,imm}; LW
// {rd,rs1,imm} (rs1=base register, imm=offset); SW {rs1,rs2,imm} (rs1=base,
// rs2=source register to store - matching the real syntax `sw rs2, imm(rs1)`).
function assembleRV32I(mnemonic, args) {
  const info = RV32I_MNEMONIC[mnemonic];
  if (!info) throw new Error('Mnemonic RV32I khong ho tro: ' + mnemonic);
  if (info.type === 'R') {
    return (
      (((info.funct7 & 0x7f) << 25) |
        ((args.rs2 & 0x1f) << 20) |
        ((args.rs1 & 0x1f) << 15) |
        ((info.funct3 & 0x7) << 12) |
        ((args.rd & 0x1f) << 7) |
        RV32I_OPCODE.R) >>>
      0
    );
  }
  if (info.type === 'I') {
    return (
      (((args.imm & 0xfff) << 20) |
        ((args.rs1 & 0x1f) << 15) |
        ((info.funct3 & 0x7) << 12) |
        ((args.rd & 0x1f) << 7) |
        RV32I_OPCODE.I_ALU) >>>
      0
    );
  }
  if (info.type === 'ILOAD') {
    return (
      (((args.imm & 0xfff) << 20) |
        ((args.rs1 & 0x1f) << 15) |
        ((info.funct3 & 0x7) << 12) |
        ((args.rd & 0x1f) << 7) |
        RV32I_OPCODE.I_LOAD) >>>
      0
    );
  }
  if (info.type === 'S') {
    const imm11_5 = (args.imm >> 5) & 0x7f;
    const imm4_0 = args.imm & 0x1f;
    return (
      ((imm11_5 << 25) |
        ((args.rs2 & 0x1f) << 20) |
        ((args.rs1 & 0x1f) << 15) |
        ((info.funct3 & 0x7) << 12) |
        (imm4_0 << 7) |
        RV32I_OPCODE.S) >>>
      0
    );
  }
  throw new Error('Dang lenh khong ho tro: ' + info.type);
}

// Decode a 32-bit machine word back into a mnemonic plus operands (section 3.2,
// the inverse of assembleRV32I - a "round trip": assemble then decode must give
// back EXACTLY the original input).
function decodeRV32I(word) {
  const opcode = word & 0x7f;
  const rd = (word >>> 7) & 0x1f;
  const funct3 = (word >>> 12) & 0x7;
  const rs1 = (word >>> 15) & 0x1f;
  const rs2 = (word >>> 20) & 0x1f;
  const funct7 = (word >>> 25) & 0x7f;

  if (opcode === RV32I_OPCODE.R) {
    const mnemonic = Object.keys(RV32I_MNEMONIC).find(
      (m) =>
        RV32I_MNEMONIC[m].type === 'R' && RV32I_MNEMONIC[m].funct3 === funct3 && RV32I_MNEMONIC[m].funct7 === funct7
    );
    return { mnemonic, type: 'R', rd, rs1, rs2 };
  }
  if (opcode === RV32I_OPCODE.I_ALU) {
    const mnemonic = Object.keys(RV32I_MNEMONIC).find(
      (m) => RV32I_MNEMONIC[m].type === 'I' && RV32I_MNEMONIC[m].funct3 === funct3
    );
    return { mnemonic, type: 'I', rd, rs1, imm: word >> 20 };
  }
  if (opcode === RV32I_OPCODE.I_LOAD) {
    return { mnemonic: 'LW', type: 'ILOAD', rd, rs1, imm: word >> 20 };
  }
  if (opcode === RV32I_OPCODE.S) {
    let imm = ((word >> 25) << 5) | ((word >>> 7) & 0x1f);
    if (imm & 0x800) imm |= 0xfffff000; // mo rong dau (sign-extend) 12-bit
    return { mnemonic: 'SW', type: 'S', rs1, rs2, imm };
  }
  throw new Error('Invalid opcode: 0x' + opcode.toString(16));
}

// Single-cycle executor (section 3.3): decode ONE 32-bit instruction and execute
// it in the SAME clock cycle - REUSING Lesson 1's aluExecute() for every
// ADD/SUB/AND/OR/XOR (immediate forms included). x0 ALWAYS reads as 0 (a hard-
// wired register; writes to x0 are discarded - the real RISC-V convention).
function executeRV32I(word, regs, mem) {
  const d = decodeRV32I(word);
  if (d.type === 'R') {
    const r = aluExecute(regs[d.rs1], regs[d.rs2], RV32I_ALU_OP[d.mnemonic], 32);
    if (d.rd !== 0) regs[d.rd] = r.result;
  } else if (d.type === 'I') {
    const r = aluExecute(regs[d.rs1], d.imm, RV32I_ALU_OP[d.mnemonic], 32);
    if (d.rd !== 0) regs[d.rd] = r.result;
  } else if (d.type === 'ILOAD') {
    if (d.rd !== 0) regs[d.rd] = mem[regs[d.rs1] + d.imm] || 0;
  } else if (d.type === 'S') {
    mem[regs[d.rs1] + d.imm] = regs[d.rs2];
  }
  regs[0] = 0;
  return d;
}

// Run a STRAIGHT-LINE RV32I program (no jumps yet - the single-cycle datapath of
// section 3.3 only handles sequential flow) over 32 registers x0-x31 plus a
// sparse data memory as an object (address -> value).
function runRV32IProgram(words) {
  const regs = new Array(32).fill(0);
  const mem = {};
  const trace = [];
  for (const word of words) trace.push(executeRV32I(word, regs, mem));
  return { regs, mem, trace };
}

// ---------------------------------------------------------------------------
// Lesson 4 - CPU pipelining & data hazards. The single-cycle datapath of Lesson 3
// forces EVERY instruction into one cycle as long as the SLOWEST one (LW) - a
// 5-stage pipeline (IF-ID-EX-MEM-WB) fixes that by OVERLAPPING instructions, at
// the cost of having to handle data hazards between the overlapping instructions
// (section 4.3). Build-out: the time/CPI formulas (section 4.2) plus a RAW and
// load-use hazard detector REUSING Lesson 3's decodeRV32I() (sections 4.3-4.4).
// ---------------------------------------------------------------------------

// Time to run $N$ instructions on an $S$-stage pipeline with $stallCycles$ bubble
// cycles inserted for hazards (section 4.2):
// $T = (N + S - 1 + \text{stallCycles}) \times t_{clk}$ - the $(S-1)$ term is the
// fill latency at start-up (the first instructions have not yet overlapped all
// the stages).
function pipelineTime(numInstructions, numStages, stallCycles, clockPeriodNs) {
  return (numInstructions + numStages - 1 + stallCycles) * clockPeriodNs;
}

// Effective CPI (cycles per instruction) with stalls: an ideal pipeline (no
// stalls) has CPI = 1, which is the whole POINT of pipelining - a throughput of
// 1 instruction per cycle in steady state. Each stall adds EXACTLY 1 wasted cycle
// that completes no instruction, so CPI = (N + stallCycles) / N.
function pipelineCPI(numInstructions, stallCycles) {
  return (numInstructions + stallCycles) / numInstructions;
}

// Detect RAW (read-after-write) hazards between ADJACENT instructions in a decoded
// sequence (reusing Lesson 3's decodeRV32I()) - exactly the distance a 5-stage
// pipeline OVERLAPS (the next instruction starts ID while the previous is in EX).
// Returns the total stalls to insert plus a list of each hazard:
//   - Ordinary RAW (ALU->ALU): forwarding (routing the EX result straight into
//     the next EX) solves it COMPLETELY, 0 stalls; WITHOUT forwarding it needs
//     exactly 2 stalls (waiting for WB before the register can be read).
//   - Load-use (LW then immediate use): the loaded data is only ready at MEM, one
//     stage later than the ALU - forwarding still cannot arrive in time, so it
//     always costs EXACTLY 1 stall either way (section 4.3, the lesson's main pitfall).
function detectHazards(instrs, forwardingEnabled) {
  let totalStalls = 0;
  const hazards = [];
  for (let i = 1; i < instrs.length; i++) {
    const prev = instrs[i - 1];
    const curr = instrs[i];
    const prevWritesReg = (prev.type === 'R' || prev.type === 'I' || prev.type === 'ILOAD') && prev.rd !== 0;
    if (!prevWritesReg) continue;
    const readsRs1 = curr.rs1 !== undefined && curr.rs1 === prev.rd;
    const readsRs2 = curr.rs2 !== undefined && curr.rs2 === prev.rd;
    if (!readsRs1 && !readsRs2) continue;
    if (prev.type === 'ILOAD') {
      totalStalls += 1;
      hazards.push({ index: i, type: 'LOAD_USE', stalls: 1 });
    } else if (!forwardingEnabled) {
      totalStalls += 2;
      hazards.push({ index: i, type: 'RAW', stalls: 2 });
    } else {
      hazards.push({ index: i, type: 'RAW', stalls: 0 });
    }
  }
  return { totalStalls, hazards };
}

// ---------------------------------------------------------------------------
// Lesson 5 - Branch prediction & Spectre. Lesson 4's pipeline fetches the NEXT
// instruction before it knows which way a branch (BEQ/BNE) goes - so the CPU has
// to GUESS (section 5.1). Build-out: a 1-bit predictor (section 5.2, illustrating
// the oscillation pitfall in nested loops) and a far more accurate 2-bit
// saturating counter FSM plus a branch history table, with the effective-CPI
// formula (section 5.3).
// ---------------------------------------------------------------------------

// 1-bit branch predictor: remembers only the MOST RECENT outcome and predicts the
// same. State: 0 = predict not-taken (N), 1 = predict taken (T). Section 5.2
// pitfall: in a nested loop (4 T then 1 N, repeating) the 1-bit memory "forgets"
// right after the first N, so it mispredicts the very next T - 2 consecutive
// mispredictions per outer iteration (leaving the inner loop and re-entering it).
function makeBranchPredictor1Bit() {
  let state = 0; // khoi tao: doan Khong-nhay
  return {
    predict() {
      return state === 1 ? 'T' : 'N';
    },
    update(actual) {
      state = actual === 'T' ? 1 : 0;
    },
    getState() {
      return state;
    },
  };
}

// 2-bit saturating branch predictor (a counter FSM, section 5.2): 4 states,
// 0=strongly not taken (SNT), 1=weakly not taken (WNT), 2=weakly taken (WT),
// 3=strongly taken (ST). Predicts taken when state>=2. Unlike the 1-bit version, a
// single stray outcome (one T among a run of N, or vice versa) only nudges the
// state ONE step and does NOT flip the prediction - damping nested-loop oscillation.
function makeBranchPredictor2Bit() {
  let state = 0; // khoi tao: Rat-khong-nhay
  return {
    predict() {
      return state >= 2 ? 'T' : 'N';
    },
    update(actual) {
      state = actual === 'T' ? Math.min(3, state + 1) : Math.max(0, state - 1);
    },
    getState() {
      return state;
    },
  };
}

// Branch history table (section 5.2): each branch ADDRESS gets its OWN 2-bit
// predictor (indexed by `pc`), because different branches in the same program
// behave completely differently - lumping them into one predictor would mix the
// histories of unrelated branches together.
//
function makeBranchHistoryTable() {
  const table = new Map();
  function entryFor(pc) {
    let e = table.get(pc);
    if (!e) {
      e = makeBranchPredictor2Bit();
      table.set(pc, e);
    }
    return e;
  }
  return {
    predict(pc) {
      return entryFor(pc).predict();
    },
    update(pc, actual) {
      entryFor(pc).update(actual);
    },
    size() {
      return table.size;
    },
  };
}

// Run ONE predictor over a real branch outcome sequence `seq` (an array of 'T'/'N'),
// returning the hit count, total and rate plus a step-by-step trace (used by the
// visualisation demo).
function runPredictor(predictor, seq) {
  let correct = 0;
  const trace = [];
  for (const actual of seq) {
    const predicted = predictor.predict();
    const hit = predicted === actual;
    if (hit) correct++;
    trace.push({ predicted, actual, hit });
    predictor.update(actual);
  }
  return { correct, total: seq.length, rate: seq.length === 0 ? 0 : correct / seq.length, trace };
}

// Effective CPI (section 5.3) in the presence of control hazards:
// $CPI_{eff} = CPI_{ideal} + \text{BranchFreq} \times \text{MispredictRate} \times \text{PenaltyCycles}$
// - every misprediction forces the pipeline to FLUSH the wrongly fetched
// instructions and refetch along the right path, wasting `penaltyCycles`; how
// often that happens is (branch frequency) x (the predictor's own miss rate).
function effectiveCPI(cpiIdeal, branchFrequency, mispredictionRate, penaltyCycles) {
  return cpiIdeal + branchFrequency * mispredictionRate * penaltyCycles;
}

// ---------------------------------------------------------------------------
// Lesson 6 - Instruction-level parallelism (ILP) & out-of-order execution
// (Tomasulo). The scalar pipeline of Lessons 4-5 issues exactly 1 instruction per
// cycle in STRICT program order - a modern superscalar CPU issues SEVERAL, and
// lets a LATER instruction finish BEFORE an earlier one when there is no TRUE
// data dependency (section 6.1). The price: FALSE dependencies (WAR/WAW) appear
// because the finite set of architectural registers gets reused - solved by
// REGISTER RENAMING (section 6.2) inside the Tomasulo algorithm (section 6.3):
// reservation stations + a common data bus (CDB) + a reorder buffer (ROB) that
// commits results in EXACT program order despite out-of-order execution.
// ---------------------------------------------------------------------------

// A CYCLE-ACCURATE simulation of the Tomasulo algorithm over a short program
// (an array of {op:'ADD'|'SUB'|'MUL', dest, src1, src2} - register indices).
// Each cycle runs in exactly this order, mirroring the hardware constraints:
//   1. COMMIT   : the ROB head (in order), if its result is ready -> write regFile.
//   2. WRITE-RESULT (CDB): only 1 broadcast per cycle (the shared bus is a finite
//      resource) - if several stations finish together, the one with the SMALLER
//      robIndex (the OLDER instruction) wins; the loser waits another cycle.
//   3. Decrement `remaining` on the stations currently executing.
//   4. Move stations from WAITING to EXECUTING once both operands are ready.
//   5. ISSUE 1 new instruction (if a station and a ROB slot are free): consult the
//      register alias table to take the operand value IMMEDIATELY (if already in
//      regFile) or tag the ROB entry to wait for - then RENAME the destination
//      (RAT[dest] = the NEW robIndex). This is the step that eliminates WAR/WAW:
//      the later instruction writes a "new version" of the register, never touching
function runTomasulo(instructions, opts = {}) {
  const {
    numAddRS = 3,
    numMulRS = 2,
    addLatency = 2,
    mulLatency = 4,
    numRegs = 8,
    initialRegs = new Array(numRegs).fill(0),
  } = opts;

  const regFile = [...initialRegs];
  const RAT = new Array(numRegs).fill(null); // null = gia tri dung trong regFile; nguoc lai = chi so ROB se san xuat gia tri
  const n = instructions.length;
  const ROB = new Array(n)
    .fill(null)
    .map(() => ({ busy: false, dest: null, value: null, ready: false, instrIdx: null }));
  let robHead = 0;
  let robCount = 0;

  function makeRS(kind) {
    return {
      kind,
      busy: false,
      op: null,
      Vj: null,
      Vk: null,
      Qj: null,
      Qk: null,
      robIndex: null,
      state: null,
      remaining: 0,
    };
  }
  const addRS = new Array(numAddRS).fill(null).map(() => makeRS('ADD'));
  const mulRS = new Array(numMulRS).fill(null).map(() => makeRS('MUL'));
  const allRS = [...addRS, ...mulRS];

  const trace = instructions.map(() => ({ issue: null, execStart: null, writeback: null, commit: null }));
  let nextIssue = 0;
  let cycle = 0;
  let committed = 0;

  function computeVal(op, a, b) {
    if (op === 'ADD') return a + b;
    if (op === 'SUB') return a - b;
    if (op === 'MUL') return a * b;
    throw new Error('Invalid Tomasulo op: ' + op);
  }

  while (committed < n) {
    cycle++;
    if (cycle > 10000) throw new Error('Mo phong Tomasulo chay qua lau - co the bi treo');

    // 1. Commit (dung thu tu chuong trinh - lay tu DAU ROB)
    if (robCount > 0) {
      const head = ROB[robHead];
      if (head.busy && head.ready) {
        regFile[head.dest] = head.value;
        if (RAT[head.dest] === robHead) RAT[head.dest] = null;
        trace[head.instrIdx].commit = cycle;
        head.busy = false;
        robHead = (robHead + 1) % n;
        robCount--;
        committed++;
      }
    }

    // 2. Write-result: CHI 1 broadcast/chu ky (CDB la tai nguyen dung chung)
    let broadcaster = null;
    for (const rs of allRS) {
      if (rs.busy && rs.state === 'EXECUTING' && rs.remaining === 0) {
        if (broadcaster === null || rs.robIndex < broadcaster.robIndex) broadcaster = rs;
      }
    }
    if (broadcaster) {
      const val = computeVal(broadcaster.op, broadcaster.Vj, broadcaster.Vk);
      ROB[broadcaster.robIndex].value = val;
      ROB[broadcaster.robIndex].ready = true;
      trace[ROB[broadcaster.robIndex].instrIdx].writeback = cycle;
      for (const rs of allRS) {
        if (rs.busy && rs.Qj === broadcaster.robIndex) {
          rs.Vj = val;
          rs.Qj = null;
        }
        if (rs.busy && rs.Qk === broadcaster.robIndex) {
          rs.Vk = val;
          rs.Qk = null;
        }
      }
      broadcaster.busy = false;
      broadcaster.state = null;
    }

    // 3. Giam remaining cua cac RS dang EXECUTING
    for (const rs of allRS) {
      if (rs.busy && rs.state === 'EXECUTING' && rs.remaining > 0) rs.remaining--;
    }

    // 4. WAITING -> EXECUTING khi ca 2 toan hang da san sang
    for (const rs of allRS) {
      if (rs.busy && rs.state === 'WAITING' && rs.Qj === null && rs.Qk === null) {
        rs.state = 'EXECUTING';
        rs.remaining = (rs.kind === 'MUL' ? mulLatency : addLatency) - 1;
        trace[ROB[rs.robIndex].instrIdx].execStart = cycle;
      }
    }

    // 5. Issue 1 lenh moi (dung thu tu chuong trinh) neu con RS + ROB trong
    if (nextIssue < n && robCount < n) {
      const instr = instructions[nextIssue];
      const pool = instr.op === 'MUL' ? mulRS : addRS;
      const freeRS = pool.find((rs) => !rs.busy);
      if (freeRS) {
        const robIndex = (robHead + robCount) % n;
        const rob = ROB[robIndex];
        rob.busy = true;
        rob.dest = instr.dest;
        rob.value = null;
        rob.ready = false;
        rob.instrIdx = nextIssue;
        robCount++;

        freeRS.busy = true;
        freeRS.op = instr.op;
        freeRS.robIndex = robIndex;
        if (RAT[instr.src1] === null) {
          freeRS.Vj = regFile[instr.src1];
          freeRS.Qj = null;
        } else {
          const srcRob = ROB[RAT[instr.src1]];
          if (srcRob.ready) {
            freeRS.Vj = srcRob.value;
            freeRS.Qj = null;
          } else {
            freeRS.Qj = RAT[instr.src1];
          }
        }
        if (RAT[instr.src2] === null) {
          freeRS.Vk = regFile[instr.src2];
          freeRS.Qk = null;
        } else {
          const srcRob = ROB[RAT[instr.src2]];
          if (srcRob.ready) {
            freeRS.Vk = srcRob.value;
            freeRS.Qk = null;
          } else {
            freeRS.Qk = RAT[instr.src2];
          }
        }
        freeRS.state = 'WAITING';
        RAT[instr.dest] = robIndex; // DOI TEN - day chinh la buoc loai bo WAR/WAW
        trace[nextIssue].issue = cycle;
        nextIssue++;
      }
    }
  }

  return { regFile, trace, totalCycles: cycle, ipc: n / cycle };
}

// The CORRECT value each instruction must produce, computed in strict program order.
// Tomasulo preserves data-flow semantics, so these are also the values the
// out-of-order machine computes - only the TIMING differs.
function evalInOrder(instructions, initialRegs) {
  const regs = [...initialRegs];
  const values = [];
  for (const ins of instructions) {
    const a = regs[ins.src1];
    const b = regs[ins.src2];
    const v = ins.op === 'MUL' ? a * b : ins.op === 'SUB' ? a - b : a + b;
    values.push(v);
    regs[ins.dest] = v;
  }
  return { regs, values };
}

// Section 6.5 - WHY a ROB is needed: PRECISE EXCEPTIONS.
// This is the real reason the ROB exists, not merely to "get the final result
// right". Suppose instruction `faultAt` raises a fault (divide by zero, a page
// fault, overflow...). The operating system must receive a register state exactly
// AS IF the program had run up to that instruction and stopped - not one more.
// Only then can it handle the fault and RESUME.
//   - With a ROB committing in order: every instruction AFTER the faulting one has
//     not touched the architectural registers, however long ago it finished. PRECISE.
//   - Without one, writing as soon as a result is ready: a later instruction has
//     already overwritten a register before the fault surfaced. The state matches NO
//     point in the program at all - it cannot be resumed.
function architecturalStateOnFault(instructions, opts = {}) {
  const { initialRegs = new Array(8).fill(0), faultAt = 0 } = opts;
  const r = runTomasulo(instructions, opts);
  const { values } = evalInOrder(instructions, initialRegs);

  // With a ROB: only instructions BEFORE the faulting one have committed.
  const precise = [...initialRegs];
  for (let i = 0; i < faultAt; i++) precise[instructions[i].dest] = values[i];

  // Without one: every instruction whose writeback lands at or before the faulting
  // one has already written the architectural registers - including later ones.
  const faultWb = r.trace[faultAt].writeback;
  // The faulting instruction itself produces no value, so exclude it.
  const done = instructions
    .map((_, i) => i)
    .filter((i) => i !== faultAt && r.trace[i].writeback <= faultWb)
    .sort((a, b) => r.trace[a].writeback - r.trace[b].writeback);
  const imprecise = [...initialRegs];
  for (const i of done) imprecise[instructions[i].dest] = values[i];

  // Instructions AFTER the fault that already dirtied the state - exactly what
  // makes resuming impossible.
  const leakedFromFuture = done.filter((i) => i >= faultAt);
  return { precise, imprecise, faultWb, committedBeforeFault: faultAt, leakedFromFuture };
}

// ---------------------------------------------------------------------------
// Lesson 7 - The memory hierarchy & cache architecture. Lesson 6's out-of-order
// CPU still has to WAIT for data from main memory (DRAM) - the CPU/DRAM speed gap
// (the memory wall) is hidden behind a very fast SRAM cache, resting on temporal
// locality (what was just used will be used again) and spatial locality (if
// address X was used, addresses NEAR X will be too). Build-out: address splitting
// into tag/index/offset (section 7.2), direct-mapped and set-associative caches
// with LRU (section 7.2), and multi-level AMAT (section 7.3).
// ---------------------------------------------------------------------------

// Split a 32-bit address into (tag, index, offset) exactly as the real hardware
// does: the offset (lowest bits) picks the byte WITHIN a cache line, the index
// picks the LINE (set) in the cache, and the tag is whatever remains, used to
// CONFIRM the line really holds the data wanted (section 7.2).
function splitAddress(address, offsetBits, indexBits) {
  const offset = address & ((1 << offsetBits) - 1);
  const index = (address >>> offsetBits) & ((1 << indexBits) - 1);
  const tag = address >>> (offsetBits + indexBits);
  return { tag, index, offset };
}

// Direct-mapped cache: each address maps to EXACTLY 1 cache line (by index) -
// simple and fast, but prone to conflict misses: 2 addresses with different tags
// but the SAME index keep evicting each other from that single line even while
// other lines sit empty (section 7.2, the pitfall set-associativity solves).
function makeDirectMappedCache(numSets, offsetBits) {
  const indexBits = Math.log2(numSets);
  if (!Number.isInteger(indexBits)) throw new Error('numSets phai la luy thua cua 2');
  const lines = new Array(numSets).fill(null).map(() => ({ valid: false, tag: null }));
  return {
    access(address) {
      const { tag, index } = splitAddress(address, offsetBits, indexBits);
      const line = lines[index];
      if (line.valid && line.tag === tag) return 'HIT';
      line.valid = true;
      line.tag = tag;
      return 'MISS';
    },
  };
}

// N-way set-associative cache with LRU (least recently used, section 7.2): each
// index maps to a SET holding `ways` lines - addresses sharing an index but with
// different tags no longer fight over one line, cutting conflict misses sharply
// against direct-mapped (in exchange: more complex hardware and more power to
// compare `ways` tags in parallel on every access - the section 7.2 pitfall).
function makeSetAssociativeCache(numSets, ways, offsetBits) {
  const indexBits = Math.log2(numSets);
  if (!Number.isInteger(indexBits)) throw new Error('numSets phai la luy thua cua 2');
  const sets = new Array(numSets).fill(null).map(() => []);
  let clock = 0;
  return {
    access(address) {
      const { tag, index } = splitAddress(address, offsetBits, indexBits);
      const set = sets[index];
      const entry = set.find((e) => e.tag === tag);
      clock++;
      if (entry) {
        entry.lastUsed = clock;
        return 'HIT';
      }
      if (set.length < ways) {
        set.push({ tag, lastUsed: clock });
      } else {
        let lruIdx = 0;
        for (let i = 1; i < set.length; i++) if (set[i].lastUsed < set[lruIdx].lastUsed) lruIdx = i;
        set[lruIdx] = { tag, lastUsed: clock };
      }
      return 'MISS';
    },
  };
}

// Run a sequence of addresses through ONE cache, returning hit/miss counts plus a
// per-access trace (used by the hit/miss visualisation demo).
function runCacheTrace(cache, addresses) {
  let hits = 0;
  let misses = 0;
  const trace = [];
  for (const addr of addresses) {
    const r = cache.access(addr);
    trace.push(r);
    if (r === 'HIT') hits++;
    else misses++;
  }
  return { hits, misses, total: addresses.length, missRate: misses / addresses.length, trace };
}

// A cache with a WRITE POLICY (section 7.4). The two caches above simulate reads
// only - but half of a cache's job is handling stores (`sw`). When the CPU writes
// to an address ALREADY in the cache there are 2 choices:
//   - write-through: write the cache AND go straight down to DRAM. Simple, memory
//     is always correct, but EVERY store costs a trip to DRAM.
//   - write-back: write the cache only and set the `dirty` flag. The line goes down
//     to DRAM only when EVICTED. Writing to the same line many times costs
//     EXACTLY 1 trip - in exchange for 1 extra dirty bit per line and DRAM being
//     temporarily stale relative to the cache.
// On a write MISS there are 2 further choices: write-allocate (load the line then
// write - a good fit for write-back) or no-write-allocate (write straight to DRAM
// without loading - a good fit for write-through).
// Returns `memWrites`: how many writes ACTUALLY reach DRAM - that is the number
// the write policy affects, not the hit rate.
function makeWritePolicyCache(numSets, ways, offsetBits, options) {
  const opt = options || {};
  const writeBack = opt.writePolicy === 'back';
  // write-back pairs with write-allocate by default, write-through with no-allocate
  const writeAllocate = opt.writeAllocate === undefined ? writeBack : opt.writeAllocate;
  const indexBits = Math.log2(numSets);
  if (!Number.isInteger(indexBits)) throw new Error('numSets phai la luy thua cua 2');
  const sets = new Array(numSets).fill(null).map(() => []);
  let clock = 0;
  let memWrites = 0;

  function evict(set) {
    let lruIdx = 0;
    for (let i = 1; i < set.length; i++) if (set[i].lastUsed < set[lruIdx].lastUsed) lruIdx = i;
    // This is where write-back settles its debt: an evicted line that is dirty gets
    // written down to DRAM NOW.
    if (set[lruIdx].dirty) memWrites++;
    set.splice(lruIdx, 1);
  }

  return {
    // `isWrite = false` -> a load (lw), `true` -> a store (sw)
    access(address, isWrite) {
      const { tag, index } = splitAddress(address, offsetBits, indexBits);
      const set = sets[index];
      const entry = set.find((e) => e.tag === tag);
      clock++;
      if (entry) {
        entry.lastUsed = clock;
        if (isWrite) {
          if (writeBack) entry.dirty = true;
          else memWrites++; // write-through: write the cache, then DRAM immediately
        }
        return 'HIT';
      }
      // MISS
      if (isWrite && !writeAllocate) {
        memWrites++; // no-write-allocate: straight to DRAM, no line loaded
        return 'MISS';
      }
      if (set.length >= ways) evict(set);
      set.push({ tag, lastUsed: clock, dirty: isWrite && writeBack });
      if (isWrite && !writeBack) memWrites++;
      return 'MISS';
    },
    // At the end of the program every still-dirty line must be written down to DRAM
    // (a flush) - without counting it, write-back would look cheaper than it is.
    flush() {
      for (const set of sets)
        for (const e of set)
          if (e.dirty) {
            memWrites++;
            e.dirty = false;
          }
      return memWrites;
    },
    get memWrites() {
      return memWrites;
    },
  };
}

// Run a mixed read/write access sequence through a write-policy cache. Each entry
// is { address, isWrite }. Also returns `memWrites` after the flush.
function runWriteTrace(cache, accesses) {
  let hits = 0;
  for (const a of accesses) if (cache.access(a.address, a.isWrite) === 'HIT') hits++;
  cache.flush();
  return { hits, misses: accesses.length - hits, total: accesses.length, memWrites: cache.memWrites };
}

// The 3C taxonomy (section 7.5) - not every miss is alike, and each kind has a
// DIFFERENT cure, so lumping them together loses the information:
//   - Compulsory: the FIRST touch of a block. Every cache suffers these, even an
//     infinite one. Reduced by larger cache lines or prefetching.
//   - Capacity: the block WAS in the cache but was evicted because the cache is too
//     SMALL for the working set. Cured by a bigger cache.
//   - Conflict: the cache still has room, but the block was evicted through
//     contention for one set. Cured by raising associativity - exactly the effect
//     measured in section 7.2 (20/20 misses down to 2/20).
// Measured Hill's standard way: compare the real cache against a fully-associative
// one of the SAME capacity, and against an infinite one.
function classifyMisses(addresses, numSets, ways, offsetBits) {
  const totalLines = numSets * ways;
  const real = runCacheTrace(makeSetAssociativeCache(numSets, ways, offsetBits), addresses).misses;
  // fully-associative at the same capacity = 1 set holding every line
  const fullyAssoc = runCacheTrace(makeSetAssociativeCache(1, totalLines, offsetBits), addresses).misses;
  // an infinite cache: only the compulsory misses remain
  const blockOf = (a) => a >> offsetBits;
  const compulsory = new Set(addresses.map(blockOf)).size;
  return {
    total: real,
    compulsory,
    capacity: fullyAssoc - compulsory,
    conflict: real - fullyAssoc,
  };
}

// AMAT (average memory access time) with 1 cache level (section 7.3):
// $AMAT = T_{Hit} + \text{MissRate} \times T_{MissPenalty}$
function amat(hitTime, missRate, missPenalty) {
  return hitTime + missRate * missPenalty;
}

// AMAT with 2 levels, L1+L2 (section 7.3): `missRateL2Local` is L2's LOCAL miss
// rate - counted ONLY over the accesses where L1 already missed, not over all
// program accesses. Section 7.3 pitfall: confusing the local miss rate (which this
// formula wants) with the global one (= missRateL1 x missRateL2Local, the share of
// ALL program accesses, an entirely different number).
function amatTwoLevel(hitTimeL1, missRateL1, hitTimeL2, missRateL2Local, missPenaltyMem) {
  return hitTimeL1 + missRateL1 * (hitTimeL2 + missRateL2Local * missPenaltyMem);
}

// ---------------------------------------------------------------------------
// Lesson 8 - Virtual memory & the TLB. Lesson 7's cache speeds up PHYSICAL memory
// access - this lesson adds a layer of indirection RIGHT BEFORE it: each process
// sees its own VIRTUAL address space, translated to PHYSICAL addresses through a
// page table (section 8.1). Because the page table itself lives in RAM (looking it
// up costs a memory access of its own!), the TLB (translation lookaside buffer,
// section 8.3) acts as a CACHE for the page table.
// ---------------------------------------------------------------------------

// Split a VIRTUAL address into a VPN (virtual page number) plus the offset within
// the page (section 8.1) - the same shape as Lesson 7's splitAddress() but with no
// separate "index", because the page table is looked up by the WHOLE VPN (it has
function splitVirtualAddress(virtualAddress, pageOffsetBits) {
  const offset = virtualAddress & ((1 << pageOffsetBits) - 1);
  const vpn = virtualAddress >>> pageOffsetBits;
  return { vpn, offset };
}

// The TLB (translation lookaside buffer, section 8.3): a small fully-associative
// table with LRU, holding the most RECENTLY translated (VPN -> PFN) pairs - acting
// as A CACHE for the page table, avoiding an extra RAM access on every
// access just to learn the physical address of the FIRST one.
function makeTLB(capacity) {
  const entries = []; // {vpn, pfn, lastUsed}
  let clock = 0;
  return {
    lookup(vpn) {
      const e = entries.find((x) => x.vpn === vpn);
      clock++;
      if (e) {
        e.lastUsed = clock;
        return e.pfn;
      }
      return null;
    },
    insert(vpn, pfn) {
      clock++;
      if (entries.length < capacity) {
        entries.push({ vpn, pfn, lastUsed: clock });
        return;
      }
      let lruIdx = 0;
      for (let i = 1; i < entries.length; i++) if (entries[i].lastUsed < entries[lruIdx].lastUsed) lruIdx = i;
      entries[lruIdx] = { vpn, pfn, lastUsed: clock };
    },
    size() {
      return entries.length;
    },
  };
}

// Translate a virtual address to a physical one (sections 8.1 and 8.3): try the
// TLB FIRST (fast); on a TLB miss consult the page table (slower - modelled as an
// extra RAM access); if the VPN is absent from the page table it is a page fault
// (the page is unmapped or not loaded - section 8.1).
function translateAddress(virtualAddress, pageOffsetBits, tlb, pageTable) {
  const { vpn, offset } = splitVirtualAddress(virtualAddress, pageOffsetBits);
  let pfn = tlb.lookup(vpn);
  if (pfn !== null) {
    return { physicalAddress: (pfn << pageOffsetBits) | offset, tlbHit: true, pageFault: false };
  }
  if (pageTable.has(vpn)) {
    pfn = pageTable.get(vpn);
    tlb.insert(vpn, pfn);
    return { physicalAddress: (pfn << pageOffsetBits) | offset, tlbHit: false, pageFault: false };
  }
  return { physicalAddress: null, tlbHit: false, pageFault: true };
}

// The maximum number of VIRTUAL pages in an `addressBits`-bit address space with
// `pageOffsetBits`-bit pages (section 8.2): $2^{addressBits - pageOffsetBits}$.
function pageTableEntryCount(addressBits, pageOffsetBits) {
  return Math.pow(2, addressBits - pageOffsetBits);
}

// The size of a SINGLE-LEVEL page table (section 8.2): a FLAT array with room for
// EVERY possible virtual page, including those NEVER used - which is exactly the
// section 8.2 pitfall (enormous RAM waste in a 64-bit address space).
function singleLevelPageTableSizeBytes(addressBits, pageOffsetBits, entryBytes) {
  return pageTableEntryCount(addressBits, pageOffsetBits) * entryBytes;
}

// The size of a TWO-LEVEL page table (section 8.2, the 32-bit x86 10-10-12 style):
// the level-1 table is ALWAYS allocated in full (small and fixed); level-2 tables
// are allocated only for REGIONS actually in use - saving enormous amounts of RAM
// when a program uses only a small part of the space, as is usually the case.
function twoLevelPageTableSizeBytes(numUsedPages, entriesPerTable, entryBytes) {
  const firstLevelBytes = entriesPerTable * entryBytes;
  const numSecondLevelTables = Math.ceil(numUsedPages / entriesPerTable);
  const tableBytes = entriesPerTable * entryBytes;
  return firstLevelBytes + numSecondLevelTables * tableBytes;
}

// ---------------------------------------------------------------------------
// Lesson 9 - Apple Silicon & unified memory architecture (UMA). Lessons 7-8 assume
// the CPU and GPU have SEPARATE memory (the traditional PC model) - so whenever
// the CPU needs the GPU to process data (rendering a frame, say), it must be
// COPIED across the PCIe bus (far slower than local RAM). Apple Silicon uses UMA:
// CPU and GPU SHARE one very high-bandwidth RAM pool, removing the copy entirely.
// Build-out: a bandwidth model (bytes per frame, PCIe copy time against direct UMA
// access, section 9.4).
// ---------------------------------------------------------------------------

// The byte size of ONE frame (section 9.4): width x height x bytes per pixel
// (32-bit colour = 4 bytes per pixel, covering R/G/B/alpha).
function frameBytes(width, height, bytesPerPixel) {
  return width * height * bytesPerPixel;
}

// The time to move `bytes` bytes over a channel of `bandwidthGBps` GB/s
// (section 9.4): $t = \text{bytes} / (\text{bandwidthGBps} \times 10^9)$.
function transferTimeSeconds(bytes, bandwidthGBps) {
  return bytes / (bandwidthGBps * 1e9);
}

// A direct comparison of 2 data paths for the SAME frame (section 9.4): PCIe Gen 4
// x16 (a CPU->GPU copy over a discrete bus, the traditional PC model) against UMA
// (Apple Silicon - the GPU accesses the SAME RAM pool DIRECTLY, with no copy at
// all, bounded only by local RAM bandwidth).
function compareTransferMethods(bytes, pcieGBps, umaGBps) {
  const pcieTimeMs = transferTimeSeconds(bytes, pcieGBps) * 1000;
  const umaTimeMs = transferTimeSeconds(bytes, umaGBps) * 1000;
  return { pcieTimeMs, umaTimeMs, speedupFactor: pcieTimeMs / umaTimeMs };
}

// ---------------------------------------------------------------------------
// Lesson 10 - Hardware acceleration: GPU, NPU & AMX. Lesson 9 dealt with the
// BANDWIDTH wall (getting data where it is needed as fast as possible) - this
// lesson deals with the COMPUTE wall: NxN matrix multiply is the core operation of
// both graphics AND deep learning, and 3 architectures (scalar CPU, SIMD CPU,
// parallel GPU/AMX) run it at throughputs differing by a factor of thousands.
// Build-out: counting matrix-multiply FLOPs and comparing sequential against SIMD
// against parallel (section 10.4).
// ---------------------------------------------------------------------------

// The floating-point operation count for multiplying two NxN matrices with the
// classic $O(N^3)$ SEQUENTIAL algorithm (section 10.4): each of the $N^2$ result
// elements needs exactly $N$ multiplications + $(N-1)$ additions = $2N-1$ FLOPs,
// so in total $N^2 \times (2N-1) = 2N^3 - N^2$.
function matrixMultiplyFlops(n) {
  return 2 * Math.pow(n, 3) - Math.pow(n, 2);
}

// The time to perform `flops` operations at `flopsPerSecond` throughput (section 10.4):
// $t = \text{flops} / \text{flopsPerSecond}$.
function computeTimeSeconds(flops, flopsPerSecond) {
  return flops / flopsPerSecond;
}

// Compare 3 architectures on the SAME NxN matrix multiply (section 10.4): a
// sequential scalar CPU (scalarGFLOPS), a SIMD CPU (simdGFLOPS - usually scalar x
// the vector width, so 8-wide AVX = 8x), and a massively parallel GPU/AMX
// (gpuTFLOPS, with `gpuOverheadSeconds` - the fixed cost of loading data into the
// GPU/AMX BEFORE computing, independent of matrix size).
// Section 10.4 - THE ROOFLINE MODEL. compareComputeMethods() above derives its
// times from PEAK compute throughput alone, silently assuming INFINITE memory
// bandwidth. Reality differs: to compute you must first LOAD. Roofline
// (Williams, 2009) weighs those two limits against each other.
//
// Arithmetic intensity = how many FLOPs you get per byte read from memory. A
// naive NxN matrix multiply touches 3 matrices (2 in, 1 out), each of N^2 elements
// x `bytesPerElem`:
//   AI = (2N³ - N²) / (3N² × bytesPerElem)
// For a given AI, the hardware can attain at most:
//   attainable = min(peakFLOPS, AI × bandwidth)
// If AI x bandwidth < peakFLOPS the problem is MEMORY-BOUND - buying a card with
// more FLOPS will not help at all.
function rooflineAttainable(arithmeticIntensity, peakFLOPS, bandwidthBytesPerSec) {
  const memoryCeiling = arithmeticIntensity * bandwidthBytesPerSec;
  const attainable = Math.min(peakFLOPS, memoryCeiling);
  return {
    attainable,
    memoryCeiling,
    peakFLOPS,
    bound: memoryCeiling < peakFLOPS ? 'memory' : 'compute',
    // The fraction of peak actually usable. Below 1 means the hardware is data-starved.
    fractionOfPeak: attainable / peakFLOPS,
    // The ridge point: the minimum AI at which bandwidth stops being the bottleneck.
    ridgeIntensity: peakFLOPS / bandwidthBytesPerSec,
  };
}

// The arithmetic intensity of an NxN matrix multiply, assuming each matrix is read
// or written EXACTLY ONCE (3N^2 elements). That is the BEST case, reachable only
// with tiling to reuse data through the cache (Lesson 7); the naive version
// re-reads rows and columns many times, so its real AI is LOWER. Use as an UPPER BOUND.
function matmulArithmeticIntensity(n, bytesPerElem = 4) {
  return matrixMultiplyFlops(n) / (3 * n * n * bytesPerElem);
}

// The contrast case: vector add (SAXPY) y[i] = a*x[i] + y[i]. Each element costs 2
// FLOPs but must read x, read y and write y = 3 memory touches. The AI is fixed and
// does not grow with N - so it is memory-bound at EVERY size, beyond rescue.
function vectorAddArithmeticIntensity(bytesPerElem = 4) {
  return 2 / (3 * bytesPerElem);
}

// Section 10.5 - WARP DIVERGENCE. A GPU runs threads in groups of `warpSize`
// threads SHARING one program counter. If threads in the same warp branch in
// different directions the hardware must run each branch SEQUENTIALLY, disabling
// the threads not on the current one - so the times add up, and efficiency is the
// average fraction of threads actually doing work.
// `branchTaken` is a boolean array, one entry per thread in ONE warp.
function warpDivergence(branchTaken, warpSize = 32) {
  if (branchTaken.length !== warpSize) throw new Error('branchTaken must have exactly warpSize entries');
  const taken = branchTaken.filter(Boolean).length;
  const notTaken = warpSize - taken;
  // Passes: 1 if the whole warp goes the same way, 2 if it splits.
  const passes = taken === 0 || notTaken === 0 ? 1 : 2;
  // Total thread slots the hardware provides = passes x warpSize; slots doing real
  // work = warpSize (each thread runs its own branch exactly once).
  const efficiency = warpSize / (passes * warpSize);
  return { taken, notTaken, passes, efficiency, wastedSlots: passes * warpSize - warpSize };
}

function compareComputeMethods(n, scalarGFLOPS, simdGFLOPS, gpuTFLOPS, gpuOverheadSeconds = 0) {
  const flops = matrixMultiplyFlops(n);
  const scalarTimeSeconds = computeTimeSeconds(flops, scalarGFLOPS * 1e9);
  const simdTimeSeconds = computeTimeSeconds(flops, simdGFLOPS * 1e9);
  const gpuTimeSeconds = computeTimeSeconds(flops, gpuTFLOPS * 1e12) + gpuOverheadSeconds;
  return { flops, scalarTimeSeconds, simdTimeSeconds, gpuTimeSeconds };
}

// ---------------------------------------------------------------------------
// Lesson 11 - The end of Moore's law & chiplet packaging. Shrinking transistors
// is hitting physical limits (quantum tunnelling below 3nm, the thermal limit of
// dark silicon) - so the chip industry moved to SPLITTING one large die into
// several smaller "chiplets" assembled on an interposer. Build-out: the Poisson
// and Murphy yield models plus wafer cost, comparing one large monolithic die
// against several small chiplets (section 11.4).
//
// ---------------------------------------------------------------------------

// The POISSON yield model (the simplest, section 11.4): the probability that a die
// of `area` mm^2 catches NO defect at all, given a uniformly random defect density
// `defectDensity` (defects/mm^2): $Y = e^{-A \times D}$.
// Simple, but excessively pessimistic for LARGE dies.
function yieldPoisson(area, defectDensity) {
  return Math.exp(-area * defectDensity);
}

// The MURPHY yield model (more realistic than Poisson, section 11.4): it assumes
// the defect density varies rather than being perfectly uniform, giving results
// closer to real semiconductor data: $Y = \left(\dfrac{1 - e^{-x}}{x}\right)^2$
// with $x = A \times D$.
function yieldMurphy(area, defectDensity) {
  const x = area * defectDensity;
  if (x === 0) return 1;
  return Math.pow((1 - Math.exp(-x)) / x, 2);
}

// How many dies can be cut from a round wafer of diameter `waferDiameterMm`
// (section 11.4): the wafer area divided by the die area, MINUS the loss at the
// wafer edge (dies cut short and unusable, approximated by the circumference).
function diesPerWafer(waferDiameterMm, dieAreaMm2) {
  const waferArea = Math.PI * Math.pow(waferDiameterMm / 2, 2);
  const edgeLoss = (Math.PI * waferDiameterMm) / Math.sqrt(2 * dieAreaMm2);
  return Math.floor(waferArea / dieAreaMm2 - edgeLoss);
}

// The average cost per GOOD die (section 11.4): the wafer cost divided by the
// number of ACTUALLY usable dies (dies cut x yield). `yieldFn` is yieldPoisson or
// yieldMurphy (or any compatible custom function).
// Section 11.5 - the REAL cost of chiplets: silicon is NOT the whole bill.
// costPerGoodDie() counts silicon only. But chiplets also pay for things a
// monolithic die never does: the interposer, extra packaging steps, and TESTING
// each die before assembly (putting one bad die into a package ruins the whole
// package - the "known-good die" problem). Ignoring these is why a small chip
// stays monolithic even though the yield formula seems to recommend splitting it.
function chipletPackagedCost(opts) {
  const {
    waferCostUsd,
    waferDiameterMm,
    defectDensity,
    dieAreaMm2,
    numDies = 1,
    yieldFn,
    interposerCostUsd = 0, // the substrate, needed only by chiplets
    perDieTestUsd = 0, // testing each die before assembly
    assemblyPerDieUsd = 0, // mounting each die on the substrate
    packageYield = 1, // probability the whole package assembles successfully
  } = opts;
  const siliconPerDie = costPerGoodDie(waferCostUsd, dieAreaMm2, waferDiameterMm, defectDensity, yieldFn);
  const silicon = siliconPerDie * numDies;
  const packaging = interposerCostUsd + (perDieTestUsd + assemblyPerDieUsd) * numDies;
  // A package that fails at assembly writes off ALL the good silicon inside it.
  const total = (silicon + packaging) / packageYield;
  return { silicon, packaging, total, packagingShare: packaging / (silicon + packaging) };
}

// Section 11.2 - the PERFORMANCE price of splitting. An access crossing a die
// boundary must traverse the substrate, so it is far slower than a local one. If a
// fraction `crossFraction` of accesses land on another die, the AVERAGE latency rises:
//   avg = (1 - f) × localNs + f × remoteNs
// This is NUMA at the scale of a single chip.
function crossDieLatency(localNs, remoteNs, crossFraction) {
  const avg = (1 - crossFraction) * localNs + crossFraction * remoteNs;
  return { avg, slowdown: avg / localNs, localNs, remoteNs, crossFraction };
}

function costPerGoodDie(waferCostUsd, dieAreaMm2, waferDiameterMm, defectDensity, yieldFn) {
  const n = diesPerWafer(waferDiameterMm, dieAreaMm2);
  const y = yieldFn(dieAreaMm2, defectDensity);
  return waferCostUsd / (n * y);
}

export {
  toBinString,
  toSigned,
  halfAdder,
  fullAdder,
  rippleCarryAdd,
  aluExecute,
  ALU_OPS,
  createCpuState,
  cpuStep,
  runProgram,
  RV32I_OPCODE,
  RV32I_MNEMONIC,
  assembleRV32I,
  decodeRV32I,
  executeRV32I,
  runRV32IProgram,
  pipelineTime,
  pipelineCPI,
  detectHazards,
  makeBranchPredictor1Bit,
  makeBranchPredictor2Bit,
  makeBranchHistoryTable,
  runPredictor,
  effectiveCPI,
  runTomasulo,
  evalInOrder,
  architecturalStateOnFault,
  splitAddress,
  makeDirectMappedCache,
  makeWritePolicyCache,
  runWriteTrace,
  classifyMisses,
  makeSetAssociativeCache,
  runCacheTrace,
  amat,
  amatTwoLevel,
  splitVirtualAddress,
  makeTLB,
  translateAddress,
  pageTableEntryCount,
  singleLevelPageTableSizeBytes,
  twoLevelPageTableSizeBytes,
  frameBytes,
  transferTimeSeconds,
  compareTransferMethods,
  matrixMultiplyFlops,
  computeTimeSeconds,
  rooflineAttainable,
  matmulArithmeticIntensity,
  vectorAddArithmeticIntensity,
  warpDivergence,
  compareComputeMethods,
  yieldPoisson,
  yieldMurphy,
  diesPerWafer,
  costPerGoodDie,
  chipletPackagedCost,
  crossDieLatency,
};

// ---------------------------------------------------------------------------
// Self-test - run with `node cpu-core.js`. Check `typeof process` first, because
// `process` does not exist in a browser (omitting this raises a ReferenceError the
// moment a page imports the module) - as in dsp-core.js/vmcu.js/ai-neuro.js.
// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  let errors = 0;
  let checks = 0;
  function check(name, got, exp) {
    checks++;
    if (got !== exp) {
      console.log('LOI', name, 'got=' + got, 'ky vong=' + exp);
      errors++;
    }
  }
  function checkTrue(name, cond) {
    checks++;
    if (!cond) {
      console.log('LOI', name);
      errors++;
    }
  }

  // --- Number representation helpers ---
  check('toBinString(5, 4) = 0101', toBinString(5, 4), '0101');
  check('toBinString(9, 4) = 1001', toBinString(9, 4), '1001');
  check('toSigned(9, 4) = -7 (bu 2: 1001)', toSigned(9, 4), -7);
  check('toSigned(7, 4) = 7 (bit dau = 0)', toSigned(7, 4), 7);
  check('toSigned(8, 4) = -8 (the most negative 4-bit value)', toSigned(8, 4), -8);

  // --- Half adder: the exact truth table (2^2 = 4 combinations) ---
  check('halfAdder(0,0) sum', halfAdder(0, 0).sum, 0);
  check('halfAdder(0,0) carry', halfAdder(0, 0).carry, 0);
  check('halfAdder(1,0) sum', halfAdder(1, 0).sum, 1);
  check('halfAdder(1,0) carry', halfAdder(1, 0).carry, 0);
  check('halfAdder(1,1) sum = 0 (1+1 = 10, tong bit = 0)', halfAdder(1, 1).sum, 0);
  check('halfAdder(1,1) carry = 1 (a carry is produced)', halfAdder(1, 1).carry, 1);

  // --- Full adder: all 8 combinations against real arithmetic ---
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      for (let cin = 0; cin < 2; cin++) {
        const { sum, cout } = fullAdder(a, b, cin);
        const total = a + b + cin;
        check(`fullAdder(${a},${b},${cin}) sum matches the low bit of ${total}`, sum, total & 1);
        check(`fullAdder(${a},${b},${cin}) cout matches the carry bit of ${total}`, cout, total >> 1);
      }
    }
  }

  // --- 4-bit ripple-carry adder: matches JS addition across all 256 combinations ---
  {
    let ok = true;
    for (let a = 0; a < 16; a++) {
      for (let b = 0; b < 16; b++) {
        const { result, cout } = rippleCarryAdd(a, b, 0, 4);
        if (result !== ((a + b) & 0xf)) ok = false;
        if (cout !== (a + b > 15 ? 1 : 0)) ok = false;
      }
    }
    checkTrue('4-bit rippleCarryAdd matches (a+b)&0xF and the carry across all 256 combinations', ok);
  }

  // --- ALU: verify the REAL numbers used in quiz question 1 (5 + 4 on 4 bits) ---
  {
    const r = aluExecute(5, 4, 'ADD');
    check('ALU 5+4: result = 9 (1001)', r.result, 9);
    check('ALU 5+4: chuoi nhi phan = 1001', toBinString(r.result), '1001');
    checkTrue('ALU 5+4: Z = 0 (the result is non-zero)', r.flags.z === false);
    checkTrue('ALU 5+4: S = 1 (bit cao nhat = 1)', r.flags.s === true);
    checkTrue('ALU 5+4: C = 0 (9 <= 15, no unsigned overflow)', r.flags.c === false);
    checkTrue('ALU 5+4: V = 1 (+5 + +4 = +9 vuot [-8,7], tran co dau)', r.flags.v === true);
  }

  // --- ALU ADD: carry against overflow matches the reference across 256 combinations ---
  {
    let ok = true;
    for (let a = 0; a < 16; a++) {
      for (let b = 0; b < 16; b++) {
        const r = aluExecute(a, b, 'ADD');
        // Tham chieu: carry = tran khong dau; overflow = tong CO DAU ngoai [-8,7].
        const refCarry = a + b > 15;
        const signedSum = toSigned(a, 4) + toSigned(b, 4);
        const refOverflow = signedSum > 7 || signedSum < -8;
        if (r.flags.c !== refCarry) ok = false;
        if (r.flags.v !== refOverflow) ok = false;
        if (r.result !== ((a + b) & 0xf)) ok = false;
      }
    }
    checkTrue('ALU ADD: the C/V flags and result match the reference definition (256 combinations)', ok);
  }

  // --- ALU SUB: result and flags match the two's complement reference, 256 combinations ---
  {
    let ok = true;
    for (let a = 0; a < 16; a++) {
      for (let b = 0; b < 16; b++) {
        const r = aluExecute(a, b, 'SUB');
        if (r.result !== ((a - b) & 0xf)) ok = false;
        const refBorrow = a < b; // muon (borrow) theo khong dau
        const signedDiff = toSigned(a, 4) - toSigned(b, 4);
        const refOverflow = signedDiff > 7 || signedDiff < -8;
        if (r.flags.c !== refBorrow) ok = false;
        if (r.flags.v !== refOverflow) ok = false;
      }
    }
    checkTrue(
      'ALU SUB: twos-complement result, borrow (C) and signed overflow (V) match the reference (256 combinations)',
      ok
    );
  }

  // --- ALU logical AND/OR/XOR: correct bitwise, with C and V always false ---
  {
    const rAnd = aluExecute(0b1100, 0b1010, 'AND');
    check('ALU AND 1100 & 1010 = 1000', rAnd.result, 0b1000);
    const rOr = aluExecute(0b1100, 0b1010, 'OR');
    check('ALU OR 1100 | 1010 = 1110', rOr.result, 0b1110);
    const rXor = aluExecute(0b1100, 0b1010, 'XOR');
    check('ALU XOR 1100 ^ 1010 = 0110', rXor.result, 0b0110);
    checkTrue(
      'ALU logical operations: C and V are always false',
      !rAnd.flags.c && !rAnd.flags.v && !rOr.flags.c && !rOr.flags.v && !rXor.flags.c && !rXor.flags.v
    );
    checkTrue('ALU XOR of two equal values sets the Zero flag', aluExecute(0b1010, 0b1010, 'XOR').flags.z === true);
  }

  // --- Lesson 2: toy CPU fetch-decode-execute (Von Neumann: one RAM for code & data) ---
  {
    // Chuong trinh tuyen tinh: 5+3, luu ket qua vao RAM[10] (dung ALU cua Bai 1)
    const prog1 = [
      { op: 'LOADI', rd: 0, imm: 5 },
      { op: 'LOADI', rd: 1, imm: 3 },
      { op: 'ADD', rd: 2, rs1: 0, rs2: 1 },
      { op: 'STORE', rs: 2, addr: 10 },
      { op: 'HALT' },
    ];
    const { state: s1, steps: steps1 } = runProgram(prog1);
    check('Toy CPU: chuong trinh 5+3 -> R2 = 8', s1.regs[2], 8);
    check('Toy CPU: STORE writes the correct value 8 into RAM[10]', s1.ram[10], 8);
    check('Toy CPU: runs exactly 5 fetch-decode-execute cycles (5 instructions, no jumps)', steps1, 5);
    check('Toy CPU: PC stops at 5 after HALT (all 5 instructions fetched, incrementing each time)', s1.pc, 5);

    // Vong lap tinh tong 1+2+3+4+5 bang BEQ+JMP (kiem tra dung thu tu PC tang
    // TRUOC roi JMP/BEQ GHI DE PC o buoc execute - pitfall Muc 2.2)
    const prog2 = [
      { op: 'LOADI', rd: 0, imm: 5 }, // 0: R0 = counter = 5
      { op: 'LOADI', rd: 1, imm: 0 }, // 1: R1 = sum = 0
      { op: 'LOADI', rd: 2, imm: 0 }, // 2: R2 = 0 (hang so dieu kien dung)
      { op: 'LOADI', rd: 3, imm: 1 }, // 3: R3 = 1 (hang so tru)
      { op: 'BEQ', rs1: 0, rs2: 2, addr: 8 }, // 4: counter==0 -> thoat vong lap
      { op: 'ADD', rd: 1, rs1: 1, rs2: 0 }, // 5: sum += counter
      { op: 'SUB', rd: 0, rs1: 0, rs2: 3 }, // 6: counter -= 1
      { op: 'JMP', addr: 4 }, // 7: quay lai kiem tra dieu kien
      { op: 'HALT' }, // 8
    ];
    const { state: s2, steps: steps2 } = runProgram(prog2);
    check('Toy CPU: the BEQ/JMP loop correctly sums 1+2+3+4+5 = 15', s2.regs[1], 15);
    check('Toy CPU: the counter (R0) reaches exactly 0 after the loop', s2.regs[0], 0);
    check('Toy CPU: total fetch-decode-execute cycles (verified, not invented)', steps2, 26);

    // Pitfall Muc 2.1: self-modifying code — STORE vo tinh ghi de dung dia chi
    // dang la 1 lenh trong CHINH chuong trinh (Von Neumann: RAM chung, khong
    // co ranh gioi phan biet vung lenh/vung du lieu) — fetch ke tiep tai dia
    // chi do se doc phai RAC (khong con la lenh hop le) va nem loi.
    const progSelfModify = [
      { op: 'LOADI', rd: 0, imm: 99 },
      { op: 'STORE', rs: 0, addr: 2 }, // ghi de RAM[2] - dung vi tri lenh ke tiep!
      { op: 'LOADI', rd: 1, imm: 7 }, // se bi ghi de thanh so 99 truoc khi kip fetch
      { op: 'HALT' },
    ];
    let selfModifyThrew = false;
    try {
      runProgram(progSelfModify, 10);
    } catch (e) {
      selfModifyThrew = true;
    }
    checkTrue(
      'Self-modifying code pitfall: a STORE overwriting the CODE region makes the next fetch read garbage and throw (verified, not inferred)',
      selfModifyThrew
    );
  }

  // --- Lesson 3: RV32I assembler/decoder + the single-cycle datapath ---
  {
    // Khop CHINH XAC voi ma may that (verified bang tinh tay theo dac ta RISC-V)
    check(
      'assembleRV32I ADD x3,x1,x2 = 0x2081b3 (per the RV32I specification)',
      assembleRV32I('ADD', { rd: 3, rs1: 1, rs2: 2 }),
      0x2081b3
    );
    check(
      'assembleRV32I SUB x3,x1,x2 = 0x402081b3 (the funct7 flag bit distinguishes SUB from ADD)',
      assembleRV32I('SUB', { rd: 3, rs1: 1, rs2: 2 }),
      0x402081b3
    );
    check('assembleRV32I ADDI x1,x0,5 = 0x500093', assembleRV32I('ADDI', { rd: 1, rs1: 0, imm: 5 }), 0x500093);
    check('assembleRV32I LW x5,8(x2) = 0x812283', assembleRV32I('LW', { rd: 5, rs1: 2, imm: 8 }), 0x812283);
    check('assembleRV32I SW x5,8(x2) = 0x512423', assembleRV32I('SW', { rs1: 2, rs2: 5, imm: 8 }), 0x512423);

    // Khu hoi: assemble roi decode phai cho DUNG lai input ban dau
    for (const [mnemonic, args] of [
      ['ADD', { rd: 3, rs1: 1, rs2: 2 }],
      ['SUB', { rd: 7, rs1: 4, rs2: 5 }],
      ['AND', { rd: 1, rs1: 2, rs2: 3 }],
      ['OR', { rd: 1, rs1: 2, rs2: 3 }],
      ['XOR', { rd: 1, rs1: 2, rs2: 3 }],
      ['ADDI', { rd: 1, rs1: 0, imm: 5 }],
      ['LW', { rd: 5, rs1: 2, imm: 8 }],
      ['SW', { rs1: 2, rs2: 5, imm: 8 }],
    ]) {
      const word = assembleRV32I(mnemonic, args);
      const decoded = decodeRV32I(word);
      checkTrue(
        `RV32I round trip ${mnemonic}: decode(assemble(...)) returns the same mnemonic`,
        decoded.mnemonic === mnemonic
      );
    }

    // Datapath don chu ky: chuong trinh THAT (5+3)-2, luu vao mem[100], doc lai
    const program = [
      assembleRV32I('ADDI', { rd: 1, rs1: 0, imm: 5 }),
      assembleRV32I('ADDI', { rd: 2, rs1: 0, imm: 3 }),
      assembleRV32I('ADD', { rd: 3, rs1: 1, rs2: 2 }),
      assembleRV32I('ADDI', { rd: 4, rs1: 0, imm: 2 }),
      assembleRV32I('SUB', { rd: 5, rs1: 3, rs2: 4 }),
      assembleRV32I('SW', { rs1: 0, rs2: 5, imm: 100 }),
      assembleRV32I('LW', { rd: 6, rs1: 0, imm: 100 }),
    ];
    const { regs, mem } = runRV32IProgram(program);
    check('RV32I datapath: x3 = 5+3 = 8 (using the aluExecute of Lesson 1)', regs[3], 8);
    check('RV32I datapath: x5 = (5+3)-2 = 6', regs[5], 6);
    check('RV32I datapath: SW correctly writes mem[100] = 6', mem[100], 6);
    check('RV32I datapath: LW reads it back correctly as x6 = 6', regs[6], 6);

    // x0 la thanh ghi cung, MOI lenh ghi vao x0 deu bi bo qua
    const programX0 = [assembleRV32I('ADDI', { rd: 0, rs1: 0, imm: 42 })];
    const { regs: regsX0 } = runRV32IProgram(programX0);
    check('RV32I x0 is hard-wired: writing 42 to x0 still reads back 0', regsX0[0], 0);
  }

  // --- Lesson 4: the 5-stage pipeline - time/CPI + RAW and load-use hazards ---
  {
    // Muc 4.2: 1 trieu lenh, pipeline 5 giai doan, xung nhip 2GHz (0,5ns/chu ky)
    check(
      'pipelineTime: 1 million instructions, 5 stages, NO stalls, 2GHz -> 500,002 ns',
      pipelineTime(1_000_000, 5, 0, 0.5),
      500002
    );
    check(
      'pipelineTime: the SAME program with 200,000 stalls -> 600,002 ns',
      pipelineTime(1_000_000, 5, 200_000, 0.5),
      600002
    );
    check(
      'pipelineCPI: no stalls = 1 (the whole point of pipelining - 1 instruction per cycle in steady state)',
      pipelineCPI(1_000_000, 0),
      1
    );
    checkTrue(
      'pipelineCPI: 200,000 stalls over 1 million instructions = 1.2 (effective CPI rises exactly with the stall ratio)',
      Math.abs(pipelineCPI(1_000_000, 200_000) - 1.2) < 1e-9
    );

    // Muc 4.3/4.4: day lenh THAT (tai dung decodeRV32I cua Bai 3) co 2 RAW hazard lien tiep
    // ADDI x1,x0,20 / ADD x2,x1,x1 (doc x1) / SUB x3,x2,x1 (doc x2 VA x1)
    const seqRAW = [
      decodeRV32I(assembleRV32I('ADDI', { rd: 1, rs1: 0, imm: 20 })),
      decodeRV32I(assembleRV32I('ADD', { rd: 2, rs1: 1, rs2: 1 })),
      decodeRV32I(assembleRV32I('SUB', { rd: 3, rs1: 2, rs2: 1 })),
    ];
    const withFwd = detectHazards(seqRAW, true);
    const noFwd = detectHazards(seqRAW, false);
    check(
      'detectHazards WITH forwarding: 2 RAW hazards but 0 stalls (forwarding solves them COMPLETELY)',
      withFwd.totalStalls,
      0
    );
    check(
      'detectHazards WITHOUT forwarding: the SAME 2 hazards cost exactly 4 stalls (2 per hazard, waiting for WB)',
      noFwd.totalStalls,
      4
    );

    // Load-use hazard: LW x1,0(x2) roi dung NGAY x1 - forwarding KHONG cuu duoc
    const seqLoadUse = [
      decodeRV32I(assembleRV32I('LW', { rd: 1, rs1: 2, imm: 0 })),
      decodeRV32I(assembleRV32I('ADD', { rd: 3, rs1: 1, rs2: 1 })),
    ];
    const loadUseResult = detectHazards(seqLoadUse, true);
    check(
      'Load-use pitfall: LW then using the result IMMEDIATELY - forwarding STILL needs exactly 1 stall (it cannot reach 0)',
      loadUseResult.totalStalls,
      1
    );
    checkTrue(
      'Load-use pitfall: the hazard is labelled LOAD_USE (distinct from an ordinary RAW)',
      loadUseResult.hazards[0].type === 'LOAD_USE'
    );
  }

  // --- Lesson 5: 1-bit and 2-bit branch predictors + BHT + effective CPI ---
  {
    // Chuoi vong lap long nhau: vong ngoai 3 lan, vong trong 4 lan T roi 1 N
    // (TTTTN lap lai 3 lan) - dung de minh hoa pitfall dao dong cua bo 1-bit
    const nestedLoop = [];
    for (let outer = 0; outer < 3; outer++) {
      for (let inner = 0; inner < 4; inner++) nestedLoop.push('T');
      nestedLoop.push('N');
    }
    check('The nested loop sequence contains exactly 15 branches (3x5)', nestedLoop.length, 15);

    const r1 = runPredictor(makeBranchPredictor1Bit(), nestedLoop);
    check('1-bit predictor on the nested loop: 9/15 correct (60%)', r1.correct, 9);
    checkTrue('1-bit predictor: accuracy = 0.6', Math.abs(r1.rate - 0.6) < 1e-9);

    const r2 = runPredictor(makeBranchPredictor2Bit(), nestedLoop);
    check('2-bit predictor on the SAME sequence: 10/15 correct (66.7% - better than 1-bit)', r2.correct, 10);
    checkTrue('2-bit predictor: accuracy = 2/3', Math.abs(r2.rate - 2 / 3) < 1e-9);

    // Pitfall Muc 5.2: 1-bit doan sai NGAY tai moi diem chuyen N->T va T->N
    // (dao dong lien tuc), con 2-bit CHIU DUNG 1 lan sai don le nho bao hoa
    checkTrue(
      'Pitfall: the 1-bit predictor mispredicts at BOTH edges of every inner loop (N->T and T->N)',
      !r1.trace[0].hit && !r1.trace[4].hit && !r1.trace[5].hit
    );
    checkTrue(
      '2-bit: once saturated at strongly-taken (state=3), a single stray N does NOT flip the next prediction',
      r2.trace[5].predicted === 'T' // dung ngay sau N dau tien, van doan T (khac 1-bit)
    );

    // BHT: 2 dia chi nhanh KHAC NHAU phai co lich su rieng, khong tron lan
    {
      const bht = makeBranchHistoryTable();
      const seqA = ['T', 'T', 'T', 'T']; // dia chi 100: luon nhay
      const seqB = ['N', 'N', 'N', 'N']; // dia chi 200: khong bao gio nhay
      let correctA = 0;
      let correctB = 0;
      for (const actual of seqA) {
        if (bht.predict(100) === actual) correctA++;
        bht.update(100, actual);
      }
      for (const actual of seqB) {
        if (bht.predict(200) === actual) correctB++;
        bht.update(200, actual);
      }
      // Dia chi 100 khoi dong tu state 0 (doan N) nen 2 lan dau sai truoc khi
      // hoc du de vuot nguong state>=2 - dung 2/4; dia chi 200 khop ngay tu
      // dau (state 0 da doan N) nen dung ca 4/4.
      check(
        'BHT: address 100 (always taken) learns gradually, 2/4 correct (the first 2 wrong during warm-up)',
        correctA,
        2
      );
      check('BHT: address 200 (never taken) matches from the start, 4/4 correct', correctB, 4);
      check('BHT: the LAST prediction for address 100 is correct (T) once learned', bht.predict(100), 'T');
      check('BHT: exactly 2 separate entries exist for the 2 different addresses', bht.size(), 2);
    }

    // Muc 5.3: CPI hieu dung - bai toan thuc te 20% lenh re nhanh, 10% doan
    // sai, penalty 3 chu ky, CPI ly tuong = 1 -> 1 + 0.2*0.1*3 = 1.06
    checkTrue(
      'effectiveCPI(1, 0.2, 0.1, 3) = 1.06 (20% branches x 10% mispredictions x 3 penalty cycles)',
      Math.abs(effectiveCPI(1, 0.2, 0.1, 3) - 1.06) < 1e-9
    );
    checkTrue(
      'effectiveCPI with no branches at all (branchFreq=0) equals the ideal CPI',
      effectiveCPI(1, 0, 0.1, 3) === 1
    );
  }

  // --- Lesson 6: out-of-order Tomasulo - RS/CDB/ROB, renaming removes WAR/WAW ---
  {
    // Vi du kinh dien: instr1 MUL ghi R1 (do lau), instr2 ADD ghi R2 (WAR -
    // doc R2 ma instr1 KHONG doc, chi la trung dich voi mot lenh SAU doc R2...
    // that ra day la WAR that: instr1 la nguoi tieu thu R2 CU truoc khi bi
    // ghi de) - RAT phai doi ten de instr2 khong can doi instr1; instr3 SUB
    // ghi LAI R1 (WAW voi instr1) - RAT doi ten de instr3 khong can doi
    // instr1 hoan tat, va COMMIT dung thu tu chuong trinh dam bao R1 cuoi
    // cung la gia tri CUA INSTR3 (ghi sau trong chuong trinh) chu khong phai
    // instr1 (WAW dung nghia: "nguoi ghi sau thang").
    const initialRegs = [0, 10, 3, 4, 5, 6, 20, 2];
    const program = [
      { op: 'MUL', dest: 1, src1: 2, src2: 3 }, // R1 = R2*R3 = 3*4 = 12 (do lau, mulLatency)
      { op: 'ADD', dest: 2, src1: 4, src2: 5 }, // R2 = R4+R5 = 5+6 = 11 (WAR tren R2 voi instr1)
      { op: 'SUB', dest: 1, src1: 6, src2: 7 }, // R1 = R6-R7 = 20-2 = 18 (WAW tren R1 voi instr1)
    ];
    const result = runTomasulo(program, { initialRegs });

    check(
      'Tomasulo: final R1 = 18 (from instr3 SUB, in correct program order thanks to in-order commit)',
      result.regFile[1],
      18
    );
    check('Tomasulo: final R2 = 11 (from instr2 ADD)', result.regFile[2], 11);
    check('Tomasulo: total cycles (actually verified, not invented)', result.totalCycles, 9);
    checkTrue('Tomasulo: IPC = 3/9 = 0,333...', Math.abs(result.ipc - 3 / 9) < 1e-9);

    checkTrue(
      'WAR pitfall: instr2 (writing R2) begins EXECUTING at cycle 3, before instr1 (the MUL reading R2) finishes writeback at cycle 6 - renaming removes the WAR stall entirely',
      result.trace[1].execStart < result.trace[0].writeback
    );
    checkTrue(
      'Out-of-order completion: instr2 writes back at cycle 5, BEFORE instr1 at cycle 6 - computation completes out of program order',
      result.trace[1].writeback < result.trace[0].writeback
    );
    checkTrue(
      'Yet commit is in order: instr1 commits BEFORE instr2, instr2 BEFORE instr3 - program order holds despite out-of-order completion',
      result.trace[0].commit < result.trace[1].commit && result.trace[1].commit < result.trace[2].commit
    );

    // --- Muc 6.5: NGOAI LE CHINH XAC - ly do that su ROB ton tai ---
    // Kich ban A: lenh 1 (MUL) gay loi. Lenh 2 (ADD) da tinh xong TU TRUOC
    // (writeback cycle 5 < cycle 6 cua MUL) du no nam SAU trong chuong trinh.
    const faultA = architecturalStateOnFault(program, { initialRegs, faultAt: 0 });
    check(
      'Precise (with a ROB), fault at instruction 1: R2 is still its INITIAL value 3 - nothing has committed',
      faultA.precise[2],
      3
    );
    check(
      'Imprecise (no ROB), fault at instruction 1: R2 has been overwritten to 11 by instruction 2 - an instruction NOT yet allowed to run',
      faultA.imprecise[2],
      11
    );
    checkTrue(
      'Imprecise: exactly 1 instruction from the FUTURE has dirtied the state',
      faultA.leakedFromFuture.length === 1
    );

    // Kich ban B: loi o lenh 2. Lan nay hong theo huong NGUOC LAI - lenh 1
    // (MUL, writeback cycle 6) van CHUA kip ghi khi loi lo ra o cycle 5.
    const faultB = architecturalStateOnFault(program, { initialRegs, faultAt: 1 });
    check(
      'Precise (with a ROB), fault at instruction 2: R1 = 12 - instruction 1 HAS committed, exactly as the program requires',
      faultB.precise[1],
      12
    );
    check(
      'Imprecise (no ROB), fault at instruction 2: R1 is still 10 - instruction 1 comes BEFORE the fault yet has not taken effect',
      faultB.imprecise[1],
      10
    );
    checkTrue(
      'Conclusion: the imprecise state differs from the precise one in BOTH scenarios - it matches no point in the program at all, so it cannot be resumed',
      faultA.imprecise[2] !== faultA.precise[2] && faultB.imprecise[1] !== faultB.precise[1]
    );

    // Doi chung: cung chuong trinh nhung KHONG co WAR/WAW (dest khac nhau
    // hoan toan) - tong chu ky phai <= truong hop co WAW/WAR o tren (khong
    // te hon), chung minh renaming khong lam cham di so voi truong hop
    // khong co xung dot gia
    const programNoConflict = [
      { op: 'MUL', dest: 1, src1: 2, src2: 3 },
      { op: 'ADD', dest: 4, src1: 4, src2: 5 }, // dest khac (R4 thay vi R2)
      { op: 'SUB', dest: 5, src1: 6, src2: 7 }, // dest khac (R5 thay vi R1)
    ];
    const resultNoConflict = runTomasulo(programNoConflict, { initialRegs });
    check(
      'Tomasulo control case (no WAR/WAW): the cycle count equals the WAR/WAW case (renaming makes both equally fast)',
      resultNoConflict.totalCycles,
      result.totalCycles
    );
  }

  // --- Lesson 7: cache tag/index/offset, direct-mapped and set-associative, AMAT ---
  {
    // splitAddress: dia chi 0x1234 (4660) voi offsetBits=4, indexBits=2
    // -> offset = 4 bit thap = 0x4, index = 2 bit tiep = binary cua (4660>>4)&0b11
    check('splitAddress(0x1234, 4, 2).offset = 0x4', splitAddress(0x1234, 4, 2).offset, 0x4);
    checkTrue(
      'splitAddress round trip: recombining tag<<(offset+index) | index<<offset | offset gives the original address',
      (() => {
        const { tag, index, offset } = splitAddress(0x1234, 4, 2);
        return ((tag << 6) | (index << 4) | offset) === 0x1234;
      })()
    );

    // Pitfall 7.1 Locality: mang 8x8 phan tu 4-byte, duyet theo HANG (spatial
    // locality tot) vs duyet theo COT (spatial locality te - nhay xa moi lan)
    // - CUNG mot cache 4 dong x 16 byte/dong (64 byte tong)
    const R = 8,
      C = 8,
      ELEM = 4;
    const addrOf = (row, col) => (row * C + col) * ELEM;
    const rowMajorAddrs = [];
    for (let row = 0; row < R; row++) for (let col = 0; col < C; col++) rowMajorAddrs.push(addrOf(row, col));
    const colMajorAddrs = [];
    for (let col = 0; col < C; col++) for (let row = 0; row < R; row++) colMajorAddrs.push(addrOf(row, col));

    const offsetBits = 4; // 16 byte/dong = 4 phan tu/dong
    const numSets = 4;

    const rowResult = runCacheTrace(makeDirectMappedCache(numSets, offsetBits), rowMajorAddrs);
    check(
      'Walking BY ROW (good spatial locality): 16/64 misses (25% - one per line of 4 elements)',
      rowResult.misses,
      16
    );
    checkTrue('Walking BY ROW: missRate = 0.25', Math.abs(rowResult.missRate - 0.25) < 1e-9);

    const colResult = runCacheTrace(makeDirectMappedCache(numSets, offsetBits), colMajorAddrs);
    check(
      'Locality pitfall: walking BY COLUMN (spatial locality lost entirely) - 100% misses (64/64), 4 times worse than by row',
      colResult.misses,
      64
    );

    // Conflict miss: 2 dia chi CUNG index nhung KHAC tag lam Direct-Mapped
    // "da nhau" lien tuc; Set-Associative 2-way giu duoc CA HAI cung luc
    const lineSize = 16;
    const addrA = 0; // index 0, tag 0
    const addrB = numSets * lineSize; // index 0 (trung voi A), tag 1
    const conflictAddrs = [];
    for (let i = 0; i < 10; i++) {
      conflictAddrs.push(addrA);
      conflictAddrs.push(addrB);
    }
    const dmResult = runCacheTrace(makeDirectMappedCache(numSets, offsetBits), conflictAddrs);
    check(
      'Conflict miss pitfall: direct-mapped with 2 addresses sharing an index but not a tag - 100% misses (20/20), evicting each other continuously',
      dmResult.misses,
      20
    );
    const saResult = runCacheTrace(makeSetAssociativeCache(numSets, 2, offsetBits), conflictAddrs);
    check(
      '2-way set-associative solves that conflict miss COMPLETELY: only 2/20 misses (the first 2, compulsory)',
      saResult.misses,
      2
    );

    // AMAT 1 cap va 2 cap - vi du kinh dien (P&H): 2% mien L1, L2 hit=10,
    // 25% mien L2 CUC BO, phat DRAM=200 chu ky -> AMAT = 2,2 chu ky
    checkTrue('amat(1, 0.05, 100) = 6 cycles (1 + 0.05*100)', Math.abs(amat(1, 0.05, 100) - 6) < 1e-9);
    checkTrue(
      'amatTwoLevel(1, 0.02, 10, 0.25, 200) = 2.2 cycles (the classic Patterson & Hennessy example)',
      Math.abs(amatTwoLevel(1, 0.02, 10, 0.25, 200) - 2.2) < 1e-9
    );
    checkTrue(
      'Local against global miss rate pitfall: the global L2 miss rate (over ALL accesses) = missRateL1*missRateL2Local = 0.02*0.25 = 0.005 - quite different from the local 0.25',
      Math.abs(0.02 * 0.25 - 0.005) < 1e-9
    );

    // --- Muc 7.4: chinh sach ghi (write-through vs write-back) ---
    // Kich ban: cong don vao MOT bien (doc roi ghi cung dia chi) 10 lan.
    const rmwAccesses = [];
    for (let i = 0; i < 10; i++) {
      rmwAccesses.push({ address: 0, isWrite: false });
      rmwAccesses.push({ address: 0, isWrite: true });
    }
    const wtResult = runWriteTrace(makeWritePolicyCache(4, 2, 4, { writePolicy: 'through' }), rmwAccesses);
    const wbResult = runWriteTrace(makeWritePolicyCache(4, 2, 4, { writePolicy: 'back' }), rmwAccesses);
    check('write-through: 10 stores -> 10 writes down to DRAM', wtResult.memWrites, 10);
    check('write-back: 10 stores to the SAME line -> only 1 write down to DRAM (at the flush)', wbResult.memWrites, 1);
    checkTrue(
      'The key point: both write policies have the SAME hit rate (19/20) - they differ in DRAM TRAFFIC, not in hit rate',
      wtResult.hits === 19 && wbResult.hits === 19
    );

    // --- Muc 7.5: phan loai 3C (compulsory / capacity / conflict) ---
    // Chuoi conflict cua Muc 7.2, do lai bang 3C: gan nhu TOAN BO la conflict,
    // va tang associativity len 2-way xoa sach chung.
    const conflictSeq = [];
    for (let i = 0; i < 10; i++) {
      conflictSeq.push(0);
      conflictSeq.push(numSets * lineSize);
    }
    const c3dm = classifyMisses(conflictSeq, numSets, 1, offsetBits);
    const c3sa = classifyMisses(conflictSeq, numSets, 2, offsetBits);
    check(
      '3C on the conflict trace, direct-mapped: 20 misses = 2 compulsory + 0 capacity + 18 conflict',
      c3dm.conflict,
      18
    );
    checkTrue(
      '3C: the three categories sum to the total miss count',
      c3dm.compulsory + c3dm.capacity + c3dm.conflict === c3dm.total
    );
    check('3C on the same trace at 2-way: conflict misses vanish entirely (down to 0)', c3sa.conflict, 0);
    check('3C on the same trace at 2-way: only 2 unavoidable compulsory misses remain', c3sa.total, 2);
    // Cung mot ty le miss cao, nhung CHAN DOAN khac han: duyet theo cot 100%
    // miss lai KHONG phai conflict ma la capacity - chua bang cache to hon,
    // khong phai bang tang associativity. Do chinh la ly do phai phan loai 3C.
    const c3col = classifyMisses(colMajorAddrs, numSets, 1, offsetBits);
    check('3C on the COLUMN walk: 64 misses = 16 compulsory + 48 capacity + 0 conflict', c3col.capacity, 48);
    check('3C on the COLUMN walk: 0 conflict misses - raising associativity would NOT help', c3col.conflict, 0);
  }

  // --- Lesson 8: virtual memory - translation via TLB + page table, page table size ---
  {
    const pageOffsetBits = 12; // trang 4KB
    const pageTable = new Map([
      [5, 100],
      [6, 200],
    ]); // VPN 5 -> PFN 100, VPN 6 -> PFN 200

    // Khu hoi VPN/offset
    checkTrue(
      'splitVirtualAddress round trip returns the original address',
      (() => {
        const va = (5 << pageOffsetBits) | 0x123;
        const { vpn, offset } = splitVirtualAddress(va, pageOffsetBits);
        return ((vpn << pageOffsetBits) | offset) === va;
      })()
    );

    const tlb = makeTLB(4);
    const va1 = (5 << pageOffsetBits) | 0x123;
    const r1 = translateAddress(va1, pageOffsetBits, tlb, pageTable);
    check(
      'First access to VPN5: TLB MISS but page table HIT, translating to the correct PA',
      r1.physicalAddress,
      (100 << pageOffsetBits) | 0x123
    );
    checkTrue('First access to VPN5: tlbHit=false (not in the TLB yet)', r1.tlbHit === false);
    checkTrue('First access to VPN5: no page fault (the VPN is in the page table)', r1.pageFault === false);

    const r2 = translateAddress(va1, pageOffsetBits, tlb, pageTable);
    checkTrue(
      'SECOND access to the SAME VPN5: TLB HIT (cached from before) - saving one page table lookup',
      r2.tlbHit === true
    );
    check('The second access translates to the same correct PA as the first', r2.physicalAddress, r1.physicalAddress);

    const va4 = (7 << pageOffsetBits) | 0; // VPN 7 khong co trong Page Table
    const r4 = translateAddress(va4, pageOffsetBits, tlb, pageTable);
    checkTrue('Pitfall: accessing an unmapped VPN (VPN 7) -> page fault = true', r4.pageFault === true);
    check('Page fault: physicalAddress = null (no translation possible)', r4.physicalAddress, null);

    // Dung luong Page Table don cap: 32-bit, trang 4KB, PTE 4-byte -> 4MB
    check('pageTableEntryCount(32, 12) = 2^20 trang ao co the co', pageTableEntryCount(32, 12), Math.pow(2, 20));
    check(
      'singleLevelPageTableSizeBytes(32, 12, 4) = 4,194,304 bytes (exactly 4MB) - the REAL size of a single-level 32-bit page table',
      singleLevelPageTableSizeBytes(32, 12, 4),
      4 * 1024 * 1024
    );
    checkTrue(
      'Section 8.2 pitfall: a 48-bit address space (what 64-bit machines really use) with the same SINGLE-LEVEL page table would need 256GB - entirely impossible',
      Math.abs(singleLevelPageTableSizeBytes(48, 12, 4) / (1024 * 1024 * 1024) - 256) < 1e-6
    );

    // Dung luong Page Table 2 cap (kieu x86 10-10-12): 512 trang dang dung
    // (2MB) tren khong gian 32-bit -> chi 8KB, RE HON HANG TRAM LAN so voi
    // don cap (4MB) vi bang cap 2 CHI cap phat cho vung THAT SU dang dung.
    check(
      'Two-level: 512 pages in use (2MB), entriesPerTable=1024, entryBytes=4 -> 8192 bytes (8KB)',
      twoLevelPageTableSizeBytes(512, 1024, 4),
      8192
    );
    checkTrue(
      'A two-level page table saves ENORMOUSLY over a single-level one when only a small part of the address space is used (8KB against 4MB = 512 times cheaper)',
      singleLevelPageTableSizeBytes(32, 12, 4) / twoLevelPageTableSizeBytes(512, 1024, 4) === 512
    );
  }

  // --- Lesson 9: Apple Silicon & UMA - frame size + bandwidth comparison ---
  {
    // Khung hinh 4K (3840x2160), 32-bit mau (4 byte/pixel) = 33.177.600 byte
    check(
      'frameBytes(3840, 2160, 4) = 33.177.600 byte (khung hinh 4K, 32-bit mau)',
      frameBytes(3840, 2160, 4),
      33177600
    );

    // PCIe Gen 4 x16 (~32 GB/s that te) vs UMA Apple M1 Max (400 GB/s, cong bo chinh thuc Apple)
    const bytes4K = frameBytes(3840, 2160, 4);
    const pcieGBps = 32;
    const umaGBps = 400;
    const cmp = compareTransferMethods(bytes4K, pcieGBps, umaGBps);
    checkTrue('PCIe: thoi gian truyen 1 khung 4K ~ 1,0368 ms', Math.abs(cmp.pcieTimeMs - 1.0368) < 1e-3);
    checkTrue('UMA: DIRECT access time for the SAME 4K frame ~ 0.0829 ms', Math.abs(cmp.umaTimeMs - 0.0829) < 1e-3);
    checkTrue(
      'UMA beats PCIe by EXACTLY the bandwidth ratio (400/32 = 12.5x) - not an arbitrary figure',
      Math.abs(cmp.speedupFactor - 12.5) < 1e-9
    );

    // Pitfall Muc 9.4: so sanh THO xung nhip khong tinh den bang thong bo nho
    // - o day, chenh lech 12,5 lan hoan toan den tu BANG THONG (400 vs 32
    // GB/s), KHONG lien quan gi den xung nhip CPU/GPU
    checkTrue(
      'Pitfall: the 12.5x gap comes from the RAM BANDWIDTH RATIO, not from a faster or slower CPU clock',
      Math.abs(cmp.speedupFactor - umaGBps / pcieGBps) < 1e-9
    );

    // Boi canh 60fps: PCIe chiem ty trong dang ke ngan sach 1 khung hinh,
    // UMA gan nhu khong dang ke
    const frameBudgetMs = 1000 / 60;
    checkTrue(
      'PCIe: thoi gian truyen chiem ~6,22% ngan sach 1 khung hinh o 60fps (16,67ms) - dang ke',
      Math.abs((cmp.pcieTimeMs / frameBudgetMs) * 100 - 6.22) < 0.01
    );
    checkTrue(
      'UMA: the access takes only ~0.5% of the per-frame budget at 60fps - negligible',
      (cmp.umaTimeMs / frameBudgetMs) * 100 < 1
    );
  }

  // --- Lesson 10: hardware acceleration - matrix FLOPs + sequential/SIMD/GPU ---
  {
    // Nhan ma tran 1024x1024: N^2*(2N-1) = 2N^3 - N^2 = 2.146.435.072 FLOPs
    check(
      'matrixMultiplyFlops(1024) = 2,146,435,072 FLOPs (matching the formula N^2*(2N-1))',
      matrixMultiplyFlops(1024),
      2146435072
    );
    check('matrixMultiplyFlops(2) = 12 FLOPs (each of the 4 elements costs 2*2-1=3 FLOPs)', matrixMultiplyFlops(2), 12);

    // So sanh 3 kien truc: scalar 4 GFLOPS, SIMD 32 GFLOPS (AVX 8-wide = 8x scalar), GPU 10 TFLOPS
    const cmpCompute = compareComputeMethods(1024, 4, 32, 10);
    checkTrue(
      'Scalar (4 GFLOPS): ~0.5366 seconds for a 1024x1024 matrix',
      Math.abs(cmpCompute.scalarTimeSeconds - 0.5366) < 1e-3
    );
    checkTrue(
      'SIMD (32 GFLOPS): ~0.0671 seconds - beating scalar by EXACTLY the vector width (8x)',
      Math.abs(cmpCompute.simdTimeSeconds - 0.0671) < 1e-3
    );
    checkTrue(
      'SIMD beats scalar by EXACTLY 8x (= 32/4, the AVX vector width, not an arbitrary figure)',
      Math.abs(cmpCompute.scalarTimeSeconds / cmpCompute.simdTimeSeconds - 8) < 1e-6
    );
    checkTrue(
      'GPU (10 TFLOPS): ~0.000215 seconds (0.215 ms) - 2500 times faster than scalar',
      Math.abs(cmpCompute.gpuTimeSeconds - 0.000215) < 1e-6
    );
    checkTrue(
      'The GPU beats scalar by exactly 2500x (= 10000/4, the TFLOPS to GFLOPS ratio)',
      Math.abs(cmpCompute.scalarTimeSeconds / cmpCompute.gpuTimeSeconds - 2500) < 1
    );

    // Pitfall Muc 10.4: ma tran QUA NHO, overhead nap du lieu vao GPU lam GPU
    // CHAM HON ca CPU vo huong - verified thuc te bang engine
    const cmpSmall = compareComputeMethods(4, 4, 32, 10, 0.0001); // GPU co 0,1ms overhead co dinh
    checkTrue(
      'Pitfall: a 4x4 matrix is TOO SMALL - the GPU (carrying 0.1ms of load overhead) is SLOWER than scalar (which has none)',
      cmpSmall.gpuTimeSeconds > cmpSmall.scalarTimeSeconds
    );

    // --- Muc 10.4: Roofline - thong luong dinh chi dat duoc neu DU du lieu ---
    // GPU 10 TFLOPS voi bang thong 600 GB/s: diem gay (ridge) o 16,7 FLOP/byte.
    const BW = 600e9;
    const PEAK = 10e12;
    const ridge = PEAK / BW;
    checkTrue('Roofline: ridge point = 10e12/600e9 = 16.67 FLOP/byte', Math.abs(ridge - 16.666666666666668) < 1e-9);

    const aiMatmul = matmulArithmeticIntensity(1024, 4);
    const rMatmul = rooflineAttainable(aiMatmul, PEAK, BW);
    checkTrue(
      'Roofline: the AI of a 1024 matmul (FP32, ideally tiled) ~ 170.58 FLOP/byte',
      Math.abs(aiMatmul - 170.58333333333334) < 1e-9
    );
    check('Roofline: matmul sits RIGHT of the ridge -> COMPUTE-bound, not bandwidth-bound', rMatmul.bound, 'compute');
    checkTrue('Roofline: matmul reaches 100% of peak throughput', Math.abs(rMatmul.fractionOfPeak - 1) < 1e-12);

    // Doi chung tren CUNG phan cung: cong vector co AI co dinh 0,167 - thap hon
    // ridge gan 100 lan, nen chi dung duoc 1% suc manh cua chinh cai GPU do.
    const aiVecAdd = vectorAddArithmeticIntensity(4);
    const rVecAdd = rooflineAttainable(aiVecAdd, PEAK, BW);
    check('Roofline: vector addition is MEMORY-bound', rVecAdd.bound, 'memory');
    checkTrue(
      'Roofline: vector addition reaches only 100 GFLOPS = 1% of peak on that SAME GPU',
      Math.abs(rVecAdd.attainable - 100e9) < 1
    );
    checkTrue(
      'Roofline conclusion: on one GPU, matmul uses 100% of the power and vector addition just 1% - peak FLOPS is NOT enough to predict performance',
      rMatmul.fractionOfPeak / rVecAdd.fractionOfPeak === 100
    );

    // --- Muc 10.5: phan ky warp ---
    const warpUniform = warpDivergence(new Array(32).fill(true));
    check('Uniform warp (all 32 threads the same way): 1 pass', warpUniform.passes, 1);
    checkTrue('Uniform warp: 100% efficiency', warpUniform.efficiency === 1);

    const warpHalf = warpDivergence(Array.from({ length: 32 }, (_, i) => i < 16));
    check('Warp split 16/16: must run 2 sequential passes', warpHalf.passes, 2);
    checkTrue('Split warp: efficiency drops to 50%', warpHalf.efficiency === 0.5);

    // Con so dang nho nhat cua ca muc: KHONG phai chia deu moi te.
    const warpOne = warpDivergence(Array.from({ length: 32 }, (_, i) => i === 0));
    check('JUST ONE stray thread in 32: still 2 passes', warpOne.passes, 2);
    checkTrue(
      'JUST ONE stray thread drops the whole warp to 50% efficiency - identical to the even 16/16 split',
      warpOne.efficiency === warpHalf.efficiency
    );
  }

  // --- Lesson 11: Poisson/Murphy yield + wafer cost - monolithic against chiplet ---
  {
    // Wafer 300mm (chuan cong nghiep), gia wafer 10.000 USD (minh hoa), mat
    // do loi 0,001 loi/mm^2 (= 0,1 loi/cm^2, gia tri sach giao khoa pho bien)
    const waferDiameter = 300;
    const waferCost = 10000;
    const defectDensity = 0.001;
    const monoArea = 600; // mm^2 - die nguyen khoi lon
    const chipletArea = 150; // mm^2 - 4 chiplet = tuong duong logic voi 1 die 600mm^2

    check(
      'diesPerWafer(300mm, 600mm^2) = 90 die/wafer (die nguyen khoi lon)',
      diesPerWafer(waferDiameter, monoArea),
      90
    );
    check(
      'diesPerWafer(300mm, 150mm^2) = 416 dies per wafer (a chiplet 4 times smaller yields MORE than 4 times as many)',
      diesPerWafer(waferDiameter, chipletArea),
      416
    );

    checkTrue(
      'yieldMurphy(mono, 600mm^2) = 0.5655 (56.55% of dies pass)',
      Math.abs(yieldMurphy(monoArea, defectDensity) - 0.5655) < 1e-3
    );
    checkTrue(
      'yieldMurphy(chiplet, 150mm^2) = 0.8623 (86.23% - a SMALLER die yields far BETTER)',
      Math.abs(yieldMurphy(chipletArea, defectDensity) - 0.8623) < 1e-3
    );
    checkTrue(
      'yieldPoisson(mono) < yieldMurphy(mono) - Poisson is more pessimistic than Murphy for large dies',
      yieldPoisson(monoArea, defectDensity) < yieldMurphy(monoArea, defectDensity)
    );

    const costMono = costPerGoodDie(waferCost, monoArea, waferDiameter, defectDensity, yieldMurphy);
    const costChiplet1 = costPerGoodDie(waferCost, chipletArea, waferDiameter, defectDensity, yieldMurphy);
    const costChipletTotal4 = costChiplet1 * 4; // can DUNG 4 chiplet tot cho 1 san pham hoan chinh

    checkTrue('Cost of 1 good monolithic die ~ 196.49 USD', Math.abs(costMono - 196.49) < 0.1);
    checkTrue('Cost of 4 good chiplets (1 finished product) ~ 111.51 USD', Math.abs(costChipletTotal4 - 111.51) < 0.1);
    checkTrue(
      'The economic driver: chiplets are ~43% CHEAPER than monolithic for the SAME logic - the real reason the industry moved to chiplets',
      costChipletTotal4 < costMono && 1 - costChipletTotal4 / costMono > 0.4
    );

    // --- Muc 11.5: con so 43% CHI dem tien silicon ---
    // Chiplet phai tra them: de interposer, test tung die truoc khi ghep, va
    // ghep hong ca goi thi mat trang toan bo silicon tot ben trong.
    const pkgBase = {
      waferCostUsd: waferCost,
      waferDiameterMm: waferDiameter,
      defectDensity,
      yieldFn: yieldMurphy,
      perDieTestUsd: 1,
      assemblyPerDieUsd: 2,
    };
    const monoPkg = chipletPackagedCost({ ...pkgBase, dieAreaMm2: 600, numDies: 1, packageYield: 0.99 });
    const chipPkg = chipletPackagedCost({
      ...pkgBase,
      dieAreaMm2: 150,
      numDies: 4,
      interposerCostUsd: 15,
      packageYield: 0.97,
    });
    checkTrue('Counting packaging too: monolithic ~201.51 USD', Math.abs(monoPkg.total - 201.51) < 0.1);
    checkTrue('Counting packaging too: chiplet ~142.79 USD', Math.abs(chipPkg.total - 142.79) < 0.1);
    checkTrue(
      'The real saving is ~29%, NOT 43% - the 43% counts silicon only, ignoring the interposer, testing and assembly risk',
      Math.abs((1 - chipPkg.total / monoPkg.total) * 100 - 29) < 1
    );
    checkTrue('Packaging is ~19.5% of the chiplet bill, against 1.5% for monolithic', chipPkg.packagingShare > 0.15);

    // Va day la ly do chip NHO van lam nguyen khoi: chia nho mot con chip da
    // co yield cao san thi phan tiet kiem silicon khong bu noi tien dong goi.
    const smallMono = chipletPackagedCost({ ...pkgBase, dieAreaMm2: 100, numDies: 1, packageYield: 0.99 });
    const smallChiplet = chipletPackagedCost({
      ...pkgBase,
      dieAreaMm2: 25,
      numDies: 4,
      interposerCostUsd: 15,
      packageYield: 0.97,
    });
    checkTrue(
      'REVERSAL: for a small 100mm2 chip, chiplets cost MORE THAN TWICE as much as monolithic (43.53 against 20.46 USD) - chiplets are not always right',
      smallChiplet.total > smallMono.total * 2
    );

    // --- Muc 11.2: cai gia HIEU NANG cua viec cat nho ---
    const lat = crossDieLatency(1, 4, 0.3);
    checkTrue(
      'Average latency when 30% of accesses cross a die (1ns local, 4ns cross-die) = 1.9ns',
      Math.abs(lat.avg - 1.9) < 1e-9
    );
    checkTrue(
      'That is 1.9x slower than a monolithic die - the price paid for the cost saving',
      Math.abs(lat.slowdown - 1.9) < 1e-9
    );
    const latLow = crossDieLatency(1, 4, 0.05);
    checkTrue(
      'Partition the workload so only 5% cross a die and it costs just 1.15x - WHERE you cut matters more than HOW MANY pieces',
      Math.abs(latLow.slowdown - 1.15) < 1e-9
    );
  }

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
