/**
 * vectordb_basics_demo.js
 * Mã nguồn thực hành Bài 1: Khái niệm & Vai trò của Vector DB
 *
 * Hướng dẫn chạy:
 *   node vectordb_basics_demo.js
 */

// 1. Hàm tính khoảng cách Euclidean (L2) giữa hai vector
function euclideanDistance(a, b) {
  if (a.length !== b.length) throw new Error('Hai vector phải có cùng số chiều!');
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// 2. Định nghĩa một cơ sở dữ liệu vector dạng Flat (KNN Brute-force) đơn giản
class SimpleFlatVectorDB {
  constructor() {
    this.records = []; // Lưu trữ dạng: { id, vector, metadata }
  }

  // Chèn bản ghi mới
  insert(id, vector, metadata = {}) {
    this.records.push({ id, vector, metadata });
  }

  // Truy vấn K lân cận gần nhất (KNN Search)
  search(queryVector, k) {
    const results = this.records.map((rec) => {
      const dist = euclideanDistance(queryVector, rec.vector);
      return { id: rec.id, distance: dist, metadata: rec.metadata };
    });

    // Sắp xếp tăng dần theo khoảng cách (càng nhỏ càng gần)
    results.sort((a, b) => a.distance - b.distance);

    // Trả về top K kết quả
    return results.slice(0, k);
  }
}

// === CHƯƠNG TRÌNH THỰC HÀNH CHÍNH ===

console.log('=== KHỞI TẠO SIMPLE VECTOR DATABASE ===');
const db = new SimpleFlatVectorDB();

// Giả lập các bản ghi chứa Embeddings của các bài viết (đã được vector hóa thành không gian 3 chiều)
// Trong thực tế, vector này thường có từ 768 đến 1536 chiều từ các mô hình OpenAI, Cohere...
db.insert('doc_1', [0.1, 0.9, 0.05], { title: 'Hướng dẫn nấu phở bò truyền thống', category: 'Ẩm thực' });
db.insert('doc_2', [0.12, 0.85, 0.1], { title: 'Cách làm nem rán giòn lâu', category: 'Ẩm thực' });
db.insert('doc_3', [0.88, 0.05, 0.12], { title: 'Giới thiệu lập trình C nâng cao', category: 'Công nghệ' });
db.insert('doc_4', [0.85, 0.1, 0.08], { title: 'Cấu trúc dữ liệu và giải thuật trong JS', category: 'Công nghệ' });
db.insert('doc_5', [0.45, 0.5, 0.6], { title: 'Cách tối ưu hóa cơ sở dữ liệu SQL', category: 'Công nghệ' });

console.log(`Đã nạp ${db.records.length} bản ghi vào bộ nhớ.`);

// Thực thi truy vấn tìm kiếm ngữ nghĩa
// Giả sử người dùng nhập: "học lập trình" -> được mô hình Embedding dịch thành vector: [0.9, 0.08, 0.05]
const queryVector = [0.9, 0.08, 0.05];
const K = 2;

console.log(`\n=== TRUY VẤN SEMANTIC SEARCH (K=${K}) ===`);
console.log('Query Vector:', queryVector);

const matches = db.search(queryVector, K);

matches.forEach((match, idx) => {
  console.log(`${idx + 1}. [ID: ${match.id}] - Khoảng cách: ${match.distance.toFixed(4)}`);
  console.log(`   Tiêu đề: "${match.metadata.title}" (Chuyên mục: ${match.metadata.category})`);
});

// === MINH HỌA LỜI NGUYỀN CHIỀU KÍCH ===
console.log('\n=== MINH HỌA LỜI NGUYỀN CHIỀU KÍCH ===');

function runCurseIllustration(dimensions, numPoints = 100) {
  // Tạo danh sách điểm ngẫu nhiên trong không gian n-chiều (giá trị 0 -> 1)
  const points = Array.from({ length: numPoints }, () => Array.from({ length: dimensions }, () => Math.random()));

  let minDist = Infinity;
  let maxDist = -Infinity;

  // Tính khoảng cách đôi một để tìm min/max
  for (let i = 0; i < numPoints; i++) {
    for (let j = i + 1; j < numPoints; j++) {
      const dist = euclideanDistance(points[i], points[j]);
      if (dist < minDist) minDist = dist;
      if (dist > maxDist) maxDist = dist;
    }
  }

  // Tỉ số chênh lệch (Max - Min) / Min
  const ratio = (maxDist - minDist) / minDist;
  console.log(`Không gian ${dimensions} chiều:`);
  console.log(`  - Khoảng cách nhỏ nhất (Min Dist): ${minDist.toFixed(4)}`);
  console.log(`  - Khoảng cách lớn nhất (Max Dist): ${maxDist.toFixed(4)}`);
  console.log(`  - Tỉ số chênh lệch (Max-Min)/Min: ${ratio.toFixed(4)} (Càng nhỏ tức các điểm càng cách đều nhau)`);
}

runCurseIllustration(2);
runCurseIllustration(100);
