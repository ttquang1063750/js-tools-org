const TRANSLATIONS = {
  en: {
    'nav.imageOptimizer': 'Image Optimizer',
    'nav.snapcast': 'SnapCast',
    'nav.qr': 'QR Generator',
    'nav.cq': 'ColorQuarium',
    'nav.rubik': 'Rubik & Pyraminx',
    'hero.badge': '✅ No ads in tools &nbsp;·&nbsp; No redirects &nbsp;·&nbsp; Privacy-first',
    'hero.h1.line1': 'Your browser is',
    'hero.h1.line2': 'more powerful than you think.',
    'hero.sub':
      'Pure-JavaScript solutions running 100% in your browser: image compression, background removal, QR codes — free, no sign-up, and your files never leave your device. Plus a growing library of in-depth learning series with interactive demos right on the page: build neural networks, train a GPT-mini, simulate circuits, master SQL… For live events, SnapCast and ColorQuarium deliver real-time photo walls and ambient displays.',
    'hero.cta.explore': 'Explore tools ↓',
    'hero.cta.github': 'GitHub →',
    'stats.tools': 'Tools & services',
    'stats.bytes': 'Ads inside tools',
    'stats.inbrowser': 'Runs in your browser',
    'footer.tools': 'Tools & services',
    'footer.explore': 'Explore',
    'footer.legal': 'Legal',
    'tools.title': 'Our Tools',
    'io.name': 'Image Optimizer',
    'io.badge': '✓ Free · Unlimited · No sign-up',
    'io.tagline': 'Compress & convert images — 100% in-browser',
    'io.desc':
      'Drag and drop images to compress them with zero quality loss. Supports JPEG, PNG, WebP, and HEIC from iPhone. Add watermarks, resize in bulk, compare before/after — all without uploading a single byte to any server.',
    'io.f1': 'JPEG & WebP output',
    'io.f2': 'Bulk processing with progress',
    'io.f3': 'Text & image watermarks',
    'io.f4': 'Before/after comparison slider',
    'io.f5': 'HEIC/HEIF support (iPhone photos)',
    'io.open': 'Open tool →',
    'sc.name': 'SnapCast',
    'sc.badge': '☁️ Cloud service · Sign-up · Paid event plans',
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
    'qr.badge': '✓ Free · Unlimited · No sign-up',
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
    'rmbg.badge': '✓ Free · Unlimited · No sign-up',
    'rmbg.tagline': 'Remove image backgrounds automatically — 100% in-browser',
    'rmbg.desc':
      'Erase backgrounds from your photos instantly using local AI neural networks. Supports JPEG, PNG, WebP, and HEIC. The entire process runs 100% locally in your browser sandbox with zero server uploads, keeping your data secure.',
    'rmbg.f1': 'Local AI-powered segmentation',
    'rmbg.f2': '100% private — no server uploads',
    'rmbg.f3': 'Supports JPEG, PNG, WebP, and HEIC',
    'rmbg.f4': 'High-res transparent PNG exports',
    'rmbg.f5': 'Completely free with no limits or watermarks',
    'rmbg.open': 'Open tool →',
    'rubik.name': 'Rubik & Pyraminx Solver',
    'rubik.badge': '✓ Free · Fun · No sign-up',
    'rubik.tagline': "Solve a 3x3 Rubik's Cube or a Pyraminx — enter colors, get the moves",
    'rubik.desc':
      "Enter your scrambled cube's or pyraminx's colors on an interactive 3D model and get a solution instantly. For the cube, pick the fast Kociemba algorithm (~20 moves) or a beginner-friendly layer-by-layer method with named stages — a fun, free break running entirely in your browser.",
    'rubik.f1': "Two puzzles — 3x3 Rubik's Cube & Pyraminx",
    'rubik.f2': 'Kociemba (~20 moves) & beginner layer-by-layer methods',
    'rubik.f3': 'Interactive 3D model — drag to rotate, tap to paint',
    'rubik.f4': 'Scramble generator & solved-pattern presets',
    'rubik.f5': '100% free, no installation, works on any device',
    'rubik.open': 'Open app →',
    'sc.demo.label': '🎉 Live demo — photos update in real time',
    'sc.demo.title': 'See it in action — right now',
    'sc.demo.load': 'Load live slideshow',
    'sc.demo.load.note': 'Streams a real event running right now',
    'sc.demo.desc':
      'This is a real, live SnapCast event. Scan the QR code with your phone, take a photo, and watch it appear on the slideshow within seconds. No sign-up needed for the demo.',
    'sc.demo.qr.hint': 'Scan with your phone to send a photo to the demo slideshow',
    'sc.demo.qr.btn': '📱 View QR code →',
    'sc.demo.qr.note': 'Opens the guest upload screen on your phone',
    'sc.demo.contact.label': '📸 Photo slots are limited. Want a private demo for your event?',
    'why.title': 'Why js-tools?',
    'why.privacy.title': 'Privacy First',
    'why.privacy.desc':
      'Utility tools process everything locally in your browser — your files never leave your device, and we could not see them even if we wanted to.',
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
      'Last updated: July 11, 2026. At js-tools (js-tools.org), protecting your privacy is a core priority. We build privacy-first utility tools that run entirely in your browser, cloud services for live events, and an educational programming blog. This policy explains what limited information is involved when you use the site and how it is handled.',
    'privacy.local.title': '1. Local Processing (Zero File Collection)',
    'privacy.local.desc':
      'Every file you open in our utility tools — the Image Optimizer, the RemoveBG background remover and the QR Code Generator — is processed entirely inside your web browser using client-side technologies such as WebAssembly, HTML5 Canvas and WebGL. Your images and files are never uploaded to, stored on, or viewed by any server. Some AI-powered tools (for example RemoveBG) download a one-time model file from a content delivery network so the computation can run on your own device; the file you process still never leaves your computer.',
    'privacy.cookies.title': '2. Cookies & Local Storage',
    'privacy.cookies.desc':
      'js-tools uses a small amount of browser storage (cookies and local storage) to remember your preferences — such as your chosen language and light/dark theme — so the site behaves the way you expect on your next visit. These preferences stay on your device. The third-party services described below may set their own cookies.',
    'privacy.ads.title': '3. Advertising (Google AdSense)',
    'privacy.ads.desc':
      'Some pages display ads served by Google AdSense, a third-party vendor. Google and its partners may use cookies to serve ads based on your prior visits to this and other websites. You can review and control how Google uses data for ads, and opt out of personalized advertising, via Google Ads Settings and the Google Privacy &amp; Terms page at: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">https://policies.google.com/technologies/ads</a>',
    'privacy.comments.title': '4. Blog Comments (giscus & GitHub)',
    'privacy.comments.desc':
      'Our blog comments are powered by giscus, which stores discussions in GitHub Discussions. To post a comment you sign in with a GitHub account, and anything you post is public and handled under GitHub’s own privacy policy. If you never comment, no account or personal data is required to read the blog.',
    'privacy.events.title': '5. Event Services (SnapCast & ColorQuarium)',
    'privacy.events.desc':
      'SnapCast and ColorQuarium are cloud services for live events and work differently from the utility tools above. Hosting an event requires an account, and paid plans are available. Photos that guests choose to share through SnapCast — along with your event settings — are uploaded and stored so they can appear on the live slideshow and in the post-event gallery; ColorQuarium stores your display configuration. This data is used to run your event and is handled under the terms of those services.',
    'privacy.thirdparty.title': '6. Third-Party Links & Services',
    'privacy.thirdparty.desc':
      'The site links to companion tools on separate subdomains (such as SnapCast and ColorQuarium) and to external resources referenced in our articles. Once you follow a link to a third party — including Google, GitHub or any site cited in the blog — that party’s own privacy policy and terms apply. We are not responsible for the practices of external sites.',
    'privacy.consent.title': '7. Consent & Changes',
    'privacy.consent.desc':
      'By using js-tools, you consent to this Privacy Policy. We may update it from time to time to reflect new tools or services; the "last updated" date above always indicates the current version.',
    'terms.title': 'Terms of Service — js-tools',
    'terms.h1': 'Terms of Service',
    'terms.intro':
      "Welcome to js-tools! These terms and conditions outline the rules and regulations for the use of js-tools' website, located at js-tools.org, including its browser-based tools and educational blog.",
    'terms.license.title': '1. Intellectual Property & Usage License',
    'terms.license.desc':
      'Unless otherwise stated, js-tools and/or its licensors own the intellectual property rights for all material on js-tools. All intellectual property rights are reserved. You may access this from js-tools for your own personal or business use subjected to restrictions set in these terms and conditions.',
    'terms.local.title': '2. Client-Side Utilities & Cloud Event Services',
    'terms.local.desc':
      'Our utility tools — the Image Optimizer, RemoveBG and the QR Code Generator — run fully client-side in your browser. For these tools we do not provide file storage, hosting or backup services, and processed files are not retained anywhere; you are solely responsible for saving and keeping copies of any output you create. Our event services, SnapCast and ColorQuarium, are cloud services: they require an account, offer paid plans, and store the photos and settings you choose to share, as described in their own terms.',
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
      'Yes. In our utility tools (Image Optimizer, Remove BG, QR Generator), all processing happens locally in your browser sandbox — your files never leave your device and we cannot see or store them. Event services like SnapCast and ColorQuarium do store the photos and settings you choose to share, handled under their own terms.',
    'faq.q3.title': 'What image formats does the Image Optimizer support?',
    'faq.q3.desc':
      'The Image Optimizer supports standard web formats including JPEG, PNG, WebP, SVG, and even HEIC/HEIF files directly from iPhones, making it easy to convert and compress iPhone photos for web use.',
    'faq.q4.title': 'How does the SnapCast live slideshow demo work?',
    'faq.q4.desc':
      'SnapCast uses a real-time database connection to instantly synchronize photo uploads. Guests scan a dynamically generated QR code using their smartphone, snap a photo, and the image is cast to the active live slideshow within seconds without requiring any app installations.',
    'faq.q5.title': 'Is there a limit on file size or bulk processing count?',
    'faq.q5.desc':
      'There are no artificial limits in our free utility tools. You can process as many files as your device memory can handle. Large batch sizes are processed sequentially to prevent browser tabs from freezing.',

    'cq.name': 'ColorQuarium',
    'cq.badge': '☁️ Cloud service · Sign-up · Paid plans',
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
    'cq.demo.load': 'Load live display',
    'cq.demo.load.note': 'Streams a real display running right now',
    'cq.demo.desc':
      'This is a real, live ColorQuarium display. Scan the QR code with your phone to open the remote control and change what appears on screen in real time.',
    'cq.demo.qr.note': 'Opens the remote control screen on your phone',
    'nav.donate': 'Donate',
    'donate.title': 'Donate — js-tools',
    'donate.h1': 'Support js-tools',
    'donate.intro':
      'js-tools is an independent project: the utility tools are free, run entirely in your browser, and collect no data, while optional paid plans on SnapCast and ColorQuarium help sustain development. If you find the free tools useful, please consider supporting the project to help cover server and development costs. Thank you so much!',
    'donate.paypal.title': 'PayPal',
    'donate.paypal.desc': 'Support via PayPal for international donors.',
    'donate.paypal.btn': 'Donate via PayPal',
    'donate.momo.title': 'MoMo E-Wallet',
    'donate.momo.desc': 'Scan the QR code using MoMo app to send your support instantly.',
    'donate.mb.title': 'MB Bank Transfer',
    'donate.mb.desc': 'Transfer to MB Bank account by scanning the QR code.',
    'donate.qr.scan': 'Scan to donate',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'about.title': 'About js-tools — Free Browser Tools & Programming Tutorials',
    'about.h1': 'About js-tools',
    'about.intro':
      'js-tools.org is an independent project with a simple goal: make genuinely useful software free, fast, and private. Our utility tools run entirely in your web browser — no installs, no sign-ups, and your files never leave your device — while our cloud services bring real-time experiences to live events. Alongside the tools, we publish an in-depth, bilingual (English & Vietnamese) programming blog so the techniques behind these tools are open for anyone to learn.',
    'about.mission.title': 'Our Mission',
    'about.mission.desc':
      'Most online tools ask you to upload your files to a stranger’s server, wait, and hope your data is deleted afterwards. We believe that is unnecessary. Modern browsers ship with powerful technologies — WebAssembly, WebGL, the Canvas API, Web Audio and more — that can do real work directly on your machine. Every js-tools utility is built on this principle: your data stays with you, the result is instant, and the tool is free to use.',
    'about.what.title': 'What We Build',
    'about.what.desc':
      'Our free utility tools — the Image Optimizer (compress and convert JPEG, PNG, WebP and HEIC), RemoveBG (AI background removal) and the QR Code Generator — run 100% client-side, so they work offline, respect your privacy, and never see your files. Alongside them we operate two cloud services for live events: SnapCast (a real-time photo slideshow where guests share photos to the big screen) and ColorQuarium (a generative ambient display you control from your phone). The event services require an account, offer paid plans, and store the photos and settings you choose to share.',
    'about.blog.title': 'The Learning Blog',
    'about.blog.desc':
      'We write long-form, carefully edited tutorials that explain how this kind of software actually works — from C, C++ and JavaScript fundamentals to HTML5 Canvas, WebGL graphics and shell scripting. Each series is hands-on, with runnable code, interactive visualizers and quizzes, and every article is written in both English and Vietnamese to make deep technical material accessible to more readers.',
    'about.who.title': 'Who Builds This',
    'about.who.desc':
      'js-tools is created and maintained by Quang Tang, an independent software engineer who builds open web tools and writes about programming. The project is self-funded; optional advertising and donations help cover hosting and development so the tools can stay free for everyone. You can follow the work or get in touch through the links on our Contact page.',
    'about.contact.title': 'Get in Touch',
    'about.contact.desc':
      'Questions, bug reports, feature ideas, or just want to say hello? We genuinely read every message. Visit the Contact page or email support@js-tools.org — feedback from people who use the tools is what shapes what we build next.',
    'contact.title': 'Contact js-tools — Support, Feedback & Bug Reports',
    'contact.h1': 'Contact Us',
    'contact.intro':
      'We’d love to hear from you. Whether you’ve found a bug, have an idea for a new tool, want to suggest a blog topic, or have a question about how something works, the best way to reach us is below. Messages are read and answered by the person who actually builds js-tools.',
    'contact.email.title': 'Email',
    'contact.email.desc':
      'For support, partnership, or general questions, email us at support@js-tools.org. We aim to reply within a few business days. When reporting a bug, telling us your browser and what you were doing helps us fix it faster.',
    'contact.phone.title': 'Phone',
    'contact.phone.desc':
      'Prefer to talk? You can reach us by phone or messaging apps (Zalo) at +84 938 829 401, during Vietnam business hours (GMT+7). For technical issues, email is usually faster because you can attach screenshots and details.',
    'contact.github.title': 'GitHub',
    'contact.github.desc':
      'js-tools is built in the open. Browse the code, report issues, or open a discussion on GitHub — it’s also where our blog comments live, via giscus and GitHub Discussions.',
    'contact.linkedin.title': 'LinkedIn',
    'contact.linkedin.desc': 'Want to connect professionally or talk about a collaboration? Reach out on LinkedIn.',
    'contact.feedback.title': 'Feedback Shapes the Roadmap',
    'contact.feedback.desc':
      'This is an independent project, so real feedback matters more than anything. Tell us which tool you use most, what’s missing, or which programming topic you’d like a tutorial on — it directly influences what gets built and written next.',
    'learn.title': 'Learn How These Tools Work',
    'learn.desc':
      'Our tools are built on open web technology — and we explain exactly how on our blog. Each series is a hands-on, in-depth course with runnable code, interactive visualizers and quizzes, written in both English and Vietnamese. Pick a track and start building.',
    'learn.cta': 'Browse all articles →',
    'learn.c.title': 'C Programming',
    'learn.c.desc': 'Pointers, memory management, data structures and Big-O — the foundations every programmer needs.',
    'learn.cpp.title': 'Modern C++',
    'learn.cpp.desc': 'RAII, move semantics, templates, the STL and smart pointers, explained from the ground up.',
    'learn.js.title': 'JavaScript Deep Dive',
    'learn.js.desc': 'The engine, the event loop, closures, prototypes and async — how JavaScript really runs.',
    'learn.canvas.title': 'HTML5 Canvas',
    'learn.canvas.desc': '2D graphics, animation, physics and particles — build interactive visuals from scratch.',
    'learn.webgl.title': 'WebGL & 3D Graphics',
    'learn.webgl.desc': 'Shaders, the GPU pipeline, lighting and 3D math — real graphics programming in the browser.',
    'learn.bash.title': 'Bash & Shell',
    'learn.bash.desc': 'Scripting, text processing, automation and defensive shell techniques for real-world work.',
    'learn.css.title': 'CSS & Animation',
    'learn.css.desc': 'Modern layouts, flexbox, grid, animations, transitions and responsive design mastery.',
    'learn.webgpu.title': 'WebGPU & 3D Graphics',
    'learn.webgpu.desc': 'Modern GPU compute shaders, WGSL, real-time 3D rendering and interactive graphics.',
    'learn.algo.title': 'Data Structures & Algorithms',
    'learn.algo.desc': 'AVL/Red-Black trees, pathfinding, dynamic programming and hashing — visualized step by step.',
    'learn.git.title': 'Git Internals',
    'learn.git.desc':
      'Object model, branches as pointers, merge/rebase, reflog recovery and remote collaboration — visualized commit graph.',
    'learn.audio.title': 'Web Audio API',
    'learn.audio.desc':
      'AudioContext, oscillators, filters, FFT analysis and spatial sound — hands-on with a real audio node graph.',
    'learn.sql.title': 'SQL In The Browser',
    'learn.sql.desc':
      'Real SQLite compiled to WebAssembly: relational model, JOIN, recursive CTEs, window functions, query optimizer, and internals — no server required.',
    'learn.electronics.title': 'Circuit Simulation',
    'learn.electronics.desc':
      'Learn electronics, analog filters, antennas, logic gates, sequential memory cells, and MCU register programming — completely in-browser.',
    'learn.vlsi.title': 'VLSI & Digital IC Design',
    'learn.vlsi.desc':
      'Master SystemVerilog RTL: 4-level abstraction, synthesis, simulation, place & route, STA — with interactive RTL Playground visualizer.',
    'learn.ai.title': 'AI from Zero to Master',
    'learn.ai.desc':
      'Build AI from scratch in vanilla JS — no API calls: gradient descent, your own autograd, MLP/CNN, Transformer, and a GPT-mini trained live in the browser.',
    'learn.embedded.title': 'Embedded Systems',
    'learn.embedded.desc':
      'Bare-metal C on a self-built virtual MCU: registers, GPIO, interrupts, UART, ADC, DMA, up to a preemptive RTOS — no board required.',
    'learn.dsp.title': 'Digital Signal Processing',
    'learn.dsp.desc':
      'Every DSP algorithm hand-written in vanilla JS — no black-box AnalyserNode: sampling, FFT, windowing, FIR/IIR filters, pole-zero design you hear in real time.',
    'learn.cpu.title': 'Computer Architecture',
    'learn.cpu.desc':
      'Explore the hardware stack running directly in your browser: logic gates, ALU, RISC-V pipelining, speculative execution, cache architectures, Apple Silicon UMA, and quantum qubits.',
    'learn.aie.title': 'Practical AI Engineer',
    'learn.aie.desc':
      'Transition from Web Development to AI. Master Python, PyTorch, MLP/CNN training, Self-Attention & Transformers, LLM APIs, advanced RAG pipelines, and stateful multi-agent systems offline.',
  },
  vi: {
    'nav.imageOptimizer': 'Tối ưu ảnh',
    'nav.snapcast': 'SnapCast',
    'nav.qr': 'Tạo mã QR',
    'nav.cq': 'ColorQuarium',
    'nav.rubik': 'Rubik & Pyraminx',
    'hero.badge': '✅ Công cụ không quảng cáo &nbsp;·&nbsp; Không redirect &nbsp;·&nbsp; Riêng tư trước tiên',
    'hero.h1.line1': 'Trình duyệt của bạn',
    'hero.h1.line2': 'mạnh hơn bạn nghĩ.',
    'hero.sub':
      'Giải pháp JavaScript thuần chạy 100% trong trình duyệt: nén ảnh, xoá nền, tạo mã QR — miễn phí, không cần tài khoản, tệp không rời khỏi máy. Cùng kho series học thuật miễn phí với demo tương tác ngay trên trang: tự xây neural network, train GPT-mini, mô phỏng vi mạch, làm chủ SQL… Cho sự kiện trực tiếp, SnapCast và ColorQuarium mang tới tường ảnh và màn trình diễn thời gian thực.',
    'hero.cta.explore': 'Khám phá công cụ ↓',
    'hero.cta.github': 'GitHub →',
    'stats.tools': 'Công cụ & dịch vụ',
    'stats.bytes': 'Quảng cáo trong công cụ',
    'stats.inbrowser': 'Chạy trong trình duyệt',
    'footer.tools': 'Công cụ & dịch vụ',
    'footer.explore': 'Khám phá',
    'footer.legal': 'Pháp lý',
    'tools.title': 'Công cụ của chúng tôi',
    'io.name': 'Tối ưu ảnh',
    'io.badge': '✓ Miễn phí · Không giới hạn · Không cần tài khoản',
    'io.tagline': 'Nén & chuyển đổi ảnh — 100% trên trình duyệt',
    'io.desc':
      'Kéo thả ảnh để nén mà không giảm chất lượng. Hỗ trợ JPEG, PNG, WebP và HEIC từ iPhone. Thêm watermark, thay đổi kích thước hàng loạt, so sánh trước/sau — tất cả mà không cần tải lên bất kỳ server nào.',
    'io.f1': 'Xuất JPEG & WebP',
    'io.f2': 'Xử lý hàng loạt với tiến trình',
    'io.f3': 'Watermark chữ & hình ảnh',
    'io.f4': 'Slider so sánh trước/sau',
    'io.f5': 'Hỗ trợ HEIC/HEIF (ảnh iPhone)',
    'io.open': 'Mở công cụ →',
    'sc.name': 'SnapCast',
    'sc.badge': '☁️ Dịch vụ cloud · Cần tài khoản · Gói trả phí theo sự kiện',
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
    'qr.badge': '✓ Miễn phí · Không giới hạn · Không cần tài khoản',
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
    'rmbg.badge': '✓ Miễn phí · Không giới hạn · Không cần tài khoản',
    'rmbg.tagline': 'Xóa nền phông ảnh tự động — 100% trên trình duyệt',
    'rmbg.desc':
      'Xóa phông nền hình ảnh của bạn ngay lập tức bằng mạng nơ-ron AI cục bộ. Hỗ trợ JPEG, PNG, WebP và HEIC. Toàn bộ quy trình diễn ra 100% trên thiết bị của bạn, bảo mật dữ liệu tuyệt đối.',
    'rmbg.f1': 'Phân tách nền bằng AI cục bộ',
    'rmbg.f2': 'Bảo mật 100% — không tải ảnh lên máy chủ',
    'rmbg.f3': 'Hỗ trợ các định dạng JPEG, PNG, WebP và HEIC',
    'rmbg.f4': 'Xuất ảnh PNG trong suốt độ nét cao',
    'rmbg.f5': 'Hoàn toàn miễn phí, không watermark hay giới hạn',
    'rmbg.open': 'Mở công cụ →',
    'rubik.name': 'Giải Rubik & Pyraminx',
    'rubik.badge': '✓ Miễn phí · Giải trí · Không cần tài khoản',
    'rubik.tagline': 'Giải khối Rubik 3x3 hoặc Pyraminx — nhập màu, nhận các bước giải',
    'rubik.desc':
      'Nhập màu khối Rubik hoặc Pyraminx đã xáo trộn của bạn trên mô hình 3D tương tác và nhận lời giải ngay lập tức. Với khối Rubik, chọn thuật toán Kociemba nhanh (~20 nước) hoặc phương pháp từng tầng dễ học cho người mới, có tên từng giai đoạn — một phút giải trí miễn phí, chạy hoàn toàn trên trình duyệt.',
    'rubik.f1': 'Hai loại khối — Rubik 3x3 & Pyraminx',
    'rubik.f2': 'Thuật toán Kociemba (~20 nước) & phương pháp từng tầng cho người mới',
    'rubik.f3': 'Mô hình 3D tương tác — kéo để xoay, chạm để tô màu',
    'rubik.f4': 'Trộn ngẫu nhiên & mẫu khối đã giải sẵn',
    'rubik.f5': 'Hoàn toàn miễn phí, không cần cài đặt, dùng trên mọi thiết bị',
    'rubik.open': 'Mở ứng dụng →',
    'sc.demo.label': '🎉 Demo trực tiếp — ảnh cập nhật theo thời gian thực',
    'sc.demo.title': 'Trải nghiệm ngay — demo không cần đăng ký',
    'sc.demo.load': 'Tải slideshow trực tiếp',
    'sc.demo.load.note': 'Phát một sự kiện thật đang chạy ngay lúc này',
    'sc.demo.desc':
      'Đây là một sự kiện SnapCast thật, đang chạy trực tiếp. Quét mã QR bằng điện thoại, chụp ảnh và xem ảnh xuất hiện trên slideshow trong vài giây.',
    'sc.demo.qr.hint': 'Quét bằng điện thoại để gửi ảnh lên demo slideshow',
    'sc.demo.qr.btn': '📱 Xem QR code →',
    'sc.demo.qr.note': 'Mở màn hình upload ảnh dành cho khách',
    'sc.demo.contact.label': '📸 Lượt gửi ảnh có giới hạn. Muốn demo riêng cho sự kiện của bạn?',
    'why.title': 'Tại sao chọn js-tools?',
    'why.privacy.title': 'Riêng tư trước tiên',
    'why.privacy.desc':
      'Công cụ tiện ích xử lý mọi thứ ngay trong trình duyệt — tệp của bạn không rời khỏi thiết bị, và chúng tôi có muốn xem cũng không thể.',
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
      'Cập nhật lần cuối: 11 tháng 7, 2026. Tại js-tools (js-tools.org), bảo vệ quyền riêng tư của bạn là ưu tiên cốt lõi. Chúng tôi xây dựng các công cụ tiện ích ưu tiên quyền riêng tư chạy hoàn toàn trong trình duyệt, các dịch vụ cloud cho sự kiện trực tiếp, cùng một blog lập trình mang tính giáo dục. Chính sách này giải thích những thông tin hạn chế nào có liên quan khi bạn sử dụng trang web và cách chúng được xử lý.',
    'privacy.local.title': '1. Xử lý cục bộ (Không thu thập tệp)',
    'privacy.local.desc':
      'Mọi tệp bạn mở trong các công cụ tiện ích của chúng tôi — Image Optimizer, công cụ tách nền RemoveBG và QR Code Generator — đều được xử lý hoàn toàn bên trong trình duyệt web của bạn bằng các công nghệ phía client như WebAssembly, HTML5 Canvas và WebGL. Hình ảnh và tệp của bạn không bao giờ được tải lên, lưu trữ hay xem bởi bất kỳ máy chủ nào. Một số công cụ dùng AI (ví dụ RemoveBG) tải về một tệp mô hình một lần từ mạng phân phối nội dung (CDN) để việc tính toán chạy trên chính thiết bị của bạn; tệp bạn xử lý vẫn không bao giờ rời khỏi máy tính của bạn.',
    'privacy.cookies.title': '2. Cookie & Bộ nhớ cục bộ',
    'privacy.cookies.desc':
      'js-tools sử dụng một lượng nhỏ bộ nhớ trình duyệt (cookie và local storage) để ghi nhớ tùy chọn của bạn — như ngôn ngữ đã chọn và giao diện sáng/tối — để trang web hoạt động đúng như bạn mong đợi trong lần truy cập tiếp theo. Các tùy chọn này nằm trên thiết bị của bạn. Các dịch vụ bên thứ ba mô tả bên dưới có thể đặt cookie riêng của họ.',
    'privacy.ads.title': '3. Quảng cáo (Google AdSense)',
    'privacy.ads.desc':
      'Một số trang hiển thị quảng cáo do Google AdSense — một nhà cung cấp bên thứ ba — phục vụ. Google và các đối tác có thể sử dụng cookie để phục vụ quảng cáo dựa trên các lượt truy cập trước của bạn vào trang này và các trang khác. Bạn có thể xem và kiểm soát cách Google sử dụng dữ liệu cho quảng cáo, cũng như từ chối quảng cáo cá nhân hóa, qua phần Cài đặt quảng cáo của Google và trang Chính sách quyền riêng tư &amp; Điều khoản của Google tại: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">https://policies.google.com/technologies/ads</a>',
    'privacy.comments.title': '4. Bình luận trên blog (giscus & GitHub)',
    'privacy.comments.desc':
      'Phần bình luận trên blog của chúng tôi được cung cấp bởi giscus, lưu các thảo luận trong GitHub Discussions. Để đăng bình luận, bạn đăng nhập bằng tài khoản GitHub, và mọi nội dung bạn đăng đều công khai và được xử lý theo chính sách quyền riêng tư của riêng GitHub. Nếu bạn không bao giờ bình luận, bạn không cần tài khoản hay dữ liệu cá nhân nào để đọc blog.',
    'privacy.events.title': '5. Dịch vụ sự kiện (SnapCast & ColorQuarium)',
    'privacy.events.desc':
      'SnapCast và ColorQuarium là dịch vụ cloud cho sự kiện trực tiếp và hoạt động khác với các công cụ tiện ích ở trên. Để tổ chức sự kiện, bạn cần tạo tài khoản, và có các gói trả phí. Ảnh mà khách mời chủ động chia sẻ qua SnapCast — cùng các thiết lập sự kiện của bạn — được tải lên và lưu trữ để hiển thị trên slideshow trực tiếp và trong thư viện ảnh sau sự kiện; ColorQuarium lưu cấu hình hiển thị của bạn. Dữ liệu này được dùng để vận hành sự kiện của bạn và được xử lý theo điều khoản của các dịch vụ đó.',
    'privacy.thirdparty.title': '6. Liên kết & Dịch vụ bên thứ ba',
    'privacy.thirdparty.desc':
      'Trang web liên kết tới các công cụ đồng hành trên các tên miền phụ riêng (như SnapCast và ColorQuarium) và tới các tài nguyên bên ngoài được trích dẫn trong các bài viết. Khi bạn theo một liên kết tới bên thứ ba — bao gồm Google, GitHub hay bất kỳ trang nào được trích dẫn trong blog — chính sách quyền riêng tư và điều khoản của bên đó sẽ được áp dụng. Chúng tôi không chịu trách nhiệm về cách hoạt động của các trang bên ngoài.',
    'privacy.consent.title': '7. Sự đồng ý & Thay đổi',
    'privacy.consent.desc':
      'Bằng cách sử dụng js-tools, bạn đồng ý với Chính sách bảo mật này. Chúng tôi có thể cập nhật chính sách theo thời gian để phản ánh các công cụ hoặc dịch vụ mới; ngày "cập nhật lần cuối" ở trên luôn cho biết phiên bản hiện hành.',
    'terms.title': 'Điều khoản dịch vụ — js-tools',
    'terms.h1': 'Điều khoản dịch vụ',
    'terms.intro':
      'Chào mừng đến với js-tools! Các điều khoản và điều kiện này phác thảo các quy tắc và quy định cho việc sử dụng trang web js-tools tại js-tools.org, bao gồm các công cụ chạy trên trình duyệt và blog giáo dục.',
    'terms.license.title': '1. Sở hữu trí tuệ & Giấy phép sử dụng',
    'terms.license.desc':
      'Trừ khi có quy định khác, js-tools và/hoặc người cấp phép của nó sở hữu quyền sở hữu trí tuệ đối với tất cả tài liệu trên js-tools. Tất cả quyền sở hữu trí tuệ được bảo lưu. Bạn có thể truy cập tài liệu này từ js-tools cho mục đích sử dụng cá nhân hoặc kinh doanh của riêng bạn, tuân theo các hạn chế được đặt ra trong các điều khoản và điều kiện này.',
    'terms.local.title': '2. Công cụ phía client & Dịch vụ sự kiện cloud',
    'terms.local.desc':
      'Các công cụ tiện ích của chúng tôi — Image Optimizer, RemoveBG và QR Code Generator — chạy hoàn toàn phía client trong trình duyệt của bạn. Với các công cụ này, chúng tôi không cung cấp dịch vụ lưu trữ, hosting hay sao lưu tệp, và các tệp đã xử lý không được giữ lại ở bất kỳ đâu; bạn hoàn toàn chịu trách nhiệm lưu và giữ bản sao của mọi kết quả bạn tạo ra. Các dịch vụ sự kiện SnapCast và ColorQuarium là dịch vụ cloud: cần tài khoản, có gói trả phí, và lưu trữ ảnh cùng thiết lập bạn chủ động chia sẻ, theo điều khoản riêng của các dịch vụ đó.',
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
      'Có. Với các công cụ tiện ích (Tối ưu ảnh, Xóa nền, Tạo mã QR), toàn bộ quá trình xử lý diễn ra cục bộ trong trình duyệt — tệp của bạn không rời khỏi thiết bị và chúng tôi không thể xem hay lưu trữ chúng. Riêng dịch vụ sự kiện như SnapCast và ColorQuarium có lưu trữ ảnh và thiết lập bạn chủ động chia sẻ, theo điều khoản riêng của các dịch vụ đó.',
    'faq.q3.title': 'Công cụ Tối ưu ảnh hỗ trợ những định dạng ảnh nào?',
    'faq.q3.desc':
      'Công cụ Tối ưu ảnh hỗ trợ các định dạng web tiêu chuẩn bao gồm JPEG, PNG, WebP, SVG và cả các tệp HEIC/HEIF trực tiếp từ iPhone, giúp bạn dễ dàng chuyển đổi và nén ảnh iPhone để sử dụng trên web.',
    'faq.q4.title': 'Trình chiếu trực tiếp SnapCast hoạt động như thế nào?',
    'faq.q4.desc':
      'SnapCast sử dụng kết nối cơ sở dữ liệu thời gian thực để đồng bộ hóa ảnh tải lên ngay lập tức. Khách mời chỉ cần quét mã QR được tạo tự động bằng điện thoại thông minh, chụp ảnh và ảnh sẽ được chiếu lên màn hình trình chiếu trực tiếp đang chạy trong vài giây mà không cần cài đặt ứng dụng.',
    'faq.q5.title': 'Có giới hạn nào về kích thước tệp hoặc số lượng xử lý hàng loạt không?',
    'faq.q5.desc':
      'Các công cụ tiện ích miễn phí không đặt giới hạn nhân tạo nào. Bạn có thể xử lý bao nhiêu tệp tùy ý tùy thuộc vào dung lượng bộ nhớ thiết bị của bạn. Các lô hàng lớn sẽ được xử lý tuần tự để tránh tab trình duyệt bị đóng băng.',

    'cq.name': 'ColorQuarium',
    'cq.badge': '☁️ Dịch vụ cloud · Cần tài khoản · Có gói trả phí',
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
    'cq.demo.title': 'Trải nghiệm ngay — demo không cần đăng ký',
    'cq.demo.load': 'Tải màn hình trực tiếp',
    'cq.demo.load.note': 'Phát một màn hình thật đang chạy ngay lúc này',
    'cq.demo.desc':
      'Đây là một màn hình ColorQuarium thật, đang chạy trực tiếp. Quét mã QR bằng điện thoại để mở remote điều khiển và thay đổi nội dung hiển thị theo thời gian thực.',
    'cq.demo.qr.note': 'Mở màn hình remote điều khiển dành cho điện thoại',
    'nav.donate': 'Ủng hộ',
    'donate.title': 'Ủng hộ — js-tools',
    'donate.h1': 'Ủng hộ dự án js-tools',
    'donate.intro':
      'js-tools là một dự án độc lập: các công cụ tiện ích hoàn toàn miễn phí, chạy ngay trong trình duyệt và không thu thập dữ liệu; còn các gói trả phí (tuỳ chọn) của SnapCast và ColorQuarium giúp duy trì phát triển. Nếu bạn thấy các công cụ miễn phí hữu ích, hãy cân nhắc ủng hộ dự án để giúp chúng tôi trang trải chi phí máy chủ và phát triển. Xin chân thành cảm ơn!',
    'donate.paypal.title': 'PayPal',
    'donate.paypal.desc': 'Ủng hộ qua PayPal đối với các nhà hảo tâm quốc tế.',
    'donate.paypal.btn': 'Ủng hộ qua PayPal',
    'donate.momo.title': 'Ví Điện Tử MoMo',
    'donate.momo.desc': 'Quét mã QR bằng ứng dụng MoMo để gửi tiền ủng hộ nhanh chóng.',
    'donate.mb.title': 'Chuyển Khoản MB Bank',
    'donate.mb.desc': 'Chuyển khoản vào tài khoản MB Bank bằng cách quét mã QR.',
    'donate.qr.scan': 'Quét mã để ủng hộ',
    'nav.about': 'Giới thiệu',
    'nav.contact': 'Liên hệ',
    'about.title': 'Giới thiệu js-tools — Công cụ trình duyệt miễn phí & Blog lập trình',
    'about.h1': 'Giới thiệu js-tools',
    'about.intro':
      'js-tools.org là một dự án độc lập với mục tiêu đơn giản: mang đến phần mềm thực sự hữu ích — miễn phí, nhanh và riêng tư. Các công cụ tiện ích chạy hoàn toàn trong trình duyệt của bạn — không cài đặt, không đăng ký, và tệp của bạn không bao giờ rời khỏi máy — còn các dịch vụ cloud mang trải nghiệm thời gian thực đến sự kiện trực tiếp. Bên cạnh các công cụ, chúng tôi xuất bản một blog lập trình chuyên sâu, song ngữ (Anh & Việt), để các kỹ thuật đằng sau những công cụ này được chia sẻ công khai cho mọi người cùng học.',
    'about.mission.title': 'Sứ Mệnh',
    'about.mission.desc':
      'Hầu hết công cụ trực tuyến đều bắt bạn tải tệp lên máy chủ của một bên lạ, chờ đợi, rồi hy vọng dữ liệu được xoá sau đó. Chúng tôi tin điều đó là không cần thiết. Trình duyệt hiện đại đã tích hợp những công nghệ mạnh mẽ — WebAssembly, WebGL, Canvas API, Web Audio và nhiều hơn nữa — đủ sức xử lý thật ngay trên máy bạn. Mọi công cụ js-tools đều dựa trên nguyên tắc này: dữ liệu của bạn ở lại với bạn, kết quả tức thì, và công cụ thì miễn phí.',
    'about.what.title': 'Chúng Tôi Xây Dựng Gì',
    'about.what.desc':
      'Các công cụ tiện ích miễn phí — Image Optimizer (nén và chuyển đổi JPEG, PNG, WebP và HEIC), RemoveBG (xoá nền bằng AI) và QR Code Generator — chạy 100% phía trình duyệt, nên hoạt động được ngoại tuyến, tôn trọng quyền riêng tư và không bao giờ nhìn thấy tệp của bạn. Bên cạnh đó, chúng tôi vận hành hai dịch vụ cloud cho sự kiện trực tiếp: SnapCast (trình chiếu ảnh thời gian thực, khách mời gửi ảnh lên màn hình lớn) và ColorQuarium (màn hình nghệ thuật sinh động điều khiển từ điện thoại). Các dịch vụ sự kiện cần tài khoản, có gói trả phí, và lưu trữ ảnh cùng thiết lập bạn chủ động chia sẻ.',
    'about.blog.title': 'Blog Học Lập Trình',
    'about.blog.desc':
      'Chúng tôi viết những bài hướng dẫn dài, biên tập kỹ lưỡng, giải thích cách loại phần mềm này thực sự vận hành — từ nền tảng C, C++ và JavaScript cho tới HTML5 Canvas, đồ hoạ WebGL và lập trình shell. Mỗi series đều thực hành trực tiếp, có code chạy được, visualizer tương tác và câu hỏi ôn tập; mọi bài viết đều song ngữ Anh–Việt để kiến thức kỹ thuật chuyên sâu đến được với nhiều người hơn.',
    'about.who.title': 'Người Đứng Sau Dự Án',
    'about.who.desc':
      'js-tools được tạo và duy trì bởi Quang Tang, một kỹ sư phần mềm độc lập chuyên xây dựng công cụ web mở và viết về lập trình. Dự án tự tài trợ; quảng cáo và ủng hộ (tuỳ tâm) giúp trang trải chi phí lưu trữ và phát triển để các công cụ luôn miễn phí cho mọi người. Bạn có thể theo dõi công việc hoặc liên hệ qua các liên kết trên trang Liên hệ.',
    'about.contact.title': 'Kết Nối Với Chúng Tôi',
    'about.contact.desc':
      'Có câu hỏi, báo lỗi, ý tưởng tính năng, hay chỉ muốn chào một câu? Chúng tôi thật sự đọc mọi tin nhắn. Hãy ghé trang Liên hệ hoặc gửi email tới support@js-tools.org — phản hồi từ người dùng chính là điều định hình những gì chúng tôi làm tiếp theo.',
    'contact.title': 'Liên hệ js-tools — Hỗ trợ, Góp ý & Báo lỗi',
    'contact.h1': 'Liên Hệ',
    'contact.intro':
      'Chúng tôi rất mong nhận được tin từ bạn. Dù bạn phát hiện lỗi, có ý tưởng cho công cụ mới, muốn đề xuất chủ đề blog, hay thắc mắc về cách một thứ gì đó hoạt động, cách tốt nhất để liên hệ nằm bên dưới. Tin nhắn được đọc và trả lời bởi chính người xây dựng js-tools.',
    'contact.email.title': 'Email',
    'contact.email.desc':
      'Để được hỗ trợ, hợp tác hoặc hỏi đáp chung, hãy gửi email tới support@js-tools.org. Chúng tôi cố gắng phản hồi trong vài ngày làm việc. Khi báo lỗi, hãy cho biết trình duyệt và thao tác bạn đang làm để chúng tôi sửa nhanh hơn.',
    'contact.phone.title': 'Điện thoại',
    'contact.phone.desc':
      'Muốn trao đổi trực tiếp? Bạn có thể gọi điện hoặc nhắn qua Zalo theo số 0938 829 401, trong giờ làm việc (GMT+7). Với các vấn đề kỹ thuật, email thường nhanh hơn vì bạn có thể đính kèm ảnh chụp màn hình và chi tiết.',
    'contact.github.title': 'GitHub',
    'contact.github.desc':
      'js-tools được phát triển công khai. Hãy xem mã nguồn, báo lỗi hoặc mở thảo luận trên GitHub — đây cũng là nơi lưu phần bình luận của blog, thông qua giscus và GitHub Discussions.',
    'contact.linkedin.title': 'LinkedIn',
    'contact.linkedin.desc': 'Muốn kết nối công việc hoặc trao đổi về một dự án hợp tác? Hãy liên hệ qua LinkedIn.',
    'contact.feedback.title': 'Phản Hồi Định Hình Lộ Trình',
    'contact.feedback.desc':
      'Đây là một dự án độc lập, nên phản hồi thật sự quan trọng hơn bất cứ điều gì. Hãy cho chúng tôi biết bạn dùng công cụ nào nhiều nhất, thiếu gì, hay muốn có bài hướng dẫn về chủ đề lập trình nào — điều đó ảnh hưởng trực tiếp tới những gì được xây dựng và viết tiếp theo.',
    'learn.title': 'Học Cách Những Công Cụ Này Vận Hành',
    'learn.desc':
      'Các công cụ của chúng tôi được xây trên công nghệ web mở — và chúng tôi giải thích chính xác cách làm ngay trên blog. Mỗi series là một khóa học chuyên sâu, thực hành trực tiếp, có code chạy được, visualizer tương tác và câu hỏi ôn tập, viết song ngữ Anh–Việt. Hãy chọn một lộ trình và bắt đầu.',
    'learn.cta': 'Xem tất cả bài viết →',
    'learn.c.title': 'Lập trình C',
    'learn.c.desc': 'Con trỏ, quản lý bộ nhớ, cấu trúc dữ liệu và Big-O — nền tảng mọi lập trình viên cần nắm.',
    'learn.cpp.title': 'C++ Hiện Đại',
    'learn.cpp.desc': 'RAII, move semantics, template, STL và smart pointer, giải thích từ gốc rễ.',
    'learn.js.title': 'JavaScript Chuyên Sâu',
    'learn.js.desc': 'Engine, event loop, closure, prototype và bất đồng bộ — cách JavaScript thực sự chạy.',
    'learn.canvas.title': 'HTML5 Canvas',
    'learn.canvas.desc': 'Đồ họa 2D, hoạt ảnh, vật lý và hạt — dựng hình ảnh tương tác từ con số 0.',
    'learn.webgl.title': 'WebGL & Đồ Họa 3D',
    'learn.webgl.desc': 'Shader, pipeline GPU, ánh sáng và toán 3D — lập trình đồ họa thật trong trình duyệt.',
    'learn.bash.title': 'Bash & Shell',
    'learn.bash.desc': 'Scripting, xử lý văn bản, tự động hóa và kỹ thuật shell phòng thủ cho công việc thực tế.',
    'learn.css.title': 'CSS & Animation',
    'learn.css.desc': 'Bố cục hiện đại, flexbox, grid, animation, transition và làm chủ thiết kế responsive.',
    'learn.webgpu.title': 'WebGPU & Đồ Họa 3D',
    'learn.webgpu.desc': 'Compute shader GPU hiện đại, WGSL, dựng hình 3D thời gian thực và đồ họa tương tác.',
    'learn.algo.title': 'Cấu Trúc Dữ Liệu & Giải Thuật',
    'learn.algo.desc': 'Cây AVL/Red-Black, tìm đường, quy hoạch động và băm — trực quan hoá từng bước.',
    'learn.git.title': 'Git Nội Bộ',
    'learn.git.desc':
      'Mô hình đối tượng, branch là con trỏ, merge/rebase, phục hồi bằng reflog và hợp tác qua remote — trực quan hoá đồ thị commit.',
    'learn.audio.title': 'Web Audio API',
    'learn.audio.desc':
      'AudioContext, oscillator, filter, phân tích FFT và âm thanh không gian — thực hành trên đồ thị node âm thanh thật.',
    'learn.sql.title': 'SQL trong Trình duyệt',
    'learn.sql.desc':
      'SQLite thật biên dịch sang WebAssembly: mô hình quan hệ, JOIN, CTE đệ quy, window function, query optimizer và nội tại engine — không cần server.',
    'learn.electronics.title': 'Điện Tử & Mô Phỏng Vi Mạch',
    'learn.electronics.desc':
      'Học điện tử, mạch lọc analog, ăng-ten, cổng logic, ô nhớ tuần tự và lập trình thanh ghi vi điều khiển — hoàn toàn trên trình duyệt.',
    'learn.vlsi.title': 'Thiết Kế Vi Mạch Số & FPGA',
    'learn.vlsi.desc':
      'Làm chủ RTL với SystemVerilog: 4 mức trừu tượng, synthesis, mô phỏng, place & route, STA — kèm visualizer RTL Playground tương tác.',
    'learn.ai.title': 'Trí Tuệ Nhân Tạo: Từ Neuron Đến LLM',
    'learn.ai.desc':
      'Tự xây AI từ số 0 bằng vanilla JS — không gọi API: gradient descent, tự viết autograd, MLP/CNN, Transformer, và GPT-mini train ngay trong trình duyệt.',
    'learn.embedded.title': 'Hệ Thống Nhúng: Từ Thanh Ghi Đến RTOS',
    'learn.embedded.desc':
      'C bare-metal trên một MCU ảo tự xây: thanh ghi, GPIO, ngắt, UART, ADC, DMA, đến RTOS preemptive — không cần board thật.',
    'learn.dsp.title': 'Xử Lý Tín Hiệu Số: Từ Mẫu Đến Phổ',
    'learn.dsp.desc':
      'Mọi thuật toán DSP tự viết bằng JavaScript thuần — không dùng AnalyserNode hộp đen: lấy mẫu, FFT, cửa sổ, filter FIR/IIR, thiết kế pole-zero nghe được ngay trong trình duyệt.',
    'learn.cpu.title': 'Kiến Trúc Máy Tính: Từ Logic Đến Lượng Tử',
    'learn.cpu.desc':
      'Khám phá thế giới phần cứng chạy trực tiếp trong trình duyệt: cổng logic, ALU, đường ống dẫn RISC-V Pipeline, thực thi suy đoán, kiến trúc Cache, Apple Silicon UMA và qubit lượng tử.',
    'learn.aie.title': 'Kỹ Sư AI Thực Chiến',
    'learn.aie.desc':
      'Chuyển dịch từ lập trình Web lên AI Specialist. Làm chủ Python, PyTorch, MLP/CNN, cơ chế Self-Attention & Transformer, API LLM, hệ thống RAG nâng cao và AI Agent chạy offline.',
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
