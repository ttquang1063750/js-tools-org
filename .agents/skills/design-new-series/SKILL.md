---
name: design-new-series
description: >-
  Design and fully specify a NEW educational programming series for the
  js-tools.org bilingual (EN/VI) tutorial blog under `blog/`. Use this whenever
  the user wants to add, design, plan, scaffold, or outline a new learning
  series / course / multi-lesson tutorial track — e.g. "add a Rust series",
  "thiết kế series WebGPU", "tôi muốn thêm series mới về X", "lên đề cương khóa
  học Y", or asks what a new series should contain or how deep it should be.
  Produces the complete handoff spec: series identity (slug/tag/folder/accent),
  tech stack, core interactive visualizer, lesson-by-lesson H2 syllabus, and the
  content quality contract — matching the depth of the existing series (C, C++,
  JS, Canvas, WebGL, Bash) and the conventions captured in `plan.md`. Reach for
  this even when the user doesn't say the word "series" but clearly wants a new
  multi-part tutorial track on the blog.
---

# Design a New Series for js-tools.org

## What this is for

js-tools.org has a blog (`blog/`) of in-depth, bilingual (EN/VI) programming
series — C, C++, JavaScript, Canvas, WebGL, Bash. Each series is a folder of
lesson pages plus a curriculum "hub" page, with co-located runnable code,
interactive visualizers, quizzes, and cross-links. This skill turns "I want a
series about X" into a **complete, build-ready specification** at the same depth
bar as the existing series.

The canonical living reference is **`plan.md`** at the repo root (Parts I–IV).
This skill is the repeatable procedure for producing a new entry of that
quality. When in doubt about a convention, open `plan.md` and a real lesson such
as `blog/c/c-data-structures.html` or `blog/cpp/cpp-move-semantics.html` and
match what they do.

## Non-negotiable constraints (the house style)

These hold for every series. Don't quietly break them.

- **No build step, no framework.** Pure HTML + CSS + vanilla JS. Deployed as
  static files on Cloudflare Pages. No bundler, no npm runtime deps in pages.
- **Vietnamese only for new series (as of the DSA series, 2026-07-03).** Do
  NOT add `data-lang-content="en"`/`"vi"` splits to article body, hero
  title/meta, back-links, or related-article links — write one Vietnamese
  string with no language attribute. Nav/footer chrome still uses `data-i18n`
  (shared site-wide toggle) and stays as-is; only per-page article content
  drops the EN/VI split. Older series (C, C++, JS, Canvas, WebGL, Bash,
  WebGPU, CSS) already shipped bilingual or VI-stub — don't retroactively
  rewrite them, this only applies going forward.
- **Math = KaTeX local.** Render formulas with a local copy of KaTeX
  (`$…$` inline, `$$…$$` block, auto-render on `DOMContentLoaded`). No CDN, no
  MathJax. Only load it on pages that actually have formulas.
- **Code demos = `.code-tabs`.** Every interactive demo is wrapped in tabs
  (Xem trước/Preview | primary language | JavaScript), Prism-highlighted per
  tab — the pattern introduced with WebGPU/CSS. Don't reach for the older
  single `⟨⟩ Xem Code` button for new series.
- **No raw markdown left in HTML.** `**bold**` and `` `code` `` must always be
  converted to `<strong>`/`<code>` before shipping — this has slipped through
  more than once, grep for stray `**`/`` ` `` before calling a lesson done.
- **Comments = giscus only.** Never Facebook / `fb-comments`. Copy the giscus
  block from `blog/c/c-data-structures.html`.
- **Internal links have no `.html` suffix** (Cloudflare rewrites). External
  links open in a new tab with `rel="noopener noreferrer"`.
- **Quality over lesson count.** A few deep lessons beat many shallow ones. Do
  not pad the lesson count; let the topic decide how many lessons it needs.

## How to work through this (read first)

This skill is deliberately **incremental and single-threaded**. Designing a full
series is a large job; doing it in one giant pass risks exhausting the context /
usage budget and leaving nothing for other work. So:

- **Do NOT spawn subagents.** Run every step yourself, in the main thread. No
  parallel fan-out, no background agents. One series design is small enough to do
  directly — keep it that way.
- **One step at a time.** Do a single step from the procedure below, then STOP.
  Don't chain steps 1→5 in one turn.
- **Checkpoint after each step.** When a step is done, show a short **checklist
  of what was produced (with `- [x]` ticks)** and the open `- [ ]` items still
  ahead, then ask the user to confirm before continuing. Wait for their reply.
  This keeps each turn cheap, lets them course-correct early, and means an
  interruption never loses more than one small step.
- **Keep each unit small.** Within a step, if the work is large (e.g. the
  per-lesson H2 breakdown for 10 lessons), split it further — do a few lessons,
  checkpoint, continue. Better many small confirmed increments than one
  unreviewable dump.
- **Persist as you go.** Write each step's output to the file (append to
  `plan.md`) immediately, so progress survives even if the session is cut off.

Master checklist to track and re-display at each checkpoint:

- [ ] Step 1 — Series identity locked
- [ ] Step 2 — Tech stack + core visualizer
- [ ] Step 3A — Overview syllabus table
- [ ] Step 3B — Per-lesson H2 breakdown (may span several checkpoints)
- [ ] Step 4 — Quality contract applied / noted
- [ ] Step 5 — Implementation & integration checklist

## The procedure

Work through these five steps **one at a time, checkpointing after each** (see
above). Produce the spec as you go — by default, **append it to `plan.md`** as
the next `## Series N` block (Part I) plus its Part III detail, so all series
live in one document. If the user prefers a standalone file, write
`blog/<slug>/<slug>-design.md` instead. Confirm which they want at Step 1.

