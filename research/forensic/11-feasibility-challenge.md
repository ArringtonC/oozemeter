# 11 — Feasibility Challenge

**Role:** Data Auditor / Forward-Signal challenger / UX challenger / Engineering challenger
**Date:** 2026-08-14
**Scope:** adversarial re-test of `01-economic-sensor-audit`, `02-data-provenance`, `03-model-science`, `04-july-2026-forensic`, `05-forward-signal`, `06-contradiction-engine`, `07-ux`, `08-engineering`
**Constraint:** read-only. No production file was modified. Everything below was recomputed from `research/backtest-results.json`, `data/*.json`, git history, or freshly-fetched FRED CSVs on 2026-08-14.

---

## 0. Headline

The six upstream audits are unusually honest and unusually reproducible: I re-ran the load-bearing arithmetic and it lands, often to the third decimal. **Baseline reproduction: 282 of 282 published months recompute exactly** from `research/backtest-results.json` through the frozen `CALIBRATION_V3` — 0 mismatches. The deflator experiments in three separate audits, run with three different framings, all reproduce to within rounding.

But four things do not survive the challenge, and one of them is being used to justify a fix:

1. **The gas-deflator drift is real as a mechanism and has produced exactly zero published flips to date.** The 2026-08-14 revision entry (16 months) that `03-model-science` cites as evidence of deflator drift is *not* deflator drift — the CPI base moved −0.01% between the two collections, which flips 0 months. Verified by diffing `data/history.json` at `a5f640c` against `HEAD`.
2. **The one-year drift is 3× larger than `02-data-provenance` reported.** It measured `|Δ| ≥ 0.5` (39 months). That is a *sufficient* condition for a rounding flip, not a necessary one. The actual count of months that would print a different integer is **120 of 282 (42.6%)**.
3. **`05-forward-signal`'s UMCSENT claim is false.** 49.5 is the 4th-lowest reading in the window, not the lowest; 2026-05 printed 44.8. June was a *rebound*.
4. **No claim about early detection is supportable at any horizon**, because 33.95% of the weight has a weight-weighted information age of 90–181 days. Quantified in §2.

Plus one finding no audit made: **the published history has a hole at 2025-10** (282 months where 283 calendar months exist), disclosed only inside a single Ward M archive report and on no primary reader surface.

---

## 1. DATA AUDITOR — which claims rest on unreliable data

### 1.1 CORRECTION (MAJOR): the deflator has not yet moved the public record

`03-model-science` writes: *"data/revisions.json logs a 2026-08-14 entry with 16 months moved and no methodology change"* — offered as live evidence of the re-basing defect. `02-data-provenance` describes the same class: *"those flips land in data/revisions.json indistinguishably from real source revisions."*

The mechanism is real (`scripts/collect.js:98,113`, `scripts/backtest.js:92,113`). The attribution is wrong.

Measured, holding all other inputs fixed and rotating only `cpiNow`:

| deflator base | CPIAUCNS | Δ vs 2026-07 base | mean \|Δ score\| | max | months printing a different integer |
|---|---|---|---|---|---|
| 2026-06 | 333.952 | −0.01% | **0.001** | 0.002 | **0 / 282** |
| 2026-05 | 335.123 | −0.36% | 0.043 | 0.062 | 16 / 282 |
| 2026-04 | 333.020 | +0.27% | 0.032 | 0.046 | 14 / 282 |
| 2026-01 | 325.252 | +2.66% | 0.313 | 0.446 | 101 / 282 |
| 2025-07 | 323.048 | +3.36% | 0.395 | 0.559 | **120 / 282** |
| 2023-07 | 305.691 | +9.24% | 1.055 | 1.452 | 264 / 282 |
| 2021-07 | 273.003 | +22.3% | 2.354 | 3.135 | 282 / 282 |
| 2019-07 | 256.571 | +30.1% | 3.013 | 3.980 | 282 / 282 |

`data/history.json` was written at `a5f640c` (2026-08-01) and next at `ff27022` (2026-08-14). On 2026-08-01 the latest CPIAUCNS print was **2026-06 = 333.952**; on 2026-08-14 it was **2026-07 = 333.918**. That rotation flips **zero** months. The 16 months that actually changed —

```
2003-10 37→38  2004-05 35→36  2005-11 33→34  2006-05 46→47  2006-07 46→47
2007-05 42→43  2010-06 77→76  2010-12 67→66  2011-08 64→63  2012-03 56→55
2019-08 12→11  2025-07 24→23  2026-02 20→19  2026-04 27→28  2026-05 29→30
2026-06 26→27
```

— are **genuine source revisions** (the NY Fed Q2-2026 HHDC workbook restated the auto 30+ series back to 2003; GASREGW and UNRATE also revise). They diff exactly against `data/revisions.json[2]`. The sign pattern (9 up / 7 down, all \|Δ\|=1) is inconsistent with a one-directional deflator shift and consistent with an upstream restatement.

