# 03 — Verdict and implementation spec

**Phase 2 of the design gauntlet, closing document. Written by the design judge, who built none
of the three mockups.**

Inputs read in full: `mockups/inspiration-board.html` (phase 1, the encoding law),
`mockups/phase2/00-references.md`, `01-system-map.md`, `02-comprehension.md`, all three mockups
(`mockup-instrument-row.html`, `mockup-answer-first.html`, `mockup-ladder.html`) and their pitches,
`research/forensic/07-ux.md`, and the live tree (`index.html`, `lab.js`, `lab.css`,
`scripts/stamp.js`, `scripts/lib/release-gate.js`, `tests/public-labels.test.js`,
`data/latest.json`, `data/editorial.json`).

---

## 0. Method, and the honesty ledger for this pass

I did not take the mockups' self-reports on trust. Three things I verified myself:

1. **I rendered all three mockups in a real browser** (Chrome, 1280×1000, served from
   `mockups/phase2/`) and scrolled each product surface. Judgements below about visual weight,
   reading order and where the eye lands are from those renders, not from the source.
2. **I executed the live page in a browser** (`index.html` served from the repo root) and read the
   CSSOM and the rendered DOM.
3. **I read the marker regexes out of `scripts/stamp.js` and the assertions out of
   `release-gate.js` and `tests/public-labels.test.js`** rather than quoting `01-system-map.md`.

Three findings from that, all new to this document:

**(a) `01-system-map.md` §3.5's CSS defect is CONFIRMED, not "high-confidence-but-unconfirmed".**
In the browser, `[...document.styleSheets]` for `lab.css` contains **no `.hero` rule at all**
(`heroRuleFound: false` across 499 rules), and `.hero` computes `padding-top: 74px`,
`padding-bottom: 74px`, `position: static`. The orphaned declaration block at `lab.css:174–178`
does swallow `.hero{`, exactly as the spec'd CSS error-recovery path predicts. **The hero has
~74px of dead space above the score and no `position:relative`, live, today.** That is a
one-line fix and it is in this spec.

**(b) Both CRITICAL defects re-confirmed by execution, in a browser, against the live payload.**
Rendered `.pk-can .nm` = `["Gas Prices","Inflation","Unemployment","Financial Conditions"]` —
4 + 2 + 2 + 0 = **8 of 26 ounces, one card at zero**. Rendered `.pk-lrow` for housing, credit and
auto = `▲0` with inline `color: var(--amber)` on all three — **18 of 26 ounces rendering as an
up-arrow in the warning colour for lines that did not move.** `02-comprehension.md` §1.4's
FALSE REPEAT 2 is real and I have now seen it painted.

**(c) An undocumented constraint that binds the ledger refactor.** `tests/public-labels.test.js:45`
asserts `assert.match(index, /const amount=x\.contributesToOoze\?.*:'AUX'/)` — it greps the
**JavaScript source text** of `index.html` for that exact expression on one line. Any refactor that
renames `amount`, splits the ternary across lines, or moves the ledger renderer into `lab.js`
**fails `node --test` in the cron's first step, before collection runs.** This is the least
discoverable constraint in the system and it is not in `stamp.js`. It is written into §5.3 below.

**What I could not do.** I did not run the five-stranger comprehension protocol from
`02-comprehension.md` §1.5. Every comprehension score in §2 is analytic against that document's own
five-clause rubric, scored by me from browser renders. That is a weaker instrument than the
empirical protocol and I am labelling it as such rather than dressing it up. **The protocol should
be run before and after the build; my ranking is a design argument, not evidence.**

I fetched no external source in this pass and cite none. Where a mockup cites EPA AQI, the Particle
Data Group, 15 U.S.C. 1681g, NOAA NHC or NN/g, I am relying on `00-references.md`'s access ledger,
which opened those sources. Dribbble remains unreachable to a fetcher and no Dribbble reference
appears anywhere in this document.

---

## 1. The one-paragraph verdict

**The spine is THE LADDER.** It is the only direction whose organising principle is *the reader's
question order*, which is precisely what the two failing scores measure; it is the only one that
obeys phase 1's metric-equality rejection in the attribution slot; it is the only one that keeps the
jar and the product's identity while fixing everything; and it is the only one whose build sequence
degrades safely, because rungs 1–3 ship on data that already exists and rungs 4–5 sit behind a
pipeline that does not. **Six specific elements are grafted onto it** — four from The Instrument
Row, two from Answer First — and **three of the Ladder's own devices are cut**. The single most
valuable idea produced by the entire gauntlet is The Instrument Row's closing TOTAL row, which makes
the `Math.abs(delta)` defect *arithmetically impossible to ship* rather than merely discouraged;
that graft is non-negotiable. Answer First loses on one clause and one clause only, but it is the
clause the product cannot afford: it demotes the reading, and the reading is the site's only 2/2.

---

## 2. Scorecard

### 2.1 Against the encoding law

Phase 1 Family D plus `00-references.md`'s L1–L9. Scored pass / partial / fail.

| Law | Instrument Row | Answer First | Ladder |
|---|---|---|---|
| **L1** two type ranks, never three | **Partial.** Rendered, it carries three: display verdict, a sans reading face for `story`, mono for the table. Its own memo claims two. | **Pass.** One face, ranked by size. The cleanest execution of L1 in the set. | **Partial.** Display headings + mono prose + mono tables, but emoji on the featured rows are a de-facto third rank. |
| **L2** ranked by contribution, never movement | Pass | Pass | Pass |
| **L3** cap at four, ordered by effect | **Overruled, on the record.** Seven rows. Argument is good and I partly accept it — see §3.2. | **Overruled.** All seven at full rank. | **Pass.** Four rows + a named remainder line. |
| **L4** mark in a non-score slot | **Best in set.** A permanent gutter *column*. | Pass | Pass |
| **L5** quiet designed first, loud is an addition | **Best in set.** Machine-run diff, seven text-and-class changes, zero structural. | Pass — Appendix A diffs it cleanly. | Pass, and honest: it discloses the one component (the evidence dump) that differs in presence. |
| **L6** empty = a sentence in the content slot | Pass | Pass | Pass |
| **L7** the no-interaction surface passes standalone | Pass | **Partial.** "How bad" requires finding a right-rail plate. | **Pass, and it is built to this test.** |
| **L8** nothing the majority needs behind disclosure | Pass | Pass | Pass |
| **L9** colour tokens; `--ward` reserved | Pass — declared, referenced zero times. | Pass — declared, referenced zero times. | **Pass.** One use, on the literal words "Ward M" in the footer firewall sentence. That is the reservation being honoured, not breached. |
| **Phase 1 D2** hue never the sole carrier; luminance | Pass | Pass | Pass |
| **Phase 1 D4** the metric-equality rejection | **Weakest point.** Seven rows differentiated only by position and one numeral is close to the dark-dashboard failure the board explicitly rejected. | **Partial.** Seven rows at full rank, same objection, mitigated by the lede. | **Pass.** Four rows, accent-weighted numeral, plus the ounce bar. |

### 2.2 Against the four live scores

**30-second comprehension** (currently 3.5/10). Scored against `02-comprehension.md` §1.2's own
five-clause rubric — A subject, B reading + placement, C direction, D heaviest, E relief — two
points each. Analytic, from browser renders.

| | A | B | C | D | E | Total | Time to first correct fact |
|---|---|---|---|---|---|---|---|
| Instrument Row | 2 | 2 | 2 | **1.5** | 2 | **9.5** | Slow. The composition is a paragraph over a grey table; nothing catches the eye in the first five seconds. Housing is row 1 but nothing makes it *look* heaviest. |
| Answer First | 2 | **1** | 1.5 | 2 | 2 | **8.5** | Slowest. The first thing on the page is 396 characters. On a 360px phone the reading is ~11 lines down. |
| Ladder | 2 | 2 | 2 | 2 | 2 | **10** | Fastest. The 26-tick ounce bar answers "what is 26 made of" pre-attentively, before any reading happens. |