### Step 1 — Series identity

Lock these before writing content. Present as a small table and get a thumbs-up.

| Field               | Example                          | Notes                                        |
| ------------------- | -------------------------------- | -------------------------------------------- |
| Series name (EN/VI) | "WebGPU & Modern GPU Compute"    |                                              |
| Folder slug         | `webgpu/`                        | kebab-case, no diacritics                    |
| Hub file            | `webgpu-programming-series.html` | the curriculum page                          |
| Lesson slug pattern | `webgpu-<topic>.html`            | e.g. `webgpu-compute-shaders.html`           |
| Tag class           | `--webgpu`                       | adds `.blog-card__tag--webgpu` in `blog.css` |
| Accent color        | hex                              | follows existing `--sc/--io/...` palette     |
| Prism language(s)   | `wgsl`, `rust`                   | flag any not yet in `blog/prism.js`          |

### Step 2 — Tech stack & the core visualizer

Every series has ONE flagship interactive demo — the thing that makes the topic
_felt_, not just read (e.g. WebGL's barycentric interpolation visualizer, the
event-loop visualizer). Specify:

- **Tech stack**: languages, browser APIs, any local libraries (must be
  vendorable as static files — e.g. `sql.js` wasm, KaTeX). No build tooling.
- **Core visualizer**: a name, the layout (controls ↔ canvas/output), what the
  user manipulates, and what insight it reveals. This is usually the heaviest
  build item — call it out explicitly.

Write this the way Part I of `plan.md` does (see existing Series 1–9 for tone).

### Step 3 — Lesson syllabus (two layers of depth)

**Layer A — overview table** (Part I style): one row per lesson with columns
_Lesson · Deep CS content · Companion demo/project_. Order from foundations →
advanced → a capstone project lesson.

**Layer B — per-lesson H2 breakdown** (Part III style): expand EACH lesson into
**3–5 numbered H2 sub-sections** — the actual sections of `.article-body`. This
is the step that prevents shallow lessons. Match the granularity of real pages
(`cpp-move-semantics` = 6 sections; `c-data-structures` = 10).

Every H2 section must answer four questions (don't just define "what"):

1. **What** — precise definition in context.
2. **Why** — the problem it solves / why it matters.
3. **When** — when to use it, when not to, the trade-off.
4. **Pitfall** — the common mistake or misconception (→ a `--pitfall` callout).

Every lesson ends with a "Câu hỏi trắc nghiệm ôn tập" (quiz) section.

Layer B is usually the largest step. **Don't expand all lessons in one turn** —
do a batch of ~3 lessons, append them to the file, checkpoint (tick the lessons
done, list those remaining), and continue only after the user confirms.

### Step 4 — Apply the content quality contract

Before a lesson counts as "designed", check it against the rubric in
**`references/quality-contract.md`** (read it now). It sets the minimum bars:
words per language, number of runnable code examples, callouts, comparison
tables, internal cross-links, external references, glossary terms, quiz
questions, and downloadable code. Encode these expectations into the spec so the
implementer can't accidentally ship something thinner than the existing series.

Pay special attention to the three "breadth" levers the user cares about:

- **Examples**: ≥1 runnable example per core concept, anti-pattern (❌/✅) for
  error-prone topics, complexity that escalates gradually.
- **Links**: internal cross-links between lessons AND across series (use the
  cross-link map in the quality contract), plus an external "References" block.
- **Annotations**: bilingual code comments, callout boxes, `<abbr>` for jargon,
  a glossary on the hub page, and a one-line gloss for every formula.

### Step 5 — Implementation & integration checklist

Produce the build/handoff checklist from **`references/page-anatomy.md`** (read
it when you reach this step). It covers the exact anatomy of a lesson page and a
hub page, the co-located code files, the shared infra (Prism languages, tag
colors, callout/glossary/references components, KaTeX, giscus), and the global
integration every new series needs: a card in `blog/index.html`, **a matching
`a.learn-card` in the repo-root `index.html`** (a separate file from
`blog/index.html` — missed twice before, always double-check both), `<url>`
entries in `sitemap.xml`, entries in `blog/search-index.json`, and updates to
`README.md` / `AGENTS.md`.

## Output

A finished design is **assembled incrementally** — each step appends its piece to
the file and is confirmed at a checkpoint before the next. When complete, the
document contains, in order:

1. Series identity table (Step 1).
2. Tech stack + core visualizer (Step 2).
3. Overview syllabus table (Step 3, Layer A).
4. Per-lesson H2 breakdown (Step 3, Layer B).
5. A note that lessons must meet `references/quality-contract.md`.
6. The implementation/integration checklist (Step 5).

Keep the prose tight and technical, bilingual where it will become page content.
At the final checkpoint, tell the user where everything was written (which
section of `plan.md`, or the standalone file) and what the heaviest build items
are — but **stop at designing the spec.** Actually building the pages is a
separate, even larger job; offer it as a follow-up rather than rolling straight
into it in the same session.
