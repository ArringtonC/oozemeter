# The Flow — architecture and empirical validation

**Status:** design proposal, validated against 23 years of data. Not built, not shipped.
**Date:** 2026-08-12 · **Origin:** operator architecture, tested by Claude
**Supersedes:** the "What doesn't add up?" / anomaly-detector direction in
`mockups/inspiration-board.html`, which this replaces.

---

## The idea, in the operator's frame

OOZEMeter has been measuring the **stock** while everyone expected it to notice
changes in the **flow**. That is the whole reason it feels late.

> **THE JAR** — the OOZE score. Pressure households are experiencing *now*,
> from confirmed data. Unchanged. Still the product.
>
> **THE FLOW** — what is entering or leaving the system right now. Faster-moving
> instruments. Detects *change*, not badness.
>
> **VERIFICATION** — has the flow reached the level yet? `confirmed` /
> `pending` / `did not verify`.

Scientists separate stock from flow routinely. A tank gauge reads the level; a
flow meter reads what is going in. Neither is a forecast, and neither substitutes
for the other.

**The governing rule, stated once:**

> The Flow detects change. Verification determines whether it reached households.
> The OOZE score measures realized household pressure. **Never use one as a
> substitute for another.**

---

## The empirical question, and the answer

An early-warning layer is worthless if it cries wolf and worthless if it never
fires. Everything below was computed from FRED series, and the numbers reproduce.

### The naive design fails — and how it fails matters

First attempt: fire when a 4-week change exceeds the 95th percentile of all
historical 4-week changes for that series.

On the Chicago Fed's financial conditions index this fires 5.0% of weeks — a
sensible-looking rate. **And it does not fire in August 2007 at all.** Peak move
was 0.445 against a 0.511 threshold.

Why it fails, which is the important part:

| Era | Firings at the full-history threshold |
|---|---|
| 1971–1999 | **127** |
| 2000–2007 | 0 |
| 2008–2009 | 17 |
| 2010–2019 | 0 |
| 2020–2021 | 3 |
| 2022–2026 | 0 |

The threshold is set by an era with structurally different volatility, and by
crisis peaks. **A detector calibrated on all history can only fire once you are
already inside the crisis, because onset is by definition smaller than peak.**
This is the trap any naive implementation falls into.

### The design that works

Judge a move against **how that instrument has been behaving lately**, not
against all history:

```
signal   = 4-week change in the series
baseline = mean and standard deviation of 4-week changes
           over the trailing 104 weeks, using prior data only
z        = (signal − mean) / sd
HORN     when |z| ≥ 3
```

On financial conditions this fires **1.9% of weeks** — 24 of 1,232 since 2003.
Grouped into episodes:

| Episode | Weeks | Peak z | Direction |
|---|---|---|---|
| **2007-07-20 → 2007-08-31** | 7 | **8.0** | tightening |
| 2007-11-23 → 2007-11-30 | 2 | 3.4 | tightening |
| 2008-09-19 → 2008-10-17 | 5 | 4.8 | tightening |
| 2018-02-16 → 2018-03-02 | 3 | 3.3 | tightening |
| 2020-02-21 → 2020-04-03 | 7 | **8.6** | tightening |

**Five episodes in 23 years. Every one a real financial event. Zero junk.**
Subprime seizure, the second credit leg, Lehman, Volmageddon, COVID.

And the headline result: **the Horn sounds on 2007-07-20 — two weeks before
Cramer's on-air rant and four weeks before the Fed cut the discount rate.**
Peak z of 8.0 lands on the exact week of the rant.

### It generalises, but instrument quality varies

| Instrument | Episodes since 2003 | Rate | Quality |
|---|---|---|---|
| Financial conditions (NFCI) | 5 | 0.2/yr | **Excellent** — all five meaningful |
| Oil (WTI, 4wk % change) | 9 | 0.4/yr | Good — 2008, 2014-15 collapse, 2016, COVID |
| Initial claims (4wk % change) | 10 | 0.4/yr | **Noisier** — several are one-off distortions |

The claims firings include September 2005 (Katrina), November 2012 (Sandy), and
October 2013 (the government shutdown). Those are real events but they are
*weather and calendar artifacts*, not turns. **Claims will produce horns that
clear.** That is acceptable under this design — publishing the negative is the
point — but it means instruments are not interchangeable and claims should carry
a note saying it is prone to one-off spikes.

### The horn budget

Three instruments at ~0.4/yr each ≈ **1.2 horns per year**. That is the right
cadence for "this is genuinely unusual."

**Horns scale linearly with instruments watched.** Nine instruments would produce
~3.5/yr and the horn stops meaning anything. So: **pick a target rate first — I
suggest no more than two per year — and let it constrain how many instruments
get horns.** Not every line needs one.

### Verification has a measured deadline

Oil → retail gasoline, correlation of 4-week changes at increasing lag, from
1,804 aligned weekly observations:

| Lag | r |
|---|---|
| 0 weeks | 0.524 |
| **1 week** | **0.632** ← peak |
| 2 weeks | 0.610 |
| 3 weeks | 0.529 |
| 4 weeks | 0.403 |
| 6 weeks | 0.191 |
| 8 weeks | 0.086 |

Transmission peaks at one week and is effectively dead by six. So an oil horn
gets a **pre-registered verification window of three weeks**, and if the pump has
not moved by then the horn **did not verify** — that is a measured deadline, not
a judgement call.

---

## The state machine

Four states. The engine may not invent others.

```
NO HORN  →  HORN  →  PENDING  →  CONFIRMED
                             →  DID NOT VERIFY
```

- **NO HORN** — nothing moved enough to investigate. *This is a valid, publishable
  result and most weeks will be this.*
- **HORN** — an instrument moved ≥3σ against its own recent behaviour.
- **PENDING** — the confirming series has not published yet, or the window is open.
- **CONFIRMED** — the confirming series moved in the predicted direction inside
  the window.
- **DID NOT VERIFY** — the window closed without confirmation.

**Tests return three values: YES / NO / NOT YET.** A quarterly confirmer cannot
answer in a week, and "no" from a series that has not published is a lie.

**Horns are never retroactively deleted.** The timeline is the record: *sounded
Aug 12 · not confirmed Aug 19 · cleared Aug 26.* A cleared horn is evidence the
instrument noticed something and refused to overreact.

---

## Rules that keep this from becoming forecasting

These are the guardrails, and they are the reason this design is publishable
under a Constitution that forbids prophecy.

1. **The Flow has no write path to the score.** It runs after the composite and
   reads its output. It cannot modify stresses, weights, or calibration. "Tune it
   until the horn stops firing" is not available even in principle.

2. **Verification is pre-registered.** When a horn sounds, the edition names the
   confirming series *and* the window, before the answer is known. Deciding
   afterward what would have counted as confirmation is post-hoc storytelling.

3. **No implied score.** Do **not** publish "OOZE is 26 but will be 34." That is
   a forecast and would require proving the mapping predicts future readings.
   Publish direction and magnitude of pressure. An implied range must be *earned*
   through backtesting later, if ever.

4. **The Flow is direction-agnostic.** It reports that an instrument moved
   sharply, not that the news is bad. Mortgage rates collapsing sounds the horn.
   Claims dropping sharply sounds the horn. Significance is what verification
   establishes.

5. **A horn is not an explanation.** The engine reports what moved, how unusual
   the move was, and whether it has spread. It does not say why. If Iran does
   something and oil does not move, the Flow has nothing to say.

6. **Revision honesty.** NFCI revises and its whole history recomputes. Every
   claim in this document is current-vintage. We can say the design detects onset
   rather than peak; we **cannot** say "we would have caught it live in 2007."

---

## What this resolves

It is worth listing, because this one architecture closes five open problems:

| Problem | How the Flow resolves it |
|---|---|
| The 2007 blind spot | The horn fires at onset without touching the 3% financial weight — no methodology change, no recalibration risk |
| Oil's dual reading | Horn detects the move; verification asks whether it reached the pump. No verdict required |
| `down = green` polarity bug | The Flow does not need a universal polarity. It asks whether the instrument *changed*, not whether change is good |
| "Empty most weeks" risk | **NO HORN is the result.** A quiet week is a publishable finding, not filler |
| Weekly vs monthly cadence | The monthly seal says where we are; the weekly Flow says whether something moved. The weekly finally has its own job |

---

## What must not be done

**Do not raise the financial conditions weight on the strength of the 2007
result.** The weight study tested 1–10% and landed on 3% with evidence; the
sensitivity test already established the benefit is GFC-derived. One vivid
episode does not reopen a settled, evidenced decision — and the Flow exists
precisely so it does not have to.

**Do not let the Flow become an anomaly taxonomy.** Wars, hurricanes, strikes and
policy shocks are all technically anomalies, and classifying them is endless.
Watch the instruments; the explanation can come afterward, from a human.

---

## Open questions before any build

1. **Which instruments get horns?** The budget says two or three. NFCI is the
   clear first. Oil second. Claims is a candidate with a noise caveat.
2. **What is the parameter freeze?** The 104-week lookback and z ≥ 3 were chosen
   after testing z ∈ {2.5, 3, 3.5, 4}. They must be frozen and published like the
   calibration constants, and changing them must be a versioned revision.
3. **How does a horn survive a data revision?** If the move that triggered it is
   revised away, the horn was still honestly sounded on the data at the time.
   Proposal: the horn stands, the revision is noted. Never silently deleted.
4. **What confirms a financial-conditions horn?** Oil→gas is measured. The
   NFCI→household path is much longer and may not be verifiable inside a useful
   window at all. That may be the honest answer: some horns stay `pending` for
   months, and saying so is more useful than forcing a verdict.


---

## The 2007 replay — the honest test

