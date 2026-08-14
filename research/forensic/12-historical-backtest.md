# 12 — Vintage-Aware Historical Backtest

**Role:** Historical Backtest Engineer
**Date:** 2026-08-14
**Scope:** month-by-month reconstruction of what OOZEMeter *would have printed at the time*, versus what `research/backtest-results.json` prints today; plus a firing/confirmation/false-alarm audit of the proposed contradiction rules and forward signals.
**Constraint honoured throughout:** no revised future knowledge is allowed to make the instrument look smarter than it could have been. Where the real-time vintage could not be reconstructed, this report says so instead of pretending.

---

## 0. Headline

I reproduced all 282 published months exactly from raw FRED before running any counterfactual, then rebuilt the same seven-line arithmetic under three real-time constraints — **series existence, publication lag, and data vintage**. Three findings dominate.

1. **OOZEMeter could not have produced a single score before April 2011.** Two of its seven weighted lines are fed by products that did not exist during the crisis the instrument is calibrated on. The NY Fed Consumer Credit Panel — the source of the 14.55-weight auto line — was created in 2009; the Chicago Fed NFCI's earliest ALFRED vintage is **2011-05-25** (verified by probe: vintages 2011-05-20 through 2011-05-24 return zero observations for 2007; 2011-05-25 returns 52). `scripts/backtest.js:105` skips any month missing an input, so the collector's own rule would have skipped **99 of the 282 published months (35%)**, including every month of the GFC.

2. **The published historical record reads on average 4.1 points higher than the same instrument fed only data that existed at the time**, and **62 of 282 months (22%) carry a band name the instrument would not have printed**. The dominant cause is not revision — it is `scripts/backtest.js:92` / `scripts/collect.js:98`, the moving gas deflator. In real time `cpiNow == cpi[m]`, so the gas line *is* the nominal pump price; ex-post it is the pump price inflated to July-2026 dollars. Isolated, that single line moves 266 of 282 months by ≥1 point and 130 by ≥5.

3. **Every non-crisis false alarm in the archive is an artifact of that deflator.** All four published excursions above 45 outside the GFC — 2003-02/03 (47), 2005-09 Katrina (45), 2006-05 (47), 2006-07 (47) — read 43, 36, 38 and 39 at the time. None of them reaches 45. In exchange, the GFC ramp arrives later than the archive suggests: the first crossing of 60 slips from 2008-02 to 2008-06, and of 80 from 2009-01 to 2009-04. The real-time jar's peak cross-correlation with NBER recession months is **h = −12** (it lags by a year); the published series is h = −9. And the archive's own alarm has a duty cycle no warning system should have: **the published jar sat at or above 45 for 77 consecutive months, 2007-06 through 2013-10.**

A fourth finding falls out of the vintage layer: **a published methodology claim is measurably wrong.** `research/backtest-results.json` (`methodology.financial.revisionTolerance`) and `scripts/collect.js:222` / `scripts/backtest.js:199` all state that "absolute monthly-mean change up to 0.02 is expected model churn" for NFCI. Across 183 first-vintage/current pairs the mean revision is **0.136** — 6.8× the stated tolerance — **81% of months exceed it**, and **162 of 182 revisions go the same direction (down)**. The 3% weight keeps the jar safe (max 0.94 published points); the Flow, which is z-scored and weight-free, is not.

On the rules: **none of the nine proposed contradiction rules and none of the seven forward signals is a warning system.** The best of them (SLOOS C&I standards) fires in 18.7% of tested months; the Flow's NFCI horn is the only rare, high-quality instrument, and **three of its five celebrated episodes were computationally impossible at the time**, leaving a live-possible record of one confirmed and one false out of two. Meanwhile the surface the site actually publishes — the jar itself — has sat at or above 45 in **82 of 271 months (30%)**, and three of its five excursion episodes were followed by nothing.

**The vintage layer is an order of magnitude smaller than the timing layer.** Where it can be measured (2011-05 onward) the total revision effect is ±0.32 published points on employment and ±0.15 on financial, against a +4.1-point average timing wedge. OOZEMeter's real-time problem is not that its data changed underneath it; it is that its archive is scored with data the operator did not have.

---

## 1. Method

### 1.1 Reproduction gate (passed before any counterfactual)

An independent Python implementation of `scripts/backtest.js:106-115` was fed freshly-fetched FRED CSVs (`UNRATE`, `ICSA`, `CPIAUCNS`, `MORTGAGE30US`, `DRSFRMACBS`, `DRCCLACBS`, `GASREGW`, `NFCI`) plus the NY Fed auto 30+ series recovered by inverting the published `auto` stresses through `AUTO_30_PLUS_ANCHORS` (`scripts/lib/methodology.js:9`).

> **283 candidate months 2003-01…2026-07; 282 scored; 0 mismatches on all seven line stresses and 0 on the rounded score.**

The one skipped month is **2025-10**: `CPIAUCNS` and `UNRATE` are both null in current FRED (the 2025 federal data lapse — CPS could not be collected retroactively). Everything below rests on that exact reproduction.

Caveat on the recovered auto series: `auto` clamps at the anchor floor (stress 5) in 2021-07…2021-12, so the inverted rate for those six months is a lower bound (true value ≤ 5.0). No conclusion here depends on them.

### 1.2 What "data available at that time" means here

**Seal date.** The site publishes month *M* in month *M+1* (today is 2026-08-14 and the published month is 2026-07). For the reconstruction I use **seal(M) = last day of month M+1** — deliberately the *most generous* choice, giving the instrument more data than it actually has. Any deficiency found under maximum generosity is real.

**Availability rules** (each verified against the current release calendar):

| Line | Series | Rule at seal(M) | Verification |
|---|---|---|---|
| employment | UNRATE, ICSA | month-M values available | Employment Situation = 1st Friday of M+1 |
| inflation | CPIAUCNS | month-M value available | CPI released 8th–20th of M+1 |
| housing (rate arm) | MORTGAGE30US | month-M mean available | weekly PMMS |
| gas | GASREGW | month-M mean available; **`cpiNow` = CPI[M]** | weekly EIA |
| financial | NFCI | **unavailable before 2011-05-25** | ALFRED vintage probe (§1.3) |
| credit / housing (delinq arm) | DRCCLACBS, DRSFRMACBS | latest quarter released by seal; release = day 25 of (quarter-start + 4 months) | current FRED latest obs is 2026-01-01 (Q1) on 2026-08-14 ⇒ Q2 not yet out ⇒ rule holds |
| auto | NY Fed HHDC | latest quarter released by seal; release = day 12 of (quarter-start + 4 months); **no releases before 2010-08** | Q2-2026 HHDC released 2026-08-11; Q1-2026 released 2026-05-12; Q4-2025 released 2026-02-10 — a 41–42 day lag |

The backtest instead forward-fills quarterly data **from the observation quarter** (`scripts/backtest.js:59-63, 88`), which it discloses at `backtest.js:201-206` (`quarterlyAlignment: "Forward-filled from observation quarter, not release date"`, `realTimeCompatible: false`). That means, e.g., **October 2008 is scored with the Q4-2008 credit reading, which the Federal Reserve did not publish until late February 2009.**

### 1.3 What ALFRED could and could not give me

I probed ALFRED's vintage-history start for every input:

| Series | First ALFRED vintage covering the GFC? | Vintages fetched | Consequence |
|---|---|---|---|
| UNRATE | **yes**, back to 1960-03-15 (798 vintages listed) | **283** (whole record) | full real-time reconstruction possible |
| CPIAUCNS | **yes**, back to at least 1996 | 1 (spot check) | verified never revised (§4.1) |
| PAYEMS | yes, back to at least 1996 | 0 — budget spent elsewhere | context only (not an input) |
| ICSA | **no** — vintage history starts ~2009 | **206** (2009-06→) | claims revisions **unmeasurable for 2003–2008** |
| GASREGW | **no** — starts ~2010 | 0 | assumed unrevised; unverifiable pre-2010 |
| MORTGAGE30US | **no** — starts ~2011 | 0 | assumed unrevised; unverifiable pre-2011 |
| DRCCLACBS / DRSFRMACBS | **no** — starts ~2011 | **25 + 25** sampled | delinquency revisions **unmeasurable for 2003–2010** |
| NFCI | **no** — *the series did not exist*, first vintage 2011-05-25 | **183** (2011-05→) | see below |
| NY Fed auto 30+ | **no vintages at all** (not a FRED series) | n/a | first public release ~2010-08 |

697 individual ALFRED vintage requests in total.

Probe detail for NFCI, since it is the load-bearing one:

```
NFCI vintage 2011-05-20 -> 0 lines for 2007-Q1
NFCI vintage 2011-05-21 -> 0
NFCI vintage 2011-05-22 -> 0
NFCI vintage 2011-05-23 -> 0
NFCI vintage 2011-05-24 -> 0
NFCI vintage 2011-05-25 -> 14 lines (13 weekly obs + header)
```

**So: for the GFC I can reconstruct timing and existence exactly, and UNRATE and CPI vintages exactly, but I cannot reconstruct claims or delinquency revisions at all.** Those two gaps are stated wherever they bite and are never papered over. The reconstruction below is therefore *timing-and-existence real-time*, with vintage revision layered in only where ALFRED reaches.

### 1.4 The comparison basis

Because the auto and financial lines vanish before 2011, comparing "7-line ex-post" to "5-line real-time" would conflate the wedge with the missing lines. All published-vs-real-time numbers in §2–§3 therefore use a **consistent 5-line basis** (employment 24.25, housing 19.40, credit 19.40, gas 9.70, inflation 9.70; weights renormalised to 100, frozen calibration `CALIBRATION_V3` applied unchanged), computed four ways:

- **A** — ex-post quarterly alignment + ex-post deflator (the published basis)
- **B** — ex-post alignment + **real-time deflator**
- **C** — **real-time alignment** + ex-post deflator
- **D** — both (real-time timing)

The A-vs-D difference is then applied to the *published* score to give a **"real-time equivalent"** printed alongside it in every table (`RT`). This is an apples-to-apples adjustment: the 5-line proxy correlates 0.980 with the published 7-line series (mean difference −0.52, sd 3.92 over 282 months).

---

## 2. The three real-time wedges, measured

### 2.1 Existence — 99 months that cannot exist

| | |
|---|---|
| Published months, 2003-01…2026-07 | 282 |
| Months in which all seven lines existed at seal | **183** (first: **2011-04**) |
| Months with no auto line (NY Fed HHDC unpublished) | **90** (2003-01…2010-06) |
| Months with no financial line (NFCI unpublished) | **99** (2003-01…2011-03) |
| Months scorable on 5 lines only | 90 |
| Months scorable on 6 lines only | 9 (2010-07…2011-03) |

This is not a revision caveat. It is an existence fact, and it is stronger than the one `research/THE-FLOW-ARCHITECTURE-2026-08-12.md:199` makes about the Flow ("cannot say we would have caught it live"). The `financial` line's single most defensible moment — NFCI crossing from −0.37 to +0.07 in **August 2007**, lifting the line's stress from ~16 to ~44 while every other line was flat — is a moment no operator could have seen for another **three years and nine months**.

### 2.2 Publication lag — small on average, decisive at turns

| effect | mean | sd | \|Δ\|≥1pt | ≥3pt | ≥5pt | max | min |
|---|---|---|---|---|---|---|---|
| quarterly release lag alone (A−C) | **−0.16** | 1.51 | 192/282 | 24 | 6 | +6 | −3 |

Near zero on average because the lag cuts both ways: during the post-2010 improvement, reading the older quarter makes the score *higher*. During a deterioration it makes it *lower* — and that is exactly when it matters. Concrete: for score month 2009-01 the backtest reads card delinquency 6.51% (Q1-2009, released May 2009) for a credit stress of 86.8; at the time the freshest release was Q4-2008 at 5.64%, stress 77.1. **Nine stress points on a 19.4-weight line, in the month the score was climbing fastest.**

### 2.3 Deflator base rotation — the dominant wedge

| effect | mean | sd | \|Δ\|≥1pt | ≥3pt | ≥5pt | max |
|---|---|---|---|---|---|---|
| gas deflator base alone (A−B) | **+4.23** | 2.18 | **266/282** | 218 | 130 | +8 |
| both wedges (A−D) | **+4.09** | 2.60 | 260/282 | 212 | 112 | +13 |

`scripts/backtest.js:92` sets `cpiNow` to the latest CPI print and line 113 computes `gasNom * cpiNow / cpi[m]`. At the seal date for month *M*, the latest CPI print **is** CPI[M], so the ratio is exactly 1 and **the real-time gas line is the nominal pump price**. The gap is therefore mechanical and grows with distance from today:

| month | nominal gas | gas stress at the time | gas stress in the published archive | Δ |
|---|---|---|---|---|
| 2005-09 (Katrina) | $2.90 | 32.6 | 81.9 | +49.3 |
| 2006-05 | $2.91 | 32.7 | 79.8 | +47.1 |
| 2008-06 | $4.05 | 61.4 | 96.9 | +35.5 |
| 2008-11 | $2.15 | 13.7 | 44.4 | +30.7 |
| 2020-04 | $1.84 | 10.0 (floor) | 19.9 | +9.9 |
| 2022-06 | $4.93 | 83.2 | 90.5 | +7.3 |
| 2026-07 | $3.93 | 58.3 | 58.3 | 0 |

This confirms the model-science and data-provenance audits' finding about deflator drift, and adds the part they did not: **the drift is not merely instability, it is a systematic one-directional look-ahead**, because the deflator is always the *latest* CPI. Every month in the archive has been silently re-scored upward relative to what it printed.

### 2.4 Combined: what the archive says versus what it could have said

