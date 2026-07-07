# check-lesson.md — Checklist bắt buộc cho MỖI trang bài học

> **Nguồn duy nhất (single source of truth)** cho quy tắc viết & duyệt 1 trang bài học blog.
> Tách ra từ `plan.md` ngày 2026-07-06 vì các lỗi căn bản (canonical sai, quiz không chạy,
> thẻ HTML lồng sai, callout không tồn tại...) đã lặp lại quá nhiều lần trên hàng chục file
> trước khi bị phát hiện. `plan.md` vẫn là nơi chứa **thiết kế nội dung** (đề cương, tech
> stack, đề bài) — file này là nơi chứa **quy tắc kỹ thuật/QA**, độc lập với series nào.

## Cách dùng file này

- **Trước khi viết 1 bài** → đọc **PHẦN A**.
- **Trong lúc viết** → tuân theo **PHẦN B** (cấm gì / phải dùng gì).
- **Trước khi báo "xong"** → chạy đủ **PHẦN C**, từng lệnh một, không đoán bằng mắt. Đây là
  phần quan trọng nhất — mọi lỗi liệt kê ở PHẦN D đều có thể bị bắt bởi một lệnh ở đây.
- Nếu bạn sắp nói "bài này ổn rồi" mà chưa chạy hết PHẦN C → chưa được nói.
- **PHẦN D** là nhật ký lỗi thật đã xảy ra trong repo này — đọc để hiểu _vì sao_ mỗi rule tồn
  tại, không phải quy tắc suông. Cập nhật thêm khi phát hiện lỗi mới, đừng xoá.

---

## PHẦN A — Trước khi viết (Pre-flight)

1. **Đọc đề cương của đúng bài đó** trong `plan.md` Phần III (mục H2 tối thiểu N.1–N.4) —
   không tự bịa dàn bài khác với đề cương đã chốt.
2. **Kiểm tra phụ thuộc kiến thức:** bài chỉ được dùng khái niệm của bài số nhỏ hơn (cùng
   series hoặc series tiên quyết). Nếu bắt buộc dùng trước → đóng khung "ví dụ nếm trước" +
   callout `--note` ghi rõ "sẽ học ở Bài N".
