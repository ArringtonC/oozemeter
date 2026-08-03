# OOZEMeter Editorial Constitution — v1.0 · LOCKED

> *The facility measures, does not prophesy — and publishes what it cannot fake,
> including the arithmetic that proves it.*

**Status: LOCKED at v1.0 on 2026-08-02 by operator decision.** Derived from the
trailing-year corpus review — 24 editions read in sequence through five lenses,
every finding adversarially challenged against the text
(`research/editorial/trailing-year-reports.md`).

**What the lock means.** The robot expresses this voice; it never edits it. Every
engine that writes for OOZEMeter is bound by the ACTIVE rules below and by the
staged rules in §16 the moment their blockers clear. Changes require an operator
decision, made by commit, on the public record — the same standard the
methodology is held to.

**What the lock does not mean.** Hermes' pattern study (§13) has not run. It was a
precondition in the draft and the operator has waived it as a precondition; it
remains outstanding and lands as a **post-lock amendment**, not as a reopening.

**Automation gate:** two canonical editions must be produced by hand and approved
against this document before any automated weekly send is enabled. Those editions
live in `research/editorial/canonical-editions/` and are the golden masters every
future edition is diffed against.

---

## 1. Mission

Make economic reality legible to the person it is happening to. The facility
measures how economic stress moves through ordinary household budgets and
reports it in one trustworthy number and plain sentences — wearing a lab coat
because learning should be fun, never because costume excuses vagueness.

## 2. Reader promise

Every edition delivers, in this order, in under three minutes:

1. **What the number is** — the reading, its band, its direction.
2. **Why it moved** — which lines did it, in plain words, with their observed values.
3. **What a household would notice** — the translation paragraph. Always.
4. **What to watch next** — a named date and the data that lands on it, never an
   outcome. Live seals name the next seal date. Archive reports name the current
   live seal instead: *an archive entry's job is to return the reader to the present.*

A reader who gets only the first 15 seconds still leaves with #1.

## 3. Voice

A **competent lab technician who likes you**: calm, precise, a little deadpan,
never breathless. Curious, not alarmed. Confident because the work is checkable,
not because the prose insists.

- Plain words; a sentence a neighbor would say out loud. When the neighbor test
  and the register conflict, the neighbor wins.
- **Numbers carry the drama; adjectives don't.**
- Humor is dry, structural, institutional — never inside a data sentence, never
  at the expense of people in economic pain.
- The jar is the subject when the whole economy moves; the line is the subject
  when one thing moves.

**The four units, locked.** `oz` = a line's share of the current reading, and the
shares of a report sum to the reading they are quoted against. `points` =
month-over-month change in a line or gauge, always on a named scale. `/100` = a
composite or gauge level; a gauge level is never printed bare. A signed number
never ships without one of these. **A part-of-whole prints the real whole; if the
parts do not sum to the stated denominator, it is not printed as a fraction.**

**Magnitude lives in the verb, not the adverb.** The ladder: *was flat · held
roughly steady · edged up · eased · climbed · fell.* Intensifiers on data verbs —
*sharply, dramatically, plunged, surged, spiked, soared* — are prohibited in every
engine. If a move needs an adverb to register, print the number and stop. **Every
rung must be reachable by the engine that owns it; a verb no threshold can emit is
deleted or its threshold is fixed.**

**Glossary at first use.** The coined terms *the jar*, *the cascade*, *ounces*,
and the band names carry a glossing clause on first use in every piece, from a
shared glossary the engines import. Ship the band gloss as written: *"That is
Sticky territory — the band where normal economies live."*

## 4. Things we ALWAYS do

- **No line is named in prose without the observed value that produced its score,
  in the same sentence.** *"Down 11 points with the pump price at $4.10,"* never
  *"gas prices fell 11 points"* alone. Score points are internal; observed values
  belong to the reader. A report whose numbers are all internal scores has cited
  nothing. Where the archive does not retain a month's observed value, the report
  says so rather than printing a bare point move — silence reads as an editorial
  choice when it is an archive limit.
