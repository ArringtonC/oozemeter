# STAGED DRAFT — Editorial Incident 2025-10

Wires into `articles.js` during the post-analysis fix batch (held now because the
corpus analysis is mid-run). Framing per operator direction 2026-08-02: this is an
**Editorial Incident** — it documents what happened to the publication, not what
happened to the country. Every causal claim carries a primary BLS citation.

**Verification performed before drafting** (not assumed):
- `UNRATE` and `CPIAUCNS` return zero October 2025 observations from FRED; every
  non-BLS input that month is intact (MORTGAGE30US 5, GASREGW 4, NFCI 5, ICSA 4).
- October 2025 is the only gap in 281 months of household backtest history.
- Primary sources confirm both cancellations and confirm the CPS gap is permanent.

---

**slug:** `editorial-incident-2025-10`
**cat:** `incident`
**date:** `2025-10-31`
**title:** Editorial Incident 2025-10: why there is no October 2025 household report

**dek:** The household score needs BLS employment and inflation observations. For
October 2025 they do not exist in the official record and never will. The facility
publishes the absence rather than an estimate.

**keyPoints:**
- The Ooze Score requires BLS employment and inflation inputs; neither exists for
  October 2025 in the official record.
- BLS canceled the October 2025 CPI, and the household survey behind the
  unemployment rate was never collected — and will not be collected retroactively.
- No score was estimated, interpolated, or carried forward. The month stays
  unscored, and Ward M — which uses no BLS inputs — published normally.

**body:**

October 2025 has no household Ooze Score. This file explains why, because a missing
month with no explanation is indistinguishable from a mistake.

**## What the score requires**

Two of the jar's weighted intake lines draw on the Bureau of Labor Statistics: the
employment line reads the unemployment rate, and the inflation line reads the
Consumer Price Index. The score is a weighted sum — if a weighted input is absent,
there is no honest total to publish. Every other input that month was available:
mortgage rates, gas prices, financial conditions, and jobless claims all reported
normally.

**## What happened to the data**

Following the 2025 lapse in federal appropriations, the Bureau of Labor Statistics
canceled the October 2025 Consumer Price Index. In the agency's own words, the
index "was not published because of a 2025 lapse in federal government
appropriations" — price collection depends on in-person visits and telephone calls
that could not be performed after the fact.

The unemployment rate is the more permanent loss. The Current Population Survey —
the household survey that produces the unemployment rate — was not collected for
the October 2025 reference period, and BLS has stated it will not be collected
retroactively. A survey that asks households about a specific week cannot be run
later; the week is gone. October 2025's unemployment rate is not delayed. It does
not exist, and it will not come to exist.

**## What the facility did about it**

Nothing. That is the point.

Other organizations published estimates for the missing month, and estimating was
available to us too — the neighboring months are known, the relationships are
stable, and a plausible number would have been easy to produce and nearly
impossible for a reader to catch. That is precisely why the rule exists. An
estimate rendered in the same typeface as a measurement is a lie about what the
facility knows.

So October 2025 is unscored. It is absent from the archive, absent from the
history file, and absent from the chart, where it renders as a gap rather than a
line drawn between September and November. Nothing is interpolated across it. The
reconstruction of the trailing year skips it and says so.

**## What Ward M did**

Ward M published normally for October 2025. The market wing reads Treasury,
Federal Reserve, Cboe, and energy series — none of them BLS — so the shutdown
never reached it. For one month, the facility could measure the financial system
and could not measure the households inside it. That asymmetry is worth
remembering the next time markets and Main Street are compared: the two wings do
not merely disagree sometimes, they are not even always observable at the same
time.

**## The rule this demonstrates**

Missing evidence is editorial content. When the record required to compute a
number does not exist, the facility documents the absence rather than estimating,
interpolating, or quietly skipping it. A gap in the data is a fact about the world,
and facts about the world are what this instrument reports.

**sources to render as links in the body:**
- BLS — Questions and answers on the 2025 federal government shutdown impact on
  the Consumer Price Index:
  https://www.bls.gov/cpi/notices/2025/2025-federal-government-shutdown-impact-on-cpi.htm
- BLS — 2025 federal government shutdown impact on the Current Population Survey:
  https://www.bls.gov/cps/methods/2025-federal-government-shutdown-impact-cps.htm
- BLS — Revised news release dates following the 2025 lapse in appropriations:
  https://www.bls.gov/bls/2025-lapse-revised-release-dates.htm
