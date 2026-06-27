(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const stage = root.querySelector('.canvas-demo__stage');
  const speedCtl = root.querySelector('#wgpuSpeed');
  const statusEl = root.querySelector('#wgpuStatus');
  let rafId = null;
  let angle = 0;

  const WGSL = `
                      struct VertexOut {
                        @builtin(position) position : vec4<f32>,
                        @location(0) color : vec3<f32>,
                      };
                      @group(0) @binding(0) var<uniform> uAngle : f32;
                      @vertex
                      fn vs_main(@builtin(vertex_index) vIndex : u32) -> VertexOut {
                        var positions = array<vec2<f32>, 3>(
                          vec2<f32>( 0.0,  0.6),
                          vec2<f32>(-0.6, -0.6),
                          vec2<f32>( 0.6, -0.6)
                        );
                        var colors = array<vec3<f32>, 3>(
                          vec3<f32>(1.0, 0.2, 0.3),
                          vec3<f32>(0.2, 0.9, 0.4),
                          vec3<f32>(0.2, 0.4, 1.0)
                        );
                        let s = sin(uAngle);
                        let c = cos(uAngle);
                        let p = positions[vIndex];
                        let r = vec2<f32>(p.x * c - p.y * s, p.x * s + p.y * c);
                        var out : VertexOut;
                        out.position = vec4<f32>(r, 0.0, 1.0);
                        out.color = colors[vIndex];
                        return out;
                      }
                      @fragment
                      fn fs_main(in : VertexOut) -> @location(0) vec4<f32> {
                        return vec4<f32>(in.color, 1.0);
                      }
                    `;

  function stopLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // --- Fallback: vẽ cùng tam giác bằng Canvas 2D ---
  function start2DFallback(message) {
    stopLoop();
    if (statusEl) statusEl.textContent = message || 'Canvas 2D (dự phòng)';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.42;
    const verts = [
      { x: 0.0, y: -0.6, col: '#ff3350' },
      { x: -0.6, y: 0.6, col: '#33e666' },
      { x: 0.6, y: 0.6, col: '#3366ff' },
    ];
    function draw2d() {
      angle += 0.016 * parseFloat(speedCtl.value || '1');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const s = Math.sin(angle),
        c = Math.cos(angle);
      const pts = verts.map((v) => ({
        x: cx + (v.x * c - v.y * s) * scale,
        y: cy + (v.x * s + v.y * c) * scale,
        col: v.col,
      }));
      const g = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
      g.addColorStop(0, pts[0].col);
      g.addColorStop(0.5, pts[1].col);
      g.addColorStop(1, pts[2].col);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.lineTo(pts[2].x, pts[2].y);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
      rafId = requestAnimationFrame(draw2d);
    }
    draw2d();
  }

  function showNoSupportBanner() {
    // Thêm dải thông báo phía trên stage, KHÔNG xóa canvas
    if (!root.querySelector('.wgpu-fallback-banner')) {
      const banner = document.createElement('div');
      banner.className = 'wgpu-fallback-banner';
      banner.style.cssText =
        'padding:10px 14px;margin:0 0 8px;border-radius:6px;font-size:14px;' +
        'background:rgba(202,138,4,0.15);border:1px solid rgba(202,138,4,0.5);color:#ca8a04;';
      banner.textContent =
        'Trình duyệt của bạn chưa hỗ trợ WebGPU. Hãy thử Chrome/Edge mới nhất. ' +
        'Đang hiển thị bản dựng phòng bằng Canvas 2D bên dưới.';
      stage.parentNode.insertBefore(banner, stage);
    }
  }

  // --- Đường WebGPU thật, bọc trong try/catch toàn diện ---
  async function startWebGPU() {
    if (!navigator.gpu) {
      showNoSupportBanner();
      start2DFallback('Canvas 2D (không có WebGPU)');
      return;
    }
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) throw new Error('no-adapter');
      const device = await adapter.requestDevice();
      const context = canvas.getContext('webgpu');
      if (!context) throw new Error('no-context');
      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: 'premultiplied' });

      const module = device.createShaderModule({ code: WGSL });
      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module, entryPoint: 'vs_main' },
        fragment: { module, entryPoint: 'fs_main', targets: [{ format }] },
        primitive: { topology: 'triangle-list' },
      });

      const uniformBuffer = device.createBuffer({
        size: 16, // f32 căn lề 16 byte
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
      });

      if (statusEl) statusEl.textContent = 'WebGPU (GPU thật) ✓';
      const angleData = new Float32Array(1);

      function frame() {
        try {
          angle += 0.016 * parseFloat(speedCtl.value || '1');
          angleData[0] = angle;
          device.queue.writeBuffer(uniformBuffer, 0, angleData);

          const encoder = device.createCommandEncoder();
          const view = context.getCurrentTexture().createView();
          const pass = encoder.beginRenderPass({
            colorAttachments: [
              {
                view,
                clearValue: { r: 0.04, g: 0.05, b: 0.08, a: 1 },
                loadOp: 'clear',
                storeOp: 'store',
              },
            ],
          });
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
          pass.draw(3);
          pass.end();
          device.queue.submit([encoder.finish()]);
          rafId = requestAnimationFrame(frame);
        } catch (err) {
          console.error('WebGPU frame error:', err);
          showNoSupportBanner();
          start2DFallback('Canvas 2D (lỗi runtime WebGPU)');
        }
      }
      frame();
    } catch (err) {
      console.error('WebGPU init error:', err);
      showNoSupportBanner();
      start2DFallback('Canvas 2D (lỗi khởi tạo WebGPU)');
    }
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    speedCtl.value = '1';
    angle = 0;
  });

  // Khởi động (bất đồng bộ); mọi nhánh đều an toàn
  startWebGPU().catch((err) => {
    console.error('WebGPU bootstrap error:', err);
    start2DFallback('Canvas 2D (dự phòng)');
  });
})();
