// riscv_control_unit_example.sv — Control unit + ALU decoder đầy đủ (opcode
// VÀ funct3/funct7) cho CPU RV32I của dự án.
// Bài 14: Dự án CPU RISC-V RV32I — Phần 2: Chạy chương trình thật
// js-tools.org/blog/vlsi/vlsi-riscv-program
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator:  verilator --binary -Wall riscv_control_unit_example.sv && obj_dir/Vriscv_control_unit_example_tb
//   Icarus:     iverilog -g2012 -o sim riscv_control_unit_example.sv && vvp sim
//   Hoặc dán trực tiếp vào https://www.edaplayground.com
//
// ---------------------------------------------------------------------------
// Control unit: opcode (7 bit) -> 6 tín hiệu điều khiển. Đây LÀ bảng ở Mục 1
// bài viết, viết thành phần cứng thật — mỗi tín hiệu một khối case riêng
// (một case chỉ gán đúng 1 biến output — tương thích subset VeriLite của
// series, tránh case gán nhiều biến trong 1 nhánh).
// ---------------------------------------------------------------------------
module control_unit (
  input  logic [6:0] opcode,
  output logic       reg_write,   // ghi kết quả vào register file?
  output logic       alu_src,     // ALU dùng imm (1) hay rs2 (0)?
  output logic       mem_read,    // đọc Data Memory (lw)?
  output logic       mem_write,   // ghi Data Memory (sw)?
  output logic       mem_to_reg,  // ghi vào rd từ Data Memory (1) hay ALU (0)?
  output logic       branch       // đây là lệnh rẽ nhánh (beq/bne)?
);
  always_comb begin
    case (opcode)
      7'b0110011: reg_write = 1'b1; // R-type
      7'b0010011: reg_write = 1'b1; // I-type số học
      7'b0000011: reg_write = 1'b1; // lw
      7'b0100011: reg_write = 1'b0; // sw
      7'b1100011: reg_write = 1'b0; // B-type
      7'b1101111: reg_write = 1'b1; // jal
      default:    reg_write = 1'b0;
    endcase
  end

  always_comb begin
    case (opcode)
      7'b0110011: alu_src = 1'b0; // R-type dùng rs2
      7'b0010011: alu_src = 1'b1; // còn lại dùng immediate
      7'b0000011: alu_src = 1'b1;
      7'b0100011: alu_src = 1'b1;
      7'b1100011: alu_src = 1'b0;
      7'b1101111: alu_src = 1'b0;
      default:    alu_src = 1'b0;
    endcase
  end

  always_comb begin
    case (opcode)
      7'b0000011: mem_read = 1'b1; // chỉ lw
      default:    mem_read = 1'b0;
    endcase
  end

  always_comb begin
    case (opcode)
      7'b0100011: mem_write = 1'b1; // chỉ sw
      default:    mem_write = 1'b0;
    endcase
  end

  always_comb begin
    case (opcode)
      7'b0000011: mem_to_reg = 1'b1; // chỉ lw
      default:    mem_to_reg = 1'b0;
    endcase
  end

  always_comb begin
    case (opcode)
      7'b1100011: branch = 1'b1; // chỉ B-type
      default:    branch = 1'b0;
    endcase
  end
endmodule

// ---------------------------------------------------------------------------
// ALU decoder: hoàn thiện nốt phần Bài 13 còn nợ — phân biệt add/sub cùng
// funct3=000 bằng funct7 (bit 30 của lệnh gốc). Tách is_sub thành 1 case
// riêng rồi ghép bằng "assign" ternary, thay vì case lồng case (cũng vì lý
// do tương thích subset VeriLite — đã tự kiểm chứng bằng VeriSimulator
// trước khi đưa vào bài, xem check-lesson.md).
// ---------------------------------------------------------------------------
module alu_decoder (
  input  logic [2:0] funct3,
  input  logic [6:0] funct7,
  output logic [2:0] alu_op
);
  logic [2:0] alu_op_base;
  logic       is_sub;

  always_comb begin
    case (funct3)
      3'b000:  alu_op_base = 3'b000; // add / addi / lw / sw (tính địa chỉ)
      3'b111:  alu_op_base = 3'b010; // and / andi
      3'b110:  alu_op_base = 3'b011; // or / ori
      3'b010:  alu_op_base = 3'b100; // slt / slti
      default: alu_op_base = 3'b000;
    endcase
  end

  always_comb begin
    case (funct7)
      7'b0100000: is_sub = 1'b1; // chỉ R-type sub mới đặt funct7 này
      default:    is_sub = 1'b0;
    endcase
  end

  assign alu_op = (is_sub) ? 3'b001 : alu_op_base;
