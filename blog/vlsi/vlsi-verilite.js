/**
 * VeriLite: Lightweight SystemVerilog Parser and Simulator
 * Uses regex-based parsing for robustness, no formal lexer/tokens
 */

class VeriLiteParser {
  constructor(code) {
    this.code = code;
  }

  parse() {
    const moduleName = this.extractModuleName();
    const ports = this.extractPorts();
    const assigns = this.extractAssigns();
    const decls = this.extractDeclarations();

    return {
      name: moduleName,
      ports,
      decls,
      assigns,
      always: []
    };
  }

  extractModuleName() {
    const match = this.code.match(/module\s+(\w+)\s*\(/);
    return match ? match[1] : 'unknown';
  }

  extractPorts() {
    const portMatch = this.code.match(/module\s+\w+\s*\((.*?)\)/s);
    if (!portMatch) return [];

    const portStr = portMatch[1];
    const ports = [];
    const portRegex = /(input|output|inout)?\s*(logic|wire|reg|bit)?\s*(\w+)/g;
    let match;

    let direction = 'input';
    for (match of portStr.matchAll(/(\w+)/g)) {
      const word = match[1];
      if (['input', 'output', 'inout'].includes(word)) {
        direction = word;
      } else if (!['logic', 'wire', 'reg', 'bit', 'module', 'endmodule'].includes(word)) {
        ports.push({ name: word, direction });
      }
    }

    return ports;
  }

  extractDeclarations() {
    const decls = [];
    const declRegex = /(logic|wire|reg|bit)\s+(\w+)/g;
    let match;
    while ((match = declRegex.exec(this.code)) !== null) {
      decls.push({ type: match[1], name: match[2] });
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
  }

  evalExpression(expr, state) {
    if (!expr) return 0;

    expr = expr.trim();

    // Numbers
    if (/^\d+$/.test(expr)) return parseInt(expr);
    if (/^0b[01]+$/.test(expr)) return parseInt(expr.slice(2), 2);
    if (/^0x[0-9a-fA-F]+$/.test(expr)) return parseInt(expr, 16);

    // Identifiers
    if (/^\w+$/.test(expr)) return state[expr] !== undefined ? state[expr] : 0;

    // Parentheses
    if (expr.startsWith('(') && expr.endsWith(')')) {
      return this.evalExpression(expr.slice(1, -1), state);
    }

    // Ternary operator (sel ? b : a)
    const ternaryMatch = expr.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
    if (ternaryMatch) {
      const cond = this.evalExpression(ternaryMatch[1], state);
      return cond ? this.evalExpression(ternaryMatch[2], state) : this.evalExpression(ternaryMatch[3], state);
    }

    // Binary operators - process in order of precedence
    const ops = [
      { regex: /(.+?)\s*\|\|\s*(.+)/, op: '||' },
      { regex: /(.+?)\s*&&\s*(.+)/, op: '&&' },
      { regex: /(.+?)\s*\|\s*(.+)/, op: '|' },
      { regex: /(.+?)\s*\^\s*(.+)/, op: '^' },
      { regex: /(.+?)\s*&\s*(.+)/, op: '&' },
      { regex: /(.+?)\s*==\s*(.+)/, op: '==' },
      { regex: /(.+?)\s*!=\s*(.+)/, op: '!=' },
      { regex: /(.+?)\s*<=\s*(.+)/, op: '<=' },
      { regex: /(.+?)\s*>=\s*(.+)/, op: '>=' },
      { regex: /(.+?)\s*<\s*(.+)/, op: '<' },
      { regex: /(.+?)\s*>\s*(.+)/, op: '>' },
      { regex: /(.+?)\s*\+\s*(.+)/, op: '+' },
      { regex: /(.+?)\s*-\s*(.+)/, op: '-' },
      { regex: /(.+?)\s*\*\s*(.+)/, op: '*' },
      { regex: /(.+?)\s*\/\s*(.+)/, op: '/' },
      { regex: /(.+?)\s*%\s*(.+)/, op: '%' }
    ];

    for (const { regex, op } of ops) {
      const match = expr.match(regex);
      if (match) {
        const left = this.evalExpression(match[1], state);
        const right = this.evalExpression(match[2], state);
        return this.applyOp(op, left, right);
      }
    }

    // Unary operators
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
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return right !== 0 ? Math.floor(left / right) : 0;
      case '%': return right !== 0 ? left % right : 0;
      case '&': return left & right;
      case '|': return left | right;
      case '^': return left ^ right;
      case '&&': return (left && right) ? 1 : 0;
      case '||': return (left || right) ? 1 : 0;
      case '==': return left === right ? 1 : 0;
      case '!=': return left !== right ? 1 : 0;
      case '<': return left < right ? 1 : 0;
      case '>': return left > right ? 1 : 0;
      case '<=': return left <= right ? 1 : 0;
      case '>=': return left >= right ? 1 : 0;
      default: return 0;
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

    // Evaluate assigns
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
