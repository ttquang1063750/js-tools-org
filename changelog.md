# Changelog — js-tools.org

---

## 11. Nâng cấp chiều sâu JS Series & Bổ sung phân tích Big O (2026-06-24)

* **Phân tích chi phí thuật toán (Big O Notation)**: Bổ sung chi tiết bài học lý thuyết về độ phức tạp thời gian và không gian vào Bài 7 trong Series C (`c-data-structures.html`). Thêm biểu đồ tăng trưởng ASCII, quy tắc rút gọn (Sum/Product), các ví dụ code C đầy đủ cho các lớp $O(1)$, $O(\log N)$, $O(N)$, $O(N \log N)$, $O(N^2)$, $O(2^N)$, $O(N!)$, và giải thích chi phí Call Stack trong đệ quy dẫn đến Stack Overflow.
* **Nâng cấp chiều sâu JS Series (7 Bài học)**: Hoàn thành nâng cấp toàn diện các bài viết lý thuyết và file code mẫu song hành trong `blog/codes/`:
  - Chi tiết hóa V8 compiling pipeline (Parser/AST, Ignition bytecode, TurboFan JIT machine code, deoptimizations).
  - V8 Shapes/Hidden Classes & Inline Cache (IC) và V8 Elements Kinds (SMI, Double, Holey vs Packed).
  - Mô phỏng Live Bindings (ESM) bằng ES6 Getters so với CommonJS Copy-on-Import.
  - Xây dựng Reactive State Store bằng JS Proxy gắn kết đồng bộ trực tiếp với Mock DOM.
* **Sửa lỗi cú pháp HTML**: Sửa lỗi thẻ đóng `div` mất cân bằng trong Bài 5 (`js-metaprogramming.html`) và chạy xác thực thẻ tự động thành công trên toàn bộ 14 trang.

---

## 10. Hoàn thiện Series JavaScript Canvas — 14 bài học (2026-06-24)

* **Hoàn thành các bài viết Canvas**: Viết mới 4 bài viết còn thiếu trong lộ trình: Bài 8 (Responsive Canvas & HiDPI Scaling), Bài 9 (Interaction: Mouse, Touch & Hit Detection), Bài 10 (Vật Lý: Velocity, Gravity, Friction & Spring), và Bài 14 (Creative Coding & Performance Optimization) bằng tiếng Việt có cấu trúc đầy đủ, câu hỏi trắc nghiệm tương tác và code mẫu.
* **Tạo file code minh họa mới**: Tạo các file script thực hành bổ sung trong `blog/codes/`:
  - `canvas_interaction.js` (Bài 9 - bắt chuột và kéo thả hình).
  - `canvas_physics.js` (Bài 10 - tích hợp Euler, trọng lực và lò xo).
  - `canvas_particles.js` (Bài 11 - va chạm đàn hồi hình tròn và hệ thống hạt lửa).
  - `canvas_game.html` (Bài 12 - mini game platformer chạy offline hoàn chỉnh với âm thanh và va chạm gạch).
  - `canvas_charts.js` (Bài 13 - tự vẽ Line/Bar/Pie chart từ scratch).
  - `canvas_creative.js` (Bài 14 - trường dòng chảy lượng giác với buffer Offscreen Canvas).
* **Đồng bộ liên kết**: Cập nhật related links ở cuối mỗi bài viết mới để chuyển hướng mượt mà (previous/next) trong toàn bộ 14 bài học.

---

## 9. Tích hợp ColorQuarium, Blog mới, Hamburger Menu & Cập nhật toàn trang (2026-06-24)

* **ColorQuarium trên homepage**: Thêm tool card + live iframe demo (`/srHTKBMckdPaXctAWsNw/live`) với QR code mobile remote. Đặt ngay sau SnapCast, trước Image Optimizer. Icon dùng `assets/coloraquarium.png` (700x700 PNG).
* **Blog bài viết ColorQuarium**: Tạo `blog/colorquarium-explained.html` — bài viết song ngữ EN/VI giới thiệu ColorQuarium, cách hoạt động display + remote, use cases. Thêm card vào `blog/index.html` và URL vào `sitemap.xml`.
* **Hamburger menu (CSS-only)**: Triển khai menu hamburger cho header navigation trên tất cả trang (breakpoint ≤880px). Dùng checkbox hack (`#nav-toggle` + `<label>` + sibling selector `~ nav`). Thay thế logic cũ ẩn label ở mobile.
* **ColorQuarium trong nav**: Thêm link ColorQuarium vào header nav (`nav-link--cq`) và footer nav trên tất cả 10+ trang (index, privacy, terms, tất cả blog HTML).
* **QR code padding/overflow fix**: Thêm `max-width:100%; height:auto` cho `.sc-demo__qr img` và class `.has-padding` (16px padding + white background) để QR không đè iframe trên mobile.
* **Facebook Discussion CTA**: Thêm `.article-discuss` block vào 3 bài SnapCast + bài ColorQuarium, link tới Facebook page.
* **CTA button fix**: Thêm `.article-cta .btn-primary { color: #fff !important; }` trong `blog.css` để fix chữ nút CTA bị ẩn.
* **Footer redesign**: Thêm icon (SVG/PNG) cho tất cả footer links trên tất cả trang.
* **Privacy/Terms tiếng Việt**: Thêm `data-lang-content` bilingual content cho privacy.html và terms.html.