| era | published peak | real-time peak | published low |
|---|---|---|---|
| 2003–2006 | 47 (2003-03, SLIPPERY) | 43 (2003-02, SLIPPERY) | 26 (2005-02) |
| **GFC 2007–2009** | **90** (2009-06, OVERFLOWING) | **84** (2009-07, OVERFLOWING) | 37 (2007-01) |
| 2010–2012 | 81 (2010-01, OVERFLOWING) | 76 (2010-01, **OOZING**) | 49 (2012-11) |
| 2013–2019 | 50 (2013-01) | 44 (2013-01) | 11 (2019-08) |
| **COVID 2020** | **42** (2020-03, SLIPPERY) | **40** (2020-04, **STICKY**) | 11 (2020-02) |
| 2021 | 31 (2021-01) | 30 | **10** (2021-12) |
| 2022 | 24 (2022-10) | 21 | 11 (2022-02) |
| 2023–2026 | 30 (2026-05) | 30 | 19 (2026-01) |

Band disagreements, all 282 months:

| published → real-time | months |
|---|---|
| SLIPPERY → STICKY | 25 |
| STICKY → SMOOTH | 18 |
| OOZING → SLIPPERY | 12 |
| OVERFLOWING → OOZING | 7 |
| **total** | **62 / 282 (22%)** |

Threshold crossings:

| threshold | published first crossing | real-time first crossing | published months ≥ | real-time months ≥ |
|---|---|---|---|---|
| 40 (SLIPPERY) | 2003-01 | 2003-01 | 104 | 80 |
| 60 (OOZING) | **2008-02** | **2008-06** | 45 | 31 |
| 80 (OVERFLOWING) | **2009-01** | **2009-04** | 14 | 7 |

GFC detection lag, measured against the NBER business-cycle peak of **2007-12**:

| first reading ≥ | published | vs NBER peak | real-time | vs NBER peak | slip |
|---|---|---|---|---|---|
| 45 | 2007-06 | −6 mo | 2007-11 | −1 mo | +5 mo |
| 50 | 2007-10 | −2 mo | 2008-02 | +2 mo | +4 mo |
| 55 | 2007-11 | −1 mo | 2008-04 | +4 mo | +5 mo |
| 60 | 2008-02 | +2 mo | 2008-06 | +6 mo | +4 mo |
| 70 | 2008-06 | +6 mo | 2009-01 | +13 mo | +7 mo |
| 80 | 2009-01 | +13 mo | 2009-04 | +16 mo | +3 mo |
| 90 | 2009-06 | +18 mo | **never** | — | — |

Two consequences worth stating separately.

First, **the archive's apparent pre-recession warning is hindsight.** The published series first prints 45 six months before the NBER peak; the same instrument, run at the time, first prints 45 one month before, and does not print 50 until February 2008 — two months *after* the recession began and seven months after the credit markets seized.

Second, **the real-time instrument never reaches 90.** The calibration doctrine (`scripts/lib/methodology.js:21-26`, "GFC peak → 90") is defined on ex-post data; the real-time peak is 84 (2009-07). The scale's own definition of "depression-class" is therefore unreachable by the live collector under the conditions that defined it.

Landmark readings, published versus real-time:

| month | event | published | real-time |
|---|---|---|---|
| 2005-09 | Katrina | 45 | **36** |
| 2006-05 | 2006 gasoline excursion | 47 | **38** |
| 2007-08 | BNP Paribas freezes three funds | 46 | **38 (STICKY)** |
| 2007-12 | NBER business-cycle peak | 57 | 46 |
| 2008-03 | Bear Stearns fails | 63 | 52 |
| 2008-09 | Lehman | 77 | 68 |
| 2008-11 | NFCI all-time high | 75 | 63 |
| 2009-06 | NBER trough | **90** | 83 |
| 2009-10 | unemployment peaks at 10.0% | 86 | 80 |
| 2020-04 | unemployment 14.8% | 42 | **40 (STICKY)** |
| 2021-12 | CPI 7.0% — the calibration low anchor | **10 (SMOOTH)** | 8 |
| 2022-06 | CPI 9.1%, sentiment 50.0 | 19 | 17 |
| 2026-05 | gasoline $4.48 | 30 | 30 |
| 2026-07 | today | 26 | 26 |

Lead/lag against NBER recession months (`USREC`), cross-correlated h = −18…+18:

| series | peak h | r |
|---|---|---|
| published jar | −9 | 0.576 |
| **real-time jar** | **−12** | **0.592** |

The instrument lags recessions by three-quarters of a year on the published record and by a **full year** on the record it could actually have produced. This is a strengthening of the forward-signal audit's F-1, not a new claim.

---

## 3. Month-by-month tables

Legend.

- **OOZE** — published score / real-time equivalent (published minus the measured A−D timing wedge, §1.4).
- **WHAT OOZEMETER WOULD HAVE SAID** — the band of the *real-time* score; where the published band differs it is shown in italics. "heaviest" = largest **contribution** (weight × stress), which is what `index.html:113` labels "biggest pressure sources"; the number in brackets is that line's stress. The heaviest *contributor* is often not the highest-*stress* line — e.g. 2023-10 shows housing (stress 54, contribution 10.5) rather than gas (stress 58, contribution 5.6).
- **CONFIRMING / CONTRADICTING** — independent household indicators (payrolls 3m, emp-pop ratio, participation, U-6, Michigan sentiment, continuing claims — **none of which is an OOZEMeter input**) that moved with or against the jar's own 3-month change.
- **FORWARD SIGNALS** — instruments flashing that month: curve inversion level, SLOOS net tightening >+20, Sahm real-time ≥0.50, and Flow horns. NFCI horns before 2011-04 are marked unreadable at the time.
- **FALSE ALARM** — scored against the pre-registered outcome set in §5.1.
- **MISSED WARNING** — a real-time reading below 40 with an NBER recession month **or** a +0.5pp unemployment rise inside 12 months. In 2023–2025 rows this is always the unemployment condition, not a recession.

### 3.0 2001 — no table is possible, and that is the finding

**OOZEMeter has no 2001 score and cannot have one.** The auto line's source (`scripts/lib/methodology.js:141-165`, NY Fed HHDC "Page 13 Data", column AUTO) begins at 03:Q1, and the panel behind it was created in 2009 (Liberty Street Economics, April 2024). The published archive starts 2003-01 for exactly this reason.

What *can* be said, and is worth saying because it tests the "one credit cycle" gap flagged by the model-science audit: a **6-line** reconstruction (all lines except auto, weights renormalised, frozen calibration) runs back to 1991-01 on current-vintage data. It is not real-time and is not the published instrument, but it is the same arithmetic:

| episode | 6-line ex-post peak | with real-time deflator | 6-line low |
|---|---|---|---|
| 1991 recession | **64** (1991-01) | 61 | — |
| 1993–1999 expansion | 45 (1993-01) | 43 | **30** (1999-02) |
| **2001 recession** | **51** (2001-05, SLIPPERY) | **46** (2001-04) | — |
| GFC (same basis) | 87 (2009-06) | 81 | — |
| COVID (same basis) | 49 (2020-04) | 47 | — |
| 2022 inflation (same basis) | 33 (2021-06) | 30 | — |

Two things fall out. First, **the 2001 recession scores 51 on this instrument — higher than COVID (49) and more than double the 2022 inflation peak (24 on the published 7-line basis).** Second, **the calmest month of the entire 1990s expansion scores 30**, above today's 26. The credit line is the reason: `DRCCLACBS` ran 4.5–6.5% through the 1990s against `cardDelinq` anchors that put 5% at stress 70, so the line reads 60–70 for a decade of full employment. The anchors are not stationary across the sample, and the instrument has no way to know that.

### 3.1 2005–2006 — the false-alarm window

| DATE | OOZE (pub / real-time) | WHAT OOZEMETER WOULD HAVE SAID | WHAT WAS ACTUALLY DEVELOPING | CONFIRMING | CONTRADICTING | FORWARD SIGNALS | FALSE ALARM | MISSED WARNING | DATA AVAILABLE AT THAT TIME | REVISED DATA AVAILABLE LATER |
|---|---|---|---|---|---|---|---|---|---|---|
| 2005-01 | **29** / RT **26** | STICKY — credit heaviest (53) | payrolls +352k/3m; U-3 5.3; CPI 3.0%; NFCI -0.67; sentiment 96 | payrolls 3m, emp-pop, U-6, sentiment, contd claims | participation | Flow horn: ICSA | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2004-10 quarter | U-3 first print 5.2 → 5.3; backtest scores this month with the 2005-01 quarter (published later); gas re-deflated +30 stress pts |
| 2005-02 | **26** / RT **22** | STICKY — credit heaviest (53) | payrolls +531k/3m; U-3 5.4; CPI 3.0%; NFCI -0.68; sentiment 94 | payrolls 3m, U-6, sentiment, contd claims | emp-pop, participation | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2004-10 quarter | backtest scores this month with the 2005-01 quarter (published later); gas re-deflated +33 stress pts |
| 2005-03 | **31** / RT **26** | STICKY — credit heaviest (53) | payrolls +524k/3m; U-3 5.2; CPI 3.1%; NFCI -0.65; sentiment 93 | sentiment | payrolls 3m, emp-pop, participation, U-6, contd claims | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2004-10 quarter | backtest scores this month with the 2005-01 quarter (published later); gas re-deflated +38 stress pts |
| 2005-04 | **30** / RT **24** | STICKY — credit heaviest (52) | payrolls +739k/3m; U-3 5.2; CPI 3.5%; NFCI -0.60; sentiment 88 | sentiment | payrolls 3m, emp-pop, participation, U-6, contd claims | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-01 quarter | backtest scores this month with the 2005-04 quarter (published later); gas re-deflated +40 stress pts |
| 2005-05 | **29** / RT **23** | STICKY — credit heaviest (52) | payrolls +655k/3m; U-3 5.1; CPI 2.8%; NFCI -0.57; sentiment 87 | sentiment | payrolls 3m, emp-pop, participation, U-6, contd claims | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-01 quarter | backtest scores this month with the 2005-04 quarter (published later); gas re-deflated +39 stress pts |
| 2005-06 | **28** / RT **21** | STICKY — credit heaviest (52) | payrolls +794k/3m; U-3 5.0; CPI 2.5%; NFCI -0.57; sentiment 96 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-01 quarter | backtest scores this month with the 2005-04 quarter (published later); gas re-deflated +39 stress pts |
| 2005-07 | **32** / RT **25** | STICKY — credit heaviest (55) | payrolls +780k/3m; U-3 5.0; CPI 3.2%; NFCI -0.58; sentiment 96 | — | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-04 quarter | backtest scores this month with the 2005-07 quarter (published later); gas re-deflated +41 stress pts |
| 2005-08 | **34** / RT **25** | STICKY — credit heaviest (55) | payrolls +813k/3m; U-3 4.9; CPI 3.6%; NFCI -0.57; sentiment 89 | — | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-04 quarter | backtest scores this month with the 2005-07 quarter (published later); gas re-deflated +44 stress pts |
| 2005-09 | **45** / RT **36** | STICKY — employment heaviest (55) *(published band: SLIPPERY)* | payrolls +604k/3m; U-3 5.0; CPI 4.7%; NFCI -0.54; sentiment 77 | sentiment, contd claims | payrolls 3m, emp-pop, participation, U-6 | Flow horn: ICSA, CCSA | published 45 would have been 36 at the time | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-04 quarter | U-3 first print 5.1 → 5.0; backtest scores this month with the 2005-07 quarter (published later); gas re-deflated +49 stress pts |
| 2005-10 | **40** / RT **34** | STICKY — employment heaviest (43) | payrolls +341k/3m; U-3 5.0; CPI 4.3%; NFCI -0.54; sentiment 74 | sentiment, contd claims | payrolls 3m, emp-pop, participation, U-6 | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-07 quarter | backtest scores this month with the 2005-10 quarter (published later); gas re-deflated +46 stress pts |
| 2005-11 | **34** / RT **29** | STICKY — credit heaviest (50) | payrolls +495k/3m; U-3 5.0; CPI 3.5%; NFCI -0.55; sentiment 82 | — | — | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-07 quarter | backtest scores this month with the 2005-10 quarter (published later); gas re-deflated +39 stress pts |
| 2005-12 | **33** / RT **28** | STICKY — credit heaviest (50) | payrolls +607k/3m; U-3 4.9; CPI 3.4%; NFCI -0.53; sentiment 92 | payrolls 3m, emp-pop, U-6, sentiment, contd claims | participation | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-07 quarter | backtest scores this month with the 2005-10 quarter (published later); gas re-deflated +38 stress pts |
| 2006-01 | **35** / RT **27** | STICKY — credit heaviest (55) | payrolls +786k/3m; U-3 4.7; CPI 4.0%; NFCI -0.55; sentiment 91 | payrolls 3m, emp-pop, U-6, sentiment, contd claims | participation | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-10 quarter | backtest scores this month with the 2006-01 quarter (published later); gas re-deflated +40 stress pts |
| 2006-02 | **33** / RT **26** | STICKY — credit heaviest (55) | payrolls +736k/3m; U-3 4.8; CPI 3.6%; NFCI -0.59; sentiment 87 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-10 quarter | backtest scores this month with the 2006-01 quarter (published later); gas re-deflated +39 stress pts |
| 2006-03 | **35** / RT **27** | STICKY — credit heaviest (55) | payrolls +879k/3m; U-3 4.7; CPI 3.4%; NFCI -0.59; sentiment 89 | sentiment | payrolls 3m, emp-pop, participation, U-6, contd claims | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2005-10 quarter | backtest scores this month with the 2006-01 quarter (published later); gas re-deflated +41 stress pts |
| 2006-04 | **41** / RT **33** | STICKY — credit heaviest (58) *(published band: SLIPPERY)* | payrolls +783k/3m; U-3 4.7; CPI 3.5%; NFCI -0.58; sentiment 87 | sentiment | payrolls 3m, emp-pop, participation, U-6, contd claims | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-01 quarter | backtest scores this month with the 2006-04 quarter (published later); gas re-deflated +45 stress pts |
| 2006-05 | **47** / RT **38** | STICKY — credit heaviest (58) *(published band: SLIPPERY)* | payrolls +516k/3m; U-3 4.6; CPI 4.2%; NFCI -0.56; sentiment 79 | sentiment | payrolls 3m, emp-pop, participation, U-6, contd claims | — | **yes** — published 47, nothing followed in 12m | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-01 quarter | backtest scores this month with the 2006-04 quarter (published later); gas re-deflated +47 stress pts |
| 2006-06 | **44** / RT **35** | STICKY — credit heaviest (58) *(published band: SLIPPERY)* | payrolls +299k/3m; U-3 4.6; CPI 4.3%; NFCI -0.50; sentiment 85 | U-6, sentiment | payrolls 3m, emp-pop, participation, contd claims | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-01 quarter | backtest scores this month with the 2006-04 quarter (published later); gas re-deflated +47 stress pts |
| 2006-07 | **47** / RT **39** | STICKY — credit heaviest (58) *(published band: SLIPPERY)* | payrolls +319k/3m; U-3 4.7; CPI 4.2%; NFCI -0.50; sentiment 85 | U-6, sentiment, contd claims | payrolls 3m, emp-pop, participation | — | **yes** — published 47, nothing followed in 12m | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-04 quarter | U-3 first print 4.8 → 4.7; backtest scores this month with the 2006-07 quarter (published later); gas re-deflated +48 stress pts |
| 2006-08 | **44** / RT **36** | STICKY — credit heaviest (58) *(published band: SLIPPERY)* | payrolls +443k/3m; U-3 4.7; CPI 3.8%; NFCI -0.55; sentiment 82 | payrolls 3m, emp-pop, participation, sentiment | U-6, contd claims | curve inverted -0.21 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-04 quarter | backtest scores this month with the 2006-07 quarter (published later); gas re-deflated +47 stress pts |
| 2006-09 | **38** / RT **31** | STICKY — credit heaviest (58) | payrolls +489k/3m; U-3 4.5; CPI 2.1%; NFCI -0.56; sentiment 85 | payrolls 3m, emp-pop, U-6, sentiment | participation, contd claims | curve inverted -0.21 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-04 quarter | U-3 first print 4.6 → 4.5; backtest scores this month with the 2006-07 quarter (published later); gas re-deflated +41 stress pts |
| 2006-10 | **39** / RT **34** | STICKY — credit heaviest (56) | payrolls +314k/3m; U-3 4.4; CPI 1.3%; NFCI -0.58; sentiment 94 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | curve inverted -0.32 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-07 quarter | backtest scores this month with the 2006-10 quarter (published later); gas re-deflated +37 stress pts |
| 2006-11 | **38** / RT **32** | STICKY — credit heaviest (56) | payrolls +368k/3m; U-3 4.5; CPI 2.0%; NFCI -0.59; sentiment 92 | payrolls 3m, emp-pop, participation, U-6, sentiment | contd claims | curve inverted -0.48 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-07 quarter | backtest scores this month with the 2006-10 quarter (published later); gas re-deflated +37 stress pts |
| 2006-12 | **39** / RT **33** | STICKY — credit heaviest (56) | payrolls +423k/3m; U-3 4.4; CPI 2.5%; NFCI -0.58; sentiment 92 | contd claims | payrolls 3m, emp-pop, participation, U-6, sentiment | curve inverted -0.41 | — | **yes** — reads 33 with recession/U+0.5pp inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-07 quarter | U-3 first print 4.5 → 4.4; backtest scores this month with the 2006-10 quarter (published later); gas re-deflated +38 stress pts |

