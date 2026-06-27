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
                      attribute vec3 a_normal;
                      attribute vec3 a_tangent;
                      attribute vec2 a_uv;
                      uniform mat4 u_MVP;
                      uniform mat4 u_Model;
                      uniform mat3 u_NormalMatrix;
                      varying vec2 v_uv;
                      varying vec3 v_fragPos;
                      varying mat3 v_TBN;
                      void main() {
                        v_uv = a_uv;
                        v_fragPos = vec3(u_Model * vec4(a_position, 1.0));
                        vec3 N = normalize(u_NormalMatrix * a_normal);
                        vec3 T = normalize(u_NormalMatrix * a_tangent);
                        T = normalize(T - dot(T, N) * N);
                        vec3 B = cross(N, T);
                        v_TBN = mat3(T, B, N);
                        gl_Position = u_MVP * vec4(a_position, 1.0);
                      }
                    `;

  const fsSource = `
                      precision highp float;
                      varying vec2 v_uv;
                      varying vec3 v_fragPos;
                      varying mat3 v_TBN;
                      uniform sampler2D u_normalMap;
                      uniform vec3 u_lightPos;
                      uniform vec3 u_viewPos;
                      uniform vec3 u_baseColor;
                      uniform float u_strength;
                      uniform float u_useNormalMap;
                      void main() {
                        vec3 N;
                        if (u_useNormalMap > 0.5) {
                          vec3 tN = texture2D(u_normalMap, v_uv).rgb * 2.0 - 1.0;
                          tN.xy *= u_strength;
                          tN = normalize(tN);
                          N = normalize(v_TBN * tN);
                        } else {
                          N = normalize(v_TBN[2]);
                        }
                        vec3 L = normalize(u_lightPos - v_fragPos);
                        vec3 V = normalize(u_viewPos - v_fragPos);
                        vec3 H = normalize(L + V);
                        float diff = max(dot(N, L), 0.0);
                        float spec = pow(max(dot(N, H), 0.0), 48.0);
                        vec3 ambient = 0.12 * u_baseColor;
                        vec3 diffuse = diff * u_baseColor;
                        vec3 specular = spec * vec3(0.35);
                        gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
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

  const posLoc = gl.getAttribLocation(program, 'a_position');
  const normLoc = gl.getAttribLocation(program, 'a_normal');
  const tanLoc = gl.getAttribLocation(program, 'a_tangent');
  const uvLoc = gl.getAttribLocation(program, 'a_uv');
  const mvpLoc = gl.getUniformLocation(program, 'u_MVP');
  const modelLoc = gl.getUniformLocation(program, 'u_Model');
  const normMatLoc = gl.getUniformLocation(program, 'u_NormalMatrix');
  const lightLoc = gl.getUniformLocation(program, 'u_lightPos');
  const viewLoc = gl.getUniformLocation(program, 'u_viewPos');
  const baseLoc = gl.getUniformLocation(program, 'u_baseColor');
  const strengthLoc = gl.getUniformLocation(program, 'u_strength');
  const useMapLoc = gl.getUniformLocation(program, 'u_useNormalMap');

  // Mặt phẳng (quad) trong mặt phẳng XY, pháp tuyến +Z, tangent +X.
  // Mỗi đỉnh: pos(3) normal(3) tangent(3) uv(2) = 11 float.
  // prettier-ignore
  const verts = new Float32Array([
                      //  x     y    z     nx ny nz   tx ty tz   u  v
                      -1.0, -1.0, 0.0,   0, 0, 1,    1, 0, 0,   0, 0,
                       1.0, -1.0, 0.0,   0, 0, 1,    1, 0, 0,   1, 0,
                       1.0,  1.0, 0.0,   0, 0, 1,    1, 0, 0,   1, 1,
                      -1.0,  1.0, 0.0,   0, 0, 1,    1, 0, 0,   0, 1,
                    ]);
  const idx = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

  // --- Sinh normal map gạch theo thủ tục (procedural) ---
  // Lưới gạch xếp so le; rãnh vữa nghiêng pháp tuyến ra ngoài.
  const TEX = 256;
  const data = new Uint8Array(TEX * TEX * 4);
  const bricksX = 4,
    bricksY = 8,
    mortar = 0.08;
  for (let y = 0; y < TEX; y++) {
    for (let x = 0; x < TEX; x++) {
      let u = x / TEX;
      let v = y / TEX;
      const row = Math.floor(v * bricksY);
      // so le hàng lẻ
      const offset = row % 2 === 0 ? 0 : 0.5;
      let bu = (u * bricksX + offset) % 1.0;
      let bv = (v * bricksY) % 1.0;
      // khoảng cách tới mép viên gạch (0 ở mép, lớn ở giữa)
      const dx = Math.min(bu, 1 - bu);
      const dy = Math.min(bv, 1 - bv);
      let nx = 0,
        ny = 0,
        nz = 1;
      if (dx < mortar) {
        // dốc nghiêng theo trục U tại rãnh dọc
        nx = bu < 0.5 ? -1 : 1;
        nx *= 1 - dx / mortar;
      }
      if (dy < mortar) {
        ny = bv < 0.5 ? -1 : 1;
        ny *= 1 - dy / mortar;
      }
      // chuẩn hóa vector (nx,ny,nz)
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;
      const i = (y * TEX + x) * 4;
      data[i] = Math.round((nx * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[i + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      data[i + 3] = 255;
    }
  }
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEX, TEX, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  function rotY(rad) {
    const s = Math.sin(rad),
      c = Math.cos(rad);
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
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

  const controls = {
    useMap: root.querySelector('#nmUseMap'),
    lightX: root.querySelector('#nmLightX'),
    strength: root.querySelector('#nmStrength'),
    rotate: root.querySelector('#nmRotate'),
  };

  let angle = 0;
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.04, 0.04, 0.06, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (controls.rotate.value === 'on') angle += 0.004;
    const model = rotY(Math.sin(angle) * 0.6);
    const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -3.0, 1]);
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
    gl.uniformMatrix4fv(modelLoc, false, model);
    gl.uniformMatrix3fv(normMatLoc, false, normMat);

    const lx = parseFloat(controls.lightX.value);
    gl.uniform3f(lightLoc, lx, 1.2, 2.0);
    gl.uniform3f(viewLoc, 0.0, 0.0, 3.0);
    gl.uniform3f(baseLoc, 0.72, 0.34, 0.22);
    gl.uniform1f(strengthLoc, parseFloat(controls.strength.value));
    gl.uniform1f(useMapLoc, controls.useMap.checked ? 1.0 : 0.0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(program, 'u_normalMap'), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const stride = 11 * 4;
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(normLoc);
    gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(tanLoc);
    gl.vertexAttribPointer(tanLoc, 3, gl.FLOAT, false, stride, 24);
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride, 36);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.useMap.checked = true;
    controls.lightX.value = '1.5';
    controls.strength.value = '1.4';
    controls.rotate.value = 'on';
  });
  draw();
})();
