# Forensic 04 — July 2026: payrolls fell, unemployment fell, and both are partly an artifact

**July 2026 Labor Forensic Investigator · audit date 2026-08-14 · read-only, no production code modified**

Every number below was pulled fresh from FRED (current vintage) or ALFRED (archival vintages) during this
audit. Where I could not reach a primary source I say so. Where the existing internal doc
`research/EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md` is right, I say so with numbers; where it is wrong, I
say that too.

---

## 0. HEADLINE

The July 2026 print looks paradoxical — payrolls −23,000, prior months revised down −169,000, unemployment
rate down 4.2% → 4.1% — and the paradox has three separate causes that the internal doc collapsed into one.

1. **The −23,000 is noise.** −0.29 sigma against the calm-period monthly standard deviation of 79,000, and
   well inside the BLS-published ±136,000 90% confidence interval for the monthly change. It is not
   statistically distinguishable from zero. What *is* distinguishable — decisively — is the trailing pace:
   +20k/month over three months against a 2013-2019 calm mean of +199k/month is **−3.9 sigma**.
2. **The unemployment rate fell entirely because people left the labor force.** In July, 178,000 people left
   unemployment, household employment *also* fell 87,000, the labor force fell 264,000, and "not in labor
   force" rose 380,000. Net hires: none. **Holding the labor force at June's level, July's U-3 would have
   been 4.24% — up, not down.**
3. **The largest single driver of the year-long "labor force collapse" is not economic at all.** The January
   2026 population controls cut measured employment and measured labor force by **1.4 million each** on the
   same day, with zero people losing a job. I reconstructed this independently from ALFRED vintages
   (−1,423k employment, −1,417k labor force, −0.45pp participation, −0.45pp emp-pop) and it matches the
   official BLS figures (−1.4M, −1.4M, −0.4pp, −0.5pp).

**Consequence for the internal doc:** its conclusion — *exit is retirement and demography, not
discouragement* — **survives**. Every discouragement corroborator I re-tested points the same way. But its
central rhetorical evidence does not survive: the "household employment fell 963,000 / labor force fell
1,318,000 / rarest in 930 months since 1948" package is measuring a reweighting seam. **93% of that
employment decline and 78% of that labor-force decline occurred in the single month containing the population
control.** Ex-seam, household employment is **+460k** and the labor force is **+99k** year over year. Do not
publish the 930-months claim.

**Consequence for the jar:** the confirmed false negative is real but is *not* "we missed a 23,000 job loss."
It is that the employment line — 24.25% of the score, the heaviest — contains no stock measure of employment
and no measure of the price of labor. The uncovered signal with the best claim to being *household stress* is
not payrolls: it is **real wages, which went negative this year** (+3.15% nominal vs +3.30% CPI = **−0.15%
real**, down from +1.22% a year ago). Nothing in the seven weighted lines reads it.

---

## 1. THE DATA

### 1.1 Provenance and release calendar

Release dates below are the ALFRED vintage dates for PAYEMS, which are the Employment Situation release dates.

| Reference month | Release date | Note |
|---|---|---|
| Sep 2025 | 2025-11-20 | delayed; shutdown |
| **Oct 2025** | **never released as its own report** | CES published with November; **CPS never collected** |
| Nov 2025 | 2025-12-16 | |
| Dec 2025 | 2026-01-09 | |
| Jan 2026 | 2026-02-11 | annual CES benchmark |
| Feb 2026 | 2026-03-06 | **Jan 2026 household data restated onto new population controls** |
| Jun 2026 | 2026-07-02 | |
| **Jul 2026** | **2026-08-07** | the print under audit |

### 1.2 Core table — current / prior / change / 12-month / vintage behavior

All values current-vintage as pulled 2026-08-14 from
`https://fred.stlouisfed.org/graph/fredgraph.csv?id=<ID>`.

