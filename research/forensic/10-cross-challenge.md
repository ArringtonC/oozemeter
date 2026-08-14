# Cross-Challenge: Economic Investigator ⇄ Model Scientist

**Date:** 2026-08-14 · **Scope:** `01-economic-sensor-audit` (A) vs `03-model-science` (B),
with `04-july-2026-forensic` and `05-forward-signal` used as adjudicating witnesses.
**Constraint:** read-only. No production code was modified. Every number below was
re-derived from `research/backtest-results.json`, FRED CSV, or ALFRED vintage CSV.

---

## 0. Verdict

Both auditors are unusually accurate. I re-ran **31 of their quantitative claims** and
**28 reproduced to three decimals or exactly**. This is not a case of one auditor being
wrong; it is a case of two auditors measuring **different quantities and reporting them
in the same units**, which produced four apparent contradictions that are not
contradictions, and one genuine, consequential error on each side.

The one error that matters on each side:

- **B (Model Scientist) shipped a false negative that killed the single best fix in the
  audit.** B rejected a purchasing-power line because real hourly-wage growth correlates
  only **+0.068** with sentiment as a standalone series (I reproduce +0.068 exactly).
  That is the wrong test. Added as a *component* at weight 19.4 and recalibrated to
  OOZEMeter's own doctrine, a real-wage line flips post-2020 `corr(jar, UMCSENT)` from
  **+0.219 → −0.034**, flips `corr(jar, real DPI/capita YoY)` from **+0.535 → −0.171**,
  raises 2022-06 from **19 → 37**, and moves the calm anchor off 2021-12. **One line fixes
  three of B's four CRITICAL findings.** B tested the ingredient, not the recipe.

- **A (Economic Investigator) overstated its two headline magnitudes by 3.6× and 2.4×,
  and built one finding on a population-control artifact.** The credit-series swap is
  +13.07 jar points on the frozen ruler but **+3.6** under OOZEMeter's own recalibration
  doctrine. The employment counterfactual is +5.41 jar points on raw data but **+2.29**
  once the January-2026 CPS reweighting is removed — and the −963k/−1,318k figures A cited
  as evidence are **148%** and **108%** artifact (ex-reweighting both series *rose*).

The deepest joint finding, which neither auditor reached alone, is in §5.

---

## 1. Reproduction ledger

Everything I could check, checked. `✔` = reproduced exactly or to ±0.005.

