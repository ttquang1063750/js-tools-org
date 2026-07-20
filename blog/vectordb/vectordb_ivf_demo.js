/**
 * vectordb_ivf_demo.js
 * Mã nguồn thực hành Bài 5: Chỉ mục IVF (Inverted File Index)
 *
 * Hướng dẫn chạy:
 *   node vectordb_ivf_demo.js
 */

// Hàm tính khoảng cách Euclidean bình phương (tối ưu hóa bỏ căn)
function squaredEuclidean(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

// ====================================================
// 1. THUẬT TOÁN K-MEANS CLUSTERING ĐỂ TÌM CENTROIDS
// ====================================================

function kMeans(vectors, k, maxIterations = 10) {
  const dimension = vectors[0].length;

  // Khởi tạo ngẫu nhiên k centroids từ tập dữ liệu ban đầu
  const centroids = [];
  const usedIndices = new Set();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * vectors.length);
    if (!usedIndices.has(idx)) {
      centroids.push([...vectors[idx]]);
      usedIndices.add(idx);
    }
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    // 1. Phân bổ các vector vào centroid gần nhất
    const clusters = Array.from({ length: k }, () => []);

    for (let i = 0; i < vectors.length; i++) {
      const vec = vectors[i];
      let bestCentroidIdx = 0;
      let minDistance = Infinity;

      for (let j = 0; j < k; j++) {
        const dist = squaredEuclidean(vec, centroids[j]);
        if (dist < minDistance) {
          minDistance = dist;
          bestCentroidIdx = j;
        }
      }
      clusters[bestCentroidIdx].push(vec);
    }

    // 2. Cập nhật lại tọa độ centroids bằng trung bình cộng
    let shifted = false;
    for (let j = 0; j < k; j++) {
      const cluster = clusters[j];
      if (cluster.length === 0) continue;

      const newCentroid = new Array(dimension).fill(0);
      for (let i = 0; i < cluster.length; i++) {
        for (let d = 0; d < dimension; d++) {
          newCentroid[d] += cluster[i][d];
        }
      }
      for (let d = 0; d < dimension; d++) {
        newCentroid[d] /= cluster.length;
      }

      // Kiểm tra xem centroid có dịch chuyển không
      if (squaredEuclidean(centroids[j], newCentroid) > 1e-6) {
        centroids[j] = newCentroid;
        shifted = true;
      }
    }

    if (!shifted) break; // Centroids đã hội tụ
  }

  return centroids;
}

// ====================================================
// 2. CẤU TRÚC CHỈ MỤC IVF (INVERTED FILE INDEX)
// ====================================================

class IVFIndex {
  constructor(vectors, kCentroids) {
    this.vectors = vectors;
    this.k = kCentroids;
    this.centroids = [];
    this.invertedLists = Array.from({ length: kCentroids }, () => []);
  }

  // Xây dựng chỉ mục
  build() {
    console.log(`[IVF] Bắt đầu phân cụm K-Means cho ${this.vectors.length} vectors...`);
    this.centroids = kMeans(this.vectors, this.k, 15);

    // Điền các vector vào inverted lists tương ứng với centroid gần nhất
    for (let idx = 0; idx < this.vectors.length; idx++) {
      const vec = this.vectors[idx];
      let bestCentroidIdx = 0;
      let minDist = Infinity;

      for (let cIdx = 0; cIdx < this.k; cIdx++) {
        const dist = squaredEuclidean(vec, this.centroids[cIdx]);
        if (dist < minDist) {
          minDist = dist;
          bestCentroidIdx = cIdx;
        }
      }

      // Lưu lại index của vector ban đầu vào danh sách đảo ngược
      this.invertedLists[bestCentroidIdx].push(idx);
    }
    console.log('[IVF] Xây dựng chỉ mục thành công!');
  }

