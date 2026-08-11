# OOZEMeter — Decision Document: The Employment Line and the Oil Gauge
**Chief Methodologist · 2026-08-11 · for the operator, to be shown to the boss**

Every number below was recomputed from FRED or from files in the repo. Where the two rounds of investigation disagreed, I ran the test myself and say who won.

---

## 1. IS THE BOSS RIGHT?

### Critique (1): "Job losses were higher and unemployment was lower. That makes no sense."

**He is right about the facts, and he is right that the jar can't see it. He is wrong about the cause — and the difference matters enormously.**

Where he is exactly right, no hedging:

- July 2026: PAYEMS 158,881k → 158,858k (**−23,000 jobs**) while UNRATE fell 4.2% → 4.1%. Both true.
- **The jar does not read payrolls at all.** `scripts/collect.js:108` computes `jobs = max(interp(unemployment, UNRATE), interp(claimsK, ICSA/1000))`. PAYEMS appears in none of the seven weighted lines. The honest answer to his literal complaint is not "we weighted it wrong," it is **"we don't read that series."**
- The blind spot is real and mechanical. U-3 = unemployed ÷ (employed + unemployed). Stop searching and you leave the numerator and denominator at once, so the rate falls with nobody hired. Neither of our two legs can see it.
- The July combination is genuinely rare. **Household employment down y/y AND U-3 down y/y has happened in 5 of 930 months since 1948** — 1952-03, 2010-06/07/08, and 2026-07. Verified: CE16OV 163,140k → 162,177k (−963k) while UNRATE went 4.3% → 4.1%.
- And the payroll record he's reacting to was massively restated. ALFRED vintage 2025-12-10 had 2025-09 at 159,626k; it is now 158,548k — a **−1,078k revision**. Dec-24→Sep-25 growth restated +684k → +232k. Full-year 2025: **+116k**. Trailing 12 months to Jul-2026: **+316k, or 26k/month.** Our employment line moved on none of it, because UNRATE and ICSA are essentially never revised at that scale.

Where the critique is incomplete, respectfully and with numbers:

- **It is not a layoff event.** Initial claims in July 2026 averaged **203k** — near a cycle low, and never above 350k in this entire episode. U-6 is **7.9%, flat year over year**. Median unemployment duration is 10.5 weeks. "Not in labor force, want a job now" is **falling** — 6,186k (Jul-25) → 5,920k (Jul-26). If the copy says "people gave up looking because they can't find work," four free FRED series contradict it.
- **The −23k payroll print is not statistically distinguishable from zero.** Month-over-month PAYEMS standard deviation in the calm 2013-2019 window was 79k. A 0.1pp UNRATE move is well inside its own 0.132pp sd. The defensible claim is the six-month divergence, not the July print.
- **A first-round finding claimed a >1,000k twelve-month labor-force contraction had occurred in "exactly three episodes since 1948." That is wrong and a domain expert would catch it.** A fixed 1,000k threshold is −1.6% in the 1950s and −0.59% today. Screening on percentage (current: **−0.773%**), **18 of 930 months qualify across five episodes**: 1951-06/08/09, 1952-03, 2009-12, the 2020-04→2021-03 COVID run, and 2026-07. Still rare (1.9% of months) — but five, not three. **Do not publish the "three episodes" version.**

### Critique (2): "Oil prices aren't reflective of what's actually going on."

**On the product he was shown, this critique does not bite — and I think he may have been looking at the wrong instrument.**

- The household jar does not read oil. It reads **retail gasoline** (GASREGW, CPI-deflated). Right now that line is at **stress 61 on $4.08/gal — the jar's single highest line**, higher than housing (44), auto (44), credit (38), inflation (33), foreclosures (23), jobs (14), financial (12).
- WTI and retail gas are **not** disconnected. Monthly means 2003-2026, n≈284: **r = 0.900 in levels, 0.730 in month-over-month changes.** Gas-per-barrel moved only 1.92 → 2.05 over the last year.
- The WTI gauge lives in **Ward M**, the experimental instrument — and its one-directional limitation is *already disclosed on the page*. `scripts/lib/market-gauge-content.js:73` ships: *"Falling WTI can accompany collapsing demand during a recession, so a one-direction high-price scale can miss severe demand stress."*

So: the answer to critique (2) is three sentences, and it ships nothing. **Adjudication: the challenge round wins this outright.** The first round proposed rebuilding the Ward M oil gauge; I killed that in §4.

---