Run `node research/flow-replay-2007.js` to reproduce all of this.

The test the operator specified: **one fixed rule, declared in advance, applied to
all 23 years — when does it trigger in 2007, when does it shut off, and how many
false horns does the same rule produce in normal periods?** Not "can we make it
fire in August," which would be overfitting.

### It moves through the states unprompted

| Week | NFCI | 4wk change | z | State |
|---|---|---|---|---|
| 2007-06-29 | −0.481 | +0.023 | 0.75 | QUIET |
| 2007-07-13 | −0.413 | +0.085 | 2.98 | BUILDING |
| **2007-07-20** | −0.345 | +0.148 | **5.04** | **HORN** |
| **2007-08-03** — the rant | −0.140 | +0.317 | **8.04** | **HORN** |
| 2007-08-17 — Fed cuts | +0.098 | +0.443 | 6.97 | HORN |
| 2007-08-31 | +0.244 | +0.384 | 4.24 | HORN (last) |
| 2007-09-07 | +0.260 | +0.280 | 2.75 | BUILDING |
| 2007-09-14 | +0.235 | +0.137 | 1.13 | QUIET |

**QUIET → BUILDING → HORN → fading → QUIET**, with no tuning. The horn sounds
**2007-07-20**, a fortnight before the rant and four weeks before the Fed moved.

### And the level confirms twelve weeks later

| Month | Level | Financial | Employment | Flow | Verification |
|---|---|---|---|---|---|
| 2007-06 | 45 | 10.4 | 34.7 | QUIET | — |
| 2007-07 | 46 | 14.8 | 34.0 | **HORN** | NOT YET |
| 2007-08 | 46 | 41.9 | 36.0 | **HORN** | NOT YET |
| 2007-09 | 46 | 48.0 | 34.0 | BUILDING | NOT YET |
| 2007-10 | **52** | 39.4 | 38.5 | BUILDING | **CONFIRMED +6** |
| 2007-11 | 56 | 53.8 | 40.8 | HORN | CONFIRMED +10 |
| 2007-12 | 57 | 62.5 | 44.8 | BUILDING | CONFIRMED +11 |

**Lead time: about twelve weeks between the flow moving and the level confirming.**
Three months in which the old product said "46, nothing much happened" and the new
one would have said "the level has not moved and the pressure on it has."

### The false-horn check — the same rule, all 23 years

| Episode | Peak z | Jar at horn → 6 months later | Outcome |
|---|---|---|---|
| 2007-07-20 → 08-31 | 8.0 | 46 → 59 | **CONFIRMED** |
| 2007-11-23 → 11-30 | 3.4 | 56 → 67 | **CONFIRMED** |
| 2008-09-19 → 10-17 | 4.8 | 77 → 86 | **CONFIRMED** |
| 2018-02-16 → 03-02 | 3.3 | 18 → 17 | **cleared** |
| 2020-02-21 → 04-03 | 8.6 | 11 → 34 | **CONFIRMED** |

**Five horns in 23 years — 0.22 per year, 1.9% of weeks. Four confirmed, one
cleared.** The cleared one is February 2018, Volmageddon: a genuine market
convulsion that never reached households, and the jar went 18 → 17. That is the
design working, not failing.

### What this does not prove — read before quoting any of it

- **Revision.** NFCI is revised weekly and its entire history recomputes. Every
  number above is current-vintage. The validated property is that the rule fires
  at *onset* rather than peak; it is **not** proof we would have caught it live.
- **The jar side is also a reconstruction.** "Confirmed in October" uses today's
  recomputed backtest, not what was published in 2007.
- **n = 5.** Four of five confirming looks strong and the confidence interval
  around it is enormous. This is suggestive, not established.
- **One instrument.** NFCI only. Oil and claims fire more often and less cleanly.
- **The confirmation rule was chosen after seeing the data.** "Jar rises ≥3 points
  within 6 months" is mine, picked post-hoc. **It must be pre-registered and
  sensitivity-tested before this ships** — otherwise the 4-of-5 record is partly
  an artifact of how I defined success. This is the weakest link in the whole
  validation and it should be fixed first.
- **Parameters need a sweep.** z ≥ 3 was chosen after testing 2.5/3/3.5/4. The
  4-week window and 104-week lookback were not swept at all.

### Why the Flow must not use the jar's weights

The operator's instruction, and the data agrees emphatically. In August 2007 the
financial line moved 31.4 points and contributed **+0.94** to the score because it
carries 3% weight — while cheaper petrol removed 1.03 and cooling inflation
removed 0.96.

For the **level** that is correct: households genuinely were not feeling it yet.
For the **flow** it is nonsense to say "this instrument moved more than any
instrument has moved in twenty years, but it is 3% of the jar, so ignore it."

The z-score design is weight-free by construction. It asks how unusual a move is
*for that instrument against its own recent behaviour*, with no reference to the
jar at all. That is why it works, and it is why the 3% weight never has to change.
