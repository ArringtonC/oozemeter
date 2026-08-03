# EDITION REVIEW — 2026-08-03 · THE OOZE REPORT

**Reviewer:** Claude (advisory) · **Reviewed:** `reports/editions/2026-08-03/`
**Against:** Editorial Constitution v1.0 (LOCKED) + the payloads, independently
re-derived. **The archived edition is immutable — nothing in it was edited.**
All improvements below belong in a new draft.

**Verdict: the strongest OOZEMeter edition yet produced by any engine, and it
must not publish again unchanged.** It solved a problem 23 archive reports and
both of Claude's canonical drafts failed to solve. It also shipped one false
sentence and left the best evidence packet the project has ever built almost
entirely unused.

---

## 1 · What this edition got right — preserve these deliberately

These are not compliments; they are **behaviours to encode before anything else
changes**, because they are rarer than the defects.

**1.1 — It has a governing idea, and it is the right one.** *"OOZEMeter has two
clocks."* The corpus review found **zero governing ideas across 23 archive
reports** — the single largest editorial gap in the project. This edition opens
with one, sustains it through "Chart of the Week — Two meters, two clocks," and
lands it in "Something We Found Interesting." It is also *the most important
structural fact about the product*: the two instruments are on different release
calendars and a naive comparison is wrong. No engine had ever said so.

**1.2 — Unit discipline better than the Constitution's own author managed.**
*"Gas pressure fell 11 line-stress points and inflation pressure fell nine. Those
are changes inside the component readings, not points subtracted directly from
the headline score."* That sentence pre-empts the single most likely reader
error, and the METHODOLOGY footer repeats the distinction. §3's unit lock is
satisfied more thoroughly here than in `canonical-editions/01`.

**1.3 — Ties reported as ties** (§10): *"Housing and credit remained tied as the
largest current contributions."* No false ranking.

**1.4 — Subject form is correct** (§4): *"Gas pressure fell…"*, not *"gas fell."*

**1.5 — The firewall and the no-forecast promise are both kept** (§5): *"does not
affect the household score"* and *"it does not forecast the economy."*

**1.6 — The evidence architecture is real.** `evidence.json` is hash-chained,
records every gate it ran with its command and blocking status, and keys every
fact with a **unit**, an **asOf date**, and a **basis**. `divergence.value` even
carries `"basis": "exact-shared-month"`. **This is Epic 1 substantially
delivered**, and it is better than the roadmap asked for.

---

## 2 · THE FINDING — the pipeline collects the evidence and the prose throws it away

**The evidence packet contains 14 observed values. The edition uses 1.**

Present in `evidence.json`, keyed, united, dated — and absent from the prose:

| Available in evidence | Used in edition |
|---|---|
| `hh.gas.value` **$4.10** · `hh.housing.value` **6.66%** · `hh.credit.value` **2.9%** · `hh.auto.value` **7.7%** · `hh.jobs.value` **4.2%** · `hh.inflation.value` **3.5%** · `hh.financial.value` **−0.54** | none |
| `market.energy.value` **$80** · `market.volatility.value` **17.1** · `market.credit.value` **−0.54** · `market.rates.value` **0.73pp** · `market.dollar.value` **+0.5%** · `market.breadth.value` **6/11 steady** | none |
| `divergence.value` **4** | ✅ used |

This is §4's load-bearing rule — *no line is named in prose without the observed
value that produced its score, in the same sentence* — and the reason 23 of 24
published reports were **about the instrument rather than the economy**. A reader
finishes this edition knowing OOZEMeter's arithmetic and not one fact about their
own life. Gas is named four times; the pump price appears zero times.

**Why this changes the roadmap:** Epic 2 (Observed Value Support) assumed a data
problem requiring backtest changes. For the weekly path **the data problem is
already solved** — the observables are in the packet. This is a **renderer**
problem, and it is the cheapest high-value fix available.

**Fix:** every sentence naming a line must interpolate its `*.value` alongside
its delta. *"Gas pressure fell 11 line-stress points, with the pump at $4.10 a
gallon"* — same fact, now checkable at a gas station.

---

## 3 · The false sentence

> *"Dollar stress rose three, while **breadth was unchanged**."*

`market.breadth.delta` was `0` in the payload — **but that zero was a hardcoded
literal**, never a measurement (`scripts/collect-market.js`, corrected
2026-08-02). Sector Watch is a manual collection with no prior snapshot, so the
collector could not know whether breadth moved. The market backtest shows breadth
went **13 → 50**, the largest move on the panel and the entire reason the ward
rose.