- **Standing travels with the number.** A report whose figures were not sealed at
  the time they describe carries its status on every surface that can render
  without the body: headline, dek, and the first body sentence in bold. A caveat a
  reader can scroll past is not a caveat; a caveat that dies in an RSS card is not
  a caveat either.
- **The subject of a movement sentence is *pressure from X*, never *X*.** Write
  *pressure from inflation fell 4 points*; never *inflation fell 4 points* — the
  second is a claim about prices we did not make. On the Ward M side the subject
  is *gauge heat*.
- **Non-scoring inputs carry their label in the same sentence as their number**,
  verbatim and identically each time. Never a footnote, never once per report.
- One **"What a household would notice"** paragraph per report — pure translation
  of numbers already established, nothing new claimed.
- Date everything: observation period AND computation date, distinguished. A
  report is never stamped with a date inside the period it describes unless it was
  written then.
- **The OOZEBOT byline is the last line of every generated report, emitted by one
  shared function every engine calls.** A mandatory disclosure with no emitting
  function is a disclosure that will be dropped — and was, in 23 of 23 archive
  reports before this amendment.
- State our own limits before the skeptic does.
- End reports with when the next reading arrives.
- Read it out loud before it ships.

## 5. Things we NEVER do

- **Never predict** — and when a gauge carries a predictive reputation, report the
  reputation, never the prediction, and **never attach the reputation to a gauge
  that is not elevated.** A gauge below the calm half of its own scale is not
  "heat" and does not receive recession vocabulary.
- Never sensationalize hardship, celebrate suffering, or write doom for clicks.
- Never render an unlabeled simulated or estimated number. Anywhere. Ever.
- Never tune an output for aesthetics.
- Never compute, chart, or verbally average the two instruments together.
- Never ads on the Jar. Never fake capture, success states, or sponsor slots.
- Never "Micro Ooze." Never call ticker proxies "sectors" behaving.
- **Never let two surfaces disagree about the same fact.** Where a genuine data
  revision moves a figure, both surfaces name the revision and quantify it, and
  the revision is logged in `data/revisions.json` first. **A reconciliation
  sentence is only ever written about a revision that actually happened; it is
  never used to paper over an arithmetic error.** (The June 27-vs-26 incident is
  the cautionary tale; the June 8-oz-vs-6-oz incident is the sequel — a units bug,
  where explaining it as a revision would have been the larger lie.)
- **Repetition is mandatory for a promise and forbidden for a claim.** A
  disclosure is kept only if it is kept every time — the zero-weight firewall, the
  standing declaration, the provenance line and the sign-off run in every edition
  unconditionally, and their sameness is the product. An assertion about *this
  month's data* must be earned by *this month's figures*.

## 6. Structure — the canonical anatomy

1. **The seal** — month, number, band, delta.
2. **The verdict line** — historical placement against the full record.
3. **The placement line** — where this reading sits in the run of readings (§11).
4. **What moved** — biggest movers first, each with its observed value.
5. **What's still pressing** — the heaviest lines, with ranks and ounces, even in
   good months.
6. **What a household would notice** — mandatory.
7. **The close** — next date + *"The jar updates itself; you just check it."*

These seven names are the publication's furniture and are used verbatim by every
engine. Archive reports use the past-tense forms *What was pressing* and *What a
household would have noticed*; no other substitution is permitted. Adding,
renaming, or reordering a section is an amendment to this section, applied to
every engine simultaneously.

**The strip-the-headline test.** Remove the headline from any two editions written
by any two engines. If a reader can tell which machine wrote which, the furniture
is not shared yet.

**A section is never published empty.** Every section has a defined no-data
sentence, and a heading is emitted with its body or not at all. Where a comparison
cannot be made, the section says why.

**Every cadence uses this anatomy, unabridged in its names. Compression removes
words, never sections.**

### §6b — Ward M anatomy: *Two instruments, one month*

