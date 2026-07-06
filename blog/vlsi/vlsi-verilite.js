/**
 * VeriLite: Lightweight SystemVerilog Lexer, Parser, and Simulator
 * Targets: module, port, logic/wire/reg, always_ff/always_comb, assign, blocking/non-blocking assignment
 */

class VeriLexer {
  constructor(code) {
    this.code = code;
    this.pos = 0;
    this.tokens = [];
  }

  isWhitespace(c) {
    return /\s/.test(c);
  }

  isIdentifier(c) {
    return /[a-zA-Z_0-9]/.test(c);
  }

  skipWhitespaceAndComments() {
    while (this.pos < this.code.length) {
      if (this.isWhitespace(this.code[this.pos])) {
        this.pos++;
      } else if (this.code[this.pos] === '/' && this.code[this.pos + 1] === '/') {
        while (this.pos < this.code.length && this.code[this.pos] !== '\n') this.pos++;
      } else if (this.code[this.pos] === '/' && this.code[this.pos + 1] === '*') {
        this.pos += 2;
        while (this.pos < this.code.length - 1) {
          if (this.code[this.pos] === '*' && this.code[this.pos + 1] === '/') {
            this.pos += 2;
            break;
          }
          this.pos++;
        }
      } else {
        break;
      }
    }
  }

  readNumber() {
    let num = '';
    while (this.pos < this.code.length && /[0-9xXbBdD_]/.test(this.code[this.pos])) {
      if (this.code[this.pos] !== '_') num += this.code[this.pos];
      this.pos++;
    }
    return num;
  }

  readIdentifier() {
    let id = '';
    while (this.pos < this.code.length && this.isIdentifier(this.code[this.pos])) {
      id += this.code[this.pos];
      this.pos++;
    }
    return id;
  }

  tokenize() {
    const keywords = new Set([
      'module', 'endmodule', 'input', 'output', 'inout',
      'logic', 'wire', 'reg', 'parameter',
      'always_ff', 'always_comb', 'always',
      'assign', 'if', 'else', 'case', 'default',
      'posedge', 'negedge', 'clk', 'rst',
      'begin', 'end', 'typedef', 'enum'
    ]);

    while (this.pos < this.code.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.code.length) break;

      const c = this.code[this.pos];

      if (/[0-9]/.test(c)) {
        this.tokens.push({ type: 'NUMBER', value: this.readNumber() });
      } else if (c === '"') {
        this.pos++; // skip opening quote
        let str = '';
        while (this.pos < this.code.length && this.code[this.pos] !== '"') {
          str += this.code[this.pos++];
        }
        this.pos++; // skip closing quote
        this.tokens.push({ type: 'STRING', value: str });
      } else if (c === '$') {
        this.pos++;
        const id = this.readIdentifier();
        this.tokens.push({ type: 'FUNCTION', value: id });
      } else if (/[a-zA-Z_]/.test(c)) {
        const id = this.readIdentifier();
        if (keywords.has(id)) {
          this.tokens.push({ type: 'KEYWORD', value: id });
        } else {
          this.tokens.push({ type: 'IDENT', value: id });
        }
      } else if (c === '=' && this.code[this.pos + 1] === '=') {
        this.pos += 2;
        this.tokens.push({ type: 'OP', value: '==' });
      } else if (c === '!' && this.code[this.pos + 1] === '=') {
        this.pos += 2;
        this.tokens.push({ type: 'OP', value: '!=' });
      } else if (c === '<' && this.code[this.pos + 1] === '=') {
        this.pos += 2;
        this.tokens.push({ type: 'OP', value: '<=' });
      } else if (c === '>' && this.code[this.pos + 1] === '=') {
        this.pos += 2;
        this.tokens.push({ type: 'OP', value: '>=' });
      } else if (c === '&' && this.code[this.pos + 1] === '&') {
        this.pos += 2;
        this.tokens.push({ type: 'OP', value: '&&' });
      } else if (c === '|' && this.code[this.pos + 1] === '|') {
        this.pos += 2;
        this.tokens.push({ type: 'OP', value: '||' });
      } else if (c === '<' && this.code[this.pos + 1] === '<') {
        this.pos += 2;
        this.tokens.push({ type: 'OP', value: '<<' });
      } else if (c === '>' && this.code[this.pos + 1] === '>') {
        this.pos += 2;
        this.tokens.push({ type: 'OP', value: '>>' });
      } else if ((c === '+' || c === '-' || c === '*' || c === '/' || c === '%' || c === '&' || c === '|' || c === '^' || c === '!') && this.pos + 1 < this.code.length) {
        this.tokens.push({ type: 'OP', value: c });
        this.pos++;
      } else {
        this.tokens.push({ type: 'PUNCT', value: c });
        this.pos++;
      }
    }
    return this.tokens;
  }
}

class VeriParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  current() {
    return this.tokens[this.pos];
  }

  peek(offset = 1) {
    return this.tokens[this.pos + offset];
  }

  advance() {
    this.pos++;
  }

  match(type, value = null) {
    const token = this.current();
    if (!token) return false;
    if (token.type !== type) return false;
    if (value && token.value !== value) return false;
    this.advance();
    return true;
  }

  expect(type, value = null) {
    if (!this.match(type, value)) {
      throw new Error(`Expected ${type}:${value}, got ${this.current()?.type}:${this.current()?.value}`);
    }
  }

  parseModule() {
    this.expect('KEYWORD', 'module');
    const name = this.current().value;
    this.expect('IDENT');
    this.expect('PUNCT', '(');

    const ports = [];
    while (!this.match('PUNCT', ')')) {
      const direction = this.current().value;
      if (['input', 'output', 'inout'].includes(direction)) {
        this.advance();
      }
      const portName = this.current().value;
      this.expect('IDENT');
      ports.push({ direction: direction || 'input', name: portName });
      if (!this.match('PUNCT', ',')) break;
    }

    this.expect('PUNCT', ';');

    const decls = [];
    const assigns = [];
    const always = [];

    while (this.current() && this.current().type !== 'EOF') {
      if (this.match('KEYWORD', 'endmodule')) break;

      if (this.match('KEYWORD', 'logic') || this.match('KEYWORD', 'wire') || this.match('KEYWORD', 'reg')) {
        const varName = this.current().value;
        this.expect('IDENT');
        decls.push({ type: 'logic', name: varName });
        this.expect('PUNCT', ';');
      } else if (this.match('KEYWORD', 'assign')) {
        const lhs = this.current().value;
        this.expect('IDENT');
        this.expect('OP', '=');
        const rhs = this.parseExpr();
        this.expect('PUNCT', ';');
        assigns.push({ lhs, rhs });
      } else if (this.match('KEYWORD', 'always_ff') || this.match('KEYWORD', 'always_comb')) {
        const block = this.parseAlways();
        always.push(block);
      } else {
        this.advance();
      }
    }

    return { name, ports, decls, assigns, always };
  }

  parseAlways() {
    this.expect('PUNCT', '@');
    this.expect('PUNCT', '(');
    const trigger = this.current().value;
    this.expect('IDENT');
    this.expect('PUNCT', ')');

    this.expect('KEYWORD', 'begin');
    const body = [];
    while (!this.match('KEYWORD', 'end')) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    return { trigger, body };
  }

  parseStatement() {
    if (this.match('KEYWORD', 'if')) {
      this.expect('PUNCT', '(');
      const cond = this.parseExpr();
      this.expect('PUNCT', ')');
      const thenStmt = this.parseStatement();
      let elseStmt = null;
      if (this.match('KEYWORD', 'else')) {
        elseStmt = this.parseStatement();
      }
      return { type: 'if', cond, then: thenStmt, else: elseStmt };
    }

    const lhs = this.current().value;
    this.expect('IDENT');
    const op = this.current().value;
    this.advance();
    const rhs = this.parseExpr();
    this.expect('PUNCT', ';');
    return { type: 'assign', lhs, op: op === '<=' ? 'nblk' : 'blk', rhs };
  }

  parseExpr() {
    return this.parseOrExpr();
  }

  parseOrExpr() {
    let left = this.parseAndExpr();
    while (this.current() && this.current().value === '||') {
      this.advance();
      const right = this.parseAndExpr();
      left = { op: '||', left, right };
    }
    return left;
  }

  parseAndExpr() {
    let left = this.parseXorExpr();
    while (this.current() && this.current().value === '&&') {
      this.advance();
      const right = this.parseXorExpr();
      left = { op: '&&', left, right };
    }
    return left;
  }

  parseXorExpr() {
    let left = this.parseOrBitExpr();
    while (this.current() && this.current().value === '^') {
      this.advance();
      const right = this.parseOrBitExpr();
      left = { op: '^', left, right };
    }
    return left;
  }

  parseOrBitExpr() {
    let left = this.parseAndBitExpr();
    while (this.current() && this.current().value === '|') {
      this.advance();
      const right = this.parseAndBitExpr();
      left = { op: '|', left, right };
    }
    return left;
  }

  parseAndBitExpr() {
    let left = this.parseAddExpr();
    while (this.current() && this.current().value === '&') {
      this.advance();
      const right = this.parseAddExpr();
      left = { op: '&', left, right };
    }
    return left;
  }

  parseAddExpr() {
    let left = this.parseMulExpr();
    while (this.current() && (this.current().value === '+' || this.current().value === '-')) {
      const op = this.current().value;
      this.advance();
      const right = this.parseMulExpr();
      left = { op, left, right };
    }
    return left;
  }

  parseMulExpr() {
    let left = this.parseUnaryExpr();
    while (this.current() && (this.current().value === '*' || this.current().value === '/' || this.current().value === '%')) {
      const op = this.current().value;
      this.advance();
      const right = this.parseUnaryExpr();
      left = { op, left, right };
    }
    return left;
  }

  parseUnaryExpr() {
    if (this.current() && (this.current().value === '!' || this.current().value === '~' || this.current().value === '-')) {
      const op = this.current().value;
      this.advance();
      const expr = this.parseUnaryExpr();
      return { op, expr };
    }
    return this.parsePrimaryExpr();
  }

  parsePrimaryExpr() {
    if (!this.current()) return { type: 'const', value: 0 };

    if (this.current().type === 'IDENT') {
      const name = this.current().value;
      this.advance();
      return { type: 'ident', name };
    } else if (this.current().type === 'NUMBER') {
      const value = parseInt(this.current().value);
      this.advance();
      return { type: 'const', value };
    } else if (this.match('PUNCT', '(')) {
      const expr = this.parseExpr();
      this.expect('PUNCT', ')');
      return expr;
    }
    return { type: 'const', value: 0 };
  }

  parse() {
    return this.parseModule();
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

  evalExpr(expr, state = this.state) {
    if (!expr) return 0;
    if (expr.type === 'const') return expr.value;
    if (expr.type === 'ident') return state[expr.name] || 0;
    if (expr.op === '+') return this.evalExpr(expr.left, state) + this.evalExpr(expr.right, state);
    if (expr.op === '-') return this.evalExpr(expr.left, state) - this.evalExpr(expr.right, state);
    if (expr.op === '*') return this.evalExpr(expr.left, state) * this.evalExpr(expr.right, state);
    if (expr.op === '/') return Math.floor(this.evalExpr(expr.left, state) / this.evalExpr(expr.right, state));
    if (expr.op === '%') return this.evalExpr(expr.left, state) % this.evalExpr(expr.right, state);
    if (expr.op === '&') return this.evalExpr(expr.left, state) & this.evalExpr(expr.right, state);
    if (expr.op === '|') return this.evalExpr(expr.left, state) | this.evalExpr(expr.right, state);
    if (expr.op === '^') return this.evalExpr(expr.left, state) ^ this.evalExpr(expr.right, state);
    if (expr.op === '&&') return this.evalExpr(expr.left, state) && this.evalExpr(expr.right, state) ? 1 : 0;
    if (expr.op === '||') return this.evalExpr(expr.left, state) || this.evalExpr(expr.right, state) ? 1 : 0;
    if (expr.op === '!') return this.evalExpr(expr.expr, state) ? 0 : 1;
    if (expr.op === '~') return ~this.evalExpr(expr.expr, state);
    return 0;
  }

  cycle(inputs) {
    const newState = { ...this.state };

    // Apply inputs
    for (const [key, value] of Object.entries(inputs)) {
      if (this.state.hasOwnProperty(key)) {
        newState[key] = value;
      }
    }

    // Evaluate assigns
    for (const assign of this.ast.assigns) {
      newState[assign.lhs] = this.evalExpr(assign.rhs, newState);
    }

    // Evaluate always blocks (simplified)
    for (const block of this.ast.always) {
      for (const stmt of block.body) {
        this.executeStmt(stmt, newState);
      }
    }

    this.state = newState;
    return { ...this.state };
  }

  executeStmt(stmt, state) {
    if (stmt.type === 'assign') {
      state[stmt.lhs] = this.evalExpr(stmt.rhs, state);
    } else if (stmt.type === 'if') {
      if (this.evalExpr(stmt.cond, state)) {
        this.executeStmt(stmt.then, state);
      } else if (stmt.else) {
        this.executeStmt(stmt.else, state);
      }
    }
  }

  getState() {
    return { ...this.state };
  }
}

export { VeriLexer, VeriParser, VeriSimulator };
