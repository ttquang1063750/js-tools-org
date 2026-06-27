(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  // Shaders supporting instanced position attribute
  const vsSource = `
                      attribute vec3 a_position;
                      attribute vec3 a_color;
                      attribute vec3 a_instanceOffset; // divisor = 1
                      uniform mat4 u_ViewProj;
                      uniform float u_time;
                      varying vec3 v_color;

                      mat4 getRotationY(float rad) {
                        float s = sin(rad), c = cos(rad);
                        return mat4(
                          c,   0.0, -s,  0.0,
                          0.0, 1.0, 0.0, 0.0,
                          s,   0.0, c,   0.0,
                          0.0, 0.0, 0.0, 1.0
                        );
                      }

                      void main() {
                        v_color = a_color;
                        // Rotate each individual instance around its center
                        mat4 rot = getRotationY(u_time * 1.5 + length(a_instanceOffset));
                        vec3 pos = vec3(rot * vec4(a_position, 1.0));
                        gl_Position = u_ViewProj * vec4(pos + a_instanceOffset, 1.0);
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
  const colLoc = gl.getAttribLocation(program, 'a_color');
  const instLoc = gl.getAttribLocation(program, 'a_instanceOffset');
  const vpLoc = gl.getUniformLocation(program, 'u_ViewProj');
  const timeLoc = gl.getUniformLocation(program, 'u_time');

  // Cube geometry [x,y,z, r,g,b]
  const vertices = new Float32Array([
    -0.03, -0.03, 0.03, 0.9, 0.3, 0.2, 0.03, -0.03, 0.03, 0.2, 0.8, 0.3, 0.03, 0.03, 0.03, 0.1, 0.5, 0.9, -0.03, 0.03,
    0.03, 0.9, 0.9, 0.1, -0.03, -0.03, -0.03, 0.8, 0.2, 0.8, -0.03, 0.03, -0.03, 0.2, 0.9, 0.9, 0.03, 0.03, -0.03, 0.9,
    0.9, 0.9, 0.03, -0.03, -0.03, 0.4, 0.4, 0.4,
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

  // Generate 500 random offset positions for the instances
  const instanceCount = 500;
  const offsets = new Float32Array(instanceCount * 3);
  for (let i = 0; i < instanceCount; ++i) {
    offsets[i * 3] = (Math.random() - 0.5) * 1.6; // x
    offsets[i * 3 + 1] = (Math.random() - 0.5) * 0.9; // y
    offsets[i * 3 + 2] = (Math.random() - 0.5) * 1.5; // z
  }

  const cubeVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const cubeIbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  const instVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instVbo);
  gl.bufferData(gl.ARRAY_BUFFER, offsets, gl.STATIC_DRAW);

  // WebGL 2 VAO for instanced rendering
  let vaoInstanced = null;
  if (gl.createVertexArray) {
    vaoInstanced = gl.createVertexArray();
    gl.bindVertexArray(vaoInstanced);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(colLoc);
    gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 24, 12);

    gl.bindBuffer(gl.ARRAY_BUFFER, instVbo);
    gl.enableVertexAttribArray(instLoc);
    gl.vertexAttribPointer(instLoc, 3, gl.FLOAT, false, 12, 0);
    gl.vertexAttribDivisor(instLoc, 1); // divisor for instanced attribute

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIbo);
    gl.bindVertexArray(null);
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

  const controls = {
    method: root.querySelector('#optDrawMethod'),
    dcText: root.querySelector('#drawCallsText'),
    fpsText: root.querySelector('#fpsCounterText'),
  };

  let lastTime = performance.now();
  let frames = 0;
  const startTime = Date.now();

  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.04, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Calculate FPS
    frames++;
    const timeNow = performance.now();
    if (timeNow >= lastTime + 1000) {
      controls.fpsText.textContent = frames;
      if (frames > 50) {
        controls.fpsText.style.color = '#34d399'; // green
      } else {
        controls.fpsText.style.color = '#ef4444'; // red
      }
      frames = 0;
      lastTime = timeNow;
    }

    // View Projection
    const viewProj = getPerspective(45, canvas.width / canvas.height, 0.1, 10);
    viewProj[14] = -1.2; // Move camera Z back

    gl.useProgram(program);
    gl.uniformMatrix4fv(vpLoc, false, viewProj);
    gl.uniform1f(timeLoc, (Date.now() - startTime) / 1000.0);

    const method = controls.method.value;

    if (method === 'instanced' && vaoInstanced) {
      controls.dcText.textContent = '1 Lệnh vẽ (Instanced)';
      gl.bindVertexArray(vaoInstanced);
      gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, instanceCount);
      gl.bindVertexArray(null);
    } else {
      controls.dcText.textContent = '500 Lệnh vẽ (Standard loop)';
      // Draw with classic loop mimicking CPU bound overhead
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeVbo);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(colLoc);
      gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 24, 12);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIbo);

      // Disable divisor to avoid reading from instance buffer automatically
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(instLoc, 0);
      }

      for (let i = 0; i < instanceCount; ++i) {
        // Manually passing the offset via vertex attribute for each cube
        gl.vertexAttrib3f(instLoc, offsets[i * 3], offsets[i * 3 + 1], offsets[i * 3 + 2]);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
      }
    }

    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.method.value = 'instanced';
  });

  draw();
})();