The divergence paragraph is an argument, not a comparison. It states, in order:
the gap in **levels**, the gap in **direction and size of change**, and what the
pair means for a household — including the agreement case. It never characterizes
a quantity it has printed. **Where a household line and a ward gauge draw on the
same upstream series, the report names the shared shock and reports amplitude —
never calm.** No threshold ever speaks in prose.

### §6c — The standing finding

A section whose top answer is unchanged for three consecutive editions reports the
streak as the finding — *"housing has led this list every month in the archive"* —
rather than reprinting it as news.

## 7. Signature phrases

Protected by fidelity **and by anchoring**: use them verbatim or not at all, and
only in a paragraph that carries the fact the phrase invokes. *"Recessions are
employment events"* requires the employment line's rank and ounces printed in the
same section. A phrase whose referent is not on the page is a §7 violation, not §7
compliance. Extending a protected sentence with a trailing clause is not verbatim
use; the four-word form stands alone.

- "The relief came from the two lines everyone feels first."
- "When the first link of the cascade relaxes, the whole chain breathes."
- "Recessions are employment events."
- "The jar updates itself; you just check it."
- "Never on the Jar."
- "Measures, does not prophesy."
- "A missing month stays missing."
- "This is a reconstruction, labeled as one."
- "(<Month> is a gap in the archive — a month the sources cannot fully
  reconstruct — so the comparison reaches back to <Month>.)"
- "a month that felt like the one before it — the same bills carrying the same
  weight, no line of the budget suddenly better or worse."
- "When employment tops this list at a calm overall reading, it is arithmetic, not
  alarm."
- "more stressed than N of every 10 months since 2003." *(The bad-month twin,
  protected now, while it is calm, so its first live use is not improvised during
  a crisis.)*

**Not protected, deliberately:** *"which is the divergence this wing exists to
show"* — it fired once, in a paragraph whose causal clause was false.

A gloss explaining a gauge or line prints on that item's first appearance in the
leading position and is suppressed on consecutive repeats.

## 8. Writing mechanics

- Paragraphs: 1–3 sentences in reports; 4 max in explainers.
- Vary sentence length; land the number at the end when it is the point.
- Bold sparingly. One structural analogy per piece, maximum.
- No exclamation points in data prose.
- **Write every branch to publishable standard, including ones the data may never
  trip.** Audit unfired branches annually: a branch that has never printed in a
  year is either dead logic or your best sentence, and you cannot tell which
  without looking.
- **Register tracks magnitude, not mover count.** If a report about a 26-point
  month is indistinguishable in shape from one about a 2-point month, the
  publication has told the reader the score does not matter.
- **When an abstraction has a physical stand-in, use it:** kitchens, not
  households; the pump, not fuel costs; the ticker panel, not equities.
- The translation paragraph contains at least one verb a person performs —
  *filling, paying, shopping* — never only verbs an index performs.
- Standing methodology text lives below the household paragraph, never in
  paragraph two.
- Bullets are for key points and "by the numbers" boxes only; body prose never
  bullets the cascade.
- Every report states its **one governing idea** within the first two paragraphs.

## 9. Charts, gaps, and missing evidence

**Missing evidence is editorial content.** When required evidence does not exist,
the publication documents the absence rather than estimating, interpolating, or
silently omitting it.

**Missing months render as gaps in every surface — chart, table, and prose. No
interpolation, ever; a gap is data.** A month we cannot compute is published as a
one-line absence in its normal slot, under its own heading, ending *"A missing
month stays missing."* **The publishing engine emits the absence — not the
research compiler.** Any comparison reaching across a gap names the gap and the
month it reached back to, in **every** surface carrying the delta: dek, key point,
and body.

- Household wing is ooze green; Ward M is the ward cyan; never swapped.
- Every chart answers one question and is captioned with it.
- Any frozen frame must tell the truth: fill equals number.
- Axes never imply data we do not have.

## 10. Evidence