The ounce bar is the single most effective three-second device produced by this phase. It is
26 marks, one per ounce, segmented and labelled `Housing 7 / Credit 6 / Auto 5 / Gas 4 /
3 lighter · 4`. It has no axis, no scale to misread and no interpolation, so it survives The
Instrument Row's "no chart" objection on the merits, and it delivers clause D before the reader has
parsed a single word.

**Explanation** (currently 4.5/10). All three render `EDITORIAL.story` verbatim through
`resolveClaims()`, so the CRITICAL is fixed three times over. The differentiator is *position*:

- **Answer First** gives it maximum rank and maximum risk. Its own Appendix D is right — `story`
  is FK grade 9.0 / Fog 13.2, and it displaces a grade-4.5 sentence that is the site's best
  comprehension asset. Worse, the layout has **no fallback composition**: in a month where the
  generator's `story` opens with something trivial, this design puts the trivial thing at 1.46rem.
  Shipping the layout before the generator constraint exists is shipping a loaded gun, and the
  author says so.
- **Instrument Row** makes it the lede of the composition module — the most *integrated* of the
  three, because the paragraph and the table state the same fact in the two ranks the law allows.
- **Ladder** puts it under a heading that is the reader's actual next question — *What changed?* —
  after composition has already answered *What's driving it?*. That ordering is the strongest
  explanation architecture in the set, and it is the only one that still works in a month where
  `story` is weak, because rung 2 has already carried the explanation on its own.

**The two CRITICAL defects.** All three fix both. But only one fixes defect #2 *durably*: The
Instrument Row's closing `7 weighted lines | 26 oz | = the reading above` row. A list sorted by
`Math.abs(delta)` cannot sum to the printed reading. That converts a code-review discipline into an
arithmetic invariant a test can assert. It is the best single idea in the gauntlet.

**The empty state.** All three are dignified and all three refuse the green tick, for the same
correct reason (a ✅ is a lie of scope and overloads `--green`, which already means *stress fell*).
The copy is near-identical across all three because all three lifted it from
`02-comprehension.md` §4.2. So the empty state is effectively *decided* and the only real
differentiator is **permanence of the mark**: The Instrument Row's gutter carries a glyph on every
row in every month, so a reader learns what `≠` means during the eleven months it never fires. That
is the insight that makes a rare state legible when it arrives, and neither of the others has it.

**More trustworthy, not just prettier.** All three pass; none reads as marketing. Their failure
modes differ: Answer First risks reading as a blog, the Ladder risks reading as a worksheet, the
Instrument Row risks reading as a log dump. Of those three, the log dump is the least damaging to
trust and **the most damaging to comprehension**, which is the score we are trying to move.

### 2.3 The honest case for each loser, stated before I dismiss them

**Instrument Row.** Its author's stated biggest risk is the right one and I am upholding it: *"I
cannot prove from a mockup that the rows get READ."* Rendered, the module is seven rows of small
monospace with two hairlines. It is beautiful, it is rigorous, and it asks for attention before it
gives any. It also deletes the jar entirely — its own risk note admits "the site is called
OOZEMeter and there is no ooze on my page." That is not discipline, that is a separate product.

**Answer First.** It is the only direction that took the brief's framing at face value — the
explanation gap is a rendering gap, so render the explanation loudest — and it executes L1 more
cleanly than either rival. If the empirical protocol comes back saying strangers read before they
scan, this ranking inverts. But it bets the page on a generated paragraph nobody controls, and it
demotes clause B, and clause B is the only thing the current site does perfectly.

---

## 3. The synthesis

### 3.1 What is grafted onto the Ladder, and why

**G1 — the closing TOTAL row and the fraction sweep.** *From The Instrument Row.*
The Ladder's rung-5 nine-line ledger has no total. Add a closing row:
`7 weighted lines · 26 oz · = the reading above · down 1 point`, above the two auxiliary sensors and
below a rule. **Why:** it makes a wrong sort arithmetically impossible, gives the engineer a
testable invariant (`sum(contrib where weighted) === ooze`, which `lab.js:593` already asserts in a
console.assert and which should become a real test), and it teaches the unit for free. This is the
graft I would fight hardest for.

**G2 — the permanent gutter column, and `≠` rather than `▲`.** *From The Instrument Row.*
The Ladder marks state only inside the rung-4 roster. Promote the gutter to a permanent first column
on every line row in the featured block, the ledger, and the roster, carrying `·` in every quiet
month. **Why:** a mark that only exists when it fires is unreadable when it fires; the gloss must be
learned in the quiet months. And `≠` over `▲` because the same page prints `▼ eased 3 points` four
inches away — a triangle in a gutter beside a direction word is a collision. The Instrument Row's
departure note is correct and the Ladder's `▲` is wrong.

**G3 — three typographically distinct zeros, disambiguated by position.** *From The Instrument Row.*
`financial` is weighted and rounds to 0 (mark `†`, stays *inside* the sum, above the total rule);
`foreclosures` and `manufacturing` carry zero weight by design (mark `*`, printed *below* the total
rule where they cannot be mistaken for part of the sum). **Why:** the Ladder disambiguates these in
a sentence; position is stronger than a sentence and survives being screenshotted. Today all three
render identically in five places (`01-system-map.md` §5.3).

**G4 — the standfirst.** *From The Instrument Row.* Three lines under the kicker:
*"A 0–100 reading of money pressure on United States households. One reading a month, built from
seven public series. We measure. We don't forecast."* **Why:** it is the best clause-A delivery
produced by the phase — better than a kicker alone, because it also delivers cadence and the
standing rule in the same breath. `grep -c 'household' index.html` returns 0 today. This costs three
lines and closes the largest single comprehension hole on the site.

**G5 — the figure-provenance strip, demoted and moved.** *From Answer First.* Its "EVERY FIGURE IN
THAT PARAGRAPH" block is the best provenance device in the set: every figure the lede names, with
publisher, series ID and `asOf`. But rendered, it sits between the answer and the composition as
five rows of chrome. **Graft it as a closed `<details>` at the foot of rung 3**, labelled
*"Where each figure in that paragraph comes from"*. **Why:** it delivers checkable-claims without
spending the comprehension budget, and it satisfies L8 because nothing above it depends on opening
it.

**G6 — the printed denominator, made a rule.** *From Answer First.* Every ounce figure everywhere
on the page renders as `7 of 26`, never `7 oz` alone. The Ladder already does this in rungs 2 and 5;
make it a hard rule that also binds the share card, the ledger and any future surface. **Why:**
`02-comprehension.md` §2.3 is right that the denominator is not decoration — it is the glossing
clause that makes "ounces" self-teaching to a reader who has never met the unit.

### 3.2 What is cut from the winning spine

**C1 — kill the numbered circles 1–5 and the `ALWAYS VISIBLE` / `ONE CLICK` labels.**
The Ladder's own risk note calls this correctly: it is the information architecture leaking into the
product, no newspaper numbers its paragraphs, and a first-timer who sees "5" concludes there are
five things they are supposed to do. **Keep the spine** — the unbroken left hairline is doing the
"one object with a visible bottom" work and it is the anti-wall device that actually earns its
pixels. **Keep the question headings** — *What's driving it? / What changed? / What doesn't add up?*
are the reader's own words and they are the direction's real contribution. Drop the numerals and
drop the disclosure labels. The heading alone tells a reader what the section is; the numeral tells
them only that a designer counted.

**C2 — kill the emoji on the featured rows; keep them in the ledger.**
The Instrument Row is right that per-line icons introduce a third visual rank and do not survive
plain-text degradation — and rung 2 is the block whose entire job is to be read in three seconds, so
it must not carry a competing rank. But the rung-5 ledger is a nine-row scan where `INDICATORS[].emoji`
already ships and already helps. **Rule: emoji in the ledger, not on the featured rows, not in the
roster.**

**C3 — do not render the household paragraph yet.** All three mockups flagged it; two withheld it;
the Ladder rendered it with an in-place `[disputed]` mark. The mark is the right *design* — it is
the Wikipedia `[contradictory]` / PDG scale-factor pattern and it is the best answer anyone has
given to "how do you publish a sentence you don't fully trust". But it depends on a cross-check
engine that does not exist, and the paragraph contains a live falsehood today
(*"steady employment kept paychecks coming"*, `07-ux.md` §1). **Withhold the paragraph; keep the
mark in the spec for when rung 4 lands.**