| Measure | Series ID | Survey | Jul-2026 | Jun-2026 | Δ m/m | Jul-2025 | Δ 12m | Revision behavior |
|---|---|---|---|---|---|---|---|
| Unemployment rate | UNRATE | CPS | **4.1%** | 4.2% | −0.1pp | 4.3% | −0.2pp | Not revised monthly; annual seasonal + Jan re-basing |
| Unemployment level | UNEMPLOY | CPS | 6,916k | 7,094k | −178k | 7,272k | −356k | same |
| Nonfarm payrolls | PAYEMS | CES | **158,858k** | 158,881k | **−23k** | 158,542k | +316k (+26k/mo) | **2 revisions + annual benchmark** |
| Labor force | CLF16OV | CPS | 169,094k | 169,358k | −264k | 170,412k | −1,318k raw / **+99k ex-seam** | Jan-2026 restated |
| Participation rate | CIVPART | CPS | 61.4% | 61.5% | −0.1pp | 62.2% | −0.8pp raw / **−0.35pp ex-seam** | Jan-2026 restated |
| Emp-pop ratio | EMRATIO | CPS | 58.9% | 59.0% | −0.1pp | 59.6% | −0.7pp raw / **−0.25pp ex-seam** | Jan-2026 restated |
| Household employment | CE16OV | CPS | 162,177k | 162,264k | −87k | 163,140k | −963k raw / **+460k ex-seam** | Jan-2026 restated |
| Temporary layoffs | **LNS13023653** | CPS | 921k | 768k | **+153k** | 940k | −19k | not revised monthly |
| Permanent job losers | LNS13026638 | CPS | 1,715k | 1,769k | −54k | 1,894k | **−179k** | not revised monthly |
| Initial claims (Jul avg) | ICSA | UI admin | **203,250** | 222,500 | −19k | 221,500 | −8.2% | revised once, next week |
| Continuing claims (Jul avg) | CCSA | UI admin | **1,790,750** | 1,809,750 | −19k | 1,947,250 | **−8.0%** | revised once, next week |
| Avg weekly hours | AWHAETP | CES | 34.3 | 34.3 | 0.0 | 34.2 | **+0.1** | CES schedule |
| Avg hourly earnings | CES0500000003 | CES | $37.62 | $37.60 | +0.05% | $36.47 | **+3.15%** | CES schedule |
| Prime-age participation | LNS11300060 | CPS | **83.4%** | 83.3% | +0.1pp | 83.4% | **0.0pp** | not revised monthly |
| U-6 | U6RATE | CPS | **7.9%** | 7.9% | 0.0 | 7.9% | **0.0pp** | not revised monthly |
| Population 16+ | CNP16OV | CPS | 275,282k | 275,166k | +116k | 273,785k | +1,497k (+125k/mo) | Jan re-basing |
| 55+ participation | LNS11324230 | CPS | 36.9% | 37.1% | −0.2pp | 38.1% | −1.2pp | not revised monthly |
| NILF, want a job now | NILFWJN | CPS | 5,920k | 6,045k | −125k | 6,186k | −266k | not revised monthly |
| Median unemployment duration | UEMPMED | CPS | 10.5 wk | 11.0 | −0.5 | 10.2 | +0.3 | not revised monthly |
| Part-time for economic reasons | LNS12032194 | CPS | 4,804k | 4,681k | +123k | 4,689k | +115k | not revised monthly |

**Data-collection note the brief should absorb:** `TEMPLAYOFF` is **not a valid FRED series ID** — it returns
an HTML 404 page. The correct series for unemployment level, job losers on temporary layoff, is
**`LNS13023653`**. Any collector that silently accepted that fetch would ingest an error page.

### 1.3 The PAYEMS revision record (ALFRED, reconstructed)

Retrieved by POST to `https://alfred.stlouisfed.org/series/downloaddata?seid=PAYEMS`
(the `fredgraph.csv?...&vintage_date=` form is **silently ignored** on the FRED host and 404s on the ALFRED
host — a trap for anyone trying to check vintages).

| Reference month | First print | Current | Revision |
|---|---|---|---|
| Apr 2026 | 158,829 | 158,798 | **−31k** |
| May 2026 | 159,001 | 158,861 | **−140k** |
| Jun 2026 | 158,984 | 158,881 | **−103k** |
| Jul 2026 | 158,858 | 158,858 | *first print — not yet revised* |

Mean of the last three first-print-to-current revisions: **−91k, and 3 of 3 are negative.**
The revisions carried in the 2026-08-07 release alone were **May −66k and June −103k = −169k**, i.e. **seven
times the size of the headline −23k**.

Annual benchmark (vintage 2026-02-11): 2025-01 159,053 → 158,268 (**−785k**); 2025-09 159,593 → 158,548
(**−1,045k**).