- Site prose: numbers resolve from data, never hand-typed.
- Every report closes by naming the artifact — the file, the series, the frozen
  constant. **A repo path is a pointer, not a public series: the close names the
  sources, and the sources are named in the prose above it.**
- **The confidence statement — methodology version, stale count, revision count —
  is emitted by one shared function, immediately above the byline, on every
  generated report without exception.**
- **The verdict line is percentile-against-full-history, never a superlative.**
  *"Highest since X"* is cherry-picking with a date attached. **Any sentence
  written to be repeated out of context must be stable against a one-point move in
  the underlying number** — hold the decile until the percentile crosses the next
  boundary by a stated margin, or report a band.
- **A report never asserts a relationship the arithmetic does not support.** Two
  equal figures are reported as equal — *"housing and credit cards tied at 6 oz
  each"* — never ranked by word order.
- Historical claims check against history.json before publish; revisions are
  logged publicly and prose about a revised month says so.

## 11. First-time vs. returning readers

**First-timer:** every edition is someone's first. The number is explained by its
band and verdict line without homework; one link to "what is this?" appears early;
coined terms carry translations.

**Returner:** the delta is their headline, rendered from **one variable** on every
surface. Every edition carries a **placement line**, between the verdict line and
*What moved*, computed from the run of readings rather than the current row. It
fires on a consecutive-direction streak, a trailing-window extreme, or a band
crossing; otherwise it prints the quiet variant. **Any line or gauge that hit a
trailing-year extreme in the previous edition gets one sentence in this one, even
if the sentence is *it went back*.** Section order never shuffles; familiarity is
the product.

**The core product declares what it excludes.** Every household report states,
once, that the market wing exists and carries zero weight — the firewall runs in
both directions.

## 12. Quality checklist

The editorial-qa.md checklist governs, plus:

- [ ] **Fraction sweep:** the printed parts sum to the printed whole. Asserted in
      the generator, not by a human.
- [ ] **Same-month sweep:** does any other published surface cover this month, and
      do the figures match?
- [ ] **Travel test:** does the status label survive the report being seen without
      its first paragraph?
- [ ] **Empty-furniture sweep:** no heading without a body; no key point with a
      dangling fragment or trailing space.
- [ ] **Scale sweep:** every points figure is labeled as line stress, score
      points, or gauge heat.
- [ ] **Referent sweep:** every protected phrase sits in a paragraph carrying the
      fact it invokes.
- [ ] **Strip-the-headline test** (§6).
- [ ] Coherence sweep · units sweep · read as a stranger · is it still fun?
      (Department of Fun retains veto.)

**Any checklist item expressible as an assertion about generated output must be
one.** The human checklist is for judgment, not grammar: three plural-agreement
failures shipped past a checklist that names the exact hazard.

## 13. Hermes' half — the pattern study (handoff brief)

Unchanged and still outstanding. Validate/extend §6 and §8 with observed mechanics
from publications that sustain identity across hundreds of editions. Study
mechanics, NOT phrasing. ~10–15 recent editions each, read in sequence, of 2–3 of:
Morning Brew, Axios, Economist Espresso, Chartr/Sherwood, Money Stuff. Deliver per
publication: opening cadence and hook length · section order and whether it varies
· story count and word budget · paragraph/sentence rhythm · where charts sit and
how captioned · humor boundaries · how they handle a no-news day · what makes
edition N recognizable from edition N+1. Then one page: patterns OOZEMeter should
adopt / adapt / reject, argued against this document.

## 14. Amendment rule

Changes by commit, on the public record, like the methodology. After lock,
changes require an operator decision — the robot expresses this voice; it never
edits it.

**No "always" rule is ACTIVE until the engine that publishes it emits it.** Each
item in §4 names its emitting surface and the test that asserts its presence. A
rule the Constitution states and no engine emits is a description of an
aspiration, and this document does not describe aspirations.

