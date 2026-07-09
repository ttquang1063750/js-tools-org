# Backlog — js-tools.org

Danh sách các việc đã quyết định hướng làm nhưng **chưa bắt tay vào**, chờ ưu tiên sau. Khác với `plan.md` (đặc tả nội dung đang triển khai) và `changelog.md` (nhật ký đã xong) — file này chỉ ghi lại quyết định + bối cảnh để không phải bàn lại từ đầu khi quay lại.

---

## 1. Bản tiếng Anh (EN) cho blog — cấu trúc `/en/`

- **Trạng thái:** Chưa làm gì, chỉ mới chốt kiến trúc URL (2026-07-09).
- **Quyết định đã chốt:**
  - Nếu/khi dịch EN, dùng prefix `/en/` **ở gốc, mirror y hệt cấu trúc thư mục hiện có** (vd `/en/blog/vlsi/vlsi-riscv-program`), tiếng Việt giữ nguyên ở root làm ngôn ngữ mặc định/canonical. **Không** dùng kiểu nhúng cả 2 ngôn ngữ trong cùng 1 file rồi toggle bằng JS (data-language) — cách đó nhân đôi DOM mỗi trang, dễ bị Google tính duplicate content nếu thiếu `hreflang`, và làm file nặng hơn hẳn.
  - **Đã cân nhắc và bỏ:** đặt `en/` làm thư mục con bên trong từng series (vd `blog/vlsi/en/...`) thay vì prefix gốc. Ưu điểm là EN/VI cùng series nằm sát nhau, dễ nhìn tiến độ dịch — nhưng bị loại vì (1) URL có đoạn `en` nằm giữa đường dẫn, kém chuẩn hơn prefix sát gốc mà công cụ SEO/`hreflang` quen dùng; (2) các trang không thuộc series nào (trang chủ, about, contact...) không có chỗ để đặt `en/` vào, mâu thuẫn với phạm vi "toàn site" đã chốt.
  - **Phạm vi: toàn site** (trang chủ, tool pages, blog) — không chỉ riêng `blog/`.
  - **Loại bỏ `i18n.js` hoàn toàn.** Cơ chế hiện tại (toggle chữ chrome header/footer/nav runtime bằng JS + attribute `data-i18n`) sẽ bị thay thế bằng HTML tĩnh viết cứng theo từng ngôn ngữ: trang gốc (root) viết cứng tiếng Việt, trang `/en/...` viết cứng tiếng Anh — đúng tinh thần "pure HTML, không build step" của dự án, không cần JS runtime để đổi chữ nữa. Nút `#langToggle` ở header đổi từ "toggle chữ tại chỗ" thành **link tĩnh** trỏ sang URL cặp ngôn ngữ tương ứng (`/en/...` ↔ root).
- **Vì sao chưa làm:** khối lượng rất lớn — ước tính ~30 bài học chuyên sâu (Series 10: Điện Tử 16 bài + Series 11: VLSI 14 bài), mỗi bài ~1.500–2.000+ từ kỹ thuật cần dịch thật (không máy dịch) để giữ đúng thuật ngữ, cộng thêm dịch comment tiếng Việt trong các file `.sv`/`.js` tải về và toàn bộ quiz/giải thích đáp án. Gần như viết lại từng bài một lần nữa.
- **Việc cần làm khi bắt đầu (chưa làm):**
  - Dựng cấu trúc `/en/` nhân bản toàn bộ cây thư mục hiện có (không chỉ `blog/`).
  - Gỡ `data-i18n` khỏi mọi trang + xoá `i18n.js` khỏi mọi `<script src>` — viết cứng chữ chrome (header/footer/nav) trực tiếp bằng đúng ngôn ngữ của từng file, thay vì để JS đổi lúc runtime.
  - Đổi nút `#langToggle` thành link tĩnh trỏ URL cặp ngôn ngữ (root ↔ `/en/...`), không còn logic JS toggle chữ.
  - Thêm thẻ `hreflang` (alternate EN/VI) + `canonical` đúng cho từng cặp trang.
  - Cập nhật `sitemap.xml` với cả 2 phiên bản ngôn ngữ.
  - Quyết định thứ tự triển khai: dựng hạ tầng trước (trang EN placeholder) hay dịch thử 1 bài pilot trước để đo thời gian thực tế?
- **Liên quan:** quyết định trước đó là bỏ song ngữ EN/VI cho nội dung bài mới (Series 10, 11 trở đi chỉ viết tiếng Việt) — xem memory `feedback_vietnamese_only_new_series` và `project_en_locale_url_structure`.
