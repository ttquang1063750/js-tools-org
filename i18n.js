const TRANSLATIONS = {
  en: {
    'nav.imageOptimizer': 'Image Optimizer',
    'nav.snapcast': 'Snapcast',
    'hero.badge': '⚡ Fast &nbsp;·&nbsp; Client-side &nbsp;·&nbsp; Privacy-first',
    'hero.h1.line1': 'Tools that run',
    'hero.h1.line2': 'entirely in your browser',
    'hero.sub': 'Experience the power of JavaScript and your browser.',
    'hero.cta.explore': 'Explore tools ↓',
    'hero.cta.github': 'GitHub →',
    'stats.tools': 'Tools',
    'stats.bytes': 'Bytes uploaded',
    'stats.inbrowser': 'In-browser',
    'tools.title': 'Our Tools',
    'io.name': 'Image Optimizer',
    'io.tagline': 'Compress & convert images — 100% in-browser',
    'io.desc': 'Drag and drop images to compress them with zero quality loss. Supports JPEG, PNG, WebP, and HEIC from iPhone. Add watermarks, resize in bulk, compare before/after — all without uploading a single byte to any server.',
    'io.f1': 'JPEG & WebP output',
    'io.f2': 'Bulk processing with progress',
    'io.f3': 'Text & image watermarks',
    'io.f4': 'Before/after comparison slider',
    'io.f5': 'HEIC/HEIF support (iPhone photos)',
    'io.open': 'Open tool →',
    'sc.name': 'Snapcast',
    'sc.tagline': 'Real-time photo slideshow for live events',
    'sc.desc': 'Host a live photo wall at weddings, parties, and conferences. Guests scan a QR code, snap a photo on their phone, and it appears on the big screen within seconds. Includes animated effects, remote control, and post-event gallery.',
    'sc.f1': 'QR-code guest onboarding',
    'sc.f2': 'Realtime Firestore sync',
    'sc.f3': 'Animated slideshow effects',
    'sc.f4': 'Remote control from phone',
    'sc.f5': 'Post-event photo gallery',
    'sc.open': 'Open tool →',
    'sc.demo.label': '🎉 Live demo — photos update in real time',
    'sc.demo.title': 'See it in action — right now',
    'sc.demo.desc': 'This is a real, live Snapcast event. Scan the QR code with your phone, take a photo, and watch it appear on the slideshow within seconds. No sign-up needed.',
    'sc.demo.qr.hint': 'Scan with your phone to send a photo to the demo slideshow',
    'sc.demo.qr.btn': '📱 View QR code →',
    'sc.demo.qr.note': 'Opens the guest upload screen on your phone',
    'sc.demo.contact.label': '📸 Photo slots are limited. Want a private demo for your event?',
    'why.title': 'Why js-tools?',
    'why.privacy.title': 'Privacy First',
    'why.privacy.desc': 'Your files never leave your device. Processing happens entirely in the browser.',
    'why.free.title': 'Lightning Fast',
    'why.free.desc': 'No installation, no uploads. Open a tool and start working instantly. Processing happens right on your device.',
    'why.oss.title': 'Open Source',
    'why.oss.desc': 'Every tool is open-source. Inspect, fork, or contribute on GitHub.',
    'footer.copy': '© {year} js-tools — Built with ❤️ and open web standards.',
  },
  vi: {
    'nav.imageOptimizer': 'Tối ưu ảnh',
    'nav.snapcast': 'Snapcast',
    'hero.badge': '⚡ Nhanh chóng &nbsp;·&nbsp; Trên thiết bị &nbsp;·&nbsp; Bảo mật',
    'hero.h1.line1': 'Công cụ chạy hoàn toàn',
    'hero.h1.line2': 'ngay trên trình duyệt',
    'hero.sub': 'Trải nghiệm sức mạnh của JavaScript và trình duyệt của bạn.',
    'hero.cta.explore': 'Khám phá công cụ ↓',
    'hero.cta.github': 'GitHub →',
    'stats.tools': 'Công cụ',
    'stats.bytes': 'Byte tải lên',
    'stats.inbrowser': 'Trên trình duyệt',
    'tools.title': 'Công cụ của chúng tôi',
    'io.name': 'Tối ưu ảnh',
    'io.tagline': 'Nén & chuyển đổi ảnh — 100% trên trình duyệt',
    'io.desc': 'Kéo thả ảnh để nén mà không giảm chất lượng. Hỗ trợ JPEG, PNG, WebP và HEIC từ iPhone. Thêm watermark, thay đổi kích thước hàng loạt, so sánh trước/sau — tất cả mà không cần tải lên bất kỳ server nào.',
    'io.f1': 'Xuất JPEG & WebP',
    'io.f2': 'Xử lý hàng loạt với tiến trình',
    'io.f3': 'Watermark chữ & hình ảnh',
    'io.f4': 'Slider so sánh trước/sau',
    'io.f5': 'Hỗ trợ HEIC/HEIF (ảnh iPhone)',
    'io.open': 'Mở công cụ →',
    'sc.name': 'Snapcast',
    'sc.tagline': 'Trình chiếu ảnh trực tiếp cho sự kiện',
    'sc.desc': 'Tạo bức tường ảnh trực tiếp tại đám cưới, tiệc tùng và hội nghị. Khách quét mã QR, chụp ảnh trên điện thoại và ảnh xuất hiện trên màn hình lớn trong vài giây. Có hiệu ứng động, điều khiển từ xa và thư viện ảnh sau sự kiện.',
    'sc.f1': 'Onboarding khách qua QR code',
    'sc.f2': 'Đồng bộ Firestore thời gian thực',
    'sc.f3': 'Hiệu ứng slideshow động',
    'sc.f4': 'Điều khiển từ xa qua điện thoại',
    'sc.f5': 'Thư viện ảnh sau sự kiện',
    'sc.open': 'Mở công cụ →',
    'sc.demo.label': '🎉 Demo trực tiếp — ảnh cập nhật theo thời gian thực',
    'sc.demo.title': 'Trải nghiệm ngay — không cần đăng ký',
    'sc.demo.desc': 'Đây là một sự kiện Snapcast thật, đang chạy trực tiếp. Quét mã QR bằng điện thoại, chụp ảnh và xem ảnh xuất hiện trên slideshow trong vài giây. Hoàn toàn miễn phí.',
    'sc.demo.qr.hint': 'Quét bằng điện thoại để gửi ảnh lên demo slideshow',
    'sc.demo.qr.btn': '📱 Xem QR code →',
    'sc.demo.qr.note': 'Mở màn hình upload ảnh dành cho khách',
    'sc.demo.contact.label': '📸 Lượt gửi ảnh có giới hạn. Muốn demo riêng cho sự kiện của bạn?',
    'why.title': 'Tại sao chọn js-tools?',
    'why.privacy.title': 'Bảo mật tuyệt đối',
    'why.privacy.desc': 'File của bạn không bao giờ rời khỏi thiết bị. Xử lý hoàn toàn trên trình duyệt.',
    'why.free.title': 'Tốc độ cực nhanh',
    'why.free.desc': 'Không cần cài đặt, không tải lên server. Mở công cụ và bắt đầu ngay lập tức. Mọi thứ xử lý trên thiết bị của bạn.',
    'why.oss.title': 'Mã nguồn mở',
    'why.oss.desc': 'Mọi công cụ đều mã nguồn mở. Xem, fork hoặc đóng góp trên GitHub.',
    'footer.copy': '© {year} js-tools — Làm với ❤️ và chuẩn web mở.',
  },
};

(function () {
  const saved = localStorage.getItem('lang');
  const browser = navigator.language?.startsWith('vi') ? 'vi' : 'en';
  let lang = saved || browser;

  function applyLang(l) {
    lang = l;
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;

    const t = TRANSLATIONS[l];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!t[key]) return;
      const val = t[key].replace('{year}', new Date().getFullYear());
      if (el.dataset.i18nHtml !== undefined) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    // Update toggle button
    const btn = document.getElementById('langToggle');
    if (btn) {
      btn.innerHTML = l === 'vi'
        ? '<span class="lang-flag">🇺🇸</span> <span class="lang-text">English</span>'
        : '<span class="lang-flag">🇻🇳</span> <span class="lang-text">Việt Nam</span>';
      btn.title = l === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt';
    }
  }

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('langToggle');
    if (btn) {
      btn.addEventListener('click', () => applyLang(lang === 'vi' ? 'en' : 'vi'));
    }
    applyLang(lang);
  });
})();
