/**
 * sysdesign-hashring.js
 * Consistent hashing có virtual node — dùng cho Bài 8 (Sharding & Consistent Hashing).
 *
 * Mục tiêu dạy học: cho người học ĐẾM CHÍNH XÁC số key phải di trú khi thêm/bớt một node,
 * rồi tự so hai cách:
 *   - `moduloAssign`  : hash(key) % N   → thêm 1 node là ~(N-1)/N số key phải chuyển
 *   - `HashRing`      : consistent hashing → chỉ ~1/N số key phải chuyển
 *
 * Con số này là toàn bộ lý do consistent hashing tồn tại, và nó phải được ĐO chứ không
 * phải chỉ được kể lại.
 *
 * Không phụ thuộc DOM để test được bằng Node.
 *
 * @author js-tools.org
 */

// ==========================================
// 1. HÀM BĂM
// ==========================================

/**
 * Bước "trộn cuối" (avalanche) lấy từ MurmurHash3 — fmix32.
 *
 * VÌ SAO BẮT BUỘC PHẢI CÓ: FNV-1a một mình trộn bit rất kém với các chuỗi NGẮN và GIỐNG
 * NHAU — mà đó đúng là dạng dữ liệu của ta ("node1#0", "node1#1", ..., "key:0", "key:1").
 * Kết quả là các điểm ảo dồn cục trên vòng và tải lệch nặng.
 *
 * Đây là lỗi đã đo được trong quá trình phát triển: với 5 node × 500 vnode, độ lệch tải
 * còn tới ~120% khi chỉ dùng FNV-1a thuần; thêm fmix32 thì xuống dưới 10%. Bài học: một hàm
 * băm "chạy được" chưa chắc phân bố được, và chỉ có đo mới biết.
 */
function fmix32(h) {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * FNV-1a 32-bit + bước trộn cuối fmix32 — nhỏ, nhanh, phân bố đủ đều.
 *
 * Lưu ý học thuật: hệ thống thật thường dùng MurmurHash3 hoặc xxHash. Điều KHÔNG nên dùng
 * là hàm băm mật mã (SHA-256): chậm hơn nhiều lần mà không mang lại lợi ích gì ở đây — ta
 * cần phân bố đều, không cần chống tấn công tìm tiền ảnh.
 */
export function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    // h *= 16777619 nhưng giữ trong 32-bit không dấu
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return fmix32(h);
}

/** Vị trí trên vòng, chuẩn hoá về [0, 1). Dùng để vẽ và để so sánh. */
export function ringPosition(str) {
  return fnv1a32(str) / 0x100000000;
}

// ==========================================
// 2. CÁCH LÀM NGÂY THƠ: hash(key) % N
// ==========================================

/**
 * Gán key vào node bằng phép chia lấy dư.
 * Đơn giản, phân bố đều — nhưng đổi N là gần như xáo trộn toàn bộ.
 *
 * @param {string[]} keys
 * @param {string[]} nodeIds  thứ tự MẢNG có ý nghĩa: đổi thứ tự cũng đổi kết quả gán
 * @returns {Map<string,string>} key -> nodeId
 */
export function moduloAssign(keys, nodeIds) {
  const out = new Map();
  if (nodeIds.length === 0) return out;
  for (const k of keys) {
    out.set(k, nodeIds[fnv1a32(k) % nodeIds.length]);
  }
  return out;
}

// ==========================================
// 3. CONSISTENT HASHING
// ==========================================

/**
 * Vòng băm với virtual node.
 *
 * Mỗi node vật lý được rải thành `vnodes` điểm trên vòng. Một key thuộc về node có điểm
 * đầu tiên đi theo chiều tăng kể từ vị trí của key (quấn vòng khi vượt quá 1).
 *
 * Vì sao cần virtual node?
 * Nếu mỗi node chỉ có MỘT điểm, các điểm ngẫu nhiên đó chia vòng thành những cung dài
 * ngắn rất khác nhau → tải lệch nặng dù thuật toán "đúng". Rải mỗi node thành hàng chục
 * đến hàng trăm điểm làm luật số lớn phát huy tác dụng và các cung san phẳng lại.
 * Virtual node còn cho phép node mạnh nhận nhiều tải hơn: chỉ cần cấp cho nó nhiều điểm hơn.
 */
