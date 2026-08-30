# OOZEMeter — Improvements Task List

Owner tags map to the agent personas in `agents/` — each task lists who leads the review.
Priority: **P0** = blocks going live honestly · **P1** = pre-launch · **P2** = post-launch.

---

## 0. Department of Fun (owner: the Operator — outranks the board on this)

Standing rule: the serious people exist so the fun thing can be trusted, not to make the fun thing serious. Every launch review includes the question "is it still fun?" — if the answer is no, the release waits.

- [x] Protected inventory (may not be cut in any cleanup): boot clearance check · pipe bloops · "please do not tap the glass" · facility alarms/flicker/page drips · incident stamps · OOZEMAXING · the disclaimer jokes
- [x] **P2** Lab anthem: an *original* groove behind the audio toggle — a small 90s-R&B-style loop synthesized live with WebAudio (no samples, no licensing) Note: the actual "This Is How We Do It" recording needs sync + master licenses ($$$$); even a "This Is How We Ooze It" parody cover needs composition rights to record safely. Path: commission/generate an original 90s-R&B-style soundalike now, pursue the real parody license if the site blows up
- [x] **P2** More easter eggs: konami code → jar confetti bubbles · tap the glass 10× → incident report filed against the visitor (4:04 page already specced in facility voice — optional extra)
- [x] **P2** April 1: all readings displayed in "fl oz" (label-only joke; the number stays the number)

## 1. Scoring engine & data (owner: Burry)

- [ ] **P0** Add ICSA weekly-claims momentum term to the employment line so fast shocks register (COVID scored 45 in the backtest because quarterly delinquency data lags; claims would have caught it)
- [x] **P0** Apply the single published calibration pass (scale so GFC peak = 90) and rerun the backtest; lock the resulting episode scores as official — published as methodology v3 (calibration frozen + revision record on the public record)
- [x] **P0** Replace the archive's estimated anchor curve with the real monthly backtest series (`research/backtest-results.json` → `lab.js` HISTORY)
- [x] **P0** Convert `scripts/backtest.js` into the daily collector (`scripts/collect.js`) writing `data/latest.json` + `data/history.json`
- [x] **P0** GitHub Actions cron: run collector daily, commit JSON, Pages redeploys (REQUIREMENTS.md §4)
- [x] **P1** Staleness rule: each line carries `asOf`; UI flags lines older than 2× their cadence
- [x] **P1** Unit tests: anchor interpolation, orientation (rising unemployment must raise stress), weights sum, golden-day fixture
- [x] **P1** Publish full anchor tables in Lab Notes — all 11 curves generated from the single source (scripts/build-notes.js + tests/anchors-published.test.js)
- [x] **P2** OOZEMAXING breadth condition displayed daily on the front page (all seven weighted lines ≥ 60 — the v3 wording, not six)
- [x] **P2** Incident Severity ratings (C1–C5: peak × duration × recovery) computed from the chart, stamped on event cards + popups; formula published on the archive page
- [x] **P2** Decide: foreclosures & manufacturing stay auxiliary sensors or get formula weight — recorded in research/AUXILIARY-LINES-DECISION-2026-08-27.md (stay zero-weight; conditions for change listed)

## 2. Product & focus (owner: Jobs)

- [x] **P0** Flip `LIVE` to a runtime fetch of `data/latest.json` — the day the jar shows a true number is the day the product exists
- [x] **P1** Five-second test on the homepage: score, direction, top driver visible with zero scrolling on a phone — hero drivers line added (`#heroDrivers`); re-verify on a real device
- [ ] **P1** Cut anything that doesn't serve the daily check habit (audit the homepage section by section; every section must earn its scroll)
- [x] **P1** The share card is the product's ad — OG image per band (og-card-smooth..overflowing.png, stamp.js swaps og:image per reading)
- [x] **P2** "Why did it change?" — every score movement must have a one-sentence explanation on the homepage (auto-generated from the movers data) — the "What changed?" rung + daily editorial story
- [x] **P2** Kill or commit: sound toggle — committed: bloops + the original anthem loop, synthesized live

## 3. Design & craft (owner: Ive)

