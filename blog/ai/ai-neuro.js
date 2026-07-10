// ai-neuro.js — "NeuroJS": tensor engine mini dùng chung cho Series 12
// Khởi sinh ở Bài 5 (tensor); Bài 7 thêm AUTOGRAD; Bài 9 thêm OPTIMIZER; Bài
// 10 thêm SOFTMAX+CROSS-ENTROPY (mục này); mở rộng tiếp ở Bài 11 (Conv2D),
// Bài 14 (attention). Import trực tiếp từ các bài sau, KHÔNG copy-paste lại
// logic (tiền lệ vlsi-verilite.js Series 11).
//
// Cách chạy self-test (không cần cài gì ngoài Node.js):
//   node ai-neuro.js
// Kỳ vọng in ra: "SELF-TEST PASS (61 checks)" — 56 check regression của Bài
// 5+7+9 (KHÔNG được đổi hành vi) cộng gradient checking cho softmax+cross-
// entropy — xem Bài 10 bài viết cho chi tiết từng con số.

// ---------------------------------------------------------------------------
// Tensor: dữ liệu phẳng (Float32Array) + shape + strides (row-major).
// KHÔNG có khái niệm "mảng lồng nhau" bên trong — mọi phần tử nằm trên MỘT
// buffer liên tục, shape/stride chỉ là cách "đọc" buffer đó theo nhiều chiều.
// ---------------------------------------------------------------------------
class Tensor {
  constructor(data, shape, strides, offset) {
    this.data = data instanceof Float32Array ? data : Float32Array.from(data);
    this.shape = shape.slice();
    this.strides = strides ? strides.slice() : Tensor.computeStrides(shape);
    this.offset = offset || 0;
    // --- Autograd (Bài 7): mọi tensor mang sẵn 3 trường này, nhưng KHÔNG
    // đụng gì tới forward-value — mọi hành vi Bài 5 (shape/stride/broadcast/
    // matmul) giữ nguyên 100%, đây thuần là bổ sung cộng thêm.
    this.grad = null; // Float32Array cùng kích thước, cấp phát lazily
    this._backward = () => {}; // closure "1 bước lùi": dùng out.grad để cộng dồn vào grad của input
    this._prev = []; // các tensor input đã tạo ra tensor này (để dò thứ tự topo)
  }

  _ensureGrad() {
    if (!this.grad) this.grad = new Float32Array(this.size);
  }
  // PHẢI gọi trước mỗi vòng lặp huấn luyện mới — xem cạm bẫy Mục 3 bài viết:
  // gradient CỘNG DỒN qua các lần backward(), không tự động reset về 0.
  zeroGrad() {
    this.grad = new Float32Array(this.size);
  }

  // Duyệt topo (DFS) rồi lùi ngược đúng thứ tự đó — công thức lõi backprop:
  // gradient tại 1 nút = local gradient (đạo hàm phép toán tạo ra nó) NHÂN
  // upstream gradient (đã tích luỹ từ mọi nút dùng nó ở phía sau).
  backward() {
    const topo = [];
    const visited = new Set();
    const build = (t) => {
      if (visited.has(t)) return;
      visited.add(t);
      for (const p of t._prev) build(p);
      topo.push(t);
    };
    build(this);
    this._ensureGrad();
    this.grad.fill(1); // chỉ gọi backward() trên tensor VÔ HƯỚNG (loss) — seed = 1
    for (let i = topo.length - 1; i >= 0; i--) topo[i]._backward();
  }

  // Stride row-major: stride[cuối] = 1, stride[i] = stride[i+1] * shape[i+1].
  // Vd shape (2,3) -> strides (3,1); shape (2,3,4) -> strides (12,4,1).
  static computeStrides(shape) {
    const strides = new Array(shape.length);
    let acc = 1;
    for (let i = shape.length - 1; i >= 0; i--) {
      strides[i] = acc;
      acc *= shape[i];
    }
    return strides;
  }

  static zeros(shape) {
    const size = shape.reduce((a, b) => a * b, 1);
    return new Tensor(new Float32Array(size), shape);
  }

  // Dựng Tensor từ mảng lồng nhau kiểu [[1,2,3],[4,5,6]] — chỉ dùng lúc TẠO,
  // bên trong luôn lưu phẳng.
  static fromNested(nested) {
    const shape = [];
    let cur = nested;
    while (Array.isArray(cur)) {
      shape.push(cur.length);
      cur = cur[0];
    }
    const flat = [];
    (function flatten(x) {
      if (Array.isArray(x)) x.forEach(flatten);
      else flat.push(x);
    })(nested);
    return new Tensor(flat, shape.length ? shape : [flat.length]);
  }

  get size() {
    return this.shape.reduce((a, b) => a * b, 1);
  }
  get ndim() {
    return this.shape.length;
  }

  _flatIndex(idx) {
    let f = this.offset;
    for (let i = 0; i < idx.length; i++) f += idx[i] * this.strides[i];
    return f;
  }
  get(...idx) {
    return this.data[this._flatIndex(idx)];
  }
  set(...args) {
    const val = args.pop();
    this.data[this._flatIndex(args)] = val;
    return this;
  }

  // Contiguous = layout của buffer khớp ĐÚNG row-major mặc định cho shape hiện
  // tại (không phải view đã bị transpose/permute). Nhiều phép (reshape) BẮT
  // BUỘC dữ liệu contiguous vì chúng diễn giải buffer như một dải số liên tục.
  get isContiguous() {
    const expected = Tensor.computeStrides(this.shape);
    return this.offset === 0 && this.strides.every((s, i) => s === expected[i]);
  }

