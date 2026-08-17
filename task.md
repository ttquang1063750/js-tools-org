# task.md — Beginner-proof series C ("Tự học lập trình C từ số 0")

> Nội dung bàn giao cũ của loạt NestJS đã được chủ repo cho phép xoá (16/08/2026).
> Bản gốc vẫn còn trong git history, và lịch sử rà lỗi runtime nằm ở `review-task.md`.

**Quyết định của chủ repo (16/08/2026):**

- Phạm vi: beginner-proof bản tiếng Việt **kèm dịch tiếng Anh thật** (không phải stub)
- Mức can thiệp: **deep** — được đảo thứ tự mục và viết bổ sung phần còn thiếu
- Đối tượng: hub ghi **"từ số 0"** → không giả định người đọc từng lập trình

## Trạng thái đầu vào (đo ngày 16/08/2026)

| Việc | Trạng thái |
|---|---|
| 12 bài tiếng Việt | Có thật, 736–2862 từ |
| 12 bài tiếng Anh | **Stub 50 từ** (tỷ lệ 0.02–0.07) — commit `614d933` sinh hàng loạt |
| `series/c/` scaffolding | **Chưa có** (mới có `aie`, `cpu`, `sysdesign`) |
| `plan.md` | Không có mục series C (đã publish, phần thiết kế đã gỡ) |

Chuẩn của series (đếm cả 12 bài, để không tự chế chuẩn mới): **0 SVG trong thân
bài**, **1 câu quiz/bài**. Sơ đồ pipeline ở Bài 1 vẽ bằng ASCII art trong khối
code — đó là phong cách của series, không phải lỗi.

---

## Bài 1 — `c-environment-setup` — PHÁT HIỆN (ghi trước khi sửa)

| # | Vị trí | Loại | Mô tả |
|---|--------|------|-------|
| F1 | §1 "Quy trình biên dịch" đối chiếu §2, §4 | Lệnh không chạy được + thứ tự sai | **Chặn ngay câu lệnh đầu tiên của bài.** §1 bảo *"hãy chạy lệnh"* `gcc -E hello.c`, `gcc -S hello.i`, `gcc -c hello.s` — nhưng compiler mãi **§2** mới cài, và `hello.c` mãi **§4** mới tạo. Người đọc làm đúng thứ tự sẽ gặp `command not found: gcc`, và kể cả có gcc cũng không có file để tiền xử lý. Chính bài tự thú nhận: §5 liệt kê `command not found: gcc` là "lỗi thường gặp" |
| F2 | §8, khối "Phiên GDB mẫu" | Lệnh không chạy được | Phiên mẫu chạy `gdb ./hello` rồi `print x` — nhưng `hello.c` chỉ có 6 dòng và **không có biến `x` nào**. Gõ đúng như bài: `No symbol "x" in current context.` Cả `next` cũng vô nghĩa trên chương trình một lệnh `printf` |
| F3 | §1, đoạn Giai đoạn 2–4 | Thuật ngữ dùng trước khi định nghĩa | Đổ lên đầu người **chưa viết dòng code nào**: mã Assembly, x86_64/ARM, `pushq/movq/call/ret`, "file đối tượng", "địa chỉ ô nhớ", `libc.a`/`libc.so`. Với mức "từ số 0" đây là bức tường ngay mục 1 |
| F4 | §2 "Cài đặt Compiler" đối chiếu Bài 2, 9, 11 | Phần còn thiếu | Bài 1 chỉ hướng dẫn **macOS + Linux**. Nhưng các bài sau **giả định có người đọc dùng Windows**: Bài 2 dạy `long` 4 byte *trên Windows*, Bài 9 nói stack Windows 1MB, Bài 11 đưa `#if defined(_WIN32)` + `#include <windows.h>`. Người dùng Windows không qua nổi Bài 1 nhưng tới Bài 11 lại được dạy macro Windows |
| F5 | §4, khối `hello.c` | Code không có phần hạ cánh | Khối code **quan trọng nhất cả series** (chương trình C đầu tiên) có dẫn đề mỏng (*"Nhập đoạn mã nguồn chuẩn mực sau"*) và **không một chữ nào giải thích sau đó** — đi thẳng sang "Lưu file lại". `#include`, `int main()`, `printf`, `\n`, `return 0` đều không được nói là gì |

