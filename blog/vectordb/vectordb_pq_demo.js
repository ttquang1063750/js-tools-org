/**
 * vectordb_pq_demo.js
 * Mã nguồn thực hành Bài 7: Nén Vector PQ (Product Quantization)
 *
 * Hướng dẫn chạy:
 *   node vectordb_pq_demo.js
 */

// Giả lập thuật toán phân cụm K-Means cực nhanh cho không gian 1 chiều/2 chiều nhỏ
function simpleKMeans1D(values, k, iterations = 5) {
  // Chọn các mốc centroids ban đầu đều nhau
  let min = Math.min(...values);
  let max = Math.max(...values);
  let centroids = Array.from({ length: k }, (_, i) => min + (i * (max - min)) / (k - 1 || 1));

  for (let iter = 0; iter < iterations; iter++) {
    const buckets = Array.from({ length: k }, () => []);

    // Gán giá trị về centroid gần nhất
    for (const val of values) {
      let minDist = Infinity,
        bestIdx = 0;
      for (let cIdx = 0; cIdx < k; cIdx++) {
        const dist = Math.abs(val - centroids[cIdx]);
        if (dist < minDist) {
          minDist = dist;
          bestIdx = cIdx;
        }
      }
      buckets[bestIdx].push(val);
    }

    // Cập nhật centroid
    for (let cIdx = 0; cIdx < k; cIdx++) {
      if (buckets[cIdx].length > 0) {
        centroids[cIdx] = buckets[cIdx].reduce((a, b) => a + b, 0) / buckets[cIdx].length;
      }
    }
  }
  return centroids.sort((a, b) => a - b);
}

// ====================================================
// 1. THIẾT LẬP LƯỢNG TỬ HÓA SẢN PHẨM (PRODUCT QUANTIZATION)
// ====================================================

class ProductQuantizer {
  constructor(dimension = 8, mSubspaces = 4, kCentroids = 16) {
    this.dimension = dimension;
    this.m = mSubspaces; // Chia vector thành m phân không gian
    this.k = kCentroids; // Mỗi phân không gian có k centroids đại diện (1 byte)
    this.subspaceDim = dimension / mSubspaces;

    // Codebook chứa các centroids cho từng sub-space
    this.codebook = Array.from({ length: this.m }, () => []);
  }

  // Huấn luyện Codebook từ dữ liệu mẫu
  fit(trainingVectors) {
    console.log(`[PQ] Bắt đầu huấn luyện Codebook cho ${this.m} phân không gian...`);

    for (let subIdx = 0; subIdx < this.m; subIdx++) {
      // 1. Trích xuất các sub-vectors của phân không gian tương ứng
      const subVectors = [];
      const startDim = subIdx * this.subspaceDim;

      for (let i = 0; i < trainingVectors.length; i++) {
        // Gom giá trị của sub-vector (ở đây mô phỏng bằng cách lấy trung bình cộng trị số của chiều để chạy K-Means 1D nhanh)
        let sum = 0;
        for (let d = 0; d < this.subspaceDim; d++) {
          sum += trainingVectors[i][startDim + d];
        }
        subVectors.push(sum / this.subspaceDim);
      }

      // 2. Chạy K-Means phân cụm để tìm k centroids cho phân không gian này
      this.codebook[subIdx] = simpleKMeans1D(subVectors, this.k, 10);
    }
    console.log('[PQ] Huấn luyện thành công. Codebook đã sẵn sàng.');
  }

  // Mã hóa (Quantize) một vector thô thành một chuỗi m bytes mã (Codes)
  encode(vector) {
    const codes = new Uint8Array(this.m);

    for (let subIdx = 0; subIdx < this.m; subIdx++) {
      const startDim = subIdx * this.subspaceDim;
      let sum = 0;
      for (let d = 0; d < this.subspaceDim; d++) {
        sum += vector[startDim + d];
      }
      const val = sum / this.subspaceDim;

      // Tìm centroid gần nhất trong codebook của subspace
      let bestIdx = 0;
      let minDist = Infinity;
      const centroids = this.codebook[subIdx];

      for (let cIdx = 0; cIdx < this.k; cIdx++) {
        const dist = Math.abs(val - centroids[cIdx]);
        if (dist < minDist) {
          minDist = dist;
          bestIdx = cIdx;
        }
      }
      codes[subIdx] = bestIdx;
    }
    return codes;
  }