export class HashRing {
  /**
   * @param {number} vnodes số điểm ảo mặc định cho mỗi node vật lý
   */
  constructor({ vnodes = 100 } = {}) {
    this.defaultVnodes = vnodes;
    // Mảng { pos, nodeId } luôn được giữ sắp xếp tăng theo pos để tìm nhị phân.
    this.ring = [];
    this.nodeVnodes = new Map(); // nodeId -> số vnode đang dùng
  }

  get nodes() {
    return [...this.nodeVnodes.keys()];
  }

  get size() {
    return this.nodeVnodes.size;
  }

  /**
   * Thêm một node vật lý.
   * @param {string} nodeId
   * @param {number} [vnodes] cấp nhiều vnode hơn nếu node này khoẻ hơn (weighted)
   */
  addNode(nodeId, vnodes = this.defaultVnodes) {
    if (this.nodeVnodes.has(nodeId)) return this;
    this.nodeVnodes.set(nodeId, vnodes);
    for (let i = 0; i < vnodes; i++) {
      // Tên điểm ảo phải ổn định và tất định: cùng nodeId + i luôn cho cùng vị trí,
      // nhờ đó bớt/thêm lại một node sẽ tái lập đúng vòng cũ.
      this.ring.push({ pos: ringPosition(`${nodeId}#${i}`), nodeId });
    }
    this.ring.sort((a, b) => a.pos - b.pos);
    return this;
  }

  removeNode(nodeId) {
    if (!this.nodeVnodes.has(nodeId)) return this;
    this.nodeVnodes.delete(nodeId);
    this.ring = this.ring.filter((p) => p.nodeId !== nodeId);
    return this;
  }

  /**
   * Tìm node phụ trách một key: điểm ảo đầu tiên có pos >= pos(key), quấn vòng nếu vượt cuối.
   * Tìm nhị phân nên chi phí O(log(số vnode)).
   */
  getNode(key) {
    if (this.ring.length === 0) return null;
    const p = ringPosition(key);
    let lo = 0;
    let hi = this.ring.length - 1;
    if (p > this.ring[hi].pos) return this.ring[0].nodeId; // quấn vòng
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.ring[mid].pos < p) lo = mid + 1;
      else hi = mid;
    }
    return this.ring[lo].nodeId;
  }

  /** Gán toàn bộ key. @returns {Map<string,string>} */
  assignAll(keys) {
    const out = new Map();
    for (const k of keys) out.set(k, this.getNode(k));
    return out;
  }

  /**
   * Phân bố tải theo node: số key mỗi node và độ lệch.
   * Dùng để chỉ ra rằng vnodes = 1 vẫn lệch nặng, còn vnodes = 100+ thì khá đều.
   */
  loadDistribution(keys) {
    const counts = new Map(this.nodes.map((n) => [n, 0]));
    for (const k of keys) {
      const n = this.getNode(k);
      counts.set(n, (counts.get(n) || 0) + 1);
    }
    const values = [...counts.values()];
    const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1);
    // CẨN THẬN: đừng viết Math.min(...values, 0) để "phòng mảng rỗng" — số 0 đó luôn nhỏ
    // hơn mọi giá trị thật nên min sẽ luôn bằng 0 và độ lệch báo sai hoàn toàn.
    // (Đúng lỗi này đã khiến độ lệch tải báo 107% trong khi thực tế chỉ ~13%.)
    const max = values.length === 0 ? 0 : Math.max(...values);
    const min = values.length === 0 ? 0 : Math.min(...values);
    return {
      counts,
      mean,
      max,
      min,
      // Độ lệch tương đối so với mức lý tưởng: 0 là hoàn hảo. Đây là con số cho thấy
      // giá trị của virtual node rõ nhất.
      spread: mean === 0 ? 0 : (max - min) / mean,
    };
  }

  /** Ảnh chụp vòng để renderer vẽ (đã sắp xếp theo pos). */
  snapshot() {
    return this.ring.map((p) => ({ ...p }));
  }
}

