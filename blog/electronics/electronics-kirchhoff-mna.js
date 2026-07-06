document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const sliderVs = document.getElementById('sim-vs');
  const sliderR1 = document.getElementById('sim-r1');
  const sliderR2 = document.getElementById('sim-r2');
  const sliderR3 = document.getElementById('sim-r3');

  const valVs = document.getElementById('val-vs');
  const valR1 = document.getElementById('val-r1');
  const valR2 = document.getElementById('val-r2');
  const valR3 = document.getElementById('val-r3');

  const svgVs = document.getElementById('svg-vs');
  const svgR1 = document.getElementById('svg-r1');
  const svgR2 = document.getElementById('svg-r2');
  const svgR3 = document.getElementById('svg-r3');

  const outV1 = document.getElementById('out-v1');
  const outV2 = document.getElementById('out-v2');
  const outIv = document.getElementById('out-iv');

  const matrixA = [
    document.getElementById('mat-a00'),
    document.getElementById('mat-a01'),
    document.getElementById('mat-a02'),
    document.getElementById('mat-a10'),
    document.getElementById('mat-a11'),
    document.getElementById('mat-a12'),
    document.getElementById('mat-a20'),
    document.getElementById('mat-a21'),
    document.getElementById('mat-a22'),
  ];
  const matrixB = [
    document.getElementById('mat-b0'),
    document.getElementById('mat-b1'),
    document.getElementById('mat-b2'),
  ];

  // Gauss Elimination Solver
  function solveGauss(A, B) {
    const n = B.length;
    let x = new Array(n).fill(0);

    // Copy matrix to avoid mutating original
    let mat = [];
    for (let i = 0; i < n; i++) {
      mat.push([...A[i], B[i]]);
    }

    // Forward Elimination with Partial Pivoting
    for (let i = 0; i < n; i++) {
      let maxEl = Math.abs(mat[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(mat[k][i]) > maxEl) {
          maxEl = Math.abs(mat[k][i]);
          maxRow = k;
        }
      }

      // Swap max row with current row
      let tmp = mat[maxRow];
      mat[maxRow] = mat[i];
      mat[i] = tmp;

      // Make all rows below this one 0 in current column
      for (let k = i + 1; k < n; k++) {
        let c = -mat[k][i] / mat[i][i];
        for (let j = i; j < n + 1; j++) {
          if (i === j) mat[k][j] = 0;
          else mat[k][j] += c * mat[i][j];
        }
      }
    }

    // Back Substitution
    for (let i = n - 1; i >= 0; i--) {
      x[i] = mat[i][n] / mat[i][i];
      for (let k = i - 1; k >= 0; k--) {
        mat[k][n] -= mat[k][i] * x[i];
      }
    }
    return x;
  }

  function updateSimulation() {
    const Vs = parseFloat(sliderVs.value);
    const R1 = parseFloat(sliderR1.value);
    const R2 = parseFloat(sliderR2.value);
    const R3 = parseFloat(sliderR3.value);

    // Update labels
    valVs.textContent = `${Vs}V`;
    valR1.textContent = `${R1}Ω`;
    valR2.textContent = `${R2}Ω`;
    valR3.textContent = `${R3}Ω`;

    svgVs.textContent = `Vs=${Vs}V`;
    svgR1.textContent = `R1=${R1}Ω`;
    svgR2.textContent = `R2=${R2}Ω`;
    svgR3.textContent = `R3=${R3}Ω`;

    // Conductances
    const g1 = 1 / R1;
    const g2 = 1 / R2;
    const g3 = 1 / R3;

    // MNA Matrix setup
    // Variables: [V1, V2, Iv]
    // KCL Node 1: g1*V1 - g1*V2 - Iv = 0
    // KCL Node 2: -g1*V1 + (g1+g2+g3)*V2 = 0
    // Voltage Source Constraint: V1 = Vs

    const A = [
      [g1, -g1, -1],
      [-g1, g1 + g2 + g3, 0],
      [1, 0, 0],
    ];
    const B = [0, 0, Vs];

    // Format numbers for display in matrix
    const formatS = (num) => {
      if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(2);
      return num.toFixed(4).replace(/\.?0+$/, '');
    };

    matrixA[0].textContent = formatS(A[0][0]);
    matrixA[1].textContent = formatS(A[0][1]);
    matrixA[2].textContent = formatS(A[0][2]);
    matrixA[3].textContent = formatS(A[1][0]);
    matrixA[4].textContent = formatS(A[1][1]);
    matrixA[5].textContent = formatS(A[1][2]);
    matrixA[6].textContent = formatS(A[2][0]);
    matrixA[7].textContent = formatS(A[2][1]);
    matrixA[8].textContent = formatS(A[2][2]);

    matrixB[0].textContent = formatS(B[0]);
    matrixB[1].textContent = formatS(B[1]);
    matrixB[2].textContent = formatS(B[2]);

    // Solve Matrix
    const X = solveGauss(A, B);
    const V1 = X[0];
    const V2 = X[1];
    const Iv = X[2];

    // Update Output
    outV1.textContent = V1.toFixed(3);
    outV2.textContent = V2.toFixed(3);

    // Convert Iv to mA for better readability if small
    let ivDisplay = Iv.toFixed(3) + ' A';
    if (Math.abs(Iv) < 1) {
      ivDisplay = (Iv * 1000).toFixed(1) + ' mA';
    }
    outIv.textContent = ivDisplay;
  }

  // Bind events
  sliderVs.addEventListener('input', updateSimulation);
  sliderR1.addEventListener('input', updateSimulation);
  sliderR2.addEventListener('input', updateSimulation);
  sliderR3.addEventListener('input', updateSimulation);

  // Initial update
  updateSimulation();
});