| Claim | Source | Their number | Mine | |
|---|---|---|---|---|
| calm anchor = 2021-12, raw 23.936322767604793 | B/F1 | 23.936323 | 23.93632276760479 | ✔ |
| GFC anchor = 2009-06, raw = rawGfc | B/F1 | 80.320895 | 80.32089462877845 | ✔ |
| all 282 published months recompute from stored stresses | — | — | 0 mismatches | ✔ |
| corr(jar,UMCSENT) 2003-09 / 2010-19 / 2020-26 / 2021-26 | B/F2 | −.892/−.907/+.219/+.230 | identical | ✔ |
| corr(jar, A229RX0 YoY) pre-2020 / 2021-26 | B/F2 | −.480 / +.528 | −.480 / +.528 | ✔ |
| A229RX0 YoY 2022-06 = −5.13% vs 2009-06 = −1.71% | B/F3 | −5.13 / −1.71 | −5.13 / −1.71 | ✔ |
| 2008-10→11→12 jar = 79 → 75 → 77 | B/F5 | 79/75/77 | 79/75/77 | ✔ |
| gas stress 2008-06 → 2008-12 = 9.6 jar pts removed | B/F5 | 9.6 | 9.62 | ✔ |
| r(credit,auto) full / since-2021 | B/F6 | .863 / .987 | .863 / .987 | ✔ |
| r(gas,inflation) since 2021 | B/F6 | .802 | .802 | ✔ |
| COVID peak 42 vs 2006 peak 47 | B/F7 | 42 / 47 | 42 / 47 | ✔ |
| single-line-to-100 → 56/43/41/37/31/35/30 | B/F8 | all seven | 55.6/42.7/41.0/36.6/31.4/35.3/29.5 | ✔ |
| deflator base 2019-07 / 2021-07 / 2023-07 drift | B/F9 | 3.01 / 2.35 / 1.06 | 3.013 / 2.354 / 1.055 | ✔ |
| inflation variance share full / 2021-26 | B/F17 | 0.7% / −38.2% | +0.7% / −38.2% | ✔ |
| gas variance share 2007-2010 | B/F5 | −5.4% | −5.4% | ✔ |
| equal-weight corr −0.45 all / −0.29 post-2020 | B/F12 | −.45/−.29 | −.449/−.289 | ✔ |
| corr(real AHE growth, UMCSENT) = +0.068 | B/gap | +0.068 | +0.068 (n=281) | ✔ |
| DRCCLACBS 2.92 → 38.4; DRCCLOBS 6.43 → 85.9 | A/F1 | 38 / 85.9 | 38.4 / 85.9 | ✔ |
| 2006-Q1 small 3.15 vs all 3.86; 2023-Q4 7.86 vs 3.10 | A/F1 | as stated | identical | ✔ |
| CPI +2%/+3%/+10% flip 64 / 89 / 262 months | A/F3 | 64/89/262 | 64/89/262 | ✔ |
| Sep-2005 gas stress 74.8 (Jul-24 base) vs 81.9 (Jul-26) | A/F3 | 74.8 / 81.9 | 74.8 / 81.9 | ✔ |
| housing rate branch binding since 2022-04 | A/F6, B/F13 | — | confirmed | ✔ |
| gas floors: min 19.9 / med 54.0 / mean 57.2 | A/F19 | 19.9/54.0/57.2 | 19.9/54.1/57.2 | ✔ |
| housing floors: min 24.9 / med 47.6 / mean 55.9 | A/F19 | identical | identical | ✔ |
| raw composite floor 23.936, b = −23.965 | A/F19 | 23.936 | 23.936 / −23.965 | ✔ |
| claims per labor force 27.1/20.6/13.8/12.0 bp | A/F16 | identical | identical | ✔ |
| employment/credit/auto/housing/financial/jar vs USREC peak h | Fwd/F1 | −10/−9/−6/−13/0/−9 | identical, r to 3dp | ✔ |
| CE16OV Jan-26 first print 164,520 → 163,097 | Jul/F1 | −1,423k | −1,423k (ALFRED) | ✔ |
| CLF16OV Jan-26 171,882 → 170,465 | Jul/F1 | −1,417k | −1,417k (ALFRED) | ✔ |
| inflation energy decomposition ≈13.4 stress / 1.9 jar pts | A/F9 | 13.4 / 1.9 | 13.5 / 1.85 | ~✔ (see MD-6) |
| contribution ledger understates by ~1.9× | B/F4 | 1.88× | **1.910× / 1.932×** | ✘ (see MD-7) |
| A: "+3% restates 89 months **by ≥1 point**" | A/F3 | 89 ≥1pt | **0 months ≥1pt** | ✘ (see MD-1) |

**Method note / correction to `04-july-forensic`:** that report states the ALFRED
`vintage_date` graph endpoint returns HTTP 404 and that only the POST form works. The
opposite is true in this environment. `https://alfred.stlouisfed.org/graph/alfredgraph.csv?id=CE16OV&vintage_date=2026-02-11`
returns clean CSV (HTTP 200); the POST form at `/series/downloaddata?seid=…` returns an
HTML page, not a zip. All vintage work below used the graph endpoint.

---

## 2. MAJOR DISAGREEMENTS

### MD-1 — Gas deflator: "89 months restated by ≥1 point" vs "0.35 points per year"

**A claims** (F3, CRITICAL): "moving only CPI +2% restates 64/282 months by ≥1pt, +3%
restates 89/282, +10% restates 262/282."
**B claims** (F9, MAJOR): 2019-07 base shifts every month by mean 3.01 pts; ≈0.35
published points per year of one-directional drift.

**Data.** I inverted each month's published gas stress through the `gasReal` anchor curve
to recover its real gas price (no clamping anywhere: gas stress range 19.9–96.9), rescaled
the deflator, and recomputed with the **frozen** `CALIBRATION_V3` (confirmed: `backtest.js:126`
publishes the frozen pair unless `OOZEMETER_RECALIBRATE=1`, so drift is *not* absorbed).

