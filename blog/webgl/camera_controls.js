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

  // Cube geometry (8 vertices, colored faces via index drawing)
  const vertices = new Float32Array([
    -0.3, -0.3, 0.3, 1, 0, 0, 0.3, -0.3, 0.3, 0, 1, 0, 0.3, 0.3, 0.3, 0, 0, 1, -0.3, 0.3, 0.3, 1, 1, 0, -0.3, -0.3,
    -0.3, 1, 0, 1, -0.3, 0.3, -0.3, 0, 1, 1, 0.3, 0.3, -0.3, 1, 1, 1, 0.3, -0.3, -0.3, 0.5, 0.5, 0.5,
  ]);

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
    3,
    2,
    6,
    3,
    6,
    5, // Top
    4,
    7,
    1,
    4,
    1,
    0, // Bottom
    1,
    7,
    6,
    1,
    6,
    2, // Right
    20,
    21,
    22, // unused placeholder
    4,
    0,
    3,
    4,
    3,
    5, // Left
  ]);
  // Fix index out of range for the left face placeholder
  const indicesFixed = new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 3, 2, 6, 3, 6, 5, 4, 7, 1, 4, 1, 0, 1, 7, 6, 1, 6, 2, 4, 0, 3, 4, 3, 5,
  ]);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesFixed, gl.STATIC_DRAW);

  // Matrix & Vector Helpers
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function normalize(a) {
    const len = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    if (len > 0) {
      return [a[0] / len, a[1] / len, a[2] / len];
    }
    return [0, 0, 0];
  }

  function getLookAt(eye, target, up) {
    const zAxis = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
    const xAxis = normalize(cross(up, zAxis));
    const yAxis = cross(zAxis, xAxis);

    return new Float32Array([
      xAxis[0],
      yAxis[0],
      zAxis[0],
      0,
      xAxis[1],
      yAxis[1],
      zAxis[1],
      0,
      xAxis[2],
      yAxis[2],
      zAxis[2],
      0,
      -dot(xAxis, eye),
      -dot(yAxis, eye),
      -dot(zAxis, eye),
      1,
    ]);
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

  const controls = {
    theta: root.querySelector('#camTheta'),
    phi: root.querySelector('#camPhi'),
    radius: root.querySelector('#camRadius'),
    grid: root.querySelector('#matrixViewGrid'),
  };

  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.04, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Calculate camera position from spherical controls
    const th = (parseFloat(controls.theta.value) * Math.PI) / 180.0;
    const ph = (parseFloat(controls.phi.value) * Math.PI) / 180.0;
    const r = parseFloat(controls.radius.value);

    const eye = [r * Math.sin(th) * Math.cos(ph), r * Math.sin(ph), r * Math.cos(th) * Math.cos(ph)];

    const target = [0, 0, 0];
    const up = [0, 1, 0];

    // 1. View Matrix (LookAt)
    const view = getLookAt(eye, target, up);

    // Update matrix UI values
    const cells = controls.grid.children;
    for (let i = 0; i < 16; ++i) {
      cells[i].textContent = view[i].toFixed(2);
    }

    // 2. Model Matrix: stationary cube
    const model = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    // 3. Projection Matrix
    const proj = getPerspective(45, canvas.width / canvas.height, 0.1, 100);

    // MVP = Proj * View * Model
    const mv = multiply(model, view);
    const mvp = multiply(mv, proj);

    gl.useProgram(program);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);

    // Bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);

    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 24, 12);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  }

  // Attach input listeners
  ['theta', 'phi', 'radius'].forEach((k) => {
    controls[k].addEventListener('input', draw);
  });

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.theta.value = '45';
    controls.phi.value = '20';
    controls.radius.value = '2.5';
    draw();
  });

  // First run
  draw();
})();
