/**
 * VeriLite: Lightweight SystemVerilog Parser and Simulator
 * Uses regex-based parsing for robustness, no formal lexer/tokens.
 * Supports: module/port (kể cả vector [N:0]), logic/wire/reg declaration,
 * assign (dataflow), gate-primitive instantiation (not/and/or/xor/nand/
 * nor/xnor/buf — structural), if/else và case/endcase đơn giản bên trong
 * always/always_comb (behavioral), số literal có kích thước kiểu Verilog
 * (vd 4'b0000, 3'd5, 4'h1).
 */

class VeriLiteParser {
  constructor(code) {
    this.code = code;
  }

  parse() {
    const moduleName = this.extractModuleName();
    const ports = this.extractPorts();
    const decls = this.extractDeclarations();
    const gates = this.extractGates();
    const assigns = [...this.extractAssigns(), ...this.extractAlwaysAssigns(), ...this.extractCaseAssigns()];

    return {
      name: moduleName,
      ports,
      decls,
      gates,
      assigns,
    };
  }

  extractModuleName() {
    const match = this.code.match(/module\s+(\w+)\s*\(/);
    return match ? match[1] : 'unknown';
  }

  extractPorts() {
    const portMatch = this.code.match(/module\s+\w+\s*\((.*?)\)/s);
    if (!portMatch) return [];

    // Bỏ vector width [N:0] TRƯỚC khi tách từ, tránh bắt nhầm số bên trong
    // ngoặc vuông (vd "3", "0" trong "[3:0]") thành tên tín hiệu.
    const portStr = portMatch[1].replace(/\[[^\]]*\]/g, ' ');
    const ports = [];
    let match;

    let direction = 'input';
    for (match of portStr.matchAll(/(\w+)/g)) {
      const word = match[1];
      if (['input', 'output', 'inout'].includes(word)) {
        direction = word;
      } else if (!['logic', 'wire', 'reg', 'bit', 'signed', 'unsigned'].includes(word)) {
        ports.push({ name: word, direction });
      }
    }

    return ports;
  }

  // Chỉ khớp khai báo `wire`/`logic`/`reg`/`bit` khi đứng ĐẦU DÒNG (không phải sau
  // input/output trong danh sách port) — hỗ trợ cú pháp nhiều tên trên 1 dòng
  // (vd `wire not_s, and_a, and_b;`), mỗi tên tách bằng dấu phẩy.
  extractDeclarations() {
    const decls = [];
    const declRegex = /^[ \t]*(logic|wire|reg|bit)\s+([^;]+);/gm;
    let match;
    while ((match = declRegex.exec(this.code)) !== null) {
      const type = match[1];
      const names = match[2].split(',');
      for (const raw of names) {
        const name = raw.replace(/\[[^\]]*\]/g, '').trim();
        if (name && /^\w+$/.test(name)) {
          decls.push({ type, name });
        }
      }
    }
    return decls;
  }

  extractAssigns() {
    const assigns = [];
    const assignRegex = /assign\s+(\w+)\s*=\s*(.+?);/g;
    let match;

    while ((match = assignRegex.exec(this.code)) !== null) {
      const lhs = match[1].trim();
      const rhs = match[2].trim();
      assigns.push({ lhs, rhs });
    }

    return assigns;
  }

  // Cổng nguyên thủy (structural): `and NAME (out, in1, in2, ...);`
  extractGates() {
    const gates = [];
    const gateRegex = /\b(not|buf|and|or|xor|nand|nor|xnor)\s+(\w+)\s*\(([^)]+)\)\s*;/g;
    let match;
    while ((match = gateRegex.exec(this.code)) !== null) {
      const type = match[1];
      const instanceName = match[2];
      const args = match[3].split(',').map((s) => s.trim());
      const output = args[0];
      const inputs = args.slice(1);
      gates.push({ type, instanceName, output, inputs });
    }
    return gates;
  }

  // Behavioral tối giản: `if (cond) lhs = a; else lhs = b;` bên trong always/always_comb.
  // Chuyển thành 1 "assign" tương đương lhs = cond ? a : b (đủ cho case dạy học đơn giản).
  extractAlwaysAssigns() {
    const assigns = [];
    const blockRegex = /always[_\w]*\s*(?:@\([^)]*\))?\s*begin([\s\S]*?)end/g;
    let blockMatch;
    while ((blockMatch = blockRegex.exec(this.code)) !== null) {
      const body = blockMatch[1];
      const ifElseRegex = /if\s*\(([^)]+)\)\s*(\w+)\s*=\s*([^;]+);\s*else\s*\2\s*=\s*([^;]+);/g;
      let stmtMatch;
      while ((stmtMatch = ifElseRegex.exec(body)) !== null) {
        const cond = stmtMatch[1].trim();
        const lhs = stmtMatch[2].trim();
        const thenExpr = stmtMatch[3].trim();
        const elseExpr = stmtMatch[4].trim();
        assigns.push({ lhs, rhs: `(${cond}) ? (${thenExpr}) : (${elseExpr})` });
      }
    }
    return assigns;
  }

  // case (sel) label1: lhs = expr1; label2: lhs = expr2; ... default: lhs = exprN; endcase
  // Chuyển thành 1 chuỗi ternary lồng nhau tương đương:
  // (sel==label1) ? (expr1) : (sel==label2) ? (expr2) : ... : (exprDefault)
  extractCaseAssigns() {
    const assigns = [];
    const caseRegex = /case\s*\(([^)]+)\)([\s\S]*?)endcase/g;
    let caseMatch;
    while ((caseMatch = caseRegex.exec(this.code)) !== null) {
      const selector = caseMatch[1].trim();
      const body = caseMatch[2];

      const itemRegex = /(default|[^\s:;]+)\s*:\s*(\w+)\s*=\s*([^;]+);/g;
      let itemMatch;
      let lhs = null;
      const branches = [];
      let defaultExpr = null;

      while ((itemMatch = itemRegex.exec(body)) !== null) {
        const label = itemMatch[1].trim();
        lhs = itemMatch[2].trim();
        const expr = itemMatch[3].trim();
        if (label === 'default') {
          defaultExpr = expr;
        } else {
          branches.push({ label, expr });
        }
      }

      if (!lhs || branches.length === 0) continue;

      let rhs = defaultExpr !== null ? `(${defaultExpr})` : '0';
      for (let i = branches.length - 1; i >= 0; i--) {
        const labelValue = this.parseVerilogLiteral(branches[i].label);
        rhs = `(${selector} == ${labelValue}) ? (${branches[i].expr}) : ${rhs}`;
      }
      assigns.push({ lhs, rhs });
    }
    return assigns;
  }

  // Chuyển literal kiểu Verilog (4'b0000, 3'd5, 4'h1) thành số thập phân dạng chuỗi,
  // để dùng lại được trong evalExpression (vốn chỉ hiểu số thập phân/0b/0x thuần).
  parseVerilogLiteral(token) {
    const sized = token.match(/^\d*'([bBoOdDhH])([0-9a-fA-Fxz_]+)$/);
    if (sized) {
      const base = sized[1].toLowerCase();
      const digits = sized[2].replace(/_/g, '');
      const radix = { b: 2, o: 8, d: 10, h: 16 }[base];
      const value = parseInt(digits, radix);
      return Number.isNaN(value) ? '0' : String(value);
    }
    return token;
  }
}

