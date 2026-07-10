// ai-neuro.js — "NeuroJS": tensor engine mini dùng chung cho Series 12
// Khởi sinh ở Bài 5 (tensor); mở rộng dần: Bài 7 (autograd), Bài 9 (optimizer),
// Bài 11 (Conv2D), Bài 14 (attention). Import trực tiếp từ các bài sau,
// KHÔNG copy-paste lại logic (tiền lệ vlsi-verilite.js của Series 11).
//
// Cách chạy self-test (không cần cài gì ngoài Node.js):
//   node ai-neuro.js
// Kỳ vọng in ra: "SELF-TEST PASS (22 checks)" — đối chiếu tính tay + so khớp
// 2 cách hiện thực matmul (self-test KHÔNG chỉ tin 1 công thức, xem Mục 4 bài viết).

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
function add(a, b) {
  return _elementwise(a, b, (x, y) => x + y);
}
function mul(a, b) {
  return _elementwise(a, b, (x, y) => x * y);
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
  return new Tensor(C, [m, n]);
}

export { Tensor, broadcastShapes, add, mul, matmul };

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

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
