---
name: beginner-proof-series
description: >-
  Review an existing js-tools.org blog series with fresh beginner eyes and fix
  what blocks a newcomer: jargon introduced without explanation, code dropped
  with no lead-in, missing transitions between sections, and steps that assume
  knowledge the series has not taught yet. Also knows this repo's locale layout —
  Vietnamese at the root, English added under `/en/` — and how to measure whether
  a `data-lang-content` block is a real translation or an empty shell before
  touching it. Keeps every lesson complete in both locales: fix the Vietnamese,
  then ship the English translation in the same commit. Use this whenever the user
  asks to read a series "as a complete
  beginner", says a series is hard to follow / thiếu dẫn đề / khó hiểu / đột ngột
  đưa code, asks to explain terminology better, or asks to restructure a series
  for locales. Works lesson by lesson with one commit per lesson.
---

# Beginner-proof an existing series

## What this is for

An existing series is technically correct but unreadable for the audience it
targets. The author knows the material, so the gaps are invisible to them: a term
gets used three paragraphs before it is defined, a code block appears with no
sentence saying why we are about to read it, section 4 assumes something section
7 teaches.

This skill is the fix pass. It does **not** re-plan the syllabus (that is
`design-new-series`) and it does **not** add new measurements or lab work. It
makes the existing material land.

## Before touching anything

1. **Read `plan.md`** for the series' identity, syllabus and quality contract.
   The fix pass must not contradict the spec.
2. **Confirm the audience.** "Beginner" is relative: a beginner to _this series_
   may still be a senior engineer in another language. Find the series'
   prerequisite statement (usually on the hub page) and treat exactly that as
   known, nothing more.
3. **Agree the intervention depth with the user** before the first commit. Three
   levels, and they produce very different diffs:
   - _light_ — add lead-ins, define terms on first use, add connective sentences.
     Section order untouched.
   - _deep_ — may reorder sections and rewrite one when it assumes untaught
     knowledge. Lessons get noticeably longer.
   - _report only_ — list findings with locations, change nothing.
4. **Never assume the locale layout.** See "Locale layout for this repo" below.
   Getting this wrong breaks links that are already shared and indexed.
5. **Find where to resume** — see below. A series takes many sessions, so
   "which lesson is next" is a question you will be asked repeatedly.

## The handover rule — read this first

Two commands tell you everything you need to pick up someone else's work. Run
both **before** you start and **after** you finish. Do not audit by hand; that is
what these encode.

```bash
D=.claude/skills/beginner-proof-series
python3 $D/next-lesson.py blog/aie/aie-programming-series.html   # what is next
python3 $D/verify-series.py $D/series/aie                        # is what exists sound
```

`verify-series.py` checks thirteen invariants on every translated lesson and exits
non-zero if any fails. **Green means trust the state and continue** — you do not
need to re-read the finished lessons. Red prints the lesson, the check name and
the detail, so you start from the defect instead of from scratch.

Every check exists because that exact failure happened here, not because it
sounded plausible: code blocks drifting between locales, Vietnamese comments left
in the Vietnamese lesson, a diagram whose geometry diverged, `hreflang` pointing
at the wrong locale, a dead relative link, a next-link locked when its target
existed, a lesson missing from the search index, a hub card still advertising a
translated lesson as untranslated, a hub title that did not match the page's own
`<h1>`, a page with no template so it could not be rebuilt, chrome that drifted
between lessons, and a stray `$` that makes KaTeX swallow a sentence.

The checker is negative-tested: injecting a stray `$`, an altered code block, a
removed `hreflang`, or a Vietnamese comment each makes it fail with the right
check named. If you add a check, inject the fault and confirm it catches it — a
checker that only ever passes is worse than none, because it buys false
confidence.

**When you finish a lesson, leave the tree green.** That is the whole contract: the
next person runs two commands, sees green, and starts writing. Anything you cannot
make green, write into the commit message _and_ say plainly in your report, so it
is not discovered later as a surprise.

## Where to resume

Do not ask the user which lesson is next, and do not guess from the conversation.
Derive it from the repo:

```bash
python3 .claude/skills/beginner-proof-series/next-lesson.py blog/aie/aie-programming-series.html
```

