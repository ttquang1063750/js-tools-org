---
name: review-build-series
description: >-
  Read a "code thuc chien" (hands-on build) series under `blog/build/<du-an>/part-N.html`
  with the mindset of a complete newcomer, and write every gap found into
  `review-task.md` for a later session to verify and fix. This skill only
  reads and writes findings — it never edits the article's code, never
  installs anything, never runs Docker or a dev server. It looks for three
  kinds of defect: code that is used somewhere but never fully defined
  anywhere in the series, prose that is vague or drops a term/decision
  without explaining it, and code shown as disconnected fragments that do not
  actually fit together when combined. Distinct from `beginner-proof-series`,
  which is for the lesson-based, bilingual EN/VI series — this skill is only
  for the continuous, Vietnamese-only "code thuc chien" build format (no
  lessons, no quiz, no translation). Use whenever the user asks to review, rà
  soát, or audit a code-thực-chiến / build series for completeness, asks "làm
  theo bài này có chạy được không" without wanting code actually run yet, or
  after a part in such a series gets marked "ĐÃ VIẾT XONG" in design-task.md
  (or task.md, for a series predating the design-task.md/review-task.md split).
---

# Review a "code thực chiến" series as a first-time reader

## What this is for

A "code thực chiến" article (`blog/build/<dự-án>/part-N.html`) reads like a
long, continuous engineering write-up: prose, code blocks with a filename
header, more prose. It is not a lesson series — no quiz, no per-lesson
translation, no hub navigation. The author writes it the way a senior
engineer explains a system to a colleague, which means the same failure mode
recurs: **things that are obvious to the author are invisible gaps to anyone
following along for the first time.**

This skill is the read-only diagnostic pass. It finds three kinds of gap and
writes every one of them into `review-task.md`, with enough location detail
that whoever picks up the file next does not need to re-read the series to
find what you found.