## 2. WHAT THE JAR GOT WRONG, EXACTLY

**The sentence the operator should be able to say from memory:**

> "Our employment line reads two things: the unemployment rate and new jobless claims. Both measure people who are *actively looking* for work. Neither can see someone who stops looking. When people leave the labor force, the unemployment rate falls — mechanically, with nobody getting hired — and our line reads that as improvement. We also don't read payrolls at all, so the −23,000 jobs number never touched the score."

**How long has it existed:** since the first published version. It is architectural, not a bug.

**Did it affect the backtest, not just July? Yes — verified from `research/backtest-results.json`, which is already in the repo:**

Employment stress across the 2007 turn: 36.975 (Dec-2006) → 32.025 (Mar-2007) → 34.725 (Jun-2007) → **36.000 (Aug-2007)**. It *fell* while EMRATIO dropped 63.4 → 62.7. Contribution to the jar's rise:

| Window | Employment contribution | Jar move | Employment share | Its weight |
|---|---|---|---|---|
| Dec-06 → Oct-07 | **+0.52 pts** (last of 7 lines) | 39 → 52 | **4.0%** | 24.25% |
| Dec-06 → Dec-07 (NBER peak) | **+2.68 pts** (3rd of 7) | 39 → 57 | **14.6%** | 24.25% |

**Publish both rows.** The +0.52 figure is endpoint-sensitive and a hostile reader will find the Dec-2007 version and call the first one cherry-picked. The honest claim survives either way: *the heaviest line in the formula under-contributed to the last real turn.*

**Root cause is sharper than "U-3 is blind":** the line is `max(UR-leg, claims-leg)`, and I verified **the claims leg bound in 60 of 60 months across 2003-2007** — the unemployment anchor wasn't even the active input. Both legs are *flow* measures of search and claiming. Neither is a *stock* measure of employment. (Today the binding leg has flipped: Jul-2026 UR-leg 13.0 vs claims-leg 5.8. U-3 is the active input now.)

---

## 3. THE RECOMMENDATION

# Disclose and instrument. Do not change the score. Do not spec v3.1.0.

I came into this expecting to recommend a new employment leg. The evidence killed it. Here is the decisive finding, which I verified myself because everything turns on it:

### The finding that decides this

| Series | Jul-2025 | Jul-2026 | Change |
|---|---|---|---|
| **Prime-age (25-54) participation** | 83.4 | 83.4 | **0.0** |
| **Prime-age (25-54) EPOP** | 80.4 | 80.4 | **0.0** |
| Headline participation | 62.2 | 61.4 | −0.8 |
| Headline EPOP | 59.6 | 58.9 | −0.7 |
| **55+ participation** | 38.1 | 36.9 | **−1.2** |
| 16-24 participation | 35.0 | 34.9 | −0.1 |

**Prime-age is exactly flat, to the decimal, in both measures. The entire headline participation decline is the 55+ cohort.** Add the population channel: CNP16OV growth collapsed from **+428k/month to +125k/month**, and foreign-born labor force fell −550k y/y against native-born −861k.

The first round argued for a prime-age EPOP leg *because* it strips the retirement confound. It strips the confound and the signal with it. The challenge round then built the leg and ran it: **it buys zero lead time at the 2007 turn in every configuration** (baseline clears Dec-2006 by 5 points at 2007-12; with aggressive, moderate, and conservative anchors: 2007-12, 2007-12, 2007-12), and **it does not fire at all on the current episode**. **Adjudication: the challenge round is correct, and I confirmed its premise independently.**

### The three reasons not to ship a methodology change

1. **The signal isn't household stress.** Every household-stress corroborator is benign: U-6 flat at 7.9%, claims 203k, "want a job now" falling y/y, duration 10.5 weeks. The composition is retirement plus a slower-growing population. A jar reading low employment stress may be **correctly calibrated for its stated purpose**. (Honest caveat: y/y, duration is +0.3wk and part-time-for-economic-reasons +115k — marginally worse, not better. The defensible statement is "no household-stress corroborator is deteriorating materially," not "everything is improving." The first round's Jan→Jul framing overstated the improvement by picking a favorable base.)

2. **`max()` is a one-way ratchet, and nobody named it as the real constraint.** Any new argument to `max()` can only *raise* stress, and must beat the incumbent leg rather than merely move. That's why every tested leg moved 128-167 of 281 archived months upward. In 2007 the claims leg already sat at 34-38 while the prime-age gap was 0.4-0.7pp; to score 38 on a 0.5pp gap you must map the *median* of the distribution to "stressed," which fires the leg in half of all months.