**The edition is faithful to the payload. The payload was wrong.** That is the
important lesson and it belongs in the validator spec:

> **Faithfulness to an upstream payload is not truth.** A renderer that prints
> whatever it is handed inherits every upstream lie. Any claim of *no change*
> must be sourced from a measured delta, never from a default, a placeholder, or
> a missing field.

The collector now emits `null` rather than `0` when there is no prior reading.
**A `null` delta must render as "not measured this cycle," never as "unchanged."**

---

## 4 · The alarm nobody heard

`validation.json` reports **`"status": "pass"`, `"failures": []`** — on an edition
containing a false sentence and violating six Constitution rules.

Meanwhile `evidence.json` records **two gates that FAILED and were marked
non-blocking**, and the edition published anyway:

- `divergence-history freshness` → *"Market backtest acquisition is not current
  for this evidence cycle"* — i.e. the divergence figure the edition builds its
  governing idea on was computed from a non-current acquisition.
- `methodology v3 publication` → **nineteen distinct failures.**

Two of those nineteen independently confirm defects found by Claude's adversarial
review of the canonical editions, from a completely different direction:

- *"OOZEBOT confidence copy does not distinguish methodology recalibration"* —
  `data/revisions.json[1]` is a methodology recalibration, and
  `scripts/editorial-furniture.js` labels every entry a "source-revision event."
- *"Ward NFCI explanation still says the line is unweighted"* (×3 variants) — the
  shared-input falsehood, in a third location. **Now fixed:** the Ward M credit
  gauge page said *"Separate instrument · 0 oz in household jar"* and *"This
  gauge does not affect the household Ooze Score"* for a series that carries 3%
  of the jar since v3. Both corrected in `scripts/market-pages.js`.

**A gate that reports nineteen failures and does not block is not a gate.** The
release gate is doing excellent work and is wired to be ignored.

---

## 5 · Constitution violations (new draft must fix)

| § | Rule | Status |
|---|---|---|
| §4 | Observed value in the same sentence as every named line | **FAIL** — 1 of 14 used (§2 above) |
| §2.3 / §6.6 | *"What a household would notice"* — marked **Always** | **MISSING ENTIRELY.** No sentence describes a lived experience. Same failure as `canonical-editions/02` |
| §10 | Verdict line — historical placement against the full record | **MISSING.** *"calmer than 6 of every 10 months since 2003"* is the one sentence a reader can repeat to another person, and both engines independently made it first-class. Absent here |
| §4 | OOZEBOT byline, emitted by the shared function | **MISSING** |
| §10 | Confidence statement from `scripts/editorial-furniture.js` | **PARTIAL** — *"Evidence status: Household inputs current; Ward M anchors provisional"* is good but is not the shared function's output: no methodology version, no revision count |
| §3 | Glossary at first use — *the jar*, *ounces*, band names | **FAIL** — *"Sticky territory"* ships without its mandated gloss *"the band where normal economies live"*; *"The jar got lighter"* is the first and only use of the term, unglossed |
| §5 | Shared-input disclosure | **MISSING** — the edition prints Ward M's *"credit and funding"* and the household's *"credit"* in adjacent paragraphs. These are different things (NFCI vs card delinquency), while the household's `financial` line **is** NFCI. High collision risk, no disclosure |

---

## 6 · Where the Constitution is wrong, not the edition

**§6's anatomy assumes one instrument per edition. This is a combined two-wing
weekly.** The seven canonical section names cannot be applied verbatim to a
document that carries a household seal *and* a market composite *and* a
divergence, and demanding it would make the edition worse.

The edition's own furniture — ONE-MINUTE BRIEF / HOUSEHOLD OOZE / WHAT CHANGED /
MARKET OOZE / Chart of the Week / Something We Found Interesting / What We're
Watching / THIS EDITION AT A GLANCE / METHODOLOGY — is coherent and reader-first.

**This is an amendment need, not a defect.** Recommendation for the operator:
adopt **§6d — Combined Edition anatomy**, ratifying this structure with the
mandatory elements mapped into it (household translation, verdict line, byline,
confidence). Claude will draft it on request; it is an Editorial Decision, not an
engineering task, and it should not block Sprint 1.

---

## 7 · INSTRUCTIONS FOR CODEX — in priority order