It prints the syllabus with per-lesson status and names the next lesson, its
Vietnamese path, and the English path to create.

**The completion signal is the English twin existing.** A cycle only ends with the
lesson done in both locales (see "Shipping the English version"), so
`blog/<series>/en/<slug>.html` is present exactly when the lesson is finished.
Derive from files on disk rather than keeping a progress file — a progress file
goes stale the moment anyone edits outside the skill, and then it lies with
confidence.

**Lesson order comes from the hub, never from filenames.** Slugs sort
alphabetically, which has nothing to do with syllabus order. The script reads
whichever of the two numbering styles the hub uses — `<div class="lesson-number">01`
(sysdesign) or a `Bài 1:` title prefix (aie) — and it counts locked, unwritten
lessons so the total matches the syllabus.

If it cannot parse the hub it says so and stops rather than reporting zero
lessons; take the order from `plan.md` by hand in that case. If the hub links to a
Vietnamese file that does not exist it refuses to conclude and exits non-zero —
that is a dead link a reader can click, so report it instead of continuing past it.

Two things the script deliberately does **not** decide: whether an existing
English file is any good (it only checks existence), and whether the Vietnamese
lesson has already had its beginner-proof pass. If a lesson was translated before
this skill existed, check it by hand before treating it as done.

**Trust the script over the conversation.** In a long session the conversation's
picture of progress goes stale — after a context handover it can be several
lessons behind, and acting on it means redoing work that is already committed.
Run the script and read `git log` first, every time. It has already caught this
once: the conversation said lesson 4 was next when lessons 4 and 5 were both
committed and lesson 6 was the real next one.

## The tools in this folder

Everything needed to continue lives in this directory — nothing important is in a
scratch directory, because those are per-session and vanish.

```
next-lesson.py                    which lesson is next, derived from the repo
verify-series.py                  check all thirteen invariants, one command
derive-lesson-meta.py             make a meta file from an existing VI/EN pair
extract-body-template.py          recover a template from an already-shipped page
build-lesson-en.py                build one lesson's English page
build-hub-en.py                   build the series hub's English page
series/<series>/
  config.json                     paths and hub metadata for that series
  hub-body-en.html                the hub's English prose, with placeholders
  hub-script-map.json             translations for strings inside inline <script>
  hub-lessons-en.json             English title + description of every lesson
  lessons/
    <slug>.body-en.html           that lesson's English prose, with placeholders
    <slug>.meta-en.json           its title/description and chrome/tail swaps
    <slug>.svg-labels.json        translations for <text> labels in its diagrams
```

Build a lesson, then the hub (the hub must follow — see the note under
"Shipping the English version"):

```bash
D=.claude/skills/beginner-proof-series
python3 $D/build-lesson-en.py $D/series/aie <slug>
python3 $D/build-hub-en.py    $D/series/aie
npx prettier --write blog/aie/en/*.html
```

**The English page is generated, not hand-edited.** Fix the `.body-en.html`
template and rebuild; editing the built HTML directly means the next rebuild
silently reverts your fix. This has already happened once — a stray `$20` was
corrected in the built page only, and the next rebuild brought it back.

**Rebuilding is idempotent**: every translated lesson rebuilds to identical output
twice in a row. If a rebuild produces a diff you did not intend, the template and
the shipped page have drifted — reconcile before continuing.

**Never suppress the builder's output when verifying.** The builders fail loudly
and write nothing on failure, so `build ... >/dev/null 2>&1` followed by a diff
compares the old file against itself and reports success. That happened once: a
lesson was declared byte-identical when its build had actually errored out on a
missing diagram label. Check the exit status, or read the output.

Two things the builders refuse to do rather than guess, both learned the hard way:
they stop if a translated string count differs from the source (an unescaped
apostrophe in English possessives like `Meta's` silently truncates a JavaScript
string), and they stop if any diagram label or code placeholder is unaccounted
for. `build-hub-en.py` also compares structural block counts against the
Vietnamese hub, which is how a dropped 298-word section was caught.

## The seven things that block a beginner

Work through a lesson looking for these specifically. They are ordered by how
often they are the real problem.

