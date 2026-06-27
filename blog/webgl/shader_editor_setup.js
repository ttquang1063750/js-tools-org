(function () {
  const container = document.querySelector('.glsl-editor-container');
  if (!container) return;

  const textarea = container.querySelector('.glsl-editor__textarea');
  const canvas = container.querySelector('.glsl-editor__canvas');
  const consolePanel = container.querySelector('.glsl-editor__console');
  const runBtn = container.querySelector('.glsl-editor__btn--run');
  const resetBtn = container.querySelector('.glsl-editor__btn--reset');
  const presetSelect = container.querySelector('#shaderPresetSelect');

  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  // Standard Vertex Shader (Full-screen Quad)
  const vsSource = `
          attribute vec2 a_position;
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
          }
        `;

  const presets = {
    wave: `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float red = 0.5 + 0.5 * sin(u_time + uv.x * 5.0);
  float green = 0.5 + 0.5 * cos(u_time + uv.y * 5.0);
  float blue = uv.x * uv.y;
  gl_FragColor = vec4(red, green, blue, 1.0);
}`,
    circle: `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  // Di chuyển gốc tọa độ về tâm
  vec2 center = uv - 0.5;
  center.x *= u_resolution.x / u_resolution.y; // Fix aspect ratio
  
  float dist = length(center);
  float radius = 0.25 + 0.05 * sin(u_time * 3.0);
  
  // smoothstep vẽ hình tròn viền mềm mại
  float pct = 1.0 - smoothstep(radius - 0.01, radius + 0.01, dist);
  
  vec3 color = vec3(0.5 + 0.5 * sin(u_time), 0.3 + 0.7 * cos(u_time), 0.9) * pct;
  gl_FragColor = vec4(color, 1.0);
}`,
    vignette: `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  // Tạo background gradient chuyển màu
  vec3 bgColor = vec3(uv.x, uv.y, 0.5 + 0.5 * sin(u_time));
  
  // Tính khoảng cách từ tâm để tạo hiệu ứng tối góc (vignette)
  vec2 d = abs(uv - 0.5) * 1.5;
  float vignette = 1.0 - dot(d, d);
  
  gl_FragColor = vec4(bgColor * vignette, 1.0);
}`,
  };

  const initialCode = presets.wave;

  // Quad geometry
  const vertices = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  let activeProgram = null;
  let animationFrameId = null;
  let startTime = Date.now();

  function compileAndLink(fsSource) {
    consolePanel.classList.remove('active');
    consolePanel.textContent = '';

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      consolePanel.textContent = 'Lỗi biên dịch Fragment Shader:\n' + gl.getShaderInfoLog(fs);
      consolePanel.classList.add('active');
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return false;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      consolePanel.textContent = 'Lỗi liên kết chương trình:\n' + gl.getProgramInfoLog(prog);
      consolePanel.classList.add('active');
      return false;
    }

    if (activeProgram) {
      gl.deleteProgram(activeProgram);
    }
    activeProgram = prog;
    return true;
  }

  function startRenderLoop() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    const posLoc = gl.getAttribLocation(activeProgram, 'a_position');
    const resLoc = gl.getUniformLocation(activeProgram, 'u_resolution');
    const timeLoc = gl.getUniformLocation(activeProgram, 'u_time');

    function render() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(activeProgram);

      if (resLoc) {
        gl.uniform2f(resLoc, canvas.width, canvas.height);
      }
      if (timeLoc) {
        const elapsed = (Date.now() - startTime) / 1000.0;
        gl.uniform1f(timeLoc, elapsed);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    }

    render();
  }

  function runEditor() {
    const code = textarea.value;
    if (compileAndLink(code)) {
      startRenderLoop();
    }
  }

  runBtn.addEventListener('click', runEditor);
  resetBtn.addEventListener('click', () => {
    textarea.value = presets[presetSelect.value];
    runEditor();
  });

  presetSelect.addEventListener('change', () => {
    textarea.value = presets[presetSelect.value];
    runEditor();
  });

  // Initialize editor
  textarea.value = initialCode;
  runEditor();
})();