> **Correction to the internal doc.** `EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md:20` cites "ALFRED vintage
> 2025-12-10 had 2025-09 at 159,626k … a −1,078k revision." **There is no 2025-12-10 vintage for PAYEMS.**
> ALFRED's vintage list goes … 2025-11-20, 2025-12-16, 2026-01-09 …. The 2025-12-16 vintage carried 2025-09
> at **159,593**, so the revision is **−1,045k**, not −1,078k. The substance holds; the citation does not.

---

## 2. WHAT HAPPENED

Two different surveys, released the same morning, disagreed — and both were right about what they measure.

**The establishment survey (CES / PAYEMS)** said the number of *payroll jobs* fell 23,000 in July, and that
it had overcounted May and June by a combined 169,000.

**The household survey (CPS / UNRATE)** said the *share of labor-force participants who are unemployed* fell
from 4.2% to 4.1%.

Underneath the household number:

| July 2026 flow | Change |
|---|---|
| Unemployed (UNEMPLOY) | **−178k** |
| Employed (CE16OV) | **−87k** |
| Labor force (CLF16OV) | **−264k** |
| Population (CNP16OV) | +116k |
| **Not in labor force** (CNP − CLF) | **+380k** |

Recomputed from the levels: June U-3 = 7,094 / 169,358 = **4.1888%**; July = 6,916 / 169,094 = **4.0900%**.
Both round exactly to the published prints.

**178,000 people stopped being counted as unemployed and employment fell by another 87,000.** On net, not one
of them took a job. All of it, and more, went to "not in the labor force."

---

## 3. WHY IT HAPPENED — the arithmetic, then the cause

### 3.1 The arithmetic of U-3

$$\text{U-3} = \frac{U}{E + U}$$

The denominator is the labor force — employed plus unemployed — **not the population**. A person who stops
searching leaves the numerator *and* the denominator simultaneously. Removing one unemployed person from a
labor force of 169 million lowers the rate; it does not require anyone to be hired. This is not a flaw in
U-3; U-3 is defined as a measure of *job search failure among searchers*, and it does exactly that. It is a
flaw in reading U-3 as a measure of *employment*.

**The counterfactual that settles it.** Hold the labor force at June's 169,358k and take July's actual
employment of 162,177k. Implied unemployed = 7,181k. Implied U-3 = **4.24%**.

> **If participation had not fallen, July's unemployment rate would have gone UP, from 4.19% to 4.24% —
> not down to 4.09%.** The entire published improvement, and then some, is labor-force exit.

Over twelve months, holding participation at a seam-adjusted July-2025 level of 61.75%, July-2026 U-3 would
be **4.60%** rather than 4.10%. (The naive unadjusted version of this calculation gives 5.28% and **should
not be used** — it double-counts the January reweighting. See §3.2.)

### 3.2 Cause one, and the largest: the January 2026 population controls

Every January, BLS re-weights the CPS to updated Census population estimates. The January 2026 controls
incorporated the updated 2020 Census base with sharply lower net international migration.

I reconstructed the effect from ALFRED without reference to any commentary. January 2026 was first published
on 2026-02-11 and restated on 2026-03-06 — the same reference month, the same reference week, the same
respondents, different weights:

| Jan-2026, CPS | First published (2026-02-11) | Restated (2026-03-06) | Pure reweighting effect |
|---|---|---|---|
| Employment CE16OV | 164,520k | 163,097k | **−1,423k** |
| Labor force CLF16OV | 171,882k | 170,465k | **−1,417k** |
| Population CNP16OV | 274,982k | 274,676k | −306k |
| Participation rate | 62.51% | 62.06% | **−0.45pp** |
| Emp-pop ratio | 59.83% | 59.38% | **−0.45pp** |

BLS's own published figures for the same adjustment: labor force **−1.4 million**, employed **−1.4 million**,
not-in-labor-force **+1.2 million**, participation rate **−0.4pp**, emp-pop ratio **−0.5pp**. **My
independent reconstruction matches to within rounding.**

The mechanism, per BLS: the updated base *lowered* the population of men aged 25-54 (high participation) and
*raised* the population of women aged 65+ (low participation). Total population barely moved (−306k); the
composition moved a great deal. Because CPS post-stratification weights every respondent to those cells,
composition change moves the aggregates far more than the total does. **Not one person lost a job.**