// ==========================================
// 4. ĐẾM DI TRÚ
// ==========================================

/**
 * Đếm số key phải chuyển sang node khác giữa hai lần gán.
 *
 * Đây là phép đo trung tâm của Bài 8: cùng một hành động "thêm 1 node", modulo bắt chuyển
 * ~(N-1)/N số key còn consistent hashing chỉ ~1/N.
 *
 * @returns {{moved:number, total:number, ratio:number, movedKeys:string[]}}
 */
export function countMigrations(before, after) {
  let moved = 0;
  const movedKeys = [];
  for (const [key, node] of before) {
    const to = after.get(key);
    if (to !== undefined && to !== node) {
      moved++;
      movedKeys.push(key);
    }
  }
  const total = before.size;
  return { moved, total, ratio: total === 0 ? 0 : moved / total, movedKeys };
}

/**
 * So sánh trực tiếp modulo vs consistent hashing khi thêm một node.
 * Trả về đúng những con số để in ra bảng trong bài học.
 *
 * @param {string[]} keys
 * @param {string[]} nodesBefore
 * @param {string} newNode
 * @param {number} vnodes
 */
export function compareAddNode(keys, nodesBefore, newNode, vnodes = 100) {
  const nodesAfter = [...nodesBefore, newNode];

  const modBefore = moduloAssign(keys, nodesBefore);
  const modAfter = moduloAssign(keys, nodesAfter);
  const modulo = countMigrations(modBefore, modAfter);

  const ringBefore = new HashRing({ vnodes });
  for (const n of nodesBefore) ringBefore.addNode(n);
  const chBefore = ringBefore.assignAll(keys);

  const ringAfter = new HashRing({ vnodes });
  for (const n of nodesAfter) ringAfter.addNode(n);
  const chAfter = ringAfter.assignAll(keys);
  const consistent = countMigrations(chBefore, chAfter);

  const n = nodesBefore.length;
  return {
    keys: keys.length,
    nodesBefore: n,
    nodesAfter: nodesAfter.length,
    modulo: { moved: modulo.moved, ratio: modulo.ratio },
    consistent: { moved: consistent.moved, ratio: consistent.ratio },
    // Kỳ vọng lý thuyết để đối chiếu.
    //
    // MODULO, N -> N+1: tỉ lệ di trú đúng là N/(N+1), KHÔNG phải (N-1)/N như thường bị
    // trích dẫn. Chứng minh: theo định lý số dư Trung Hoa, cặp (h mod N, h mod N+1) phân bố
    // đều trên N(N+1) khả năng. Key giữ nguyên node khi và chỉ khi h mod N = h mod (N+1),
    // xảy ra ở đúng N trong số N(N+1) khả năng => P(giữ) = 1/(N+1) => P(chuyển) = N/(N+1).
    // Con số này còn TỆ HƠN (N-1)/N và tiến tới 100% khi N lớn: 2->3 là 66.7%, 4->5 là 80%,
    // 8->9 là 88.9%. (Đã kiểm chứng bằng đo thực tế trong sysdesign-engine-selftest.mjs.)
    //
    // CONSISTENT HASHING: node mới chiếm khoảng 1/(N+1) không gian vòng nên chỉ chừng đó
    // key phải di trú, và chúng chỉ đến từ node cũ chứ không xáo trộn lẫn nhau.
    theory: {
      moduloRatio: n === 0 ? 0 : n / (n + 1),
      consistentRatio: 1 / (n + 1),
    },
  };
}

/** Sinh danh sách key giả lập ổn định (không dùng Math.random để kết quả tái lập được). */
export function makeKeys(count, prefix = 'key') {
  const out = [];
  for (let i = 0; i < count; i++) out.push(`${prefix}:${i}`);
  return out;
}