### Cách xử lý đã chọn

- **F1** → đảo thứ tự (được phép ở mức deep): đưa phần đào sâu 4 giai đoạn xuống
  **sau** khi đã cài compiler và chạy được `hello.c`. Mục 1 giữ lại phần khái niệm
  "biên dịch khác thông dịch" (không có lệnh nào để chạy).
- **F2** → viết thêm một chương trình mẫu có biến để phiên GDB có nghĩa.
- **F3** → định nghĩa tại chỗ dùng đầu, kèm phép so sánh đời thường.
- **F4** → bổ sung đường Windows (WSL).
- **F5** → viết phần giải thích từng dòng cho `hello.c`.

## Tiến độ

- [x] **Bài 1 `c-environment-setup` — VI deep pass XONG** (16/08/2026).
      F1–F5 đã sửa hết; `check-lesson.js` 11/11, prettier sạch, thời gian đọc
      cập nhật 10 → 19 phút cho khớp 3164 từ.
- [x] **Bài 1 — bản EN THẬT: XONG** (16/08/2026). `blog/c/en/c-environment-setup.html`
      giờ là **2622 từ** (trước là stub 50 từ). Build lại 2 lần cho ra file giống
      hệt (idempotent). `check-lesson.js` 11/11 cả hai bản, prettier sạch.
      canonical/og trỏ `/en/`, `hreflang` vi/en/x-default đúng, đường dẫn tương
      đối đã lùi thêm một cấp, đã đăng ký vào `sitemap.xml` và `search-index.json`.
      Next-link khoá `--locked` vì Bài 2 chưa có bản EN.
- [x] **Bài 2 `c-basics-and-bitwise` — XONG CẢ HAI LOCALE** (16/08/2026).
      G1, G2, G3 đã sửa; G4 ghi nhận không sửa (lý do trong bảng). Bản EN 1072
      dòng, build 2 lần giống hệt, `check-lesson.js` 11/11 cả hai bản, đã đăng ký
      sitemap + search-index. Thời gian đọc 8 → 12 phút.
- [x] **Bài 3 `c-operators-and-bitwise` — XONG CẢ HAI LOCALE** (17/08/2026).
      60 dòng tiếng Việt trong code → tiếng Anh; thêm hạ cánh cho 6 khối; thời
      gian đọc 7 → 9 phút. Bản EN 1021 dòng.
- [x] **Bài 4 `c-control-flow` — XONG CẢ HAI LOCALE** (17/08/2026). Viết bổ sung
      hẳn mục `break`/`continue` (chủ đề thiếu hẳn: `continue` 0 lần trong cả bài
      dạy vòng lặp), kèm code đã chạy thật. 5 dòng code tiếng Việt → Anh, 1 hạ cánh,
      sửa tiêu đề quiz ghi nhầm "bài 3". Thời gian đọc 6 → 8 phút.
- [x] **Bài 5 `c-functions-and-recursion` — XONG CẢ HAI LOCALE** (17/08/2026).
      46 comment + 7 định danh tiếng Việt → Anh; 2 hạ cánh; sửa 4 chỗ prose còn
      tên hàm cũ sau khi đổi định danh. Nội dung chủ đề đầy đủ, không có lỗ hổng.
- [x] **Bài 6 `c-arrays-and-strings` — XONG CẢ HAI LOCALE** (17/08/2026).
      Khôi phục dấu toàn bài: **33/40 câu không dấu → 0**. Thêm 4 hạ cánh, thời
      gian đọc 9 → 8 phút. Bản EN 1137 dòng, 13 khối code, build 2 lần giống hệt.
- [ ] Bài 7 → 12 (cả VI lẫn EN). Dùng `audit-lesson.py` để rà nhanh từng bài.

---

## Bài 2 — `c-basics-and-bitwise` — PHÁT HIỆN (đọc 16/08/2026, chưa sửa)

