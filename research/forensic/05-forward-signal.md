# 05 — Forward Signal Audit

**Agent 5 · Forward Signal Researcher · 2026-08-14**
**Scope:** can OOZEMeter distinguish what already happened / what is happening now /
what may be developing? Read-only audit. No production code was modified.

**Reproduce:** every number below comes from FRED CSV
(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=<ID>`), ALFRED vintage CSV
(`https://alfred.stlouisfed.org/graph/alfredgraph.csv?id=NFCI&vintage_date=<D>`),
or `research/backtest-results.json` (generated 2026-08-14T04:10:26Z, methodology 3.0.0).
Scripts are in the session scratchpad under `a5/` and are quoted inline where the
method matters.

---

## 1. Verdict

**OOZEMeter can distinguish "what already happened" from "what is happening now."
It has no third tense, and it currently has no honest way to build one out of the
lines it already owns.**

Three findings drive that:

1. **Every weighted line is coincident or lagging.** Against NBER recession months,
   the jar itself peaks **9 months after** the recession window (r = 0.576 at
   h = −9). The two lines with fast arms — employment and housing — reach them
   through `Math.max()`, which switches silently between a leading arm and a
   lagging arm and is presently sitting on the lagging one.

2. **The classic forward diagnostics lead recessions but do *not* lead the jar.**
   Initial claims, continued claims and payrolls all show *negative* forward
   correlation with the jar (ICSA: r = −0.10 at h = 6, r = −0.12 at h = 12). This
   is not noise — it is structural, and I traced the mechanism (§5.3). Building an
   OOZE WATCH panel out of labour indicators would put the site in the position of
   pointing at a signal whose own construction contradicts it.

3. **The Flow survives its central claim and fails its statistical one.** The
   onset-detection property is real and robust across 64 parameter settings and
   across data vintages. The "four confirmed, one cleared" record is not evidence:
   it is three independent macro episodes, p = 0.25 against the correct base rate,
   and NFCI's forward skill against the jar collapses from r = 0.38 to r = 0.09
   out of sample after 2015.

The Flow should ship. It should ship as a **change detector on the financial
plumbing with pre-registered verification**, exactly as designed — and it must
never be allowed to imply a direction for the jar, because on the evidence it
does not have one. The doc's own Rule 3 ("no implied score") turns out to be not
merely prudent but load-bearing.

Two live editorial claims need correction before any forward layer ships (§7).

---

## 2. The three-tense question, answered

| Tense | Does OOZEMeter have it? | Evidence |
|---|---|---|
| **What already happened** | Yes, well | credit peaks h = −9 vs recessions, auto h = −6; the archive and the monthly seal are built for this |
| **What is happening now** | Yes, partially | gas, mortgage rate, claims-arm, NFCI all publish weekly; but the headline seals a *complete month*, so "now" is 15–45 days old |
| **What may be developing** | **No** | no weighted line leads the jar; the only instrument with out-of-sample forward skill (term spread) is not in the building |

The jar is a **level instrument on realized household pressure**, and it is a good
one. The gap the operator feels — "it is late" — is real and is *by design*, not by
defect. The Flow is the correct architectural response. What must not happen is
solving it by adding forward series to the score.

---

## 3. Classification of every existing signal

Method: (a) cross-correlation of each line's stress against the NBER recession flag
(USREC) at h = −18…+18, h > 0 = leads; (b) cross-correlation of each line's 3-month
stress change against the *leave-one-out* jar so the line is not correlated with
itself; (c) cyclical turning point vs NBER peaks on the underlying FRED series.

| Line | Weight | Underlying | Peak h vs USREC | r | **Class** |
|---|---|---|---|---|---|
| employment | 24.25 | `UNRATE` ∨ `ICSA` | −10 | 0.430 | **LAGGING** (see §3.1) |
| housing | 19.40 | `MORTGAGE30US` ∨ `DRSFRMACBS` | −13 | 0.372 | **LAGGING** (see §3.1) |
| credit | 19.40 | `DRCCLACBS` | −9 | 0.517 | **LAGGING** |
| auto | 14.55 | NY Fed HHDC auto 30+ | −6 | 0.530 | **LAGGING** |
| gas | 9.70 | `GASREGW` | +8 | 0.325 | **COINCIDENT** (see note) |
| inflation | 9.70 | `CPIAUCNS` YoY | −2 | 0.309 | **COINCIDENT** |
| financial | 3.00 | `NFCI` | 0 | **0.836** | **COINCIDENT at the level** |
| foreclosures | 0 (aux) | `DRSFRMACBS` | — | — | **LAGGING** |
| manufacturing | 0 (aux) | `INDPRO` | — | — | **COINCIDENT** |
| **THE JAR** | — | composite | **−9** | **0.576** | **LAGGING** |

**Notes on the two that look like exceptions.**

- **gas at h = +8 is not a leading indicator.** It is one episode: the 2008 oil
  spike preceded the recession trough. Under the Flow rule GASREGW fires 7 times
  since 2003 with 57% confirmation (lift 1.74), and its forward correlation with
  the jar is not distinguishable from the price feeding straight into its own
  9.7% weight. Claim type: **CORRELATION**, single episode.
- **financial at h = 0, r = 0.836 is the strongest coincident reading in the
  building** — and that is the point. NFCI's *level* is coincident with recessions.
  Its *6-month change* is what leads (r = 0.38–0.39 against the jar at h = 6–12).
  Level and change are different instruments. The score uses the level; the Flow
  uses the change. That separation is correct and should be stated in the copy.

### 3.1 The `Math.max()` problem — a genuine forward-signal defect

`scripts/collect.js:108` and `scripts/backtest.js:108`:

```js
jobs: Math.max(interp(ANCHORS.unemployment, un), interp(ANCHORS.claimsK, icsa/1000)),
```

`scripts/collect.js:110` does the same for housing with mortgage rate vs mortgage
delinquency.

The employment line is a **leading arm (claims) and a lagging arm (unemployment)
fused by `max()`**, and nothing anywhere discloses which arm is live. Over
2003-01…2026-07 (n = 282 months) the unemployment arm was active 133 months (47%),
the claims arm 148 months (52%), and **the line switched arms 38 times** — 22 of
those since 2016.

Right now the lagging arm is live and the leading arm is nowhere near it:

```
UNRATE 4.1%   → employment stress 13.0   ← ACTIVE
ICSA 4wk 203k → employment stress  5.8
```

Because `max()` can only ever *raise* the reading, **initial claims must rise 14%
(203k → 232k) before the employment line moves a single point.** The jar's fastest
labour sensor is currently mute and the site does not say so. Housing has the same
structure and is worse: the lagging delinquency arm has been live for 174 of 282
months (62%).

Claim type: **SUPPORTED-EXPLANATION** — the mechanism is the `max()` in the source,
and the arm-activity counts are computed from the same anchors the collector uses.

This is distinct from the documented PAYEMS defect
(`research/EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md`) and is not a restatement of
it: that defect is about a series the line never reads; this one is about the two
series it does read disagreeing about what tense the line is in.

---

## 4. The Flow — independent re-test

I ran `research/flow-replay-2007.js` unmodified and then re-derived everything
independently. **Full credit where due: the doc's arithmetic reproduces.**

### 4.1 What reproduces exactly

| Doc claim | My result | Status |
|---|---|---|
| naive 95th-pct threshold = 0.511 | **0.511** | ✅ exact |
| naive threshold fires 5.0% of weeks | **5.0%** (146/2897) | ✅ exact |
| Aug-2007 peak move 0.445 < threshold → misses | **0.445, does not fire** | ✅ exact |
| era table 1971-99 = 127 firings | **126** | ✅ (±1, binning) |
| z-rule fires 1.9% of weeks, 24/1232 | **1.9%, 24/1232** | ✅ exact |
| 5 episodes since 2003, 0.21/yr | **5, 0.21/yr** | ✅ exact |
| horn 2007-07-20, peak z 8.0 on 2007-08-03 | **identical** | ✅ exact |
| claims horns include Katrina/Sandy/shutdown | **2005-09-10, 2012-11-10, 2013-10-05 all present** | ✅ confirmed |

This is a well-executed piece of work and it deserves to be said plainly before the
criticism starts.

### 4.2 The onset property is robust — this is the Flow's real claim

I swept W ∈ {2,4,8,13} × LB ∈ {52,104,156,260} × Z ∈ {2.5,3,3.5,4} = **64
configurations**. The 2007 first-horn date across all 64:

```
earliest 2007-07-06   ·   median 2007-07-20   ·   latest 2007-08-03
```

Every single configuration fires before the Fed's 2007-08-17 discount-rate cut, and
61 of 64 fire on or before Cramer's 2007-08-03 rant. **The onset-detection property
is not a parameter artifact.** Claim type: **SUPPORTED-EXPLANATION**.

It also survives the vintage test, which is stronger evidence than the doc claims
for itself (§4.4).

### 4.3 The "four confirmed, one cleared" record is not evidence

The doc flags this as its weakest link and asks for it to be fixed first. I fixed it.
Here is the answer.

**Base rate.** Over the same 2003-01…2026-07 window, the unconditional probability
that *any* month is followed by a jar rise of ≥3 points within 6 months is **33%**.

| jar rise | W=3mo | W=6mo | W=9mo | W=12mo |
|---|---|---|---|---|
| ≥1 pt | 47% | 53% | 57% | 59% |
| ≥3 pt | 24% | **33%** | 37% | 40% |
| ≥5 pt | 15% | 26% | 31% | 34% |
| ≥10 pt | 4% | 13% | 20% | 25% |

So "4 of 5" = 80% against a 33% base rate. Lift **2.44**.

**Good news the doc did not claim for itself:** the record is *robust to the
confirmation threshold*. Across pts ∈ {1,2,3,4,5,7,10} at window ≥ 6 months, the
horn-conditional rate is 80% in every single cell. Only the 3-month window degrades
it (60% / 40% / 20%). The post-hoc choice of "3 points" was therefore **not** what
produced the result. The choice of *window* was, and 6 months is the shortest window
that works.

**Bad news, and it is decisive.** The five horns are not five trials:

```
2007-07-20 ┐
2007-11-23 ├─ one macro episode (GFC)
2008-09-19 ┘
2018-02-16  ─ Volmageddon
2020-02-21  ─ COVID
```

Three independent episodes. Cluster-level record: **2 of 3**.

```
one-sided binomial P(≥4 of 5 | p=0.33) = 0.043    ← the doc's framing
one-sided binomial P(≥2 of 3 | p=0.33) = 0.253    ← the honest n
```

**p = 0.25. There is no statistical evidence here.** The doc's own caution ("n = 5,
suggestive not established") is correct in direction and understates the problem by
about one order of magnitude in n.

**Worse: the skill is entirely pre-2015.** Using expanding-window z-scores with no
lookahead, correlation of the signal against the jar's forward change:

| signal | full sample h=6 | full h=12 | **OOS 2015+ h=6** | **OOS 2015+ h=12** |
|---|---|---|---|---|
| NFCI Δ6 | 0.38 | 0.39 | **0.09** | **0.16** |
| T10Y3M level | 0.32 | 0.44 | **0.26** | **0.31** |
| NFCI + T10Y3M | 0.44 | 0.54 | 0.28 | 0.35 |

NFCI's forward relationship with the jar is a GFC artifact. This is not a new
discovery — `research/market-signal-review-2026-07-28.md:186` already found "the
entire measurable benefit lives inside 2007-2009," and `lab.js:113` already says so
in public. **The Flow inherits that limitation and must inherit the disclosure with
it.** Claim type: **SUPPORTED-EXPLANATION**.

### 4.4 The vintage test — the finding the doc could not have made

The doc's revision caveat says "we cannot say we would have caught it live in 2007."
That understates it, and I can now quantify by how much.

I queried ALFRED for the earliest NFCI vintage containing 2007 observations:

```
vintage 2011-04-01 → 0 observations for 2007
vintage 2011-05-01 → 0 observations for 2007
vintage 2011-05-15 → 0 observations for 2007
vintage 2011-06-01 → 52 observations for 2007   ← first vintage that exists
```

**The NFCI did not exist in 2007.** The Chicago Fed first published it, with
back-history, in roughly May 2011 — about four years after the horn. Nobody could
have run this rule in 2007 by any means, and no revision policy fixes that. The
correct public phrasing is "the rule detects onset in a reconstruction of 2007,"
never "it would have warned you." The doc is close to this but says it as a
revision caveat rather than an existence fact.

**Then the good part.** I re-ran the identical rule on that 2011 vintage:

```
week         NFCI(2026)  z(2026)  state  |  NFCI(2011)  z(2011)  state
2007-06-29     -0.481      0.75   quiet  |    -0.660      3.32   HORN
2007-07-13     -0.413      2.98   BUILD  |    -0.660      2.53   BUILD
2007-07-20     -0.345      5.04   HORN   |    -0.590      3.33   HORN
2007-08-03     -0.140      8.04   HORN   |    -0.340      6.79   HORN
2007-08-17      0.098      6.97   HORN   |    -0.080      6.93   HORN
```

The horn fires on the 2011 vintage too — three weeks *earlier* (2007-06-29). **The
onset detection is revision-robust.** That is a real strengthening of the Flow's
case and the doc should claim it.

**And the part that breaks.** Over the identical 2003-01…2011-05 window:

| vintage | horn weeks | rate | episodes | rate |
|---|---|---|---|---|
| current (2026-08) | 14 / 438 | 3.2% | 3 | 0.36/yr |
| earliest existing (2011-06) | 16 / 438 | 3.7% | **5** | **0.60/yr** |

The 2011 vintage produces two episodes that **today's data says never happened**:
**2005-04-22** (z 3.5) and **2007-01-26** (z 3.4).

So the doc's headline — *"Five episodes in 23 years. Every one a real financial
event. Zero junk."* — is a property of the **current revision**, not of the
instrument. On the only vintage that ever actually existed, the same rule fires 67%
more often over the same window and produces two episodes the doc's roster does not
contain and does not explain.

Revision magnitude, 2003-2011, 2011-vintage vs today:

```
mean |Δ| = 0.172      max |Δ| = 0.771      n = 438 weeks
```

`scripts/collect.js:222` and `scripts/backtest.js:199` declare an expected NFCI
churn tolerance of **0.02** on the monthly mean. That tolerance governs run-to-run
churn, not multi-year revision — but nothing in the repo tracks the latter, and it
is **~9× larger on average and ~38× at the extreme.**

Translated through `FINANCIAL_CONDITIONS_ANCHORS`
(`scripts/lib/methodology.js:10`, slope 60 stress-points per NFCI unit on the live
segment), a 0.172 revision is ≈ 10 stress points on the financial line — but only
**0.44 jar points**, because the weight is 3%.

**This is the sharpest architectural point in the audit.** The 3% weight is what
insulates the published score from NFCI revision. The Flow's z-score design is
weight-free by construction — the doc celebrates this at line 336, correctly — and
that same property **removes the insulation entirely.** The Flow is maximally
exposed to the one input whose revisions the jar was deliberately protected from.
The doc's open question 3 ("how does a horn survive a data revision?") is therefore
not a nicety; it is the Flow's primary operational risk, and the answer "the horn
stands, the revision is noted" is right but insufficient — the *roster* must also
be versioned, because the roster changes.

Claim type: **SUPPORTED-EXPLANATION**.

### 4.5 Two smaller reproduction gaps

- **Oil→gas verification window used a different oil series than the horn will.**
  The doc's instrument table specifies "Oil (WTI, 4wk % change)" but the lag table
  does not reproduce on WTI. It reproduces on **Brent**:

  | lag | doc | my WTI (`DCOILWTICO`) | my Brent (`DCOILBRENTEU`) |
  |---|---|---|---|
  | 0 wk | 0.524 | 0.482 | 0.575 |
  | **1 wk** | **0.632** | **0.535** | **0.652** |
  | 2 wk | 0.610 | 0.493 | 0.606 |
  | 3 wk | 0.529 | 0.406 | 0.513 |
  | 6 wk | 0.191 | 0.118 | 0.177 |

  The **shape** — peak at 1 week, dead by 6 — reproduces on both, so the
  pre-registered 3-week verification window is sound. But the doc measures
  transmission on Brent and proposes to horn on WTI, whose transmission is
  measurably weaker (0.535 vs 0.652 at peak). Pick one series and use it for both.
  Severity: MINOR, but it is exactly the kind of thing that erodes trust when a
  reader checks.

- **Claims episodes: I count 12 since 2003, the doc says 10.** All three named
  junk horns are present (Katrina, Sandy, shutdown), so the qualitative claim
  stands. Note also `2020-03-14` produces **z = 197.1** — a numerical artifact of a
  near-zero trailing σ. Any surface that renders z needs a cap and a regime-break
  guard, or it will publish a nonsense number on the most-watched week of a
  generation.

### 4.6 Verdict on the Flow

**Adopt it. Narrow the claim.**

| The Flow may say | Evidence |
|---|---|
| "This instrument moved more than it has moved in [N] years" | **SUPPORTED** — robust across 64 parameter sets and 2 vintages |
| "It moved at the onset of the 2007 credit seizure in a reconstruction of that period" | **SUPPORTED**, with the existence caveat |
| "Here is the series and window that will confirm or clear it, named in advance" | **SUPPORTED** for oil→gas (measured, 1-week peak); **UNKNOWN** for NFCI→household |
| "This could push the Ooze up" | **NOT SUPPORTED** — OOS r = 0.09 |
| "4 of 5 horns were confirmed" | **NOT SUPPORTED as skill** — n = 3 episodes, p = 0.25 |

Do not publish the 4-of-5 record as a track record. Publish it as *the log*, which
is what the state machine is for, and let it accumulate. At 0.2–0.6 horns/year it
will take roughly fifteen years to reach n = 10 independent episodes. Say that out
loud rather than implying the record is already informative.

---

## 5. Candidate forward diagnostics — tested

### 5.1 Method

Three independent tests, all reported because they disagree and the disagreement is
the finding:

1. **Turning point vs NBER peaks** — month the 3-month-smoothed series reached its
   cyclical best within [peak−30, peak+3]. Sanity check: `PAYEMS` returns median
   lead **0 months**, which is the textbook coincident answer, so the method works.
2. **Forward skill vs the jar** — `corr(signal_t, jar_{t+h} − jar_t)`, with circular
   block bootstrap (24-month blocks, 4000 draws) for p, and partial correlation
   controlling for the jar's own trailing 6-month momentum.
3. **Flow rule applied to the candidate** — horn rate, confirmation rate, lift.

### 5.2 Results

Forward skill against the jar, 2003-01…2026-07. `rp` = after removing the jar's own
momentum, which is the number that matters — a signal that only restates the jar's
existing trend adds nothing.

| signal | h=6 r | p | rp | h=12 r | p | rp |
|---|---|---|---|---|---|---|
| **T10Y3M level** | 0.31 | 0.046 | 0.29 | **0.43** | **0.026** | **0.40** |
| **NFCI Δ6** | **0.38** | **0.004** | 0.35 | 0.38 | 0.004 | 0.35 |
| **DRTSCILM Δ6** | 0.38 | 0.007 | 0.33 | 0.39 | 0.008 | 0.34 |
| DRTSCLCC Δ6 | 0.37 | 0.011 | 0.32 | 0.35 | 0.018 | 0.30 |
| JTSJOL %Δ6 | 0.33 | 0.011 | 0.29 | 0.23 | 0.141 | 0.15 |
| PERMIT %Δ6 | 0.26 | 0.062 | 0.21 | 0.36 | 0.021 | 0.31 |
| AWHAETP Δ6 | 0.27 | 0.048 | 0.23 | 0.24 | 0.094 | 0.21 |
| JTSQUR Δ6 | 0.22 | 0.067 | 0.15 | 0.16 | 0.228 | 0.06 |
| NEWORDER %Δ6 | 0.20 | 0.134 | 0.15 | 0.08 | 0.609 | 0.01 |
| TEMPHELPS %Δ6 | 0.19 | 0.140 | 0.10 | 0.17 | 0.231 | 0.06 |
| UMCSENT Δ6 | 0.16 | 0.159 | 0.10 | 0.22 | 0.078 | 0.15 |
| SAHMREALTIME Δ6 | 0.14 | 0.172 | 0.05 | 0.05 | 0.644 | −0.08 |
| **ICSA %Δ6** | **−0.10** | 0.294 | −0.23 | **−0.12** | 0.271 | −0.27 |
| **PAYEMS %Δ6** | **−0.06** | 0.589 | −0.19 | **−0.12** | 0.305 | −0.29 |

Turning-point lead vs NBER peaks (median over available recessions), for contrast:

```
ICSA 19mo · CCSA 17mo · TEMPHELPS 17mo · AWHMAN 17mo · PERMIT 20mo · HOUST 20mo
JTSQUR 22mo · UMCSENT 22mo · JTSJOL 14mo · UNRATE 13mo · PAYEMS 0mo (coincident ✓)
```

**These two tables are the audit's central result.** Claims, continued claims, temp
help, permits and sentiment all lead *recessions* by 14–22 months — and lead *the
jar* by nothing at all, or negatively.

### 5.3 Why the labour signals fail — mechanism, tested

I took the 30 months with the largest 6-month rise in initial claims (spread across
eight distinct years — 2005, 2007, 2008, 2009, 2017, 2020, 2023, 2024, so this is
not one episode) and measured what each jar line did over the *following* 6 months:

| line | after a claims surge | all months |
|---|---|---|
| financial | **−9.9** | +0.1 |
| gas | **−5.3** | +0.5 |
| inflation | **−1.8** | +0.2 |
| employment | +0.3 | −1.0 |
| auto | +1.3 | −0.3 |
| credit | +2.7 | −0.6 |
| housing | +6.5 | +0.2 |
| **JAR** | **+1.5** | −0.4 |

When the labour market cracks, the Fed eases and commodities fall. Financial
conditions loosen by 9.9 stress points, petrol falls 5.3, inflation falls 1.8 — and
those three lines carry 22.4% of the jar between them. They very nearly cancel the
6.5 + 2.7 + 1.3 that housing, credit and auto contribute.

**The jar's price and rate lines systematically offset its distress lines during a
labour downturn.** Net effect of a large claims surge on the jar six months later:
+1.5 points, against an unconditional −0.4.

Claim type: **SUPPORTED-EXPLANATION** — the mechanism (policy easing and commodity
relief) is standard macro, and the line-level decomposition above measures it inside
this specific instrument.

**Consequence for design:** an OOZE WATCH panel built on labour deterioration would
be pointing at conditions that, on this instrument's own 23-year record, move the
jar by about a point and a half. Publishing "these conditions could push the Ooze
up" over a claims surge would be a claim the backtest actively contradicts. This is
the single most important thing to get right, and it is counter-intuitive enough
that it will need to be said in the copy.

By contrast, the same table for the 30 most-inverted `T10Y3M` months, measured 12
months forward:

| line | after deep curve inversion |
|---|---|
| auto | +8.6 · employment +5.9 · financial +5.5 · credit +4.4 · housing +2.1 |
| inflation | −5.0 · gas −2.2 |
| **JAR** | **+4.8** |

Here the distress lines win. **Caveat, and it is severe:** 24 of those 30 months are
2023-2024 and the other 6 are 2006-2007. That is **two episodes**, not thirty
observations. Claim type: **CORRELATION with a plausible mechanism**, not
established.

### 5.4 Assignments

| Instrument | FRED | Verdict | Evidence |
|---|---|---|---|
| **NFCI** (4wk Δ) | `NFCI` | **DIAGNOSTIC** — the Flow's first horn | 0.21/yr current vintage, 0.60/yr on 2011 vintage; onset-robust across 64 params and 2 vintages; forward skill GFC-only (OOS r=0.09) |
| **T10Y3M** (level) | `T10Y3M` | **FORWARD WATCH** | best OOS forward skill of anything tested (h=12 r=0.43, p=0.026, rp=0.40); best recession-onset correlation (0.366 over 1982-2026); not in the jar, so non-circular |
| **DRTSCILM / DRTSCLCC** (SLOOS) | `DRTSCILM`, `DRTSCLCC` | **FORWARD WATCH** | h=9 r=0.42/0.41, p<0.011; 2nd-best recession-onset correlation (0.202); quarterly, ~44-day lag; fires 0 horns — watch-shaped, not horn-shaped |
| **JTSJOL** (openings) | `JTSJOL` | **FORWARD WATCH (probationary)** | h=6 r=0.33, p=0.011, but decays to 0.23 (p=0.141) by h=12; only 25 years of history, 2 recessions |
| **AWHAETP** (avg weekly hours) | `AWHAETP` | **EXPERIMENTAL** | h=6 r=0.27, p=0.048 — but history starts **2006-03**, so 2 recessions and no pre-GFC calm. Cannot be calibrated against a full cycle |
| **PERMIT** (building permits) | `PERMIT` | **EXPERIMENTAL** | h=12 r=0.36, p=0.021; 20-month median recession lead; but 11 fires under a 2σ rule with 7 false (36% hit rate) |
| **T10Y3M / T10Y2Y** (4wk Δ, as a horn) | — | **REJECT** | direction-confused: 5 of 10 horns are *steepening* (2007-06, 2007-08, 2008-10, 2019-11, 2020-03) = Fed easing = reaction to stress already visible. Its 80% confirmation rate is contaminated by this. See §6.2 |
| **ICSA** (as a jar-forward signal) | `ICSA` | **REJECT** for OOZE WATCH; **KEEP** as a now-cast | forward r = −0.10 / −0.12; under the Flow rule 12 episodes at 42% confirmation (lift 1.27) with Katrina/Sandy/shutdown junk. Already in the score via the `max()` arm |
| **CCSA** (continued claims) | `CCSA` | **REJECT** | forward r = −0.08 / −0.13; Flow rule gives 29% confirmation — **below the 33% base rate**, i.e. worse than nothing |
| **JTSQUR** (quits) | `JTSQUR` | **REJECT** | h=6 r=0.22 p=0.067, collapses to rp=0.06 at h=12 — adds nothing over the jar's own momentum |
| **TEMPHELPS** | `TEMPHELPS` | **REJECT** | h=6 r=0.19, p=0.140; leads recessions by 17mo and the jar by nothing |
| **NEWORDER** (core capex) | `NEWORDER` | **REJECT** | h=12 r=0.08, p=0.609, rp=0.01 |
| **UMCSENT** | `UMCSENT` | **REJECT** | h=6 r=0.16, p=0.159; 9 fires under a 2σ rule with 7 false (22% hit rate). See §6.1 — it is the most dangerous candidate on the list |
| **DRCCLACBS transitions** | `DRCCLACBS` | **CORE SCORE (already)** | h=3 r=0.40 looks forward but this *is* the credit line at 19.4%. Circular. No new line |
| **SAHMREALTIME** | `SAHMREALTIME` | **REJECT** | h=6 r=0.14 p=0.172; 5 fires, 0 preceded a recession within 12 months under the 2σ rule (it triggers *at* or after onset by construction) |

### 5.5 Does combining them pay?

Expanding-window z-scores, no lookahead, equal weight:

| set | full h=6 | full h=12 | OOS 2015+ h=6 | OOS 2015+ h=12 |
|---|---|---|---|---|
| NFCI alone | 0.38 | 0.39 | 0.09 | 0.16 |
| T10Y3M alone | 0.32 | 0.44 | 0.26 | 0.31 |
| **NFCI + T10Y3M** | 0.44 | **0.54** | 0.28 | **0.35** |
| + SLOOS ×2 | 0.50 | 0.52 | 0.30 | 0.28 |
| + JOLTS + PERMIT | 0.53 | 0.55 | 0.29 | 0.30 |
| all seven | 0.38 | 0.43 | 0.34 | 0.38 |

**Two instruments capture essentially all of it.** Going from two to six raises the
in-sample number and does not improve out-of-sample. Per the brief's own standard —
more data does not mean a better instrument — **stop at two.**

And the composite is not yet publishable as a trigger. A threshold rule on
NFCI+T10Y3M fires 4 times at z ≥ 1.0 (3 confirmed vs 39% base) but **0 times** at
z ≥ 1.5, and shifting the threshold from 1.0 to 1.25 changes the fire set completely
(2007-08, 2008-12, 2020-04, 2022-11 → 2023-03, 2024-08). That is not a stable
instrument. **The watch panel must be a panel of named readings, not a composite
score.**

---

## 6. False positives and false negatives — the ledger

The brief asks for these as prominently as the successes. Here they are.

### 6.1 The false positive sitting on the board right now

`UMCSENT` reads **49.5** as of 2026-06 — the **0th percentile** of its entire
2003-2026 range. The lowest consumer sentiment in the jar's whole published history,
while the jar reads 26 and the band says "Sticky."

That is a story. It is also, on the evidence, **noise**: h=6 r = 0.16, p = 0.159;
9 fires under a 2σ rule of which 7 were false. If OOZE WATCH shows percentile
rankings without skill weights, this is the first thing a reader will see and the
first thing that will be wrong. **Any watch panel must be able to display "record
low, and it does not predict this instrument" on the same row.**

### 6.2 The false positive hiding inside a good-looking number

`T10Y3M` under the Flow rule scores **8/10 confirmed (80%), lift 2.44** — matching
NFCI on a larger sample. It looks like the best horn instrument available.

Direction audit of the 10 horns:

```
2007-06-08  spread 0.35   4wk +0.63  z  3.8  STEEPENING
2007-08-17  spread 0.92   4wk +0.93  z  4.7  STEEPENING
2008-01-07  spread 0.59   4wk -0.77  z -3.1  flattening
2008-10-10  spread 3.64   4wk +1.19  z  3.0  STEEPENING
2008-12-15  spread 2.50   4wk -1.06  z -3.0  flattening
2011-08-19  spread 2.05   4wk -0.89  z -3.2  flattening
2019-11-04  spread 0.26   4wk +0.45  z  3.1  STEEPENING
2020-03-17  spread 0.83   4wk +1.03  z  5.5  STEEPENING
2022-06-03  spread 1.75   4wk -0.52  z -3.4  flattening
2022-07-01  spread 1.15   4wk -1.06  z -5.4  flattening
```

**Five of ten are steepening** — the curve un-inverting because the Fed is cutting
or money is fleeing to bills. That is a *response* to stress the world has already
priced. The Flow is direction-agnostic by design (Rule 4), which is right for
detection — but it means this instrument's headline confirmation rate is half
early-warning and half "the fire brigade arrived." Rejecting T10Y3M as a horn while
adopting its *level* as a watch reading resolves this cleanly.

### 6.3 The false negatives

- **`CCSA` under the Flow rule confirms 29% of the time against a 33% base rate.**
  Lift 0.87. It is actively worse than a coin weighted to the base rate.
- **`SAHMREALTIME` fired 5 times since 1959 and none of them preceded a recession
  start by 1–12 months.** The Sahm rule is a real-time *recession identifier*, not a
  leading indicator, and it should never be presented as advance warning.
- **The jar itself has never given advance warning of a recession in its published
  window.** Its +5-point trigger fired 2004-05, 2005-03, 2005-07 (all false),
  2020-03 (0 months lead), 2022-04 (no recession). For the 2008-01 NBER peak the
  jar's +5 trigger fired 2006-01 — 24 months early, which sounds impressive until
  you see 2004-05 and 2005-03 fired the same way with nothing behind them.

### 6.4 Junk horns the Flow will produce and must pre-announce

Confirmed on `ICSA`: **2005-09-10** (Katrina), **2012-11-10** (Sandy),
**2013-10-05** (government shutdown). The doc already flags this. I confirm all
three and add: **2020-03-14 produces z = 197.1**, a divide-by-tiny-σ artifact. Cap
the displayed z and guard for regime breaks before anything renders it.

---

## 7. Two live editorial claims that must be corrected first

Both are directly in scope: they are the site's only published early-detection
claims, and a forward layer cannot ship on top of them.

### 7.1 "It made the score climb about a month earlier" — technically true, materially misleading

`lab.js:113` and `articles.js:297`:

> "in backtesting it made the score climb about a month earlier during the slow
> credit tightening of 2007–08"

I rebuilt the composite with and without the financial line, **each independently
recalibrated to its own calm→10 / GFC→90 anchors** so the comparison is fair:

```
month      with financial       without financial
2007-12       56.95 → 57           56.13 → 56
2008-01       59.22 → 59           58.63 → 59
2008-02       59.78 → 60           58.99 → 59      ← the entire claim
2008-03       63.13 → 63           62.08 → 62

ROUNDED first month ≥ 60:   with 2008-02   ·   without 2008-03
```

The claim **reproduces exactly** — and it is one band crossing, in **February 2008**,
produced by 59.78 rounding up to 60 while 58.99 rounds down to 59. A margin of
**0.79 points at a rounding boundary**.

February 2008 is:
- **two months after** the NBER peak (2007-12),
- **seven months after** the Flow's NFCI horn (2007-07-20),
- **six months after** the financial line's own stress had already jumped from 17.0
  to 43.8 (2007-07 → 2007-08).

It is not early warning. It is a rounding artifact deep inside a recession, and the
margin producing it is smaller than NFCI's mean multi-year revision (0.172 NFCI
units ≈ 10 stress points ≈ 0.44 jar points). **A future revision can erase this
claim outright.**

