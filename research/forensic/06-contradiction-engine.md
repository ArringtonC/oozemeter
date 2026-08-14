# The Contradiction Engine — specification, base rates, and a live failure

Agent 6 · Forensic audit · 2026-08-14
Status: **specification + evidence. No production code modified.**
Scope: read-only audit of `main` @ `7f6cade`, plus original base-rate computation from FRED/ALFRED.

---

## 0. Verdict

A contradiction engine is worth building, but **not the one the brief describes**. Four of
the nine requested relationships are, when tested against history, either near-impossible
(so a firing means "the data is broken," not "the economy is strange") or so common they
describe the normal state of the American economy. Building all nine as co-equal alarms
would ship an instrument that cries wolf about the 1980s onward.

The engine earns its place for a different reason than the brief assumes. Its value is not
recession prediction — **most of these conflicts have negative predictive lift** — it is
*measurement honesty*: telling a reader when the number that moved the jar moved for a
reason that is not what the label says.

That case is live right now. The published July 2026 reading of **26/100** fell from 27 in
part because the employment line eased one point. It eased because the unemployment rate
fell 4.3% → 4.1%. Over the same three months the labor force participation rate fell 0.4pp
and the employment-population ratio fell 0.2pp, while payroll growth (+60k over three
months) was statistically indistinguishable from zero. The jar recorded an improvement in
employment during a quarter when a smaller share of Americans held jobs.

The engine's first job is to say that out loud. Its second job is to **not** claim it is a
warning — because 78 years of data say it usually isn't.

---

## 1. What I verified in the code

| Claim | Verified | Evidence |
|---|---|---|
| Seven weighted lines, employment 24.25 | ✅ | `scripts/lib/methodology.js:11-19` |
| Calibration frozen `{a:1.418684348943213, b:-23.96514845099034}` | ✅ | `scripts/lib/methodology.js:27` |
| Employment line = `max(interp(UNRATE), interp(ICSA/1000))` | ✅ | `scripts/collect.js:108`, `scripts/backtest.js:108` |
| PAYEMS is never fetched | ✅ | `scripts/collect.js:80` — ids list contains no payroll series |
| Auxiliary zero-weight lines exist with `contributesToOoze:false` | ✅ | `scripts/collect.js:178,182` |
| Ward M divergence already computed and gated | ✅ | `scripts/lib/market-divergence.js:12-29`, `scripts/lib/market-integrity.js:126-128,169` |
| Published month 2026-07, jar 26, prev 27 | ✅ | `data/latest.json` |
| Jobs line eased 1 pt this month | ✅ | `data/latest.json` → `lines.jobs.delta = -1`, `stress = 13`, `movers` includes `{slug:'jobs', delta:-1}` |
| `lab.css` `.down{color:var(--green)}` | ✅ (known) | `lab.css:115`, `lab.css:490` |
| `lab.js` says "Today's 4.4%" vs live 4.1% | ✅ (known) | `lab.js:86,90` |

**New observation not in the known-defect list:** the divergence infrastructure the
contradiction engine needs *already exists* for Ward M — `alignHistories()` produces
`{month, market, household, divergence}` and `market-integrity.js:128` already enforces
`divergence === market - household`. The engine below is the generalization of a pattern
the repo has already proven it can keep zero-weight.

---

## 2. The significance test (stated, not assumed)

The brief's hardest requirement: *"Never flag disagreement just because two numbers moved
differently — you must test economic significance and state the statistical test used."*

I could not verify BLS's published sampling-error figures directly — `bls.gov` returns
HTTP 403 to automated fetches. So the engine does **not** cite them. Instead the noise
floor is derived empirically from the same data path OOZEMeter already uses, and is
therefore reproducible by anyone with the repo.

### 2.1 Payroll noise floor, derived from ALFRED vintages

I pulled 91 monthly PAYEMS vintages (`alfred.stlouisfed.org/graph/alfredgraph.csv?id=PAYEMS&vintage_date=…`),
2019-01 through 2026-07, and compared each month's **first print** against its **current**
value.

| Statistic | All months (n=91) | Excluding 2020-21 (n=67) |
|---|---|---|
| Revision to the **level**, mean absolute | 505k | — |
| Revision to the level, range | −1,246k … +865k | — |
| Revision to the **1-month change**, sd | 147.5k | **83.9k** |
| Revision to the 1-month change, mean absolute | 102.4k | **75.9k** |
| Revision to the 1-month change, p05…p95 | −180k … +270k | −180k … +96k |
| **Sign flips** on the 1-month change | 4.4% | 6.0% |
| Revision to the **3-month change**, sd | 249.1k | — |
| Revision to the 3-month change, mean absolute | 188.3k | — |
| Sign flips on the 3-month change | 2.2% | — |

Largest single revisions to a monthly change: 2020-03 (−701k → −1,398k), 2021-11
(+210k → +658k), 2022-01 (+467k → +190k).

**Test used:** a payroll movement is *economically significant* only if it exceeds
**2× the ex-pandemic revision standard deviation of the same-horizon change** —
≈ **±168k for a 1-month change, ≈ ±500k for a 3-month change**. This is a deliberately
conservative bar and it is the single most important part of the engine.

Consequence for the live month: July 2026 payrolls printed **−23k**, and the 3-month
change is **+60k**. Both are far inside the noise floor. The only honest statement is
*"payroll change over the last quarter is statistically indistinguishable from zero."*
Any engine that reads −23k as "payrolls fell" is a random number generator.

### 2.2 Household-survey noise floor

Vintages cannot measure CPS sampling error (revisions are seasonal-factor-only). The
engine instead uses the **empirical distribution of 3-month changes** in each series over
its full history as its own scale, and sets thresholds at percentiles rather than at
round numbers:

| Series | 3m change sd | Threshold used | Percentile of threshold |
|---|---|---|---|
| UNRATE | — | −0.2pp | ~21st (falls this much or more, 1948-2026) |
| CIVPART | — | −0.2pp | ~22nd |
| Prime-age participation (LNS11300060) | — | −0.3pp | ~2.5th |
| AWHAETP (weekly hours, total private) | 0.109h | −0.2h | 5th (p05 = −0.2) |
| ICSA (4-wk mean, % change) | 91.8 (pandemic-inflated) | +10% | ~90th (p95 = +16.2) |
| NFCI (6m change) | 0.751 | −0.10 | ~45th — **too loose, see §5.7** |
| DRCCLACBS (2-quarter change) | 0.364 | +0.20 | ~72nd (p95 = +0.47) |
| Ward M − household divergence | 22.78 | see §5.8 | p05 = −42, p95 = +35 |

### 2.3 The base-rate test

Every candidate rule was run in two forms: **naive** (signs disagree) and
**significance-tested** (both moves clear their thresholds). The gap between them is the
whole argument:

| Relation | Naive base rate | Tested base rate | Reduction |
|---|---|---|---|
| C5 inflation vs essentials | **49.64%** | 3.28% | 15× |
| C9 mfg output vs mfg employment | **31.15%** | 18.38% | 1.7× |
| C2 unemployment vs participation | **21.64%** | 6.40% | 3.4× |
| C7 financial conditions vs delinquency | **18.71%** | 4.32% | 4.3× |
| C4 claims vs unemployment | **15.77%** | 0.85% | 19× |
| C8 market vs household | **13.04%** | 1.30% | 10× |
| C6 mortgage rate vs affordability | **8.51%** | 0.21% | 40× |
| C1 payrolls vs unemployment (3m) | 1.17% | 0.11% | 11× |