**It never fixes anything, never runs anything.** No `npm install`, no
Docker, no dev server, no editing the article's HTML. A gap that turns out
to be a real bug still needs someone to build the project for real and watch
it fail — that is a separate, much more expensive pass (see "What this is
not" below). This skill's job ends at a clear, located, written-down finding.

## The three things to look for

Work through **every part, in order, start to finish, without skipping**.
Skimming for keyword hits misses exactly the kind of gap this skill exists to
catch — the value is in reading like someone who has never seen the material,
which means noticing the sentence where you would have gotten lost.

### 1. Code that is used but never fully defined

The single highest-value check, and the one a machine can mostly do for you.
A name shows up in an `import`, in a `this.x.method(...)` call, or as a
constructor parameter type — but no code block anywhere in the series
actually contains `export class X` / `export function X` / `export interface
X` for that name.

Run the extractor first so you are cross-referencing text, not memory:

```bash
python3 .claude/skills/review-build-series/extract-parts.py \
  blog/build/<dự-án> /tmp/review-<dự-án>
```

This produces four things:

- `partN.txt` — plain text, **read this fully**, it is the actual review.
- `partN-blocks.json` — every code block with its filename header, in order.
- `all-symbols.json` — per block: what it defines, and `is_full_definition`
  (does it declare anything at all, or is it a fragment of a class shown
  elsewhere).
- `references.json` — the reverse direction, and the starting point for
  check 1: every name the series **uses** (internal `import`,
  `this.x.method(...)`, `this.method(...)`, a typed class member) with
  `defined_somewhere` telling you whether any block ever writes it out.

The script prints the dangling names straight to stdout, so start there. Two
things it does deliberately, both of which matter for reading the output:

- **It filters out anything from `node_modules`.** Without that filter the
  NestJS series reported 104 candidates, almost all of them `Injectable`,
  `Column`, `Repository`. With it, 37 — and the real signal (`xadd`,
  `pushDelayed`, `chargeForJob`, `ChargeDto`) is visible instead of buried.
- **A call whose owner it could not resolve is tagged `method?`.** That means
  "I could not tell whose method this is" — check those by hand rather than
  trusting either answer.

It does **not** decide anything. A dangling name is a *place to read*, not a
bug: intentionally-omitted boilerplate and codegen output both land there.

**And it under-reports — do not treat a short list as an all-clear.** On the
NestJS series, a careful multi-agent reading pass found real check-1 defects
the script cannot reach by construction:

- A method **masked by a same-named method on another class**.
  `BillingClient.getBalance()` was never written, but `BalanceCache` has its
  own `getBalance()`, so the name looks defined. The script matches method
  names globally, not per class.
- A type used **only as a parameter or generic** (`(event: ProgressEvent)`),
  never imported and never a class member.
- A **bare function call** with no `this.` — `api('/jobs/active')`,
  `bootstrap()` — where the name is simply never imported.
- A code block that is **syntactically not a file at all** (three loose
  statements under a filename header). Nothing is "missing"; the shape is
  wrong.

Run the script to narrow where to look, then read anyway. The script is a
floor on what you find, never a ceiling.

If the script warns that some blocks have no `<span class="code-filename">`,
those blocks are **invisible** to every JSON file it produced — read them
directly in the HTML, and do not treat the extract as complete until you have.

For every code-filename header you see (`<span class="code-filename">`),
ask: is what follows a **complete, standalone file** (has its imports, its
class wrapper, everything needed to compile on its own), or a **fragment**
meant to be merged into a class shown elsewhere? Fragments are a legitimate,
common device in this genre — Part 1 showing a naive `charge()` and Part 1
showing the fixed version right after is not a bug, it is the article's own
before/after teaching pattern. The defect is specifically when:

- A name is **referenced** (imported, called, injected) somewhere, but
  `grep`ing `all-symbols.json` for an `export` of that exact name across
  **every part** returns nothing. This happened repeatedly in the
  NestJS series: `RedisService`, `MediaService`, `JobService`,
  `AuthController`, `findPlayable()` were all called from code the article
  gave in full, but none of them had ever been written out anywhere.
- A **free-standing function** uses `this.something` in its body — a bare
  `function foo() { this.bar() }` cannot work; `this` needs a bound method.
  This is a distinct, mechanical smell: grep for `function ` not preceded by
  `class` context and check whether its body references `this`.
- The **same filename** is shown in multiple separate blocks across the
  series (common for a service that grows a method per section) — mentally
  merge them and check the result actually compiles: same constructor
  parameters used consistently, no method calling a sibling method that was
  never added to the merged class, no property read before any block sets
  it.
- A relative import path's `../` count does not match how deep the file
  actually sits (count directory levels from the filename header itself,
  e.g. `src/common/rate-limit/x.ts` importing from `src/redis/` needs
  `../../redis`, not `../redis`).
- A config key (`ConfigService.get('X', ...)`) is read somewhere but the zod
  schema block shown never lists that key.
- A NestJS module (`@Module({...})`) is referenced by name (`imports:
  [FooModule]`) but no code block anywhere shows `FooModule`'s own contents —
  note this one honestly: almost every "code thực chiến" series will have
  *some* boilerplate modules never shown (the article shows the interesting
  ~20%, not 100% of NestJS wiring). Flag it as a finding, but say plainly in
  the finding that this may be intentional omission of boilerplate rather
  than a bug — do not claim certainty a script cannot give you.

### 2. Vague or unexplained

Adapted from the checklist `beginner-proof-series` uses for lesson content,
minus the parts that only apply to graded lessons (quizzes, translation).
These still apply fully to a build series:

1. **A term used before it is defined** — a technical noun that carries real
   weight (not "API", but something like "idempotency key" or "outbox
   pattern") appearing with no definition at its first use.
2. **Code with no lead-in** — a block appears with nothing before it saying
   what it demonstrates or why it matters right now.
3. **Code with no landing** — after a non-trivial block, nothing says what
   just happened or which line carried the point.
4. **A design decision stated with no reason** — this genre's whole premise
   is showing *why*, not just *what*. "We use a Lua script here" with no
   sentence on why three separate Redis calls would be wrong is a miss for
   this genre specifically, more than for an ordinary lesson.
5. **An unexplained number or output** — a benchmark, an error code, a
   measured value that is shown but never interpreted.
6. **A command that cannot be run as written** — a missing install step, a
   working directory that was never `cd`'d into, a package version that
   conflicts with something installed earlier in the same series. You are
   not running the command in this pass, but you can often tell just from
   reading: if a package is imported in one part and never appears in any
   `npm install` line anywhere in the series, that is a finding regardless
   of whether it would actually error (it might already be a transitive
   dependency — say so as a finding, not a confirmed bug).

### 3. Disconnected / discontinuous code

This is where a build series fails in a way a lesson series usually does
not: because code accumulates across parts (a class grows methods, a schema
grows fields), a **narrative discontinuity** is often also a **compile-time
discontinuity**. Two angles:

- **Within one file's fragments** (see check 1) — already covered above.
- **Across parts' design** — a decision made in an earlier part is silently
  assumed changed by a later part with no acknowledgment. The concrete
  pattern that actually happened in this series: Part 1's ERD for `users`
  never listed a `role` column, but Part 2's whole RBAC system reads
  `user.role` as if it always existed. Find these by tracking, per entity
  or config shape introduced early, whether every field a later part reads
  from it was actually in the original definition.
- **Frontend/backend split** — if the series has a frontend section (often
  near the end of a part, a small separate mini-project), check every
  endpoint URL, event name, and payload field the frontend code uses against
  what the backend code actually defines. This is a distinct, high-yield
  pass: read the frontend fragments *last*, after you already know the
  backend's real shape, and check named things like `/jobs/active`,
  `'job:done'`, `job.videoTitle` back against the backend text. A field the
  frontend displays that has no backing column anywhere is exactly the kind
  of gap that silent reading of the backend alone will not surface.

## Writing findings into `review-task.md`

One table, sorted by where the finding sits in the series (Part 1 → 4, top
to bottom within a part) — not grouped by category. A reader picking this up
wants to work through the series in order, not jump between categories.

```markdown
## Rà soát tĩnh — <tên series> (<ngày>, review-build-series, chưa chạy thật)

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 1 | Part 2, `src/media/stream.controller.ts` | Đứt mạch | `findPlayable()` được gọi nhưng không thấy định nghĩa ở bất kỳ đâu trong series | chưa xử lý |
| 2 | Part 3, mục 4.1 | Mơ hồ | Số `MAX_ATTEMPTS = 3` không giải thích vì sao là 3, không phải 5 | chưa xử lý |
```

The last column exists because this table is written **for a different
session**. Leave every row `chưa xử lý`; whoever acts on them fills in
`đã sửa` / `cố ý, không sửa` / `cần build thật mới biết` as they go, and the
table stays a usable worklist instead of turning back into prose.

Every row must say **where** (part + file or section heading, not just "Part
3") precisely enough that the next session does not re-read the whole part
to locate it, and must be a finding a human can act on without your having
run anything. If you are not sure whether something is a real bug or
intentional (the module-boilerplate case above is the most common), say so
in the "Mô tả" column instead of picking a confident-sounding wrong answer —
an honest "có thể cố ý, cần xác nhận" is worth more than a false positive
dressed up as certain.

Prepend the table with one line making the boundary explicit: **findings
here are from reading only — nothing has been built or run to confirm them.**
This matters because the project's `task.md` convention elsewhere
distinguishes "đo bằng công cụ thật" from unverified claims, and a static
reading pass must not blur into that language.

If `review-task.md` already has content from a previous pass, add a new
section rather than overwriting — do not delete another session's findings.

Write to `review-task.md` at the repo root, not `task.md`. This series used
to share a single `task.md` for design notes, review findings, and fix
history all at once — that overloading was itself a source of confusion (a
design decision and a review finding read the same way, so "is this settled
or still open" became ambiguous), and `task.md` is also the exact file
`beginner-proof-series`'s `make-task.py` overwrites wholesale for lesson
series. `review-task.md` is a dedicated file this skill owns, sidestepping
both problems. (A series predating this split may still have its review
history recorded inside a shared `task.md` — that's a historical record, not
a reason to write new findings there; start `review-task.md` going forward.)

## What this is not

This skill stops at "here is what a careful reading turns up." It
deliberately does **not**:

- Scaffold a project, run `npm install`, start Docker, or execute any code.
- Edit the article's HTML to fix anything it finds.
- Claim a finding is a confirmed bug — reading can show something is *used
  without being defined*, but only actually compiling and running the
  project proves it fails, and proves the fix works. That is a distinct,
  much heavier follow-up pass (build a real project from the series' code,
  run it against real Postgres/Redis/whatever the stack needs, fix what
  breaks, re-verify by running again) — do that only when asked, separately,
  and expect it to take substantially longer than this pass.

If asked mid-review whether something is "actually broken," the honest
answer at this stage is "reading says X is never defined — confirming it
requires building it, which this pass does not do."

## Where the build-for-real project must live

When that follow-up pass does happen — or any time a session writes code to
test what the article claims — **put the project under `~/Projects/Scratchpad/`,
never in the session's own temporary scratchpad directory.**

The per-session scratchpad is thrown away when the session ends. The next
session that picks up `review-task.md` then has a list of findings and no
project to check them against, so it either re-derives everything from zero
or, worse, "verifies" a fix by reading it again — which is exactly the thing
this skill exists to say is not verification.

The convention already in use for the NestJS series, follow the same shape:

```
~/Projects/Scratchpad/media-forge/            # monolith, Part 1-3
~/Projects/Scratchpad/media-forge-services/   # microservices, Part 4
~/Projects/Scratchpad/media-forge-web/        # frontend — SEPARATE project
```

**If the series has a frontend, it is a second project and it is not
optional.** This is the part that actually got skipped on the NestJS series:
two sessions built and ran the backend, while the React code was only ever
_read_ and simulated with `curl` and a bare `socket.io-client` script. The
result is a series where the backend is verified and the UI is not, which is
easy to misreport as "the project runs".

Reading the frontend catches contract mismatches — a field name, an endpoint,
an event name. It cannot catch the class of defect that only appears once a
browser renders it: a progress bar that never moves because the state update
does not re-render, a socket that reconnects in a loop, a player that shows
controls but cannot seek, a component that crashes on the first empty
response. Those need `npm create vite@latest`, `npm run dev`, and a real page
open against the running backend.

So: build it, run it, drive the actual flow end to end (log in, upload,
watch progress move, play the result), and only then say the series runs.

Name it `<slug-of-the-series>`, and when a later part changes the
architecture enough that the old tree no longer represents it, start a
sibling directory rather than mutating the old one — the earlier parts still
need something that matches what they describe.

Record the path in `review-task.md` next to the findings, and say plainly
which findings were confirmed by running that project and which are still
reading-only. A finding marked "đã sửa" with no project behind it is a claim,
not a result.

These directories are outside the repo and are never committed. That is the
point: the article ships as text, while the thing that proves the text runs
stays reproducible on disk for whoever continues.

## After the review

Report to the user: how many findings, roughly how they break down across
the three categories, and point at the `review-task.md` table. Do not editorialize
about which ones matter most — that is the next session's call, informed by
what they intend to do about it (some series stay draft-only for a long
time; not every gap needs fixing before anyone reads it).
