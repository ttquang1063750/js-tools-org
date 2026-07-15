/**
 * circuit-analyzer.js
 * Lớp phân tích đồ thị kết nối linh kiện (Netlist Graph Analyzer)
 * Giúp lập trình viên hiểu cách chuyển đổi sơ đồ nguyên lý dạng hình ảnh
 * thành cấu trúc dữ liệu đồ thị có hướng (Directed Graph) trong bộ nhớ.
 */

class CircuitAnalyzer {
  constructor() {
    this.adjacencyList = new Map();
    this.components = new Map();
  }

  // Thêm linh kiện vào sơ đồ
  addComponent(id, type, value) {
    this.components.set(id, { id, type, value });
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
  }

  // Thêm đường nối (Net/Wire) giữa hai linh kiện
  addConnection(fromId, toId, signalType = 'power') {
    if (!this.adjacencyList.has(fromId)) this.addComponent(fromId, 'unknown', '');
    if (!this.adjacencyList.has(toId)) this.addComponent(toId, 'unknown', '');

    this.adjacencyList.get(fromId).push({ to: toId, type: signalType });
  }

  // Dò tìm đường đi của dòng điện hoặc tín hiệu (Path Finding)
  traceFlow(startId, targetId, visited = new Set(), path = []) {
    visited.add(startId);
    path.push(startId);

    if (startId === targetId) {
      return [path];
    }

    let paths = [];
    const neighbors = this.adjacencyList.get(startId) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        let newPaths = this.traceFlow(edge.to, targetId, new Set(visited), [...path]);
        for (const p of newPaths) {
          paths.push(p);
        }
      }
    }
    return paths;
  }

  // Xuất báo cáo cấu trúc mạch
  printSummary() {
    console.log('=== SƠ ĐỒ KẾT NỐI BO MẠCH (NETLIST GRAPH) ===');
    for (const [compId, comp] of this.components.entries()) {
      console.log(`Linh kiện: [${comp.id}] (${comp.type}) - Giá trị: ${comp.value}`);
      const connections = this.adjacencyList.get(compId) || [];
      connections.forEach((conn) => {
        const target = this.components.get(conn.to);
        console.log(`  └─► Kết nối sang: [${target.id}] via đường [${conn.type}]`);
      });
    }
  }
}

// Khởi tạo mô phỏng mạch nguồn tuyến tính LM7805
const analyzer = new CircuitAnalyzer();

// 1. Khai báo các linh kiện (Nodes)
analyzer.addComponent('T1', 'Transformer', '220VAC/12VAC');
analyzer.addComponent('F1', 'Fuse', '2A');
analyzer.addComponent('D_Bridge', 'DiodeBridge', '1N4007 x4');
analyzer.addComponent('C1', 'Capacitor', '2200uF/25V');
analyzer.addComponent('U1', 'VoltageRegulator', 'LM7805');
analyzer.addComponent('C2', 'Capacitor', '100uF/16V');
analyzer.addComponent('Load', 'SystemLoad', 'Microcontroller System');

// 2. Thiết lập kết nối (Edges)
analyzer.addConnection('T1', 'F1', 'power_ac');
analyzer.addConnection('F1', 'D_Bridge', 'power_ac');
analyzer.addConnection('D_Bridge', 'C1', 'power_dc_unregulated');
analyzer.addConnection('C1', 'U1', 'power_dc_unregulated');
analyzer.addConnection('U1', 'C2', 'power_dc_regulated');
analyzer.addConnection('C2', 'Load', 'power_dc_regulated');

// 3. Hiển thị sơ đồ
analyzer.printSummary();

// 4. Dò vết dòng chảy năng lượng từ nguồn cấp T1 đến tải hệ thống Load
console.log('\n=== DÒ VẾT DÒNG CHẢY NĂNG LƯỢNG (POWER FLOW TRACE) ===');
const flowPaths = analyzer.traceFlow('T1', 'Load');
flowPaths.forEach((p, idx) => {
  console.log(`Đường dẫn #${idx + 1}: ${p.join(' ──► ')}`);
});
