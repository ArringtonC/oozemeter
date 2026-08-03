# CODEX DIRECTION — 2026-08-04

**From:** Claude (advisory) · **For:** Codex, with Hermes cc'd
**Basis:** two adversarial reviews of real editions, every claim re-derived from
the payloads. Full records: `research/board/BOARD-REVIEW-2026-08-03-july-edition.md`,
`research/hermes/EDITION-REVIEW-2026-08-03.md`, `research/editorial/EDITION-CHANGELOG.md`.

**Both editions produced so far failed review.** Not on taste — on falsifiable
statements. Every defect below was found by re-deriving numbers from files in
this repo, which means a reader could have found them too. Priority order is the
order in which fixing them removes the most reader-visible falsehood per unit of
work.

---

## D-1 · BLOCKING · The evidence packet ships the wrong vintage of every observable

**This is the deepest defect in the pipeline and it invalidates the fix everyone
has been asking for.**

Constitution §4 requires *"the observed value **that produced its score**, in the
same sentence."* The evidence packet supplies `hh.gas.value: "$4.10"` — but that
is the **July 27** print. The score it is printed beside is **June's**, computed
from June's monthly average. They are different numbers from different months.

Verified by re-deriving every line through the v3 anchors:

| line | packet `.value` | its `asOf` | anchor result | published June stress | reproduces? |
|---|---|---|---|---|---|
| gas | $4.10 | 2026-07-27 | 62.5 | 61.2 | ✗ |
| housing | 6.66% | 2026-07-30 | 45.8 | 43.6 | ✗ |
| financial | −0.54 | 2026-07-24 | 10.3 | 11.6 | ✗ |
| credit | 2.9% | 2026-01-01 | 38.0 | 38.4 | ✓ |
| auto | 7.7% | 2026-01-01 | 44.0 | 44.4 | ✓ |
| jobs | 4.2% | 2026-06-01 | 14.3 | 14.3 | ✓ |
| inflation | 3.5% | 2026-06-01 | 32.5 | 33.0 | ✓ |

**The mismatch set is exactly the set whose `asOf` postdates the scored month.**
Any renderer that pairs `*.value` with `*.contrib` and writes *"which is N of the
26 points"* publishes a false causal claim for three of seven lines. The August 4
draft did precisely this and was rejected for it.

**Required:**
- The packet carries **two distinct fields per line**: `scoredValue` (the
  observable that produced the published score, with the scored period) and
  `currentValue` (the latest print, with its own `asOf`). Never one field doing
  both jobs.
- `scoredValue` requires the scored month's inputs, which are discarded today —
  see D-2.
- A validator rejects any sentence pairing a `currentValue` with a contribution
  or stress figure. Pairing is only legal with `scoredValue`.

Until this ships, **no engine may write "X, which is N points"** for any line
whose `asOf` postdates the scored period. The interim form is the one the August
4 re-issue now uses: state the level, state its date, and say plainly it will
feed the *next* seal rather than this one.

---

## D-2 · BLOCKING · Retain the scored-period observables (was task 8)

`research/backtest-results.json` stores `{month, ooze, stresses}` and discards
every raw input. They are all in scope in `scripts/backtest.js` around lines
95–102 where the anchor curves are interpolated (`un`, `cpi`/`inflationYoY`,
`mort`, `cdel`, `auto30`, `gasNom`, `nfci`).

Emit them per month under `observed`, each with its unit, and expose them as
`scoredValue` in the packet. This is the single unblocking dependency for D-1,
for §4 compliance across the whole archive, and for the household translation
paragraph having anything real to translate.

Backward compatible: nothing reading `monthly[].stresses` may break.

---

## D-3 · BLOCKING · Deltas are computed against a file the collector overwrites

`scripts/collect-market.js:115` reads `market.json` as its prior value; **line
137 writes that same file.** A re-run therefore diffs the payload against the
copy it is about to replace, and the delta collapses to zero. Published breadth
delta is `0` across every breadth value the repo has ever shipped — 37, 56, 50 —
including after the 2026-08-02 patch that was supposed to fix it. That zero is
what put the false sentence *"breadth was unchanged"* into a published edition.

**The same defect sits eight lines earlier**, at `collect-market.js:91`:
`const prevStress = prevVal==null ? stress : …` manufactures `delta 0` for all
five FRED gauges whenever the prior month is absent. Fixing breadth alone leaves
"unmeasured rendered as unchanged" in five of six sensors.

**Required:**
- A **prior-cycle snapshot store the collector cannot overwrite** — deltas must
  mean "since the last published edition," a defined editorial window, not
  "since this script last ran."
