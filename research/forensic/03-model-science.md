# 03 — Model Science: forensic audit of the OOZEMeter scoring pipeline

**Auditor:** Agent 3, Model Scientist · **Date:** 2026-08-14 · **Mode:** read-only
**Subject:** methodology v3.0.0, `scripts/collect.js`, `scripts/backtest.js`,
`scripts/lib/methodology.js`, `research/backtest-results.json`, `data/latest.json`
**Analysis scripts:** written to a scratchpad temp dir, not the repo. Nothing in the
repo was modified.

---

## 0. Headline

The pipeline is arithmetically clean, internally coherent, and honestly documented.
Every finding below is about **what it measures**, not whether it computes it correctly.

Three things are broken, and they compound:

1. **The ruler's zero point is December 2021** — the month CPI hit 7.0% YoY, the
   highest in 39 years. `calibration.rawCalm = 23.936322767604793` is that month's raw
   composite, verified to twelve decimals. "The calmest month on record" that the site
   advertises is the month American households were losing purchasing power fastest
   since 1982.
2. **The instrument's external validity inverted in 2020 and nobody checked.** From
   2003 to 2019 the jar correlated **-0.89 / -0.91** with University of Michigan
   consumer sentiment and **-0.48** with real disposable income per capita — textbook
   behavior for a household-stress index. Since 2021 those correlations are **+0.23**
   and **+0.53**. The signs flipped. The jar now goes *down* when households do worse.
3. **The published contribution ledger understates every line by ~1.9×.** The seven
   `contrib` integers sum to the score by construction; the seven *marginal* effects
   sum to 1.88× the score. A reader told "gas contributed 4" would find that removing
   gas moves the score by 8.

Against that: the composite never moved against a 5/7 majority of its own lines in 281
months, the calibration constants are numerically robust to window choice, and the
anchor grids are not fragile. The engineering is better than the economics.

---

## 1. The pipeline, end to end

### 1.1 RAW DATA

Ten FRED series plus one scraped NY Fed workbook (`scripts/collect.js:80`,
`scripts/backtest.js:22-31`):

| input | series | cadence | role |
|---|---|---|---|
| unemployment rate | `UNRATE` | monthly | employment, branch A |
| initial claims | `ICSA` | weekly | employment, branch B |
| CPI-U NSA | `CPIAUCNS` | monthly | inflation line + gas deflator |
| 30-yr mortgage | `MORTGAGE30US` | weekly | housing, branch A |
| mortgage delinquency | `DRSFRMACBS` | quarterly | housing, branch B + aux `foreclosures` |
| card delinquency | `DRCCLACBS` | quarterly | credit |
| retail gasoline | `GASREGW` | weekly | gas |
| NFCI | `NFCI` | weekly | financial |
| industrial production | `INDPRO` | monthly | **aux only**, weight 0 |
| mfg orders | `AMTMNO` | monthly | **aux only**, weight 0 |
| auto 30+ transition | NY Fed HHDC "Page 13 Data" / `AUTO` | quarterly | auto |

Frequency reconciliation: weekly → calendar-month mean (`scripts/lib/fred.js:37-40`),
except `ICSA` which is a trailing four-week mean
(`scripts/lib/methodology.js:200-210`). Quarterly → forward-filled from the
*observation* quarter, not the release date (`scripts/collect.js:67, 95-97`;
`scripts/backtest.js:59-63, 89-91`). The forward-fill is correctly disclosed as
ex-post and not real-time-compatible (`scripts/backtest.js:201-206`).

### 1.2 TRANSFORMATION → STRESS VALUE (0-100)

All seven lines run through one function, `interpolateAnchors`
(`scripts/lib/methodology.js:38-49`) — piecewise-linear, clamped at both ends.
Anchors live twice, once in each entry point: `scripts/collect.js:37-47` and
`scripts/backtest.js:37-49`. They are byte-identical today; nothing enforces that.

Two lines are `max()` of two branches (`scripts/collect.js:108, 110`;
`scripts/backtest.js:108, 110`):

```
jobs    = max( interp(unemployment, UNRATE), interp(claimsK, ICSA/1000) )
housing = max( interp(mortgageRate, MORTGAGE30US), interp(mortgageDelinq, DRSFRMACBS) )
```

The gas line is deflated to *today's* dollars (`scripts/collect.js:113`,
`scripts/backtest.js:113`): `gas * cpiNow / cpi_month`, where `cpiNow` is the latest
CPI print (`scripts/collect.js:98`, `scripts/backtest.js:92`). See §4.6 — this
silently restates the entire archive on every run.

### 1.3 WEIGHT → CONTRIBUTION → OOZE SCORE

Weights are frozen in `scripts/lib/methodology.js:11-19` and re-keyed for the
collector at `scripts/collect.js:49-57`. Composite and calibration:

```
raw   = Σ(weight_k × stress_k) / 100          collect.js:118 · backtest.js:116
ooze  = round(clamp(a × raw + b, 0, 100))     collect.js:117,124 · backtest.js:137
a = 1.418684348943213   b = -23.96514845099034     methodology.js:27
```

The calibration rule (`scripts/backtest.js:120-137`) is: the calmest month of
2003-2025 maps to 10, the 2007-2010 peak maps to 90. **Both anchors verified against
the published artifact:**

