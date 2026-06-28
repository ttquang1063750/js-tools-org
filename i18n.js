const TRANSLATIONS = {
  en: {
    'nav.imageOptimizer': 'Image Optimizer',
    'nav.snapcast': 'Snapcast',
    'nav.qr': 'QR Generator',
    'nav.cq': 'ColorQuarium',
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
    'io.desc':
      'Drag and drop images to compress them with zero quality loss. Supports JPEG, PNG, WebP, and HEIC from iPhone. Add watermarks, resize in bulk, compare before/after — all without uploading a single byte to any server.',
    'io.f1': 'JPEG & WebP output',
    'io.f2': 'Bulk processing with progress',
    'io.f3': 'Text & image watermarks',
    'io.f4': 'Before/after comparison slider',
    'io.f5': 'HEIC/HEIF support (iPhone photos)',
    'io.open': 'Open tool →',
    'sc.name': 'Snapcast',
    'sc.tagline': 'Real-time photo slideshow for live events',
    'sc.desc':
      'Host a live photo wall at weddings, parties, and conferences. Guests scan a QR code, snap a photo on their phone, and it appears on the big screen within seconds. Includes animated effects, remote control, and post-event gallery.',
    'sc.f1': 'QR-code guest onboarding',
    'sc.f2': 'Realtime Firestore sync',
    'sc.f3': 'Animated slideshow effects',
    'sc.f4': 'Remote control from phone',
    'sc.f5': 'Post-event photo gallery',
    'sc.open': 'Open tool →',
    'qr.name': 'QR Code Generator',
    'qr.tagline': 'Generate & customize QR codes — 100% in-browser',
    'qr.desc':
      'Create fully customizable QR codes with logo insertion, custom colors, gradient styles, and variable dot shapes. Perfect for links, Wi-Fi access, contact cards, and text — processed entirely locally on your device with zero data tracking.',
    'qr.f1': 'Custom logo & branding support',
    'qr.f2': 'Gradient & solid color styles',
    'qr.f3': 'URL, Wi-Fi, vCard & text formats',
    'qr.f4': 'Custom dot & corner shape styles',
    'qr.f5': 'High-res SVG, PNG & PDF exports',
    'qr.open': 'Open tool →',
    'rmbg.name': 'Remove BG',
    'rmbg.tagline': 'Remove image backgrounds automatically — 100% in-browser',
    'rmbg.desc':
      'Erase backgrounds from your photos instantly using local AI neural networks. Supports JPEG, PNG, WebP, and HEIC. The entire process runs 100% locally in your browser sandbox with zero server uploads, keeping your data secure.',
    'rmbg.f1': 'Local AI-powered segmentation',
    'rmbg.f2': '100% private — no server uploads',
    'rmbg.f3': 'Supports JPEG, PNG, WebP, and HEIC',
    'rmbg.f4': 'High-res transparent PNG exports',
    'rmbg.f5': 'Completely free with no limits or watermarks',
    'rmbg.open': 'Open tool →',
    'sc.demo.label': '🎉 Live demo — photos update in real time',
    'sc.demo.title': 'See it in action — right now',
    'sc.demo.desc':
      'This is a real, live Snapcast event. Scan the QR code with your phone, take a photo, and watch it appear on the slideshow within seconds. No sign-up needed.',
    'sc.demo.qr.hint': 'Scan with your phone to send a photo to the demo slideshow',
    'sc.demo.qr.btn': '📱 View QR code →',
    'sc.demo.qr.note': 'Opens the guest upload screen on your phone',
    'sc.demo.contact.label': '📸 Photo slots are limited. Want a private demo for your event?',
    'why.title': 'Why js-tools?',
    'why.privacy.title': 'Experience',
    'why.privacy.desc': 'Intuitive, powerful, delightful. Every tool is crafted for maximum impact and ease of use.',
    'why.free.title': 'Lightning Fast',
    'why.free.desc':
      'No installation, no uploads. Open a tool and start working instantly. Processing happens right on your device.',
    'why.oss.title': 'Convenient',
    'why.oss.desc': 'No account needed, no complexity. Just open, use, and go. Everything you need is right there.',
    'footer.copy': '© {year} js-tools — Built with ❤️ and open web standards.',
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.loan': 'Loan Calculation Tool',
    'nav.privacy': 'Privacy Policy',
    'nav.terms': 'Terms of Service',
    'privacy.title': 'Privacy Policy — js-tools',
    'privacy.h1': 'Privacy Policy',
    'privacy.intro':
      'Last updated: June 28, 2026. At js-tools (js-tools.org), protecting your privacy is a core priority. We build free, privacy-first tools that run entirely in your browser, alongside an educational programming blog. This policy explains what limited information is involved when you use the site and how it is handled.',
    'privacy.local.title': '1. Local Processing (Zero File Collection)',
    'privacy.local.desc':
      'Every file you open in our tools — including the Image Optimizer, the RemoveBG background remover, the QR Code Generator, ColorQuarium and others — is processed entirely inside your web browser using client-side technologies such as WebAssembly, HTML5 Canvas and WebGL. Your images and files are never uploaded to, stored on, or viewed by any server. Some AI-powered tools (for example RemoveBG) download a one-time model file from a content delivery network so the computation can run on your own device; the file you process still never leaves your computer.',
    'privacy.cookies.title': '2. Cookies & Local Storage',
    'privacy.cookies.desc':
      'js-tools uses a small amount of browser storage (cookies and local storage) to remember your preferences — such as your chosen language and light/dark theme — so the site behaves the way you expect on your next visit. These preferences stay on your device. The third-party services described below may set their own cookies.',
    'privacy.ads.title': '3. Advertising (Google AdSense)',
    'privacy.ads.desc':
      'Some pages display ads served by Google AdSense, a third-party vendor. Google and its partners may use cookies to serve ads based on your prior visits to this and other websites. You can review and control how Google uses data for ads, and opt out of personalized advertising, via Google Ads Settings and the Google Privacy &amp; Terms page at: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">https://policies.google.com/technologies/ads</a>',
    'privacy.comments.title': '4. Blog Comments (giscus & GitHub)',
    'privacy.comments.desc':
      'Our blog comments are powered by giscus, which stores discussions in GitHub Discussions. To post a comment you sign in with a GitHub account, and anything you post is public and handled under GitHub’s own privacy policy. If you never comment, no account or personal data is required to read the blog.',
    'privacy.thirdparty.title': '5. Third-Party Links & Services',
    'privacy.thirdparty.desc':
      'The site links to companion tools on separate subdomains (such as SnapCast and ColorQuarium) and to external resources referenced in our articles. Once you follow a link to a third party — including Google, GitHub or any site cited in the blog — that party’s own privacy policy and terms apply. We are not responsible for the practices of external sites.',
    'privacy.consent.title': '6. Consent & Changes',
    'privacy.consent.desc':
      'By using js-tools, you consent to this Privacy Policy. We may update it from time to time to reflect new tools or services; the "last updated" date above always indicates the current version.',
    'terms.title': 'Terms of Service — js-tools',
    'terms.h1': 'Terms of Service',
    'terms.intro':
      "Welcome to js-tools! These terms and conditions outline the rules and regulations for the use of js-tools' website, located at js-tools.org, including its browser-based tools and educational blog.",
    'terms.license.title': '1. Intellectual Property & Usage License',
    'terms.license.desc':
      'Unless otherwise stated, js-tools and/or its licensors own the intellectual property rights for all material on js-tools. All intellectual property rights are reserved. You may access this from js-tools for your own personal or business use subjected to restrictions set in these terms and conditions.',
    'terms.local.title': '2. No-Server, Client-Side Guarantee',
    'terms.local.desc':
      'Our utilities — including the Image Optimizer, RemoveBG, QR Code Generator and ColorQuarium — run fully client-side in your browser. We do not provide file storage, hosting or backup services, and processed files are not retained anywhere. You are solely responsible for saving and keeping copies of any output you create.',
    'terms.content.title': '3. Educational Content & User Comments',
    'terms.content.desc':
      'The articles and programming courses on our blog are provided for educational purposes "as is", without warranty of accuracy or fitness for a particular purpose. Code samples are offered as-is — please test them before using them in production. Comments are powered by giscus/GitHub and reflect the views of their authors, not js-tools. You agree not to post unlawful, infringing, abusive or spam content, and we may remove any comment at our discretion.',
    'terms.thirdparty.title': '4. Third-Party Services & Advertising',
    'terms.thirdparty.desc':
      'The site integrates third-party services including Google AdSense (advertising) and giscus/GitHub (comments), and links to companion tools on separate subdomains. Your use of those services is also governed by their respective terms. js-tools is not responsible for third-party content, advertisements, or external websites.',
    'terms.disclaimer.title': '5. Disclaimer & Limitation of Liability',
    'terms.disclaimer.desc':
      'To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website. js-tools is provided "as is" and we are not liable for any data loss, quality reduction, or event interruption resulting from the use of our browser tools.',
    'faq.title': 'Frequently Asked Questions',
    'faq.q1.title': 'How do these tools process files entirely in my browser?',
    'faq.q1.desc':
      'Our tools utilize cutting-edge web technologies like WebAssembly, HTML5 APIs, and Canvas. When you import an image, your browser processes it directly on your computer using local computing resources. No files are uploaded to any external server, ensuring maximum privacy and speed.',
    'faq.q2.title': 'Are my files safe and private?',
    'faq.q2.desc':
      'Yes, absolutely. Because all file processing happens locally in your browser sandbox, your files never leave your device. We do not (and cannot) see, store, or collect any of your files or personal data.',
    'faq.q3.title': 'What image formats does the Image Optimizer support?',
    'faq.q3.desc':
      'The Image Optimizer supports standard web formats including JPEG, PNG, WebP, SVG, and even HEIC/HEIF files directly from iPhones, making it easy to convert and compress iPhone photos for web use.',
    'faq.q4.title': 'How does the SnapCast live slideshow demo work?',
    'faq.q4.desc':
      'SnapCast uses a real-time database connection to instantly synchronize photo uploads. Guests scan a dynamically generated QR code using their smartphone, snap a photo, and the image is cast to the active live slideshow within seconds without requiring any app installations.',
    'faq.q5.title': 'Is there a limit on file size or bulk processing count?',
    'faq.q5.desc':
      'There are no artificial limits imposed by js-tools. You can process as many files as your device memory can handle. Large batch sizes are processed sequentially to prevent browser tabs from freezing.',

    'cq.name': 'ColorQuarium',
    'cq.tagline': 'A living, generative aquarium of color and motion',
    'cq.desc':
      'ColorQuarium turns your screen into a calming, generative art display — and your phone into a remote control. Open the live view on a TV or monitor, then use your phone to change colors, themes, and motion in real time.',
    'cq.f1': 'Real-time generative visuals',
    'cq.f2': 'Mobile remote control via QR code',
    'cq.f3': 'Customizable color themes',
    'cq.f4': 'Smooth, ambient animations',
    'cq.f5': 'No installs — runs in the browser',
    'cq.open': 'Open tool →',
    'cq.demo.label': '🐠 Live demo — control the display from your phone',
    'cq.demo.title': 'See it in action — right now',
    'cq.demo.desc':
      'This is a real, live ColorQuarium display. Scan the QR code with your phone to open the remote control and change what appears on screen in real time.',
    'cq.demo.qr.note': 'Opens the remote control screen on your phone',
    'nav.donate': 'Donate',
    'donate.title': 'Donate — js-tools',
    'donate.h1': 'Support js-tools',
    'donate.intro':
      'js-tools is free, open-source, and does not collect your data. If you find these tools useful, please consider supporting the project to help cover server and development costs. Thank you so much!',
    'donate.paypal.title': 'PayPal',
    'donate.paypal.desc': 'Support via PayPal for international donors.',
    'donate.paypal.btn': 'Donate via PayPal',
    'donate.momo.title': 'MoMo E-Wallet',
    'donate.momo.desc': 'Scan the QR code using MoMo app to send your support instantly.',
    'donate.mb.title': 'MB Bank Transfer',
    'donate.mb.desc': 'Transfer to MB Bank account by scanning the QR code.',
    'donate.qr.scan': 'Scan to donate',
  },
  vi: {
    'nav.imageOptimizer': 'Tối ưu ảnh',
    'nav.snapcast': 'Snapcast',
    'nav.qr': 'Tạo mã QR',
    'nav.cq': 'ColorQuarium',
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
    'io.desc':
      'Kéo thả ảnh để nén mà không giảm chất lượng. Hỗ trợ JPEG, PNG, WebP và HEIC từ iPhone. Thêm watermark, thay đổi kích thước hàng loạt, so sánh trước/sau — tất cả mà không cần tải lên bất kỳ server nào.',
    'io.f1': 'Xuất JPEG & WebP',
    'io.f2': 'Xử lý hàng loạt với tiến trình',
    'io.f3': 'Watermark chữ & hình ảnh',
    'io.f4': 'Slider so sánh trước/sau',
    'io.f5': 'Hỗ trợ HEIC/HEIF (ảnh iPhone)',
    'io.open': 'Mở công cụ →',
    'sc.name': 'Snapcast',
    'sc.tagline': 'Trình chiếu ảnh trực tiếp cho sự kiện',
    'sc.desc':
      'Tạo bức tường ảnh trực tiếp tại đám cưới, tiệc tùng và hội nghị. Khách quét mã QR, chụp ảnh trên điện thoại và ảnh xuất hiện trên màn hình lớn trong vài giây. Có hiệu ứng động, điều khiển từ xa và thư viện ảnh sau sự kiện.',
    'sc.f1': 'Onboarding khách qua QR code',
    'sc.f2': 'Đồng bộ Firestore thời gian thực',
    'sc.f3': 'Hiệu ứng slideshow động',
    'sc.f4': 'Điều khiển từ xa qua điện thoại',
    'sc.f5': 'Thư viện ảnh sau sự kiện',
    'sc.open': 'Mở công cụ →',
    'qr.name': 'Tạo mã QR',
    'qr.tagline': 'Tạo & tùy chỉnh mã QR — 100% trên trình duyệt',
    'qr.desc':
      'Tạo mã QR có thể tùy chỉnh hoàn toàn với logo, màu sắc tùy chọn, kiểu màu gradient và hình dáng điểm quét đa dạng. Hoàn hảo cho liên kết, Wi-Fi, danh thiếp và văn bản — tất cả được xử lý cục bộ trên thiết bị của bạn, bảo mật tuyệt đối.',
    'qr.f1': 'Chèn logo và xây dựng thương hiệu',
    'qr.f2': 'Tùy chỉnh màu đơn sắc & màu gradient',
    'qr.f3': 'Hỗ trợ URL, Wi-Fi, vCard & văn bản',
    'qr.f4': 'Thay đổi hình dáng mắt đọc & điểm quét',
    'qr.f5': 'Xuất file SVG, PNG & PDF độ phân giải cao',
    'qr.open': 'Mở công cụ →',
    'rmbg.name': 'Xóa nền ảnh',
    'rmbg.tagline': 'Xóa nền phông ảnh tự động — 100% trên trình duyệt',
    'rmbg.desc':
      'Xóa phông nền hình ảnh của bạn ngay lập tức bằng mạng nơ-ron AI cục bộ. Hỗ trợ JPEG, PNG, WebP và HEIC. Toàn bộ quy trình diễn ra 100% trên thiết bị của bạn, bảo mật dữ liệu tuyệt đối.',
    'rmbg.f1': 'Phân tách nền bằng AI cục bộ',
    'rmbg.f2': 'Bảo mật 100% — không tải ảnh lên máy chủ',
    'rmbg.f3': 'Hỗ trợ các định dạng JPEG, PNG, WebP và HEIC',
    'rmbg.f4': 'Xuất ảnh PNG trong suốt độ nét cao',
    'rmbg.f5': 'Hoàn toàn miễn phí, không watermark hay giới hạn',
    'rmbg.open': 'Mở công cụ →',
    'sc.demo.label': '🎉 Demo trực tiếp — ảnh cập nhật theo thời gian thực',
    'sc.demo.title': 'Trải nghiệm ngay — không cần đăng ký',
    'sc.demo.desc':
      'Đây là một sự kiện Snapcast thật, đang chạy trực tiếp. Quét mã QR bằng điện thoại, chụp ảnh và xem ảnh xuất hiện trên slideshow trong vài giây.',
    'sc.demo.qr.hint': 'Quét bằng điện thoại để gửi ảnh lên demo slideshow',
    'sc.demo.qr.btn': '📱 Xem QR code →',
    'sc.demo.qr.note': 'Mở màn hình upload ảnh dành cho khách',
    'sc.demo.contact.label': '📸 Lượt gửi ảnh có giới hạn. Muốn demo riêng cho sự kiện của bạn?',
    'why.title': 'Tại sao chọn js-tools?',
    'why.privacy.title': 'Trải nghiệm',
    'why.privacy.desc':
      'Trực quan, mạnh mẽ, tuyệt vời. Mỗi công cụ được thiết kế để tối đa hóa hiệu suất và dễ sử dụng.',
    'why.free.title': 'Tốc độ cực nhanh',
    'why.free.desc':
      'Không cần cài đặt, không tải lên server. Mở công cụ và bắt đầu ngay lập tức. Mọi thứ xử lý trên thiết bị của bạn.',
    'why.oss.title': 'Tiện lợi',
    'why.oss.desc': 'Không cần tài khoản, không phức tạp. Chỉ cần mở, sử dụng và đi. Mọi thứ bạn cần đều có sẵn.',
    'footer.copy': '© {year} js-tools — Làm với ❤️ và chuẩn web mở.',
    'nav.home': 'Trang chủ',
    'nav.blog': 'Blog',
    'nav.loan': 'Công Cụ Tính Tiền Vay',
    'nav.privacy': 'Chính sách bảo mật',
    'nav.terms': 'Điều khoản dịch vụ',
    'privacy.title': 'Chính sách bảo mật — js-tools',
    'privacy.h1': 'Chính sách bảo mật',
    'privacy.intro':
      'Cập nhật lần cuối: 28 tháng 6, 2026. Tại js-tools (js-tools.org), bảo vệ quyền riêng tư của bạn là ưu tiên cốt lõi. Chúng tôi xây dựng các công cụ miễn phí, ưu tiên quyền riêng tư, chạy hoàn toàn trong trình duyệt, cùng với một blog lập trình mang tính giáo dục. Chính sách này giải thích những thông tin hạn chế nào có liên quan khi bạn sử dụng trang web và cách chúng được xử lý.',
    'privacy.local.title': '1. Xử lý cục bộ (Không thu thập tệp)',
    'privacy.local.desc':
      'Mọi tệp bạn mở trong các công cụ của chúng tôi — bao gồm Image Optimizer, công cụ tách nền RemoveBG, QR Code Generator, ColorQuarium và các công cụ khác — đều được xử lý hoàn toàn bên trong trình duyệt web của bạn bằng các công nghệ phía client như WebAssembly, HTML5 Canvas và WebGL. Hình ảnh và tệp của bạn không bao giờ được tải lên, lưu trữ hay xem bởi bất kỳ máy chủ nào. Một số công cụ dùng AI (ví dụ RemoveBG) tải về một tệp mô hình một lần từ mạng phân phối nội dung (CDN) để việc tính toán chạy trên chính thiết bị của bạn; tệp bạn xử lý vẫn không bao giờ rời khỏi máy tính của bạn.',
    'privacy.cookies.title': '2. Cookie & Bộ nhớ cục bộ',
    'privacy.cookies.desc':
      'js-tools sử dụng một lượng nhỏ bộ nhớ trình duyệt (cookie và local storage) để ghi nhớ tùy chọn của bạn — như ngôn ngữ đã chọn và giao diện sáng/tối — để trang web hoạt động đúng như bạn mong đợi trong lần truy cập tiếp theo. Các tùy chọn này nằm trên thiết bị của bạn. Các dịch vụ bên thứ ba mô tả bên dưới có thể đặt cookie riêng của họ.',
    'privacy.ads.title': '3. Quảng cáo (Google AdSense)',
    'privacy.ads.desc':
      'Một số trang hiển thị quảng cáo do Google AdSense — một nhà cung cấp bên thứ ba — phục vụ. Google và các đối tác có thể sử dụng cookie để phục vụ quảng cáo dựa trên các lượt truy cập trước của bạn vào trang này và các trang khác. Bạn có thể xem và kiểm soát cách Google sử dụng dữ liệu cho quảng cáo, cũng như từ chối quảng cáo cá nhân hóa, qua phần Cài đặt quảng cáo của Google và trang Chính sách quyền riêng tư &amp; Điều khoản của Google tại: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">https://policies.google.com/technologies/ads</a>',
    'privacy.comments.title': '4. Bình luận trên blog (giscus & GitHub)',
    'privacy.comments.desc':
      'Phần bình luận trên blog của chúng tôi được cung cấp bởi giscus, lưu các thảo luận trong GitHub Discussions. Để đăng bình luận, bạn đăng nhập bằng tài khoản GitHub, và mọi nội dung bạn đăng đều công khai và được xử lý theo chính sách quyền riêng tư của riêng GitHub. Nếu bạn không bao giờ bình luận, bạn không cần tài khoản hay dữ liệu cá nhân nào để đọc blog.',
    'privacy.thirdparty.title': '5. Liên kết & Dịch vụ bên thứ ba',
    'privacy.thirdparty.desc':
      'Trang web liên kết tới các công cụ đồng hành trên các tên miền phụ riêng (như SnapCast và ColorQuarium) và tới các tài nguyên bên ngoài được trích dẫn trong các bài viết. Khi bạn theo một liên kết tới bên thứ ba — bao gồm Google, GitHub hay bất kỳ trang nào được trích dẫn trong blog — chính sách quyền riêng tư và điều khoản của bên đó sẽ được áp dụng. Chúng tôi không chịu trách nhiệm về cách hoạt động của các trang bên ngoài.',
    'privacy.consent.title': '6. Sự đồng ý & Thay đổi',
    'privacy.consent.desc':
      'Bằng cách sử dụng js-tools, bạn đồng ý với Chính sách bảo mật này. Chúng tôi có thể cập nhật chính sách theo thời gian để phản ánh các công cụ hoặc dịch vụ mới; ngày "cập nhật lần cuối" ở trên luôn cho biết phiên bản hiện hành.',
    'terms.title': 'Điều khoản dịch vụ — js-tools',
    'terms.h1': 'Điều khoản dịch vụ',
    'terms.intro':
      'Chào mừng đến với js-tools! Các điều khoản và điều kiện này phác thảo các quy tắc và quy định cho việc sử dụng trang web js-tools tại js-tools.org, bao gồm các công cụ chạy trên trình duyệt và blog giáo dục.',
    'terms.license.title': '1. Sở hữu trí tuệ & Giấy phép sử dụng',
    'terms.license.desc':
      'Trừ khi có quy định khác, js-tools và/hoặc người cấp phép của nó sở hữu quyền sở hữu trí tuệ đối với tất cả tài liệu trên js-tools. Tất cả quyền sở hữu trí tuệ được bảo lưu. Bạn có thể truy cập tài liệu này từ js-tools cho mục đích sử dụng cá nhân hoặc kinh doanh của riêng bạn, tuân theo các hạn chế được đặt ra trong các điều khoản và điều kiện này.',
    'terms.local.title': '2. Đảm bảo xử lý phía client, không có máy chủ',
    'terms.local.desc':
      'Các tiện ích của chúng tôi — bao gồm Image Optimizer, RemoveBG, QR Code Generator và ColorQuarium — chạy hoàn toàn phía client trong trình duyệt của bạn. Chúng tôi không cung cấp dịch vụ lưu trữ, hosting hay sao lưu tệp, và các tệp đã xử lý không được giữ lại ở bất kỳ đâu. Bạn hoàn toàn chịu trách nhiệm lưu và giữ bản sao của mọi kết quả bạn tạo ra.',
    'terms.content.title': '3. Nội dung giáo dục & Bình luận của người dùng',
    'terms.content.desc':
      'Các bài viết và khóa học lập trình trên blog của chúng tôi được cung cấp cho mục đích giáo dục theo nguyên trạng ("as is"), không bảo đảm về tính chính xác hay phù hợp cho một mục đích cụ thể. Các đoạn mã mẫu được cung cấp nguyên trạng — vui lòng kiểm thử trước khi dùng trong môi trường thực tế. Bình luận được cung cấp bởi giscus/GitHub và phản ánh quan điểm của tác giả, không phải của js-tools. Bạn đồng ý không đăng nội dung trái pháp luật, vi phạm bản quyền, lăng mạ hoặc spam, và chúng tôi có quyền gỡ bất kỳ bình luận nào tùy theo quyết định của mình.',
    'terms.thirdparty.title': '4. Dịch vụ bên thứ ba & Quảng cáo',
    'terms.thirdparty.desc':
      'Trang web tích hợp các dịch vụ bên thứ ba bao gồm Google AdSense (quảng cáo) và giscus/GitHub (bình luận), và liên kết tới các công cụ đồng hành trên các tên miền phụ riêng. Việc bạn sử dụng các dịch vụ đó cũng tuân theo điều khoản riêng của chúng. js-tools không chịu trách nhiệm về nội dung bên thứ ba, quảng cáo hay các trang web bên ngoài.',
    'terms.disclaimer.title': '5. Tuyên bố từ chối trách nhiệm & Giới hạn trách nhiệm pháp lý',
    'terms.disclaimer.desc':
      'Trong phạm vi tối đa được pháp luật hiện hành cho phép, chúng tôi loại trừ tất cả các tuyên bố, bảo đảm và điều kiện liên quan đến trang web của chúng tôi và việc sử dụng trang web này. js-tools được cung cấp "nguyên trạng" và chúng tôi không chịu trách nhiệm về bất kỳ mất mát dữ liệu, giảm chất lượng hoặc gián đoạn sự kiện nào do sử dụng các công cụ trình duyệt của chúng tôi.',
    'faq.title': 'Các câu hỏi thường gặp',
    'faq.q1.title': 'Làm thế nào để các công cụ xử lý tệp hoàn toàn trên trình duyệt của tôi?',
    'faq.q1.desc':
      'Các công cụ của chúng tôi sử dụng công nghệ web tiên tiến như WebAssembly, HTML5 API và Canvas. Khi bạn tải ảnh lên, trình duyệt sẽ xử lý ảnh trực tiếp trên máy tính của bạn bằng tài nguyên hệ thống cục bộ. Không có tệp tin nào được tải lên máy chủ ngoài, đảm bảo quyền riêng tư và tốc độ tối đa.',
    'faq.q2.title': 'Tệp tin của tôi có an toàn và riêng tư không?',
    'faq.q2.desc':
      'Có, hoàn toàn tuyệt đối. Vì tất cả quá trình xử lý tệp diễn ra cục bộ trong môi trường trình duyệt an toàn (sandbox), tệp của bạn không bao giờ rời khỏi thiết bị. Chúng tôi không (và không thể) xem, lưu trữ hoặc thu thập bất kỳ tệp tin hay dữ liệu cá nhân nào của bạn.',
    'faq.q3.title': 'Công cụ Tối ưu ảnh hỗ trợ những định dạng ảnh nào?',
    'faq.q3.desc':
      'Công cụ Tối ưu ảnh hỗ trợ các định dạng web tiêu chuẩn bao gồm JPEG, PNG, WebP, SVG và cả các tệp HEIC/HEIF trực tiếp từ iPhone, giúp bạn dễ dàng chuyển đổi và nén ảnh iPhone để sử dụng trên web.',
    'faq.q4.title': 'Trình chiếu trực tiếp SnapCast hoạt động như thế nào?',
    'faq.q4.desc':
      'SnapCast sử dụng kết nối cơ sở dữ liệu thời gian thực để đồng bộ hóa ảnh tải lên ngay lập tức. Khách mời chỉ cần quét mã QR được tạo tự động bằng điện thoại thông minh, chụp ảnh và ảnh sẽ được chiếu lên màn hình trình chiếu trực tiếp đang chạy trong vài giây mà không cần cài đặt ứng dụng.',
    'faq.q5.title': 'Có giới hạn nào về kích thước tệp hoặc số lượng xử lý hàng loạt không?',
    'faq.q5.desc':
      'Không có giới hạn nhân tạo nào được thiết lập bởi js-tools. Bạn có thể xử lý bao nhiêu tệp tùy ý tùy thuộc vào dung lượng bộ nhớ thiết bị của bạn. Các lô hàng lớn sẽ được xử lý tuần tự để tránh tab trình duyệt bị đóng băng.',

    'cq.name': 'ColorQuarium',
    'cq.tagline': 'Bể cá nghệ thuật sinh động với màu sắc và chuyển động',
    'cq.desc':
      'ColorQuarium biến màn hình của bạn thành một màn hình nghệ thuật sinh động, thư giãn — và biến điện thoại của bạn thành remote điều khiển. Mở màn hình hiển thị trên TV hoặc monitor, sau đó dùng điện thoại để thay đổi màu sắc, chủ đề và chuyển động theo thời gian thực.',
    'cq.f1': 'Hiệu ứng hình ảnh sinh động theo thời gian thực',
    'cq.f2': 'Điều khiển từ xa qua điện thoại bằng QR code',
    'cq.f3': 'Tùy chỉnh chủ đề màu sắc',
    'cq.f4': 'Hiệu ứng chuyển động mượt mà, êm dịu',
    'cq.f5': 'Không cần cài đặt — chạy ngay trên trình duyệt',
    'cq.open': 'Mở công cụ →',
    'cq.demo.label': '🐠 Demo trực tiếp — điều khiển màn hình từ điện thoại',
    'cq.demo.title': 'Trải nghiệm ngay — không cần đăng ký',
    'cq.demo.desc':
      'Đây là một màn hình ColorQuarium thật, đang chạy trực tiếp. Quét mã QR bằng điện thoại để mở remote điều khiển và thay đổi nội dung hiển thị theo thời gian thực.',
    'cq.demo.qr.note': 'Mở màn hình remote điều khiển dành cho điện thoại',
    'nav.donate': 'Ủng hộ',
    'donate.title': 'Ủng hộ — js-tools',
    'donate.h1': 'Ủng hộ dự án js-tools',
    'donate.intro':
      'js-tools là dự án miễn phí, mã nguồn mở và không thu thập dữ liệu người dùng. Nếu bạn thấy các công cụ này hữu ích, hãy cân nhắc ủng hộ dự án để giúp chúng tôi duy trì chi phí máy chủ và phát triển. Xin chân thành cảm ơn!',
    'donate.paypal.title': 'PayPal',
    'donate.paypal.desc': 'Ủng hộ qua PayPal đối với các nhà hảo tâm quốc tế.',
    'donate.paypal.btn': 'Ủng hộ qua PayPal',
    'donate.momo.title': 'Ví Điện Tử MoMo',
    'donate.momo.desc': 'Quét mã QR bằng ứng dụng MoMo để gửi tiền ủng hộ nhanh chóng.',
    'donate.mb.title': 'Chuyển Khoản MB Bank',
    'donate.mb.desc': 'Chuyển khoản vào tài khoản MB Bank bằng cách quét mã QR.',
    'donate.qr.scan': 'Quét mã để ủng hộ',
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
    document.querySelectorAll('[data-i18n]').forEach((el) => {
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
      btn.innerHTML =
        l === 'vi'
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