A naive engine would announce a contradiction in **half of all months** on inflation
alone. That is the failure mode this specification exists to prevent.

---

## 3. The engine's four outputs

The engine may emit exactly one of these per relation, plus one rolled-up status.

| Status | Condition |
|---|---|
| `SIGNALS AGREE` | Both legs move as the expected relationship predicts, **or** at least one leg is inside its noise floor and the other is not contradicting. |
| `MIXED SIGNALS` | Signs disagree but **at least one** leg fails its significance threshold. This is the correct home for most disagreement. |
| `MEANINGFUL CONFLICT` | Both legs clear their significance thresholds in contradicting directions, **and** the rule's historical base rate is ≤10%, **and** required diagnostic data is present. |
| `INSUFFICIENT EVIDENCE` | A required series is stale beyond its cadence tolerance, missing, or the rule's own historical n < 5 so no base rate can be quoted. |

**Hard gate:** a relation whose base rate exceeds **10% of months** may never emit
`MEANINGFUL CONFLICT`. It is demoted to `MIXED SIGNALS` permanently and labelled a
*structural feature*, not a conflict. This single rule disqualifies C9 (§5.9).

---

## 4. Output contract

Every emission carries all seven fields. Missing any field is a build failure.

```js
{
  id: 'C2',                         // stable rule id
  status: 'MEANINGFUL CONFLICT',    // one of the four, nothing else
  observation:  '',   // what the two numbers did, with units and dates
  expected:     '',   // the relationship that normally holds, with its measured correlation
  actual:       '',   // how this month departed from it
  explanation:  '',   // ranked normal → unusual, each tagged with a claim type
  evidence:     [],   // {seriesId, month, value, change, threshold, cleared:bool}
  confidence:   '',   // CORRELATION | PLAUSIBLE-MECHANISM | SUPPORTED-EXPLANATION | UNKNOWN
  baseRate:     {},   // {flagged, tested, pct, window, lift}
  watchNext:    [],   // {seriesId, releaseDate, whatWouldResolveIt}
}
```

`confidence` is not a percentage. It is one of the four epistemic labels the audit brief
mandates, and the engine must be able to justify it from `evidence`.

---

## 5. The nine relations

All base rates below are computed by me from FRED CSV pulls, monthly, over the longest
window where both legs exist. "Lift" = P(NBER recession begins within 12 months | flag)
÷ P(recession within 12 months | any month). `USREC` is the recession indicator.

---

### 5.1 C1 — Payrolls DOWN + Unemployment DOWN

**Expected relationship.** Strongly inverse. Measured correlation of 3-month changes,
1948-2026: **r = −0.917** (n=938). This is the tightest relationship in the whole set.

**Conflict condition.** `chg3(PAYEMS) ≤ −136k` AND `chg3(UNRATE) ≤ −0.2pp`.
*(Note: §2.1 argues the honest 3-month payroll bar is ≈500k. It does not matter here —
see sensitivity below.)*

**Base rate.** **1 month in 938 since April 1948 = 0.11%.** The single occurrence is
**1949-11**. Threshold sensitivity: at −68k, −136k, and −272k the count is identically
**1**; at −408k it is **0**. The rule is insensitive to its own threshold, which means the
binding constraint is the unemployment leg, not the payroll leg.

**Lift.** 0.00 (the one occurrence was not followed by a recession within 12 months).
With n=1, this number means nothing.

**Normal explanations.** Labor force contracting fast enough that job losses do not raise
the jobless share; large seasonal-factor divergence between the two surveys; a strike or
weather month affecting the establishment survey only.

**Unusual explanations.** Establishment/household survey break (benchmark revision
pending); mass reclassification of workers to self-employment; data integrity failure.

**Required diagnostic data.** `CIVPART`, `CLF16OV` (labor force level), `EMRATIO`, and
the ALFRED first-print vintage of PAYEMS.

**Confidence requirement.** `UNKNOWN` — permanently. With one historical instance the
engine cannot assign meaning. Status must be `INSUFFICIENT EVIDENCE` even when the
condition fires, and the emission should say so.

**Severity.** CRITICAL if it ever fires — but as a *data integrity* alarm, not an economic
one. A relationship with r = −0.917 breaking is far more likely to be a broken pipe.

**⚠️ False positive found.** The naive 1-month form (`chg1(PAYEMS)<0 AND chg1(UNRATE)<0`)
fires in **35 of 940 months = 3.72%**, lift **1.01** — i.e. exactly zero predictive
information — and **it fires in 2026-07** (payrolls −23k, unemployment −0.1pp). A naive
engine would headline a contradiction this month. The significance-tested rule correctly
does not. This is the clearest demonstration in the audit that the noise floor is
load-bearing.

**User-facing language.**
> Not firing. Payroll employment and the unemployment rate are the two most tightly linked
> numbers we track — when one goes one way, the other almost always goes the other. They
> have only disagreed meaningfully once since 1948. If they ever disagree again, we will
> assume our data is broken before we assume the economy is.

---

### 5.2 C2 — Unemployment DOWN + Participation DOWN  ← **FIRING NOW**

**Expected relationship.** Weakly inverse. Correlation of 3-month changes, 1948-2026:
**r = −0.351** (n=938). Much looser than C1, because participation has powerful secular
trends (women entering the workforce 1950-2000; boomer retirement 2008-present) that
swamp the cyclical signal.

**Conflict condition.** `chg3(UNRATE) ≤ −0.2pp` AND `chg3(CIVPART) ≤ −0.2pp`.
Strict variant adds `chg3(EMRATIO) ≤ 0`.

**Base rate.**

| Variant | Flagged / tested | Base rate | Lift |
|---|---|---|---|
| Headline participation | 60 / 938 | **6.40%** | **0.36** |
| + employment-population falling | 42 / 938 | 4.48% | 0.42 |
| Prime-age participation (25-54), −0.3pp | 23 / 938 | 2.45% | **0.00** |
| Prime-age participation **and** prime-age emratio | 10 / 938 | 1.07% | **0.00** |
| Naive (any decline in both) | 203 / 938 | 21.64% | 0.49 |

Threshold sensitivity (headline): −0.1pp → 15.4%, −0.15pp → 9.1%, −0.2pp → 6.4%,
−0.3pp → 2.5%, −0.4pp → 1.0%.

**🚨 MAJOR NEGATIVE FINDING — the intuitive story is not supported.**

I ran a forward test: after a C2 flag, what actually happens?

| Outcome over next 12 months | After C2 flag | Baseline |
|---|---|---|
| Mean change in employment-population ratio | **+0.424pp** | +0.037pp |
| Share of cases where emratio *falls* | **16.9%** | 35.8% |
| Mean change in unemployment rate | **−0.407pp** | +0.004pp |
| Share of cases where unemployment *rises* | **13.6%** | 34.6% |
| P(recession begins within 12m) | **10.0%** | 28.1% |

And the "refined" prime-age version is **worse**, not better: **0 of 23** flags since 1948
were followed by a recession within 12 months, prime-age employment-population rose
**+0.932pp** on average versus +0.229pp baseline, and fell in only **4.5%** of cases
versus 29.1% baseline.

