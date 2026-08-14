# 09 — RED TEAM: adversarial audit of OOZEMeter and of the other eight audits

**Agent 4 / Red Team Economist · 2026-08-14 · read-only**

Standing rule for this document: *every* claim below carries a label —
`CORRELATION` (two things move together, no mechanism established),
`PLAUSIBLE-MECHANISM` (a story that fits, untested),
`SUPPORTED-EXPLANATION` (mechanism traced in code or data, magnitude measured, alternatives tested and rejected),
`UNKNOWN` (I could not settle it).

I attacked my own hypotheses too. Section E lists the three I killed.

---

## 0. Headline verdict

OOZEMeter's arithmetic is clean — I reproduced the published 2026-07 gas stress to 3 decimals
(58.306 vs published 58.30625) and the published score to 25.71→26 from raw FRED, independently.
Every number I could check, checked.

The instrument's defect is not arithmetic and it is not the seven items the other agents
ranked CRITICAL. It is this: **58.2% of the weight (employment 24.25 + credit 19.4 + auto 14.55)
sits on lagging balance-sheet measures — who is failing to pay — and 0% sits on
purchasing power — whether the paycheck covers the bill.** Every documented false negative
in the 282-month record traces to that one hole, and it is firing right now.

The single hardest fact in this audit:

> In **December 2021** the jar printed **10/100 — the lowest reading in its entire 282-month
> history, "SMOOTH"** — in a month when CPI was +7.04% YoY, real average hourly earnings were
> −2.08% YoY, and the University of Michigan sentiment index read 70.6 on its way to the
> lowest print in the survey's 74-year history.

And the second hardest:

> In **May 2026** the Michigan sentiment index printed **44.8 — rank 1 of 674 monthly
> observations since November 1952, the lowest consumer sentiment ever recorded** — while
> the jar read 30/100 and the site told readers the month was calmer than 6 of every 10
> months since 2003. June 2026 (49.5) and April 2026 (49.8) are ranks 2 and 3.

I am **not** claiming the jar is wrong today. I am claiming that the jar and every
purchasing-power measure now disagree by more than they ever have, that the site
publishes one side of that and not the other, and that the last time this configuration
appeared (2021-22) the jar was the side that turned out to be wrong.

On the other agents: their engineering findings are largely sound and I did not
re-litigate them. Their **economic** findings contain four errors I consider serious enough
to block publication, listed in Section D. Two of the four are CRITICAL-ranked findings
whose central evidence is a statistical artifact.

---

## A. What I reproduced before attacking anything

| Check | Result |
|---|---|
| `research/backtest-results.json` monthly count | 282, 2003-01 … 2026-07 |
| Gas stress 2026-07 from raw FRED GASREGW + CPIAUCNS | 58.306 vs published 58.30625 ✓ |
| Composite → calibrated score 2026-07 | 25.71 → 26 ✓ (`data/latest.json` ooze 26) |
| Calibration re-derived from the monthly file | a=1.4188 b=−23.9615 vs frozen 1.418684/−23.96515 ✓ |
| Calibration anchor months | calm = **2021-12**, GFC = **2009-06** ✓ (confirms model-science) |
| Jar maximum | 90 at **2009-06** — the final month of the NBER recession |
| NY Fed HHDC 2026Q2 workbook | downloaded and parsed independently; Page 12/13/17/18/24/27/34/35 read |

All FRED series fetched fresh from `fredgraph.csv` on 2026-08-14.

---

## B. The eight requested categories, quantified

### B1. The score looked calm during meaningful deterioration

**CRITICAL — the 2021-22 cost-of-living shock. `SUPPORTED-EXPLANATION`.**

The three largest 6-month *declines* in the entire 23-year record are all in 2021:

| Window | Jar | What was happening |
|---|---|---|
| 2021-05 → 2021-11 | 27 → **11** (−16) | CPI YoY 4.99% → 6.81% |
| 2021-06 → 2021-12 | 26 → **10** (−16) | CPI YoY 5.39% → 7.04%; real AHE −2.08% |
| 2021-04 → 2021-10 | 29 → **14** (−15) | CPI YoY 4.16% → 6.22% |

Mechanism, traced line by line from `research/backtest-results.json` (`scripts/collect.js:108-114`):
between 2021-05 and 2021-12 employment stress fell 66→10, credit 12→11, auto 6→5,
housing 34→31. Those four lines are 77.6% of the weight and all four were sitting at
pandemic-transfer-suppressed record lows. The two lines that rose — gas 53→59 and
inflation 50→67 — are 19.4% of the weight combined, and the inflation anchor
(`scripts/collect.js:39`) caps 7.0% CPI at stress 67 and 9.1% CPI at stress 80.

The 15 worst months for real average hourly earnings (CES0500000003 ÷ CPIAUCSL) in the
232 months I could compute: **two are 2008 (jar 70 and 75); thirteen are 2021-22 (jar 10 to 29).**

**Independent, non-Michigan corroboration.** I did not want to rest this on one survey.
The OECD's separately constructed US consumer confidence index (FRED `CSCICP03USM665S`)
puts its four lowest readings of the entire post-1974 series at **2022-07 (96.20),
2022-06 (96.23), 1980-05 (96.27), 1980-04 (96.31)**. Two independent survey programmes
agree that mid-2022 was the worst consumer confidence since the Volcker recession.
The jar read **19 and 21** in those two months.

