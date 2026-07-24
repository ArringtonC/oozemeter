# OOZEMeter — Improvements Task List

Owner tags map to the agent personas in `agents/` — each task lists who leads the review.
Priority: **P0** = blocks going live honestly · **P1** = pre-launch · **P2** = post-launch.

---

## 1. Scoring engine & data (owner: Burry)

- [ ] **P0** Add ICSA weekly-claims momentum term to the employment line so fast shocks register (COVID scored 45 in the backtest because quarterly delinquency data lags; claims would have caught it)
- [ ] **P0** Apply the single published calibration pass (scale so GFC peak = 90) and rerun the backtest; lock the resulting episode scores as official
- [ ] **P0** Replace the archive's estimated anchor curve with the real monthly backtest series (`research/backtest-results.json` → `lab.js` HISTORY)
- [ ] **P0** Convert `scripts/backtest.js` into the daily collector (`scripts/collect.js`) writing `data/latest.json` + `data/history.json`
- [ ] **P0** GitHub Actions cron: run collector daily, commit JSON, Pages redeploys (REQUIREMENTS.md §4)
- [ ] **P1** Staleness rule: each line carries `asOf`; UI flags lines older than 2× their cadence
- [ ] **P1** Unit tests: anchor interpolation, orientation (rising unemployment must raise stress), weights sum, golden-day fixture
- [ ] **P1** Publish full anchor tables in Lab Notes (the curves in `backtest.js` ANCHORS, human-readable)
- [ ] **P2** OOZEMAXING breadth condition computed daily and displayed (all six lines ≥ 60 — never yet met)
- [ ] **P2** Incident Severity ratings (C1–C5: peak × duration × recovery) computed from the backfill, stamped on archive files
- [ ] **P2** Decide: foreclosures & manufacturing stay auxiliary sensors or get formula weight (REQUIREMENTS.md open decision #1)

## 2. Product & focus (owner: Jobs)

- [ ] **P0** Flip `LIVE` to a runtime fetch of `data/latest.json` — the day the jar shows a true number is the day the product exists
- [ ] **P1** Five-second test on the homepage: score, direction, top driver visible with zero scrolling on a phone
- [ ] **P1** Cut anything that doesn't serve the daily check habit (audit the homepage section by section; every section must earn its scroll)
- [ ] **P1** The share card is the product's ad — make the copied/posted artifact beautiful, not just text (OG image per band)
- [ ] **P2** "Why did it change?" — every score movement must have a one-sentence explanation on the homepage (auto-generated from the movers data)
- [ ] **P2** Kill or commit: sound toggle — either make bloops genuinely delightful or delete the feature

## 3. Design & craft (owner: Ive)

- [ ] **P1** Design the OG/share image set (one per band + OOZEMAXING) — the jar as an object, photographed like a product
- [ ] **P1** Favicon + app icon (the jar, readable at 16px)
- [ ] **P1** Type ramp audit: one scale across all six pages (some subpage headings drift)
- [ ] **P1** 404 page in facility voice ("SPECIMEN NOT FOUND")
- [ ] **P2** Motion audit after live data lands: the fill animation should reflect the real delta (small change = small motion)
- [ ] **P2** Print stylesheet for indicator pages (journalists screenshot and print these)
- [ ] **P2** Dark-only is correct for the lab — but verify glare/contrast outdoors on a real phone in sunlight

## 4. Growth & distribution (owner: Zuckerberg)

- [ ] **P1** Custom domain + per-slug static pages (`/gas/` not `?i=gas`) — sitemap, canonical URLs, FAQ schema markup
- [ ] **P1** Newsletter: real ESP behind the existing form (Buttondown), then the daily "Morning Specimen" send generated from `latest.json`
- [ ] **P1** Embeddable widget: `<iframe>` "Today's Ooze" badge for blogs — every embed is a backlink
- [ ] **P2** Streak/habit mechanics: "you've checked the jar N days in a row" (localStorage, no accounts)
- [ ] **P2** State pages as 50 SEO surfaces once regional feeds land
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

- [ ] **P1** Privacy policy, terms, about page (who runs this, why, methodology promise)
- [ ] **P1** Attribution page: every series, its source, its license
- [ ] **P1** ads.txt + consent management before any real ad units
- [ ] **P0** House rule enforced in code review: no simulated number ever renders without a label

---

## Done (context for the agents)
- ✅ Full site shell: 6 pages, containment-lab brand, staged motion, mobile pass (AA contrast, touch targets, mobile nav)
- ✅ Honest offline state (score 0, sensors offline) — currently deployed
- ✅ Historical research with NBER dates (`research/HISTORY.md`)
- ✅ Real FRED backtest, 2000→present, published anchors (`scripts/backtest.js`) — real current reading ≈ 35
- ✅ The Cascade definition + OOZEMAXING breadth condition, data-verified
