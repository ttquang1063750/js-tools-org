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

  // 1. Indexed Geometry (8 unique vertices for a Cube)
  const uniqueVertices = new Float32Array([
    // [x,y,z, r,g,b]
    -0.4, -0.4, 0.4, 1, 0, 0, 0.4, -0.4, 0.4, 0, 1, 0, 0.4, 0.4, 0.4, 0, 0, 1, -0.4, 0.4, 0.4, 1, 1, 0, -0.4, -0.4,
    -0.4, 1, 0, 1, -0.4, 0.4, -0.4, 0, 1, 1, 0.4, 0.4, -0.4, 1, 1, 1, 0.4, -0.4, -0.4, 0.5, 0.5, 0.5,
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
    4,
    0,
    3,
    4,
    3,
    5, // Left
  ]);

  // 2. Non-indexed Geometry (36 duplicate vertices for a Cube)
  const flatVertices = [];
  for (let i = 0; i < indices.length; ++i) {
    const idx = indices[i];
    flatVertices.push(
      uniqueVertices[idx * 6],
      uniqueVertices[idx * 6 + 1],
      uniqueVertices[idx * 6 + 2], // pos
      uniqueVertices[idx * 6 + 3],
      uniqueVertices[idx * 6 + 4],
      uniqueVertices[idx * 6 + 5] // col
    );
  }
  const nonIndexedVertices = new Float32Array(flatVertices);

  // Setup Buffers
  const vboIndexed = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboIndexed);
  gl.bufferData(gl.ARRAY_BUFFER, uniqueVertices, gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  const vboNonIndexed = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboNonIndexed);
  gl.bufferData(gl.ARRAY_BUFFER, nonIndexedVertices, gl.STATIC_DRAW);

  // WebGL 2 VAO setup if supported
  let vaoIndexed = null;
  let vaoNonIndexed = null;

  if (gl.createVertexArray) {
    // VAO for Indexed Mode
    vaoIndexed = gl.createVertexArray();
    gl.bindVertexArray(vaoIndexed);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboIndexed);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 24, 12);

    // VAO for Non-indexed Mode
    vaoNonIndexed = gl.createVertexArray();
    gl.bindVertexArray(vaoNonIndexed);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNonIndexed);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 24, 12);

    gl.bindVertexArray(null);
  }

  // Matrix helpers
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
    mode: root.querySelector('#drawMode'),
    vertexText: root.querySelector('#vertexCountText'),
    memText: root.querySelector('#memoryFootprintText'),
  };

  let angle = 0;
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.04, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    angle += 0.007;
    const rx = getRotationX(angle * 0.4);
    const ry = getRotationY(angle);
    const model = multiply(ry, rx);

    const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -2.0, 1]);

    const proj = getPerspective(45, canvas.width / canvas.height, 0.1, 10);
    const mv = multiply(model, view);
    const mvp = multiply(mv, proj);

    gl.useProgram(program);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);

    const isIndexed = controls.mode.value === 'indexed';

    if (isIndexed) {
      controls.vertexText.textContent = '8 Đỉnh (Vật lý)';
      controls.memText.textContent = uniqueVertices.byteLength + indices.byteLength + ' bytes (VBO + IBO)';

      if (vaoIndexed) {
        gl.bindVertexArray(vaoIndexed);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, vboIndexed);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 24, 12);
      }
      gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    } else {
      controls.vertexText.textContent = '36 Đỉnh (Tuần tự)';
      controls.memText.textContent = nonIndexedVertices.byteLength + ' bytes (VBO)';

      if (vaoNonIndexed) {
        gl.bindVertexArray(vaoNonIndexed);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, vboNonIndexed);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 24, 12);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    if (gl.bindVertexArray) {
      gl.bindVertexArray(null);
    }

    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.mode.value = 'indexed';
  });

  draw();
})();