class VeriSimulator {
  constructor(ast) {
    this.ast = ast;
    this.state = {};
    this.initState();
  }

  initState() {
    for (const port of this.ast.ports) {
      this.state[port.name] = 0;
    }
    for (const decl of this.ast.decls) {
      this.state[decl.name] = 0;
    }
    for (const gate of this.ast.gates || []) {
      if (this.state[gate.output] === undefined) this.state[gate.output] = 0;
    }
  }

  isFullyParenthesized(expr) {
    if (!expr.startsWith('(') || !expr.endsWith(')')) return false;
    let depth = 0;
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') depth++;
      else if (expr[i] === ')') {
        depth--;
        if (depth === 0 && i < expr.length - 1) return false;
      }
    }
    return true;
  }

  evalExpression(expr, state) {
    if (!expr) return 0;

    expr = expr.trim();

    // Numbers
    if (/^\d+$/.test(expr)) return parseInt(expr);
    if (/^0b[01]+$/.test(expr)) return parseInt(expr.slice(2), 2);
    if (/^0x[0-9a-fA-F]+$/.test(expr)) return parseInt(expr, 16);

    // Literal kích thước kiểu Verilog: 4'b0000, 3'd5, 4'h1
    const sizedLiteral = expr.match(/^\d*'([bBoOdDhH])([0-9a-fA-Fxz_]+)$/);
    if (sizedLiteral) {
      const radix = { b: 2, o: 8, d: 10, h: 16 }[sizedLiteral[1].toLowerCase()];
      const value = parseInt(sizedLiteral[2].replace(/_/g, ''), radix);
      return Number.isNaN(value) ? 0 : value;
    }

    // Identifiers
    if (/^\w+$/.test(expr)) return state[expr] !== undefined ? state[expr] : 0;

    // Parentheses — chỉ cắt bỏ nếu dấu '(' đầu tiên thực sự khớp dấu ')' cuối cùng
    // (tức cả biểu thức nằm trong 1 cặp ngoặc duy nhất, không phải 2 cụm ngoặc
    // riêng biệt như "(a & ~s) | (b & s)").
    if (this.isFullyParenthesized(expr)) {
      return this.evalExpression(expr.slice(1, -1), state);
    }

    // Ternary operator (sel ? b : a)
    const ternaryMatch = expr.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
    if (ternaryMatch) {
      const cond = this.evalExpression(ternaryMatch[1], state);
      return cond ? this.evalExpression(ternaryMatch[2], state) : this.evalExpression(ternaryMatch[3], state);
    }

    // Binary operators - process in order of precedence
    // Chú ý: << và >> PHẢI kiểm tra trước <=/>=/</> — nếu không, regex 1 ký tự
    // "<" sẽ khớp nhầm vào giữa "a << 1" và cắt biểu thức sai.
    const ops = [
      { regex: /(.+?)\s*\|\|\s*(.+)/, op: '||' },
      { regex: /(.+?)\s*&&\s*(.+)/, op: '&&' },
      { regex: /(.+?)\s*\|\s*(.+)/, op: '|' },
      { regex: /(.+?)\s*\^\s*(.+)/, op: '^' },
      { regex: /(.+?)\s*&\s*(.+)/, op: '&' },
      { regex: /(.+?)\s*==\s*(.+)/, op: '==' },
      { regex: /(.+?)\s*!=\s*(.+)/, op: '!=' },
      { regex: /(.+?)\s*<<\s*(.+)/, op: '<<' },
      { regex: /(.+?)\s*>>\s*(.+)/, op: '>>' },
      { regex: /(.+?)\s*<=\s*(.+)/, op: '<=' },
      { regex: /(.+?)\s*>=\s*(.+)/, op: '>=' },
      { regex: /(.+?)\s*<\s*(.+)/, op: '<' },
      { regex: /(.+?)\s*>\s*(.+)/, op: '>' },
      { regex: /(.+?)\s*\+\s*(.+)/, op: '+' },
      { regex: /(.+?)\s*-\s*(.+)/, op: '-' },
      { regex: /(.+?)\s*\*\s*(.+)/, op: '*' },
      { regex: /(.+?)\s*\/\s*(.+)/, op: '/' },
      { regex: /(.+?)\s*%\s*(.+)/, op: '%' },
    ];

    for (const { regex, op } of ops) {
      const match = expr.match(regex);
      if (match) {
        const left = this.evalExpression(match[1], state);
        const right = this.evalExpression(match[2], state);
        return this.applyOp(op, left, right);
      }
    }

    // Unary operators — "!" là logical NOT (luôn ra 0/1), "~" là bitwise NOT
    // (đảo từng bit, khác nhau rõ với tín hiệu đa-bit như vector [3:0]).
    if (expr.startsWith('!')) {
      return this.evalExpression(expr.slice(1), state) ? 0 : 1;
    }
    if (expr.startsWith('~')) {
      return ~this.evalExpression(expr.slice(1), state);
    }
    if (expr.startsWith('-')) {
      return -this.evalExpression(expr.slice(1), state);
    }

    return 0;
  }

  applyOp(op, left, right) {
    switch (op) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return right !== 0 ? Math.floor(left / right) : 0;
      case '%':
        return right !== 0 ? left % right : 0;
      case '&':
        return left & right;
      case '|':
        return left | right;
      case '^':
        return left ^ right;
      case '<<':
        return left << right;
      case '>>':
        return left >> right;
      case '&&':
        return left && right ? 1 : 0;
      case '||':
        return left || right ? 1 : 0;
      case '==':
        return left === right ? 1 : 0;
      case '!=':
        return left !== right ? 1 : 0;
      case '<':
        return left < right ? 1 : 0;
      case '>':
        return left > right ? 1 : 0;
      case '<=':
        return left <= right ? 1 : 0;
      case '>=':
        return left >= right ? 1 : 0;
      default:
        return 0;
    }
  }

  evalGate(type, inVals) {
    switch (type) {
      case 'not':
        return inVals[0] ? 0 : 1;
      case 'buf':
        return inVals[0] ? 1 : 0;
      case 'and':
        return inVals.every((v) => v) ? 1 : 0;
      case 'or':
        return inVals.some((v) => v) ? 1 : 0;
      case 'xor':
        return inVals.reduce((a, b) => a ^ b, 0);
      case 'nand':
        return inVals.every((v) => v) ? 0 : 1;
      case 'nor':
        return inVals.some((v) => v) ? 0 : 1;
      case 'xnor':
        return inVals.reduce((a, b) => a ^ b, 0) ? 0 : 1;
      default:
        return 0;
    }
  }

  cycle(inputs) {
    const newState = { ...this.state };

    // Apply inputs
    for (const [key, value] of Object.entries(inputs)) {
      if (newState.hasOwnProperty(key)) {
        newState[key] = value;
      }
    }

    // Evaluate cổng nguyên thủy (structural) — 2 lượt để chịu được thứ tự khai báo
    // không đúng thứ tự phụ thuộc (vd cổng dùng biến được cổng sau mới gán).
    for (let pass = 0; pass < 2; pass++) {
      for (const gate of this.ast.gates || []) {
        const inVals = gate.inputs.map((name) => (newState[name] !== undefined ? newState[name] : 0));
        newState[gate.output] = this.evalGate(gate.type, inVals);
      }
    }

    // Evaluate assigns (dataflow + behavioral if/else đã được chuyển thành ternary)
    for (const assign of this.ast.assigns) {
      newState[assign.lhs] = this.evalExpression(assign.rhs, newState);
    }

    this.state = newState;
    return { ...this.state };
  }

  getState() {
    return { ...this.state };
  }
}

export { VeriLiteParser, VeriSimulator };