The plain reading: *"unemployment is falling because people are giving up"* is a
compelling story that **78 years of American data decline to support.** Historically this
configuration has been followed by *more* improvement, not less. Every attempt I made to
sharpen it into a warning made it a worse warning.

**Therefore C2 is specified as a MEASUREMENT flag, not a WARNING.** It is allowed to say
*"the unemployment rate fell for a reason that is not more people working."* It is
forbidden from saying *"this is a bad sign,"* and its emission must carry the negative
lift alongside the observation.

**Normal explanations (ranked).**
1. *Demographic drift* — SUPPORTED-EXPLANATION. Retirement-age cohort exit mechanically
   lowers headline participation without any household distress.
2. *Survey sampling noise* — PLAUSIBLE-MECHANISM. A 3-month CPS participation move of
   0.2-0.4pp is within the range that reverses without trace.
3. *Voluntary exit into education/caregiving* — PLAUSIBLE-MECHANISM.

**Unusual explanations.** Discouragement at scale (requires `NILFWJN` — persons not in
the labor force who want a job now — to be *rising*); disability or immigration-policy
shocks to labor supply.

**Required diagnostic data.** `CIVPART`, `LNS11300060` (prime-age participation),
`LNS12300060` (prime-age employment-population), `EMRATIO`, `NILFWJN`, `U6RATE`.

**Confidence requirement.** `SUPPORTED-EXPLANATION` for the *measurement* claim only
(the arithmetic is unambiguous). `UNKNOWN` for any forward-looking claim — and the engine
must refuse to make one.

**Severity.** MODERATE. It changes what a reader should conclude from the jar's biggest
line; it does not predict anything.

**LIVE EVALUATION — 2026-07.** Fires, at every specification tested.

| Series | 2026-04 | 2026-07 | 3m change | 12m change |
|---|---|---|---|---|
| UNRATE | 4.3 | **4.1** | −0.2pp | −0.2pp |
| CIVPART | 61.8 | **61.4** | −0.4pp | −0.8pp |
| EMRATIO | 59.1 | **58.9** | −0.2pp | −0.7pp |
| Prime-age participation (25-54) | 83.8 | **83.4** | −0.4pp | **+0.0pp** |
| Prime-age emratio (25-54) | 80.7 | **80.4** | −0.3pp | **+0.0pp** |
| PAYEMS | 158,798 | 158,858 | **+60k (inside noise)** | +316k |

The diagnostic that matters: **headline participation is down 0.8pp year over year while
prime-age participation is flat at +0.0pp.** That divergence is the demographic
signature — the exit is concentrated outside the 25-54 cohort. The 3-month prime-age dip
is real (2.5th percentile) but is not corroborated at 12 months, and `NILFWJN` is
*falling* (6,111k in April → 5,920k in July), which is the opposite of what mass
discouragement looks like.

**Correct engine output for this month:** `MEANINGFUL CONFLICT` on the measurement claim,
with explanation ranked *demographic drift first*, forward claim `UNKNOWN`, and the
negative lift disclosed.

**User-facing language.**
> The unemployment rate fell from 4.3% to 4.1% this quarter. Over the same three months
> the share of Americans who are working fell too, from 59.1% to 58.9%. Both can be true
> at once: the unemployment rate only counts people who are looking for work, so when
> people stop looking, the rate falls without anyone getting hired.
>
> Most of that drop is people aging out of the workforce — among 25-to-54-year-olds,
> participation is exactly flat compared with a year ago. And we want to be honest about
> what this pattern has meant historically: since 1948 it has shown up 60 times, and it
> was usually followed by *more* improvement, not less. We are flagging it because it
> changes what "unemployment fell" means, not because it is a warning.

---

### 5.3 C3 — Payrolls UP + Hours DOWN

**Expected relationship.** Strongly positive. Correlation of 3-month changes in payrolls
vs aggregate weekly hours, 1964-2026: **r = +0.904** (n=748). Employers cut hours before
they cut headcount, so hours are the classic leading edge.

**Conflict condition.** `chg3(PAYEMS) ≥ +136k` AND `pct3(AWHI) ≤ −0.5%`
(AWHI = aggregate weekly hours index, the product of bodies and hours).

**Base rate.**

| Variant | Window | Flagged / tested | Base rate | Lift |
|---|---|---|---|---|
| Aggregate hours (AWHI) | 1964-2026 | 14 / 748 | **1.87%** | **2.07** |
| Weekly hours per worker, total private | 2006-2026 | 5 / 242 | 2.07% | **0.00** |
| Weekly hours, manufacturing | 1939-2026 | 69 / 1048 | 6.58% | 0.84 |

**This is the best-performing rule in the set on the aggregate-hours specification** —
1.87% base rate and a genuine 2.07× recession lift (50.0% vs 24.2%). Firing months
include 1970-03, 1974-02, 1980-03, 1990-04, 2000-12, 2001-02 — a roll-call of cycle
turns.

**⚠️ False positive found in the per-worker variant.** The `AWHAETP` (hours per worker,
total private) specification fires in 2012-05, 2016-04, 2022-01, 2022-12, 2023-04 — **lift
0.00**, none followed by recession. The manufacturing-hours variant is little better
(lift 0.84). **Only the aggregate-hours form carries signal.** Specifying this rule on
per-worker hours, which is the intuitive reading of "hours down," would produce a rule
with negative information content.

**Normal explanations.** Weather or strike month; shift from full-time to part-time
composition; seasonal-adjustment artifact in a single month.

**Unusual explanations.** Employers hoarding labor while demand falls — the pre-layoff
posture; hiring concentrated in low-hours sectors while high-hours sectors contract.

**Required diagnostic data.** `AWHI`, `AWHAETP`, `PAYEMS`, `LNS12032194` (part-time for
economic reasons), `TEMPLAYOFF`.

**Confidence requirement.** `CORRELATION` — 14 observations with a 2× lift is suggestive,
not established. Escalates to `PLAUSIBLE-MECHANISM` if part-time-for-economic-reasons is
simultaneously rising, because that supplies the mechanism.

**Severity.** MAJOR. Best early-warning candidate in the set.

**Blocker:** OOZEMeter fetches none of these series (`scripts/collect.js:80`). This rule
cannot be implemented without adding `AWHI` to the collector's read path — a
**read-only** addition (see §7.2).

**LIVE:** Not firing. AWHI 3-month change −0.08% (inside noise), payrolls +60k (inside
noise). Status: `SIGNALS AGREE` by way of both legs being quiet.

**User-facing language.**
> When companies get nervous they cut hours before they cut people. So if the number of
> jobs is rising while the total hours America works is falling, something does not add
> up — and historically that combination has been about twice as likely as usual to
> arrive within a year of a recession. It has happened 14 times since 1964. It is not
> happening now.

---

### 5.4 C4 — Claims UP + Unemployment DOWN

**Expected relationship.** Positive: claims lead the unemployment rate. Correlation of
3-month changes, 1967-2026: **r = +0.694** (n=710).

**Conflict condition.** `pct3(ICSA 4-week mean) ≥ +10%` AND `chg3(UNRATE) ≤ −0.2pp`.

**Base rate.** **6 months in 710 since 1967 = 0.85%.** Occurrences: 1969-12, 1976-05,
1977-02, 1988-01, 2006-05, 2013-12. **Lift 0.65** — slightly *less* likely than baseline
to precede a recession.

