(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  // ---- Shaders: Pass 1 (depth only) ----
  const depthVs = `#version 300 es
                      in vec3 a_position;
                      uniform mat4 u_lightSpace;
                      uniform mat4 u_model;
                      void main() {
                        gl_Position = u_lightSpace * u_model * vec4(a_position, 1.0);
                      }`;
  const depthFs = `#version 300 es
                      precision highp float;
                      void main() {} // GPU tự ghi gl_FragDepth`;

  // ---- Shaders: Pass 2 (lighting + shadow) ----
  const sceneVs = `#version 300 es
                      in vec3 a_position;
                      in vec3 a_normal;
                      uniform mat4 u_mvp;
                      uniform mat4 u_model;
                      uniform mat3 u_normalMat;
                      uniform mat4 u_lightSpace;
                      out vec3 v_normal;
                      out vec3 v_fragPos;
                      out vec4 v_fragPosLightSpace;
                      void main() {
                        vec4 world = u_model * vec4(a_position, 1.0);
                        v_fragPos = world.xyz;
                        v_normal = normalize(u_normalMat * a_normal);
                        v_fragPosLightSpace = u_lightSpace * world;
                        gl_Position = u_mvp * vec4(a_position, 1.0);
                      }`;
  const sceneFs = `#version 300 es
                      precision highp float;
                      in vec3 v_normal;
                      in vec3 v_fragPos;
                      in vec4 v_fragPosLightSpace;
                      uniform vec3 u_lightPos;
                      uniform vec3 u_color;
                      uniform float u_bias;
                      uniform float u_shadowOn;
                      uniform sampler2D u_shadowMap;
                      out vec4 fragColor;

                      float shadowCalculation(vec4 fpLS, float bias) {
                        vec3 projCoords = fpLS.xyz / fpLS.w;
                        projCoords = projCoords * 0.5 + 0.5;
                        if (projCoords.z > 1.0) return 0.0;
                        if (projCoords.x < 0.0 || projCoords.x > 1.0 ||
                            projCoords.y < 0.0 || projCoords.y > 1.0) return 0.0;
                        float currentDepth = projCoords.z;
                        // PCF 3x3 làm mềm viền bóng
                        float shadow = 0.0;
                        vec2 texel = 1.0 / vec2(textureSize(u_shadowMap, 0));
                        for (int x = -1; x <= 1; x++) {
                          for (int y = -1; y <= 1; y++) {
                            float pcf = texture(u_shadowMap, projCoords.xy + vec2(x, y) * texel).r;
                            shadow += (currentDepth - bias > pcf) ? 1.0 : 0.0;
                          }
                        }
                        return shadow / 9.0;
                      }

                      void main() {
                        vec3 N = normalize(v_normal);
                        vec3 L = normalize(u_lightPos - v_fragPos);
                        float bias = max(u_bias * (1.0 - dot(N, L)), u_bias * 0.1);
                        float shadow = u_shadowOn * shadowCalculation(v_fragPosLightSpace, bias);

                        float diff = max(dot(N, L), 0.0);
                        vec3 ambient = 0.28 * u_color;
                        vec3 diffuse = diff * u_color;
                        vec3 result = ambient + (1.0 - shadow) * diffuse;
                        // gamma
                        result = pow(result, vec3(1.0 / 2.2));
                        fragColor = vec4(result, 1.0);
                      }`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src.trim());
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(s), src);
    }
    return s;
  }
  function link(vsSrc, fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('Link error:', gl.getProgramInfoLog(p));
    }
    return p;
  }

  const depthProg = link(depthVs, depthFs);
  const sceneProg = link(sceneVs, sceneFs);

  // ---- Geometry: sphere (procedural) ----
  function buildSphere(radius, rings, sectors) {
    const pos = [],
      norm = [],
      idx = [];
    for (let r = 0; r <= rings; ++r) {
      const theta = (r * Math.PI) / rings;
      const sinT = Math.sin(theta),
        cosT = Math.cos(theta);
      for (let s = 0; s <= sectors; ++s) {
        const phi = (s * 2 * Math.PI) / sectors;
        const x = Math.cos(phi) * sinT,
          y = cosT,
          z = Math.sin(phi) * sinT;
        pos.push(x * radius, y * radius, z * radius);
        norm.push(x, y, z);
      }
    }
    for (let r = 0; r < rings; ++r) {
      for (let s = 0; s < sectors; ++s) {
        const a = r * (sectors + 1) + s;
        const b = a + sectors + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return interleave(pos, norm, idx);
  }
  // ---- Geometry: floor plane ----
  function buildFloor(size) {
    const pos = [-size, 0, -size, size, 0, -size, size, 0, size, -size, 0, size];
    const norm = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
    const idx = [0, 2, 1, 0, 3, 2];
    return interleave(pos, norm, idx);
  }
  function interleave(pos, norm, idx) {
    const data = [];
    for (let i = 0; i < pos.length / 3; ++i) {
      data.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], norm[i * 3], norm[i * 3 + 1], norm[i * 3 + 2]);
    }
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    return { vbo, ibo, count: idx.length };
  }

  const sphere = buildSphere(0.7, 28, 28);
  const floor = buildFloor(3.2);

  // ---- Matrix helpers ----
  function ident() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }
  function translate(x, y, z) {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  }
  function multiply(a, b) {
    const o = new Float32Array(16);
    for (let r = 0; r < 4; ++r)
      for (let c = 0; c < 4; ++c)
        o[r * 4 + c] = a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] + a[r * 4 + 2] * b[8 + c] + a[r * 4 + 3] * b[12 + c];
    return o;
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
  function ortho(l, r, b, t, n, f) {
    return new Float32Array([
      2 / (r - l),
      0,
      0,
      0,
      0,
      2 / (t - b),
      0,
      0,
      0,
      0,
      -2 / (f - n),
      0,
      -(r + l) / (r - l),
      -(t + b) / (t - b),
      -(f + n) / (f - n),
      1,
    ]);
  }
  function normalize(v) {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function lookAt(eye, center, up) {
    const z = normalize([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]);
    const x = normalize(cross(up, z));
    const y = cross(z, x);
    return new Float32Array([
      x[0],
      y[0],
      z[0],
      0,
      x[1],
      y[1],
      z[1],
      0,
      x[2],
      y[2],
      z[2],
      0,
      -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
      -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
      -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
      1,
    ]);
  }
  function normalMat3(m) {
    // đủ dùng vì model chỉ có translate (không scale phi đều)
    return new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]);
  }

  // ---- Depth FBO (WebGL2 depth texture) ----
  const SHADOW_SIZE = 1024;
  const depthTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, depthTex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT24,
    SHADOW_SIZE,
    SHADOW_SIZE,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_INT,
    null
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const depthFBO = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, depthFBO);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTex, 0);
  gl.drawBuffers([gl.NONE]);
  gl.readBuffer(gl.NONE);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    console.error('Depth FBO incomplete');
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // ---- Attribute / uniform locations ----
  const dLoc = {
    pos: gl.getAttribLocation(depthProg, 'a_position'),
    lightSpace: gl.getUniformLocation(depthProg, 'u_lightSpace'),
    model: gl.getUniformLocation(depthProg, 'u_model'),
  };
  const sLoc = {
    pos: gl.getAttribLocation(sceneProg, 'a_position'),
    norm: gl.getAttribLocation(sceneProg, 'a_normal'),
    mvp: gl.getUniformLocation(sceneProg, 'u_mvp'),
    model: gl.getUniformLocation(sceneProg, 'u_model'),
    normalMat: gl.getUniformLocation(sceneProg, 'u_normalMat'),
    lightSpace: gl.getUniformLocation(sceneProg, 'u_lightSpace'),
    lightPos: gl.getUniformLocation(sceneProg, 'u_lightPos'),
    color: gl.getUniformLocation(sceneProg, 'u_color'),
    bias: gl.getUniformLocation(sceneProg, 'u_bias'),
    shadowOn: gl.getUniformLocation(sceneProg, 'u_shadowOn'),
    shadowMap: gl.getUniformLocation(sceneProg, 'u_shadowMap'),
  };

  function bindGeom(geom, posLoc, normLoc) {
    gl.bindBuffer(gl.ARRAY_BUFFER, geom.vbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
    if (normLoc != null && normLoc >= 0) {
      gl.enableVertexAttribArray(normLoc);
      gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 24, 12);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geom.ibo);
  }

  // ---- Controls ----
  const ctl = {
    angle: root.querySelector('#smAngle'),
    height: root.querySelector('#smHeight'),
    bias: root.querySelector('#smBias'),
    toggle: root.querySelector('#smToggle'),
  };
  let shadowOn = true;
  ctl.toggle.addEventListener('click', () => {
    shadowOn = !shadowOn;
    ctl.toggle.textContent = shadowOn ? 'Bóng: BẬT' : 'Bóng: TẮT';
  });

  const DEFAULTS = { angle: '55', height: '4.2', bias: '0.003' };
  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    ctl.angle.value = DEFAULTS.angle;
    ctl.height.value = DEFAULTS.height;
    ctl.bias.value = DEFAULTS.bias;
    shadowOn = true;
    ctl.toggle.textContent = 'Bóng: BẬT';
  });

  // Scene object positions
  const sphereModel = translate(0, 0.0, 0);
  const floorModel = translate(0, -0.95, 0);

  let spin = 0;
  function draw() {
    const ang = (parseFloat(ctl.angle.value) * Math.PI) / 180;
    const hgt = parseFloat(ctl.height.value);
    const bias = parseFloat(ctl.bias.value);
    const lightPos = [Math.cos(ang) * 3.4, hgt, Math.sin(ang) * 3.4];

    // Light-space matrix (orthographic, directional-style)
    const lightProj = ortho(-3.2, 3.2, -3.2, 3.2, 1.0, 14.0);
    const lightView = lookAt(lightPos, [0, -0.3, 0], [0, 1, 0]);
    const lightSpace = multiply(lightProj, lightView);

    // ===== PASS 1: render depth map =====
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFBO);
    gl.viewport(0, 0, SHADOW_SIZE, SHADOW_SIZE);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(depthProg);
    gl.uniformMatrix4fv(dLoc.lightSpace, false, lightSpace);

    gl.uniformMatrix4fv(dLoc.model, false, sphereModel);
    bindGeom(sphere, dLoc.pos, -1);
    gl.drawElements(gl.TRIANGLES, sphere.count, gl.UNSIGNED_SHORT, 0);

    gl.uniformMatrix4fv(dLoc.model, false, floorModel);
    bindGeom(floor, dLoc.pos, -1);
    gl.drawElements(gl.TRIANGLES, floor.count, gl.UNSIGNED_SHORT, 0);

    // ===== PASS 2: render scene with shadows =====
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.05, 0.06, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    spin += 0.004;
    const eye = [Math.sin(spin) * 5.0, 2.6, Math.cos(spin) * 5.0];
    const view = lookAt(eye, [0, -0.2, 0], [0, 1, 0]);
    const proj = perspective(45, canvas.width / canvas.height, 0.1, 100);
    const viewProj = multiply(view, proj);

    gl.useProgram(sceneProg);
    gl.uniformMatrix4fv(sLoc.lightSpace, false, lightSpace);
    gl.uniform3f(sLoc.lightPos, lightPos[0], lightPos[1], lightPos[2]);
    gl.uniform1f(sLoc.bias, bias);
    gl.uniform1f(sLoc.shadowOn, shadowOn ? 1.0 : 0.0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, depthTex);
    gl.uniform1i(sLoc.shadowMap, 0);

    // Sphere
    gl.uniformMatrix4fv(sLoc.model, false, sphereModel);
    gl.uniformMatrix4fv(sLoc.mvp, false, multiply(viewProj, sphereModel));
    gl.uniformMatrix3fv(sLoc.normalMat, false, normalMat3(sphereModel));
    gl.uniform3f(sLoc.color, 0.85, 0.45, 0.25);
    bindGeom(sphere, sLoc.pos, sLoc.norm);
    gl.drawElements(gl.TRIANGLES, sphere.count, gl.UNSIGNED_SHORT, 0);

    // Floor
    gl.uniformMatrix4fv(sLoc.model, false, floorModel);
    gl.uniformMatrix4fv(sLoc.mvp, false, multiply(viewProj, floorModel));
    gl.uniformMatrix3fv(sLoc.normalMat, false, normalMat3(floorModel));
    gl.uniform3f(sLoc.color, 0.55, 0.6, 0.7);
    bindGeom(floor, sLoc.pos, sLoc.norm);
    gl.drawElements(gl.TRIANGLES, floor.count, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(draw);
  }
  draw();
})();
