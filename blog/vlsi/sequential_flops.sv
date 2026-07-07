// sequential_flops.sv — Counter 4-bit, PWM số, và thanh ghi dịch (đúng/sai)
// Bài 3: SystemVerilog tuần tự — js-tools.org/blog/vlsi/vlsi-sequential-flops
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator (lint + mô phỏng):
//     verilator --lint-only sequential_flops.sv
//     verilator -Wall --cc sequential_flops.sv --exe testbench.cpp && make -C obj_dir -f Vsequential_flops_tb.mk
//   Hoặc dán trực tiếp vào https://www.edaplayground.com (chọn Icarus Verilog / Verilator).

// ---------------------------------------------------------------------------
// Counter 4-bit với reset đồng bộ — tự cuộn vòng 15 -> 0
// ---------------------------------------------------------------------------
module counter4 (
  input logic clk, rst,
  output logic [3:0] count
);
  always_ff @(posedge clk) begin
    if (rst)
      count <= 4'b0000;
    else
      count <= count + 1;
  end
endmodule

// ---------------------------------------------------------------------------
// PWM số: counter + so sánh tổ hợp — thay thế PWM analog dùng IC 555
// ---------------------------------------------------------------------------
module pwm_digital (
  input logic clk, rst,
  input logic [3:0] duty,
  output logic pwm_out
);
  logic [3:0] count;

  always_ff @(posedge clk) begin
    if (rst)
      count <= 4'b0000;
    else
      count <= count + 1;
  end

  assign pwm_out = (count < duty) ? 1'b1 : 1'b0;
endmodule

// ---------------------------------------------------------------------------
// Thanh ghi dịch 2 tầng — kiểu SAI (blocking) vs kiểu ĐÚNG (non-blocking)
// ---------------------------------------------------------------------------
module shift_bad (
  input logic clk, d,
  output logic q1, q2
);
  always_ff @(posedge clk) begin
    q1 = d;   // BUG: blocking khiến q2 đọc phải giá trị q1 vừa gán cùng chu kỳ
    q2 = q1;
  end
endmodule

module shift_good (
  input logic clk, d,
  output logic q1, q2
);
  always_ff @(posedge clk) begin
    q1 <= d;  // Non-blocking: q2 đọc q1 CŨ (trước cạnh clock này) — đúng 2 tầng trễ
    q2 <= q1;
  end
endmodule

// ---------------------------------------------------------------------------
// Testbench: chạy counter 17 nhịp (kiểm tra wrap-around) và so sánh 2 thanh ghi
// dịch với cùng 1 xung d — in ra bằng chứng blocking làm mất 1 tầng trễ
// ---------------------------------------------------------------------------
module sequential_flops_tb;
  reg clk, rst, d;
  reg [3:0] duty;
  wire [3:0] count;
  wire pwm_out;
  wire q1_bad, q2_bad, q1_good, q2_good;

  counter4 dut_counter (.clk(clk), .rst(rst), .count(count));
  pwm_digital dut_pwm (.clk(clk), .rst(rst), .duty(duty), .pwm_out(pwm_out));
  shift_bad dut_bad (.clk(clk), .d(d), .q1(q1_bad), .q2(q2_bad));
  shift_good dut_good (.clk(clk), .d(d), .q1(q1_good), .q2(q2_good));

  always #5 clk = ~clk;

  initial begin
    clk = 0; rst = 1; d = 0; duty = 4;
    @(posedge clk); #1;
    rst = 0;

    $display("--- Counter 4-bit: 17 nhip (kiem tra wrap-around 15->0) ---");
    for (integer i = 0; i < 17; i = i + 1) begin
      @(posedge clk); #1;
      $display("tick %0d: count=%0d pwm=%b", i, count, pwm_out);
    end

    $display("--- Shift register: xung d=1 trong 1 nhip ---");
    d = 1;
    @(posedge clk); #1;
    $display("tick 1: d=%b | GOOD q1=%b q2=%b | BAD q1=%b q2=%b", d, q1_good, q2_good, q1_bad, q2_bad);
    d = 0;
    for (integer i = 0; i < 3; i = i + 1) begin
      @(posedge clk); #1;
      $display("tick %0d: d=%b | GOOD q1=%b q2=%b | BAD q1=%b q2=%b", i + 2, d, q1_good, q2_good, q1_bad, q2_bad);
    end

    if (q1_bad === q2_bad)
      $display("XAC NHAN BUG: ban BAD co q1===q2 (mat 1 tang tre) dung nhu du doan.");
    $display("Ket thuc mo phong.");
    $finish;
  end
endmodule
