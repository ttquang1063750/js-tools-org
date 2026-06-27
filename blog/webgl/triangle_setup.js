(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    canvas.style.display = 'none';
    const err = document.createElement('p');
    err.style.color = '#ef4444';
    err.textContent = 'Trình duyệt của bạn không hỗ trợ WebGL.';
    root.appendChild(err);
    return;
  }

  // Shader Sources
  const vsSource = `
                        attribute vec2 a_position;
                        attribute vec3 a_color;
                        varying vec3 v_color;
                        void main() {
                          v_color = a_color;
                          gl_Position = vec4(a_position, 0.0, 1.0);
                        }
                      `;

  const fsSource = `
                        precision mediump float;
                        varying vec3 v_color;
                        void main() {
                          gl_FragColor = vec4(v_color, 1.0);
                        }
                      `;

  // Helper to compile shader
  function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compileShader(gl, vsSource, gl.VERTEX_SHADER);
  const fs = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    return;
  }

  // Lookups
  const posLoc = gl.getAttribLocation(program, 'a_position');
  const colorLoc = gl.getAttribLocation(program, 'a_color');

  // Vertex Buffers
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  // Define vertices: [x, y, r, g, b]
  const vertexData = new Float32Array([
    0.0,
    0.8,
    1.0,
    0.0,
    0.0, // Red top
    -0.8,
    -0.6,
    0.0,
    1.0,
    0.0, // Green bottom-left
    0.8,
    -0.6,
    0.0,
    0.0,
    1.0, // Blue bottom-right
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);

  // Bind inputs
  const controls = {
    v1x: root.querySelector('#v1x'),
    v1y: root.querySelector('#v1y'),
    v2x: root.querySelector('#v2x'),
    v2y: root.querySelector('#v2y'),
    v3x: root.querySelector('#v3x'),
    v3y: root.querySelector('#v3y'),
    bg: root.querySelector('#bgColorSelect'),
  };

  function draw() {
    // Resizing
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Background select
    let bgVal = controls.bg.value;
    if (bgVal === 'dark') {
      gl.clearColor(0.02, 0.04, 0.1, 1.0);
    } else if (bgVal === 'light') {
      gl.clearColor(1.0, 1.0, 1.0, 1.0);
    } else {
      gl.clearColor(0.05, 0.2, 0.05, 1.0);
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Update buffer
    const updatedData = new Float32Array([
      parseFloat(controls.v1x.value),
      parseFloat(controls.v1y.value),
      1.0,
      0.0,
      0.0,
      parseFloat(controls.v2x.value),
      parseFloat(controls.v2y.value),
      0.0,
      1.0,
      0.0,
      parseFloat(controls.v3x.value),
      parseFloat(controls.v3y.value),
      0.0,
      0.0,
      1.0,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, updatedData);

    // Use program
    gl.useProgram(program);

    // Enable attribute point layout
    // Float32Array element size = 4 bytes
    // Stride = 5 elements * 4 = 20 bytes
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 20, 0);

    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 20, 8); // Offset = 2 elements * 4 = 8 bytes

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Listeners
  Object.values(controls).forEach((input) => {
    input.addEventListener('input', draw);
  });

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.v1x.value = '0.0';
    controls.v1y.value = '0.8';
    controls.v2x.value = '-0.8';
    controls.v2y.value = '-0.6';
    controls.v3x.value = '0.8';
    controls.v3y.value = '-0.6';
    controls.bg.value = 'dark';
    draw();
  });

  // First draw
  draw();
})();
