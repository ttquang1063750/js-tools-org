// =====================================================================
// Bài 2: Lập Trình Shaders Với WGSL — File code thực hành mẫu
// Series WebGPU & 3D Graphics — js-tools.org
// =====================================================================

// ---------------------------------------------------------------------
// 1. Kiểu dữ liệu cơ bản của WGSL
// ---------------------------------------------------------------------
// Số nguyên & thực
var<private> a: i32 = 42;          // signed 32-bit integer
var<private> b: u32 = 7u;          // unsigned 32-bit integer
var<private> c: f32 = 3.14;        // 32-bit float
var<private> ok: bool = true;      // boolean

// Vector: vec2, vec3, vec4
var<private> pos: vec2<f32> = vec2<f32>(0.5, -0.3);
var<private> color: vec4<f32> = vec4<f32>(1.0, 0.0, 0.0, 1.0); // RGBA đỏ

// Ma trận: mat2x2, mat3x3, mat4x4
var<private> identity: mat2x2<f32> = mat2x2<f32>(
  1.0, 0.0,
  0.0, 1.0
);

// ---------------------------------------------------------------------
// 2. Struct truyền dữ liệu Vertex → Fragment qua @location
// ---------------------------------------------------------------------
struct VertexOutput {
  @builtin(position) pos: vec4<f32>,    // vị trí clip-space (bắt buộc)
  @location(0) color: vec4<f32>,        // màu nội suy sang fragment
  @location(1) uv: vec2<f32>,           // tọa độ texture
};

@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> VertexOutput {
  // Tam giác cứng (hardcoded) trong clip-space [-1, 1]
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(0.0, 0.5),     // đỉnh chóp
    vec2<f32>(-0.5, -0.5),   // góc trái
    vec2<f32>(0.5, -0.5)     // góc phải
  );
  var colors = array<vec4<f32>, 3>(
    vec4<f32>(1.0, 0.0, 0.0, 1.0), // đỏ
    vec4<f32>(0.0, 1.0, 0.0, 1.0), // xanh lá
    vec4<f32>(0.0, 0.0, 1.0, 1.0), // xanh dương
  );

  var out: VertexOutput;
  out.pos = vec4<f32>(positions[idx], 0.0, 1.0);
  out.color = colors[idx];
  out.uv = positions[idx] * 0.5 + 0.5; // chuyển từ [-0.5,0.5] sang [0,1]
  return out;
}

// ---------------------------------------------------------------------
// 3. Fragment Shader — nhận dữ liệu đã nội suy từ rasterizer
// ---------------------------------------------------------------------
@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  // Màu mỗi pixel là kết quả nội suy tuyến tính giữa 3 đỉnh
  return in.color;
}

// ---------------------------------------------------------------------
// 4. Uniform Buffer — truyền thời gian động từ JS vào shader
// ---------------------------------------------------------------------
struct TimeUniform {
  time: f32,
};
@group(0) @binding(0) var<uniform> u_time: TimeUniform;

@fragment
fn fs_gradient(
  @location(0) uv: vec2<f32>
) -> @location(0) vec4<f32> {
  // Tạo gradient động dựa trên tọa độ UV và thời gian
  let r = 0.5 + 0.5 * sin(uv.x * 4.0 + u_time.time);
  let g = 0.5 + 0.5 * cos(uv.y * 3.0 - u_time.time * 1.5);
  let b = 0.5 + 0.5 * sin(uv.x * 2.0 + uv.y * 2.0 + u_time.time * 2.0);
  return vec4<f32>(r, g, b, 1.0);
}