### 3.2 2007–2009 — the Global Financial Crisis

| DATE | OOZE (pub / real-time) | WHAT OOZEMETER WOULD HAVE SAID | WHAT WAS ACTUALLY DEVELOPING | CONFIRMING | CONTRADICTING | FORWARD SIGNALS | FALSE ALARM | MISSED WARNING | DATA AVAILABLE AT THAT TIME | REVISED DATA AVAILABLE LATER |
|---|---|---|---|---|---|---|---|---|---|---|
| 2007-01 | **37** / RT **30** | STICKY — credit heaviest (56) | payrolls +629k/3m; U-3 4.6; CPI 2.1%; NFCI -0.62; sentiment 97 | payrolls 3m, emp-pop, participation, sentiment | U-6, contd claims | curve inverted -0.35 | — | **yes** — reads 30 with recession/U+0.5pp inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-10 quarter | backtest scores this month with the 2007-01 quarter (published later); gas re-deflated +36 stress pts |
| 2007-02 | **39** / RT **32** | STICKY — credit heaviest (56) | HSBC writes down subprime; New Century collapses next month. payrolls +500k/3m; U-3 4.5; CPI 2.4%; NFCI -0.64; sentiment 91 | sentiment, contd claims | payrolls 3m, emp-pop, participation, U-6 | curve inverted -0.44 | — | **yes** — reads 32 with recession/U+0.5pp inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-10 quarter | backtest scores this month with the 2007-01 quarter (published later); gas re-deflated +36 stress pts |
| 2007-03 | **39** / RT **32** | STICKY — credit heaviest (56) | payrolls +535k/3m; U-3 4.4; CPI 2.8%; NFCI -0.59; sentiment 88 | — | — | curve inverted -0.52 | — | **yes** — reads 32 with recession/U+0.5pp inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2006-10 quarter | backtest scores this month with the 2007-01 quarter (published later); gas re-deflated +40 stress pts |
| 2007-04 | **42** / RT **34** | STICKY — credit heaviest (57) *(published band: SLIPPERY)* | payrolls +375k/3m; U-3 4.5; CPI 2.6%; NFCI -0.56; sentiment 87 | emp-pop, participation, sentiment | payrolls 3m, U-6, contd claims | curve inverted -0.31 | — | **yes** — reads 34 with recession/U+0.5pp inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-01 quarter | backtest scores this month with the 2007-04 quarter (published later); gas re-deflated +44 stress pts |
| 2007-05 | **43** / RT **35** | STICKY — credit heaviest (57) *(published band: SLIPPERY)* | payrolls +432k/3m; U-3 4.4; CPI 2.7%; NFCI -0.53; sentiment 88 | emp-pop, participation, U-6, sentiment | payrolls 3m, contd claims | curve inverted -0.12 | — | **yes** — reads 35 with recession/U+0.5pp inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-01 quarter | U-3 first print 4.5 → 4.4; backtest scores this month with the 2007-04 quarter (published later); gas re-deflated +47 stress pts |
| 2007-06 | **45** / RT **37** | STICKY — credit heaviest (57) *(published band: SLIPPERY)* | Bear Stearns halts redemptions on two subprime hedge funds. payrolls +286k/3m; U-3 4.6; CPI 2.7%; NFCI -0.50; sentiment 85 | emp-pop, participation, U-6, sentiment | payrolls 3m, contd claims | Flow horn: T10Y3M | published 45 would have been 37 at the time | **yes** — reads 37 with recession/U+0.5pp inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-01 quarter | U-3 first print 4.5 → 4.6; backtest scores this month with the 2007-04 quarter (published later); gas re-deflated +46 stress pts |
| 2007-07 | **46** / RT **37** | STICKY — credit heaviest (62) *(published band: SLIPPERY)* | Credit markets seize; NFCI turns from -0.37 toward zero. payrolls +197k/3m; U-3 4.7; CPI 2.4%; NFCI -0.37; sentiment 90 | emp-pop, U-6, contd claims | payrolls 3m, participation, sentiment | Flow horn: NFCI *[NFCI did not exist — unreadable at the time]* | published 46 would have been 37 at the time | **yes** — reads 37 with recession/U+0.5pp inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-04 quarter | U-3 first print 4.6 → 4.7; backtest scores this month with the 2007-07 quarter (published later); gas re-deflated +45 stress pts |
| 2007-08 | **46** / RT **38** | STICKY — credit heaviest (62) *(published band: SLIPPERY)* | BNP Paribas freezes three funds (Aug 9); payroll 3m pace collapses from +629k in January. payrolls +21k/3m; U-3 4.6; CPI 2.0%; NFCI +0.07; sentiment 83 | emp-pop, participation, U-6, sentiment, contd claims | payrolls 3m | Flow horn: T10Y3M | published 46 would have been 38 at the time | **yes** — reads 38 with recession/U+0.5pp inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-04 quarter | backtest scores this month with the 2007-07 quarter (published later); gas re-deflated +42 stress pts |
| 2007-09 | **46** / RT **37** | STICKY — credit heaviest (62) *(published band: SLIPPERY)* | Fed cuts 50bp. Payroll 3m +29k. payrolls +29k/3m; U-3 4.7; CPI 2.8%; NFCI +0.20; sentiment 83 | emp-pop, U-6, sentiment, contd claims | payrolls 3m, participation | — | published 46 would have been 37 at the time | **yes** — reads 37 with recession/U+0.5pp inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-04 quarter | backtest scores this month with the 2007-07 quarter (published later); gas re-deflated +42 stress pts |
| 2007-10 | **52** / RT **42** | SLIPPERY — credit heaviest (65) | payrolls +131k/3m; U-3 4.7; CPI 3.5%; NFCI +0.02; sentiment 81 | emp-pop, participation, sentiment, contd claims | payrolls 3m, U-6 | — | published 52 would have been 42 at the time | reads 42 with recession inside 12m | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-07 quarter | backtest scores this month with the 2007-10 quarter (published later); gas re-deflated +42 stress pts |
| 2007-11 | **56** / RT **46** | SLIPPERY — credit heaviest (65) | payrolls +277k/3m; U-3 4.7; CPI 4.3%; NFCI +0.30; sentiment 76 | U-6, sentiment, contd claims | payrolls 3m, emp-pop, participation | Flow horn: NFCI *[NFCI did not exist — unreadable at the time]* | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-07 quarter | backtest scores this month with the 2007-10 quarter (published later); gas re-deflated +45 stress pts |
| 2007-12 | **57** / RT **46** | SLIPPERY — credit heaviest (65) | NBER business-cycle peak. Recession has begun. payrolls +296k/3m; U-3 5.0; CPI 4.1%; NFCI +0.58; sentiment 76 | emp-pop, U-6, sentiment, contd claims | payrolls 3m, participation | — | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-07 quarter | backtest scores this month with the 2007-10 quarter (published later); gas re-deflated +44 stress pts |
| 2008-01 | **59** / RT **49** | SLIPPERY — credit heaviest (67) | payrolls +216k/3m; U-3 5.0; CPI 4.3%; NFCI +0.46; sentiment 78 | U-6, sentiment, contd claims | payrolls 3m, emp-pop, participation | SLOOS +32 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-10 quarter | U-3 first print 4.9 → 5.0; backtest scores this month with the 2008-01 quarter (published later); gas re-deflated +44 stress pts |
| 2008-02 | **60** / RT **50** | SLIPPERY — credit heaviest (67) | payrolls +39k/3m; U-3 4.9; CPI 4.0%; NFCI +0.63; sentiment 71 | emp-pop, U-6, sentiment, contd claims | payrolls 3m, participation | Flow horn: T10Y3M | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-10 quarter | U-3 first print 4.8 → 4.9; backtest scores this month with the 2008-01 quarter (published later); gas re-deflated +44 stress pts |
| 2008-03 | **63** / RT **52** | SLIPPERY — credit heaviest (67) *(published band: OOZING)* | Bear Stearns fails; payrolls turn negative on a 3-month basis. payrolls -136k/3m; U-3 5.1; CPI 4.0%; NFCI +0.96; sentiment 70 | payrolls 3m, U-6, sentiment, contd claims | emp-pop, participation | Flow horn: T10Y3M | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2007-10 quarter | backtest scores this month with the 2008-01 quarter (published later); gas re-deflated +45 stress pts |
| 2008-04 | **65** / RT **55** | SLIPPERY — credit heaviest (69) *(published band: OOZING)* | payrolls -351k/3m; U-3 5.0; CPI 3.9%; NFCI +0.80; sentiment 63 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | SLOOS +55; Sahm 0.50 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-01 quarter | backtest scores this month with the 2008-04 quarter (published later); gas re-deflated +42 stress pts |
| 2008-05 | **67** / RT **57** | SLIPPERY — credit heaviest (69) *(published band: OOZING)* | payrolls -478k/3m; U-3 5.4; CPI 4.2%; NFCI +0.54; sentiment 60 | payrolls 3m, emp-pop, U-6, sentiment, contd claims | participation | Sahm 0.73 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-01 quarter | U-3 first print 5.5 → 5.4; backtest scores this month with the 2008-04 quarter (published later); gas re-deflated +39 stress pts |
| 2008-06 | **70** / RT **61** | OOZING — employment heaviest (55) | payrolls -559k/3m; U-3 5.6; CPI 5.0%; NFCI +0.65; sentiment 56 | payrolls 3m, emp-pop, U-6, sentiment, contd claims | participation | Sahm 0.80 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-01 quarter | U-3 first print 5.5 → 5.6; backtest scores this month with the 2008-04 quarter (published later); gas re-deflated +36 stress pts |
| 2008-07 | **75** / RT **67** | OOZING — employment heaviest (59) | payrolls -543k/3m; U-3 5.8; CPI 5.6%; NFCI +0.76; sentiment 61 | payrolls 3m, emp-pop, U-6, sentiment, contd claims | participation | SLOOS +58; Sahm 0.97 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-04 quarter | U-3 first print 5.7 → 5.8; backtest scores this month with the 2008-07 quarter (published later); gas re-deflated +35 stress pts |
| 2008-08 | **76** / RT **68** | OOZING — employment heaviest (63) | payrolls -640k/3m; U-3 6.1; CPI 5.4%; NFCI +0.74; sentiment 63 | payrolls 3m, emp-pop, U-6, contd claims | participation, sentiment | Sahm 1.10; Flow horn: ICSA, CCSA | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-04 quarter | backtest scores this month with the 2008-07 quarter (published later); gas re-deflated +38 stress pts |
| 2008-09 | **77** / RT **68** | OOZING — employment heaviest (66) | Lehman (Sep 15), AIG, WaMu. payrolls -940k/3m; U-3 6.1; CPI 4.9%; NFCI +1.40; sentiment 70 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | Sahm 1.27; Flow horn: NFCI *[NFCI did not exist — unreadable at the time]* | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-04 quarter | backtest scores this month with the 2008-07 quarter (published later); gas re-deflated +39 stress pts |
| 2008-10 | **79** / RT **66** | OOZING — employment heaviest (68) | TARP; gasoline collapses $3.70 -> $3.05. payrolls -1.2M/3m; U-3 6.5; CPI 3.7%; NFCI +2.50; sentiment 58 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | SLOOS +84; Sahm 1.50; Flow horn: T10Y3M, WTI | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-07 quarter | backtest scores this month with the 2008-10 quarter (published later); gas re-deflated +41 stress pts |
| 2008-11 | **75** / RT **63** | OOZING — employment heaviest (73) | NFCI hits its all-time high; gasoline $2.15. payrolls -1.7M/3m; U-3 6.8; CPI 1.1%; NFCI +3.02; sentiment 55 | — | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | Sahm 1.70; Flow horn: CCSA | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-07 quarter | U-3 first print 6.7 → 6.8; backtest scores this month with the 2008-10 quarter (published later); gas re-deflated +31 stress pts |
| 2008-12 | **77** / RT **68** | OOZING — employment heaviest (76) | payrolls -1.9M/3m; U-3 7.3; CPI 0.1%; NFCI +2.94; sentiment 60 | — | — | Sahm 2.07 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-07 quarter | U-3 first print 7.2 → 7.3; backtest scores this month with the 2008-10 quarter (published later); gas re-deflated +17 stress pts |
| 2009-01 | **83** / RT **73** | OOZING — employment heaviest (78) *(published band: OVERFLOWING)* | Deepest payroll contraction of the cycle. payrolls -2.2M/3m; U-3 7.8; CPI 0.0%; NFCI +2.33; sentiment 61 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | SLOOS +64; Sahm 2.37; Flow horn: ICSA | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-10 quarter | U-3 first print 7.6 → 7.8; backtest scores this month with the 2009-01 quarter (published later); gas re-deflated +21 stress pts |
| 2009-02 | **84** / RT **73** | OOZING — employment heaviest (81) *(published band: OVERFLOWING)* | payrolls -2.2M/3m; U-3 8.3; CPI 0.2%; NFCI +2.12; sentiment 56 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | Sahm 2.77 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-10 quarter | U-3 first print 8.1 → 8.3; backtest scores this month with the 2009-01 quarter (published later); gas re-deflated +26 stress pts |
| 2009-03 | **86** / RT **75** | OOZING — employment heaviest (82) *(published band: OVERFLOWING)* | payrolls -2.4M/3m; U-3 8.7; CPI -0.4%; NFCI +2.04; sentiment 57 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | Sahm 3.13 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2008-10 quarter | U-3 first print 8.5 → 8.7; backtest scores this month with the 2009-01 quarter (published later); gas re-deflated +27 stress pts |
| 2009-04 | **88** / RT **81** | OVERFLOWING — employment heaviest (80) | payrolls -2.3M/3m; U-3 9.0; CPI -0.7%; NFCI +1.58; sentiment 65 | payrolls 3m, emp-pop, U-6, contd claims | participation, sentiment | SLOOS +40; Sahm 3.53 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2009-01 quarter | U-3 first print 8.9 → 9.0; backtest scores this month with the 2009-04 quarter (published later); gas re-deflated +29 stress pts |
| 2009-05 | **89** / RT **82** | OVERFLOWING — employment heaviest (79) | payrolls -1.9M/3m; U-3 9.4; CPI -1.3%; NFCI +1.03; sentiment 69 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | Sahm 3.73 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2009-01 quarter | backtest scores this month with the 2009-04 quarter (published later); gas re-deflated +32 stress pts |
| 2009-06 | **90** / RT **83** | OVERFLOWING — employment heaviest (78) | NBER trough. Unemployment 9.5% and still rising. payrolls -1.5M/3m; U-3 9.5; CPI -1.4%; NFCI +0.77; sentiment 71 | payrolls 3m, emp-pop, U-6, contd claims | participation, sentiment | Sahm 3.90 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2009-01 quarter | backtest scores this month with the 2009-04 quarter (published later); gas re-deflated +36 stress pts |
| 2009-07 | **89** / RT **84** | OVERFLOWING — employment heaviest (76) | payrolls -1.2M/3m; U-3 9.5; CPI -2.1%; NFCI +0.55; sentiment 66 | payrolls 3m, emp-pop, participation, U-6 | sentiment, contd claims | SLOOS +32; Sahm 3.80 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2009-04 quarter | U-3 first print 9.4 → 9.5; backtest scores this month with the 2009-07 quarter (published later); gas re-deflated +35 stress pts |
| 2009-08 | **88** / RT **82** | OVERFLOWING — employment heaviest (76) | payrolls -994k/3m; U-3 9.6; CPI -1.5%; NFCI +0.29; sentiment 66 | contd claims | payrolls 3m, emp-pop, participation, U-6, sentiment | Sahm 3.67 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2009-04 quarter | U-3 first print 9.7 → 9.6; backtest scores this month with the 2009-07 quarter (published later); gas re-deflated +36 stress pts |
| 2009-09 | **88** / RT **82** | OVERFLOWING — employment heaviest (76) | payrolls -762k/3m; U-3 9.8; CPI -1.3%; NFCI +0.15; sentiment 74 | sentiment, contd claims | payrolls 3m, emp-pop, participation, U-6 | Sahm 3.57 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2009-04 quarter | backtest scores this month with the 2009-07 quarter (published later); gas re-deflated +35 stress pts |
| 2009-10 | **86** / RT **80** | OOZING — employment heaviest (78) *(published band: OVERFLOWING)* | Unemployment peaks at 10.0%. payrolls -601k/3m; U-3 10.0; CPI -0.2%; NFCI +0.05; sentiment 71 | sentiment, contd claims | payrolls 3m, emp-pop, participation, U-6 | Sahm 3.57 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2009-07 quarter | U-3 first print 10.2 → 10.0; backtest scores this month with the 2009-10 quarter (published later); gas re-deflated +35 stress pts |
| 2009-11 | **82** / RT **75** | OOZING — employment heaviest (77) *(published band: OVERFLOWING)* | payrolls -415k/3m; U-3 9.9; CPI 1.8%; NFCI -0.00; sentiment 67 | sentiment, contd claims | payrolls 3m, emp-pop, participation, U-6 | Sahm 3.47 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2009-07 quarter | U-3 first print 10.0 → 9.9; backtest scores this month with the 2009-10 quarter (published later); gas re-deflated +36 stress pts |
| 2009-12 | **82** / RT **76** | OOZING — employment heaviest (77) *(published band: OVERFLOWING)* | payrolls -438k/3m; U-3 9.9; CPI 2.7%; NFCI -0.10; sentiment 72 | contd claims | payrolls 3m, emp-pop, participation, U-6, sentiment | Sahm 3.07 | — | — | 5/7 lines (missing: auto — NY Fed HHDC not yet published; financial — NFCI did not exist); credit reads the 2009-07 quarter | U-3 first print 10.0 → 9.9; backtest scores this month with the 2009-10 quarter (published later); gas re-deflated +36 stress pts |