This ruling also **dissolves the Ladder's own worst risk.** Its author wrote that "rung 3 is unsafe
without rung 4, and rung 4 does not exist" — that if rung 4 slips, the design ships a live falsehood
more prominently than today. That is only true of the *household paragraph*. `EDITORIAL.story` is
safe on its own: I read it clause by clause and it contains no employment claim at all. Splitting
the two decouples the sequencing risk entirely, and it is why this direction can ship rungs 1–3 next
week without waiting on a pipeline.

### 3.3 What is not adopted from the losing directions, and why

- **Answer First's demotion of the reading.** Clause B is the site's only genuine 2/2 and the
  returning visitor is most of the traffic. Not adopted.
- **Answer First's tinted-and-underlined figures inside the lede.** Rendered, five underlined green
  phrases in one paragraph read as five links that are not links — a false affordance, and visual
  noise at exactly the moment the reader is trying to parse a sentence. The provenance goal is
  better served by G5. Not adopted.
- **The Instrument Row's deletion of the jar, the boot sequence, and the count-up.** The jar stays
  (see §5.8). The boot sequence and count-up are separate decisions with their own defects and are
  handled in §5.2 and §6 rather than silently deleted here.
- **The Instrument Row's seven-row featured block.** The argument — that four rows come to 22 of 26
  and need a nameless "remaining 4 oz" line — is good, and it wins *for the ledger*, where the sum
  must close. It loses *for the featured block*, where phase 1's metric-equality rejection and
  L3's four-item cap both bind. These are two different modules and the synthesis takes both
  answers: **four in the featured block, all nine in the ledger, the ledger's seven weighted lines
  footing to 26.** The Instrument Row's own risk note concedes this is available ("the fix is four
  rows plus a remainder line, and the table already supports it").
- **The Instrument Row's tie-break by underlying stress, stated only in the designer memo.** On a
  tie month (`inflation` 2 and `jobs` 2 today) the published order looks arbitrary to exactly the
  checkable-claims reader this product is built for. §5.4 makes the tie-break explicit, deterministic
  and *printed*.

### 3.4 Three things all three mockups got wrong or did not cover

1. **None of them engages the stamp.js marker contract structurally.** All three flagged the
   `resolveClaims()` hazard — correctly, and it is the most important build note in the phase — but
   none reproduces `id="heroTheme" data-level="2"`, `class="specimen-line cine c5">…<b>…</b>…<`,
   `id="plcSealed"`, or the `.sc-*` share markers, because none is a production diff. Fair for a
   mockup; fatal if an engineer builds from the mockup. §5.3 supplies the whole contract.
2. **None of them notices the `public-labels.test.js` source-text greps.** The ledger renderer's
   `const amount=x.contributesToOoze?…:'AUX'` expression is asserted against the **JS source of
   `index.html`** and runs before collection. Any of the three ledger designs, implemented naively,
   reds the build in the cron's first step.
3. **All three left the `.hero` CSS defect on the floor.** `01-system-map.md` found it and flagged
   it as unconfirmed; no mockup acts on it, and all three replace the hero wholesale so they never
   hit it. The production build must fix it, and I have now confirmed it in a browser (§0a).

---

## 4. Acceptance criteria

The build is done when all of the following are true. These are the pass conditions, not
aspirations.

| # | Criterion | How it is checked |
|---|---|---|
| A1 | The featured block contains the four heaviest lines by `contrib`, and only those | `assert.deepEqual(featuredSlugs, ['housing','credit','auto','gas'])` against the live payload |
| A2 | The seven weighted lines foot to `LD.ooze` and the total is printed | new test: `sum(contrib where contributesToOoze!==false) === LD.ooze`; DOM assertion that the total row renders |
| A3 | `EDITORIAL.story` renders on the homepage, through `resolveClaims()`, with zero `{{` surviving | DOM assertion: `#storyBody.textContent` contains no `{{` and contains `26` twice |
| A4 | `delta === 0` never renders an up-arrow and never renders in `--amber` | DOM assertion across `.pk-can`, `.pk-lrow`, `#heroDelta` |
| A5 | Every signed number carries one of the four locked units | manual review against Constitution §3; no bare `−1`, no bare `▼3` |
| A6 | Every ounce figure prints against the whole | grep the rendered DOM for `oz` not preceded by `of 26`-shaped text |
| A7 | All 17 stamp markers still match | `node scripts/stamp.js` exits 0 and logs `missing markers: 0` |
| A8 | `release-gate.js`, `narrative-check.js`, `public-labels.test.js`, `market-public.test.js` all pass | `node --test` |
| A9 | The empty state renders every component the loud state renders | diff the two DOM trees; any component in one and not the other is a defect (L5) |
| A10 | No type below 0.72rem on any product surface, and `--dim` is never a datum | type census, as `02-comprehension.md` §3.1 |
| A11 | Zero `var(--ward)` on any household surface | `grep -c 'var(--ward)'` in the hero and report sections === 0 |
| A12 | Nothing above a `<details>` depends on opening it | manual, L8 |

---

# 5. THE SPEC

Everything below is executable without a design judgement call. Where I make a choice a reasonable
engineer might make differently, I say so and give the rule rather than the preference.

## 5.1 Final module order for `index.html`

The page keeps its two-column `.pvJ` grid (`lab.css:235`) and its rail. The **left column is
rebuilt**; the rail is untouched. Order top to bottom in the left column:

```
<section class="hero" id="top">
  <div class="wrap pvJ" id="heroTheme" data-level="2">          ← MARKER 6, unchanged
    <div class="pvJ-left">

      RUNG 1 — THE READING
      ├─ .kicker                     "How squeezed U.S. households are — July 2026"
      ├─ .standfirst          [NEW]  the three-line G4 block
      ├─ .big-score                  <span id="heroScore">26</span><small>/100</small>   ← MARKER 7
      ├─ .status-row
      │   ├─ a.status-chip#heroStatus   "STICKY"                 ← MARKER 8
      │   ├─ .band-range      [NEW]     "21–40 of 100"
      │   └─ .delta#heroDelta           "▼ 1 ounce lighter than June 2026"  ← MARKER 9
      ├─ .band-gloss          [NEW]  "That is Sticky territory — the band where normal economies live."
      ├─ .verdict#verdictLine        "Calmer than 6 of every 10 months since 2003"  ← MARKER 15
      └─ .pk-hero                    jar + placard, UNCHANGED    ← MARKERS 5, 10

      RUNG 2 — WHAT'S DRIVING IT?
      ├─ h2.rung-h                   "What's driving it?"
      ├─ .rung-lede           [NEW]  "The seven intake lines the score is built from. 26 ounces in
      │                               the jar this month, and this is where they came from."
      ├─ .oz-bar              [NEW]  26 ticks, segmented + labelled
      ├─ .pk-cans#canCards           FOUR rows, re-sorted — see §5.4
      ├─ .rung-tail           [NEW]  the remainder sentence + the "largest mover" slot
      └─ a.pk-more                   "SEE ALL NINE LINES →"  (href="#ledger", unchanged)

      RUNG 3 — WHAT CHANGED?
      ├─ h2.rung-h                   "What changed?"
      ├─ p#storyBody          [NEW]  EDITORIAL.story via resolveClaims() — see §5.5
      └─ details.src-strip    [NEW]  "Where each figure in that paragraph comes from"  (G5, closed)

      RUNG 4 — WHAT DOESN'T ADD UP?
      └─ section#crosscheck   [NEW]  see §5.6. SHIPS DARK until the payload carries `crosschecks`.

      RUNG 5 — SHOW THE EVIDENCE
      ├─ .pvJ-label.wide#ledger      "The Ledger"  (id preserved — #ledger is the pk-more target)
      ├─ .pk-ledger                  #ledgerL / #ledgerR — nine lines, re-ordered, + TOTAL row (G1)
      ├─ .pvJ-label.wide             "Can I verify it?"
      ├─ .pv-evidence                UNCHANGED
      ├─ .specimen-line.cine.c5      UNCHANGED                   ← MARKER 11 (most fragile)
      ├─ .streak-line#streakLine     REMOVED — see §5.2
      └─ replay-clearance link       UNCHANGED
    </div>
    <aside class="pvJ-rail">          ENTIRELY UNCHANGED
  </div>
</section>

<section id="report">                 ENTIRELY UNCHANGED       ← MARKERS 12, 13, 14
```