- [x] **P1** Design the OG/share image set (one per band + OOZEMAXING) — per-band cards shipped from og-card.svg (scripts/build-og-cards.js); OOZEMAXING card pending the declaration ever firing
- [x] **P1** Favicon + app icon (the jar, readable at 16px) — `favicon.svg` + `apple-touch-icon.png`
- [ ] **P1** Type ramp audit: one scale across all six pages (some subpage headings drift)
- [x] **P1** 404 page in facility voice ("SPECIMEN NOT FOUND") — `404.html`
- [ ] **P2** Motion audit after live data lands: the fill animation should reflect the real delta (small change = small motion)
- [x] **P2** Print stylesheet for indicator pages (+ every page — @media print in lab.css)
- [ ] **P2** Dark-only is correct for the lab — but verify glare/contrast outdoors on a real phone in sunlight

## 4. Growth & distribution (owner: Zuckerberg)

- [x] **P1** Custom domain + per-slug static pages — done 2026-08-27: `/slug/` pages, sitemap, canonical URLs, FAQ schema markup all live; remaining: custom domain (`oozemeter.com`) so AdSense approves + `ads.txt`
- [ ] **P1** Newsletter: real ESP behind the existing form (Buttondown), then the daily "Morning Specimen" send generated from `latest.json`
- [x] **P1** Embeddable widget: `widget.html` "Today's Ooze" badge for blogs (Tools → Embed the Jar; iframe, no styling leaks)
- [x] **P2** Streak/habit mechanics: "you've checked the jar N days in a row" (localStorage, no accounts)
- [x] **P2** State pages as 50 SEO surfaces — real FRED state unemployment stress (scripts/collect-states.js, daily) + 51 static `/states/<code>/` pages; regional model is the employment line only and the page says so
- [ ] **P2** 10–20 evergreen explainers (seed: the indicator FAQ content) — required for AdSense approval anyway
- [ ] **P2** Reddit/X launch plan around a single dated artifact: "the backtest that shows 2008 missed OOZEMAXING by one line"

## 5. Content engine — articles, headlines, forum (owner: Zuckerberg, numbers signed by Burry)

Reference: the AI-SEO daily-content system (trending topics → grounded article → auto-publish → fast index → gap-mine loop). Adapted for ooze: every article is grounded in our own `latest.json` data, never generic news rewrites.

- [ ] **P1** Headlines module: daily scan of trending economic news, filtered to "does this move an intake line?" — surfaces as "Today's Drivers" with links
- [ ] **P1** Daily Ooze Report article: auto-generated from `latest.json` + movers + relevant headlines; published as a dated page (`/report/2026-07-24/`) — the fresh-content flywheel
- [ ] **P1** Fast indexing: IndexNow + Google Indexing API ping on every publish; sitemap auto-updates
- [ ] **P2** Gap miner: Search Console API → impressions-without-clicks keywords → new or re-optimized indicator/explainer pages (the loop from the reference system)
- [ ] **P2** Agent control panel: a private dashboard where the personas propose content/updates and the human approves — the site itself stays "zero-login," agent-operated
- [ ] **P2** Forum/community: comments or a lightweight forum (giscus via GitHub Discussions to start) so readers discuss each day's reading — UGC that feeds the gap miner
- [ ] House rule applies: every generated article's numbers come from `data/`, and Burry's refutation check runs before publish

## 6. Trust & legal (shared: Burry + Jobs)

- [x] **P1** Privacy policy, terms, about page (who runs this, why, methodology promise) — `privacy.html`, `terms.html`, `about.html`
- [x] **P1** Attribution page: every series, its source, its license — `credit/`
- [ ] **P1** ads.txt + consent management before any real ad units
- [x] **P0** House rule enforced in code review: no simulated number ever renders without a label — the gate stack (integrity / claim-gate / narrative-check) enforces it mechanically

---

## Shipped 2026-08-27 — usability review implementation

Record: `docs/UX-REVIEW-2026-08-27.md` (review + full details, commit `95cf15d`).

- ✅ Per-line stress histories: `scripts/build-line-history.js` publishes `data/line-history.json/.js` (282 months × 7 weighted lines) from the canonical backtest; indicator pages render 2003→today stress charts; run daily after `backtest.js` (pinned by `tests/line-history.test.js`)
- ✅ Archive month dossier: the Time Machine answers "what drove it" — score, band, delta, heaviest lines (largest-remainder apportionment), reconstruction link; clicking the curve picks the month
- ✅ Archive window advances with the backtest (`backfill-reports.js` END derived; July 2026 reconstructions shipped)
- ✅ Facility search (Tools dropdown, desktop + mobile): lines, articles, reconstructions, chart events
- ✅ Clean URLs: nav/cards/ledger/footer/cross-refs link canonical `/slug/` static pages (`?i=` stays for deep links)
- ✅ Live-bug fix: front-page ledger crashed on `debtBurden` (10 payload lines vs 9 in `INDICATORS`) — share wiring + streak counter had been dead; line + `/debtBurden/` page shipped, "SEE ALL TEN LINES" now true
- ✅ Boot clearance is a keyboard-accessible button (Escape, inert page behind); breadcrumb dead anchor fixed; hero plain-English one-liner; market cadence stated