### 3.3 2020 — COVID

| DATE | OOZE (pub / real-time) | WHAT OOZEMETER WOULD HAVE SAID | WHAT WAS ACTUALLY DEVELOPING | CONFIRMING | CONTRADICTING | FORWARD SIGNALS | FALSE ALARM | MISSED WARNING | DATA AVAILABLE AT THAT TIME | REVISED DATA AVAILABLE LATER |
|---|---|---|---|---|---|---|---|---|---|---|
| 2020-01 | **12** / RT **8** | SMOOTH — credit heaviest (34) | payrolls +571k/3m; U-3 3.6; CPI 2.5%; NFCI -0.61; sentiment 100 | U-6, contd claims | payrolls 3m, emp-pop, participation, sentiment | — | — | **yes** — reads 8 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2019-10 quarter | backtest scores this month with the 2020-01 quarter (published later); gas re-deflated +19 stress pts |
| 2020-02 | **11** / RT **8** | SMOOTH — credit heaviest (34) | First COVID market break; NFCI Flow horn fires 2020-02-21. payrolls +626k/3m; U-3 3.5; CPI 2.3%; NFCI -0.47; sentiment 101 | payrolls 3m, emp-pop, participation, sentiment | U-6, contd claims | curve inverted -0.04; Flow horn: NFCI | — | **yes** — reads 8 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2019-10 quarter | backtest scores this month with the 2020-01 quarter (published later); gas re-deflated +18 stress pts |
| 2020-03 | **42** / RT **39** | STICKY — employment heaviest (96) *(published band: SLIPPERY)* | Shutdowns begin. payrolls -899k/3m; U-3 4.4; CPI 1.5%; NFCI +0.09; sentiment 89 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | Flow horn: ICSA, CCSA, T10Y3M, WTI | — | **yes** — reads 39 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2019-10 quarter | backtest scores this month with the 2020-01 quarter (published later); gas re-deflated +16 stress pts |
| 2020-04 | **42** / RT **40** | STICKY — employment heaviest (99) *(published band: SLIPPERY)* | Largest labour shock since the 1930s; claims 4wk mean 4.66M. payrolls -21.6M/3m; U-3 14.8; CPI 0.3%; NFCI +0.25; sentiment 72 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | SLOOS +42; Sahm 4.00 | — | — | 7/7 lines; credit reads the 2020-01 quarter | backtest scores this month with the 2020-04 quarter (published later); gas re-deflated +10 stress pts |
| 2020-05 | **41** / RT **40** | STICKY — employment heaviest (96) *(published band: SLIPPERY)* | payrolls -19.3M/3m; U-3 13.2; CPI 0.1%; NFCI -0.12; sentiment 72 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | Sahm 7.27; Flow horn: WTI | — | — | 7/7 lines; credit reads the 2020-01 quarter | backtest scores this month with the 2020-04 quarter (published later); gas re-deflated +11 stress pts |
| 2020-06 | **40** / RT **38** | STICKY — employment heaviest (96) | payrolls -13.2M/3m; U-3 11.0; CPI 0.7%; NFCI -0.35; sentiment 78 | — | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | Sahm 9.50 | — | — | 7/7 lines; credit reads the 2020-01 quarter | backtest scores this month with the 2020-04 quarter (published later); gas re-deflated +15 stress pts |
| 2020-07 | **37** / RT **35** | STICKY — employment heaviest (95) | CARES $600 supplement expires end of July. payrolls +8.8M/3m; U-3 10.2; CPI 1.0%; NFCI -0.44; sentiment 72 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | SLOOS +71; Sahm 8.00 | — | — | 7/7 lines; credit reads the 2020-04 quarter | backtest scores this month with the 2020-07 quarter (published later); gas re-deflated +16 stress pts |
| 2020-08 | **34** / RT **33** | STICKY — employment heaviest (91) | payrolls +7.8M/3m; U-3 8.4; CPI 1.3%; NFCI -0.50; sentiment 74 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | Sahm 6.37 | — | — | 7/7 lines; credit reads the 2020-04 quarter | backtest scores this month with the 2020-07 quarter (published later); gas re-deflated +16 stress pts |
| 2020-09 | **34** / RT **33** | STICKY — employment heaviest (90) | payrolls +4.1M/3m; U-3 7.8; CPI 1.4%; NFCI -0.50; sentiment 80 | payrolls 3m, emp-pop, U-6, sentiment, contd claims | participation | Sahm 5.30 | — | — | 7/7 lines; credit reads the 2020-04 quarter | backtest scores this month with the 2020-07 quarter (published later); gas re-deflated +15 stress pts |
| 2020-10 | **33** / RT **30** | STICKY — employment heaviest (88) | payrolls +3.2M/3m; U-3 6.9; CPI 1.2%; NFCI -0.50; sentiment 82 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | SLOOS +38; Sahm 4.20 | — | — | 7/7 lines; credit reads the 2020-07 quarter | backtest scores this month with the 2020-10 quarter (published later); gas re-deflated +15 stress pts |
| 2020-11 | **32** / RT **30** | STICKY — employment heaviest (87) | payrolls +1.9M/3m; U-3 6.7; CPI 1.2%; NFCI -0.55; sentiment 77 | payrolls 3m, emp-pop, U-6, sentiment, contd claims | participation | Sahm 3.63 | — | — | 7/7 lines; credit reads the 2020-07 quarter | backtest scores this month with the 2020-10 quarter (published later); gas re-deflated +15 stress pts |
| 2020-12 | **33** / RT **31** | STICKY — employment heaviest (90) | payrolls +778k/3m; U-3 6.7; CPI 1.4%; NFCI -0.60; sentiment 81 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | Sahm 3.23 | — | — | 7/7 lines; credit reads the 2020-07 quarter | backtest scores this month with the 2020-10 quarter (published later); gas re-deflated +15 stress pts |

### 3.4 2021 — reopening and the calibration anchor