**Rung headings are `<h2>`.** The page currently has no `<h1>` and its only heading is
`<h2>Leak today's report</h2>` (`index.html:105`) — a document outline in which the loudest heading
on the page is the share module. Add `<h1 class="sr-only">OOZEMeter — the July 2026 Ooze Level</h1>`
as the first child of `.pvJ-left`, stamped by a new marker (§5.3, MARKER 18).

**Alignment.** `.pvJ-left` is `text-align:center` (`lab.css:237`). Rung 1 stays centred. **Rungs
2–5 must be `text-align:left`** — a ranked list read for rank cannot be centred. Add
`.rung{text-align:left;max-width:860px;margin:0 auto}`.

## 5.2 Modules removed, moved, kept

| Module | Disposition | Reason |
|---|---|---|
| `.kicker` | **Reworded** — `Containment Level — July 2026` → `How squeezed U.S. households are — July 2026` | `02-comprehension.md` §2.3. "Containment" is excellent as an institution and fatal as the answer to "26 what?". *Note the JS at `index.html:180` overwrites this — change both the static string and the JS.* |
| `.big-score`, `#heroScore` | **Kept, unchanged** | Clause B is the site's only 2/2. |
| `#heroStatus` chip | **Kept**; gains `.band-range` sibling and `.band-gloss` below | The Constitution mandates the gloss; the page omits it. |
| `#heroDelta` | **Kept, reworded** to carry a unit and a neutral zero | Constitution §3 "four units, locked". See §5.4. |
| `#verdictLine` | **KEPT, UNTOUCHED** | Best comprehension asset on the site. Do not restyle, do not move above the chip, do not shorten. |
| `.pk-hero` jar + `.pk-plc` placard | **Kept, unchanged** | The jar is the product's only non-numeric encoding of "how full". Deleting it, as The Instrument Row does, is a different product. |
| `.pvJ-label` "Intake Canisters" | **REMOVED** — replaced by `<h2>What's driving it?</h2>` | `02-comprehension.md` §2.3 charges this string specifically: a label over the answer to "why" that does not say "why". |
| `.pk-cans` / `#canCards` | **Kept as a container, contents rebuilt** — four rows, contribution-sorted, each carrying name + ounces-of-whole + observed value + verb | Fixes CRITICAL #2. Card face loses `Level: 58` (`02-comprehension.md` §2.3) and gains `l.value` (Constitution §4). |
| `.pk-ledger` / `#ledgerL` / `#ledgerR` | **Kept, re-ordered, gains a TOTAL row** | G1. Sort rule in §5.4. **The `const amount=…:'AUX'` expression must survive verbatim on one line** — §5.3. |
| `#streakLine` + the streak `try{}` block | **REMOVED** | `07-ux.md` §5.11: a daily streak widget contradicts a monthly seal four inches away. It is also `localStorage`-only and therefore not a published finding. It is not a stamp marker, so removal is safe. |
| `#boot` / `BOOT_LINES` | **Kept, but reduced to two lines and moved behind `?boot=1`** | 2,220 ms of a 30-second budget establishing genre on the one visit that decides trust (`02-comprehension.md` §1.4). Do **not** delete it outright — it is the product's personality and `index.html:162` already short-circuits it for repeat visitors and reduced-motion. Make the first visit skip it too; keep the replay link. *This is the one item in this table I would accept being overruled on.* |
| `startCountUp()` | **Kept, gated** — return early when `matchMedia('(prefers-reduced-motion: reduce)').matches`, setting `#heroScore` to `TODAY_SCORE` directly | `02-comprehension.md` §3.4: it is rAF-driven, so `animation:none!important` cannot stop it, and a reader who asked for no motion watches the headline number be wrong for 1600 ms. This corrects `07-ux.md` §5.15. |
| `INDICATORS[].spark` | **DELETED from `lab.js`** | Fabricated and unrendered. The rejected list says delete, not implement. |
| `#report` share section | **UNCHANGED** | Carries markers 12–14. Its `top3` sort at `:310` is already correct. |
| `.pvJ-rail` (Research Library, Ward M, Learn More) | **UNCHANGED** | Not what is being fixed. `--ward` stays confined to `#wardCard`. |

## 5.3 The marker contract — build reds if any of these is dropped

**All 17 markers verified present in the current tree by executing the regexes from
`scripts/stamp.js`.** `stamp.js:130` is `if(missing>0)process.exit(1)`, and `index.html` is written
to disk at `:107` *before* that check, so a failure leaves a partially-stamped file and a dirty tree.

### Must survive byte-for-byte in `index.html`

| # | `stamp.js` line | Regex | What the markup must keep |
|---|---|---|---|
| 1 | :51 | `/<title>[^<]*<\/title>/` | a `<title>` with no `<` inside |
| 2 | :53 | `/<meta name="description" content="[^"]*">/` | **exact attribute order**, double quotes, no other attributes |
| 3 | :55 | `/<meta property="og:title" content="[^"]*">/` | same |
| 4 | :57 | `/<meta property="og:description" content="[^"]*">/` | same |
| 5 | :59 | `/aria-label="Containment jar, ooze level \d+ of 100"/` | **the accessible-name wording is a build dependency.** Rewriting it to anything else reds the build. If you want to reword it, change `stamp.js:59` and `index.html:177` in the same commit. |
| 6 | :61 | `/id="heroTheme" data-level="\d"/` | `id="heroTheme"` followed by exactly one space then `data-level="N"`. **Inserting `class=` between them, or reordering, breaks it.** Single digit only. |
| 7 | :62 | `/id="heroScore">\d+</` | `id="heroScore"` must be the **last attribute** on its tag |
| 8 | :63 | `/(id="heroStatus"[^>]*>)[^<]*</` | may carry later attributes but **none containing `>`**; no child elements |
| 9 | :64 | `/id="heroDelta">[^<]*</` | last attribute; no child elements. **The new delta text must be plain text — no `<b>`, no `<span>`.** |
| 10 | :65 | `/id="plcSealed">[^<]*</` | last attribute; no child elements |
| 11 | :66 | `/class="specimen-line cine c5">[^<]*<b>[^<]*<\/b>[^<]*</` | **the most fragile marker in the system.** Class value verbatim and in this order, as the last attribute, inner shape `text <b>text</b> text`. The `cine c5` reveal classes are a build dependency. |
| 12 | :68 | `/class="sc-score">\d+<span/` | class exactly `sc-score`, last attribute |
| 13 | :69 | `/class="sc-status">[^<]*</` | class exactly `sc-status`, last attribute, no children |
| 14 | :70 | `/id="scLine">[^<]*</` | last attribute, no children |
| 15 | :100 | `/id="verdictLine">[^<]*</` | last attribute, no children |
| 16–17 | :119–120 | `market.html` `#mktScore`, `#mktBand` | **same `missing` counter** — a broken `market.html` marker reds the build with an `index.html`-shaped error |

### Silent inserts — not counted, so a broken anchor fails quietly

- Atom feed link (`:74`) inserts before the literal `<link rel="stylesheet" href="lab.css">`.
- Dataset JSON-LD (`:78`) replaces between `<script type="application/ld+json" id="datasetLD">` and
  the next `</script>`.
- Canonical (`:104`) inserts before the literal `<meta property="og:url"`.

### Four more consumers that read `index.html`

| Gate | Assertion |
|---|---|
| `release-gate.js:68` | `id=["']heroScore["'][^>]*>${score}<` must match |
| `release-gate.js:69` | `<title>[^<]*${monthLabel}</title>` must match |
| `narrative-check.js` | `index.html` on disk must contain **no** `{{…}}` token |
| `tests/public-labels.test.js:45` | **JS source** must match `/const amount=x\.contributesToOoze\?.*:'AUX'/` — one line, that identifier, that string |
| `tests/public-labels.test.js:46` | source must contain `PROVISIONAL AUXILIARY SENSOR … 0-WEIGHT … DOES NOT ALTER THE OOZE SCORE` |
| `tests/public-labels.test.js:66–67` | source must contain `COLLECTION PIPELINE STALE` and `STALE INTAKE LINE` |
| `tests/market-public.test.js:68` | source must contain `` breadth.total} ticker proxies steady `` |

