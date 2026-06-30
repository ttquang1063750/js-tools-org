// =====================================================================
// Bài 3: Uniform & Storage Buffers — File code thực hành mẫu
// Series WebGPU & 3D Graphics — js-tools.org
// =====================================================================

// ---------------------------------------------------------------------
// 1. Struct alignment — quy tắc căn chỉnh bộ nhớ
// ---------------------------------------------------------------------

// ❌ SAI: vec3 có alignment 16 → trường sau bị lệch nếu JS không padding
struct MaterialBad {
  color: vec3<f32>,     // offset 0, size 12, alignment 16
  roughness: f32,       // GPU đọc ở offset 16, KHÔNG PHẢI 12!
};

// ✅ ĐÚNG: dùng vec4 tránh padding ngầm
struct MaterialGood {
  color: vec4<f32>,     // offset 0, size 16, alignment 16 (thêm alpha)
  roughness: f32,       // offset 16 — khớp chính xác
  metallic: f32,        // offset 20
  // struct size padded to 32 bytes (bội 16)
};

// ---------------------------------------------------------------------
// 2. Uniform Buffer — ma trận biến đổi model
// ---------------------------------------------------------------------
struct Uniforms {
  mvp: mat4x4<f32>,     // 64 bytes, alignment 16
};
@group(0) @binding(0) var<uniform> u: Uniforms;

struct ColorUniform {
  color: vec4<f32>,     // 16 bytes
};
@group(0) @binding(1) var<uniform> uc: ColorUniform;

// Vertex shader: biến đổi vị trí bằng ma trận MVP
struct VSOut {
  @builtin(position) pos: vec4<f32>,
};

@vertex
fn vs_main(@location(0) position: vec4<f32>) -> VSOut {
  var out: VSOut;
  out.pos = u.mvp * position; // nhân ma trận trên GPU
  return out;
}

// Fragment shader: dùng màu từ Uniform
@fragment
fn fs_main() -> @location(0) vec4<f32> {
  return uc.color;
}

// ---------------------------------------------------------------------
// 3. Storage Buffer — đọc/ghi mảng lớn (nền tảng compute shader)
// ---------------------------------------------------------------------
struct Particle {
  pos: vec2<f32>,
  vel: vec2<f32>,
};

// Storage buffer: đọc ghi, không giới hạn 64KB
@group(0) @binding(0)
var<storage, read_write> particles: array<Particle>;

// Ví dụ compute shader cập nhật vị trí hạt
@compute @workgroup_size(64)
fn update_particles(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  if (i >= arrayLength(&particles)) { return; }
  particles[i].pos += particles[i].vel * 0.016; // dt ≈ 16ms
}