The evidence file `research/gfc-sensitivity-results.json` is consistent with my
result and honest: at `"w": 3` the `"earlier"` array is `[]` — that study evaluates
ex-GFC, and found nothing. `research/market-signal-review-2026-07-28.md:186` states
the conclusion correctly: *"the entire measurable benefit lives inside 2007-2009."*

The problem is only in the reader-facing copy, which compresses "one rounded band
crossing in Feb 2008" into "made the score climb about a month earlier," in a
sentence whose surrounding context is about early detection. Severity: **MAJOR**.
Recommended replacement, same length, defensible:

> "In backtesting, the 3% weight moved a single band crossing forward by one month —
> February 2008 instead of March — on a margin of under one point. That is the whole
> measured benefit, it sits inside the 2007-09 crisis, and it arrived two months
> after the recession had already begun."

### 7.2 The Flow doc's "zero junk" roster is vintage-dependent

`research/THE-FLOW-ARCHITECTURE-2026-08-12.md:90`:

> "Five episodes in 23 years. Every one a real financial event. Zero junk."

True on current data, false on the only vintage that ever existed (§4.4): the 2011
vintage adds 2005-04-22 and 2007-01-26 over the same window. Severity: **MAJOR**,
and it is pre-publication, so it costs nothing to fix now.

