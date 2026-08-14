# D-10 — the calibration was not actually frozen

**Status:** fixed in this commit. Pipeline was down 2 days (issue #3).
**Territory note:** this touches `backtest.js`, `collect.js`, `lib/methodology.js`
— Codex's files. Fixed by Claude because the daily robot was failing. Review it.

---

## What broke

`tests/backtest.integration.test.js:110` asserts the backtest and the collector
publish identical canonical monthly scores. They disagreed on three months, each
by exactly one point, backtest always higher:

| month | backtest | collector |
|---|---|---|
| 2010-12 | 67 | 66 |
| 2025-07 | 24 | 23 |
| 2026-02 | 20 | 19 |

## Why

`collect.js` used frozen calibration constants. `backtest.js` **re-derived them
from live data on every run** — calm 2003-2025 → 10, GFC peak → 90 — and the
anchor months revise. Today's derived pair had drifted from the frozen pair by
`a` 1.43e-4, `b` 3.63e-3.

That drift is tiny, and for almost every month it is invisible. But a score is
`Math.round()`ed, so any month whose raw calibrated value sits within ~0.01 of a
`.5` boundary flips. Three months did.

**This test was structurally guaranteed to fail eventually.** Not flaky — a
countdown. Every upstream revision re-rolls the dice on 282 months.

The deeper problem is what it implies about the published record: a calibration
that re-derives from live data means a revision to the calmest month in 2021 can
silently change the published score for June 2009. The score stops being
reproducible.

## The fix

`CALIBRATION_V3` now lives in `scripts/lib/methodology.js`, the module both
engines already require. `collect.js` imports it instead of declaring its own
literal. `backtest.js` publishes with it, still re-derives alongside to *measure*
drift, and prints both:

```
calibration: raw calm 23.9 → 10 · raw GFC peak 80.3 → 90
  frozen  a=1.418684 b=-23.965148
  derived a=1.418828 b=-23.961521 (drift a 1.43e-4, b 3.63e-3)
  publishing with the frozen pair
```

`OOZEMETER_RECALIBRATE=1` publishes with the derived pair, and says in the log
that doing so is a restatement. Re-freezing those two numbers restates every
published historical score and is a methodology version bump, not maintenance.

Verified: 282/282 months agree, all 31 test files pass, and the collector's
output is byte-identical apart from its `generated` timestamp — the robot's
published numbers do not move.

---

## The separate finding — 13 months of unpublished revision drift

Regenerating `research/backtest-results.json` against today's data would change
**16 published months** by one point. Only 3 are the calibration (above). The
other 13 are upstream revisions that have accumulated since the artifact was last
built:

```
2003-10 37→38   2004-05 35→36   2005-11 33→34   2006-05 46→47
2006-07 46→47   2007-05 42→43   2010-06 77→76   2011-08 64→63
2012-03 56→55   2019-08 12→11   2026-04 27→28   2026-05 29→30
2026-06 26→27                   (+ new month 2026-07 = 26)
```

**I did not regenerate it.** The daily workflow does not run `backtest.js` and
does not commit `research/` — it commits `data/`, `index.html`, `feed.xml`,
`lab.js` — so nothing republishes silently and there is no urgency.

But this is a decision someone has to make, and it is editorial, not
engineering. Sixteen historical scores on a public site are wrong by a point
relative to today's data. The Constitution's corrections policy governs it. Two
honest options:

1. Regenerate and publish a correction noting the source revisions.
2. Leave it, and state the artifact's vintage date on the page so a reader can
   see which data it was built from.

Option 2 is probably right — these are ex-post reconstructions already disclosed
as "latest available revised observations," and chasing revisions forever means
the published history never stops moving. But it needs the disclosure to be
true, and right now the vintage is not stated anywhere a reader can find.

**What is not an option** is regenerating quietly. Note 2007-05 42→43: that month
is cited in `research/editorial/incident-2007-08-draft.md`.

## The outage had a second cause, behind the first

Fixing the calibration got the run past the test step and it died in the next
one. Worth recording, because a green test step is not a green pipeline:

```
NARRATIVE INTEGRITY: FAIL (2)
✗ ooze-report-2026-07·kp0: raw score literal "sealed at 26"
✗ ooze-report-2026-07·¶0:  raw score literal "drained 1 point to 26"
```

`scripts/story.js` interpolated `d.ooze` straight into prose. The narrative gate
requires a canonical-truth token there and is right to — the article persists, so
a later revision would strand a hardcoded `26` in a sentence while every other
surface moved. Fixed by routing the month's own score through one `SCORE` token.
Claude's territory; fixed in the following commit.

That fix also exposed a reader surface it would have widened:
`scripts/compile-reports.js` pushed `live.summary` / `live.story` / `live.lines`
verbatim, so tokens reached the compiled read raw. It now resolves through
lab.js's own resolver, refuses to run against a stale lab.js fallback history
rather than silently rendering every token as an em-dash, and hard-fails if a
token would still reach a reader.

Timeline: succeeded Aug 10 and 11, failed Aug 12 and 13 (calibration), failed
once more on the narrative gate, green on run 31768285803.

## What would have caught this sooner

Nothing did, for the usual reason — we wrote "frozen calibration — do not
re-derive daily" as a comment in `collect.js` and never built the thing that
enforced it. The other engine re-derived daily. That is failure pattern #6 in the
handoff: **the rule existed, the emitter did not.**

The constant now lives in one module and is imported twice, so the rule is
enforced by construction rather than by comment.
