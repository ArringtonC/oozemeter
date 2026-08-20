# Decision Document: Does the national debt belong in the Ooze Score?

**2026-08-16 · for the operator, to be shown to the boss**

Every figure below was pulled from FRED and recomputed here. Where the first
answer looked convincing and turned out to be an artifact, that is shown rather
than tidied away.

---

## 1. THE QUESTION

> *"How does the ooze meter figure in our national debt? 40Ts. A new benchmark."*

Two claims and one implicit question. Taking them in order.

**Is it 40 trillion?** Nearly. FRED's latest published total public debt
(`GFDEBTN`) is **$39.07T** at 2026Q1, rising about **$550B a quarter**. On that
run rate it crosses 40T around 2026Q3. **He is right, and about a quarter early.**

**Does the Ooze Score read it?** No. Not in any line, weighted or auxiliary.
`scripts/collect.js` contains zero references to federal debt. That is a real
gap in coverage and worth stating plainly rather than defending.

**Should it?** That is the actual question, and the answer is no — but not for
the reason one might assume, and not without conceding the part he has right.

---

## 2. WHERE HE IS RIGHT, WITHOUT HEDGING

**Something did change, and it is not small.** Federal interest as a share of
federal receipts:

| | Interest / receipts |
|---|---|
| 2003Q1 | 15.4% |
| 2015Q1 | 12.6% |
| 2022Q1 | **12.6%** |
| 2024Q1 | **21.2%** |
| 2026Q1 | **20.8%** |

**The debt service burden nearly doubled in two years.** One in five federal
revenue dollars now goes to interest, against one in eight in 2022. Anyone
watching the fiscal position and calling it a new regime is reading the data
correctly.

**And the jar is silent on all of it.** The instrument has nothing to say about
sovereign solvency, and does not currently admit that in so many words.

---

## 3. WHY IT STILL DOES NOT BELONG IN THE SCORE

### 3.1 The first answer was an artifact, and it pointed the wrong way

Correlating debt against the jar over 93 shared quarters, 2003Q1–2026Q1:

| Series | vs the jar |
|---|---|
| Debt level | **r = −0.554** |
| Debt / GDP | r = −0.453 |
| Federal interest outlay | r = −0.458 |

Read naively: *as debt rose, household stress fell.* Debt is good for
households. That is obviously wrong, and the reason it is wrong is the useful
part.

**Federal debt is a ratchet.** Across 241 quarters it rose in **215** and fell
in **25** — it goes up **90%** of the time. A series that only moves one way is
a clock. Correlating it against anything measures the passage of time, and since
the jar happens to have fallen from ~44 to ~26 over the same stretch, the two
trends produce a confident negative number that means nothing at all.

### 3.2 Detrended, the sign flips — and that is still not a case for adding it

Comparing quarter-over-quarter **changes** instead of levels, which removes the
trend from both sides:

| | levels | changes |
|---|---|---|
| Debt vs jar | −0.554 | **+0.269** |
| Debt/GDP vs jar | −0.453 | **+0.476** |

So when debt/GDP jumps, household stress does rise with it. That looks like a
case for inclusion until you ask *when*.

### 3.3 The relationship exists only in the same quarter

| Timing | r |
|---|---|
| jar leads by 4 quarters | 0.069 |
| jar leads by 2 quarters | 0.101 |
| jar leads by 1 quarter | 0.132 |
| **same quarter** | **0.476** |
| debt leads by 1 quarter | −0.041 |
| debt leads by 2 quarters | 0.040 |
| debt leads by 4 quarters | −0.200 |

**The correlation is entirely contemporaneous and vanishes at every lead and
lag.** Debt/GDP has no predictive power for household stress at one quarter, two
or four.

That pattern is the signature of **two symptoms of the same event**, not a
causal chain. In a recession GDP falls (shrinking the denominator) and emergency
spending rises (growing the numerator) while households are hit — all at once.
Debt/GDP spiking alongside household stress is not debt causing stress. It is
both being downstream of the same downturn.

**Adding it to the score would double-count the recession we already measure.**

### 3.4 The channel that does reach households is already in the jar

Sovereign debt reaches a kitchen table through two doors:

- **Interest rates.** Heavier issuance pressures yields; yields set mortgage
  rates. **The 30-year mortgage rate is already the housing line, 19.4% of the
  score** — the second-heaviest input, and currently the binding one 96% of the
  time.
- **Inflation**, if debt were monetised. **CPI is already a weighted line at
  9.7%**, and it is also transitively upstream of the gas line through the
  deflator.

The household-facing consequences of federal debt are therefore **already
measured**, at the point where they actually touch a household. Adding the debt
level itself would not add information; it would add a slow-moving trend that
correlates with time.

---

## 4. THE DECISION

**Do not add federal debt to the Ooze Score.** It fails on evidence, not on
principle:

1. As a level it is a clock, not a signal (rises 90% of quarters).
2. Detrended it moves with household stress **only contemporaneously**, with
   zero lead at any horizon tested.
3. Its transmission to households runs through rates and inflation, both of
   which the jar already weights at 19.4% and 9.7%.

This is the same verdict, and the same reasoning, as the interest-rate
investigation of 2026-08-15: the candidate either duplicates something already
scored, or has no measurable relationship to household distress.

**What we should do instead — and it is the more honest fix:**

**Say what the instrument does not measure.** OOZEMeter measures *household*
economic pressure. It is silent on sovereign solvency, and a reader is entitled
to know that before assuming a calm jar means a calm country. A one-line scope
statement on `notes.html` costs nothing and forecloses a real misreading. The
boss arrived at that misreading from the outside in under a minute, which is
exactly the test that matters.

**What we should not do:** publish a view on whether $40T is sustainable. This
facility measures and does not forecast, and "the debt is fine / not fine" is a
forecast wearing a number. Nothing in our data licenses it.

---

## 5. ON THE BOND JOKE

> *"Let's keep buying our own bonds. 💪"*

Debt monetisation would reach households through inflation, which the jar reads
at 9.7% via CPI. If that channel ever opened, the instrument would register it —
not as "the debt got large" but as prices rising against wages, which is what a
household actually feels.

That is the whole design philosophy in one line: **the jar does not measure the
policy, it measures the kitchen.**

---

## 6. VERIFICATION

| Claim | Source | Checked |
|---|---|---|
| Debt $39.07T at 2026Q1 | FRED `GFDEBTN` | ✓ pulled |
| ~$550B/quarter growth | same, 2025Q4→2026Q1 | ✓ computed |
| Debt/GDP 122.6% | FRED `GFDEGDQ188S` | ✓ |
| Interest 12.6% → 20.8% of receipts | `A091RC1Q027SBEA` ÷ `FGRECPT` | ✓ computed |
| Rose in 215 of 241 quarters | `GFDEBTN` | ✓ counted |
| All correlations, levels and changes | vs `research/backtest-results.json` | ✓ recomputed |
| Zero debt references in the collector | `scripts/collect.js` | ✓ grepped |

**One caveat stated plainly:** the jar's history begins 2003-01, so every
correlation here covers 93 quarters. That window contains two recessions. It is
enough to reject a predictive claim; it is not enough to prove debt could never
matter at some threshold this window has not visited.