**Consequence for the fix queue:** pinning the deflator base is still correct — it contradicts the freeze doctrine at `scripts/lib/methodology.js:21-26` and will eventually bite — but it is **not urgent and must not be sold as a live incident**. At the observed rate (~0.03 published points per CPI print), the first deflator-caused rounding flip is roughly 3–4 months out, and the first month where deflator drift exceeds the size of a normal source revision is roughly a year out. Fix it in the next methodology bump, not as a hotfix.

**Consequence for `02-data-provenance`'s "indistinguishable" claim:** partially wrong. `scripts/integrity.js:49` *does* write `type`, `fromMethodologyVersion`, `toMethodologyVersion`, `summary` and `calibration` — the 2026-08-01 entry carries all five (`type: "methodology-recalibration"`, `2.0.0 → 3.0.0`, 180 months moved, 9 band-label flips). What is untyped is the *automatic* detector's output, which conflates source revisions and (eventually) deflator drift. The typed path exists and works; only one of three entry kinds is missing a discriminator.

### 1.2 CORRECTION (MODERATE): the one-year drift is 120 months, not 39

`02-data-provenance` reports *"39/282 months shifting >= 0.5 pt"* for a one-year base rotation. That number is correct as stated but is not the reader-facing quantity. `|Δ| ≥ 0.5` guarantees a rounding flip; smaller shifts flip whenever they straddle a boundary. The count of months that would **print a different integer** on a one-year base rotation is **120 / 282 = 42.6%**. Anyone sizing this defect from the 39 will under-size it by 3×.

### 1.3 REFUTED (MODERATE): UMCSENT is not at a record low, and it is two months behind the jar

`05-forward-signal`: *"FRED UMCSENT reads 49.5 as of 2026-06, the lowest of the whole 2003-2026 jar window."*

Fetched `UMCSENT` on 2026-08-14. The eight lowest readings inside the jar window:

```
2026-05  44.8   ← the actual minimum
2026-06  49.5   ← 4th
2026-04  49.8
2022-06  50.0
2025-11  51.0
2022-07  51.5
2025-04  52.2
2025-05  52.2
```

June was a **+4.7-point rebound** off May. The framing "sentiment at the 0th percentile of its entire published range" is false; the correct statement is "May 2026 set a window low of 44.8 and June recovered to 49.5, still the 4th-lowest month in 23 years."

Two further problems the audit did not note:

- **`UMCSENT` has no 2026-07 observation.** Its last print is 2026-06. The jar's headline month is 2026-07. So the external validator `03-model-science` uses for its CRITICAL "external validity inverted" finding is structurally one-to-two months behind the instrument it validates, and the 2026 correlation window excludes the current month.
- The `corr(jar, UMCSENT)` result itself **replicates exactly**: 2003-2009 **−0.892**, 2010-2019 **−0.907**, 2020-2026 **+0.219**, 2021-2026 **+0.230**, full window **−0.346** (n=281). `03-model-science`'s numbers are right to three decimals. The sign inversion is real; the "0th percentile" prop supporting the adjacent finding is not.

### 1.4 NEW (MAJOR): the published history has an undisclosed hole at 2025-10

`data/history.json` has **282 entries**. The span 2003-01 … 2026-07 is **283 calendar months**. The missing month is **2025-10**.

Root cause, verified against FRED on 2026-08-14: `UNRATE`, `UNEMPLOY`, `CE16OV`, `CLF16OV`, `CIVPART`, `EMRATIO` are all **null at 2025-10-01**, while `PAYEMS` carries 158,408. `scripts/collect.js:107` returns `null` from `stressesFor()` if any input is missing, so the month drops out of `complete` and never enters the archive. `research/backtest-results.json` agrees — no `2025-10` row.

The system handles this **correctly and honestly at the code level** (no interpolation, no forward-fill of UNRATE), and the one place it is disclosed is admirable: `recon-ward-2025-10` prints *"No household reading exists for October 2025 — the required BLS observations were never published — so the ward has nothing to be measured against this month. A missing month stays missing."*

But `grep` across `index.html`, `notes.html`, `what-is-ooze.html` returns **no mention of 2025-10, no mention of a gap, no mention of a missing month**. A reader looking at the 23-year chart on the homepage sees an unbroken line. The site's own verdict copy — *"Calmer than 6 of every 10 months since 2003"* — is computed over 282 months and silently excludes one.

This also means every "n months since 2003" statistic on the site (percentile verdicts, `{{peak:}}` tokens, the `179/282 = 63.5%` the UX audit verified) is computed on a denominator with a hole in it. The arithmetic is right; the disclosure is missing on every primary surface.

### 1.5 CONFIRMED — claims that survived, with exact reproduction

