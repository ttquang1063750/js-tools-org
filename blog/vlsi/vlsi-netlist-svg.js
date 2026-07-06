/**
 * Netlist SVG Renderer: Converts HDL AST to gate-level schematic.
 * Hỗ trợ 2 nguồn: cổng nguyên thủy đã instantiate (ast.gates, kiểu structural)
 * và biểu thức assign (ast.assigns, kiểu dataflow/behavioral) — biểu thức được
 * phân tích thành cây cú pháp nhỏ rồi "elaborate" thành cùng 1 tập cổng logic,
 * để minh hoạ 3 kiểu viết code khác nhau (structural/dataflow/behavioral) sau
 * khi tổng hợp (synthesis) đều cho ra netlist giống hệt nhau.
 */

class GateRenderer {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'
    this.w = 60;
    this.h = 36;
  }

  render(svg, opts = {}) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'gate');
    g.setAttribute('transform', `translate(${this.x},${this.y})`);
    const stroke = opts.active ? '#65a30d' : '#333';
    const strokeWidth = opts.active ? '2.5' : '1.5';

    if (this.type === 'NOT') {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M 0 0 L ${this.w - 10} ${this.h / 2} L 0 ${this.h} Z`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', stroke);
      path.setAttribute('stroke-width', strokeWidth);
      g.appendChild(path);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', this.w - 5);
      circle.setAttribute('cy', this.h / 2);
      circle.setAttribute('r', '3.5');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', stroke);
      circle.setAttribute('stroke-width', strokeWidth);
      g.appendChild(circle);
    } else {
      let path;
      if (this.type === 'AND' || this.type === 'NAND') {
        path = `M 0 0 L ${this.w - 18} 0 Q ${this.w - 2} ${this.h / 2} ${this.w - 18} ${this.h} L 0 ${this.h} Z`;
      } else if (this.type === 'OR' || this.type === 'NOR') {
        path = `M 0 0 Q 8 ${this.h / 2} 0 ${this.h} L ${this.w - 18} ${this.h} Q ${this.w - 2} ${this.h / 2} ${this.w - 18} 0 Z`;
      } else {
        path = `M 6 0 Q 14 ${this.h / 2} 6 ${this.h} L ${this.w - 18} ${this.h} Q ${this.w - 2} ${this.h / 2} ${this.w - 18} 0 Z`;
      }

      const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      body.setAttribute('d', path);
      body.setAttribute('fill', opts.active ? 'rgba(101,163,13,0.08)' : 'none');
      body.setAttribute('stroke', stroke);
      body.setAttribute('stroke-width', strokeWidth);
      g.appendChild(body);

      if (this.type.startsWith('N') || this.type === 'XNOR') {
        const bubble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bubble.setAttribute('cx', this.w - 12);
        bubble.setAttribute('cy', this.h / 2);
        bubble.setAttribute('r', '4');
        bubble.setAttribute('fill', 'none');
        bubble.setAttribute('stroke', stroke);
        bubble.setAttribute('stroke-width', strokeWidth);
        g.appendChild(bubble);
      }
    }

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', this.w / 2 - 6);
    label.setAttribute('y', this.h / 2 + 4);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '10');
    label.setAttribute('font-family', 'monospace');
    label.setAttribute('fill', stroke);
    label.textContent = this.type;
    g.appendChild(label);

    svg.appendChild(g);
  }
}

// ---- Biểu thức nhỏ: tokenize + parser đệ quy cho subset & | ^ ~ ! == ? : ( ) ----

function tokenizeExpr(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === '(' || c === ')' || c === '?' || c === ':') {
      tokens.push(c);
      i++;
      continue;
    }
    if (expr.slice(i, i + 2) === '==') {
      tokens.push('==');
      i += 2;
      continue;
    }
    if (c === '&' || c === '|' || c === '^' || c === '~' || c === '!') {
      tokens.push(c);
      i++;
      continue;
    }
    if (/[\w]/.test(c)) {
      let j = i;
      while (j < expr.length && /[\w]/.test(expr[j])) j++;
      tokens.push(expr.slice(i, j));
      i = j;
      continue;
    }
    i++;
  }
  return tokens;
}

class MiniExprParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }
  peek() {
    return this.tokens[this.pos];
  }
  next() {
    return this.tokens[this.pos++];
  }
  parseTernary() {
    const cond = this.parseOr();
    if (this.peek() === '?') {
      this.next();
      const thenExpr = this.parseTernary();
      this.next(); // ':'
      const elseExpr = this.parseTernary();
      return { kind: 'ternary', cond, then: thenExpr, else: elseExpr };
    }
    return cond;
  }
  parseOr() {
    let left = this.parseXor();
    while (this.peek() === '|') {
      this.next();
      left = { kind: 'bin', op: '|', left, right: this.parseXor() };
    }
    return left;
  }
  parseXor() {
    let left = this.parseAnd();
    while (this.peek() === '^') {
      this.next();
      left = { kind: 'bin', op: '^', left, right: this.parseAnd() };
    }
    return left;
  }
  parseAnd() {
    let left = this.parseUnary();
    while (this.peek() === '&') {
      this.next();
      left = { kind: 'bin', op: '&', left, right: this.parseUnary() };
    }
    return left;
  }
  parseUnary() {
    if (this.peek() === '~' || this.peek() === '!') {
      this.next();
      return { kind: 'not', operand: this.parseUnary() };
    }
    return this.parseEq();
  }
  parseEq() {
    const left = this.parsePrimary();
    if (this.peek() === '==') {
      this.next();
      const right = this.parsePrimary();
      return { kind: 'eq', left, right };
    }
    return left;
  }
  parsePrimary() {
    const tok = this.peek();
    if (tok === '(') {
      this.next();
      const inner = this.parseTernary();
      if (this.peek() === ')') this.next();
      return inner;
    }
    this.next();
    if (tok === undefined) return { kind: 'const', value: 0 };
    if (/^\d+$/.test(tok)) return { kind: 'const', value: parseInt(tok, 10) };
    return { kind: 'ident', name: tok };
  }
}

function parseExprToTree(expr) {
  const tokens = tokenizeExpr(expr);
  return new MiniExprParser(tokens).parseTernary();
}

// Elaborate: cây cú pháp -> danh sách cổng logic {type, inputs[], output}.
// Tự động rút gọn "X == 0" trong điều kiện ternary thành tín hiệu chọn trực tiếp
// (tránh sinh 2 cổng NOT lồng nhau — giống cách trình tổng hợp thật tối ưu hoá).
function elaborateExpr(node, gates, counter) {
  if (node.kind === 'ident') return node.name;
  if (node.kind === 'const') return node.value ? '1' : '0';

  if (node.kind === 'not') {
    const inWire = elaborateExpr(node.operand, gates, counter);
    const outWire = 'n' + counter.n++;
    gates.push({ type: 'NOT', inputs: [inWire], output: outWire });
    return outWire;
  }

  if (node.kind === 'bin') {
    const l = elaborateExpr(node.left, gates, counter);
    const r = elaborateExpr(node.right, gates, counter);
    const typeMap = { '&': 'AND', '|': 'OR', '^': 'XOR' };
    const outWire = 'n' + counter.n++;
    gates.push({ type: typeMap[node.op], inputs: [l, r], output: outWire });
    return outWire;
  }

  if (node.kind === 'eq') {
    // Dùng riêng cho ternary (xem bên dưới); đứng độc lập thì coi như NOT khi so với 0.
    if (node.right.kind === 'const' && node.right.value === 0) {
      const inWire = elaborateExpr(node.left, gates, counter);
      const outWire = 'n' + counter.n++;
      gates.push({ type: 'NOT', inputs: [inWire], output: outWire });
      return outWire;
    }
    return elaborateExpr(node.left, gates, counter);
  }

  if (node.kind === 'ternary') {
    let selWire;
    let selInverted; // true: nhánh "then" được chọn khi selWire == 0
    if (node.cond.kind === 'eq' && node.cond.right.kind === 'const' && node.cond.right.value === 0) {
      selWire = elaborateExpr(node.cond.left, gates, counter);
      selInverted = true;
    } else if (node.cond.kind === 'ident') {
      selWire = node.cond.name;
      selInverted = false;
    } else {
      selWire = elaborateExpr(node.cond, gates, counter);
      selInverted = false;
    }

    const thenWire = elaborateExpr(node.then, gates, counter);
    const elseWire = elaborateExpr(node.else, gates, counter);

    const notSel = 'n' + counter.n++;
    gates.push({ type: 'NOT', inputs: [selWire], output: notSel });

    const thenSelWire = selInverted ? notSel : selWire;
    const elseSelWire = selInverted ? selWire : notSel;

    const g1 = 'n' + counter.n++;
    gates.push({ type: 'AND', inputs: [thenWire, thenSelWire], output: g1 });
    const g2 = 'n' + counter.n++;
    gates.push({ type: 'AND', inputs: [elseWire, elseSelWire], output: g2 });
    const outWire = 'n' + counter.n++;
    gates.push({ type: 'OR', inputs: [g1, g2], output: outWire });
    return outWire;
  }

  return 'x';
}

// Elaborate toàn bộ AST (structural hoặc assign) thành 1 danh sách cổng thống nhất
// {type, inputs, output} — dùng chung cho cả việc vẽ SVG lẫn mô phỏng giá trị dây dẫn.
function elaborateAST(ast) {
  const gates = [];
  const counter = { n: 0 };
  const finalOutputs = [];

  if (ast.gates && ast.gates.length > 0) {
    for (const g of ast.gates) {
      gates.push({ type: g.type.toUpperCase(), inputs: [...g.inputs], output: g.output });
    }
    if (ast.gates.length) finalOutputs.push(ast.gates[ast.gates.length - 1].output);
  } else {
    for (const assign of ast.assigns) {
      const tree = parseExprToTree(assign.rhs);
      const outWire = elaborateExpr(tree, gates, counter);
      for (const g of gates) {
        g.inputs = g.inputs.map((w) => (w === outWire ? assign.lhs : w));
        if (g.output === outWire) g.output = assign.lhs;
      }
      finalOutputs.push(assign.lhs);
    }
  }

  return { gates, finalOutputs };
}

// Mô phỏng giá trị MỌI dây dẫn (kể cả dây nội bộ sinh ra khi elaborate, vd "n0","n1")
// từ giá trị các tín hiệu gốc (primary inputs) — dùng để tô sáng netlist SVG nhất
// quán cho cả 3 kiểu code (structural/dataflow/behavioral).
function simulateGates(gates, primaryInputs) {
  const state = { ...primaryInputs };
  for (let pass = 0; pass < 3; pass++) {
    for (const g of gates) {
      const inVals = g.inputs.map((name) => (state[name] ? 1 : 0));
      let result;
      switch (g.type) {
        case 'NOT':
          result = inVals[0] ? 0 : 1;
          break;
        case 'AND':
          result = inVals.every((v) => v) ? 1 : 0;
          break;
        case 'OR':
          result = inVals.some((v) => v) ? 1 : 0;
          break;
        case 'XOR':
          result = inVals.reduce((a, b) => a ^ b, 0);
          break;
        case 'NAND':
          result = inVals.every((v) => v) ? 0 : 1;
          break;
        case 'NOR':
          result = inVals.some((v) => v) ? 0 : 1;
          break;
        case 'XNOR':
          result = inVals.reduce((a, b) => a ^ b, 0) ? 0 : 1;
          break;
        default:
          result = 0;
      }
      state[g.output] = result;
    }
  }
  return state;
}

class NetlistRenderer {
  constructor(container) {
    this.container = container;
    this.width = 640;
    this.height = 300;
    this.gates = [];
    this.finalOutputs = [];
  }

  // Elaborate AST (structural gates hoặc assign expressions) thành danh sách cổng
  // thống nhất {type, inputs, output}, rồi bố trí layout + vẽ SVG.
  renderFromAST(ast, opts = {}) {
    const { gates, finalOutputs } = elaborateAST(ast);
    this.gates = gates;
    this.finalOutputs = finalOutputs;
    this.layout(opts.activeSignals || {});
  }

  layout(activeSignals) {
    // Tính "độ sâu" mỗi cổng = 1 + độ sâu lớn nhất của cổng tạo ra tín hiệu đầu vào
    // (đầu vào không phải output của cổng nào khác thì coi là mức 0 — tín hiệu gốc).
    const outputToGate = new Map();
    for (const g of this.gates) outputToGate.set(g.output, g);

    const depthCache = new Map();
    const computeDepth = (gate) => {
      if (depthCache.has(gate)) return depthCache.get(gate);
      let maxIn = -1;
      for (const inp of gate.inputs) {
        const srcGate = outputToGate.get(inp);
        if (srcGate) maxIn = Math.max(maxIn, computeDepth(srcGate));
      }
      const depth = maxIn + 1;
      depthCache.set(gate, depth);
      return depth;
    };

    const cols = new Map(); // depth -> [gates]
    for (const g of this.gates) {
      const d = computeDepth(g);
      if (!cols.has(d)) cols.set(d, []);
      cols.get(d).push(g);
    }

    const gateW = 60;
    const gateH = 36;
    const colGap = 70;
    const rowGap = 46;
    const marginLeft = 90;
    const marginTop = 50;

    for (const [depth, gatesInCol] of cols.entries()) {
      gatesInCol.forEach((g, row) => {
        g.x = marginLeft + depth * (gateW + colGap);
        g.y = marginTop + row * (gateH + rowGap);
      });
    }

    const maxDepth = Math.max(0, ...[...cols.keys()]);
    const maxRows = Math.max(1, ...[...cols.values()].map((c) => c.length));
    this.width = marginLeft + (maxDepth + 1) * (gateW + colGap) + 80;
    this.height = marginTop + maxRows * (gateH + rowGap) + 40;

    this.activeSignals = activeSignals;
    this.render();
  }

  render() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', this.height);
    svg.setAttribute('style', 'border: 1px solid #ddd; background: #fafafa; border-radius: 6px;');

    const outputToGate = new Map();
    for (const g of this.gates) outputToGate.set(g.output, g);

    const gateW = 60;
    const gateH = 36;

    // Vẽ dây nối trước (để cổng đè lên trên)
    const wireGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(wireGroup);

    for (const g of this.gates) {
      g.inputs.forEach((inp, portIdx) => {
        const srcGate = outputToGate.get(inp);
        const active = this.activeSignals && this.activeSignals[inp];
        const toY = g.y + (this.gateInputCount(g) === 1 ? gateH / 2 : portIdx === 0 ? gateH / 4 : (3 * gateH) / 4);

        if (srcGate) {
          this.drawWire(wireGroup, srcGate.x + gateW, srcGate.y + gateH / 2, g.x, toY, active);
        } else {
          // Tín hiệu gốc (input module): vẽ nhãn tên tín hiệu ở mép trái
          this.drawInputPin(wireGroup, g.x, toY, inp, active);
        }
      });
    }

    // Vẽ cổng
    for (const g of this.gates) {
      const active = this.activeSignals && this.activeSignals[g.output];
      const renderer = new GateRenderer(g.x, g.y, g.type);
      renderer.render(svg, { active });
    }

    // Nhãn output cuối cùng
    for (const outName of this.finalOutputs) {
      const srcGate = outputToGate.get(outName);
      if (srcGate) {
        const active = this.activeSignals && this.activeSignals[outName];
        this.drawOutputPin(svg, srcGate.x + gateW, srcGate.y + gateH / 2, outName, active);
      }
    }

    this.container.appendChild(svg);
  }

  gateInputCount(gate) {
    return gate.type === 'NOT' ? 1 : 2;
  }

  drawWire(group, x1, y1, x2, y2, active) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    const midX = (x1 + x2) / 2;
    line.setAttribute('points', `${x1},${y1} ${midX},${y1} ${midX},${y2} ${x2},${y2}`);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', active ? '#65a30d' : '#94a3b8');
    line.setAttribute('stroke-width', active ? '2.5' : '1.5');
    group.appendChild(line);
  }

  drawInputPin(group, x, y, label, active) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x - 34);
    line.setAttribute('y1', y);
    line.setAttribute('x2', x);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', active ? '#65a30d' : '#94a3b8');
    line.setAttribute('stroke-width', active ? '2.5' : '1.5');
    group.appendChild(line);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x - 38);
    text.setAttribute('y', y + 3);
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('font-size', '11');
    text.setAttribute('font-family', 'monospace');
    text.setAttribute('font-weight', active ? 'bold' : 'normal');
    text.setAttribute('fill', active ? '#65a30d' : '#334155');
    text.textContent = label;
    group.appendChild(text);
  }

  drawOutputPin(svg, x, y, label, active) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', y);
    line.setAttribute('x2', x + 30);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', active ? '#65a30d' : '#94a3b8');
    line.setAttribute('stroke-width', active ? '2.5' : '1.5');
    svg.appendChild(line);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + 36);
    text.setAttribute('y', y + 4);
    text.setAttribute('font-size', '12');
    text.setAttribute('font-family', 'monospace');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', active ? '#65a30d' : '#1e293b');
    text.textContent = label;
    svg.appendChild(text);
  }
}

export { NetlistRenderer, GateRenderer, parseExprToTree, elaborateExpr, elaborateAST, simulateGates };