| perturbation | mean \|Δ exact\| | max | months whose **integer** flips | months moving **≥1.0 pt** |
|---|---|---|---|---|
| CPI +2% | 0.236 | 0.337 | **64** | **0** |
| CPI +3% | 0.352 | 0.500 | **89** | **0** |
| CPI +10% | 1.121 | 1.563 | **262** | 205 |
| base 2025-07 (1 yr) | 0.395 | 0.559 | 120 | 0 |
| base 2019-07 (7 yr) | 3.013 | 3.980 | 282 | 282 |

**Who is right.** Both counts are literally correct and neither auditor is lying — but
**A's phrasing is materially misleading and B's is honest.** At +3% CPI, 89 months do
change their published integer, and *zero* of them move by as much as one point; the
largest actual perturbation is 0.500. A conflated *a rounding-boundary crossing* with *a
one-point restatement*. The true instrument sensitivity is B's **0.35 published points per
year of CPI**, and B's 7-year figures reproduce to three decimals.

A is nonetheless right about the thing that matters operationally: 120 integer flips per
year of base rotation is exactly what pollutes `data/revisions.json`, which the site then
narrates to readers as "source-revision events." The defect is real; the magnitude claim
should be restated as **"0.35 points/yr, which flips ~120 published integers per year of
base rotation"** — not "restates 89 months by ≥1 point."

---

### MD-2 — The −963k household-employment decline: evidence or artifact?

**A claims** (F15, MODERATE): the employment line eased "in a year household-survey
employment fell 963k," citing `CE16OV −963k`, `CLF16OV −1,318k`, `CIVPART 62.2 → 61.4`,
and a participation-held-constant counterfactual of **U-3 5.28% (≈5 jar points)**.
**`04-july-forensic` claims** (F1, CRITICAL): 93% / 78% of those declines are the
January-2026 CPS population control; ex-seam the series are **+460k** and **+99k**.

**Data — ALFRED vintages, fetched and verified independently:**

| series | vintage 2026-02-11 | vintage 2026-03-06 | Δ |
|---|---|---|---|
| CE16OV 2025-12 | 163,992 | 163,992 | 0 |
| CE16OV **2026-01** | **164,520** | **163,097** | **−1,423k** |
| CLF16OV 2025-12 | 171,495 | 171,495 | 0 |
| CLF16OV **2026-01** | **171,882** | **170,465** | **−1,417k** |
| CIVPART 2026-01 | 62.5 | 62.1 | −0.4pp |
| EMRATIO 2026-01 | 59.8 | 59.4 | −0.4pp |

December is byte-identical in both vintages; the entire revision is a level discontinuity
at the seam. Decomposition of A's twelve-month figures:

- `CE16OV`: raw −963k, reweighting −1,423k, **ex-seam +460k** → artifact is **148%** of the decline.
- `CLF16OV`: raw −1,318k, reweighting −1,417k, **ex-seam +99k** → artifact is **108%**.

**Both series rose over the year once the reweighting is removed.**

Counterfactual re-run (CNP16OV 2026-07 = 275,282; CE16OV = 162,177):

| counterfactual | U-3 | employment stress | jar | Δ jar |
|---|---|---|---|---|
| published | 4.10% | 13.0 | 25.71 | — |
| **A's**: hold CIVPART at Jul-25 62.2 | **5.28%** | 28.7 | 31.12 | **+5.41** |
| seam-adjusted: 62.2 − 0.4 reweight = 61.8 | **4.67%** | 19.7 | 28.00 | **+2.29** |

**Who is right.** `04-july-forensic` is right; **A's evidence is invalid and A's magnitude
is 2.4× too large.** A's counterfactual arithmetic reproduces exactly (5.28% ✔) — the
inputs were contaminated, not the algebra.