  // Transpose = VIEW — chỉ hoán đổi thứ tự shape/strides, KHÔNG đụng vào
  // buffer dữ liệu. O(1) bất kể tensor lớn cỡ nào (đối lập .contiguous() bên
  // dưới, luôn O(n)). Mặc định (không truyền perm) đảo ngược toàn bộ chiều.
  transpose(perm) {
    const p = perm || this.shape.map((_, i) => i).reverse();
    return new Tensor(
      this.data,
      p.map((i) => this.shape[i]),
      p.map((i) => this.strides[i]),
      this.offset
    );
  }

  // Materialize: sao chép dữ liệu về đúng layout row-major liên tục — cần
  // thiết trước reshape hoặc trước mọi phép giả định bộ nhớ liên tục (vd
  // matmul tối ưu ở dưới). Là bản O(n) THẬT SỰ, khác hẳn transpose() O(1).
  contiguous() {
    if (this.isContiguous) return this;
    const out = Tensor.zeros(this.shape);
    const idx = new Array(this.ndim).fill(0);
    const total = this.size;
    for (let n = 0; n < total; n++) {
      out.data[n] = this.data[this._flatIndex(idx)];
      for (let d = this.ndim - 1; d >= 0; d--) {
        idx[d]++;
        if (idx[d] < this.shape[d]) break;
        idx[d] = 0;
      }
    }
    return out;
  }

  reshape(newShape) {
    if (!this.isContiguous) {
      throw new Error('reshape() yêu cầu tensor CONTIGUOUS — gọi .contiguous() trước (xem Mục 2 bài viết)');
    }
    const size = newShape.reduce((a, b) => a * b, 1);
    if (size !== this.size) throw new Error('reshape: số phần tử không khớp shape mới');
    return new Tensor(this.data.slice(this.offset, this.offset + this.size), newShape);
  }

  // Chuyển về mảng lồng nhau — chỉ dùng để in/debug, không dùng trong hot path.
  toNested() {
    if (this.ndim === 0) return this.get();
    if (this.ndim === 1) return Array.from({ length: this.shape[0] }, (_, i) => this.get(i));
    const build = (prefix, dim) => {
      const out = [];
      for (let i = 0; i < this.shape[dim]; i++) {
        const idx = [...prefix, i];
        out.push(dim === this.ndim - 1 ? this.get(...idx) : build(idx, dim + 1));
      }
      return out;
    };
    return build([], 0);
  }
}

// ---------------------------------------------------------------------------
// Broadcasting — quy tắc căn PHẢI (right-align) giống hệt NumPy/PyTorch:
// so 2 shape từ chiều CUỐI về đầu; 2 chiều tương thích nếu bằng nhau hoặc một
// trong hai bằng 1 (chiều 1 sẽ "nhân bản" để khớp); chiều thiếu ở đầu coi như 1.
// KHÔNG BAO GIỜ báo lỗi khi 2 chiều khác nhau và không có chiều nào bằng 1 —
// đây là cạm bẫy Mục 3 bài viết.
// ---------------------------------------------------------------------------
function broadcastShapes(shapeA, shapeB) {
  const nd = Math.max(shapeA.length, shapeB.length);
  const a = new Array(nd - shapeA.length).fill(1).concat(shapeA);
  const b = new Array(nd - shapeB.length).fill(1).concat(shapeB);
  const out = new Array(nd);
  for (let i = 0; i < nd; i++) {
    if (a[i] === b[i]) out[i] = a[i];
    else if (a[i] === 1) out[i] = b[i];
    else if (b[i] === 1) out[i] = a[i];
    else
      throw new Error(`Không thể broadcast shape [${shapeA}] với [${shapeB}] (lệch ở chiều ${i}: ${a[i]} vs ${b[i]})`);
  }
  return out;
}

function _broadcastIndex(idx, outShape, shape) {
  const nd = shape.length;
  const off = outShape.length - nd;
  const res = new Array(nd);
  for (let i = 0; i < nd; i++) res[i] = shape[i] === 1 ? 0 : idx[off + i];
  return res;
}

function _elementwise(a, b, fn) {
  const outShape = broadcastShapes(a.shape, b.shape);
  const out = Tensor.zeros(outShape);
  const idx = new Array(outShape.length).fill(0);
  const total = out.size;
  for (let n = 0; n < total; n++) {
    out.data[n] = fn(
      a.get(..._broadcastIndex(idx, outShape, a.shape)),
      b.get(..._broadcastIndex(idx, outShape, b.shape))
    );
    for (let d = outShape.length - 1; d >= 0; d--) {
      idx[d]++;
      if (idx[d] < outShape[d]) break;
      idx[d] = 0;
    }
  }
  return out;
}

// Backward của broadcasting: gradient đi NGƯỢC broadcast bằng cách CỘNG DỒN
// (sum) đúng những chiều đã bị "nhân bản" ở forward — nếu không cộng dồn, số
// chiều gradient không khớp lại được shape gốc của input (Bài 5 Mục 3).
function _unbroadcast(gradFlat, outShape, targetShape) {
  const result = new Float32Array(targetShape.reduce((a, b) => a * b, 1));
  const targetStrides = Tensor.computeStrides(targetShape);
  const idx = new Array(outShape.length).fill(0);
  const total = outShape.reduce((a, b) => a * b, 1);
  for (let n = 0; n < total; n++) {
    const tIdx = _broadcastIndex(idx, outShape, targetShape);
    let f = 0;
    for (let i = 0; i < tIdx.length; i++) f += tIdx[i] * targetStrides[i];
    result[f] += gradFlat[n];
    for (let d = outShape.length - 1; d >= 0; d--) {
      idx[d]++;
      if (idx[d] < outShape[d]) break;
      idx[d] = 0;
    }
  }
  return result;
}

