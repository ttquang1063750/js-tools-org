# js-tools.org

Static landing page for [js-tools.org](https://js-tools.org) — introducing free, browser-based developer tools.

## Tools

| Tool | URL | Description |
|------|-----|-------------|
| Image Optimizer | [image-optimizer.js-tools.org](https://image-optimizer.js-tools.org) | Compress JPEG, PNG, WebP, HEIC entirely in your browser |
| Snapcast | [snapcast.js-tools.org](https://snapcast.js-tools.org) | Real-time photo slideshow for live events |

## Stack

- Pure HTML + CSS (no framework, no build step)
- Deployed on **Cloudflare Pages** (auto-deploy on push to `main`)
- Domain managed on Cloudflare

## Project structure

```
js-tools-org/
├── index.html      # Main landing page
├── styles.css      # Global styles (dark/light theme via CSS variables)
├── favicon.svg     # SVG favicon
├── og-image.svg    # OG image source (1200×630)
├── og-image.png    # OG image rendered (generated from og-image.svg)
├── robots.txt
└── sitemap.xml
```

## Local development

No build step required — just open `index.html` in a browser:

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