I re-derived these independently. All land:

| Claim | Source audit | My result | Verdict |
|---|---|---|---|
| Calibration low anchor is **2021-12**, raw 23.936323 == `rawCalm` | 03 | 23.936323 exact; that month CPI YoY **+7.04%**, inflation stress **66.909**, UMCSENT **70.6**, employment 10.33, credit 11.4, auto 5.0 | CONFIRMED exactly |
| High anchor **2009-06**, raw 80.320895 == `rawGfc` | 03 | exact | CONFIRMED |
| Contribution ledger understates marginals ~1.9× | 03 | sum contribs **26**, sum marginals **49.67**, ratio **1.911** (audit said 47 / 1.88 — slightly low) | CONFIRMED, magnitude corrected up |
| Four of seven lines cannot exit the band at stress 100 | 03 | employment→**55.6**, credit→**42.7**, housing→**41.0**, auto→**36.6**, inflation→**35.3**, gas→**31.4**, financial→**29.5** | CONFIRMED |
| Ward M energy gauge reads its floor at crisis extremes | 01 | 2008-11 WTI $57.3→**23**; 2008-12 $41.1→**11**; 2009-02 $39.1→**10**; 2020-04 $16.5→**10** | CONFIRMED exactly |
| Ward M rates gauge reads maximum calm at Lehman | 01 | 2007-03 −0.52pp→**70**; 2008-09 +2.54pp→**5**; 2008-12 +2.38pp→**6**; 2009-06 +3.54pp→**5** | CONFIRMED exactly |
| Ward M calibration duplicated and divergent | 08 | `collect-market.js:42 {1.4025,-7.0116}` vs `lib/market-backtest.js:3 {1.402462618842267,-7.011551886296619}` → **11 divergent raw values** on a 0.01 grid over [0,100]. Current published `raw:24` → both give 27. Not firing. | CONFIRMED exactly (11) |
| `feed.xml` publishing a raw token | 08 | `feed.xml:29` contains literal `{{s:2026-07}}`; `data/editorial.json` holds **6 occurrences**; `rss.js:32` uses `EDITORIAL?.rssSummary` unresolved while `:36` resolves titles/deks | CONFIRMED |
| `market-history.json` is a cross-vintage join | 02 | `generated: 2026-08-01T23:35:18.922Z` == `research/market-backtest.json` generated, while `data/history.json` was rewritten 2026-08-14. `collect.yml` runs `build-market-divergence.js` daily and `market-integrity.js` **bare** (vintage check needs `--require-current-evidence`, passed only by `market.yml`, which is `workflow_dispatch` only) | CONFIRMED exactly |
| D-10 hole: `recon-ward-*` unchecked | 02 | 23 recon articles = **11 `recon-ooze-` + 12 `recon-ward-`**; `narrative-check.js:126` filters `^recon-ooze-`; all 12 ward reports currently match `history.json` (0 mismatches) | CONFIRMED — hole open, not leaking |
| Credit line is a prime-borrower gauge | 01 | `DRCCLACBS` 2026-01 = **2.92** (GFC max 6.77, 2009-04). `DRCCLOBS` 2026-01 = **6.43**, its own **GFC-era peak was 5.61** (2008-10) and its all-time max **7.86** (2023-10). Small banks are 15% above their own crisis peak while the scored series sits at 43% of its own. | CONFIRMED, and stronger than stated |
| `lab.js:69` "APRs above 21%, the highest on record" | 01 | `TERMCBCCALLNS` 2026-05 = **20.94**; record **21.76** (2024-08). Both clauses false. | CONFIRMED |
| Real wages went negative | 04 | AHE (`CES0500000003`) / CPIAUCNS YoY: 2024-07 **+0.72%**, 2025-07 **+1.22%**, 2026-07 **−0.20%** | CONFIRMED (audit said −0.15% on CPIAUCSL) |
| July 2026 employment configuration | 04, 07 | PAYEMS 158,881→**158,858** (−23k); CE16OV 163,140→**162,177** (−963k y/y); CLF16OV 170,412→**169,094** (−1,318k y/y); CIVPART 62.2→**61.4**; EMRATIO 59.6→**58.9**; UNRATE 4.3→**4.1** | CONFIRMED exactly |
| Energy double-count | 01 | headline CPI YoY **3.36%**→stress 30.47; core `CPILFESL` YoY **2.47%**; gasoline CPI `CUSR0000SETB01` YoY **+24.64%** (audit said 26.72 — modest overstatement, likely NSA/SA or month alignment) | CONFIRMED, magnitude slightly overstated |
| Unused distress series exist on FRED | 01 | `TDSP` 2026-01 = **11.164** (GFC peak 15.846, 2007-10); `MDSP` = **5.876** (peak 8.952); `PSAVERT` 2026-06 = **2.7** | CONFIRMED |
| `lab.js:42` gas prose | 01, 02, 07, 08 | "Today's $3.42" vs live **$4.006**; "June 2008 … $4.11 … a record" — the $4.114 print is **2008-07-07 (July)**, and the all-time record is **$5.006 (2022-06-13)**. 2026 already peaked at **$4.500 (2026-05-11)**, above the 2008 nominal peak. | CONFIRMED, three errors in one sentence |