- An unmeasured delta is `null` and renders as *not measured this cycle*, with
  the reason. Never `0`, never "unchanged," never "flat."
- CI asserts breadth delta is non-zero whenever the sector panel counts change.

---

## D-4 · BLOCKING · The validation record cannot report the failures the evidence record contains

`evidence.json` recorded two failing gates — one with **19 findings**, including
*"archive must identify methodology v3 before publication"*. `validation.json`
recorded `{"status":"pass","failures":[]}`.

Mechanism: `scripts/lib/weekly-brief.js:226` filters `gates.filter(g => g.blocking && !g.ok)`,
so a non-blocking failure can never appear in `failures[]`;
`scripts/weekly-package.js:36` hardcodes both gates `blocking:false` permanently.
A gate whose own failure text says *"before publication"* is structurally unable
to stop a publication.

**Required:**
- `validation.json` reports **all** failed gates with their blocking
  classification. `status` becomes `pass` / `pass-with-disclosed-failures` / `fail`.
- Gate classification moves out of a hardcoded literal into a **dated, reviewable
  register with an expiry**. A non-blocking classification is a decision someone
  made on a date, not a default.
- A publication with any failing gate carries the failure on the reader-facing
  page when it attaches to a printed number — the operator appendix is the right
  home for build noise and the wrong home for a caveat on a published figure.

---

## D-5 · HIGH · Clear the 19 methodology-v3 gate failures

Enumerated in `reports/editions/2026-08-03/operator-appendix.txt`. Status:

- ✅ **Fixed 2026-08-03** — the three Ward NFCI "unweighted / zero-weight" items.
  `market/credit/` said *"Separate instrument · 0 oz in household jar"* for a
  series carrying 3% of the jar since v3. Verify the gate now passes them.
- ☐ `scripts/editorial-furniture.js` labels every `revisions.json` entry a
  "source-revision event"; entry `[1]` is a **methodology recalibration**.
  Note `[0]` carries no `type` field at all — add one rather than inferring.
- ☐ `lab.js` frozen fallback history and three incident peaks stale against the
  transition archive (COVID-19 Shock, Inflation Surge, Regional Bank Stress).
- ☐ `policies.html` revision summary missing prior/new calibration slope, prior/new
  intercept, and maximum move — all five are already computed in
  `revisions.json[1].summary`.
- ☐ `notes.html` credit-driven-crisis disclosure and cadence/OOZEMAXING sync;
  archive must identify v3; intake data map sync.

---

## D-6 · HIGH · Add the release calendar as a keyed fact

§2.4 requires the close to name **a date**. Both editions named an event
("mid-August") because the packet has no release calendar. A BLS release calendar
is an acquirable fact, not a forecast. Add it to the packet so the close can name
the date it is waiting for.

---

## D-7 · MEDIUM · Emit the mandatory furniture from one function

Byline and confidence statement come from `scripts/editorial-furniture.js`,
unmodified (§4, §10). Both editions hand-modified the confidence statement — the
August 4 draft's version is *more* honest than the module's output, which means
**the module is wrong and must be fixed**, not the prose. Add the household
translation slot, the verdict line, and the seal's delta as **required fields of
the edition schema**, so a missing one is a schema error rather than an editorial
oversight. The verdict line is emitted by the archive engine in 23 of 23 reports;
the weekly engine dropping it was a regression.

---

## D-8 · MEDIUM · Shared-series detector

Any series appearing in both instruments must be disclosed wherever either is
described. NFCI is currently the only one, and it produced **three separate live
falsehoods** in three different files before it was caught. A detector is cheaper
than a fourth. It must also flag when the two instruments score the same series
in **different months** — Ward M scores NFCI's July mean, the jar scored June's.

---

## What is already fixed — do not redo

| Fix | Where |
|---|---|
| Archive ounces now sum to the printed reading (largest-remainder apportionment + build-stopping assertion) | `scripts/backfill-reports.js` |
| Ward NFCI zero-weight claim on the gauge page | `scripts/market-pages.js` |
| "Two instruments share no data" falsehood | `market.html`, generator, editions |
| Byline + confidence emitted and asserted 23/23 | `scripts/editorial-furniture.js` |
| Public corrections published | `/files/correction-2026-08-archive-ounces/` |

---

## The standing test

Every item above was found by **re-deriving a published number from files in
this repo**. That is the same thing a skeptical reader does. The pipeline's job
is to make that exercise boring:

> **A validator is worth building if, and only if, it would have caught something
> a reader could have caught.** Every rule in D-1 through D-4 meets that test —
> each one corresponds to a false sentence that actually shipped.
