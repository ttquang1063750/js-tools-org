(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  const vsSource = `
                      attribute vec3 a_position;
                      uniform mat4 u_MVP;
                      void main() {
                        gl_Position = u_MVP * vec4(a_position, 1.0);
                      }
                    `;
  const fsSource = `
                      precision highp float;
                      uniform vec3 u_color;
                      uniform float u_alpha;
                      void main() {
                        gl_FragColor = vec4(u_color, u_alpha);
                      }
                    `;

  function createShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(s));
    }
    return s;
  }
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
  }

  const posLoc = gl.getAttribLocation(program, 'a_position');
  const mvpLoc = gl.getUniformLocation(program, 'u_MVP');
  const colorLoc = gl.getUniformLocation(program, 'u_color');
  const alphaLoc = gl.getUniformLocation(program, 'u_alpha');

  // Một quad đơn vị trên mặt phẳng XY (z = 0)
  const quad = new Float32Array([-0.7, -0.7, 0, 0.7, -0.7, 0, 0.7, 0.7, 0, -0.7, -0.7, 0, 0.7, 0.7, 0, -0.7, 0.7, 0]);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  function rotY(rad) {
    const s = Math.sin(rad),
      c = Math.cos(rad);
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  }
  function perspective(fovDeg, aspect, near, far) {
    const f = 1.0 / Math.tan((fovDeg * Math.PI) / 360.0);
    const ri = 1.0 / (near - far);
    return new Float32Array([
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * ri,
      -1,
      0,
      0,
      2 * near * far * ri,
      0,
    ]);
  }
  function multiply(a, b) {
    const o = new Float32Array(16);
    for (let r = 0; r < 4; ++r)
      for (let c = 0; c < 4; ++c)
        o[r * 4 + c] = a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] + a[r * 4 + 2] * b[8 + c] + a[r * 4 + 3] * b[12 + c];
    return o;
  }
  function translate(x, y, z) {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  }

  // Ba tấm ở ba độ sâu (z trong không gian model). zDepth lớn = xa camera hơn.
  const planes = [
    { color: [0.95, 0.25, 0.3], z: -1.1 }, // đỏ, xa nhất
    { color: [0.25, 0.85, 0.4], z: 0.0 }, // xanh lá, giữa
    { color: [0.3, 0.55, 0.98], z: 1.1 }, // xanh dương, gần nhất
  ];

  const controls = {
    mode: root.querySelector('#blendMode'),
    alpha: root.querySelector('#blendAlpha'),
    depthWrite: root.querySelector('#depthWrite'),
  };

  function applyBlendMode(mode) {
    gl.enable(gl.BLEND);
    if (mode === 'additive') {
      gl.blendFunc(gl.ONE, gl.ONE);
    } else if (mode === 'multiply') {
      gl.blendFunc(gl.DST_COLOR, gl.ZERO);
    } else {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
  }

  let angle = 0;
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.05, 0.05, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    angle += 0.004;
    const view = translate(0, 0, -4.0);
    const proj = perspective(45, canvas.width / canvas.height, 0.1, 100);
    const vp = multiply(view, proj);

    const alpha = parseFloat(controls.alpha.value);
    const mode = controls.mode.value;
    applyBlendMode(mode);

    // Tắt/bật ghi độ sâu theo checkbox để người dùng thấy artifact.
    gl.depthMask(controls.depthWrite.checked);

    // Vẽ BACK-TO-FRONT: sắp xếp theo z model (xa trước).
    // z model âm = xa hơn sau khi view dịch -4 => sort tăng dần theo z.
    const ordered = planes.slice().sort((a, b) => a.z - b.z);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    for (const p of ordered) {
      const model = multiply(translate(0, 0, p.z), rotY(angle));
      const mvp = multiply(vp, model);
      gl.uniformMatrix4fv(mvpLoc, false, mvp);
      gl.uniform3f(colorLoc, p.color[0], p.color[1], p.color[2]);
      gl.uniform1f(alphaLoc, alpha);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    gl.depthMask(true); // khôi phục cho lần clear sau
    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.mode.value = 'alpha';
    controls.alpha.value = '0.55';
    controls.depthWrite.checked = false;
  });
  draw();
})();