Two mitigations for A, which I record because a cross-challenge that only scores points is
useless: (1) A explicitly labelled the counterfactual **"an UPPER BOUND, not an estimate,"**
flagged that prime-age LFPR is flat and the entire drop sits in 55+, and cited CCSA −8.0%
as arguing against deterioration. **A's verdict is correct; only A's evidence is
contaminated.** (2) `04-july-forensic`'s own "93% / 78%" framing *understates* its case —
those are the Dec→Jan *observed* seam-month shares, which net the real January gain
(+528k) against the reweighting. The clean statement is 148% / 108%, which the same report
also supplies as "+460k / +99k."

---

### MD-3 — Is `max(unemployment, claims)` a success to preserve or the line to delete?

**A claims:** "the max(unemployment, claims) design (verified to lead by 10-27 stress
points through 2007-08)" is one of "three things that genuinely hold up and should not be
rebuilt."
**B / `05-forward-signal` claim:** the employment line peaks at **h = −10** against USREC
(it lags recessions by 10 months), and **dropping employment is the largest single
improvement to post-2020 validity** (post-2020 corr −0.523 vs +0.217).

**Data.** Both reproduce, exactly.

Claims arm vs unemployment arm, 2007-01 → 2008-12 (n=24):

| month | UNRATE | u-arm | claims 4wk | c-arm | binding | gap |
|---|---|---|---|---|---|---|
| 2007-01 | 4.6 | 19.7 | 317.2k | 35.2 | CLAIMS | +15.5 |
| 2007-10 | 4.7 | 21.0 | 328.2k | 38.5 | CLAIMS | +17.5 |
| 2008-04 | 5.0 | 25.0 | 359.5k | 47.9 | CLAIMS | +22.9 |
| 2008-07 | 5.8 | 35.7 | 398.0k | 59.4 | CLAIMS | +23.7 |

Claims arm binding **24/24 months**, gap range **+13.0 to +26.7**, mean **+19.3** stress
points = **6.64 jar points**. A's "10–27" is right.

Cross-correlation vs USREC (h < 0 ⇒ recession months come first ⇒ the line lags):
employment **h=−10 r=0.430**, credit h=−9 r=0.517, auto h=−6 r=0.530, housing h=−13
r=0.372, financial h=0 r=0.836, jar h=−9 r=0.576. Every figure matches `05-forward-signal`.

**Who is right. Both, about different things — and A contradicts itself.** A measured
*intra-line arm dominance*; B measured *line-vs-NBER phase*. The max() genuinely buys 19
stress points (6.6 jar points) of intra-line lead, and the line still lags NBER by 10
months, because 6.6 points on a 10→90 crisis scale does not change a cycle phase.

The self-contradiction: A's own F16 says the claims arm is "pinned at the anchor floor, so
max(unemployment, claims) is **currently a no-op**" — which I confirm (claims 4wk 203,250
→ stress 5.8; UNRATE 4.1 → stress 13.0; claims must rise **14% to 232k** to bind again).
A cannot list a design as "genuinely holds up, should not be rebuilt" and separately
document it as currently inert without reconciling the two.

**Neither auditor reported the decade structure, which changes the recommendation:**

| era | months the claims arm was binding |
|---|---|
| 2003–2009 | **80/84 (95%)** |
| 2010–2019 | 21/120 (18%) |
| 2020–2026 | **47/78 (60%)** |

The claims arm has **not** monotonically decayed — it revived after 2020. A's "silently
decayed as a screen" is a 2010s statement, not a secular one. The correct read is that the
arm is *state-dependent*: it dominates in fast-moving labour markets and goes mute in slow
ones, which is what a `max()` is supposed to do. Do not delete it; do disclose that it is
currently inert.

---

### MD-4 — The credit swap: +13 jar points or +3.6?

**A claims** (F1, CRITICAL): DRCCLACBS 2.92% → stress 38.4, while DRCCLOBS (small banks)
6.43% → stress 85.9 on OOZEMeter's own anchors. "The jar cannot see the bottom half of the
credit distribution."
**B claims** (F8, MAJOR): driving credit to stress 100 only moves the jar 26 → 43;
"four of seven lines cannot move the score out of its current band."

**Data.**

On the **frozen** ruler (what A computed), the swap is the largest single lever in the
entire instrument:

```
2026-07 baseline (exact)                  25.71
  credit = DRCCLACBS 2.92 → stress 38.4   25.71   (Δ  0.00)
  credit = DRCCLOBS  6.43 → stress 85.9   38.78   (Δ +13.07)
```

+13.07 exceeds the **entire achievable span at maximum stress** of gas (+5.74), financial
(+3.81), inflation (+9.57) and auto (+10.86). A's mechanism is not merely visible in B's
sensitivity table — it dominates it.

But a series swap is a methodology change, and OOZEMeter's doctrine recalibrates
(calm→10, GFC→90). Under the doctrine the same swap moves the print only **25.71 → 29.34
(+3.6)**, because the calibration absorbs it:

```
Model E (v3 weights, DRCCLOBS), recalibrated:  a = 1.9429   b = −56.6345
                                    (live)      a = 1.4187   b = −23.9651
```

**Why.** DRCCLOBS's own 2007–2010 maximum is **5.61%** (stress 76.8). Today it is
**6.43%** (stress 85.9). **Today's small-bank card delinquency is 15% above its own GFC
peak.** Anchoring the GFC to 90 therefore *compresses* the series that A wants to add: the
credit line under Model E reads **+21.2 stress points higher today than at the GFC anchor
month it is calibrated against**, and the doctrine responds by subtracting 56.6 raw points
instead of 24.

**Who is right.** **A is right on the economics and 3.6× overstated on the impact. B's
marginal table is correct but structurally cannot see series substitution** — B varied
each line's *value* while holding its *series* fixed, so B's "credit can only reach 43"
is a statement about the anchor curve, not about the concept.

A also under-claimed one thing: A wrote that 2023-Q4 small-bank delinquency was "above its
own GFC level" as a passing remark. It is **7.86% vs a 5.61% GFC peak — 40% above** — and
it is still 15% above today. That is the finding, and it is stronger than A made it.

---

### MD-5 — Real wages: "the best uncovered signal" vs "fails its own test"

**A / `04-july-forensic` claim:** "no wage or income series appears at any weight"; real
AHE went negative this year; "the best uncovered household-stress signal found in this
audit."
**B claims** (gap list): "my own Model C2 proposal fails its own test — real hourly wage
growth (AHETPI minus CPI YoY) correlates only **+0.068** with UMCSENT over 281 months."

**Data.** B's +0.068 reproduces **exactly** (n=281). It also correlates +0.087 with the jar
— genuinely uninformative as a standalone series. But it correlates **+0.418** with real
DPI per capita YoY, which is the behavioural validator B itself elected.

So I built the line B declined to build. Real AHETPI growth mapped through anchors
`[[-4,95],[-2,75],[-1,60],[0,45],[0.5,30],[1,20],[2,10],[4,5]]`, added as an eighth line,
each model independently recalibrated to OOZEMeter's own doctrine:

| model | corr(UMCSENT) all | post-2020 | corr(rDPI) 21-26 | 2022-06 | 2020-04 | calm anchor |
|---|---|---|---|---|---|---|
| **A: LIVE v3** | −0.347 | **+0.219** | **+0.535** | **19** | 42 | **2021-12** |
| A + realwage @ 9.7 | −0.363 | +0.109 | +0.179 | 28 | 41 | 2019-10 |
| **A + realwage @ 19.4** | −0.372 | **−0.034** | **−0.171** | **37** | 39 | **2019-10** |
| A + realwage @ 24.25 | −0.373 | −0.089 | −0.270 | 40 | 37 | 2019-10 |
| E (DRCCLOBS) + realwage @19.4 | **−0.503** | −0.087 | −0.241 | 46 | 44 | 2019-09 |
| equal + DRCCLOBS + realwage | **−0.575** | **−0.371** | **−0.407** | 51 | 37 | 2019-02 |

**One added line simultaneously fixes three of B's four CRITICAL findings:**
the post-2020 sign inversion (F2), the 2021-22 cost-of-living false negative (F3, 19 → 37),
and the calm anchor landing on a 7%-CPI month (F1, 2021-12 → 2019-10).