### 1.6 Seasonal-adjustment audit — no problem found, and the NSA choice is right

I re-tested `02-data-provenance`'s NOT-A-PROBLEM and agree. `CPIAUCNS` with same-month YoY (`methodology.js:224`) cancels the seasonal factor by construction, and NSA CPI is never revised while `CPIAUCSL` is re-seasonalised every year — so using NSA is not a compromise, it is the strictly better choice for an instrument that publishes a frozen archive. Cross-line SA/NSA mixing is not an arithmetic error because each line normalizes through its own anchor curve *before* any addition; there is no cross-series subtraction anywhere in `stressesFor()`. The only place NSA/SA touches the same expression is the gas deflator (`gas * cpiNow / cpi`), and both terms are NSA. **No finding.**

### 1.7 Wrong-vintage audit — the real one is structural, not accidental

Every historical month in this system uses **current-revised inputs**, correctly disclosed at `backtest.js:201-206`. That is fine for an archive. It is **not** fine as the basis for any of the timing claims made across four audits, and I want to state the consequence more bluntly than the gaps sections do:

- `lab.js:113` / `articles.js:297` — "the financial line made the score climb about a month earlier" — is hindsight arithmetic on a series (`NFCI`) whose earliest ALFRED vintage containing 2007 data is **2011-06-01**. `05-forward-signal` is right that this is an existence fact, not a revision caveat. The claim is currently on a public page.
- The 2007-08 financial stress reads **41.9** in `THE-FLOW-ARCHITECTURE-2026-08-12.md:280` and **43.8** in the backtest regenerated two days later. That is live drift inside a document being used to justify a new product surface.

---

## 2. FORWARD-SIGNAL CHALLENGER — publication lag, quantified

**Answer: no. Not one early-detection claim is supportable, and the reason is arithmetic, not statistical.**

### 2.1 Realized publication lag per series actually used

Measured from FRED CSVs fetched 2026-08-14 (last observation present today) against each series' reference-period end and known official release calendar.

| Line | Weight | Series | Cadence | Last obs (2026-08-14) | Ref-period end | Release lag | Notes |
|---|---|---|---|---|---|---|---|
| employment | 24.25 | `UNRATE` | monthly | 2026-07-01 | CPS ref week ~Jul 18 | **~7 d after month end** | BLS Employment Situation, ~Aug 7 |
| employment | 24.25 | `ICSA` | weekly | 2026-08-08 | 2026-08-08 | **5 d** | DOL, Thursday release |
| housing | 19.40 | `MORTGAGE30US` | weekly | 2026-08-13 | 2026-08-13 | **0–1 d** | Freddie Mac PMMS, same-day |
| housing (2nd arm) | — | `DRSFRMACBS` | quarterly | **2026-01-01** (Q1) | 2026-03-31 | **~55 d** | FRB Charge-Off & Delinquency |
| credit | 19.40 | `DRCCLACBS` | quarterly | **2026-01-01** (Q1) | 2026-03-31 | **~55 d** | same release; Q2 due ~2026-08-20 |
| auto | 14.55 | NY Fed HHDC `Page 13/AUTO` | quarterly | 2026-04-01 (Q2) | 2026-06-30 | **~36 d** | HHDC Q2 released ~Aug 5 |
| gas | 9.70 | `GASREGW` | weekly | 2026-08-10 | 2026-08-10 | **~1 d** | EIA Monday survey |
| inflation | 9.70 | `CPIAUCNS` | monthly | 2026-07-01 | 2026-07-31 | **~12 d** | BLS CPI, ~Aug 12 |
| financial | 3.00 | `NFCI` | weekly | 2026-08-07 | 2026-08-07 | **~5 d** | Chicago Fed, Wednesday |
| manufacturing (aux, 0) | 0 | `INDPRO` | monthly | **2026-06-01** | 2026-06-30 | ~15 d | July G.17 not yet out — **45 d stale today** |
| (aux, 0) | 0 | `AMTMNO` | monthly | 2026-06-01 | 2026-06-30 | **~35 d** | Census M3 Full Report |
| foreclosures (aux, 0) | 0 | `DRSFRMACBS` | quarterly | 2026-01-01 | 2026-03-31 | ~55 d | not a foreclosure series |

### 2.2 The number that kills every early-detection claim

Publication lag is the wrong metric. The right one is **information age**: days from the *midpoint of each input's reference window* to the seal date. For the July-2026 headline sealed 2026-08-14:

| Line | Weight | Reference window | Midpoint | Information age |
|---|---|---|---|---|
| employment | 24.25 | CPS week of Jul 12–18 | 2026-07-15 | **30 d** |
| housing | 19.40 | July `MORTGAGE30US` mean | 2026-07-16 | **29 d** |
| **credit** | **19.40** | **Q1 2026 (Jan–Mar)** | **2026-02-14** | **181 d** |
| **auto** | **14.55** | **Q2 2026 (Apr–Jun)** | **2026-05-16** | **90 d** |
| gas | 9.70 | July `GASREGW` mean | 2026-07-16 | **29 d** |
| inflation | 9.70 | July CPI level | 2026-07-16 | 29 d (but the *YoY change* spans a 12-month interval centered ~2026-01-15 → **211 d**) |
| financial | 3.00 | July `NFCI` mean | 2026-07-16 | **29 d** |

**Weight-weighted mean information age = 67.6 days.** **33.95% of the weight is 90–181 days old.**

Three consequences that no audit stated in these terms:

1. **An instrument whose heaviest quarterly line describes January–March cannot detect anything in July.** The 19.40-weight credit line is scoring a month it has no observation inside. `STALE_DAYS.quarterly = 250` (`collect.js:60`) reads `freshnessStatus: "current"` at 225 days and cannot distinguish "on schedule" from "two quarters behind its sibling" — auto is on Q2, credit is on Q1, and both pass.
2. **The fastest thing in the jar carries 3% of the weight.** `NFCI` has a 5-day lag and a 3.00 weight; its total achievable span is **5 published points** (`03-model-science` measured this; I confirmed 29.5 at stress 100 vs 25.7 base). The instrument's best-informed sensor is its least consequential.
3. **The forward-fill makes it worse than the table shows.** `collect.js:95-97` forward-fills the quarterly series across months, so credit and auto publish `delta: 0` in roughly two months out of three — confirmed in `data/latest.json` (both 0 this month). The movers panel (`collect.js:247`) therefore surfaces only gas, inflation and jobs. **33.95% of the weight is invisible in "what moved" by construction.**

### 2.3 Verdict on each early-detection claim

| Claim | Verdict |
|---|---|
| `05`: "every weighted line is coincident or lagging; jar lags recessions by 9 months" | **SUPPORTED and understated.** The lag table above gives the mechanism: two lines are structurally a quarter or two behind, so a 9-month peak lag is what the data *plumbing* implies before any economics. |
| `05`: "classic forward diagnostics have NEGATIVE forward correlation with the jar" | **SUPPORTED as a reason not to build OOZE WATCH on labour data.** I did not re-run the correlations; the design conclusion follows from §2.2 regardless. |
| `01` / site: "NFCI made the score climb about a month earlier" | **SHOULD BE PULLED.** Margin 0.79 points on a rounding boundary, against a series whose mean multi-year revision (0.172 NFCI units ≈ 10 stress points ≈ 0.44 jar points) is over half the margin — and whose 2007 back-history did not exist until 2011-06. This is a live public claim resting on data that could not have produced it. |
| `01`: "max(unemployment, claims) verified to lead by 10-27 stress points through 2007-08" | **CANNOT SUPPORT.** Hindsight arithmetic on current-vintage ICSA. Separately, `05` is right that the claims arm is currently mute: 4-week ICSA mean ≈ 199k sits on the anchor floor (`collect.js:39` `claimsK` starts at `[200,5]`), so `max()` is a no-op and claims must rise ~14% before the line moves one point. |
| `05`: T10Y3M is the only instrument with out-of-sample forward skill | **PLAUSIBLE but n=2 episodes** (24 of the 30 most-inverted months are 2023-24, 6 are 2006-07). Do not ship a watch row off two episodes. |
| `06`: the contradiction engine is a measurement audit, not a forecast | **This is the correct framing and the only one §2.2 permits.** An instrument 68 days behind cannot forecast; it *can* say "the thing I measure and the thing next to it disagree this month." |

---

## 3. UX CHALLENGER — would a non-economist parse the proposed output?

### 3.1 Confirmed UX findings (re-verified in source)