Now the consequence, which is what the internal doc missed:

| Twelve-month claim | Raw (as published) | Reweighting seam | Ex-seam |
|---|---|---|---|
| Household employment CE16OV | **−963k** | −1,423k | **+460k** |
| Labor force CLF16OV | **−1,318k** | −1,417k | **+99k** |
| Participation CIVPART | −0.8pp | −0.45pp | **−0.35pp** |
| Emp-pop EMRATIO | −0.7pp | −0.45pp | **−0.25pp** |

**93% of the raw twelve-month household employment decline, and 78% of the raw labor-force decline, occurred
in the single month spanning the reweighting.** On a consistent basis, December → January employment *rose*
528k and the labor force *rose* 387k; as published, on mixed bases, they "fell" 895k and 1,030k.

### 3.3 Cause two: genuine demographic exit

Real, and it survives the seam.

- 55+ participation **38.1% → 36.9%**, −1.2pp over twelve months. Roughly half of that (−0.6pp) lands at the
  seam month, so call the genuine behavioral component ≈ −0.6pp. Still real.
- Population growth **+125k/month** over the last twelve months, against **+428k/month** the year before.
  Both figures verified exactly (CNP16OV 273,785 → 275,282, and 268,644 → 273,785).

> **But the "428 → 125 collapse" framing overstates the trend break, and the internal doc repeats it
> uncritically.** The Jul-2024→Jul-2025 window contains the January 2025 population control, which revised
> population *up* for higher immigration estimates; the Jul-2025→Jul-2026 window contains the January 2026
> control, which revised it *down*. The window before both — Jul-2023→Jul-2024 — grew at **+137k/month**,
> essentially the same as today's +125k. **The +428k year is the outlier, not the +125k year.** The honest
> statement is "two opposite population-control revisions bracket the comparison," not "population growth
> collapsed by 70%." *(Claim type: SUPPORTED-EXPLANATION for the arithmetic; PLAUSIBLE-MECHANISM for the
> attribution to the controls specifically, which I could not decompose without the Census vintage files.)*

### 3.4 Cause three: a genuine, statistically significant slowdown in hiring

This is real and the internal doc under-weighted it by testing the wrong hypothesis.

| Window | Pace | vs zero | **vs 2013-2019 calm mean (+199k/mo)** |
|---|---|---|---|
| July print alone | −23k | −0.29σ | −2.81σ |
| 3-month average | +20k/mo | +0.44σ | **−3.92σ** |
| 6-month average | +44k/mo | +1.37σ | **−4.80σ** |
| 12-month average | +26k/mo | +1.15σ | **−7.57σ** |

Corroborated by JOLTS: quits rate **2.1 → 2.0**, hires flat, openings +2.2%, layoffs and discharges −4.2%.
That is the classic **low-hire, low-fire** configuration — the labor market froze rather than cracked.

### 3.5 What it is NOT: discouragement

I re-tested every discouragement corroborator independently. All of them point away from distress.

| Corroborator | Jul-2025 | Jul-2026 | Direction |
|---|---|---|---|
| U-6 (U6RATE) | 7.9% | 7.9% | flat |
| Continuing claims (CCSA) | 1,947,250 | 1,790,750 | **−8.0%** |
| Initial claims (ICSA) | 221,500 | 203,250 | −8.2% |
| Permanent job losers (LNS13026638) | 1,894k | 1,715k | **−179k** |
| NILF, want a job now (NILFWJN) | 6,186k | 5,920k | −266k |
| Layoffs & discharges (JTSLDL) | 1,843k | 1,766k | −4.2% |
| Average weekly hours (AWHAETP) | 34.2 | 34.3 | **+0.1 (rising)** |
| Prime-age participation (LNS11300060) | 83.4% | 83.4% | flat |

If this were a discouraged-worker episode, continuing claims would rise, permanent job losers would rise,
U-6 would rise, and hours would fall first. **All four go the other way.** Hours rising is the single most
telling one: employers cut hours before they cut heads, and hours are at a 12-month high.

**Verdict on `research/EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md`: its conclusion is CONFIRMED. Its evidence
is partly invalid.** *(Claim type: SUPPORTED-EXPLANATION.)*