---

## 8. Sửa lỗi hiển thị khối mã nguồn IDE (2026-06-24)

* **Vấn đề**: Các bài C++ và `c-struct-typedef.html` dùng class sai (`.copy-btn` thay vì `.code-copy-btn`, thiếu `.code-dots`), làm 3 chấm macOS bị ẩn và nút Copy không hoạt động.
* **Giải pháp**: Script Node.js quét và chuyển đổi đồng loạt header khối code trên 18 bài C/C++.
* **Kết quả**: Tất cả khối code hiển thị đúng 3 chấm macOS + nút Copy hoạt động.

---

## 7. Series JavaScript cốt lõi — 8 bài học (2026-06-24)

* **Nội dung**: 8 bài học JavaScript chuyên sâu bằng tiếng Việt: JS Engine & Execution Context, Objects & Prototypes, DOM & Event Model, Functional Programming, Modules & Scope, Metaprogramming (Proxy/Reflect), Event Loop & Async, Event Loop Visualizer.
* **Mô phỏng tương tác**: Event Loop Visualizer chạy trực tiếp trên Canvas.
* **Code mẫu**: 8 file `.js` trong `blog/codes/`.

---

## 6. Series C++ hiện đại — 8 bài học (2026-06-24)

* **Nội dung**: 8 bài học C++ chuyên sâu bằng tiếng Việt: Environment Setup, Basics & Vector, OOP Basics, OOP Polymorphism, Smart Pointers, Templates, Modern Features, BST Visualizer.
* **V8 Engine**: Tích hợp case studies về cách Google V8 dùng C++ cho JIT compilation và memory management.
* **BST Visualizer**: Canvas-based interactive Binary Search Tree tại `blog/codes/bst_visualizer.html`.
* **Code mẫu**: 8 file `.cpp` trong `blog/codes/`.

---

## 5. Series lập trình C — 8 bài học

* **Nội dung**: 8 bài học C toàn diện bằng tiếng Việt: Environment Setup, Basics & Bitwise, Control Flow, Struct & Typedef, Memory Management, Pointers Deep Dive, Data Structures, DS Visualizer Demo.
* **VS Code Light Theme**: Nền trắng `#ffffff`, font Segoe UI, code blocks tối `#1e1e1e`, inline code đỏ nâu `#a31515`.
* **Interactive quizzes**: `ide.js` + `ide.css` cho đánh giá bài học tức thì.
* **Code mẫu**: File `.c` trong `blog/codes/`.

---

## 4. Bài viết blog QR Generator

* **Nội dung**: `custom-qr-codes-in-browser.html` — hướng dẫn tạo và tùy chỉnh mã QR trong trình duyệt, song ngữ EN/VI.

---

## 3. Bài viết blog SnapCast & Image Optimizer

* **SnapCast**: 3 bài — wedding slideshow, corporate events, technology explained (song ngữ EN/VI).
* **Image Optimizer**: 2 bài — how to compress images, WebP vs JPEG vs PNG (song ngữ EN/VI).

---

## 2. Tối ưu hiệu năng di động (Mobile Performance)

* **JavaScript defer**: Thêm `defer` cho `i18n.js` để không chặn parser.
* **AdSense lazy load**: Trì hoãn tải AdSense đến khi có tương tác người dùng hoặc sau 3.5s.
* **Iframe lazy load**: Dùng `IntersectionObserver` + `data-src` để tải iframe SnapCast demo khi gần viewport (200px threshold).
* **Canvas tối ưu mobile**: Giảm hạt còn 35 trên mobile (<768px), dừng animation khi hero khuất viewport.
* **Layout thrashing fix**: Cache `getBoundingClientRect()` vào biến, chỉ cập nhật khi scroll/resize.

---

## 1. Khởi tạo dự án

* Landing page tĩnh với hero canvas particle animation (5 time-based modes).
* Tool cards cho SnapCast + Image Optimizer.
* i18n EN/VI, SEO meta tags, Cloudflare Pages deployment.
