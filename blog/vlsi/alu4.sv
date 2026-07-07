// alu4.sv — ALU 4-bit mini, 8 phép toán chọn qua case
// Bài 2: SystemVerilog tổ hợp — js-tools.org/blog/vlsi/vlsi-combinational-logic
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator (lint + mô phỏng):
//     verilator --lint-only alu4.sv
//     verilator -Wall --cc alu4.sv --exe testbench.cpp && make -C obj_dir -f Valu4_tb.mk
//   Hoặc dán trực tiếp vào https://www.edaplayground.com (chọn Icarus Verilog / Verilator).
//
// Lưu ý: đây là always_comb với case/default đầy đủ — KHÔNG sinh latch
// (xem callout "cạm bẫy latch inference" trong bài để hiểu vì sao default
// bắt buộc phải có).

module alu4 (
  input logic [3:0] a, b,
  input logic [2:0] opcode,
  output logic [3:0] y
);
  always_comb begin
    case (opcode)
      3'b000: y = a + b;    // ADD
      3'b001: y = a - b;    // SUB
      3'b010: y = a & b;    // AND
      3'b011: y = a | b;    // OR
      3'b100: y = a ^ b;    // XOR
      3'b101: y = ~a;       // NOT
      3'b110: y = a << 1;   // SHL
      3'b111: y = a >> 1;   // SHR
      default: y = 4'b0000; // bắt buộc — tránh latch inference
    endcase
  end
endmodule

// ---------------------------------------------------------------------------
// Testbench tối giản: chạy alu4 với vài tổ hợp a/b/opcode, in kết quả ra so sánh
// ---------------------------------------------------------------------------
module alu4_tb;
  reg [3:0] a, b;
  reg [2:0] opcode;
  wire [3:0] y;

  alu4 dut (.a(a), .b(b), .opcode(opcode), .y(y));

  integer i;
  reg [3:0] expected;
  initial begin
    a = 4'd6;
    b = 4'd3;
    $display("a=%d b=%d", a, b);
    $display("opcode | ten_phep_toan | y (tinh toan)");
    for (i = 0; i < 8; i = i + 1) begin
      opcode = i[2:0];
      #1;
      case (i)
        0: expected = a + b;
        1: expected = a - b;
        2: expected = a & b;
        3: expected = a | b;
        4: expected = a ^ b;
        5: expected = ~a;
        6: expected = a << 1;
        7: expected = a >> 1;
      endcase
      $display("%b       |               | y=%d (ky vong %d)", opcode, y, expected);
      if (y !== expected) begin
        $display("MISMATCH tai opcode=%b", opcode);
        $finish;
      end
    end
    $display("Tat ca 8 opcode deu khop ket qua ky vong.");
  end
endmodule
