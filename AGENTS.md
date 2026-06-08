# js-tools.org — Agent Guide

Landing page for [js-tools.org](https://js-tools.org) — experience, speed, convenience. Everything happens in your browser. No installation — just run. Unlock the power of JavaScript and your browser.

---

## Project Overview

**js-tools.org** is a static landing page showcasing two browser-based developer tools:
1. **Image Optimizer** — Compress & convert images (JPEG, PNG, WebP, HEIC) entirely in-browser
2. **SnapCast** — Real-time photo slideshow for live events

**Tech Stack**: Pure HTML + CSS + vanilla JavaScript (no framework, no build step)
**Deployment**: Cloudflare Pages (auto-deploys on `main` push)

---

## Directory Structure

```
js-tools-org/
├── index.html           # Main landing page + hero canvas + tool cards
├── styles.css           # Global styles (dark theme, animations, responsive)
├── main.js              # Year injection + canvas particle animation + lazy-load iframes
├── i18n.js              # EN/VI translation system + language toggle
├── assets/              # Visual assets
│   ├── favicon.svg      # SVG favicon
│   ├── logo.svg         # Logo
│   ├── og-image.svg     # OG image source (1200×630)
│   ├── og-image.png     # OG image (generated from SVG)
│   ├── optimizer.svg    # Image Optimizer logo
│   └── snapcast.svg     # SnapCast logo
├── robots.txt           # SEO robots configuration
├── sitemap.xml          # SEO sitemap
├── README.md            # Project documentation
├── AGENTS.md            # This file — agent guide
└── .gitignore           # Git ignore rules
```

---

## Key Features

### 1. **Hero Section with Canvas Particle Animation**
- **Location**: `index.html` (lines 101–139) + `main.js` (lines 5–360)
- **5 Time-Based Modes**:
  - 🌅 **Dawn** (5h–8h): Warm orange/yellow particles + drifting clouds
  - ☀️ **Day** (8h–17h): Soft blue/white particles + clouds
  - 🌇 **Dusk** (17h–20h): Orange/purple particles + clouds
  - 🌧️ **Rain** (20h–23h): Animated falling raindrops
  - 🌙 **Night** (23h–5h): Twinkling stars + falling snowflakes
- **Mode Switcher**: 5 emoji buttons (fixed bottom-right) let users preview each mode
- **Mouse Interaction**:
  - **Soft Boundary**: 30px repulsion zone around cursor (particles gently pushed out)
  - **Attraction**: Particles follow cursor from distance (except snowflakes — they fall naturally)
  - **Smooth Physics**: Distance-based force falloff, no hard boundaries causing jitter

### 2. **Dynamic Theming**
- Color palette changes with time of day (or when user clicks mode button)
- CSS variables (`--bg`, `--accent`, `--border`, etc.) updated in real-time
- Hero gradient background updates to match mode

### 3. **i18n (EN / VI)**
- **System**: `i18n.js` with `data-i18n` attributes in HTML
- **Language Detection**: Auto-detects from `navigator.language`, persists choice in `localStorage`
- **Toggle Button**: Top-right nav, switches between English and Vietnamese
- **Coverage**: All text content translated (hero, tools, why section, footer)

### 4. **Tool Cards + Live Demo**
- **Layout**: Each tool grouped with its demo (vertical stack)
  1. **SnapCast Card** → SnapCast live demo (with QR code iframe)
  2. **Image Optimizer Card** → (ready for demo)
- **Live Demo**: SnapCast event at `snapcast.js-tools.org/slideshow/XDXQK8` with real-time photo sync
- **Lazy Loading**: Iframes load only when visible (Intersection Observer)

### 5. **SEO & Social**
- **Meta Tags**: Title, description, canonical, Open Graph, Twitter Card, JSON-LD
- **Structured Data**: Schema.org `WebSite` + `SoftwareApplication` definitions
- **Mobile Friendly**: Responsive design (mobile-first CSS)
- **Performance**: No external dependencies, pure vanilla code

### 6. **Ad Integration**
- **Google AdSense**: 2 responsive ad units
  - Below hero section (ad-slot=3853008302)
  - Between tools and why section (ad-slot=8722191605)
- **Approval Status**: Active and approved; slot IDs updated

---

## Canvas Particle Animation Details

### Constants (main.js, lines 11–13)
```javascript
const ATTRACT_FORCE  = 0.003;  // Very light attraction to all particles
const REPEL_RADIUS   = 30;     // Invisible boundary zone (pixels)
const REPEL_FORCE    = 0.15;   // Strong repulsion to enforce boundary
```

### Particle Types & Colors
- **Stars** (night): Static white circles, twinkle effect
- **Snowflakes** (night): Fall naturally with slight repulsion (no attraction upward)
- **Rain** (rain mode): Diagonal raindrops with repulsion + attraction
- **Generic particles** (dawn/dusk/day): 2-5 random colors per mode, float upward with mouse influence

### Physics
- **Soft Boundary**: When `dist < REPEL_RADIUS`, nudge particle outward by `penetration * 0.3` per frame (no hard teleport)
- **Strong Repulsion**: `repelForce = REPEL_FORCE * (1 - dist / REPEL_RADIUS)` decreases with distance
- **Gentle Attraction** (far particles): `force = ATTRACT_FORCE / Math.max(1, dist / 200)` pulls toward cursor
- **Velocity Damping**: 0.96–0.97 friction factor per frame
- **Gravity**: Downward acceleration (0.012–0.015 per frame depending on particle type)

### Mouse Tracking
- Bounds checking: Only apply forces when `mouse.x >= 0 && mouse.x <= W && mouse.y >= 0 && mouse.y <= H`
- Canvas rect updated on scroll + resize events
- Repulsion applies to: rain, snowflakes, generic particles

---

## Styling Architecture

### Color Palette (CSS Variables)
```css
--bg: #0a0f1e              /* Dark navy background */
--bg-card: #111827         /* Card background */
--bg-card-hover: #1a2235   /* Hover state */
--accent: #4f8ef7          /* Primary blue */
--accent-2: #a78bfa        /* Secondary purple */
--border: rgba(79,142,247,0.18)
--text: #ffffff
--text-muted: #c4c9db
--radius: 16px
--shadow: 0 4px 32px rgba(0,0,0,0.7)
```

### Responsive Breakpoints
- **Mobile** (< 600px): Single-column layout, smaller padding
- **Desktop** (≥ 600px): Multi-column grids, full-width layouts

### Key Classes
- `.hero`: Hero section with canvas background
- `.tool-block`: Vertical container (tool card + demo)
- `.tool-card`: Card styling (hover effect: translateY(-4px))
- `.sc-demo`: SnapCast demo section styling
- `.why-grid`: 3-column grid for "Why js-tools?" section

---

## Development Setup

### Local Server (No Build Step)
```bash
# Using Python
python3 -m http.server 8080

# Using Node
npx serve .

# Then open http://localhost:8080
```

### File Editing Tips
- **HTML Changes**: Edit `index.html` directly; refresh browser
- **CSS Changes**: Edit `styles.css`; hard refresh (Cmd+Shift+R)
- **JavaScript**: Edit `main.js` (particle animation) or `i18n.js` (translations)
- **Translations**: Add keys to `TRANSLATIONS` object in `i18n.js`

---

## Common Tasks

### Add a Translation String
1. Edit `i18n.js` → `TRANSLATIONS.en` (add English)
2. Add `TRANSLATIONS.vi` (Vietnamese translation)
3. Add `data-i18n="my.key"` to HTML element
4. Element text auto-updates on language toggle

**Example**:
```javascript
// i18n.js
en: { 'hero.sub': 'Experience the power of JavaScript and your browser.' },
vi: { 'hero.sub': 'Trải nghiệm sức mạnh của JavaScript và trình duyệt của bạn.' }
```

```html
<!-- index.html -->
<p class="hero-sub" data-i18n="hero.sub">...</p>
```

### Change Mode Colors
1. Edit `PALETTES` object in `main.js` (lines 16–22)
2. Each mode has: `bg`, `bgCard`, `accent`, `accent2`, `border`, `hero`
3. Colors update instantly when user clicks mode button

**Example**:
```javascript
dawn: { 
  bg: '#0e0a04', 
  accent: '#f59e0b', 
  accent2: '#fb923c',
  // ... other colors
}
```

### Adjust Particle Physics
- **Slower attraction**: Decrease `ATTRACT_FORCE` (0.003 → 0.001)
- **Stronger repulsion**: Increase `REPEL_FORCE` (0.15 → 0.25)
- **Larger/smaller boundary**: Change `REPEL_RADIUS` (30 → 50)
- **More/fewer particles**: Change `count` in `init()` function (line 172–174)

### Regenerate OG Image
```bash
rsvg-convert -w 1200 -h 630 assets/og-image.svg -o assets/og-image.png
```

---

## Recent Changes (This Session)

### Canvas Particle Animation Improvements
- **Issue**: Particles were clustering on mouse hover (too strong attraction)
- **Solution**: 
  - Reduced attraction force (`ATTRACT_FORCE = 0.003`)
  - Added invisible repulsion boundary (`REPEL_RADIUS = 30`)
  - Implemented soft position nudge (no hard teleport) + strong repulsion force
  - Removed hard boundary constraints that caused jittering

### Rain & Snow Particle Fixes
- **Rain particles**: Added full mouse interaction (repulsion + attraction)
- **Snowflakes**: Disabled upward attraction (let them fall naturally), kept repulsion only

### Branding Updates
- Removed "free" messaging throughout (README, index.html, i18n.js)
- Updated hero badge: "⚡ Fast · Client-side · Privacy-first" (was "Free · Open-source · Privacy-first")
- Changed "Why" section: "Experience, Lightning Fast, Convenient" (was "Privacy First, Free, Open Source")

### Layout Reorganization
- **Tools section**: Changed from grid (both cards side-by-side) to vertical stack
- **New structure**: SnapCast card → SnapCast demo | Image Optimizer card → (ready for demo)
- **Benefit**: Better narrative flow (tool → see it in action)

---

## Deployment

### Automatic Deployment
- Every push to `main` branch auto-deploys to Cloudflare Pages
- Live at [https://js-tools.org](https://js-tools.org)

### Manual Deployment (if needed)
```bash
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account_id> \
  npx wrangler pages deploy . --project-name js-tools-org
```

---

## Notes for Agents

### Before Modifying Code
1. **Check CSS patterns**: Use flexbox + gap (no old margin/padding stacking)
2. **Responsive first**: Test changes on mobile (< 600px) and desktop
3. **i18n coverage**: Any new text needs EN + VI translations
4. **Canvas performance**: Particle counts scale with viewport size to avoid lag

### When Adding Features
- Keep vanilla JavaScript (no libraries unless justified)
- Use CSS variables for theming (colors, spacing, radii)
- Lazy-load iframes with Intersection Observer
- Follow existing naming: kebab-case for CSS classes, camelCase for JS

### Testing
- **Local**: `python3 -m http.server 8080` (or `npx serve .`)
- **Hard refresh**: Cmd+Shift+R to bust CSS cache
- **Mobile test**: Browser dev tools (F12) → device toolbar
- **Translations**: Toggle language button (top-right nav)
- **Particle modes**: Click emoji buttons (bottom-right)

---

## Related Projects

- **Image Optimizer**: [image-optimizer.js-tools.org](https://image-optimizer.js-tools.org)
- **SnapCast**: [snapcast.js-tools.org](https://snapcast.js-tools.org)
- **GitHub**: [ttquang1063750/js-tools-org](https://github.com/ttquang1063750/js-tools-org)

---

**Last Updated**: 2026-06-03  
**Maintained by**: Quang (support@js-tools.org)
