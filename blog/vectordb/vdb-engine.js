/**
 * vdb-engine.js
 * Thư viện động cơ tìm kiếm và chỉ mục Vector (Vector Database Engine) chạy trong trình duyệt.
 * Phục vụ cho học tập và mô phỏng trực quan: Flat (KNN), IVF, HNSW, và Product Quantization (PQ).
 *
 * @author js-tools.org
 */

// ==========================================
// 1. CÁC ĐỘ ĐO KHOẢNG CÁCH & TƯƠNG ĐỒNG
// ==========================================

/**
 * Tính khoảng cách Euclidean (L2 Distance) giữa hai vector.
 * Công thức: d = sqrt(sum((a_i - b_i)^2))
 */
export function euclideanDistance(a, b) {
  let sum = 0;
  const d = a.length;
  for (let i = 0; i < d; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Tính khoảng cách Manhattan (L1 Distance) giữa hai vector.
 * Công thức: d = sum(|a_i - b_i|)
 */
export function manhattanDistance(a, b) {
  let sum = 0;
  const d = a.length;
  for (let i = 0; i < d; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum;
}

/**
 * Tính Tích vô hướng (Dot Product / Inner Product) giữa hai vector.
 * Công thức: a . b = sum(a_i * b_i)
 */
export function dotProduct(a, b) {
  let product = 0;
  const d = a.length;
  for (let i = 0; i < d; i++) {
    product += a[i] * b[i];
  }
  return product;
}

/**
 * Tính Tương đồng Cosine (Cosine Similarity) giữa hai vector.
 * Công thức: similarity = (a . b) / (||a|| * ||b||)
 * Khoảng cách tương đồng Cosine = 1 - similarity (khoảng cách càng nhỏ càng tương đồng)
 */
export function cosineSimilarity(a, b) {
  let dotProd = 0;
  let normA = 0;
  let normB = 0;
  const d = a.length;
  for (let i = 0; i < d; i++) {
    dotProd += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0; // Tránh chia cho 0
  return dotProd / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Khoảng cách Cosine (Cosine Distance) = 1 - Cosine Similarity
 */
export function cosineDistance(a, b) {
  return 1 - cosineSimilarity(a, b);
}

// Helper tính khoảng cách tổng quát dựa vào tên cấu hình
export function calculateDistance(a, b, metric = 'euclidean') {
  switch (metric.toLowerCase()) {
    case 'l2':
    case 'euclidean':
      return euclideanDistance(a, b);
    case 'l1':
    case 'manhattan':
      return manhattanDistance(a, b);
    case 'dot':
    case 'dotproduct':
      // Dot product biểu diễn độ lớn tương đồng, để đổi thành khoảng cách
      // (phù hợp cho các thuật toán tìm min distance), ta có thể lấy âm dot product
      return -dotProduct(a, b);
    case 'cosine':
      return cosineDistance(a, b);
    default:
      return euclideanDistance(a, b);
  }
}

// ==========================================
// 2. K-MEANS CLUSTERING ENGINE
// ==========================================

/**
 * Thuật toán phân cụm K-Means cho mảng dữ liệu vector.
 * @param {Array<Array<number>>} data - Mảng các vector dữ liệu
 * @param {number} k - Số lượng cụm cần phân chia
 * @param {string} metric - Độ đo khoảng cách sử dụng
 * @param {number} maxIterations - Số vòng lặp tối đa
 * @returns {Object} Centroids và Labels
 */
export function kMeans(data, k, metric = 'euclidean', maxIterations = 20) {
  const n = data.length;
  if (n === 0) return { centroids: [], labels: [] };
  const d = data[0].length;

  if (k > n) k = n;

  // 1. Khởi tạo Centroid ngẫu nhiên từ dữ liệu (Forgy Method)
  let centroids = [];
  const selectedIndices = new Set();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * n);
    if (!selectedIndices.has(idx)) {
      selectedIndices.add(idx);
      centroids.push([...data[idx]]);
    }
  }

  let labels = new Array(n).fill(-1);
  let changed = true;
  let iter = 0;

  while (changed && iter < maxIterations) {
    changed = false;
    iter++;

    // 2. Gán các điểm dữ liệu vào cụm có centroid gần nhất
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let closestCentroid = -1;

      for (let j = 0; j < k; j++) {
        const dist = calculateDistance(data[i], centroids[j], metric);
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = j;
        }
      }

      if (labels[i] !== closestCentroid) {
        labels[i] = closestCentroid;
        changed = true;
      }
    }

    // 3. Cập nhật lại vị trí Centroid bằng trung bình cộng các điểm trong cụm
    const newCentroids = Array.from({ length: k }, () => new Array(d).fill(0));
    const counts = new Array(k).fill(0);

    for (let i = 0; i < n; i++) {
      const clusterIdx = labels[i];
      counts[clusterIdx]++;
      for (let j = 0; j < d; j++) {
        newCentroids[clusterIdx][j] += data[i][j];
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let j = 0; j < d; j++) {
          newCentroids[c][j] /= counts[c];
        }
        centroids[c] = newCentroids[c];
      } else {
        // Nếu cụm rỗng, tái khởi tạo centroid bằng 1 điểm ngẫu nhiên
        const randIdx = Math.floor(Math.random() * n);
        centroids[c] = [...data[randIdx]];
      }
    }
  }

  return { centroids, labels };
}