### C-1 · BLOCKING — make the non-blocking gates blocking
`evidence.json` shows `methodology v3 publication` failing with 19 items and
`divergence-history freshness` failing, both `blocking: false`. **No edition may
publish while a gate reports failures.** Either the gate is right and publication
stops, or the gate is wrong and it is fixed — "non-blocking failure" is neither.
Add a third state if genuinely needed (`ADVISORY`), but it must be a deliberate,
per-failure, logged decision, never a default.

### C-2 · BLOCKING — clear the 19 methodology-v3 failures
They are real and enumerated in `operator-appendix.txt`. Highest value first:
1. Ward NFCI zero-weight claims — **front-end portion fixed 2026-08-03**; verify
   the gate now passes those three checks and fix any remaining generator path.
2. `scripts/editorial-furniture.js` must distinguish *source revision* from
   *methodology recalibration* (`data/revisions.json[1]`).
3. `lab.js` frozen fallback history + incident peaks stale vs the transition
   archive (COVID-19 Shock, Inflation Surge, Regional Bank Stress).
4. `policies.html` revision summary missing prior/new calibration slope and
   intercept and maximum move.
5. `notes.html` credit-driven-crisis disclosure + cadence/OOZEMAXING sync;
   archive must identify methodology v3; intake data map sync.

### C-3 · HIGH — null-delta semantics, end to end
A `null` delta means **not measured**. It must never render as *"unchanged,"*
*"flat,"* or `0`. Add: a validator rejecting any *no-change* claim whose source
fact is `null` or absent, and a renderer branch printing *"not measured this
cycle"* with the reason.

### C-4 · HIGH — consume the observed values (§4)
Every line named in prose interpolates its `*.value` from the evidence packet in
the same sentence as its delta. Validator: for every `hh.*.delta` or
`market.*.delta` referenced in the rendered text, assert the corresponding
`*.value` appears within the same sentence. **This alone converts the edition
from a report about the instrument to a report about the economy.**

### C-5 · HIGH — make `validation.json` mean something
Today it validates hashes and gate execution. It must run the Epic 3 validator
suite and enumerate rule-level failures with `{rule, section, expected, actual,
location}`. A `"pass"` on an edition containing a false sentence is worse than no
validator, because it manufactures confidence.

### C-6 · MEDIUM — emit the mandatory furniture
Byline and confidence statement from `scripts/editorial-furniture.js`, unmodified
(§4, §10). Add the household-translation slot and the verdict line as **required
fields of the edition schema**, so a missing one is a schema error rather than an
editorial oversight.

### C-7 · MEDIUM — shared-series detector
Any series appearing in both instruments must be disclosed wherever either is
described. NFCI is currently the only one. This is the class of bug that produced
three separate live falsehoods; a detector is cheaper than a fourth.

### C-8 · LOW — glossary at first use
Ship the band gloss verbatim: *"That is Sticky territory — the band where normal
economies live."* Gloss *the jar* and *ounces* on first use per §3.

---

## 8 · HOW THE FLOW IMPROVED — for Codex and Hermes

State this plainly because it is the point of the whole exercise:

**Before (2026-07):** a generator wrote prose from live payloads. Nothing checked
the prose. Two live falsehoods reached readers — a false part-of-whole in 11
reports, and a firewall claim that had been false since methodology v3 — and both
were found by *reading*, weeks later.

**Now (2026-08):** an edition is built from a **hash-chained evidence packet**
whose facts carry units, as-of dates, and bases; **gates run and are recorded
with their commands and output**; the edition, the evidence, and the approval are
**separately hashed and archived immutably**; and an **operator appendix**
separates operational evidence from reader content.

**That architecture caught things reading did not.** The methodology-v3 gate
independently found the same `editorial-furniture.js` defect and the same
NFCI-weight falsehood that a five-lens adversarial review found from the other
direction. Two independent methods converging on the same defects is the
strongest signal available that the system is working.

**The three gates, restated:**

- **Gate 1 — Editorial: PASS.** Constitution v1.0 LOCKED. Identity established.
  Corrections policy written and exercised twice in public.
- **Gate 2 — Engineering: FAIL, and further along than the roadmap assumed.**
  Epic 1 (evidence packet) is substantially delivered. Epic 2 is **already solved
  for the weekly path** — the observables are in the packet; only the renderer
  ignores them. Epic 3 (validators) does not exist yet and is now the critical
  path.