Naive form fires 15.77% of months with lift 0.63 — a 19× reduction from applying the
threshold, and still no predictive value at either specification.

**Normal explanations.** Claims are weekly and volatile; a single distorted week inside
the 4-week window; seasonal-adjustment factor changes at year-end (note 1969-12, 2013-12,
1988-01 — three of six firings are December or January); state-level administrative
backlogs clearing.

**Unusual explanations.** Churn rising while the stock of unemployed falls — a
high-turnover labor market, which is a genuine and under-described state; benefit-
eligibility rule changes decoupling claims from joblessness.

**Required diagnostic data.** `ICSA`, `CCSA` (continued claims — the stock, which
disambiguates flow-vs-stock), `UNRATE`, `UEMPMED` (median duration).

The engine's discriminator: if **initial claims rise but continued claims do not**,
people are being laid off *and rehired quickly* — genuinely not a stress signal. If both
rise while unemployment falls, that is the anomaly worth a human's attention.

**Confidence requirement.** `CORRELATION` at best. With 6 observations and negative lift,
the engine must not assert a mechanism.

**Severity.** MINOR. Rare, but historically uninformative.

**LIVE:** Not firing. ICSA 4-week mean 203,250 and *falling* (−3.4% over 3 months, −10.9%
year over year) alongside a falling unemployment rate. Both legs agree.

**User-facing language.**
> New unemployment filings and the unemployment rate normally move together. When filings
> jump but the rate keeps falling, it usually means people are losing jobs and finding new
> ones quickly rather than piling up. It has happened six times since 1967 and has not
> been a reliable warning. Right now both are falling together.

---

### 5.5 C5 — Inflation DOWN + Essential household expenses UP

**Expected relationship.** Very strongly positive — essentials are ~73% of the CPI basket
by relative importance. Correlation of year-over-year rates, 1968-2026: **r = +0.987**
(n=701). This is nearly an identity, which is exactly why the naive test is useless.

**Essentials index construction.** Geometric index of four SA CPI groups weighted by BLS
relative importance (Dec 2024): food `CPIUFDSL` 13.6, housing `CPIHOSSL` 44.9, energy
`CPIENGSL` 6.2, medical care `CPIMEDSL` 8.0, renormalized to 100.

**Conflict condition.** `chg3(headline CPI YoY) ≤ −0.5pp` AND
`essentials YoY ≥ headline YoY + 1.0pp` AND `essentials YoY > 0`.

**Base rate.** **23 months in 701 since 1968 = 3.28%**, in 8 episodes: 1975-02..09,
1975-11, 1980-07..08, 2001-04, 2001-08, 2003-04..06, 2005-12, **2022-09..2023-02**.
**Lift 1.01** — no recession information whatsoever, which is fine, because this rule is
not about recessions.

Gap distribution (essentials YoY − headline YoY), n=701: mean +0.37pp, sd 0.59pp,
p05 −0.41, p95 **+1.41**. The +1.0pp threshold sits at roughly the 85th percentile.

**⚠️ Largest false-positive source in the entire audit.** The naive form —
*"headline inflation is falling and essentials are still rising"* — is true in **348 of
701 months = 49.64%**. Half of all recorded history. Any engine that ships the naive
version is announcing a contradiction in every other month, which is indistinguishable
from announcing nothing. The whole informational content lives in the +1.0pp gap
requirement.

**Normal explanations.** Energy is the volatile component; headline falls faster than
essentials because gasoline swings hardest — this is the mechanical default, not an
anomaly. Shelter enters CPI with a long lag, so housing keeps rising after headline turns.

**Unusual explanations.** Genuine divergence between the aggregate basket and the
low-income basket — the "vibecession" mechanism, where measured disinflation is real and
household experience of it is not.

**Required diagnostic data.** `CPIAUCSL`, `CPIUFDSL`, `CPIHOSSL`, `CPIENGSL`,
`CPIMEDSL`, `CPILFESL` (core, to separate energy base effects from a genuine essentials
divergence).

**Confidence requirement.** `SUPPORTED-EXPLANATION` for the arithmetic. `PLAUSIBLE-MECHANISM`
for the household-experience claim — it is a real and well-documented gap, but the engine
has no distributional data to prove who feels it.

**Severity.** MODERATE — and the highest-value rule for *user understanding*, because it
explains the single most common complaint about official inflation statistics.

**LIVE — borderline, does not fire.** 2026-07: headline CPI YoY **3.3%** (3-month change
**−0.48pp**, just short of the −0.5pp bar); essentials YoY **3.93%**; gap **+0.62pp**
against a +1.0pp requirement. Both legs are close but neither clears. Correct status:
`MIXED SIGNALS`. *(Note: `data/latest.json` shows the inflation line at 3.4% using CPIAUCNS
year-over-year; I use the seasonally adjusted CPIAUCSL at 3.3%. The 0.1pp difference is the
SA/NSA choice, not an error.)*

**User-facing language.**
> Inflation cooling does not mean prices falling — it means prices rising more slowly.
> This flag fires only when the things you cannot skip — food, housing, energy,
> healthcare — are rising at least a full point faster than the headline number. That has
> happened in about 3% of months since 1968, most recently late 2022 into early 2023.
> Right now the gap is 0.6 points: essentials are running hotter than headline, but not
> by enough for us to call it a conflict.

---

### 5.6 C6 — Mortgage rates DOWN + Affordability DOWN

**Expected relationship.** Strongly positive. Correlation of 3-month change in the 30-year
rate vs 3-month change in a payment-to-wage index: **r = +0.923** (n=470).

**Affordability index (PTW).** Monthly principal-and-interest on a 360-month loan against
the Case-Shiller national index (`CSUSHPINSA`) at the prevailing `MORTGAGE30US` rate,
divided by average hourly earnings (`AHETPI`). Rising PTW = worsening affordability.
`FIXHAI`, the NAR affordability index, was **rejected: FRED carries only 12 observations
(2025-08 onward)** — unusable for base rates.

**Conflict condition.** 3-month: `chg3(MORTGAGE30US) ≤ −0.25pp` AND `pct3(PTW) ≥ +1.0%`.

**Base rate — the 3-month rule is effectively dead.** **1 month in 470 since 1987 = 0.21%**
(2012-06). The arithmetic explains why: a 0.25pp rate cut on a 6.5% mortgage lowers the
payment ~2.6%, so home prices would have to rise >3.6% *in a single quarter* to overwhelm
it. That essentially never happens.

**Recommended replacement — the 12-month rule.**

| Specification | Flagged / tested | Base rate | Episodes |
|---|---|---|---|
| 12m: rate ≤ −0.25pp & PTW ≥ +1% | 13 / 461 | **2.82%** | 2002-05, 2004-03, 2004-08..09, 2005-05..07, 2013-02..05, 2021-03, 2021-05 |
| 12m: rate ≤ −0.50pp & PTW > 0 | 3 / 461 | 0.65% | 2002-10, 2005-05..06 |
| 3m naive (signs only) | 40 / 470 | 8.51% | — |

The 12-month episodes are exactly the housing-bubble years (2004-05) and the 2021 price
surge — the rule finds the right history.