// ==========================================
// 3. CÁC KIỂU CHỈ MỤC (INDEXING SYSTEMS)
// ==========================================

/**
 * 3.1 Flat Index - Tìm kiếm tuyến tính KNN (Brute force)
 */
export class FlatIndex {
  constructor(metric = 'euclidean') {
    this.vectors = []; // Mảng chứa các object: { id, vector, metadata }
    this.metric = metric;
  }

  insert(id, vector, metadata = {}) {
    this.vectors.push({ id, vector, metadata });
  }

  clear() {
    this.vectors = [];
  }

  /**
   * Tìm kiếm K lân cận gần nhất.
   */
  search(queryVector, k) {
    const results = this.vectors.map((item) => {
      const dist = calculateDistance(queryVector, item.vector, this.metric);
      return { item, distance: dist };
    });

    // Sắp xếp tăng dần theo khoảng cách (hoặc giảm dần nếu là độ tương đồng cao nhất)
    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, k).map((r) => ({
      id: r.item.id,
      vector: r.item.vector,
      metadata: r.item.metadata,
      distance: r.distance,
    }));
  }
}

/**
 * 3.2 IVF Index (Inverted File Index)
 */
export class IVFIndex {
  constructor(centroidsCount = 10, metric = 'euclidean') {
    this.centroidsCount = centroidsCount;
    this.metric = metric;
    this.centroids = []; // Danh sách tọa độ centroid
    this.buckets = {}; // Centroid Index -> Danh sách các phần tử { id, vector, metadata }
    this.flatVectors = []; // Dữ liệu lưu thô để train
  }

  insert(id, vector, metadata = {}) {
    const item = { id, vector, metadata };
    this.flatVectors.push(item);
  }

  clear() {
    this.centroids = [];
    this.buckets = {};
    this.flatVectors = [];
  }

  /**
   * Huấn luyện chỉ mục (Phân cụm dữ liệu và đưa vào các buckets)
   */
  build() {
    const n = this.flatVectors.length;
    if (n === 0) return;

    const dataArr = this.flatVectors.map((v) => v.vector);
    const k = Math.min(this.centroidsCount, n);

    // Chạy K-Means
    const { centroids, labels } = kMeans(dataArr, k, this.metric);
    this.centroids = centroids;

    // Khởi tạo các buckets trống
    this.buckets = {};
    for (let c = 0; c < centroids.length; c++) {
      this.buckets[c] = [];
    }

    // Đổ dữ liệu vào các bucket tương ứng
    for (let i = 0; i < n; i++) {
      const clusterIdx = labels[i];
      this.buckets[clusterIdx].push(this.flatVectors[i]);
    }
  }