1. **Term used before it is defined.** Grep the lesson for every technical noun,
   find its first occurrence, and check a definition precedes it. A term that
   carries the lesson deserves more than a parenthetical: give it a plain-language
   sentence, a concrete everyday analogy, and **at least two examples** — one
   where it applies and one where it does not. A single abstract definition is
   the most common failure and the least useful fix.
2. **Code with no lead-in.** Every code block needs a sentence before it that
   answers: what is this going to show me, and why now? Without that the reader
   parses syntax instead of following an idea.
3. **Code with no landing.** After a non-trivial block, say what just happened
   and which line carried the point. Long blocks also need inline comments on the
   two or three lines that matter — not on every line.
4. **Missing transition between sections.** Each H2 should open by connecting to
   what came before. A lesson that reads as a list of disconnected topics is
   usually missing one sentence per section, not more content.
5. **Untaught prerequisite.** A step that silently needs knowledge from a later
   lesson, or from outside the series. Either teach the minimum inline, or link
   to where it is taught and say what the reader needs from it.
6. **Unexplained output or number.** A printed result, benchmark figure or
   diagram value that is never interpreted. Say what the reader should conclude.
7. **Command that cannot be run as written.** Missing install step, missing
   working directory, an API key or model name that does not exist, a
   copy-pasteable block that fails on first try. Verify anything cheap to verify.

## Per-lesson workflow

Do exactly one lesson per cycle, and commit before moving on. The user reads the
result between lessons, so a big batch defeats the point.

1. **Read the whole lesson start to finish**, in order, without jumping. The
   goal is to notice the moment you would have got lost. Do not skim to find
   pattern matches — the value here is sequential reading.
2. **Write down findings with locations** before editing. If the list is empty,
   say so and move on; not every lesson needs work.
3. **Apply the fixes** at the agreed depth.
4. **Verify** — see the checks below.
5. **Report to the user**: what you found, what you changed, and anything you
   deliberately left alone. Then wait or continue per their instruction.
6. **Rebuild the hub and leave the tree green** — `build-hub-en.py`, then
   `verify-series.py`. A lesson is not finished while the checker is red.
7. **Commit** with the lesson name in the subject and the findings in the body.
   Write down anything you deliberately left undone; the next person should learn
   it from the commit, not by rediscovering it.

## Verification (every lesson, before commit)

```bash
node check-lesson.js <path-to-lesson>          # must pass clean
npx prettier --check <path-to-lesson>
```

Then confirm structure did not regress. Reading time in the hero must match the
new word count (roughly words ÷ 170):

```bash
python3 - <<'PY'
import re, html
s = open('<path>', encoding='utf-8').read()
body = s[s.index('class="article-body"'):s.index('</main>')]
b = re.sub(r'<pre>.*?</pre>', '', body, flags=re.S)
b = re.sub(r'<svg.*?</svg>', '', b, flags=re.S)
b = re.sub(r'<div class="article-related".*', '', b, flags=re.S)
w = len(html.unescape(re.sub(r'<[^>]+>', ' ', b)).split())
print('prose words', w, '· reading time', round(w / 170), 'min')
PY
```

Known traps in this repo, all of which the validator will catch **after** they
have wasted a round-trip — so avoid them while writing:

- `<-` inside a code block parses as an HTML tag. Use `←`.
- Backticks inside SVG `<text>` trip the raw-markdown check. Use quotes.
- `<PLACEHOLDER>` in a code block must be escaped as `&lt;PLACEHOLDER&gt;`.
- Never `\"` inside `onclick="..."` — use `&quot;`, or prettier breaks.
- KaTeX `\text{}` must stay ASCII; Vietnamese diacritics corrupt the glyphs.
- **No bare `$` in prose** on a KaTeX page — write "20 dollars", not "$20". The
  validator does not catch it, and a second stray `$`later in the page lets
KaTeX swallow everything between the two. Check with`innerText.match(/\$/g)`
  in the browser: after rendering, the count must be **0**.
- **Keep code lines ≤ 91 characters.** That is the established width across this
  series, and long lines force horizontal scrolling inside the code block. Check
  every block, not just the ones you wrote.
- Only callout variants that exist in `blog.css`: `--note`, `--tip`, `--warning`,
  `--pitfall`, `--deep`.