| DATE | OOZE (pub / real-time) | WHAT OOZEMETER WOULD HAVE SAID | WHAT WAS ACTUALLY DEVELOPING | CONFIRMING | CONTRADICTING | FORWARD SIGNALS | FALSE ALARM | MISSED WARNING | DATA AVAILABLE AT THAT TIME | REVISED DATA AVAILABLE LATER |
|---|---|---|---|---|---|---|---|---|---|---|
| 2021-01 | **31** / RT **30** | STICKY — employment heaviest (90) | payrolls +403k/3m; U-3 6.4; CPI 1.4%; NFCI -0.62; sentiment 79 | payrolls 3m, U-6, contd claims | emp-pop, participation, sentiment | Sahm 3.03 | — | — | 7/7 lines; credit reads the 2020-10 quarter | backtest scores this month with the 2021-01 quarter (published later); gas re-deflated +16 stress pts |
| 2021-02 | **31** / RT **30** | STICKY — employment heaviest (87) | payrolls +647k/3m; U-3 6.2; CPI 1.7%; NFCI -0.63; sentiment 77 | payrolls 3m, emp-pop, U-6, contd claims | participation, sentiment | Sahm 2.87 | — | — | 7/7 lines; credit reads the 2020-10 quarter | backtest scores this month with the 2021-01 quarter (published later); gas re-deflated +17 stress pts |
| 2021-03 | **31** / RT **30** | STICKY — employment heaviest (83) | Third stimulus (ARP). Real DPI/capita +30.5% YoY. payrolls +1.7M/3m; U-3 6.1; CPI 2.6%; NFCI -0.64; sentiment 85 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | Sahm 2.33 | — | — | 7/7 lines; credit reads the 2020-10 quarter | backtest scores this month with the 2021-01 quarter (published later); gas re-deflated +18 stress pts |
| 2021-04 | **29** / RT **29** | STICKY — employment heaviest (78) | payrolls +1.7M/3m; U-3 6.1; CPI 4.2%; NFCI -0.67; sentiment 88 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | — | — | — | 7/7 lines; credit reads the 2021-01 quarter | backtest scores this month with the 2021-04 quarter (published later); gas re-deflated +18 stress pts |
| 2021-05 | **27** / RT **27** | STICKY — employment heaviest (66) | payrolls +1.7M/3m; U-3 5.8; CPI 5.0%; NFCI -0.69; sentiment 83 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | — | — | — | 7/7 lines; credit reads the 2021-01 quarter | backtest scores this month with the 2021-04 quarter (published later); gas re-deflated +18 stress pts |
| 2021-06 | **26** / RT **26** | STICKY — employment heaviest (61) | CPI 5.4% and climbing; used-car and shelter inflation broadening. payrolls +1.6M/3m; U-3 5.9; CPI 5.4%; NFCI -0.70; sentiment 86 | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | — | — | — | 7/7 lines; credit reads the 2021-01 quarter | backtest scores this month with the 2021-04 quarter (published later); gas re-deflated +18 stress pts |
| 2021-07 | **21** / RT **20** | SMOOTH — employment heaviest (51) *(published band: STICKY)* | payrolls +2.2M/3m; U-3 5.4; CPI 5.4%; NFCI -0.67; sentiment 81 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | — | — | — | 7/7 lines; credit reads the 2021-04 quarter | backtest scores this month with the 2021-07 quarter (published later); gas re-deflated +18 stress pts |
| 2021-08 | **20** / RT **19** | SMOOTH — employment heaviest (48) | payrolls +2.2M/3m; U-3 5.1; CPI 5.2%; NFCI -0.65; sentiment 70 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | — | — | — | 7/7 lines; credit reads the 2021-04 quarter | backtest scores this month with the 2021-07 quarter (published later); gas re-deflated +18 stress pts |
| 2021-09 | **20** / RT **18** | SMOOTH — employment heaviest (46) | payrolls +2.0M/3m; U-3 4.7; CPI 5.4%; NFCI -0.66; sentiment 73 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | — | — | — | 7/7 lines; credit reads the 2021-04 quarter | backtest scores this month with the 2021-07 quarter (published later); gas re-deflated +17 stress pts |
| 2021-10 | **14** / RT **11** | SMOOTH — housing heaviest (31) | CPI 6.2%. Inflation becomes the top line for the first time. payrolls +1.8M/3m; U-3 4.5; CPI 6.2%; NFCI -0.65; sentiment 72 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | — | — | — | 7/7 lines; credit reads the 2021-07 quarter | backtest scores this month with the 2021-10 quarter (published later); gas re-deflated +17 stress pts |
| 2021-11 | **11** / RT **8** | SMOOTH — inflation heaviest (65) | payrolls +1.9M/3m; U-3 4.1; CPI 6.8%; NFCI -0.58; sentiment 67 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | — | — | — | 7/7 lines; credit reads the 2021-07 quarter | backtest scores this month with the 2021-10 quarter (published later); gas re-deflated +17 stress pts |
| 2021-12 | **10** / RT **8** | SMOOTH — inflation heaviest (67) | CALIBRATION LOW ANCHOR: this month defines "as calm as it gets" (raw 23.936 -> 10). payrolls +2.0M/3m; U-3 3.9; CPI 7.0%; NFCI -0.55; sentiment 71 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | — | — | — | 7/7 lines; credit reads the 2021-07 quarter | backtest scores this month with the 2021-10 quarter (published later); gas re-deflated +16 stress pts |

### 3.5 2022 — the inflation shock

| DATE | OOZE (pub / real-time) | WHAT OOZEMETER WOULD HAVE SAID | WHAT WAS ACTUALLY DEVELOPING | CONFIRMING | CONTRADICTING | FORWARD SIGNALS | FALSE ALARM | MISSED WARNING | DATA AVAILABLE AT THAT TIME | REVISED DATA AVAILABLE LATER |
|---|---|---|---|---|---|---|---|---|---|---|
| 2022-01 | **12** / RT **10** | SMOOTH — inflation heaviest (70) | payrolls +1.4M/3m; U-3 4.0; CPI 7.5%; NFCI -0.56; sentiment 67 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | — | — | — | 7/7 lines; credit reads the 2021-10 quarter | backtest scores this month with the 2022-01 quarter (published later); gas re-deflated +16 stress pts |
| 2022-02 | **11** / RT **9** | SMOOTH — inflation heaviest (72) | payrolls +1.6M/3m; U-3 3.9; CPI 7.9%; NFCI -0.48; sentiment 63 | — | — | — | — | — | 7/7 lines; credit reads the 2021-10 quarter | backtest scores this month with the 2022-01 quarter (published later); gas re-deflated +16 stress pts |
| 2022-03 | **14** / RT **12** | SMOOTH — gas heaviest (83) | CPI 8.5%; gasoline $4.22 after the Ukraine invasion. payrolls +1.5M/3m; U-3 3.7; CPI 8.5%; NFCI -0.39; sentiment 59 | sentiment | payrolls 3m, emp-pop, participation, U-6, contd claims | — | — | — | 7/7 lines; credit reads the 2021-10 quarter | backtest scores this month with the 2022-01 quarter (published later); gas re-deflated +17 stress pts |
| 2022-04 | **15** / RT **12** | SMOOTH — gas heaviest (79) | payrolls +1.6M/3m; U-3 3.7; CPI 8.3%; NFCI -0.35; sentiment 65 | sentiment | payrolls 3m, emp-pop, participation, U-6, contd claims | — | — | — | 7/7 lines; credit reads the 2022-01 quarter | backtest scores this month with the 2022-04 quarter (published later); gas re-deflated +16 stress pts |
| 2022-05 | **17** / RT **14** | SMOOTH — gas heaviest (86) | payrolls +1.1M/3m; U-3 3.6; CPI 8.6%; NFCI -0.28; sentiment 58 | sentiment | payrolls 3m, emp-pop, participation, U-6, contd claims | — | — | — | 7/7 lines; credit reads the 2022-01 quarter | backtest scores this month with the 2022-04 quarter (published later); gas re-deflated +15 stress pts |
| 2022-06 | **19** / RT **17** | SMOOTH — gas heaviest (90) | CPI peaks at 9.1%; gasoline $4.93; Michigan sentiment 50.0, the lowest print in the series to that date. payrolls +1.0M/3m; U-3 3.6; CPI 9.1%; NFCI -0.19; sentiment 50 | emp-pop, participation, sentiment | payrolls 3m, U-6, contd claims | Flow horn: T10Y3M | — | — | 7/7 lines; credit reads the 2022-01 quarter | backtest scores this month with the 2022-04 quarter (published later); gas re-deflated +7 stress pts |
| 2022-07 | **21** / RT **18** | SMOOTH — gas heaviest (86) *(published band: STICKY)* | payrolls +1.4M/3m; U-3 3.5; CPI 8.5%; NFCI -0.18; sentiment 52 | participation, sentiment | payrolls 3m, emp-pop, U-6, contd claims | SLOOS +24 | — | — | 7/7 lines; credit reads the 2022-04 quarter | backtest scores this month with the 2022-07 quarter (published later); gas re-deflated +12 stress pts |
| 2022-08 | **18** / RT **14** | SMOOTH — inflation heaviest (75) | payrolls +1.4M/3m; U-3 3.6; CPI 8.3%; NFCI -0.23; sentiment 58 | sentiment, contd claims | payrolls 3m, emp-pop, participation, U-6 | — | — | — | 7/7 lines; credit reads the 2022-04 quarter | backtest scores this month with the 2022-07 quarter (published later); gas re-deflated +13 stress pts |
| 2022-09 | **18** / RT **15** | SMOOTH — housing heaviest (39) | payrolls +1.2M/3m; U-3 3.5; CPI 8.2%; NFCI -0.14; sentiment 59 | payrolls 3m, emp-pop, participation, U-6, sentiment | contd claims | — | — | — | 7/7 lines; credit reads the 2022-04 quarter | backtest scores this month with the 2022-07 quarter (published later); gas re-deflated +12 stress pts |
| 2022-10 | **24** / RT **21** | STICKY — housing heaviest (49) | CPI 7.8%, mortgage 6.90%; sentiment 59.9. payrolls +867k/3m; U-3 3.6; CPI 7.8%; NFCI -0.10; sentiment 60 | contd claims | payrolls 3m, emp-pop, participation, U-6, sentiment | SLOOS +39 | — | — | 7/7 lines; credit reads the 2022-07 quarter | backtest scores this month with the 2022-10 quarter (published later); gas re-deflated +12 stress pts |
| 2022-11 | **23** / RT **20** | SMOOTH — housing heaviest (48) *(published band: STICKY)* | payrolls +880k/3m; U-3 3.6; CPI 7.1%; NFCI -0.16; sentiment 57 | emp-pop, participation, sentiment, contd claims | payrolls 3m, U-6 | curve inverted -0.43 | — | — | 7/7 lines; credit reads the 2022-07 quarter | backtest scores this month with the 2022-10 quarter (published later); gas re-deflated +11 stress pts |
| 2022-12 | **19** / RT **16** | SMOOTH — housing heaviest (42) | payrolls +760k/3m; U-3 3.5; CPI 6.5%; NFCI -0.20; sentiment 60 | contd claims | payrolls 3m, emp-pop, participation, U-6, sentiment | curve inverted -0.74 | — | — | 7/7 lines; credit reads the 2022-07 quarter | backtest scores this month with the 2022-10 quarter (published later); gas re-deflated +10 stress pts |

### 3.6 2023–2026 — the slowdown

