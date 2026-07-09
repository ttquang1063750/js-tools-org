// asic_flow_example.sv — clock gating ❌ tự chế vs ✅ latch-based chuẩn ICG
// Bài 12: ASIC Flow mã nguồn mở: Standard Cell → GDSII
// js-tools.org/blog/vlsi/vlsi-asic-flow
//
// Cách chạy toàn bộ flow ASIC mã nguồn mở thật (không chỉ mô phỏng chức năng):
//   docker run -v $(pwd):/work -it efabless/openlane:latest \
//     ./flow.tcl -design rca4 -tag run1
//   (cần thư viện SkyWater 130nm PDK, xem https://github.com/google/skywater-pdk)
//   Mô phỏng chức năng thuần (không cần OpenLane): dán vào https://www.edaplayground.com
//
// .lib (Liberty timing/power) và .lef (hình học) THẬT — không phải SystemVerilog,
// KHÔNG chạy được trên VeriLite/Verilator — xem ví dụ đầy đủ trong bài viết.

// ---------------------------------------------------------------------------
// ❌ SAI: tự chế clock gating bằng cổng AND thường — "sạch" trên FPGA (mạng
// clock buffer toàn cục dung sai glitch), nhưng có thể tạo glitch THẬT trên
// đường clock khi tổng hợp ASIC nếu `enable` đổi sát cạnh clock.
// ---------------------------------------------------------------------------
module clock_gate_bad (
  input  logic clk, enable,
  output logic gated_clk
);
  assign gated_clk = clk & enable;
endmodule

// ---------------------------------------------------------------------------
// ✅ ĐÚNG: latch chốt `enable` khi clk đang mức THẤP — đảm bảo enable đã ổn
// định trước khi AND với clk, không bao giờ tạo glitch bất kể enable đổi lúc
// nào. Tool tổng hợp ASIC nhận diện đúng khuôn mẫu này và tự thay bằng cell
// Integrated Clock Gating (ICG) chuyên dụng của thư viện standard cell.
//
// ⚠️ Ngoài subset VeriLite: engine trang này (đúng thiết kế — xem
// vlsi-verilite.js) không suy luận latch từ `if` thiếu `else` bên trong
// always_latch (chỉ nhận if/else ĐẦY ĐỦ), nên enable_latched sẽ không được
// gán nếu chạy qua VeriLite. Chạy thật trên Verilator/Icarus/EDA Playground
// (đều suy luận latch đúng chuẩn IEEE 1800) để thấy hành vi thật.
// ---------------------------------------------------------------------------
module clock_gate_good (
  input  logic clk, enable,
  output logic gated_clk
);
  logic enable_latched;

  always_latch begin
    if (!clk) enable_latched = enable;
  end

  assign gated_clk = clk & enable_latched;
endmodule

// ---------------------------------------------------------------------------
// Testbench: kiểm tra CẢ 2 phiên bản cho cùng kết quả chức năng khi enable
// chỉ đổi lúc clk đang THẤP (trường hợp "an toàn", không có glitch để thấy
// khác biệt về mặt chức năng thuần — khác biệt thật giữa 2 bản nằm ở việc có
// glitch trên đường clock hay không, thứ mô phỏng chức năng KHÔNG bắt được,
// cần mô phỏng gate-level có delay thật hoặc STA để thấy).
// ---------------------------------------------------------------------------
module asic_flow_example_tb;
  reg clk, enable;
  wire gated_bad, gated_good;
  integer errors;
  integer i;

  clock_gate_bad  dut_bad  (.clk(clk), .enable(enable), .gated_clk(gated_bad));
  clock_gate_good dut_good (.clk(clk), .enable(enable), .gated_clk(gated_good));

  initial begin
    errors = 0;
    clk = 0;
    for (i = 0; i < 8; i = i + 1) begin
      enable = i[0];
      clk = 0; #1;
      clk = 1; #1;
      if (gated_bad !== gated_good) begin
        $display("LECH CHUC NANG: i=%0d enable=%b gated_bad=%b gated_good=%b",
                  i, enable, gated_bad, gated_good);
        errors = errors + 1;
      end
    end
    if (errors == 0)
      $display("Chuc nang giong nhau khi enable doi luc clk THAP (dung ky vong).");
    else
      $display("%0d lan lech chuc nang.", errors);
    $display("Luu y: khac biet THAT giua 2 ban nam o GLITCH tren duong clock");
    $display("khi enable doi SAT canh clock — mo phong chuc nang thuan KHONG");
    $display("bat duoc dieu nay, can STA/gate-level mo phong co delay that.");
    $finish;
  end
endmodule
