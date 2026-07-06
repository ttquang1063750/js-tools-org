/**
 * Netlist SVG Renderer: Converts HDL AST to gate-level schematic
 * Renders logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR) and wiring
 */

class GateRenderer {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'
    this.w = 60;
    this.h = 40;
  }

  render(svg) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'gate');
    g.setAttribute('transform', `translate(${this.x},${this.y})`);

    // Gate body
    if (this.type === 'NOT') {
      // Triangle with dot
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M 0 0 L ${this.w - 10} ${this.h / 2} L 0 ${this.h} Z`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#333');
      path.setAttribute('stroke-width', '1.5');
      g.appendChild(path);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', this.w - 5);
      circle.setAttribute('cy', this.h / 2);
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#333');
      circle.setAttribute('stroke-width', '1.5');
      g.appendChild(circle);
    } else {
      // Flat-sided gates (AND, OR, etc.)
      let path;
      if (this.type === 'AND' || this.type === 'NAND') {
        // AND: curved right side
        path = `M 0 0 L ${this.w - 15} 0 Q ${this.w} ${this.h / 2} ${this.w - 15} ${this.h} L 0 ${this.h} Z`;
      } else if (this.type === 'OR' || this.type === 'NOR') {
        // OR: more curved right side
        path = `M 0 0 Q 5 ${this.h / 2} 0 ${this.h} L ${this.w - 15} ${this.h} Q ${this.w} ${this.h / 2} ${this.w - 15} 0 Z`;
      } else if (this.type === 'XOR' || this.type === 'XNOR') {
        // XOR: double curved left
        path = `M 5 0 Q 5 ${this.h / 2} 5 ${this.h} L ${this.w - 15} ${this.h} Q ${this.w} ${this.h / 2} ${this.w - 15} 0 Z`;
      }

      const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      body.setAttribute('d', path);
      body.setAttribute('fill', 'none');
      body.setAttribute('stroke', '#333');
      body.setAttribute('stroke-width', '1.5');
      g.appendChild(body);

      // Inversion bubble for NAND/NOR/XNOR
      if (this.type.includes('N')) {
        const bubble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bubble.setAttribute('cx', this.w + 4);
        bubble.setAttribute('cy', this.h / 2);
        bubble.setAttribute('r', '4');
        bubble.setAttribute('fill', 'none');
        bubble.setAttribute('stroke', '#333');
        bubble.setAttribute('stroke-width', '1.5');
        g.appendChild(bubble);
      }
    }

    // Input port markers
    const in1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    in1.setAttribute('cx', 0);
    in1.setAttribute('cy', this.h / 4);
    in1.setAttribute('r', '2');
    in1.setAttribute('fill', '#666');
    in1.setAttribute('class', 'port in');
    g.appendChild(in1);

    if (this.type !== 'NOT') {
      const in2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      in2.setAttribute('cx', 0);
      in2.setAttribute('cy', (3 * this.h) / 4);
      in2.setAttribute('r', '2');
      in2.setAttribute('fill', '#666');
      in2.setAttribute('class', 'port in');
      g.appendChild(in2);
    }

    // Output port marker
    const out = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    out.setAttribute('cx', this.w);
    out.setAttribute('cy', this.h / 2);
    out.setAttribute('r', '2');
    out.setAttribute('fill', '#666');
    out.setAttribute('class', 'port out');
    g.appendChild(out);

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', this.w / 2);
    label.setAttribute('y', this.h / 2 + 4);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '10');
    label.setAttribute('fill', '#333');
    label.textContent = this.type.substr(0, 2);
    g.appendChild(label);

    svg.appendChild(g);
  }
}

class NetlistRenderer {
  constructor(container) {
    this.container = container;
    this.gates = [];
    this.wires = [];
    this.width = 800;
    this.height = 500;
  }

  addGate(type, label) {
    const x = 100 + this.gates.length * 80;
    const y = 100;
    this.gates.push({ type, label, x, y });
  }

  addWire(fromGate, fromPort, toGate, toPort) {
    this.wires.push({ fromGate, fromPort, toGate, toPort });
  }

  renderFromAST(ast) {
    // Clear previous
    this.gates = [];
    this.wires = [];

    // Extract gates from assign statements
    let gateIndex = 0;
    const gateMap = {};

    for (const assign of ast.assigns) {
      const gateType = this.inferGateType(assign.rhs);
      if (gateType) {
        this.addGate(gateType, `g${gateIndex}`);
        gateMap[assign.lhs] = gateIndex;
        gateIndex++;
      }
    }

    // Render
    this.render();
  }

  inferGateType(expr) {
    if (!expr) return null;
    if (expr.op === '&') return 'AND';
    if (expr.op === '|') return 'OR';
    if (expr.op === '^') return 'XOR';
    if (expr.op === '!') return 'NOT';
    return null;
  }

  render() {
    // Clear container
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', this.width);
    svg.setAttribute('height', this.height);
    svg.setAttribute('style', 'border: 1px solid #ccc; background: #fafafa;');

    // Draw wires first (so gates render on top)
    const wireGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wireGroup.setAttribute('class', 'wires');
    svg.appendChild(wireGroup);

    for (const wire of this.wires) {
      this.drawWire(wireGroup, wire);
    }

    // Draw gates
    for (const gate of this.gates) {
      const renderer = new GateRenderer(gate.x, gate.y, gate.type);
      renderer.render(svg);
    }

    // Add title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', 10);
    title.setAttribute('y', 20);
    title.setAttribute('font-size', '14');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', '#333');
    title.textContent = 'Netlist (Gate-Level)';
    svg.appendChild(title);

    this.container.appendChild(svg);
  }

  drawWire(group, wire) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    const x1 = this.gates[wire.fromGate].x + 60;
    const y1 = this.gates[wire.fromGate].y + 20;
    const x2 = this.gates[wire.toGate].x;
    const y2 = this.gates[wire.toGate].y + 20;

    const pathPoints = `${x1},${y1} ${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`;
    line.setAttribute('points', pathPoints);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#0066cc');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-linecap', 'round');
    group.appendChild(line);
  }

  generateNetlist(ast) {
    // Returns a string representation of the netlist
    let netlist = `module ${ast.name}\n`;
    netlist += `// Ports\n`;
    for (const port of ast.ports) {
      netlist += `// ${port.direction} ${port.name}\n`;
    }
    netlist += `// Gates\n`;
    for (let i = 0; i < this.gates.length; i++) {
      netlist += `${this.gates[i].type.toLowerCase()}${i} (${this.gates[i].type});\n`;
    }
    netlist += `endmodule\n`;
    return netlist;
  }
}

export { NetlistRenderer, GateRenderer };