*Alternative explanations tested and rejected:*
(a) "The jar measures balance sheets, and balance sheets were genuinely fine" — true,
and this is exactly the defect: `what-is-ooze.html` sells the meter as measuring
household budget stress, not balance-sheet stress. (b) "Real AHE 2021 is a
composition artifact from 2020 low-wage job losses" — correct for 2021-04 (−3.39%),
but the composition effect had washed out by mid-2022, and 2022-06 still reads −3.28%.

**MAJOR — the run-up to the GFC, 2006-07 → 2007-01. `SUPPORTED-EXPLANATION`.**

| Month | Jar | gas | housing | credit | auto | financial |
|---|---|---|---|---|---|---|
| 2006-07 | 47 | 82.3 | 47.0 | 58.3 | 56.4 | 11.6 |
| 2007-01 | **37** | 52.4 | 40.2 | 56.4 | **65.2** | 7.6 |

A 10-point fall — tied third-largest 6-month decline in the record — driven entirely by
oil coming off its 2006 peak, in precisely the six months when the auto line (the only
line that *rose*) was warning and subprime credit began to break. The jar then did not
regain 47 until **2007-10**, nine months later.

### B2. The score looked alarming during benign periods

**MODERATE, and weaker than model-science claims. `SUPPORTED-EXPLANATION`.**

Readings ≥44 outside the GFC window: 2003-01…04 (44-47), 2005-09 (45, Katrina),
2006-04…08 (41-47), and a **44-month unbroken plateau from 2010-07 to 2013-11 at 44-71**.

The 2010-2013 plateau is not a false positive on employment — unemployment was 7.0-9.5%
and card delinquency 27-64 stress. But gas stress ran **76-93 for 36 straight months**,
peaking at 92.7 in 2011-05 and 91.6 in 2012-04.

I tested whether the gas line was inventing that. **It was not** — see E1.

### B3. Individual indicators pointed the wrong direction

**MAJOR — November 2008. `SUPPORTED-EXPLANATION`, and I confirm model-science exactly.**

The published jar **fell** 79 → 75 from 2008-10 to 2008-11 because gas stress collapsed
77.6 → 44.4. NFCI in that month was 3.024, its highest reading since July 1974.
Rebuilding the composite without the gas line and recalibrating to the same
calm→10 / GFC→90 doctrine reproduces model-science's sequence **byte for byte**:

```
published 2008-09..2009-03 : 77, 79, 75, 77, 83, 84, 86
no-gas    2008-09..2009-03 : 72, 77, 77, 81, 87, 87, 89   ← monotone
model-science claimed      : 72, 77, 77, 81, 87, 87, 89   ✓
```

**One correction to their evidence:** model-science and economic-sensor-audit both describe
NFCI in 2008-11 as at its "all-time high." The NFCI *level* all-time high is
**5.165 in July 1974**. What hit 100 was the *stress transform*, which clamps at NFCI 3.0
(`scripts/lib/methodology.js:10`). Within the 2003-2026 window the statement is true;
as written it is not. `MINOR`.

**MODERATE — the inflation line scores disinflation as stress. `SUPPORTED-EXPLANATION`,
confirming model-science.** `ANCHORS.inflationYoY` (`scripts/collect.js:39`) maps
0% CPI → stress 45, identical to +4.2%. I confirm 2015-01 (CPI −0.1%, an oil-driven
real-income *windfall*) scored inflation stress 46.

### B4. Unemployment gave a misleading labor signal

**MAJOR — and the 2026 cluster is the densest since 2009. `SUPPORTED-EXPLANATION` for the
measurement conflict; `UNKNOWN` for what it predicts.**

Rule: the jar's own employment stress fell ≥0.5 pts over 3 months *while* the
employment-population ratio (FRED `EMRATIO`) fell ≥0.2pp over the same 3 months.
Base rate **22 of 282 months = 7.8%**. Firing months:

```
2003-07 2003-09 2004-10 2007-05 | 2009-05 2009-06 2009-07 2009-08 2009-09 |
2010-07 2010-12 2013-03 2013-10 2017-12 2018-08 2020-06 2022-06 2022-11 |
2026-02 2026-03 2026-06 2026-07
```

Rolling 6-month firing count — the two densest episodes in 23 years are
**2009-09/2009-10 (5 fires in 6 months)** and **2026-07 (4 fires in 6 months)**.

I verified the seam arithmetic behind this independently of july-forensic, from
current-vintage FRED: CE16OV 2025-12 = 163,992k → 2026-01 = 163,097k, **−895k in one
month**, which is **92.9%** of the −963k twelve-month change. CLF16OV −1,030k of −1,318k
= **78.1%**. july-forensic's population-control finding is **CONFIRMED** on independent data.

**But I must kill the warning reading.** The 12-month-forward jar change after these
flags is **−6.33 points** against a **−0.77** unconditional baseline (n=18 vs 270).
The flag is followed by the jar *falling*, because 5 of the 22 fires are 2009, when the
jar was at 88-90 and mean-reverting. This is a **measurement conflict, not a warning**.
That is contradiction-engine's conclusion and my data independently supports it.

