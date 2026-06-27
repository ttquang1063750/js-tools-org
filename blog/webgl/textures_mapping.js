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
                      attribute vec2 a_texCoord;
                      uniform mat4 u_MVP;
                      varying vec2 v_texCoord;
                      void main() {
                        v_texCoord = a_texCoord;
                        gl_Position = u_MVP * vec4(a_position, 1.0);
                      }
                    `;

  const fsSource = `
                      precision mediump float;
                      varying vec2 v_texCoord;
                      uniform sampler2D u_tex1;
                      uniform sampler2D u_tex2;
                      uniform float u_mix;
                      void main() {
                        vec4 c1 = texture2D(u_tex1, v_texCoord);
                        vec4 c2 = texture2D(u_tex2, v_texCoord);
                        gl_FragColor = mix(c1, c2, u_mix);
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
  const texLoc = gl.getAttribLocation(program, 'a_texCoord');
  const mvpLoc = gl.getUniformLocation(program, 'u_MVP');
  const t1Loc = gl.getUniformLocation(program, 'u_tex1');
  const t2Loc = gl.getUniformLocation(program, 'u_tex2');
  const mixLoc = gl.getUniformLocation(program, 'u_mix');

  // Cube Vertices [x,y,z, u,v]
  const vertices = new Float32Array([
    // Front face
    -0.5, -0.5, 0.5, 0.0, 0.0, 0.5, -0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.5, 1.0, 1.0, -0.5, 0.5, 0.5, 0.0, 1.0,
    // Back face
    -0.5, -0.5, -0.5, 1.0, 0.0, -0.5, 0.5, -0.5, 1.0, 1.0, 0.5, 0.5, -0.5, 0.0, 1.0, 0.5, -0.5, -0.5, 0.0, 0.0,
    // Top face
    -0.5, 0.5, -0.5, 0.0, 1.0, -0.5, 0.5, 0.5, 0.0, 0.0, 0.5, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, -0.5, 1.0, 1.0,
    // Bottom face
    -0.5, -0.5, -0.5, 1.0, 1.0, 0.5, -0.5, -0.5, 0.0, 1.0, 0.5, -0.5, 0.5, 0.0, 0.0, -0.5, -0.5, 0.5, 1.0, 0.0,
    // Right face
    0.5, -0.5, -0.5, 1.0, 0.0, 0.5, 0.5, -0.5, 1.0, 1.0, 0.5, 0.5, 0.5, 0.0, 1.0, 0.5, -0.5, 0.5, 0.0, 0.0,
    // Left face
    -0.5, -0.5, -0.5, 0.0, 0.0, -0.5, -0.5, 0.5, 1.0, 0.0, -0.5, 0.5, 0.5, 1.0, 1.0, -0.5, 0.5, -0.5, 0.0, 1.0,
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

  // Dynamic texture generation using 2D canvas to avoid cross-origin / local file issues
  function generateCheckerboard() {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#8b5cf6'; // Violet
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#1e1b4b'; // Dark blue
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * 16, j * 16, 16, 16);
        }
      }
    }
    return c;
  }

  function generateLabel() {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#10b981'; // Green
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WebGL', 64, 50);
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('js-tools', 64, 85);
    return c;
  }

  // Create Textures on GPU
  const tex1 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, generateCheckerboard());
  gl.generateMipmap(gl.TEXTURE_2D);

  const tex2 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex2);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, generateLabel());
  gl.generateMipmap(gl.TEXTURE_2D);

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
    mix: root.querySelector('#mixRatio'),
    filter: root.querySelector('#filterMode'),
    wrap: root.querySelector('#wrapMode'),
  };

  let angle = 0;
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.04, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    angle += 0.006;
    const modelX = getRotationX(angle * 0.5);
    const modelY = getRotationY(angle);
    const model = multiply(modelY, modelX);

    const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -2.0, 1]);

    const proj = getPerspective(45, canvas.width / canvas.height, 0.1, 10);
    const mv = multiply(model, view);
    const mvp = multiply(mv, proj);

    // Bind textures and update parameters dynamically based on UI inputs
    const fMode = controls.filter.value;
    const wMode = controls.wrap.value;

    [tex1, tex2].forEach((tex) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);

      // Configure Wrapping
      if (wMode === 'repeat') {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }

      // Configure Filtering
      if (fMode === 'nearest') {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      } else if (fMode === 'linear') {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      }
    });

    // Bind to separate slots
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex1);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex2);

    gl.useProgram(program);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);
    gl.uniform1i(t1Loc, 0); // slot 0
    gl.uniform1i(t2Loc, 1); // slot 1
    gl.uniform1f(mixLoc, parseFloat(controls.mix.value));

    // Buffer bind
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 20, 0);

    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 20, 12);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.mix.value = '0.5';
    controls.filter.value = 'linear';
    controls.wrap.value = 'clamp';
  });

  draw();
})();