endmodule

// ---------------------------------------------------------------------------
// ALU RV32I — y hệt Bài 13, ghép lại đây để file này chạy độc lập.
// ---------------------------------------------------------------------------
module alu_rv32i (
  input  logic [31:0] a, b,
  input  logic [2:0]  alu_op,
  output logic [31:0] result
);
  always_comb begin
    case (alu_op)
      3'b000:  result = a + b;
      3'b001:  result = a - b;
      3'b010:  result = a & b;
      3'b011:  result = a | b;
      3'b100:  result = (a < b) ? 1 : 0;
      default: result = 32'b0;
    endcase
  end
endmodule

// ---------------------------------------------------------------------------
// Testbench self-checking (kỹ thuật Bài 5): kiểm control unit + alu_decoder
// trên đủ các opcode/funct3/funct7 quan trọng, bao gồm chính cặp add/sub mà
// Bài 13 còn để ngỏ.
// ---------------------------------------------------------------------------
module riscv_control_unit_example_tb;
  reg  [6:0] opcode, funct7;
  reg  [2:0] funct3;
  wire reg_write, alu_src, mem_read, mem_write, mem_to_reg, branch;
  wire [2:0] alu_op;
  integer errors;

  control_unit cu (
    .opcode(opcode), .reg_write(reg_write), .alu_src(alu_src),
    .mem_read(mem_read), .mem_write(mem_write), .mem_to_reg(mem_to_reg), .branch(branch)
  );
  alu_decoder ad (.funct3(funct3), .funct7(funct7), .alu_op(alu_op));

  task check(input got, input exp, input [127:0] name);
    begin
      if (got !== exp) begin
        $display("LOI %0s: got=%0d ky vong=%0d", name, got, exp);
        errors = errors + 1;
      end
    end
  endtask

  initial begin
    errors = 0;

    // add x3,x1,x2 -> R-type, funct3=000, funct7=0000000
    opcode = 7'b0110011; funct3 = 3'b000; funct7 = 7'b0000000; #1;
    check(reg_write, 1'b1, "add reg_write");
    check(alu_op, 3'b000, "add alu_op");

    // sub x3,x1,x2 -> CUNG opcode+funct3 nhu add, KHAC funct7 -> alu_op phai doi
    opcode = 7'b0110011; funct3 = 3'b000; funct7 = 7'b0100000; #1;
    check(alu_op, 3'b001, "sub alu_op (phan biet bang funct7)");

    // lw x4,8(x1) -> mem_read=1, mem_to_reg=1, alu_src=1
    opcode = 7'b0000011; funct3 = 3'b010; funct7 = 7'b0; #1;
    check(mem_read, 1'b1, "lw mem_read");
    check(mem_to_reg, 1'b1, "lw mem_to_reg");
    check(alu_src, 1'b1, "lw alu_src");

    // sw x2,0(x1) -> mem_write=1, reg_write=0
    opcode = 7'b0100011; funct3 = 3'b010; funct7 = 7'b0; #1;
    check(mem_write, 1'b1, "sw mem_write");
    check(reg_write, 1'b0, "sw reg_write");

    // beq x1,x2,label -> branch=1, reg_write=0
    opcode = 7'b1100011; funct3 = 3'b000; funct7 = 7'b0; #1;
    check(branch, 1'b1, "beq branch");
    check(reg_write, 1'b0, "beq reg_write");

    // jal x1,label -> reg_write=1 (ghi PC+4 vao rd)
    opcode = 7'b1101111; funct3 = 3'b0; funct7 = 7'b0; #1;
    check(reg_write, 1'b1, "jal reg_write");

    if (errors == 0)
      $display("CONTROL UNIT + ALU DECODER: TAT CA DUNG.");
    else
      $display("%0d loi phat hien.", errors);
    $finish;
  end
endmodule
