(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  // Shaders (Full screen quad vertex shader + Raymarching fragment shader)
  const vsSource = `
                      attribute vec2 a_position;
                      varying vec2 v_uv;
                      void main() {
                        v_uv = a_position;
                        gl_Position = vec4(a_position, 0.0, 1.0);
                      }
                    `;

  const fsSource = `
                      precision mediump float;
                      varying vec2 v_uv;
                      uniform float u_time;
                      uniform vec2 u_resolution;
                      uniform float u_sphereX;
                      uniform float u_torusRadius;
                      uniform float u_lightX;

                      // SDF for Sphere
                      float sdSphere(vec3 p, float r) {
                        return length(p) - r;
                      }

                      // SDF for Torus
                      float sdTorus(vec3 p, vec2 t) {
                        vec2 q = vec2(length(p.xz) - t.x, p.y);
                        return length(q) - t.y;
                      }

                      // Union helper
                      vec2 opU(vec2 d1, vec2 d2) {
                        if (d1.x < d2.x) {
                          return d1;
                        } else {
                          return d2;
                        }
                      }

                      // Map function returns: vec2(distance, materialID)
                      vec2 map(vec3 p) {
                        // Moving sphere
                        vec3 spherePos = p - vec3(u_sphereX, 0.2 * sin(u_time * 2.0), -0.5);
                        float sphereDist = sdSphere(spherePos, 0.4);
                        vec2 sphereMat = vec2(sphereDist, 1.0);

                        // Torus at center
                        vec3 torusPos = p - vec3(0.0, -0.2, 0.0);
                        // Rotate Torus slowly over time
                        float c = cos(u_time * 0.5);
                        float s = sin(u_time * 0.5);
                        mat3 rotX = mat3(
                          1.0, 0.0, 0.0,
                          0.0, c,   s,
                          0.0, -s,  c
                        );
                        torusPos = rotX * torusPos;
                        float torusDist = sdTorus(torusPos, vec2(u_torusRadius, 0.12));
                        vec2 torusMat = vec2(torusDist, 2.0);

                        return opU(sphereMat, torusMat);
                      }

                      // Raymarching Loop
                      vec2 raymarch(vec3 ro, vec3 rd) {
                        float t = 0.0;
                        float matId = 0.0;
                        for (int i = 0; i < 64; i++) {
                          vec3 p = ro + t * rd;
                          vec2 res = map(p);
                          if (res.x < 0.001) {
                            matId = res.y;
                            return vec2(t, matId); // Hit
                          }
                          if (t > 12.0) break; // Miss
                          t += res.x;
                        }
                        return vec2(-1.0, 0.0);
                      }

                      // Calculate Normal at point p
                      vec3 getNormal(vec3 p) {
                        const vec2 e = vec2(0.001, 0.0);
                        float d = map(p).x;
                        vec3 n = d - vec3(
                          map(p - e.xyy).x,
                          map(p - e.yxy).x,
                          map(p - e.yyx).x
                        );
                        return normalize(n);
                      }

                      void main() {
                        // Norm UV to Aspect Ratio
                        vec2 uv = v_uv;
                        uv.x *= u_resolution.x / u_resolution.y;

                        // Camera setup
                        vec3 ro = vec3(0.0, 0.0, 2.0); // camera origin
                        vec3 rd = normalize(vec3(uv, -1.2)); // ray direction

                        vec3 color = vec3(0.01, 0.02, 0.06); // Dark space BG

                        vec2 hit = raymarch(ro, rd);
                        if (hit.x > 0.0) {
                          vec3 p = ro + hit.x * rd;
                          vec3 normal = getNormal(p);
                          vec3 lightPos = vec3(u_lightX, 2.0, 1.5);
                          vec3 lightDir = normalize(lightPos - p);

                          // Lambert Diffuse
                          float diff = max(dot(normal, lightDir), 0.0);
                          vec3 matColor = vec3(1.0);

                          if (hit.y == 1.0) {
                            matColor = vec3(0.9, 0.2, 0.1); // Sphere red
                          } else if (hit.y == 2.0) {
                            matColor = vec3(0.1, 0.6, 0.9); // Torus cyan
                          }

                          // Fake Ambient
                          vec3 ambient = 0.08 * matColor;
                          vec3 diffuse = diff * matColor;

                          // Specular Blinn-Phong
                          vec3 viewDir = normalize(ro - p);
                          vec3 halfway = normalize(lightDir + viewDir);
                          float spec = pow(max(dot(normal, halfway), 0.0), 32.0);
                          vec3 specular = vec3(0.5) * spec;

                          // Simple soft shadow check (secondary ray towards light)
                          vec3 shadowRo = p + normal * 0.01;
                          vec3 shadowRd = lightDir;
                          vec2 shadowHit = raymarch(shadowRo, shadowRd);
                          float shadowFactor = 1.0;
                          if (shadowHit.x > 0.0 && shadowHit.x < length(lightPos - p)) {
                            shadowFactor = 0.2; // In shadow
                          }

                          color = ambient + (diffuse + specular) * shadowFactor;
                        }

                        gl_FragColor = vec4(color, 1.0);
                      }
                    `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader Compile Error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // Compile Program
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Shader Link Error:', gl.getProgramInfoLog(program));
  }

  const posLoc = gl.getAttribLocation(program, 'a_position');
  const timeLoc = gl.getUniformLocation(program, 'u_time');
  const resLoc = gl.getUniformLocation(program, 'u_resolution');
  const sphereXLoc = gl.getUniformLocation(program, 'u_sphereX');
  const torusRadLoc = gl.getUniformLocation(program, 'u_torusRadius');
  const lightLoc = gl.getUniformLocation(program, 'u_lightX');

  // Standard Quad Geometry
  const vertices = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const controls = {
    sphereX: root.querySelector('#spherePosX'),
    torusRad: root.querySelector('#torusRadius'),
    lightX: root.querySelector('#rayLightX'),
  };

  const startTime = Date.now();
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Set uniforms
    const elapsed = (Date.now() - startTime) / 1000.0;
    gl.uniform1f(timeLoc, elapsed);
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.uniform1f(sphereXLoc, parseFloat(controls.sphereX.value));
    gl.uniform1f(torusRadLoc, parseFloat(controls.torusRad.value));
    gl.uniform1f(lightLoc, parseFloat(controls.lightX.value));

    // Draw quad
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 8, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.sphereX.value = '0.0';
    controls.torusRad.value = '0.6';
    controls.lightX.value = '2.0';
  });

  draw();
})();
