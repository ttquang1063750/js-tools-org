// adder_testbench.sv — Săn bug bằng self-checking testbench
// Bài 5: Testbench & Verification cơ bản — js-tools.org/blog/vlsi/vlsi-testbench
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator:  verilator --binary -Wall adder_testbench.sv && obj_dir/Vadder_testbench_tb
//   Icarus:     iverilog -g2012 -o sim adder_testbench.sv && vvp sim
//   Hoặc dán trực tiếp vào https://www.edaplayground.com

// ---------------------------------------------------------------------------
// ✅ Đúng
// ---------------------------------------------------------------------------
module adder4_correct (
  input  logic [3:0] a, b,
  output logic [3:0] sum,
  output logic        cout
);
  assign sum  = a + b;
  assign cout = (a + b) > 15;
endmodule

// ---------------------------------------------------------------------------
// 🐛 Bug 1: quên cộng có nhớ giữa các bit — chỉ XOR đơn thuần
// PASS trùng hợp khi a và b không "chồng" bit nào cùng bằng 1
// ---------------------------------------------------------------------------
module adder4_bug1 (
  input  logic [3:0] a, b,
  output logic [3:0] sum,
  output logic        cout
);
  assign sum  = a ^ b;            // SAI: thiếu lan truyền carry giữa các bit
  assign cout = (a + b) > 15;
endmodule

// ---------------------------------------------------------------------------
// 🐛 Bug 2: logic tính cờ nhớ (carry-out) sai hoàn toàn
// ---------------------------------------------------------------------------
module adder4_bug2 (
  input  logic [3:0] a, b,
  output logic [3:0] sum,
  output logic        cout
);
  assign sum  = a + b;
  assign cout = a > b;            // SAI: không liên quan gì tới tràn số
endmodule

// ---------------------------------------------------------------------------
// Self-checking testbench: golden model + quét toàn bộ 256 tổ hợp
// Đổi tên module DUT ở dòng "dut (...)" để thử adder4_correct / bug1 / bug2
// ---------------------------------------------------------------------------
module adder_testbench_tb;
  reg  [3:0] a, b;
  wire [3:0] sum;
  wire        cout;
  integer errors;
  integer i, j;

  // Đổi adder4_bug1 -> adder4_correct hoặc adder4_bug2 để so sánh
  adder4_bug1 dut (.a(a), .b(b), .sum(sum), .cout(cout));

  initial begin
    errors = 0;
    for (i = 0; i < 16; i = i + 1) begin
      for (j = 0; j < 16; j = j + 1) begin
        a = i; b = j;
        #10;
        // Golden model: công thức cộng số học thuần, độc lập với RTL
        if (sum !== ((i + j) & 4'hF) || cout !== ((i + j) > 15)) begin
          $display("FAIL: a=%0d b=%0d sum=%0d cout=%b (ky vong sum=%0d cout=%b)",
                    i, j, sum, cout, (i + j) & 4'hF, (i + j) > 15);
          errors = errors + 1;
        end
      end
    end

    if (errors == 0)
      $display("TAT CA 256 TO HOP DEU DUNG.");
    else
      $display("%0d / 256 to hop SAI.", errors);

    $finish;
  end
endmodule