| DATE | OOZE (pub / real-time) | WHAT OOZEMETER WOULD HAVE SAID | WHAT WAS ACTUALLY DEVELOPING | CONFIRMING | CONTRADICTING | FORWARD SIGNALS | FALSE ALARM | MISSED WARNING | DATA AVAILABLE AT THAT TIME | REVISED DATA AVAILABLE LATER |
|---|---|---|---|---|---|---|---|---|---|---|
| 2023-01 | **20** / RT **17** | SMOOTH — housing heaviest (41) | payrolls +837k/3m; U-3 3.5; CPI 6.4%; NFCI -0.27; sentiment 65 | payrolls 3m, emp-pop, participation, U-6, sentiment | contd claims | curve inverted -1.16; SLOOS +45 | — | — | 7/7 lines; credit reads the 2022-10 quarter | backtest scores this month with the 2023-01 quarter (published later); gas re-deflated +10 stress pts |
| 2023-02 | **21** / RT **18** | SMOOTH — housing heaviest (41) *(published band: STICKY)* | payrolls +824k/3m; U-3 3.6; CPI 6.0%; NFCI -0.29; sentiment 67 | payrolls 3m, emp-pop, participation, sentiment | U-6, contd claims | curve inverted -1.04 | — | — | 7/7 lines; credit reads the 2022-10 quarter | backtest scores this month with the 2023-01 quarter (published later); gas re-deflated +9 stress pts |
| 2023-03 | **22** / RT **19** | SMOOTH — housing heaviest (44) *(published band: STICKY)* | SVB / Signature fail (Mar 10-12). payrolls +792k/3m; U-3 3.5; CPI 5.0%; NFCI -0.18; sentiment 62 | U-6, contd claims | payrolls 3m, emp-pop, participation, sentiment | curve inverted -1.20 | — | — | 7/7 lines; credit reads the 2022-10 quarter | backtest scores this month with the 2023-01 quarter (published later); gas re-deflated +9 stress pts |
| 2023-04 | **24** / RT **20** | SMOOTH — housing heaviest (42) *(published band: STICKY)* | payrolls +599k/3m; U-3 3.4; CPI 4.9%; NFCI -0.17; sentiment 64 | sentiment, contd claims | payrolls 3m, emp-pop, participation, U-6 | curve inverted -1.61; SLOOS +46 | — | **yes** — reads 20 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2023-01 quarter | backtest scores this month with the 2023-04 quarter (published later); gas re-deflated +9 stress pts |
| 2023-05 | **23** / RT **20** | SMOOTH — housing heaviest (43) *(published band: STICKY)* | payrolls +589k/3m; U-3 3.6; CPI 4.0%; NFCI -0.21; sentiment 59 | sentiment, contd claims | payrolls 3m, emp-pop, participation, U-6 | curve inverted -1.73 | — | — | 7/7 lines; credit reads the 2023-01 quarter | backtest scores this month with the 2023-04 quarter (published later); gas re-deflated +9 stress pts |
| 2023-06 | **24** / RT **21** | STICKY — housing heaviest (46) | payrolls +746k/3m; U-3 3.6; CPI 3.0%; NFCI -0.22; sentiment 64 | emp-pop, U-6, contd claims | payrolls 3m, participation, sentiment | curve inverted -1.67 | — | **yes** — reads 21 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2023-01 quarter | backtest scores this month with the 2023-04 quarter (published later); gas re-deflated +8 stress pts |
| 2023-07 | **25** / RT **22** | STICKY — housing heaviest (48) | payrolls +668k/3m; U-3 3.5; CPI 3.2%; NFCI -0.26; sentiment 72 | U-6, contd claims | payrolls 3m, emp-pop, participation, sentiment | curve inverted -1.59; SLOOS +51 | — | **yes** — reads 22 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2023-04 quarter | backtest scores this month with the 2023-07 quarter (published later); gas re-deflated +8 stress pts |
| 2023-08 | **29** / RT **27** | STICKY — housing heaviest (50) | payrolls +606k/3m; U-3 3.7; CPI 3.7%; NFCI -0.32; sentiment 69 | U-6, contd claims | payrolls 3m, emp-pop, participation, sentiment | curve inverted -1.39 | — | **yes** — reads 27 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2023-04 quarter | backtest scores this month with the 2023-07 quarter (published later); gas re-deflated +8 stress pts |
| 2023-09 | **26** / RT **23** | STICKY — housing heaviest (51) | payrolls +537k/3m; U-3 3.7; CPI 3.7%; NFCI -0.33; sentiment 68 | U-6, contd claims | payrolls 3m, emp-pop, participation, sentiment | curve inverted -1.18 | — | **yes** — reads 23 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2023-04 quarter | backtest scores this month with the 2023-07 quarter (published later); gas re-deflated +8 stress pts |
| 2023-10 | **28** / RT **26** | STICKY — housing heaviest (54) | Mortgage rate peaks at 7.62%. payrolls +533k/3m; U-3 3.9; CPI 3.2%; NFCI -0.29; sentiment 64 | emp-pop, U-6, sentiment, contd claims | payrolls 3m, participation | curve inverted -0.81; SLOOS +34 | — | — | 7/7 lines; credit reads the 2023-07 quarter | backtest scores this month with the 2023-10 quarter (published later); gas re-deflated +8 stress pts |
| 2023-11 | **26** / RT **23** | STICKY — housing heaviest (53) | payrolls +442k/3m; U-3 3.7; CPI 3.1%; NFCI -0.30; sentiment 61 | payrolls 3m, emp-pop, participation, U-6, contd claims | sentiment | curve inverted -1.02 | — | **yes** — reads 23 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2023-07 quarter | backtest scores this month with the 2023-10 quarter (published later); gas re-deflated +7 stress pts |
| 2023-12 | **24** / RT **22** | STICKY — housing heaviest (48) | payrolls +440k/3m; U-3 3.8; CPI 3.4%; NFCI -0.35; sentiment 70 | payrolls 3m, sentiment, contd claims | emp-pop, participation, U-6 | curve inverted -1.42 | — | — | 7/7 lines; credit reads the 2023-07 quarter | backtest scores this month with the 2023-10 quarter (published later); gas re-deflated +7 stress pts |
| 2024-01 | **24** / RT **22** | STICKY — housing heaviest (46) | payrolls +456k/3m; U-3 3.7; CPI 3.1%; NFCI -0.39; sentiment 79 | payrolls 3m, emp-pop, U-6, sentiment, contd claims | participation | curve inverted -1.40 | — | **yes** — reads 22 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2023-10 quarter | backtest scores this month with the 2024-01 quarter (published later); gas re-deflated +6 stress pts |
| 2024-02 | **25** / RT **23** | STICKY — housing heaviest (47) | payrolls +535k/3m; U-3 3.9; CPI 3.1%; NFCI -0.42; sentiment 77 | payrolls 3m, sentiment, contd claims | emp-pop, participation, U-6 | curve inverted -1.23 | — | — | 7/7 lines; credit reads the 2023-10 quarter | backtest scores this month with the 2024-01 quarter (published later); gas re-deflated +6 stress pts |
| 2024-03 | **27** / RT **25** | STICKY — housing heaviest (48) | payrolls +609k/3m; U-3 3.9; CPI 3.5%; NFCI -0.44; sentiment 79 | U-6, contd claims | payrolls 3m, emp-pop, participation, sentiment | curve inverted -1.26 | — | — | 7/7 lines; credit reads the 2023-10 quarter | backtest scores this month with the 2024-01 quarter (published later); gas re-deflated +6 stress pts |
| 2024-04 | **28** / RT **27** | STICKY — housing heaviest (50) | payrolls +498k/3m; U-3 3.9; CPI 3.4%; NFCI -0.42; sentiment 77 | U-6, sentiment, contd claims | payrolls 3m, emp-pop, participation | curve inverted -0.90 | — | — | 7/7 lines; credit reads the 2024-01 quarter | backtest scores this month with the 2024-04 quarter (published later); gas re-deflated +6 stress pts |
| 2024-05 | **28** / RT **27** | STICKY — housing heaviest (50) | payrolls +370k/3m; U-3 3.9; CPI 3.3%; NFCI -0.41; sentiment 69 | emp-pop, U-6, sentiment, contd claims | payrolls 3m, participation | curve inverted -0.97 | — | — | 7/7 lines; credit reads the 2024-01 quarter | backtest scores this month with the 2024-04 quarter (published later); gas re-deflated +6 stress pts |
| 2024-06 | **28** / RT **27** | STICKY — housing heaviest (49) | payrolls +229k/3m; U-3 4.1; CPI 3.0%; NFCI -0.39; sentiment 68 | emp-pop, participation, U-6, sentiment, contd claims | payrolls 3m | curve inverted -1.20 | — | — | 7/7 lines; credit reads the 2024-01 quarter | backtest scores this month with the 2024-04 quarter (published later); gas re-deflated +5 stress pts |
| 2024-07 | **28** / RT **28** | STICKY — housing heaviest (48) | payrolls +218k/3m; U-3 4.2; CPI 2.9%; NFCI -0.37; sentiment 66 | — | — | curve inverted -1.18; Sahm 0.53 | — | — | 7/7 lines; credit reads the 2024-04 quarter | backtest scores this month with the 2024-07 quarter (published later); gas re-deflated +5 stress pts |
| 2024-08 | **26** / RT **25** | STICKY — credit heaviest (44) | payrolls +149k/3m; U-3 4.2; CPI 2.5%; NFCI -0.37; sentiment 68 | payrolls 3m, participation | emp-pop, U-6, sentiment, contd claims | curve inverted -1.42; Sahm 0.57 | — | — | 7/7 lines; credit reads the 2024-04 quarter | backtest scores this month with the 2024-07 quarter (published later); gas re-deflated +5 stress pts |
| 2024-09 | **23** / RT **22** | STICKY — credit heaviest (44) | payrolls +217k/3m; U-3 4.1; CPI 2.4%; NFCI -0.42; sentiment 70 | payrolls 3m, emp-pop, participation, sentiment, contd claims | U-6 | curve inverted -1.20; Sahm 0.50 | — | — | 7/7 lines; credit reads the 2024-04 quarter | backtest scores this month with the 2024-07 quarter (published later); gas re-deflated +5 stress pts |
| 2024-10 | **24** / RT **24** | STICKY — housing heaviest (43) | payrolls +197k/3m; U-3 4.1; CPI 2.6%; NFCI -0.44; sentiment 70 | payrolls 3m, emp-pop, U-6, sentiment | participation, contd claims | curve inverted -0.62 | — | — | 7/7 lines; credit reads the 2024-07 quarter | backtest scores this month with the 2024-10 quarter (published later); gas re-deflated +5 stress pts |
| 2024-11 | **25** / RT **25** | STICKY — housing heaviest (48) | payrolls +322k/3m; U-3 4.2; CPI 2.8%; NFCI -0.47; sentiment 72 | payrolls 3m, U-6, sentiment | emp-pop, participation, contd claims | curve inverted -0.26 | — | — | 7/7 lines; credit reads the 2024-07 quarter | backtest scores this month with the 2024-10 quarter (published later); gas re-deflated +4 stress pts |
| 2024-12 | **25** / RT **25** | STICKY — housing heaviest (46) | payrolls +404k/3m; U-3 4.1; CPI 2.9%; NFCI -0.48; sentiment 74 | emp-pop, participation, contd claims | payrolls 3m, U-6, sentiment | — | — | — | 7/7 lines; credit reads the 2024-07 quarter | backtest scores this month with the 2024-10 quarter (published later); gas re-deflated +4 stress pts |
| 2025-01 | **25** / RT **25** | STICKY — housing heaviest (50) | payrolls +323k/3m; U-3 4.0; CPI 3.0%; NFCI -0.50; sentiment 72 | — | payrolls 3m, emp-pop, participation, U-6, sentiment, contd claims | — | — | **yes** — reads 25 with recession/U+0.5pp inside 12m | 7/7 lines; credit reads the 2024-10 quarter | backtest scores this month with the 2025-01 quarter (published later); gas re-deflated +4 stress pts |
| 2025-02 | **25** / RT **25** | STICKY — housing heaviest (48) | payrolls +231k/3m; U-3 4.2; CPI 2.8%; NFCI -0.50; sentiment 65 | — | — | — | — | — | 7/7 lines; credit reads the 2024-10 quarter | backtest scores this month with the 2025-01 quarter (published later); gas re-deflated +4 stress pts |
| 2025-03 | **24** / RT **24** | STICKY — housing heaviest (46) | payrolls +61k/3m; U-3 4.2; CPI 2.4%; NFCI -0.44; sentiment 57 | payrolls 3m, emp-pop, participation | U-6, sentiment, contd claims | curve inverted -0.06 | — | — | 7/7 lines; credit reads the 2024-10 quarter | backtest scores this month with the 2025-01 quarter (published later); gas re-deflated +3 stress pts |
| 2025-04 | **24** / RT **23** | STICKY — housing heaviest (47) | payrolls +217k/3m; U-3 4.2; CPI 2.3%; NFCI -0.39; sentiment 52 | payrolls 3m, participation | emp-pop, U-6, sentiment, contd claims | curve inverted -0.04 | — | — | 7/7 lines; credit reads the 2025-01 quarter | backtest scores this month with the 2025-04 quarter (published later); gas re-deflated +3 stress pts |
| 2025-05 | **24** / RT **23** | STICKY — housing heaviest (48) | payrolls +188k/3m; U-3 4.3; CPI 2.4%; NFCI -0.44; sentiment 52 | payrolls 3m, U-6 | emp-pop, participation, sentiment, contd claims | — | — | — | 7/7 lines; credit reads the 2025-01 quarter | backtest scores this month with the 2025-04 quarter (published later); gas re-deflated +3 stress pts |
| 2025-06 | **25** / RT **25** | STICKY — housing heaviest (48) | payrolls +101k/3m; U-3 4.1; CPI 2.7%; NFCI -0.49; sentiment 61 | emp-pop, participation, contd claims | payrolls 3m, U-6, sentiment | curve inverted -0.04 | — | — | 7/7 lines; credit reads the 2025-01 quarter | backtest scores this month with the 2025-04 quarter (published later); gas re-deflated +3 stress pts |
| 2025-07 | **23** / RT **23** | STICKY — housing heaviest (46) | payrolls +57k/3m; U-3 4.3; CPI 2.7%; NFCI -0.51; sentiment 62 | payrolls 3m, sentiment | emp-pop, participation, U-6, contd claims | curve inverted -0.02 | — | — | 7/7 lines; credit reads the 2025-04 quarter | backtest scores this month with the 2025-07 quarter (published later); gas re-deflated +3 stress pts |
| 2025-08 | **23** / RT **23** | STICKY — housing heaviest (45) | Payrolls turn negative m/m. payrolls -26k/3m; U-3 4.3; CPI 2.9%; NFCI -0.53; sentiment 58 | sentiment | payrolls 3m, emp-pop, participation, U-6, contd claims | curve inverted -0.04 | — | — | 7/7 lines; credit reads the 2025-04 quarter | backtest scores this month with the 2025-07 quarter (published later); gas re-deflated +2 stress pts |
| 2025-09 | **23** / RT **23** | STICKY — housing heaviest (42) | payrolls +70k/3m; U-3 4.4; CPI 3.0%; NFCI -0.53; sentiment 55 | payrolls 3m, emp-pop, participation, contd claims | U-6, sentiment | — | — | — | 7/7 lines; credit reads the 2025-04 quarter | backtest scores this month with the 2025-07 quarter (published later); gas re-deflated +2 stress pts |
| 2025-10 | — | *no score — CPI and CPS both absent for this month (2025 data lapse)* | Federal data lapse: October 2025 CPS was never collected | — | — | — | — | — | Nothing: the collector's all-series gate would have skipped the month | n/a |
| 2025-11 | **22** / RT **22** | STICKY — housing heaviest (40) | payrolls -23k/3m; U-3 4.5; CPI 2.7%; NFCI -0.51; sentiment 51 | emp-pop, participation, contd claims | payrolls 3m, U-6, sentiment | — | — | — | 7/7 lines; credit reads the 2025-07 quarter | backtest scores this month with the 2025-10 quarter (published later); gas re-deflated +2 stress pts |
| 2025-12 | **21** / RT **20** | SMOOTH — housing heaviest (40) *(published band: STICKY)* | payrolls -116k/3m; U-3 4.4; CPI 2.7%; NFCI -0.53; sentiment 53 | emp-pop, contd claims | payrolls 3m, participation, U-6, sentiment | — | — | — | 7/7 lines; credit reads the 2025-07 quarter | backtest scores this month with the 2025-10 quarter (published later); gas re-deflated +2 stress pts |
| 2026-01 | **19** / RT **19** | SMOOTH — housing heaviest (39) | CPS population controls cut measured employment and labour force by ~1.4M each on one day. payrolls +184k/3m; U-3 4.3; CPI 2.4%; NFCI -0.56; sentiment 56 | — | — | — | — | — | 7/7 lines; credit reads the 2025-10 quarter | backtest scores this month with the 2026-01 quarter (published later); gas re-deflated +2 stress pts |
| 2026-02 | **19** / RT **19** | SMOOTH — credit heaviest (38) | payrolls -13k/3m; U-3 4.4; CPI 2.4%; NFCI -0.54; sentiment 57 | U-6, sentiment, contd claims | payrolls 3m, emp-pop, participation | — | — | — | 7/7 lines; credit reads the 2025-10 quarter | backtest scores this month with the 2026-01 quarter (published later); gas re-deflated +2 stress pts |
| 2026-03 | **24** / RT **24** | STICKY — housing heaviest (40) | payrolls +218k/3m; U-3 4.3; CPI 3.3%; NFCI -0.47; sentiment 53 | emp-pop, participation | payrolls 3m, U-6, sentiment, contd claims | Flow horn: WTI | — | — | 7/7 lines; credit reads the 2025-10 quarter | backtest scores this month with the 2026-01 quarter (published later); gas re-deflated +1 stress pts |
| 2026-04 | **28** / RT **28** | STICKY — housing heaviest (42) | payrolls +206k/3m; U-3 4.3; CPI 3.8%; NFCI -0.48; sentiment 50 | emp-pop, participation, U-6, sentiment | payrolls 3m, contd claims | — | — | — | 7/7 lines; credit reads the 2026-01 quarter | backtest scores this month with the 2026-04 quarter (published later) |
| 2026-05 | **30** / RT **30** | STICKY — housing heaviest (43) | Gasoline peaks at $4.48 monthly mean; sentiment at an all-time series low. payrolls +425k/3m; U-3 4.3; CPI 4.2%; NFCI -0.51; sentiment 45 | emp-pop, participation, U-6, sentiment | payrolls 3m, contd claims | — | — | — | 7/7 lines; credit reads the 2026-01 quarter | backtest scores this month with the 2026-04 quarter (published later) |
| 2026-06 | **27** / RT **27** | STICKY — housing heaviest (44) | payrolls +231k/3m; U-3 4.2; CPI 3.5%; NFCI -0.51; sentiment 50 | emp-pop, participation, sentiment | payrolls 3m, U-6, contd claims | — | — | — | 7/7 lines; credit reads the 2026-01 quarter | backtest scores this month with the 2026-04 quarter (published later) |
| 2026-07 | **26** / RT **26** | STICKY — housing heaviest (44) | Unemployment falls to 4.1% on labour-force exit; participation 61.4%. payrolls +60k/3m; U-3 4.1; CPI 3.4%; NFCI -0.54 | payrolls 3m, U-6 | emp-pop, participation, contd claims | — | — | — | 7/7 lines; credit reads the 2026-01 quarter | backtest scores this month with the 2026-07 quarter (published later) |