## Shipped 2026-08-27 (part 2) — the remaining improvements

- ✅ One source of truth for every published anchor curve (scripts/lib/methodology.js; backtest.js/collect.js/collect-states.js all import it; fully published in Lab Notes, generated by scripts/build-notes.js)
- ✅ Real state rankings: `scripts/collect-states.js` (daily, FRED) → data/states.json + 51 static `/states/<code>/` pages; the SIMULATED table is gone, the page says it measures the employment line only
- ✅ Lab anthem (original WebAudio groove, no licensing), konami-code confetti, tap-glass-10× incident report, April-1 fl-oz
- ✅ Incident severity C1–C5 computed from the chart and stamped on archive events (formula published on the page)
- ✅ OOZEMAXING status line + top-driver line above the fold (five-second test)
- ✅ Widget (`widget.html`, Tools → Embed the Jar), per-band OG cards (stamp.js swaps og:image), print stylesheet, search arrow-key navigation

Decision records: `research/AUXILIARY-LINES-DECISION-2026-08-27.md`. Review doc: `docs/UX-REVIEW-2026-08-27.md`.
## Done (context for the agents)
- ✅ Full site shell: 6 pages, containment-lab brand, staged motion, mobile pass (AA contrast, touch targets, mobile nav)
- ✅ Honest offline state (score 0, sensors offline) — currently deployed
- ✅ Historical research with NBER dates (`research/HISTORY.md`)
- ✅ Real FRED backtest, 2000→present, published anchors (`scripts/backtest.js`) — real current reading ≈ 35
- ✅ The Cascade definition + OOZEMAXING breadth condition, data-verified

## Ward M — parked sensors (2026-07-28, operator: "too much data right now")

Removed from the Market Ooze composite to keep the ward readable. Anchors
preserved here to resurrect without re-research; each was live and working
in commit b1f1279.

| Sensor | Series | Transform | Anchors (value → stress) |
|---|---|---|---|
| Builders | PERMIT (Census/HUD) | permits YoY % | -55→100, -40→90, -25→75, -10→55, 0→30, +10→10 |
| Industry | INDPRO (Fed Board) | industrial production YoY % | -15→100, -10→90, -5→75, -2→55, 0→35, +2→20, +4→10 |
| Freight | TSIFRGHT (DOT BTS) | freight index YoY % | -15→100, -10→90, -5→70, -2→50, 0→35, +2→22, +5→10 |
| Speculative (aux) | CBBTCUSD (Coinbase) | BTC drawdown from peak % | 0→5, 20→20, 40→45, 60→70, 80→90, 95→100 |

Re-add condition: when the ward earns a deeper "all gauges" view (or the
composite proves too narrow in a live episode), restore into both
scripts/collect-market.js and scripts/backtest-market.js, then re-freeze
calibration.

## Ward M — froth panel candidates (2026-08-01, advisor triage)

Valuation/complacency indicators from the "Capital Ooze" advisor text.
These measure FROTH (how stretched markets are), not STRESS (whether they
are breaking) — they peak during euphoria while every stress gauge reads
calm. If built, they form a separate labeled panel ("how stretched is the
rubber band"), never averaged into the stress composite.

| Candidate | Source | Cadence / lag | Notes |
|---|---|---|---|
| Margin debt | FINRA margin statistics (free, public) | Monthly, ~3-4wk lag | Most buildable; partially overlaps NFCI leverage subindex — disclose |
| Buffett Indicator | Fed Z.1 corporate equities value ÷ GDP (FRED-derivable) | Quarterly, months of lag | Wilshire 5000 pulled from FRED — Z.1 proxy is the licensing-clean path |
| Household equity allocation | Fed Z.1 flow of funds (FRED) | Quarterly, months of lag | Known long-horizon valuation signal; slow for a fast wing |

Rejected from the same text: fund flows (ICI licensing), index concentration
(constituent data licensing), Buffett cash pile (narrative, fails honesty
rules), liquidity rebrand (Ward M already is the market wing).

Build condition: after the Ward M research program is signed off and the
provisional anchors survive a live episode — froth panel is new-sensor work
and new sensors come last.
