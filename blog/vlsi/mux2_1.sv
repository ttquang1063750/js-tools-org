// mux2_1.sv — Mux 2-1 viết bằng 3 kiểu RTL (structural / dataflow / behavioral)
// Bài 1: Từ cổng logic đến RTL — js-tools.org/blog/vlsi/vlsi-rtl-mindset
//
// Cách chạy thật (ngoài RTL Playground trên trang):
//   Verilator (lint + mô phỏng):
//     verilator --lint-only mux2_1.sv
//     verilator -Wall --cc mux2_1.sv --exe testbench.cpp && make -C obj_dir -f Vmux2_1_tb.mk
//   Hoặc dán trực tiếp vào https://www.edaplayground.com (chọn Icarus Verilog / Verilator).
//
// Cả 3 module dưới đây có cùng bảng chân trị: y = s ? b : a
// Sau khi synthesis (vd bằng Yosys), cả 3 đều cho ra đúng netlist: 1 NOT + 2 AND + 1 OR.

// ---------------------------------------------------------------------------
// Kiểu 1: Structural — ghép nối cổng nguyên thủy (gate primitive) thủ công
// ---------------------------------------------------------------------------
module mux2_1_structural (
  input a, b, s,
  output y
);
  wire not_s, and_a, and_b;

  not NOT_GATE (not_s, s);
  and AND_A (and_a, a, not_s);
  and AND_B (and_b, b, s);
  or OR_GATE (y, and_a, and_b);
endmodule

// ---------------------------------------------------------------------------
// Kiểu 2: Dataflow — công thức Boolean trực tiếp bằng toán tử bitwise
// ---------------------------------------------------------------------------
module mux2_1_dataflow (
  input a, b, s,
  output y
);
  assign y = (a & ~s) | (b & s);
endmodule

// ---------------------------------------------------------------------------
// Kiểu 3: Behavioral — if/else, trình synthesis tự suy ra đây là multiplexer
// ---------------------------------------------------------------------------
module mux2_1_behavioral (
  input a, b, s,
  output reg y
);
  always @(a, b, s) begin
    if (s == 0)
      y = a;
    else
      y = b;
  end
endmodule

// ---------------------------------------------------------------------------
// Testbench tối giản: chạy đủ 8 tổ hợp a/b/s, so cả 3 module cho cùng kết quả
// ---------------------------------------------------------------------------
module mux2_1_tb;
  reg a, b, s;
  wire y_structural, y_dataflow, y_behavioral;

  mux2_1_structural  dut_structural  (.a(a), .b(b), .s(s), .y(y_structural));
  mux2_1_dataflow    dut_dataflow    (.a(a), .b(b), .s(s), .y(y_dataflow));
  mux2_1_behavioral  dut_behavioral  (.a(a), .b(b), .s(s), .y(y_behavioral));

  integer i;
  initial begin
    $display("a b s | structural dataflow behavioral");
    for (i = 0; i < 8; i = i + 1) begin
      {a, b, s} = i[2:0];
      #1;
      $display("%b %b %b |     %b          %b         %b", a, b, s, y_structural, y_dataflow, y_behavioral);
      if (!(y_structural === y_dataflow && y_dataflow === y_behavioral)) begin
        $display("MISMATCH tai a=%b b=%b s=%b", a, b, s);
        $finish;
      end
    end
    $display("Ca 3 kieu deu khop nhau tren toan bo 8 to hop dau vao.");
  end
endmodule