---

## 4. Vintage-revision layer (where ALFRED reached)

§2 held every input at its current value and changed only *what existed* and *what had been released*. This section changes the values themselves, using the vintage in force on the 20th of month *M+1*. I fetched 697 individual ALFRED vintages for this: 283 UNRATE, 206 ICSA, 183 NFCI, and 25+25 sampled quarters of the two delinquency series.

### 4.1 Series that do not revise (verified, not assumed)

| series | test | result |
|---|---|---|
| **CPIAUCNS** | ALFRED vintage 2003-03-20 vs current FRED, all 14 months it covers (2001-12…2003-01) | **0 differences** — confirms the data-provenance audit's conclusion that NSA CPI is the correct choice |
| **DRCCLACBS** | 25 sampled vintages 2011–2026, latest-released quarter vs current | mean \|revision\| **0.019pp**, max 0.050pp; worst case **0.28 published points** |
| **DRSFRMACBS** | 25 sampled vintages 2011–2026 | mean \|revision\| **0.045pp**, max 0.270pp; worst case **0.28 published points** |

The two delinquency lines — 19.4% of the weight between the credit line and the housing delinquency arm — are effectively vintage-proof. Their real-time problem is entirely **release timing** (§2.2), not revision.

### 4.2 UNRATE — nearly vintage-proof

283 vintages, 280 usable score-month pairs, covering the entire published record:

| | |
|---|---|
| mean \|revision\| | **0.047pp** |
| max \|revision\| | **0.2pp** |
| months never revised | **156 / 280** |
| largest | 2009-01 (7.6→7.8), 2009-02 (8.1→8.3), 2010-03 (9.7→9.9), 2010-10 (9.6→9.4), 2011-03 (8.8→9.0), 2011-10 (9.0→8.8) |

At the `unemployment` anchor's steepest live segment (~11.3 stress points per pp) a 0.2pp revision is ~2.3 stress points ≈ **0.8 published points**. This is a genuine positive result for the instrument.

### 4.3 ICSA — the fast arm is the vintage-sensitive one

206 vintages, 2009-06 onward (ALFRED has none earlier):

| | |
|---|---|
| mean \|revision\| to the trailing 4-week mean | **2.18%** |
| max | **17.2%** |
| claims-arm stress effect | mean \|Δ\| 1.12 pts, max **7.43 pts** |

Combined with UNRATE into the actual `max(...)` employment line, over 203 comparable months:

| | |
|---|---|
| mean \|Δ employment stress\| | 0.92 pts |
| max | 7.43 pts (2021-07) |
| months moving ≥2 stress points | 20 / 203 |
| **months where the binding arm differs between vintages** | **20 / 203** |
| published-score impact | mean 0.32 pts, max **2.55 pts** |

So one month in ten, the site's own account of *which* arm is talking — "unemployment level" versus "claims spike" — would have been different at the time. **And for 2003–2008, including the entire GFC, this is unmeasurable: ALFRED's ICSA vintage history does not go back that far.**

### 4.4 NFCI — revises nine times its declared tolerance, and always in the same direction

183 vintages, 2011-05 onward (there are none earlier because the series did not exist):

| | |
|---|---|
| mean \|revision\| to the monthly mean | **0.1362** index units |
| median | 0.1255 |
| max | 0.366 |
| **months exceeding the declared 0.02 "expected model churn"** | **149 / 183 (81%)** |
| direction | **162 revised down, 20 up** |
| financial-line stress effect | mean \|Δ\| 3.56 pts, max **22.05 pts** (2020-03) |
| published-score impact | mean 0.15 pts, max 0.94 pts |

Two things follow.

**(a) A published methodology claim is wrong.** `research/backtest-results.json` `methodology.financial.revisionTolerance` and the matching literals at `scripts/collect.js:222` / `scripts/backtest.js:199` state *"Absolute monthly-mean change up to 0.02 is expected model churn."* Measured against the first vintage, **81% of months exceed it and the mean is 6.8× it.** The 0.02 figure describes week-to-week churn between adjacent vintages, not the revision a published historical month actually undergoes. It should not be used to reassure anyone about the archive.

**(b) The revision has a sign.** 162 of 182 revisions are downward — the Chicago Fed's first print is systematically *tighter* than the settled value. A live financial line therefore reads more stressed than the archive will later say it was. At 3% weight the jar barely notices (mean 0.15 published points, max 0.94). **The Flow does notice**, because it is z-scored and weight-free: `FINANCIAL_CONDITIONS_ANCHORS` has a slope of 60 stress points per NFCI unit, so a 0.136 mean revision is ~8 stress points on the line and moves the z-score that decides whether a horn sounds. This quantifies the forward-signal audit's point that the Flow's weight-free design removes exactly the revision insulation the 3% weight provides.

### 4.5 What the vintage layer could not reach

| series | why | consequence |
|---|---|---|
| ICSA before 2009-06 | ALFRED vintage history starts ~2009 | GFC claims-arm revisions unmeasurable |
| DRCCLACBS / DRSFRMACBS before 2011 | ALFRED starts ~2011 | GFC delinquency revisions unmeasurable (but §4.1 suggests they are small) |
| GASREGW before 2010, MORTGAGE30US before 2011 | ALFRED starts then | assumed unrevised; unverified for the GFC |
| NY Fed auto 30+ | not on FRED/ALFRED at all | no vintage record exists in any form |
| PAYEMS | not fetched (rate-limit budget spent on the seven weighted inputs) | C1/C1n/C3 tested on revised payrolls only |

**Net effect of the vintage layer, for the months where it can be applied (2011-05 onward):** employment ±0.32 published points on average, financial ±0.15, credit and housing ≈0. **The vintage layer is an order of magnitude smaller than the timing layer.** OOZEMeter's real-time problem is not that the data changed underneath it. It is that the archive is scored with data the operator did not have.

---

## 5. Rule testing: contradiction rules and forward signals

### 5.1 Pre-registered outcomes and their base rates

"Genuine household deterioration" must be defined before any rule is scored, and it must not be the jar (the jar is an input to two of the tested rules). Four outcomes, evaluated over months *t+1…t+12*, on 271 months 2003-01…2025-07:

| outcome | definition | base rate |
|---|---|---|
| **NBER** | any `USREC == 1` month | **15.5%** (42/271) |
| **U+0.5** | `UNRATE` rises ≥0.5pp above its level at *t* | **19.6%** (53/271) |
| **INC** | `A229RX0` (real disposable income per capita) YoY ≤ −1.0% | 33.2% (90/271) |
| **CARD** | `DRCCLACBS` rises ≥0.5pp | 17.7% (48/271) |
| *JAR+5* | published jar rises ≥5 (circular; reference only) | 32.1% (87/271) |
| *JAR+3 in 6m* | the Flow doc's own confirmation test | 31.7% (86/271) — matches the doc's 33% |

**INC is contaminated** by the 2021–22 transfer base effects (real DPI/capita prints −21.8% YoY in 2022-03 purely as the mirror of +30.5% in 2021-03) and should not be read as an income-shock detector on its own. NBER and U+0.5 are the load-bearing outcomes below.

### 5.2 Contradiction rules

Episode = consecutive firing months merged; scored at the episode start month.

| rule | fires | episodes | fire rate | NBER (episodes) | U+0.5 | JAR+5 | p(NBER) |
|---|---|---|---|---|---|---|---|
| C1 payrolls ≤−136k/3m **and** U-3 ≤−0.2pp/3m | **0** | 0 | 0.0% | — | — | — | — |
| C1n naive: 1-month payrolls <0 **and** U-3 <0 | 10 | 9 | 3.7% | 3/9 | 4/9 | 4/9 | 0.152 |
| C2 U-3 ≤−0.2pp/3m **and** participation ≤−0.2pp/3m | 21 | 13 | 7.7% | **1/13** | 1/13 | 1/13 | 0.888 |
| C2p prime-age variant | 8 | 7 | 3.0% | **0/7** | 0/7 | 0/7 | 1.000 |
| C3 payrolls ≥+136k/3m **and** aggregate hours ≤−0.5%/3m | 2 | 2 | 0.7% | 0/2 | 1/2 | 1/2 | 1.000 |
| C4 claims ≥+10%/3m **and** U-3 ≤−0.2pp/3m | 2 | 2 | 0.7% | 0/2 | 0/2 | 0/2 | 1.000 |
| C5 headline disinflation, essentials ≥1pp hotter | 7 | 2 | 2.6% | 0/2 | 0/2 | 2/2 | 1.000 |
| C6 mortgage −0.25pp/3m **and** prices +1%/3m | **0** | 0 | 0.0% | — | — | — | — |
| C7 NFCI easing 6m **and** card delinquency +0.2pp/2q | 8 | 4 | 3.0% | 1/4 | 2/4 | 0/4 | 0.490 |
| C9 IPMAN +1% YoY **and** MANEMP −0.5% YoY | **49** | 7 | **18.1%** | 0/7 | 1/7 | 3/7 | 1.000 |
| **A1** OOZEMeter employment stress falls ≥2 while EMRATIO falls | 24 | 18 | 9.0% | 4/18 | 5/18 | 6/18 | 0.301 |

**Clean false alarms** — episodes where *no* outcome (NBER, U+0.5, INC or JAR+5) fired within 12 months:

| rule | clean false alarms | dates |
|---|---|---|
| C1n | 3/9 | 2003-07, 2010-01, 2010-06 |
| **C2** | **8/13** | 2003-09, 2010-06, 2011-01, 2011-12, 2014-06, 2015-08, 2017-12, 2018-09 |
| C2p | 5/7 | 2003-09, 2010-07, 2011-02, 2014-05, 2015-08 |
| C4 | 2/2 | 2006-05, 2013-12 |
| C7 | 2/4 | 2023-12, 2024-03 |
| C9 | 2/7 | 2003-09, 2010-01 |
| **A1** | **8/18** | 2003-07, 2010-07, 2015-03, 2015-09, 2016-11, 2017-12, 2018-09, 2023-10 |

Read against the brief's own bar — *"a rule that fires 40 times in 23 years is not a warning system"* — the verdict is:

- **C9 must not ship.** 49 firing months, 18.1% of the tested window, and **zero of its seven episodes preceded an NBER recession.** This is a stronger rejection than the contradiction-engine audit's (lift 0.69 over 1973–2026); on 2003–2026 the episode-level recession lift is exactly **0.00**.
- **C2 must not ship as a warning.** 21 firings, and the story it tells ("unemployment fell because people gave up") is contradicted: 1 of 13 episodes preceded a recession against a 15.5% base rate (lift 0.31), and the prime-age refinement makes it *worse* (0 of 7). This replicates the contradiction-engine audit's central negative finding on an independent window and an independent outcome set.
- **C1 and C6 as literally specified never fire in 23 years.** A rule that cannot fire is not a rule; a firing would mean the data broke.
- **C3, C4, C5, C7 have n ≤ 4 episodes.** Nothing can be concluded. Reporting a "lift" on two episodes is numerology.
- **A1 — the instrument-audit rule — fires 24 times (9.0%) with 8 clean false alarms.** It is the most defensible of the set *because it does not claim to forecast anything*: it says the employment line and the employed share of Americans disagreed this month. As a forecast it is worthless (lift 1.06). As a disclosure it is honest. Ship it only with grammar that never names a direction for the jar.

### 5.3 Forward signals

| signal | fires | episodes | fire rate | NBER (episodes) | clean false alarms | p(NBER) |
|---|---|---|---|---|---|---|
| T10Y3M inverted (<0) | 45 | 6 | 16.6% | 2/6 | 2/6 (2006-08, 2025-03) | 0.235 |
| T10Y3M < −0.5pp | 24 | 2 | 8.9% | 1/2 | 0/2 | 0.286 |
| **SLOOS C&I standards > +20** | 17 | 17 | **18.7%** | **6/17** | 1/17 (2023-10) | **0.037** |
| Sahm real-time ≥ 0.50 | 41 | 3 | 15.1% | 1/3 | 1/3 (2024-07) | 0.397 |
| Michigan sentiment 2σ below trailing 5y | 35 | 12 | 12.9% | 4/12 | 1/12 (2003-02) | 0.102 |
| NFCI monthly mean > 0 | 29 | 2 | 10.7% | 2/2 | 0/2 | 0.024 |
| **the jar itself ≥ 45** | **82** | 5 | **30.3%** | 1/5 | 3/5 (2003-02, 2006-05, 2006-07) | 0.569 |

The last row is the one the site actually publishes. **The published jar has sat at or above 45 in 82 of 271 months — 30% of the entire record — and three of its five excursion episodes were followed by nothing.** Under the real-time reconstruction that count falls to 60 months (21%), and the three false episodes (2003-02, 2006-05, 2006-07) drop below 45 entirely. The instrument's alarm rate is *improved* by removing the look-ahead.

