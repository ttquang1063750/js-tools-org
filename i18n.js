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
    'why.privacy.title': 'Experience',
    'why.privacy.desc': 'Intuitive, powerful, delightful. Every tool is crafted for maximum impact and ease of use.',
    'why.free.title': 'Lightning Fast',
    'why.free.desc': 'No installation, no uploads. Open a tool and start working instantly. Processing happens right on your device.',
    'why.oss.title': 'Convenient',
    'why.oss.desc': 'No account needed, no complexity. Just open, use, and go. Everything you need is right there.',
    'footer.copy': '© {year} js-tools — Built with ❤️ and open web standards.',
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.privacy': 'Privacy Policy',
    'nav.terms': 'Terms of Service',
    'privacy.title': 'Privacy Policy — js-tools',
    'privacy.h1': 'Privacy Policy',
    'privacy.intro': 'Last updated: June 9, 2026. At js-tools, accessible from js-tools.org, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by js-tools and how we use it.',
    'privacy.local.title': '1. Local Processing (Zero Data Collection)',
    'privacy.local.desc': 'None of the files you upload or process using our tools (such as Image Optimizer) are ever sent to a server. All operations, conversions, and compressions are processed locally within your web browser using client-side technologies like WebAssembly and HTML5 Canvas. We do not store, view, or collect your files.',
    'privacy.cookies.title': '2. Cookies and Web Beacons',
    'privacy.cookies.desc': 'Like any other website, js-tools uses cookies. These cookies are used to store information including visitors\' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users\' experience by customizing our web page content based on visitors\' browser type and/or other information.',
    'privacy.ads.title': '3. Google DoubleClick DART Cookie',
    'privacy.ads.desc': 'Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to js-tools.org and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">https://policies.google.com/technologies/ads</a>',
    'privacy.consent.title': '4. Consent',
    'privacy.consent.desc': 'By using our website, you hereby consent to our Privacy Policy and agree to its terms.',
    'terms.title': 'Terms of Service — js-tools',
    'terms.h1': 'Terms of Service',
    'terms.intro': 'Welcome to js-tools! These terms and conditions outline the rules and regulations for the use of js-tools\' website, located at js-tools.org.',
    'terms.license.title': '1. Intellectual Property & Usage License',
    'terms.license.desc': 'Unless otherwise stated, js-tools and/or its licensors own the intellectual property rights for all material on js-tools. All intellectual property rights are reserved. You may access this from js-tools for your own personal or business use subjected to restrictions set in these terms and conditions.',
    'terms.local.title': '2. No-Server Client-Side Guarantee',
    'terms.local.desc': 'Our tools operate fully client-side. We do not provide file storage or backup services. You are solely responsible for saving and maintaining copies of the files processed through our utilities.',
    'terms.disclaimer.title': '3. Disclaimer & Limitation of Liability',
    'terms.disclaimer.desc': 'To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website. js-tools is provided "as is" and we are not liable for any data loss, quality reduction, or event interruption resulting from the use of our browser tools.',
    'faq.title': 'Frequently Asked Questions',
    'faq.q1.title': 'How do these tools process files entirely in my browser?',
    'faq.q1.desc': 'Our tools utilize cutting-edge web technologies like WebAssembly, HTML5 APIs, and Canvas. When you import an image, your browser processes it directly on your computer using local computing resources. No files are uploaded to any external server, ensuring maximum privacy and speed.',
    'faq.q2.title': 'Are my files safe and private?',
    'faq.q2.desc': 'Yes, absolutely. Because all file processing happens locally in your browser sandbox, your files never leave your device. We do not (and cannot) see, store, or collect any of your files or personal data.',
    'faq.q3.title': 'What image formats does the Image Optimizer support?',
    'faq.q3.desc': 'The Image Optimizer supports standard web formats including JPEG, PNG, WebP, SVG, and even HEIC/HEIF files directly from iPhones, making it easy to convert and compress iPhone photos for web use.',
    'faq.q4.title': 'How does the SnapCast live slideshow demo work?',
    'faq.q4.desc': 'SnapCast uses a real-time database connection to instantly synchronize photo uploads. Guests scan a dynamically generated QR code using their smartphone, snap a photo, and the image is cast to the active live slideshow within seconds without requiring any app installations.',
    'faq.q5.title': 'Is there a limit on file size or bulk processing count?',
    'faq.q5.desc': 'There are no artificial limits imposed by js-tools. You can process as many files as your device memory can handle. Large batch sizes are processed sequentially to prevent browser tabs from freezing.',
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
    'sc.demo.desc': 'Đây là một sự kiện Snapcast thật, đang chạy trực tiếp. Quét mã QR bằng điện thoại, chụp ảnh và xem ảnh xuất hiện trên slideshow trong vài giây.',
    'sc.demo.qr.hint': 'Quét bằng điện thoại để gửi ảnh lên demo slideshow',
    'sc.demo.qr.btn': '📱 Xem QR code →',
    'sc.demo.qr.note': 'Mở màn hình upload ảnh dành cho khách',
    'sc.demo.contact.label': '📸 Lượt gửi ảnh có giới hạn. Muốn demo riêng cho sự kiện của bạn?',
    'why.title': 'Tại sao chọn js-tools?',
    'why.privacy.title': 'Trải nghiệm',
    'why.privacy.desc': 'Trực quan, mạnh mẽ, tuyệt vời. Mỗi công cụ được thiết kế để tối đa hóa hiệu suất và dễ sử dụng.',
    'why.free.title': 'Tốc độ cực nhanh',
    'why.free.desc': 'Không cần cài đặt, không tải lên server. Mở công cụ và bắt đầu ngay lập tức. Mọi thứ xử lý trên thiết bị của bạn.',
    'why.oss.title': 'Tiện lợi',
    'why.oss.desc': 'Không cần tài khoản, không phức tạp. Chỉ cần mở, sử dụng và đi. Mọi thứ bạn cần đều có sẵn.',
    'footer.copy': '© {year} js-tools — Làm với ❤️ và chuẩn web mở.',
    'nav.home': 'Trang chủ',
    'nav.blog': 'Blog',
    'nav.privacy': 'Chính sách bảo mật',
    'nav.terms': 'Điều khoản dịch vụ',
    'privacy.title': 'Chính sách bảo mật — js-tools',
    'privacy.h1': 'Chính sách bảo mật',
    'privacy.intro': 'Cập nhật lần cuối: 9 tháng 6, 2026. Tại js-tools, có thể truy cập tại js-tools.org, một trong những ưu tiên hàng đầu của chúng tôi là quyền riêng tư của khách truy cập. Tài liệu Chính sách bảo mật này chứa các loại thông tin được thu thập và ghi lại bởi js-tools và cách chúng tôi sử dụng chúng.',
    'privacy.local.title': '1. Xử lý cục bộ (Không thu thập dữ liệu)',
    'privacy.local.desc': 'Không có tệp nào bạn tải lên hoặc xử lý bằng các công cụ của chúng tôi (như Image Optimizer) được gửi đến máy chủ. Tất cả các thao tác, chuyển đổi và nén được xử lý cục bộ trong trình duyệt web của bạn bằng các công nghệ phía client như WebAssembly và HTML5 Canvas. Chúng tôi không lưu trữ, xem hoặc thu thập tệp của bạn.',
    'privacy.cookies.title': '2. Cookie và Web Beacon',
    'privacy.cookies.desc': 'Giống như các trang web khác, js-tools sử dụng cookie. Các cookie này được dùng để lưu trữ thông tin bao gồm tùy chọn của khách truy cập và các trang trên website mà khách truy cập đã xem. Thông tin được dùng để tối ưu hóa trải nghiệm người dùng bằng cách tùy chỉnh nội dung trang web dựa trên loại trình duyệt và/hoặc thông tin khác của khách truy cập.',
    'privacy.ads.title': '3. Cookie DART của Google DoubleClick',
    'privacy.ads.desc': 'Google là một trong các nhà cung cấp bên thứ ba trên trang web của chúng tôi. Google cũng sử dụng cookie, được gọi là cookie DART, để phục vụ quảng cáo cho khách truy cập dựa trên lượt ghé thăm js-tools.org và các trang web khác. Tuy nhiên, khách truy cập có thể từ chối sử dụng cookie DART bằng cách truy cập Chính sách bảo mật của mạng quảng cáo Google tại: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">https://policies.google.com/technologies/ads</a>',
    'privacy.consent.title': '4. Sự đồng ý',
    'privacy.consent.desc': 'Bằng cách sử dụng trang web của chúng tôi, bạn đồng ý với Chính sách bảo mật này và chấp nhận các điều khoản của nó.',
    'terms.title': 'Điều khoản dịch vụ — js-tools',
    'terms.h1': 'Điều khoản dịch vụ',
    'terms.intro': 'Chào mừng đến với js-tools! Các điều khoản và điều kiện này phác thảo các quy tắc và quy định cho việc sử dụng trang web js-tools tại js-tools.org.',
    'terms.license.title': '1. Sở hữu trí tuệ & Giấy phép sử dụng',
    'terms.license.desc': 'Trừ khi có quy định khác, js-tools và/hoặc người cấp phép của nó sở hữu quyền sở hữu trí tuệ đối với tất cả tài liệu trên js-tools. Tất cả quyền sở hữu trí tuệ được bảo lưu. Bạn có thể truy cập tài liệu này từ js-tools cho mục đích sử dụng cá nhân hoặc kinh doanh của riêng bạn, tuân theo các hạn chế được đặt ra trong các điều khoản và điều kiện này.',
    'terms.local.title': '2. Đảm bảo xử lý phía client không có máy chủ',
    'terms.local.desc': 'Các công cụ của chúng tôi hoạt động hoàn toàn phía client. Chúng tôi không cung cấp dịch vụ lưu trữ hoặc sao lưu tệp. Bạn hoàn toàn chịu trách nhiệm lưu và duy trì bản sao các tệp được xử lý qua các tiện ích của chúng tôi.',
    'terms.disclaimer.title': '3. Tuyên bố từ chối trách nhiệm & Giới hạn trách nhiệm pháp lý',
    'terms.disclaimer.desc': 'Trong phạm vi tối đa được pháp luật hiện hành cho phép, chúng tôi loại trừ tất cả các tuyên bố, bảo đảm và điều kiện liên quan đến trang web của chúng tôi và việc sử dụng trang web này. js-tools được cung cấp "nguyên trạng" và chúng tôi không chịu trách nhiệm về bất kỳ mất mát dữ liệu, giảm chất lượng hoặc gián đoạn sự kiện nào do sử dụng các công cụ trình duyệt của chúng tôi.',
    'faq.title': 'Các câu hỏi thường gặp',
    'faq.q1.title': 'Làm thế nào để các công cụ xử lý tệp hoàn toàn trên trình duyệt của tôi?',
    'faq.q1.desc': 'Các công cụ của chúng tôi sử dụng công nghệ web tiên tiến như WebAssembly, HTML5 API và Canvas. Khi bạn tải ảnh lên, trình duyệt sẽ xử lý ảnh trực tiếp trên máy tính của bạn bằng tài nguyên hệ thống cục bộ. Không có tệp tin nào được tải lên máy chủ ngoài, đảm bảo quyền riêng tư và tốc độ tối đa.',
    'faq.q2.title': 'Tệp tin của tôi có an toàn và riêng tư không?',
    'faq.q2.desc': 'Có, hoàn toàn tuyệt đối. Vì tất cả quá trình xử lý tệp diễn ra cục bộ trong môi trường trình duyệt an toàn (sandbox), tệp của bạn không bao giờ rời khỏi thiết bị. Chúng tôi không (và không thể) xem, lưu trữ hoặc thu thập bất kỳ tệp tin hay dữ liệu cá nhân nào của bạn.',
    'faq.q3.title': 'Công cụ Tối ưu ảnh hỗ trợ những định dạng ảnh nào?',
    'faq.q3.desc': 'Công cụ Tối ưu ảnh hỗ trợ các định dạng web tiêu chuẩn bao gồm JPEG, PNG, WebP, SVG và cả các tệp HEIC/HEIF trực tiếp từ iPhone, giúp bạn dễ dàng chuyển đổi và nén ảnh iPhone để sử dụng trên web.',
    'faq.q4.title': 'Trình chiếu trực tiếp SnapCast hoạt động như thế nào?',
    'faq.q4.desc': 'SnapCast sử dụng kết nối cơ sở dữ liệu thời gian thực để đồng bộ hóa ảnh tải lên ngay lập tức. Khách mời chỉ cần quét mã QR được tạo tự động bằng điện thoại thông minh, chụp ảnh và ảnh sẽ được chiếu lên màn hình trình chiếu trực tiếp đang chạy trong vài giây mà không cần cài đặt ứng dụng.',
    'faq.q5.title': 'Có giới hạn nào về kích thước tệp hoặc số lượng xử lý hàng loạt không?',
    'faq.q5.desc': 'Không có giới hạn nhân tạo nào được thiết lập bởi js-tools. Bạn có thể xử lý bao nhiêu tệp tùy ý tùy thuộc vào dung lượng bộ nhớ thiết bị của bạn. Các lô hàng lớn sẽ được xử lý tuần tự để tránh tab trình duyệt bị đóng băng.',
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