### B5. Inflation improvement hid household pressure

**MAJOR. `SUPPORTED-EXPLANATION`.**

`scripts/collect.js:109` scores the 12-month *change* in CPIAUCNS. Nothing anywhere in
the pipeline divides a wage by a price. Consequence, from FRED CES0500000003 ÷ CPIAUCSL:

| July | nominal AHE YoY | CPI YoY | **real** | jar |
|---|---|---|---|---|
| 2024 | +3.63% | +2.94% | **+0.69%** | 28 |
| 2025 | +3.96% | +2.74% | **+1.22%** | 25 |
| 2026 | +3.15% | +3.30% | **−0.15%** | 26 |

Real wage growth turned negative this year and the jar's inflation line *fell 3 points*
in the same month (`data/latest.json` movers: `{"slug":"inflation","delta":-3}`), because
3.36% CPI scores lower on the U-curve than 4.0% CPI. **The line reads the second
derivative of prices and reports it as household relief.**

Correlation of the published jar with real AHE YoY: **+0.073** over 232 months. The jar
is orthogonal to purchasing power by construction.

### B6. Easier financial conditions hid credit deterioration

**MODERATE. `CORRELATION` — the rule is real but rare and the mechanism is not identified.**

Quarters where NFCI fell ≥0.10 over four quarters *and* DRCCLACBS rose ≥0.20pp:
**9 of 93 quarters since 2003** — 2009-Q3, 2009-Q4, 2017-Q1…Q3, and **2023-Q4 through 2024-Q3**.
In the 2023-24 episode the financial line read stress 14-22 (near its floor) while
the credit line rose 42 → 44.4. At 3% weight versus 19.4% weight this never mattered
to the headline; the concern is that a reader looking at "Financial Conditions: calm"
draws the wrong inference.

I do **not** endorse this as a signal. Six of the nine hits are 2017 and 2023-24, neither
of which preceded anything. n is too small.

### B7. Markets diverged from households

**MAJOR, and it points the opposite way from what the site implies. `CORRELATION`.**

From `data/market-history.json` (234 shared months): corr of levels **+0.277**,
corr of 3-month changes **+0.189**. The extremes:

| Month | Ward M | Household jar | Divergence |
|---|---|---|---|
| 2010-03 | 20 | 80 | **−60** |
| 2009-12 | 24 | 82 | −58 |
| **2022-09** | **76** | **18** | **+58** |
| **2022-06** | **73** | **19** | **+54** |
| 2022-12 | 71 | 19 | +52 |

In June 2022 — the month consumer sentiment hit what was then its all-time low, and real
wages hit −3.28% — the **experimental, zero-weight, explicitly-labelled-as-a-side-project
market instrument read 73 and the flagship household instrument read 19.**

I will not claim Ward M "saw households." It was reading a bear market and a Fed hiking
cycle; the co-movement is coincidence of timing, not mechanism. `CORRELATION`.
But it is a fact the site should be able to explain, and the honest framing is:
*the site's own two instruments disagreed by 54 points about the most consequential
household month of the decade, and the household one was the one contradicted by
independent survey evidence.*

Forward test: corr(market_t, jar_{t+h} − jar_t) is **+0.19 to +0.22 at every horizon
h = 2…12**. Flat across horizons is the signature of mean reversion in the level,
not of a lead. Ward M does not forecast the jar.

### B8. National data hid distributional effects

**CRITICAL — four federal measures of the same household disagree by 83 percentage points.
`SUPPORTED-EXPLANATION`.**

I parsed the NY Fed HHDC 2026Q2 workbook the collector already downloads daily
(`scripts/lib/methodology.js:183-198`) and normalised every card-distress measure to
*how far it has travelled from its own 2019 calm level toward its own GFC peak*:

| Measure | 2019 avg | GFC peak | Latest | **% of the way** |
|---|---|---|---|---|
| NY Fed CCP card 90+ delinquent **balance** (stock) | 8.32 | 13.74 (10:Q2) | 12.92 (26:Q2) | **84.9%** |
| NY Fed CCP card 30+ **transition** (flow) | 6.82 | 13.78 (09:Q4) | 8.69 (26:Q2) | **26.9%** |
| FRB all-bank card delinquency ← **the jar reads this** | 2.58 | 6.77 (09:Q2) | 2.92 (26:Q1) | **8.0%** |
| FRB all-bank card **net charge-off** | 3.71 | 10.54 (09:Q4) | 3.84 (26:Q1) | **2.0%** |

Correlation of quarter-over-quarter changes, CCP 90+ vs the jar's DRCCLACBS:
**+0.347 pre-2015, +0.010 since 2015**. The two series stopped agreeing about a decade ago.

**The decisive diagnostic that resolves which one to believe** — and which
economic-sensor-audit did not run: the ratio of the 90+ *stock* to the 30+ *flow*.

| | 2003-Q1 | 2007-Q1 | 2009-Q4 | 2019-Q4 | 2026-Q2 |
|---|---|---|---|---|---|
| stock / flow | 0.72 | 1.08 | 0.92 | 1.20 | **1.49** |

