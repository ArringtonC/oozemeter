# 00 — CONSOLIDATED VERDICT

**Agent 9 · Chief Scientist / Editor · 2026-08-14 · read-only**
**Inputs:** twelve forensic reports, `01`–`12`, read in full.
**Method:** I re-verified every claim I act on against the actual files in the working tree.
Where two agents disagree, I decide and record the disagreement rather than averaging it.
Nothing in this document is a recommendation to ship unless it clears the acceptance
criteria stated in §16.

---

## 1. EXECUTIVE VERDICT

OOZEMeter is an honestly-engineered instrument that currently publishes four kinds of
falsehood on its own pages, and whose published recipe cannot reproduce its published
number. Neither problem is in the arithmetic.

Five independent agents rebuilt the scoring path from raw FRED and reproduced **282 of 282
published months exactly, zero mismatches** (`01`, `02`, `09`, `11`, `12`). The July 2026
reading of 26 is arithmetically correct, traceable to public series, atomically written,
fingerprinted, and gated. That is rarer than it sounds and it should not be rebuilt.

What is wrong sits in four layers, in descending order of how fast it must be fixed:

**Layer 1 — live falsehoods.** `feed.xml:29` is shipping the literal string `{{s:2026-07}}`
to RSS subscribers right now (verified). Three indicator pages print a "Today's …" number
that contradicts the live number rendered 26 lines above it on the same screen — gas says
$3.42 against a live $4.01, credit says 3.2% against 2.9%, jobs says 4.4% against 4.1%
(verified in `lab.js:42,66,90`). Two of those sentences additionally assert a **direction
that is the reverse of the data**: credit "has been climbing steadily" against seven
consecutive quarterly declines, and jobs "the direction of travel is what raises this
line's pressure" against a published delta of −1 on the same page. `about.html` promises
"No fake numbers, ever" while `states.html` ranks 50 fabricated state scores into a podium
and `sitemap.xml:9` submits it to search engines. Ward M's frozen calibration exists twice
and the two copies already disagree on 11 raw values.

**Layer 2 — the recipe does not reproduce the number.** `notes.html:38` publishes exactly
one household anchor point against nine anchor tables in `scripts/collect.js:37-48`, and
never states that two of the seven lines are a `Math.max()` of two different series. The
same page publishes Ward M's *complete* breadth formula with a worked example and the
sentence "Every number on the ward card reproduces from this paragraph." The zero-weight
experimental wing is more reproducible on-site than the flagship. Meanwhile the ounces the
reader is shown are a proportional split of the calibrated score, not marginal effects —
they are **1.911× low, identically for all seven lines** — and `what-is-ooze.html:87`
renders them as `+N`, which invites exactly the wrong reading (verified).

**Layer 3 — the instrument measures a narrower thing than it claims.** 58.2% of the weight
sits on lagging balance-sheet measures and 0% on purchasing power. That single hole is the
mechanism behind every documented false negative: December 2021 printed the lowest reading
in the 282-month record in the month CPI hit 7.04%; June 2022 printed 19 with CPI at 9.1%.
It is firing again — real average hourly earnings crossed zero this year and the inflation
line *fell three points* in the same month, because 3.36% CPI scores lower on the U-curve
than 4.0% does.

**Layer 4 — the archive is not what a reader thinks it is.** The gas line deflates every
historical month to *today's* dollars. Against a real-time reconstruction that is a
**+4.09-point average one-directional look-ahead**, and it manufactures all four non-crisis
false positives in 23 years — 2003-02/03, Katrina 2005-09, 2006-05 and 2006-07 read 43, 36,
38 and 39 at the time and none reaches the alarm level. Separately, two of the seven
weighted lines are fed by products that did not exist during the crisis the scale is
calibrated on: the NY Fed Consumer Credit Panel was created in 2009 and NFCI's earliest
ALFRED vintage is 2011-05-25, so the collector's own rule would have skipped 99 of 282
published months. No surface says any of this.

**The single most important structural finding**, which only emerged from cross-reading
`10` and `11`: **the calibration doctrine "GFC peak → 90" structurally suppresses any input
whose current level exceeds its GFC level — and that is precisely the class of input the
economics audit is asking for.** Small-bank card delinquency is 15% above its own 2008 peak;
student-loan 90+ delinquency went from 0.65% to 10.60% with no GFC analogue at all. Swapping
in the "right" series under the project's own recalibration doctrine recovers roughly a
quarter of the signal, because the doctrine absorbs the rest. This is why the answer is
**disclose, do not reweight** — not squeamishness, arithmetic.

Verdict on the work queue: **almost everything worth doing costs nothing and touches no
number.** The P0 list in §17 is fourteen items, all of them either deleting a false string,
resolving a token, importing a constant, or removing a line from a workflow. Not one of
them restates a published score.

---

## 2. WHAT OOZEMETER DOES EXCEPTIONALLY WELL

Reported as prominently as the failures, because rebuilding any of these would be a
regression.

1. **The arithmetic is exactly reproducible from raw sources.** Five agents, five
   independent implementations, 282/282 months, 0 mismatches. `01` reproduced the 2026-07
   gas stress to three decimals (58.306 vs 58.30625). `09` reproduced the composite to
   25.71 → 26 before attacking anything. This is the foundation everything else in this
   document stands on.

2. **`tests/backtest.integration.test.js` is the best single artifact in the repo.** It runs
   the collector *and* the backtest live and asserts they publish byte-identical monthly
   history, daily, in CI. It is the reason the two duplicated anchor tables have not drifted.

3. **The frozen calibration with drift monitoring** (`scripts/lib/methodology.js:21-27`).
   Publishing with frozen constants while re-deriving to *measure* drift is genuinely good
   discipline, and the comment explaining why is better than most published methodologies.
   Current drift is 0.0001 on the slope.

4. **NSA CPI is the right choice and was chosen for the right reason.** `CPIAUCNS` with
   same-month YoY cancels seasonality by construction and is *never revised*, where
   `CPIAUCSL` is re-seasonalised annually. `12` verified this directly: an ALFRED vintage
   from 2003-03-20 matches current FRED on all 14 months it covers, exactly. Two agents
   independently tried to make SA/NSA mixing into a defect and both concluded it is not one.

5. **`max(unemployment, claims)` earns its place.** In March 2020 the claims arm carried the
   entire signal — employment stress 96 while U-3 was still 4.4. Without it, March 2020 would
   have read like a normal month. The arm-binding record is state-dependent, not decayed:
   95% of months 2003-09, 18% in the 2010s, **60% since 2020**.

6. **The zero-weight auxiliary pattern already exists and works.** `scripts/collect.js:177-185`
   ships `contributesToOoze:false`, `scoreWeight:0`,
   `calibrationStatus:'provisional-auxiliary'`. Every diagnostic recommendation in this
   document reuses it. Nothing new needs to be built.

7. **Fail-closed parsing.** `fred.js:49` enforces the CSV header and throws on FRED's bot-block
   HTML page. `fred.js:28` rejects non-increasing dates. Numeric parsing is regex-validated;
   `"."` is skipped, never coerced to 0. Writes are atomic. The NY Fed XLSX parser throws on
   every shape change. There is no silent-fallback path anywhere in the ingestion layer.

8. **The gates are adversarial where they exist.** `integrity.js:95-101` fails the build if the
   GFC peak leaves 90±2 or the calm floor leaves 10±2. `market-integrity.js` deliberately
   *re-derives* the Sector Watch rules rather than importing them — a correct use of
   duplication inside a gate. `tests/market-output.test.js` tests rollback on a second rename
   failure.

9. **The gas line's historical *levels* are economically correct.** `09` tried to kill them and
   failed: jar gas stress correlates **0.973** with minutes-of-work-per-gallon
   (`GASREGW ÷ AHETPI × 60`), a deflator-free affordability measure. Gasoline in 2012
   genuinely cost 63% more work-time than today. The 2011-2013 readings of 86-93 are right.
   Report the refutation as loudly as the deflator finding.

10. **The verdict line is the pattern the rest of the prose should be held to.** "Calmer than
    6 of every 10 months since 2003" is a percentile against the full record, not a
    superlative, and it computes correctly (179 of 282 = 63.5%). The contribution self-check
    passes: 4+7+6+5+2+2+0+0+0 = 26.

11. **`market.html` has the strongest editorial discipline on the site.** Its divergence
    paragraph refuses causality four separate times, and its gauge cards carry AUX badges the
    household header does not.

12. **The revision detector itself.** Catching and publishing your own restatements is rare
    and right. The problem is the *label*, not the mechanism.

---

## 3. CRITICAL WEAKNESSES

Ranked by whether a knowledgeable reader who checks would lose trust.

**C1 — Four surfaces publish something the site's own data contradicts.**
`feed.xml:29` (raw token, verified). `lab.js:42,66,90` (three stale values plus two reversed
trend claims). `lab.js:69` "APRs above 21%, the highest on record" — `TERMCBCCALLNS` is 20.94%
and the record is 21.76%, both clauses false. `lab.js:70` card debt "over $1.1 trillion" —
NY Fed Q2-2026 says $1.263T. `lab.js:76` names Experian; the CCP is Equifax, as
`backtest.js:176` correctly states. `lab.js:129` says a national foreclosure series "is not
available through the same open acquisition path" — it is sheet "Page 17 Data" of the workbook
`scripts/lib/methodology.js:183-198` unzips every morning. `lab.js:137,140` calls `AMTMNO`
"shipments"; it is new orders. `lab.js:175` cites 6.87M claims for 2020, a figure that exists
in no current FRED vintage. **Root cause is structural, not editorial:** `narrative-check.js`
evaluates `articles.js` and `data/auto-articles.js` only — it never opens `lab.js`,
`data/editorial.json` or `feed.xml`, while `lab.js:232` declares as an invariant that "prose
never remembers unchecked numbers."

**C2 — The published recipe cannot reproduce the published score.** `notes.html` gives
`OOZE = Σ(weightᵢ × stressᵢ)`, one anchor point, and no mention of either `Math.max()`. A
reader following it cannot get 26, and — directly relevant to the July failure — cannot
discover *why* employment reads 13 while payrolls fall.

