# ECONOMIC SENSOR AUDIT — OOZEMeter v3.0.0

**Auditor:** Agent 1, Economic Investigator (domain economist)
**Date:** 2026-08-14
**Scope:** every intake line in the household jar (employment, gas, housing, credit, auto,
inflation, financial conditions, mortgage distress, manufacturing) plus Ward M.
**Subject state:** published month 2026-07, jar **26/100 "STICKY"**, `data/latest.json`
generated 2026-08-14T04:16:56Z.
**Method:** read the code; re-fetched every input from FRED CSV and the NY Fed HHDC
Q2-2026 workbook; re-derived the composite from `research/backtest-results.json` and
**reproduced all 282 published historical months exactly (0 mismatches)** before running
any counterfactual. Nothing here is speculation about what the code *might* do.
**Constraint honoured:** no production file was modified. This report is the only file written.

---

## VERDICT

OOZEMeter is a well-built pipeline wrapped around a **measurement selection problem**.
The engineering is genuinely careful — frozen calibration, atomic writes, input
fingerprints, vintage manifests, a revision detector, staleness flags, honest "proxy"
booleans. The economics underneath it is weaker than the engineering implies, in one
specific and repeatable way: **for four of the seven weighted lines, the project picked the
series that is easiest to fetch rather than the series that measures the concept, and then
wrote confident household prose on top of the easy series.**

The instrument's own field manual (`what-is-ooze.html`) says the meter "reads how far down
the cascade the average American household is," through a fixed order: gas → card → credit
exhausted → car → job → house. The arithmetic in `scripts/collect.js:118` is an
unconditional weighted mean. There is no cascade, no ordering, no threshold, no
conditionality anywhere in the code. **The published theory and the published arithmetic
are different models.** The current reading demonstrates the gap: the site names Housing as
the "biggest pressure source" (7 oz) while the *highest-pressure line in the jar is gas at
stress 58* — Housing only leads because it carries 19.4 weight at stress 44. And Housing's
44 is 100% the 30-year mortgage rate, a stage-zero price variable, while "foreclosures" —
the manual's declared terminal stage — carries zero weight and is not a foreclosure series.

Three findings are, in my judgement, disqualifying for the claims currently on the page:

1. **The credit line is a prime-borrower gauge sold as a distress detector.** OOZEMeter
   scores card stress at 38/100 from `DRCCLACBS` (2.92%). In the same quarter, NY Fed CCP
   credit-card balances 90+ days delinquent are **12.92%** — against a GFC peak of 13.73%.
   Small-bank card delinquency is **6.43%**, which on OOZEMeter's own anchor curve would
   score **86**. The jar cannot see the bottom half of the credit distribution.
2. **Student loans do not exist in this instrument.** $1.651T of balances — more than credit
   cards ($1.263T) — with 90+ delinquency at **10.60%**, up from 0.65% two years ago. This is
   the largest household-credit event of the last two years and the jar has no sensor for it.
   The data is inside the NY Fed workbook the collector *already downloads and parses daily*.
3. **The published record is not stable by construction.** The gas line deflates history to
   *today's* dollars (`cpiNow`, `scripts/collect.js:98`). Holding every source fixed and
   moving nothing but CPI +3%, **89 of 282 published months restate by ≥1 point**; at +10%,
   262 of 282 do. These restatements are logged to `data/revisions.json` and described to the
   public as "source-revision events." No source revised.

Against that, three things genuinely hold up and should not be touched: the
`max(unemployment, claims)` employment design (verified: claims stress led unemployment
stress by ~10 points through 2007), the choice of NSA CPI (never revised), and the NY Fed
auto transition rate (correctly identified, correctly labelled, correctly parsed).

---

# PART I — THE SEVEN WEIGHTED LINES

## 1. EMPLOYMENT — weight 24.25 — current stress 13

### What exactly is measured
`scripts/collect.js:108`
```js
jobs: Math.max(interp(ANCHORS.unemployment, un), interp(ANCHORS.claimsK, icsa/1000))
```
- `UNRATE` (BLS U-3), anchors `[[3.5,5],[5,25],[6.5,45],[8,62],[10,78],[15,90],[25,100]]`
  (`scripts/collect.js:38`).
- `ICSA` (DOL initial claims), trailing 4-week mean (`methodology.js:200`), anchors
  `[[200,5],[300,30],[400,60],[550,75],[700,85],[1000,95],[6000,100]]` (`collect.js:39`).
- Verified live: UNRATE 2026-07 = **4.1** → stress 13.0. ICSA trailing-4wk = **199,000** →
  stress **5.0** (the anchor floor). `max` = 13.0. Matches published stress 13. ✓

### Concept vs. measurement
Concept: "does the household have a paycheck." Measurement: one stock (share of *searchers*
without work) and one flow (new UI filings). Both are *searcher-conditioned*. Neither reads
employment.

### What it misses — with current numbers
The documented defect (`research/EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md`) is that PAYEMS is
absent. Here is what that costs **right now**:

| | Jul 2025 | Jul 2026 | move |
|---|---|---|---|
| UNRATE (the only thing scored) | 4.3 | **4.1** | **−0.2** |
| Household-survey employment CE16OV | 163,140k | 162,177k | **−963k** |
| Labor force CLF16OV | 170,412k | 169,094k | **−1,318k** |
| Payrolls PAYEMS 12-mo change | +794k | **+316k** | −60% |
| Participation CIVPART | 62.2 | 61.4 | −0.8pp |
| Prime-age (25-54) LFPR | 83.4 | **83.4** | **0.0** |
| 55+ LFPR | 38.1 | 36.9 | −1.2pp |

OOZEMeter reported jobs as an **easing mover (−1)** in a year when household-survey
employment fell by nearly a million. Arithmetically, U-3 can only fall while employment
falls if the labor force shrinks faster — which it did.

**I will not overstate this.** Prime-age participation is *flat* at 83.4, and 55+ LFPR
carries the whole decline, so most of the participation drop is demographic/composition, not
discouragement. A naive counterfactual holding participation at 62.2% gives U-3 = 5.28%
(stress 28.7 instead of 13.0, worth ~5 published jar points) — that number is an **upper
bound, not an estimate.** The defensible claim is narrower and still damning: *the line
cannot distinguish "unemployment fell because people got jobs" from "unemployment fell
because people stopped counting," and in the current reading it chose the flattering
interpretation with no ability to check.*

