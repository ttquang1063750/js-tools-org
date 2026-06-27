# js-tools.org — Agent Guide

Landing page for [js-tools.org](https://js-tools.org) — experience, speed, convenience. Everything happens in your browser. No installation — just run. Unlock the power of JavaScript and your browser.

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
│   ├── blog.css         # Blog typography, article styles, card tags, Facebook CTA
│   ├── blog.js          # Language toggle for blog data-lang-content sections
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
- **Consistent across all pages**: index, privacy, terms, and all 36 blog HTML files

### 6. Blog Section

- **Tool articles**: 8 bilingual EN/VI articles about SnapCast, Image Optimizer, QR Generator, ColorQuarium, Remove BG
- **Programming series**: C (8 lessons), C++ (8 lessons), JavaScript (12 lessons), HTML5 Canvas (14 lessons), WebGL & 3D (10 lessons) — all in Vietnamese
  - **Academic Rigor**: The lessons feature high-quality computer science concepts. For example:
    - _C Series (Lesson 7)_: Formal Big O Time & Space complexity analysis, C examples for $O(1)$ to $O(N!)$, and recursion Call Stack depth analysis.
    - _C++ Series_: Name mangling, SSO (Small String Optimization), Vector dynamic array structures, RAII, Vptr/Vtable dynamic dispatch, and smart pointer atomic control blocks.
    - _JavaScript Series_: Parser/AST, Ignition bytecode, TurboFan JIT machine code, deoptimization triggers, Shapes/IC optimizations, ESM Live Bindings vs CJS Copy-on-Import, and custom Proxy-based Reactivity mapped to mock DOM.
    - _WebGL Series_: GPU hardware massively parallel ALU architecture, Graphics pipeline rasterization stage, affine matrices, perspective projection math formulas, GLSL shader compiler pipelines, and live Barycentric color interpolation visualizers.
- **Interactive JS Playgrounds**: Custom `js-playground` boxes (textarea source input + standard console capture log output) allowing code execution directly inside the browser.
- **Dynamic Code Viewer**: Interactive canvas demos and visualizer iframes include a toggleable `⟨⟩ Xem Code` button that displays their formatted, dedented, syntax-highlighted source code inline (and lazy-fetches external visualizer source files).
- **Client-Side Search & Static Index**: Real-time search engine on `blog/index.html` utilizing a pre-built static `search-index.json`. It performs deep searches across all 62 articles, mapping matched lesson titles and subheadings to direct URLs with diacritics-insensitive matching in both English and Vietnamese.
- **Facebook Comments**: Native `fb-comments` comments widget integrated at the bottom of all 50+ detail pages mapped to canonical URLs for social media discussions.
- **Article template structure**: `.article-hero` (tag, title, meta) → `.article-body` (EN/VI sections) → `.article-cta` → `.article-discuss` (Facebook CTA) → `.article-related`
- **Tag color classes**: `--sc` (purple), `--io` (green), `--qr` (cyan), `--cq` (teal), `--c` (C), `--cpp` (C++), `--js` (JS), `--canvas` (Canvas), `--webgl` (violet)
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

### Before Modifying Code

1. **Check CSS patterns**: Use flexbox + gap (no old margin/padding stacking)
2. **Responsive first**: Test at mobile (<600px), tablet (<880px for hamburger), desktop
3. **i18n coverage**: Any new text needs EN + VI translations
4. **Consistent nav**: Header and footer must match across ALL pages (index, privacy, terms, 36 blog files)
5. **Canvas performance**: Particle counts scale with viewport size

### When Adding Features

- Keep vanilla JavaScript (no libraries unless justified)
- Use CSS variables for theming
- Lazy-load iframes with IntersectionObserver
- Follow naming: kebab-case CSS classes, camelCase JS

---

**Last Updated**: 2026-06-27
**Maintained by**: Quang (support@js-tools.org)