**Normal explanations.** Home prices rising faster than the rate relief; wage growth
lagging price growth; Case-Shiller's 3-month smoothing and 2-month publication lag
misaligning the two legs.

**Unusual explanations.** Rate cuts *causing* the affordability loss — demand unlocked by
cheaper credit bidding prices up faster than payments fall. This is the 2021 mechanism and
it is genuinely counterintuitive: the relief creates the harm.

**Required diagnostic data.** `MORTGAGE30US`, `CSUSHPINSA`, `AHETPI`, `MSPUS`, `HOUST`,
`PERMIT` (supply response).

**Confidence requirement.** `SUPPORTED-EXPLANATION` — the mechanism is arithmetic and the
components are independently observable.

**Severity.** MAJOR for user understanding. OOZEMeter's housing line reads
`max(interp(mortgageRate), interp(mortgageDelinq))` (`scripts/collect.js:110`), so a
falling rate mechanically *reduces* housing stress with no reference to price or income.
This rule is the check on that.

**LIVE:** Not firing, and comfortably so. 2026-05: mortgage rate 6.44% (**−0.37pp** year
over year) and PTW **−6.05%** year over year — affordability improving. Case-Shiller
+1.11% YoY against average hourly earnings +3.56% YoY: wages are outrunning house prices.
Status `SIGNALS AGREE`.

*(Caveat: the housing line in `data/latest.json` shows 6.67% as of 2026-08-13 while my
PTW index ends 2026-05 on Case-Shiller's lag. The engine must align on the slowest leg —
see §7.4.)*

**User-facing language.**
> Cheaper mortgages are supposed to make homes easier to afford. Sometimes they do the
> opposite: cheaper borrowing brings buyers back, buyers bid prices up, and the monthly
> payment ends up higher than before the rate fell. That happened through 2004-05 and
> again in 2021 — about 3% of months since 1987. It is not happening now: rates are down
> about a third of a point from a year ago and wages are growing faster than house prices.

---

### 5.7 C7 — Financial conditions EASIER + Delinquencies UP

**Expected relationship.** Positive but weak. Correlation of 6-month changes in NFCI vs
2-quarter changes in credit-card delinquency, 1991-2026: **r = +0.334** (n=139 quarterly
observations). The weakest measured relationship in the set — which itself is the finding.

**Conflict condition.** `chg6m(NFCI) ≤ −0.10` AND `chg2q(DRCCLACBS) ≥ +0.20pp`.

**Base rate.** **6 of 139 quarterly observations since 1991-07 = 4.32%**: 1995-07,
2001-01, 2001-04, 2009-04, 2023-10, 2024-01. **Lift 3.16** (50.0% vs 15.8%) — the second
strongest lift in the set.

Naive form: 26/139 = 18.71%, lift 1.94.

**⚠️ Threshold problem I could not fully resolve.** The NFCI 6-month change has
sd = 0.751 (n=662). My −0.10 threshold sits near the **45th percentile** — it is barely a
threshold at all. The rule's selectivity is coming almost entirely from the delinquency
leg (+0.20pp ≈ 72nd percentile of its own distribution). A properly calibrated NFCI
threshold would be ≈ −0.5 (roughly 1 sd), which would cut the firing count below 5 and
push the rule into `INSUFFICIENT EVIDENCE`. **Flagged as unresolved: the reported 4.32%
base rate is generated by a threshold that is not doing its job, and the honest reading is
that this rule is a delinquency-acceleration detector wearing a financial-conditions
costume.**

**Normal explanations.** The two series measure different populations — NFCI is
institutional funding and market liquidity; card delinquency is household repayment. There
is no strong reason for them to co-move at 6-month horizons, and r = 0.334 says they
largely do not.

**Unusual explanations.** Genuine decoupling of Wall Street from Main Street — easy
institutional credit alongside deteriorating household balance sheets. This is the
mechanism the NFCI line was added to the jar to catch, per `lab.js:120-128`.

**Required diagnostic data.** `NFCI`, `ANFCI` (adjusted for the business cycle — the
correct series for this test, since it removes the growth component), `DRCCLACBS`,
`DRSFRMACBS`, `CORCCACBS` (charge-offs), `DRTSCILM` (bank lending standards survey).

**Confidence requirement.** `CORRELATION` only, and the engine must disclose r = 0.334
whenever it emits. A 3.16× lift on 6 observations with a mis-specified threshold does not
support a mechanism claim.

**Severity.** MODERATE, with an internal-consistency angle: this is the only rule where a
conflict has a *direct, opposing* effect on the jar. The financial line (weight 3.00,
`scripts/lib/methodology.js:18`) falls while the credit line (weight 19.40) rises — the
score nets them without ever telling the reader they disagreed.

**LIVE:** Not firing, and cannot currently be evaluated with confidence. NFCI −0.549 with
a 6-month change of essentially zero; `DRCCLACBS` is stale — last observation **2026-01-01**,
7 months old (`data/latest.json` → `lines.credit.asOf`). Correct status:
`INSUFFICIENT EVIDENCE` on the delinquency leg.

**User-facing language.**
> Banks and markets can be relaxed at the same time households are falling behind on
> their cards. The two are only loosely connected — our own measurement puts the
> relationship at about 0.33 on a scale where 1.0 is lockstep — so we treat any
> disagreement carefully. It has happened six times since 1991, including late 2023. We
> cannot check it this month: the credit-card delinquency data is from January and the
> next release has not landed.

---

### 5.8 C8 — Market Ooze CALM + Household Ooze WORSENING

**Expected relationship.** Weak. Using the repo's own aligned history
(`data/market-history.json`, 234 shared months 2007-01..2026-07): correlation of **levels
r = +0.275**, correlation of **3-month changes r = +0.187**. The two instruments are very
nearly independent, which is the strongest possible justification for Ward M existing
separately — and also means "divergence" is close to the default state.

Divergence distribution (market − household), n=234: mean −2.17, sd 22.78, p05 −42,
p95 +35, range −60…+58.

**Conflict condition.** `market ≤ 30` AND `chg3(household) ≥ +5 points`.

**Base rate.** **3 months in 230 = 1.30%**: **2007-04**, **2007-06**, **2026-05**.
**Lift 3.74** (66.7% vs 17.8%) — nominally the highest in the set.

Sensitivity — and this rule is extremely threshold-sensitive:

| Specification | Flagged / tested | Base rate | Months |
|---|---|---|---|
| market ≤30 & hh ≥+5 | 3 / 230 | 1.30% | 2007-04, 2007-06, 2026-05 |
| market ≤30 & hh ≥+3 | 7 / 230 | 3.04% | +2007-05, 2015-05, 2017-09, 2026-06 |
| market ≤35 & hh ≥+3 | 8 / 230 | 3.48% | +2026-04 |
| market ≤40 & hh ≥+3 | 14 / 230 | 6.09% | +2007-07,08,10, 2020-05, 2024-03, 2024-05 |
| naive (market<household & hh rising) | 30 / 230 | 13.04% | — |

**⚠️ Two disqualifying caveats the lift number hides.**

1. **n = 3.** Two of the three firings are the same episode (April and June 2007). The
   effective sample is **two independent events**, one of which is the GFC. A 3.74× lift
   computed on two events is not evidence; it is an anecdote with a decimal point.