function add(a, b) {
  const out = _elementwise(a, b, (x, y) => x + y);
  out._prev = [a, b];
  out._backward = () => {
    a._ensureGrad();
    b._ensureGrad();
    const da = _unbroadcast(out.grad, out.shape, a.shape);
    const db = _unbroadcast(out.grad, out.shape, b.shape);
    for (let i = 0; i < a.grad.length; i++) a.grad[i] += da[i];
    for (let i = 0; i < b.grad.length; i++) b.grad[i] += db[i];
  };
  return out;
}
function mul(a, b) {
  const out = _elementwise(a, b, (x, y) => x * y);
  out._prev = [a, b];
  out._backward = () => {
    a._ensureGrad();
    b._ensureGrad();
    // Local gradient cua phep nhan: d(a*b)/da = b, d(a*b)/db = a — nhan voi
    // upstream (out.grad) TRUOC khi unbroadcast ve dung shape a/b.
    const outShape = out.shape;
    const gradWrtA = new Float32Array(out.size);
    const gradWrtB = new Float32Array(out.size);
    const idx = new Array(outShape.length).fill(0);
    for (let n = 0; n < out.size; n++) {
      const ia = _broadcastIndex(idx, outShape, a.shape);
      const ib = _broadcastIndex(idx, outShape, b.shape);
      gradWrtA[n] = out.grad[n] * b.get(...ib);
      gradWrtB[n] = out.grad[n] * a.get(...ia);
      for (let d = outShape.length - 1; d >= 0; d--) {
        idx[d]++;
        if (idx[d] < outShape[d]) break;
        idx[d] = 0;
      }
    }
    const da = _unbroadcast(gradWrtA, outShape, a.shape);
    const db = _unbroadcast(gradWrtB, outShape, b.shape);
    for (let i = 0; i < a.grad.length; i++) a.grad[i] += da[i];
    for (let i = 0; i < b.grad.length; i++) b.grad[i] += db[i];
  };
  return out;
}

// relu/sigmoid: activation phi tuyến (Bài 6) nay có backward THẬT — không
// cần tự tay lan truyền ngược qua chúng như Bài 6 làm nữa.
function relu(a) {
  const out = Tensor.zeros(a.shape);
  for (let i = 0; i < a.size; i++) out.data[i] = Math.max(0, a.data[i]);
  out._prev = [a];
  out._backward = () => {
    a._ensureGrad();
    for (let i = 0; i < a.size; i++) a.grad[i] += (a.data[i] > 0 ? 1 : 0) * out.grad[i];
  };
  return out;
}
function sigmoid(a) {
  const out = Tensor.zeros(a.shape);
  for (let i = 0; i < a.size; i++) out.data[i] = 1 / (1 + Math.exp(-a.data[i]));
  out._prev = [a];
  out._backward = () => {
    a._ensureGrad();
    for (let i = 0; i < a.size; i++) {
      const s = out.data[i];
      a.grad[i] += s * (1 - s) * out.grad[i];
    }
  };
  return out;
}
// sum: gộp MỌI phần tử thành 1 vô hướng — cần để loss có shape (1,), điều
// kiện bắt buộc để gọi backward() (seed gradient = 1 chỉ có nghĩa trên scalar).
function sum(a) {
  let s = 0;
  for (let i = 0; i < a.size; i++) s += a.data[i];
  const out = new Tensor([s], [1]);
  out._prev = [a];
  out._backward = () => {
    a._ensureGrad();
    for (let i = 0; i < a.size; i++) a.grad[i] += out.grad[0];
  };
  return out;
}

// matmul — CHỈ nhận tensor 2D contiguous (đủ dùng cho Bài 5-10; batch matmul
// N-D để dành khi Bài 11/14 thật sự cần). Cài đặt duyệt vòng i-k-j và đọc/ghi
// TRỰC TIẾP trên Float32Array (không qua get()/set()) — lý do hiệu năng đo
// được trong Mục 4 bài viết (~11x so với duyệt qua get()/set() ở cùng cỡ).
function matmul(a, b) {
  if (a.ndim !== 2 || b.ndim !== 2) throw new Error('matmul: chỉ hỗ trợ tensor 2D ở giai đoạn này');
  const ca = a.isContiguous ? a : a.contiguous();
  const cb = b.isContiguous ? b : b.contiguous();
  const [m, k] = ca.shape;
  const [k2, n] = cb.shape;
  if (k !== k2) throw new Error(`matmul: shape không khớp [${ca.shape}] x [${cb.shape}]`);
  const A = ca.data,
    B = cb.data;
  const C = new Float32Array(m * n);
  for (let i = 0; i < m; i++) {
    for (let p = 0; p < k; p++) {
      const aVal = A[i * k + p];
      const bBase = p * n,
        cBase = i * n;
      for (let j = 0; j < n; j++) C[cBase + j] += aVal * B[bBase + j];
    }
  }
  const out = new Tensor(C, [m, n]);
  out._prev = [ca, cb];
  out._backward = () => {
    // dA = dOut @ B^T ; dB = A^T @ dOut (cong thuc backward chuan cua matmul,
    // suy truc tiep tu quy tac chain rule tren tung phan tu C_ij = sum_p A_ip B_pj).
    ca._ensureGrad();
    cb._ensureGrad();
    for (let i = 0; i < m; i++) {
      for (let p = 0; p < k; p++) {
        let s = 0;
        for (let j = 0; j < n; j++) s += out.grad[i * n + j] * B[p * n + j];
        ca.grad[i * k + p] += s;
      }
    }
    for (let p = 0; p < k; p++) {
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let i = 0; i < m; i++) s += A[i * k + p] * out.grad[i * n + j];
        cb.grad[p * n + j] += s;
      }
    }
  };
  return out;
}