3. **The kill criteria were unfalsifiable.** `scripts/backtest.js:122-127` re-derives calibration on every run (`a = 80/(rawGfc−rawCalm)`), so calm lands at 10.0 and the GFC peak at 90.0 **by construction, for any leg**. A gate that passes everything is not a gate. Even holding the frozen `a=1.418684, b=−23.965`, all tested legs landed calm at 10.0-10.9 and the GFC peak at exactly 90.0 — the peak can't move because 2009-06 employment stress is already 78.2 off the claims leg.

And the price of shipping anyway: **a third public revision record on the order of v2.0.0 (244 months moved) and v3.0.0 (180 of 281, 9 band labels flipped)** — spent on a signal our own evidence says is not household stress.

### What to do instead

**A. Ship the correction now.** No version bump, no backtest, no gate. Section 6 is the draft.

**B. Add PAYEMS and headline EMRATIO as unweighted context lines — `contributesToOoze: false`.**

This is the part that changes the cost calculus: **the infrastructure already exists and is already live.** `scripts/collect.js:182` ships `manufacturing` with `contributesToOoze:false`, and `foreclosures` alongside it. Both already render on the page. Adding PAYEMS and EMRATIO is following an existing pattern, not building a new one — an afternoon, not a project. It puts the boss's exact number in front of readers with **zero** methodology change, and it starts the observation record any future weighted change would need.

**C. Watch prime-age for two or three prints, then decide.** The monthly path is the whole question: prime-age participation ran 83.8, 83.8, 84.0, 83.9, 83.8, 83.8, 83.9 (Nov-25→May-26) — dead flat — then **−0.6 in June 2026 and +0.1 back in July**. Prime-age EPOP: −0.6 in June, **+0.2 back in July**. June looks like a one-month artifact that already half-reversed. If prime-age resumes falling for three straight prints, reopen this file with a real signal. If it doesn't, there was never anything to weight. Costs nothing but patience — the one resource a one-person team actually has.

### Alternatives rejected

| Rejected | Why |
|---|---|
| `max(UR, claims, primeAgeEpopGap)` | Zero lead at 2007 in all three anchor settings; doesn't fire on the current episode; prime-age is flat y/y |
| `max(...)` with **headline** EMRATIO | Does fire (14.3 → 37.0; ooze 26 → 34) but only because it carries the demographic drift — it would score boomer retirement as household stress and drift upward forever |
| 6-month EMRATIO momentum leg | The only config that leads 2007 advances it 4 months, but fires in ~20% of months and **misfires 39 times in calm expansions**, including a sustained 2017-2019 run putting employment stress at 38-48 while unemployment was 3.7% |
| Re-weighting employment downward | Tunes the output so it "looks right." Banned. |
| Adding PAYEMS as a weighted line | Would have to survive the same backtest gate; and it is the most-revised series we'd touch (−1,078k in one restatement) |

**Criteria (b) "fires <20% of months" and (c) "advances the 2007 turn" are mutually exclusive.** Every leg that leads 2007 floods the expansions; every leg that stays quiet leads nothing. **That result is the deliverable**, and it points one direction: don't ship.

If the operator ever does want participation in the formula, **the architectural question comes first** — separate weighted line, or blended leg, versus another argument to `max()`. Specifying a `max()` argument is specifying the one form that structurally cannot deliver the lead time it promises.

---

## 4. THE OIL QUESTION

**Verdict: no change to Ward M. The critique is answered by pointing at the gas line.**

- The household jar reads **retail gas, and it is the loudest line on the board at stress 61.** That is the complete answer to "oil isn't reflective of what's going on."
- WTI↔retail gas are tightly coupled (r=0.900 levels, 0.730 changes). They are not disconnected.
- The one-directional limitation in Ward M's WTI gauge is **already published and already labeled provisional**, cross-referenced to `research/market-anchor-validation.md`. The "ship the disclosure" move is already shipped.

**The proposed fix — a two-sided or magnitude-based 3-month-change map — is falsified. I ran the timing test the original didn't.** The decile split reproduces (bottom decile 13/49 recession-coincident, top 8/49, middle 15/384), but *coincident* is not *informative*. Relative to the four recession starts in sample, the crash decile first fires at **−4 months (1990 only), +7 (2001), +8 (2008), and 0 (2020)** — it led once and lagged by most of a year twice. **36 of 49 crash-decile months had no recession at all**, clustered in the 2014-16 shale glut, 1998, 1986, 2018-19, 2022-23.

