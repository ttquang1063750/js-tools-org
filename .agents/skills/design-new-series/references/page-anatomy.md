# Page Anatomy & Integration Checklist

How a series is physically built and wired into the site. Mirrors Part II of
`plan.md`. Always copy from a real, current page rather than writing markup from
memory — the canonical templates are:

- Lesson: `blog/webgl/webgl-shaders-glsl.html`
- Hub: `blog/webgl/webgl-programming-series.html`
- giscus block + a deep lesson: `blog/c/c-data-structures.html`

## Shared infrastructure (do ONCE, before writing lessons)

- [ ] **Prism languages** — ensure `blog/prism.js` has grammar for the series'
      languages (existing: `c`, `cpp`, `js`, `bash`). Add components locally (no
      CDN) for anything missing; `wgsl` can fall back to `glsl`/`clike`. Git
      CLI uses `bash`.
- [ ] **Tag color** — add `.blog-card__tag--<slug>` to `blog/blog.css`, matching
      the existing `--sc/--io/--qr/--c/...` palette.
- [ ] **Callout component (NEW)** — add `.callout` + `--note/--tip/--warning/`
      `--pitfall/--deep` to `blog/blog.css` (icon + bilingual title + body).
- [ ] **`.article-refs` component (NEW)** — a "References / Tài liệu tham khảo"
      block for external links.
- [ ] **Glossary component (NEW)** — `.glossary` (EN–VI term table) for hub pages.
- [ ] **KaTeX local** — vendor `katex.min.css` + `katex.min.js` +
      `auto-render.min.js` into `blog/`; auto-render on `DOMContentLoaded`; load
      only on pages with formulas.
- [ ] **giscus** — use the block from `blog/c/c-data-structures.html`; never
      Facebook.

## Lesson page anatomy

Each `blog/<slug>/<slug>-<topic>.html`:

- `<head>`: `<title>Bài N: … — js-tools</title>`, `<meta name="description">`,
  `<link rel="canonical" href="https://js-tools.org/blog/<slug>/<file>" />`
  (no `.html`), OG/Twitter tags, JSON-LD `TechArticle`/`Article`. CSS:
  `../blog.css`, `../ide.css`, `../prism.css` (+ KaTeX if formulas).
- **Header** (hamburger nav, `data-i18n`) + **Footer** (full nav): copy verbatim
  from the template so every page matches.
- `.article-hero`: back-link to hub (bilingual), `h1.article-hero__title` (EN+VI),
  `.article-hero__meta` (date + read-time, bilingual).
- `.article-body`: paired `div[data-lang-content="en"]` / `="vi"` holding the H2
  sections. Code in `.code-window` (`.code-header`, `.code-filename`,
  `.code-dots`, copy button, Prism `language-*`).
- Interactive demo: wrapped in a `.code-tabs` component — tabs **Xem trước
  (Preview) | <primary language: WGSL/CSS/SQL/…> | JavaScript**, each panel
  Prism-highlighted with the right `language-*`. This is the current standard
  (introduced with WebGPU/CSS series) — do **not** fall back to the older
  single `⟨⟩ Xem Code` lazy-fetch button for new series.
- Scan the finished body for literal, unconverted markdown before shipping:
  `**bold**` must become `<strong>`, `` `code` `` must become `<code>` — this
  has slipped through review before, so grep for stray `**`/`` ` `` pairs.
- `js-playground` where the lesson runs in pure JS.
- Quiz via `ide.js`/`ide.css` (`.quiz-container/.quiz-title/.quiz-question/`
  `.quiz-options/.quiz-option/.quiz-feedback`).
- `.article-refs` (≥3 external links, new tab) + "Tải file code thực hành" link.
- `.article-related` (prev/next + back to hub, bilingual).
- `.article-discuss` + **giscus**.
- Run `npx prettier --write` before committing.

## Hub page anatomy

`blog/<slug>/<slug>-programming-series.html`:

- Copy from `webgl-programming-series.html`. Title/description/canonical/OG +
  JSON-LD `Course`/`ItemList`.
- Bilingual intro section.
- `.lessons-list > a.lesson-item` rows: `.lesson-number` (01, 02…),
  `.lesson-content > h2.lesson-title` + `p.lesson-desc`, `.lesson-arrow ➔`.
  `href` points to the lesson slug **without** `.html`.
- A `.glossary` (EN–VI) block of series terminology.

## Co-located code files

One runnable file per lesson in the series folder (`.rs`, `.wgsl`, `.js`,
`.sql`, `.html`, …) — powers both the `.code-tabs` panels and the download
link.

## Core visualizer file

One standalone HTML demo in the series folder, embedded inside a `.code-tabs`
component (see above), not a bare iframe with a Xem-Code toggle. Respect
constraints: feature-detect new APIs (`navigator.gpu`), honor autoplay policy
(only create `AudioContext` after a user gesture), and for wasm-based demos
(e.g. `sql.js`, Rust) **commit the prebuilt `.wasm`** — no runtime build.

## Global integration (after each series)

- [ ] **`blog/index.html`** — add an `a.blog-card` to the hub with
      `.blog-card__tag--<slug>`, bilingual title/excerpt, `.blog-card__meta`, and
      "Start learning → / Bắt đầu học →". Place it with the other programming
      series.
- [ ] **ROOT `index.html`** (repo-root file, **not** `blog/index.html` — easy
      to conflate, has been missed twice already for the WebGPU and CSS
      series) — add an `a.learn-card` to the "Programming Courses" section:
      `.learn-card__tag`, `h3.learn-card__title`, `p.learn-card__desc` (these
      use `data-i18n`, not `data-lang-content`). After this step, the count of
      `.learn-card` in root `index.html` must equal the count of `.blog-card`
      programming-series entries in `blog/index.html` — verify with `grep -c`.
- [ ] **`sitemap.xml`** — one `<url>` per hub + lesson + visualizer. Hub
      `priority` 0.8, lessons 0.7, `changefreq` monthly, current `lastmod`.
- [ ] **`blog/search-index.json`** — one object per lesson: `url` (no `.html`),
      `parentSeries`, `titleEn`, `titleVi`, `desc`, `headingsEn`, `headingsVi`
      (concatenated H2 titles in order, both languages).
- [ ] **`README.md` + `AGENTS.md`** — update the directory tree, series/lesson
      counts, and "Last Updated".

## QA before handoff

- [ ] `npx serve -l 5500 .`; walk hub → each lesson → visualizer; no console
      errors.
- [ ] EN/VI toggle shows every block; nothing missing on either side.
- [ ] Responsive at <600px, hamburger <880px, desktop.
- [ ] `.code-tabs` render and highlight correctly on every tab; quiz grades;
      download links return 200.
- [ ] Grepping every new lesson for stray `**` or backtick pairs comes back
      clean — no raw markdown left unconverted to `<strong>`/`<code>`.
- [ ] Search on `blog/index.html` surfaces the new lessons.
- [ ] giscus loads with no `facebook.net` request; KaTeX renders; sitemap clean.
- [ ] Prettier clean.
