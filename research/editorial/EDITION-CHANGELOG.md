# EDITION CHANGELOG — rationale and updates

The permanent record of how OOZEMeter's editions change and why. Every entry
names what changed, the Constitution section or review finding that forced it,
and what a reader gains. **Archived editions are immutable**: a correction is a
new edition that says what the old one got wrong, never an edit to the old one.

---

## 2026-08-04 · Re-issue of the August 3 edition

**Folder:** `reports/editions/2026-08-04/` · **Replaces (does not edit):**
`reports/editions/2026-08-03/` · **Trigger:** board review verdict *"Do not
publish. Publish with named fixes, on a re-issue."*
(`research/board/BOARD-REVIEW-2026-08-03-july-edition.md`)

### Why a re-issue rather than a patch

The August 3 edition was the first real weekly the pipeline produced, and it was
good — it carried a governing idea, distinguished line-stress from contribution
points better than any engine had, and refused to subtract 26 from 37. It also
contained two false statements. Under §15 a correction is published, not
swapped in, so the original stays in the archive unchanged and this edition
states what it got wrong.

### The two corrections

**1 · "Breadth was unchanged" — withdrawn.**
The claim was never a measurement. `scripts/collect-market.js:115` reads
`market.json` as its prior value and line 137 writes that same file, so the
collector diffs the payload against the copy it is about to overwrite and the
delta collapses to zero. Verified across published breadth values 37 → 56 → 50:
the published delta is `0` in every one, including after the 2026-08-02 fix that
was supposed to address it.

This matters beyond one sentence: **breadth is the entire reason Ward M reads 37
rather than roughly 28.** Hold breadth at its June level and the composite lands
near 28. The August 3 edition's account — *"the official gauges cooled"* — was
therefore backwards about the month's driver, not merely incomplete.

The re-issue does **not** substitute a different number. The month-over-month
figure available from the research backtest (13 → 50) is built on a different
transform than the live gauge, so asserting it would trade a false zero for a
mixed basis. The edition states the level, states that the change is not
measured this cycle, and states why. That is §16's interim behaviour and §5's
prohibition on rendering a default as a measurement.

**2 · The June restatement — added.**
`data/vintages/` shows June reading 27 (prevOoze 30) under methodology 2.0.0 in
four successive vintages, and 26 (prevOoze 29) under 3.0.0 at
2026-08-01T15:24:45 — 38 minutes after the previous vintage, with identical gas
and housing inputs. The change was methodology v3 itself: a seventh weighted
line, all six other weights rescaled, and the calibration constants moved.

`data/revisions.json` quantifies it: **180 of 281 archived months moved, 64.1%
of the record, maximum move 2 points, 9 band-label flips.**

The August 3 edition contained the string "3.0.0" zero times and "revision" zero
times, and presented the restated pair as an observation. The pipeline's own
release gate said so — *"archive must identify methodology v3 before
publication"* — and was marked non-blocking. For a product whose differentiators
are frozen calibration and public corrections, publishing a restated number as
this week's news is the most damaging thing it can do quietly.

### The three additions

**3 · Observed values, everywhere a line is named** (§4, load-bearing rule).
The August 3 edition named seven household lines and six market gauges and
printed the value of none. The evidence packet contained fourteen and the prose
used one. The re-issue prints them with the date each was observed: `$4.10`
(July 27), `6.66%` (July 30), `2.9%` and `7.7%` (January 1), `4.2%` and `3.5%`
(June 1), `-0.54` (July 24), `$80`, `17.1`, `0.73pp`, `+0.5%`.

**Important qualification, and the reason this section is worded carefully:**
three of those seven household figures are *not* the observables that produced
June's score — gas, housing and financial conditions all carry as-of dates after
the scored month. The re-issue therefore prints them as current levels and
explicitly declines to attach them to contributions. §4 is **not yet satisfiable**
for those three lines; it becomes satisfiable when the scored-period observables
are retained (`research/codex/CODEX-DIRECTION-2026-08-04.md`, D-1 and D-2).

Rationale: a report whose numbers are all internal scores has cited nothing. A
reader can check `$4.10` at a gas station; nobody can check "11 line-stress
points."

**4 · "Household inputs current" — withdrawn** (§4).
It was printed on the reader's page over two January observations supplying 11
of the month's 26 points. Both *are* the latest existing releases — the quarterly
series has not reported — so the underlying flag is defensible as a term of art
and indefensible as reader-facing copy. Every line now carries its own as-of
date, and the edition says outright that 11 of 26 points rest on a January
observation.

**5 · The verdict line and the household paragraph — restored** (§6.2, §2.3).
Both are mandatory in every edition. The archive engine emits the verdict line
in 23 of 23 reports; the weekly engine dropping it was a regression, not a
deferral. *"Calmer than 6 of every 10 months since 2003"* is measured against all
281 months, not a chosen window, which is what makes it un-cherry-pickable and
the one sentence a reader can repeat to someone else.

