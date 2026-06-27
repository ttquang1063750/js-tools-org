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
                      uniform mat4 u_MVP;
                      uniform mat4 u_Model;
                      uniform mat3 u_NormalMatrix;
                      varying vec3 v_normal;
                      varying vec3 v_fragPos;
                      void main() {
                        v_normal = normalize(u_NormalMatrix * a_normal);
                        v_fragPos = vec3(u_Model * vec4(a_position, 1.0));
                        gl_Position = u_MVP * vec4(a_position, 1.0);
                      }
                    `;

  const fsSource = `
                      precision highp float;
                      #define PI 3.14159265359
                      varying vec3 v_normal;
                      varying vec3 v_fragPos;
                      uniform vec3 u_lightPos;
                      uniform vec3 u_lightColor;
                      uniform vec3 u_viewPos;
                      uniform vec3 u_albedo;
                      uniform float u_metallic;
                      uniform float u_roughness;

                      float DistributionGGX(vec3 N, vec3 H, float roughness) {
                        float a = roughness * roughness;
                        float a2 = a * a;
                        float NdotH = max(dot(N, H), 0.0);
                        float NdotH2 = NdotH * NdotH;
                        float denom = (NdotH2 * (a2 - 1.0) + 1.0);
                        denom = PI * denom * denom;
                        return a2 / max(denom, 1e-4);
                      }
                      float GeometrySchlickGGX(float NdotX, float roughness) {
                        float r = roughness + 1.0;
                        float k = (r * r) / 8.0;
                        return NdotX / (NdotX * (1.0 - k) + k);
                      }
                      float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
                        float NdotV = max(dot(N, V), 0.0);
                        float NdotL = max(dot(N, L), 0.0);
                        return GeometrySchlickGGX(NdotV, roughness) * GeometrySchlickGGX(NdotL, roughness);
                      }
                      vec3 fresnelSchlick(float cosTheta, vec3 F0) {
                        return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
                      }

                      void main() {
                        vec3 N = normalize(v_normal);
                        vec3 V = normalize(u_viewPos - v_fragPos);
                        vec3 F0 = mix(vec3(0.04), u_albedo, u_metallic);

                        vec3 Lo = vec3(0.0);
                        // hai nguồn sáng để vật liệu trông thuyết phục hơn
                        vec3 lightPositions[2];
                        lightPositions[0] = u_lightPos;
                        lightPositions[1] = vec3(-u_lightPos.x, u_lightPos.y * 0.5, u_lightPos.z);
                        for (int i = 0; i < 2; i++) {
                          vec3 L = normalize(lightPositions[i] - v_fragPos);
                          vec3 H = normalize(V + L);
                          float dist = length(lightPositions[i] - v_fragPos);
                          float atten = 1.0 / (dist * dist);
                          vec3 radiance = u_lightColor * atten * (i == 0 ? 1.0 : 0.5);

                          float NDF = DistributionGGX(N, H, u_roughness);
                          float G = GeometrySmith(N, V, L, u_roughness);
                          vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

                          vec3 numerator = NDF * G * F;
                          float denom = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 1e-4;
                          vec3 specular = numerator / denom;

                          vec3 kS = F;
                          vec3 kD = (vec3(1.0) - kS) * (1.0 - u_metallic);
                          float NdotL = max(dot(N, L), 0.0);
                          Lo += (kD * u_albedo / PI + specular) * radiance * NdotL;
                        }

                        vec3 ambient = vec3(0.03) * u_albedo;
                        vec3 color = ambient + Lo;
                        color = color / (color + vec3(1.0));
                        color = pow(color, vec3(1.0 / 2.2));
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

  const posLoc = gl.getAttribLocation(program, 'a_position');
  const normLoc = gl.getAttribLocation(program, 'a_normal');
  const mvpLoc = gl.getUniformLocation(program, 'u_MVP');
  const modelLoc = gl.getUniformLocation(program, 'u_Model');
  const normMatLoc = gl.getUniformLocation(program, 'u_NormalMatrix');
  const lightPosLoc = gl.getUniformLocation(program, 'u_lightPos');
  const lightColLoc = gl.getUniformLocation(program, 'u_lightColor');
  const viewLoc = gl.getUniformLocation(program, 'u_viewPos');
  const albedoLoc = gl.getUniformLocation(program, 'u_albedo');
  const metalLoc = gl.getUniformLocation(program, 'u_metallic');
  const roughLoc = gl.getUniformLocation(program, 'u_roughness');

  // Sinh hình cầu [x,y,z, nx,ny,nz]
  const spherePos = [];
  const sphereNorm = [];
  const sphereIndices = [];
  const rings = 36,
    sectors = 36,
    radius = 0.62;
  for (let r = 0; r <= rings; ++r) {
    const theta = (r * Math.PI) / rings;
    const sinT = Math.sin(theta),
      cosT = Math.cos(theta);
    for (let s = 0; s <= sectors; ++s) {
      const phi = (s * 2 * Math.PI) / sectors;
      const x = Math.cos(phi) * sinT,
        y = cosT,
        z = Math.sin(phi) * sinT;
      spherePos.push(x * radius, y * radius, z * radius);
      sphereNorm.push(x, y, z);
    }
  }
  for (let r = 0; r < rings; ++r) {
    for (let s = 0; s < sectors; ++s) {
      const first = r * (sectors + 1) + s;
      const second = first + sectors + 1;
      sphereIndices.push(first, second, first + 1, second, second + 1, first + 1);
    }
  }
  const vertexData = [];
  for (let i = 0; i < spherePos.length / 3; ++i) {
    vertexData.push(
      spherePos[i * 3],
      spherePos[i * 3 + 1],
      spherePos[i * 3 + 2],
      sphereNorm[i * 3],
      sphereNorm[i * 3 + 1],
      sphereNorm[i * 3 + 2]
    );
  }
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);

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

  const MATERIALS = {
    gold: [1.0, 0.77, 0.34],
    copper: [0.95, 0.55, 0.42],
    silver: [0.95, 0.95, 0.95],
    plastic: [0.85, 0.12, 0.12],
    emerald: [0.08, 0.62, 0.32],
  };
  const controls = {
    metallic: root.querySelector('#pbrMetallic'),
    roughness: root.querySelector('#pbrRoughness'),
    light: root.querySelector('#pbrLight'),
    material: root.querySelector('#pbrMaterial'),
  };

  let angle = 0;
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.03, 0.03, 0.05, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    angle += 0.005;
    const model = rotY(angle);
    const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -2.0, 1]);
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

    const li = parseFloat(controls.light.value) * 12.0;
    gl.uniform3f(lightPosLoc, 2.2, 2.2, 2.5);
    gl.uniform3f(lightColLoc, li, li, li);
    gl.uniform3f(viewLoc, 0.0, 0.0, 2.0);
    const m = MATERIALS[controls.material.value] || MATERIALS.gold;
    gl.uniform3f(albedoLoc, m[0], m[1], m[2]);
    gl.uniform1f(metalLoc, parseFloat(controls.metallic.value));
    gl.uniform1f(roughLoc, parseFloat(controls.roughness.value));

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(normLoc);
    gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 24, 12);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(gl.TRIANGLES, sphereIndices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.metallic.value = '1';
    controls.roughness.value = '0.25';
    controls.light.value = '1.6';
    controls.material.value = 'gold';
  });
  draw();
})();