- `index.html:144` renders `PRESSURE SENSORS ×8`; `lab.js` defines **9** `INDICATORS` and `latest.json` carries **9** lines. First user-visible number on a first visit, in the sequence whose purpose is to establish the facility counts correctly. **CONFIRMED.**
- `index.html:196` sorts by `|delta|` then stress and slices 4. July deltas: gas −3, inflation −3, jobs −1, financial −1, housing/credit/auto **0**. Featured four = gas (4 oz), inflation (2), jobs (2), financial (**0**) = **8 of 26 ounces**. Housing (7), credit (6), auto (5) — 18 ounces — appear only in the Ledger below. One card shows a line contributing zero ounces. **CONFIRMED.**
- `grep EDITORIAL index.html` returns exactly `:185` (`.verdict`) and `:265` (`.articleSlug`). The generated "why it moved" paragraph is never rendered on the landing surface. **CONFIRMED.**
- `notes.html:38` publishes **one** household anchor point (`unemployment at 25% = 100`) plus the two calibration points, against 9 anchor tables / 60+ points in `collect.js:37-48`. `notes.html:68` publishes Ward M's **complete** breadth formula, all six anchor pairs, and a worked example ending *"Every number on the ward card reproduces from this paragraph."* The experimental wing is more reproducible on-site than the flagship. **CONFIRMED.**
- `personal.html:85` `if(!income)return 50` with a required `min="0"` field, producing a copyable `MY PERSONAL OOZE: 50/100 — SLIPPERY` from a divide-by-zero guard. **CONFIRMED.**

### 3.2 CHALLENGE: three proposed outputs a normal reader cannot parse

**(a) `06`'s four-state contradiction output — REJECT as specified.**
`SIGNALS AGREE / MIXED SIGNALS / MEANINGFUL CONFLICT / INSUFFICIENT EVIDENCE` asks a reader to hold four states, three of which are about *the instrument's confidence* and one of which is about *the economy*. `06` names this as its own open gap ("I have no evidence it lands") and is right to. Worse, `MEANINGFUL CONFLICT` will be read as a warning — the audit's own data says it must not be (C2 lift **0.36**; prime-age refinement lift **0.00**, 0 of 23 flags preceded a recession). A four-state widget whose scariest-sounding state is historically *reassuring* is a comprehension trap. **Ship at most two states**: "these two measures agree" / "these two measures disagree this month, here is which one the jar reads." Two states, one sentence, no colour.

**(b) `07`'s "What doesn't add up?" module — ACCEPT the concept, REJECT the 128-word budget.**
The concept is the single best product idea in the six audits and the only one that fixes the July-2026 failure without touching the frozen ruler. But 128 words of "zero-weight cross-checks" is four to six numbers a reader has never seen (`EMRATIO`, `CIVPART`, `HOUST`, `TOTALSA`), each needing a direction convention. The version that survives contact with a non-economist is **one sentence naming one disagreement**:

> *The unemployment rate fell this month. The share of Americans with a job also fell. The jar reads the first number and not the second.*

That is 30 words, needs no new vocabulary, states what the instrument measures and what it does not, and asserts nothing about the future. Everything past the first disagreement goes below a fold or into the indicator page.

**(c) `05`'s OOZE WATCH phrasing — REJECT, and `05` already rejected it correctly.**
*"These conditions could push the Ooze this direction if they persist"* is a forecast. Given §2.2 — a 68-day weight-weighted information age — the instrument cannot support directional language about itself at any horizon. `05`'s replacement rule (condition-descriptive grammar that never names the jar) is right and should be treated as binding.

**(d) `03`'s Model B "zero-weight diagnostics" — ACCEPT, with a hard cap.**
The pattern already exists and works (`collect.js:177-185`, `contributesToOoze:false`, AUX label at `index.html:212`). But the site already shows **nine** lines on a page whose promise is one number. Adding four more diagnostics takes it to thirteen, and `07`'s finding that the header dropdown (`lab.js:391-395`) already **strips the AUX label** from the two existing zero-weight lines means every new diagnostic inherits a surface that presents it as if it scores. **Cap at two new zero-weight lines, and fix `lab.js:391-395` first** — otherwise the disclosure mechanism the whole proposal rests on is already broken on every page of the site.

### 3.3 The parseability finding no audit made

The site's three most important numbers use three different denominators and the reader is told about none of them:

- the **headline** (26) is a calibrated score over 282 months;
- the **verdict** ("calmer than 6 of every 10 months since 2003") is a percentile over 282 months **with 2025-10 missing**;
- the **ounces** (7 for housing) are a *proportional split of the calibrated score*, not marginal effects — the seven ounces sum to 26 while the seven marginal effects sum to **49.67** (§1.5).

`what-is-ooze.html:87` renders ounces as `+N`, which invites exactly the marginal reading that is 1.9× wrong. A reader who does the natural thing — "if housing went away we'd drop 7" — is off by 5.2 points, one fifth of the entire headline. **This is a bigger comprehension defect than anything in the proposed new modules, and it is already shipping.** Relabel before building.

---

## 4. ENGINEERING CHALLENGER — is any of this maintainable here?

### 4.1 The real maintenance surface

Measured: **26 scripts / 4,785 lines** across `scripts/` and `scripts/lib/`, **17 HTML pages**, **31 test files**, **153 commits in the last 30 days** (≈5/day). Per `MEMORY.md`, three agents share this tree and there has already been one PII incident (2026-08-02) traced to broad `git add`.

