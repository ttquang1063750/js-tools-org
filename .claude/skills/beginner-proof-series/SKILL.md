---
name: beginner-proof-series
description: >-
  Review an existing js-tools.org blog series with fresh beginner eyes and fix
  what blocks a newcomer: jargon introduced without explanation, code dropped
  with no lead-in, missing transitions between sections, and steps that assume
  knowledge the series has not taught yet. Also knows this repo's locale layout —
  Vietnamese at the root, English added under `/en/` — and how to measure whether
  a `data-lang-content` block is a real translation or an empty shell before
  touching it. Use this whenever the user asks to read a series "as a complete
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
6. **Commit** with the lesson name in the subject and the findings in the body.

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
- Only callout variants that exist in `blog.css`: `--note`, `--tip`, `--warning`,
  `--pitfall`, `--deep`.

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

## What not to do

- Do not rewrite a lesson that is merely dense. Dense is fine if it is
  explained; the target is _unexplained_.
- Do not add filler. A transition is one sentence, not a paragraph restating the
  previous section.
- Do not soften a correct technical claim to make it easier. Explain it instead.
- Do not touch measured numbers, benchmark tables or lab output. If a number
  looks wrong, report it — do not silently adjust it.
- Do not batch lessons. One lesson, one commit, one report.