Two measurements the headless preview pane reports **wrong**, so do not trust
them: `document.documentElement.clientWidth` and `window.innerWidth` both come
back as `0`, which makes every element look like it overflows the page. To judge
horizontal overflow, read the computed styles instead — in this repo `pre` is
`overflow-x: auto` and `.code-window` is `overflow-x: hidden`, so wide code
cannot push the page. Scrolling with `window.scrollTo` also appears to fail
because `scroll-behavior: smooth` is set globally; pass `behavior: 'instant'` or
read `scrollY` on a later call.

## Locale layout for this repo

Decided 2026-08-04 after measuring what actually exists. Do not re-litigate it
without new numbers.

```
/                        Vietnamese (default) — already indexed and shared
/en/                     English, added page by page as it gets written
blog/<series>/*.html     Vietnamese lessons — stay where they are
blog/<series>/en/*.html  English lessons, when they exist
```

**Chrome is switched at runtime, content is switched by URL.** `i18n.js` holds
474 EN+VI keys for nav, footer and the homepage; that keeps working and needs no
change — it is boilerplate, so serving both languages from one URL costs nothing
in SEO. Article bodies are the opposite: one URL cannot rank in two languages,
cannot be shared in a chosen language, and ships twice the text.

Why Vietnamese stays at the root, even though English is the eventual default:
every existing article is Vietnamese. Measured across the 122 lesson pages that
carried `data-lang-content`, the English blocks held a **median 4%** of the
Vietnamese word count — they were "this article is only available in Vietnamese"
disclaimers plus titles, not translations. Making English the root would point
every `canonical` at a page with no content and break links that are already
indexed. Flipping the default later is one `_redirects` rule; flipping it now
costs the whole site's SEO.

**`data-lang-content` is retired for lesson content.** It was removed from all
122 lesson and hub pages. It survives only on the 11 genuinely bilingual pages —
`blog/index.html` and the tool/marketing articles — where EN/VI ratios run
0.56–0.77, i.e. real translations. Never strip those.

If a series ever gets English lessons, add them under `blog/<series>/en/`, set
`canonical`/`og:url`/JSON-LD `url` to that path, add `hreflang` pairs on both
sides, and make the language toggle navigate between the two URLs rather than
swapping text — otherwise the reader gets English chrome over a Vietnamese body.

Before touching locale paths, always measure first:

```bash
python3 - <<'EOF'
import re, html, glob
for f in sorted(glob.glob('blog/*/*.html')):
    s = open(f, encoding='utf-8').read()
    if 'data-lang-content' not in s: continue
    def w(l):
        return sum(len(html.unescape(re.sub(r'<[^>]+>', ' ', m)).split())
                   for m in re.findall(r'data-lang-content="'+l+r'"(.*?)(?=data-lang-content=|</main>)', s, re.S))
    en, vi = w('en'), w('vi')
    print(f'{f:52} EN={en:5} VI={vi:5} ratio={en/max(vi,1):.2f}')
EOF
```

A ratio under ~0.4 means the English is a shell and can be removed. Above that it
is a real translation — leave it alone.

### Verifying a bulk edit across many files

`check-lesson.js` reports failures **with line numbers**, and any edit that adds
or removes lines shifts every number below it. Comparing raw output before and
after will show dozens of false regressions. Strip the `[Dòng N]` part and
compare failure _types and counts_ per file instead. Also capture the baseline
first: in this repo 41 of the 122 pages already failed before the edit, so
"does it pass" is the wrong question — "did I make it worse" is the right one.

## Code is locale-neutral — comments are always English

**A code block is identical in every locale.** Do not translate code, and do not
keep two versions of it. Only the prose around it changes language.

**Every comment inside code is written in English**, including in the Vietnamese
lesson. Reasons, in order of weight:

1. One code block serves both locales, so there is exactly one thing to maintain.
   Two copies drift, and the drift is invisible until a reader hits it.
2. Code the reader will paste into a real project should look like the code they
   will meet in real projects, in issues, and in library sources.
3. Vietnamese comments force a choice between diacritics — which corrupt in some
   terminals and in KaTeX — and diacritic-less Vietnamese, which is harder to read
   than plain English.