| # | Vị trí | Loại | Mô tả |
|---|--------|------|-------|
| G1 | 5/6 khối code | Code không có dẫn đề lẫn hạ cánh | **Defect trội nhất của bài.** Chỉ `hello.c` có phần giải thích. Còn lại đều bị thả trơ: `variables.c` (13 dòng) → đi thẳng sang H2 §3; `sizeof_demo.c` (30 dòng) → thẳng sang callout stdint.h; `const_vs_define.c` (25 dòng) → thẳng sang H3 Enum; `enum_demo.c` (24 dòng) → thẳng sang H3 Ép kiểu; **`type_casting.c` (41 dòng) → đi thẳng vào quiz**. Không khối nào có câu nói trước "sắp xem gì, vì sao lúc này", cũng không có câu sau "vừa xảy ra gì, dòng nào mang điểm mấu chốt" |
| G2 | Cả 6 file code | Vi phạm quy tắc code dùng chung locale | **48 dòng** có tiếng Việt: comment (`// %d dung cho so nguyen`, `// === Ép kiểu ngầm định ===`, `// ⚠️ CẢNH BÁO: ...`) và cả chuỗi `printf` in nhãn trạng thái (`"Tuoi: %d"`, `"Diem"`, `"Xep loai"`). Skill quy định comment + chuỗi trạng thái LUÔN tiếng Anh vì khối code dùng chung hai locale (chỉ *dữ liệu mẫu* mới được giữ tiếng Việt — ở đây không phải). **Phải sửa TRƯỚC khi dịch**, nếu không builder sẽ báo sót tiếng Việt. Cùng loại lỗi đã sửa ở Bài 1 (9 comment Makefile/GDB) |
| G3 | §3 (scanf) | Thuật ngữ dùng trước khi định nghĩa | Với mức "từ số 0", ba thuật ngữ được dùng như đã biết: **Segmentation Fault**, **Undefined Behavior**, và **bộ đệm stdin / buffer**. Cả ba đều xuất hiện lần đầu ở đây, đều không có một câu giải thích nào |
| G4 | Slug `c-basics-and-bitwise` | Ghi nhận, **không sửa** | Slug hứa "bitwise" nhưng thân bài **0 nội dung bitwise** (đếm: `bitwise` 1 lần, `<<`/`>>`/xor = 0) — nội dung đó nằm ở Bài 3 `c-operators-and-bitwise` (26 lần). Tuy nhiên **`<h1>` và `<title>` đều trung thực** ("Cú pháp C cơ bản, Biến, Kiểu dữ liệu & Nhập xuất"), người đọc không thấy slug ở đâu ngoài URL. Đổi tên file sẽ phá URL đã index → **để nguyên**, chỉ ghi nhận |

### Thứ tự làm cho Bài 2 (đề xuất)

1. **G2 trước tiên** — 48 dòng comment/chuỗi sang tiếng Anh. Làm trước vì nó chặn khâu dịch.
2. G1 — viết dẫn đề + hạ cánh cho 5 khối. Đây là phần viết nhiều nhất.
3. G3 — định nghĩa 3 thuật ngữ ngay lần dùng đầu.
4. Dịch EN: đã có sẵn `series/c/config.json`, chỉ cần thêm
   `lessons/c-basics-and-bitwise.{body-en.html,meta-en.json}`.
   Nhớ: thân bài mở bằng một `<div>` trơn (Bài 1 vấp chỗ này), và khối quiz
   nằm TRONG thân bài.

### Nợ kỹ thuật cần biết

- **Phiên GDB ở §9 chưa chạy được trên máy viết bài.** `gdb` không có trên
  macOS ARM, `lldb` treo ở chế độ headless. Chương trình `debug_demo.c` thì
  **đã chạy thật** và in đúng `Total = 15`; các giá trị `0 → 1 → 3` trong phiên
  mẫu là suy ra từ vòng lặp chứ không phải chép từ output thật. Ai có máy Linux
  nên chạy lại phiên đó một lần để xác nhận.
- Chuẩn series: 0 SVG trong thân bài, 1 câu quiz/bài. Đã giữ nguyên, không tự
  nâng chuẩn cho riêng Bài 1.

## Lệnh cần chạy mỗi bài

```bash
D=.claude/skills/beginner-proof-series
python3 $D/next-lesson.py blog/c/c-programming-series.html
node check-lesson.js blog/c/<slug>.html
npx prettier --check blog/c/<slug>.html
```