These four run in the cron's **first** step, before collection.

### New markers this build adds

| # | Purpose | Regex to add to `stamp.js` | Static content |
|---|---|---|---|
| 18 | sr-only h1 | `/id="pageH1">[^<]*</` | `OOZEMeter — the July 2026 Ooze Level` |
| 19 | band range | `/id="bandRange">[^<]*</` | `21–40 of 100` |
| 20 | band gloss | `/id="bandGloss">[^<]*</` | the Constitution §3 sentence for the band |

Adding markers is safe (they increment `missing` only if absent); adding them means the no-JS view
is correct for these three elements too.

**`#storyBody` gets NO marker and MUST NOT be stamped.** See §5.5.

## 5.4 The sort rules, as code

Replace `index.html:194–206`. The featured block:

```js
/* Featured lines: the four heaviest CONTRIBUTORS, not the biggest movers.
   Sorting by Math.abs(delta) put gas 4 + inflation 2 + jobs 2 + financial 0 = 8 of 26 ounces
   on the page and gave a card to a line contributing nothing. Attribution is ranked by
   contribution; "largest mover" is an ADDITIONAL labelled slot below, never the sort key.
   Ties break on scoreWeight, then on slug, so a tie month publishes a stable, stated order. */
const W = Object.entries(LD.lines).filter(([,l]) => l.contributesToOoze !== false);
const WEIGHT = {housing:19.4, credit:19.4, auto:14.55, gas:9.7, inflation:9.7, jobs:24.25, financial:3};
const byContribution = (a,b) =>
      (b[1].contrib - a[1].contrib)
   || ((WEIGHT[b[0]]||0) - (WEIGHT[a[0]]||0))
   || a[0].localeCompare(b[0]);
const feat = [...W].sort(byContribution).slice(0,4);

/* the ounce arithmetic, computed not typed */
const totalOz     = W.reduce((n,[,l]) => n + l.contrib, 0);         // 26
const featuredOz  = feat.reduce((n,[,l]) => n + l.contrib, 0);      // 22
const remainderOz = totalOz - featuredOz;                            // 4
const remainderNames = W.filter(e => !feat.includes(e))
                        .sort(byContribution)
                        .map(([k]) => indBySlug(k).name.toLowerCase());
console.assert(totalOz === TODAY_SCORE, 'weighted contributions do not foot to the reading');
```

**The tie-break must be printed, not just coded.** Today `inflation` and `jobs` are both 2 oz and
The Instrument Row broke the tie in a designer memo only. Print it once, in the rung-2 tail:
*"Lines carrying the same ounces are ordered by their weight in the formula."* A published order a
reader cannot reproduce is the one thing this product cannot ship.

The ledger, replacing `index.html:207–221`. **The `const amount=` line is asserted by
`tests/public-labels.test.js:45` and must stay on one line with that identifier and that
`'AUX'` literal:**

```js
const rows = Object.entries(LD.lines).map(([k,l]) => {
  const y = indBySlug(k);
  return {slug:k, emoji:y.emoji, name:y.name, value:l.value, delta:l.delta,
          contrib:l.contrib, contributesToOoze:l.contributesToOoze !== false};
}).sort((a,b) => (b.contributesToOoze - a.contributesToOoze) || (b.contrib - a.contrib)
              || ((WEIGHT[b.slug]||0) - (WEIGHT[a.slug]||0)) || a.slug.localeCompare(b.slug));
const lrow = x => {
  const amount=x.contributesToOoze?deltaText(x.delta):'AUX';   /* public-labels.test.js:45 */
  …
};
```