Also worth noting: the doc's own monthly table (line 280) shows 2007-08 financial
stress **41.9**; the backtest regenerated two days later reads **43.8**. Same for
2007-07 (14.8 → 17.0). The doc's numbers were already stale within 48 hours. Any
published Flow surface needs a vintage stamp.

---

## 8. OOZE NOW / OOZE WATCH — proposed design

Constrained by `research/editorial/OOZEMETER-EDITORIAL-CONSTITUTION.md`:
- §2.4 — "what to watch next" is **a named date and the data that lands on it,
  never an outcome"**
- §5 — "**Never predict** … when a gauge carries a predictive reputation, report the
  reputation, never the prediction, and **never attach the reputation to a gauge
  that is not elevated**"
- and by the Flow doc's Rule 3 — no implied score.

### 8.1 The relationship, stated once

```
OOZE NOW      the jar. Realized household pressure, sealed monthly.
              LEVEL. Answers "how bad is it."      ← unchanged, still the product

THE FLOW      event detector. Fires when one instrument moves ≥3σ against its own
              recent behaviour. Silent most weeks. CHANGE, not badness.
              Answers "did something just move."   ← ships as designed

OOZE WATCH    standing panel of two named forward readings and where they sit in
              their own history. Always visible, usually boring.
              CONDITIONS. Answers "what is the weather upstream."
```

