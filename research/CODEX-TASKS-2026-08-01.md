# Codex task pack — 2026-08-01

**From:** front-end/editorial session (Claude) on operator instruction
**Start here:** `git pull` first. Your Ward M release candidate was committed at `4bc95a3` with operator approval (all 22 test files verified green at commit). Two commits landed after it: lesson cross-links + course map in `scripts/market-pages.js` (`f07777e`), and page-order/mini-jar changes to `market.html`/`lab.css` (`1284c02`). Your tasks.js ledger entries are already flipped. The tree is clean.

Tasks in priority order. Each is a separate batch; commit your own batches as usual.

## 1. Methodology v3 — implement the spec (top priority)

`research/METHODOLOGY-V3-SPEC.md` was written for you and is operator-approved (Path A decision record: `research/market-signal-review-2026-07-28.md`).

- NFCI enters the flagship at 3.00, incumbents ×0.97, anchors per spec §4.
- Rerun the backtest, re-freeze calibration, regenerate archive/incidents, append revision record entry #2 to `revisions.json`.
- Expectation check from the spec: ~64% of archive integers move ≤2. If your rerun disagrees materially, STOP and leave a note in this file rather than shipping.
- **Do not publish/stamp the new methodology copy** — front-end owes the disclosure copy (spec §10), notes/policies updates, and lab.js WEIGHTS/INDICATORS, and disclosure is a publish blocker. Land the pipeline; flag when ready; the front-end session finishes the release.

## 2. Sector Watch quote rights — close the blocker you opened

Your call to gate scheduled Yahoo collection was correct. Now resolve it:

- Find a licensed or explicitly-permitted source for the 11-ticker panel (derived states + % only, as published). Evaluate: official provider endpoints, Stooq terms (previously blocked by JS challenge — recheck), Alpha Vantage/Tiingo free tiers' redistribution terms, or replacing tickers with FRED-available index series where a licensing-clean twin exists.
- Document the corporate-action / return-basis policy for whatever source wins (quote.close price-return caveat is already disclosed — keep or improve it).
- Acceptance: `research/` note with the decision + terms citation, collector updated, `market.yml` schedule enabled, refresh order preserved (sectors THEN market — breadth reads sectors.json).

## 3. Keep the divergence chart honest over time

`data/market-history.json` is a static build from the 2026-07-29 backtest. Once monthly data accrues, the chart silently goes stale.

- Wire `scripts/build-market-divergence.js` into the collection path (or a monthly step in `market.yml`) so market-history regenerates after each ward collection + household seal.
- Guard: the page already handles a missing/short history; keep exact-shared-months semantics (no interpolation).
- Acceptance: one command or workflow step regenerates market-history deterministically; a test asserts the latest shared month tracks the inputs.

## 4. Anchor-validation cadence (small)

`research/market-anchor-validation.md` is a point-in-time report. Add a lightweight way to re-run it (it already exists as `scripts/validate-market-anchors.js`) as part of the monthly cycle, so the "provisional anchors" claim stays backed by a current report. No auto-tuning of anchors — the report is descriptive only (its own preamble says so; keep it that way).

## 5. Breadth delta (small — board catch 2026-08-02)

`sensors.breadth.delta` is hardcoded to 0 in collect-market.js. Compute it against the previous collection's breadth stress (data/market.json before overwrite) so the gauge card's ▲/▼ is real. Guard the first-run case.

## 6. OG-card regeneration in the cron (small)

`scripts/og-cards.js` renders per-page OG cards with the live number via headless Chrome (zero npm deps; ubuntu runners ship Chrome — set CHROME_BIN). Wire it into the daily workflow after stamp.js so link previews never carry a stale score. Currently rerun manually.

## 7. Month status as a first-class state (operator direction 2026-08-02)

October 2025 has no household score: BLS canceled the October CPI and never fielded
the household survey behind the unemployment rate (see `research/editorial/incident-2025-10-draft.md`
for verification + primary sources). Today the backtest silently `continue`s past any
month with a null input (`scripts/backtest.js:103`), so an unpublishable month is
indistinguishable from a month that never happened.

Make the state explicit instead of implicit. Give every month a status the whole system
can read:

- `COMPLETE` — all weighted inputs present, score published.
- `PARTIAL` — score published, but one or more auxiliary/non-weighted inputs missing (disclose).
- `BLOCKED` — inputs pending release (a delay; may resolve later).
- `UNPUBLISHABLE` — a required weighted input does not exist and will not (permanent).

Requirements:
- Emit the status per month in the backtest output and in `data/latest.json`/history, with
  the reason and the specific missing series named — never just an absence.
- `UNPUBLISHABLE` months must never be interpolated, forward-filled, or averaged across in
  any consumer (archive chart, divergence chart, verdict percentiles, story engine).
- Renderers switch on it: an `UNPUBLISHABLE` month yields an Editorial Incident entry in the
  archive rather than a report or a silent skip.
- The integrity gate should fail closed if anything ever writes a score for an
  `UNPUBLISHABLE` month.
- Acceptance: a test asserts 2025-10 is `UNPUBLISHABLE`, names UNRATE + CPIAUCNS as the
  missing inputs, and that no consumer interpolates across it.

Front-end owes, after this lands: archive UI showing the incident state (⚠ row rather than a
missing row), which the operator has already specced.

## 8. Retain raw observables in the backtest (TOP PRIORITY after v3 — unblocks the archive)

The corpus review's single highest-leverage finding: **23 of 24 published reports describe the
instrument, not the economy.** Zero dollar signs and zero percent signs across the whole
trailing year — *"Housing carried the most weight"* appears 11 times and never once with a
mortgage rate. The live seal does it right (*"down 11 points with the pump price at $4.10"*)
because `data/latest.json` retains per-line observed values; the archive cannot, because
`research/backtest-results.json` stores only `{month, ooze, stresses}`.

This is now constitutional law (§4, first bullet): *no line is named in prose without the
observed value that produced its score, in the same sentence.* The archive cannot comply
until the data exists.

- Retain the raw observable per line per month in the backtest output — every value is
  already in scope in `scripts/backtest.js` around lines 95–102 where the anchor curves are
  interpolated (`un`, `cpi`/`inflationYoY`, `mort`, `cdel`, `auto30`, `gasNom`, `nfci`).
- Emit them under an `observed` object per month alongside `stresses`, each with its unit.
- Keep the file's existing shape backward-compatible — `data/reconstruction-reports.js` and
  anything else reading `monthly[].stresses` must not break.
- Acceptance: a test asserts every month with a score also carries an observed value for all
  seven weighted lines, with units; `node scripts/backfill-reports.js` then regenerates the
  archive with real-world values in prose.

## Not yet — do not start

- **Froth panel** (margin debt / Buffett Z.1 / household equity allocation): triaged and queued in `improvements.md`, sequenced LAST — after v3 and a live episode. Design constraint already recorded: froth ≠ stress, separate panel, never averaged into the composite.
- Any change to frozen calibrations (jar a=1.4209 b=-24.6215; ward a=1.4025 b=-7.0116) without an operator decision on record.

## Standing rules (unchanged)

Honesty rules bind: no hand-written numbers in prose, no output tuning for aesthetics, fail-closed gates. Front-end files (index.html, market.html, lab.js, lab.css, flowmap, tasks.js wording) are the other session's territory — request changes via research/ notes. Never "Micro Ooze." Pull before push; oozebot commits daily.
