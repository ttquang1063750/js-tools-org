(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  // --- Ba mô hình OBJ nhúng sẵn dưới dạng chuỗi (low-poly) ---
  const OBJ_MODELS = {
    cube: `
o Cube
v -0.6 -0.6 -0.6
v  0.6 -0.6 -0.6
v  0.6  0.6 -0.6
v -0.6  0.6 -0.6
v -0.6 -0.6  0.6
v  0.6 -0.6  0.6
v  0.6  0.6  0.6
v -0.6  0.6  0.6
f 1 2 3 4
f 5 8 7 6
f 1 5 6 2
f 2 6 7 3
f 3 7 8 4
f 4 8 5 1
`,
    tetra: `
o Tetrahedron
v  0.0  0.85  0.0
v -0.75 -0.45  0.45
v  0.75 -0.45  0.45
v  0.0  -0.45 -0.85
vn  0.00  0.50  0.86
vn  0.81 -0.30  0.50
vn -0.81 -0.30  0.50
vn  0.00 -0.30 -1.00
f 1//1 2//1 3//1
f 1//2 3//2 4//2
f 1//3 4//3 2//3
f 2//4 4//4 3//4
`,
    octa: `
o Octahedron
v  0.0  0.85  0.0
v  0.85  0.0  0.0
v  0.0  0.0  0.85
v -0.85  0.0  0.0
v  0.0  0.0 -0.85
v  0.0 -0.85  0.0
f 1 2 3
f 1 3 4
f 1 4 5
f 1 5 2
f 6 3 2
f 6 4 3
f 6 5 4
f 6 2 5
`,
  };

  // --- Parser OBJ thật: hỗ trợ f với v, v/vt, v//vn, v/vt/vn ---
  function parseOBJ(text) {
    const positions = [];
    const normals = [];
    const finalPos = [];
    const finalNorm = [];
    const indices = [];
    const cache = new Map();
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line || line[0] === '#') continue;
      const parts = line.split(/\s+/);
      const tag = parts.shift();
      if (tag === 'v') positions.push(parts.slice(0, 3).map(Number));
      else if (tag === 'vn') normals.push(parts.slice(0, 3).map(Number));
      else if (tag === 'f') {
        // tam giác hóa quạt cho mặt nhiều đỉnh (vd quad của cube)
        for (let i = 1; i < parts.length - 1; i++) {
          for (const corner of [parts[0], parts[i], parts[i + 1]]) {
            if (cache.has(corner)) {
              indices.push(cache.get(corner));
              continue;
            }
            const seg = corner.split('/');
            const vi = parseInt(seg[0], 10);
            const ni = seg[2] ? parseInt(seg[2], 10) : NaN;
            const p = positions[vi - 1];
            const n = !isNaN(ni) ? normals[ni - 1] : [0, 0, 0];
            const idx = finalPos.length / 3;
            finalPos.push(p[0], p[1], p[2]);
            finalNorm.push(n[0], n[1], n[2]);
            cache.set(corner, idx);
            indices.push(idx);
          }
        }
      }
    }
    return { positions: finalPos, normals: finalNorm, indices, hasNormals: normals.length > 0 };
  }

  // --- Tính normals từ tích có hướng nếu OBJ thiếu vn ---
  function computeNormals(pos, normArr, indices) {
    for (let i = 0; i < normArr.length; i++) normArr[i] = 0;
    for (let t = 0; t < indices.length; t += 3) {
      const ia = indices[t] * 3,
        ib = indices[t + 1] * 3,
        ic = indices[t + 2] * 3;
      const ax = pos[ia],
        ay = pos[ia + 1],
        az = pos[ia + 2];
      const e1 = [pos[ib] - ax, pos[ib + 1] - ay, pos[ib + 2] - az];
      const e2 = [pos[ic] - ax, pos[ic + 1] - ay, pos[ic + 2] - az];
      const nx = e1[1] * e2[2] - e1[2] * e2[1];
      const ny = e1[2] * e2[0] - e1[0] * e2[2];
      const nz = e1[0] * e2[1] - e1[1] * e2[0];
      for (const base of [ia, ib, ic]) {
        normArr[base] += nx;
        normArr[base + 1] += ny;
        normArr[base + 2] += nz;
      }
    }
    for (let i = 0; i < normArr.length; i += 3) {
      const l = Math.hypot(normArr[i], normArr[i + 1], normArr[i + 2]) || 1;
      normArr[i] /= l;
      normArr[i + 1] /= l;
      normArr[i + 2] /= l;
    }
  }

  const vsSource = `
                      attribute vec3 a_position;
                      attribute vec3 a_normal;
                      uniform mat4 u_MVP;
                      uniform mat3 u_NormalMatrix;
                      varying vec3 v_normal;
                      void main() {
                        v_normal = normalize(u_NormalMatrix * a_normal);
                        gl_Position = u_MVP * vec4(a_position, 1.0);
                      }
                    `;
  const fsSource = `
                      precision highp float;
                      varying vec3 v_normal;
                      uniform vec3 u_lightDir;
                      uniform vec3 u_color;
                      void main() {
                        vec3 N = normalize(v_normal);
                        float diff = max(dot(N, normalize(u_lightDir)), 0.0);
                        vec3 color = u_color * (0.18 + 0.82 * diff);
                        gl_FragColor = vec4(color, 1.0);
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
    return;
  }

  const posLoc = gl.getAttribLocation(program, 'a_position');
  const normLoc = gl.getAttribLocation(program, 'a_normal');
  const mvpLoc = gl.getUniformLocation(program, 'u_MVP');
  const normMatLoc = gl.getUniformLocation(program, 'u_NormalMatrix');
  const lightLoc = gl.getUniformLocation(program, 'u_lightDir');
  const colorLoc = gl.getUniformLocation(program, 'u_color');

  const posBuf = gl.createBuffer();
  const normBuf = gl.createBuffer();
  const idxBuf = gl.createBuffer();
  const lineIdxBuf = gl.createBuffer();
  let triCount = 0;
  let lineCount = 0;

  function buildMesh(key) {
    const mesh = parseOBJ(OBJ_MODELS[key]);
    if (!mesh.hasNormals) computeNormals(mesh.positions, mesh.normals, mesh.indices);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);
    triCount = mesh.indices.length;
    // dựng index dạng đường cho wireframe (mỗi tam giác -> 3 cạnh)
    const lines = [];
    for (let t = 0; t < mesh.indices.length; t += 3) {
      const a = mesh.indices[t],
        b = mesh.indices[t + 1],
        c = mesh.indices[t + 2];
      lines.push(a, b, b, c, c, a);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lines), gl.STATIC_DRAW);
    lineCount = lines.length;
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
  function rotY(rad) {
    const s = Math.sin(rad),
      c = Math.cos(rad);
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  }
  function multiply(a, b) {
    const o = new Float32Array(16);
    for (let r = 0; r < 4; ++r)
      for (let c = 0; c < 4; ++c)
        o[r * 4 + c] = a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] + a[r * 4 + 2] * b[8 + c] + a[r * 4 + 3] * b[12 + c];
    return o;
  }

  const controls = {
    model: root.querySelector('#mlModel'),
    wire: root.querySelector('#mlWire'),
    spin: root.querySelector('#mlSpin'),
  };
  controls.model.addEventListener('change', () => buildMesh(controls.model.value));
  buildMesh(controls.model.value);

  let angle = 0.4;
  function draw() {
    if (controls.spin.checked) angle += 0.008;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.04, 0.05, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const model = rotY(angle);
    const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -2.6, 1]);
    const proj = perspective(45, canvas.width / canvas.height, 0.1, 100);
    const mvp = multiply(multiply(model, view), proj);
    const normMat = new Float32Array([
      model[0],
      model[1],
      model[2],
      model[4],
      model[5],
      model[6],
      model[8],
      model[9],
      model[10],
    ]);

    gl.useProgram(program);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);
    gl.uniformMatrix3fv(normMatLoc, false, normMat);
    gl.uniform3f(lightLoc, 0.5, 0.8, 0.9);
    gl.uniform3f(colorLoc, 0.36, 0.78, 0.62);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.enableVertexAttribArray(normLoc);
    gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);

    if (controls.wire.checked) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIdxBuf);
      gl.drawElements(gl.LINES, lineCount, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      gl.drawElements(gl.TRIANGLES, triCount, gl.UNSIGNED_SHORT, 0);
    }
    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.model.value = 'cube';
    controls.wire.checked = false;
    controls.spin.checked = true;
    angle = 0.4;
    buildMesh('cube');
  });
  draw();
})();
