# js-tools.org — Agent Guide

Landing page for [js-tools.org](https://js-tools.org) — experience, speed, convenience. Everything happens in your browser. No installation — just run. Unlock the power of JavaScript and your browser.

## ⚠️ Check for open work first

**If [`task.md`](task.md) has content, there is a job in progress — read it before
doing anything else.** It lists exactly what is left, with a per-lesson checklist,
and it names the skill that explains how to do it. Do not re-audit finished work
and do not reconstruct state from conversation history; both are already encoded.

If `task.md` is just a stub saying there is nothing open, ignore it and carry on.

---

## Project Overview

**js-tools.org** is a static landing page showcasing browser-based tools:

1. **SnapCast** — Real-time photo slideshow for live events
2. **ColorQuarium** — Ambient animated aquarium display controlled from your phone
3. **Image Optimizer** — Compress & convert images (JPEG, PNG, WebP, HEIC) entirely in-browser
4. **QR Generator** — Create and customize QR codes in the browser
5. **Remove BG** — Background removal tool

**Tech Stack**: Pure HTML + CSS + vanilla JavaScript (no framework, no build step)
**Deployment**: Cloudflare Pages (auto-deploys on `main` push)

---

## Directory Structure

```
js-tools-org/
├── index.html           # Main landing page + hero canvas + tool cards + live demos
├── styles.css           # Global styles (dark theme, animations, responsive, hamburger menu)
├── main.js              # Year injection + canvas particle animation + lazy-load iframes
├── i18n.js              # EN/VI translation system + language toggle
├── privacy.html         # Privacy policy (bilingual EN/VI)
├── terms.html           # Terms of service (bilingual EN/VI)
├── robots.txt           # SEO robots configuration
├── sitemap.xml          # SEO sitemap
├── serve.json           # Local dev server config
├── ads.txt              # AdSense ads.txt
├── package.json         # Node config for Prettier formatting
├── .prettierrc          # Prettier formatting rules
├── .gitignore           # Git ignore patterns
├── .vscode/             # VS Code settings (Format on save enabled)
├── assets/              # Visual assets
│   ├── favicon.svg
│   ├── logo.svg
│   ├── og-image.svg / og-image.png
│   ├── optimizer.svg    # Image Optimizer logo
│   ├── snapcast.svg     # SnapCast logo
│   ├── coloraquarium.png # ColorQuarium fish logo (700x700)
│   ├── colorquarium-qr.png # QR code for ColorQuarium mobile remote
│   ├── qr.svg           # QR Generator logo
│   ├── rmbg.svg         # Remove BG logo
│   └── event-qr.png     # SnapCast event QR code
├── blog/                # Blog section: tool articles + programming series
│   ├── index.html       # Blog list index (bilingual EN/VI)
│   ├── blog.css         # Blog typography, article styles, card tags, comment section
│   ├── blog.js          # Language toggle + giscus comments loader for blog pages
│   ├── ide.css          # VS Code Light Theme code window + quiz styles
│   ├── ide.js           # Code copy + quiz verification logic
│   ├── prism.css        # Local Prism syntax highlight (Tomorrow Night theme)
│   ├── prism.js         # Local Prism library with C/C++ support
│   ├── search-index.json # Client-side search index
│   │
│   ├── # ── Tool articles (bilingual EN/VI) ──
│   ├── colorquarium-explained.html
│   ├── custom-qr-codes-in-browser.html
│   ├── how-to-compress-images.html
│   ├── how-to-remove-background-in-browser.html
│   ├── snapcast-wedding-slideshow.html
│   ├── snapcast-corporate-events.html
│   ├── snapcast-technology-explained.html
│   ├── webp-vs-jpeg-vs-png.html
│   │
│   ├── # ── C Programming Series (Vietnamese, HTML & code samples co-located) ──
│   ├── c/
│   │   ├── c-programming-series.html    # Curriculum hub
│   │   ├── c-environment-setup.html
│   │   ├── c-basics-and-bitwise.html
│   │   ├── c-control-flow.html
│   │   ├── c-struct-typedef.html
│   │   ├── c-memory-management.html
│   │   ├── c-pointers-deep-dive.html
│   │   ├── c-data-structures.html
│   │   ├── c-ds-visualizer-demo.html
│   │   └── ... C code samples (.c, visualizer html) ...
│   │
│   ├── # ── C++ Programming Series (Vietnamese, HTML & code samples co-located) ──
│   ├── cpp/
│   │   ├── cpp-programming-series.html  # Curriculum hub
│   │   ├── cpp-environment-setup.html
│   │   ├── cpp-basics-and-vector.html
│   │   ├── cpp-oop-basics.html
│   │   ├── cpp-oop-polymorphism.html
│   │   ├── cpp-smart-pointers.html
│   │   ├── cpp-templates.html
│   │   ├── cpp-modern-features.html
│   │   ├── cpp-bst-visualizer.html
│   │   └── ... C++ code samples (.cpp, visualizer html) ...
│   │
│   ├── # ── JavaScript Series (Vietnamese, HTML & code samples co-located) ──
│   ├── js/
│   │   ├── js-programming-series.html   # Curriculum hub
│   │   ├── js-fundamentals-types.html
│   │   ├── js-modern-syntax.html
│   │   ├── js-engine-and-execution.html
│   │   ├── js-objects-and-prototypes.html
│   │   ├── js-functional-programming.html
│   │   ├── js-error-handling.html
│   │   ├── js-regular-expressions.html
│   │   ├── js-event-loop-async.html
│   │   ├── js-metaprogramming.html
│   │   ├── js-modules-and-scope.html
│   │   ├── js-dom-event-model.html
│   │   ├── js-event-loop-visualizer.html
│   │   └── ... JS code samples (.js, visualizer html) ...
│   │
│   ├── # ── JavaScript Canvas Series (Vietnamese, HTML & code samples co-located) ──
│   ├── canvas/
│   │   ├── canvas-programming-series.html   # Curriculum hub
│   │   ├── canvas-basics-and-drawing.html
│   │   ├── canvas-text-and-images.html
│   │   ├── canvas-transforms-and-state.html
│   │   ├── canvas-pixel-manipulation.html
│   │   ├── canvas-math-foundations.html
│   │   ├── canvas-animation-loop.html
│   │   ├── canvas-easing-and-tweening.html
│   │   ├── canvas-responsive-and-dpi.html
│   │   ├── canvas-interaction-events.html
│   │   ├── canvas-physics-simulation.html
│   │   ├── canvas-collision-and-particles.html
│   │   ├── canvas-game-development.html
│   │   ├── canvas-data-visualization.html
│   │   ├── canvas-creative-and-performance.html
│   │   └── ... Canvas code samples (.js, game html) ...
│   │
│   ├── # ── WebGL & 3D Graphics Series (Vietnamese, HTML & demo samples co-located) ──
│   ├── webgl/
│   │   ├── webgl-programming-series.html   # Curriculum hub
│   │   ├── webgl-basics-and-pipeline.html
│   │   ├── webgl-coordinate-and-math.html
│   │   ├── webgl-shaders-glsl.html
│   │   └── ... WebGL code samples (.js) ...
│   │
│   └── # ── Bash Programming Series (Vietnamese, HTML & scripts co-located) ──
│       ├── bash/
│       │   ├── bash-programming-series.html   # Curriculum hub
│       │   ├── bash-terminal-basics.html
│       │   ├── bash-variables-and-strings.html
│       │   ├── bash-control-flow.html
│       │   ├── bash-functions-and-scripts.html
│       │   ├── bash-text-processing.html
│       │   ├── bash-process-and-signals.html
│       │   ├── bash-real-world-scripts.html
│       │   ├── bash-devops-automation.html
│       │   └── ... Bash script samples (.sh) ...
│       │
│   └── # ── CSS & Animation Series (Vietnamese, HTML & code samples co-located) ──
│       ├── css/
│       │   ├── css-programming-series.html   # Curriculum hub
│       │   ├── css-playground.html           # Interactive CSS Playground
│       │   ├── css-box-model-and-flow.html   # Lesson 1
│       │   └── ... CSS code samples (.css) ...
│       │
│   └── # ── Computer Architecture Series (Vietnamese, HTML & files co-located) ──
│       └── cpu/
│           ├── cpu-programming-series.html   # Curriculum hub
│           ├── cpu-pipeline-sim.html         # Core RISC-V Pipeline & Cache L1 Simulator
│           └── ... CPU lesson files ...
│
│   └── # ── Practical AI Engineer Series (Vietnamese, HTML & files co-located) ──
│       └── aie/
│           ├── aie-programming-series.html   # Curriculum hub
│           ├── data_cleaner.py               # Practice code file
│           └── ... AIE lesson files ...
│
│   ├── # ── Vector Database Series (Vietnamese, HTML & files co-located) ──
│   │   └── vectordb/
│   │       ├── vectordb-programming-series.html # Curriculum hub
│   │       ├── vdb-sandbox.html              # Interactive 2D Vector Search Sandbox
│   │       ├── vdb-engine.js                 # Shared algorithms engine (K-Means, HNSW, PQ)
│   │       └── ... Vector DB lesson files & scripts ...
│   │
│   └── # ── System Design Series (Vietnamese; 2 tracks: in-browser sim + real Docker lab) ──
│       └── sysdesign/
│           ├── sysdesign-programming-series.html # Curriculum hub
│           ├── sysdesign-sandbox.html        # Traffic Lab (core interactive demo)
│           ├── sysdesign-sim-engine.js       # Discrete-event simulation core (validated vs M/M/1)
│           ├── sysdesign-topology.js         # Canvas renderers (topology, histogram, rho<->latency)
│           ├── sysdesign-hashring.js         # Consistent hashing + virtual nodes (Lesson 8)
│           ├── sysdesign-quorum.js           # Quorum R/W/N sim + LWW data loss (Lesson 9)
│           ├── sysdesign-engine-selftest.mjs # `node` self-test, 42 assertions — run before trusting numbers
│           ├── sysdesign-lab/                # Real Docker lab shared by all 18 lessons
│           │   ├── docker-compose.yml        #   profiles: base | lb | gw | cache | db | tools
│           │   ├── app/app.js               #   plain Node http server, 0 deps, mini RESP client
│           │   ├── loadgen/loadgen.js       #   hand-written load generator (see README caveats)
│           │   ├── nginx/lb.conf            #   L7 load balancer config
│           │   ├── nginx/gw.conf            #   API gateway: HTTP 8081 + HTTPS 8443 (Lesson 4)
│           │   ├── nginx/gw-routes.conf     #   routes shared by both ports, so the TLS delta is pure
│           │   ├── nginx/edge.conf          #   edge/CDN tier with proxy_cache, X-Cache header (Lesson 6)
│           │   ├── nginx/edge-common.conf   #   cache settings shared by raw-key and normalized-key locations
│           │   ├── static/hello.json        #   file served by the gateway itself (Lesson 4)
│           │   ├── tools/cache-stats.sh     #   sums cache counters across all 3 replicas (Lesson 5)
│           │   ├── tools/pg-lag.sh          #   real replication lag from pg_stat_replication (Lesson 7)
│           │   ├── tools/lock-test.sh       #   two workers race one Redis lock, counts conflicts (Lesson 10)
│           │   ├── worker/lock-worker.js    #   Redis lock + fencing token, 0 deps (Lesson 10)
│           │   ├── worker/queue.js          #   Redis Streams producer/consumer/depth, 0 deps (Lesson 12)
│           │   ├── tools/queue-test.sh      #   queue scaling, poison + DLQ, ack-mode damage (Lesson 12)
│           │   ├── app/minipg.js            #   PostgreSQL wire-protocol client, 0 deps (Lesson 7)
│           │   ├── postgres/init/           #   replication role + pg_hba + schema, runs once on initdb
│           │   │                            #   profile `shard` adds a 2nd independent Postgres (Lesson 8)
│           │   └── README.md                #   MANDATORY CPU-architecture preflight
│           └── ... System Design lesson files ...
└── README.md
```

---

## Key Features

### 1. Hero Section with Canvas Particle Animation

- **Location**: `index.html` + `main.js`
- **5 Time-Based Modes**: Dawn, Day, Dusk, Rain, Night — each with unique particles, colors, and weather effects
- **Mode Switcher**: 5 emoji buttons (fixed bottom-right)
- **Mouse Interaction**: Soft boundary repulsion (30px), gentle attraction, smooth physics

### 2. Dynamic Theming

- CSS variables (`--bg`, `--accent`, `--border`, etc.) updated in real-time per mode
- Hero gradient background matches mode

### 3. i18n (EN / VI)

- **System**: `i18n.js` with `data-i18n` attributes + `data-i18n-html` for rich content
- **Blog**: `data-lang-content="en"|"vi"` dual-section toggling via `blog.js`
- **Language Detection**: Auto from `navigator.language`, persisted in `localStorage`
- **Toggle**: Nav button switches between English and Vietnamese

### 4. Tool Cards + Live Demos

- **Tools on homepage**: SnapCast, ColorQuarium, Image Optimizer, QR Generator, Remove BG
- **Live demos**: SnapCast and ColorQuarium have embedded iframe demos with QR codes
- **Demo component**: `.sc-demo` layout (iframe left + QR right, collapses to stack on mobile)
- **Lazy Loading**: Iframes load via `IntersectionObserver` with `data-src`

### 5. Navigation

- **Header**: Hamburger menu (CSS-only, checkbox hack) at ≤880px breakpoint
  - Uses `<input type="checkbox" id="nav-toggle">` + `<label>` with sibling selector `~ nav`
  - Shows SnapCast, ColorQuarium, Blog links + language toggle
- **Footer**: Full nav with all tools + Blog + Privacy + Terms (icon + text links)
- **Consistent across all pages**: index, privacy, terms, and all blog HTML files

### 6. Blog Section

- **Tool articles**: 8 bilingual EN/VI articles about SnapCast, Image Optimizer, QR Generator, ColorQuarium, Remove BG
- **Programming series**: C (11 lessons), C++ (15 lessons), JavaScript (12 lessons), HTML5 Canvas (17 lessons), WebGL & 3D (18 lessons), Bash (11 lessons), CSS & Animation (2 lessons), Practical AI Engineer (20 lessons, 1 completed) — all in Vietnamese
  - **Academic Rigor**: The lessons feature high-quality computer science concepts. For example:
    - _C Series (Lesson 7)_: Formal Big O Time & Space complexity analysis, C examples for $O(1)$ to $O(N!)$, and recursion Call Stack depth analysis.
    - _C++ Series_: Name mangling, SSO (Small String Optimization), Vector dynamic array structures, RAII, Vptr/Vtable dynamic dispatch, and smart pointer atomic control blocks.
    - _JavaScript Series_: Parser/AST, Ignition bytecode, TurboFan JIT machine code, deoptimization triggers, Shapes/IC optimizations, ESM Live Bindings vs CJS Copy-on-Import, and custom Proxy-based Reactivity mapped to mock DOM.
    - _WebGL Series_: GPU hardware massively parallel ALU architecture, Graphics pipeline rasterization stage, affine matrices, perspective projection math formulas, GLSL shader compiler pipelines, and live Barycentric color interpolation visualizers.
- **Interactive JS Playgrounds**: Custom `js-playground` boxes (textarea source input + standard console capture log output) allowing code execution directly inside the browser.
- **Dynamic Code Viewer**: Interactive canvas demos and visualizer iframes include a toggleable `⟨⟩ Xem Code` button that displays their formatted, dedented, syntax-highlighted source code inline (and lazy-fetches external visualizer source files).
- **Client-Side Search & Static Index**: Real-time search engine on `blog/index.html` utilizing a pre-built static `search-index.json`. It performs deep searches across all 93 articles, mapping matched lesson titles and subheadings to direct URLs with diacritics-insensitive matching in both English and Vietnamese.
- **Giscus Comments**: GitHub Discussions-backed `giscus` widget (loaded centrally by `blog.js` via a `<div class="giscus">` placeholder) at the bottom of all detail pages, mapped to each page by `pathname` for consistent per-article threads.
- **Article template structure**: `.article-hero` (tag, title, meta) → `.article-body` (EN/VI sections) → `.article-cta` → `.article-related` → `.article-comments` (giscus). Some legacy pages also include an `.article-discuss` link-out CTA.
- **Tag color classes**: `--sc` (purple), `--io` (green), `--qr` (cyan), `--cq` (teal), `--c` (C), `--cpp` (C++), `--js` (JS), `--canvas` (Canvas), `--webgl` (violet), `--css` (pink)
- **VS Code Light Theme**: White background, dark code blocks, Prism syntax highlighting
- **Interactive quizzes**: `ide.js` + `ide.css` for programming lessons

### 7. SEO & Social

- Meta tags, Open Graph, Twitter Card, JSON-LD structured data
- `sitemap.xml` with all pages registered
- Mobile-first responsive design

### 8. Ad Integration

- Google AdSense with responsive ad units
- Lazy-loaded on first user interaction or 3.5s timeout

---

## Development Setup

```bash
# Using Node (preferred)
npx serve -l 5500 .

# Using Python
python3 -m http.server 8080
```

No build step required. Edit HTML/CSS/JS directly and refresh.

---

## Common Tasks

### Add a Blog Article

1. Create new HTML file in `blog/` using existing article as template
2. Include header (with hamburger nav) + footer (full nav) matching other blog pages
3. Add bilingual content in `data-lang-content="en"|"vi"` sections
4. Add card to `blog/index.html` grid with appropriate tag class
5. Add URL to `sitemap.xml`
6. Do NOT use markdown bold syntax (`**`) in HTML files; always use `<strong>` tags instead.
7. Always provide an academic references/citation callout block (`.callout--deep`) linking to official MDN, W3C, Can I Use, or Khan Academy pages when introducing new programming concepts.
8. Write mathematical formulas (e.g. coordinates, projection math, matrices) in KaTeX syntax using delimiters like `$$...$$` or `$...$` or `\[...\]`, and ensure KaTeX CSS/JS libraries are loaded in the page header.

### Add a Translation String

1. Add key to `TRANSLATIONS.en` and `TRANSLATIONS.vi` in `i18n.js`
2. Add `data-i18n="my.key"` to HTML element

### Adjust Particle Physics

- `ATTRACT_FORCE` (0.003), `REPEL_RADIUS` (30), `REPEL_FORCE` (0.15) in `main.js`

---

## Deployment

- Every push to `main` auto-deploys to Cloudflare Pages
- Live at [https://js-tools.org](https://js-tools.org)

---

## Related Projects

- **SnapCast**: [snapcast.js-tools.org](https://snapcast.js-tools.org) — separate Firebase project
- **ColorQuarium**: [colorquarium.js-tools.org](https://colorquarium.js-tools.org) — separate Firebase project
- **Image Optimizer**: [image-optimizer.js-tools.org](https://image-optimizer.js-tools.org)
- **QR Generator**: [qr.js-tools.org](https://qr.js-tools.org)
- **GitHub**: [ttquang1063750/js-tools-org](https://github.com/ttquang1063750/js-tools-org)

---

## Notes for Agents

### Working on the `blog/` lesson series

If your task touches anything under `blog/<series>/` (writing, reviewing, or fixing a lesson
page), read these two files **first**, in this order:

1. **[`check-lesson.md`](check-lesson.md)** — the QA gate. Read PHẦN A before starting a
   lesson; run every check in PHẦN C before saying a lesson is done. This exists because the
   same basic mistakes (copy-pasted canonical URLs, quiz buttons calling a function signature
   that doesn't exist, mismatched HTML tags) kept recurring across dozens of lesson files —
   PHẦN C gives copy-pasteable commands that catch all of them mechanically.
2. **[`plan.md`](plan.md)** — the content design doc (tech stack, syllabus, per-series rules)
   for series still in progress. Series that are 100% published (WebGPU, DSA, CSS, SQL, Web
   Audio, Git) have had their design sections removed from this file — the actual pages under
   `blog/<series>/` are the source of truth for those, not `plan.md`.

### Working on the `blog/build/` "code thực chiến" series

This is a different format from the lesson series above: one continuous long-form page per
part (`blog/build/<dự-án>/part-N.html`), no lessons, no quiz, no EN/VI split — Vietnamese only.
Planning a brand-new one? Use the `design-build-series` skill rather than `design-new-series`
(that one is for the chunked lesson format).

Whenever a part in one of these series gets marked "ĐÃ VIẾT XONG" in `task.md` (i.e. the
writing pass just finished), **proactively suggest running the `review-build-series` skill**
before considering that part done or moving to the next one. It reads the whole series with a
first-time-reader mindset and writes every gap it finds (code referenced but never defined,
vague/unexplained prose, disconnected fragments) into `task.md` — it does not fix or run
anything itself, so suggesting it costs the user nothing to decline. This is a separate,
much lighter pass from actually building the series' project and running it for real; do not
conflate the two when reporting what has and has not been verified.

### Before Modifying Code

1. **Check CSS patterns**: Use flexbox + gap (no old margin/padding stacking)
2. **Responsive first**: Test at mobile (<600px), tablet (<880px for hamburger), desktop
3. **i18n coverage**: Any new text needs EN + VI translations
4. **Consistent nav**: Header and footer must match across ALL pages (index, privacy, terms, all blog files)
5. **Canvas performance**: Particle counts scale with viewport size

### When Adding Features

- Keep vanilla JavaScript (no libraries unless justified)
- Use CSS variables for theming
- Lazy-load iframes with IntersectionObserver
- Follow naming: kebab-case CSS classes, camelCase JS
- Do NOT use markdown bold syntax (`**`) in HTML text (use `<strong>`).
- Include official educational citation links (MDN, W3C, Khan Academy) for new technologies.
- Render mathematical equations and matrices using KaTeX with appropriate page header libraries.
- **File download block**: Always place file downloads in a separate `.article-cta` container (VS Code Light look). Do not combine it inside references box.
- **References block**: Always place external references in a separate `<section class="article-refs">` box (standard layout).
- **Related links**: Always use `.article-related`, `.article-related__links`, and `.article-related__link` classes (with `--next` and `--locked` modifiers as appropriate). Do NOT write manual arrows (`←`, `→`) in the link text, as they are dynamically prepended/appended via CSS.
- **Comments**: Always include `<h2>Bình luận</h2>` inside the `.article-comments` container above the Giscus widget.

---

**Last Updated**: 2026-08-03
**Maintained by**: Quang (support@js-tools.org)
