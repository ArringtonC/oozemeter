/* OOZEMeter task ledger — plain text, one task per line:
   version | area | task | status     (status: done, wip, todo)
   Edit this file directly; the flowmap Tasks tab renders it.
   Versions:  v1 shell · v2 real number (Gates 1-2) · v3 capture (Gate 3)
              v4 content engine (Gate 4) · v5 expansion */
window.TASKS = `
v1 | Website    | Six-page containment-lab site (home, indicators, archive, notes, personal, states) | done
v1 | Website    | The Jar: staged motion, settles at rest, level themes | done
v1 | Website    | The Cascade definition + OOZEMAXING section | done
v1 | Website    | Boot clearance sequence + easter-egg alarm states | done
v1 | Website    | Mobile pass: nav, AA contrast, touch targets, no fake hover copy | done
v1 | Website    | Honest offline state — jar reads 0 when no data | done
v1 | Website    | Share card + copy/post actions | done
v1 | Docs       | PRODUCT.md + DESIGN.md design context | done
v2 | Research   | NBER crisis research with real dates (research/HISTORY.md) | done
v2 | Algorithm  | Backtest 2003→present on public data, published anchors | done
v2 | Algorithm  | Claims momentum term (fast crisis signal) | done
v2 | Algorithm  | Calibration: calm month = 10, GFC peak = 90 | done
v2 | Algorithm  | Archive + incidents generated from backtest (no hand-drawn numbers) | done
v2 | Data       | Daily collector (collect.js): monthly seal + per-line asOf + STALE flags | done
v2 | Data       | GitHub Actions daily cron (activates on push) | done
v2 | Website    | Site consumes data/latest.js — real June 2026 = 25 live locally | done
v2 | Agents     | Personas with mandates (Jobs, Ive, Zuckerberg, Burry) | done
v2 | Agents     | First full board review — findings became Gates 1-4 | done
v2 | Docs       | Flowmap: build order, architecture, visitor flow, completion board | done
v2 | Research   | /teach foundation: mission, resources, notes, and shared lesson assets | done
v2 | Research   | /teach Gas Prices: measurement, interpretation, and reproducible data path | done
v2 | Research   | /teach Housing: measurement, interpretation, and reproducible data path | done
v2 | Research   | /teach Credit Cards: measurement, interpretation, and reproducible data path | done
v2 | Research   | /teach Auto Loans: measurement, interpretation, and reproducible data path | done
v2 | Research   | /teach Unemployment: measurement, interpretation, and reproducible data path | done
v2 | Research   | /teach Inflation: measurement, interpretation, and reproducible data path | done
v2 | Research   | /teach Foreclosures: measurement, proxy limits, and reproducible data path | done
v2 | Research   | /teach Manufacturing: measurement, licensed-PMI limits, and free data path | done
v2 | Research   | Intake-line source registry + quick-reference data map | done
v3 | Data       | Replace broad DRCLACBS auto proxy with NY Fed auto 30+ delinquency flow | done
v3 | Algorithm  | Resolve ICSA monthly-average vs trailing four-week-mean methodology | done
v3 | Algorithm  | Freeze CPI adjustment basis: NSA CPI-U year-over-year via CPIAUCNS | done
v3 | Trust      | Reconcile UI source labels with original publishers and proxy disclosures | done
v3 | Launch     | Push live: real number + cron running in the cloud | done
v3 | Data       | Wire mortgage-distress proxy feed (DRSFRMACBS, zero-weight auxiliary) | done
v3 | Data       | Wire manufacturing feeds (INDPRO + AMTMNO, zero-weight auxiliary) | done
v3 | Growth     | Fake signup promise removed: form is honestly closed, points at RSS (was localStorage-only "clearance granted" — a lie) | done
v3 | Growth     | Newsletter ESP + send automation — PARKED to do-not-build (no users yet; capture before traffic is backwards). Activation path kept: paste Buttondown username into NL_USER; sender script preserved in git (f46b68a) | done
v3 | Growth     | Analytics + events on share, subscribe, session depth | todo
v3 | Growth     | Static per-slug pages (/gas/ not ?i=gas) + canonicals + sitemap | todo
v3 | Design     | OG share images per band + favicon (the Jar as an object) | todo
v3 | Design     | 404 page in facility voice | todo
v3 | Trust      | Privacy, terms, about, attribution pages | todo
v3 | Website    | Remove empty ad slots until there is traffic | done
v3 | Website    | Score chip in the chrome: live jar + score + band in header, every page | done
v3 | Website    | Chip hover panel: all 8 lines with deltas, no navigation needed | done
v3 | Website    | Mobile bottom tab bar (Jar / Chart / Ooze? / My Ooze) | done
v3 | Website    | Latest-readings rail: dual-speed homepage with relative timestamps | done
v3 | Website    | Sticky local sub-nav on indicator pages (chapters + See the Jar) | done
v3 | Website    | Ooze event chart: XY curve with dated event flags (incl. BP spill) | done
v3 | Website    | Big-league navigation: Indicators/Tools dropdowns + mobile menu; homepage slimmed (cascade moved to what-is-ooze.html) | done
v3 | Launch     | Custom domain purchase + setup | todo
v3 | Brand      | 80/20 language audit: find lab-speak that repeats or obscures meaning; plain language beside branded terms | todo
v3 | Website    | Data-release calendar (metric: +15% weekly returners in 60d of analytics) | done
v3 | Content    | "Why it changed this month" auto-section on each indicator page (story engine) | done
v3 | Trust      | Formula version history page (policies.html#methodology, revisions.json evidence) | done
v3 | Trust      | Editorial + correction + data policy (policies.html) | done
v3 | Growth     | Prev/next "continue through the facility" (metric: pages/session 2.3 -> 3.1 once measured) | done
v5 | Ads        | Ad-readiness checklist as an objective launch gate (page depth, content volume, legal, speed, brand safety) | todo
v3 | Docs       | "Do Not Build Yet" list (research/do-not-build.md; forum moved out of v4) | done
v3 | Docs       | House rule: measurement before expansion - every new section ships with its metric, target, and removal condition | todo
v3 | Data       | AUDIT-1 Revision detector + calibration invariants (scripts/integrity.js, fail-closed; first log: v2 rewrote 244 months) | done
v3 | Website    | AUDIT-2 Historical verdict line on hero, computed live + stamped static | done
v3 | Data       | AUDIT-3 Plausibility gate: per-line ranges + 30pt jump cap in integrity.js; failure blocks the cron commit | done
v3 | Website    | AUDIT-4 Stamp real score into static HTML (scripts/stamp.js) - wired into daily cron | done
v3 | Growth     | AUDIT-5 RSS/Atom feed (feed.xml) - wired into daily cron | done
v3 | Design     | AUDIT-6 Motion/type tokens: settle curve declared once (--ease), faux-bold fixed | done
v3 | Growth     | AUDIT-7 JSON-LD complete: Dataset + Article + FAQPage schemas | done
v3 | Design     | AUDIT-8 First-paint doctrine: static shell + preloaded fonts, LCP<2s, score visible before JS | todo
v3 | Content    | Household Story Engine (scripts/story.js): monthly plain-English story + per-line why-it-changed, wired to homepage + indicator pages + cron | done
v3 | Website    | Release calendar: next data drops with countdown in the latest rail | done
v3 | Growth     | Previous/Next file controls on indicator + article pages | done
v3 | Brand      | "Cross-References" rename (related sections, on-brand) | done
v3 | Trust      | policies.html: editorial, correction, and data policy + methodology version history (v1/v2) | done
v4 | Website    | Front-page prototype verdict: original hero wins (8 variants tested); per-line mini jars adopted as the enhancement | done
v4 | Website    | Mini line-jars: every intake node + chip panel row carries its own jar filled to that line's stress | done
v4 | Website    | Variant J folded into index.html: Mission Control × Research Library (jar + placard, intake canisters, 8-line ledger w/ AUX disclosure, verify row, file rail) | done
v4 | Brand      | Tag taxonomy renamed site-wide: OOZE MONTHLY REPORT / OOZE ARCHIVES / OOZEONOMICS | done
v4 | Trust      | CANONICAL TRUTH: prose tokens resolve from history at render; nothing remembers numbers | done
v4 | Trust      | Narrative Integrity Check (scripts/narrative-check.js) - the gate reads the essays; wired into cron | done
v4 | Trust      | Article contradictions fixed: 2022/COVID/2010 numbers now canonical tokens | done
v4 | Website    | Oct 2025 gap rendered honestly: chart break + annotation + interpolation warning in replay | done
v4 | Trust      | Flagship permalink follows coverage (hand report wins); visible file-not-found fallback | done
v4 | Website    | Fake specimen thermometer retired - replaced with real methodology version | done
v4 | Brand      | Year-count claims unified ("since 2003"); rounding footnote on ounce splits | done
v4 | Content    | OOZEBOT editorial engine: one dataset -> verdict, summary, story, line narratives, article, newsletter, RSS, social, confidence | done
v4 | Content    | Auto-published monthly Ooze Report (keyed by month, golden-master template, OOZEBOT byline) | done
v4 | Website    | Specimen Progress page: collection status, publication window, Data Watch - facts only, no forecasts | done
v4 | Content    | Newsletter + social + RSS variants generated per seal (sending still blocked on ESP) | done
v4 | Content    | Editorial QA checklist (research/editorial-qa.md) - human counterpart to the integrity gate; voice pass #1 applied | done
v4 | Content    | Golden-master report page (article.html template, live) | done
v3 | Website    | OOZEONOMICS section: index + article template + 4 seed articles from real data | done
v3 | Ads        | Sponsored-beaker ad module modeled (doctrine gap #4), articles only | done
v4 | Design     | Prose ramp completed: h3, lists, captions, dateline | todo
v4 | Content    | Trending headlines intake (filter: does it move a line?) | todo
v4 | Content    | Auto-generated Ooze Report pages - MONTHLY cadence live via OOZEBOT; daily notes await content engine | wip
v4 | Content    | Fast indexing (IndexNow + Indexing API) on publish | todo
v4 | Content    | Search Console gap miner loop | todo
v4 | Agents     | Burry refutation gate automated pre-publish | todo
v4 | Agents     | Operator control panel (agents propose, human approves) | todo
v4 | Content    | Forum/comments — MOVED to Do-Not-Build-Yet list (needs traffic first) | done
v5 | Data       | Per-line historical backfill (replace illustrative indicator charts) | todo
v5 | Data       | State-level live data (50 FRED series) → real rankings | todo
v5 | Algorithm  | Incident severity ratings C1-C5 (peak × duration × recovery) | todo
v5 | Algorithm  | Unit tests + golden-day fixtures | todo
v5 | Algorithm  | OOZEMAXING breadth status displayed on site | todo
v5 | Research   | Pre-2000 extension (1929-1999, fidelity tiers) | todo
v5 | Website    | About page (about.html): one person, one robot, the rules — linked from footer + mobile nav | done
v5 | Website    | 404 incident report (Form DEC-404, SPECIMEN NOT FOUND) — self-contained so GH Pages can serve it from any bad path | done
v5 | Website    | Home-screen ready: apple-touch-icon (Jar SVG master) on every page | done
v5 | Fun        | Streak counter on the front page — consecutive days checking the jar, counted locally | done
v5 | Growth     | GA4 event auto-tracker ported from Tryst into lab.js (indicator/article/verify clicks, jar taps, report copies — activates when operator pastes the measurement ID) | done
v5 | Growth     | Static per-slug pages: /gas/…/manufacturing/ + /files/<article>/ via scripts/static-pages.js — clean URLs, canonical, per-page meta (rerun after publish; cron wiring awaits data session) | done
v5 | Growth     | sitemap.xml + robots.txt shipped (Search Console verification still needs operator Google account) | done
v5 | Brand      | Jar SVG master: favicon.svg + og-card.png on every page; index OG tags stamped fresh by the daily cron | done
v5 | Website    | MARKET OOZE (Ward M, market.html): 9 official-series sensors mapped from the operator's watchlist (tickers -> licensing-clean twins), provisional composite, divergence line vs the jar, experimental labeling | done
v5 | Data       | scripts/collect-market.js: standalone Ward M collector -> data/market.js|.json (cron wiring awaits data session; rerun manually meanwhile) | done
v5 | Algorithm  | METHODOLOGY v3 (SEQUENCED AFTER Ward M live experience): Financial Conditions (NFCI) enters the flagship at 3% — spec in research/METHODOLOGY-V3-SPEC.md, implementation = data session | todo
v5 | Trust      | v3 disclosure copy (notes + policies + revision record #2): GFC-calibrated bet stated plainly, studies linked — BLOCKS first v3 publish | todo
v5 | Website    | lab.js WEIGHTS + INDICATORS entry for the financial line; notes.html formula update (after data session ships v3) | todo
v5 | Content    | OOZEBOT: financial line narrative + divergence sentence (measured-fact language, never forecast) | todo
v5 | Growth     | Embeddable "Today's Ooze" widget | todo
v5 | Growth     | Threshold alerts (notify me above 70) | todo
v5 | Content    | Ooze Audio: monthly briefing read aloud (from newsletter text) - idea from design mock, not yet built | todo
v5 | Fun        | Lab anthem: original funky groove ("This Is How We Ooze It" licensed later) | todo
v5 | Fun        | More easter eggs: konami confetti, 10-tap incident report, April 1 fl-oz | todo
v5 | Ads        | AdSense application after legal + content volume | todo
`;
