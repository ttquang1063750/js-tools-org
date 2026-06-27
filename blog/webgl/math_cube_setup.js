(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  // Shaders
  const vsSource = `
                        attribute vec3 a_position;
                        attribute vec3 a_color;
                        uniform mat4 u_MVP;
                        varying vec3 v_color;
                        void main() {
                          v_color = a_color;
                          gl_Position = u_MVP * vec4(a_position, 1.0);
                        }
                      `;

  const fsSource = `
                        precision mediump float;
                        varying vec3 v_color;
                        void main() {
                          gl_FragColor = vec4(v_color, 1.0);
                        }
                      `;

  function createShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  const posLoc = gl.getAttribLocation(program, 'a_position');
  const colorLoc = gl.getAttribLocation(program, 'a_color');
  const mvpLoc = gl.getUniformLocation(program, 'u_MVP');

  // 3D Cube vertices [x, y, z, r, g, b]
  const vertices = new Float32Array([
    // Front face
    -0.5, -0.5, 0.5, 1, 0, 0, 0.5, -0.5, 0.5, 1, 0, 0, 0.5, 0.5, 0.5, 1, 0, 0, -0.5, 0.5, 0.5, 1, 0, 0,
    // Back face
    -0.5, -0.5, -0.5, 0, 1, 0, -0.5, 0.5, -0.5, 0, 1, 0, 0.5, 0.5, -0.5, 0, 1, 0, 0.5, -0.5, -0.5, 0, 1, 0,
    // Top face
    -0.5, 0.5, -0.5, 0, 0, 1, -0.5, 0.5, 0.5, 0, 0, 1, 0.5, 0.5, 0.5, 0, 0, 1, 0.5, 0.5, -0.5, 0, 0, 1,
    // Bottom face
    -0.5, -0.5, -0.5, 1, 1, 0, 0.5, -0.5, -0.5, 1, 1, 0, 0.5, -0.5, 0.5, 1, 1, 0, -0.5, -0.5, 0.5, 1, 1, 0,
    // Right face
    0.5, -0.5, -0.5, 1, 0, 1, 0.5, 0.5, -0.5, 1, 0, 1, 0.5, 0.5, 0.5, 1, 0, 1, 0.5, -0.5, 0.5, 1, 0, 1,
    // Left face
    -0.5, -0.5, -0.5, 0, 1, 1, -0.5, -0.5, 0.5, 0, 1, 1, -0.5, 0.5, 0.5, 0, 1, 1, -0.5, 0.5, -0.5, 0, 1, 1,
  ]);

  // Indices for Cube rendering
  const indices = new Uint16Array([
    0,
    1,
    2,
    0,
    2,
    3, // Front
    4,
    5,
    6,
    4,
    6,
    7, // Back
    8,
    9,
    10,
    8,
    10,
    11, // Top
    12,
    13,
    14,
    12,
    14,
    15, // Bottom
    16,
    17,
    18,
    16,
    18,
    19, // Right
    20,
    21,
    22,
    20,
    22,
    23, // Left
  ]);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // Simple 4x4 matrix helpers
  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let r = 0; r < 4; ++r) {
      for (let c = 0; c < 4; ++c) {
        out[r * 4 + c] =
          a[r * 4 + 0] * b[0 * 4 + c] +
          a[r * 4 + 1] * b[1 * 4 + c] +
          a[r * 4 + 2] * b[2 * 4 + c] +
          a[r * 4 + 3] * b[3 * 4 + c];
      }
    }
    return out;
  }

  function getPerspective(fovDeg, aspect, near, far) {
    const f = 1.0 / Math.tan((fovDeg * Math.PI) / 360.0);
    const rangeInv = 1.0 / (near - far);
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
      (near + far) * rangeInv,
      -1,
      0,
      0,
      2 * near * far * rangeInv,
      0,
    ]);
  }

  function getRotationX(rad) {
    const s = Math.sin(rad),
      c = Math.cos(rad);
    return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
  }

  function getRotationY(rad) {
    const s = Math.sin(rad),
      c = Math.cos(rad);
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  }

  const controls = {
    yaw: root.querySelector('#yaw'),
    pitch: root.querySelector('#pitch'),
    fov: root.querySelector('#fov'),
    near: root.querySelector('#near'),
    far: root.querySelector('#far'),
  };

  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.04, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // 1. Model Matrix: rotation
    const rx = getRotationX((parseFloat(controls.pitch.value) * Math.PI) / 180.0);
    const ry = getRotationY((parseFloat(controls.yaw.value) * Math.PI) / 180.0);
    const model = multiply(ry, rx);

    // 2. View Matrix: Translate camera back on Z axis
    const view = new Float32Array([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      -2.0,
      1, // translate Z = -2.0
    ]);

    // 3. Projection Matrix
    const proj = getPerspective(
      parseFloat(controls.fov.value),
      canvas.width / canvas.height,
      parseFloat(controls.near.value),
      parseFloat(controls.far.value)
    );

    // MVP = Proj * View * Model
    const mv = multiply(model, view);
    const mvp = multiply(mv, proj);

    gl.useProgram(program);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);

    // Buffers layout
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);

    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 24, 12);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  }

  // Connect inputs
  Object.values(controls).forEach((input) => {
    input.addEventListener('input', draw);
  });

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.yaw.value = '30';
    controls.pitch.value = '25';
    controls.fov.value = '45';
    controls.near.value = '1.0';
    controls.far.value = '15.0';
    draw();
  });

  draw();
})();