2. **Circularity.** The "household" leg is OOZEMeter's *own backtested score*, not an
   independent measurement. `research/market-anchor-validation.md` and the market
   calibration in `data/market.json` both anchor on the same GFC window. The engine is
   partly grading its own homework, and the 2007 firing is the episode both instruments
   were calibrated against (`data/market.json` → `calibration.episodes` lists
   `GFC peak 2008-11 = 90`; household calibration is `GFC peak → 90` per
   `scripts/lib/methodology.js:21-26`).

**Confidence requirement.** `UNKNOWN`. Status must be `INSUFFICIENT EVIDENCE` — the rule
has n < 5 by the §3 definition. It should be *computed and logged* every month so the
sample grows, but never surfaced to readers as a conflict until n ≥ 5 with at least three
independent episodes.

**Severity.** MINOR now; potentially MAJOR in a decade of accumulated observations.

**LIVE:** Not firing. 2026-07: market **37**, household **26**, divergence **+11** —
market stress is *above* household stress, the opposite configuration. Note 2026-05 *did*
fire (market 30, household 30, household +5 over 3 months), and 2026-03 shows market 53 vs
household 24 — a +29 divergence, near the 95th percentile.

**User-facing language.**
> Ward M watches markets. The jar watches households. They are close to unrelated — we
> measure the connection at about 0.28 on a 0-to-1 scale — so them disagreeing is normal,
> not alarming. The specific pattern worth watching is markets calm while households
> deteriorate, which showed up in spring 2007. It has only happened three times in the
> nineteen years we can compare, which is too few for us to tell you what it means. We log
> it every month and will say more when we have more.

---

### 5.9 C9 — Manufacturing production UP + Employment DOWN

**Expected relationship.** Positive within a cycle. Correlation of year-over-year rates,
`IPMAN` vs `MANEMP`, 1973-2026: **r = +0.754** (n=642).

**Conflict condition.** `yoy(IPMAN) ≥ +1.0%` AND `yoy(MANEMP) ≤ −0.5%`.

**Base rate — DISQUALIFYING.**

| Specification | Window | Flagged / tested | Base rate | Lift |
|---|---|---|---|---|
| IPMAN vs MANEMP | 1973-2026 | 118 / 642 | **18.38%** | **0.69** |
| **INDPRO vs MANEMP** (as OOZEMeter wires it) | 1948-2026 | 119 / 942 | **12.63%** | **0.65** |
| Naive (signs only) | 1973-2026 | 200 / 642 | **31.15%** | 0.74 |

Era breakdown of the tested rule:

| Era | Base rate |
|---|---|
| 1972-79 | **0.0%** |
| 1980s-90s | **22.5%** |
| 2000-2019 | **23.3%** |
| 2020-now | 10.3% |

**🚨 This is not a conflict. It is the defining structural fact of the American economy
since 1980, and the era table proves it: zero occurrences in the 1970s, then ~23% of all
months for forty years.** Manufacturing productivity growth combined with secular
employment decline means output rising while factory employment falls is the *normal*
state, not an anomaly. Firing episodes include continuous runs like **2002-06..2008-03**
(a 70-month stretch under the naive test) and **1998-11..2000-02**.

The lift of **0.69** is the decisive number: when this "conflict" fires, a recession is
**less** likely than in a randomly chosen month. It is not merely uninformative — as a
warning it is **actively backwards**.

**Per the §3 hard gate (base rate > 10%), C9 may never emit `MEANINGFUL CONFLICT`.** It is
demoted permanently to a labelled structural feature.

**Note on OOZEMeter's actual wiring.** The manufacturing line uses `INDPRO`, not `IPMAN`
(`scripts/collect.js:80,154`) — total industrial production including mining and
utilities, not manufacturing. The `INDPRO`-vs-`MANEMP` pairing is even less coherent as a
sector-consistency check, and it is the pairing the repo would actually implement. Its
base rate is 12.63%, still above the gate.

Correctly, the line already carries `contributesToOoze:false`, `scoreWeight:0`,
`calibrationStatus:'provisional-auxiliary'` (`scripts/collect.js:182-183`).

**Normal explanations.** Automation and productivity growth — SUPPORTED-EXPLANATION,
sustained over 45 years. Offshoring of labor-intensive stages. Output mix shifting toward
capital-intensive goods.

**Unusual explanations.** None that this indicator pair can distinguish. To say anything
unusual you would need output *per hour* and capacity utilization, not output and
headcount.

**Required diagnostic data.** `IPMAN`, `MANEMP`, `AWHMAN`, `TCU` (capacity utilization),
`OPHMFG` (manufacturing output per hour) — and without the last two the rule cannot
separate productivity from distress.

**Confidence requirement.** `SUPPORTED-EXPLANATION` that this is structural. `UNKNOWN` for
any cyclical interpretation.

**Severity.** NOT-A-PROBLEM as an economic signal. **MAJOR as a design risk** — this is
the rule most likely to be built because it sounds like the most obvious contradiction,
and it would fire in roughly one month in six forever.

**LIVE:** Would fire under the naive test. 2026-06: `INDPRO` YoY **+1.14%**, `MANEMP` YoY
**−0.11%** — but −0.11% does not clear the −0.5% bar, so the tested rule does not fire.
Correct status: `MIXED SIGNALS`. The naive form has been firing near-continuously since
**2025-01**.

**User-facing language.**
> American factories have been making more with fewer people for forty-five years. Output
> up while factory employment falls is not a contradiction — it is what the last four
> decades look like, in roughly one month out of six. We measure it, we show it, and we do
> not call it a warning. If we did, we would have been warning you continuously since
> 1985.

---

## 6. The tenth relation — the one the brief did not ask for

The brief lists nine relationships. Testing them surfaced a tenth that is more directly
relevant to OOZEMeter than seven of the nine, because it tests the instrument against
itself rather than testing the economy.

### D1 — The employment line IMPROVES while the employment-population ratio FALLS

I reconstructed OOZEMeter's employment line exactly as
`scripts/collect.js:108` computes it —
`max(interp(unemployment anchors, UNRATE), interp(claimsK anchors, ICSA₄wk/1000))` using
the verbatim anchors from `scripts/collect.js:38-39` and the trailing-four-week transform
from `scripts/lib/methodology.js:200-210` — then compared its 3-month change against the
employment-population ratio.

**Conflict condition.** `chg3(employment stress) ≤ −2 points` AND `chg3(EMRATIO) ≤ −0.2pp`.

**Base rate.** **30 months in 710 since 1967-04 = 4.23%** across 24 episodes: 1968-01,
1968-09, 1970-07..08, 1974-04..05, 1975-06, 1979-05, 1980-08, 1982-12, 1985-07, 1991-05,
1991-07, 1992-10..11, 1999-04, 2001-12..2002-01, 2003-01, 2003-07, 2003-09, 2004-10,
2007-05, 2009-06..08, 2010-07, 2013-03, 2017-12, **2026-07**.

Naive form: 105/710 = 14.79%.

**LIVE — firing.** 2026-07:

| Quantity | Value |
|---|---|
| Employment line stress | **13.0** (3-month change **−2.67**) |
| Binding input | **UNRATE** (unemployment stress 13.0 > claims stress 5.81) |
| UNRATE | 4.1% |
| ICSA 4-week mean | 203,250 |
| Employment-population ratio | 58.9 (3-month change **−0.2pp**) |
| Participation | 61.4 (3-month change **−0.4pp**) |
| PAYEMS 3-month change | +60k (**inside the ±500k noise floor**) |
| PAYEMS 1-month change | −23k (**inside the ±168k noise floor**) |