- low anchor = **2021-12**, raw composite 23.936323 (== `calibration.rawCalm`)
- high anchor = **2009-06**, raw composite 80.320895 (== `calibration.rawGfc`)

Contributions (`scripts/collect.js:126-135`) split the *calibrated* score
proportionally to weighted stress, with a largest-remainder pass so the seven
integers sum exactly to the headline. This is arithmetically airtight and
economically misleading — §4.3.

### 1.4 BAND → USER INTERPRETATION

`lab.js:28-34`, `lab.js:262-263`:

| range | name | tier | copy shown (`what-is-ooze.html:74-80`) |
|---|---|---|---|
| 0-20 | SMOOTH | 🟢 STABLE | "Budgets bend without breaking… The calmest month on record lives here." |
| 21-40 | STICKY | 🟡 OBSERVATION | "The pressure shows in the data before it makes headlines…" |
| 41-60 | SLIPPERY | 🟠 CONTAINMENT WATCH | "Softening becomes slipping…" |
| 61-80 | OOZING | 🟠 CONTAINMENT WARNING | "Broad distress… Recession-grade territory." |
| 81-100 | OVERFLOWING | 🔴 OVERFLOW RISK | "Systemic crisis…" |

`≥95` overrides to `☢ NATIONAL MESS` (`lab.js:33, 263`). Current published state:
**2026-07 = 26, STICKY, 🟡 OBSERVATION**.

### 1.5 Worked example — the live number

From `data/latest.json` (2026-07):

| line | stress | × weight | weighted |
|---|---|---|---|
| employment | 13 | 24.25 | 315.3 |
| housing | 44 | 19.40 | 853.6 |
| credit | 38 | 19.40 | 737.2 |
| auto | 47 | 14.55 | 683.9 |
| gas | 58 | 9.70 | 562.6 |
| inflation | 30 | 9.70 | 291.0 |
| financial | 10 | 3.00 | 30.0 |