  // Tìm kiếm bất đối xứng (Asymmetric Distance Computation - ADC)
  computeAdcDistance(queryVector, codes) {
    let sumSquaredDistance = 0;

    // Duyệt qua các phân không gian
    for (let subIdx = 0; subIdx < this.m; subIdx++) {
      const startDim = subIdx * this.subspaceDim;
      let sum = 0;
      for (let d = 0; d < this.subspaceDim; d++) {
        sum += queryVector[startDim + d];
      }
      const queryVal = sum / this.subspaceDim;

      // Đọc centroid từ Codebook bằng byte mã (Không giải nén vector đích)
      const centroidIdx = codes[subIdx];
      const centroidVal = this.codebook[subIdx][centroidIdx];

      // Tính khoảng cách
      const diff = queryVal - centroidVal;
      sumSquaredDistance += diff * diff * this.subspaceDim; // Nhân bù số chiều
    }

    return Math.sqrt(sumSquaredDistance);
  }
}

// === THỬ NGHIỆM THỰC HÀNH ===

function run() {
  const N = 1000;
  const dimension = 128;
  const M = 16; // Chia thành 16 sub-vectors
  const K = 256; // 256 centroids (mã hóa vừa khít trong 1 Byte)

  console.log('--- 1. TẠO DỮ LIỆU VÀ HUẤN LUYỆN PQ ---');
  const dataset = Array.from({ length: N }, () => Array.from({ length: dimension }, () => Math.random()));

  const pq = new ProductQuantizer(dimension, M, K);
  pq.fit(dataset);

  // Tính toán mức độ tiết kiệm dung lượng lưu trữ
  const rawSizeBytes = dimension * 4; // Float32
  const compressedSizeBytes = M * 1; // M bytes
  const ratio = rawSizeBytes / compressedSizeBytes;

  console.log(`\n--- PHÂN TÍCH TỶ LỆ NÉN ---`);
  console.log(`Dung lượng Vector gốc: ${rawSizeBytes} Bytes`);
  console.log(`Dung lượng Vector nén PQ: ${compressedSizeBytes} Bytes`);
  console.log(`Tỷ lệ nén: Nén giảm đi ${ratio.toFixed(1)} lần bộ nhớ RAM!`);

  // 2. Tiến hành mã hóa toàn bộ cơ sở dữ liệu
  console.log('\n--- 2. TIẾN HÀNH MÃ HÓA CSDL ---');
  const encodedDb = dataset.map((vec) => pq.encode(vec));
  console.log(`Mã hóa thành công ${encodedDb.length} vectors thành dạng Uint8Array.`);

  // 3. Thực hiện truy vấn tìm kiếm bất đối xứng (ADC)
  const query = Array.from({ length: dimension }, () => Math.random());
  console.log('\n--- 3. TRUY VẤN TÌM KIẾM ADC ---');

  const start = performance.now();
  const results = encodedDb.map((codes, idx) => ({
    idx,
    distance: pq.computeAdcDistance(query, codes),
  }));
  results.sort((a, b) => a.distance - b.distance);
  const end = performance.now();

  console.log(`Top 3 kết quả gần nhất tìm bằng ADC:`);
  results.slice(0, 3).forEach((r, i) => {
    console.log(`  ${i + 1}. [Index: ${r.idx}] Khoảng cách ước tính: ${r.distance.toFixed(4)}`);
  });
  console.log(`Thời gian quét và so khớp ADC trên đệm nén: ${(end - start).toFixed(2)} ms`);
}

run();