// ---------------------------------------------------------------------------
// Optimizer (Bài 9): nhận DANH SÁCH tensor tham số (không phải object như
// demo Bài 8) — .step() đọc .grad đã có sẵn từ backward() và tự cập nhật
// .data, tổng quát cho MỌI kiến trúc. Không đụng tới computation graph nên
// KHÔNG cần gradient checking (không phải 1 op autograd) — verify bằng công
// thức tính tay từng bước thay thế (xem self-test dưới + Bài 9 Mục 6).
// ---------------------------------------------------------------------------

// SGD thuần (momentum=0) hoặc SGD+Momentum (momentum>0): v <- momentum*v + g;
// w -= lr*v. momentum=0 thì v luôn bằng g, tương đương SGD thuần từng bước.
class SGD {
  constructor(params, lr, momentum = 0, l2 = 0) {
    this.params = params;
    this.lr = lr;
    this.momentum = momentum;
    this.l2 = l2;
    this.velocity = params.map((p) => new Float32Array(p.size));
  }
  step() {
    this.params.forEach((p, idx) => {
      const v = this.velocity[idx];
      for (let i = 0; i < p.size; i++) {
        const g = p.grad[i] + this.l2 * p.data[i];
        v[i] = this.momentum * v[i] + g;
        p.data[i] -= this.lr * v[i];
      }
    });
  }
}

// RMSProp: chia learning rate cho căn trung bình động (EMA) của g² TỪNG THAM
// SỐ — tham số có gradient dao động lớn (curvature lớn) tự động nhận bước
// nhỏ hơn, tham số gradient nhỏ tự động nhận bước lớn hơn.
class RMSProp {
  constructor(params, lr, beta = 0.9, eps = 1e-8) {
    this.params = params;
    this.lr = lr;
    this.beta = beta;
    this.eps = eps;
    this.cache = params.map((p) => new Float32Array(p.size));
  }
  step() {
    this.params.forEach((p, idx) => {
      const c = this.cache[idx];
      for (let i = 0; i < p.size; i++) {
        const g = p.grad[i];
        c[i] = this.beta * c[i] + (1 - this.beta) * g * g;
        p.data[i] -= (this.lr * g) / (Math.sqrt(c[i]) + this.eps);
      }
    });
  }
}

// Adam = Momentum (m, EMA của g) + RMSProp (v, EMA của g²) + BIAS CORRECTION
// (m/(1-beta1^t), v/(1-beta2^t)) — sửa thiên lệch vì m,v khởi tạo bằng 0 nên
// những bước ĐẦU bị kéo lệch về 0 nếu không chia lại (xem Bài 9 Mục 3).
class Adam {
  constructor(params, lr = 0.001, beta1 = 0.9, beta2 = 0.999, eps = 1e-8) {
    this.params = params;
    this.lr = lr;
    this.beta1 = beta1;
    this.beta2 = beta2;
    this.eps = eps;
    this.m = params.map((p) => new Float32Array(p.size));
    this.v = params.map((p) => new Float32Array(p.size));
    this.t = 0;
  }
  step() {
    this.t++;
    const b1t = 1 - Math.pow(this.beta1, this.t);
    const b2t = 1 - Math.pow(this.beta2, this.t);
    this.params.forEach((p, idx) => {
      const m = this.m[idx],
        v = this.v[idx];
      for (let i = 0; i < p.size; i++) {
        const g = p.grad[i];
        m[i] = this.beta1 * m[i] + (1 - this.beta1) * g;
        v[i] = this.beta2 * v[i] + (1 - this.beta2) * g * g;
        const mHat = m[i] / b1t;
        const vHat = v[i] / b2t;
        p.data[i] -= (this.lr * mHat) / (Math.sqrt(vHat) + this.eps);
      }
    });
  }
}

// ---------------------------------------------------------------------------
// softmaxCrossEntropy (Bài 10): loss chuẩn cho phân loại NHIỀU lớp (MNIST
// 10 lớp). Cài GỘP softmax+cross-entropy thành 1 op nguyên khối (giống hệt
// torch.nn.functional.cross_entropy) thay vì ghép exp()/log() rời — 2 lý do:
// (1) ổn định số học — trừ max trước exp() tránh tràn số khi logits lớn;
// (2) gradient GỘP rút gọn tuyệt đẹp về đúng 1 dòng: d(loss)/d(logits) =
// (softmax(logits) - target_one_hot) / batchSize — không cần lan truyền qua
// từng phép exp/log/chia riêng lẻ.
// logits: Tensor (N, C). yOneHot: Tensor (N, C) — 1 tại đúng lớp, còn lại 0.
function softmaxCrossEntropy(logits, yOneHot) {
  const [N, C] = logits.shape;
  const probs = new Float32Array(N * C);
  let lossSum = 0;
  for (let i = 0; i < N; i++) {
    let m = -Infinity;
    for (let c = 0; c < C; c++) m = Math.max(m, logits.data[i * C + c]);
    let sumExp = 0;
    for (let c = 0; c < C; c++) sumExp += Math.exp(logits.data[i * C + c] - m);
    const logSumExp = Math.log(sumExp) + m;
    for (let c = 0; c < C; c++) probs[i * C + c] = Math.exp(logits.data[i * C + c] - logSumExp);
    for (let c = 0; c < C; c++) {
      if (yOneHot.data[i * C + c] > 0) lossSum += -(logits.data[i * C + c] - logSumExp) * yOneHot.data[i * C + c];
    }
  }
  const out = new Tensor([lossSum / N], [1]);
  out._prev = [logits];
  out._backward = () => {
    logits._ensureGrad();
    for (let n = 0; n < N * C; n++) logits.grad[n] += ((probs[n] - yOneHot.data[n]) / N) * out.grad[0];
  };
  return out;
}