Three surfaces, three questions, **no arithmetic between them** — the same rule the
Constitution already applies to the jar and Ward M.

The distinction that keeps WATCH legal: **the Flow reports an event, WATCH reports a
standing condition.** An event invites "what happens next." A standing condition
invites "this is how things are set up." Only the second can be published without a
forecast, because it makes no reference to time.

### 8.2 What goes on the WATCH board

Exactly two rows, per §5.5. Both non-circular, both with p < 0.05 and out-of-sample
skill, both currently free.

| Row | Series | Cadence | Lag | Why it earns a row |
|---|---|---|---|---|
| **Cost of money, out to ten years** | `T10Y3M` | daily | 1 day | best OOS forward skill measured (h=12 r=0.43, rp=0.40); best recession-onset correlation (0.366, 1982-2026) |
| **What banks are doing with credit** | `DRTSCILM` + `DRTSCLCC` | quarterly | ~44 days | h=9 r=0.42/0.41, p<0.011; second-best recession-onset correlation (0.202) |

Candidates deliberately excluded and why, printed on the page itself: initial claims
(negative forward correlation with the jar), consumer sentiment (record low and no
measured skill), the Sahm rule (identifier, not leading indicator), job openings
(probationary, decays by h=12).

**Publishing the exclusions is the trust move.** A reader who wonders "why isn't
sentiment on here, it's at a record low" gets an answer instead of suspecting an
agenda.

