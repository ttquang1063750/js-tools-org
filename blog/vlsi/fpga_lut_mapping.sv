// fpga_lut_mapping.sv — các khuôn mẫu RTL map vào tài nguyên FPGA: LUT, carry chain, DSP, BRAM
// Bài 9: Kiến trúc FPGA: LUT, CLB, BRAM, DSP — js-tools.org/blog/vlsi/vlsi-fpga-architecture
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator:  verilator --binary -Wall fpga_lut_mapping.sv && obj_dir/Vfpga_map_tb
//   Icarus:     iverilog -g2012 -o sim fpga_lut_mapping.sv && vvp sim
//   Hoặc dán trực tiếp vào https://www.edaplayground.com
//
// Muốn thấy các module này map vào tài nguyên nào: chạy synthesis bằng Yosys
//   yosys -p "read_verilog -sv fpga_lut_mapping.sv; synth_ice40; stat"
// rồi đọc phần "stat" — sẽ thấy LUT (SB_LUT4), carry (SB_CARRY), RAM (SB_RAM40_4K).

// --------------------------------------------------------------------------
// 1. Full adder tách làm 2 hàm 3 đầu vào — mỗi hàm vừa khít 1 LUT (Mục 1)
// --------------------------------------------------------------------------
module fa_sum (
  input  logic a, b, cin,
  output logic s
);
  assign s = a ^ b ^ cin;      // nội dung LUT: 0x96
endmodule

module fa_carry (
  input  logic a, b, cin,
  output logic co
);
  assign co = (a & b) | (cin & (a ^ b));   // nội dung LUT: 0xE8
endmodule

// --------------------------------------------------------------------------
// 2. Bộ cộng dạng "+" — tool FPGA map thẳng vào carry chain chuyên dụng (Mục 2)
// --------------------------------------------------------------------------
module adder4_plus (
  input  logic [3:0] a, b,
  input  logic cin,
  output logic [4:0] sum5   // bit 4 là carry-out
);
  assign sum5 = a + b + cin;
endmodule

// --------------------------------------------------------------------------
// 3. Phép nhân dạng "*" — map vào DSP slice cứng (Mục 3)
// --------------------------------------------------------------------------
module dsp_mult (
  input  logic [3:0] a, b,
  output logic [7:0] product
);
  assign product = a * b;
endmodule

// --------------------------------------------------------------------------
// 4. Cặp RAM ❌/✅ — cạm bẫy BRAM inference (Mục 3, ngoài subset VeriLite)
// --------------------------------------------------------------------------

// ❌ SAI: reset quét sạch cả mảng → KHÔNG map được BRAM (BRAM vật lý không
// có chân reset từng ô) → tool lặng lẽ sinh 2048 flip-flop + rừng LUT.
module ram_bad (
  input  logic clk, rst, we,
  input  logic [7:0] addr, din,
  output logic [7:0] dout
);
  logic [7:0] mem [0:255];
  integer i;
  always_ff @(posedge clk) begin
    if (rst)
      for (i = 0; i < 256; i = i + 1) mem[i] <= 0;   // ← thủ phạm
    else if (we)
      mem[addr] <= din;
    dout <= mem[addr];
  end
endmodule

// ✅ ĐÚNG: không reset nội dung mảng — khớp khuôn mẫu BRAM (xem Bài 7).
module ram_good (
  input  logic clk, we,
  input  logic [7:0] addr, din,
  output logic [7:0] dout
);
  logic [7:0] mem [0:255];
  always_ff @(posedge clk) begin
    if (we) mem[addr] <= din;
    dout <= mem[addr];
  end
endmodule

// --------------------------------------------------------------------------
// 5. Testbench: fa_sum/fa_carry ghép lại phải khớp adder4_plus từng bit,
//    và dsp_mult khớp phép nhân tham chiếu — quét toàn bộ tổ hợp.
// --------------------------------------------------------------------------
module fpga_map_tb;
  logic [3:0] a, b;
  logic cin;
  logic [4:0] sum5;
  adder4_plus dut_add (.a(a), .b(b), .cin(cin), .sum5(sum5));

  // rca4 ghép từ fa_sum/fa_carry — kiểm chứng "LUT ghép lại = phép cộng"
  logic s0, s1, s2, s3, c1, c2, c3, c4;
  fa_sum   u_s0 (.a(a[0]), .b(b[0]), .cin(cin), .s(s0));
  fa_carry u_c1 (.a(a[0]), .b(b[0]), .cin(cin), .co(c1));
  fa_sum   u_s1 (.a(a[1]), .b(b[1]), .cin(c1),  .s(s1));
  fa_carry u_c2 (.a(a[1]), .b(b[1]), .cin(c1),  .co(c2));
  fa_sum   u_s2 (.a(a[2]), .b(b[2]), .cin(c2),  .s(s2));
  fa_carry u_c3 (.a(a[2]), .b(b[2]), .cin(c2),  .co(c3));
  fa_sum   u_s3 (.a(a[3]), .b(b[3]), .cin(c3),  .s(s3));
  fa_carry u_c4 (.a(a[3]), .b(b[3]), .cin(c3),  .co(c4));

  logic [7:0] product;
  dsp_mult dut_mul (.a(a), .b(b), .product(product));

  integer ia, ib, ic, errors = 0;

  initial begin
    for (ia = 0; ia < 16; ia = ia + 1) begin
      for (ib = 0; ib < 16; ib = ib + 1) begin
        for (ic = 0; ic < 2; ic = ic + 1) begin
          a = ia[3:0]; b = ib[3:0]; cin = ic[0];
          #1;
          if (sum5 !== ia + ib + ic) begin
            errors = errors + 1;
            $display("SAI adder4_plus: %0d+%0d+%0d ra %0d", ia, ib, ic, sum5);
          end
          if ({c4, s3, s2, s1, s0} !== ia + ib + ic) begin
            errors = errors + 1;
            $display("SAI fa_sum/fa_carry ghep: %0d+%0d+%0d", ia, ib, ic);
          end
          if (ic == 0 && product !== ia * ib) begin
            errors = errors + 1;
            $display("SAI dsp_mult: %0d*%0d ra %0d", ia, ib, product);
          end
        end
      end
    end
    if (errors == 0)
      $display("PASS: adder4_plus, fa_sum/fa_carry ghep rca4, dsp_mult deu dung tren moi to hop.");
    else
      $display("FAIL: %0d loi.", errors);
    $finish;
  end
endmodule