export { Tensor, broadcastShapes, add, mul, matmul, relu, sigmoid, sum, SGD, RMSProp, Adam, softmaxCrossEntropy };

// ---------------------------------------------------------------------------
// Self-test — chỉ chạy khi gọi TRỰC TIẾP `node ai-neuro.js`, không chạy khi
// bài học (trình duyệt) hoặc file khác `import` thư viện này. Guard bằng
// import.meta.url; kiểm tra `typeof process` trước vì `process` không tồn
// tại trong trình duyệt — thiếu bước này làm ReferenceError ngay khi trang
// import module, hỏng toàn bộ demo (đã bắt lỗi này qua kiểm tra browser).
// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  let errors = 0;
  let checks = 0;
  function check(name, got, exp, tol = 1e-4) {
    checks++;
    if (got === null || Number.isNaN(got) || Math.abs(got - exp) > tol) {
      console.log('LOI', name, 'got=' + got, 'ky vong=' + exp);
      errors++;
    }
  }
  function checkTrue(name, cond) {
    checks++;
    if (!cond) {
      console.log('LOI', name);
      errors++;
    }
  }
  function checkDeepEqual(name, got, exp) {
    checks++;
    if (JSON.stringify(got) !== JSON.stringify(exp)) {
      console.log('LOI', name, 'got=' + JSON.stringify(got), 'ky vong=' + JSON.stringify(exp));
      errors++;
    }
  }

  // --- Construction, shape, strides, indexing ---
  const t = Tensor.fromNested([
    [1, 2, 3],
    [4, 5, 6],
  ]);
  checkDeepEqual('shape (2,3)', t.shape, [2, 3]);
  checkDeepEqual('strides (2,3) -> (3,1)', t.strides, [3, 1]);
  check('get(0,1)', t.get(0, 1), 2);
  check('get(1,2)', t.get(1, 2), 6);
  const t3 = Tensor.zeros([2, 3, 4]);
  checkDeepEqual('strides (2,3,4) -> (12,4,1)', t3.strides, [12, 4, 1]);

  // --- Transpose là VIEW: cùng buffer, strides hoán đổi, KHÔNG contiguous ---
  const tt = t.transpose();
  checkDeepEqual('transpose shape', tt.shape, [3, 2]);
  checkDeepEqual('transpose strides', tt.strides, [1, 3]);
  checkTrue('transpose dung chung buffer (view, khong copy)', tt.data === t.data);
  check('tt.get(1,0) == t.get(0,1)', tt.get(1, 0), t.get(0, 1));
  checkTrue('transpose KHONG contiguous', !tt.isContiguous);

  // --- contiguous() materialize đúng giá trị, buffer MỚI, và reshape() ---
  const ttc = tt.contiguous();
  checkTrue('sau contiguous() la buffer moi', ttc.data !== tt.data);
  checkTrue('sau contiguous() thi contiguous = true', ttc.isContiguous);
  checkDeepEqual('gia tri sau materialize dung transpose that', ttc.toNested(), [
    [1, 4],
    [2, 5],
    [3, 6],
  ]);
  checks++;
  try {
    tt.reshape([6]);
    console.log('LOI: reshape() tren tensor KHONG contiguous phai throw');
    errors++;
  } catch (e) {
    /* dung: phai throw */
  }
  checkDeepEqual('reshape sau khi contiguous() thanh cong', ttc.reshape([6]).toNested(), [1, 4, 2, 5, 3, 6]);

  // --- Broadcasting: cộng bias vào cả batch chỉ với 1 dòng ---
  const bias = Tensor.fromNested([10, 20, 30]);
  const batch = Tensor.fromNested([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
  ]);
  checkDeepEqual('batch (4,3) + bias (3,) dung', add(batch, bias).toNested(), [
    [11, 22, 33],
    [14, 25, 36],
    [17, 28, 39],
    [20, 31, 42],
  ]);

  // --- Cạm bẫy: (3,1) + (1,3) -> (3,3) KHÔNG báo lỗi (silent shape bug) ---
  const col = Tensor.fromNested([[1], [2], [3]]); // shape (3,1)
  const row = Tensor.fromNested([[10, 20, 30]]); // shape (1,3)
  const outerSum = add(col, row);
  checkDeepEqual('shape ket qua (3,1)+(1,3)', outerSum.shape, [3, 3]);
  checkDeepEqual('gia tri outer-sum (dung la BUG, khong phai (3,) nhu y dinh)', outerSum.toNested(), [
    [11, 21, 31],
    [12, 22, 32],
    [13, 23, 33],
  ]);
  // shape thực sự KHÔNG tương thích (không chiều nào = 1) phải throw
  checks++;
  try {
    broadcastShapes([4, 3], [5, 3]);
    console.log('LOI: broadcastShapes([4,3],[5,3]) phai throw vi khong the broadcast');
    errors++;
  } catch (e) {
    /* dung: phai throw */
  }

  // --- Matmul: đối chiếu tính tay + đối chiếu 1 cách hiện thực CHẬM khác ---
  const A = Tensor.fromNested([
    [1, 2],
    [3, 4],
  ]);
  const B = Tensor.fromNested([
    [5, 6],
    [7, 8],
  ]);
  checkDeepEqual('matmul 2x2 tinh tay', matmul(A, B).toNested(), [
    [19, 22],
    [43, 50],
  ]);
  // Đối chiếu ngẫu nhiên n=10 với 1 hiện thực THAM CHIẾU viết độc lập, dùng
  // get()/set() (chậm nhưng dễ tin đúng — xem Mục 4) để bắt lỗi mà ví dụ 2x2
  // tính tay có thể bỏ sót.
  function matmulReference(a, b) {
    const [m, k] = a.shape,
      [, n] = b.shape;
    const out = Tensor.zeros([m, n]);
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let p = 0; p < k; p++) s += a.get(i, p) * b.get(p, j);
        out.set(i, j, s);
      }
    return out;
  }
  const n10 = 10;
  const randA = Tensor.zeros([n10, n10]),
    randB = Tensor.zeros([n10, n10]);
  for (let i = 0; i < n10 * n10; i++) {
    randA.data[i] = Math.sin(i) * 3;
    randB.data[i] = Math.cos(i) * 2;
  }
  const refResult = matmulReference(randA, randB);
  const fastResult = matmul(randA, randB);
  let maxDiff = 0;
  for (let i = 0; i < n10 * n10; i++) maxDiff = Math.max(maxDiff, Math.abs(refResult.data[i] - fastResult.data[i]));
  checkTrue('matmul nhanh khop matmul tham chieu (n=10 ngau nhien)', maxDiff < 1e-3);

  // --- matmul() tự materialize input không contiguous (transpose view) ---
  const AT = A.transpose(); // shape (2,2) nhung KHONG contiguous
  checkDeepEqual('matmul tren input transpose (tu materialize)', matmul(AT, B).toNested(), [
    [26, 30],
    [38, 44],
  ]);

  // ===========================================================================
  // BÀI 7 — AUTOGRAD: gradient checking (đối chiếu autograd với sai phân hữu
  // hạn tính ở DOUBLE precision — KHÔNG dùng lại buffer Float32Array của
  // Tensor để nhiễu số ε, vì lưu trữ float32 làm sai lệch epsilon "vùng vàng"
  // rất nhiều (xem callout Mục 4 bài viết) — đúng cách thư viện thật làm
  // (torch.autograd.gradcheck bắt buộc ép kiểu double trước khi kiểm tra).
  // ===========================================================================

  // --- Ví dụ 3 phép toán tính tay: a=2,b=3; c=a*b; d=c+a (dùng lại a); L=d² ---
  function buildGraph3(aVal, bVal) {
    const a = Tensor.fromNested([aVal]);
    const b = Tensor.fromNested([bVal]);
    const c = mul(a, b);
    const d = add(c, a);
    const L = mul(d, d);
    return { a, b, c, d, L };
  }
  const g3 = buildGraph3(2, 3);
  g3.L.backward();
  check('3-node: L', g3.L.data[0], 64);
  check('3-node: a.grad (cong don qua 2 nhanh: 48+16)', g3.a.grad[0], 64);
  check('3-node: b.grad', g3.b.grad[0], 32);
  // Đối chiếu bằng hàm THUẦN double precision độc lập (không qua Tensor) — quét
  // epsilon để xác nhận "vùng vàng" 1e-4..1e-6 (Mục 4 bài viết).
  function L3(aVal, bVal) {
    const c = aVal * bVal;
    const d = c + aVal;
    return d * d;
  }
  for (const eps of [1e-4, 1e-5, 1e-6]) {
    const fd = (L3(2 + eps, 3) - L3(2 - eps, 3)) / (2 * eps);
    check('3-node: finite-diff eps=' + eps + ' khop autograd', fd, 64, 1e-3);
  }

  // --- Gradient checking cho relu/sigmoid qua 1 mini pipeline z->relu->sigmoid->sum ---
  function buildPipeline(xVal) {
    const x = Tensor.fromNested([xVal]);
    const r = relu(x);
    const s = sigmoid(r);
    const L = sum(s);
    return { x, L };
  }
  function pipelineDouble(xVal) {
    const r = Math.max(0, xVal);
    const s = 1 / (1 + Math.exp(-r));
    return s;
  }
  for (const xVal of [-2, -0.5, 0.5, 2]) {
    const p = buildPipeline(xVal);
    p.L.backward();
    const eps = 1e-5;
    const fd = (pipelineDouble(xVal + eps) - pipelineDouble(xVal - eps)) / (2 * eps);
    check('relu+sigmoid grad tai x=' + xVal, p.x.grad[0], fd, 1e-3);
  }

  // --- Gradient checking cho matmul: L = sum((X @ W)) trên ma trận nhỏ ---
  function matmulDoubleSum(Xnested, Wnested) {
    const X = Tensor.fromNested(Xnested),
      W = Tensor.fromNested(Wnested);
    let s = 0;
    const out = matmulReference(X, W);
    for (let i = 0; i < out.size; i++) s += out.data[i];
    return s;
  }
  const Xg = Tensor.fromNested([
    [1, 2],
    [3, 4],
  ]);
  const Wg = Tensor.fromNested([
    [0.5, -1],
    [2, 0.3],
  ]);
  const Zg = matmul(Xg, Wg);
  const Lg = sum(Zg);
  Lg.backward();
  const epsM = 1e-3;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const Xp = Xg.toNested(),
        Xm = Xg.toNested();
      Xp[i][j] += epsM;
      Xm[i][j] -= epsM;
      const fd = (matmulDoubleSum(Xp, Wg.toNested()) - matmulDoubleSum(Xm, Wg.toNested())) / (2 * epsM);
      check('matmul grad X[' + i + ',' + j + ']', Xg.grad[i * 2 + j], fd, 1e-2);
    }
  }

  // --- Cạm bẫy: gradient CỘNG DỒN — quên zero_grad làm nhiễm gradient vòng cũ ---
  function forwardLoss(w, xVal) {
    const x = Tensor.fromNested([xVal]);
    const z = mul(w, x); // z = w*x
    return mul(z, z); // L = (w*x)² ; dL/dw = 2*w*x²
  }
  const wBad = Tensor.fromNested([3]);
  forwardLoss(wBad, 2).backward(); // vòng 1: dL/dw = 2*3*4 = 24
  check('cong don: sau vong 1', wBad.grad[0], 24);
  forwardLoss(wBad, 5).backward(); // vòng 2 QUÊN zero_grad: dL/dw rieng = 2*3*25=150
  check('cong don: QUEN zero_grad -> nhiem gradient vong cu (24+150)', wBad.grad[0], 174);
  const wGood = Tensor.fromNested([3]);
  forwardLoss(wGood, 2).backward();
  wGood.zeroGrad();
  forwardLoss(wGood, 5).backward();
  check('cong don: CO zero_grad -> dung 150', wGood.grad[0], 150);

  // --- Nếm trước vanishing/exploding (chi tiết + lời giải ở Bài 13) ---
  function chainSigmoid(N) {
    let x = Tensor.fromNested([0]);
    const first = x;
    for (let i = 0; i < N; i++) x = sigmoid(x);
    sum(x).backward();
    return first.grad[0];
  }
  checkTrue(
    'vanishing: N=10 sigmoid, grad cung bac 0.25^10~9.5e-7',
    chainSigmoid(10) < 1e-5 && chainSigmoid(10) > 1e-8
  );
  checkTrue('vanishing: N=50 sigmoid, grad gan nhu bang 0', chainSigmoid(50) < 1e-25);
  function chainMulConst(N, c) {
    let x = Tensor.fromNested([1]);
    const first = x;
    for (let i = 0; i < N; i++) x = mul(x, Tensor.fromNested([c]));
    sum(x).backward();
    return first.grad[0];
  }
  check('exploding: N=10 nhan hang so 2, grad = 2^10', chainMulConst(10, 2), 1024, 1);
  check('exploding: N=20 nhan hang so 2, grad = 2^20', chainMulConst(20, 2), 1048576, 2000);

  // ===========================================================================
  // BÀI 9 — OPTIMIZER: verify từng công thức bằng tính tay từng bước (không
  // qua backward — set thẳng .grad để kiểm soát input, tách biệt khỏi Bài 7).
  // ===========================================================================

  // --- SGD thuần: 1 bước = trừ đúng lr*grad ---
  function setGrad(t, vals) {
    t._ensureGrad();
    vals.forEach((v, i) => (t.grad[i] = v));
  }
  const pSgd = Tensor.fromNested([5]);
  setGrad(pSgd, [2]);
  new SGD([pSgd], 0.1).step();
  check('SGD thuan: 5 - 0.1*2', pSgd.data[0], 4.8);

  // --- SGD+Momentum: v tich luy qua 2 buoc, khac SGD thuan tu buoc 2 ---
  const pMom = Tensor.fromNested([5]);
  const optMom = new SGD([pMom], 0.1, 0.9);
  setGrad(pMom, [2]);
  optMom.step(); // v=0.9*0+2=2 ; p=5-0.1*2=4.8
  check('Momentum buoc 1 == SGD thuan buoc 1 (v moi = grad)', pMom.data[0], 4.8);
  setGrad(pMom, [2]);
  optMom.step(); // v=0.9*2+2=3.8 ; p=4.8-0.1*3.8=4.42
  check('Momentum buoc 2: tich luy v lam buoc DI XA HON SGD thuan', pMom.data[0], 4.42);
  const pSgd2 = Tensor.fromNested([5]);
  const optSgd2 = new SGD([pSgd2], 0.1);
  setGrad(pSgd2, [2]);
  optSgd2.step();
  setGrad(pSgd2, [2]);
  optSgd2.step();
  checkTrue('Momentum buoc 2 di xa hon SGD thuan cung 2 buoc (4.42 < 4.6)', pMom.data[0] < pSgd2.data[0]);

  // --- RMSProp: cache = EMA(g²), buoc chia cho can(cache) ---
  const pRms = Tensor.fromNested([5]);
  const optRms = new RMSProp([pRms], 0.1, 0.9);
  setGrad(pRms, [2]);
  optRms.step(); // cache=0.1*4=0.4 ; buoc=0.1*2/sqrt(0.4)=0.3162...
  check('RMSProp buoc 1', pRms.data[0], 5 - (0.1 * 2) / Math.sqrt(0.4), 1e-6);
  setGrad(pRms, [2]);
  optRms.step(); // cache=0.9*0.4+0.1*4=0.76
  check('RMSProp buoc 2', pRms.data[0], 5 - (0.1 * 2) / Math.sqrt(0.4) - (0.1 * 2) / Math.sqrt(0.76), 1e-6);

  // --- Adam: bias correction voi gradient HANG SO g -> mHat=g, vHat=g² CHINH
  // XAC moi buoc t (dong nhat thuc: m_t=(1-beta1^t)*g khi m_0=0, chia lai
  // dung 1-beta1^t la triet tieu HET) -> buoc = lr*g/(|g|+eps) ~ hang so lr
  // MOI buoc, BAT KE do lon gradient — day la ly do Adam it nhay cam voi
  // scale gradient hon SGD (xem Bai 9 Muc 3).
  const pAdam = Tensor.fromNested([5]);
  const optAdam = new Adam([pAdam], 0.1);
  let expectAdam = 5;
  for (let step = 0; step < 5; step++) {
    setGrad(pAdam, [2]);
    optAdam.step();
    expectAdam -= 0.1; // lr*mHat/sqrt(vHat) = 0.1*2/2 = 0.1 (bo qua eps)
    check('Adam buoc ' + (step + 1) + ': buoc ~hang so lr bat ke grad=2', pAdam.data[0], expectAdam, 1e-3);
  }

  // --- Đua optimizer trên loss ravine f(x,y)=0.1x²+2y² (khe hẹp: curvature
  // theo y gấp 20 lần theo x) — cùng lr=0.1 cho cả 4, đếm số bước tới
  // loss < 1e-3 từ điểm xuất phát (-2, 1) (loss ban đầu = 0.1*4+2*1 = 2.4).
  function raceOptimizer(makeOpt) {
    const p = Tensor.fromNested([-2, 1]);
    const opt = makeOpt([p]);
    for (let step = 1; step <= 20000; step++) {
      const x = p.data[0],
        y = p.data[1];
      setGrad(p, [0.2 * x, 4 * y]);
      opt.step();
      const loss = 0.1 * p.data[0] * p.data[0] + 2 * p.data[1] * p.data[1];
      if (loss < 1e-3) return step;
    }
    return Infinity;
  }
  const stepsSgd = raceOptimizer((ps) => new SGD(ps, 0.1));
  const stepsMom = raceOptimizer((ps) => new SGD(ps, 0.1, 0.9));
  const stepsRms = raceOptimizer((ps) => new RMSProp(ps, 0.1, 0.9));
  const stepsAdam = raceOptimizer((ps) => new Adam(ps, 0.1));
  checkTrue('dua optimizer: SGD thuan CHAM NHAT tren khe hep', stepsSgd > stepsMom && stepsSgd > stepsRms);
  checkTrue('dua optimizer: RMSProp/Adam ve dich (huong x cong ca huong)', stepsRms < Infinity && stepsAdam < Infinity);
  console.log(
    'Dua optimizer (buoc toi loss<1e-3): SGD=' +
      stepsSgd +
      ' Momentum=' +
      stepsMom +
      ' RMSProp=' +
      stepsRms +
      ' Adam=' +
      stepsAdam
  );

  // ===========================================================================
  // BÀI 10 — SOFTMAX + CROSS-ENTROPY: tính tay 1 ví dụ nhỏ + gradient checking.
  // ===========================================================================

  // --- Tinh tay: 1 mau, 3 lop, logits=[1,2,3], dung la lop 2 (index tu 0) ---
  {
    const logits = Tensor.fromNested([[1, 2, 3]]);
    const yOneHot = Tensor.fromNested([[0, 0, 1]]);
    const L = softmaxCrossEntropy(logits, yOneHot);
    // softmax([1,2,3]): exp(1-3)=0.1353, exp(2-3)=0.3679, exp(3-3)=1 -> sum=1.5032
    // prob = [0.0900, 0.2447, 0.6652] ; loss = -log(0.6652) = 0.4076
    const expExp = [Math.exp(-2), Math.exp(-1), Math.exp(0)];
    const sumExp = expExp[0] + expExp[1] + expExp[2];
    const probLop2 = expExp[2] / sumExp;
    check('softmax+CE tinh tay: loss = -log(prob dung lop)', L.data[0], -Math.log(probLop2), 1e-5);
    L.backward();
    logits._ensureGrad();
    check('softmax+CE grad lop dung = prob-1 (am, keo logit dung LEN)', logits.grad[2], probLop2 - 1, 1e-5);
    check('softmax+CE grad lop sai = prob (duong, keo logit sai XUONG)', logits.grad[0], expExp[0] / sumExp, 1e-5);
  }

  // --- Gradient checking: batch N=4, C=5, logits + one-hot NGAU NHIEN ---
  {
    const N = 4,
      C = 5;
    const logitsData = [];
    for (let i = 0; i < N * C; i++) logitsData.push(Math.sin(i * 1.7) * 2);
    const labels = [2, 0, 4, 1];
    const yData = new Array(N * C).fill(0);
    labels.forEach((lab, i) => (yData[i * C + lab] = 1));
    function lossDouble(vals) {
      let total = 0;
      for (let i = 0; i < N; i++) {
        let m = -Infinity;
        for (let c = 0; c < C; c++) m = Math.max(m, vals[i * C + c]);
        let sumExp = 0;
        for (let c = 0; c < C; c++) sumExp += Math.exp(vals[i * C + c] - m);
        const logSumExp = Math.log(sumExp) + m;
        total += -(vals[i * C + labels[i]] - logSumExp);
      }
      return total / N;
    }
    const logitsT = Tensor.fromNested(logitsData.slice()).reshape([N, C]);
    const yT = Tensor.fromNested(yData).reshape([N, C]);
    const Lce = softmaxCrossEntropy(logitsT, yT);
    Lce.backward();
    const eps = 1e-4;
    let maxDiff = 0;
    for (let idx = 0; idx < N * C; idx++) {
      const plus = logitsData.slice();
      plus[idx] += eps;
      const minus = logitsData.slice();
      minus[idx] -= eps;
      const fd = (lossDouble(plus) - lossDouble(minus)) / (2 * eps);
      maxDiff = Math.max(maxDiff, Math.abs(fd - logitsT.grad[idx]));
    }
    checkTrue('softmax+CE gradient checking (N=4,C=5, sai lech toi da < 1e-3)', maxDiff < 1e-3);
  }

  // --- Sanity: 1 buoc Adam giam loss tren bai toan phan tach de (2 mau, 2 lop) ---
  {
    const logits = Tensor.fromNested([
      [0, 0],
      [0, 0],
    ]);
    const yOneHot = Tensor.fromNested([
      [1, 0],
      [0, 1],
    ]);
    const opt = new Adam([logits], 0.5);
    const L0 = softmaxCrossEntropy(logits, yOneHot).data[0];
    for (let step = 0; step < 20; step++) {
      logits.zeroGrad();
      const L = softmaxCrossEntropy(logits, yOneHot);
      L.backward();
      opt.step();
    }
    const L1 = softmaxCrossEntropy(logits, yOneHot).data[0];
    checkTrue('softmax+CE + Adam: loss giam manh sau 20 buoc tren bai toan de', L1 < L0 * 0.1);
  }

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
