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

The canonical worked example is the `nestjs-media-platform` series. Its
**permanent** record is the four pages themselves — `blog/build/nestjs-media-platform/part-{1..4}.html`
— plus the commit range that produced and then repaired them:

```bash
git log --oneline 2745e04^..d8cdc2d
```

Read the commit subjects before planning: they are a compressed list of every
correction the series needed, including the two late commits that fixed 21
runtime bugs and a round of frontend↔backend integration bugs found only by
building the project for real.

That series' decision table and gotcha list were originally written into a
shared `task.md` (before this skill wrote to its own dedicated file) — read
it if so, for historical context. Going forward, this skill writes into
`design-task.md` at the repo root, not `task.md`: the old shared file mixed
design notes, review findings, and fix history together (making "is this
settled or still open" ambiguous), and `task.md` is also the exact file
`beginner-proof-series`'s `make-task.py` overwrites wholesale for lesson
series. `design-task.md` is a dedicated file this skill owns, avoiding both
problems — but it is still a single file per repo, so anything worth keeping
past this session belongs in a skill or a commit message too, not only there.

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

## Every part must be followable as a sequence of actions

This is the trait that defines the genre, and it is the one thing this
project's owner corrected most sharply — the first draft of Part 1 explained
architecture beautifully and never told the reader to type anything. The
correction, verbatim in spirit: *blogs like this say `nest new media-forge`,
then the dependency install, then create this file — then open it and here is
what goes in it, and then you see the result.*

So each part must read as a chain a reader can actually walk:

1. **A command they run** (`nest new x`, `npm i a b`, `docker compose up -d db`)
   — with the working directory unambiguous.
2. **A file they create**, named in the code block's filename header, with
   the path relative to the project root.
3. **What goes in it**, and a sentence after the block on which line carried
   the point.
4. **What they should now see** — a server that boots, a table that exists, an
   error that appears on purpose.

Install only what the current part actually uses. A long dependency list in
Part 1 for packages first used in Part 3 breaks the chain — the reader is
typing on faith instead of following.

Architecture prose, diagrams, and the naive→fix beats below all sit *inside*
this chain. They are not a substitute for it. If a part contains no command
and no new file, it is an essay about the system, not a build article.

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
   enough to run every time, and it writes findings straight into
   `review-task.md` so nothing is lost between sessions.

A clean static pass is not the same as "done". In this series it came before
two further commits that fixed 21 runtime bugs and a set of frontend↔backend
integration bugs — none of which reading could have found. What a clean pass
buys is "no defect that reading can reach"; only building and running the
project buys more. Say it that way rather than the shorter, more flattering
version.

If the project owner's constraint is "no real project gets scaffolded, text
and listings only" (as it was here), say plainly that this means the series
is shipping unverified until someone actually builds it — that trade-off is
the owner's to accept, not yours to hide by asserting confidence a listing
alone cannot earn.

## Where the real project lives — decide this at design time

"No project gets scaffolded" holds only until the first session that actually
tries to run the code, and on this series that session found 21 runtime bugs
in one pass. So the plan should name the location up front rather than leaving
each session to invent one.

**The project goes under `~/Projects/Scratchpad/<slug>/`, never in a session's
own temporary scratchpad directory.** The per-session scratchpad is deleted
when the session ends; a later session then inherits a list of findings with
nothing to check them against, and the cheapest wrong move — re-reading the
article and calling that verification — is exactly what the writing process is
supposed to be protected from.

The shape already in use, follow it:

```
~/Projects/Scratchpad/media-forge/            # monolith, Part 1-3
~/Projects/Scratchpad/media-forge-services/   # microservices, Part 4
```

When a later part changes the architecture enough that the old tree no longer
represents what the text describes, open a **sibling** directory instead of
mutating the old one — the earlier parts still need something that matches
them. If the architecture arc above says the series will split, plan for two
directories from the start and write both paths into the plan.

These directories sit outside the repo and are never committed. The article
ships as text; the thing proving the text runs stays on disk, reproducible,
for whoever continues. `review-build-series` states the same rule for the
review side — keep the two in step.

## The procedure

Checkpoint after each step — do not produce the whole plan in one turn. Show
what was written, what's left, wait for a nod, continue. Write everything
into `design-task.md` at the repo root as you go (create it if it does not
exist), using the same sections the NestJS record uses so future sessions
read a familiar shape:

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
      not assume the same holds for a new series without asking). Whatever
      the answer, write the four publish locations into `design-task.md` so
      the later session does not have to rediscover them: a card in
      `blog/index.html`, an `a.learn-card` in the root `index.html`, the URLs
      in `sitemap.xml`, and entries in `blog/search-index.json` (7-key schema).
      Also fix the build directory now — `~/Projects/Scratchpad/<slug>/`, see
      "Where the real project lives" above — and write it into the plan, even
      if the owner's answer today is "no project gets built".
- [ ] Step 6 — Write the `## Các quyết định ĐÃ CHỐT` table and the
      `## Gotcha đã gặp` / `## Giọng văn` sections into `design-task.md`, seeded
      from this repo's existing entries (3-level-deep relative paths, chrome
      must be replaced fully not just `<head>`, Prism has no TypeScript by
      default — check `blog/prism.js` before using a new `language-x` for
      the first time, don't reason-explain-to-the-reader why a decision was
      made *editorially* — write for the reader, not to justify yourself to
      the person who assigned the piece)

Each step's output is a section of `design-task.md`, appended as it's
produced — not held in memory until the end.

## The mechanical gate

`CLAUDE.md` requires reading `check-lesson.md` before touching anything under
`blog/`, and every `part-N.html` must pass:

```bash
node check-lesson.js blog/build/<slug>/part-N.html
```

Run it, plus `npx prettier --write`, before calling any part finished. This is
not optional politeness — the highest-risk step in this workflow is cloning
the page chrome from the previous part, and `check-lesson.js` is what catches
the canonical URL, `og:url`, and hero title left pointing at part N-1. That
mistake has already happened here more than once, and it is invisible when
reading the prose.

One check it does **not** cover: the `article-related` chain. After adding a
part, the previous part's "next" link must stop being a `--locked` span and
become a real `href` — verify that by hand across every part.

## Output

Stop once the plan is written and confirmed, section by section, in
`design-task.md`. Actually writing Part 1's prose and code is a separate,
later job — offer it as the next step rather than continuing straight into
it in the same session, exactly as `design-new-series` does for lesson
series.
