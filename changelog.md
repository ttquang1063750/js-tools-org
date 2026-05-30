# Changelog — Tối ưu hóa Hiệu năng di động (Mobile Performance)

Tài liệu này ghi nhận chi tiết các cải tiến hiệu năng đã được thực hiện để giải quyết vấn đề điểm PageSpeed di động thấp trên trang `js-tools.org`.

---

## 1. Tải không chặn đối với JavaScript Đa ngôn ngữ (`i18n.js`)

* **Vấn đề**: Tệp `i18n.js` được tải đồng bộ trong `<head>` thông qua `<script src="i18n.js"></script>`, làm chặn luồng phân tích cú pháp HTML của trình duyệt (Parser-blocking), kéo dài thời gian hiển thị nội dung đầu tiên (FCP).
* **Giải pháp**: Thêm thuộc tính `defer` vào thẻ script. 
* **Kết quả**: Trình duyệt tải tệp song song với việc phân tích HTML và chỉ thực thi script khi cấu trúc DOM đã sẵn sàng, giúp cải thiện tốc độ render ban đầu.

---

## 2. Trì hoãn tải Google AdSense thông minh (Lazy load AdSense)

* **Vấn đề**: Script của Google AdSense (`adsbygoogle.js`) chứa lượng lớn mã JavaScript nặng nề để theo dõi và kết xuất quảng cáo. Việc tải script này ngay ở thẻ `<head>` làm tắc nghẽn luồng xử lý chính của thiết bị di động, dẫn đến thời gian chặn luồng xử lý lớn (TBT - Total Blocking Time).
* **Giải pháp**: Loại bỏ thẻ tải trực tiếp trong HTML. Thay vào đó, thiết lập trình tải động AdSense qua JavaScript. 
* **Cách hoạt động**: Lắng nghe tương tác đầu tiên từ người dùng (`scroll`, `touchstart`, `mousemove`, `click`) để chèn mã AdSense, hoặc tự động kích hoạt sau thời gian chờ an toàn (3.5 giây) nếu không có tương tác.

---

## 3. Tải chậm Iframe Snapcast Demo bằng `IntersectionObserver`

* **Vấn đề**: Phần demo trực tiếp nhúng hai iframe tải ứng dụng Snapcast (slideshow trực tiếp và mã QR). Các ứng dụng React/Firebase này kéo theo tổng dung lượng tải khổng lồ lên tới **~6.1 MB** (payload size). Do mặc định iframe tải ngay khi mở trang, hiệu năng mạng di động bị sụt giảm nghiêm trọng mặc dù người dùng chưa cuộn xuống xem demo.
* **Giải pháp**: 
  * Loại bỏ thuộc tính `src` tĩnh của iframe trong `index.html`, thay bằng thuộc tính chứa dữ liệu tạm thời `data-src`.
  * Khởi tạo `IntersectionObserver` trong `main.js` để theo dõi vị trí của các iframe này.
* **Cách hoạt động**: Khi người dùng cuộn trang tới khoảng cách cách vùng hiển thị demo 200px, JavaScript sẽ tự động gán URL từ `data-src` vào `src` của iframe để kích hoạt quá trình tải đúng lúc.

---

## 4. Tối ưu hoạt ảnh hạt trên Canvas ở màn hình di động

* **Vấn đề**: Hiệu ứng hạt Canvas trong hero section vẽ từ 100 đến 140 hạt bay tự do liên tục ở tần suất 60 FPS. Tác vụ kết xuất hình học (filled arcs) liên tục này rất nặng cho chip xử lý đồ họa và CPU trên các thiết bị di động. Ngoài ra, hoạt ảnh vẫn tiếp tục chạy ngầm ngay cả khi người dùng đã cuộn trang xuống bên dưới.
* **Giải pháp**:
  * **Giảm số lượng hạt trên di động**: Nếu phát hiện chiều rộng màn hình nhỏ hơn 768px, số lượng hạt vẽ tối đa được giới hạn ở mức **35** hạt (giảm ~70% số tác vụ vẽ mà vẫn đảm bảo tính thẩm mỹ trên màn hình nhỏ).
  * **Dừng hoạt ảnh khi khuất màn hình**: Sử dụng `IntersectionObserver` để theo dõi `.hero`. Khi Hero cuộn khuất khỏi viewport, hàm `cancelAnimationFrame` sẽ dừng vòng lặp vẽ ngay lập tức để tiết kiệm tài nguyên CPU/GPU và dung lượng pin của điện thoại. Hoạt ảnh chỉ tiếp tục khi người dùng quay lại đầu trang.

---

## 5. Loại bỏ hiện tượng Bố cục lại bắt buộc (Forced Reflow / Layout Thrashing)

* **Vấn đề**: Trong sự kiện di chuột `mousemove`, hàm `canvas.getBoundingClientRect()` được gọi liên tục để xác định vị trí tương đối của con trỏ chuột. Việc gọi hàm này trong sự kiện chuột tần suất cao ép trình duyệt phải thực hiện tính toán lại bố cục ngay lập tức trước khi kết xuất khung hình, gây ra hiện tượng giật cục bộ (Layout Thrashing / Forced Reflow).
* **Giải pháp**: Caching giá trị bounding rect của canvas vào biến toàn cục `canvasRect`.
* **Cách hoạt động**: Tọa độ con trỏ chỉ sử dụng giá trị cached `canvasRect` để tính toán. Giá trị này chỉ được cập nhật lại khi xảy ra các sự kiện làm thay đổi vị trí thực sự của canvas là cuộn trang (`scroll`) hoặc thay đổi kích thước màn hình (`resize`).
