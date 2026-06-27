(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  function createShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(s));
    }
    return s;
  }
  function createProgram(vsSrc, fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, createShader(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, createShader(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(p));
    }
    return p;
  }

  // ---------- Cubemap thủ tục (gradient bầu trời) ----------
  function makeCubemap() {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
    const SIZE = 64;
    const targets = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    ];
    // Với mỗi mặt, tái dựng vector hướng rồi tô gradient theo trục y
    for (let f = 0; f < 6; f++) {
      const data = new Uint8Array(SIZE * SIZE * 4);
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          // toạ độ trên mặt trong [-1, 1]
          const u = ((x + 0.5) / SIZE) * 2 - 1;
          const v = ((y + 0.5) / SIZE) * 2 - 1;
          let dx, dy, dz;
          switch (f) {
            case 0:
              dx = 1;
              dy = -v;
              dz = -u;
              break; // +X
            case 1:
              dx = -1;
              dy = -v;
              dz = u;
              break; // -X
            case 2:
              dx = u;
              dy = 1;
              dz = v;
              break; // +Y
            case 3:
              dx = u;
              dy = -1;
              dz = -v;
              break; // -Y
            case 4:
              dx = u;
              dy = -v;
              dz = 1;
              break; // +Z
            case 5:
              dx = -u;
              dy = -v;
              dz = -1;
              break; // -Z
          }
          const len = Math.hypot(dx, dy, dz);
          const ny = dy / len; // thành phần y đã chuẩn hoá [-1,1]
          let r, g, b;
          if (ny >= 0.0) {
            // bầu trời: xanh đậm trên đỉnh -> nhạt ở chân trời
            const t = ny;
            r = Math.round(135 * (1 - t) + 40 * t);
            g = Math.round(190 * (1 - t) + 90 * t);
            b = Math.round(235 * (1 - t) + 200 * t);
          } else {
            // mặt đất: nâu, tối dần xuống đáy
            const t = -ny;
            r = Math.round(120 * (1 - t) + 70 * t);
            g = Math.round(95 * (1 - t) + 55 * t);
            b = Math.round(70 * (1 - t) + 45 * t);
          }
          const i = (y * SIZE + x) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }
      gl.texImage2D(targets[f], 0, gl.RGBA, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }
  const envTex = makeCubemap();

  // ---------- Shaders ----------
  const skyVS = `
                      attribute vec3 a_position;
                      uniform mat4 u_proj;
                      uniform mat4 u_viewRot;
                      varying vec3 v_dir;
                      void main() {
                        v_dir = a_position;
                        vec4 pos = u_proj * u_viewRot * vec4(a_position, 1.0);
                        gl_Position = pos.xyww;
                      }
                    `;
  const skyFS = `
                      precision highp float;
                      uniform samplerCube u_env;
                      varying vec3 v_dir;
                      void main() {
                        gl_FragColor = vec4(textureCube(u_env, normalize(v_dir)).rgb, 1.0);
                      }
                    `;
  const objVS = `
                      attribute vec3 a_position;
                      attribute vec3 a_normal;
                      uniform mat4 u_mvp;
                      uniform mat4 u_model;
                      uniform mat3 u_normalMat;
                      varying vec3 v_worldPos;
                      varying vec3 v_worldNormal;
                      void main() {
                        v_worldPos = vec3(u_model * vec4(a_position, 1.0));
                        v_worldNormal = u_normalMat * a_normal;
                        gl_Position = u_mvp * vec4(a_position, 1.0);
                      }
                    `;
  const objFS = `
                      precision highp float;
                      uniform samplerCube u_env;
                      uniform vec3 u_cameraPos;
                      uniform float u_eta;
                      uniform float u_mode;        // 0 reflect, 1 refract
                      uniform float u_reflectivity;
                      uniform vec3 u_baseColor;
                      varying vec3 v_worldPos;
                      varying vec3 v_worldNormal;
                      void main() {
                        vec3 N = normalize(v_worldNormal);
                        vec3 I = normalize(v_worldPos - u_cameraPos);
                        vec3 R = reflect(I, N);
                        vec3 T = refract(I, N, u_eta);
                        vec3 dir = mix(R, T, clamp(u_mode, 0.0, 1.0));
                        vec3 env = textureCube(u_env, dir).rgb;
                        // Fresnel nhẹ làm viền sáng hơn
                        float fres = pow(1.0 - max(dot(-I, N), 0.0), 3.0);
                        float k = clamp(u_reflectivity + fres * 0.3, 0.0, 1.0);
                        vec3 color = mix(u_baseColor, env, k);
                        gl_FragColor = vec4(color, 1.0);
                      }
                    `;
  const skyProg = createProgram(skyVS, skyFS);
  const objProg = createProgram(objVS, objFS);

  // ---------- Hình học: cube cho skybox ----------
  const cubeVerts = new Float32Array([
    -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
  ]);
  const cubeIdx = new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 4, 5, 1, 4, 1, 0, 3, 2, 6, 3, 6, 7, 1, 5, 6, 1, 6, 2, 4, 0, 3, 4, 3, 7,
  ]);
  const cubeVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVerts, gl.STATIC_DRAW);
  const cubeIBO = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIdx, gl.STATIC_DRAW);

  // ---------- Hình học: quả cầu ----------
  const sPos = [],
    sNorm = [],
    sIdx = [];
  const rings = 32,
    sectors = 32,
    radius = 0.85;
  for (let r = 0; r <= rings; ++r) {
    const theta = (r * Math.PI) / rings;
    const sinT = Math.sin(theta),
      cosT = Math.cos(theta);
    for (let s = 0; s <= sectors; ++s) {
      const phi = (s * 2 * Math.PI) / sectors;
      const x = Math.cos(phi) * sinT,
        y = cosT,
        z = Math.sin(phi) * sinT;
      sPos.push(x * radius, y * radius, z * radius);
      sNorm.push(x, y, z);
    }
  }
  for (let r = 0; r < rings; ++r) {
    for (let s = 0; s < sectors; ++s) {
      const first = r * (sectors + 1) + s;
      const second = first + sectors + 1;
      sIdx.push(first, second, first + 1, second, second + 1, first + 1);
    }
  }
  const sphereData = [];
  for (let i = 0; i < sPos.length / 3; ++i) {
    sphereData.push(sPos[i * 3], sPos[i * 3 + 1], sPos[i * 3 + 2], sNorm[i * 3], sNorm[i * 3 + 1], sNorm[i * 3 + 2]);
  }
  const sphereVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData), gl.STATIC_DRAW);
  const sphereIBO = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIBO);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sIdx), gl.STATIC_DRAW);

  // ---------- Ma trận helpers ----------
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
  function rotateY(rad) {
    const s = Math.sin(rad),
      c = Math.cos(rad);
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  }
  function lookAtRot(angle) {
    // chỉ phần xoay quanh trục Y + nghiêng nhẹ; KHÔNG tịnh tiến
    const m = rotateY(angle);
    // nghiêng xuống một chút (xoay quanh X)
    const p = 0.15,
      sp = Math.sin(p),
      cp = Math.cos(p);
    const rx = new Float32Array([1, 0, 0, 0, 0, cp, sp, 0, 0, -sp, cp, 0, 0, 0, 0, 1]);
    return multiply(rx, m);
  }

  const controls = {
    mode: root.querySelector('#envMode'),
    reflectivity: root.querySelector('#envReflectivity'),
    rotate: root.querySelector('#envRotate'),
  };

  // ---------- Locations ----------
  const sky = {
    pos: gl.getAttribLocation(skyProg, 'a_position'),
    proj: gl.getUniformLocation(skyProg, 'u_proj'),
    viewRot: gl.getUniformLocation(skyProg, 'u_viewRot'),
    env: gl.getUniformLocation(skyProg, 'u_env'),
  };
  const obj = {
    pos: gl.getAttribLocation(objProg, 'a_position'),
    norm: gl.getAttribLocation(objProg, 'a_normal'),
    mvp: gl.getUniformLocation(objProg, 'u_mvp'),
    model: gl.getUniformLocation(objProg, 'u_model'),
    normalMat: gl.getUniformLocation(objProg, 'u_normalMat'),
    env: gl.getUniformLocation(objProg, 'u_env'),
    cameraPos: gl.getUniformLocation(objProg, 'u_cameraPos'),
    eta: gl.getUniformLocation(objProg, 'u_eta'),
    mode: gl.getUniformLocation(objProg, 'u_mode'),
    reflectivity: gl.getUniformLocation(objProg, 'u_reflectivity'),
    baseColor: gl.getUniformLocation(objProg, 'u_baseColor'),
  };

  let angle = 0;
  const CAMERA = [0, 0, 3.2];
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (controls.rotate.value === 'on') angle += 0.004;
    const proj = perspective(50, canvas.width / canvas.height, 0.1, 100);
    const viewRot = lookAtRot(angle);

    // view đầy đủ = viewRot rồi tịnh tiến camera ra sau
    const view = viewRot.slice();
    view[12] = -(view[0] * CAMERA[0] + view[4] * CAMERA[1] + view[8] * CAMERA[2]);
    view[13] = -(view[1] * CAMERA[0] + view[5] * CAMERA[1] + view[9] * CAMERA[2]);
    view[14] = -(view[2] * CAMERA[0] + view[6] * CAMERA[1] + view[10] * CAMERA[2]);

    // --- Vẽ quả cầu trước ---
    const model = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const mvp = multiply(multiply(model, view), proj);
    const normalMat = new Float32Array([
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
    gl.depthFunc(gl.LESS);
    gl.useProgram(objProg);
    gl.uniformMatrix4fv(obj.mvp, false, mvp);
    gl.uniformMatrix4fv(obj.model, false, model);
    gl.uniformMatrix3fv(obj.normalMat, false, normalMat);
    gl.uniform3f(obj.cameraPos, CAMERA[0], CAMERA[1], CAMERA[2]);
    const refracting = controls.mode.value === 'refract';
    gl.uniform1f(obj.mode, refracting ? 1.0 : 0.0);
    gl.uniform1f(obj.eta, 1.0 / 1.52);
    gl.uniform1f(obj.reflectivity, parseFloat(controls.reflectivity.value));
    gl.uniform3f(obj.baseColor, 0.1, 0.12, 0.16);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, envTex);
    gl.uniform1i(obj.env, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVBO);
    gl.enableVertexAttribArray(obj.pos);
    gl.vertexAttribPointer(obj.pos, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(obj.norm);
    gl.vertexAttribPointer(obj.norm, 3, gl.FLOAT, false, 24, 12);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIBO);
    gl.drawElements(gl.TRIANGLES, sIdx.length, gl.UNSIGNED_SHORT, 0);

    // --- Vẽ skybox sau cùng với depth trick ---
    gl.depthFunc(gl.LEQUAL);
    gl.useProgram(skyProg);
    gl.uniformMatrix4fv(sky.proj, false, proj);
    gl.uniformMatrix4fv(sky.viewRot, false, viewRot);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, envTex);
    gl.uniform1i(sky.env, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
    gl.enableVertexAttribArray(sky.pos);
    gl.vertexAttribPointer(sky.pos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);
    gl.drawElements(gl.TRIANGLES, cubeIdx.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.mode.value = 'reflect';
    controls.reflectivity.value = '0.9';
    controls.rotate.value = 'on';
    angle = 0;
  });
  draw();
})();