**Who is right.** **B's rejection is a false negative, and it is the most consequential
error in either report.** The mistake is methodological and worth naming: B evaluated a
*candidate input* by its standalone correlation with the target. A component earns its
place in a composite by being **decorrelated with the existing components and loading on
the missing dimension**, not by being individually predictive. B's own variance
decomposition proves the missing dimension exists — the inflation line's share of composite
variance over 2021-26 is **−38.2%**, i.e. the only price sensor in the instrument actively
*cancels* the rest of the index. A/`july-forensic` reached the right recommendation without
testing it; B tested the wrong thing and rejected it.

**Honest caveats on my own result, since this is the finding I am most exposed on:**
1. The anchor curve is **mine**, chosen by eyeballing the 282-month distribution
   (min −2.65, p10 −1.19, med +0.56, p90 +2.20, max +7.43). It is not validated.
2. The improvement is **partly mechanical** — any counter-cyclical price line would help a
   composite whose price dimension has negative variance share.
3. **The fix has a real cost and it points at B's own F7:** adding real wages pushes
   2020-04 *down* (42 → 39 at w=19.4, 37 at w=24.25). Cost-of-living stress and
   labour-shock stress pull in opposite directions, so fixing 2022 makes COVID worse.
   That tension is a genuine design problem, not an implementation detail, and it is
   the strongest argument for shipping this as a **zero-weight diagnostic** (B's Model B)
   rather than as an eighth weighted line.

---

### MD-6 — Energy double-count: 1.9 jar points or −38.2% of variance?

**A claims** (F9, MAJOR): ~13.4 of the inflation line's 30.5 stress points are the energy
shock the gas line already scores; ≈1.9 published jar points, ~7% of the headline.
**B claims** (F6/F17): gas and inflation are r=0.802 since 2021 ("energy enters twice") —
*and* the inflation line's 2021-26 variance share is **−38.2%** (it cancels the index).

**Data (2026-07).** Headline CPIAUCNS YoY 3.36% → stress 30.5. A used **core** (CPILFESL
2.47% → 17.0) as the counterfactual, giving Δ13.5 stress = **+1.85 jar points** — A's 13.4
/ 1.9 reproduces. But core removes **food** as well as energy. The correct ex-energy
reweighting (energy relative importance 6.19%, CPIENGSL YoY 14.45%) gives 2.63% → stress
19.5, Δ11.0 = **+1.51 jar points**.

**Who is right.** A is right in kind and **23% overstated** in degree: the honest number is
**1.51 jar points, ~5.8% of the headline**, not 1.9 / 7%. B is right about the covariance.
**These are not in conflict and neither auditor said so:** energy adds ~1.5 points to
today's *level* while the inflation line contributes *negative 38.2%* of post-2021
*variance*. A double-count in levels and a cancellation in variance can, and here do,
coexist — because the U-shaped anchor curve makes the line non-monotonic in the very
variable that is double-counted.

---

### MD-7 — The contribution ledger: 1.88× and per-line, or 1.91× and constant?

**B claims** (F4, MAJOR): "the seven published contribs sum to 26 while the seven marginal
effects sum to 47 = 1.88×. Per line: housing 7 vs 12, credit 6 vs 10, auto 5 vs 9, gas 4
vs 8, employment 2 vs 4."

**Data.** `scripts/collect.js:126-135` computes `contrib_k = ooze × (w_k·s_k)/Σ(w·s)` with
largest-remainder rounding. The marginal (drop line to stress 0) is `a·w_k·s_k/100`.
Therefore

```
marginal_k / contrib_k  =  a · raw / ooze   —  identical for all seven lines.
```

Measured: **1.932×** on the exact score (25.708), **1.910×** on the published integer (26).
Exact marginals sum to **49.67**, not 47.

| line | published contrib | marginal | ratio |
|---|---|---|---|
| housing | 6.31 → 7 | 12.19 | 1.93 |
| credit | 5.47 → 6 | 10.57 | 1.93 |
| auto | 5.06 → 5 | 9.78 | 1.93 |
| gas | 4.15 → 4 | 8.02 | 1.93 |
| employment | 2.31 → 2 | 4.47 | 1.93 |
| inflation | 2.17 → 2 | 4.19 | 1.93 |
| financial | 0.23 → 0 | 0.45 | 1.93 |

**Who is right.** B is right in substance and slightly wrong in arithmetic: B appears to
have floored credit (10.57→10) and auto (9.78→9), producing 47 and 1.88×. More
importantly, B's per-line table *invites* the reading that the understatement varies by
line. It does not — **it is a single constant, 1.91×**, which makes the fix simpler than
B implied: one disclosed multiplier, or relabel the axis. This strengthens B's
recommendation.

---

### MD-8 — Weights vs series: which lever actually matters?

**B claims** (F12, MODERATE): equal weighting beats v3 on every metric (−0.45/−0.29 vs
−0.35/+0.22), "which falsifies the claim the weights are earned."
**A claims** (throughout): the defect is *series selection* — "the project selected the
series that was easiest to fetch rather than the series that measures the concept."

Neither ran the head-to-head. I did. All models recalibrated to the same doctrine:

| model | corr(UMCSENT) all | post-2020 | 2026-07 |
|---|---|---|---|
| A — v3 weights, DRCCLACBS (**live**) | −0.347 | **+0.219** | 25.7 |
| D1 — **equal 1/7**, DRCCLACBS (B's fix) | −0.449 | **−0.289** | 26.1 |
| E — v3 weights, **DRCCLOBS** (A's fix) | **−0.486** | +0.180 | 29.3 |
| F — **equal 1/7 + DRCCLOBS** (both) | **−0.571** | **−0.317** | 29.2 |

**Who is right — neither, and the framing is a false dichotomy.** A's series fix wins the
full window (−0.486 vs −0.449); B's reweighting wins post-2020 (−0.289 vs +0.180) where
A's fix barely dents the sign problem; **and the two levers are near-orthogonal and
additive** (−0.571 / −0.317 together, better than either alone). "Are the weights earned?"
and "is the series right?" are separable questions and OOZEMeter fails both.

**A hypothesis of my own that I tested and had to withdraw.** I suspected B's equal-weight
advantage was really a *calibration-anchor* artifact — the equal-weight model's calm anchor
moves off 2021-12 to 2020-02, so perhaps B was measuring an anchor fix and calling it a
weight fix. **This is wrong and I record it as a failed challenge:** Pearson correlation is
invariant to the affine map `a·raw + b`, so the anchor month cannot touch it. Holding v3
weights and moving the calm window to 2003-2019 changes the anchor to 2019-10 and leaves
the correlations at −0.347 / +0.219, bit-identical. **B's equal-weight result is a genuine
weighting result.**

---

## 3. Question (a): does B's statistical treatment match economic reality?

**Overwhelmingly yes, with three exceptions.** Twenty-two of B's twenty-four checkable
numbers reproduced exactly, including every correlation, every variance share, every
marginal, and the calibration constants to fifteen significant figures. The exceptions:

1. **The real-wage false negative (MD-5)** — B applied a standalone-correlate test to a
   component question. This is the one place where B's statistics actively misled the
   project away from the correct fix.
2. **1.88× / "47" (MD-7)** — arithmetic slip, and a per-line presentation of a quantity
   that is provably constant.
3. **B's F2 sign-inversion is real but B did not stress it, and it survives.** I challenged
   it as a possible level artifact (post-2020 UMCSENT sits in a depressed band). It
   survives differencing: `corr(Δ12 jar, Δ12 UMCSENT)` = **−0.598** for 2004-2019 and
   **+0.187** for 2021-2026. And there is a supporting fact B did not report: the jar's
   own dispersion collapsed while sentiment's did not — jar sd **20.52 → 6.93**, UMCSENT sd
   11.86 → 11.48. The instrument did not merely decouple; **it stopped moving.**

One place B's statistics are *more* right than B claimed: B's F1 (calm anchor = 2021-12)
understates itself. B listed that month's calm lines (employment 10, credit 11, auto 5,
financial 10) and omitted that the **gas line read 59.0 and the inflation line read 66.9** —
both near their own historical highs — and the composite still printed its 23-year minimum.
That is a far sharper indictment: 43.6% of the weight can be near-maximum and the index
still calls it the calmest month since 2003. (Also unreported: the anchor is fragile.
Second place is 2020-02 at raw 24.375, only 0.44 raw points = 0.62 published points away.)

---

## 4. Question (b): are A's mechanisms visible in B's sensitivity results?

| A's mechanism | visible in sensitivity? | measured magnitude |
|---|---|---|
| Credit line blind to the bottom of the distribution | **YES — dominates** | +13.07 frozen / **+3.6 doctrine-consistent** |
| No purchasing-power / wage sensor | **YES — the only lever that fixes the post-2020 inversion** | post-2020 corr +0.219 → −0.034; 2022-06 19 → 37 |
| Energy double-counted | YES, small | **+1.51** jar pts today (A said 1.9) |
| Gas deflator is a moving ruler | YES, small | **0.35 pts/yr**, 120 integer flips/yr (A implied ≥1 pt) |
| Employment cannot see labour-force exit | **PARTIALLY** | seam-adjusted **+2.29**, not A's +5.41 |
| Housing is the price of a new mortgage | YES (both agree) | rate branch binding since 2022-04, 44.3 vs 22.8 |
| Student loans absent ($1.651T, 10.6% 90+) | **NOT TESTABLE** | no series in the 282-month backtest; genuine gap |

Two of A's seven mechanisms are the two largest available levers in the entire instrument.
Two more are real but 23%–260% overstated. One is contaminated evidence with a correct
verdict. One cannot be tested with the artifacts that exist.

---

## 5. What neither auditor reached: the calibration doctrine suppresses the fixes

The single finding that only emerged from putting A's economics inside B's machinery:

> **OOZEMeter's calibration doctrine — "GFC peak → 90" — structurally suppresses any input
> whose current level exceeds its GFC level. That is precisely the class of input the
> economic audit is asking for.**

Demonstrated on A's own flagship fix. DRCCLOBS today is 6.43% against a 2007-2010 maximum
of 5.61%. Substituting it makes the credit line read **+21.2 stress points higher today
than at the GFC anchor month it is calibrated against**. The doctrine responds by steepening
`a` from 1.419 to 1.943 and deepening `b` from −23.97 to −56.63, and **74% of the fix
disappears** (+13.07 → +3.6).

This generalises to every gap in A's list: student loans (10.6% 90+ delinquency vs 0.65%
two years ago, no GFC analogue), rent burden, saving rate at 2.7%, and the wage/price
level. A 2007-anchored scale can only express "how much like 2007-09 is this," and the
2020s household distress that both auditors independently identified **does not resemble
2007-09**. This is why B's Model B (zero-weight diagnostics) is the right recommendation
and why A's implicit "add the right series" is not sufficient on its own: adding the right
series to a GFC-anchored ruler recovers roughly a quarter of the signal.

Corollary, and it should be treated as a live risk rather than a curiosity: if the credit
concept were fixed, the anchor month itself moves. Under Model E the GFC anchor stays at
2009-06, but under `E + realwage` it moves to **2008-07** and under `equal + DRCCLOBS +
realwage` to **2008-07** as well. Any methodology-v4 work must treat the anchor *month*,
not only the anchor *rule*, as an output to be reported.

---

## 6. Summary scorecard

| | Economic Investigator (A) | Model Scientist (B) |
|---|---|---|
| claims checked | 12 | 24 |
| reproduced exactly | 10 | 22 |
| materially overstated | 3 (gas deflator, credit impact, employment counterfactual) | 1 (1.88× vs 1.91×) |
| built on invalid data | 1 (CE16OV/CLF16OV seam) | 0 |
| **consequential false negative** | 0 | **1 (real wages)** |
| internal self-contradiction | 1 (max() "holds up" vs "no-op") | 0 |
| understated own finding | 1 (small-bank vs its own GFC peak) | 1 (calm anchor: gas 59, inflation 67) |

A is the better economist and the looser statistician; B is the better statistician and
the weaker experimentalist. The project needs both reports, and it needs the one experiment
neither ran: **evaluate candidate inputs as components of the composite, under the
recalibration doctrine, against a behavioural target — not as standalone correlates against
sentiment on a frozen ruler.**