And the punchline: **2026-07 is itself in the crash decile** (3-month WTI −19.8%, cutoff −16.9%). The proposed fix would make Ward M print stress *today*, on a pattern whose historical analogues were mostly supply gluts. Also, $82 → stress 52 is not "reading it as relief" — the anchor-validation table gives the energy gauge a historical median of 44.65, so it is currently **above** median. Falling is not relieved.

---

## 5. THE PROCESS FIX — the "does this make sense?" gate

The boss caught this by asking a question no automated check asks: *can these two numbers both be true in the direction we're reporting?* Encode it.

### Rule text (proposed for `policies.html`, and as a check in the collection run)

> **Divergence Gate.** Before publication, the collector compares each weighted line's stress direction against a fixed list of corroborating public series. When a line's stress moves in the opposite direction from a corroborator by more than the threshold below, publication does not stop and the score is not adjusted. Instead the edition **must** carry a labeled Divergence Note naming the line, the corroborator, both numbers, and the direction of the conflict.

**Employment line — corroborators and thresholds:**

| Trigger | Threshold |
|---|---|
| Employment stress falls while EMRATIO fell over the trailing 6 months | ≥ 0.3pp |
| Employment stress falls while CIVPART fell over the trailing 6 months | ≥ 0.3pp |
| Employment stress falls while PAYEMS 3-month average is negative | any |
| Employment stress falls while CE16OV is down year over year | any |
| Any line's stress falls ≥ 5 points while its own most recent vintage revision exceeded | 0.5% of level |

(Same pattern for the other six lines; employment is the one to ship first.)

### The guarantee that it produces disclosure, not adjustment

Three structural properties, all of which must hold:

1. **The gate has no write path to the score.** It runs *after* `composite()` and reads its output. Its only output is a note object in `latest.json` and a rendered block. It cannot modify `stresses`, `WEIGHTS`, or `CAL`.
2. **The corroborators carry weight zero, permanently.** They ship as `contributesToOoze: false` — the same flag `manufacturing` already uses. Promoting one to weighted requires a version bump, a backtest, and a public revision record. The gate cannot do it.
3. **Firing is logged, not resolved.** A fired gate produces text. There is no code path in which the gate's output changes a number, so "tune it until the gate stops firing" is not available even in principle.

**The gate would have fired on this print** — employment stress fell 2 points while the 6-month EMRATIO change was −0.5pp. It would have fired at 2007-04 and stayed lit through the turn. It buys the disclosure that the weighted leg could not buy, at a fraction of the cost and none of the calibration risk.

---

## 6. WHAT WE TELL READERS

*Draft for the next edition. Note the publication state carefully: `data/latest.json` publishes month **2026-06** with ooze **26**, while the jobs line already carries `asOf 2026-07` at stress 14, delta −2. The July unemployment print is live in the line but the composite has not rolled to July. The copy below says so.*