A rule may be **adopted but STAGED** — binding on every engine the moment its
blocker clears, and meanwhile listed in §16 with its blocker, its owner, and what
the engines print in the interim. **A staged rule that is not in §16 is not
adopted; it is a wish.** No rule may be staged twice: if a blocker outlives one
methodology revision, the rule is either implemented or struck.

**Amendments are derived from shipped payloads, never from study compilations.**
At least four findings in the August 2026 review were artifacts of the research
compiler rather than defects in the publication.

## 15. Corrections

The facility publishes its own errors the way it publishes its own gaps. A
correction states what was wrong, in which editions, for how long, what the figure
should have been, and what changed in the machine so it cannot recur. It carries a
date and is linked from every corrected report. **A correction is not an
embarrassment to be minimized; it is the strongest evidence the facility is what
it says it is.** *"Measures, does not prophesy"* is worth nothing if the
measurements are not checked in public.

*First exercise: `/files/correction-2026-08-archive-ounces/` — the archive's
ounce figures were printed on the wrong scale for roughly two hours on 2 August
2026.*

## 16. Staged rules register

Rules adopted by this document that no engine yet emits. Each is binding the
moment its blocker clears. Nothing may sit here silently: a staged rule prints its
interim behaviour, so a reader is never told something the engine cannot deliver.

| Rule | Blocker | Owner | Interim behaviour |
|---|---|---|---|
| §4 — observed value in the same sentence as every named line | `research/backtest-results.json` retains only `{month, ooze, stresses}`; raw observables are discarded in `scripts/backtest.js` | Codex, task 8 | Archive reports print rank, direction and ounces, and say plainly that point moves are line-stress changes rather than prices. No engine may print a bare observable-free claim as though it were complete. |
| §11 — the placement line (streak / trailing extreme / band crossing) | No engine reads a second row of its own history at render time; `lastAvailable()` walks back but nothing computes runs | Front-end | Editions carry the verdict line only. The placement slot is not faked with a one-month restatement. |
| §2/§6 — a weekly edition reports week-over-week change | `data/latest.json` stores only month-over-month `delta`; no engine retains a prior-week snapshot, so a weekly cannot say how far a weekly-cadence line moved in seven days | Codex | The edition prints the current level and states the limit in plain words rather than implying a weekly move it cannot measure. Caught in canonical edition 01 during review — the first sentence the locked Constitution killed. |
| §6 — one shared furniture library across every engine | `scripts/story.js` prints its own section names and byline; `scripts/backfill-reports.js` now calls `scripts/editorial-furniture.js` | Front-end | Both engines emit byline and confidence from the shared module; section names converge at the next story-engine revision. Until then the strip-the-headline test is expected to fail between the live seal and the archive, and that failure is tracked here rather than tolerated silently. |

**Active as of v1.0:** the byline and the confidence statement are emitted by
`scripts/editorial-furniture.js` and asserted present in 23 of 23 archive reports.
The fraction assertion, the empty-section guard, the whitespace guard, and the
disclosure guard run inside `scripts/backfill-reports.js` and stop the build.

## Appendix — what the corpus proved (2026-08-02)

**The identity, evidenced:** OOZEMeter is a facility that publishes what it
refuses to fake. Across 24 consecutive editions: 0 forecasts; the zero-weight
firewall restated in full words 12/12; the reconstruction label on three surfaces
23/23; percentile-against-full-history rather than any superlative; the emptiest
month given the best sentence.

**What it refuses to be, evidenced:** a forecast, a doom feed (six of eleven
household months described as boring, zero exclamation points), a personality (the
byline is an engine and a Division), a blend (the instruments are never averaged),
a ticker (the most violent month in the corpus contains no intensifier).

**The gap the amendments target:** the corpus was *about the instrument, not the
economy* — zero dollar signs and zero percent signs across 735 lines, no memory
past one month, and no governing idea in any of 23. §4's observed-value rule is
the load-bearing fix and requires the backtest to retain raw observables
(Codex task). Until it lands, the archive reports rank and direction honestly and
say what they cannot show.
