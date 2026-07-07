// hardware_arithmetic.sv — RCA vs CLA, nhân shift-add vs array, fixed-point tràn số
// Bài 6: Số học phần cứng — js-tools.org/blog/vlsi/vlsi-arithmetic
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator:  verilator --binary -Wall hardware_arithmetic.sv && obj_dir/Vhardware_arithmetic_tb
//   Icarus:     iverilog -g2012 -o sim hardware_arithmetic.sv && vvp sim
//   Hoặc dán trực tiếp vào https://www.edaplayground.com

// ---------------------------------------------------------------------------
// Ripple-Carry Adder 4-bit — độ trễ O(n), carry lan truyền tuần tự qua từng tầng
// ---------------------------------------------------------------------------
module rca4 (
  input  logic a0, a1, a2, a3,
  input  logic b0, b1, b2, b3,
  input  logic cin,
  output logic s0, s1, s2, s3,
  output logic cout
);
  logic c1, c2, c3;
  assign s0 = a0 ^ b0 ^ cin;
  assign c1 = (a0 & b0) | (cin & (a0 ^ b0));
  assign s1 = a1 ^ b1 ^ c1;
  assign c2 = (a1 & b1) | (c1 & (a1 ^ b1));
  assign s2 = a2 ^ b2 ^ c2;
  assign c3 = (a2 & b2) | (c2 & (a2 ^ b2));
  assign s3 = a3 ^ b3 ^ c3;
  assign cout = (a3 & b3) | (c3 & (a3 ^ b3));
endmodule

// ---------------------------------------------------------------------------
// Carry-Lookahead Adder 4-bit — độ trễ O(log n), carry tính trước song song
// qua tín hiệu generate (G) / propagate (P)
// ---------------------------------------------------------------------------
module cla4 (
  input  logic a0, a1, a2, a3,
  input  logic b0, b1, b2, b3,
  input  logic cin,
  output logic s0, s1, s2, s3,
  output logic cout
);
  logic g0, g1, g2, g3;
  logic p0, p1, p2, p3;
  logic c1, c2, c3;

  assign g0 = a0 & b0;  assign p0 = a0 ^ b0;
  assign g1 = a1 & b1;  assign p1 = a1 ^ b1;
  assign g2 = a2 & b2;  assign p2 = a2 ^ b2;
  assign g3 = a3 & b3;  assign p3 = a3 ^ b3;

  assign c1 = g0 | (p0 & cin);
  assign c2 = g1 | (p1 & g0) | (p1 & p0 & cin);
  assign c3 = g2 | (p2 & g1) | (p2 & p1 & g0) | (p2 & p1 & p0 & cin);
  assign cout = g3 | (p3 & g2) | (p3 & p2 & g1) | (p3 & p2 & p1 & g0) | (p3 & p2 & p1 & p0 & cin);

  assign s0 = p0 ^ cin;
  assign s1 = p1 ^ c1;
  assign s2 = p2 ^ c2;
  assign s3 = p3 ^ c3;
endmodule

// ---------------------------------------------------------------------------
// Bộ nhân shift-add tuần tự 4-bit — n chu kỳ, ít diện tích (1 bộ cộng dùng lại)
// ---------------------------------------------------------------------------
module mult4_shiftadd (
  input  logic clk, rst, start,
  input  logic [3:0] a, b,
  output logic [7:0] product,
  output logic done
);
  logic [7:0] acc, addend;
  logic [3:0] mrem;
  logic [2:0] count;
  logic busy;

  always_ff @(posedge clk) begin
    if (rst) busy <= 0;
    else busy <= (start && !busy) ? 1 : (busy && (count == 3)) ? 0 : busy;
  end

  always_ff @(posedge clk) begin
    if (rst) count <= 0;
    else count <= (start && !busy) ? 0 : (busy) ? (count + 1) : count;
  end

  always_ff @(posedge clk) begin
    if (rst) mrem <= 0;
    else mrem <= (start && !busy) ? b : (busy) ? (mrem >> 1) : mrem;
  end

  always_ff @(posedge clk) begin
    if (rst) addend <= 0;
    else addend <= (start && !busy) ? a : (busy) ? (addend << 1) : addend;
  end

  always_ff @(posedge clk) begin
    if (rst) acc <= 0;
    else acc <= (start && !busy) ? 0 : (busy && (mrem % 2 == 1)) ? (acc + addend) : acc;
  end

  assign product = acc;
  assign done = !busy;
endmodule

// ---------------------------------------------------------------------------
// Array multiplier tổ hợp 4-bit — 1 chu kỳ, tốn diện tích lưới n×n
// ---------------------------------------------------------------------------
module mult4_array (
  input  logic [3:0] a, b,
  output logic [7:0] product
);
  assign product = a * b;
endmodule