raw = 3473.6 / 100 = 34.74 → 1.4187 × 34.74 − 23.965 = **25.3 → 26** (integer line
stresses round; the pipeline's unrounded value gives 26).

---

## 2. Which sensors dominate

Variance decomposition of the *raw* composite (Cov(contribution, composite) /
Var(composite); shares sum to exactly 100%), computed on all 282 months of
`research/backtest-results.json`.

| line | weight | sd(stress) | corr with composite | **variance share** |
|---|---|---|---|---|
| employment | 24.25 | 25.2 | 0.783 | **34.6%** |
| housing | 19.40 | 21.7 | 0.710 | **21.6%** |
| credit | 19.40 | 18.8 | 0.747 | **19.7%** |
| auto | 14.55 | 21.7 | 0.662 | **15.1%** |
| gas | 9.70 | 19.5 | 0.428 | 5.9% |
| financial | 3.00 | 19.0 | 0.602 | 2.5% |
| inflation | 9.70 | 16.2 | **0.059** | **0.7%** |

The top four lines carry 91% of the variance. **The inflation line contributes 0.7%
of the composite's variance over 23 years** despite carrying 9.7% of the weight — not
because it is quiet (sd 16.2, range 10-80) but because it is nearly orthogonal to
everything else. In 2021-2026 its variance share is **−38.2%**: it actively cancels
the rest of the index.

Regime-dependence is severe:

| line | full | calm 2013-19 | GFC 2007-10 | 2021-2026 |
|---|---|---|---|---|
| employment | 34.6 | 45.7 | 36.0 | 52.1 |
| housing | 21.6 | 41.2 | 31.2 | 29.0 |
| credit | 19.7 | **−2.6** | 16.6 | 34.7 |
| auto | 15.1 | **−3.9** | 10.8 | 35.3 |
| gas | 5.9 | 17.9 | **−5.4** | **−12.4** |
| inflation | 0.7 | 2.4 | 6.9 | **−38.2** |
| financial | 2.5 | −0.7 | 3.9 | −0.6 |

**Gas has a negative variance share during the GFC.** It fought the signal in the one
episode the whole scale is calibrated on. See §5.2.

### 2.1 Leave-one-line-out

Each ablation rescales remaining weights to 100 and re-derives calibration on the same
doctrine, so results are comparable.

| drop | mean \|Δscore\| | max \|Δ\| | corr w/ sentiment, all | corr w/ sentiment, post-2020 | COVID peak |
|---|---|---|---|---|---|
| — (baseline) | — | — | −0.347 | **+0.217** | 42 |
| employment | 6.44 | 23 | **−0.389** | **−0.523** | **20** |
| inflation | 4.87 | 8 | −0.293 | +0.253 | 45 |
| housing | 4.62 | 12 | −0.345 | +0.291 | 48 |
| credit | 4.15 | 12 | −0.367 | +0.320 | 51 |
| auto | 3.35 | 11 | −0.344 | +0.363 | 50 |
| gas | 2.34 | 5 | −0.320 | +0.281 | 47 |
| financial | **0.72** | **2** | −0.335 | +0.239 | 41 |

Two results worth staring at:

- **Deleting the employment line is the single largest improvement to the jar's
  post-2020 external validity** (+0.217 → −0.523, i.e. from wrong-signed to
  correctly-signed). It is *also* the only line that sees fast shocks at all
  (COVID peak collapses from 42 to 20 without it). The heaviest sensor is
  simultaneously load-bearing and mis-specified.
- **Deleting the financial line changes the published integer by 0.72 points on
  average and never by more than 2.** It is honest, well-documented, and inert.

---

## 3. Can one variable overwhelm the system?

**No — and that is a problem in the other direction.** Holding the 2026-07 reading
fixed and driving one line to its extreme:

| line | → stress 100 | → stress 0 | span |
|---|---|---|---|
| employment | 56 | 21 | 35 pts |
| credit | 43 | 15 | 28 pts |
| housing | 41 | 14 | 27 pts |
| auto | 37 | 16 | 21 pts |
| gas | 31 | 18 | 13 pts |
| inflation | 35 | 22 | 13 pts |
| financial | 30 | 25 | **5 pts** |

To lift 2026-07 out of STICKY (26) into SLIPPERY (41), a single line must reach:

- employment: stress 56 (≈ 7.2% unemployment or 380k weekly claims) — reachable
- credit: stress 93 (≈ 7.0% card delinquency, GFC-plus) — barely reachable
- housing: stress 99 (≈ 17% mortgage rate or 11% delinquency) — not reachable
- **auto, gas, inflation, financial: IMPOSSIBLE even at stress 100**

Four of seven advertised intake lines cannot, at maximum physical stress, move the
score out of its current band. The jar shows the user seven canisters; four of them
are decorative at today's baseline. No single-variable blow-up risk exists — the risk
is the opposite, that a genuine single-factor crisis (an energy shock, a funding
freeze) is structurally muted.

---

## 4. Defensibility of the machinery

### 4.1 Are the interpolation anchors arbitrary?

**Partly.** Provenance splits three ways:

- `financialConditions` — **documented**. `research/METHODOLOGY-V3-SPEC.md:36-42`
  names the reference points (GFC monthly mean 2.3-2.7 → 93-98, COVID Apr-2020 0.4 →
  58, calm −0.55 → 13) and states that changing them invalidates four study scripts.
  This is the standard the other six should be held to.
- `auto30Plus`, weights — **derived from studies** in `research/` (`weight-optimization-study.py`,
  `gfc-sensitivity-study.py`), though the weight study only varied the NFCI weight
  (`research/weight-optimization-results.json` contains only `FC-*` designs at
  w ∈ {1,2,3,4,5,7.5,10}). **No study varied the other six weights.**
- `unemployment`, `claimsK`, `inflationYoY`, `mortgageRate`, `mortgageDelinq`,
  `cardDelinq`, `gasReal` — **no provenance document found** in `research/`. I grepped
  for anchor rationale and found none. They read as expert judgment, which is
  defensible, but the site presents them as a fixed absolute scale without saying whose
  judgment or when.

**They are not fragile, however.** Shifting each anchor's entire x-grid by ±10%:

| line | ±10% x-shift → mean \|Δ published score\| | max |
|---|---|---|
| auto | 2.89 / 2.25 | 4 |
| employment | 2.30 / 2.09 | 3 |
| housing | 1.82 / 1.73 | 3 |
| credit | 1.51 / 1.36 | 2 |
| gas | 1.21 / 1.15 | 2 |
| financial | 0.09 / 0.08 | 1 |

A 10% error in where an anchor sits costs 1-3 published points. The *shape* choices
(§4.5, §5.2) cost far more than the *placement* choices.

### 4.2 Is the calibration robust?

**Numerically, yes.** Re-deriving on five different windows:

| window | a | b | calmest month | 2026-07 prints | COVID peak |
|---|---|---|---|---|---|
| 2003-01..2025-12 (published) | 1.4188 | −23.962 | **2021-12** | 26 | 42 |
| 2003-01..2026-07 | 1.4188 | −23.962 | 2021-12 | 26 | 42 |
| 2003-01..2019-12 | 1.4346 | −25.225 | 2019-10 | 25 | 42 |
| 2004-01..2025-12 | 1.4188 | −23.962 | 2021-12 | 26 | 42 |
| 2003-01..2021-11 | 1.4299 | −24.855 | 2020-02 | 25 | 42 |

Slope varies by ~1%; the current print moves by at most 1 point. The freeze doctrine
in `scripts/lib/methodology.js:21-26` is sound and the `OOZEMETER_RECALIBRATE=1`
escape hatch is good practice.

**Conceptually, the low anchor is indefensible.** The window's minimum is 2021-12.
That month's line stresses: employment 10, credit 11, auto 5, housing 31, financial 10
— every balance-sheet and slack measure at or near a record low, because pandemic
transfers had paid down consumer debt and drained the labor force. Simultaneously CPI
was +7.0% YoY, real disposable income per capita was falling, and the Michigan index
read 70.6. **The scale's definition of "as calm as it gets" is a month of maximal
purchasing-power destruction.** Everything the jar has published since inherits that
zero point.

### 4.3 Do the published contributions mean what a reader thinks?

**No.** `scripts/collect.js:126-135` splits the calibrated score proportionally to
weighted stress. Because `b = −23.97` is large and negative, that split silently
distributes the intercept across all seven lines. For 2026-07:

| line | published `contrib` | marginal effect (drop line to stress 0) | ratio |
|---|---|---|---|
| employment | 2 | 4 | 2.00× |
| housing | 7 | 12 | 1.71× |
| credit | 6 | 10 | 1.67× |
| auto | 5 | 9 | 1.80× |
| gas | 4 | 8 | 2.00× |
| inflation | 2 | 4 | 2.00× |
| financial | 0 | 0 | — |
| **sum** | **26** (= the score) | **47** (= 1.88× the score) | |

The ledger is a *share-of-score* attribution presented in a UI (`what-is-ooze.html:87`
renders these as `+N`) that invites a *marginal* reading. Both are legitimate
statistics; publishing one while implying the other is not. The current presentation
makes every line look about half as important as it is.

### 4.4 Are the weights historically justified?

**No evidence they are, and one trivial alternative beats them.** All models below are
recalibrated to the same doctrine so scores are comparable.

| model | corr w/ sentiment (all) | (pre-2020) | (post-2020) | recession AUC |
|---|---|---|---|---|
| **A** current v3.0.0 | −0.35 | −0.89 | **+0.22** | 0.933 |
| **D1** equal weights, 1/7 each | **−0.45** | −0.90 | **−0.29** | **0.960** |

Equal weighting — no study, no tuning, no doctrine — is better than v3 on external
validity in every window *and* on recession separation. That does not mean ship D1
(see §7 caveats). It means the current weights carry no demonstrated advantage over
the null hypothesis, and the site should not imply they do.

Caveat, stated plainly: the AUC number is nearly meaningless. `USRECD` marks 20
recession months inside 2003-2026, and **18 of them are the GFC — the same episode the
scale is calibrated to.** Any model tuned to peak at 90 in 2009 will score well. The
recession test is circular and I am reporting it only because omitting it would look
like hiding it.

### 4.5 Double counting

| overlap | full window | 2021-2026 | mechanism |
|---|---|---|---|
| credit ↔ auto | **r = 0.863** | **r = 0.987** | both are household delinquency; combined weight **33.95%** |
| gas ↔ inflation | r = 0.196 | **r = 0.802** | gasoline is inside CPI; corr(CPI YoY, GASREGW YoY) = **0.723** over 2003-2026 |
| financial (jar) ↔ credit (Ward M) | — | — | **identical series, identical anchors** |

The NFCI overlap is literal. `scripts/collect-market.js:63-66` declares Ward M's
credit gauge with `seriesId:'NFCI'` and the anchor array
`[[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]]` —
character-for-character the jar's `FINANCIAL_CONDITIONS_ANCHORS`
(`scripts/lib/methodology.js:10`). The two instruments currently publish **two
different numbers for the same series on the same page**: jar `financial` shows
−0.55 / stress 10 (`data/latest.json`), Ward M `credit` shows −0.53 / stress 11
(`data/market.json`). Both are correct for their own as-of dates; a reader has no way
to know that.

**Effective dimensionality** (participation ratio of the stress correlation matrix's
eigenvalues):

| window | PC1 explains | effective independent lines |
|---|---|---|
| 2003-2026 | 40% | **3.93 of 7** |
| 2007-2010 | 56% | 2.60 of 7 |
| 2021-2026 | 55% | **2.46 of 7** |

The jar presents seven intake lines. In the current regime it has about two and a half.

### 4.6 The archive is not frozen

`scripts/lib/methodology.js:21-26` states the calibration is frozen because
"re-deriving on every run would silently move already-published historical scores."
The gas line does exactly that by another route. `scripts/backtest.js:92` sets
`cpiNow` to the latest CPI print and line 113 computes `gasNom * cpiNow / cpi_m`.
Every month CPI rises, every historical real-gas value rises with it, every historical
gas stress rises, and every historical score drifts up.

Measured, holding all else equal:

| deflator base | mean \|Δ\| across the whole archive | max |
|---|---|---|
| 2019-07 instead of 2026-07 | **3.01 pts** | 3.98 |
| 2021-07 instead of 2026-07 | 2.35 pts | 3.13 |
| 2023-07 instead of 2026-07 | 1.06 pts | 1.45 |

≈ 0.35 published points per year of structural, one-directional drift, on top of source
revisions. The revision detector (`scripts/integrity.js:29-67`) catches it and warns
but does not block — `data/revisions.json` logs a 2026-08-14 entry with 16 months
moved (9 up, 7 down) with no methodology change. The mechanism is real; that
particular batch is mixed, so source revisions dominate it. Fix is one line:
pin the deflator base to a fixed month and publish which one.

### 4.7 Display value and stress badge come from different months

`scripts/collect.js:189` assigns `l.stress` from `stM` — the *score month*, 2026-07 —
while `l.value` comes from the series' latest observation. Live example:

| line | displayed value | as-of | stress badge computed from |
|---|---|---|---|
| gas | $4.01 | 2026-08-10 | July mean $3.932 |
| housing | 6.67% | 2026-08-13 | July mean 6.542% |
| financial | −0.55 | 2026-08-07 | July mean −0.5362 |

The cadence doctrine at `scripts/collect.js:2-8` explains *why* lines and headline
update on different clocks and that is a defensible product choice. But pairing
August's number with July's stress in one badge is not the doctrine; it is an
unlabeled mismatch.

### 4.8 What works

Reporting these as prominently as the failures:

- **Coherence: 0 incoherent months out of 281.** There is no month where the published
  score fell while 5+ lines rose, or rose while 5+ fell. The aggregation never lies
  about its own inputs.
- **Normalization behaves in extremes.** Every line is clamped at both ends
  (`scripts/lib/methodology.js:40-42`), so 2009 and 2020 saturate rather than explode.
  All seven at 100 → exactly 100; all at 0 → exactly 0. No overflow, no negative
  scores, no NaN paths. `scripts/integrity.js:130-137` caps month-over-month jumps at
  30 points and fails closed.
- **The calibration invariants are enforced**, not just asserted in prose:
  `scripts/integrity.js:95-101` fails the build if the GFC peak leaves 90±2 or the calm
  floor leaves 10±2.
- **The auxiliary-line pattern already exists and is correct.**
  `scripts/collect.js:177-185` publishes `foreclosures` and `manufacturing` with
  `contributesToOoze:false`, `scoreWeight:0`,
  `calibrationStatus:'provisional-auxiliary'`. This is the mechanism §7 recommends
  reusing.
- **The v3 disclosure discipline is exemplary.** `research/METHODOLOGY-V3-SPEC.md:106-118`
  requires the site to state that the NFCI line's benefit comes from a single episode,
  contributes nothing in fast shocks, and is arithmetically dilutive in calm markets.
  Very few public indices disclose their own weakest component that way.

---

## 5. False positives and false negatives

### 5.1 The 2021-2022 cost-of-living shock — the largest false negative

| month | jar | band | CPI YoY | real DPI per capita YoY | Michigan sentiment |
|---|---|---|---|---|---|
| 2021-12 | **10** | SMOOTH — *"the calmest month on record"* | +7.0% | falling | 70.6 |
| 2022-02 | 11 | SMOOTH | +7.9% | falling | 62.8 |
| 2022-06 | **19** | SMOOTH | +9.1% | **−5.13%** | **50.0** (then an all-time low) |

For comparison, real disposable income per capita fell **−1.71%** at the June 2009
recession trough, where the jar reads **90**. The 2022 real-income contraction was
roughly three times deeper and the jar read 19.

*Honest caveat:* much of the 2022 real-DPI collapse is the withdrawal of 2021 transfer
payments, i.e. a base effect, not a fall in wage income. The household experience of
income buying 5% less is real either way, but the mechanism matters and I am not
claiming a clean −5% wage shock.

**Mechanism (SUPPORTED-EXPLANATION, traced in code):** 58.2% of the jar's weight sits
on measures that pandemic transfers pushed to record lows — card delinquency
(`DRCCLACBS`, 19.4%), auto delinquency (14.55%), and unemployment/claims (24.25%). The
only purchasing-power sensor is the 9.7% inflation line, and its U-shaped anchor caps
7.0% CPI at stress 67, worth 9.2 raw points. The jar structurally cannot see a
cost-of-living shock that does not first show up as a missed payment.

### 5.2 November 2008 — the jar fell during the GFC

| month | jar | gas stress | NFCI stress |
|---|---|---|---|
| 2008-10 | 79 | 78 | 95 |
| **2008-11** | **75** ▼ | **44** | **100** (all-time high) |
| 2008-12 | 77 | 27 | 99 |

The score's only decline in the entire 2007-2009 ramp is November 2008 — the month
financial conditions hit their worst reading on record. Cause: gas stress fell 97 → 27
between June and December 2008 as oil collapsed, subtracting **9.6 published points**
during the worst six months of the crisis.

Removing the gas line entirely and recalibrating produces a monotone ramp
(2008-09..2009-03: 72, 77, 77, 81, 87, 87, 89) with a higher, earlier peak. The gas
line's variance share during the GFC is **−5.4%**.

**This is the "does the score reward deteriorating conditions" test, and it fails.**
Cheap gasoline during a demand collapse is scored as relief. For a household whose
earner was just laid off, it is not.

### 5.3 COVID — a recession that scored inside the watch band

Both NBER-dated COVID recession months score **42**. That is:

- below the 2006-05 and 2006-07 readings of **47**, which occurred at the peak of the
  housing bubble during an expansion;
- inside SLIPPERY, whose published copy reads *"Softening becomes slipping"* — for the
  month unemployment hit 14.8% and 20 million jobs vanished;
- never above 50 at any point in 2020.

**Mechanism:** only the employment line moved (8 → 99). Delinquencies fell (forbearance
and stimulus), gas fell, housing was flat. The `max()` employment branch caught the
claims spike correctly — the aggregation then diluted it by 76%.

### 5.4 2026 — the live disagreement

| month | jar | Michigan sentiment | note |
|---|---|---|---|
| 2026-04 | 28 | 49.8 | |
| **2026-05** | **30** | **44.8** | **lowest reading in the 74-year history of the series** |
| 2026-06 | 27 | 49.5 | |
| 2026-07 | **26 — STICKY, 🟡 OBSERVATION** | (not yet published) | |

Verified against `fredgraph.csv?id=UMCSENT`: the previous record low was 51.7 in May
1980; 2022-06's 50.0 broke it; 2026-05's 44.8 is the new floor. The personal saving
rate is 2.7% (`PSAVERT`, 2026-06) against a 2019 average of 7.3% and a GFC low of 1.4%.

The jar reads 26 and the site tells the reader *"The pressure shows in the data before
it makes headlines."*

**I am not claiming the jar is wrong and the survey is right.** Post-2020 consumer
sentiment has a well-documented partisan component and has decoupled from hard macro
data. Note also that real-wage growth (AHETPI − CPI YoY) correlates only **+0.07** with
sentiment over the full window and prime-age employment-population ratio flips sign
(+0.57 pre-2020, −0.57 post-2021) — no single alternative sensor fixes this either.
The finding is narrower and harder to dismiss: **the one external validator that
tracked this instrument for seventeen years stopped tracking it in 2020, and the
pipeline has never checked.**

### 5.5 False positives

| episode | jar peak | verdict |
|---|---|---|
| 2003-02/03 | 47 | borderline; jobless recovery was real |
| 2005-09 | 45 | **false positive** — Katrina gas spike (gas stress 88) |
| 2006-05, 2006-07 | 47 | **false positive** — driven by gas 80-82, then retraced to 37 by 2007-01, immediately before the real crisis began |

The pattern is consistent: **every non-crisis excursion above 45 in 23 years was a
gasoline price spike.** The gas line is 9.7% of the weight and generates 100% of the
false alarms — and in 2026 it is again the sole driver of the visible score movement
(gas stress 32 → 72 → 58 across Jan-Jul 2026, moving the headline 19 → 30 → 26 while
credit sat at exactly 38 for seven straight months).

### 5.6 Timing

- NBER recession began **2007-12**; the jar read 57 that month, having crossed 50 in
  2007-10. It crossed 60 in 2008-02, two months *after* the onset.
- The jar peaked at 90 in **2009-06** — the exact month NBER dates the trough. It is a
  coincident-to-lagging instrument, which is what a delinquency-weighted index should
  be. That is fine, but it is not what "the pressure shows in the data before it makes
  headlines" promises.

### 5.7 Resolution in the current regime

2023-2026: mean month-over-month move 1.32 points, total range 19-30 across 43 months.
The instrument has an 11-point working range and 1-point monthly resolution — most of
which, in 2026, is gasoline.

---

## 6. What cannot be tested

**State this on the site.** `research/backtest-results.json` begins at **2003-01**.
The binding constraint is the NY Fed Consumer Credit Panel auto 30+ transition series
(`scripts/lib/methodology.js:141-165`); every other input reaches back further
(`DRCCLACBS`/`DRSFRMACBS` to 1991-01, `GASREGW` to 1990-08, `NFCI` to 1971-01,
`MORTGAGE30US` to 1971-04, `UNRATE` to 1948-01, `ICSA` to 1967-01).

Consequences:

- **The 2001 recession is untestable.** Also the 1990-91 recession, the 1980 and
  1981-82 double-dip, and the entire Volcker disinflation — the last time the US
  experienced an inflation shock comparable to 2021-22. The one historical episode
  that would test the jar's largest known blind spot is outside its record.
- **There is exactly one complete credit-driven cycle in the record**, and it is the
  GFC — which is simultaneously the calibration target (`rawGfc` = 2009-06) and the
  validation set. Every claim about crisis behavior is fitted in-sample.
- Any statement of the form "the calmest month on record" or "the worst since" is
  scoped to 2003+, and the site should say so at the point of the claim, not in a
  methodology page.

---

## 7. Model comparison

All models recalibrated to the identical doctrine (calm 2003-2025 → 10, GFC peak → 90)
so the numbers are comparable. Sentiment correlation should be *negative*.

| model | r(sent) all | pre-2020 | post-2020 | AUC | COVID Apr-20 | 2006-05 | 2021-12 | 2026-05 |
|---|---|---|---|---|---|---|---|---|
| **A** current v3.0.0 | −0.35 | −0.89 | **+0.22** | 0.933 | 42 | 47 | 10 | 30 |
| **C** multivar sensors, credit+auto merged, cost-of-living 19.4 | −0.37 | −0.89 | **−0.22** | 0.923 | 43 | 44 | 19 | **50** |
| **C1** employment sensor only (adds payroll momentum, participation, U6 gap) | −0.37 | −0.90 | −0.17 | 0.932 | 39 | 43 | 10 | 44 |
| **C2** cost-of-living sensor only (inflation OR real-wage squeeze) | −0.32 | −0.89 | +0.24 | 0.923 | 42 | 47 | 10 | 31 |
| **D1** equal weights | **−0.45** | −0.90 | **−0.29** | **0.960** | 37 | 45 | 15 | 32 |
| **D2** merge credit+auto → 19.4, employment → 38.8 | −0.32 | −0.90 | **+0.43** | 0.923 | 60 | 47 | 15 | 28 |
| **D3** drop inflation, pro-rata reweight | −0.29 | −0.89 | +0.25 | 0.924 | 45 | 49 | 10 | 33 |
| **D4** percentile-rank normalization | −0.35 | −0.87 | −0.10 | 0.907 | 38 | **62** | 10 | 43 |

### MODEL B — current + zero-weight diagnostic layer

Not in the table because **by construction it changes no score**. That is the point.
The pattern already ships (`scripts/collect.js:177-185`): publish a line with
`contributesToOoze:false`, `scoreWeight:0`,
`calibrationStatus:'provisional-auxiliary'`.

Candidate diagnostics, each of which would have made a documented failure legible at
the time it happened:

| diagnostic | series | would have shown |
|---|---|---|
| payroll momentum (3-mo, annualized) | `PAYEMS` | 2026-07: +0.15% while UNRATE fell — deterioration masked |
| labor-force participation | `CIVPART` | 61.8 → 61.4 over 2026-05..07, exit lowering UNRATE |
| U6 − U3 gap | `U6RATE` − `UNRATE` | 3.8pp now; corr 0.77 with the employment line, so it agrees when it should |
| real income per capita | `A229RX0` | 2022-06: **−5.13% YoY**, three times the 2009 trough |
| personal saving rate | `PSAVERT` | 2.7% now vs 7.3% in 2019, near the 1.4% GFC low |
| consumer sentiment | `UMCSENT` | 2026-05: 44.8, all-time low in a 74-year series |

**Cost:** zero score churn, zero recalibration, no archive restatement, no methodology
version bump, no new anchors to defend. **Benefit:** the four documented failures in §5
become visible to a reader without the instrument claiming to have predicted them.
**Risk:** clutter — six new lines on a page that already shows nine. Cap it at three
and put them behind a "what the jar can't see" panel, not in the canister row.

This is the highest ratio of explanation gained to trust risked available. It should
ship first and alone.

### MODEL C — multi-variable composites inside sensors

C fixes the sign of the post-2020 correlation (+0.22 → −0.22) and lifts 2026-05 from
30 to 50. **But my own C1 result is anchor-sensitive and I do not trust it.** The
2026-07 jump (employment 13 → 77) is driven almost entirely by my participation
anchor treating a −0.8pp 12-month participation decline as stress 77, and a large share
of that decline is demographic (boomer retirement), not distress. My anchors are as
unprovenanced as the incumbent's. Reported as a direction, not a design.

C also degrades AUC slightly (0.923 vs 0.933) and would restate the entire archive.

C2 in isolation (real-wage squeeze) **makes post-2020 correlation worse** (+0.24), and
real-wage growth correlates only +0.07 with sentiment. Reject C2 as specified.

### MODEL D — alternative weighting / normalization

- **D1 (equal weights) wins every headline metric.** Take it as a falsification of the
  claim that the current weights are earned, not as a shipping recommendation. Equal
  weighting means the 3%-weight NFCI line gets 14.3% — abandoning the entire v3
  evidence base — and it flattens the deliberate editorial judgment that a job matters
  more than a gas price. It also inherits every double-counting problem in §4.5 and
  makes them worse by upweighting the redundant pair.
- **D2 (de-overlap) makes things worse** (+0.43 post-2020) because it moves the freed
  weight onto the broken employment sensor. The right de-overlap moves it somewhere
  else.
- **D3 (drop inflation)** degrades external validity. The inflation line is nearly
  useless in aggregate (§2) but removing it is worse than keeping it. Keep it; fix its
  shape.
- **D4 (percentile-rank normalization)** destroys the absolute scale — the whole point
  of the anchor doctrine — and prints **62** for May 2006, an expansion month, which is
  a worse false positive than anything Model A produces. Reject outright.

### Recommendation

1. **Ship Model B.** Zero-weight diagnostics using the pattern already in the
   collector. No recalibration, no restatement.
2. **Fix the two cheap defects that need no methodology change:** pin the gas deflator
   base month (§4.6), and either publish marginal contributions alongside the
   proportional ones or relabel the ledger (§4.3).
3. **Publish the anchor provenance for the six undocumented lines**, to the standard
   `METHODOLOGY-V3-SPEC.md:36-42` already sets for NFCI. If a rationale cannot be
   written down, that is the finding.
4. **Do not ship C or D yet.** Re-run the weight study varying all seven weights, not
   just NFCI, and pre-register the evaluation metric before touching a number.
5. **Reconcile the NFCI double-publication** (§4.5) — one series should produce one
   public number, or the page should say why it produces two.

---

## 8. Findings, ranked

| # | severity | finding | evidence | claim type |
|---|---|---|---|---|
| 1 | CRITICAL | Calibration low anchor is 2021-12 (CPI +7.0%). The scale's "calm" is a purchasing-power crisis. | `methodology.js:27`; `backtest.js:127-130`; raw 23.936323 == `calibration.rawCalm` | SUPPORTED-EXPLANATION |
| 2 | CRITICAL | External validity inverted post-2020: r(jar, `UMCSENT`) −0.89/−0.91 pre-2020 → +0.22/+0.23 post; r(jar, `A229RX0` YoY) −0.48 → +0.53 | 281 months, `backtest-results.json` vs FRED | CORRELATION + SUPPORTED mechanism |
| 3 | CRITICAL | 2021-22 cost-of-living shock scored as the calmest in the record; 2022-06 real DPI/capita −5.13% vs −1.71% at the 2009 trough (jar 19 vs 90) | `A229RX0`, `CPIAUCNS` | SUPPORTED-EXPLANATION |
| 4 | MAJOR | Published `contrib` understates marginal effect ~1.9× (sum 26 vs 47) | `collect.js:126-135`; b = −23.97 | SUPPORTED-EXPLANATION |
| 5 | MAJOR | The jar **fell** in Nov 2008 (79→75) solely because gasoline crashed; gas variance share during the GFC is −5.4% | `backtest-results.json` 2008-10..12 | SUPPORTED-EXPLANATION |
| 6 | MAJOR | credit ↔ auto r = 0.863 (0.987 since 2021), 33.95% of weight on one factor; effective independent lines 3.93 of 7 (2.46 since 2021) | eigen-decomposition of the stress correlation matrix | CORRELATION |
| 7 | MAJOR | COVID peak 42 ranks below the 2006 bubble-expansion peak 47; never exceeded 50 in 2020 | `backtest-results.json` | SUPPORTED-EXPLANATION |
| 8 | MAJOR | 4 of 7 lines cannot move 2026-07 out of STICKY even at stress 100 | domination test | SUPPORTED-EXPLANATION |
| 9 | MAJOR | Gas deflator re-bases the whole archive to the latest CPI every run — ~3 pts of drift vs a 2019 base, ~0.35 pts/yr, contradicting the freeze doctrine | `backtest.js:92,113`; `collect.js:98,113`; `methodology.js:21-26` | SUPPORTED-EXPLANATION |
| 10 | MAJOR | Every non-crisis excursion above 45 in 23 years was a gasoline spike (2005-09, 2006-05, 2006-07); gas drives the entire visible 2026 range | `backtest-results.json` | SUPPORTED-EXPLANATION |
| 11 | MAJOR | Dropping the employment line is the largest single improvement to post-2020 validity (+0.217 → −0.523) yet it is the only line that sees fast shocks | leave-one-out | CORRELATION |
| 12 | MODERATE | Weights carry no demonstrated advantage over equal weighting; D1 beats A on every metric. The weight study varied only the NFCI weight. | `weight-optimization-results.json` | CORRELATION |
| 13 | MODERATE | Housing has been pure mortgage **rate** since 2022-04 (branch flipped; 44.3 vs 22.8 today) — new-buyer pricing at 19.4% weight, not existing-household distress | branch analysis, `MORTGAGE30US` vs `DRSFRMACBS` | SUPPORTED-EXPLANATION |
| 14 | MODERATE | Line display value and stress badge come from different months (gas $4.01 @ Aug-10 next to a July stress of 58) | `collect.js:159-194` | SUPPORTED-EXPLANATION |
| 15 | MODERATE | NFCI published twice with identical anchors and different values: jar −0.55/10, Ward M −0.53/11 | `collect-market.js:63-66` vs `methodology.js:10` | SUPPORTED-EXPLANATION |
| 16 | MODERATE | The `financial` line moves the published score by 0.72 pts on average, max 2, max 5 even at NFCI = 3.0 | leave-one-out, domination | SUPPORTED-EXPLANATION |
| 17 | MODERATE | Inflation U-shape scores benign disinflation as stress (2015-01, CPI −0.1% → stress 46); 0% CPI scores the same as +4.2% | `ANCHORS.inflationYoY` | SUPPORTED-EXPLANATION |
| 18 | MODERATE | gas ↔ inflation r = 0.802 since 2021; energy double counted (corr(CPI YoY, gas YoY) = 0.723) | FRED | CORRELATION |
| 19 | MODERATE | Six of seven anchor sets have no provenance document; only `financialConditions` meets the standard the repo itself set | grep of `research/` | SUPPORTED-EXPLANATION |
| 20 | MODERATE | Only one complete credit cycle in the record; the GFC is both calibration target and validation set. 2001, 1990-91, and the Volcker inflation are untestable. | record starts 2003-01, bound by the NY Fed auto series | SUPPORTED-EXPLANATION |
| — | NOT-A-PROBLEM | 0 of 281 months incoherent; clamping correct in 2009/2020; calibration robust to window; anchor placement fragile only at 1-3 pts; integrity gate fails closed | §4.8 | SUPPORTED-EXPLANATION |

---

## 9. Complexity the instrument does not need

Applying the project's own rule — more data is not a better instrument:

- **Reject D4** (percentile normalization). Destroys the absolute scale and creates a
  worse false positive at 2006-05 (62) than it removes.
- **Reject C2 as specified.** Real-wage YoY correlates +0.07 with sentiment; adding it
  makes post-2020 validity worse.
- **Reject "add more series."** The jar already has 2.46 effective dimensions from
  seven lines. An eighth correlated line adds weight, not information.
- **Reject reweighting before re-studying.** Every weight alternative I tested trades
  one episode for another. Without a pre-registered metric, weight tuning is fitting
  the GFC twice.
- **Do not chase recession prediction.** The jar peaks at the NBER *trough*. That is
  appropriate for a delinquency-weighted household-stress index and trying to fix it
  would turn a stress meter into a bad leading indicator. Fix the copy instead.

---

## 10. Gaps this audit could not close

1. Whether the post-2020 sentiment decoupling is the jar's fault or the survey's.
   Both are plausible; a behavioral validator (real income, saving rate) points the
   same direction as the survey, which is suggestive but not decisive.
2. Where the six undocumented anchor sets came from. No document found; the authors
   may know.
3. Whether the NY Fed auto series can be extended before 2003, which would make the
   2001 recession testable and break the GFC's monopoly on the validation set.
4. Whether an unweighted diagnostic layer actually improves reader understanding, or
   just adds noise. That is a UX question, not a model question.
5. The correct anchor shape for a labor-force-exit sensor. Every candidate I tried is
   contaminated by demographics.
6. Real-time (vintage) behavior. Every number here is ex-post revised data, which the
   pipeline correctly discloses (`backtest.js:201-206`) but which means none of the
   timing results above are what a reader would have seen at the time.
