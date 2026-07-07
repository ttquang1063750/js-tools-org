// fsm_examples.sv — FSM đèn giao thông + Bộ phát hiện chuỗi bit 1011
// Bài 4: Máy trạng thái hữu hạn — js-tools.org/blog/vlsi/vlsi-fsm
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator (lint + mô phỏng):
//     verilator --lint-only fsm_examples.sv
//     verilator -Wall --cc fsm_examples.sv --exe testbench.cpp && make -C obj_dir -f Vfsm_examples_tb.mk
//   Hoặc dán trực tiếp vào https://www.edaplayground.com (chọn Icarus Verilog / Verilator).

// ---------------------------------------------------------------------------
// FSM đèn giao thông (Moore, template 3-process)
// ---------------------------------------------------------------------------
module fsm_traffic (
  input logic clk, rst,
  output logic red, yellow, green
);
  typedef enum {RED, GREEN, YELLOW} state_t;
  state_t state, next_state;

  // Process 1: thanh ghi trạng thái
  always_ff @(posedge clk) begin
    if (rst)
      state <= RED;
    else
      state <= next_state;
  end

  // Process 2: logic trạng thái kế tiếp
  always_comb begin
    case (state)
      RED:     next_state = GREEN;
      GREEN:   next_state = YELLOW;
      YELLOW:  next_state = RED;
      default: next_state = RED; // bắt buộc — tránh trạng thái treo
    endcase
  end

  // Process 3: logic output (Moore — chỉ phụ thuộc state)
  assign red    = (state == RED);
  assign yellow = (state == YELLOW);
  assign green  = (state == GREEN);
endmodule

// ---------------------------------------------------------------------------
// Bộ phát hiện chuỗi bit 1011 (Moore, cho phép chồng lấn/overlap)
// ---------------------------------------------------------------------------
module seq_detector_1011 (
  input logic clk, rst, bit_in,
  output logic detected
);
  typedef enum {IDLE, S1, S10, S101, FOUND} state_t;
  state_t state, next_state;

  always_ff @(posedge clk) begin
    if (rst)
      state <= IDLE;
    else
      state <= next_state;
  end

  always_comb begin
    case (state)
      IDLE:    next_state = bit_in ? S1    : IDLE;
      S1:      next_state = bit_in ? S1    : S10;
      S10:     next_state = bit_in ? S101  : IDLE;
      S101:    next_state = bit_in ? FOUND : S10;
      FOUND:   next_state = bit_in ? S1    : S10;
      default: next_state = IDLE;
    endcase
  end

  assign detected = (state == FOUND);
endmodule

// ---------------------------------------------------------------------------
// Testbench: kiểm tra chu trình đèn giao thông (3 chu kỳ) và bộ phát hiện
// chuỗi 1011 với dãy bit có 2 lần khớp chồng lấn: 1,0,1,1,0,1,1
// ---------------------------------------------------------------------------
module fsm_examples_tb;
  reg clk, rst, bit_in;
  wire red, yellow, green;
  wire detected;

  fsm_traffic dut_traffic (.clk(clk), .rst(rst), .red(red), .yellow(yellow), .green(green));
  seq_detector_1011 dut_detector (.clk(clk), .rst(rst), .bit_in(bit_in), .detected(detected));

  always #5 clk = ~clk;

  initial begin
    clk = 0; rst = 1; bit_in = 0;
    @(posedge clk); #1;
    rst = 0;

    $display("--- FSM den giao thong: 6 nhip ---");
    for (integer i = 0; i < 6; i = i + 1) begin
      $display("tick %0d: red=%b yellow=%b green=%b", i, red, yellow, green);
      @(posedge clk); #1;
    end

    rst = 1; @(posedge clk); #1; rst = 0;

    $display("--- Bo phat hien chuoi 1011: day bit 1,0,1,1,0,1,1 ---");
    begin
      integer bits[0:6];
      integer detections;
      bits[0]=1; bits[1]=0; bits[2]=1; bits[3]=1; bits[4]=0; bits[5]=1; bits[6]=1;
      detections = 0;
      for (integer i = 0; i < 7; i = i + 1) begin
        bit_in = bits[i];
        @(posedge clk); #1;
        $display("bit=%b detected=%b", bit_in, detected);
        if (detected) detections = detections + 1;
      end
      $display("So lan phat hien chuoi 1011: %0d", detections);
    end

    $display("Ket thuc mo phong.");
    $finish;
  end
endmodule