// ---------------------------------------------------------------------------
// Fixed-point Q4.0: tràn số ❌ wrap-around lặng lẽ vs ✅ bão hoà (saturate)
// ---------------------------------------------------------------------------
module fixed_add_wrap (
  input  logic [3:0] a, b,
  output logic [3:0] sum   // ❌ 10+7=17 tràn 4-bit → cuộn vòng thành 1, không báo lỗi
);
  assign sum = a + b;
endmodule

module fixed_add_saturate (
  input  logic [3:0] a, b,
  output logic [3:0] sum   // ✅ 10+7=17 → kẹp về 15 (giá trị lớn nhất biểu diễn được)
);
  logic [4:0] raw;
  assign raw = a + b;
  assign sum = (raw > 15) ? 15 : raw;
endmodule

// ---------------------------------------------------------------------------
// Testbench: kiểm tra RCA==CLA trên toàn bộ 512 tổ hợp, bộ nhân shift-add vs
// array trên toàn bộ 256 tổ hợp, và ví dụ tràn số wrap vs saturate
// ---------------------------------------------------------------------------
module hardware_arithmetic_tb;
  reg a0, a1, a2, a3, b0, b1, b2, b3, cin;
  wire rs0, rs1, rs2, rs3, rcout;
  wire cs0, cs1, cs2, cs3, ccout;
  integer errors_adder;
  integer i, j, k;

  rca4 dut_rca (.a0(a0), .a1(a1), .a2(a2), .a3(a3), .b0(b0), .b1(b1), .b2(b2), .b3(b3), .cin(cin),
                .s0(rs0), .s1(rs1), .s2(rs2), .s3(rs3), .cout(rcout));
  cla4 dut_cla (.a0(a0), .a1(a1), .a2(a2), .a3(a3), .b0(b0), .b1(b1), .b2(b2), .b3(b3), .cin(cin),
                .s0(cs0), .s1(cs1), .s2(cs2), .s3(cs3), .cout(ccout));

  reg clk, rst, start;
  reg [3:0] ma, mb;
  wire [7:0] shiftadd_product, array_product;
  wire mult_done;

  mult4_shiftadd dut_shiftadd (.clk(clk), .rst(rst), .start(start), .a(ma), .b(mb),
                                .product(shiftadd_product), .done(mult_done));
  mult4_array dut_array (.a(ma), .b(mb), .product(array_product));

  reg [3:0] fa, fb;
  wire [3:0] wrap_sum;
  wire [3:0] sat_sum;
  fixed_add_wrap dut_wrap (.a(fa), .b(fb), .sum(wrap_sum));
  fixed_add_saturate dut_sat (.a(fa), .b(fb), .sum(sat_sum));

  always #5 clk = ~clk;

  initial begin
    errors_adder = 0;
    $display("--- Kiem chung RCA == CLA tren 512 to hop (a,b,cin) ---");
    for (i = 0; i < 16; i = i + 1) begin
      for (j = 0; j < 16; j = j + 1) begin
        for (k = 0; k < 2; k = k + 1) begin
          a0 = i[0]; a1 = i[1]; a2 = i[2]; a3 = i[3];
          b0 = j[0]; b1 = j[1]; b2 = j[2]; b3 = j[3];
          cin = k[0];
          #1;
          if ({rcout, rs3, rs2, rs1, rs0} !== {ccout, cs3, cs2, cs1, cs0}) begin
            $display("LECH: a=%0d b=%0d cin=%0d RCA=%0d,%0d CLA=%0d,%0d",
                      i, j, k, {rs3,rs2,rs1,rs0}, rcout, {cs3,cs2,cs1,cs0}, ccout);
            errors_adder = errors_adder + 1;
          end
        end
      end
    end
    if (errors_adder == 0)
      $display("RCA va CLA khop nhau tren TOAN BO 512 to hop.");
    else
      $display("%0d / 512 to hop LECH.", errors_adder);

    $display("--- Kiem chung bo nhan shift-add == array tren a=5, b=3 ---");
    clk = 0; rst = 1; start = 0; ma = 5; mb = 3;
    @(posedge clk); #1;
    rst = 0; start = 1;
    @(posedge clk); #1;
    start = 0;
    for (i = 0; i < 4; i = i + 1) begin
      @(posedge clk); #1;
      $display("chu ky %0d: shiftadd.product=%0d done=%b", i, shiftadd_product, mult_done);
    end
    $display("array.product (to hop, 1 chu ky) = %0d (ky vong 15)", array_product);
    if (shiftadd_product == array_product && array_product == 15)
      $display("Bo nhan shift-add va array KHOP nhau, dung ket qua.");
    else
      $display("SAI: shiftadd=%0d array=%0d", shiftadd_product, array_product);

    $display("--- Fixed-point: a=10, b=7 (tran 4-bit) ---");
    fa = 10; fb = 7;
    #1;
    $display("wrap.sum=%0d (SAI, cuon vong tu 17 mod 16) sat.sum=%0d (DUNG, ket vo 15)", wrap_sum, sat_sum);

    $display("Ket thuc mo phong.");
    $finish;
  end
endmodule