This applies to co-located sample files too (`*.py`, `*.js` next to the lesson):
their comments are English, and they are shared by both locales rather than
duplicated per language.

Identifiers stay English as well — `def clean_text(text)`, not
`def lam_sach(van_ban)`.

**Status and log strings the program prints are English too.** This follows from
the block being shared: a Vietnamese `print("Bat dau xu ly...")` would appear
verbatim in the English lesson. The one exception is **sample data** — if the
example cleans Vietnamese user feedback, that feedback stays Vietnamese, because
the data _is_ the subject of the example and it demonstrates the encoding point.
Distinguish the two: `print("--- Starting pipeline ---")` is a status message and
becomes English; `{"comment": "  San pham rat TOT  "}` is data and stays.

## Shipping the English version of a lesson

Each cycle ends with the lesson complete in **both** locales, in one commit:
fix the Vietnamese, then translate. Never leave a fixed lesson untranslated and
move on — that is how a half-translated series accumulates.

Paths, for a lesson at `blog/<series>/<slug>.html` whose English twin lives at
`blog/<series>/en/<slug>.html`:

- **Relative depth goes one level deeper.** `../../assets/` → `../../../assets/`,
  `../blog.css` → `../../blog.css`, `../prism.js` → `../../prism.js`. Missing this
  strips the page of all styling — check it in the browser, not by eye.
- **Co-located code samples are not duplicated.** A download link becomes
  `../data_cleaner.py`, pointing back at the single shared file.
- **`canonical`, `og:url` and JSON-LD `url`** all point at the `/en/` path and must
  agree with each other; `check-lesson.js` only verifies the URL _ends with_ the
  file's slug, so a wrong directory passes the validator — verify it yourself.
- **`hreflang` on both pages**, each naming itself and its twin, plus
  `x-default` on the Vietnamese one.
- **A visible locale link in the hero** ("Read in Vietnamese" / "Đọc bản tiếng
  Việt"). This works with JavaScript disabled, unlike the runtime chrome toggle,
  and it is what a reader who landed on the wrong language actually needs.
- **Cross-lesson links resolve inside the same locale.** The `next` link must be a
  `--locked` span until that lesson's English twin exists — a live href to a
  missing page is worse than an honest "coming soon".
- **Register the new page** in `sitemap.xml` and `blog/search-index.json`. Check
  whether the series hub itself has an entry in the search index — the AIE hub was
  missing one while nine other series hubs had theirs.
- **Rebuild the translated hub.** Its lesson cards encode which lessons have an
  English version, so every lesson that lands makes the hub stale: it keeps
  advertising the new lesson as untranslated. This was missed for two consecutive
  lessons before anyone noticed. Rebuilding also re-runs the guard that the hub's
  card title matches the page's actual `<h1>` — they had already drifted once.

The series hub is not a lesson and is translated separately. Until it is, English
lessons link back to the Vietnamese hub; say so rather than leaving it silent.

## What not to do

- Do not rewrite a lesson that is merely dense. Dense is fine if it is
  explained; the target is _unexplained_.
- Do not add filler. A transition is one sentence, not a paragraph restating the
  previous section.
- Do not soften a correct technical claim to make it easier. Explain it instead.
- Do not touch measured numbers, benchmark tables or lab output. If a number
  looks wrong, report it — do not silently adjust it.
- Do not batch lessons. One lesson, one commit, one report.

## When the lesson promises something it never delivers

Check the summary's "what you achieved" bullets against what the lesson actually
teaches, and check the title against the body. A lesson that tells the reader they
learned something it never covered is worse than a lesson that simply omits it —
the reader concludes they failed to understand.

When you find a gap, the title and the series' cross-references are the spec, not
the body. Search the whole series for the missing topic before deciding: if the
hub, the roadmap diagram and neighbouring lessons all point at this lesson for it,
then the content is missing and should be written. Only if nothing else references
it should you consider trimming the promise instead. Say which way you went and
why.

Verify code you add by running it, and pin the library version in the text when
behaviour depends on it — install the old version and check rather than asserting
from memory. Two versions of the same library can differ in whether they warn at
all, which changes the advice you should give.