In a genuine default wave the flow leads and the ratio *falls* (2009-Q4 = 0.92). Today
the ratio is at the high end of its range and the flow is at 2006-07 levels. Combined
with bank net charge-offs at 2% of the way to the GFC, the balance of evidence says
**the CCP 90+ stock is accumulating rather than the flow accelerating** — accounts
sitting in 90+ status longer, not new households failing.

**Verdict:** the jar's credit line is materially incomplete and the site should publish
this scoreboard. But the alarming interpretation of the CCP number that
economic-sensor-audit built a CRITICAL on is **not supported by the flow data**. This is
a `MAJOR` disclosure failure, not a `CRITICAL` measurement failure.

**Distributional cut #1 — age. My own intuition was falsified.**
Page 27 Data, card 90+ transitions by age, four-quarter moving sum:

| | 18-29 | 30-39 | 40-49 | 50-59 | 60-69 | all |
|---|---|---|---|---|---|---|
| 06:Q2 | 9.81 | 6.66 | 5.24 | 4.13 | 4.70 | 5.61 |
| 26:Q2 | 10.08 | 8.26 | 7.62 | 6.41 | 4.98 | 7.00 |
| **change** | **+0.27** | **+1.60** | **+2.38** | **+2.28** | +0.28 | +1.39 |

The 18-29 / 60-69 ratio is **2.02 today vs 2.09 in 2006-Q2** — unchanged. The deterioration
since the last cycle peak is concentrated in **ages 30-59**, not the young. Any editorial
line about "young people drowning in card debt" is contradicted by the data in the
workbook the site opens every morning. `SUPPORTED-EXPLANATION`.

**Distributional cut #2 — collections, which cuts *against* a distress narrative.**
Page 18 Data: the share of consumers with a third-party collection fell from
**9.77% (03:Q1) to 4.88% (26:Q2)**. Average amount rose $901 → $1,577 nominal, which
after CPI is roughly flat ($901 in 2003 ≈ $1,514 in 2026 dollars). Fewer households in
collections, same real burden each. Page 17: new foreclosures **203.32k (03:Q1) → 55.16k
(26:Q2)**; new bankruptcies **612.26k → 136.80k**. `SUPPORTED-EXPLANATION`.

**Distributional cut #3 — geography, and a live product contradiction.**
Page 35 Data, 90+ delinquent share of per-capita debt, 2026-Q2: **CA 2.19% … TX 4.58%**,
a 2.1× spread across the eleven states the NY Fed publishes.
Meanwhile `lab.js:190-201` hard-codes 50 fabricated state scores which
`states.html:54-60` ranks into a podium and `sitemap.xml:9` submits to search engines.
**Real state-level delinquency data is inside the file the collector unzips every run.**
`SUPPORTED-EXPLANATION`.

---

## C. Live-today divergence panel

Everything below is the same month, 2026-07 / latest available.

| Reading | Value | Where it sits historically |
|---|---|---|
| **OOZEMeter jar** | **26/100 "Sticky"** | 179 of 282 months read higher = calmer than 63.5% |
| Michigan sentiment (2026-05) | **44.8** | **rank 1 of 674 months since 1952** |
| Michigan sentiment (2026-06) | 49.5 | 0.1st percentile |
| Personal saving rate (2026-06) | **2.7%** | **3.5th percentile since 1959**; down from 4.4% in Jan |
| Real AHE YoY (2026-07) | **−0.15%** | negative for the first time since 2022 |
| NY Fed CCP card 90+ (26:Q2) | 12.92% | 84.9% of the way to the GFC peak |
| Continuing claims YoY | **−8.0%** | improving |
| Initial claims 4-wk (2026-07) | **203,250** | 12.0bp of the labour force vs 27.1bp in 2003 |
| Bank card net charge-offs (26:Q1) | 3.84% | 2.0% of the way to the GFC peak, **falling 5 quarters** |
| New foreclosures (26:Q2) | 55.16k/qtr | vs 203.32k in 03:Q1 |
| Real DPI per capita (2026-06) | $52,669 | at/near all-time high |

**This is not a jar that is simply wrong.** It is a jar reading a real and unusual
configuration: balance sheets are the best in twenty years and purchasing power and
sentiment are the worst on record. **The jar measures the first and not the second, and
the site does not say so.**

**One caveat I insist on.** The Michigan index moved to web-only interviewing during 2024,
which the survey's own documentation associates with a level shift, and post-2020
sentiment carries a large documented partisan component. **44.8 is not cleanly comparable
to 1980.** The independent OECD series that would settle it was discontinued in 2024.
I therefore label the 2026 sentiment reading `CORRELATION`, not `SUPPORTED-EXPLANATION`.
The 2022 reading is `SUPPORTED-EXPLANATION` because two independent survey programmes agree.

**The saving-rate pattern is the sharpest supporting fact and the site has no sensor for it.**
Only **39 of ~800 months since 1959** have had a personal saving rate below 3.0%:
2001-10, a long run through **2005-01 … 2008-04**, **2022-04 … 2022-06**, and
**2026-05 … 2026-06**. Three of the four episodes are the pre-GFC leverage build, the 2022
inflation shock, and now. `PLAUSIBLE-MECHANISM` — n=4 episodes cannot establish more,
and the 2005-08 run preceded the crisis by 2-3 years, so this is not a timing signal.