  /**
   * Tìm kiếm xấp xỉ ANN trên IVF
   * @param {Array<number>} queryVector - Vector truy vấn
   * @param {number} k - Số lân cận cần tìm
   * @param {number} nprobe - Số lượng centroids gần nhất cần duyệt
   */
  search(queryVector, k, nprobe = 2) {
    if (this.centroids.length === 0) {
      // Nếu chưa build IVF, tìm kiếm trực tiếp trên dữ liệu thô
      return new FlatIndex(this.metric).search.call({ vectors: this.flatVectors, metric: this.metric }, queryVector, k);
    }

    nprobe = Math.min(nprobe, this.centroids.length);

    // 1. Tìm các centroids gần query nhất
    const centroidDists = this.centroids.map((centroid, idx) => {
      const dist = calculateDistance(queryVector, centroid, this.metric);
      return { idx, distance: dist };
    });
    centroidDists.sort((a, b) => a.distance - b.distance);
    const targetCentroids = centroidDists.slice(0, nprobe).map((c) => c.idx);

    // 2. Thu thập tất cả các vector nằm trong các bucket của centroid mục tiêu
    let candidateItems = [];
    for (const cIdx of targetCentroids) {
      candidateItems = candidateItems.concat(this.buckets[cIdx]);
    }

    // 3. Tính toán khoảng cách chi tiết và sắp xếp trong tập ứng viên
    let results = candidateItems.map((item) => {
      const dist = calculateDistance(queryVector, item.vector, this.metric);
      return { item, distance: dist };
    });
    results.sort((a, b) => a.distance - b.distance);

    return results.slice(0, k).map((r) => ({
      id: r.item.id,
      vector: r.item.vector,
      metadata: r.item.metadata,
      distance: r.distance,
      scannedPercent: ((candidateItems.length / this.flatVectors.length) * 100).toFixed(1), // Benchmark chỉ số phần trăm quét
    }));
  }
}

/**
 * 3.3 HNSW Index (Hierarchical Navigable Small World) - Phiên bản thu gọn cho Web
 */
export class HNSWIndex {
  constructor(M = 16, efConstruction = 64, metric = 'euclidean') {
    this.M = M; // Số lượng liên kết tối đa của mỗi node trên một tầng
    this.efConstruction = efConstruction; // Kích thước danh sách ứng viên trong quá trình xây dựng
    this.metric = metric;
    this.nodes = {}; // Map: id -> { id, vector, metadata, layers: [ [neighborIds] ] }
    this.enterPointId = null; // Điểm bắt đầu ở layer cao nhất
    this.maxLayer = -1; // Tầng cao nhất hiện tại
    this.levelMult = 1 / Math.log(M); // Hệ số tính tầng ngẫu nhiên
  }

  clear() {
    this.nodes = {};
    this.enterPointId = null;
    this.maxLayer = -1;
  }

  // Tạo ngẫu nhiên tầng lớn nhất cho một node mới dựa trên phân phối xác suất
  getRandomLevel() {
    const r = Math.random();
    if (r === 0) return 0;
    return Math.floor(-Math.log(r) * this.levelMult);
  }

  /**
   * Chèn một vector vào đồ thị HNSW
   */
  insert(id, vector, metadata = {}) {
    const insertLevel = this.getRandomLevel();
    const newNode = {
      id,
      vector,
      metadata,
      layers: Array.from({ length: insertLevel + 1 }, () => []),
    };

    this.nodes[id] = newNode;

    if (this.enterPointId === null) {
      this.enterPointId = id;
      this.maxLayer = insertLevel;
      return;
    }

    let currEP = this.enterPointId;
    let currDist = calculateDistance(vector, this.nodes[currEP].vector, this.metric);

    // 1. Duyệt từ tầng cao nhất hiện tại xuống tầng cần chèn (insertLevel)
    for (let l = this.maxLayer; l > insertLevel; l--) {
      let changed = true;
      while (changed) {
        changed = false;
        const neighbors = this.nodes[currEP].layers[l];
        for (const neighborId of neighbors) {
          const d = calculateDistance(vector, this.nodes[neighborId].vector, this.metric);
          if (d < currDist) {
            currDist = d;
            currEP = neighborId;
            changed = true;
          }
        }
      }
    }

    // 2. Chèn vào từ insertLevel xuống layer 0
    let candidates = [{ id: currEP, distance: currDist }];
    for (let l = Math.min(insertLevel, this.maxLayer); l >= 0; l--) {
      // Tìm efConstruction phần tử gần nhất trên layer l
      const nearestEPs = this.searchLayer(vector, candidates, this.efConstruction, l);

      // Lấy M hàng xóm gần nhất để kết nối
      const connections = nearestEPs.slice(0, this.M);

      // Thực hiện kết nối hai chiều
      for (const conn of connections) {
        const connNode = this.nodes[conn.id];
        // Nối node mới -> node cũ
        newNode.layers[l].push(conn.id);
        // Nối node cũ -> node mới
        connNode.layers[l].push(id);

        // Thu gọn (prune) các kết nối của node cũ nếu vượt quá M
        if (connNode.layers[l].length > this.M) {
          this.pruneConnections(conn.id, l);
        }
      }

      candidates = nearestEPs;
    }

    // Cập nhật điểm vào nếu node này có tầng cao hơn tầng hiện tại
    if (insertLevel > this.maxLayer) {
      this.maxLayer = insertLevel;
      this.enterPointId = id;
    }
  }

