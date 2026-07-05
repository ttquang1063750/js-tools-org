# Content Quality Contract

The bar every lesson must clear. This mirrors Part IV of `plan.md`. The point is
that each lesson is genuinely deep — **enough information, enough examples,
enough links, enough annotations** — not padded. A lesson is "done" only when it
meets every row below. Always sanity-check against a real deep page such as
`blog/c/c-data-structures.html` or `blog/cpp/cpp-move-semantics.html`: a new
lesson must not be shallower than those.

## 1. Per-lesson minimum rubric

| Item                   | Minimum                                              | Notes                                                               |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| Deep H2 sections       | ≥ 4 (foundational), ≥ 5 (core/capstone)              | Per the Part III breakdown; more is fine.                           |
| Body length            | ≥ 1,200 words Vietnamese                             | Single-language for new series (2026-07-03+). Depth, not filler.    |
| Runnable code examples | ≥ 4 `.code-window` blocks                            | Each core concept needs ≥1; see §2.                                 |
| Visualizer / diagram   | ≥ 1 interactive demo OR inline SVG/canvas diagram    | Capstone lessons require an interactive demo.                       |
| Callouts               | ≥ 3 (at least one `--pitfall`)                       | See §4.                                                             |
| Comparison table       | ≥ 1 when opposing concepts exist                     | e.g. merge vs rebase, Euler vs Verlet, INNER vs LEFT join.          |
| Internal cross-links   | ≥ 3 inline + prev/next + related block               | See §3 + the cross-link map.                                        |
| External references    | ≥ 3 (MDN / W3C-WHATWG spec / caniuse / source paper) | In an `.article-refs` block, new tab + `rel="noopener noreferrer"`. |
| Glossary coverage      | every new term wrapped in `<abbr>` on first use      | Full definitions live on the hub's glossary.                        |
| Quiz                   | ≥ 3 questions via `ide.js` + answer explanations     | The closing "Câu hỏi trắc nghiệm ôn tập" section.                   |
| Downloadable code      | ≥ 1 co-located file                                  | "Tải file code thực hành" link.                                     |

## 2. "Enough examples"

- Every abstract concept gets ≥1 **minimal, runnable** example in a
  `.code-window` (with `.code-filename`, copy button, Prism highlight).
- Error-prone topics get a paired **anti-pattern**: clearly label "❌ Sai" next
  to "✅ Đúng".
- Examples **escalate**: minimal → realistic → optimized. Don't jump straight to
  the complex version.
- For pure-JS-runnable lessons, add a `js-playground` so readers edit and run.
- Code must be **self-explanatory when read in isolation** — see §4 on comments.

## 3. "Enough links"

**Internal (required):** `prev`/`next` + `.article-related`, plus inline
cross-links right where a shared concept is mentioned. Link within the series and
to other series. Suggested cross-link map:

| From                    | Links to                                        | Shared concept                       |
| ----------------------- | ----------------------------------------------- | ------------------------------------ |
| WebGPU · Compute Shader | WASM · Threading; DSA · Pathfinding             | Parallelism / GPGPU                  |
| WASM · SIMD/Threading   | Canvas · Pixel; WebGL · Performance             | Pixel/vector optimization            |
| Toy JS Engine           | JS · Engine & Execution; JS · Scope             | Call stack, closures, AST            |
| DSA · Hash/B-Tree       | SQL · Index & Query Plan; C · Data Structures   | B-Tree, hashing                      |
| Web Audio · FFT         | Canvas · Data Visualization; WebGPU · Particles | Spectrum / reactive                  |
| CSS · Transform 3D      | WebGL · Coordinate & Math                       | Transformation matrices              |
| Git · Object Model      | C · Pointers; DSA · Huffman                     | DAG, content-addressing, compression |

Extend this map when adding a new series — wire it into the existing web.

**External (the upgrade over old series):** an `.article-refs` block with ≥3
reputable sources. Name the source (don't paste bare URLs). New tab +
`rel="noopener noreferrer"`.

## 4. "Enough annotations"

Five layers, so nothing is left unexplained:

1. **Code comments** — bilingual, on the meaningful lines. Pointers, variables,
   and algorithm steps must be explained. No "silent" code.
2. **Callout boxes** — `.callout` variants: `--note` (ℹ️ Lưu ý),
   `--tip` (💡 Mẹo), `--warning` (⚠️ Cảnh báo), `--pitfall` (🕳️ Cạm bẫy),
   `--deep` (🔬 Đào sâu). These are NEW components — see page-anatomy.md to add
   the CSS.
3. **`<abbr title="…">`** on jargon's first appearance.
4. **Glossary** (EN–VI) on the hub page.
5. **Formula glosses** — every KaTeX formula gets one sentence explaining each
   symbol.

## 5. Sequencing & simulator rules (2026-07-05, from the electronics-series review)

- **Dependency check:** a lesson only uses concepts from lower-numbered lessons
  (own series or a prerequisite series). Unavoidable forward references are
  black-boxed with a callout "sẽ học chi tiết ở Bài N". Demos only use
  components/ideas already taught.
- **Scaffold heavy math concrete → abstract:** solve a tiny instance by hand
  before generalizing (e.g. a 2-node circuit by KCL/KVL before the MNA matrix;
  one phase-lag example before complex impedance). Never open with the matrix.
- **Diagrams must match the concept:** a schematic / state diagram / timing
  diagram / block architecture satisfies the "≥1 diagram" row; a pinout drawing
  does not.
- **Simulators explain their "boring" states:** if a mode legitimately reads
  0 / OL / empty, say so on the UI so learners don't think the demo is broken;
  any visible control that isn't simulated gets an explicit limitation note.
- **Only real callout classes:** use the five variants that exist in `blog.css`
  (`--note/--tip/--warning/--pitfall/--deep`); never invent classes
  (`--danger` shipped once and silently had no styling).

## 6. Definition of Done (per lesson)

- [ ] Meets every row of the §1 rubric.
- [ ] Every H2 answers What / Why / When / Pitfall.
- [ ] `.article-refs` with ≥3 valid external links (new tab).
- [ ] ≥3 internal cross-links per the §3 map.
- [ ] ≥3 callouts; glossary/`<abbr>` for every new term.
- [ ] Formulas render via local KaTeX; comments widget is giscus.
- [ ] Side-by-side depth check against a reference lesson — not shallower.
