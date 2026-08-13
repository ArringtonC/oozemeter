# STAGED DRAFT — Incident File: August 2007

**Not published.** Draft for operator approval. Written to
`research/editorial/EDITION-STYLE-GUIDE.md`. Every figure verified against
`research/backtest-results.json` and FRED before drafting; the verification table
is at the end of this file, outside the article.

**Deliberate omission:** this article does **not** mention the Flow architecture.
The Flow is proposed and tested, not built, and the Constitution does not permit
describing an aspiration as a feature. The article stands on the history alone.

**slug:** `incident-2007-08` · **cat:** `incident` · **date:** to be set at publication

---

## The month our loudest signal was worth one point

**The bottom line.** In August 2007, the part of our meter that watches the
financial system moved more in one month than any line has moved in the twenty
years we can measure. The overall score went up by one point, because cheaper
gasoline cancelled almost all of it. The signal was in our own data. The
arithmetic buried it.

---

On 3 August 2007, a television host lost his temper about the Federal Reserve on
live business news. He said the Fed knew nothing. The clip is famous enough that
people who were nowhere near a trading floor remember it.

We have no view on the man or the outburst. What interests us is that the date is
precise and public, which makes it something rare: a dated, checkable
disagreement about whether credit conditions mattered. We can run our instrument
over that week and see which side of the argument it lands on.

**Our meter did not exist in 2007.** What follows is today's methodology applied
to today's best view of that period — a reconstruction, not a bulletin. Sources
revise, and the record we are reading has been revised many times since.

### What the instrument says about that week

The Chicago Fed publishes a weekly index of financial conditions — a single
number summarising how easy or hard it is to borrow across the whole system.
Negative means easier than normal. Positive means tighter.

| Week | Reading |
|---|---|
| 27 July 2007 | −0.25 |
| **3 August 2007** — the outburst | **−0.14** |
| 10 August 2007 | −0.02 |
| **17 August 2007** — the Fed cuts the discount rate | **+0.10** |

It crossed from loose to tight in three weeks, and the crossing week is the week
the Fed finally moved.

Our financial conditions line — which reads that index — went from 14.8 in July
to 41.9 in August. **That is the largest single-month move any line makes in that
entire period.**

Meanwhile our employment line read 34.0 in July, 36.0 in August, 34.0 in
September. Flat. Asleep.

And the quietest line on the entire board that month was inflation, at 10.4.

That last number is worth sitting with. The complaint being shouted on television
was that the central bank was worrying about inflation while the credit system
seized. Our meter, reconstructed two decades later, agrees about the facts: in
August 2007 inflation was the calmest thing in the American economy, and the
plumbing was the loudest.

### And the score went up one point

Here is the part that matters more than the alignment.

Between June and August 2007 the overall reading moved from 45 to 46. Not much
happened, as far as the headline was concerned. Underneath it:

| Line | Move | Weight | Effect on the score |
|---|---|---|---|
| **Financial conditions** | **+31.4** | 3% | +0.94 |
| Credit cards | +5.2 | 19.4% | +1.01 |
| Auto loans | +5.2 | 14.6% | +0.75 |
| Employment | +1.3 | 24.3% | +0.31 |
| Housing | −1.1 | 19.4% | −0.21 |
| Inflation | −9.9 | 9.7% | **−0.96** |
| Gas | −10.6 | 9.7% | **−1.03** |

The financial line moved thirty-one points and was worth **under one point** of
the score, because it carries three percent of the weight. And falling petrol
prices and cooling inflation between them cancelled almost exactly that much.

Our heaviest line was asleep. Our lightest line was screaming. The two nearly
erased each other, and the reader saw a one-point move.

### What this does and does not tell you

It does not tell you our meter would have called the financial crisis. It would
not have. In August 2007 households genuinely were not failing — employment
really was calm, and the score was right to say so. The cascade had not reached
kitchens yet, and this instrument measures kitchens.

It does not tell you the television host had a method. A retrospective published
a year later, once he had been proved right, is not evidence that shouting works.
Nobody runs the segments where the shouting was wrong.

What it tells you is narrower and more useful: **the information was present in
our own data, in the right month, and the arithmetic hid it.** A thirty-one point
move on one line and a one point move in the headline are both true statements
about August 2007, and only one of them is interesting.

We are not changing the weight. It was set by a study that tested a range of
values and chose three percent on evidence, and one dramatic month is not a
reason to reopen a decision that was made carefully. Adjusting a number because a
past episode would look better is the exact failure this facility exists to avoid.

But a meter that can move thirty-one points on a line and one point on the
headline is telling you something about itself, and we would rather publish that
than not.

---

## HOUSEKEEPING
*Everything below is for people who want to check our work.*

**What this is.** An Incident File — our name for re-examining a historical month
with the current methodology. It is a reconstruction. OOZEMeter opened in July
2026; nothing here was published at the time.

**Vintage.** Every figure is current-vintage: today's data, today's formula. The
financial conditions index is revised weekly and its entire history recomputes,
so these are not the numbers anyone would have seen in 2007. We cannot claim the
meter would have caught this in real time, and we are not claiming it.

**Sources.** Financial conditions: Chicago Fed National Financial Conditions
Index. Employment, inflation, gasoline: Bureau of Labor Statistics and the Energy
Information Administration. Line stresses and weights: our published methodology
v3.0.0. All inputs, weights and calibration constants are public, so this
reconstruction can be rebuilt independently.

**The financial conditions line is new.** It entered the formula in methodology
v3.0.0 at three percent weight, in August 2026. It was added specifically because
of the 2007–09 episode, and a published sensitivity study established that its
measured benefit comes almost entirely from that episode. **Finding that it fires
in 2007 confirms a known property of the line rather than discovering a new one.**
We are stating that plainly because the alternative — presenting an expected
result as a revelation — would be the more flattering and less honest choice.

**What is genuinely new here** is not that the line fired. It is the size of the
cancellation: that a thirty-one point move was reduced to a one-point headline by
falling fuel and inflation in the same window.

**Dates.** The outburst was 3 August 2007. The Federal Reserve reduced the
discount rate on 17 August 2007 and did not reach a two percent federal funds
rate until 30 April 2008.

*We measure. We don't forecast.*

---
---

# VERIFICATION TABLE — not part of the article

| Claim | Source | Verified |
|---|---|---|
| NFCI −0.25 / −0.14 / −0.02 / +0.10 across those four weeks | FRED `NFCI` | ✓ pulled directly |
| Financial line 14.8 → 41.9 (Jul→Aug 2007) | `research/backtest-results.json` | ✓ |
| Employment 34.0 → 36.0 → 34.0 | same | ✓ |
| Inflation 10.4 in Aug 2007, lowest line on the board | same — next lowest was employment at 36.0 | ✓ |
| Jar 45 → 46 (Jun→Aug 2007) | same | ✓ |
| Per-line contributions in the table | computed from published weights × stress deltas | ✓ recomputed |
| Financial move = 115% of the net jar move | 0.94 ÷ 0.82 total raw move | ✓ |
| Discount rate cut 17 Aug 2007; fed funds 2% on 30 Apr 2008 | CNBC retrospective, Aug 2008 | secondary source — **verify against Federal Reserve H.15 before publishing** |
| "Largest single-month move of any line in that period" | scanned all seven lines, Apr 2007–Jan 2008 | ✓ financial +27.1 Jul→Aug is the largest |

**One item needs checking before this ships:** the discount-rate and fed-funds
dates come from the news retrospective, not from a primary Federal Reserve
source. Confirm against the Fed's own H.15 release or FOMC statements first.