  // Helper duyệt và tìm kiếm trên 1 Layer cụ thể
  searchLayer(targetVector, enterPoints, ef, layer) {
    const visited = new Set(enterPoints.map((ep) => ep.id));
    const candidates = [...enterPoints]; // Min-Heap giả lập
    candidates.sort((a, b) => a.distance - b.distance);

    const results = [...enterPoints]; // Phân loại giữ các điểm tốt nhất

    while (candidates.length > 0) {
      const curr = candidates.shift(); // Lấy node gần nhất
      const worstResultDist = results[results.length - 1].distance;

      if (curr.distance > worstResultDist && results.length >= ef) {
        break; // Dừng tìm kiếm sớm
      }

      const neighbors = this.nodes[curr.id].layers[layer];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          const d = calculateDistance(targetVector, this.nodes[neighborId].vector, this.metric);
          const worstDist = results[results.length - 1].distance;

          if (d < worstDist || results.length < ef) {
            candidates.push({ id: neighborId, distance: d });
            results.push({ id: neighborId, distance: d });

            // Sắp xếp và thu hẹp kết quả về kích thước tối đa ef
            candidates.sort((a, b) => a.distance - b.distance);
            results.sort((a, b) => a.distance - b.distance);
            if (results.length > ef) {
              results.pop();
            }
          }
        }
      }
    }
    return results;
  }

  // Thu gọn các kết nối của một node để giữ đồ thị nhỏ và hiệu năng
  pruneConnections(nodeId, layer) {
    const node = this.nodes[nodeId];
    const neighbors = node.layers[layer];
    const targetVector = node.vector;

    const list = neighbors.map((nId) => ({
      id: nId,
      distance: calculateDistance(targetVector, this.nodes[nId].vector, this.metric),
    }));

    list.sort((a, b) => a.distance - b.distance);
    // Giữ lại tối đa M kết nối gần nhất
    node.layers[layer] = list.slice(0, this.M).map((x) => x.id);
  }

  /**
   * Tìm kiếm K lân cận gần nhất bằng HNSW
   * @param {Array<number>} queryVector
   * @param {number} k
   * @param {number} efSearch - Tham số điều khiển độ rộng tìm kiếm (quyết định Recall)
   */
  search(queryVector, k, efSearch = 32) {
    if (this.enterPointId === null) return [];

    let currEP = this.enterPointId;
    let currDist = calculateDistance(queryVector, this.nodes[currEP].vector, this.metric);

    // 1. Duyệt nhanh qua các layer cao
    for (let l = this.maxLayer; l > 0; l--) {
      let changed = true;
      while (changed) {
        changed = false;
        const neighbors = this.nodes[currEP].layers[l];
        for (const neighborId of neighbors) {
          const d = calculateDistance(queryVector, this.nodes[neighborId].vector, this.metric);
          if (d < currDist) {
            currDist = d;
            currEP = neighborId;
            changed = true;
          }
        }
      }
    }

    // 2. Tìm kiếm chi tiết ở layer 0 với kích thước hàng đợi efSearch
    const candidates = [{ id: currEP, distance: currDist }];
    const nearestPoints = this.searchLayer(queryVector, candidates, Math.max(efSearch, k), 0);

    return nearestPoints.slice(0, k).map((r) => ({
      id: r.id,
      vector: this.nodes[r.id].vector,
      metadata: this.nodes[r.id].metadata,
      distance: r.distance,
    }));
  }
}

/**
 * 3.4 Product Quantization (PQ) - Lượng tử hóa tích nén Vector
 */
