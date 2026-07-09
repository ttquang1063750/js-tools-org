// riscv_alu_example.sv — ALU RV32I cho datapath CPU (nâng cấp từ Bài 2)
// Bài 13: Dự án CPU RISC-V RV32I — Phần 1: Datapath
// js-tools.org/blog/vlsi/vlsi-riscv-datapath
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator:  verilator --binary -Wall riscv_alu_example.sv && obj_dir/Vriscv_alu_example_tb
//   Icarus:     iverilog -g2012 -o sim riscv_alu_example.sv && vvp sim
//   Hoặc dán trực tiếp vào https://www.edaplayground.com
//
// ---------------------------------------------------------------------------
// Tham khảo: 6 định dạng lệnh RISC-V (chỉ 4 dùng trong dự án: R, I, S, B, J)
// ---------------------------------------------------------------------------
// R: funct7[31:25] rs2[24:20] rs1[19:15] funct3[14:12] rd[11:7]  opcode[6:0]
// I: imm[31:20]              rs1[19:15] funct3[14:12] rd[11:7]  opcode[6:0]
// S: imm[31:25]    rs2[24:20] rs1[19:15] funct3[14:12] imm[11:7] opcode[6:0]
// B: imm[31,7]     rs2[24:20] rs1[19:15] funct3[14:12] imm[11:8,7] opcode[6:0]
// J: imm[31,19:12,20,30:21]                            rd[11:7]  opcode[6:0]
//
// Bảng control signal (opcode -> RegWrite/ALUSrc/MemRead/MemWrite/MemToReg/Branch)
// xem đầy đủ ở Mục 4 bài viết — file này chỉ tập trung vào khối ALU.

// ---------------------------------------------------------------------------
// ALU RV32I — bản nâng cấp 32-bit của ALU 4-bit ở Bài 2, chọn phép toán bằng
// alu_op (suy từ funct3, và funct7 để phân biệt add/sub cùng funct3=000 —
// Phần 2 sẽ ghép nốt logic suy luận alu_op đầy đủ từ opcode+funct3+funct7).
// ---------------------------------------------------------------------------
module alu_rv32i (
  input  logic [31:0] a, b,
  input  logic [2:0]  alu_op,
  output logic [31:0] result
);
  always_comb begin
    case (alu_op)
      3'b000:  result = a + b;             // add / addi / lw / sw (tính địa chỉ)
      3'b001:  result = a - b;             // sub
      3'b010:  result = a & b;             // and / andi
      3'b011:  result = a | b;             // or / ori
      3'b100:  result = (a < b) ? 1 : 0;   // slt / slti / beq / bne (so sánh)
      default: result = 32'b0;
    endcase
  end
endmodule

// ---------------------------------------------------------------------------
// Testbench: kiểm tra 5 phép toán trên vài tổ hợp giá trị 32-bit thật
// ---------------------------------------------------------------------------
module riscv_alu_example_tb;
  reg  [31:0] a, b;
  reg  [2:0]  alu_op;
  wire [31:0] result;
  integer errors;

  alu_rv32i dut (.a(a), .b(b), .alu_op(alu_op), .result(result));

  task check(input [31:0] va, vb, input [2:0] op, input [31:0] expected, input [127:0] name);
    begin
      a = va; b = vb; alu_op = op;
      #1;
      if (result !== expected) begin
        $display("LOI %0s: a=%0d b=%0d op=%0d ket qua=%0d ky vong=%0d",
                  name, va, vb, op, result, expected);
        errors = errors + 1;
      end
    end
  endtask

  initial begin
    errors = 0;
    check(10, 3, 3'b000, 13, "add");
    check(10, 3, 3'b001, 7,  "sub");
    check(12, 10, 3'b010, 8, "and");
    check(12, 10, 3'b011, 14, "or");
    check(3, 10, 3'b100, 1,  "slt (dung)");
    check(10, 3, 3'b100, 0,  "slt (sai)");
    // dia chi bo nho: lw x4, 8(x1) voi x1=100 -> dia chi = 108
    check(100, 8, 3'b000, 108, "tinh dia chi lw/sw");

    if (errors == 0)
      $display("ALU RV32I: TAT CA phep toan DUNG.");
    else
      $display("%0d loi phat hien.", errors);
    $finish;
  end
endmodule
