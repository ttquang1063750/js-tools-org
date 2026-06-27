(function () {
  const root = document.currentScript.previousElementSibling;
  const canvas = root.querySelector('.canvas-demo__canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  // 1. Shaders for 3D Scene (offscreen cube render)
  const sceneVs = `
                      attribute vec3 a_position;
                      attribute vec3 a_color;
                      uniform mat4 u_MVP;
                      varying vec3 v_color;
                      void main() {
                        v_color = a_color;
                        gl_Position = u_MVP * vec4(a_position, 1.0);
                      }
                    `;
  const sceneFs = `
                      precision mediump float;
                      varying vec3 v_color;
                      void main() {
                        gl_FragColor = vec4(v_color, 1.0);
                      }
                    `;

  // 2. Shaders for Post-processing Full-screen Quad
  const quadVs = `
                      attribute vec2 a_position;
                      varying vec2 v_texCoord;
                      void main() {
                        v_texCoord = a_position * 0.5 + 0.5;
                        gl_Position = vec4(a_position, 0.0, 1.0);
                      }
                    `;
  const quadFs = `
                      precision mediump float;
                      varying vec2 v_texCoord;
                      uniform sampler2D u_screenTexture;
                      uniform int u_effect; // 0: none, 1: grayscale, 2: invert, 3: vignette, 4: sobel, 5: blur
                      uniform vec2 u_resolution;

                      void main() {
                        vec2 uv = v_texCoord;

                        if (u_effect == 0) {
                          gl_FragColor = texture2D(u_screenTexture, uv);
                        }
                        else if (u_effect == 1) {
                          vec4 color = texture2D(u_screenTexture, uv);
                          float gray = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
                          gl_FragColor = vec4(vec3(gray), 1.0);
                        }
                        else if (u_effect == 2) {
                          vec4 color = texture2D(u_screenTexture, uv);
                          gl_FragColor = vec4(1.0 - color.rgb, 1.0);
                        }
                        else if (u_effect == 3) {
                          vec4 color = texture2D(u_screenTexture, uv);
                          vec2 d = abs(uv - 0.5) * 1.4;
                          float vignette = 1.0 - dot(d, d);
                          gl_FragColor = vec4(color.rgb * vignette, 1.0);
                        }
                        else if (u_effect == 4) { // Sobel Edge Detection
                          float offset = 1.0 / u_resolution.y;
                          vec2 offsets[9];
                          offsets[0] = vec2(-offset,  offset); // top-left
                          offsets[1] = vec2( 0.0,     offset); // top-center
                          offsets[2] = vec2( offset,  offset); // top-right
                          offsets[3] = vec2(-offset,  0.0);    // center-left
                          offsets[4] = vec2( 0.0,     0.0);    // center-center
                          offsets[5] = vec2( offset,  0.0);    // center-right
                          offsets[6] = vec2(-offset, -offset); // bottom-left
                          offsets[7] = vec2( 0.0,    -offset); // bottom-center
                          offsets[8] = vec2( offset, -offset); // bottom-right

                          float kernelX[9];
                          kernelX[0] = -1.0; kernelX[1] = 0.0; kernelX[2] = 1.0;
                          kernelX[3] = -2.0; kernelX[4] = 0.0; kernelX[5] = 2.0;
                          kernelX[6] = -1.0; kernelX[7] = 0.0; kernelX[8] = 1.0;

                          float kernelY[9];
                          kernelY[0] = -1.0; kernelY[1] = -2.0; kernelY[2] = -1.0;
                          kernelY[3] =  0.0; kernelY[4] =  0.0; kernelY[5] =  0.0;
                          kernelY[6] =  1.0; kernelY[7] =  2.0; kernelY[8] =  1.0;

                          vec3 sampleTex[9];
                          for(int i = 0; i < 9; i++) {
                            sampleTex[i] = vec3(texture2D(u_screenTexture, uv + offsets[i]));
                          }

                          vec3 gradX = vec3(0.0);
                          vec3 gradY = vec3(0.0);
                          for(int i = 0; i < 9; i++) {
                            gradX += sampleTex[i] * kernelX[i];
                            gradY += sampleTex[i] * kernelY[i];
                          }
                          vec3 edge = sqrt(gradX * gradX + gradY * gradY);
                          gl_FragColor = vec4(edge, 1.0);
                        }
                        else if (u_effect == 5) { // Simple Blur Kernel
                          float offset = 1.2 / u_resolution.x;
                          vec4 sum = vec4(0.0);
                          sum += texture2D(u_screenTexture, uv + vec2(-offset,  offset)) * 0.0625;
                          sum += texture2D(u_screenTexture, uv + vec2( 0.0,     offset)) * 0.125;
                          sum += texture2D(u_screenTexture, uv + vec2( offset,  offset)) * 0.0625;
                          sum += texture2D(u_screenTexture, uv + vec2(-offset,  0.0))    * 0.125;
                          sum += texture2D(u_screenTexture, uv + vec2( 0.0,     0.0))    * 0.25;
                          sum += texture2D(u_screenTexture, uv + vec2( offset,  0.0))    * 0.125;
                          sum += texture2D(u_screenTexture, uv + vec2(-offset, -offset)) * 0.0625;
                          sum += texture2D(u_screenTexture, uv + vec2( 0.0,    -offset)) * 0.125;
                          sum += texture2D(u_screenTexture, uv + vec2( offset, -offset)) * 0.0625;
                          gl_FragColor = vec4(sum.rgb, 1.0);
                        }
                      }
                    `;

  function createShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  // Compile and Link Scene Program
  const sceneProg = gl.createProgram();
  gl.attachShader(sceneProg, createShader(gl, gl.VERTEX_SHADER, sceneVs));
  gl.attachShader(sceneProg, createShader(gl, gl.FRAGMENT_SHADER, sceneFs));
  gl.linkProgram(sceneProg);

  const cubePosLoc = gl.getAttribLocation(sceneProg, 'a_position');
  const cubeColLoc = gl.getAttribLocation(sceneProg, 'a_color');
  const cubeMvpLoc = gl.getUniformLocation(sceneProg, 'u_MVP');

  // Compile and Link Quad Program
  const quadProg = gl.createProgram();
  gl.attachShader(quadProg, createShader(gl, gl.VERTEX_SHADER, quadVs));
  gl.attachShader(quadProg, createShader(gl, gl.FRAGMENT_SHADER, quadFs));
  gl.linkProgram(quadProg);

  const quadPosLoc = gl.getAttribLocation(quadProg, 'a_position');
  const quadTexLoc = gl.getUniformLocation(quadProg, 'u_screenTexture');
  const quadEffectLoc = gl.getUniformLocation(quadProg, 'u_effect');
  const quadResLoc = gl.getUniformLocation(quadProg, 'u_resolution');

  // Geometry 1: 3D Cube VBO
  const cubeVertices = new Float32Array([
    // [x,y,z, r,g,b]
    -0.4, -0.4, 0.4, 0.9, 0.3, 0.2, 0.4, -0.4, 0.4, 0.2, 0.8, 0.3, 0.4, 0.4, 0.4, 0.1, 0.5, 0.9, -0.4, 0.4, 0.4, 0.9,
    0.9, 0.1, -0.4, -0.4, -0.4, 0.8, 0.2, 0.8, -0.4, 0.4, -0.4, 0.2, 0.9, 0.9, 0.4, 0.4, -0.4, 0.9, 0.9, 0.9, 0.4, -0.4,
    -0.4, 0.4, 0.4, 0.4,
  ]);

  const cubeIndices = new Uint16Array([
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
    3,
    2,
    6,
    3,
    6,
    5, // Top
    4,
    7,
    1,
    4,
    1,
    0, // Bottom
    1,
    7,
    6,
    1,
    6,
    2, // Right
    4,
    0,
    3,
    4,
    3,
    5, // Left
  ]);

  const cubeVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVbo);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

  const cubeIbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);

  // Geometry 2: Fullscreen 2D Quad
  const quadVertices = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]);

  const quadVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  // 3. FBO Creation
  const fboWidth = 512;
  const fboHeight = 512;

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

  const fboTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, fboTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fboWidth, fboHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTexture, 0);

  const fboDepth = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, fboDepth);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fboWidth, fboHeight);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, fboDepth);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // Minimal Matrix Helpers
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
    effect: root.querySelector('#postEffectSelect'),
  };

  let angle = 0;
  function draw() {
    // ── PASS 1: Render 3D Scene into FBO ──
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, fboWidth, fboHeight);
    gl.clearColor(0.04, 0.08, 0.18, 1.0); // Offscreen background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    angle += 0.007;
    const rx = getRotationX(angle * 0.4);
    const ry = getRotationY(angle);
    const model = multiply(ry, rx);

    const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1.8, 1]);

    const proj = getPerspective(45, fboWidth / fboHeight, 0.1, 10);
    const mv = multiply(model, view);
    const mvp = multiply(mv, proj);

    gl.useProgram(sceneProg);
    gl.uniformMatrix4fv(cubeMvpLoc, false, mvp);

    // Bind Cube buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVbo);
    gl.enableVertexAttribArray(cubePosLoc);
    gl.vertexAttribPointer(cubePosLoc, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(cubeColLoc);
    gl.vertexAttribPointer(cubeColLoc, 3, gl.FLOAT, false, 24, 12);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIbo);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    // ── PASS 2: Render FBO Texture to Screen with filter effect ──
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.04, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST); // Drawing a 2D quad, depth testing not needed

    gl.useProgram(quadProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fboTexture);
    gl.uniform1i(quadTexLoc, 0);

    // Effect mapping
    const effMap = { none: 0, grayscale: 1, invert: 2, vignette: 3, sobel: 4, blur: 5 };
    gl.uniform1i(quadEffectLoc, effMap[controls.effect.value]);
    gl.uniform2f(quadResLoc, canvas.width, canvas.height);

    // Bind Quad buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
    gl.enableVertexAttribArray(quadPosLoc);
    gl.vertexAttribPointer(quadPosLoc, 2, gl.FLOAT, false, 8, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(draw);
  }

  root.querySelector('.canvas-demo__reset').addEventListener('click', () => {
    controls.effect.value = 'none';
  });

  draw();
})();
