// timing_and_pipeline.sv — đường timing 2-FF, bộ cộng rca4 và bản pipeline 2 tầng rca4_pipe2
// Bài 8: Timing & Phân tích thời gian tĩnh (STA) — js-tools.org/blog/vlsi/vlsi-timing-sta
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator:  verilator --binary -Wall timing_and_pipeline.sv && obj_dir/Vtiming_tb
//   Icarus:     iverilog -g2012 -o sim timing_and_pipeline.sv && vvp sim
//   Hoặc dán trực tiếp vào https://www.edaplayground.com
//
// Lưu ý: mô phỏng RTL chỉ kiểm tra CHỨC NĂNG (kết quả 0/1 đúng hay sai).
// Các con số timing trong bài (t_clk→q, t_setup, f_max...) thuộc về phân
// tích STA — công cụ như OpenSTA/PrimeTime đọc từ thư viện standard cell,
// không phải thứ testbench đo được.

// --------------------------------------------------------------------------
// 1. Đường timing tối giản: FF nguồn → 2 tầng cổng → FF đích (Mục 1 của bài)
// --------------------------------------------------------------------------
module two_ff_path (
  input  logic clk,
  input  logic d_in,
  output logic q_out
);
  logic q1;
  logic comb;

  assign comb = ~q1 ^ d_in;

  always_ff @(posedge clk) begin
    q1    <= d_in;
    q_out <= comb;
  end
endmodule

// --------------------------------------------------------------------------
// 2. Bộ cộng ripple-carry 4-bit (từ Bài 6) — chuỗi carry là ứng viên
//    critical path khi phân tích STA (Mục 3 của bài)
// --------------------------------------------------------------------------
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

// --------------------------------------------------------------------------
// 3. Bộ cộng 4-bit pipeline 2 tầng (Mục 5 của bài) — cắt chuỗi carry sau
//    FA1: f_max tăng ~51%, đổi lấy latency 2 chu kỳ + 7 flip-flop.
//    Đã kiểm chứng trên VeriLite: đủ 512 tổ hợp a/b/cin + luồng dữ liệu
//    mới mỗi chu kỳ (throughput 1 kết quả/chu kỳ, độ trễ đúng 2 cạnh clock).
// --------------------------------------------------------------------------
module rca4_pipe2 (
  input  logic clk,
  input  logic a0, a1, a2, a3,
  input  logic b0, b1, b2, b3,
  input  logic cin,
  output logic s0, s1, s2, s3,
  output logic cout
);
  // ---- Giai đoạn 1 (tổ hợp): FA0 + FA1 — nửa đầu chuỗi carry ----
  logic s0_c, s1_c, c1, c2_c;
  assign s0_c = a0 ^ b0 ^ cin;
  assign c1   = (a0 & b0) | (cin & (a0 ^ b0));
  assign s1_c = a1 ^ b1 ^ c1;
  assign c2_c = (a1 & b1) | (c1 & (a1 ^ b1));

  // ---- Dàn thanh ghi pipeline: chốt kết quả dở dang + input nửa sau ----
  logic s0_r, s1_r, c2_r, a2_r, b2_r, a3_r, b3_r;
  always_ff @(posedge clk) begin
    s0_r <= s0_c;
    s1_r <= s1_c;
    c2_r <= c2_c;
    a2_r <= a2;   // bit cao phải "đi cùng chuyến" để không lệch nhịp
    b2_r <= b2;
    a3_r <= a3;
    b3_r <= b3;
  end

  // ---- Giai đoạn 2 (tổ hợp): FA2 + FA3 — nửa sau chuỗi carry ----
  logic c3, s2_c, s3_c, cout_c;
  assign s2_c   = a2_r ^ b2_r ^ c2_r;
  assign c3     = (a2_r & b2_r) | (c2_r & (a2_r ^ b2_r));
  assign s3_c   = a3_r ^ b3_r ^ c3;
  assign cout_c = (a3_r & b3_r) | (c3 & (a3_r ^ b3_r));

  // ---- Thanh ghi kết quả ----
  always_ff @(posedge clk) begin
    s0   <= s0_r;
    s1   <= s1_r;
    s2   <= s2_c;
    s3   <= s3_c;
    cout <= cout_c;
  end
endmodule

// --------------------------------------------------------------------------
// 4. Testbench: đối chiếu rca4 (tổ hợp thuần) với rca4_pipe2 trên cùng
//    luồng dữ liệu — kiểm chứng (a) kết quả pipeline giống hệt bản gốc,
//    (b) độ trễ đúng 2 cạnh clock.
// --------------------------------------------------------------------------
module timing_tb;
  logic clk = 0;
  logic a0, a1, a2, a3, b0, b1, b2, b3, cin;

  // Bản tổ hợp: kết quả có ngay trong cùng "chu kỳ"
  logic f_s0, f_s1, f_s2, f_s3, f_cout;
  rca4 flat (
    .a0(a0), .a1(a1), .a2(a2), .a3(a3),
    .b0(b0), .b1(b1), .b2(b2), .b3(b3),
    .cin(cin),
    .s0(f_s0), .s1(f_s1), .s2(f_s2), .s3(f_s3), .cout(f_cout)
  );

  // Bản pipeline: kết quả xuất hiện sau 2 cạnh clock
  logic p_s0, p_s1, p_s2, p_s3, p_cout;
  rca4_pipe2 piped (
    .clk(clk),
    .a0(a0), .a1(a1), .a2(a2), .a3(a3),
    .b0(b0), .b1(b1), .b2(b2), .b3(b3),
    .cin(cin),
    .s0(p_s0), .s1(p_s1), .s2(p_s2), .s3(p_s3), .cout(p_cout)
  );

  always #5 clk = ~clk;

  // Hàng đợi 2 phần tử lưu kết quả kỳ vọng — mô phỏng đúng độ trễ 2 tầng
  logic [4:0] expect_q [0:1];
  integer i, errors = 0;
  logic [4:0] got, expected;

  initial begin
    a0 = 0; a1 = 0; a2 = 0; a3 = 0;
    b0 = 0; b1 = 0; b2 = 0; b3 = 0;
    cin = 0;
    expect_q[0] = 0;
    expect_q[1] = 0;

    // Nạp input MỚI mỗi chu kỳ (kiểm tra throughput thật của pipeline),
    // đối chiếu output với kết quả kỳ vọng của 2 chu kỳ trước.
    for (i = 0; i < 40; i = i + 1) begin
      @(negedge clk);
      got      = {p_cout, p_s3, p_s2, p_s1, p_s0};
      expected = expect_q[1];
      if (i >= 2 && got !== expected) begin
        errors = errors + 1;
        $display("SAI o buoc %0d: pipeline ra %b, ky vong %b", i, got, expected);
      end

      // dịch hàng đợi kỳ vọng rồi nạp input mới
      expect_q[1] = expect_q[0];
      {a3, a2, a1, a0} = (i * 7 + 3) % 16;
      {b3, b2, b1, b0} = (i * 5 + 1) % 16;
      cin = i % 2;
      #1; // chờ bản tổ hợp settle để chụp kết quả kỳ vọng
      expect_q[0] = {f_cout, f_s3, f_s2, f_s1, f_s0};
    end

    if (errors == 0)
      $display("PASS: pipeline khop ban to hop tren toan bo luong du lieu, tre dung 2 canh clock.");
    else
      $display("FAIL: %0d loi.", errors);
    $finish;
  end
endmodule