---

## D. Where I believe the other agents are WRONG or OVERSTATED

### D1. economic-sensor-audit CRITICAL #1 — the small-bank credit substitution. **WRONG.**

They propose that DRCCLOBS (banks outside the 100 largest) at 6.43% "would score 86"
and reveals "the bottom half of the credit distribution" the jar cannot see.

I built the counterfactual. **DRCCLOBS is not a household-distress series.**

| | DRCCLOBS | DRCCLACBS (the jar's input) |
|---|---|---|
| GFC-era maximum | **5.61%** (2008-Q4) | 6.77% (2009-Q2) |
| 2018-01 … 2020-02 range (best labour market in 50 yrs) | **5.54 – 7.16%** | 2.50 – 2.69% |
| All-time top 6 readings | **all six are 2023-2024** | GFC |
| 2003-Q1 | 6.47% (*above* all-bank 4.68) | 4.68% |
| 2006-Q1 | 3.15% (*below* all-bank 3.86) | 3.86% |

Scored on OOZEMeter's own `cardDelinq` anchors (`scripts/collect.js:43`), which is exactly
what the audit proposes, **January 2020 — unemployment 3.5% — produces credit stress 91.6.**

A series whose 2019 and 2023 readings exceed its own Great Recession maximum, and whose
sign relative to the all-bank series flips three times in twenty years, is measuring
**portfolio composition** — small banks host subprime and fintech-partner card programmes —
not the bottom half of American households. Their own evidence contains the refutation
("2023-Q4 small-bank 7.86, above its own GFC level") and they read it as corroboration.

**What survives:** the *concern* is right and I upgraded it in B8 with better evidence
(the CCP scoreboard). The *instrument* is wrong. **Reclassify CRITICAL → MAJOR, and
delete the DRCCLOBS recommendation.** `SUPPORTED-EXPLANATION`.

### D2. model-science CRITICAL #2 — "external validity inverted in 2020." **OVERSTATED.**

Their numbers replicate exactly (corr(jar, UMCSENT) −0.893 pre-2020 → +0.230 for 2021+).
Two tests kill the interpretation:

**(a) It is not the jar that inverted.** Same windows, same survey, same method:

| UMCSENT vs … | 2003-2019 | 2021-2026 |
|---|---|---|
| the jar | −0.893 | +0.230 |
| **UNRATE** | **−0.745** | **+0.504** |
| CPI YoY | −0.061 | −0.160 |
| gasoline, nominal | −0.467 | −0.505 |

Consumer sentiment's relationship with **the unemployment rate itself** flipped harder
than its relationship with the jar. An instrument cannot be indicted for failing to
track a survey that has stopped tracking unemployment.

**(b) The post-2021 estimate is not distinguishable from zero.** The jar's standard
deviation collapses from 20.5 (2003-2019) to **4.94** (2021-2026) — a 5-point range at
1-point rounding grain. A circular block bootstrap (12-month blocks, 4,000 draws) gives a
**95% CI of [−0.05, +0.50]** around the +0.23 point estimate. It straddles zero.

**Reclassify CRITICAL → MODERATE.** The pipeline still has no external-validity check
and should have one; the *headline* ("the instrument now rises when households do better")
is not established. `SUPPORTED-EXPLANATION` for the falsification.

### D3. model-science CRITICAL #3 — the real-DPI evidence for the 2022 false negative. **WRONG evidence, right conclusion.**

They cite "A229RX0 real DPI per capita YoY at 2022-06 = −5.13% vs −1.71% at the 2009-06
trough where the jar reads 90."

That −5.13% is **the withdrawal of pandemic transfers, not an income shock.** March 2021
real DPI/capita was **$61,793** — the all-time maximum of the series, stimulus checks in
the numerator. The March 2022 YoY against it is **−21.76%**. Comparing that base effect
to 2009 is category error. In **levels**:

| | level | vs pre-shock |
|---|---|---|
| 2022-06 vs 2019-12 | $48,071 vs $47,334 | **+1.56%** |
| 2009-06 vs 2007-12 | $39,966 vs $39,993 | **−0.07%** |

Real income per head in June 2022 was *above* pre-pandemic. And the correlation they
report reverses when the artifact is excluded: corr(jar, real DPI/capita YoY) is
**+0.528 over 2021-2026** but **−0.037 over 2023-2026** — no relationship, not an
inverted one.

**Their conclusion — that 2021-22 is the largest false negative in the record — is correct**
and I strengthened it in B1 with real wages (−3.28% in 2022-06, thirteen of the fifteen
worst months in the record) and the OECD confidence index. **Keep the finding, replace the
evidence.** `SUPPORTED-EXPLANATION`.

### D4. forward-signal CRITICAL #1 — "the jar lags recessions by 9 months (r=0.576 at h=−9)." **NOT IDENTIFIED.**

Three problems:

1. **The jar's actual maximum is 2009-06 — the last month of the NBER recession.**
   (2009-05 = 89, 2009-06 = **90**, 2009-07 = 89.) A series whose peak coincides with the
   trough month does not lag by nine months.
2. **The correlation surface is flat.** h=−12: 0.570, h=−9: **0.576**, h=−6: 0.569,
   h=−3: 0.543. A 0.007 spread across nine months of lag is not an identification.
3. **The method mis-classifies a known series.** Running the identical test on FRED
   `UNRATE` — the textbook coincident-to-lagging indicator — returns **peak h=−13**.
   By their own metric the jar leads the unemployment rate by four months. That is
   an artifact of cross-correlating a persistent level against a 0/1 dummy over a
   window whose 20 recession months are 18 GFC + 2 COVID, followed by a 44-month
   post-GFC plateau. FRED `DRCCLACBS` returns h=−9, r=0.603, on the same test.

**Their conclusion — no weighted line is leading — survives and is the most important
structural finding in the whole audit set.** The *number* must not be published.
**Reclassify the lag estimate to UNKNOWN.** `SUPPORTED-EXPLANATION` for the falsification.

### D5. model-science MAJOR — "COVID peaked at 42, below the 2006 expansion peak of 47." **OVERSTATED as a measurement defect.**

I checked whether 42 was actually wrong for April 2020, on the instrument's own concept
(can households pay their bills):

| | 2020-04 | 2006-05 |
|---|---|---|
| jar | 42 | 47 |
| personal saving rate | **31.8% (all-time record)** | **2.9%** |
| real DPI per capita | $54,304 (+14.7% m/m) | $39,332 |
| card delinquency | 2.45%, **falling** (2.69 → 2.45 → 1.99) | 4.12%, rising |
| mortgage delinquency | 2.54 (from 2.35) | 1.74 |

By every balance-sheet measure the instrument claims to read, April 2020 households were
**less** budget-stressed than May 2006 households. Income rose, delinquencies fell, saving
hit a record. The reading is defensible.

What is **not** defensible is `what-is-ooze.html:77` labelling band 42 "Softening becomes
slipping" for the month unemployment hit 14.8%. **That is a copy failure, not a maths
failure, and the fix is a sentence, not a reweighting.** Caveat I owe the reader: both
the 2020 income spike and the 2020 delinquency drop are policy artifacts (CARES transfers,
forbearance, foreclosure moratoria) — the jar was reading policy. But the policy *was* the
household experience. **Reclassify MAJOR → MODERATE, and route to editorial.** `SUPPORTED-EXPLANATION`.

### D6. model-science MAJOR — "gas drives the entire visible 2026 range." **OVERSTATED.**

Rebuilding the composite without the gas line, weights renormalised, recalibrated to the
same doctrine:

| | 2026-01 … 2026-07 | range |
|---|---|---|
| published (with gas) | 19, 20, 24, 28, 30, 27, 26 | **11** |
| no-gas | 23, 23, 25, 27, 28, 26, 26 | **5** |

Gas explains about half the 2026 range, not all of it. Across all 282 months the gas line
moves the published score by **at most ±5 points** (mean −0.16). Their 2006 example
survives — 2006-07 falls 47 → 43 without gas — but 43 is still an elevated reading, so
"every non-crisis false alarm was a gasoline spike" is not supported.
**Reclassify MAJOR → MODERATE.** `SUPPORTED-EXPLANATION`.

### D7. economic-sensor-audit MODERATE — "claims stress 5.0, pinned at the anchor floor, max() is a no-op." **WRONG on both counts.**

The 199,000 they cite is the *displayed* 4-week window ending 2026-08; the value that
scores the July headline is **203,250 → claims stress 5.81**, not 5.0. Exactly **one**
month since 2021 has touched the 5.0 floor.

And the claims arm is not a no-op: it is the binding arm of `Math.max` in
**67 of 138 months since 2015 (49%)** and **24 of the last 54 (44%)**. It is not binding
*this* month; that is different.

**Their underlying normalisation point is correct and I confirm it** — claims per unit of
labour force: 27.1bp (2003-01), 20.6bp (2007-06), 13.8bp (2019-06), **12.0bp (2026-07)`.
An absolute-count anchor decays as a screen. **Keep the finding, fix the evidence.**
`SUPPORTED-EXPLANATION`.

### D8. economic-sensor-audit MAJOR — "the site names Housing the biggest pressure source when the highest-pressure line is gas." **NOT A PROBLEM.**

`index.html:113` reads "biggest pressure sources — Housing 7 oz · Credit Cards 6 oz ·
Auto Loans 5 oz". Contribution = weight × stress is the *correct* decomposition of the
published score. Housing does contribute more of the 26 than gas does. Calling the
highest-*stress* line the biggest *pressure source* would be the error. Their adjacent
point — that `what-is-ooze.html` sells an ordered cascade while `collect.js:118` implements
an unconditional weighted mean — is real and important and stands on its own.
`SUPPORTED-EXPLANATION`.

### D9. economic-sensor-audit MAJOR — energy double-count. **CONFIRMED, and I can sharpen it.**

Headline CPI at 3.36% scores 30.5; core CPILFESL at 2.47% would score 17.0; difference
13.5 stress × 9.7% weight × 1.4187 = **1.85 published jar points today**, matching their
~1.9. But the magnitude is not constant — it scales with the energy shock:

| | headline stress | core stress | jar points |
|---|---|---|---|
| 2026-07 | 30.5 | 17.0 | **1.85** |
| 2022-06 | 80.1 | 59.1 | **2.90** |
| 2008-06 | 50.2 | 15.9 | **4.73** |

The overlap is **largest during energy shocks**, i.e. exactly when the gas line is already
saturated. I would not call it an error — headline CPI is the right measure of what
households pay — but the *effective* weight on energy is ~13-14%, not the published 9.7%,
and no page discloses it. `SUPPORTED-EXPLANATION`.

### D10. data-provenance MAJOR + model-science MAJOR — gas deflator base rotation. **CONFIRMED, and both UNDERSTATE it.**

Independent replication, holding all other inputs fixed and moving only `cpiNow`
(`scripts/collect.js:98`, `scripts/backtest.js:92`):

| base | mean \|Δ\| | max \|Δ\| | **published months whose rounded score changes** | signed |
|---|---|---|---|---|
| 2025-07 | 0.395 | 0.559 | **120 / 282** | −0.395 (uniform) |
| 2024-07 | 0.715 | 0.997 | **200 / 282** | −0.715 |
| 2023-07 | 1.055 | 1.452 | 264 / 282 | −1.055 |
| 2021-07 | 2.354 | 3.135 | 282 / 282 | −2.354 |
| 2019-07 | 3.013 | 3.980 | 282 / 282 | −3.013 |

Both agents' point estimates reproduce exactly (provenance 0.395; model-science 3.01).
But provenance framed the one-year effect as "39 of 282 months shifting ≥0.5 pt."
The publishable statistic is **120 of 282 published months change by a whole point per
year of base drift**, and the sign is uniformly one-directional because CPI only rises —
**the archive ratchets upward forever.**

**Where I part company with both of them:** they call this a maths defect. It is not.
Showing history at constant purchasing power is a defensible editorial choice. The defect
is that `scripts/integrity.js:36-64` writes these into `data/revisions.json` with no `type`
field and `scripts/story.js:97` tells readers they are "source-revision event(s)."
**No source revised. The fix is a `type` field and a sentence, or pin the base — not a
methodology change.** `SUPPORTED-EXPLANATION`.

### D11. model-science MODERATE — "equal weighting beats the v3 weights on every metric." **REPLICATES, but the metrics are unusable.**

I rebuilt both and got their numbers: corr with UMCSENT all-window −0.449 (equal) vs
−0.347 (v3); post-2020 −0.289 vs +0.219; recession AUC 0.960 vs 0.932.

Two objections. **(a)** The UMCSENT metric is disqualified by D2 — the survey's own
correlation with unemployment flipped sign, so it cannot referee. **(b)** The AUC gap is
entirely the GFC: restricting the positive class to the two COVID months gives
**0.725 (equal) vs 0.718 (v3)** — a 0.007 gap on n=2. They flagged this circularity
themselves, to their credit.

**But the finding survives on a metric they did not use.** Equal weighting materially
reduces the largest documented false negative: **2022-06 reads 31 instead of 19, and
2021-12 reads 15 instead of 10.** That is the honest argument for it, and it costs
something — the COVID peak drops from 42 to 37. **Keep the finding, change the justification.**
`SUPPORTED-EXPLANATION`.

### D12. ux CRITICAL + engineering MAJOR + july-forensic CRITICAL — the stale `lab.js` prose. **CONFIRMED, and one instance is wrong in a way nobody caught.**

`lab.js:66` reads: *"Charge-off rates peaked above 10% in 2010 … Today's 3.2% delinquency
is a fraction of that — but it has been climbing steadily from pandemic-era lows."*

The sentence names **charge-offs** in clause one and **delinquency** in clause two — two
different FRED series. It is false under **both** readings:

- DRCCLACBS (delinquency): **3.22 → 3.20 → 3.08 → 3.06 → 3.04 → 2.98 → 2.94 → 2.92** — seven consecutive quarterly declines (2024-Q2 → 2026-Q1).
- CORCCACBS (charge-offs): peaked **4.64 (2024-Q3)** → **3.84 (2026-Q1)** — down five quarters.

Nothing named in that sentence has been climbing for over a year. (The "peaked above 10%
in 2010" clause is correct: CORCCACBS = 10.54 in 2009-Q4.) `SUPPORTED-EXPLANATION`.

I also independently confirm `feed.xml:29` shipping the literal `{{s:2026-07}}` to
subscribers right now, and `lab.js:190-201` hard-coding 50 fabricated state scores.

---

## E. Hypotheses I formed and then killed

Reporting these is the point of a red team.

### E1. "The gas line's CPI deflator makes historical gas stress economically wrong." **FALSE.**

My hypothesis: deflating 2012 gasoline to 2026 dollars while leaving the anchor curve
fixed assumes real household purchasing power was constant 2003-2026, which it was not.
That would make the 2011-2013 gas readings of 86-93 fictitious.

I tested it against the economically correct affordability measure — **minutes of work per
gallon** (GASREGW ÷ AHETPI × 60), which needs no deflator at all:

| | nominal | jar gas stress | **minutes/gallon** |
|---|---|---|---|
| 2008-06 | $4.05 | 96.9 | **13.48** |
| 2011-05 | $3.91 | 92.7 | **12.07** |
| 2012-04 | $3.90 | 91.6 | **11.89** |
| 2013-06 | $3.63 | 86.9 | **10.81** |
| 2026-07 | $3.93 | 58.3 | **7.28** |
| 2020-04 | $1.84 | 19.9 | **4.39** |

**corr(jar gas stress, minutes of work per gallon) = 0.973** over 282 months, and the
ranking of the ten least-affordable months is essentially identical. Gasoline in 2012
genuinely cost 63% more work-time than it does today. **The jar's 2011-2013 gas readings
are correct. My hypothesis is dead.** `SUPPORTED-EXPLANATION` for the refutation.

(The base-*rotation* problem in D10 is a separate and real defect. Level: fine. Drift: real.)

### E2. "The 2010-2013 plateau at 44-71 is a false positive." **NOT SUPPORTED.**

Unemployment ran 7.0-9.5%, card delinquency 27-64 stress, mortgage delinquency near its
all-time peak, and per E1 gasoline was genuinely 11-12 minutes of work per gallon.
Removing the gas line entirely and recalibrating leaves the 2011-2013 mean at **50.1**
versus 54.0 published. The plateau is mostly real. `SUPPORTED-EXPLANATION`.

### E3. "The employment/EPOP conflict is an early-warning signal." **FALSE.**

12-month-forward jar change after the 22 flags: **−6.33** vs a **−0.77** baseline.
The jar *falls* after this configuration fires, because five of the 22 fires are 2009.
It is a measurement conflict worth disclosing and **must never be dressed as a warning.**
`SUPPORTED-EXPLANATION`.

---

## F. What I recommend, ranked, with what each costs

1. **Publish the credit scoreboard from B8** as a zero-weight disclosure using the
   existing `contributesToOoze:false` pattern (`scripts/collect.js:177-185`). Four
   federal numbers, one sentence each, no methodology change, no recalibration, and it
   is the single largest gap between what the site knows and what it says. The workbook
   is already downloaded daily.
2. **Add a real-wage cross-check** (CES0500000003 ÷ CPIAUCSL) as a zero-weight
   diagnostic. It is the sensor whose absence produced the 2021-22 false negative and it
   is negative again today. **Do not weight it** — model-science correctly showed a
   real-wage leg fails its own validation test, and I agree.
3. **Give `data/revisions.json` a `type` field** and stop calling deflator re-basing a
   "source-revision event." Cheapest fix on the list; removes a live falsehood.
4. **Do not swap the credit series.** D1.
5. **Do not build an OOZE WATCH on labour indicators.** forward-signal's mechanism
   finding is right and my B4 forward test independently supports it.
6. **Do not reweight yet.** D11 — the case for equal weights is real but rests on a
   metric nobody has pre-registered.

---

## G. Questions this audit cannot answer

1. **Is the May-2026 sentiment print of 44.8 comparable to 1980?** The Michigan survey's
   2024 move to web-only interviewing and the post-2020 partisan split both argue no.
   The independent OECD series that would settle it stops in 2024. **UNKNOWN.**
2. **Is the CCP card 90+ stock at 12.92% a distress signal or an accounting artifact?**
   The stock/flow ratio (1.49 vs 0.92 at the GFC) and bank charge-offs at 3.84% say
   accumulation. I could not obtain the resolution/charge-off timing data that would prove it.
3. **What share of CCP card balances sits with non-bank lenders?** This is the arithmetic
   that would reconcile CCP 90+ = 12.92% with bank net charge-offs = 3.84%. Not on FRED.
4. **Is the 2026 saving-rate collapse (4.4% → 2.7% in five months) leverage or measurement?**
   Personal saving is a residual of two large revised aggregates. n=4 episodes since 1959.
5. **What would the score have been in real time?** Every result in this document, mine
   included, uses current-revised data. `scripts/backtest.js:201-206` discloses this
   correctly. No timing claim here — or in any of the other eight reports — is evidence
   about what a reader would have seen.
6. **Does the household jar have any out-of-sample validation at all?** The calibration
   anchors (2021-12 calm, 2009-06 GFC) are both inside the only credit cycle in the
   record. Every test any of us ran is in-sample.
7. **Is today's 26 a false negative?** I have shown the divergence is the largest in the
   record and that the last time it appeared the jar was wrong. n=2. **UNKNOWN, and no
   surface on the site should claim otherwise in either direction.**
8. **Are 18-29-year-olds actually fine?** The age cut says the card deterioration is in
   ages 30-59. Age is a poor proxy for income. Distribution by income decile does not
   exist in any source the pipeline touches.
9. **Would a purchasing-power line survive the calibration freeze?** Adding any input
   restates all 282 published months. Nobody has costed that, and
   `scripts/backtest.js:122-127` re-derives calibration on every run, which makes the
   integrity gate unfalsifiable against exactly this class of change.

---

*Read-only audit. No production file was modified. Every FRED series fetched
2026-08-14 from `fredgraph.csv`; NY Fed HHDC 2026Q2 workbook fetched and parsed from
`newyorkfed.org/medialibrary/interactives/householdcredit/data/xls/HHD_C_Report_2026Q2`.*