---

## 4. WHAT THE HEADLINE MISSES

### 4.1 Two surveys, and why they can disagree without either being wrong

| | Establishment (CES) → PAYEMS | Household (CPS) → UNRATE |
|---|---|---|
| Sampled unit | ~119,000 businesses/agencies | ~60,000 households |
| Counts | **jobs** — one person, two jobs = two | **people**, classified into one status |
| Excludes | self-employed unincorporated, farm, unpaid | nothing; everyone 16+ non-institutional |
| Revised? | **twice, plus annual benchmark to UI records** | essentially never; annual seasonal + Jan re-basing |
| 90% CI, monthly change | **±136,000** | **±0.2pp** on the rate |
| Can be collected retroactively? | **Yes** — employers keep records | **No** — cannot ask about a past reference week |

That last row is not academic. **October 2025 is missing from the household survey and always will be.** In
current FRED data, `UNRATE`, `UNEMPLOY`, `CE16OV`, `CLF16OV`, `CIVPART`, `EMRATIO`, `U6RATE` and `CNP16OV`
are **all null at 2025-10-01**, while `PAYEMS` carries 158,408. The 2025 lapse in appropriations stopped CPS
collection; CES was reconstructed later from employer records and published with November. It is the first
break in the continuously published unemployment rate since January 1948.

**This matters to OOZEMeter directly:** the jar's employment line reads `UNRATE`, a series that now has a
permanent hole in it, and `ICSA`, which does not. Any 12-month or 6-month window straddling October 2025
silently drops a month on one leg and not the other.

### 4.2 Real wages went negative and nothing on the board reads them

| July | Nominal AHE y/y | CPI y/y | **Real** |
|---|---|---|---|
| 2024 | +3.63% | +2.94% | **+0.69%** |
| 2025 | +3.96% | +2.74% | **+1.22%** |
| **2026** | **+3.15%** | **+3.30%** | **−0.15%** |

Series: `CES0500000003`, `CPIAUCSL`. Real average hourly earnings crossed zero this year for the first time
in the sample window shown. This is a *household* stress signal — it is literally the purchasing power of a
paycheck — and it is closer to OOZEMeter's stated mission than payrolls are. The jar reads CPI (9.70%
weight) and gas (9.70%) but never divides a wage by a price.

### 4.3 A wrinkle that cuts the other way

Temporary layoffs (`LNS13023653`) rose **768k → 921k, +153k (+20%) in one month**. Year over year it is
−19k, and this series is volatile, so I would not build a case on it. But it is the one indicator in the July
household detail that moved toward distress, and an honest write-up should not omit it. *(Claim type:
CORRELATION — one month, no corroboration.)*

---

## 5. IS THE −23,000 DISTINGUISHABLE FROM ZERO?

**No. Unambiguously no.**

