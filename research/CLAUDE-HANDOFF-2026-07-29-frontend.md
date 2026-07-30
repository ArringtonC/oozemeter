# OOZEMeter Handoff — Front-End / Editorial / Markets Session (2026-07-29)

**From:** the front-end session that folded Variant J and built Ward M (context being cleared)
**To:** the next session picking this up
**Repo:** `/Users/arringtoncopeland/Desktop/Projects/oozemeter` · branch `main` · live at https://arringtonc.github.io/oozemeter
**Everything is PUSHED through `7f6cade`** — local main == origin/main == live site as of this writing.

## Read these first
1. Memory file `oozemeter-live-state` — working agreements + compressed state (auto-loads)
2. `research/market-signal-review-2026-07-28.md` — the full market-signal decision record (15 sections + addenda; four study scripts beside it)
3. `research/METHODOLOGY-V3-SPEC.md` — the operator-approved v3 spec (3% NFCI) awaiting the DATA SESSION
4. `tasks.js` — THE ledger (renders in flowmap Tasks tab); flowmap is at Rev 9
5. `improvements.md` bottom — Ward M's parked gauges with anchors

## What shipped this session (all live)
- **Variant J front page**: Mission Control × Research Library. Boot/cascade preserved; ledger carries all 8 lines with AUX disclosure (test-enforced); tag taxonomy renamed site-wide (OOZE MONTHLY REPORT / OOZE ARCHIVES / OOZEONOMICS).
- **Season 2**: GA4 auto-tracker in lab.js (INERT until operator pastes measurement ID into `GA_ID`), favicon/OG-card/apple-touch-icon from one Jar SVG master, static per-slug pages (`/gas/`… + `/files/<article>/` via `scripts/static-pages.js` — RERUN after new articles publish), sitemap + robots, about.html, 404.html (self-contained — GH Pages serves it from any path), streak counter.
- **Email capture: PARKED** on do-not-build (no users yet). Form is honestly CLOSED (`NL_USER=''` in lab.js); Buttondown sender script preserved in git at f46b68a. Do not resurrect until analytics shows real visitors.
- **Market-signal saga** (the big one): boss wanted stock market in the score. Full review + 4 backtested studies → advisor recommended zero-weight; **operator chose PATH A: methodology v3, 3% NFCI in the flagship** — an explicitly labeled bet on credit-driven crises (the GFC-exclusion sensitivity test FAILED; operator chose knowingly). Spec written for the data session. SEQUENCING: Ward M ships first (done), v3 second.
- **WARD M (market.html)**: Sector Watch leads — 11 tickers (SPY QQQ DIA IWM XLF XLI IYT XLY XLP SMH XLV) grouped by economic role, weekly, **states + % moves only, never price data** (licensing: S&P 500 / ETF prices cannot be republished; FRED's SP500 is a rolling 10yr, "Pre-Approval Required"). Calibrated 6-gauge composite: rates T10Y3M, volatility VIXCLS, credit NFCI, energy DCOILWTICO, dollar DTWEXBGS, **breadth from Sector Watch** (a bleeding sector moves the score — operator requirement). Calibration frozen from `scripts/backtest-market.js`: calm 2007-present→10, GFC→90, a=1.4025 b=-7.0116; episode peaks GFC 90 · 2022 76 · COVID 71 · Euro-stress 61 · bank-stress 60. Parked gauges (builders/industry/freight/BTC) in improvements.md. Entry points: top-nav "Markets", 5th mobile tab, front-page rail card.

## Operating procedures (violate at your peril)
1. **Data session boundaries**: scripts/collect.js, backtest.js, integrity.js, stamp?— no, stamp.js is OURS — their territory is collect.js, backtest.js, scripts/lib/, tests/, .github/workflows, data/* commits. DO NOT edit; they commit their own batches. Coordination = handoff docs + specs in research/.
2. **Push procedure**: fetch → `git merge-base --is-ancestor origin/main main` → fast-forward push. If diverged (oozebot commits): stash -u the data session's WIP, pull --rebase (data conflicts → theirs = local newer), push, stash pop. Did this once cleanly; also had to RESTAMP index to the committed collection when local uncommitted data (27) differed from committed (25) — never push a static score the committed pipeline doesn't support.
3. **Ward M weekly refresh, ORDER MATTERS**: `node scripts/collect-sectors.js` THEN `node scripts/collect-market.js` (breadth reads data/sectors.json). Cron wiring awaits the data session's workflow batch.
4. **Checks after page work**: node --check every inline script; orphan-class check (markup class with no CSS = fail); `node scripts/stamp.js` must report 0 missing markers; `node tests/public-labels.test.js` must pass (index must keep AUX disclosure + stale-notice strings).
5. **stamp.js markers on index** (cron rewrites them): title, meta description, og:title, og:description, jar aria-label, heroTheme level, heroScore, heroStatus, heroDelta, plcSealed, specimen-line, sc-score, sc-status, scLine, verdictLine.
6. **Honesty rules**: no number hand-written into prose (tokens/data lookups; ward episode peaks are frozen backtest constants rendered from payload, jar side looked up from HISTORY). Never fake capture/success states. Never tune outputs for aesthetics — when the operator disliked jar==ward==27, the fix was CALIBRATION, not nudging.
7. **Terminology**: never "Micro Ooze" (economically inverted). The market wing is "Ward M / Market Ooze"; the NFCI gauge is "Credit & Funding", the v3 bridge.
8. **Anchors are duplicated** between collect-market.js and backtest-market.js — change BOTH, then re-freeze calibration by rerunning the backtest.

## Immediate queue (rough priority)
1. **Hand the v3 spec to the data session** (`research/METHODOLOGY-V3-SPEC.md`). After their batch lands, front-end owes: lab.js WEIGHTS (7 entries ×0.97 + financial 3.0), INDICATORS entry for `financial`, notes.html formula, policies.html v3.0.0 row + revision record entry #2, OOZEBOT line narrative + divergence sentence. **Disclosure copy is a publish blocker** — draft language is in the spec §10.
2. **Ward M research program** (tasks.js, mirrors the v2 /teach pattern): /teach per gauge + Sector Watch (run WITH the operator, one per sitting), anchor validation vs history percentiles (solo-able), per-gauge files, ward-vs-jar divergence chart (both backtest histories exist: research/market-backtest.json + lab.js HISTORY), OOZEBOT weekly market note.
3. **Operator-blocked**: GA4 property → paste ID into lab.js `GA_ID` (unlocks four goals); Search Console verification (sitemap live); AUDIT-8 first-paint.
4. Design review: the operator's wife has NOT yet reviewed Variant J or Ward M in person — her feedback is taken seriously.

## Key numbers (2026-07-29)
Jar: June 2026 = **27** STICKY (committed pipeline says 27 now — the data session's v2 batch landed; verify against data/latest.json at session start). Ward M: **32** (breadth 37 from SMH −13.4% stressed, QQQ/IWM softening; Sector Watch overall SOFTENING 8/2/1). Divergence stance: markets-at-highs-while-households-stressed occurred 57 months vs 2 reversed since 2003. GFC peg 90 both instruments.

## Context for the boss relationship
The operator's boss drives the market direction; the operator trades and correctly called that markets front-run government data (Apple warning Feb 18 2020 → crash → claims spike a month later). The measured rebuttal that landed: a weighted monthly component structurally CANNOT deliver that speed (Feb 2020 seal unchanged at any weight ≤10%) — the fast signal lives in Ward M at market cadence instead. Advisor texts (ChatGPT) arrive constantly; triage against the ledger — typically ~70% already done; extract deltas only.
