# js-tools.org

Static landing page for [js-tools.org](https://js-tools.org) — introducing free, browser-based developer tools.

## Tools

| Tool | URL | Description |
|------|-----|-------------|
| Image Optimizer | [image-optimizer.js-tools.org](https://image-optimizer.js-tools.org) | Compress JPEG, PNG, WebP, HEIC entirely in your browser |
| Snapcast | [snapcast.js-tools.org](https://snapcast.js-tools.org) | Real-time photo slideshow for live events |

## Stack

- Pure HTML + CSS + vanilla JS (no framework, no build step)
- Deployed on **Cloudflare Pages** (auto-deploy on push to `main`)
- Domain managed on Cloudflare
- Google AdSense integrated (`ca-pub-3175971990265774`)

## Project structure

```
js-tools-org/
├── index.html      # Main landing page
├── styles.css      # Global styles (dark theme, CSS variables, animations)
├── main.js         # JS: year injection + hero particle canvas animation
├── i18n.js         # EN/VI translations + language toggle logic
├── favicon.svg     # SVG favicon
├── og-image.svg    # OG image source (1200×630)
├── og-image.png    # OG image rendered (generated from og-image.svg)
├── robots.txt
└── sitemap.xml
```

## Features

- **Dark theme** — black/navy background, `#4f8ef7` primary accent
- **Time-based weather canvas** — hero background changes based on time of day:
  - 🌅 5h–8h `dawn` — warm orange/yellow particles + drifting clouds
  - ☀️ 8h–17h `day` — soft blue particles + drifting clouds
  - 🌇 17h–20h `dusk` — orange/purple particles + clouds
  - 🌧️ 20h–23h `rain` — animated rain drops
  - 🌙 23h–5h `night` — twinkling stars + falling snowflakes
- **Mouse attraction** — particles and snowflakes are attracted to the cursor
- **Mode switcher** — 5 emoji buttons (fixed bottom-right) to preview each mode; switching also updates all CSS variables (bg, accent, border, hero gradient) instantly
- **Ambient orbs** — blurred radial glows with CSS float animation
- **Entrance animations** — badge, headline, subtitle, CTA, stats bar fade-in on load
- **Stats bar** — 2 Tools · 0 Bytes uploaded · 100% In-browser
- **App logos in nav/footer** — inline SVG for Image Optimizer and SnapCast
- **Full SEO** — meta description, canonical, Open Graph, Twitter Card, JSON-LD structured data
- **Google AdSense** — 2 responsive ad units (below hero, between tools and why section)
- **i18n (EN / VI)** — toggle button in nav auto-detects browser language (`navigator.language`), persists choice in `localStorage`; all text via `data-i18n` attributes in `i18n.js`

## Local development

No build step required:

```bash
# Using Python
python3 -m http.server 8080

# Using Node
npx serve .
```

## Regenerate OG image

The `og-image.png` is generated from `og-image.svg` using `rsvg-convert`:

```bash
rsvg-convert -w 1200 -h 630 og-image.svg -o og-image.png
```

## Deploy

Cloudflare Pages is connected to this GitHub repo. Every push to `main` triggers an automatic deployment.

Manual deploy via Wrangler:

```bash
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account_id> \
  npx wrangler pages deploy . --project-name js-tools-org
```

## AdSense notes

- Verification meta tag + async script are in `<head>`
- Ad units use `data-ad-slot="AUTO"` — replace with real slot IDs from AdSense dashboard once the account is approved