That is not a small team with headroom. That is a high-velocity solo-plus-agents operation already carrying six known duplication classes.

### 4.2 CORRECTION: the CI test coverage is worse than `08` reported

`08` says 7 test files never run in CI, taking the union of `collect.yml` and `market.yml`. I confirm the 7 (`market-gauges`, `weekly-brief`, `weekly-deliver`, `weekly-edition`, `weekly-email-message`, `weekly-package`, `weekly-recipients`) — but the union is the wrong denominator.

**`.github/workflows/market.yml:4-6` is `workflow_dispatch: {}` only** — deliberately, behind a quote-rights gate. So on the daily cadence, only `collect.yml`'s **16 test files** run. **15 of 31 test files (48%) never execute unless a human clicks a button.** That includes 8 of the 11 Ward M contract tests protecting the calibration divergence in §1.5.

### 4.3 Proposals ranked by "does this add a failure mode worse than the problem it solves?"

| Proposal | Verdict | Reasoning |
|---|---|---|
| **Fix `rss.js:32` to call `resolve()`** | **SHIP TODAY.** 1 line. | A raw `{{s:2026-07}}` is in front of subscribers right now. Zero new failure modes. The guard already exists at `compile-reports.js:113-117`; the only work is applying it. |
| **Extend `narrative-check.js` to `feed.xml` + `data/editorial.json` + `lab.js` INDICATORS prose** | **SHIP THIS WEEK.** | This is the single highest-leverage engineering change in all six audits. It closes `feed.xml` (§1.5), the 3 stale `vs2008` numbers, and — critically — it is a *gate*, not a *rule*. `lab.js:232` currently asserts "prose never remembers unchecked numbers" as a comment while 3 of 9 indicators violate it. Risk: extending a gate to `lab.js` prose will surface many pre-existing failures at once and could red the build on day one. Mitigate by landing it in warn-mode for one cycle, then flipping to fail. |
| **Delete `collect-market.js:42`'s literal `CAL` and import `FROZEN_WARD_CALIBRATION`** | **SHIP.** 2 lines, removes a real divergence. | 11 divergent raw values confirmed. `market-integrity.js:72` recomputes from the calibration embedded in the payload it audits and is structurally incapable of catching this — so the only real fix is deletion of the duplicate, not another check. |
| **Route `market-integrity.js --require-current-evidence` into `collect.yml`** | **SHIP, but read the consequence first.** | `collect.yml` rebuilds `data/market-history.json` daily from a market backtest that only refreshes on `workflow_dispatch`. Turning the vintage assertion on in the daily cron will **fail the daily build every day** until someone runs `market.yml`. That is a *correct* failure — but it converts a silent data defect into a daily red build and a daily GitHub issue, and `collect.yml`'s alert step will open/comment an issue every run. **Better first move: stop rebuilding the divergence daily.** Move `build-market-divergence.js` out of `collect.yml` entirely. It is derived from a manual artifact; regenerating it on a schedule the market half does not share is the whole defect. One line removed beats one gate added. |
| **Pin the gas deflator base month** | **DEFER to the next methodology bump.** | Correct in principle, contradicts the freeze doctrine, and — per §1.1 — has moved the public record by **0.001 points and 0 rounding flips** in the observed 13-day window. Pinning it *now* would itself restate the archive and generate a revision entry, which is the exact harm being complained about. Bundle it with the next version bump where a restatement is already expected and typed. |
| **`06`'s contradiction engine (new `data/contradictions.json`, new rules, new UI state)** | **REJECT as scoped. ACCEPT one rule.** | The engine as specified adds: a new data artifact, a new collector path, ≥7 new FRED series, a new gate, a new UI state machine, and a new editorial voice register — into a repo where 48% of tests don't run on the daily cron and the same calibration constant already exists twice. `06`'s own numbers disqualify 4 of 9 rules (C9 base rate 18.4% with lift 0.69; naive C5 49.6%; C1 1-in-938; C6 1-in-470) and its best rule (C3, lift 2.07) fires 14 times in 748 months. **Ship exactly one thing: add `EMRATIO` as a zero-weight auxiliary line** using the pattern that already exists at `collect.js:177-185`. That is ~10 lines, one new FRED id in the `ids` array at `collect.js:80`, no new file, no new gate, no new workflow, and it powers §3.2(b)'s single sentence. Everything else is a research artifact, not a product. |
| **`06`'s note about `git add data/` picking up new files automatically** | **This is a hazard, not a convenience.** | `collect.yml`'s commit step is `git add data/market-history.json data/market-history.js data/ index.html feed.xml lab.js`. The bare `data/` means any new artifact is committed without a workflow edit — which is exactly the pattern `MEMORY.md` records as the 2026-08-02 PII incident. Do not rely on it. |
| **`05`'s OOZE WATCH panel (T10Y3M + SLOOS rows)** | **REJECT for now.** | T10Y3M's skill rests on **2 episodes**. SLOOS is quarterly with a ~44-day lag, so the row sits unchanged for three months at a time — a live-looking surface that is dead 11 weeks in 13. Adding two series to buy an out-of-sample r=0.31 on n=2, on a page that already can't render the paragraph it generates (§3.1), is negative expected value. |
| **`07`'s five-rung explanation ladder** | **ACCEPT rungs 1-2 only.** | Rendering the already-generated `EDITORIAL.story` on `index.html` is a ~3-line change against data that already exists and is already gated. Showing all seven weighted lines in the canister row instead of top-4-by-delta is a one-line sort change. Both are free. The Level-4 module needs the backtest `07` correctly says it could not run. |
| **`03`'s Model B / weight re-study** | **DO NOT REWEIGHT.** | `03` is right that equal weighting beats v3 on every metric it tested and equally right that the recession-AUC test is near-circular (18 of 20 in-window recession months are the GFC, which is also the calibration episode). Reweighting restates all 282 published months — the largest possible harm — on evidence from one credit cycle. The correct response to "the weights are not demonstrably earned" is to **say so on the methodology page**, not to change them. |

