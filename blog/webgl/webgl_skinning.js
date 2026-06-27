(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  const NUM_BONES = 4;

  const vsSource = `
                      attribute vec3 a_position;
                      attribute vec3 a_normal;
                      attribute vec4 a_jointIndices;
                      attribute vec4 a_jointWeights;
                      uniform mat4 u_MVP;
                      uniform mat4 u_jointMat[4];
                      varying vec3 v_normal;
                      void main() {
                        mat4 skinMatrix =
                            a_jointWeights.x * u_jointMat[int(a_jointIndices.x)] +
                            a_jointWeights.y * u_jointMat[int(a_jointIndices.y)] +
                            a_jointWeights.z * u_jointMat[int(a_jointIndices.z)] +
                            a_jointWeights.w * u_jointMat[int(a_jointIndices.w)];
                        vec4 pos = skinMatrix * vec4(a_position, 1.0);
                        v_normal = normalize(mat3(skinMatrix) * a_normal);
                        gl_Position = u_MVP * pos;
                      }
                    `;

  const fsSource = `
                      precision highp float;
                      varying vec3 v_normal;
                      uniform vec3 u_color;
                      void main() {
                        vec3 N = normalize(v_normal);
                        vec3 L = normalize(vec3(0.4, 0.8, 0.6));
                        float diff = max(dot(N, L), 0.0) * 0.8 + 0.2;
                        gl_FragColor = vec4(u_color * diff, 1.0);
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
  function buildProgram(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, createShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, createShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('Link error:', gl.getProgramInfoLog(p));
    }
    return p;
  }
  const program = buildProgram(vsSource, fsSource);

  // Shader đơn giản để vẽ xương (không skinning).
  const boneVS = `
                      attribute vec3 a_position;
                      uniform mat4 u_MVP;
                      void main() {
                        gl_Position = u_MVP * vec4(a_position, 1.0);
                        gl_PointSize = 9.0;
                      }
                    `;
  const boneFS = `
                      precision mediump float;
                      uniform vec3 u_color;
                      void main() { gl_FragColor = vec4(u_color, 1.0); }
                    `;
  const boneProgram = buildProgram(boneVS, boneFS);

  // ---- Helpers ma trận (tái sử dụng từ bài PBR) ----
  function identity() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
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
  // Xoay quanh trục Z (column-major)
  function rotationZ(rad) {
    const s = Math.sin(rad),
      c = Math.cos(rad);
    return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }
  function translation(x, y, z) {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  }
  function transformPoint(m, p) {
    return [
      m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
      m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
      m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
    ];
  }

  // ---- Sinh xúc tu: dải hộp chia nhỏ dọc trục Y ----
  // Mỗi xương dài BONE_LEN, tổng chiều dài = NUM_BONES * BONE_LEN.
  const BONE_LEN = 0.55;
  const SEGMENTS = 24; // số lát cắt dọc chiều dài
  const HALF_W = 0.16; // nửa bề ngang
  const totalLen = NUM_BONES * BONE_LEN;

  const verts = []; // x,y,z, nx,ny,nz, j0..j3, w0..w3
  const indices = [];
  // Mặt cắt là hình vuông 4 góc quanh trục.
  const cornersXZ = [
    [-HALF_W, -HALF_W],
    [HALF_W, -HALF_W],
    [HALF_W, HALF_W],
    [-HALF_W, HALF_W],
  ];
  const cornerNormals = [
    [0, 0, -1],
    [1, 0, 0],
    [0, 0, 1],
    [-1, 0, 0],
  ];
  for (let s = 0; s <= SEGMENTS; s++) {
    const t = s / SEGMENTS;
    const y = t * totalLen; // gốc xúc tu ở y=0
    // Trọng số: vị trí dọc -> chỉ số xương + nội suy sang xương kế.
    const fb = t * NUM_BONES; // vị trí xương dạng số thực
    let j0 = Math.floor(fb);
    if (j0 >= NUM_BONES) j0 = NUM_BONES - 1;
    const j1 = Math.min(j0 + 1, NUM_BONES - 1);
    let w1 = fb - j0;
    if (j1 === j0) w1 = 0;
    const w0 = 1 - w1;
    for (let c = 0; c < 4; c++) {
      verts.push(cornersXZ[c][0], y, cornersXZ[c][1]);
      verts.push(cornerNormals[c][0], 0, cornerNormals[c][1]);
      verts.push(j0, j1, 0, 0); // joint indices
      verts.push(w0, w1, 0, 0); // joint weights
    }
  }
  const STRIDE = 14;
  for (let s = 0; s < SEGMENTS; s++) {
    const base = s * 4;
    const next = (s + 1) * 4;
    for (let c = 0; c < 4; c++) {
      const a = base + c;
      const b = base + ((c + 1) % 4);
      const a2 = next + c;
      const b2 = next + ((c + 1) % 4);
      indices.push(a, a2, b, b, a2, b2);
    }
  }

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Buffer cho việc vẽ các khớp (điểm + đường).
  const boneVbo = gl.createBuffer();

  const posLoc = gl.getAttribLocation(program, 'a_position');
  const normLoc = gl.getAttribLocation(program, 'a_normal');
  const jiLoc = gl.getAttribLocation(program, 'a_jointIndices');
  const jwLoc = gl.getAttribLocation(program, 'a_jointWeights');
  const mvpLoc = gl.getUniformLocation(program, 'u_MVP');
  const colorLoc = gl.getUniformLocation(program, 'u_color');
  const jointMatLoc = gl.getUniformLocation(program, 'u_jointMat');

  const bonePosLoc = gl.getAttribLocation(boneProgram, 'a_position');
  const boneMvpLoc = gl.getUniformLocation(boneProgram, 'u_MVP');
  const boneColorLoc = gl.getUniformLocation(boneProgram, 'u_color');

  // ---- Inverse bind ----
  // Tại bind pose, world matrix của xương k = translation(0, k*BONE_LEN, 0),
  // nên inverseBind = translation(0, -k*BONE_LEN, 0).
  const inverseBind = [];
  for (let k = 0; k < NUM_BONES; k++) {
    inverseBind.push(translation(0, -k * BONE_LEN, 0));
  }

  const controls = {
    speed: root.querySelector('#skinSpeed'),
    bend: root.querySelector('#skinBend'),
    showBones: root.querySelector('#skinShowBones'),
  };

  let time = 0;
  let last = performance.now();

  function computeSkeleton(t) {
    const bend = parseFloat(controls.bend.value);
    const world = []; // joint (world) matrix
    const skin = []; // skinMatrix = world * inverseBind
    const jointPositions = [];
    let parentWorld = identity();
    for (let k = 0; k < NUM_BONES; k++) {
      // Góc dao động lệch pha dọc theo chuỗi xương -> sóng lan.
      const angle = Math.sin(t * 1.6 + k * 0.9) * bend;
      // local = (tịnh tiến lên BONE_LEN nếu k>0) × xoay quanh Z
      let local;
      if (k === 0) {
        local = rotationZ(angle);
      } else {
        local = multiply(translation(0, BONE_LEN, 0), rotationZ(angle));
      }
      world[k] = multiply(parentWorld, local);
      parentWorld = world[k];
      skin[k] = multiply(world[k], inverseBind[k]);
      jointPositions.push(transformPoint(world[k], [0, 0, 0]));
    }
    // đỉnh xúc tu (cuối xương cuối)
    jointPositions.push(transformPoint(world[NUM_BONES - 1], [0, BONE_LEN, 0]));
    return { skin, jointPositions };
  }

  function draw() {
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    time += dt * parseFloat(controls.speed.value);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.04, 0.05, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Camera tĩnh: dịch để xúc tu nằm giữa khung hình.
    const view = translation(0.4, -1.2, -4.2);
    const proj = perspective(45, canvas.width / canvas.height, 0.1, 100);
    const mvp = multiply(view, proj);

    const { skin, jointPositions } = computeSkeleton(time);
    // Ghép các skin matrix thành một mảng phẳng cho uniform.
    const flat = new Float32Array(NUM_BONES * 16);
    for (let k = 0; k < NUM_BONES; k++) flat.set(skin[k], k * 16);

    gl.useProgram(program);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);
    gl.uniformMatrix4fv(jointMatLoc, false, flat);
    gl.uniform3f(colorLoc, 0.32, 0.78, 0.62);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const fb = Float32Array.BYTES_PER_ELEMENT;
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, STRIDE * fb, 0);
    gl.enableVertexAttribArray(normLoc);
    gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, STRIDE * fb, 3 * fb);
    gl.enableVertexAttribArray(jiLoc);
    gl.vertexAttribPointer(jiLoc, 4, gl.FLOAT, false, STRIDE * fb, 6 * fb);
    gl.enableVertexAttribArray(jwLoc);
    gl.vertexAttribPointer(jwLoc, 4, gl.FLOAT, false, STRIDE * fb, 10 * fb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Vẽ xương (các khớp) nếu bật.
    if (controls.showBones.checked) {
      const pts = [];
      for (const p of jointPositions) pts.push(p[0], p[1], p[2]);
      gl.useProgram(boneProgram);
      gl.uniformMatrix4fv(boneMvpLoc, false, mvp);
      gl.uniform3f(boneColorLoc, 1.0, 0.78, 0.2);
      gl.bindBuffer(gl.ARRAY_BUFFER, boneVbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pts), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(bonePosLoc);
      gl.vertexAttribPointer(bonePosLoc, 3, gl.FLOAT, false, 0, 0);
      gl.disable(gl.DEPTH_TEST);
      gl.drawArrays(gl.LINE_STRIP, 0, jointPositions.length);
      gl.drawArrays(gl.POINTS, 0, jointPositions.length);
      gl.enable(gl.DEPTH_TEST);
    }

    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.speed.value = '1.2';
    controls.bend.value = '0.6';
    controls.showBones.checked = false;
    time = 0;
  });
  draw();
})();
