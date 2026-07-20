/**
 * vectordb_storage_demo.js
 * Mã nguồn thực hành Bài 4: Lưu Trữ Hybrid: Vector & Metadata
 *
 * Hướng dẫn chạy:
 *   node vectordb_storage_demo.js
 */

const fs = require('fs');

// ====================================================
// 1. KIẾN TRÚC LƯU TRỮ HYBRID (MÔ PHỎNG)
// ====================================================

class HybridVectorStorage {
  constructor() {
    this.vectorRegistry = new Map(); // Ánh xạ: ID -> Offset trong file nhị phân
    this.metadataStore = new Map(); // Ánh xạ: ID -> JSON Metadata (Key-Value)

    // File nhị phân lưu trữ các vector liên tiếp nhau phục vụ quét nhanh
    this.binaryBuffer = null;
    this.dimension = 1536; // Số chiều vector
    this.vectorSizeBytes = this.dimension * 4; // Float32 tốn 4 bytes/số
  }

  // Khởi tạo/Pre-allocate bộ nhớ đệm nhị phân cho N vectors
  allocate(capacity) {
    this.binaryBuffer = Buffer.alloc(capacity * this.vectorSizeBytes);
    console.log(
      `[Storage] Đã cấp phát Buffer nhị phân dung lượng: ${(this.binaryBuffer.length / 1024 / 1024).toFixed(2)} MB`
    );
  }

  // Thêm bản ghi mới
  insert(index, id, vector, metadata) {
    if (vector.length !== this.dimension) {
      throw new Error(`Kích thước vector phải khớp với cấu hình (${this.dimension} chiều)!`);
    }

    // 1. Lưu metadata vào Key-Value store riêng biệt
    this.metadataStore.set(id, metadata);

    // 2. Ghi đè vector vào Buffer nhị phân tại offset tương ứng
    const offset = index * this.vectorSizeBytes;
    for (let i = 0; i < this.dimension; i++) {
      this.binaryBuffer.writeFloatLE(vector[i], offset + i * 4);
    }

    // 3. Đăng ký vị trí offset của vector ID
    this.vectorRegistry.set(id, offset);
  }

  // Đọc trực tiếp vector nhị phân từ offset bằng ID
  getVector(id) {
    const offset = this.vectorRegistry.get(id);
    if (offset === undefined) return null;

    const vector = new Float32Array(this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      vector[i] = this.binaryBuffer.readFloatLE(offset + i * 4);
    }
    return vector;
  }

  // Quét khoảng cách cực nhanh trên buffer nhị phân liên tiếp (Không đụng tới Metadata)
  scanFlat(queryVector, k) {
    const results = [];
    const count = this.vectorRegistry.size;

    // Duyệt tuyến tính qua mảng nhị phân liên tiếp trên RAM
    for (let idx = 0; idx < count; idx++) {
      const offset = idx * this.vectorSizeBytes;
      let sum = 0;

      for (let i = 0; i < this.dimension; i++) {
        const val = this.binaryBuffer.readFloatLE(offset + i * 4);
        const diff = queryVector[i] - val;
        sum += diff * diff;
      }

      results.push({ idx, distance: Math.sqrt(sum) });
    }

    // Sắp xếp
    results.sort((a, b) => a.distance - b.distance);

    // Lấy top K ứng viên
    const topCandidates = results.slice(0, k);

    // Giải nghĩa ID và Metadata CHỈ cho Top K phần tử cuối cùng (Tối ưu hóa I/O)
    const idArray = Array.from(this.vectorRegistry.keys());

    return topCandidates.map((c) => {
      const id = idArray[c.idx];
      return {
        id,
        distance: c.distance,
        metadata: this.metadataStore.get(id), // Chỉ đọc metadata lúc này
      };
    });
  }
}

// === CHẠY THỬ NGHIỆM THỰC HÀNH ===

function run() {
  const N = 100;
  const dimension = 1536;
  const db = new HybridVectorStorage();
  db.dimension = dimension;
  db.vectorSizeBytes = dimension * 4;
  db.allocate(N);

  console.log('\n--- BẮT ĐẦU CHÈN DỮ LIỆU ---');
  for (let i = 0; i < N; i++) {
    // Tạo vector ngẫu nhiên
    const vec = Array.from({ length: dimension }, () => Math.random());
    const metadata = {
      title: `Bài viết số ${i}`,
      category: i % 2 === 0 ? 'Công nghệ' : 'Đời sống',
      views: Math.floor(Math.random() * 1000),
    };
    db.insert(i, `doc_${i}`, vec, metadata);
  }
  console.log(`Đã nạp thành công ${db.metadataStore.size} bản ghi.`);

  console.log('\n--- TRUY VẤN HYBRID SEARCH ---');
  const queryVec = Array.from({ length: dimension }, () => Math.random());

  const start = performance.now();
  const matches = db.scanFlat(queryVec, 3);
  const end = performance.now();

  matches.forEach((m, idx) => {
    console.log(`${idx + 1}. [ID: ${m.id}] Khoảng cách: ${m.distance.toFixed(4)}`);
    console.log(`   Metadata: Title: "${m.metadata.title}", Chuyên mục: "${m.metadata.category}"`);
  });

  console.log(`\nThời gian quét và giải nghĩa: ${(end - start).toFixed(2)} ms`);
}

run();