Also missing: continuing claims (`CCSA`, 1.791M, −8.0% YoY — this one argues *against* the
deterioration story and OOZEMeter can't use it either way); U-6 (7.9); median duration
(10.5wk); JOLTS hires rate (3.4, at 2013 levels); Sahm real-time (−0.03).

### Anchor validity — a silent decay
The claims anchor is an **absolute count**, fixed since v1. Claims per unit of labor force
have fallen structurally:

| | claims (4wk) | labor force | claims/LF (bp) |
|---|---|---|---|
| 2003-01 | 395k | 145.9M | 27.1 |
| 2007-06 | 315k | 153.0M | 20.6 |
| 2019-06 | 225k | 163.2M | 13.8 |
| 2026-07 | 203k | 169.1M | **12.0** |

Falling UI recipiency (gig/1099 work, state eligibility tightening) plus labor-force growth
means a fixed 200k floor is a *tighter* screen every year. The claims branch is now pinned at
its anchor floor (5.0) and is contributing nothing. The `max()` is currently a no-op.

### Leading / coincident / lagging
Claims: **leading**. Unemployment: **lagging**. The `max()` correctly lets the leading branch
dominate — and I verified this works:

| | UNRATE stress | claims stress | `max` picks |
|---|---|---|---|
| 2007-06 | 19.7 | **34.6** | claims |
| 2007-12 | 25.0 | **44.5** | claims |
| 2008-06 | 33.0 | **55.0** | claims |
| 2008-09 | 39.7 | **66.4** | claims |

Through the entire 2007–08 escalation, claims led unemployment by 10–27 stress points and the
`max` took the claims read every month. **This is a real, verified success of the design and
should be preserved.**

### Revisions
UNRATE: revised only via annual seasonal-factor updates and January population controls;
population-control breaks are *not* revised backwards, so the level can jump discontinuously.
ICSA: prior week revised every Thursday (typically ±3–8k) plus annual seasonal re-estimation.
PAYEMS (absent): benchmark revisions of ±0.3–0.5% (the 2024 benchmark was −818k) — the single
largest revision risk in US macro, and OOZEMeter avoids it only by not reading it.

### SME test
- **Measures:** share of active searchers without work; new UI filings.
- **Does not measure:** employment level, payroll growth, labor-force exit, hours, hiring
  rate, underemployment, wage adequacy, UI coverage.
- **Could mislead when:** participation moves; UI recipiency changes; population controls
  reset in January; a hiring freeze without layoffs (low claims, low U-3, no jobs).
- **Also check:** PAYEMS 3-mo avg (currently **+20k**), CE16OV, CCSA, JTSHIR, U-6, Sahm.
- **Would change interpretation:** prime-age LFPR breaking below 83; CCSA turning up; a
  benchmark revision.
- **Last divergence:** 2025-08 → 2026-07. CES +316k vs CPS −963k over twelve months — a
  ~1.28M survey split. Historically the establishment survey gets revised *down* at turning
  points, which is precisely the case OOZEMeter cannot represent.

---

## 2. GAS — weight 9.70 — current stress 58

### What exactly is measured
`scripts/collect.js:113`
```js
gas: interp(ANCHORS.gasReal, gas * cpiNow / cpi)
```
`GASREGW` (EIA weekly US regular, all formulations) deflated by CPIAUCNS **to the latest
available CPI month**, anchors `[[2,10],[3,35],[4,60],[5,85],[6.5,100]]` (`collect.js:45`).
Verified: 2026-07 monthly mean $3.932 → stress 58.3 ≈ published 58. ✓

### DEFECT 1 — the moving deflator restates published history (MAJOR)
`cpiNow = S.CPIAUCNS.last.value` (`collect.js:98`; identical at `backtest.js:92`). Every
historical month is re-expressed in *today's* dollars on every run. As CPI rises, every past
gas stress ratchets up, and every past jar score moves.

Measured, holding all sources fixed and moving only CPI:

| CPI change | published months restated ≥1pt | largest |
|---|---|---|
| +2% | **64 / 282** | 1 |
| +3% | **89 / 282** | 1 |
| +5% | 157 / 282 | 1 |
| +10% | **262 / 282** | 2 |

Concrete vintage drift already in the record: September 2005 scored gas stress **74.8** under
a July-2024 deflator and **81.9** under the July-2026 deflator — 7.1 stress points of pure
methodology drift, ~1.0 published jar point at weight 9.7 × calibration a=1.4187.

`data/revisions.json` shows three restatements in three weeks (244 months / max 6pt; 180 / max
2pt; 16 / max 1pt). `scripts/story.js:97` and `scripts/editorial-furniture.js:30` publish that
count to readers as **"source-revision events."** At least part of it is not a source
revision — it is the instrument moving its own ruler. *(Claim type: SUPPORTED-EXPLANATION for
the mechanism and its magnitude; CORRELATION for attributing any specific logged month to it,
since NFCI weekly re-estimation and in-month weekly means also move history.)*

### DEFECT 2 — display value and scored value are different numbers
`collect.js:160` publishes `value: "$4.01"` (weekly, as-of 2026-08-10) next to
`stress: 58` (July monthly mean, $3.93, deflated). Two different periods, two different
transforms, rendered adjacent as if one produced the other. The same pattern applies to
housing (6.67% weekly vs 6.542% July mean) and inflation.

### DEFECT 3 — the gas line can never read calm
Distribution of gas stress over the full 2003–2026 backtest:

| p0 | p10 | p25 | p50 | p75 | p90 | p100 | mean |
|---|---|---|---|---|---|---|---|
| 19.9 | 33.7 | 40.9 | **54.0** | 74.0 | 86.4 | 96.9 | **57.2** |

Its all-time minimum since 2003 is 19.9 (April 2020, the month oil went negative). It has a
structural floor around 20 and sits at 57 on average, so it injects ~5.5 raw points into
*every* reading regardless of household condition. At 9.7% weight, most of that is a constant,
not a signal. Its variance is oil-price variance.

### DEFECT 4 — energy is double-counted
Gasoline is scored at full weight here **and again inside the inflation line**, because
`CPIAUCNS` is headline CPI. Current magnitudes:

- Headline CPI YoY **3.36%** → inflation stress 30.5
- Core CPI YoY **2.47%** → would score 17.1
- Gasoline CPI YoY **+26.72%**; all-energy CPI YoY **+15.45%**

So ~13.4 stress points of the inflation line (44% of it) are the energy shock the gas line
already scores at 58. That is ~1.9 published jar points — roughly **7% of the current
headline of 26 — that is gasoline counted a second time**. No page discloses this; I grepped
`policies.html`, `about.html`, `what-is-ooze.html`, `oozeonomics.html`, `lab.js`, `articles.js`
for any overlap/double-count disclosure and found none.

### What else is missing
Gasoline is ~3% of consumer spending. Home energy (electricity + piped gas) is a comparable
share and is **rising faster in the direction that matters**: electricity CPI **+4.20% YoY**,
piped gas **+4.32%** — both above headline, both regressive, both invisible to this
instrument. Also missing: VMT (a driver's exposure is price × miles), regional dispersion
(CA/HI vs Gulf), and share-of-income.

### Leading / coincident / lagging
**Coincident to leading** for perception, **coincident** for budget impact. It is the fastest
line in the jar (weekly, 4-day lag).

### Revisions
GASREGW is essentially never revised (EIA survey of retail outlets). CPIAUCNS (the deflator)
is never revised. The instability is entirely self-inflicted by the moving base.

### SME test
- **Measures:** national mean pump price for regular, real-terms, in today's dollars.
- **Does not measure:** home energy, miles driven, regional dispersion, share of income,
  diesel (freight pass-through).
- **Could mislead when:** CPI moves (restates history); the display value and the scored
  value diverge; a demand-collapse price crash reads as relief.
- **Also check:** CPI electricity/piped gas, diesel, TRFVOLUSM227NFWA, WTI/Brent crack spreads.
- **Would change interpretation:** gasoline expenditure as a share of DSPIC96; whether the
  price move is supply (stress) or demand (recession signal) driven.
- **Last divergence:** Nov 2008–Feb 2009. Pump prices collapsed while household stress
  peaked. The gas line read 61.8 at the GFC peak (June 2009) — its *lowest* contribution of
  any crisis line — because a demand-collapse price crash is scored as relief.

### Live falsehood attached to this line
`lab.js:42` publishes: *"In June 2008, the national average hit $4.11 … **Today's $3.42** is
elevated but nowhere near that intake line's 2008 peak pressure."*
- Live GASREGW: **$4.006** (2026-08-10). The 2026 weekly peak was **$4.500** (2026-05-11) —
  **above** the 2008 nominal peak of $4.114.
- The $4.114 print was the week ending **2008-07-07**, not June (June mean $4.054).
- The all-time record is **$5.006** (2022-06-13), not 2008.
- This string is rendered raw at `indicator.html:92`; `resolveClaims` (`lab.js:235-249`) only
  substitutes `{{s:}}`, `{{peak:}}` and market tokens and does not touch it.

---

## 3. HOUSING — weight 19.40 — current stress 44

### What exactly is measured
`scripts/collect.js:110`
```js
housing: Math.max(interp(ANCHORS.mortgageRate, mort), interp(ANCHORS.mortgageDelinq, mdel))
```
- `MORTGAGE30US` (Freddie Mac PMMS, weekly), anchors `[[3,10],[5,25],[7,50],[10,70],[15,90],[18.6,100]]`
- `DRSFRMACBS` (FRB single-family residential mortgage delinquency, all commercial banks,
  quarterly, forward-filled), anchors `[[1,5],[2,25],[3,45],[5,65],[8,85],[11.5,95]]`

Verified: July 2026 mortgage mean 6.542 → rate stress **44.27**; Q1-2026 delinquency 1.89 →
delinquency stress **22.80**. `max` = 44.27 ≈ published 44. ✓

### DEFECT 1 — the line is currently 100% the price of a new mortgage (MAJOR)
Branch history over 283 months:

| branch | months | switches |
|---|---|---|
| rate | 109 | 2003-01→rate, 2022-04→rate |
| delinquency | 174 | 2007-10→delinquency |

**Since April 2022, the entire 19.4-weight housing line has been the 30-year mortgage rate.**
That is the marginal price of new credit. It is not household housing stress:

- ~2/3 of outstanding US mortgages are locked below 4%. For those households a 6.67% quote is
  *lock-in*, not payment pressure.
- Mortgage debt-service ratio **MDSP = 5.88%** (Q1 2026) vs GFC peak 8.95%.
- Total household debt-service ratio **TDSP = 11.16%** vs GFC peak 15.85% *and below* 2019Q4's
  11.73%.
- NY Fed CCP **new foreclosures: 55,160 consumers in Q2 2026**, vs 203,320 in Q1 2003.
- Case-Shiller +1.11% YoY — no equity destruction.

By every measure of actual housing *distress*, households are historically comfortable. The
line reads 44 because rates are high for buyers. **The instrument is scoring the housing
market, not housing stress.**

### DEFECT 2 — renters are absent entirely
~35% of US households rent. There is no rent input at any weight. Rent of primary residence
CPI is **+33.3% cumulative since Dec 2019** and +2.86% YoY; rental vacancy is 7.3% (loosening).
Whichever way rents move, the jar cannot see it. For the lower-income households the site's
prose is most concerned about, rent *is* the housing line.

### DEFECT 3 — DRSFRMACBS covers the wrong lenders
Bank-book delinquency excludes non-bank servicers, who now service the majority of US
mortgages and disproportionately hold FHA/VA — the stressed cohort. Cross-check from the same
NY Fed workbook: mortgage 30+ transition is **3.95%** (Q2 2026), *above* 19:Q4's 3.50% and up
from 1.45% in 21:Q2. The bank series says 1.89% and falling. The bureau series says
transitions are rising. **The two disagree in direction right now** and OOZEMeter only reads
the one that agrees with calm.

### DEFECT 4 — the same series is published twice under two names
`DRSFRMACBS` is the delinquency branch of Housing (`collect.js:164`) **and** the entire
"foreclosures" line (`collect.js:177-180`). See §8.

### Leading / coincident / lagging
Mortgage rate: **leading** (10-yr Treasury + spread, moves daily). Delinquency: **lagging**
(quarterly, ~5-month publication lag, forward-filled). The `max()` therefore switches the
line's *timing character* mid-cycle without telling the reader.

### Revisions
MORTGAGE30US: not revised. DRSFRMACBS: revised in subsequent quarters as bank call reports
are amended; magnitude typically ±0.02–0.05pp.

### SME test
- **Measures:** the quoted price of a new 30-year conforming mortgage, OR bank-held single-
  family delinquency, whichever is higher.
- **Does not measure:** rent, effective rate on outstanding debt, non-bank/FHA delinquency,
  foreclosure, property tax, insurance (the fastest-rising housing cost in FL/CA/TX),
  affordability, housing-cost burden, homelessness.
- **Could mislead when:** rates rise without distress (now); rates fall while delinquency
  rises (2008-09); renters are the stressed cohort.
- **Also check:** MDSP, TDSP, FIXHAI (103.3), CUSR0000SEHA, RRVRUSQ156N, NY Fed Page 17
  foreclosures, NY Fed Page 13 MORTGAGE transitions.
- **Would change interpretation:** the effective rate on outstanding mortgage debt (~4.3%, not
  6.67%); homeowner-vs-renter split.
- **Last divergence:** 2020-2021. Mortgage rates hit record lows (rate stress → 10) while
  forbearance masked ~7% of loans. The line switched to the delinquency branch and read the
  *forborne* rate, i.e. calm, at the exact moment 4M households were not paying.

---

## 4. CREDIT — weight 19.40 — current stress 38

### What exactly is measured
`scripts/collect.js:111`: `credit: interp(ANCHORS.cardDelinq, cdel)` where `cdel` is
`DRCCLACBS` — *Delinquency Rate on Credit Card Loans, **All Commercial Banks*** (FRB,
quarterly, forward-filled). Anchors `[[1.5,10],[2.5,30],[3.5,50],[5,70],[6.8,90],[9,100]]`.
Verified: Q1-2026 = **2.92** → stress 38.4 ≈ published 38. ✓

### DEFECT 1 — this is a prime-borrower gauge (CRITICAL)
The same FRB release splits the series by bank size. The relationship **inverted after ~2015**:

| quarter | all banks | banks *not* top-100 | gap | charge-off rate |
|---|---|---|---|---|
| 2006-Q1 | 3.86 | 3.15 | **−0.71** | 3.18 |
| 2009-Q2 (GFC) | **6.77** | 4.60 | −2.17 | 9.31 |
| 2019-Q4 | 2.61 | 6.68 | +4.07 | 3.77 |
| 2023-Q4 | 3.10 | **7.86** | +4.76 | 4.17 |
| **2026-Q1** | **2.92** | **6.43** | **+3.51** | 3.84 |

Small-bank card delinquency **peaked at 7.86% in Q4 2023 — above its own GFC level** — while
the all-bank aggregate read 3.10. On OOZEMeter's own anchor curve:
`interp(2.92) = 38.4` vs `interp(6.43) = **85.9**`.

*Claim type: SUPPORTED-EXPLANATION.* Mechanism: post-GFC, the top-100 issuers (Chase, Amex,
Citi, BofA, Discover, Capital One) hold overwhelmingly prime/superprime portfolios and
dominate the balance-weighted aggregate; near-prime and subprime card receivables migrated to
smaller banks and the fintech partner-bank model (WebBank, Celtic, Cross River). The
aggregate is now a prime-portfolio average. `lab.js:65` calls this line *"the economy's
early-warning smoke detector … millions of kitchen-table budgets are already failing."* The
series it reads is structurally incapable of showing that.

### DEFECT 2 — bank-book delinquency is drained by charge-offs (CRITICAL)
Under FFIEC Uniform Retail Credit Classification, banks charge off card debt at 180 days,
removing the balance from **both** numerator and denominator. The consumer's bureau record
does not clear. So in a rising-charge-off environment the bank series is mechanically capped
while the bureau series keeps climbing. Both from the NY Fed CCP workbook the collector
already downloads:

| quarter | DRCCLACBS (scored) | CCP card 90+ (ignored) |
|---|---|---|
| 2006-Q1 | 3.86 | 8.82 |
| 2010-Q1 (GFC peak) | 5.78 | **13.73** |
| 2019-Q4 | 2.61 | 8.36 |
| 2023-Q1 | 2.47 | 8.24 |
| **2026-Q2** | 2.92 (Q1) | **12.92** |

Card charge-offs are running 3.84% vs 2.88% in 2023 — the drain is active. **CCP card 90+
delinquency is within 0.8pp of its Global Financial Crisis peak.** OOZEMeter reads 38/100.
This is the single largest false negative in the instrument.

### DEFECT 3 — the two credit-adjacent lines use inconsistent measurement
Auto is scored from **NY Fed CCP Page 13 Data, AUTO column**. Credit cards are scored from a
**bank call-report series**. Page 13's **CC column (8.69%, Q2 2026) sits immediately beside
the AUTO column the parser already reads** (`methodology.js:141-165` locates the `AUTO`
header and walks the same rows). Two lines carrying 33.95 of 100 weight measure the same
concept on different instruments, for no stated reason.

### DEFECT 4 — the line is 4–7 months stale and structurally cannot be a "mover"
The July-2026 credit stress is literally Q1-2026 (Jan–Mar) data, forward-filled
(`collect.js:97`). `STALE_DAYS.quarterly = 250` (`collect.js:60`) keeps `stale:false` at 224
days old. Because of the forward-fill, `delta` is 0 in two months out of three, so a
19.4-weight line can almost never appear in the `movers` list (`collect.js:247`). Today's
movers are gas −3, inflation −3, jobs −1 — all fast lines. **The "what moved" panel is
structurally biased toward the fastest 21.9% of the weight and away from the slowest 33.95%.**

### Coverage gaps
No BNPL (an entire consumer-credit category invisible to bureaus until 2025), no personal
loans, no student loans (see §CROSS-1), no credit-union exposure, no utilisation
(NY Fed Page 10 has CC limit/balance/available — in the same file), no denial rates
(SCE Credit Access Survey), no severely-derogatory share (NY Fed Page 11:
**1.99% in Q2 2026, up from 1.03% in Q1 2023** — nearly doubled).

### Leading / coincident / lagging
Concept is **leading**; the chosen series is **lagging** (quarterly, ~5-month lag) *and*
prime-weighted. Worst of both.

### Revisions
DRCCLACBS: revised as call reports are amended; small. The NY Fed workbook footnote on Page 3
of the Q2-2026 report states *"2026Q2 report includes a revision to 2026Q1 credit card
balances outstanding"* — a revision OOZEMeter's detector cannot see, because it only
fingerprints the AUTO column.

### SME test
- **Measures:** balance-weighted 30+ delinquency on card loans held on US commercial bank
  balance sheets, dominated by prime portfolios.
- **Does not measure:** subprime/near-prime distress, charged-off balances, securitized
  receivables, fintech/partner-bank cards, BNPL, utilisation, credit access, student loans.
- **Could mislead when:** charge-offs accelerate (now); distress concentrates below prime
  (now); issuers tighten and shrink the denominator.
- **Also check:** DRCCLOBS (6.43), CORCCACBS (3.84), CCP Page 12 CC 90+ (12.92), Page 13 CC
  30+ (8.69), Page 11 severely derogatory (1.99).
- **Would change interpretation:** distributional data. A single balance-weighted mean cannot
  represent a bimodal population, and US household credit is bimodal.
- **Last divergence:** 2023–2024. Small-bank card delinquency hit an all-time high (7.86%)
  while OOZEMeter's series read 3.10 (stress 46). The jar scored that period 20–29.

### Live falsehoods attached to this line
- `lab.js:66` — *"Today's 3.2% delinquency"*. Live value **2.9%**.
- `lab.js:69` — *"APRs above 21%, the highest on record."* `TERMCBCCALLNS` latest =
  **20.94%** (May 2026); the record is **21.76%** (Aug 2024). Both halves false.
- `lab.js:70` — *"Over $1.1 trillion"* card debt. NY Fed Q2-2026 Page 3: **$1.263T**.
  Understated by $163B.
- All three render raw at `indicator.html:92`/`:104` **and are injected into schema.org
  `FAQPage` JSON-LD at `indicator.html:127-131`**, i.e. served to search engines as
  structured fact.

---

## 5. AUTO — weight 14.55 — current stress 47

### What exactly is measured
NY Fed HHDC workbook, sheet **"Page 13 Data"**, column **AUTO**
(`methodology.js:141-165`). I independently opened the Q2-2026 workbook and confirmed the
sheet header: **"New Delinquent* Balances by Loan Type" / "*30 or more days delinquent"**,
source *New York Fed Consumer Credit Panel/Equifax*. Q2-2026 AUTO = **7.87**. Anchors
`[[5,5],[6,15],[7,30],[8,50],[9,70],[10,85],[11,95],[12,100]]` (`methodology.js:9`) →
stress **47.4** ≈ published 47. ✓

**This line is correctly identified, correctly labelled, and correctly parsed. It is the
best-sourced line in the instrument.** `collect.js:168` describes it accurately as
"Previously current auto balance entering 30+ delinquency."

### Anchor observations
Series range 2003-Q1 → 2026-Q2 (94 quarters): min **4.96** (2021-Q4, stress 5.0 = floor), max
**10.85** (2009-Q2, stress 93.5), median 7.28, p10 6.29, p90 9.55. The 12 anchor is above the
all-time max, so the auto line has an effective ceiling of 93.5 — consistent with the
"depression-class = 100" doctrine, but worth stating: **auto can never reach 100.**

Note also 2003-Q1 = 8.57 → stress **61.4** during an expansion. The anchor curve reads
early-2000s-normal auto delinquency as "SLIPPERY." Whether that is a calibration flaw or a
true statement about 2003 subprime auto is genuinely open; it deserves a documented answer
that does not currently exist.

### What it misses
- **Affordability**, which is the actual 2026 auto story. `lab.js:78` says payments exceed
  $730 and terms run seven years — none of that is in the sensor. (I could not verify $730
  from any public source; J.D. Power/Experian figures are licensed. **Claim type: UNKNOWN.**)
- **Repossessions** (also unverifiable publicly; `lab.js:78`'s "past 1.9 million in 2009" is
  a Manheim figure — **UNKNOWN**).
- **Negative equity / LTV**, which converts a delinquency into a loss.
- **Severity:** 90+ auto delinquency is **5.49%** (Page 12, Q2 2026) vs 4.94% in 19:Q4 and
  4.47% at the GFC peak — i.e. *serious* auto delinquency is already above its GFC level while
  the 30+ transition OOZEMeter reads (7.87) is well below its GFC level (10.85). **The two
  disagree about whether auto is at crisis levels, and OOZEMeter reads the reassuring one.**
  Page 12 is in the same workbook, one sheet away.

### Timing and the `asOf` display problem
The Q2-2026 observation is dated **2026-04-01** (quarter *start*) and published in early
August 2026. The site shows "as of 2026-04-01" (`collect.js:167`). A reader concludes the
data is 4.5 months old; in fact it describes April–June and was released two weeks ago. The
same applies to credit. **Quarterly lines' freshness is displayed wrongly in both directions
at once** — the label is stale-looking, the underlying score is genuinely stale.

### Leading / coincident / lagging
30+ transitions are **leading within the credit complex** (households defend the car payment
late, so a rise means the cushion is gone) but **lagging in wall-clock terms** (~5-month
publication lag + forward-fill).

### Revisions
CCP is a 5% anonymized Equifax panel; revised as the panel refreshes and as furnishers
correct records. Typically ±0.05–0.15pp on recent quarters. **OOZEMeter's fingerprint covers
only the AUTO column, so revisions elsewhere in the file are invisible.**

### SME test
- **Measures:** share of previously-current auto balance entering 30+ delinquency, all
  lenders (bureau-based, so bank + captive + credit union + BHPH — good coverage).
- **Does not measure:** payment burden, LTV, repossession, term length, subprime share,
  severity (90+), insurance cost.
- **Could mislead when:** term extension suppresses the transition rate by lowering payments;
  a subprime lender exits and stops furnishing.
- **Also check:** Page 12 AUTO 90+ (5.49), Page 14 new-seriously-delinquent (3.00), CPI motor
  vehicle insurance, used-vehicle values.
- **Would change interpretation:** the 30+/90+ split. They are telling different stories now.
- **Last divergence:** 2024–2026. 30+ transitions plateaued at 7.7–8.0 while 90+ climbed from
  4.43 to 5.49 — cures are failing. OOZEMeter reads only the flow that plateaued.

### Live falsehoods attached to this line
- `lab.js:74` — static `trend:'▲ average APR'` on a value of `7.9%`. **7.9% is a delinquency
  transition rate, not an APR.** Overwritten in LIVE mode (`lab.js:215-216`) but rendered
  verbatim whenever `window.LIVE_DATA` is absent — and the coincidence that new-car APRs are
  also ~7% makes this maximally confusing.
- `lab.js:76` — `source:{name:'NY Fed / Experian'}`. The CCP is built on **Equifax**, as
  `backtest.js:176` correctly states. Wrong bureau named on the public page.

---

## 6. INFLATION — weight 9.70 — current stress 30

### What exactly is measured
`collect.js:109`: same-month YoY of `CPIAUCNS` (CPI-U, **not** seasonally adjusted), anchors
`[[-10,95],[-5,85],[0,45],[1,25],[2,10],[3,25],[4,40],[6,60],[9,80],[14,90],[20,100]]`.
Verified: 2026-07 = 333.918 vs 2025-07 = 323.048 → **3.36%** → stress 30.47 ≈ published 30. ✓

### What is right
Using **NSA** CPI is a genuinely good decision and I want it on the record: NSA CPI is
**never revised**, whereas CPIAUCSL is revised every February with new seasonal factors. This
removes a whole class of history churn. The V-shaped anchor (deflation scored as stress,
0% → 45) is also economically correct and better than most public dashboards.

### DEFECT 1 — rate-of-change, not level (MAJOR false negative)
Household inflation stress is **cumulative price level relative to income**, not the 12-month
change. The line reads 30/100 while:

- CPI is **+29.9% above Dec 2019**.
- Average hourly earnings are +32.6% nominal over the same span → **+2.01% real in six and a
  half years.**
- **Real wage growth is currently negative: AHE +3.15% YoY vs CPI +3.36% YoY = −0.21%.**

There is no wage series anywhere in the instrument. A jar that claims to measure household
pressure has no sensor for whether pay is keeping up with prices. **This is the second-largest
structural false negative after credit.** It is also the mechanical explanation for the
"vibecession" the site's own copy references — and the instrument cannot represent it.

### DEFECT 2 — headline CPI re-imports the gas line
See §2 DEFECT 4. Core is 2.47% (stress 17.1); headline is 3.36% (stress 30.5). 13.4 of the
30.5 is food+energy, and gasoline alone is ~0.86pp of the 3.36pp.

### DEFECT 3 — no distributional weighting
CPI-U weights by aggregate expenditure, which over-weights high-income households. Low-income
households spend a far larger share on food, energy, and rent — the components running hottest
(electricity +4.20%, piped gas +4.32%, rent +2.86% vs core 2.47%). The line reads the average
household's basket, not the stressed household's.

### Leading / coincident / lagging
**Coincident to lagging.** Shelter alone is ~35% of CPI and lags market rents by 9–12 months.

### Revisions
CPIAUCNS: never revised (only the annual January weight update changes forward construction).
The best revision profile of any input in the jar.

### SME test
- **Measures:** 12-month change in the urban consumer price index, all items, NSA.
- **Does not measure:** price *level* vs. income, real wages, distributional burden, core vs.
  headline, expectations, shelter lag.
- **Could mislead when:** YoY normalises after a level shock (exactly now); energy dominates
  the headline; base effects.
- **Also check:** CPILFESL (2.47), MEDCPIM158SFRBCLE (3.11), CES0500000003 vs CPI,
  LES1252881600Q, PSAVERT (**2.7%** — near record low, a direct stress signal with no sensor).
- **Would change interpretation:** any real-wage series.
- **Last divergence:** 2023–2025. CPI YoY fell from 9.1% to ~3% (line relaxed to 10–25) while
  the price *level* stayed 20%+ above 2020 and consumer sentiment stayed at recessionary
  levels. The jar scored 2024 at 23–28 through the loudest cost-of-living complaint in forty
  years. That gap is the instrument's most visible credibility exposure.

---

## 7. FINANCIAL CONDITIONS — weight 3.00 — current stress 10

### What exactly is measured
`collect.js:114`: `NFCI` (Chicago Fed, 105 indicators — **verified correct**), calendar-month
mean of weekly values, anchors `[[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]]`.
Verified: 2026-08-07 = −0.549 → stress 10.46 ≈ published 10. ✓

### The published benefit claim — TESTED, PARTIALLY VERIFIED
`lab.js:113` claims: *"in backtesting it made the score climb about a month earlier during the
slow credit tightening of 2007–08."* I rebuilt both composites from
`research/backtest-results.json` — v3 (7 lines) and v2 (the same 6 lines renormalised ×1/0.97,
which reproduces the v2 weights exactly) — and **recalibrated each independently** under its
own calm→10 / GFC→90 rule, which is the only fair test.

**Result: the cross-60 benefit replicates.** v3 crosses 60 in **2008-02**; v2 in **2008-03**.
One month earlier, on current data. The claim is not fabricated and I will not report it as
one.

**But the cost is real, undisclosed, and points the wrong way:**

| month | v3 (with NFCI) | v2 (without) | Δ |
|---|---|---|---|
| 2007-01 | 37 | 38 | **−1** |
| 2007-02 | 39 | 40 | **−1** |
| 2007-03 | 39 | 40 | **−1** |
| 2007-04 | 42 | 43 | **−1** |
| 2007-05 | 43 | 44 | **−1** |
| 2007-06 | 45 | 46 | **−1** |
| 2007-07 | 46 | 47 | **−1** |
| 2007-08 (BNP Paribas) | 46 | 46 | 0 |
| 2007-11 | 56 | 55 | +1 |
| 2008-02 | 60 | 59 | +1 |

Through the **first seven months of 2007** — the run-up to the credit crunch — adding NFCI
made the jar read **lower** every single month. The first month it added anything was
**November 2007**, three months *after* BNP Paribas froze its funds and one month *before* the
NBER recession start. Threshold-wise it is worse: v2 crosses 20 in **2018-06**; v3 does not —
**NFCI suppresses a 2018 alert entirely.**

`lab.js:113` does disclose *"in calm markets its arithmetic effect on the blended score is
slightly negative."* That disclosure is insufficient: **2007 H1 was not a calm market**, and
that is exactly when the dilution bit. The honest sentence is "it dilutes the score through
the early ramp and pays it back one month before the crisis is undeniable."

*(One caveat in the project's favour: `research/gfc-sensitivity-results.json` at `w:3` records
`"earlier": []`, which at first read looks like a contradiction. It is not — that study
evaluates **ex-GFC** windows only, and the spec correctly says the benefit exists only inside
2007-2009. The cross-60 figure comes from `weight-optimization-results.json` at `w:3`,
`gfc60:"2008-03->2008-02"`, which I reproduced. Credit where due: the studies are real and
the finding survives replication.)*

### Concept mismatch
NFCI measures **financial-system** conditions, not household conditions. Its current −0.549 is
driven by the **risk** subindex (−0.623); credit (−0.060) and leverage (+0.036) are neutral.
So the headline "conditions are loose" is a statement about asset-price volatility and risk
appetite, not about whether a household can get a loan. At 3% weight this is honest and cheap;
the concern is the reasoning, not the size.

### Revisions
Chicago Fed **re-estimates the entire history weekly**. `methodology.js` and
`collect.js:222` set a tolerance of |Δ| ≤ 0.02 per monthly mean. This is well-handled and
well-documented — the best revision handling in the project. It is also, by construction, a
second source of continuous historical churn independent of the gas deflator.

### SME test
- **Measures:** 105 money-market, debt-market, equity-market and shadow-banking indicators,
  standardised, weekly.
- **Does not measure:** household credit access, denial rates, terms offered to consumers.
- **Could mislead when:** risk appetite is high while consumer credit is tightening (now);
  QE/liquidity injections suppress the index during a real-economy recession.
- **Also check:** ANFCI (−0.579), NFCICREDIT (−0.060), NFCILEVERAGE (+0.036), NFCIRISK
  (−0.623), SLOOS consumer-loan standards, NY Fed SCE Credit Access.
- **Would change interpretation:** the credit subindex diverging from the headline.
- **Last divergence:** 2021–2022. NFCI stayed negative (loose, stress 25-35) throughout the
  fastest tightening cycle in forty years, because asset prices were still supported.

---

# PART II — THE ZERO-WEIGHT LINES

## 8. MORTGAGE DISTRESS / "FORECLOSURES" — weight 0 — current stress 23

`collect.js:177-180` publishes `DRSFRMACBS` (1.89%, Q1 2026) under the slug `foreclosures`,
name "Mortgage Distress," `contributesToOoze:false`, `calibrationStatus:'provisional-auxiliary'`.

### DEFECT — the published justification is false (MAJOR)
`lab.js:129` states:
> *"A consistent public national foreclosure-filings series is not available through the same
> open acquisition path."*

**This is false.** The NY Fed HHDC workbook that `fetchNyFedAutoSeries()` downloads and unzips
**every single day** contains sheet **"Page 17 Data": "Number of Consumers with New
Foreclosures and Bankruptcies," Thousands, source New York Fed Consumer Credit Panel/Equifax,
03:Q1 → 26:Q2.** I extracted it with the project's own parser plumbing:

| quarter | new foreclosures (000s) | new bankruptcies (000s) |
|---|---|---|
| 03:Q1 | 203.32 | 612.26 |
| 09:Q2 | (GFC era) | — |
| 25:Q4 | 58.14 | 123.82 |
| 26:Q1 | 59.16 | 124.02 |
| **26:Q2** | **55.16** | **136.80** |

Same file. Same acquisition path. Same parser (`worksheetCells` + `resolveWorksheetPath`,
`methodology.js:94-131`). The stated reason for using a proxy does not survive contact with
the file the collector already has open.

*(Note the honest substance: foreclosures at 55k/quarter are near record lows, so the proxy is
not currently producing a wrong* direction*. But bankruptcies rose +10.3% QoQ, which the
proxy cannot show. And "the data doesn't exist" is a load-bearing public claim that is
untrue.)*

### Duplication
This line displays the *identical value* to Housing's `secondary` source
(`collect.js:164`). The same number appears twice on the site under two different names —
once as an input to a 19.4-weight line, once as a standalone "Mortgage Distress" sensor. The
FAQ at `lab.js:130` addresses double-*counting* (correctly: weight is 0) but not
double-*display*, which is the thing a reader actually notices.

### SME test
- **Measures:** bank-held single-family residential mortgage delinquency.
- **Does not measure:** foreclosure starts, foreclosure inventory, REO, non-bank/FHA/VA
  delinquency, forbearance, loss mitigation.
- **Could mislead when:** servicing has migrated off bank balance sheets (it has); policy
  moratoria suppress filings (2020-21).
- **Also check:** NY Fed Page 17 (available, unused), Page 13 MORTGAGE 30+ (3.95%, rising),
  MBA National Delinquency Survey.
- **Last divergence:** 2020–2021. Foreclosure moratoria + forbearance drove filings to
  near-zero while ~7% of mortgages were non-performing. Any filings-based series would have
  read "no stress"; any delinquency series would have read "extreme stress." The instrument
  needs both and publishes neither correctly.

---

## 9. MANUFACTURING — weight 0 — current stress 27

`collect.js:154`: `INDPRO` YoY, anchors `[[-20,100],[-10,85],[-5,65],[0,35],[3,15],[6,5]]`
(`collect.js:48`). Verified: 2026-06 INDPRO YoY = **+1.14%** → stress 27.4 ≈ published 27. ✓
Secondary: `AMTMNO` YoY (`collect.js:156-157`).

### DEFECT 1 — mislabelled series (published on the site)
`AMTMNO` is **"Manufacturers' New Orders: Total Manufacturing"** (confirmed from the FRED
series page). The code names it `shipmentsMonth` / `shipmentsYoY` (`collect.js:156-157`) and
publishes it under that concept in two places:
- `lab.js:137` — *"Federal Reserve industrial production and **Census manufacturers'
  shipments**"*
- `lab.js:140` — *"with Census **manufacturing shipments** as context"*

New orders and shipments are different economic concepts with different cyclical timing
(orders lead, shipments coincide). The correct shipments series is `AMTMVS`. Compounding it,
`AMTMNO` is **nominal dollars**: the published +7.37% YoY is +3.84% after CPI deflation, so
roughly half the reported "manufacturing" strength is inflation.

### DEFECT 2 — INDPRO is not manufacturing
INDPRO = manufacturing + mining + **utilities**. `IPMAN` is the manufacturing subindex and is
on FRED at zero additional cost. Right now they agree (both +1.1% YoY, stress 27 vs 27), so
this is a **latent** defect — but historically it is large:

| month | INDPRO stress | IPMAN stress | Δ |
|---|---|---|---|
| 2014-01 | 23 | **38** | **−15** |
| 2018-01 | 17 | 30 | −14 |
| 2022-07 | 29 | 40 | −11 |
| 2005-09 | 24 | 15 | +9 |

January 2014 is the clean case: a polar-vortex utilities surge lifted INDPRO while
manufacturing was contracting. OOZEMeter's transform would have reported manufacturing 15
stress points calmer than it was. `proxy:true` is set in the JSON (`collect.js:184`) — good —
but the reader-facing page names it "Manufacturing."

### SME test
- **Measures:** total industrial output including mining and utilities, YoY.
- **Does not measure:** manufacturing employment (MANEMP −14k YoY), orders in real terms,
  capacity utilisation, new-order sentiment, backlog (AMTMUO).
- **Could mislead when:** weather moves utilities; oil-rig activity moves mining.
- **Also check:** IPMAN, AMTMVS (real shipments), AMTMUO, MANEMP.
- **Last divergence:** 2014-01 (above); also 2021-02, when a Texas grid failure moved INDPRO
  independently of factory conditions.

---

# PART III — WARD M (market instrument)

`scripts/collect-market.js`. Six equally-weighted gauges, simple mean, calibration
`{a:1.4025, b:-7.0116}` frozen at `collect-market.js:42`, rule "ward calm 2007-present = 10,
ward GFC peak = 90." Current published score **27** (raw 24), `data/market.json` generated
2026-08-11.

Verified live gauge values against FRED: rates T10Y3M 0.78pp → 26; volatility VIXCLS 15.6 →
19; credit NFCI −0.53 → 11; energy WTI $82 → 52; dollar DTWEXBGS −0.8% YoY → 23; breadth
10/11 steady → 13. All reproduce. ✓

## WARD-1 — The energy gauge has the wrong sign at crisis extremes (CRITICAL)
Anchors `[[40,10],[60,25],[80,50],[100,75],[130,95],[160,100]]` (`collect-market.js:71`) —
monotonically increasing in oil price. But market crises **crash** oil:

| month | WTI | energy stress | VIX stress | credit stress |
|---|---|---|---|---|
| 2008-06 | $133.9 | 96 | 40 | 66 |
| **2008-11** | $57.3 | **23** | 100 | 100 |
| **2008-12** | $41.1 | **11** | 92 | 99 |
| 2009-02 | $39.1 | **10** | 86 | 91 |
| **2020-04** | $16.5 | **10 (floor)** | 81 | 53 |

In April 2020 — the month WTI printed **negative for the first time in history** — the energy
gauge reads its **floor**. At 1/6 weight that is ~13 stress points of active suppression
delivered precisely when the instrument is supposed to scream.

## WARD-2 — The rates gauge is backwards at recession onset (CRITICAL)
Anchors `[[-1.5,100],[-1,85],[-0.5,70],[0,45],[0.5,30],[1.5,15],[2.5,5]]`
(`collect-market.js:55`) — inversion = stress. But the curve **bull-steepens violently into
recessions** as the Fed cuts:

| month | T10Y3M | rates stress |
|---|---|---|
| 2007-03 | −0.52pp | **70** |
| 2008-01 | +0.92pp | 24 |
| **2008-09 (Lehman)** | +2.54pp | **5 (floor)** |
| 2008-12 | +2.38pp | 6 |
| 2009-06 | +3.54pp | **5 (floor)** |
| 2020-03 | +0.57pp | 29 |

**At the peak of the GFC the rates gauge reads maximum calm.** Combined with WARD-1, that is
**two of six equally-weighted gauges pinned at or near their floors during the exact episode
the calibration is anchored to.** Ward M reaches 90 in Nov-2008 only because volatility,
credit and breadth simultaneously max out and overwhelm them. Any crisis that is a slow grind
rather than a volatility spike will be badly understated by construction.

## WARD-3 — The live composite is not the composite that was calibrated (MAJOR)
`scripts/backtest-market.js:137` self-discloses:
> *"Historical breadth uses successive monthly Yahoo closes; live Sector Watch uses a
> 22-session daily interval requiring 23 closes, so the two breadth transforms are not
> identical."*

Breadth is 1/6 of the score. The frozen calibration `{a:1.4025, b:-7.0116}` was derived on
transform A; the published score is produced with transform B. **The calibration does not
strictly apply to the number on the page.** This is disclosed in a research JSON and not on
`market.html`.

Its churn is enormous: `data/market.json` records breadth `delta: **-37**` in a single
collection — 37 stress points on 1/6 weight = 6.2 raw = **8.7 published Ward points from one
manual panel update**. The panel is manual, the quote rights are unresolved
(`research/sector-watch-quote-rights-2026-08-01.md`), and it is the only non-FRED input.

## WARD-4 — Three of six gauges measure the same latent variable
Volatility (VIX), credit (NFCI), and breadth (equity proxy panel) are all risk-appetite
measures. NFCI's own decomposition proves it: **NFCIRISK = −0.623** dominates the −0.549
headline while NFCICREDIT (−0.060) and NFCILEVERAGE (+0.036) are neutral. Ward M's "credit"
gauge is currently reading equity/vol risk under a credit label. Effective weight on
risk-appetite ≈ 50%, not 17%.

## WARD-5 — The dollar gauge is one-sided
Anchors `[[-5,10],[0,25],[4,45],[8,65],[12,85],[16,100]]` — only *appreciation* is stress. A
disorderly **depreciation** driven by capital flight from US assets scores as calm (current
−0.8% YoY → 23). `collect-market.js:77` honestly reads *"is not itself a funding-stress
measure"* — good disclosure, but the anchors remain unable to represent half the failure mode.

## WARD-6 — "Separate instrument" is misleading
`lab.js:117` publishes: *"markets get their own separate instrument in Ward M, **which never
touches this score**."* The forward direction is true. The reverse is not disclosed:
**NFCI is an input to both** — 3.00/100 of the household jar and 1/6 of Ward M, at *identical
anchors* (`methodology.js:10` vs `collect-market.js:66`). A reader seeing jar 26 and Ward 27
will read that as two independent instruments agreeing. They share an input. This is
framing, not falsehood — but it is framing that manufactures false confirmation.

---

# PART IV — CROSS-CUTTING

## CROSS-1 — Student loans: the largest uncovered category (CRITICAL)
$1.651T in balances (NY Fed Page 3, Q2 2026) — **larger than credit cards ($1.263T)**, near
auto ($1.713T). Delinquency, from the workbook the collector opens every day:

| quarter | student 90+ | student 30+ transition |
|---|---|---|
| 19:Q4 | 11.06 | 9.44 |
| 23:Q1 (payment pause / on-ramp) | **0.67** | 1.06 |
| 24:Q2 | 0.65 | 0.92 |
| 25:Q2 | 10.16 | 13.03 |
| 25:Q4 | 9.57 | **16.35** |
| **26:Q2** | **10.60** | 7.83 |

A 15x move in delinquency across a $1.65T asset class, affecting ~43M Americans, with zero
representation in a "US household economic stress score." The data is free, already
downloaded, and one column away from a column the parser already reads.

## CROSS-2 — Severe distress has no sensor
NY Fed Page 11, share of total balance:

| | 23:Q1 | 26:Q2 |
|---|---|---|
| Severely derogatory | 1.03% | **1.99%** |
| 120+ days late | 0.33% | **1.09%** |

Severely-derogatory balances have nearly doubled and 120+ has tripled. These are households
that have already failed. The jar reads 26.

## CROSS-3 — The savings buffer has no sensor
`PSAVERT` = **2.7%** (June 2026), near the lowest readings on record outside 2005-2007 and
July 2005's 2.1% all-time low. The personal saving rate is the single best summary of whether
households have a cushion — and it is the mechanism the site's own cascade narrative depends
on ("savings absorb it," `what-is-ooze.html`). Not measured.

## CROSS-4 — The published theory is not the implemented model (MAJOR)
`what-is-ooze.html` sells a six-stage ordered cascade. `collect.js:118` implements
`Σ(wᵢ·sᵢ)/100` — an unconditional linear blend. There is no state, no ordering, no threshold,
no interaction term. Consequences visible in today's reading:
- Gas is the **highest-stress line (58)** but shows as the 4th "pressure source" (4 oz),
  because contribution is weight×stress. Jobs at stress 13 shows 2 oz. A reader told "biggest
  pressure sources: Housing 7 oz" is being shown a **weight ranking dressed as a pressure
  ranking.**
- The cascade's stage-6 terminal event (foreclosure) carries **zero weight** and is not
  measured; the cascade's stage-0 (gas) and a stage-0 price variable (mortgage rate) carry
  29.1 combined.
- `OOZEMAXING` (`collect.js:264`, `every(v => v >= 60)`) is the *only* piece of cascade-like
  logic in the code, and it is a breadth flag on the output, not a mechanism.

## CROSS-5 — Anchor floors mean the jar cannot read as calm as it claims
Per-line stress distributions over the full 282-month backtest:

| line | min | median | max | mean | sd |
|---|---|---|---|---|---|
| employment | 5.0 | 36.0 | 98.7 | 39.4 | 25.2 |
| **housing** | **24.9** | 47.6 | 94.9 | 55.9 | 21.7 |
| credit | 10.6 | 38.4 | 89.7 | 42.3 | 18.8 |
| auto | 5.0 | 35.6 | 93.5 | 41.1 | 21.7 |
| **gas** | **19.9** | 54.0 | 96.9 | **57.2** | 19.5 |
| inflation | 10.1 | 23.1 | 80.1 | 28.0 | 16.2 |
| financial | 5.0 | 11.3 | 100.0 | 18.1 | 19.0 |

Housing and gas — 29.1 of 100 weight — have never in 23 years registered below 20 and 25.
Their means (55.9, 57.2) are near the middle of the scale. Roughly a third of the jar's weight
is a high, slow-moving constant. That is why "calm = 10" required calibration constants of
a=1.4187, b=−23.97: **the raw composite's floor is ~24, and 24 points of the raw scale are
subtracted away to make SMOOTH reachable.** It works, but it means the published score's
dynamic range is materially narrower than 0–100 suggests.

## CROSS-6 — Movers are structurally biased toward the fastest lines
Forward-filled quarterly lines (`collect.js:97`) have `delta == 0` in ~2 months out of 3. So
credit (19.4) and auto (14.55) — 33.95% of the weight — are near-invisible in the `movers`
panel (`collect.js:247`), while gas (9.7), inflation (9.7) and jobs (24.25) dominate it.
Today's published movers: gas −3, inflation −3, jobs −1. Every one is a fast line.

## CROSS-7 — Published prose carries eight unverified or false numbers
All render raw at `indicator.html:92` / `:104`; the FAQ set is additionally emitted as
schema.org `FAQPage` JSON-LD at `indicator.html:127-131`. `resolveClaims`
(`lab.js:235-249`) resolves only `{{s:}}`, `{{peak:}}` and market tokens and cannot touch
these.

| # | file:line | published | verified | status |
|---|---|---|---|---|
| 1 | lab.js:90 | "Today's 4.4%" unemployment | 4.1% | FALSE *(known)* |
| 2 | lab.js:42 | "Today's $3.42" gas | $4.006; 2026 peak $4.50 | FALSE |
| 3 | lab.js:42 | 2008 "$4.11 … a record" | record is $5.006 (2022-06); $4.114 was week of 2008-07-07, not June | FALSE |
| 4 | lab.js:66 | "Today's 3.2%" card delinquency | 2.92% | FALSE |
| 5 | lab.js:69 | "APRs above 21%, the highest on record" | 20.94% now; record 21.76% (2024-08) | FALSE ×2 |
| 6 | lab.js:70 | card debt "Over $1.1 trillion" | $1.263T | FALSE |
| 7 | lab.js:76 | source "NY Fed / **Experian**" | CCP is **Equifax** | FALSE |
| 8 | lab.js:129 | national foreclosure series "not available through the same open acquisition path" | NY Fed Page 17 Data, same workbook | FALSE |
| 9 | lab.js:137,140 | "Census manufacturers' **shipments**" | AMTMNO is **new orders** | FALSE |
| 10 | lab.js:74 | auto `trend:'▲ average APR'` on 7.9% | 7.9% is a delinquency transition rate | FALSE (offline path) |
| 11 | lab.js:78 | "$730 average payment", "1.9M repossessions" | licensed data, unverifiable | **UNKNOWN** |

Verified **true** and worth noting: card charge-offs peaked at 10.51% in 2010-01
(`lab.js:66` ✓); CPI YoY 5.6% in 2008-07 (`lab.js:102` ✓); CPI YoY 9.06% in 2022-06
(`lab.js:102`, published as 9.1% ✓); unemployment 10.0% in 2009-10 and 14.8% in 2020-04
(`lab.js:90` ✓); NFCI "105 measures" (`lab.js:113` ✓).

---

# PART V — WHAT WORKS

Reported as prominently as the failures, because rebuilding these would be a regression:

1. **`max(unemployment, claims)`** — verified to fire correctly through 2007-08; claims led
   unemployment by 10–27 stress points and the `max` took the leading branch every month.
2. **NSA CPI** — the only never-revised price series. A deliberate, correct choice that
   eliminates an entire class of history churn.
3. **NY Fed auto transition rate** — correctly identified, correctly labelled, correctly
   parsed from the primary workbook rather than a secondhand aggregate.
4. **Frozen calibration with drift monitoring** (`methodology.js:21-27`, `backtest.js:127-137`)
   — publishing with frozen constants while re-deriving to *measure* drift is a genuinely good
   discipline. Current drift is tiny (derived a=1.418809 vs frozen 1.418684).
5. **NFCI revision tolerance** (`collect.js:222`, ±0.02 on monthly means) — correctly
   anticipates weekly full-history re-estimation. Best revision handling in the project.
6. **The revision detector itself** (`scripts/integrity.js:41-63`) — catching and publishing
   its own restatements is rare and right. The problem is the *label*, not the mechanism.
7. **Auxiliary lines carry `scoreWeight:0` and `calibrationStatus:'provisional-auxiliary'`**
   — structurally honest.
8. **Ward M's `note` field** — *"It is not household pressure and does not affect the Ooze
   Score"* — exactly the right disclosure, in the data itself.
9. **The V-shaped inflation anchor** — scoring deflation as stress is economically correct and
   better than most public dashboards.

---

# PART VI — QUESTIONS OOZEMETER CANNOT ANSWER

Documented as required. Each is a question a reasonable reader of a "household economic
stress score" would expect it to answer.

1. Are wages keeping up with prices? *(no wage series at any weight; real AHE is −0.21% YoY)*
2. Did unemployment fall because people found work or because they stopped looking?
3. How many people are employed? *(no PAYEMS, no CE16OV)*
4. What is happening to the bottom quintile? *(every line is a balance- or expenditure-weighted
   national mean)*
5. Are student-loan borrowers in distress? *($1.651T, 10.6% 90+, zero sensor)*
6. Do households have savings? *(PSAVERT 2.7%, zero sensor)*
7. What is happening to renters? *(35% of households, zero sensor)*
8. Are people losing their homes? *(the "foreclosures" line is not a foreclosure series; the
   real one is in the file already downloaded)*
9. Is credit getting harder to obtain? *(no denial rates, no SLOOS, no utilisation)*
10. Is the price *level* — not its rate of change — a burden?
11. How much of household income goes to debt service? *(TDSP/MDSP exist and are unused)*
12. Is home energy affordable? *(electricity +4.20% YoY, piped gas +4.32%, zero sensor)*
13. Which regions are stressed? *(`states.html` ships 50 hardcoded demo numbers at
    `lab.js:190-201`, unconnected to any feed)*
14. How stressed are households *right now*? *(33.95% of the weight is 4–7 months old and
    forward-filled)*
15. Is BNPL absorbing distress that used to appear on cards?
16. When historical scores change, was that a source revision or the instrument's own moving
    ruler? *(both are logged identically as "source-revision events")*
17. Is the current score high because of stress, or because gas and housing have a permanent
    ~25-point floor?
18. Does Ward M agree with the jar independently, or because they share NFCI?

---

# APPENDIX — VERIFICATION LEDGER

Every published line reproduced from source on 2026-08-14.

| line | published | source | fetched value | recomputed stress | published stress | ✓ |
|---|---|---|---|---|---|---|
| jobs | 4.1% | UNRATE 2026-07 | 4.1 | 13.0 | 13 | ✓ |
| jobs (2nd) | — | ICSA 4wk | 199,000 | 5.0 | (max→13) | ✓ |
| gas | $4.01 | GASREGW 2026-08-10 | 4.006 | 58.3 (Jul mean 3.932) | 58 | ✓ |
| housing | 6.67% | MORTGAGE30US 2026-08-13 | 6.67 | 44.27 (Jul mean 6.542) | 44 | ✓ |
| housing (2nd) | — | DRSFRMACBS 2026-Q1 | 1.89 | 22.80 | (max→44) | ✓ |
| credit | 2.9% | DRCCLACBS 2026-Q1 | 2.92 | 38.4 | 38 | ✓ |
| auto | 7.9% | NY Fed P13 AUTO 26:Q2 | 7.87 | 47.4 | 47 | ✓ |
| inflation | 3.4% | CPIAUCNS YoY 2026-07 | 3.36 | 30.5 | 30 | ✓ |
| financial | −0.55 | NFCI 2026-08-07 | −0.549 | 10.46 | 10 | ✓ |
| foreclosures | 1.9% | DRSFRMACBS 2026-Q1 | 1.89 | 22.8 | 23 | ✓ |
| manufacturing | 1.1% YoY | INDPRO 2026-06 | +1.14 | 27.4 | 27 | ✓ |
| Ward rates | 0.78pp | T10Y3M 2026-08 | 0.78 | 26 | 26 | ✓ |
| Ward volatility | 15.6 | VIXCLS 2026-08 | 15.6 | 19 | 19 | ✓ |
| Ward energy | $82 | DCOILWTICO 2026-08 | 82.0 | 52 | 52 | ✓ |
| Ward dollar | −0.8% | DTWEXBGS YoY | −0.8 | 23 | 23 | ✓ |

Full-composite reproduction: **282/282 published historical months reproduced exactly** from
`research/backtest-results.json` stresses + `METHODOLOGY_V3_WEIGHTS` + `CALIBRATION_V3`.
All counterfactuals in this report are built on that verified base.

**FRED series consulted:** UNRATE, ICSA, CCSA, PAYEMS, CE16OV, CLF16OV, CNP16OV, CIVPART,
EMRATIO, U6RATE, UEMPMED, UNEMPLOY, NILFWJN, LNS11300060, LNS12300060, LNS11324230,
SAHMREALTIME, JTSHIR/JTSJOR/JTSLDR/JTSQUR, CPIAUCNS, CPILFESL, MEDCPIM158SFRBCLE,
CUSR0000SEHA, CUSR0000SEHF01, CUSR0000SEHF02, CUSR0000SETB01, CPIENGSL, CES0500000003,
LES1252881600Q, DSPIC96, PSAVERT, GASREGW, DCOILWTICO, MORTGAGE30US, MORTGAGE15US,
DRSFRMACBS, CSUSHPINSA, MSPUS, HOUST, FIXHAI, RRVRUSQ156N, TDSP, MDSP, DRCCLACBS, DRCCLOBS,
DRCLACBS, CORCCACBS, REVOLSL, TOTALSL, TERMCBCCALLNS, NFCI, ANFCI, NFCICREDIT, NFCILEVERAGE,
NFCIRISK, STLFSI4, INDPRO, IPMAN, AMTMNO, AMTMUO, MANEMP, T10Y3M, VIXCLS, DTWEXBGS.

**Primary document:** NY Fed Household Debt & Credit Report **2026:Q2** workbook
(`https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/xls/HHD_C_Report_2026Q2`),
sheets Page 3 / 11 / 12 / 13 / 14 / 17 Data, parsed with the repository's own
`parseNyFedAutoWorkbook` plumbing.
