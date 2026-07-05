/**
 * electronics-kirchhoff-mna.js
 * Thư viện tính toán mạng điện tự động bằng phương pháp ma trận MNA và khử Gauss.
 * File này được đính kèm làm tài liệu thực hành cho Bài 3: Định luật Kirchhoff & Giải thuật mạng điện MNA.
 */

/**
 * Giải hệ phương trình tuyến tính A * x = B bằng phương pháp khử Gauss (Gaussian Elimination) có chọn phần tử trội (partial pivoting).
 * @param {number[][]} A - Ma trận hệ số kích thước N x N
 * @param {number[]} B - Vector hằng số kích thước N
 * @returns {number[]} Vector nghiệm x kích thước N
 */
function giaiGauss(A, B) {
  const n = B.length;

  // Tạo ma trận bổ sung [A | B] bằng cách sao chép sâu để tránh thay đổi dữ liệu gốc
  const M = [];
  for (let i = 0; i < n; i++) {
    M.push([...A[i], B[i]]);
  }

  // Phép khử xuôi (Forward Elimination)
  for (let i = 0; i < n; i++) {
    // 1. Tìm phần tử trội (Pivot) lớn nhất theo cột để đảm bảo tính ổn định số học
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }

    // Hoán vị dòng chứa phần tử trội lên vị trí dòng thứ i
    const temp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = temp;

    // Kiểm tra tính suy biến của ma trận
    if (Math.abs(M[i][i]) < 1e-12) {
      throw new Error('Ma trận suy biến hoặc có vô số nghiệm (không thể giải bằng khử Gauss)!');
    }

    // 2. Triệt tiêu các phần tử bên dưới phần tử chéo chính
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  // Phép thế ngược (Back Substitution)
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += M[i][j] * x[j];
    }
    x[i] = (M[i][n] - sum) / M[i][i];
  }

  return x;
}

/**
 * Xây dựng ma trận MNA và giải mạng điện cầu T cơ bản gồm:
 * 1 Nguồn áp Vs nối vào nút 1 (qua trở R1) và 2 nút chưa biết áp V1, V2.
 * @param {number} Vs - Điện áp nguồn cấp (V)
 * @param {number} r1 - Điện trở nhánh vào R1 (Ohm)
 * @param {number} r2 - Điện trở nhánh giữa R2 (Ohm)
 * @param {number} r3 - Điện trở nhánh xuống đất R3 (Ohm)
 * @returns {{V1: number, V2: number, Iv: number}} Điện áp các nút và dòng điện qua nguồn áp (A)
 */
function giaiMachMna(Vs, r1, r2, r3) {
  // Biến đổi điện trở sang độ dẫn điện G = 1/R
  const g1 = 1 / r1;
  const g2 = 1 / r2;
  const g3 = 1 / r3;

  /**
   * Hệ phương trình MNA có 3 biến: [V1, V2, Iv] (Iv là dòng điện đi ra từ cực dương nguồn áp Vs)
   *
   * Phương trình 1 (KCL tại nút 1):
   * (V1 - Vs)/R1 + (V1 - V2)/R2 = 0
   * <=> V1 * (g1 + g2) - V2 * g2 + Iv = 0  (Vì Iv = - dòng điện qua R1, dòng đi vào nút 1 bằng Iv)
   * Ở đây, nguồn Vs được nối tiếp trực tiếp từ GND lên nút 1 thông qua cực dương.
   * Để chuẩn hóa MNA, nguồn áp nối nút 1 và GND sẽ sinh ra phương trình bổ sung:
   * V1 = Vs
   * KCL tại nút 1: V1/R1 + (V1 - V2)/R2 - Iv = 0 => V1*(g1 + g2) - V2*g2 - Iv = 0 (với Iv đi vào nút 1)
   * KCL tại nút 2: (V2 - V1)/R2 + V2/R3 = 0 => -V1*g2 + V2*(g2 + g3) = 0
   * Phương trình nguồn áp: V1 = Vs
   */
  const A = [
    [g1 + g2, -g2, -1], // KCL nút 1
    [-g2, g2 + g3, 0], // KCL nút 2
    [1, 0, 0], // Nguồn áp nối nút 1
  ];

  const B = [
    0, // Hằng số KCL nút 1
    0, // Hằng số KCL nút 2
    Vs, // Hằng số điện áp nguồn
  ];

  const nghiem = giaiGauss(A, B);

  return {
    V1: nghiem[0],
    V2: nghiem[1],
    Iv: nghiem[2], // dòng điện chạy từ nguồn cấp vào nút 1
  };
}

// Chạy demo thử nghiệm in ra Console để học viên tự kiểm chứng khi tải file
console.log('--- Bắt đầu giải mạng điện MNA ---');
try {
  const ketQua = giaiMachMna(10.0, 1000.0, 2000.0, 3000.0);
  console.log('Nghiệm giải hệ phương trình nút MNA:');
  console.log(`- Điện áp nút V1 (bằng Vs): ${ketQua.V1.toFixed(4)} V`);
  console.log(`- Điện áp nút V2: ${ketQua.V2.toFixed(4)} V`);
  console.log(`- Dòng điện qua nguồn áp (Iv): ${ketQua.Iv.toFixed(6)} A (${(ketQua.Iv * 1000).toFixed(4)} mA)`);
} catch (e) {
  console.error('Lỗi khi giải mạng điện:', e.message);
}
