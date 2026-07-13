# js-tools.org

Static landing page for [js-tools.org](https://js-tools.org) — experience, speed, convenience. Everything happens in your browser. No installation — just run. Unlock the power of JavaScript and your browser.

## Tools

| Tool                | URL                                                                  | Description                                                  |
| ------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| **SnapCast**        | [snapcast.js-tools.org](https://snapcast.js-tools.org)               | Real-time photo slideshow for live events                    |
| **ColorQuarium**    | [colorquarium.js-tools.org](https://colorquarium.js-tools.org)       | Ambient animated aquarium display controlled from your phone |
| **Image Optimizer** | [image-optimizer.js-tools.org](https://image-optimizer.js-tools.org) | Compress & convert images (JPEG, PNG, WebP, HEIC) in-browser |
| **QR Generator**    | [qr.js-tools.org](https://qr.js-tools.org)                           | Create and customize QR codes                                |
| **Remove BG**       | [rmbg.js-tools.org](https://rmbg.js-tools.org)                       | AI-powered background removal tool                           |

## Stack

- Pure HTML + CSS + vanilla JS (no framework, no build step)
- Deployed on **Cloudflare Pages** (auto-deploy on push to `main`)
- Domain managed on Cloudflare
- Google AdSense integrated (`ca-pub-3175971990265774`)
- Code formatting via **Prettier** with VS Code auto-format-on-save support

## Project structure

```
js-tools-org/
├── index.html           # Main landing page
├── styles.css           # Global styles (dark theme, CSS variables, animations)
├── main.js              # JS: year injection + hero particle canvas animation
├── i18n.js              # EN/VI translations + language toggle logic
├── sitemap.xml          # SEO sitemap
├── robots.txt           # SEO robots
├── package.json         # Scripts and devDependencies (Prettier, serve)
├── .prettierrc          # Prettier configuration
├── .gitignore           # Git ignore rules
├── .vscode/             # VS Code settings (Format on save enabled)
├── assets/              # App assets (icons, images)
└── blog/                # Blog section: tool articles + programming series
    ├── index.html       # Blog listing page (bilingual)
    ├── search-index.json # Client-side search index
    ├── blog.css / blog.js # Blog styles and logic
    ├── ide.css / ide.js  # Interactive code console & quizzes
    ├── prism.css / .js   # local syntax highlighting
    ├── c/               # C Series (HTML & code files co-located)
    ├── cpp/             # C++ Series (HTML & code files co-located)
    ├── js/              # JS Series (HTML & code files co-located)
    ├── canvas/          # Canvas Series (HTML & code files co-located)
    ├── bash/            # Bash Series (HTML & code files co-located)
    ├── css/             # CSS & Animation Series (HTML & files co-located)
    └── cpu/             # Computer Architecture Series (HTML & files co-located)
```

## Features

- **Dark theme** — black/navy background, `#4f8ef7` primary accent
- **Time-based weather canvas** — hero background changes based on time of day:
  - 🌅 5h–8h `dawn` — warm orange/yellow particles + drifting clouds
  - ☀️ 8h–17h `day` — soft blue particles + drifting clouds
  - 🌇 17h–20h `dusk` — orange/purple particles + clouds
  - 🌧️ 20h–23h `rain` — animated rain drops
  - 🌙 23h–5h `night` — twinkling stars + falling snowflakes
- **Mouse interaction** — particles and snowflakes are attracted to or repelled by the cursor
- **Mode switcher** — 5 emoji buttons (fixed bottom-right) to preview each mode; switching also updates all CSS variables (bg, accent, border, hero gradient) instantly
- **Ambient orbs** — blurred radial glows with CSS float animation
- **Entrance animations** — badge, headline, subtitle, CTA, stats bar fade-in on load
- **App logos in nav/footer** — inline SVG for all browser tools
- **Full SEO** — meta description, canonical, Open Graph, Twitter Card, JSON-LD structured data
- **Google AdSense** — responsive ad units integrated
- **i18n (EN / VI)** — toggle button in nav auto-detects browser language (`navigator.language`), persists choice in `localStorage`; all text via `data-i18n` attributes in `i18n.js`
- **Real-time Search** — Client-side blog search based on `search-index.json`
- **Giscus Comments** — Giscus (GitHub Discussions-powered) comments widget integrated on all blog detail pages

## Local development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Format code:

```bash
npm run format
```