  // Tìm kiếm xấp xỉ ANN bằng IVF với tham số nprobe
  search(queryVector, limit, nprobe = 2) {
    // 1. Tìm nprobe centroids gần queryVector nhất
    const centroidDistances = this.centroids.map((centroid, idx) => ({
      idx,
      dist: squaredEuclidean(queryVector, centroid),
    }));
    centroidDistances.sort((a, b) => a.dist - b.dist);
    const targetCentroids = centroidDistances.slice(0, nprobe);

    // 2. Chỉ quét các vector nằm trong các bucket của centroid đã chọn
    const candidates = [];
    targetCentroids.forEach((c) => {
      const vecIndices = this.invertedLists[c.idx];
      vecIndices.forEach((idx) => {
        const dist = squaredEuclidean(queryVector, this.vectors[idx]);
        candidates.push({ idx, distance: Math.sqrt(dist) });
      });
    });

    // 3. Sắp xếp ứng viên và trả về Top K
    candidates.sort((a, b) => a.distance - b.distance);
    return candidates.slice(0, limit);
  }
}

// === THỬ NGHIỆM THỰC HÀNH ===

function run() {
  const N = 10000;
  const dimension = 128;
  const K = 50; // 50 cụm Voronoi

  console.log('--- 1. KHỞI TẠO DỮ LIỆU THỬ NGHIỆM ---');
  const dataset = Array.from({ length: N }, () => Array.from({ length: dimension }, () => Math.random()));
  const query = Array.from({ length: dimension }, () => Math.random());

  console.log(`Đã sinh ${N} vector thử nghiệm ${dimension} chiều.`);

  // Khởi tạo chỉ mục
  const ivf = new IVFIndex(dataset, K);
  ivf.build();

  console.log('\n--- 2. TÌM KIẾM CHI TIẾT ĐỐI CHIẾU ---');

  // 1. Quét Flat tuyến tính chính xác 100% làm chuẩn so sánh
  let start = performance.now();
  const flatResults = dataset.map((vec, idx) => ({
    idx,
    distance: Math.sqrt(squaredEuclidean(query, vec)),
  }));
  flatResults.sort((a, b) => a.distance - b.distance);
  const exactTopK = flatResults.slice(0, 5);
  let timeFlat = performance.now() - start;
  console.log(`[Exact Flat] Thời gian: ${timeFlat.toFixed(2)} ms. Top 1 ID: ${exactTopK[0].idx}`);

  // 2. Quét IVF với nprobe = 1 (Rất nhanh, dễ sót)
  start = performance.now();
  const ivfResults1 = ivf.search(query, 5, 1);
  let timeIVF1 = performance.now() - start;
  console.log(
    `[IVF Search (nprobe=1)] Thời gian: ${timeIVF1.toFixed(2)} ms. Top 1 ID: ${ivfResults1[0]?.idx || 'None'}`
  );

  // 3. Quét IVF với nprobe = 5 (Nhanh vừa, bao phủ tốt)
  start = performance.now();
  const ivfResults5 = ivf.search(query, 5, 5);
  let timeIVF5 = performance.now() - start;
  console.log(
    `[IVF Search (nprobe=5)] Thời gian: ${timeIVF5.toFixed(2)} ms. Top 1 ID: ${ivfResults5[0]?.idx || 'None'}`
  );

  // Tính tỷ lệ Recall (số lượng kết quả đúng so với chính xác 100%)
  const exactSet = new Set(exactTopK.map((r) => r.idx));

  const countMatch1 = ivfResults1.filter((r) => exactSet.has(r.idx)).length;
  const countMatch5 = ivfResults5.filter((r) => exactSet.has(r.idx)).length;

  console.log(`\n--- ĐÁNH GIÁ CHẤT LƯỢNG (RECALL) ---`);
  console.log(`Recall@5 (nprobe = 1): ${((countMatch1 / 5) * 100).toFixed(0)}%`);
  console.log(`Recall@5 (nprobe = 5): ${((countMatch5 / 5) * 100).toFixed(0)}%`);
  console.log(`Tốc độ nprobe=5 nhanh gấp: ${(timeFlat / timeIVF5).toFixed(1)} lần so với quét Flat.`);
}

run();