`NFCI > 0` scores p = 0.024 but has only 2 episodes and is **coincident, not forward** (the forward-signal audit measured h = 0, r = 0.836). It is a thermometer inside the fire.

### 5.4 The Flow rule (weekly, W=4, LB=104, |z|≥3)

I reproduced `research/THE-FLOW-ARCHITECTURE-2026-08-12.md` exactly on NFCI: **24 horn weeks of 1,232 since 2003 (1.9%), five episodes, peak z 8.0 / 3.4 / 4.8 / 3.3 / 8.6 on the same dates.** Extending to four other instruments:

| instrument | horn weeks | rate | episodes | confirmed (NBER or U+0.5) | false | p |
|---|---|---|---|---|---|---|
| **NFCI** | 24/1232 | 1.9% | 5 | 4 | 1 (2018-02-16) | 0.003 |
| T10Y3M | 18/1233 | 1.5% | 8 | 6 | 2 (2011-08-19, 2022-06-03) | 0.000 |
| ICSA | 17/1232 | 1.4% | 10 | 3 | **7** | 0.193 |
| CCSA | 17/1231 | 1.4% | 7 | 3 | **4** | 0.080 |
| WTI | 21/1233 | 1.7% | 7 | 2 | **5** | 0.297 |

ICSA false horns: 2005-01-08, 2005-09-10 (Katrina), 2011-04-30, 2012-11-10 (Sandy), 2013-10-05 (shutdown), 2015-02-21, 2017-09-02. WTI false horns: 2014-10-24, 2015-04-17, 2016-03-11, 2020-05-15, 2026-03-06. **Claims and oil fire more often than NFCI and confirm less often than the base rate would predict for a coin.** The Flow doc's own caution about claims is correct and understated; WTI is worse.

**And now the vintage constraint, which is the point of this report.** The NFCI horn roster is not live-compatible:

| episode | horn date | NFCI available at the time? |
|---|---|---|
| subprime seizure | 2007-07-20 | **NO** — first NFCI vintage 2011-05-25, 3y 10m later |
| second credit leg | 2007-11-23 | **NO** |
| Lehman | 2008-09-19 | **NO** |
| Volmageddon | 2018-02-16 | yes |
| COVID | 2020-02-21 | yes |

> **The Flow's live-possible record is one confirmed and one false out of two episodes.** Everything the doc calls "five episodes, zero junk" is a property of a dataset published in 2011 and revised since — a point the forward-signal audit made about revisions, and which is stronger than that: it is not a revision question, the numbers did not exist.

The same constraint does **not** apply to T10Y3M, ICSA, CCSA or WTI, all of which were published in real time. On live-possible instruments only, the best forward record in the set is T10Y3M's 6-of-8 — and half of those firings are the curve *steepening* as the Fed eased, i.e. the fire brigade arriving, not the smoke alarm (2007-06-08, 2007-08-17, 2008-10-10, 2020-03-13 are all steepenings). That replicates the forward-signal audit's direction audit.

### 5.5 Do the rules survive first-vintage inputs?

Only the rules built from series I have vintages for can be tested. Result for **A1**, the rule this audit recommends shipping (OOZEMeter employment stress falls ≥2 over three months while the employment-population ratio falls), re-run on **first-vintage UNRATE and first-vintage ICSA** rather than today's revised values:

| basis | firing months | episodes | NBER | U+0.5 | clean false alarms |
|---|---|---|---|---|---|
| ex-post inputs | 24 | 18 | 4/18 | 5/18 | 8 |
| **first-vintage inputs** | **27** | **19** | **4/19** | **5/19** | **8** |

Aggregate behaviour is vintage-robust — same recession hit count, same false-alarm count, one extra episode. **Individual dates are not.** Two months fire ex-post but would not have fired at the time (**2015-03, 2023-10**) and five fire at the time but not ex-post (**2009-09, 2010-02, 2017-10, 2019-05, 2022-11**). Seven of 29 distinct firing months — roughly a quarter — depend on which vintage you ask. If the rule ever gets a published surface, the entry it writes is a claim about a specific month. That is an argument for phrasing it as a running disclosure rather than a dated event.

What could **not** be vintage-tested: C1/C1n/C3 (need PAYEMS vintages, not fetched), C7/C9/C5 (need NFCI/IPMAN/MANEMP/CPI-component vintages), and every forward signal except the NFCI Flow existence check above.

---

## 6. False positives and false negatives, stated plainly

### 6.1 False positives (the jar said "pressure" and nothing followed)

Episodes of published score ≥45, merged into runs:

| episode | months | published peak | real-time peak | reaches 45 in real time? | outcome within 12m |
|---|---|---|---|---|---|
| 2003-02…2003-03 | 2 | 47 | 43 | **no** | none |
| 2005-09 (Katrina) | 1 | 45 | **36** | **no** | none |
| 2006-05 | 1 | 47 | **38** | **no** | none |
| 2006-07 | 1 | 47 | **39** | **no** | none |
| 2007-06…2013-10 | **77** | 90 | 84 | yes | NBER recession, U+0.5pp |

**All four non-crisis false positives in the published archive disappear when the instrument is denied the look-ahead.** Katrina is the interesting case: the published 45 is what made it an alarm, and it is 36 at the time — a hurricane moved the pump price, but the gas line at the time read the *nominal* $2.90 (stress 33), not the $2.90-in-2026-dollars the archive scores (stress 82). Both the published-anchored adjustment (36) and the raw 5-line real-time basis (41) put it below the alarm level, so the conclusion is robust to which construct is used.

The remaining problem is the fifth row. **The published jar read SLIPPERY or worse continuously from June 2007 to October 2013 — 77 months.** Under the real-time reconstruction the run is 60 months (2007-11…2012-10). Either way this is an alarm with a six-year duty cycle. It is correct about the GFC and it is correct about the foreclosure tail, but a signal that is on for a quarter of the sample is not doing the work an alarm is supposed to do.

### 6.2 False negatives (the world deteriorated and the jar did not)

| episode | published | real-time | what was actually happening |
|---|---|---|---|
| **2020-03 / 2020-04** | 42 / 42 | 39 / **40 (STICKY)** | U-3 14.8%, payrolls −21.6M/3m, claims 4.66M. Real-time this is *below* the 2006 gasoline excursion's published reading. |
| **2021-12** | **10 (SMOOTH)** | 8 | CPI 7.0% YoY. This month is the calibration low anchor — the instrument's definition of "as calm as it gets" is the month inflation hit 7%. |
| **2022-06** | 19 | 17 | CPI 9.1%, gasoline $4.93, Michigan sentiment 50.0, real DPI/capita −5.1% YoY. |
| 2007-08 | 46 | **38 (STICKY)** | BNP Paribas; payroll 3m pace collapsed from +629k (Jan) to +21k. The only line that moved was the one that did not exist: NFCI went from −0.37 to +0.07, lifting the financial line from ~16 to ~44 stress. |
| 2025-08 → 2026-02 | 23 → 19 | 23 → 19 | payrolls turn negative m/m (2025-08, 2025-11, 2025-12, 2026-02); participation 62.3 → 62.0; sentiment 58 → 57. The jar **falls** 23 → 22 → 21 → 19 across the window, then climbs to 30 by May on gasoline alone. |

The COVID and 2021–22 false negatives are not new (model-science F-3, F-7); what is new is that **they get worse in real time**, because the real-time gas line is nominal and gasoline was cheap in 2020 and had not yet spiked in 2021.

### 6.3 What actually holds up

- **The arithmetic.** 282/282 exact.
- **`max(unemployment, claims)`.** In 2020-03 the claims arm carried the entire signal — employment stress 96 with U-3 still at 4.4. Without it, March 2020 would have read like a normal month. The design is sound; its known blind spot (no payrolls, no participation) is a separate defect.
- **CPIAUCNS.** Verified never revised: a 2003-03-20 ALFRED vintage matches current FRED on all 14 months it covers, exactly.
- **UNRATE is nearly vintage-proof.** Across **280 first-vintage/current pairs covering the whole record (2003-01…2026-07)**: mean absolute revision **0.047pp**, max **0.2pp**, and **156 of 280 months never revised at all**. The largest revisions cluster in 2009–2011 (±0.2pp), worth ~2.3 stress points ≈ 0.8 published points. **The employment line's slow arm is not a vintage risk.**
- **The recent record is real-time honest.** For 2023-01…2026-07 the published-vs-real-time wedge averages **+1.14 points** and is zero for the last twelve months, because the deflator base has caught up. Today's 26 is a number the instrument could have printed today.

---

## 7. Gaps — what this test could not answer

1. **Claims revisions before 2009 are unmeasurable.** ALFRED's ICSA vintage history starts ~2009, so for the GFC I cannot say whether the claims arm — which binds in 148 of 282 months — would have read differently at the time. Seasonal-factor re-estimation is annual and can move a 4-week mean by several percent.
2. **Delinquency revisions before 2011 are unmeasurable.** Same reason. The credit line is 19.4% of the weight and its 2007–2010 path is reconstructed from release *timing* only, not release *values*. (Independently verified: claims bind the employment line in 148 of 282 months, unemployment in 134; the housing delinquency arm binds in 174 of 282, the mortgage-rate arm in 108.) For 2011 onward the delinquency revisions were measured on a 25-month sample and are negligible (§4.1), which makes the pre-2011 gap less alarming but does not close it.
3. **MORTGAGE30US and GASREGW are assumed unrevised before 2010–2011.** Plausible (both are survey/administrative weekly series) but unverified from ALFRED.
4. **The NY Fed HHDC first-release date is bounded, not pinned.** The CCP was created in 2009 and publicly introduced in a November 2010 staff report; I use 2010-08 as the first release, which is *generous* to the instrument. If the true date is November 2010, the no-auto window extends three months. It does not change the 2011-04 conclusion, which NFCI binds.
5. **The 5-line comparison basis is a proxy.** It correlates 0.980 with the published 7-line series but a same-basis comparison is not the same as running the real instrument; the auto and financial lines could in principle have moved the wedge. They could not have moved it before 2011, because they did not exist.
6. **The pre-2003 6-line reconstruction is ex-post only** and uses `cardDelinq` anchors calibrated on a later regime. The 2001 and 1991 numbers are illustrative of anchor non-stationarity, not scores.
7. **No out-of-sample rule validation.** Every threshold in §5 was chosen after seeing the whole history (mostly by prior audits). A pre-2010 calibration / post-2010 evaluation split was not run and should be before anything ships.
8. **The 2025-10 hole.** One month of the published record does not exist and never will; the archive shows 282 months where the calendar has 283. Nothing in the pipeline labels this.
9. **PAYEMS first-print vintages were not fetched** (rate-limit budget went to the seven weighted inputs), so the C1n rule was tested on revised payrolls only. Prior work measured mean absolute revision of a 1-month change at 102.4k with 4.4% sign flips, which is large relative to the rule's own threshold.
10. **Seal-date convention differs slightly between layers.** The timing/existence layer uses seal = last day of month *M+1* (generous). The vintage layer fetches the ALFRED vintage in force on the **20th** of month *M+1* (slightly stricter, because ALFRED takes one vintage date per request). The difference is at most one weekly release and does not affect any conclusion, but the two layers are not byte-identical in their cut-off.
11. **The seal convention itself is generous.** The site actually seals earlier — 2026-07 was published by 2026-08-14. Under a 15th-of-M+1 seal the quarterly lag would bite harder in months where the FRB delinquency release lands on the 25th. That variant was not run.

*(One gap closed during the work: five context series taken from files already present in the working directory — `A229RX0`, `T10Y3M`, `DRTSCILM`, `CCSA`, `USREC` — were re-downloaded from FRED and verified byte-identical, so nothing here rests on an inherited file.)*

---

## 8. Recommendations, in priority order

1. **Pin the gas deflator to a fixed base month** (e.g. 2026-01) in `scripts/lib/methodology.js` and treat any change as a methodology version bump. This is the single highest-value fix in this report: it removes a +4.1-point average one-directional look-ahead, retires the great majority of the archive's 62 band disagreements, and eliminates **all four** non-crisis false positives in the record. It requires no new data, no new line, and no reweighting.
2. **Correct the NFCI revision-tolerance claim.** "Absolute monthly-mean change up to 0.02 is expected model churn" appears in `research/backtest-results.json`, `scripts/collect.js:222` and `scripts/backtest.js:199`. Measured first-vintage-to-current it is wrong by a factor of 6.8 and is exceeded in 81% of months. Either restate it as a week-to-week churn tolerance (which is what it actually is) or replace it with the measured figure.
3. **Publish the real-time equivalent alongside the archive score**, or at minimum surface the disclosure that already exists in the JSON (`realTimeCompatible: false`) at the point where a reader sees a historical number — `archive.html`, the `recon-ooze-*` articles, and the timeline in `lab.js`. Nothing in the current pipeline tells a reader that the 90 they see for June 2009 is 83 on the data that existed then, or that no score existed at all before April 2011.
4. **Stop citing the 2007 Flow horn as a track record.** It is not revision-uncertain; NFCI did not exist for another three years and ten months. Any surface presenting the five-episode roster should say that three of the five could not have been produced live.
5. **Do not ship C9, C2 or C2p as warnings.** C9 fires in 18% of months with an episode-level recession lift of exactly 0.00; C2's lift is 0.31 and the story it would tell readers is contradicted by its own forward record.
6. **Ship A1 (employment line vs employed share) as a disclosure, not a signal.** It fires 9% of months, has no forecasting value (NBER lift 1.06), is aggregate-robust to vintage, and is the only rule in the set that audits the instrument rather than the economy — which is exactly what the July-2026 reading needs. Its individual firing dates move under revision, so phrase it as a standing condition, never as a dated event.
7. **Label the 2025-10 gap** wherever the archive is rendered as continuous. The record has 282 months where the calendar has 283.

---

*All figures in this report are reproducible from `research/backtest-results.json`, current FRED CSVs, and 697 ALFRED vintage requests. No production file was modified.*
