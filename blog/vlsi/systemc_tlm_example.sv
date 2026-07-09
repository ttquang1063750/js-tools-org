// systemc_tlm_example.sv — RTL tầng "đối chiếu" cho demo TLM vs RTL
// Bài 11: SystemC & Mô hình hoá mức hệ thống (TLM) — js-tools.org/blog/vlsi/vlsi-systemc-tlm
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator:  verilator --binary -Wall systemc_tlm_example.sv && obj_dir/Vsystemc_tlm_example_tb
//   Icarus:     iverilog -g2012 -o sim systemc_tlm_example.sv && vvp sim
//   Hoặc dán trực tiếp vào https://www.edaplayground.com
//
// SystemC/TLM THẬT (không phải SystemVerilog — cần g++ + thư viện SystemC,
// KHÔNG chạy được trên VeriLite/Verilator) — xem cài đặt tại
// https://www.accellera.org/downloads/standards/systemc
//   g++ -I$SYSTEMC_HOME/include -L$SYSTEMC_HOME/lib -lsystemc producer_tlm.cpp -o sim_tlm

// ---------------------------------------------------------------------------
// fifo_ctrl — ĐÚNG NGUYÊN VĂN từ Bài 7, dùng làm tầng RTL "đối chiếu tốc độ"
// với mô hình TLM trong bài này (chạy được trên VeriLite).
// ---------------------------------------------------------------------------
module fifo_ctrl (
  input  logic clk, rst,
  input  logic push, pop,
  output logic full, empty,
  output logic [3:0] count
);
  always_ff @(posedge clk) begin
    if (rst)
      count <= 0;
    else
      count <= (push && !full && pop && !empty) ? count :
                (push && !full)                 ? count + 1 :
                (pop && !empty)                  ? count - 1 :
                count;
  end

  assign full  = (count == 8);
  assign empty = (count == 0);
endmodule

// ---------------------------------------------------------------------------
// Testbench: đếm số CẠNH CLOCK (sự kiện mô phỏng RTL) cần thiết để truyền
// N_ITEMS qua FIFO, với GAP chu kỳ "chờ" giữa mỗi item — đúng con số demo
// tương tác trên trang hiển thị, tự kiểm chứng lại bằng $display.
// ---------------------------------------------------------------------------
module systemc_tlm_example_tb;
  parameter N_ITEMS = 10;
  parameter GAP = 200;

  reg clk, rst, push, pop;
  wire full, empty;
  wire [3:0] count;
  integer rtl_events;
  integer pushed;
  integer t;

  fifo_ctrl dut (.clk(clk), .rst(rst), .push(push), .pop(pop),
                 .full(full), .empty(empty), .count(count));

  always #5 clk = ~clk;

  initial begin
    clk = 0; rst = 1; push = 0; pop = 0;
    @(posedge clk); #1;
    rst = 0;
    rtl_events = 0;
    pushed = 0;

    for (t = 0; t < N_ITEMS * GAP + GAP; t = t + 1) begin
      push = ((t % GAP) == 0) && (pushed < N_ITEMS);
      pop  = ((t % 3) == 0);
      @(posedge clk); #1;
      rtl_events = rtl_events + 1;
      if (push) pushed = pushed + 1;
    end

    $display("--- Dem su kien mo phong: RTL vs TLM (GAP=%0d, N_ITEMS=%0d) ---", GAP, N_ITEMS);
    $display("RTL: %0d su kien (1 canh clock = 1 su kien, ke ca chu ky 'cho')", rtl_events);
    $display("TLM: %0d su kien (1 giao dich = 1 su kien, bo qua thoi gian cho)", N_ITEMS);
    $display("Ty le RTL/TLM: %0d lan", rtl_events / N_ITEMS);
    $display("Ket thuc mo phong.");
    $finish;
  end
endmodule