### Structural changes

**Section names returned to the canonical seven** (§6, board ruling B-3). The
August 3 edition used nine names of its own — ONE-MINUTE BRIEF, Chart of the
Week, Something We Found Interesting, and so on. The board ruled that the order
*is* the accumulation and the names being ordered are themselves unauthorised. If
those blocks are wanted, they come through a §14 amendment applied to every
engine simultaneously. The seal, the verdict line, "What a household would
notice" and the close return regardless.

**The seal became a standing anchor rather than the lede** (board PART 4). The
household score changes once a month; this is a weekly. Rather than re-announcing
a static number as news, the seal now states plainly that it *has not moved since
the June seal and will not until July seals*, and the body carries what this
week's evidence actually is — levels.

**The cadence limit is stated in the edition, not hidden** (§16). *"This edition
cannot tell you how far any of those moved in the last seven days."* The facility
stores month-over-month change and retains no week-over-week snapshot. A weekly
that cannot measure a week must say so; the alternative is implying a move it
never observed, which is the exact failure that produced correction 1.

### What was deliberately kept

- The distinction between line-stress points and contribution points, and the
  sentence that rescues a reader from it. Three officers named it independently;
  without it a reader computes "gas fell 11, so 26 should be 15" and is wrong by
  nearly threefold.
- The refusal to compare 26 against 37 as a same-month figure, and the exact
  shared month (June: ward 30, jar 26, gap 4) as the honest comparison.
- The two-clocks observation — but rebuilt into §6b's anatomy (levels, then
  direction and size of change, then what the pair means), and reduced to one
  phrasing rather than two variants, per §7.
- The flat register: no exclamation points, no intensifiers, no forecast.

### Second-pass corrections (adversarial review of the re-issue itself)

The first draft of this re-issue was reviewed against the payloads and **rejected**
— eight false or self-contradicting statements. The published version fixes them.
Recorded because §15 applies to drafts that never shipped as much as to editions
that did:

- **The observed values did not produce the scores they were attached to.** The
  draft wrote *"the pump stands at $4.10 … which is 4 of the 26 points."* Gas's 4
  points came from June's monthly average; $4.10 is a July 27 print. Re-deriving
  all seven lines through the v3 anchors, exactly the three whose `asOf`
  postdates June fail to reproduce (gas, housing, financial). The published
  version separates the two facts and states that the July prints feed the *next*
  seal. Root cause is a data defect, not a writing one — see `research/codex/CODEX-DIRECTION-2026-08-04.md` D-1.
- *"Second-lightest contribution"* for employment — false; it is third of seven,
  ahead of inflation at 2 oz and financial conditions at 0 oz. The August 3
  edition made the same mistake in the same sentence.
- *"Five of its six gauges cooled or held"* — four cooled, one rose, one is
  unmeasured. Counting breadth as "held" is the exact falsehood the re-issue exists
  to retract.
- The seal said the score *"has not moved since the June seal"* two lines above
  the paragraph explaining that it moved. Reworded to distinguish a new
  observation from a restatement.
- *"No household line posted a new observation this week"* — `updateStatus`
  compares against the previous collection run, not a week.
- Interval arithmetic: "three days" vs "34 hours" for the same gap; "four days
  ago" for a July 30 observation as of August 4.
- §15 required elements added: how long the wrong edition stood, and the fact
  that **nothing in the collector has been fixed yet**.
- Restored from the August 3 edition: the seal's delta, the unit-firewall
  sentence in body position rather than only in METHODOLOGY, the month-over-month
  movers, and a Ward M firewall sentence that the August 3 edition never had.

### Open items this edition does not fix

| Item | Owner | Why not now |
|---|---|---|
| Prior-cycle snapshot store so deltas mean "since last edition" | Codex | Architectural; the collector must not diff against a file it overwrites. Same defect at `collect-market.js:91` manufactures a zero delta for all five FRED gauges when a prior month is absent |
| `validation.json` reporting non-blocking gate failures | Codex | `weekly-brief.js:226` filters `gate.blocking && !gate.ok`, so a non-blocking failure can never appear; `weekly-package.js:36` hardcodes both gates non-blocking |
| The remaining methodology-v3 gate failures | Codex | 19 enumerated in `operator-appendix.txt`; the NFCI zero-weight items are fixed, the rest are open |
| Release-calendar fact in the evidence packet | Codex | The close names "mid-August" from editorial knowledge rather than a keyed fact. A BLS release calendar is acquirable, not a forecast |
| Placement line (streaks, extremes, band crossings) | Front-end | §16 staged — no engine reads a second row of its own history at render time |

---

## Standing rules for this log

1. One entry per edition that changes anything a reader sees.
2. Every change cites the Constitution section or review finding that forced it.
3. Corrections state what was wrong, for how long, and what changed in the
   machine so it cannot recur (§15).
4. An archived edition is never edited. If it was wrong, the next edition says so.