This is the known employment defect, but now with a **number attached**: the configuration
occurs in 4.23% of months, it is occurring now, and it is the mechanism by which the
heaviest-weighted line in the jar (24.25%) contributed to a published decline from 27 to 26.

Note also that at a stress of 13.0 the unemployment leg is *pinned near the bottom of its
anchor range* — `[[3.5,5],[5,25],...]` maps 4.1% to 13.0. A further fall to 3.9% would move
the line only ~3 points. The line has very little room left to improve, which means its
current downward contribution is close to its maximum possible.

**Severity.** MAJOR. This is the rule I would build first. It is the only one that audits
the instrument rather than the economy, it fires today, and it requires **no new data
sources** — `UNRATE` and `ICSA` are already fetched (`scripts/collect.js:80`); only
`EMRATIO` would be added.

**User-facing language.**
> Our employment line eased this month because the unemployment rate fell. But the share
> of Americans who actually hold a job also fell, and payroll growth over the last quarter
> was too small to distinguish from zero. So the line moved in the direction of "better"
> during a quarter when fewer people were working. We are telling you because our
> employment line reads the unemployment rate and weekly benefit claims, and neither of
> those can see someone who stopped looking.

---

## 7. Implementation

### 7.1 Where it lives

```
scripts/lib/contradictions.js      pure functions, no I/O, no fetch — the rule table
                                   + evaluate(seriesBundle) -> Finding[]
scripts/contradictions.js          CLI: reads data/latest.json + data/diagnostics.json,
                                   writes data/contradictions.json. Exit 0 always.
data/diagnostics.json              zero-weight diagnostic series cache (see 7.2)
data/contradictions.json           output. Read by nothing that computes the score.
research/forensic/baserates.json   frozen base-rate table, versioned, regenerated only
                                   by an explicit human-run script
tests/contradictions.test.js       rule table invariants + the zero-weight proof (7.3)
```

This mirrors the existing `market-*` split exactly: a pure lib (`scripts/lib/market-note.js`),
a CLI (`scripts/market-integrity.js`), a data artifact, and a test — a pattern the repo
already runs in CI (`.github/workflows/collect.yml`, `verify collector contracts` step).

### 7.2 Data structures

```js
const RULES = [{
  id: 'D1',
  name: 'employment line improves while employment-population ratio falls',
  legs: [
    {series: 'OOZE_EMPLOYMENT', transform: 'chg3', op: '<=', threshold: -2,
     unit: 'stress points', noiseFloor: null, derived: true},
    {series: 'EMRATIO',         transform: 'chg3', op: '<=', threshold: -0.2,
     unit: 'pp', noiseFloor: 0.1},
  ],
  expected: {relation: 'employment stress falls only when the employed share rises',
             measuredCorrelation: null},
  baseRate: {flagged: 30, tested: 710, pct: 4.23, window: '1967-04..2026-07',
             lift: null, source: 'research/forensic/baserates.json#D1'},
  maxStatus: 'MEANINGFUL CONFLICT',   // gate: base rate <= 10%
  confidenceCeiling: 'SUPPORTED-EXPLANATION',
  diagnostics: ['CIVPART','LNS11300060','LNS12300060','NILFWJN','PAYEMS'],
  severity: 'MAJOR',
  copy: {/* observation / expected / actual / explanation / watchNext templates */},
}, /* … C1..C9 … */];
```

**Every rule carries its own base rate as data, and the base rate determines `maxStatus`.**
A rule cannot be added without a computed base rate. That is the structural guarantee
against the C9 failure mode.

New series required beyond the current fetch list (`scripts/collect.js:80`):
`EMRATIO`, `CIVPART`, `LNS11300060`, `LNS12300060`, `NILFWJN`, `PAYEMS`, `AWHI`, `AWHAETP`,
`CCSA`, `ANFCI`, `CPIUFDSL`, `CPIHOSSL`, `CPIENGSL`, `CPIMEDSL`, `CSUSHPINSA`, `AHETPI`,
`MANEMP`, `IPMAN`. All FRED CSV, same transport as `scripts/lib/fred.js`.

**Recommendation: do not add all eighteen.** Ship D1 and C2 first — they need only
`EMRATIO`, `CIVPART`, `LNS11300060`, `LNS12300060`, `NILFWJN`, `PAYEMS` (six series), they
both fire today, and they are the two that audit the jar's own heaviest line. C3 (three
more series) is the only other rule with a defensible lift. C1, C4, C6, C8 are rare or
underpowered; C5 is valuable for explanation but needs four CPI components; C9 should be
built as a labelled structural feature or not at all.

### 7.3 How it stays zero-weight

Four independent guarantees, in order of strength:

1. **Directional dependency.** `scripts/collect.js` does not — and must never —
   `require('./lib/contradictions')`. The contradiction CLI reads `data/latest.json` as
   *input*. The score is computed and written before the engine runs. Reversing that
   dependency is the only way to create a write path, and it would be a visible import.
2. **Separate artifact.** Output goes to `data/contradictions.json`. `data/latest.json`,
   `data/latest.js`, and `data/history.json` are never opened for writing by the engine.
3. **Pipeline position.** The CLI runs in the `integrity gate + public stamping` step,
   after `scripts/collect.js` and alongside `scripts/market-integrity.js` and
   `scripts/narrative-check.js` (`.github/workflows/collect.yml`). Note the workflow's
   commit step uses `git add data/` — broad enough that the new artifact is picked up
   without a workflow edit, which is convenient but should be reviewed against the
   repo's multi-agent git discipline.
4. **Test-enforced invariant.** `tests/contradictions.test.js` must assert:
   - running `evaluate()` against a fixture and then recomputing the score from the same
     `latest.json` yields a byte-identical `ooze` and `inputFingerprint`;
   - `scripts/collect.js` and `scripts/backtest.js` source text contains no reference to
     `contradiction`;
   - every rule in `RULES` has a `baseRate` with `tested >= 60` and a `window`;
   - every rule with `baseRate.pct > 10` has `maxStatus !== 'MEANINGFUL CONFLICT'`;
   - the engine emits only the four permitted status strings.

The fourth is the one that matters. The repo already proves it can hold a line to
zero weight under CI pressure — `scripts/lib/release-gate.js:150-155` enforces prose
consistency about the NFCI line's weight. The same discipline applies here.

### 7.4 Vintage and staleness discipline

Two failure modes the engine must handle, both already live in this data:

- **Misaligned legs.** C6's rate leg is weekly (`MORTGAGE30US`, as of 2026-08-13) and its
  price leg is a lagged 3-month average (`CSUSHPINSA`, as of 2026-05). Comparing them
  naively compares different quarters. **Rule: every conflict evaluates at the month of
  its slowest leg, and the emission states that month.**
- **Stale legs.** C7 cannot be evaluated at all right now — `DRCCLACBS` last observed
  2026-01-01, seven months stale (`data/latest.json` → `lines.credit.asOf`; the collector's
  quarterly tolerance is 250 days, `scripts/collect.js:53`). **Rule: any leg past its
  cadence tolerance forces `INSUFFICIENT EVIDENCE` for that rule, never a silent skip.**