3. **Chọn đúng file mẫu để copy chrome** (header hamburger nav + footer full nav): dùng bài
   mới nhất đã hoàn thành **cùng series**, không tự viết lại từ đầu.
   - **Bao gồm cả khối "Mở đầu"** (xem PHẦN D #12): `<h2>Mở đầu: <hook riêng của bài></h2>` +
     2 đoạn văn + `<hr />`, đặt ngay sau `<div class="article-body">`, trước khối "Điều kiện
     tiên quyết". Đoạn 1 nêu bối cảnh/tình huống liên hệ được hoặc hậu quả cụ thể nếu hiểu
     sai; đoạn 2 preview ngắn gọn nội dung + giá trị đạt được cuối bài. Không nhảy thẳng vào
     `<h2>1. ...</h2>` — lỗi này không lộ ra qua lệnh grep/prettier nào, chỉ tự nhận ra khi
     đọc lại toàn bài như người dùng thật.
4. **Xác định trước danh sách file phụ** cần tạo cùng lúc: file `.js` co-located (nếu bài có
   demo tương tác), entry cần thêm vào hub/sitemap/search-index/root `index.html`.
5. **Kiểm tra series này có quy tắc riêng đè lên quy tắc chung không** (vd: series Điện Tử
   **cấm** dùng `.code-window` code JS thực hành — chỉ dùng JS làm engine ngầm cho
   simulator, xem `plan.md` Series 10 §5 mục 9). Đọc mục "Quy tắc thiết kế" / "Quality
   Contract" riêng của series trong `plan.md` trước khi áp rule mặc định.
6. **Riêng Series 11 (VLSI):** mẫu tham chiếu cho "demo tương tác + quiz + file tải về" đã
   xác minh chạy đúng là `blog/vlsi/vlsi-rtl-mindset.html` (Bài 1, xem PHẦN D #10). **Copy
   nguyên khối pattern JS** của bài đó cho các bài sau, không viết lại từ đầu:
   - Cấu trúc `.code-tabs` gồm 1 panel "Xem trước" (demo tương tác thật) + N panel code
     (`.code-window` cho từng kiểu/biến thể) — xem khối `#mux-tour` làm mẫu.
   - Script `type="module"` cuối `<body>` (trước `<footer>`) import trực tiếp từ engine dùng
     chung `vlsi-verilite.js` (`VeriLiteParser`) và `vlsi-netlist-svg.js`
     (`NetlistRenderer`/`elaborateAST`/`simulateGates`) — KHÔNG copy-paste lại logic
     parser/simulator vào từng bài.
   - Pattern 3 phần trong demo: **style-selector** (nút chọn biến thể code đang mô phỏng) +
     **input-toggle** (nút bấm đổi từng tín hiệu 0/1) + render netlist SVG có tô sáng dây
     đang mang giá trị 1 (`activeSignals`) — tái sử dụng y hệt tên hàm
     `renderXxxDemo()`/`initXxxDemo()` và cách gọi `elaborateAST` + `simulateGates` đã verify
     đúng, chỉ đổi code mẫu (`muxCode` → tên biến phù hợp bài) và id phần tử DOM.
   - Nếu bài cần mở rộng engine (cú pháp SV mới chưa parse được) → sửa trực tiếp
     `vlsi-verilite.js`/`vlsi-netlist-svg.js` dùng chung, KHÔNG fork riêng bản sao cho từng
     bài — viết lại self-test bằng `node --input-type=module -e "..."` (xem PHẦN D #10) để
     xác nhận không phá vỡ các bài trước đã dùng engine này.

---

## PHẦN B — Quy tắc bắt buộc khi viết

### Ngôn ngữ & nội dung

- **Series mới (từ DSA 2026-07-03 trở đi — gồm Điện Tử, VLSI): CHỈ TIẾNG VIỆT.** Không dùng
  cặp `data-lang-content="en"`/`"vi"`, không có div `en` với text "chỉ có tiếng Việt". Header
  /footer/nav vẫn giữ `data-i18n` (chrome dùng chung site, không đổi). Series cũ (C, C++, JS,
  Canvas, WebGL, Bash, WebGPU, CSS) đã lỡ song ngữ thì giữ nguyên, không viết lại.
- **Lưu ý riêng Series Điện Tử:** Khi giới thiệu hoặc đề cập đến bất kỳ linh kiện bán dẫn hay chip thật nào (như đi-ốt 1N4007, transistor TIP120/IRF540N, IC 555, vi điều khiển ATmega328P, PIC16F877A, STM32F103, ESP32), **bắt buộc** phải chèn liên kết (`<a>` với `target="_blank"` và `rel="noopener noreferrer"`) dẫn đến datasheet chính thức từ nhà sản xuất gốc (như Microchip, Texas Instruments, Infineon, STMicroelectronics, Espressif).
- **Không dùng `<blockquote>[!NOTE]` kiểu GitHub-alert** — trang tĩnh không render cú pháp
  này, người đọc thấy nguyên chữ `[!NOTE]`. Dùng component `.callout--*`.
- **Chỉ 5 class callout có thật trong `blog.css`**: `--note`, `--tip`, `--warning`,
  `--pitfall`, `--deep`. Không tự chế class mới (`--danger` từng bị dùng, không có CSS, im
  lặng không hiển thị gì khác biệt).
- **Nếu cần một component mới ngoài `.callout`** (vd `.example-box`) → PHẢI thêm CSS cho nó
  vào `blog.css` **trong cùng commit**. Không viết class rồi để trống, không kiểm tra lại.
- **Danh sách bước = `<ol>`/`<ul>` thật.** Cấm dồn "1. … 2. …" hay "\* …" vào một `<p>` nối
  bằng `<br />`.
- **Không để markdown thô chưa convert**: `**text**` phải là `<strong>`, `` `code` `` phải là
  `<code>`.
- **Không để khối nội dung nào bị ẩn bằng `style="display: none"`** trừ khi đó là phần toggle
  ngôn ngữ hợp lệ của series cũ. Một khối `.article-refs`/`.article-related`/quiz bị giấu đi
  nghĩa là nó **không tồn tại** với người đọc — không được tính vào rubric.

### Công thức & code

- **Mọi công thức qua KaTeX local** (`$…$` inline, `$$…$$` block), không CDN. Test thực tế
  không được để hiện `$...$` thô.
- **Trong `\text{...}` chỉ dùng ký tự ASCII** — dấu tiếng Việt (ạ/ớ/ử...) làm vỡ glyph KaTeX.
- **Cẩn thận escape sequence bị corrupt thành ký tự điều khiển thật** (xem PHẦN D #6): nếu
  copy/paste qua nhiều lớp công cụ, `\t`, `\f`, `\n` trong chuỗi có thể bị một lớp nào đó hiểu
  thành TAB/form-feed/newline thật thay vì giữ nguyên 2 ký tự `\` + chữ cái. Hậu quả: `\text`
  → TAB + `ext`, `\times` → TAB + `imes`, `\frac` → `rac`, `\tau` → mất chữ. Luôn grep
  `\t(ext|imes|au|frac|circ)\{` (regex có TAB thật) sau khi dán nội dung từ nguồn ngoài.
- **Demo tương tác bọc trong `.code-tabs`** (Preview | ngôn ngữ chính | JavaScript) — không
  dùng lại nút `⟨⟩ Xem Code` đơn lẻ kiểu cũ, trừ khi series đó có quy tắc riêng cấm code hẳn.
- **Quiz phải dùng ĐÚNG MỘT cơ chế đã kiểm chứng chạy được** (xem PHẦN D #5 — 2 lớp bài đã
  gọi sai signature hàm và nút "Kiểm tra" không làm gì cả khi bấm):
  - Mẫu A (khuyên dùng, đã xác minh hoạt động): mỗi lựa chọn là 1 `<button class="quiz-option">`
    với `onclick="checkQuiz(this, true/false, 'giải thích')"` — hàm `checkQuiz` trong `ide.js`
    nhận **phần tử DOM** làm tham số đầu, KHÔNG nhận chuỗi.
  - Nếu dùng mẫu radio + nút submit riêng: PHẢI tự viết JS xử lý `data-answer` trong file
    `.js` co-located của chính bài đó (không gọi `checkQuiz('id', 'letter', text)` — chữ ký
    đó không khớp hàm toàn cục và sẽ ném lỗi `TypeError` khi bấm).
  - Sau khi viết quiz, **bấm thử từng đáp án** (không chỉ đọc code) để chắc chắn có phản hồi.

### Liên kết & tích hợp

- **Canonical + meta description PHẢI khớp chính trang đó** — không copy nguyên khối
  `<head>` từ bài khác rồi quên sửa (xem PHẦN D #4, lặp lại **9 lần** trong 1 series). Sau
  khi tạo file mới, luôn diff lại `<title>` / `canonical` / `description` xem có nhất quán
  với nhau không.
- **Tài liệu tham khảo (`.article-refs`) bắt buộc hiển thị trực quan và đúng nội dung bài:** Không được để khối `.article-refs` bị ẩn bằng `style="display: none"`, và không copy-paste tài liệu của bài học khác làm placeholder. Mỗi bài phải chứa liên kết chính xác dẫn tới các nguồn uy tín (Wikipedia, Khan Academy, All About Circuits) và datasheet chính thức của các linh kiện/chip thật được giới thiệu trong bài học.
- **Link `.article-related` prev/next phải trỏ đúng bài liền kề theo số thứ tự thật** (đối
  chiếu hub), không tự tham chiếu chính mình, không nhảy cóc qua 1 bài (xem PHẦN D #3).
- Hub → từng bài (đúng thứ tự, slug không đuôi `.html`); `.lessons-list` trên hub khớp 100%
  file thực tế đã tạo.
- Thêm `a.blog-card` vào `blog/index.html` **và** `a.learn-card` vào **ROOT** `index.html`
  (khác `blog/index.html`, dễ nhầm, đã sót 2 lần ở series cũ) — số lượng 2 bên phải khớp.
- Thêm entry vào `sitemap.xml` và `blog/search-index.json` (heading H2 phải khớp thật với
  bài, không để sót heading cũ sau khi sửa cấu trúc bài).

---

## PHẦN C — Checklist TRƯỚC KHI BÁO "XONG" (chạy thật, không đoán)

Thay `<file>` bằng đường dẫn bài vừa viết/sửa.

### C1. Lệnh tự động — bắt buộc chạy, không được bỏ qua

```bash
# 1. Prettier PHẢI pass sạch — đây là bẫy rẻ nhất bắt lỗi lồng thẻ (div thiếu/thừa).
#    Nếu lỗi "Unexpected closing tag ..." → có thẻ mở/đóng lệch tầng, xem PHẦN D #7.
npx prettier --check <file>

# 2. Không còn markdown thô / component cấm / wrapper ngôn ngữ cũ trong thân bài
grep -n 'data-lang-content\|\[!NOTE\]\|callout--danger\|callout--[a-z]*"' <file> \
  | grep -v 'callout--note\|callout--tip\|callout--warning\|callout--pitfall\|callout--deep'

# 3. Không còn ký tự TAB/control corrupt trong công thức LaTeX
grep -nP '\t(ext|imes|au|frac|circ)\{' <file>

# 4. Không còn khối ẩn (display:none) ngoài mục đích toggle ngôn ngữ hợp lệ
grep -n 'style="display: *none"' <file>

# 5. canonical trong <head> phải chứa đúng tên file (không đuôi .html)
grep -o 'canonical" href="[^"]*"' <file>   # tự so bằng mắt với tên file

# 6. Đếm rubric tối thiểu (điều chỉnh số theo yêu cầu series)
grep -c 'class="code-window"' <file>       # ví dụ code chạy được (nếu series yêu cầu)
grep -c 'callout callout--' <file>         # tổng callout, cần ≥3 và ≥1 pitfall
grep -c 'quiz-container\|quiz-question' <file>
grep -c '<abbr' <file>

# 7. Footer PHẢI khớp 100% với 1 file mẫu đã đúng cùng series/dự án — KHÔNG tự viết tay,
#    KHÔNG tự chế thêm/bớt link (xem PHẦN D #8: từng bị bịa "GitHub"/"Feedback" không tồn
#    tại, đồng thời thiếu Image Optimizer/Remove BG/QR/ColorQuarium/About/Contact/Privacy).
#    Luôn COPY nguyên khối <footer>...</footer> từ file mẫu, chỉ sửa phần nội dung bài
#    (không đụng vào nav footer). Diff để xác nhận thay vì đọc bằng mắt:
diff <(awk '/<footer class="site-footer">/,/<\/footer>/' <file>) \
     <(awk '/<footer class="site-footer">/,/<\/footer>/' <file-mẫu-cùng-series-đã-đúng>)

# 8. Link điều hướng bài viết (.article-related__link): mũi tên ← → là do CSS ::before/::after
#    tự thêm dựa theo class (--prev = ←, --next = → sau text, mặc định không class = → trước
#    text). KHÔNG BAO GIỜ gõ tay mũi tên "←"/"→" trong text — sẽ bị chồng lên mũi tên CSS,
#    ra 2 mũi tên (cùng hướng hoặc ngược hướng, xem PHẦN D #9). Kiểm tra không còn mũi tên
#    viết tay:
grep -n 'article-related__link' -A 2 <file> | grep -P '[←→]'
#    Nếu lệnh trên có output → xoá mũi tên khỏi text, để CSS tự vẽ.
#    Đối chiếu thêm: bài đầu series (không có bài trước) chỉ có 2 link (next, về hub) theo
#    thứ tự next trước — hub sau; bài giữa series có đủ 3 link (prev, next, hub) cùng thứ tự.

# 9. Div nội dung bài PHẢI có class="article-body" (không phải <div> trơn) — 15 rule CSS
#    trong blog.css (h2/h3/p/ul/ol/li/strong/a/inline-code/table...) chỉ áp dụng khi có class
#    này bao ngoài (xem PHẦN D #11: thiếu class này khiến bảng mất hết border mà KHÔNG có
#    lỗi cú pháp/console nào cả — chỉ lộ ra khi nhìn ảnh chụp thật).
grep -c 'class="article-body"' <file>
#    Phải ra đúng 1. Nếu ra 0 → tìm div bọc nội dung ngay dưới .article-wrap, thêm class.

# 10. Link "bài kế tiếp" trong .article-related__link--next KHÔNG được trỏ tới 1 bài chưa
#     viết (mới nhất chỉ được unlock TỚI bài vừa hoàn thành) — nếu không, người đọc bấm vào
#     sẽ dính 404. Nếu bài kế tiếp chưa tồn tại: đổi <a href="...veil"> thành
#     <span class="article-related__link article-related__link--next article-related__link--locked">
#     kèm 🔒 + "— sắp ra mắt" (pattern --locked đã có sẵn trong blog.css, trước đây chỉ dùng cho
#     "hết series"; giờ cũng dùng cho "bài kế tiếp chưa viết" giữa series, xem PHẦN D #13).
grep -A 1 'article-related__link--next"' <file> | grep -o 'href="[^"]*"'
#    Nếu có output (tức đang là <a href>) → xác nhận file đó đã tồn tại thật (ls <slug>.html),
#    nếu chưa tồn tại thì đổi sang <span>...--locked</span> như trên.
```

### C2. Kiểm tra thủ công trên trình duyệt

- Mở bài trong preview, xem console — **0 lỗi**.
- Công thức KaTeX render đúng, không còn `$...$` thô.
- Bấm thử **từng lựa chọn quiz** — phải có phản hồi đúng/sai, không có `TypeError` trong
  console.
- Nếu có simulator: thử các trạng thái biên (0%, 100%, tắt tính năng an toàn...) — mọi trạng
  thái "trông như lỗi" (0.00, OL, mạch hở) phải có chú thích trên UI giải thích đó là kết quả
  đúng, không phải demo hỏng.
- Bấm link "bài trước" / "bài sau" — phải đến đúng bài liền kề, không vòng lại chính mình.
- Responsive nhanh ở mobile <600px.

### C3. Tích hợp chéo file

- [ ] Hub (`*-programming-series.html`): bài mới đã mở khóa (`is-locked` → link thật), badge
      "Mới" chuyển từ bài trước sang bài này.
- [ ] `sitemap.xml`: có `<url>` cho bài mới.
- [ ] `blog/search-index.json`: có entry, `headingsVi` khớp đúng H2 thật của bài (không phải
      cấu trúc cũ trước khi sửa).
- [ ] `plan.md`: cập nhật tiến độ `X/N` ở bảng đầu file.
- [ ] Nếu là bài đầu tiên của 1 series mới: đã thêm `a.learn-card` ở ROOT `index.html`.

---

## PHẦN D — Nhật ký lỗi thật (đọc để hiểu vì sao rule tồn tại)

> Ghi theo thời gian, không xoá — mục đích là để agent sau không đoán "chắc không sao đâu"
> với đúng loại lỗi đã từng xảy ra.

1. **2026-07-05, Bài 1 điện tử:** `<blockquote>[!NOTE]` hiện nguyên chữ `[!NOTE]` trên trang
   (không render); danh sách "1. … 2. …" dồn vào `<p>` bằng `<br />` đọc rối; class
   `callout--danger` không tồn tại trong `blog.css`; thiếu MOSFET/IC/cuộn cảm so với đề
   cương; simulator hiện `0.00`/`OL` không giải thích khiến tưởng demo hỏng. → sinh ra
   PHẦN B mục ngôn ngữ/callout/danh sách + C2 dòng "trạng thái biên".
2. **2026-07-05, Bài 1 review vòng 2:** một commit sau đó **xoá luôn simulator** để thay bằng
   bài toán tính toán mở rộng, vi phạm đề cương gốc (demo tương tác là bắt buộc) và bỏ luôn
   toàn bộ `.code-window`. → bài học: sửa lỗi không được xoá tính năng đã yêu cầu, phải review
   lại đúng đề cương trước khi coi là xong.
3. **2026-07-06, Bài 14 (555 Timer):** canonical + meta description trỏ nguyên sang
   `electronics-ac-complex-impedance` (Bài 5) — copy `<head>` từ bài khác rồi quên sửa. Link
   prev nhảy cóc qua Bài 13 để trỏ Bài 12; link next tự ghi tên **chính bài 14** kèm khoá 🔒
   thay vì Bài 15. `.article-refs` bị `display:none` và chứa link của Bài 3 (Kirchhoff/MNA).
   0 callout `--pitfall` dù IC 555 có 2 lỗi đấu dây kinh điển (RESET thả nổi, thiếu tụ lọc
   CTRL). `.example-box` dùng ở ~11 file nhưng **chưa từng có CSS** — hộp "Ví dụ" hiện ra như
   văn bản thường, không viền không màu. → sinh ra PHẦN B mục canonical/refs/pitfall/component
   mới phải có CSS.
4. **2026-07-06, rà soát Bài 3–13:** phát hiện **9/11 bài** (Bài 5–13) đều copy y hệt
   canonical+meta description của Bài 5 — cùng 1 lỗi lặp lại 9 lần vì không ai diff lại `<head>`
   sau khi nhân bản file mẫu.
5. **2026-07-06, Bài 4 & 5:** nút "Kiểm tra" của quiz gọi `checkQuiz('q1', 'c', 'text')`
   (truyền chuỗi ID + chữ cái đáp án), nhưng hàm thật trong `ide.js` có chữ ký
   `checkQuiz(optionBtn, isCorrect, explanation)` — tham số đầu phải là **phần tử DOM** vì hàm
   gọi `.closest()` trên nó. Gọi bằng chuỗi ném `TypeError` ngay khi bấm, quiz không chấm được
   dù nội dung câu hỏi hoàn toàn đúng. Không phát hiện được nếu chỉ đọc code, phải **bấm thử
   thật**.
6. **2026-07-06, Bài 7 & 8:** quiz chứa ký tự **TAB thật** thay cho `\text`/`\times` (ví dụ
   `100⟨TAB⟩ext{Hz}` thay vì `100\text{Hz}`) — cùng họ lỗi với `\frac`→`rac`, `\tau` từng gặp
   khi sửa `plan.md` trước đó. KaTeX sẽ không render các công thức này. Phát hiện bằng
   `grep -nP '\t(ext|imes)\{'`, không thấy được bằng mắt thường trong editor thông thường.
7. **2026-07-06, Bài 5–13 (9/11 file):** mỗi file thiếu đúng 1 thẻ `</div>` đóng
   `.article-body` ngay sau phần quiz — hậu quả `.article-related`/`.article-comments` bị lồng
   **bên trong** `.article-body` thay vì là anh em cùng cấp trong `.article-wrap`, độ lệch dồn
   đến tận cuối file. Xác định bằng cách đếm số lượng, phải viết scanner ghép cặp thẻo theo
   stack mới tìm ra vị trí chính xác — **không thể phát hiện chỉ bằng đọc mắt hoặc đếm
   `<div`/`</div>` tổng quát** (số liệu tổng vẫn gợi ý được có lệch, nhưng vị trí chính xác cần
   `npx prettier --check`, công cụ này parse HTML thật và báo đúng dòng lỗi). → đây là lý do
   PHẦN C1 đặt `prettier --check` làm lệnh **đầu tiên**, không phải lệnh phụ.
8. **2026-07-06, Bài 1 VLSI:** footer bị viết tay từ trí nhớ thay vì copy file mẫu — chỉ có
   5 link (Blog, GitHub, Feedback, Terms, Donate), trong đó **GitHub và Feedback là link bịa
   ra, không tồn tại** trong bất kỳ footer thật nào của site; đồng thời **thiếu 5 link thật**
   (Image Optimizer, Remove BG, QR Generator, ColorQuarium, About, Contact, Privacy Policy).
   Lỗi tồn tại qua **nhiều vòng "báo xong"** vì không có lệnh nào trong PHẦN C cũ kiểm tra
   footer — chỉ bị phát hiện khi người duyệt so ảnh chụp màn hình bằng mắt. → sinh ra PHẦN C1
   mục 7 (`diff` khối `<footer>` với file mẫu). Bài học: footer/header là **chrome dùng
   chung toàn site**, không bao giờ được gõ tay lại từ trí nhớ — luôn copy nguyên khối từ 1
   file mẫu đã xác nhận đúng, kể cả khi "chỉ khác vài link".
9. **2026-07-06, Bài 1 VLSI:** link điều hướng `.article-related__link` bị **mũi tên đúp/
   ngược hướng** — CSS (`blog.css`) đã tự vẽ mũi tên qua `::before`/`::after` dựa theo class
   (`--prev` → `←` trước text, `--next` → `→` sau text, mặc định không class → `→` trước
   text), nhưng đồng thời text HTML lại gõ tay thêm "← Quay lại..." và "Bài tiếp theo →...".
   Kết quả hiện ra: `→ ← Quay lại...` (2 mũi tên ngược hướng dính nhau) và
   `Bài tiếp theo → Bài 2: ... →` (2 mũi tên cùng hướng, 1 giữa 1 cuối dòng). Ngoài ra thứ tự
   link cũng sai: đặt link "quay lại hub" trước link "bài tiếp theo", trong khi quy ước thật
   (đối chiếu `electronics-components-vom.html`, `electronics-ohm-voltage-divider.html`) là
   **prev (nếu có) → next → quay lại hub**, và **không class nào trong 3 link được tự ý gõ
   mũi tên vào text**. Chỉ phát hiện được qua ảnh chụp màn hình do người dùng gửi, không lộ
   ra khi đọc code hay khi chạy `prettier --check` (không phải lỗi cú pháp). → sinh ra PHẦN
   C1 mục 8 (grep tìm ký tự `←`/`→` viết tay trong khối `.article-related__link`).
10. **2026-07-06, Bài 1 VLSI, review nội dung sâu:** bản đầu Bài 1 thiếu gần hết phần "chứng
    minh được" mà đề cương yêu cầu — demo tương tác (chỉ có text tĩnh "1 XOR + 2 AND + 1 OR"),
    sơ đồ netlist SVG (0 sơ đồ), quiz (0 câu), file `.sv` tải về (0 file); độ dài 1310 từ dưới
    mức tối thiểu 1500. Khi xây demo tương tác thật mới lộ ra **engine `vlsi-verilite.js` và
    `vlsi-netlist-svg.js` có bug nghiêm trọng chưa từng bị phát hiện**: hàm cắt ngoặc
    `evalExpression` coi `"(a & ~s) | (b & s)"` là 1 cặp ngoặc bao ngoài (chỉ check
    `startsWith('(') && endsWith(')')` mà không đếm độ sâu ngoặc) nên cắt sai và làm vỡ biểu
    thức; `NetlistRenderer.renderFromAST` gọi `assign.rhs.op` tưởng `rhs` là object cây cú
    pháp trong khi nó là **chuỗi thô**, khiến netlist luôn render rỗng không cổng nào — bug
    này tồn tại từ lúc viết RTL Playground nhưng không bị phát hiện vì chưa ai thực sự dùng
    thử với input phức tạp hơn 1 toán tử. Sau khi vá xong (thêm `isFullyParenthesized()` đếm
    độ sâu; viết `elaborateAST`/`simulateGates` phân tích chuỗi thành cây cú pháp thật), Bài 1
    đã dựng được demo tương tác đầy đủ: chọn kiểu code (structural/dataflow/behavioral) toggle
    input a/b/s, netlist SVG tô sáng dây theo thời gian thực — xác nhận cả 3 kiểu ra đúng
    cùng 1 netlist tối giản (test bằng `node --input-type=module -e "..."` cho toàn bộ 8 tổ
    hợp input, không đoán bằng mắt). → Bài học kép: (a) review nội dung phải đối chiếu **số
    lượng thật** với rubric (đếm `.code-window`, sơ đồ SVG, quiz, file tải về — đừng tin
    "chắc có rồi"), không chỉ đọc văn phong; (b) khi 1 engine dùng chung nhiều bài chưa có
    demo nào thật sự thử nghiệm nó với input phức tạp, khả năng cao có bug ẩn — viết self-test
    Node độc lập cho engine TRƯỚC khi tin nó chạy đúng trong UI. File
    `blog/vlsi/vlsi-rtl-mindset.html` sau khi vá là **mẫu tham chiếu đã xác minh** cho toàn bộ
    bài sau của Series 11 — xem PHẦN A mục 6.
11. **2026-07-07, Bài 1 & 2 VLSI:** div bọc nội dung ngay dưới `.article-wrap` chỉ là
    `<div>` trơn, thiếu `class="article-body"` — sai khác nhỏ so với file mẫu (electronics
    có `<div class="article-wrap"><div class="article-body">`, 2 lớp lồng nhau). Hậu quả:
    toàn bộ **15 rule CSS** trong `blog.css` scope theo `.article-body` (heading h2/h3,
    paragraph, list, `strong`, link, inline `<code>`, và **table border/header
    background/zebra-stripe**) bị mất hoàn toàn, âm thầm không có lỗi cú pháp/console nào —
    trang vẫn "trông ổn" tổng thể (nhờ `styles.css` global lo phần font/layout cơ bản) nên
    dễ bị bỏ qua khi chỉ lướt qua ảnh chụp toàn trang; chỉ lộ rõ khi nhìn kỹ 1 bảng cụ thể
    thấy thiếu hẳn viền. Người dùng phát hiện qua ảnh chụp bảng "Toán tử bitwise/logical"
    của Bài 2 hoàn toàn không có border. Đối chiếu file mẫu xác nhận: **cả Bài 1 lẫn Bài 2
    đều thiếu** (lỗi bị copy nguyên khi nhân bản chrome từ Bài 1 sang Bài 2). → sinh ra PHẦN
    C1 mục 9. Ghi chú thêm: hub (`*-programming-series.html`) KHÔNG dùng `.article-body`
    (xác nhận qua đối chiếu `electronics-programming-series.html` cũng chỉ có
    `.article-wrap` không có `.article-body`) — glossary table trên hub vì vậy cũng không có
    border, nhưng đây là pattern đã tồn tại từ trước ở mọi hub, không phải lỗi phát sinh từ
    Series 11, nên không tự ý sửa hàng loạt nếu không được yêu cầu.
12. **2026-07-07, Bài 1 & 2 VLSI:** cả 2 bài đều nhảy thẳng vào `<h2>1. ...</h2>` (Bài 1)
    hoặc chỉ có 1 đoạn intro ngắn không H2 (Bài 2) — thiếu hẳn khối
    **"Mở đầu: ..."** (H2 riêng + 2 đoạn văn + `<hr />`) mà hầu hết bài đã hoàn thành trên
    site đều có (xem `electronics-components-vom.html`, `electronics-ohm-voltage-divider.html`,
    `electronics-kirchhoff-mna.html` — mẫu `<h2>Mở đầu: <tiêu đề hook riêng của bài></h2>`
    ngay sau `<div class="article-body">`, trước cả khối "Điều kiện tiên quyết"). Thiếu khối
    này khiến bài đọc "khô khan", vào thẳng nội dung kỹ thuật không có bối cảnh/lý do/hook —
    người dùng phát hiện qua cảm nhận đọc trực tiếp, không phải qua lệnh grep nào. → **PHẦN A
    cần thêm bước kiểm tra**: trước khi viết bài mới, xác nhận đã có khối "Mở đầu" hook người
    đọc (kịch bản/tình huống liên hệ được, nêu rõ tại sao bài này quan trọng, preview ngắn gọn
    nội dung sắp học) — không chỉ nhảy thẳng vào mục lục kỹ thuật. Đây là lỗi **không lộ ra
    qua bất kỳ lệnh tự động nào** (không phải cú pháp sai) — chỉ có cách phòng ngừa là chủ
    động viết khối này ngay từ đầu, đối chiếu với ≥1 bài mẫu đã hoàn thành trước khi coi phần
    mở bài là xong.
13. **2026-07-07, Bài 5 VLSI:** link "bài kế tiếp" trong `.article-related__link--next` trỏ
    thẳng tới `vlsi-arithmetic` (Bài 6) — file này **chưa được viết**, nên bấm vào sẽ ra 404
    y hệt sự cố Bài 4→5 trước đó (lúc đó được chấp nhận vì đang trong quá trình viết Bài 5
    ngay sau; lần này người dùng chỉ ra rằng nên **khoá** link thay vì để 404 treo lại nhiều
    ngày/tuần cho tới khi Bài 6 xong). → Quy ước mới: link kế tiếp chỉ dùng `<a href>` khi
    file đích đã tồn tại thật; nếu chưa, dùng lại pattern `--locked` có sẵn trong `blog.css`
    (trước đây chỉ dùng cho "hết series") với text kiểu `🔒 Bài N: <tên> — sắp ra mắt`. Đã
    thêm PHẦN C1 mục 10 để tự động phát hiện trường hợp này (grep href của link `--next`, đối
    chiếu file có tồn tại hay không) thay vì dựa vào người dùng bấm thử.
14. **2026-07-08, Bài 6 VLSI (chuẩn bị demo RCA/CLA):** `evalExpression()` trong
    `vlsi-verilite.js` tách toán tử nhị phân bằng `regex.match()` ngây thơ, không quét theo
    độ sâu ngoặc — với biểu thức như `1 & (a ^ b)`, do mảng ops kiểm tra `^` (yếu hơn) TRƯỚC
    `&`, regex tìm thấy dấu `^` nằm BÊN TRONG ngoặc con trước cả khi biết dấu `&` mới là toán
    tử ngoài cùng, cắt sai thành `"1 & (a "` và `"b)"`. Bug này tồn tại từ Bài 1 nhưng chỉ lộ
    ra khi Bài 6 viết bộ cộng carry-lookahead (`c1 = g0 | (p0 & cin)` — dạng "toán tử yếu bên
    ngoài, toán tử mạnh hơn trong ngoặc" chưa từng xuất hiện ở bài trước). Phát hiện qua
    self-test Node (512 tổ hợp a/b/cin cho ripple-carry adder ra 280 lỗi), không phải qua
    browser. → Fix bằng `findTopLevelOp(expr, op)` (quét ký tự, theo dõi độ sâu ngoặc, chỉ
    khớp khi depth===0) thay hoàn toàn cho vòng lặp `regex.match`, cùng cách tiếp cận với
    `findTopLevelTernary` đã fix ở Bài 4. Regression test lại ALU (Bài 2), FSM đèn giao thông
    (Bài 4), PWM/shift-register (Bài 3) — tất cả vẫn đúng.
15. **2026-07-08, Bài 6 VLSI (chuẩn bị demo bộ nhân shift-add):** regex tách khối
    `begin...end` trong `extractAlwaysAssigns()`/`extractAlwaysFF()` dùng `end` hoặc `end\b`
    KHÔNG ràng buộc word-boundary ở đầu — 1 tên tín hiệu như `addend` tự nó CÓ SẴN chuỗi con
    "end" ở 3 ký tự cuối, nên regex tưởng nhầm đó là từ khoá đóng khối, cắt cụt nội dung
    always_ff ngay giữa tên biến (`"if (rst) add"` rồi dừng). Phát hiện qua self-test Node
    (module dùng tên `addend` cho 1 thanh ghi shift, parser trả về `statements: []` rỗng bất
    thường cho đúng khối đó). → Fix bằng `\bend\b` (ràng buộc boundary CẢ 2 phía, không chỉ
    phía sau) ở cả 2 regex. Bài học: tên tín hiệu tiếng Anh phổ biến trong HDL rất dễ chứa
    "end" làm đuôi (addend, append, extend, depend...) — cẩn thận khi đặt tên biến demo mới.
16. **2026-07-08, Bài 6 VLSI (chuẩn bị demo bộ nhân shift-add):** `applyAlwaysFF()` lấy
    `snapshot = {...state}` RIÊNG cho từng khối `always_ff` (bên trong vòng `for` lặp qua
    `this.ast.alwaysFF`), thay vì lấy 1 lần chung cho cả cạnh clock. Hậu quả: nếu 1 module có
    NHIỀU khối `always_ff` tham chiếu chéo lẫn nhau (vd bộ nhân shift-add Bài 6: `busy`,
    `count`, `mrem`, `addend`, `acc` mỗi cái 1 khối riêng nhưng đều đọc trạng thái của nhau),
    khối chạy SAU sẽ vô tình đọc giá trị ĐÃ CẬP NHẬT (post-edge) của khối chạy TRƯỚC ngay
    trong CÙNG 1 cạnh clock — sai ngữ nghĩa non-blocking (đáng lẽ mọi khối phải "thấy" cùng 1
    trạng thái đóng băng trước cạnh clock). Phát hiện qua self-test Node (quét 256 tổ hợp
    a×b, 225/256 sai). → Fix: đưa `snapshot` ra NGOÀI vòng lặp khối, lấy đúng 1 lần cho toàn
    bộ `applyAlwaysFF()`; điều kiện `if` cũng đổi sang đọc từ `snapshot` thay vì `state` sống
    cho nhất quán. Regression test lại mọi bài trước (ALU, FSM, PWM/shift-register, RCA/CLA)
    — không đổi kết quả vì các bài đó chỉ có 1 khối `always_ff`/module, không bị ảnh hưởng.