**C3 — The ounces are 1.911× low as marginal effects and are rendered with a `+`.** Verified:
the seven contribs sum to 26; the seven exact marginals sum to 49.67. Because
`contrib_k = ooze × (w_k·s_k)/Σ(w·s)` and `marginal_k = a·w_k·s_k/100`, the ratio is
`a·raw/ooze` — **a single constant, identical for all seven lines** (`10`, `11` both derive
this; `03`'s per-line table wrongly implies it varies). A reader doing the natural thing —
"if housing went away we'd drop 7" — is off by 5.2 points, one fifth of the headline.

**C4 — No purchasing-power sensor exists at any weight.** 58.2% of weight on lagging
balance-sheet measures, 0% on whether the paycheck covers the bill. Nothing in the pipeline
divides a wage by a price. Consequence: December 2021 printed **10/100, the lowest reading in
the entire record**, in a month with CPI +7.04% and real AHE −2.08%. Thirteen of the fifteen
worst real-wage months in the record scored between 10 and 29. Real AHE is negative again now
(−0.15% YoY) and the inflation line fell three points in the same month.

**C5 — The credit line is a prime-borrower gauge sold as "the economy's early-warning smoke
detector."** `DRCCLACBS` at 2.92% is 8.0% of the way from its 2019 calm to its own GFC peak.
Three other federal measures of the same household span 2% to 84.9% of that distance. The
site reads the one at 8% and discloses no cross-check.

**C6 — The archive is scored with data the operator did not have.** Two mechanisms: the moving
gas deflator (+4.09 points average, one-directional, manufactures all four non-crisis false
positives) and the non-existence of two input products before 2010-08 and 2011-05 respectively.
`realTimeCompatible:false` is set correctly in the JSON at `backtest.js:201-206` and is
surfaced on no reader page.

**C7 — Ward M's frozen calibration exists twice and diverges.** `collect-market.js:42`
`{a:1.4025,b:-7.0116}` vs `lib/market-backtest.js:3` `{a:1.402462618842267,b:-7.011551886296619}`
— verified, 11 divergent rounded scores on a 0.01 grid. `market-integrity.js:72` recomputes
using the calibration embedded in the payload it audits and is structurally incapable of
catching it. This is a recurrence of the exact failure class the repo is scarred by.

**C8 — `data/market-history.json` is a daily cross-vintage join.** Household column rewritten
daily (2026-08-14), market column frozen until a human clicks `workflow_dispatch`
(2026-08-01), stamped with the *market* timestamp, publishing a divergence that subtracts
across 13 days of vintages. Verified. The correct guard exists at
`lib/market-integrity.js:143` and is gated behind a flag only `market.yml` passes.

**C9 — The D-10 failure class is still open in two places.** `narrative-check.js:126` filters
`^recon-ooze-`, checking 11 of 23 generated archive articles; the 12 `recon-ward-*` reports
each bake a household jar score into reader-visible prose from the same manually-refreshed
artifact. And all 23 hard-code the literal "3 source-revision events on the public record" —
correct today, wrong the moment a fourth is detected, with the gate seeing 11 of them.

**C10 — 48% of the test suite never runs on the daily cron.** `market.yml` is
`workflow_dispatch: {}` only (verified), so 15 of 31 test files execute only when a human
clicks — including 8 of the 11 Ward M contract tests protecting C7.

---

## 4. CURRENT ALGORITHM MAP

Verified against source, not restated from the reports.

```
INPUTS (10 FRED series + 1 XLSX scrape)         scripts/collect.js:80
  ├ UNRATE, ICSA ────────────────────┐
  ├ CPIAUCNS ────────────────────────┼─ inflation line AND gas deflator
  ├ MORTGAGE30US, DRSFRMACBS ────────┤
  ├ DRCCLACBS ───────────────────────┤
  ├ GASREGW ─────────────────────────┤
  ├ NFCI ────────────────────────────┤   also 1/6 of Ward M, identical anchors
  ├ INDPRO, AMTMNO ──────────────────┼─ AUXILIARY, weight 0
  └ NY Fed HHDC "Page 13 Data"/AUTO ─┘   methodology.js:141-165

FREQUENCY RECONCILIATION
  weekly   → calendar-month mean                 fred.js:37-40
  ICSA     → trailing 4-week mean                methodology.js:200-210
  quarterly→ ffill FROM OBSERVATION QUARTER      collect.js:67,95-97
             (not release date — the source of the 90-181d information age)

PER-LINE STRESS 0-100                            collect.js:101-116
  jobs      = max( interp(unemployment, UNRATE), interp(claimsK, ICSA/1000) )
  housing   = max( interp(mortgageRate, MORTGAGE30US), interp(mortgageDelinq, DRSFRMACBS) )
  credit    = interp(cardDelinq, DRCCLACBS)
  auto      = auto30PlusStress(NYFED_AUTO_30PLUS)
  gas       = interp(gasReal, GASREGW × cpiNow / cpi[m])      ← cpiNow = LATEST print
  inflation = interp(inflationYoY, yoy(CPIAUCNS))              ← U-shaped, non-monotonic
  financial = financialConditionsStress(NFCI)
  all clamped [0,100] at both ends                 methodology.js:40-42

COMPOSITE                                        collect.js:118
  raw  = Σ(weightᵢ × stressᵢ) / 100
  weights: employment 24.25 · housing 19.40 · credit 19.40 · auto 14.55
           gas 9.70 · inflation 9.70 · financial 3.00        methodology.js:11-19

CALIBRATION (frozen)                             methodology.js:27
  ooze = round( clamp( 1.418684348943213 × raw − 23.96514845099034, 0, 100 ) )
  rule: calmest month 2003-2025 → 10 ; 2007-2010 peak → 90
  calm anchor  = 2021-12, raw 23.936322767604793   ← CPI was +7.04% that month
  GFC anchor   = 2009-06, raw 80.320895            ← the NBER TROUGH month

CONTRIBUTIONS ("ounces")                         collect.js:126-135
  contribₖ = ooze × (wₖ·sₖ)/Σ(w·s), largest-remainder rounded to sum exactly
  ⚠ this is a SHARE OF SCORE. The MARGINAL effect is a·wₖ·sₖ/100 = 1.911× larger,
    identically for every line, because b = −23.965 is silently distributed.

BANDS                                            lab.js:28-34
  0-20 SMOOTH · 21-40 STICKY · 41-60 SLIPPERY · 61-80 OOZING · 81-100 OVERFLOWING
  (this table is duplicated in 7 places; lab.js:330 uses a 4th threshold set)
```

**Structural facts a reader is not told.** There is no cascade — `collect.js:118` is an
unconditional weighted mean with no state, ordering, threshold or interaction, while
`what-is-ooze.html` sells a fixed six-stage ordered cascade whose declared terminal stage
(foreclosure) carries zero weight and is not a foreclosure series. Effective independent
dimensionality is **3.93 of 7** over the full record and **2.46 of 7** since 2021
(credit↔auto r=0.987 since 2021). Four of seven lines cannot move the current reading out of
its band even at stress 100; the financial line's total achievable span is 5 points.

---

## 5. DATA PROVENANCE MAP

| Line | W | Series | Publisher | Transport | Cadence | Latest obs | **Information age at seal** | Revises? |
|---|---|---|---|---|---|---|---|---|
| employment | 24.25 | `UNRATE` | BLS CPS | FRED | monthly | 2026-07 | **30 d** | mean 0.047pp, max 0.2pp — near vintage-proof |
| employment | — | `ICSA` | DOL ETA | FRED | weekly | 2026-08-08 | 30 d | mean 2.18% on the 4wk mean, max 17.2% |
| housing | 19.40 | `MORTGAGE30US` | Freddie PMMS | FRED | weekly | 2026-08-13 | **29 d** | no |
| housing | — | `DRSFRMACBS` | FRB | FRED | quarterly | **2026-01-01** | 181 d | mean 0.045pp |
| **credit** | **19.40** | `DRCCLACBS` | FRB | FRED | quarterly | **2026-01-01 (Q1)** | **181 d** | mean 0.019pp |
| auto | 14.55 | HHDC Page 13/AUTO | FRBNY CCP/Equifax | **XLSX scrape** | quarterly | 2026-04-01 (Q2) | **90 d** | no vintage record exists anywhere |
| gas | 9.70 | `GASREGW` ÷ `CPIAUCNS` | EIA / BLS | FRED | weekly | 2026-08-10 | 29 d | no — instability is self-inflicted via `cpiNow` |
| inflation | 9.70 | `CPIAUCNS` | BLS | FRED | monthly | 2026-07 | 29 d level / **211 d** for the YoY interval | **never revised** |
| financial | 3.00 | `NFCI` | Chicago Fed | FRED | weekly | 2026-08-07 | **29 d** | **mean 0.136 — 6.8× the declared 0.02 tolerance, 81% of months, 162 of 182 downward** |
| foreclosures | 0 | `DRSFRMACBS` (reused) | FRB | FRED | quarterly | 2026-01-01 | 181 d | — |
| manufacturing | 0 | `INDPRO` | FRB | FRED | monthly | **2026-06** | 45 d stale today | 4 months + annual |

**Weight-weighted mean information age of the July-2026 headline: 67.6 days. 33.95% of the
weight is 90-181 days old.** The 19.40-weight credit line is scoring July from an observation
window that ended in March. This single table is the answer to every early-detection question
in §9 and it should be published.

**Existence constraints, verified by ALFRED probe (`12`):**
- NFCI's earliest vintage containing 2007 data is **2011-05-25** (2011-05-24 returns zero
  observations). The series did not exist during the crisis it is credited with detecting.
- The NY Fed CCP was created in 2009; first public release ~2010-08.
- Therefore the collector's own all-series rule would have skipped **99 of 282 months**,
  including every month of the GFC. First fully-scorable month: **2011-04**.

**Derived artifacts and their refresh cadence — the divergence surface:**

| Artifact | Written by | Cadence | Read by | State |
|---|---|---|---|---|
| `data/latest.json` / `history.json` | `collect.js` | **daily** | everything | ✅ |
| `research/backtest-results.json` | `backtest.js` | ⚠ **manual only** | `backfill-reports.js` → readers | 🟡 D-10 class |
| `data/reconstruction-reports.js` | `backfill-reports.js` | ⚠ manual | **readers** | 🔴 12 of 23 ungated |
| `research/market-backtest.json` | `backtest-market.js` | ⚠ `workflow_dispatch` | `build-market-divergence.js` | 🔴 |
| `data/market-history.json` | `build-market-divergence.js` | **daily, mixed inputs** | `narrative-check.js`, market page | 🔴 cross-vintage |
| `data/market.json` | `collect-market.js` | ⚠ `workflow_dispatch` (2026-08-11) | `stamp.js` → `market.html` | 🟡 |
| `feed.xml` | `rss.js` | daily | **subscribers** | 🔴 raw token |

**One hole nobody labels: `2025-10` does not exist.** `data/history.json` has 282 entries
where the calendar has 283 (verified). `UNRATE`, `UNEMPLOY`, `CE16OV`, `CLF16OV`, `CIVPART`,
`EMRATIO` are all null at 2025-10-01 in current FRED while `PAYEMS` carries 158,408 — the 2025
appropriations lapse stopped CPS collection and a household survey cannot be collected
retroactively. It is the first break in the continuously published unemployment rate since
January 1948. The code handles it correctly (no interpolation). The only disclosure anywhere is
inside one Ward M archive report. Every "n months since 2003" statistic on the site, including
the verdict line, is computed on a denominator with a hole in it.

---

## 6. INDICATOR-BY-INDICATOR SME AUDIT

### EMPLOYMENT — 24.25% — stress 13, delta −1
**Measures:** the share of *active searchers* without work, and new UI filings.
**Does not measure:** employment level, payroll growth, labour-force exit, hours, hiring rate,
underemployment, wages, UI coverage.
**Live state:** UNRATE 4.1 → stress 13.0 is the binding arm. ICSA 4wk 203,250 → stress 5.81.
**Claims must rise 14% (to ~232k) before this line moves one point.** The arm-binding record is
state-dependent, not decayed: 95% of months 2003-09, 18% in the 2010s, 60% since 2020. The line
switched arms 38 times in 282 months and no surface says which arm is talking.
**Anchor decay is real:** claims per unit of labour force ran 27.1bp (2003-01) → 12.0bp
(2026-07). A fixed absolute count is a tighter screen every year.
**Verdict:** keep the `max()`. Disclose the live arm and the 232k threshold. The PAYEMS blind
spot is documented and is not re-litigated here; see §7 for its live magnitude.

