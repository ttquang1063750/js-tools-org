/**
 * vectordb_metrics_demo.js
 * Mã nguồn thực hành Bài 3: Độ Đo Khoảng Cách & So Khớp Tương Đồng
 *
 * Hướng dẫn chạy:
 *   node vectordb_metrics_demo.js
 */

// ====================================================
// 1. CÀI ĐẶT CÁC ĐỘ ĐO KHOẢNG CÁCH KHÔNG GIAN
// ====================================================

// 1.1 Khoảng cách Euclidean (L2 Metric)
function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// 1.2 Khoảng cách Manhattan (L1 Metric)
function manhattanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum;
}

// 1.3 Tích vô hướng (Dot Product / Inner Product)
function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

// 1.4 Tương đồng Cosine (Cosine Similarity)
function cosineSimilarity(a, b) {
  const dot = dotProduct(a, b);
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 1.5 Khoảng cách Cosine (Cosine Distance)
function cosineDistance(a, b) {
  return 1 - cosineSimilarity(a, b);
}

// ====================================================
// 2. KHÁI NIỆM CHUẨN HÓA VÉC-TƠ (VECTOR NORMALIZATION)
// ====================================================

// Biến đổi vector sao cho độ dài của nó ||v|| = 1 (L2 normalization)
function normalizeL2(vec) {
  let sumSquare = 0;
  for (let i = 0; i < vec.length; i++) {
    sumSquare += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSquare);
  if (norm === 0) return [...vec];
  return vec.map((v) => v / norm);
}

// === THỬ NGHIỆM VÀ ĐỐI CHIẾU ===

function run() {
  const A = [3, 4, 0]; // Vector độ dài 5
  const B = [6, 8, 0]; // Vector độ dài 10 (cùng hướng với A)
  const C = [0, 5, 0]; // Vector độ dài 5 (hướng khác)

  console.log('Vector A:', A, '||A|| =', Math.sqrt(dotProduct(A, A)));
  console.log('Vector B:', B, '||B|| =', Math.sqrt(dotProduct(B, B)));
  console.log('Vector C:', C, '||C|| =', Math.sqrt(dotProduct(C, C)));

  console.log('\n--- THỬ NGHIỆM ĐỘ ĐO ---');
  // 1. So sánh Euclidean: A gần C hơn B về mặt khoảng cách không gian
  console.log('Euclidean(A, B):', euclideanDistance(A, B)); // = 5
  console.log('Euclidean(A, C):', euclideanDistance(A, C)); // = 3.162

  // 2. So sánh Cosine: A và B trùng hướng hoàn toàn nên Cosine = 1 (Khoảng cách Cosine = 0)
  console.log('Cosine Distance(A, B):', cosineDistance(A, B)); // = 0 (Hoàn toàn trùng hướng)
  console.log('Cosine Distance(A, C):', cosineDistance(A, C)); // = 0.2 (Góc lệch nhau)

  console.log('\n--- CHỨNG MINH SỰ ĐỒNG NHẤT CỦA CHUẨN HÓA ---');
  const normA = normalizeL2(A);
  const normB = normalizeL2(B);

  console.log('Chuẩn hóa L2 của A:', normA);
  console.log('Chuẩn hóa L2 của B:', normB); // normA và normB sẽ bằng nhau!

  const cs = cosineSimilarity(A, B);
  const dp = dotProduct(normA, normB);
  console.log(`CosineSimilarity(A, B) = ${cs.toFixed(6)}`);
  console.log(`DotProduct(Normalized A, Normalized B) = ${dp.toFixed(6)}`);
  console.log('Kết quả hai phép tính trùng khớp hoàn toàn!');

  console.log('\n--- BENCHMARK HIỆU NĂNG TÍNH TOÁN (1 triệu phép tính) ---');
  const size = 1536; // Số chiều tiêu chuẩn
  const vec1 = Array.from({ length: size }, () => Math.random());
  const vec2 = Array.from({ length: size }, () => Math.random());
  const normVec1 = normalizeL2(vec1);
  const normVec2 = normalizeL2(vec2);

  // Đo thời gian tính Cosine truyền thống
  let start = performance.now();
  for (let i = 0; i < 1000000; i++) {
    cosineSimilarity(vec1, vec2);
  }
  let end = performance.now();
  console.log(`Thời gian chạy Cosine Similarity: ${(end - start).toFixed(2)} ms`);

  // Đo thời gian tính Dot Product trên vector đã chuẩn hóa
  start = performance.now();
  for (let i = 0; i < 1000000; i++) {
    dotProduct(normVec1, normVec2);
  }
  end = performance.now();
  console.log(
    `Thời gian chạy Dot Product (đã chuẩn hóa): ${(end - start).toFixed(2)} ms (Tiết kiệm đáng kể do không chứa phép chia và căn bậc hai)`
  );
}

run();
