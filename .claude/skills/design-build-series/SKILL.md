---
name: design-build-series
description: >-
  Design and plan a NEW "code thực chiến" (hands-on build) series for
  js-tools.org, under `blog/build/<dự-án>/part-N.html` — a continuous,
  Vietnamese-only, multi-part engineering write-up that builds one real system
  end to end (e.g. "xây một nền tảng media bằng NestJS"), as opposed to a
  chunked lesson series. Distinct from `design-new-series`, which plans the
  bilingual lesson-based series (C/C++/JS/Canvas/...) with quizzes and a
  per-lesson H2 quality contract — this skill is only for the build/project
  format: one long page per part, code accumulating across parts toward a
  running product. Use whenever the user wants to plan, design, or scaffold a
  new code-thực-chiến / hands-on build series, names a system they want to
  build in writing (e.g. "viết loạt bài xây một message queue từ đầu"), or
  references the Viblo-style "xây X từ con số 0" format.
---

# Design a new "code thực chiến" build series

## What this is for

`design-new-series` plans a lesson series: many short pages, a syllabus, a
quiz per lesson, EN/VI. This skill plans the other format entirely — a
**"code thực chiến"** series is a small number of long, continuous pages
(`part-1.html`, `part-2.html`, ...) that build ONE real system from nothing to
working, in the voice of an engineer walking a colleague through a real
project: prose, a code block with its filename, more prose, no lesson
boundaries, no quiz, Vietnamese only.

The canonical worked example — decisions made, mistakes made, and what was
learned fixing them afterward — is `task.md`'s record of the
`nestjs-media-platform` series (read it now if it still has that content;
if `task.md` has moved on to a different series, `git log --oneline --all --
task.md` finds the commit that had it). Match that depth and rigor, and do
not repeat the mistakes documented there.

## The house style (bake these in unless the user overrides)

- **One continuous page per part**, not chunked lessons. No quiz, no
  prev/next lesson navigation, no `data-lang-content` EN/VI split — confirm
  this is still wanted, but treat it as the default; a previous project
  owner asked for exactly this shape and explicitly rejected the lesson
  format for this genre.
