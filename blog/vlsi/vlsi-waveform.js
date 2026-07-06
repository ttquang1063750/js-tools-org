/**
 * Waveform Viewer: Canvas-based signal visualization
 * Displays time-domain signals with zoom/pan support
 */

class WaveformViewer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.signals = []; // Array of { name, data: [values], color }
    this.timeScale = 1; // pixels per time unit
    this.panX = 0;
    this.panY = 0;
    this.maxTime = 100;
    this.rowHeight = 60;
    this.margin = { top: 30, left: 100, right: 20, bottom: 30 };

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.canvas.addEventListener('wheel', (e) => this.handleZoom(e));
    this.canvas.addEventListener('mousemove', (e) => this.handlePan(e));
    this.isDragging = false;
    this.lastX = 0;

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastX;
        this.panX += dx;
        this.lastX = e.clientX;
        this.redraw();
      }
    });
  }

  handleZoom(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    this.timeScale *= delta;
    this.timeScale = Math.max(0.5, Math.min(10, this.timeScale));
    this.redraw();
  }

  handlePan(e) {
    // Hover effect (optional)
  }

  addSignal(name, data, color = '#0066cc') {
    this.signals.push({ name, data, color });
    this.maxTime = Math.max(this.maxTime, data.length);
  }

  clearSignals() {
    this.signals = [];
  }

  redraw() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear canvas
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, w, h);

    // Draw grid background
    this.drawGrid();

    // Draw time axis
    this.drawTimeAxis();

    // Draw signal names
    this.drawSignalNames();

    // Draw waveforms
    for (let i = 0; i < this.signals.length; i++) {
      this.drawSignal(i);
    }

    // Draw border
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      this.margin.left,
      this.margin.top,
      w - this.margin.left - this.margin.right,
      h - this.margin.top - this.margin.bottom
    );
  }

  drawGrid() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Vertical grid (time divisions)
    this.ctx.strokeStyle = '#eee';
    this.ctx.lineWidth = 0.5;

    const timeStep = this.getTimeStep();
    for (let t = 0; t <= this.maxTime; t += timeStep) {
      const x = this.margin.left + t * this.timeScale + this.panX;
      if (x >= this.margin.left && x <= w - this.margin.right) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.margin.top);
        this.ctx.lineTo(x, h - this.margin.bottom);
        this.ctx.stroke();
      }
    }

    // Horizontal grid (signal rows)
    this.ctx.strokeStyle = '#f0f0f0';
    this.ctx.lineWidth = 0.5;

    for (let i = 0; i < this.signals.length; i++) {
      const y = this.margin.top + i * this.rowHeight + this.rowHeight / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.margin.left, y);
      this.ctx.lineTo(w - this.margin.right, y);
      this.ctx.stroke();
    }
  }

  drawTimeAxis() {
    const w = this.canvas.width;
    const timeStep = this.getTimeStep();

    this.ctx.fillStyle = '#666';
    this.ctx.font = '11px monospace';
    this.ctx.textAlign = 'center';

    for (let t = 0; t <= this.maxTime; t += timeStep) {
      const x = this.margin.left + t * this.timeScale + this.panX;
      if (x >= this.margin.left && x <= w - this.margin.right) {
        this.ctx.fillText(t.toString(), x, this.margin.top - 10);
        // Tick mark
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.margin.top - 5);
        this.ctx.lineTo(x, this.margin.top);
        this.ctx.stroke();
      }
    }

    // Time axis label
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Time', w - this.margin.right - 30, this.margin.top - 10);
  }

  drawSignalNames() {
    this.ctx.fillStyle = '#333';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'right';

    for (let i = 0; i < this.signals.length; i++) {
      const y = this.margin.top + i * this.rowHeight + this.rowHeight / 2 + 5;
      this.ctx.fillText(this.signals[i].name, this.margin.left - 10, y);
    }
  }

  drawSignal(index) {
    const signal = this.signals[index];
    const y0 = this.margin.top + index * this.rowHeight + this.rowHeight / 2;

    this.ctx.strokeStyle = signal.color;
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = signal.color;

    const w = this.canvas.width;
    const signalHeight = this.rowHeight / 3;

    for (let t = 0; t < signal.data.length; t++) {
      const x = this.margin.left + t * this.timeScale + this.panX;

      if (x < this.margin.left - 10 || x > w - this.margin.right + 10) continue;

      const val = signal.data[t] ? 1 : 0;
      const y = y0 - val * signalHeight;

      if (t === 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
      } else {
        // Draw transition
        const prevVal = signal.data[t - 1] ? 1 : 0;
        if (prevVal !== val) {
          this.ctx.lineTo(x, y0 - prevVal * signalHeight);
          this.ctx.lineTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
    }

    this.ctx.stroke();

    // Draw signal dots at sample points
    this.ctx.fillStyle = signal.color;
    for (let t = 0; t < signal.data.length; t += Math.max(1, Math.ceil(1 / this.timeScale))) {
      const x = this.margin.left + t * this.timeScale + this.panX;
      const val = signal.data[t] ? 1 : 0;
      const y = y0 - val * signalHeight;

      if (x >= this.margin.left - 10 && x <= w - this.margin.right + 10) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  getTimeStep() {
    if (this.timeScale < 1) return 20;
    if (this.timeScale < 2) return 10;
    return 5;
  }

  simulate(inputs, cycles) {
    // Generate waveform data from input sequence
    const waveData = {};
    for (const [name] of Object.entries(inputs[0] || {})) {
      waveData[name] = [];
    }

    for (const input of inputs) {
      for (const [name, value] of Object.entries(input)) {
        if (waveData[name]) {
          waveData[name].push(value);
        }
      }
    }

    this.clearSignals();
    const colors = ['#0066cc', '#00aa00', '#cc6600', '#cc0000', '#9900cc'];
    let colorIndex = 0;

    for (const [name, data] of Object.entries(waveData)) {
      this.addSignal(name, data, colors[colorIndex % colors.length]);
      colorIndex++;
    }

    this.redraw();
  }

  reset() {
    this.clearSignals();
    this.panX = 0;
    this.panY = 0;
    this.timeScale = 1;
  }
}

export { WaveformViewer };