### 8.3 The sentence grammar — what WATCH may and may not say

Each row renders exactly three facts and one caveat. Nothing else.

```
✅  reading + as-of + where it sits in its own record
      "The 10-year/3-month spread is +0.76, as of 13 August.
       That is the 35th percentile of its range since 2003."

✅  what the condition IS, present tense, no time reference
      "Money costs less over three months than over ten years — the ordinary
       arrangement. Since 2022 that was inverted for 23 straight months."

✅  the reputation, only when elevated, attributed, never applied
      "Economists watch this line because it has historically turned before
       recessions. We are reporting that reputation, not applying it."

✅  the measured limit, always
      "In our own record this line's connection to the jar rests on two
       episodes. Treat it as weather, not a warning."

❌  "could push the Ooze up"           — implies direction; OOS r = 0.09 for NFCI
❌  "if these persist, expect …"        — conditional forecast is still forecast
❌  a WATCH composite score             — threshold-unstable (§5.5)
❌  any arrow, gauge or colour ramp     — visual grammar of the jar implies the jar
❌  recession vocabulary on a calm row  — Constitution §5, explicitly
```

The brief's own phrasing — "these conditions could push the Ooze this direction if
they persist" — **is a forecast** and I recommend against it. It names a direction
for the jar. My testing cannot support a direction for the jar from any instrument
out of sample except the term spread at r = 0.31, on two episodes. The honest form
drops the jar from the sentence entirely and describes the condition.

