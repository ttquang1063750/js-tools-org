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
- [~] **Bài 1 — bản EN: ĐANG DỞ.** Đã xong phần khung, còn đúng một việc:
      - [x] `series/c/config.json`
      - [x] `series/c/lessons/c-environment-setup.meta-en.json` (title/desc/
            chromeSubs/tailSubs/codeTitles — next-link đã khoá thành `--locked`
            vì Bài 2 chưa có bản EN)
      - [x] Phía VI đã đủ hợp đồng song ngữ: `hreflang` vi/en/x-default, link
            "Read in English" trong hero, H1 + title + og sửa lại cho khớp việc
            đã thêm Windows
      - [ ] **CÒN LẠI: `lessons/c-environment-setup.body-en.html`** — bản dịch
            ~3200 từ, dùng placeholder. Bản đồ placeholder đã dò sẵn, dùng đúng
            các khoá dưới đây (builder sẽ BÁO LỖI và không ghi file nếu sót/sai):

        ```
        {{CODE:Terminal}}                    xcode-select --install
        {{CODE:Terminal (Ubuntu/Debian)}}    apt install build-essential
        {{CODE:Terminal (Fedora)}}           dnf groupinstall
        {{CODE:PowerShell (quyền quản trị)}} wsl --install
        {{CODE:Terminal#2}}                  gcc --version
        {{CODE:hello.c}}                     chuong trinh dau tien
        {{CODE:Terminal#3}}                  gcc hello.c -o hello
        {{CODE:Terminal#4}}                  ./hello
        {{CODE:Terminal#5}}                  lenh bien dich khi phat trien (muc 7)
        {{CODE:Terminal#6}}                  lenh bien dich khi phat hanh (muc 7)
        {{CODE:Makefile}}
        {{CODE:Terminal#7}}                  make / make clean
        {{CODE:debug_demo.c}}
        {{CODE:Terminal#8}}                  gcc -g -O0 debug_demo.c
        {{CODE:Terminal#9}}                  gdb ./debug_demo
        {{CODE:Phiên GDB mẫu}}
        ```

        Lưu ý khi viết template:
        - 5 khối `<pre>` KHÔNG nằm trong code-window (sơ đồ ASCII ở mục 1 và 4
          lệnh `gcc -E/-S/-c` ở mục 5) **không có placeholder** — phải chép
          nguyên văn vào template.
        - Thân bài = từ `<div class="article-body">` tới `<div class="article-related">`,
          nên **khối quiz nằm trong thân bài** và phải dịch trong template.
        - Bản EN hiện tại vẫn là stub 50 từ cho tới khi chạy được
          `build-lesson-en.py`.
- [ ] Bài 2 → 12 (cả VI lẫn EN)

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