- Empirical standard deviation of monthly PAYEMS changes, calm window 2013-01 to 2019-12 (n=84): **79k**.
  (This reproduces the internal doc's figure exactly.) −23k = **−0.29σ**; the 90% band is **±131k**.
- BLS's own published 90% confidence interval for the over-the-month change in total nonfarm employment:
  **±136,000**.
- The −23k is a **first print**. Its three predecessors were revised −31k, −140k and −103k; the revisions in
  the very release that produced it totalled −169k, seven times its size.

**Any sentence of the form "the economy lost 23,000 jobs in July" is a statement about a number smaller than
its own measurement error.** OOZEMeter must not publish it as a fact, and the internal doc is right to say so.

**But the internal doc then stops at the wrong place.** "Not distinguishable from zero" is not the same as
"not distinguishable from normal." The relevant null is not zero — it is the calm-expansion norm of
+199k/month. Against that null, the three-month pace of +20k/month is **−3.92σ** and the twelve-month pace of
+26k/month is **−7.57σ**. **The slowdown is one of the most statistically significant facts in this dataset.
The July print is one of the least.** The publishable claim is the pace, never the print.

---

## 6. WHETHER IT MATTERS — the audit of what OOZEMeter actually published

### 6.1 The false negative is confirmed and live

`data/latest.json` publishes month **2026-07**, ooze **26**, with:

```
jobs   value=4.1%  asOf=2026-07-01  stress=13  delta=-1  seriesId=UNRATE
```

The heaviest line in the formula (24.25%) **eased by one point** in the month payroll employment fell, the
labor force shrank 264,000, and 380,000 people left for "not in the labor force." Mechanically correct per
`scripts/collect.js:108` (`jobs = max(interp(UNRATE), interp(ICSA/1000))`); editorially indefensible without
a note. **Confirmed, already documented, not re-reported as new.**

### 6.2 Neither remediation from the 2026-08-11 decision doc has shipped

Three days after the decision document recommended them:

- `data/latest.json` contains **no `payems` and no `emratio` line**. The only `contributesToOoze:false`
  entries are `foreclosures` and `manufacturing`. **Recommendation B did not ship.**
- `data/latest.json` has **no divergence note field of any kind** (`note` is absent). **The Divergence Gate
  did not ship.**
- `articles.js` contains **no July payroll correction**. The most recent correction (slug
  `correction-2026-08-archive-vintage`, dated 2026-08-14) concerns archive vintages. **The §6 correction
  copy did not ship** — and it is the one item the doc labelled "THE ONE THING."

Given §3.2, that delay is now a benefit: **the §6 draft as written contains at least two statements that
should never be published.** See §6.4.

### 6.3 Three stale numbers are live on the site, and the gate that should catch them cannot see them

`indicator.html:92` renders `${x.vs2008}` **raw**. The runtime patch block at `lab.js:209-215` overwrites
`val`, `contrib`, `stress`, `contributesToOoze`, `dir`, `trend` and `source` from `data/latest.json` — but
**not `vs2008`, not `why`, not `faqs`, not `spark`.** `resolveClaims` (`lab.js:235`) only substitutes
`{{...}}` tokens, and none of these strings contain any.

| File:line | Published text | Live value (`data/latest.json`) | Error |
|---|---|---|---|
| `lab.js:42` | "Today's **$3.42** is elevated" | gas **$4.01** | **−$0.59, 15% understated** |
| `lab.js:66` | "Today's **3.2%** delinquency … it has been **climbing steadily**" | credit **2.9%**, `delta: 0` | wrong level **and** wrong direction |
| `lab.js:90` | "Today's **4.4%** … the **direction of travel is what raises this line's pressure**" | jobs **4.1%**, `delta: -1` | wrong level **and** wrong direction |

The `4.4%` was already known. **The `$3.42` and `3.2%` are new, and the "direction of travel" clause on the
jobs card is a second, separate falsehood beyond the known one** — the rate fell 0.1pp and the line's stress
fell a point, so the sentence asserts the opposite of the data on the very page displaying that data.

**Root cause, and it is structural.** `scripts/narrative-check.js:105-106` evaluates **`articles.js` and
`data/auto-articles.js` only**. It never reads `lab.js`. The nine `INDICATORS` prose blocks — the per-line
explainer pages, the most-read educational surface on the site — sit entirely outside the narrative
integrity gate, while `lab.js:232` asserts as a design invariant: *"Canonical Truth: prose never remembers
unchecked numbers."* **Three of nine indicators violate the invariant the file declares.**

Cheapest correct fix: extend `narrative-check.js` to parse `lab.js` and fail on any digit-bearing literal in
`vs2008`/`why`/`faqs` that is not a `{{...}}` token or an explicitly whitelisted historical constant. That is
a gate change, not a methodology change — no version bump, no recalibration.

### 6.4 Statements in the decision doc's draft copy that would be false if published

Verified against current FRED data:

| Draft claim (`EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md:180`) | Status |
|---|---|
| "the number of people who say they want a job but are not looking has **fallen for three straight months**" | **FALSE.** NILFWJN: Mar 6,040 → Apr 6,111 → May 6,187 → Jun 6,045 → Jul 5,920. It **rose** twice, then fell twice. |
| "household employment fell 963,000 and the labor force fell 1,318,000" (`:176`) | **Raw-true, economically false.** 93%/78% is the January reweighting. Ex-seam: **+460k** and **+99k**. |
| "Employment down and unemployment down, together, has happened in **5 of the 930 months since 1948**" (`:176`) | **INVALID.** The screen fires on a reweighting seam, not an economic event. Do not publish. |
| "June … **already half-reversed**" (`:102`) | **FALSE.** Prime-age LFPR recovered 0.1 of 0.6 = **17%**; prime-age EPOP 0.2 of 0.6 = **33%**. |
| "prime-age participation is **83.4% today and was 83.4% a year ago. Exactly flat.**" (`:180`) | **True but base-picked.** Jul-2025's 83.4 was the *low* of 2025 H2. Against the Nov-25→May-26 plateau of **83.86**, today is **−0.46pp**. Prime-age EPOP: plateau 80.71 → 80.4 = **−0.31pp**. |
| "duration 10.5 weeks" as a calm corroborator (`:86`) | **True but cherry-picked.** 10.5 is the lowest print in eight months. Jan-Jul mean: **9.96 (2025) → 11.10 (2026), +1.14 weeks.** |

Claims I re-tested and **confirmed exactly**: prime-age LFPR 83.4→83.4; prime-age EPOP 80.4→80.4; 55+ LFPR
38.1→36.9; headline CIVPART 62.2→61.4; headline EMRATIO 59.6→58.9; U-6 flat at 7.9; July ICSA average 203k;
PT-for-economic-reasons +115k; PAYEMS calm-window σ = 79k; twelve-month PAYEMS +316k = +26k/month; population
growth 428k/mo → 125k/mo.

### 6.5 One editorial sentence that is a published false negative

`articles.js`, article `june-2026-seal` (month 2026-06):

> "Employment is the reason the jar stays calm. Unemployment held at 4.2%, and weekly jobless claims stayed
> quiet. Together they kept the employment line at just 14 — the calmest reading on the board. As the Lab
> Notes put it: **recessions are employment events, and there isn't one in this data.**"

The stress figure (14) and the rate (4.2%) are correct **for June** — correctly scoped, not an error. The
final clause is the problem: it converts *"our two search-flow inputs are quiet"* into *"there is no
employment event,"* using an instrument that by construction cannot see hiring, exit, or wages. At the time
it was published the three-month payroll pace was already −3.9σ from the calm norm. **The sentence is not
false about the jar; it is false about the labor market, and it is written in the voice of the labor
market.** Under the Editorial Constitution this is the exact failure mode the automation gate exists to
prevent.

### 6.6 What I checked and found *not* to be a problem

Reported because false positives cost as much as false negatives:

- **`lab.js:86` `val:'4.4%', trend:'▲ +0.1 pt this month', dir:'up'` is NOT a live error.** I initially
  flagged it. `lab.js:209-215` overwrites all four fields from `latest.json` on successful load, and
  `lab.js:227` blanks them to `'—' / 'sensor offline'` on failure. They are build-time placeholders that
  never reach a reader. **Withdrawn.**
- **The "employment line at just 14" in the June report is correctly scoped** to month 2026-06 and is not a
  stale live figure.
- **`lab.css:115` and `lab.css:490` `.down{color:var(--green)}`** — confirmed present at exactly the two
  places the brief names. Known; not re-reported as new. Note for whoever fixes it: with the current data
  this defect paints *falling unemployment* green, which is defensible for UNRATE and would be wrong the
  moment a payrolls or participation line is added. It becomes a live falsehood the day Recommendation B
  ships, not before.

---

## 7. WHAT DATA WOULD CONFIRM OR REJECT THIS INTERPRETATION

**Would confirm the benign (demography + freeze, not distress) reading:**
- Prime-age participation holding 83.3-83.5 through August and September 2026.
- Continuing claims (`CCSA`) staying below 1.85M.
- Permanent job losers (`LNS13026638`) staying under 1.8M.
- Average weekly hours (`AWHAETP`) holding 34.3.

**Would reject it and indicate genuine deterioration:**
- **Prime-age participation falling in three consecutive prints** (the internal doc's own stated trigger;
  currently 1 down, 1 up — not met).
- Continuing claims turning positive year over year — the single most informative cheap series here,
  because it separates "cannot find work" from "stopped looking."
- Permanent job losers rising above 1.9M while temporary layoffs stay elevated (the July +153k in
  `LNS13023653` repeating).
- U-6 rising above 8.3% while U-3 stays flat — the signature of hidden slack.
- Average weekly hours falling to 34.1 or below.
- Real AHE staying negative for two more quarters.

**The immediate test:** the August 2026 Employment Situation, due approximately 2026-09-04. It will carry the
first revision to July. Given the last three first-print revisions (−31k, −140k, −103k, all negative), a
downward revision is the base case — but that is a **pattern, not a prediction**, and OOZEMeter should not
publish it as an expectation.

---

## 8. RECOMMENDATIONS (ranked; none require a methodology version bump)

1. **Do not publish the §6 draft as written.** Strike the "5 of 930 months" claim, the raw −963k/−1,318k
   figures, and the "three straight months" sentence. Replace with the seam-adjusted numbers in §3.2 and the
   participation-constant counterfactual in §3.1, which is the strongest honest sentence available:
   *"If participation had not fallen, July's unemployment rate would have gone up, not down."*
2. **Fix the three stale `vs2008` numbers** (`lab.js:42`, `:66`, `:90`) and **extend
   `scripts/narrative-check.js` to parse `lab.js`.** The gate exists; it just does not look here. Highest
   trust-per-hour item in this report.
3. **Ship Recommendation B** (`PAYEMS`, `EMRATIO` as `contributesToOoze:false`) — still correct, still an
   afternoon. **Add `CE16OV` with a documented January-2026 discontinuity marker**, or do not add it at all;
   publishing an unmarked CE16OV chart would put the 1.4M artifact on the page as if it were job loss.
4. **Consider real average hourly earnings** (`CES0500000003` ÷ `CPIAUCSL`) as the next *weighted* candidate,
   not a participation leg. It is a household-purchasing-power measure, it just crossed zero, it is not in
   any existing line, and — unlike every participation leg the challenge round tested — it is conceptually
   inside the jar's stated mission. This is a research suggestion, not a spec; it must clear the same gate.
5. **Record the October 2025 hole** in the data-source registry and in any window logic that spans it.
6. **Fix the `TEMPLAYOFF` → `LNS13023653` series ID** wherever it is referenced, and add a collector assertion
   that a FRED CSV response beginning with `<!DOCTYPE` is a hard failure, not data.

---

## 9. SOURCES

All FRED series via `https://fred.stlouisfed.org/graph/fredgraph.csv?id=<ID>`, retrieved 2026-08-14:
`UNRATE`, `UNEMPLOY`, `PAYEMS`, `CLF16OV`, `CIVPART`, `EMRATIO`, `CE16OV`, `LNS13023653`, `LNS13026638`,
`ICSA`, `CCSA`, `AWHAETP`, `CES0500000003`, `LNS11300060`, `LNS12300060`, `U6RATE`, `CNP16OV`, `LNS11324230`,
`NILFWJN`, `UEMPMED`, `LNS12032194`, `JTSJOL`, `JTSLDL`, `JTSQUR`, `CPIAUCSL`.

Archival vintages via `https://alfred.stlouisfed.org/series/downloaddata?seid=<ID>` (POST), for `PAYEMS`,
`CE16OV`, `CLF16OV`, `UNRATE`, `CNP16OV`.

Underlying publisher for all labor series: U.S. Bureau of Labor Statistics, *Employment Situation*
(CES + CPS); JOLTS; claims via U.S. Employment and Training Administration.

**Access limitation, stated for the record:** `bls.gov` returned **HTTP 403** to every direct fetch from this
environment, including `news.release/empsit.nr0.htm` and the 2026-03-06 archive. The BLS population-control
figures quoted in §3.2 therefore come from **secondary summaries of the BLS release**, and are corroborated
by my **independent primary reconstruction from ALFRED vintages**, which agrees to within rounding. The
October 2025 CPS collection failure is likewise corroborated by secondary sources
([Richmond Fed](https://www.richmondfed.org/research/national_economy/macro_minute/2025/phantom_figures_missing_data_in_october),
[BLS revised release dates](https://www.bls.gov/bls/2025-lapse-revised-release-dates.htm),
[Friends of BLS](https://www.friendsofbls.org/updates/2025/11/12/2025-government-shutdown-faqs-on-bls-data))
**and** by the primary fact that seven CPS series are null at 2025-10-01 in FRED while PAYEMS is not.
Anyone with `FRED_API_KEY` set (see `.github/workflows/collect.yml:22`) can reproduce the vintage work
through the API; the `fredgraph.csv?...&vintage_date=` shortcut **silently returns current-vintage data** and
must not be trusted.