The three-way delta, which replaces every `x.delta>=0` branch on the page
(`#heroDelta`, `.pk-can .dl`, `.pk-lrow .dl`, and `lab.js:394`'s `.sp-d` class):

```js
/* delta===0 currently takes the >=0 branch, so housing, credit and auto — 18 of the jar's
   26 ounces — render as "▲0" in --amber: an up-arrow in the warning colour for lines that
   did not move. Verified in a browser against the live payload. Three states, not two. */
function deltaText(d){
  if(d === 0) return 'held flat';
  return `${d > 0 ? '▲ up' : '▼ eased'} ${Math.abs(d)} point${Math.abs(d) === 1 ? '' : 's'}`;
}
function deltaTone(d){ return d === 0 ? 'var(--muted)' : d > 0 ? 'var(--amber)' : 'var(--green)'; }
```

Hero delta, carrying one of the four locked units:

```js
const d = TODAY_SCORE - YESTERDAY;
$('heroDelta').textContent = d === 0
  ? `NO CHANGE FROM ${LD.prevMonthLabel.toUpperCase()}`
  : `${d > 0 ? '▲' : '▼'} ${Math.abs(d)} OUNCE${Math.abs(d) === 1 ? '' : 'S'} ${d > 0 ? 'HEAVIER' : 'LIGHTER'} THAN ${LD.prevMonthLabel.toUpperCase()}`;
$('heroDelta').style.color = deltaTone(d);
```

The card face, replacing `.pk-can`'s contents. **`Level: ${l.stress}` is removed** — a 0–100 stress
point on a card face is a second composite in disguise and `02-comprehension.md` §2.3 charges it:

```js
$('canCards').innerHTML = feat.map(([k,l]) => {
  const y = indBySlug(k), fired = ccStateFor(k);           // '·' until §5.6 ships
  return `<a class="pk-can" href="indicator.html?i=${k}">
    <span class="cc-gutter" aria-hidden="true">${fired}</span>
    <span class="sr-only">${fired === '≠' ? 'a cross-check on this line disagrees' : 'cross-check agrees'}</span>
    <span class="nm">${y.name}</span>
    <span class="oz"><b>${l.contrib}</b> of ${totalOz}</span>
    <span class="obs">${y.shortMetric} ${l.value}</span>
    <span class="dl" style="color:${deltaTone(l.delta)}">${deltaText(l.delta)}</span>
  </a>`;
}).join('');
```

`y.shortMetric` is new on `INDICATORS` — `"30-year mortgage"`, `"card delinquency"`,
`"auto-loan delinquency"`, `"pump price"`, `"unemployment"`, `"yearly price growth"`,
`"Chicago Fed index"`, `"mortgage delinquency"`, `"industrial production"`. Without it the card
prints a bare `6.67%` and violates Constitution §4 in a new way.

The ounce bar, rendered from the same array — no library, no SVG:

```js
$('ozBar').innerHTML = W.sort(byContribution).map(([k,l]) =>
  `<span class="oz-seg" data-slug="${k}" style="flex:${l.contrib}">` +
  '<i></i>'.repeat(l.contrib) + `</span>`).join('');
```

Each `<i>` is one tick, one ounce. `26` ticks, one per ounce, `flex` proportional to `contrib`, no
axis and no interpolation. Labelled beneath with the first four segment names and
`${remainderOz} lighter · ${remainderOz}`. Give the container
`role="img" aria-label="26 ounces: housing 7, credit cards 6, auto loans 5, gas 4, three lighter lines 4"`,
generated from the same array.

## 5.5 Where `EDITORIAL.story` renders, at what scale, and the hazard

**Element.** `<p id="storyBody" class="rung-body"></p>`, the only child of rung 3 above the
provenance `<details>`.

**Render.**

```js
if(window.EDITORIAL && EDITORIAL.story){
  $('storyBody').textContent = resolveClaims(EDITORIAL.story);
}else{
  $('storyBody').textContent = 'This month’s written reading has not been generated yet.';
}
```

`textContent`, not `innerHTML` — the field is generated prose and has no reason to carry markup.

**THE HAZARD, stated as a build rule.** `EDITORIAL.story` carries **two** `{{s:2026-07}}` tokens
(`summary` carries one). Two ways to get this wrong, and they fail in opposite directions:

- **Client-side without `resolveClaims()`** → `{{s:2026-07}}` ships to readers **on a green build**.
  `narrative-check.js` reads `index.html` from disk and cannot see runtime DOM. `index.html:185`
  already renders `EDITORIAL.verdict` unwrapped; that is safe only because today's verdict carries
  no token, and it is a latent hole that should be wrapped in the same commit.
- **Stamped into the static file** → `stamp.js` has no resolver, so a raw `{{…}}` lands in a file
  `narrative-check.js` **does** scan → **build red**. Do not give `#storyBody` a stamp marker.

Consequence: **no-JS readers do not get the story.** That is the correct trade today. Server-rendering
it requires a token resolver inside `stamp.js`, which is real work and is logged in §6 rather than
smuggled into this build.

**Type scale.** Two ranks only (L1), expressed in existing tokens:

| Element | Family | Size | Colour | Measure |
|---|---|---|---|---|
| `h2.rung-h` | `var(--display)` 800 | `clamp(1.05rem, 2.4vw, 1.35rem)` | `var(--text)` | — |
| `p#storyBody` | `var(--mono)` 400 | `clamp(.92rem, 1.9vw, 1.02rem)` / line-height `1.62` | `var(--text)` | `max-width: 64ch` |
| `.rung-lede`, `.rung-tail` | `var(--mono)` | `.82rem` / 1.55 | `var(--muted)` | `max-width: 68ch` |
| `.pk-can .oz b` | `var(--display)` 800 | `1.5rem` | `var(--ooze)` | — |
| `.pk-can .nm` | `var(--mono)` 500 | `.86rem` | `var(--text)` | — |
| `.pk-can .obs`, `.dl` | `var(--mono)` | `.76rem` | `--muted` / `deltaTone()` | — |
| `details.src-strip` rows | `var(--mono)` | `.74rem` | `var(--muted)` | — |

`#storyBody` in mono at reading size is deliberate and it is Answer First's best idea: it reads as a
printout rather than as a column, which is what stops rung 3 feeling like a blog post. It is
**smaller than the score and larger than everything else in rungs 2–5** — one step below the
headline, one step above the instrument. Do not set it in `--display`; Unbounded at 64 characters
of measure is unreadable.

**Nothing below 0.72rem anywhere on a product surface**, and `--dim` is chrome only, never a datum
(`02-comprehension.md` §3.1: `--dim` is 4.52:1 on `--panel`, AA by 0.02 — a coincidence, not a
floor).

## 5.6 The cross-check module — markup, three states, exact copy

**Ship condition.** This module renders **only** when `LD.crosschecks` exists in the payload. Until
then, rung 4 is absent from the DOM entirely and rungs 1–3 + 5 ship without it. Do **not** ship a
gutter column of dots that can never become `≠` — The Instrument Row is right that a promise the
data cannot keep is worse than no column. Concretely: **`ccStateFor()` returns `''` and
`.cc-gutter` is `display:none` until the payload lands.** That is the one place where the graft is
staged rather than immediate, and it is stated so nobody ships half of it.

### Markup — identical in all three states

```html
<section class="rung" id="crosscheck">
  <h2 class="rung-h">What doesn&rsquo;t add up?</h2>

  <div class="cc-head">
    <span class="cc-glyph" aria-hidden="true">·</span>
    <span class="cc-state">The checks agree</span>
    <span class="cc-count">0 of 7 checks disagree</span>
  </div>

  <div class="cc-body">
    <!-- the content slot: 2 paragraphs quiet, 4 paragraphs loud. Same slot, same rank. -->
  </div>

  <table class="cc-roster">
    <caption>The seven cross-checks &mdash; the same seven every month</caption>
    <thead><tr>
      <th scope="col"><span class="sr-only">Result mark</span></th>
      <th scope="col">Line</th>
      <th scope="col">What the jar reads</th>
      <th scope="col">Checked against</th>
      <th scope="col">Result</th>
    </tr></thead>
    <tbody><!-- seven rows, ALWAYS seven, in the same rank order as rung 2 --></tbody>
  </table>

  <p class="cc-run"><!-- the run sentence: first-edition / streak / standing-finding --></p>
  <p class="cc-firewall">Cross-check series carry no score weight. This does not change the
     reading of <span id="ccReading">26</span>.</p>

  <details class="cc-rules">
    <summary>See what would make each check fire</summary>
    <!-- the published firing-rule table, 07-ux.md §4.2, identical in every state -->
  </details>
</section>
```

**Every element above is present in every state.** L5's test is a DOM diff: a node in one state and
not the other is a defect. What changes between states is **text content and two class values.
Nothing else.** No component is added, removed, resized, re-ordered or recoloured.

### State 1 — QUIET (zero checks fire). Most months. Design this one first.

`.cc-head` → glyph `·`, `.cc-state` `The checks agree`, colour `var(--muted)`.
`.cc-count` → `0 of 7 checks disagree`.

`.cc-body`, verbatim from `02-comprehension.md` §4.2 (81 words, FK grade 3.5):

> The numbers the jar reads and the numbers it doesn't are pointing the same way this month.
>
> {{cc:ran}} cross-checks ran — the same ones every month, one for each line the score is built
> from. Each compares a figure the jar reads against a figure the score does not use. None of them
> disagreed.

Roster: seven rows, gutter `·`, result cell `agrees` in `var(--muted)` — **never `var(--dim)`; it is
a datum, not chrome.**

`.cc-run`, first-edition variant (use this one on launch — `{{cc:streak}}` does not exist in the
payload and must not be invented):

> Agreement is a reading, not a blank space. This is the first edition to publish these checks; the
> run starts here.

Standing variants, for when the payload can support them:

> *(3+ editions)* Agreement is a reading, not a blank space. These checks have now agreed for
> {{cc:streak}} editions running.
>
> *(§6c standing finding)* Agreement is a reading, not a blank space. These checks have agreed in
> every edition since {{cc:since}} — the finding this month is the run, not any one check.

**The quiet state is the FULLER one.** When something fires the paragraph is the evidence; when
nothing fires the roster is. A module that visibly shrinks when it has nothing to report teaches a
reader within two visits that quiet means unimportant, and from then on the block is a siren, read
only when it is red.

**Banned from the quiet state, permanently:** any `✅`, `⚠`, "All clear", "Everything checks out",
"No contradictions found", "The economy is healthy", the word *week* (the jar seals monthly), and
any quotation of *"Recessions are employment events."* — which is protected under §7 and requires
the employment line's rank and ounces in the same section, and employment is 2 oz and ranks sixth.

### State 2 — ONE CHECK FIRES, not on employment

`.cc-head` → glyph `≠`, `.cc-state` `One check disagrees`, colour `var(--amber)`.
`.cc-count` → `1 of 7 checks disagree`. `.cc-body` carries the one-paragraph mechanism for the line
that fired. `07-ux.md` §4.3's amber draft (credit) is the model.

### State 3 — TWO+ FIRE, or any single fire on employment

`.cc-head` → glyph `≠`, `.cc-state` `Meaningful contradiction detected`, colour `var(--red)`.
Employment escalates alone because it carries 24.25% of the formula.

`.cc-body`, verbatim from `07-ux.md` §4.3 (128 words, ~28 s, Constitution-checked clause by clause
in that document):

> Two job numbers point opposite ways this month.
>
> The unemployment rate fell to 4.1%. Over the same month the share of American adults with a job
> fell to 58.9%, and the share either working or looking fell to 61.4%.
>
> Both can be true at once. The unemployment rate only counts people who are looking for work. In
> July, 264,000 people stopped looking, so they left the count. Fewer people looking makes the rate
> go down even when fewer people are working.
>
> The jar reads the unemployment rate. It does not read the number of people working. So this
> month's employment line — 2 of the jar's 26 ounces — is measuring the friendlier of the two facts.

Authored form, per `07-ux.md` §4.4: `{{x:UNRATE:value}}`, `{{x:EMRATIO:value}}`,
`{{x:CIVPART:value}}`, `{{x:CLF16OV:delta_abs}}`, `{{line:jobs:contrib}}`, `{{s:2026-07}}`. **Those
forms do not exist in `resolveClaims()` today** — it handles exactly five: `{{s:}}`, `{{peak:}}`,
`{{market:}}`, `{{market-current:}}`, `{{revision-old:}}`. Extending it is part of shipping rung 4
and is not optional; a hand-typed number here is the one thing that would destroy the module's
reason to exist.

**The verb is a token too.** `fell` / `eased` / `held roughly steady` must be emitted by the same
threshold function the story engine uses. A hand-chosen verb is a hand-typed number wearing a coat.

### State 4 — CHECKS COULD NOT RUN

Use verbatim, do not re-draft (it uses a protected phrase):

> Cross-checks could not run this month — one or more comparison series has not released. A missing
> month stays missing.

Glyph `—`, state colour `var(--dim)`, count cell empty. This is an epistemic state, not a severity —
per phase 1's Nagios/Grafana reference it must not sit on the severity ramp.

### The escalation is carried by wording and position, not by hue

`--red` is **6.02:1** against `--bg` and `--green` is **15.23:1** — the loudest state is the
*dimmest* colour on this canvas. So the loud state cannot be made to feel loud by colour and must
not try. The gutter glyph and the state label carry it. Do not brighten `--red`, do not add a wash,
do not flash, do not add an alarm icon.

### The mark never touches the numeral

`.cc-glyph` and `.cc-gutter` live in their own column. The mark is never adjacent to `#heroScore`,
never applied as a colour to it, and never inside `.big-score`. This is L4, it is the Particle Data
Group's structural non-interference discipline, and it is aviation's DISAGREE annunciator — three
unrelated fields arriving at the same rule.

## 5.7 CSS additions — existing tokens only

Append to `lab.css`. **No new colour values. No new font families. `--radius`, `--ease`, `--line`,
`--line-hard` reused as-is.**

```css
/* ---- FIX FIRST: lab.css:174–178 is an orphaned declaration block. The .ad-slot selector was
   deleted in bc9d5f4 and the body was left. CSS error recovery swallows to the next `{`, which
   is `.hero{` on :181, so the .hero rule never applies. CONFIRMED in a browser: .hero computes
   padding 74px/74px, position static, and no `.hero` rule exists in the CSSOM.
   The fix is to DELETE lines 174–178. ---- */

/* ---- the rung spine ---- */
.rung{position:relative;text-align:left;max-width:860px;margin:0 auto;padding:38px 0 0 26px}
.rung::before{content:"";position:absolute;left:0;top:0;bottom:0;width:1px;background:var(--line)}
.rung:last-of-type::before{bottom:auto;height:100%}
.rung-h{font-family:var(--display);font-weight:800;font-size:clamp(1.05rem,2.4vw,1.35rem);
        color:var(--text);letter-spacing:.01em;margin:0 0 10px}
.rung-lede,.rung-tail{font-size:.82rem;line-height:1.55;color:var(--muted);max-width:68ch;margin:0 0 18px}
.rung-body{font-family:var(--mono);font-size:clamp(.92rem,1.9vw,1.02rem);line-height:1.62;
           color:var(--text);max-width:64ch;margin:0 0 20px}

/* ---- rung 1 additions ---- */
.standfirst{font-size:.84rem;line-height:1.6;color:var(--muted);max-width:56ch;margin:10px auto 26px}
.band-range{font-size:.72rem;letter-spacing:.14em;color:var(--dim);text-transform:uppercase}
.band-gloss{font-size:.8rem;color:var(--muted);margin-top:10px;max-width:52ch;margin-inline:auto}

/* ---- rung 2: the ounce bar. 26 ticks, no axis, no interpolation. ---- */
.oz-bar{display:flex;gap:3px;margin:0 0 8px;height:22px}
.oz-seg{display:flex;gap:2px}
.oz-seg i{flex:1;min-width:6px;background:var(--ooze);border-radius:2px;opacity:.92}
.oz-seg:nth-child(2) i{opacity:.78}
.oz-seg:nth-child(3) i{opacity:.64}
.oz-seg:nth-child(4) i{opacity:.50}
.oz-seg:nth-child(n+5) i{background:var(--dim);opacity:.6}
.oz-key{display:flex;font-size:.72rem;color:var(--muted);letter-spacing:.06em;margin-bottom:6px}
.oz-note{font-size:.72rem;color:var(--dim)}

/* ---- rung 2: the four rows. Was a card grid; now rows, because rank is vertical. ---- */
.pk-cans{display:block;max-width:none;margin:0}
.pk-can{display:grid;grid-template-columns:18px 1fr 92px 1fr auto;gap:14px;align-items:baseline;
        border:none;border-top:1px solid var(--line);border-radius:0;background:none;
        padding:15px 0;min-height:48px;text-align:left;transition:none}
.pk-can:first-of-type{border-top:none}
.pk-can:hover{transform:none;color:var(--ooze)}
.pk-can .nm{font-size:.86rem;color:var(--text);letter-spacing:.01em}
.pk-can .oz{font-size:.78rem;color:var(--muted);white-space:nowrap}
.pk-can .oz b{font-family:var(--display);font-weight:800;font-size:1.5rem;color:var(--ooze);
              margin-right:5px;font-variant-numeric:tabular-nums}
.pk-can .obs{font-size:.76rem;color:var(--muted)}
.pk-can .dl{font-family:var(--mono);font-weight:500;font-size:.76rem;text-align:right}
@media(max-width:700px){
  .pk-can{grid-template-columns:18px 1fr auto;grid-template-areas:"g n o" ". v d";row-gap:4px}
  .pk-can .cc-gutter{grid-area:g}.pk-can .nm{grid-area:n}.pk-can .oz{grid-area:o}
  .pk-can .obs{grid-area:v}.pk-can .dl{grid-area:d}
}

/* ---- the permanent cross-check gutter. One column, every row, every month. ---- */
.cc-gutter{font-family:var(--mono);font-size:.86rem;color:var(--dim);text-align:center;
           width:18px;line-height:1}
.cc-gutter[data-fired="1"]{color:var(--amber)}
.cc-gutter[data-fired="2"]{color:var(--red)}

/* ---- rung 4 ---- */
.cc-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;padding:12px 0;
         border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:20px}
.cc-glyph{font-family:var(--mono);font-size:.9rem;color:var(--muted)}
.cc-state{font-family:var(--display);font-weight:800;font-size:.92rem;color:var(--muted)}
.cc-count{margin-left:auto;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
#crosscheck[data-cc="amber"] .cc-glyph,#crosscheck[data-cc="amber"] .cc-state{color:var(--amber)}
#crosscheck[data-cc="red"]   .cc-glyph,#crosscheck[data-cc="red"]   .cc-state{color:var(--red)}
#crosscheck[data-cc="nodata"] .cc-glyph,#crosscheck[data-cc="nodata"] .cc-state{color:var(--dim)}
.cc-body p{font-size:.86rem;line-height:1.6;color:var(--text);max-width:62ch;margin:0 0 14px}
.cc-roster{width:100%;border-collapse:collapse;font-size:.76rem;margin:18px 0 14px}
.cc-roster caption{text-align:left;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;
                   color:var(--dim);padding-bottom:10px}
.cc-roster th{text-align:left;font-weight:500;font-size:.7rem;letter-spacing:.14em;
              text-transform:uppercase;color:var(--dim);padding:0 12px 8px 0;
              border-bottom:1px solid var(--line)}
.cc-roster td{padding:11px 12px 11px 0;color:var(--muted);border-bottom:1px solid var(--line)}
.cc-roster td:last-child{color:var(--text)}
.cc-run{font-size:.8rem;color:var(--muted);max-width:62ch}
.cc-firewall{font-size:.76rem;color:var(--muted);max-width:62ch;margin-top:10px}
.cc-rules summary{min-height:44px;display:flex;align-items:center;cursor:pointer;
                  font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}

/* ---- the ledger total row (G1) ---- */
.pk-total{display:grid;grid-template-columns:26px 1fr auto 46px;gap:12px;align-items:center;
          padding:14px 0 0;border-top:1px solid var(--line-hard);margin-top:6px;font-size:.8rem;
          color:var(--text)}
.pk-total b{font-family:var(--display);font-weight:800;font-size:1.05rem;color:var(--ooze);
            text-align:right;font-variant-numeric:tabular-nums}
.pk-aux-note{font-size:.74rem;color:var(--muted);margin-top:14px;max-width:66ch}
.oz-mark{color:var(--dim);font-size:.72em;vertical-align:super}

/* ---- utility ---- */
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;
         clip:rect(0 0 0 0);white-space:nowrap;border:0}

/* ---- wide content scrolls in its own container; the body never scrolls horizontally ---- */
.scrollx{overflow-x:auto;-webkit-overflow-scrolling:touch}
@media(max-width:700px){
  .cc-roster{display:block}
  .cc-roster thead{display:none}
  .cc-roster tr{display:grid;grid-template-columns:18px 1fr auto;gap:4px 10px;
                padding:10px 0;border-bottom:1px solid var(--line)}
  .cc-roster td{border:none;padding:0}
  .cc-roster td:nth-child(3),.cc-roster td:nth-child(4){grid-column:2/4;font-size:.72rem}
}
```

**Notes binding the CSS:**

- `--ward` appears **zero** times above. It stays confined to `#wardCard` in the rail.
- The `[data-level]` scope trap is real: the attribute lives on `div#heroTheme` (`index.html:33`),
  so `.big-score` renders `#8aff3c` while `.share-card .sc-score` renders `#a3ff12` — two greens for
  one number on one page. **Do not fix this in this build.** Moving `data-level` to `<html>` breaks
  MARKER 6 and `setJar()` (`lab.js:326`) together, and it is a separate, testable change. Logged in
  §6.
- The focus ring (`lab.css:43`) and `prefers-reduced-motion` (`lab.css:603–607`) must survive
  untouched. If a new interactive element is not an `a`/`button`/`summary`/`[tabindex]`, extend the
  selector rather than writing a second rule.
- `.oz-seg` opacity, not hue, carries segment separation — hue is never the sole carrier (WCAG
  1.4.1), and the segment labels underneath carry it redundantly in text.

## 5.8 What must NOT change

1. **`#verdictLine` and its copy.** *"Calmer than 6 of every 10 months since 2003"* is the best
   comprehension asset on the site — grade 4.5, self-glossing, needs no vocabulary. Do not restyle
   it, do not move it above the band chip, do not shorten it, do not template it.
2. **`#heroScore` and `.big-score`.** Same size, same position, same prominence. Clause B is the
   only 2/2 on the current page.
3. **The jar** (`.pk-hero`, `#heroJar`, `buildJar`, `setJar`) and its `aria-label` wording, which is
   MARKER 5.
4. **All 17 stamp markers** in §5.3, byte-for-byte.
5. **`const amount=x.contributesToOoze?…:'AUX'`** on one line in `index.html`'s inline script, plus
   the three other source-text strings `public-labels.test.js` and `market-public.test.js` grep for.
6. **The `#report` share section end to end**, including its already-correct `top3` contribution
   sort at `:310`.
7. **`.pvJ-rail`** — the Research Library, Ward M card and Learn More block. Not in scope.
8. **`--ward` on any household surface.** The `CATL.explainer/manual` article-tag use at
   `index.html:260` is already a violation of the reservation; **resolve it, do not extend it**
   (swap to `var(--muted)`).
9. **The `[data-level]` band ramp intent** — the ooze stays green all the way up and only `--status`
   goes amber then red. That is a deliberate encoding: hue means "this is ooze", the status ring
   means severity.
10. **The Constitution's protected phrases**, verbatim where quoted: the zero-weight firewall
    sentence, the no-data sentence, *"the two lines everyone feels first"*, and
    *"We measure. We don't forecast."*
11. **No new hand-written data prose anywhere.** The explanation gap is a rendering gap. Every
    sentence carrying a figure comes from the generator or from a Constitution-checked draft in
    `07-ux.md` / `02-comprehension.md`. Interface copy written for this build must contain no datum
    that can go stale.

## 5.9 Build order

Four commits, each independently shippable and independently revertible.

**Commit 1 — the live falsehoods. Not design work; do this first regardless of anything above.**
- Delete `lab.css:174–178` (the orphaned block killing `.hero`). Confirmed in a browser.
- Three-way `deltaText()` / `deltaTone()` everywhere `x.delta>=0` appears: `#heroDelta`,
  `.pk-can .dl`, `.pk-lrow .dl`, `lab.js:394`. **18 of 26 ounces stop rendering as `▲0` in amber.**
- Gate `startCountUp()` on `prefers-reduced-motion`.
- Delete `INDICATORS[].spark`.
- Swap `CATL.explainer/manual` off `var(--ward)`.
- Add a test asserting `sum(contrib where weighted) === ooze` (promote `lab.js:593`'s console.assert).

**Commit 2 — CRITICAL #2 and rung 2.** The `byContribution` sort, four rows, `shortMetric`, the
ounce bar, the remainder line, the printed tie-break rule, the ledger re-order and the TOTAL row
with `†` / `*` zeros. **No new data required — `contrib` is already in the payload and the correct
sort already exists 114 lines below the wrong one.**

**Commit 3 — CRITICAL #1 and rungs 1 + 3.** `#storyBody` through `resolveClaims()`, the kicker
reword, the standfirst, the band range and gloss, the sr-only `<h1>`, markers 18–20 added to
`stamp.js`, the provenance `<details>`, the streak line removed. Wrap `EDITORIAL.verdict` in
`resolveClaims()` in the same commit.

**Commit 4 — rung 4, and only when the data exists.** The `crosschecks` payload block, seven series
and seven published firing rules, the `{{x:SERIES:field}}` / `{{line:slug:field}}` / `{{cc:*}}`
resolver forms, the rules page in `notes.html`, and the module in all four states. Enable
`.cc-gutter` in the same commit. **Do not ship the gutter before this commit** and **do not render
the household paragraph until the in-place `[disputed]` mark can be driven by real firing data.**

After commits 1–3 the page fixes both CRITICALs, delivers Reader Promise §2 items 1 and 2, and
carries no live falsehood. That is the ship-worthy state and it does not depend on commit 4.

---

## 6. Open items, logged rather than solved

1. **Run the five-stranger protocol** (`02-comprehension.md` §1.5) before and after. Ship threshold:
   clauses A+B+C+D present in 4 of 5, and **zero false statements in 5 of 5**. My scores in §2.2 are
   analytic and should be replaced by real transcripts.
2. **Reader Promise §2 item 4 — a named next-release date — is still not delivered.** The payload
   carries `updatedLabel` but no next date, and no mockup invented one. Correct restraint; still a
   gap. It needs a generator change, not a layout change.
3. **The household paragraph has no field of its own.** It is embedded inside
   `editorial.newsletter`. Splitting it into `editorial.household` is prerequisite to rendering it,
   and rendering it is gated on commit 4.
4. **Two contradictory colour ramps.** `lab.js:253` `LEVELCOLORS` matches the CSS `--ooze` ramp at
   levels 1–3 and matches `--status` at 4–5, so a level-4 canister fill is amber while a level-4
   hero jar is green. Collapse them or document why they differ.
5. **The `[data-level]` scope trap** — two greens for one number on one page. Fixing it means moving
   `data-level` up, which breaks MARKER 6 and `setJar()` together. Separate change, own commit.
6. **No-JS readers get no story.** Server-rendering it needs a token resolver inside `stamp.js`.
7. **The boot sequence.** I have recommended reducing it rather than deleting it and flagged that as
   the one item here I would accept being overruled on.
8. **The FRED cross-check figures** in §5.6's loud copy (payrolls −23k, CIVPART 61.4, EMRATIO 58.9,
   CLF16OV −264k) are quoted from `research/forensic/07-ux.md` §1 as that audit's claim. **I did not
   re-fetch them.** They must be re-verified before commit 4 ships, and once the token contract
   exists they will be resolved from the payload rather than typed at all.

---

*Phase 2 of 2, closing document. No production file was modified by this judging pass; the only
write is this file, inside the untracked `mockups/phase2/`, and nothing in `scripts/`, `tests/` or
`.github/workflows/` references `mockups`. `scripts/weekly-deliver.js` and
`tests/weekly-deliver.test.js` show as modified by a concurrent agent — not mine, not staged, not
touched.*