A third, specific to payrolls: because the mean absolute revision to a monthly payroll
change is ~76k ex-pandemic with 6% sign flips, **any rule with a payroll leg must record
the first-print value alongside the current value** and re-evaluate on revision. A
contradiction that a benchmark revision erases must be visibly retracted, the same way
`scripts/integrity.js:29-45` already logs score revisions to `data/revisions.json`.

---

## 8. False positives and false negatives, collected

Stated together because the brief requires them to be as prominent as the successes.

**False positives — rules that would cry wolf**

| # | Rule | Failure |
|---|---|---|
| 1 | **C9 manufacturing** | 18.4% base rate (12.6% as OOZEMeter wires it), lift **0.69**. Fires ~1 month in 6 for 40 years. Would have warned continuously since 1985. |
| 2 | **C5 naive inflation** | 49.6% base rate. Fires in half of all recorded months. |
| 3 | **C1 naive 1-month** | 3.7% base rate, lift **1.01** — exactly zero information — **and it fires this month.** |
| 4 | **C3 per-worker hours** | Lift **0.00** on the `AWHAETP` specification; only the aggregate-hours form carries signal. |
| 5 | **C4 claims** | Lift **0.65**. Three of six firings are December/January — likely seasonal-factor artifacts. |
| 6 | **C8 lift is an artifact** | 3.74× computed on n=3, of which two are the same 2007 episode, with a circular household leg. |
| 7 | **C7 threshold is decorative** | NFCI −0.10 sits at the ~45th percentile of its own 6-month change distribution; the rule's selectivity comes entirely from the delinquency leg. |

**False negatives — what the engine still cannot see**

| # | Gap |
|---|---|
| 1 | **The C2 story is unsupported.** "Unemployment falls because people gave up" is followed by *improvement* in every specification tested (lift 0.36 headline, **0.00** prime-age). The engine can describe the measurement problem; it cannot warn. |
| 2 | **No distributional data.** C5's real claim is that the aggregate basket and the low-income basket diverge. Nothing in FRED's headline CPI proves who feels it. |
| 3 | **No hours or payroll data in the pipeline at all** (`scripts/collect.js:80`), so C1, C3 and D1's corroborating legs cannot be computed today. |
| 4 | **Ward M's household leg is OOZEMeter's own score**, so C8 is partly self-referential and its GFC firing is the episode both instruments were calibrated on. |
| 5 | **Payroll benchmark revisions of over a million** on the level (2025-06 vintage: May 2025 = 159,561k; today: 158,498k) can retroactively erase or create a conflict. No rule survives contact with revisions without vintage tracking. |
| 6 | **`AWHAETP` begins 2006-03** — the per-worker hours test has only 242 months, and cannot see 1970, 1980, 1990 or 2001. |

---

## 9. Live status board — 2026-07

What the engine would print today, given the specification above.

| Rule | Status | Why |
|---|---|---|
| **D1** employment line vs employed share | **MEANINGFUL CONFLICT** | Employment stress −2.67 over 3m (binding input UNRATE); employment-population −0.2pp. Base rate 4.23%. |
| **C2** unemployment vs participation | **MEANINGFUL CONFLICT** (measurement only) | UNRATE −0.2pp, participation −0.4pp, prime-age participation −0.4pp. Base rate 6.40%, **lift 0.36 — disclosed, no warning issued.** |
| **C1** payrolls vs unemployment | **MIXED SIGNALS** | Naive form fires (−23k, −0.1pp) but payroll change is inside the ±168k noise floor. |
| **C9** manufacturing | **MIXED SIGNALS** | INDPRO +1.14% YoY, MANEMP −0.11% YoY — does not clear −0.5%. Gated from `MEANINGFUL CONFLICT` regardless. |
| **C5** inflation vs essentials | **MIXED SIGNALS** | Headline 3.3% (−0.48pp over 3m, just short of −0.5); essentials 3.93%; gap +0.62pp vs +1.0pp required. |
| **C7** financial vs delinquencies | **INSUFFICIENT EVIDENCE** | `DRCCLACBS` last observed 2026-01-01, 7 months stale. |
| **C8** market vs household | **INSUFFICIENT EVIDENCE** | n=3 historically. Also not firing: market 37 > household 26. |
| **C3** payrolls vs hours | **SIGNALS AGREE** | Both legs inside noise (AWHI −0.08%, payrolls +60k). |
| **C4** claims vs unemployment | **SIGNALS AGREE** | Claims −10.9% YoY and unemployment falling — moving together. |
| **C6** mortgage vs affordability | **SIGNALS AGREE** | Rate −0.37pp YoY, payment-to-wage −6.05% YoY. Wages (+3.56%) outrunning house prices (+1.11%). |

**Roll-up: MEANINGFUL CONFLICT**, on the employment line, about measurement — not about
the direction of the economy.

---

## 10. What this engine must never do

1. **Never move the score.** No rule, no severity, no confidence level creates a write
   path to `data/latest.json`, `data/history.json`, or the calibration in
   `scripts/lib/methodology.js:27`.
2. **Never flag on sign disagreement alone.** Every leg clears an explicit, documented
   threshold or the status is `MIXED SIGNALS`.
3. **Never quote a lift without its n.** C8's 3.74× and C7's 3.16× are computed on 3 and 6
   observations respectively. Both must display n on the same line.
4. **Never assert a forward-looking claim for C2.** The historical record contradicts the
   intuitive story and the engine must say so in the same breath as the observation.
5. **Never let a rule ship without a base rate.** The rule table is invalid if any entry
   lacks `baseRate.tested >= 60`.
6. **Never add a rule because it sounds like a contradiction.** C9 sounds like the most
   obvious contradiction in economics and is the most wrong.

---

## 11. Reproducibility

All numbers in this document were computed by me from primary sources, not taken from the
repo's research archive:

- **FRED CSV**: `https://fred.stlouisfed.org/graph/fredgraph.csv?id={SERIES}` for
  `PAYEMS, UNRATE, CIVPART, EMRATIO, LNS11300060, LNS12300060, NILFWJN, U6RATE, ICSA,
  CCSA, AWHI, AWHAETP, AWHMAN, CPIAUCSL, CPIUFDSL, CPIHOSSL, CPIENGSL, CPIMEDSL, CPILFESL,
  MORTGAGE30US, CSUSHPINSA, MSPUS, AHETPI, NFCI, ANFCI, DRCCLACBS, DRSFRMACBS, INDPRO,
  IPMAN, MANEMP, USREC`.
- **ALFRED vintages**: `https://alfred.stlouisfed.org/graph/alfredgraph.csv?id=PAYEMS&vintage_date={YYYY-MM-DD}`,
  91 monthly vintages 2019-01-10 … 2026-08-10.
- **Repo artifacts**: `data/latest.json`, `data/market-history.json`.
- **Rejected**: `FIXHAI` (12 observations only); `CUSR0000SAM` (FRED returns an HTML error
  page for this ID — worth noting as a live data-source trap); `bls.gov` technical notes
  (HTTP 403 to automated fetch, so no BLS sampling-error figure is cited anywhere above).

Analysis scripts are in the session scratchpad (`baserates.py`, `phase2.py`, `phase3.py`)
and were not written into the repo. Nothing in the working tree was modified.