- **Gate 3 — Publication: FAIL.** This edition would not pass a real validator.
  It is the best draft yet and it is a draft.

**The standing division:** Claude defines the publication (advisory; changes come
through the Constitution and Editorial Decisions). Hermes builds the publication.
Codex implements the data pipeline. **A gate that fails must stop a publication,
or it is decoration.**

---

## 9 · Recommended next draft

Regenerate `2026-08-04` (new folder, archived edition untouched) with C-3, C-4
and C-6 applied. Keep verbatim: the two-clocks governing idea, the line-stress vs
contribution-points distinction, and the tie handling. Add: observed values in
every line sentence, a household-translation paragraph, the verdict line, the
byline, and the full confidence statement. Then re-run the gates with C-1 in
force and see what actually stops it.


---

## 10 · BOARD ADDENDUM (2026-08-03) — three findings that OVERRULE or EXTEND this review

The four-officer board reviewed the same edition after this document was written. Full
report: `research/board/BOARD-REVIEW-2026-08-03-july-edition.md`. Three rulings change the
instructions above.

### B-1 · NEW BLOCKING — the June score was RESTATED and the edition never says so
**This review missed it entirely.** `data/vintages/` shows June reading **27** (prevOoze 30)
under methodology 2.0.0 in the vintages of 07-26, 07-28, 07-30 and 08-01T14:46:40 — and
**26** (prevOoze 29) under 3.0.0 at 08-01T15:24:45. Thirty-eight minutes apart, identical
gas and housing inputs; the change is v3 itself (seventh weighted line, all weights rescaled,
calibration moved). `data/revisions.json` quantifies it: **180 of 281 months moved, 64.1% of
the archive, 9 band-label flips.**

The edition contains "3.0.0" zero times and "revision" zero times, and line 11 presents the
restated pair as an observation. The pipeline's own gate said so — *"archive must identify
methodology v3 before publication"* — and was marked non-blocking.

**Codex:** the seal must carry the methodology version; one sentence must quantify the
restatement from `revisions.json` (the numbers are already computed); METHODOLOGY names the
version and links the revision log; the five `policies revision summary` fields ship.

### B-2 · C-3 IS INSUFFICIENT — the breadth zero is self-referential, and it is not alone
**The board ruled against this review's C-3.** Rendering `null` as "not measured" does not
fix it, because the collector does not emit null here — it computes a *finite zero*.
`scripts/collect-market.js:115-116` reads `market.json` as its prior; **line 137 writes that
same file**. A re-run therefore diffs the payload against the copy it is about to overwrite,
and the delta collapses to 0. Verified across published breadth values 37 → 56 → 50: the
published delta is `0` in every one.

**And the same defect sits at line 91** for all five FRED gauges:
`const prevStress = prevVal==null ? stress : …` manufactures `delta 0` whenever the prior
month is absent. **Fixing breadth alone leaves "unmeasured rendered as unchanged" in five of
six sensors.**

**Codex:** source deltas from a **prior-cycle snapshot store the collector cannot
overwrite**. CI asserts breadth delta is non-zero whenever the sector panel counts change.
Fix line 91's null-coalescing to emit an unmeasured delta rather than zero.

### B-3 · §6d IS WITHDRAWN — restore the seven canonical section names
This review recommended ratifying the edition's nine blocks as a new "Combined Edition"
anatomy. **The board overruled it:** the order *is* the accumulation, and the names being
ordered are themselves the unauthorised part. If the operator wants ONE-MINUTE BRIEF and
Chart of the Week, that is a §14 amendment applied to every engine simultaneously — but the
seal, the verdict line, "What a household would notice" and the close return regardless.

**Also ruled:** the verdict line is a **regression, not a deferral** — §16 stages the
*placement* line (§11) and explicitly sets the interim behaviour as *"editions carry the
verdict line only."* The archive emits it 23/23. The weekly engine dropped it.

### B-4 · Cadence ruling (see board PART 4)
**Weekly is ratified — but the spine moves.** The sealed monthly score becomes a standing
anchor block (*"unchanged since the June seal"*); the lead becomes what this week's evidence
actually is: **levels**. Note the payload does not currently contain a weekly — every
household line reads `updateStatus: "no-new-release"` except `financial`, which contributes
zero points. **Hard precondition owned by Codex:** a prior-cycle snapshot store, or the
cadence claim is not legitimate and the board's answer reverts to monthly.
