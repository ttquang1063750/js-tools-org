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
                      precision mediump float;
                      varying vec3 v_normal;
                      varying vec3 v_fragPos;
                      uniform vec3 u_lightPos;
                      uniform vec3 u_viewPos;
                      uniform float u_ambient;
                      uniform float u_diffuse;
                      uniform float u_specular;
                      uniform float u_shininess;
                      uniform int u_isBlinn;
                      void main() {
                        vec3 normal = normalize(v_normal);
                        vec3 lightDir = normalize(u_lightPos - v_fragPos);
                        vec3 viewDir = normalize(u_viewPos - v_fragPos);

                        // Ambient
                        vec3 ambient = u_ambient * vec3(1.0, 1.0, 1.0);

                        // Diffuse
                        float diff = max(dot(normal, lightDir), 0.0);
                        vec3 diffuse = u_diffuse * diff * vec3(1.0, 0.5, 0.2); // Orange base color

                        // Specular
                        float spec = 0.0;
                        if (u_isBlinn == 1) {
                          vec3 halfwayDir = normalize(lightDir + viewDir);
                          spec = pow(max(dot(normal, halfwayDir), 0.0), u_shininess);
                        } else {
                          vec3 reflectDir = reflect(-lightDir, normal);
                          spec = pow(max(dot(reflectDir, viewDir), 0.0), u_shininess);
                        }
                        vec3 specular = u_specular * spec * vec3(1.0, 1.0, 1.0);

                        vec3 finalColor = ambient + diffuse + specular;
                        gl_FragColor = vec4(finalColor, 1.0);
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
  const normLoc = gl.getAttribLocation(program, 'a_normal');
  const mvpLoc = gl.getUniformLocation(program, 'u_MVP');
  const modelLoc = gl.getUniformLocation(program, 'u_Model');
  const normMatLoc = gl.getUniformLocation(program, 'u_NormalMatrix');
  const lightLoc = gl.getUniformLocation(program, 'u_lightPos');
  const viewLoc = gl.getUniformLocation(program, 'u_viewPos');
  const ambLoc = gl.getUniformLocation(program, 'u_ambient');
  const diffLoc = gl.getUniformLocation(program, 'u_diffuse');
  const specLoc = gl.getUniformLocation(program, 'u_specular');
  const shineLoc = gl.getUniformLocation(program, 'u_shininess');
  const blinnLoc = gl.getUniformLocation(program, 'u_isBlinn');

  // Generate Sphere geometry [x,y,z, nx,ny,nz]
  const spherePos = [];
  const sphereNorm = [];
  const sphereIndices = [];
  const rings = 30;
  const sectors = 30;
  const radius = 0.6;

  for (let r = 0; r <= rings; ++r) {
    const theta = (r * Math.PI) / rings;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let s = 0; s <= sectors; ++s) {
      const phi = (s * 2 * Math.PI) / sectors;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      spherePos.push(x * radius, y * radius, z * radius);
      sphereNorm.push(x, y, z);
    }
  }

  for (let r = 0; r < rings; ++r) {
    for (let s = 0; s < sectors; ++s) {
      const first = r * (sectors + 1) + s;
      const second = first + sectors + 1;
      sphereIndices.push(first, second, first + 1);
      sphereIndices.push(second, second + 1, first + 1);
    }
  }

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);

  // Minimal Matrix Helpers
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
    ambient: root.querySelector('#ambientIntensity'),
    diffuse: root.querySelector('#diffuseIntensity'),
    specular: root.querySelector('#specularIntensity'),
    shininess: root.querySelector('#shininessVal'),
    lightX: root.querySelector('#lightX'),
    model: root.querySelector('#lightingModel'),
  };

  let angle = 0;
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.04, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Slow auto-rotation Y
    angle += 0.005;
    const model = getRotationY(angle);

    const view = new Float32Array([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      -1.8,
      1, // camera position Z = -1.8
    ]);

    const proj = getPerspective(45, canvas.width / canvas.height, 0.1, 100);
    const mv = multiply(model, view);
    const mvp = multiply(mv, proj);

    // Normal Matrix
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

    // Controls uniforms
    gl.uniform3f(lightLoc, parseFloat(controls.lightX.value), 1.0, 1.2);
    gl.uniform3f(viewLoc, 0.0, 0.0, 1.8);
    gl.uniform1f(ambLoc, parseFloat(controls.ambient.value));
    gl.uniform1f(diffLoc, parseFloat(controls.diffuse.value));
    gl.uniform1f(specLoc, parseFloat(controls.specular.value));
    gl.uniform1f(shineLoc, parseFloat(controls.shininess.value));
    gl.uniform1i(blinnLoc, controls.model.value === 'blinn' ? 1 : 0);

    // Buffer layout
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);

    gl.enableVertexAttribArray(normLoc);
    gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 24, 12);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(gl.TRIANGLES, sphereIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(draw);
  }

  // Reset btn listener
  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.ambient.value = '0.1';
    controls.diffuse.value = '0.7';
    controls.specular.value = '0.5';
    controls.shininess.value = '32';
    controls.lightX.value = '1.5';
    controls.model.value = 'blinn';
  });

  draw();
})();
