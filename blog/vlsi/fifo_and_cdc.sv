// fifo_and_cdc.sv — FIFO controller, bộ đồng bộ 1-FF vs 2-FF, RAM/register file
// Bài 7: Bộ nhớ, FIFO & Clock Domain Crossing — js-tools.org/blog/vlsi/vlsi-fifo-cdc
//
// Cách chạy thật (ngoài demo tương tác trên trang):
//   Verilator:  verilator --binary -Wall fifo_and_cdc.sv && obj_dir/Vfifo_and_cdc_tb
//   Icarus:     iverilog -g2012 -o sim fifo_and_cdc.sv && vvp sim
//   Hoặc dán trực tiếp vào https://www.edaplayground.com

// ---------------------------------------------------------------------------
// RAM inference — ⚠️ dùng mảng bộ nhớ + indexing động, KHÔNG chạy trên VeriLite
// (demo tương tác trên trang chỉ mô phỏng fifo_ctrl bên dưới). Vẫn tổng hợp và
// mô phỏng đúng trên Verilator/Icarus/EDA Playground thật.
// ---------------------------------------------------------------------------
module ram_infer (
  input  logic clk,
  input  logic we,
  input  logic [7:0] addr,
  input  logic [7:0] din,
  output logic [7:0] dout
);
  logic [7:0] mem [0:255];

  always_ff @(posedge clk) begin
    if (we) mem[addr] <= din;
    dout <= mem[addr];
  end
endmodule

// ---------------------------------------------------------------------------
// Register file 2-read/1-write — ⚠️ cùng lý do, ngoài subset VeriLite
// ---------------------------------------------------------------------------
module regfile_2r1w (
  input  logic clk,
  input  logic we,
  input  logic [4:0] waddr, raddr1, raddr2,
  input  logic [31:0] wdata,
  output logic [31:0] rdata1, rdata2
);
  logic [31:0] regs [0:31];

  always_ff @(posedge clk) begin
    if (we) regs[waddr] <= wdata;
  end

  assign rdata1 = regs[raddr1];
  assign rdata2 = regs[raddr2];
endmodule

// ---------------------------------------------------------------------------
// FIFO đồng bộ — controller (đếm mức đầy, tránh cạm bẫy "wptr==rptr" nhập nhằng)
// Chạy được trên VeriLite — đây là module dùng cho demo tương tác trên trang.
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
// Bộ đồng bộ 1-FF (❌ không đủ an toàn) và 2-FF (✅ chuẩn công nghiệp)
// ---------------------------------------------------------------------------
module synchronizer_1ff_bad (
  input  logic clk, async_in,
  output logic sync_out
);
  always_ff @(posedge clk) begin
    sync_out <= async_in;
  end
endmodule

module synchronizer_2ff (
  input  logic clk, async_in,
  output logic sync_out
);
  logic ff1;
  always_ff @(posedge clk) begin
    ff1      <= async_in;
    sync_out <= ff1;
  end
endmodule

// ---------------------------------------------------------------------------
// Testbench: kiểm tra fifo_ctrl không bao giờ đầy/rỗng sai (đẩy quá tải, rút
// quá cạn), và so sánh độ trễ giữa bộ đồng bộ 1-FF và 2-FF trên cùng 1 tín hiệu
// ---------------------------------------------------------------------------
module fifo_and_cdc_tb;
  reg clk, rst, push, pop;
  wire full, empty;
  wire [3:0] count;
  integer errors;
  integer i;

  fifo_ctrl dut_fifo (.clk(clk), .rst(rst), .push(push), .pop(pop),
                       .full(full), .empty(empty), .count(count));

  reg async_in;
  wire sync1, sync2;
  synchronizer_1ff_bad dut_1ff (.clk(clk), .async_in(async_in), .sync_out(sync1));
  synchronizer_2ff     dut_2ff (.clk(clk), .async_in(async_in), .sync_out(sync2));

  always #5 clk = ~clk;

  initial begin
    clk = 0; rst = 1; push = 0; pop = 0; async_in = 0;
    @(posedge clk); #1;
    rst = 0;
    errors = 0;

    $display("--- FIFO: day 9 lan push lien tiep (depth=8, lan thu 9 phai bi bo qua) ---");
    for (i = 0; i < 9; i = i + 1) begin
      push = 1; pop = 0;
      @(posedge clk); #1;
      $display("push #%0d: count=%0d full=%b", i, count, full);
    end
    if (count !== 8 || full !== 1) begin
      $display("LOI: sau 9 lan push, ky vong count=8 full=1, thuc te count=%0d full=%b", count, full);
      errors = errors + 1;
    end

    $display("--- FIFO: rut 10 lan lien tiep (chi con 8 phan tu, lan thu 9-10 phai bi bo qua) ---");
    push = 0;
    for (i = 0; i < 10; i = i + 1) begin
      pop = 1;
      @(posedge clk); #1;
      $display("pop #%0d: count=%0d empty=%b", i, count, empty);
    end
    if (count !== 0 || empty !== 1) begin
      $display("LOI: sau 10 lan pop tu 8 phan tu, ky vong count=0 empty=1, thuc te count=%0d empty=%b", count, empty);
      errors = errors + 1;
    end
    pop = 0;

    if (errors == 0)
      $display("FIFO controller: KHONG BAO GIO day/rong sai.");
    else
      $display("%0d loi phat hien o FIFO controller.", errors);

    $display("--- So sanh do tre bo dong bo 1-FF vs 2-FF (tin hieu doi tai t=0) ---");
    async_in = 1;
    for (i = 0; i < 4; i = i + 1) begin
      @(posedge clk); #1;
      $display("chu ky %0d: sync1(1-FF)=%b sync2(2-FF)=%b", i, sync1, sync2);
    end
    $display("Ket luan: 1-FF on dinh sau 1 chu ky, 2-FF sau 2 chu ky (them 1 chu ky de");
    $display("ff1 noi bo co thoi gian on dinh truoc khi ff2 lay mau).");

    $display("Ket thuc mo phong.");
    $finish;
  end
endmodule