- **Vietnamese only**, matching the site-wide rule for new series.
- **3–5 parts.** Cut where the product reaches a real milestone ("it runs
  end to end now"), not at an arbitrary word count. It is fine to tell the
  user a part may split further if it runs long — decide that when you get
  there, not up front.
- **`blog/build/<slug>/part-N.html`.** `<slug>` is the project's own name
  (`nestjs-media-platform`), not a topic name — this format is organized by
  *product*, not by *technology*.

## Picking the topic — the one test that matters

A code-thực-chiến topic lives or dies on one question: **does building this
thing make techniques that are normally taught in isolation become
*necessary*, not decorative?** The NestJS series exists because a video
platform is close to the only realistic project where `child_process`
(calling `ffmpeg`), backpressure/streaming (2 GB uploads), realtime
(transcode progress), and ACID transactions (credit/billing) are all things
you cannot avoid touching — not things bolted on to justify a chapter.

Before locking a topic, explicitly rule out the alternatives and say why, the
way the NestJS series' own record does:

- Does an existing lesson series already cover this system's central
  tension? (The e-commerce idea was dropped because ACID + caching were
  already the `sql` and `sysdesign` series' territory.)
- Does making the example *real* create a legal/ethical problem? (An
  ETL/crawler idea was dropped partly for this reason — a realistic scraping
  target is someone else's site.)
- Is there a single forcing function, or does the project just bolt features
  together because they are trendy? If you cannot name the one architectural
  problem the whole series builds toward (the NestJS series' answer:
  "monolith, one DB, ACID guaranteed" → "split into services" → "the
  transaction breaks, and outbox pattern is the real fix"), the topic is not
  ready yet — keep narrowing it.

## The core narrative technique

This is what separates "code thực chiến" from an ordinary tutorial, and it
should recur throughout, not just once:

**naive version → real, measured failure → explanation of the *why* → fixed
version → re-measured proof it now works.** The credit double-spend demo is
the template: write `charge()` the obvious way, reproduce the bug with
`xargs -P 10` firing concurrent requests, show the *actual* negative balance,
explain the isolation-level reason, patch with `SELECT ... FOR UPDATE`, show
the *actual* corrected numbers.

**Numbers must be real or explicitly labeled illustrative — never invented.**
The TypeScript compiler error codes in Part 1, the double-spend balance, the
retry-backoff timing: all of these must come from something that was
actually run, or the text must say plainly "minh hoạ" instead of stating a
number as if measured. This was written into this project's own house rules
after the first draft; do not let a new series relax it.

## Architecture arc, if the topic is a system with growth potential

Not every topic needs this, but when the topic supports it (the way the
NestJS series moves monolith → microservice), **design the arc as a single
throughline, not a list of unrelated topics per part**: an early-part
decision (domain-organized folders, not file-type-organized) should be the
exact thing that makes a late-part payoff cheap (splitting into services is
"change the call site from inject to gRPC client", not a rewrite). Part 1
should promise, in a concrete callout, what the reader will be able to build
by the end of the series — and every later part should be traceable back to
that promise.

## The trap this project fell into once — avoid it while writing, not after

A full read-through of this exact series, done *after* all four parts were
believed finished, found over thirty real defects — the single largest
category by far was **code referenced in one part (`this.redis.xadd(...)`,
an import, a constructor parameter) that was never actually written out
anywhere in the series**, plus fragments of the same class shown in
separate blocks that silently did not fit back together, plus a frontend
section calling backend endpoints/events the backend text never defined.
This is not a hypothetical risk — it is exactly what happened here, and
building the whole project for real afterward was the only way it surfaced.

Two things reduce this while you write, instead of discovering it later:

1. **Keep a running symbol ledger as you draft each part**: every time you
   write code that imports, injects, or calls something (`RedisService`,
   `findPlayable()`, an HTTP route, a socket event name), note it. Before
   marking a part "ĐÃ VIẾT XONG", check every noted name against the parts
   written so far — either it has a real definition somewhere, or the text
   explicitly says "sẽ viết ở Part N" / "theo đúng khuôn đã có, không lặp
   lại". A name silently left dangling is the defect.
2. **Run `review-build-series` after every part**, not only at the end. It
   is a read-only pass built specifically to catch this category — cheap
   enough to run every time, and it writes findings straight into `task.md`
   so nothing is lost between sessions. Treat a part as a draft, not done,
   until that pass comes back clean or its findings are explicitly accepted
   as intentional.

If the project owner's constraint is "no real project gets scaffolded, text
and listings only" (as it was here), say plainly that this means the series
is shipping unverified until someone actually builds it — that trade-off is
the owner's to accept, not yours to hide by asserting confidence a listing
alone cannot earn.

## The procedure

Checkpoint after each step — do not produce the whole plan in one turn. Show
what was written, what's left, wait for a nod, continue. Write everything
into `task.md` at the repo root as you go (create it if it does not exist),
using the same sections the NestJS record uses so future sessions read a
familiar shape:

- [ ] Step 1 — Lock the topic (apply "Picking the topic" above; write the
      rejected alternatives and why, not just the winner)
- [ ] Step 2 — Lock format + stack: continuous-page confirmation, language/
      framework/ORM choices with reasons, part count and natural cut points
- [ ] Step 3 — The architecture arc / core throughline (if applicable) and
      the concrete "what you'll have by the end" promise for Part 1
- [ ] Step 4 — Per-part outline: for each part, the H2 sections it will
      cover and, for each major technical claim, which naive→fail→fix beat
      it corresponds to (see "core narrative technique")
- [ ] Step 5 — Operational constraints: confirm commit/publish policy with
      the user explicitly (this project's series stayed commit-local, no
      sitemap/search-index entry, until the owner decided to publish — do
      not assume the same holds for a new series without asking)
- [ ] Step 6 — Write the `## Các quyết định ĐÃ CHỐT` table and the
      `## Gotcha đã gặp` / `## Giọng văn` sections into `task.md`, seeded
      from this repo's existing entries (3-level-deep relative paths, chrome
      must be replaced fully not just `<head>`, Prism has no TypeScript by
      default — check `blog/prism.js` before using a new `language-x` for
      the first time, don't reason-explain-to-the-reader why a decision was
      made *editorially* — write for the reader, not to justify yourself to
      the person who assigned the piece)

Each step's output is a section of `task.md`, appended as it's produced —
not held in memory until the end.

## Output

Stop once the plan is written and confirmed, section by section, in
`task.md`. Actually writing Part 1's prose and code is a separate, later
job — offer it as the next step rather than continuing straight into it in
the same session, exactly as `design-new-series` does for lesson series.
