// fpga_flow_example.sv — RTL cho bài thực hành Synthesis -> Place & Route -> Bitstream
// Bài 10: FPGA Flow — js-tools.org/blog/vlsi/vlsi-fpga-flow
//
// Cách chạy toàn bộ flow mã nguồn mở thật (không chỉ mô phỏng chức năng):
//   1. Synthesis:      yosys -p "read_verilog -sv fpga_flow_example.sv; synth_ice40 -top rca4 -json rca4.json"
//   2. Place & Route:  nextpnr-ice40 --hx8k --json rca4.json --pcf rca4.pcf --sdc rca4.sdc --asc rca4.asc
//   3. Sinh bitstream:  icepack rca4.asc rca4.bin
//   4. Nạp vào board:  openFPGALoader -b ice40_generic rca4.bin
//   (Cần board FPGA thật hỗ trợ toolchain mở, vd Lattice iCE40/ECP5 — xem link tài nguyên
//   ngoài cuối bài. Không có board vẫn chạy được bước 1-3 để tự đọc báo cáo timing thật.)
//   Mô phỏng chức năng (không cần toolchain FPGA): dán vào https://www.edaplayground.com

// ---------------------------------------------------------------------------
// rca4 — bộ cộng 4-bit dùng xuyên suốt Bài 6/8/9 (RCA gốc từ Bài 6), đóng vai
// trò "thiết kế thật" đi hết flow synthesis -> P&R -> bitstream trong bài này.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// rca4.sdc — ràng buộc timing THẬT (không phải SystemVerilog — cú pháp Tcl
// của Synopsys Design Constraints — đính kèm dạng comment để tiện tham khảo,
// lưu thành file .sdc riêng khi chạy nextpnr thật)
// ---------------------------------------------------------------------------
//
// ❌ SAI — file .sdc trống hoặc thiếu create_clock:
//   (không có gì cả, hoặc chỉ có set_input_delay/set_output_delay lẻ tẻ)
//   STA không có mục tiêu tần số nào để so sánh -> "no timing violations"
//   ở đây là báo cáo VÔ NGHĨA, không phải bằng chứng mạch đủ nhanh.
//
// ✅ ĐÚNG:
//   create_clock -name clk -period 10.0 [get_ports clk]     ;# muc tieu 100 MHz
//   set_input_delay  2.0 -clock clk [get_ports {a0 a1 a2 a3 b0 b1 b2 b3 cin}]
//   set_output_delay 2.0 -clock clk [get_ports {s0 s1 s2 s3 cout}]

// ---------------------------------------------------------------------------
// Testbench: kiểm tra rca4 đúng chức năng trên toàn bộ 512 tổ hợp TRƯỚC khi
// tốn thời gian chạy P&R — luôn xác minh logic đúng trước khi lo tới timing.
// ---------------------------------------------------------------------------
module fpga_flow_example_tb;
  reg a0, a1, a2, a3, b0, b1, b2, b3, cin;
  wire s0, s1, s2, s3, cout;
  integer errors;
  integer i, j, k;

  rca4 dut (.a0(a0), .a1(a1), .a2(a2), .a3(a3), .b0(b0), .b1(b1), .b2(b2), .b3(b3),
            .cin(cin), .s0(s0), .s1(s1), .s2(s2), .s3(s3), .cout(cout));

  initial begin
    errors = 0;
    for (i = 0; i < 16; i = i + 1) begin
      for (j = 0; j < 16; j = j + 1) begin
        for (k = 0; k < 2; k = k + 1) begin
          a0 = i[0]; a1 = i[1]; a2 = i[2]; a3 = i[3];
          b0 = j[0]; b1 = j[1]; b2 = j[2]; b3 = j[3];
          cin = k[0];
          #1;
          if ({cout, s3, s2, s1, s0} !== (i + j + k)) begin
            $display("LOI: a=%0d b=%0d cin=%0d ket qua=%0d ky vong=%0d",
                      i, j, k, {cout, s3, s2, s1, s0}, i + j + k);
            errors = errors + 1;
          end
        end
      end
    end
    if (errors == 0)
      $display("rca4 DUNG tren toan bo 512 to hop — an toan de di tiep synthesis/P&R.");
    else
      $display("%0d / 512 to hop SAI — sua RTL truoc, dung lo timing khi logic con sai.", errors);
    $finish;
  end
endmodule