> **A correction, and where it came from.**
>
> An outside expert who works with this data looked at the jar and asked a question we had not asked ourselves: how can the score read jobs as improving when the economy lost 23,000 payroll jobs? He was right to ask, and finding the answer took us somewhere we did not expect.
>
> Our employment line reads two numbers: the unemployment rate and new jobless claims. Both count people who are actively looking for work. Neither can see someone who stops looking. When people leave the labor force, the unemployment rate falls on its own — no one has to get hired. **We also do not read the payroll number at all.** It is in none of the seven weighted lines. The 23,000 lost jobs never touched the score.
>
> Here is what that produced. The composite currently published is June 2026, at 26. The jobs line has already taken the July unemployment print — 4.1%, down from 4.2% — and its stress fell 2 points, to 14. Over the twelve months to July, household employment fell 963,000 and the labor force fell 1,318,000 while the unemployment rate went from 4.3% to 4.1%. Employment down and unemployment down, together, has happened in 5 of the 930 months since 1948.
>
> This is not new. At the last recession, our employment line — the heaviest in the formula at 24.25% — went from 36.98 in December 2006 to 36.00 in August 2007. It *fell* while the labor market rolled over. From December 2006 to October 2007 it contributed 0.52 points of the jar's 13-point rise, the smallest of the seven lines. Extending to December 2007, the recession's official start, it contributed 2.68 of an 18-point rise — third of seven, still under its weight.
>
> **We are not changing the score, and we want to be specific about why.** We built the fix and tested it. A labor-force-participation leg buys zero additional warning at the 2007 turn in every version we tried, and the versions that do warn earlier misfire dozens of times during calm expansions — one would have put employment stress at 38-48 through 2017-2019, when unemployment was 3.7%. More importantly, when we looked at who left, prime-age participation (ages 25-54) is **83.4% today and was 83.4% a year ago. Exactly flat.** The entire decline is the 55-and-over cohort, down 1.2 points, alongside population growth that slowed from 428,000 a month to 125,000. Meanwhile every measure of household job distress is quiet: broader underemployment (U-6) is flat at 7.9%, new claims are running near 203,000, and the number of people who say they want a job but are not looking has fallen for three straight months.
>
> So the honest reading is: fewer people are working and fewer are looking, and it does not currently look like household distress. We can say the first part with numbers. We cannot say the second part is stress without evidence we do not have, and we will not imply it.
>
> **What changes.** Payroll employment and the employment-population ratio now appear on this page as watched, unweighted context — visible, labeled, not scored. And we are adding a publication gate: when any line's stress moves opposite to its corroborating series by more than a set threshold, the edition must carry a note saying so. The gate can only produce text. It has no ability to change the score, by design.
>
> One more thing worth saying plainly. He also said oil prices were not reflective of what is going on. On the household jar, oil is not what we read — we read what you pay at the pump, and that line is currently our loudest at 61 out of 100, on $4.08 a gallon. The oil gauge he may have seen belongs to Ward M, our experimental market instrument, where its one-direction limitation has been disclosed on the page since it launched.
>
> He caught something real, and he caught it faster than our own checks did. That is worth publishing.

---

## 7. THE ONE THING

**Ship the correction paragraph in §6, this week. Nothing else.**

It requires no version bump, no backtest, no recalibration, and no risk to the frozen v3.0.0 calibration. It is the highest-value action available and it is the product's entire differentiator doing exactly what it exists to do: an outside expert found a blind spot, and the publication says so in public, with the receipt from its own archive.

If there is room for a second thing, it is **B** — add PAYEMS and EMRATIO as `contributesToOoze: false` lines, following the `manufacturing` pattern already at `scripts/collect.js:182`. It is an afternoon, and it puts the boss's exact number on the page.

**What to say to the boss, verbatim:**

> "You were right, and you were right about something bigger than the July print — we don't read payrolls at all, and our unemployment input structurally cannot see people leaving the labor force. That's now published. But when I dug in the way you asked, the cause wasn't layoffs. Prime-age participation is 83.4% today and was 83.4% a year ago — dead flat. The whole decline is 55-and-over plus population growth falling from 428k a month to 125k. Claims are at 203,000 and U-6 is flat. I built the fix you'd expect and it bought zero extra warning at the 2007 turn while lighting up through 2017-2019 at 3.7% unemployment. So we disclosed it, put payrolls on the page unweighted, and added a gate that forces a note whenever a line disagrees with its corroborators. On oil — the household score reads retail gas, not WTI, and it's our highest line right now at 61."

---

**Files referenced (all absolute):**
- `/Users/arringtoncopeland/Desktop/Projects/oozemeter/scripts/collect.js` — line 108 (`jobs = max(...)`), lines 49-57 (weights), **line 182 (`contributesToOoze:false` — the pattern to copy)**
- `/Users/arringtoncopeland/Desktop/Projects/oozemeter/research/backtest-results.json` — the 2007 receipts
- `/Users/arringtoncopeland/Desktop/Projects/oozemeter/data/latest.json` — publication state: month 2026-06, ooze 26, gas 61, jobs 14 asOf 2026-07
- `/Users/arringtoncopeland/Desktop/Projects/oozemeter/scripts/lib/market-gauge-content.js` — line 73, the already-published oil disclosure
- `/Users/arringtoncopeland/Desktop/Projects/oozemeter/scripts/backtest.js` — lines 122-127, the calibration re-derivation that makes the original kill criteria unfalsifiable

**Corrections to the investigation, for the record:** the "three episodes since 1948" labor-force claim is wrong (five, on a scale-neutral screen — publish the 9.4th/11.6th-percentile 6-month EMRATIO framing instead, which also sidesteps the January population-control seam); the "+0.52 of 13 points" receipt must ship with its Dec-2007 counterpart (+2.68 of 18) or it reads as cherry-picked; the prime-age EPOP leg was asserted to buy 5-8 months of lead and buys zero; and the Jan→Jul corroborator window overstates improvement relative to the y/y comparison.