### 8.4 What the board reads today

| Row | Reading | As of | Own-history position |
|---|---|---|---|
| 10y–3m spread | **+0.76** | 2026-08-13 | 35th pct since 2003; positive; was −0.04 a year ago |
| Bank lending standards, C&I | **0.0** net tightening | 2026-07-01 | 51st pct; loosened 5.3 over 6 months |
| Bank lending standards, cards | **+6.7** net tightening | 2026-07-01 | 64th pct; tightened 6.7 over 6 months |
| **Flow** | **QUIET**, z = −0.36 | 2026-08-07 | no horn; last horn 2020-04-03 |

Honest summary line: *"Nothing on the watch board is elevated. Card standards
tightened modestly this quarter. The Flow has been quiet for six years."*

That is a boring board. **A boring board is the product working.** The Flow doc's
insight that "NO HORN is the result" applies to WATCH too, and WATCH is the surface
that will be boring 95% of the time — which is exactly why it must never be given a
score that can be made to look interesting.

### 8.5 Build order

1. **Correct `lab.js:113` and `articles.js:297`** (§7.1). Nothing forward-looking
   ships on top of an overstated early-detection claim.
2. **Ship the Flow on NFCI only**, with: the existence caveat, the vintage stamp,
   a z cap, and the roster versioned per §4.4.
