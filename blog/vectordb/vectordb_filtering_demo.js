/**
 * vectordb_filtering_demo.js
 * Mã nguồn thực hành Bài 8: Lọc Metadata (Metadata Filtering)
 *
 * Hướng dẫn chạy:
 *   node vectordb_filtering_demo.js
 */

// Hàm tính khoảng cách Euclidean bình phương
function squaredEuclidean(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

// ====================================================
// KHỞI TẠO CƠ SỞ DỮ LIỆU ĐỘC LẬP KÈM METADATA
// ====================================================

const dimension = 8;
const N = 1000;
const database = [];

// Sinh ngẫu nhiên N bản ghi
for (let i = 0; i < N; i++) {
  database.push({
    id: `doc_${i}`,
    vector: Array.from({ length: dimension }, () => Math.random()),
    metadata: {
      category: i % 5 === 0 ? 'Thể thao' : 'Thời sự', // Thể thao chiếm 20%
      price: Math.floor(Math.random() * 200) + 10, // Giá từ 10 đến 210
    },
  });
}

// ====================================================
// 1. CHIẾN LƯỢC 1: LỌC SAU (POST-FILTERING)
// ====================================================

function postFilteringSearch(queryVector, limit, filterFn) {
  // 1. Tìm kiếm Vector KNN thô trước (không quan tâm metadata)
  const knn = database.map((entry) => ({
    entry,
    dist: squaredEuclidean(queryVector, entry.vector),
  }));
  knn.sort((a, b) => a.dist - b.dist);

  // Lấy Top 30 ứng viên gần nhất để lọc sau
  const candidates = knn.slice(0, 30);

  // 2. Lọc lại bằng bộ lọc metadata
  const filtered = candidates
    .filter((c) => filterFn(c.entry.metadata))
    .map((c) => ({
      id: c.entry.id,
      distance: Math.sqrt(c.dist),
      metadata: c.entry.metadata,
    }));

  return filtered.slice(0, limit);
}

// ====================================================
// 2. CHIẾN LƯỢC 2: LỌC TRƯỚC (PRE-FILTERING)
// ====================================================

function preFilteringSearch(queryVector, limit, filterFn) {
  // 1. Lọc trước toàn bộ CSDL bằng bộ lọc metadata
  const filteredDocs = database.filter((entry) => filterFn(entry.metadata));

  // 2. Chỉ tính toán khoảng cách vector trên danh sách đã thỏa mãn điều kiện
  const results = filteredDocs.map((entry) => ({
    id: entry.id,
    distance: Math.sqrt(squaredEuclidean(queryVector, entry.vector)),
    metadata: entry.metadata,
  }));

  results.sort((a, b) => a.distance - b.distance);
  return results.slice(0, limit);
}

// ====================================================
// 3. CHIẾN LƯỢC 3: LỌC ĐỒNG THỜI (SINGLE-STAGE / HYBRID FILTERING)
// ====================================================

class HybridSearchEngine {
  constructor(db) {
    this.db = db;
  }

  // Quét kết hợp kiểm tra bộ lọc trực tiếp trong khâu tính toán
  search(queryVector, limit, filterFn) {
    const results = [];

    for (let i = 0; i < this.db.length; i++) {
      const entry = this.db[i];

      // Kiểm tra filter trước khi tính khoảng cách (Tiết kiệm phép tính vector)
      if (filterFn(entry.metadata)) {
        const dist = squaredEuclidean(queryVector, entry.vector);
        results.push({
          id: entry.id,
          distance: Math.sqrt(dist),
          metadata: entry.metadata,
        });
      }
    }

    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, limit);
  }
}

// === THỬ NGHIỆM VÀ ĐỐI CHIẾU ===

function run() {
  const query = Array.from({ length: dimension }, () => Math.random());

  // Điều kiện lọc: Chỉ lấy bài viết thuộc chuyên mục "Thể thao" và có Giá < 100
  const filterCond = (meta) => meta.category === 'Thể thao' && meta.price < 100;

  console.log('=== BẮT ĐẦU CHẠY THỬ NGHIỆM LỌC METADATA ===');

  // 1. Chạy Post-filtering
  console.log('\n--- 1. CHIẾN LƯỢC: POST-FILTERING ---');
  const postResults = postFilteringSearch(query, 3, filterCond);
  postResults.forEach((r, idx) => {
    console.log(
      `  ${idx + 1}. [ID: ${r.id}] Khoảng cách: ${r.distance.toFixed(4)} | Category: "${r.metadata.category}", Price: ${r.metadata.price}`
    );
  });
  console.log(
    `Số lượng kết quả trả về thực tế: ${postResults.length} (Có thể thiếu do Top 30 ban đầu bị lọc loại bỏ hết)`
  );

  // 2. Chạy Pre-filtering
  console.log('\n--- 2. CHIẾN LƯỢC: PRE-FILTERING ---');
  const preResults = preFilteringSearch(query, 3, filterCond);
  preResults.forEach((r, idx) => {
    console.log(
      `  ${idx + 1}. [ID: ${r.id}] Khoảng cách: ${r.distance.toFixed(4)} | Category: "${r.metadata.category}", Price: ${r.metadata.price}`
    );
  });
  console.log(`Số lượng kết quả trả về thực tế: ${preResults.length}`);

  // 3. Chạy Hybrid Search (Single-stage)
  console.log('\n--- 3. CHIẾN LƯỢC: HYBRID SEARCH (SINGLE-STAGE) ---');
  const engine = new HybridSearchEngine(database);
  const hybridResults = engine.search(query, 3, filterCond);
  hybridResults.forEach((r, idx) => {
    console.log(
      `  ${idx + 1}. [ID: ${r.id}] Khoảng cách: ${r.distance.toFixed(4)} | Category: "${r.metadata.category}", Price: ${r.metadata.price}`
    );
  });
  console.log(`Số lượng kết quả trả về thực tế: ${hybridResults.length}`);
}

run();