### HOUSING — 19.40% — stress 44
**Measures:** the quoted price of a *new* 30-year mortgage, OR bank-held single-family
delinquency, whichever is higher.
**Live state:** the **rate branch has been binding continuously since 2022-04** (44.27 vs
22.80). At 19.4 weight the second-heaviest line is currently pricing new credit, not distress
among existing borrowers — roughly two thirds of outstanding mortgages are locked below 4%.
**Corroborating context the line cannot see:** MDSP 5.88% (GFC peak 8.95), TDSP 11.16% (peak
15.85, and *below* 2019Q4's 11.73), NY Fed new foreclosures 55.16k/qtr vs 203.32k in 03:Q1,
Case-Shiller +1.11% YoY. By every distress measure, homeowners are historically comfortable.
**Renters — ~35% of households — have no representation at any weight.** Rent of primary
residence is +33.3% cumulative since 2019-12.
**Verdict:** no algorithm change. Disclose which branch is live; the `max()` silently switches
the line's timing character (leading rate → lagging delinquency) mid-cycle.

### CREDIT — 19.40% — stress 38
**Measures:** balance-weighted 30+ delinquency on card loans held on US commercial bank
balance sheets, dominated by prime portfolios.
**The four-measure scoreboard (`09` B8), normalised to distance from own-2019 calm to own-GFC
peak:**

| Measure | 2019 | GFC peak | Latest | % of the way |
|---|---|---|---|---|
| NY Fed CCP card 90+ **stock** | 8.32 | 13.74 | 12.92 (26:Q2) | **84.9%** |
| NY Fed CCP card 30+ **flow** | 6.82 | 13.78 | 8.69 (26:Q2) | 26.9% |
| **`DRCCLACBS` ← the jar reads this** | 2.58 | 6.77 | 2.92 (26:Q1) | **8.0%** |
| FRB net charge-off `CORCCACBS` | 3.71 | 10.54 | 3.84 (26:Q1) | 2.0% |

QoQ correlation between the CCP stock and the scored series: +0.347 pre-2015, **+0.010 since
2015**. The two stopped agreeing a decade ago. **But the alarming reading of the 12.92% is not
supported by the flow data:** the 90+stock/30+flow ratio is 1.49 today vs 0.92 at the 2009-Q4
GFC peak. In a genuine default wave the flow leads and the ratio *falls*. The evidence says
accumulation, not acceleration.
**Verdict:** publish all four, zero weight, with the stock/flow ratio on the same card.
**Do not swap the series** — see §16 for why `DRCCLOBS` fails.

### AUTO — 14.55% — stress 47
**The best-sourced line in the instrument.** Correctly identified, correctly labelled,
correctly parsed from the primary workbook. Q2-2026 AUTO 7.87 → 47.4 ≈ published 47.
**Two disclosures owed.** The 12 anchor exceeds the series' all-time max (10.85, 09:Q2), so
auto can never reach 100. And the same workbook's Page 12 shows auto **90+** at 5.49% — above
its 19:Q4 level of 4.94% *and* above the 4.47% GFC peak — while the 30+ transition the jar reads
sits well below its GFC level. The two disagree about whether auto is at crisis levels and the
jar reads the reassuring one.
**Also:** `lab.js:74` labels a 7.9% delinquency transition rate as "average APR" in the offline
path, and `lab.js:76` names the wrong bureau.

### GAS — 9.70% — stress 58
**Measures:** national mean pump price for regular, expressed in *today's* dollars.
**Two separable problems, and only one is a defect.**
- *Levels are correct.* `09` tried to kill this and failed: corr with minutes-of-work-per-gallon
  is **0.973**. The 2011-2013 readings of 86-93 are economically right.
- *The base rotates.* `cpiNow = S.CPIAUCNS.last.value` (verified, `collect.js:98`) re-expresses
  all 282 months on every run. Forward drift is small (**0.35 published points per year**, and
  **zero** rounding flips have reached the public record to date — see §10). Backward
  look-ahead is large (**+4.23 points** against a real-time baseline).
**Structural floor:** min 19.9, median 54.0, mean 57.2 over 23 years. At 9.7 weight most of that
is a constant, not a signal.
**Energy is double-counted:** gasoline is scored here at 9.70 and again inside the 9.70 headline
CPI line. Correctly measured (ex-energy reweighting, not core), the overlap is **+1.51 jar
points today, ~5.8% of the headline** — and it scales with the shock (2.90 points in 2022-06,
4.73 in 2008-06). The effective weight on energy is ~13-14%, not 9.7%, and no page says so.

### INFLATION — 9.70% — stress 30
**Measures:** the 12-month *change* in the price index. Not the level, not its relation to pay.
**This is the second-largest structural false negative.** CPI is +29.9% above 2019-12; nominal
AHE is +32.6% over the same span — **+2.01% real in six and a half years** — and real wage
growth is currently **negative**.
**The U-shape is defensible in principle and wrong in the middle:** 0% CPI scores 45, identical
to +4.2%. 2015-01 (CPI −0.1%, an oil-driven real-income windfall) scored 46.
**The line is nearly inert in aggregate and actively harmful in the current regime:** 0.7% of
composite variance over the full record despite 9.7% weight, and **−38.2% over 2021-2026** — it
cancels the rest of the index. That negative share is the statistical fingerprint of the missing
purchasing-power dimension.
**Verdict:** do not delete it (dropping it degrades external validity). Do not reweight it. Ship
a real-wage diagnostic beside it at zero weight.

### FINANCIAL CONDITIONS — 3.00% — stress 10
**Honest, well-documented, and effectively inert.** Removing it changes the published integer by
0.72 points on average, never by more than 2; even at NFCI 3.0 it moves the current reading only
26 → 30.
**Two live problems.** (a) The published benefit claim — "made the score climb about a month
earlier" — is **one rounding-boundary crossing**: 59.78 → 60 with, 58.99 → 59 without, in
February 2008, *two months after* the NBER peak and seven months after the Flow's own horn. The
margin is 0.79 points; NFCI's mean multi-year revision is 0.44 jar points. A revision can erase
the claim. And the series did not exist until 2011. (b) The declared revision tolerance of 0.02
is wrong by 6.8× against first-vintage-to-current, exceeded in 81% of months, with 162 of 182
revisions in the same direction.
**Also:** the same series with character-identical anchors is published twice — jar `financial`
−0.55/stress 10, Ward M `credit` −0.53/stress 11. `lab.js:117` tells readers Ward M "never
touches this score," which is true forward and undisclosed in reverse.

### FORECLOSURES (aux, weight 0) — stress 23
Not a foreclosure series. It is `DRSFRMACBS`, the same number already inside the housing line,
displayed twice under two names. **The published justification is false** — the real series is
sheet "Page 17 Data" of the workbook the collector unzips daily (03:Q1 203.32k → 26:Q2 55.16k,
with bankruptcies +10.3% QoQ). Direction is currently correct; the stated reason is untrue and
is load-bearing public copy.

### MANUFACTURING (aux, weight 0) — stress 27
`INDPRO` is total industrial production including mining and utilities. `IPMAN` is free on FRED.
They agree today (both +1.1%) and diverge historically by up to 15 stress points (2014-01, a
polar-vortex utilities surge masking a manufacturing contraction). `proxy:true` is correctly set;
the reader-facing page calls it "Manufacturing." Latent, not active.

### WARD M (zero weight in the household score)
Two of six equally-weighted gauges are **sign-inverted at crisis extremes**, verified twice
independently:
- **Energy** anchors are monotonically increasing in WTI, so 2008-11 ($57.3) → 23, 2008-12
  ($41.1) → 11, and **2020-04 ($16.5) → 10, the anchor floor, in the month WTI printed negative.**
- **Rates** treat inversion as stress, so 2007-03 (−0.52pp) → 70 but **2008-09 Lehman (+2.54pp)
  → 5, the floor**, and 2009-06 (+3.54pp) → 5.
Ward M reaching 90 in Nov-2008 depends entirely on volatility, credit and breadth maxing out.
Three of six gauges (VIX, NFCI, breadth) measure the same latent risk-appetite variable —
NFCI's own decomposition proves it, with `NFCIRISK` −0.623 dominating the −0.549 headline while
credit (−0.060) and leverage (+0.036) are neutral. And the live breadth transform is not the one
the frozen calibration was derived on, disclosed only in a research JSON.

---

## 7. JULY 2026 LABOR-MARKET FORENSIC

Four agents worked this month independently. Their **conclusion converges** and roughly half
their supporting statistics do not survive. Here is what stands.

**What the jar published.** `jobs` value 4.1%, stress 13, **delta −1**, contributing to a
headline decline from 27 to 26. The heaviest line in the formula posted its calmest reading.

**What actually happened, June → July** (verified from current-vintage FRED):

| | Jun | Jul | Δ |
|---|---|---|---|
| UNRATE | 4.2% | **4.1%** | −0.1pp |
| UNEMPLOY | 7,094k | 6,916k | −178k |
| CE16OV household employment | 162,264k | 162,177k | **−87k** |
| CLF16OV labour force | 169,358k | 169,094k | **−264k** |
| Not in labour force | — | — | **+380k** |
| PAYEMS | 158,881k | 158,858k | −23k |
| CIVPART | 61.5% | 61.4% | −0.1pp |
| EMRATIO | 59.0% | 58.9% | −0.1pp |
| U6RATE | 7.9% | 7.9% | flat |

**The one sentence that survives every challenge:**
> **If participation had not fallen, July's unemployment rate would have gone up, not down.**
> Hold the labour force at June's 169,358k with July's actual employment: 7,181 ÷ 169,358 =
> **4.24%**, which publishes as 4.2% — the same as June. The entire published improvement is
> denominator.

This is seam-free, month-over-month, arithmetically closed, and independently reproduced by
three agents. **Use it. Use nothing else.**

**Three claims that must never be published**, each verified dead:

1. **"Household employment fell 963,000 / labour force fell 1,318,000."** 93% and 78% of those
   declines occur in the single month spanning the **January 2026 CPS population control**.
   ALFRED vintages 2026-02-11 vs 2026-03-06: CE16OV 2026-01 restated 164,520k → 163,097k
   (**−1,423k**), CLF16OV 171,882k → 170,465k (**−1,417k**), with December byte-identical in
   both vintages. Not one person lost a job. **Ex-seam both series ROSE: +460k and +99k.** The
   artifact is 148% and 108% of the respective declines.
2. **"5 of the 930 months since 1948."** That screen fires on a reweighting seam, not an
   economic event. Invalid.
3. **"NILFWJN has fallen for three straight months."** It rose Mar→Apr and Apr→May, then fell
   twice. The year-over-year claim is fine; the streak claim is false.

**Magnitude, corrected.** The participation-constant 12-month counterfactual of U-3 5.28%
(+5.41 jar points) is contaminated by the same seam. Seam-adjusted it is **U-3 4.67%,
employment stress 19.7, +2.29 jar points.** If a counterfactual is published at all, publish
that one — or better, publish only the month-over-month version above.

**Is the −23k payroll print meaningful? No — and the doc that says so then tests the wrong
null.** Against zero: −0.29σ against a calm-window sd of 79k, inside BLS's own ±136k 90% band,
and its three predecessors were revised −31k, −140k, −103k. **Against the relevant null — the
2013-2019 calm mean of +199k/month — the three-month pace of +20k is −3.92σ and the twelve-month
pace of +26k is −7.57σ.** Publish the pace, never the print.

**What this is: demographic exit plus a hiring freeze, not discouragement.** Every corroborator
re-tested independently points away from distress — U-6 flat at 7.9, continuing claims −8.0%
YoY, permanent job losers −179k, layoffs −4.2%, prime-age participation flat at 83.4, and
**average weekly hours RISING to 34.3, a 12-month high**. Employers cut hours before heads. The
hours reading is the most telling corroborator and no draft copy uses it.

**Two honest counterweights.** Temporary layoffs rose +153k (+20%) in one month — the single
indicator pointing toward distress, volatile, −19k year over year, worth watching not
publishing. And prime-age participation "exactly flat" is base-picked: Jul-2025's 83.4 was the
low of 2025 H2; against the Nov-25→May-26 plateau of 83.86, today is −0.46pp.

**The product failure, which is the actual finding.** The jar was mechanically correct. The
editorial engine was faithful to its input. `data/auto-articles.js` then told readers *"steady
employment kept paychecks coming."* **No surface on the site exists whose job is to say the
instrument and the world disagree this month.** That, not the score, is what §8 fixes.

**And one already-published sentence crosses the line.** `articles.js`, `june-2026-seal`:
*"recessions are employment events, and there isn't one in this data."* The 14 and the 4.2% are
correctly scoped to June and are not errors. The final clause converts "our two search-flow
inputs are quiet" into a claim about the labour market, made by a line that cannot see hiring,
exit or wages, at a moment when the three-month payroll pace was already −3.9σ. **Rule to add:
the editorial voice may describe what the jar measured; it may never assert the absence of a
phenomenon the jar cannot measure.**

---

## 8. CONTRADICTION ENGINE SPECIFICATION

**Verdict: build one rule, not nine.** `06` proposed nine relations plus a tenth of its own.
`06`'s own base rates disqualify four; `11` rejected the engine as scoped; `12` independently
re-tested every rule on a different window with a different outcome set and reached the same
rejections. That is three independent routes to the same answer.

**What ships:**

```
RULE A1 — the instrument audits itself
  fires when: OOZEMeter's employment stress falls ≥2 over three months
              AND EMRATIO falls over the same three months
  base rate:  24 firings / 18 episodes in 271 months = 9.0%      (12, ex-post)
              30 firings in 710 months since 1967 = 4.23%        (06, longer window)
  forecasting value: NONE. NBER lift 1.06. 8 of 18 episodes are clean false alarms.
  12-month forward jar change after a flag: −6.33 vs −0.77 unconditional  (09)
  vintage robustness: aggregate-robust (24→27 firings, same hit count on first-vintage
              inputs), but 7 of 29 distinct firing months change (12 §5.5)
  LIVE 2026-07: FIRING. employment stress chg3 −2.67, EMRATIO 59.1 → 58.9.
  data needed: EMRATIO only. One id added to collect.js:80.
```

**Output grammar — two states, one sentence, no colour, no arrows:**

> *The unemployment rate fell this month. The share of Americans with a job also fell. The jar
> reads the first number and not the second.*

Thirty words. No new vocabulary. States what the instrument measures and what it does not.
Asserts nothing about the future. Everything past the first disagreement goes to the indicator
page or below the fold.

**Why not `06`'s four-state output.** `SIGNALS AGREE / MIXED SIGNALS / MEANINGFUL CONFLICT /
INSUFFICIENT EVIDENCE` asks a reader to hold four states, three about the instrument's
confidence and one about the economy — and the scariest-sounding state is historically
*reassuring*. `06`'s own data: C2 recession lift **0.36**; the prime-age refinement **0.00**,
with 0 of 23 flags preceding a recession, and employment-population rising *faster* than
baseline after every flag. A widget whose red state is good news is a comprehension trap.
`06` names this as its own untested gap and is right to.

**Hard constraints on anything built here:**
1. **Never moves the score.** `collect.js` must never `require` the engine. Output goes to its
   own artifact. The score is computed and written first.
2. **Never flags on sign disagreement alone.** Every leg clears a documented threshold derived
   from measured noise: ±168k for a 1-month payroll change, ±500k for 3-month (2× the
   ex-pandemic ALFRED revision sd). The naive 1-month payroll-vs-unemployment rule fires **this
   month** with lift 1.01 — exactly zero information — and the tested rule correctly does not.
   The noise floor is the load-bearing component, not the rule list.
3. **Never a warning.** A1 is a *measurement* flag. The negative forward record must be
   disclosed in the same emission if the rule is ever quantified on a public surface.
4. **Never quote a lift without its n on the same line.**
5. **Base rate > 10% ⇒ permanently demoted to a labelled structural feature.**

**Rejected outright, with the number that kills each:**

| Rule | Killer |
|---|---|
| **C9** mfg output up / employment down | 18.1-18.4% base rate; **0 of 7 episodes preceded a recession**; lift 0.69 over 1973-2026. Zero occurrences in the 1970s then ~23% of all months for forty years. It would have warned continuously since 1985. It is the rule most likely to be built because it sounds like the most obvious contradiction. |
| **C2** unemployment down / participation down | 1 of 13 episodes preceded a recession against a 15.5% base; prime-age refinement 0 of 7; 8 of 13 clean false alarms. Superseded by A1, which makes the same measurement point without the story. |
| **C1** payrolls down / unemployment down (3m) | fires 0 times in 271 months, 1 time in 938 since 1948. A rule that cannot fire is not a rule. |
| **C6** mortgage rate down / affordability down (3m) | 0-1 firings in 470 months. Arithmetically near-impossible. |
| **C8** market calm / household worsening | n=3, two of which are the same 2007 episode, and the household leg is OOZEMeter's own backtested score calibrated on the same GFC window. A 3.74× lift on two events is an anecdote with a decimal point. |
| **C4** claims up / unemployment down | 6 firings since 1967, lift 0.65, three of six in December or January — a seasonal-factor artifact. |

**Research more, do not build yet:** C3 (aggregate hours — the *only* specification that
carries signal, lift 2.07; the intuitive per-worker version has lift **0.00**), C5 (essentials
vs headline — the highest-value rule for user *understanding* and the one that cannot prove its
real claim without distributional data), C7 (its NFCI threshold sits at the 45th percentile of
its own distribution and is doing no work).

---

## 9. FORWARD OOZE / OOZE WATCH RECOMMENDATION

**Verdict: REJECT the OOZE WATCH panel. Do not add any forward series to the score. Log the
Flow privately and publish no track record.**

**The arithmetic that settles it, before any statistics.** The weight-weighted information age
of the July headline is **67.6 days**, with 33.95% of the weight 90-181 days old. The heaviest
quarterly line is scoring July from January-March. **An instrument 68 days behind cannot
forecast at any horizon.** Every subsequent argument is downstream of this.

**Do not publish the "jar lags recessions by 9 months" number.** It is not identified. The
cross-correlation surface is flat (h=−12: 0.570, h=−9: 0.576, h=−6: 0.569 — a 0.007 spread
across nine months), the jar's actual maximum is **2009-06, the NBER trough month itself**, and
the identical method assigns `UNRATE` — the textbook coincident-to-lagging indicator — a
thirteen-month lag. It is an artifact of correlating a persistent level against a 0/1 dummy
whose 20 positive months are 18 GFC plus 2 COVID. **The conclusion it supports — that no
weighted line leads — survives on the information-age table instead, which is unimpeachable.**

**Why a labour-based watch board would be actively wrong.** Measured on the 30 largest 6-month
claims surges, spread across eight distinct years, over the following six months: financial
−9.9, gas −5.3, inflation −1.8 stress points, against housing +6.5, credit +2.7, auto +1.3.
When labour cracks, the Fed eases and commodities fall, and the jar's price and rate lines
systematically cancel its distress lines. Net effect on the jar six months later: **+1.5 points,
against an unconditional −0.4.** Publishing "these conditions could push the Ooze up" over a
claims surge would assert something the backtest contradicts.

**The Flow.** Its arithmetic reproduces exactly and its onset property is genuinely robust —
across 64 parameter settings the 2007 first-horn date spans only 2007-07-06 to 2007-08-03, and
it fires on the 2011 vintage too, three weeks earlier. That is real and should be credited. But:

- **Three of its five celebrated episodes were computationally impossible.** NFCI's first
  vintage is 2011-05-25; the 2007-07-20, 2007-11-23 and 2008-09-19 horns postdate the data by
  three years and ten months. This is not a revision caveat, it is an existence fact.
- **The live-possible record is 1 confirmed and 1 false, out of 2.**
- **"Zero junk" is a property of the current revision.** On the only vintage that ever existed,
  the same rule over the same window produces **five** episodes where today's data shows three,
  including 2005-04-22 and 2007-01-26, which today's data says never happened.
- The confirmation record is **three independent macro episodes, 2 of 3, p = 0.25** against a
  base rate the doc never computed (33%).
- NFCI's forward skill against the jar collapses from r=0.38 to **r=0.09** out of sample after
  2015.
- The z-score design is weight-free — the doc celebrates this correctly — and that property
  **removes exactly the revision insulation the 3% weight provides.** NFCI's mean revision of
  0.136 units is ~8 stress points on the line, which moves the z-score that decides whether a
  horn sounds.
- `2020-03-14` produces **z = 197.1**, a divide-by-tiny-sigma artifact that will render on the
  most-watched week of a generation unless capped.

**Verdict on the Flow: TEST FIRST.** Run it, log it, version the roster alongside the NFCI
vintage, cap the displayed z. Publish nothing that reads as a track record. At 0.2-0.6 horns
per year it takes roughly fifteen years to reach n=10 independent episodes; say that out loud.

**The two candidate watch rows, rejected.** `T10Y3M` has the best out-of-sample forward skill of
anything tested (h=12 r=0.43, rp=0.40) — and 24 of the 30 most-inverted months are 2023-24 and
the other 6 are 2006-07. **That is two episodes, not thirty observations.** `DRTSCILM` is
quarterly with a ~44-day lag, so the row would sit unchanged for three months at a time: a
live-looking surface that is dead 11 weeks in 13. Adding two series to buy an out-of-sample
r=0.31 on n=2, on a homepage that does not yet render the paragraph it already generates, is
negative expected value.

**Explicitly rejected and recorded so they are not re-proposed:** `ICSA` and `CCSA` as
jar-forward signals (r = −0.10 and −0.08 at h=6; CCSA confirms **below** the base rate under
the Flow rule — worse than nothing); `SAHMREALTIME` (fires at or after onset by construction —
5 fires since 1959, none preceded a recession by 1-12 months); `UMCSENT` (h=6 r=0.16, p=0.159; 9
fires with 7 false); `JTSQUR`; `TEMPHELPS` (note: `TEMPHELP` is not a valid FRED series ID);
`NEWORDER`; `T10Y3M` as a *horn* (5 of its 10 firings are the curve *steepening* — the Fed
reacting, not warning).

**And the phrasing the brief proposed is itself a forecast.** *"These conditions could push the
Ooze this direction if they persist"* names a direction for the jar. Nothing out of sample
supports a direction. The Editorial Constitution §5 forbids prediction and §2.4 requires "a
named date and the data that lands on it, never an outcome." If any conditions surface ever
ships, it drops the jar from the sentence entirely.

---

## 10. HISTORICAL VINTAGE-AWARE BACKTEST

Reconstructed under three separate real-time constraints: **existence, publication lag, and
vintage**.

**Existence.** 99 of 282 published months could not have been produced at all. First fully
scorable month: **2011-04**. The financial line's most defensible moment — NFCI turning from
−0.37 to +0.07 in August 2007 while every other line was flat — is a moment no operator could
have seen for another three years and nine months.

**Publication lag.** Near zero on average (−0.16 points) and decisive at turns, because the lag
cuts both ways. Concrete: score month 2009-01 reads card delinquency 6.51% (Q1-2009, released
May 2009) for stress 86.8; the freshest release at the time was Q4-2008 at 5.64%, stress 77.1.
**Nine stress points on a 19.4-weight line in the month the score was climbing fastest.**

**Deflator base rotation — the dominant wedge.** At seal(M) the latest CPI print *is* CPI[M], so
`cpiNow/cpi[m] = 1` and the real-time gas line is the **nominal** pump price. Effect: **+4.23
points mean, 266 of 282 months ≥1 point, 130 ≥5 points.**

| month | nominal | stress at the time | stress in the archive | Δ |
|---|---|---|---|---|
| 2005-09 Katrina | $2.90 | 32.6 | 81.9 | **+49.3** |
| 2006-05 | $2.91 | 32.7 | 79.8 | +47.1 |
| 2008-06 | $4.05 | 61.4 | 96.9 | +35.5 |
| 2026-07 | $3.93 | 58.3 | 58.3 | 0 |

**Combined result: the archive reads +4.09 points higher on average than the instrument could
have printed, and 62 of 282 months (22%) carry a band name it would not have printed.**

| threshold | published first crossing | real-time first crossing |
|---|---|---|
| 45 | 2007-06 (−6mo vs NBER peak) | 2007-11 (−1mo) |
| 60 | 2008-02 | **2008-06** |
| 80 | 2009-01 | **2009-04** |
| 90 | 2009-06 | **never** (real-time max 84) |

**The scale's own definition of "depression-class" is unreachable by the live collector under
the conditions that defined it.**

**The vintage layer is an order of magnitude smaller than the timing layer**, and this is a
genuine positive result:

| Series | mean \|revision\| | published-score effect |
|---|---|---|
| `CPIAUCNS` | **0 differences**, verified against a 2003 vintage | 0 |
| `UNRATE` | 0.047pp, max 0.2pp, **156 of 280 months never revised** | ≤0.8 pts |
| `DRCCLACBS` / `DRSFRMACBS` | 0.019pp / 0.045pp | ≤0.28 pts |
| `ICSA` (4wk mean) | 2.18%, max 17.2% | mean 0.32, max 2.55 pts; **the binding arm differs in 20 of 203 months** |
| `NFCI` | **0.1362 — 6.8× the declared 0.02**, 81% of months, 162 of 182 downward | mean 0.15, max 0.94 pts |

**OOZEMeter's real-time problem is not that its data changed underneath it. It is that its
archive is scored with data the operator did not have.**

**A published methodology claim is measurably wrong.** "Absolute monthly-mean change up to 0.02
is expected model churn" appears in `research/backtest-results.json`, `scripts/collect.js:222`
and `scripts/backtest.js:199`. That figure describes week-to-week churn between adjacent
vintages, not the revision a published month actually undergoes. Restate it or replace it.

**Two facts that resolve a disagreement between agents (see §12/D-11):** pinning the deflator
base fixes *drift* but does **not** fix *look-ahead*. A fixed 2026-01 base still deflates 2005
gasoline to 2026 dollars. Since `09` proved the levels are economically correct (corr 0.973
with minutes-per-gallon), the look-ahead should be **disclosed, not removed**. Pin the base to
stop the archive ratcheting; publish the real-time equivalent to stop the archive lying about
its own history.

---

## 11. FALSE-POSITIVE ANALYSIS

**The published jar is a 30%-duty-cycle alarm.** It has read ≥45 in **82 of 271 months**,
including **77 consecutive months from June 2007 to October 2013**. A signal that is on for a
quarter of the sample is not doing the work an alarm is supposed to do.

**All four non-crisis false positives are artifacts of the deflator, not of the gas line.**

| Episode | Published | Real-time | Reaches 45 in real time? | Outcome within 12m |
|---|---|---|---|---|
| 2003-02/03 | 47 | 43 | **no** | none |
| 2005-09 Katrina | 45 | **36** | **no** | none |
| 2006-05 | 47 | **38** | **no** | none |
| 2006-07 | 47 | **39** | **no** | none |
| 2007-06…2013-10 | 90 | 84 | yes | NBER recession |

Removing the look-ahead cuts the alarm rate from 30% to 21% for free and eliminates every
non-crisis excursion. **This resolves the disagreement between `03` ("every non-crisis false
alarm was a gasoline spike") and `09` ("overstated — removing gas leaves 2006-07 at 43"): both
are describing the same months and neither identified the mechanism.** It is the deflator.
Removing gas leaves 2006-07 at 43; removing the look-ahead puts it at 39.

**False negatives, and they get worse in real time**, because real-time gas is nominal and
gasoline was cheap in 2020 and had not yet spiked in 2021:

| Episode | Published | Real-time | What was happening |
|---|---|---|---|
| **2021-12** | **10 SMOOTH** | 8 | CPI +7.04%, real AHE −2.08%. **This is the calibration low anchor.** |
| **2022-06** | 19 | 17 | CPI 9.1%, gasoline $4.93, sentiment 50.0 |
| **2020-04** | 42 SLIPPERY | **40 STICKY** | U-3 14.8%, claims 4.66M |
| 2007-08 | 46 | **38 STICKY** | BNP Paribas; the only line that moved did not exist |
| 2025-08→2026-02 | 23→19 | 23→19 | payrolls negative in four of seven months |

**On COVID = 42.** `03` calls this a MAJOR ranking failure; `09` shows it is defensible on the
instrument's own concept — April 2020 households had a **record 31.8% saving rate**, real DPI
per capita +14.7% month-over-month, card delinquency *falling*. **I side with `09`: this is a
copy failure, not a maths failure.** The defect is `what-is-ooze.html:77` labelling band 42
"Softening becomes slipping" for the month unemployment hit 14.8%. The fix is a sentence.
Caveat owed to the reader: both the income spike and the delinquency drop were policy artifacts
— but the policy *was* the household experience.

**The November 2008 sign error is real and confirmed twice.** The jar **fell** 79 → 75 in the
month NFCI hit its highest reading since 1974, because gas stress collapsed 77.6 → 44.4.
Rebuilding without gas and recalibrating produces a monotone ramp: 72, 77, 77, 81, 87, 87, 89.
Pair it with the second instance nobody else paired it with: the jar fell **47 → 37 from July
2006 to January 2007**, tied third-largest six-month decline in the record, as oil came off — in
the six months household credit began to break, with auto the only line that rose.

---

## 12. RED-TEAM FINDINGS — DISAGREEMENTS RESOLVED

Recorded rather than hidden. Each row states who wins and why.

| # | Disagreement | Ruling |
|---|---|---|
| **D-1** | `01`: swap/publish `DRCCLOBS` (small-bank card delinquency), stress 86. `09`: WRONG. | **`09` wins decisively.** `DRCCLOBS` scored on the jar's own anchors gives **91.6 in January 2020**, with unemployment at 3.5%. Its 2018-2020 range (5.54-7.16) exceeds its own GFC maximum (5.61). Its sign relative to the all-bank series flips three times in twenty years. It measures portfolio composition — small banks host subprime and fintech-partner card programmes — not the bottom half of American households. **`01`'s own evidence contains the refutation and is read as corroboration.** The *concern* survives and is upgraded via `09`'s CCP scoreboard. **REJECT the swap. SHIP the disclosure.** |
| **D-2** | `03`: reject a real-wage line (corr with sentiment +0.068). `10`: that is the wrong test. | **`10` wins the method, `03` wins the conclusion, for a different reason.** `10` is right that a component earns its place by loading on the missing dimension, not by standalone predictiveness — and proves it: added at w=19.4 and recalibrated, a real-wage line flips post-2020 corr from +0.219 to −0.034 and lifts 2022-06 from 19 to 37. But `10`'s own caveat #3 is decisive: the same line pushes **2020-04 down from 42 to 39**. Cost-of-living stress and labour-shock stress pull in opposite directions on one 0-100 scale. Combined with §12/D-4, the answer is **zero-weight diagnostic, not an eighth weighted line.** `03`'s rejection reasoning was wrong; its output was right. |
| **D-3** | `01`: "+3% CPI restates 89 of 282 months by ≥1 point." `10`: **zero** months move by 1 point. | **`10` wins.** 89 months flip a *rounding boundary*; the largest actual perturbation is 0.500. The publishable statistic is **0.35 published points per year of CPI, which flips ~120 integers per year of base rotation**. `01`'s phrasing conflates a boundary crossing with a one-point restatement. |
| **D-4** | `01`/`03`: the deflator is a live defect polluting `revisions.json` now. `11`: zero flips to date. | **`11` wins on urgency, `12` wins on substance.** The 16-month 2026-08-14 revision entry cited as live evidence is a **genuine NY Fed source revision** — the CPI base moved −0.01% between the two collections, which flips 0 of 282 months, and the sign pattern (9 up / 7 down) is inconsistent with one-directional drift. **Do not hotfix; pinning now would itself restate the archive.** But `12`'s finding is separate and larger: the +4.09-point look-ahead against a real-time baseline. Pin at the next version bump; disclose the look-ahead immediately. |
| **D-5** | `03`: external validity inverted in 2020 (CRITICAL). `09`: OVERSTATED. | **`09` wins on severity, `10` supplies the finding that survives.** The correlations replicate exactly, but `UMCSENT` vs `UNRATE` flipped *harder* (−0.745 → +0.504) — an instrument cannot be indicted for failing to track a survey that stopped tracking unemployment — and the post-2021 estimate's bootstrap CI **straddles zero**. The survivor is `10`'s survey-independent version: **the jar's own dispersion collapsed from sd 20.52 to 6.93** while sentiment's did not. Downgrade to MAJOR; monitor on dispersion and real DPI, not on sentiment alone. |
| **D-6** | `03`: real DPI per capita at 2022-06 was −5.13% vs −1.71% at the 2009 trough. `09`: category error. | **`09` wins.** 2021-03 real DPI/capita of $61,793 is the **all-time maximum of the series** — stimulus checks in the numerator. In *levels*, 2022-06 was **+1.56% above pre-pandemic** while 2009-06 was −0.07%. The correlation reverses once the transfer window is dropped (+0.528 for 2021-26, −0.037 for 2023-26). **Keep the finding, replace the evidence with real AHE and the OECD confidence index.** |
| **D-7** | `05`: the jar lags recessions by 9 months, r=0.576 at h=−9. `09`: NOT IDENTIFIED. | **`09` wins on the number, `05` wins on the conclusion.** Flat surface, jar max at the NBER trough month, and the same method mis-classifies `UNRATE`. **Do not publish h=−9.** The conclusion — no weighted line leads — survives via `11`'s information-age arithmetic, which is unimpeachable. |
| **D-8** | `01`: the site wrongly names Housing the "biggest pressure source" when gas is highest-stress. `09`: NOT A PROBLEM. | **`09` wins.** Contribution = weight × stress is the correct decomposition of the published 26. Naming the highest-*stress* line the biggest pressure *source* would be the error. **Drop this finding.** The adjacent one — ounces are 1.911× low as marginals — is real and bigger. |
| **D-9** | `01`: claims stress is 5.0, pinned at the floor, `max()` is a no-op. `09`: wrong on both counts. | **`09`/`10` win.** The scoring value is 203,250 → stress **5.81**, not 5.0; exactly one month since 2021 has touched the floor; and the claims arm binds in 49% of months since 2015. `10` adds the decade structure neither reported: 95% / 18% / **60%**. The arm is **state-dependent, not decayed** — it revived after 2020. `01`'s normalisation point survives; its evidence and its "secular decay" framing do not. Note `01` also self-contradicts, listing `max()` as "genuinely holds up" and separately as "currently a no-op." |
| **D-10** | `01`: employment counterfactual worth +5.41 jar points. `04`/`10`: seam artifact. | **`04`/`10` win.** 148% and 108% of the cited declines are the January 2026 population control; ex-seam both series rose. Seam-adjusted the counterfactual is **+2.29**. `01` explicitly labelled it an upper bound, which is to its credit — the verdict was right and the inputs were contaminated. |
| **D-11** | `03`: gas drives the entire visible 2026 range and every false positive. `09`: overstated. `12`: it is the deflator. | **`12` resolves it.** No-gas 2026 range is 5 vs 11 published, so `09` is right that gas explains about half. But all four non-crisis excursions fall below 45 when the *look-ahead* is removed, which is a cleaner and more complete explanation than "gasoline spike." Both agents were describing the same months without identifying the mechanism. |
| **D-12** | `03`: contribution ratio 1.88×, varying by line. `10`/`11`: 1.911×, constant. | **`10`/`11` win, and it makes the fix cheaper.** `marginalₖ/contribₖ = a·raw/ooze`, identical for all seven lines. `03` appears to have floored two marginals. One disclosed multiplier fixes it, not a per-line table. |
| **D-13** | `02`: add the vintage gate to the daily cron. `11`: that reds the build every day. | **`11` wins.** Turning on `--require-current-evidence` in `collect.yml` would fail every daily run and open a GitHub issue each time until a human runs `market.yml`. **Remove `build-market-divergence.js` from `collect.yml` instead.** One line removed beats one gate added; regenerating a derived artifact on a schedule its other half does not share *is* the defect. |
| **D-14** | `05`: UMCSENT 49.5 is the 0th percentile of its published range. `11`: false. | **`11` wins.** 44.8 (2026-05) is the window minimum; 49.5 is **4th** and represents a +4.7-point rebound; and there is **no 2026-07 print at all**, so the external validator lags the instrument it validates. Strike "0th percentile" everywhere. `09`'s caveat also binds: the Michigan survey moved to web-only interviewing in 2024 and carries a documented partisan component, so 44.8 is **not cleanly comparable to 1980**, and the independent OECD series that would settle it was discontinued in 2024. |
| **D-15** | `04`: the ALFRED `vintage_date` graph endpoint 404s; use the POST form. `10`/`12`: opposite. | **`10`/`12` win.** `12` fetched **697 vintages** through the graph endpoint. The POST form returns HTML. Correct the method note before anyone else burns a session on it. |
| **D-16** | `08`: 7 test files never run in CI. `11`: 15 of 31. | **`11` wins on the denominator that matters.** `market.yml` is `workflow_dispatch: {}` (verified), so on the daily cadence only `collect.yml`'s 16 files run — including only 3 of the 11 Ward M contract tests. |
| **D-17** | `03`: cap zero-weight diagnostics at three. `11`: at two, and fix the AUX label first. | **`11` wins.** `lab.js:391-395` already strips the AUX badge from the two existing zero-weight lines on **every page of the site** (verified). Every new diagnostic inherits a surface that presents it as if it scores. Fix the label before adding anything. |

**Three hypotheses agents formed and then killed — reported because a red team that only scores
points is useless:**
- **The gas deflator makes historical levels economically wrong.** FALSE. corr 0.973 with
  minutes-of-work-per-gallon.
- **The 2010-2013 plateau at 44-71 is a false positive.** NOT SUPPORTED. Unemployment 7.0-9.5%,
  mortgage delinquency near its all-time peak; removing gas entirely leaves the mean at 50.1.
- **The employment/EMRATIO conflict is an early-warning signal.** FALSE. Forward jar change
  −6.33 vs −0.77 baseline.
- **(mine)** *Equal weighting's advantage is a calibration-anchor artifact.* FALSE — Pearson
  correlation is invariant to `a·raw+b`; `10` tested and withdrew this correctly.

---

## 13. UX FINDINGS

**The load-bearing one: the homepage never renders the answer it already generates.**
`data/editorial.json` contains `story`, `summary` and the mandatory "What a household would
notice" paragraph, all written to standard and already gated. `grep EDITORIAL index.html`
returns exactly two hits — `.verdict` and `.articleSlug` (verified). Constitution §2 Reader
Promise items #2 and #3 are undelivered on the surface most readers see.
**Cost to fix: one div and one line of JS.** Highest value-to-effort ratio in the entire audit.

**The four featured canisters show 8 of 26 ounces and hide the three heaviest lines.**
`index.html:196` sorts by `Math.abs(delta)` then stress (verified). July deltas: gas −3,
inflation −3, jobs −1, financial −1, housing/credit/auto all **0**. Featured four = gas (4 oz),
inflation (2), jobs (2), **financial (0)** — one card shows a line contributing zero ounces.
Housing (7), credit (6) and auto (5) — **18 of 26 ounces** — appear nowhere above the Ledger.
Because quarterly lines are forward-filled, this is the *typical* month, not a bad one:
33.95% of the weight is invisible in "what moved" by construction.

**The ounces mislead by 1.911×** and `what-is-ooze.html:87` renders them as `+N` (verified).
**This is a bigger comprehension defect than anything in the proposed new modules, and it is
already shipping.** Relabel before building.

**Three numbers use three denominators and the reader is told about none of them:** the headline
is a calibrated score; the verdict is a percentile over 282 months **with 2025-10 missing**; the
ounces are a proportional split, not marginal effects.

**"No black boxes" is delivered for the experimental wing and not for the flagship.**
`notes.html:38` publishes one household anchor point against nine anchor tables and never
mentions either `Math.max()`. `notes.html:66-69` publishes Ward M's complete breadth formula,
all six anchor pairs and a worked example. **The fix is a copy-paste of the ward annex's own
pattern.**

**Fifty fabricated numbers are ranked into a leaderboard and submitted to search engines.**
`lab.js:190-201` hard-codes 50 state scores (comment: `/* demo state stress scores */`),
`states.html` renders a "#1 Most Pressurized" podium, `personal.html:97` consumes them, and
`sitemap.xml:9` submits the page (all verified). Disclosure appears once in body copy and never
in `<title>`, `<meta>` or OG tags. `about.html` promises "No fake numbers, ever."
**And the real data is on disk:** NY Fed HHDC Page 34/35 carry a full 50-state delinquency
cross-section, in the workbook the collector unzips every run.

**`personal.html:85` returns `50` as a divide-by-zero guard** (verified), rendered with the real
instrument's jar, band and a **Copy My Report** button producing
`🧬 MY PERSONAL OOZE: 50/100 — SLIPPERY` with no caveat.

**The header dropdown strips the AUX label on every page.** `lab.js:391-395` iterates all nine
lines including the two zero-weight ones with identical jar glyph, value and coloured delta,
closing with "July 2026 reading · 26/100" (verified). `index.html:212` gets it right; the
component that renders everywhere gets it wrong.

**Smaller, all verified:** `index.html:144` renders `PRESSURE SENSORS ×8` against 9 indicators —
the first user-visible number on a first visit, in the sequence whose purpose is to establish
that the facility counts correctly. `oozeonomics.html:34` still carries the fake sponsor slot
the board killed in `article.html` on 2026-08-02. A fixed 🚨 renders on a 26/100 share card. A
daily streak counter sells a cadence a monthly instrument does not have. A `<h2>`-headed "Stress
History — PENDING" panel with no chart occupies the second-best slot on all nine line pages.
`financial` — the newest, most-contested, explicitly-labelled-as-a-bet line — is the only
weighted line with no OOZE ACADEMY lesson, while Ward M's six gauges all have one.
`flowmap.html` is a 97 KB internal operator dashboard publicly served with zero inbound links.

**One false positive I am recording as such.** `lab.css:115` and `:490` `.down{color:var(--green)}`
is **latent, not live**. Every value those classes currently colour is a stress delta, where
down genuinely is relief. It becomes a falsehood the instant `EMRATIO` renders — which is
exactly what §8 does. **Fix the colour semantics as part of building the diagnostic, not before
it and not as a separate ticket.** Rename `.up`/`.down` to `.worsening`/`.relieving`.

---

## 14. ENGINEERING FINDINGS

**Duplication that is already divergent (fix by deletion, not by adding a check):**

| # | What | Where | State |
|---|---|---|---|
| **E1** | Ward M frozen calibration | `collect-market.js:42` vs `lib/market-backtest.js:3` | 🔴 **11 divergent rounded scores**; the gate reads the calibration out of the file it audits |
| **E2** | Canonical-Truth token resolver | `lab.js:235`, `narrative-check.js:39`, `rss.js:15` | 🔴 **three different grammars**; `rss.js` handles only 2 of 5 tokens |
| **E3** | Piecewise interpolation | 5 implementations | 🟡 3 return a wrong number rather than throwing; `backfill-reports.js:172` divides by zero silently → `NaN` into an archive report |

**Duplication that is in sync today and held together by one test:**
household anchors (2 copies), per-month stress math (2), forward-fill (2), band table (**7**,
plus a 4th threshold set at `lab.js:330`), fractional-year key (5), verdict sentence (2),
top-3 share line (2), FRED CSV parser (2). The rule is a comment
(`collect.js:100` "keep in sync"); the enforcement is `tests/backtest.integration.test.js`.
**Add the duplicate-consistency assertions first, then refactor** — that makes the refactor
provably behaviour-preserving. `assert.deepEqual(collectMarketCAL, FROZEN_WARD_CALIBRATION)`
**fails today** and would have caught E1.

**Duplication that must STAY:** `market-integrity.js` deliberately re-derives the Sector Watch
rules and breadth anchors. **A gate may re-derive; a publisher may not.** Do not deduplicate
these away.

**Gates that report success for work they did not do:**
- `integrity.js:31-32` wraps both `git show HEAD:…` calls in `try{}catch{}` (verified). On
  failure the revision detector no-ops **and** the 30-point jump cap is disabled, and line 143
  still prints `integrity gate: PASS`. A skipped check and a passed check produce identical
  output and identical exit codes.
- `stamp.js:105` exits 1 only `if(missing>3)` against 13 stamped markers (verified). Three
  silently failed stampings still exit 0, leaving last month's score in the static HTML that
  crawlers and link previews consume.
- `stamp.js:44` writes `Integrity gate: PASS · fails closed` as a **string literal**, consulting
  no integrity result (verified). Ordering in `collect.yml` makes it safe today; nothing enforces
  the ordering.
- `release-gate.js:68-69` re-checks 2 of the 13 markers, and checks the *month* in `<title>`,
  not the score inside it.

**Failure paths that destroy data:** `story.js:190-196` catches any parse error on
`data/auto-articles.js`, leaves `autos=[]`, and then **unconditionally overwrites the file with
a single article** — deleting every prior monthly report. `narrative-check.js:143` would not
notice, because it only checks that `articleSlug` resolves to *an* article, and it resolves to
the survivor.

**Self-checks that cannot fail:** `collect.js:301-302` use `console.assert` for the contribution
reconciliation and the range check. In Node that prints to stderr and returns. Same pattern at
`lab.js:593-595`.

**Test suite:** 31 files, 174 tests, 174 pass. Strongest work in the repo — `fred.test.js`,
`market-integrity.test.js`, `release-gate.test.js` and `market-output.test.js` are genuinely
adversarial, asserting the code *refuses* malformed input. But **no test executes any browser
code** — all `lab.js` coverage is regex over source text, so `feedState`, `levelOf`, `bandOf`,
`scoreAt`, `resolveClaims` and `personalOoze` have zero behavioural coverage — and 15 of 31
files never run on the daily cron.

**Performance:** ~180 KB of render-blocking JS plus 52 KB CSS plus three Google Fonts requests
before first paint, on a page whose payload is one number. `articles.js` is 38% of that and is
needed only below the fold.

**Workflow hygiene:** `collect.yml:46` uses `git add … data/ …` — a bare directory add. Given the
recorded 2026-08-02 PII incident, `06`'s observation that a new artifact would be "picked up
without a workflow edit" is a **hazard, not a convenience**.

**Dead code:** `MOVERS` (containing hand-written causal claims the Constitution forbids, always
discarded), `bigChart`, `adSlot`, `relTime`, and nine fabricated 7-point `spark` arrays — ~60
lines referenced by no HTML page. `INCIDENTS` is referenced only by the internal `flowmap.html`,
yet `release-gate.js:133-142` spends four assertions validating it.

---

## 15. RECOMMENDED ARCHITECTURE

**Model B. Zero-weight diagnostics. Do not change the score.**

The evidence for a score change is **not strong**, and I want to state plainly why, because the
brief asks for exactly that judgement:

1. **Every test any agent ran is in-sample.** The record starts 2003-01, bound by the NY Fed
   auto series. There is exactly one complete credit cycle in it, and that cycle is
   simultaneously the calibration target (`rawGfc` = 2009-06) and the validation set. 18 of the
   20 in-window recession months are the GFC.
2. **The calibration doctrine absorbs the fixes.** "GFC peak → 90" structurally suppresses any
   input whose current level exceeds its GFC level — and that is precisely the class the
   economics audit is asking for. `01`'s flagship credit fix is +13.07 jar points on the frozen
   ruler and **+3.6 under the project's own recalibration doctrine**; 74% evaporates.
3. **The two available fixes pull in opposite directions.** A real-wage line raises 2022-06 from
   19 to 37 and lowers 2020-04 from 42 to 39. Whether one 0-100 scale can express both a slow
   purchasing-power squeeze and a fast labour shock is an unresolved design question.
4. **Any weighted change restates all 282 published months** — the largest possible harm — on
   evidence from one cycle, and `backtest.js:122-127` re-derives calibration on every run, which
   makes the integrity gate structurally unfalsifiable against exactly this class of change.
5. **Equal weighting beats v3 on every metric tested**, which falsifies "the weights are earned"
   — and the correct response to that is **to say so on the methodology page**, not to ship
   equal weights (which would give NFCI 14.3%, abandoning the entire v3 evidence base).

```
LAYER 0 — THE SCORE                                        UNCHANGED
  Seven weighted lines, frozen CALIBRATION_V3, published monthly.
  No new inputs. No reweighting. No recalibration. No archive restatement.

LAYER 1 — DISCLOSURE (the bulk of the work, and it is all copy)
  · notes.html publishes all nine anchor tables, both max() rules, and one worked
    example — the ward annex's own pattern, applied to the flagship
  · the information-age table (§5): 67.6 days weighted, 33.95% of weight 90-181d
  · the ounces are a share of the score, not marginal effects, and are 1.911× low
  · the calm anchor is December 2021, a month when CPI was 7.0%
  · the archive is scored at constant purchasing power, so historical months read
    higher than they printed; realTimeCompatible:false surfaced on archive.html
  · the 2025-10 hole, wherever "since 2003" appears
  · which max() arm is live, and the 232k threshold at which claims re-bind
  · the credit line is a balance-weighted all-bank aggregate, prime-dominated
  · the effective weight on energy is ~13-14%, not 9.7%
  · the record starts 2003 and contains one credit cycle, which is also the
    calibration target

LAYER 2 — ZERO-WEIGHT DIAGNOSTICS                    CAP: TWO. NO MORE.
  Reuse collect.js:177-185 verbatim: contributesToOoze:false, scoreWeight:0,
  calibrationStatus:'provisional-auxiliary'.
  ① EMRATIO         — powers rule A1 and the one-sentence disclosure
  ② real AHE ÷ CPI  — the sensor whose absence produced the 2021-22 false
                      negative, currently negative at −0.15% YoY
  PREREQUISITE: fix lab.js:391-395 first. The AUX badge is the mechanism the
  whole layer depends on and it is broken on every page today.
  Publish alongside, as context not as lines: the four-row CCP credit scoreboard
  with its stock/flow ratio, and NY Fed Page 17 real foreclosures.

LAYER 3 — ONE CONTRADICTION RULE                      TWO STATES, ONE SENTENCE
  A1 only. No four-state widget. No colour. No arrows. No direction for the jar.

LAYER 4 — THE FLOW                                    PRIVATE LOG, NOT A PRODUCT
  Run it, version the roster against the NFCI vintage, cap the displayed z.
  Publish no track record. Revisit at n ≥ 10 independent episodes (~15 years).

EXPLICITLY NOT BUILT: OOZE WATCH. A second composite. Confidence intervals on
the jar. Percentile normalization. Any forward series inside the score.
```

**Gate architecture — one new module, three deletions:**

```
NEW    scripts/lib/claims.js
         resolve(text, sources)         ← the one grammar, three call sites
         assertNoTokens(text, where)    ← hoisted from compile-reports.js:113-117,
                                          which already does this correctly for
                                          exactly one markdown file
       run assertNoTokens over feed.xml, data/editorial.json, index.html and
       every generated page, in collect.yml

EXTEND scripts/narrative-check.js
         · filter ^recon-  (not ^recon-ooze-)
         · scan lab.js INDICATORS why/vs2008/faqs for digit-bearing literals
         · scan data/editorial.json prose and feed.xml
         · land in WARN MODE for one cycle — it will surface many pre-existing
           failures at once and would red the build on day one

DELETE collect-market.js:42's CAL literal → import FROZEN_WARD_CALIBRATION
DELETE build-market-divergence.js from collect.yml
DELETE lab.js MOVERS, adSlot, bigChart, relTime, spark; oozeonomics beaker-ad
```

---

## 16. FEATURES EXPLICITLY REJECTED

| Proposal | Verdict | Why |
|---|---|---|
| Swap the credit line to `DRCCLOBS` | **REJECT** | Scores **91.6 in January 2020** with unemployment at 3.5%; its 2018-2020 range exceeds its own GFC maximum. Portfolio composition, not household distress. |
| Reweight (equal weights, or any variant) | **REJECT** | Restates 282 months on one credit cycle that is also the calibration target. The AUC test is near-circular. Say the weights are not demonstrably earned; do not change them. |
| Add real wages as a weighted eighth line | **REJECT as weighted, SHIP as diagnostic** | Fixes 2022 and breaks 2020 (42 → 39). The anchor curve is invented and unvalidated. The doctrine would absorb much of it anyway. |
| **OOZE WATCH panel** (T10Y3M + SLOOS rows) | **REJECT** | T10Y3M's skill rests on **two episodes**; SLOOS is quarterly with a 44-day lag, so the row is dead 11 weeks in 13. Out-of-sample r=0.31 on n=2, on a page that does not render the paragraph it already writes. |
| The brief's phrasing "could push the Ooze this direction" | **REJECT** | It is a forecast. A 67.6-day information age cannot support directional language about the instrument at any horizon. Constitution §5. |
| Contradiction rule **C9** (mfg output vs employment) | **REJECT** | 18.1-18.4% base rate, **0 of 7 episodes preceded a recession**, lift 0.69. Would have warned continuously since 1985. The rule most likely to be built because it sounds most obvious. |
| Contradiction rules **C1, C4, C6, C8** | **REJECT** | Fire 0-6 times in 23-78 years, or n=3 with a circular leg. A rule that cannot fire is not a rule. |
| **C2** as a warning | **REJECT** | 1 of 13 episodes preceded a recession; the prime-age refinement gives **0 of 7** and employment-population rises *faster* than baseline after every flag. Superseded by A1. |
| `06`'s four-state output | **REJECT** | Three states about instrument confidence, one about the economy, and the scariest-sounding one is historically reassuring. Ship two states. |
| `07`'s 128-word Level-4 module | **REJECT the budget, ACCEPT the concept** | Four to six series a reader has never seen, each needing a direction convention. Ship the 30-word version. |
| Percentile-rank normalization (`03`'s D4) | **REJECT** | Destroys the absolute scale and prints **62** for May 2006, an expansion month — a worse false positive than the one it removes. |
| Publishing the Flow's "4 of 5 confirmed" | **REJECT** | n=3 independent episodes, p=0.25, and three of the five could not have been computed at the time. |
| Publishing "the jar lags recessions by 9 months" | **REJECT** | Not identified. Flat surface, and the method mis-classifies `UNRATE`. |
| Publishing "record-low consumer sentiment" | **REJECT** | 49.5 is the 4th-lowest and a rebound; there is no 2026-07 print; the survey moved to web-only interviewing in 2024. |
| Per-line sparkline charts | **REJECT** | `spark` already exists as fabricated data and is already unrendered. Delete it; do not implement it. |
| A second composite / "true stress index" | **REJECT** | Two numbers is zero numbers. |
| Confidence intervals on the jar | **REJECT** | It is a deterministic transform of published series. An interval implies a sampling model the instrument does not have. |
| Raising `STALE_DAYS.quarterly` | **REJECT** | If credit trips at 250 days, that is the threshold working. |
| Adding the market vintage gate to `collect.yml` | **REJECT** | Would red the daily build every day. Remove the daily rebuild instead. |
| A generalized "vintage reconciliation framework" | **REJECT** | Three specific joins are wrong. Fix those three. |
| Deduplicating the gate's deliberate re-derivations | **REJECT** | A gate may re-derive; a publisher may not. |
| Student-loan line (weighted) | **RESEARCH MORE** | $1.651T at 10.60% 90+ delinquency with no sensor is a real gap and the data is downloaded daily — but **no historical series exists in the backtest artifacts**, so no weight or anchor decision can be evidence-based. Extend the HHDC parser to emit Page 12 history first. |
| Contradiction rules **C3, C5, C7** | **RESEARCH MORE** | C3 has the only defensible lift (2.07) but **only on aggregate hours** — the intuitive per-worker form has lift 0.00. C5 is the best rule for *understanding* and cannot prove its real claim without distributional data. C7's NFCI threshold sits at the 45th percentile and is doing no work. |

---

## 17. P0/P1/P2/P3 IMPLEMENTATION BACKLOG

### P0 — CORRECTNESS AND TRUST (something false is published right now)

| # | Item | File:line | Why P0 |
|---|---|---|---|
| 1 | `rss.js:32` — pass `rssSummary` through `resolve()` | `scripts/rss.js:32` | `feed.xml:29` ships `{{s:2026-07}}` to subscribers **today**. 1 line. |
| 2 | Hoist `assertNoTokens` into `lib/claims.js`; run over `feed.xml`, `editorial.json`, `index.html`, all generated pages | new `scripts/lib/claims.js`, `.github/workflows/collect.yml` | The guard already exists at `compile-reports.js:113-117` for one markdown file. |
| 3 | Delete/correct the three stale `vs2008` values **and the two reversed trend clauses** | `lab.js:42,66,90` | Three surfaces contradict the live number 26 lines above them; two assert the opposite direction from the data on the same page. |
| 4 | Correct five more published falsehoods | `lab.js:69,70,76,129,137,140,175` | APR record, card balance, wrong bureau, false foreclosure-availability claim, orders-vs-shipments, a 2020 claims figure in no current vintage. All emitted as schema.org JSON-LD at `indicator.html:127-131`. |
| 5 | Import `FROZEN_WARD_CALIBRATION`; delete the literal; assert equality before recompute | `scripts/collect-market.js:42`, `scripts/lib/market-integrity.js:72` | 11 divergent rounded scores; the gate cannot detect it. 2 lines. |
| 6 | Remove `build-market-divergence.js` from the daily cron | `.github/workflows/collect.yml:31` | Stops a daily cross-vintage join stamped with the wrong vintage. 1 line. |
| 7 | `narrative-check.js:126` — `^recon-ooze-` → `^recon-`, add household-jar and divergence patterns | `scripts/narrative-check.js:126` | Open D-10 repeat: 12 of 23 reader-visible archive reports ungated. |
| 8 | Extend `narrative-check.js` to `lab.js` INDICATORS prose, `editorial.json`, `feed.xml` — **warn mode for one cycle** | `scripts/narrative-check.js` | `lab.js:232` declares this invariant and 3 of 9 indicators violate it. Highest trust-per-hour item in the audit. |
| 9 | Add a `type` field to auto-detected `revisions.json` entries; stop calling ruler moves "source-revision events" | `scripts/integrity.js:36-64`, `scripts/story.js:97`, `scripts/editorial-furniture.js:30` | Readers are told the sources moved when the instrument re-indexed itself. The typed path already exists for the manual entries. |
| 10 | Pull or requalify the NFCI "climb about a month earlier" claim | `lab.js:113`, `articles.js:297`, `notes.html` | 0.79-point rounding-boundary crossing, two months *after* the NBER peak, on a series that did not exist until 2011. |
| 11 | Correct the NFCI revision-tolerance claim | `research/backtest-results.json`, `scripts/collect.js:222`, `scripts/backtest.js:199` | A published methodology claim wrong by 6.8×, exceeded in 81% of months. |
| 12 | `states.html`: remove from `sitemap.xml`, stamp SIMULATED on every row/podium/title/meta/OG, move `STATES` out of the shared bundle | `sitemap.xml:9`, `states.html`, `lab.js:190-201` | `about.html` promises "No fake numbers, ever." A screenshot of the podium is 100% fabrication with 0% disclosure. |
| 13 | `personal.html:85` — refuse to compute on zero income; carry the simulated-state caveat into the copied report | `personal.html:85,89,107` | A divide-by-zero guard is rendered and copyable as a real 50/100 SLIPPERY reading. |
| 14 | Fail loud: `integrity.js:31-32` on git/JSON failure; `stamp.js:105` → `if(missing>0)`; `stamp.js:44` reads a gate artifact | `scripts/integrity.js:31`, `scripts/stamp.js:44,105` | A skipped gate and a passed gate currently produce identical output; the page asserts PASS as a string literal. |
| 15 | `story.js:191` — fail closed rather than overwriting the archive with one article | `scripts/story.js:190-196` | A parse error silently deletes every prior monthly report. |
| 16 | Delete the fake sponsor slot | `oozeonomics.html:34-39`, `lab.js:508`, `lab.css:590-596` | The board killed this on 2026-08-02 and it was applied to one template. |

### P1 — INTERPRETATION (the number is right and the reader draws the wrong conclusion)

1. **Relabel the ounces** — "share of the score," or publish the 1.911× multiplier once. Remove
   the `+` at `what-is-ooze.html:87`.
2. **Publish all nine anchor tables and both `Math.max()` rules** on `notes.html`, with one
   worked example, using the ward annex's own pattern.
3. **Publish the information-age table** and state that the instrument is ~68 days behind.
4. **Render `EDITORIAL.story` + the household paragraph on `index.html`.** One div, one line of JS.
5. **Re-sort the canisters** to the three heaviest by ounces plus the month's largest mover;
   print ounces on the card face.
6. **Add the AUX badge to `lab.js:391-395`** — prerequisite for every zero-weight diagnostic.
7. **Disclose the calm anchor is December 2021** (CPI +7.0%, with gas at 59 and inflation at 67)
   and the GFC anchor is 2009-06, the NBER trough month.
8. **Disclose the 2025-10 hole** on `notes.html` and wherever the "since 2003" denominator appears.
9. **Surface `realTimeCompatible:false`** on `archive.html`, the `recon-ooze-*` articles and the
   `lab.js` timeline; publish the real-time equivalent beside the archive score.
10. **Disclose which `max()` arm is live** — add a `drivenBy` field to the payload — and name the
    232k claims threshold.
11. **Publish the four-row CCP credit scoreboard** with its stock/flow ratio, zero weight.
12. **Disclose the energy overlap**: effective weight ~13-14%, +1.51 jar points today.
13. **Disclose the housing rate branch** has been binding since 2022-04.
14. **Reconcile theory and model**: `what-is-ooze.html` sells a cascade; `collect.js:118` is an
    unconditional weighted mean whose declared terminal stage carries zero weight.
15. **Fix the COVID band copy** — band 42 must not read "Softening becomes slipping" for the
    month unemployment hit 14.8%.
16. **Add to the movers panel**: quarterly lines change only when a new quarter posts, so their
    absence is not evidence of stability.
17. **Publish the observation period and release date** separately from the quarter-start stamp.
18. **Add the editorial rule**: the voice may describe what the jar measured; it may never assert
    the absence of a phenomenon the jar cannot measure.
19. **Retract the foreclosure-availability claim** and publish NY Fed Page 17 as context.
20. **Update `research/data-source-registry.json`** — it documents retired v2 weights.

### P2 — PREDICTIVE AWARENESS

1. Add `EMRATIO` as a zero-weight auxiliary line (one id at `collect.js:80`, ~10 lines).
2. Ship rule **A1** as a two-state, one-sentence standing disclosure. Never a dated event —
   7 of 29 firing months change under revision.
3. Add real AHE ÷ CPI as the second and final zero-weight diagnostic.
4. Add an external-validity monitor to `integrity.js` — warn on the jar's own **rolling
   dispersion** and on `corr(ooze, real DPI/capita)`, not on sentiment alone.
5. Run the Flow privately, roster versioned against the NFCI vintage, z capped. Publish nothing.
6. Record the do-not-build list (§16) in the repo so rejected candidates are not re-proposed.

### P3 — UX

1. `index.html:144` — resolve the sensor count from `INDICATORS.length`.
2. Resolve the share-card glyph from `levelOf()`.
3. Replace the daily streak counter with a next-seal-date line.
4. Collapse the "Stress History — PENDING" panel to one sentence.
5. Write `research/lessons/0015-financial-conditions.html`.
6. Move `flowmap.html` out of the published directory.
7. Delete the dead ~60 lines of `lab.js` and the four `release-gate` assertions guarding
   `INCIDENTS`.
8. Rename `.up`/`.down` → `.worsening`/`.relieving`; give offline its own neutral class.
9. Raise the type floor to `.68rem` for any text carrying a number or a disclosure.
10. `defer` everything except `data/latest.js`; lazy-load `articles.js` (38% of blocking JS).
11. Swap the Ward M card below the first-timer explainer on the homepage rail.

### P4 — INTERESTING BUT UNNECESSARY (do not schedule)

Student-loan sensor (blocked on a backtestable series), rules C3/C5/C7, the `IPMAN` swap
(latent, currently dormant), `IC4WSA` vs the hand-rolled 4-week mean, `data/vintages/*` lifetime
policy, consolidating the seven band-table copies (identical today; the duplicates that matter
are the ones crossing a vintage boundary).

---

## 18. EXACT FILES / FUNCTIONS REQUIRING MODIFICATION

**Scripts**
- `scripts/rss.js` — `:32`, wrap `EDITORIAL?.rssSummary` in `resolve()`; delete the local
  `resolve` at `:15-20` in favour of the shared module
- `scripts/lib/claims.js` — **NEW**: `resolve(text, sources)`, `assertNoTokens(text, where)`
- `scripts/narrative-check.js` — `:126` filter; new scanners for `lab.js` INDICATORS,
  `data/editorial.json`, `feed.xml`; delete the local `resolve` at `:39-66`
- `scripts/collect-market.js` — `:42`, delete `CAL`, import `FROZEN_WARD_CALIBRATION`
- `scripts/lib/market-integrity.js` — `:72`, assert `market.calibration` against the imported
  constant *before* recomputing
- `scripts/integrity.js` — `:31-32` fail loud; `:36-64` add `type`; `:143` emit `data/gate.json`;
  new external-validity warn
- `scripts/stamp.js` — `:44` read the gate artifact; `:105` `if(missing>0)`
- `scripts/story.js` — `:97` revision-count wording; `:125` route the title through the SCORE
  token; `:150` use the shared `articles.js` loader; `:190-196` fail closed
- `scripts/collect.js` — `:80` add `EMRATIO` + real-wage ids; `:177-185` two new auxiliary
  lines; `:187-194` add `drivenBy`; `:222` tolerance wording; `:301-302` `console.assert` → throw
- `scripts/backtest.js` — `:199` tolerance wording
- `scripts/lib/methodology.js` — pin the gas deflator base **at the next version bump only**
- `scripts/backfill-reports.js` — `:46` derive `END` from `data/history.json`; `:172-178` use the
  validating interpolator
- `scripts/editorial-furniture.js` — `:30` revision-count wording
- `scripts/release-gate.js` — assert the score in all 13 stamped markers; drop the four
  `INCIDENTS` assertions
- `scripts/compile-reports.js` — `:31-37` compare values, not lengths
- `.github/workflows/collect.yml` — `:31` remove `build-market-divergence.js`; `:25` run all 31
  test files; add `assertNoTokens`; replace the bare `data/` add with an explicit file list

**Front end**
- `lab.js` — `:42,66,69,70,74,76,90,129,137,140,175` prose; `:190-201` STATES out of the bundle;
  `:235-249` resolver; `:391-395` AUX badge; `:227` offline class; delete `MOVERS`(`:147-151`),
  `bigChart`(`:336-353`), `adSlot`(`:508-510`), `relTime`(`:255-260`), nine `spark` arrays
- `lab.css` — `:115`, `:490` rename `.up`/`.down`; `:590-596` delete `.beaker-ad`; type floor
- `index.html` — `:144` sensor count; `:109` glyph; `:196` canister sort; `:236-243` streak;
  new `EDITORIAL.story` block
- `indicator.html` — `:77-80` collapse the PENDING panel; `:41` add the `financial` lesson
- `notes.html` — anchor tables, both `max()` rules, information age, ounces, calm anchor,
  2025-10, deflator basis, energy overlap
- `what-is-ooze.html` — `:87` remove `+`; cascade-vs-weighted-mean; band-42 copy; zero-weight
  terminal stage
- `oozeonomics.html` — `:34-39` delete `beaker-ad`
- `states.html` — SIMULATED stamps in title/meta/OG and on every row
- `personal.html` — `:85` zero-income guard; `:107` caveat in the copied text
- `sitemap.xml` — `:9` remove `states.html`
- `articles.js` — `:297` NFCI claim
- `archive.html` — real-time disclosure

**Data / research**
- `research/data-source-registry.json` — v3 weights, the ALFRED graph-endpoint method note, the
  `TEMPLAYOFF`→`LNS13023653` and `TEMPHELP`→`TEMPHELPS` corrections, the 2025-10 hole
- `research/backtest-results.json` — `methodology.financial.revisionTolerance`
- `data/reconstruction-reports.js` — token-ise or drop the hard-coded revision count in all 23

**Tests**
- `tests/claims.test.js` — **NEW**: `assertNoTokens` over every generated artifact
- `tests/market-integrity.test.js` — `assert.deepEqual(collectMarketCAL, FROZEN_WARD_CALIBRATION)`
  (**fails today**)
- `tests/methodology.test.js` — golden master + anchor boundary values
- `tests/lab-functions.test.js` — **NEW**: behavioural coverage of the browser pure functions
- `tests/narrative-check.test.js` — the prose-vs-data gate (**fails today, three times**)

---

## 19. AUTOMATED TEST PLAN

**Tier 0 — the two that fail today and would have caught a live defect**
- `assert.deepEqual(require('collect-market').CAL, FROZEN_WARD_CALIBRATION)`
- `assertNoTokens()` over `feed.xml`, `data/editorial.json`, `index.html` and every generated page

**Tier 1 — golden master (highest-value missing test)**
Freeze the ten source series for `2009-06`, `2020-04`, `2021-12` and `2026-07`; run them through
`householdStresses` + `CALIBRATION_V3`; assert the exact published score and all seven per-line
stresses. Assert `2009-06 → 90` and `2021-12 → 10` specifically — they are the calibration pegs
and they appear in published prose. Runs in milliseconds against the network-bound 60-second
integration test, and pins the numbers a source revision must not quietly move.

**Tier 2 — boundary values**
For each of the nine anchor tables: stress at every anchor x exactly, at x±ε, below the first
anchor, above the last, and at every interior knot (~130 assertions, all cheap). Today only
`auto30Plus` and `financialConditions` have any anchor test. Additionally assert
`interpolateAnchors` **throws** on a non-monotonic table — three of the five implementations
currently return a wrong number instead, and one returns `NaN` into an archive report.

**Tier 3 — score invariants (none exist today)**
`Σ contrib === ooze` exactly · every `contrib >= 0` · largest-remainder distribution is
deterministic under reordering · `0 ≤ ooze ≤ 100` for 10,000 randomised stress vectors ·
monotonicity: raising any single line's stress never lowers `ooze` · purity: same stresses in,
same score out, independent of collection date.

**Tier 4 — data-shape failure (every case must exit non-zero, never a partial `latest.json`)**
FRED returns 200 with an empty body · FRED returns HTML with a 200 · the keyed API 503s on the
9th of 10 series · the NY Fed workbook renames "Page 13 Data" · `unzip` is absent from PATH ·
`stressesFor` returns `null` when any of the ten inputs is null and the month is excluded from
`complete` (assert a mid-series gap produces a **gap**, not a forward-filled score — this is the
2025-10 case).

**Tier 5 — staleness and freshness**
At exactly 21 days a weekly line is not stale; at 22 it is · `staleLines` and
`freshnessStatus:'degraded'` are set together · `feedState` returns `'stale'` at
generated+48h+1ms and `'current'` at +48h−1ms · a stale line still publishes its value rather
than blanking · **credit currently sits 25 days from tripping `STALE_DAYS.quarterly`, and nobody
knows what that surface looks like in production.**

**Tier 6 — the prose-vs-data gate (fails today, three times)**
Extract every `Today's <value>` from `lab.js` `vs2008`/`why`/`faqs`; assert it matches
`data/latest.json` for that slug, or that the sentence is date-qualified, or that it is a
whitelisted historical constant.

**Tier 7 — browser behaviour (zero coverage today)**
Extract `lab.js`'s pure functions into a requireable module (or load under jsdom) and test
`feedState`'s four states, band boundaries at 20/21/40/41/60/61/80/81/95, offline rendering
(score renders `—` not `0`; `FEED_LABEL === 'OFFLINE'`; **no indicator carries the green class**),
`resolveClaims`, and `personalOoze` including the zero-income path.

**Tier 8 — zero-weight proof**
Assert `contrib === 0` and `scoreWeight === 0` for every auxiliary line, **and** that removing
them from `data/latest.json` does not change `ooze` — prove non-contribution rather than
asserting the label. Assert `collect.js` and `backtest.js` source text contains no reference to
the diagnostics module.

**Tier 9 — duplicate-consistency, as the step *before* the refactor**
`deepEqual` on the two anchor tables, the three Ward M anchor copies, and one band table imported
by all seven consumers. These make the deduplication provably behaviour-preserving.

**CI change:** run all 31 test files on the daily cron, or move the Ward M contract tests — which
need no network — into `collect.yml`. The quote-rights gate is about data acquisition, not about
running unit tests.

---

## 20. PROPOSED HOMEPAGE EXPERIENCE

Four rungs. A normal reader reaches a correct conclusion at rung 2 and never needs rung 4.
No rung may contradict a rung above it.

```
┌─ RUNG 1 · THE READING ─────────────────── ships today, correctly, unchanged
│
│                    Containment Level — July 2026
│                            26/100
│                 STICKY        ▼ −1 vs June 2026
│           Calmer than 6 of every 10 months since 2003
│
├─ RUNG 2 · WHAT'S DRIVING IT ───────────── one-line sort change + ounces on the card
│
│   WHAT'S DRIVING IT                                    26 oz total
│   🏠 Housing       7 oz   30-yr mortgage 6.542% (July)      was flat
│   💳 Credit Cards  6 oz   card delinquency 2.9% (Q1)        was flat
│   🚗 Auto Loans    5 oz   auto delinquency 7.9% (Q2)        was flat
│   ⛽ Gas Prices    4 oz   pump price $3.93 (July mean)      eased 3 points
│                                              [ See all 9 lines → ]
│
│   Ounces are each line's share of the 26 — not what the score would
│   drop by if the line went away, which is about twice as large.
│
├─ RUNG 3 · WHAT CHANGED ────────────────── data already exists, already gated, never rendered
│
│   [ EDITORIAL.story + the "what a household would notice" paragraph ]
│
├─ RUNG 4 · WHAT THE JAR CANNOT SEE ─────── one sentence, two states, no colour
│
│   The unemployment rate fell this month. The share of Americans with a
│   job also fell. The jar reads the first number and not the second.
│   Cross-check series carry no score weight. The reading is 26.   [ evidence → ]
│
└─ TRUST SPINE ──────────────────────────── unchanged; keep exactly as is
    Can I verify it? · four live links · sealed date · freshness badge
```

**Three rules that make this design work and are not negotiable:**
1. **Rung 4 prints observed series values only, never stress points.** That is what lets the
   subject of the sentence be the unemployment rate itself rather than a score move.
2. **The verb is a token.** `fell` / `eased` / `held roughly steady` must be emitted by the same
   threshold function the story engine uses. A hand-chosen verb is a hand-typed number wearing a
   coat.
3. **Rung 4 is never a permanent red.** If it fires every month for a year, that is a standing
   finding to be fixed in the methodology, not narrated forever.

**Deliberately absent:** any second score, any forecast, any arrow, any colour ramp, any
composite of the cross-checks, any confidence interval, any watch board.

---

## 21. BEFORE / AFTER — JULY 2026

**BEFORE (what the site publishes today)**

> **26/100 · STICKY · ▼ −1 vs June 2026**
> Calmer than 6 of every 10 months since 2003.
> *[featured canisters: Gas 4 oz · Inflation 2 oz · Jobs 2 oz · Financial 0 oz]*
> *[the "why it moved" paragraph exists in `data/editorial.json` and is rendered nowhere]*
> *[on `/gas/`: "Today's $3.42 is elevated…" beside a live $4.01]*
> *[on `/jobs/`: "Today's 4.4%… the direction of travel is what raises this line's pressure"
> beside a live 4.1% and a delta of −1]*
> *[in the seal article: "steady employment kept paychecks coming"]*
> *[in `feed.xml`: "sealed at {{s:2026-07}} out of 100"]*

A reader who checks finds: four featured cards showing 8 of 26 ounces with the three heaviest
lines hidden; one card for a line contributing zero; a page telling them gas is $3.42 next to a
page telling them it is $4.01; a jobs page asserting a rising direction of travel next to a
falling delta; and an RSS entry with a template token in it.

**AFTER (same number, same calibration, same seven lines, no restatement)**

> **26/100 · STICKY · ▼ −1 vs June 2026**
> Calmer than 6 of every 10 months since 2003.
>
> **WHAT'S DRIVING IT — 26 oz total**
> 🏠 Housing 7 oz · 30-yr mortgage 6.542% (July mean) · was flat
> 💳 Credit Cards 6 oz · card delinquency 2.9% (Q1 2026) · was flat
> 🚗 Auto Loans 5 oz · auto delinquency 7.9% (Q2 2026) · was flat
> ⛽ Gas Prices 4 oz · pump price $3.93 (July mean) · eased 3 points
> *Ounces are each line's share of the 26, not what the score would drop by if the line went
> away — that is about twice as large. Housing, credit and auto post no change most months
> because they update quarterly.*
>
> **WHAT CHANGED**
> For the average household, housing was the largest source of financial pressure in July 2026 —
> 7 of the month's 26 ounces, with the 30-year mortgage at 6.542%. The relief came from the two
> lines everyone feels first: gas prices and inflation, each down 3 points. Altogether the jar
> drained 1 point to 26.
>
> **WHAT THE JAR CANNOT SEE**
> The unemployment rate fell to 4.1% this month. The share of Americans with a job fell to
> 58.9%. The jar reads the first number and not the second. *Cross-check series carry no score
> weight. The reading is 26.* → *show the evidence*
>
> *[evidence panel]* Unemployment rate = unemployed ÷ labour force.
> June 7,094 ÷ 169,358 = 4.19%. July 6,916 ÷ 169,094 = 4.09%.
> **Hold the labour force at June's level: 7,181 ÷ 169,358 = 4.24% — the rate would have gone
> up.** The published fall is accounted for by a 264,000-person decline in the labour force.
> *Limits we state before you do:* a single month's payroll change of −23,000 is smaller than
> the establishment survey's own margin of error and we are not using it. Household-survey
> levels carry annual population controls that moved January 2026 by 1.4 million with nobody
> changing jobs, so we do not quote twelve-month level changes across that seam. These series
> carry zero weight. This is a measurement, not a forecast.
>
> *[on `/gas/`]* "In July 2008 the national average hit $4.11 …" — no "today's" figure, or a
> token that resolves to $4.01.
> *[in `feed.xml`]* "sealed at **26** out of 100."

**What changed:** nothing in the score, nothing in the calibration, nothing in the archive. Four
strings deleted, one token resolved, one sort inverted, one existing paragraph rendered, one
sentence and one evidence panel added, one FRED id added at zero weight.

**What the reader gains:** they can now answer "how is the job market?" correctly from the
homepage. Today they answer "steady — it says so," and they are wrong.

---

## 22. REMAINING UNKNOWNS

Recorded so the next reader does not mistake them for open tasks.

1. **Is today's 26 a false negative?** The jar-versus-purchasing-power divergence is the largest
   in the record, and the one prior instance (2021-22) resolved against the jar. **n = 2.
   UNKNOWN, and no surface should claim otherwise in either direction.**
2. **Does the jar have any out-of-sample validation?** No. Both calibration anchors sit inside
   the only credit cycle in the record. Every test in all twelve reports is in-sample.
3. **Is the May-2026 sentiment print comparable to 1980?** The Michigan survey moved to web-only
   interviewing in 2024 and carries a documented partisan component; the independent OECD series
   that would settle it was discontinued in 2024. **UNKNOWN.**
4. **Is the CCP card 90+ stock at 12.92% distress or accounting?** The stock/flow ratio (1.49 vs
   0.92 at the GFC) and bank net charge-offs at 3.84% both say accumulation, but the
   resolution/charge-off timing data that would prove it is not public.
5. **Can one 0-100 scale express both a slow purchasing-power squeeze and a fast labour shock?**
   Adding real wages raises 2022-06 by 18 points and lowers 2020-04 by 3. Unresolved design
   question, upstream of any weighting work.
6. **Where did six of the seven anchor sets come from?** No provenance document exists. If a
   rationale cannot be reconstructed, **that is itself the finding and should be disclosed.**
7. **Can the NY Fed auto series be extended before 2003?** If it can, the 2001 recession becomes
   testable and the GFC loses its monopoly on the validation set. The 6-line reconstruction
   suggests the anchors are **not stationary** — `DRCCLACBS` ran 4.5-6.5% through the 1990s,
   so the credit line reads 60-70 for a decade of full employment.
8. **Claims and delinquency revisions before 2009/2011 are unmeasurable.** ALFRED does not reach.
   The claims arm binds in 148 of 282 months and its GFC-era vintage behaviour cannot be checked.
9. **Would extending `narrative-check.js` to `lab.js` pass today?** It will not — three known
   failures — but nobody has run it to see what *else* it catches, which determines whether
   warn-mode is needed for one cycle or several.
10. **Reader comprehension of everything in §20 is untested.** `GA_ID` is empty (`lab.js:563`),
    so there is zero analytics history. The 30-word sentence is my judgement, not a measurement.
11. **No out-of-sample rule validation was run.** Every threshold in §8 was chosen after seeing
    the full history. A pre-2010 calibrate / post-2010 evaluate split should run before anything
    with a threshold ships.
12. **Does the 2025-10 gap propagate beyond the verdict line?** The denominator is 282 and the
    arithmetic is internally correct, but no one audited every `{{peak:}}` range or every
    "since 2003" string for windows straddling October 2025.
13. **Whether `states.html` and `personal.html` should exist at all** is a strategy question, not
    an audit finding. If they stay, the real NY Fed state data is already on disk.
14. **Student loans cannot be tested with existing artifacts.** $1.651T at 10.60% 90+ delinquency
    with zero sensor is the largest uncovered category, and there is no historical series in the
    pipeline to backtest against until the HHDC parser is extended.

---

## THE ANSWER

> **Can OOZEMeter explain economic conditions well enough that a knowledgeable user would trust
> how it reached its conclusion?**

# NOT YET

**Why not yet, precisely.**

A knowledgeable user checking OOZEMeter today would find the arithmetic flawless and the
explanation broken in four specific ways, each of which they would catch within an hour:

1. **The published recipe does not reproduce the published number.** `notes.html` gives them
   `Σ(weight × stress)`, one anchor point out of sixty, and no mention that two of the seven
   lines are a `Math.max()` of two different series. They cannot get to 26. On the same page,
   the zero-weight experimental wing publishes its complete formula with a worked example and
   the sentence "Every number on the ward card reproduces from this paragraph." **The flagship
   fails a test the side project passes.**

2. **They would catch the site contradicting itself on the same screen.** The gas page says
   "Today's $3.42" twenty-six lines below a live $4.01. The credit page says delinquency "has
   been climbing steadily" against seven consecutive quarterly declines. The jobs page asserts
   "the direction of travel is what raises this line's pressure" beside a published delta of −1.
   The RSS feed ships a raw template token. `about.html` promises "No fake numbers, ever" while
   fifty fabricated state scores are ranked into a podium and submitted to Google.

3. **They would find the ounces mean something other than what the interface implies.** The
   `+7` beside Housing invites "if housing went away we'd drop 7." The real answer is 12.19.
   The understatement is 1.911×, constant across all seven lines, and it is one fifth of the
   entire headline.

4. **They would discover the archive is not what the chart implies.** Historical months are
   scored with a deflator that did not exist at the time — worth +4.09 points on average, and
   responsible for all four non-crisis false alarms in 23 years. Two of the seven lines are fed
   by products that did not exist during the crisis the scale is calibrated on. One month,
   October 2025, is simply missing from a chart drawn as an unbroken line. None of this appears
   on any reader surface, though `realTimeCompatible:false` is set correctly in the JSON.

**Why the answer is NOT YET and not NO.**

Because none of the four requires changing a number. The score is right. Five independent
reconstructions from raw FRED agree on all 282 months. The pipeline fails closed, fingerprints
its inputs, freezes its calibration on purpose and explains why in a comment, catches its own
restatements, and gates its own publication. The instrument's honesty infrastructure is better
than the products it competes with — it is simply pointed at the wrong surfaces. The token guard
that would have caught `feed.xml` **already exists in this repo** and is applied to exactly one
markdown file. The zero-weight disclosure pattern the whole remediation depends on **already
ships**. The paragraph that answers "why did it move" **is already written, already gated, and
rendered nowhere.**

The P0 list is sixteen items and not one of them restates a published month. The gap between
this instrument and a trustworthy one is a week of deletions, one imported constant, one
resolved token, one workflow line removed, one sort inverted, and roughly two thousand words of
disclosure that mostly consists of publishing things the code already knows.

**Ship the disclosure. Do not touch the ruler.** The instrument's remaining weaknesses —
no purchasing-power sensor, a prime-weighted credit line, a GFC-anchored scale that structurally
cannot express 2020s distress — are real, are documented here, and are not fixable by adding
series to a scale calibrated on one credit cycle. They are fixable by saying so. A meter that
tells you precisely what it cannot see is trustworthy. A meter that quietly patches itself to
see more is not, and would have no way to prove it.

---

*Consolidated read-only by Agent 9. No production file was modified; this document is the only
file written. Every code claim above was re-verified against the working tree on 2026-08-14, not
inherited from the reports it consolidates.*