export class ProductQuantization {
  /**
   * @param {number} m - Số lượng subspaces phân đoạn vector gốc
   * @param {number} kCentroids - Số lượng centroids lượng tử hóa trong mỗi subspace (ví dụ 16 hoặc 256)
   * @param {string} metric - Độ đo khoảng cách
   */
  constructor(m = 4, kCentroids = 16, metric = 'euclidean') {
    this.m = m;
    this.kCentroids = kCentroids;
    this.metric = metric;
    this.codebooks = []; // m mảng chứa codebook (mỗi codebook chứa kCentroids vectors con)
    this.dimension = 0;
    this.subDimension = 0;
    this.database = []; // Lưu trữ các vector đã nén: { id, code: [m bytes], metadata }
  }

  clear() {
    this.codebooks = [];
    this.database = [];
  }

  /**
   * Chia nhỏ không gian và huấn luyện mã hóa (train PQ)
   * @param {Array<Array<number>>} trainingVectors - Tập vector huấn luyện
   */
  train(trainingVectors) {
    if (trainingVectors.length === 0) return;
    this.dimension = trainingVectors[0].length;
    this.subDimension = this.dimension / this.m;

    if (this.dimension % this.m !== 0) {
      throw new Error(`Độ dài vector (${this.dimension}) phải chia hết cho số lượng segment m (${this.m})!`);
    }

    this.codebooks = [];

    // Huấn luyện K-means cho từng subspace
    for (let s = 0; s < this.m; s++) {
      const subVectors = trainingVectors.map((v) => v.slice(s * this.subDimension, (s + 1) * this.subDimension));

      const { centroids } = kMeans(subVectors, this.kCentroids, this.metric);
      this.codebooks.push(centroids);
    }
  }

  /**
   * Nén một vector sang dạng mã hóa các bytes (mã hóa chỉ số centroid con)
   */
  compress(vector) {
    const code = new Uint8Array(this.m);

    for (let s = 0; s < this.m; s++) {
      const subVec = vector.slice(s * this.subDimension, (s + 1) * this.subDimension);
      const codebook = this.codebooks[s];

      let minDist = Infinity;
      let closestIdx = 0;

      for (let c = 0; c < codebook.length; c++) {
        const d = calculateDistance(subVec, codebook[c], this.metric);
        if (d < minDist) {
          minDist = d;
          closestIdx = c;
        }
      }
      code[s] = closestIdx;
    }

    return code;
  }

  insert(id, vector, metadata = {}) {
    if (this.codebooks.length === 0) {
      throw new Error('Chưa huấn luyện (train) Product Quantization trước khi insert!');
    }
    const code = this.compress(vector);
    this.database.push({ id, code, metadata });
  }

  /**
   * Tìm kiếm xấp xỉ không đối xứng (Asymmetric Distance Computation - ADC)
   * Tính khoảng cách từ query vector (không nén) sang các vector nén trong CSDL.
   */
  search(queryVector, k) {
    if (this.database.length === 0) return [];

    // 1. Tạo bảng tra cứu khoảng cách (Look-up Table - LUT)
    // lut[s][c]: khoảng cách từ segment s của query sang centroid c trong subspace s
    const lut = Array.from({ length: this.m }, () => new Float32Array(this.kCentroids));

    for (let s = 0; s < this.m; s++) {
      const subQuery = queryVector.slice(s * this.subDimension, (s + 1) * this.subDimension);
      const codebook = this.codebooks[s];

      for (let c = 0; c < codebook.length; c++) {
        lut[s][c] = calculateDistance(subQuery, codebook[c], this.metric);
      }
    }

    // 2. Tính khoảng cách xấp xỉ cho từng bản ghi qua phép cộng tra bảng (không tốn phép nhân)
    const results = this.database.map((record) => {
      let approxDist = 0;
      for (let s = 0; s < this.m; s++) {
        const centroidIdx = record.code[s];
        approxDist += lut[s][centroidIdx]; // Tra bảng nhanh
      }
      return { record, distance: approxDist };
    });

    results.sort((a, b) => a.distance - b.distance);

    return results.slice(0, k).map((r) => ({
      id: r.record.id,
      metadata: r.record.metadata,
      distance: r.distance,
      compressedCode: Array.from(r.record.code), // Trả về mã nén để trực quan hóa
    }));
  }
}