### 4.4 Two new failure modes I would flag before anything ships

1. **Every archive report hard-codes the revision count.** All **23** recon reports carry the literal `"3 source-revision events on the public record"`, and `data/revisions.json` currently has exactly 3 — so it is right today. The moment a fourth revision is detected, 23 reader-visible reports are wrong, and `narrative-check.js` checks **11** of them. This is the D-10 pattern for a *second* quantity, and no one has named it. `scripts/story.js:97` and `scripts/editorial-furniture.js:30` compute the number correctly at generation time; the archive freezes it.

2. **`stamp.js` will publish "Integrity gate: PASS · fails closed" for a gate that never ran.** `scripts/stamp.js:44` writes that string as a literal and consults no integrity result. `scripts/integrity.js:31-32` wraps `git show HEAD:data/history.json` in `try{}catch{}`; on failure `prevHistory`/`prevLatest` stay null, which no-ops the revision detector *and* disables the 30-point jump cap, and line 143 still prints `integrity gate: PASS`. Combined with `stamp.js:105`'s `if(missing>3) exit(1)` — three silently failed stampings still exit 0 — the publish path can emit a page asserting a passed gate, with up to three stale markers, on a run where the gate was skipped. Ordering in `collect.yml` makes this safe *today*; nothing enforces the ordering.

---

## 5. What I would actually do this week

1. `rss.js:32` — resolve the token. **1 line.**
2. Remove `build-market-divergence.js` from `collect.yml`. **1 line.** Stops the daily cross-vintage republish at the source.
3. `collect-market.js:42` — import `FROZEN_WARD_CALIBRATION`, delete the literal. **2 lines.**
4. Extend `narrative-check.js` to `feed.xml`, `data/editorial.json`, and `lab.js` `INDICATORS`; land in warn-mode, flip to fail after one clean cycle.
5. Fix the three stale `vs2008` numbers and the two reversed trend clauses in `lab.js`, and the `×8` in `index.html:144`.
6. Add `EMRATIO` as a zero-weight auxiliary line and render one sentence naming the disagreement. Fix `lab.js:391-395` to carry the AUX label first.
7. Relabel ounces so a reader does not read them as marginal effects (they are 1.9× low).
8. Disclose the 2025-10 hole on `notes.html` and wherever the "n months since 2003" denominator appears.

Nothing on that list adds a scheduled job, a data artifact, a workflow, or a series with a lag longer than a week. Everything on it removes a way the site can currently print a false number.

---

## Appendix — reproduction

All figures recomputed 2026-08-14 from:
- `research/backtest-results.json` (generated `2026-08-14T04:10:26.364Z`), `data/latest.json`, `data/history.json`, `data/revisions.json`, `data/reconstruction-reports.js`, `data/market.json`, `data/market-history.json`, `research/market-backtest.json`
- `git show a5f640c:data/history.json` for the 2026-08-01 vintage
- FRED CSV (`https://fred.stlouisfed.org/graph/fredgraph.csv?id=…`): `UNRATE ICSA CCSA CPIAUCNS CPILFESL CUSR0000SETB01 MORTGAGE30US DRSFRMACBS DRCCLACBS DRCCLOBS GASREGW NFCI INDPRO AMTMNO PAYEMS CIVPART EMRATIO CE16OV CLF16OV T10Y3M DCOILWTICO UMCSENT TERMCBCCALLNS TDSP MDSP PSAVERT CES0500000003`
- Baseline check: 282 / 282 published months reproduce exactly through `CALIBRATION_V3` — 0 mismatches. Every counterfactual below is measured against that baseline.
