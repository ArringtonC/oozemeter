# Decision — auxiliary lines stay zero-weight; the regional wing is employment-only

Date: 2026-08-27. Status: **decided**, recorded so the next reviewer does not
re-litigate it from scratch.

## 1. Foreclosures, Manufacturing, Federal Debt Service — zero weight, by evidence

All three render in the ledger as **AUX** (0% weight) and each carries its own
reason:

- **Foreclosures / Mortgage Distress** (DRSFRMACBS): already informs the
  weighted Housing line as its second leg. Giving it separate weight would
  count the same delinquency twice — a double-count, not a signal.
- **Manufacturing** (INDPRO + AMTMNO): its transformation (auxiliary
  industrial-production YoY) has never been frozen and backtested against the
  jar. A line without a validated transformation does not earn a weighted
  place — that is the house rule, not an excuse.
- **Federal Debt Service** (A091RC1Q027SBEA ÷ FGRECPT): measured correlation
  with the household jar is r = -0.034 — no relationship. It is published
  because the debt burden is a real two-sided clock (falls in 47% of
  quarters), and it stays zero-weight because scoring noise adjacent to the
  score is worse than not scoring it. Decision record:
  `research/NATIONAL-DEBT-DECISION-2026-08-16.md`.

Change condition: a new frozen-and-backtested transformation for
Manufacturing (or a genuinely independent foreclosure series that does not
already feed Housing) can be proposed as a methodology revision with the
full decision-record process. Weights change only with a version bump on
`policies.html`.

## 2. The regional wing is employment stress, and says so

`scripts/collect-states.js` publishes each state's unemployment rate through
the **same published anchor curve** as the national employment line
(`UNEMPLOYMENT_ANCHORS`, single source in `scripts/lib/methodology.js`). It is
one line of seven; the other six lines have no state-level feeds yet, so the
page:

- is titled and described as **State Employment Stress** (the old
  "SIMULATED" claims are gone with the simulated table),
- states the limitation in its first paragraph and in the data's `method`
  disclosure,
- never ranks a state reading as a "full Ooze Score" (the page and per-state
  pages say so),
- sitemaps the real readings (previously `states.html` was deliberately
  excluded from the sitemap because its numbers were fabricated).

The `STATES` demo array remains **only** for the Personal Ooze prototype
(`personal.html`), which the footer already labels an educational prototype.

## 3. Why the anchors moved to one module

`backtest.js` and `collect.js` each carried their own copies of every anchor
curve. They were identical on 2026-08-27, but "identical" is not "guaranteed
identical" — a single line edit in one file would silently change history and
collector without any gate noticing. All published curves now live in
`scripts/lib/methodology.js` (frozen), both consumers import them, and
`tests/anchors-published.test.js` asserts the Lab Notes tables match the
constants exactly and that no file redefines one.
