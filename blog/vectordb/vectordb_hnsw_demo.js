/**
 * vectordb_hnsw_demo.js
 * Mã nguồn thực hành Bài 6: Chỉ mục Đồ thị HNSW
 *
 * Hướng dẫn chạy:
 *   node vectordb_hnsw_demo.js
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
// 1. CẤU TRÚC ĐỒ THỊ PHÂN TẦNG HNSW (MÔ PHỎNG TỐI GIẢN)
// ====================================================

class HNSWNode {
  constructor(id, vector, maxLayers) {
    this.id = id;
    this.vector = vector;
    // Mảng chứa các tập hợp láng giềng tại mỗi lớp (0 đến maxLayers - 1)
    this.neighbors = Array.from({ length: maxLayers }, () => new Set());
  }
}

class SimpleHNSW {
  constructor(dimension = 2, M = 4, efConstruction = 10, efSearch = 10) {
    this.dimension = dimension;
    this.M = M; // Số kết nối tối đa mỗi node trên mỗi tầng
    this.efConstruction = efConstruction;
    this.efSearch = efSearch;
    this.maxLayers = 4; // Tối đa 4 tầng (0: Đáy, 3: Đỉnh thưa thớt)

    this.nodes = new Map(); // ID -> HNSWNode
    this.enterNode = null; // Node điểm vào (ở tầng cao nhất)
    this.enterLayer = 0; // Tầng cao nhất hiện tại có chứa node
  }

  // Thuật toán duyệt tìm kiếm cục bộ (Greedy Search) trên 1 tầng đồ thị
  searchLayer(queryVector, enterNodes, ef, layer) {
    const visited = new Set(enterNodes.map((n) => n.id));
    const candidates = [...enterNodes].map((node) => ({
      node,
      dist: squaredEuclidean(queryVector, node.vector),
    }));
    candidates.sort((a, b) => a.dist - b.dist);

    const vResults = [...candidates]; // Kết quả lân cận tìm thấy

    while (candidates.length > 0) {
      // Lấy ứng viên có khoảng cách nhỏ nhất hiện tại
      const current = candidates.shift();

      // Duyệt qua các láng giềng của node hiện tại ở tầng 'layer'
      const neighbors = current.node.neighbors[layer];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          const neighborNode = this.nodes.get(neighborId);
          const dist = squaredEuclidean(queryVector, neighborNode.vector);

          // Nếu láng giềng gần hơn node tệ nhất trong vResults, hoặc chưa đủ kích thước ef
          const worstDist = vResults[vResults.length - 1]?.dist || Infinity;
          if (dist < worstDist || vResults.length < ef) {
            const newCand = { node: neighborNode, dist };

            // Chèn vào danh sách ứng viên (sắp xếp tăng dần theo dist)
            candidates.push(newCand);
            candidates.sort((a, b) => a.dist - b.dist);

            // Cập nhật kết quả lân cận
            vResults.push(newCand);
            vResults.sort((a, b) => a.dist - b.dist);

            if (vResults.length > ef) {
              vResults.pop(); // Giữ đúng kích thước hàng đợi ef
            }
          }
        }
      }
    }
    return vResults;
  }

  // Chèn node mới vào đồ thị HNSW phân tầng
  insert(id, vector) {
    const maxLayerForNode = this.getRandomLayer();
    const newNode = new HNSWNode(id, vector, this.maxLayers);
    this.nodes.set(id, newNode);

    if (!this.enterNode) {
      // Đồ thị trống, đặt làm điểm vào đầu tiên
      this.enterNode = newNode;
      this.enterLayer = maxLayerForNode;
      return;
    }

    let currEnter = [this.enterNode];

    // Tầng cao: Duyệt tìm kiếm tham lam từ enterLayer xuống tầng chèn của node
    for (let l = this.enterLayer; l > maxLayerForNode; l--) {
      const results = this.searchLayer(vector, currEnter, 1, l);
      currEnter = [results[0].node];
    }

    // Tầng liên kết: Chèn và nối láng giềng từ maxLayerForNode xuống Layer 0
    const startLayer = Math.min(this.enterLayer, maxLayerForNode);
    for (let l = startLayer; l >= 0; l--) {
      const results = this.searchLayer(vector, currEnter, this.efConstruction, l);
      currEnter = results.map((r) => r.node);

      // Kết nối hai chiều với M láng giềng gần nhất
      const neighborsToConnect = results.slice(0, this.M).map((r) => r.node);
      neighborsToConnect.forEach((neighbor) => {
        newNode.neighbors[l].add(neighbor.id);
        neighbor.neighbors[l].add(newNode.id);

        // Thu gọn liên kết của láng giềng nếu vượt quá M (Heuristic selection đơn giản)
        if (neighbor.neighbors[l].size > this.M) {
          const list = Array.from(neighbor.neighbors[l]).map((nId) => ({
            id: nId,
            dist: squaredEuclidean(neighbor.vector, this.nodes.get(nId).vector),
          }));
          list.sort((a, b) => a.dist - b.dist);
          neighbor.neighbors[l] = new Set(list.slice(0, this.M).map((x) => x.id));
        }
      });
    }

    // Cập nhật điểm vào nếu node này leo lên tầng cao hơn điểm vào cũ
    if (maxLayerForNode > this.enterLayer) {
      this.enterNode = newNode;
      this.enterLayer = maxLayerForNode;
    }
  }

  // Định tuyến tìm kiếm phân tầng (Query Pipeline)
  search(queryVector, k) {
    if (!this.enterNode) return [];

    let currEnter = [this.enterNode];
    // 1. Duyệt tham lam nhanh qua các tầng cao (chỉ lấy 1 điểm tốt nhất làm enter point tiếp theo)
    for (let l = this.enterLayer; l > 0; l--) {
      const results = this.searchLayer(queryVector, currEnter, 1, l);
      currEnter = [results[0].node];
    }

    // 2. Tìm kiếm kỹ lưỡng trên Layer 0 bằng efSearch
    const finalResults = this.searchLayer(queryVector, currEnter, this.efSearch, 0);
    return finalResults.slice(0, k).map((r) => ({
      id: r.node.id,
      distance: Math.sqrt(r.dist),
    }));
  }

  // Hàm sinh ngẫu nhiên tầng cho node mới theo phân phối hình học
  getRandomLayer() {
    let layer = 0;
    // Tỷ lệ giảm dần tầng: mỗi lần nhân đôi khả năng ở lại tầng cũ
    while (Math.random() < 0.5 && layer < this.maxLayers - 1) {
      layer++;
    }
    return layer;
  }
}

// === CHẠY THỬ NGHIỆM THỰC HÀNH ===

function run() {
  console.log('=== BẮT ĐẦU THỬ NGHIỆM CHỈ MỤC ĐỒ THỊ HNSW ===');
  const hnsw = new SimpleHNSW(2, 3, 10, 10); // M=3, 2 chiều

  // 1. Khởi tạo 10 nodes dữ liệu 2D
  const data = [
    { id: 'node_A', vec: [1, 2] },
    { id: 'node_B', vec: [2, 3] },
    { id: 'node_C', vec: [8, 9] },
    { id: 'node_D', vec: [9, 8] },
    { id: 'node_E', vec: [2, 2.5] },
    { id: 'node_F', vec: [8.5, 8.5] },
  ];

  data.forEach((d) => {
    hnsw.insert(d.id, d.vec);
  });
  console.log(`Đã chèn thành công ${hnsw.nodes.size} nodes vào đồ thị HNSW.`);
  console.log(`Điểm vào (Enter node) hiện tại: ${hnsw.enterNode.id} ở Layer: ${hnsw.enterLayer}`);

  // In các liên kết tại Layer 0 để kiểm chứng tính cục bộ
  console.log('\nCấu trúc liên kết láng giềng tại Layer 0 (Đáy dày đặc):');
  hnsw.nodes.forEach((node) => {
    console.log(`  Node [${node.id}] liên kết với:`, Array.from(node.neighbors[0]));
  });

  // 2. Chạy thử truy vấn
  const query = [8.2, 8.8];
  console.log(`\n--- TRUY VẤN K-NN VỚI VECTOR ${JSON.stringify(query)} ---`);
  const matches = hnsw.search(query, 2);
  matches.forEach((m, idx) => {
    console.log(`  ${idx + 1}. [ID: ${m.id}] Khoảng cách: ${m.distance.toFixed(4)}`);
  });
}

run();