3. **Log horns for a year with no second instrument.** The budget argument in the
   doc is right and the vintage evidence says the true rate is 0.2–0.6/yr, not 0.2.
   Measure it live before adding oil.
4. **Ship OOZE WATCH as two static rows**, no composite, no arrows.
5. **Do not add any forward series to the score.** Ever, on this evidence. The
   `max()` fusion in the employment and housing lines (§3.1) is already an
   unlabelled version of this mistake and should be disclosed before it is repeated.

---

## 9. What I could not determine

Listed so the next agent does not re-run them thinking they are open questions.

1. **Whether the Flow's confirmation record has any skill.** n = 3 independent
   episodes, p = 0.25. Not answerable with the data that exists. Needs ~15 years of
   live logging at the observed horn rate.
2. **Whether NFCI→household is verifiable in a useful window at all.** The doc's own
   open question 4. Oil→gas is measured at 1 week. I found no NFCI→household lag
   with a stable peak; the honest answer may be that some horns stay `pending`
   indefinitely.
3. **Real-time vintages before 2011 for NFCI.** They do not exist. Any pre-2011
   claim about the Flow is necessarily a reconstruction.
4. **Whether `AWHAETP` is any good.** Its history starts 2006-03 — two recessions,
   no pre-GFC calm period. Cannot be calibrated against a full cycle. `AWHMAN` goes
   back to 1939 and leads recessions by a median 17 months, but it is manufacturing
   hours, not total private, and I did not test whether it substitutes.
5. **Whether the term-spread result survives a third episode.** 24 of the 30
   most-inverted months are 2023-24 and 6 are 2006-07. Two episodes.
6. **`TEMPHELP` does not exist on FRED** under that ID (the brief names it). The
   real series are `TEMPHELPS` (SA) and `TEMPHELPN` (NSA). I tested `TEMPHELPS`:
   h=6 r = 0.19, p = 0.140. Rejected.
7. **Whether the `max()` arm-switching has ever produced a published monthly reading
   that moved for a reason the copy misattributed.** 38 switches over 282 months; I
   did not cross-check them against published editions.
