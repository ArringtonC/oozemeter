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
v3 | Growth     | Static per-slug pages (/gas/ not ?i=gas) + canonicals + sitemap (verified 2026-08-14: gas/index.html carries rel=canonical, sitemap.xml 78 URLs; duplicate of the v5 Growth row below) | done
v3 | Design     | OG share images per band + favicon (the Jar as an object) (verified 2026-08-14: scripts/og-cards.js + favicon.svg) | done
v3 | Design     | 404 page in facility voice (verified 2026-08-14: 404.html present) | done
v3 | Trust      | Privacy, terms, about, attribution pages (verified 2026-08-14: policies.html, terms.html, about.html) | done
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
v5 | Algorithm  | Unit tests + golden-day fixtures (partial 2026-08-14: 31 test files pass; no tests/fixtures dir — golden-day fixtures still missing) | wip
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
v5 | Website    | MARKET OOZE (Ward M, market.html): six-gauge provisional composite, Sector Watch proxy panel, divergence line vs the jar, experimental labeling | done
v5 | Data       | Hosted Ward M workflow candidate: retrying collectors, coordinated JSON/JS publication with failure rollback, integrity gate, serialized publish, and failure/recovery handling; manual-only behind quote-rights gate | done
v5 | Website    | Sector Watch on Ward M: 11-ticker overlapping equity proxy panel (SPY QQQ DIA IWM XLF XLI IYT XLY XLP SMH XLV), 22-session price-return states, source and rights disclosures | done
v5 | Data       | scripts/collect-sectors.js: manual Sector Watch collector -> data/sectors.js + .json; source/field/timezone/return-basis provenance; scheduled use disabled pending rights clearance | done
v5 | Algorithm  | Ward M v2 (operator cut): six gauges — rates, volatility, credit, energy, dollar + BREADTH from Sector Watch (a weakening ticker proxy now moves the score); recalibrated 2007-present (GFC 90, 2022 76, COVID 71, calm 10); builders/industry/freight/BTC parked in improvements.md | done
v5 | Website    | Ward M page reordered: Sector Watch leads, composite second, gauges collapsed under the hood | done
v5 | Research   | /teach Rates: generated draft covers the 10y-3m spread, inversion history, false signals, and reproduction; verified against collector + sources, cross-linked from gauge files, delivered as written digest 2026-08-01 (operator: "finish this out") | done
v5 | Research   | /teach Volatility: generated draft covers VIX pricing, spike follow-through, and complacency reads; verified against collector + sources, cross-linked from gauge files, delivered as written digest 2026-08-01 (operator: "finish this out") | done
v5 | Research   | /teach Credit & Funding: generated draft covers NFCI components, revisions, and methodology-v3 bridge; verified against collector + sources, cross-linked from gauge files, delivered as written digest 2026-08-01 (operator: "finish this out") | done
v5 | Research   | /teach Energy: generated draft covers WTI transmission and real-vs-nominal anchoring; verified against collector + sources, cross-linked from gauge files, delivered as written digest 2026-08-01 (operator: "finish this out") | done
v5 | Research   | /teach Dollar: generated draft covers the broad index, DXY comparison, and conditional funding-stress interpretation; verified against collector + sources, cross-linked from gauge files, delivered as written digest 2026-08-01 (operator: "finish this out") | done
v5 | Research   | /teach Sector Watch: generated draft covers the 11 ticker proxies, state thresholds, and breadth math; verified against collector + sources, cross-linked from gauge files, delivered as written digest 2026-08-01 (operator: "finish this out") | done
v5 | Research   | Ward M anchor validation: percentile-check every gauge's provisional anchors against its full history | done
v5 | Website    | Gauge files: per-gauge pages for the six ward gauges (why it matters / vs 2008 / FAQ), like the intake lines have | done
v5 | Website    | Divergence chart: ward-vs-jar overlay 2007-present from the two backtest histories | done
v5 | Content    | OOZEBOT manual market note: one deterministic measured-fact paragraph per approved Sector Watch collection | done
v5 | Trust      | Ward M local release review: 89-test suite, household and market integrity gates, anchor validation, and final independent review passed | done
v5 | Launch     | Ward M research batch landed (2026-08-01, operator go-ahead): lessons 0009-0014, gauge files, divergence chart, anchor validation, OOZEBOT note, integrity gates — all tests green at commit | done
v5 | Trust      | Sector Watch quote rights: obtain licensed/explicitly permitted derived-display source, document corporate-action policy, then enable weekly schedule | todo
v5 | Data       | Divergence-history freshness: wire build-market-divergence into the monthly cycle so the ward-vs-jar chart tracks new sealed months (Codex task pack 2026-08-01) | todo
v5 | Data       | Anchor-validation cadence: re-run validate-market-anchors monthly so "provisional anchors" stays backed by a current report — descriptive only, no auto-tuning (Codex task pack 2026-08-01) | todo
v5 | Research   | Froth panel (queued, LAST — new sensors after research signoff + live episode): margin debt (FINRA), Buffett Indicator (Z.1 proxy), household equity allocation — valuation/complacency panel, separate from the stress composite; triage + licensing notes in improvements.md | todo
v5 | Trust      | LAUNCH BLOCKER (board 2026-08-01): replace the "illustrative" 20-year charts on all eight indicator pages — real per-line backfill or an honest "history feed pending" stub; a stranger who spots one fake chart stops believing the real number — DONE 2026-08-01: honest "history feed pending" stub live on all eight pages (real backfill still queued for M2) | done
v5 | Trust      | LAUNCH BLOCKER (board 2026-08-01): market.html claims anchors are "published in data/market.json" — verified false; publish per-gauge anchor tables in the payload and link the anchor-validation report from market.html + gauge files — DONE 2026-08-01: claim corrected: prose links collector source + anchor-validation report; report also linked from all six gauge files | done
v5 | Trust      | LAUNCH BLOCKER (board 2026-08-01): front-page "Integrity: N%" is 100−score wearing an audit label beside Collected/Verified/Sealed — relabel to non-audit language or wire the real integrity-gate result — DONE 2026-08-01: relabeled to the real thing on placard, boot line, and stamper: "Integrity gate: PASS · fails closed" | done
v5 | Content    | LAUNCH BLOCKER (board 2026-08-01): the 0-100 scale is never defined — plain-English band legend on what-is-ooze.html (thresholds + "what it feels like"), today's reading marked, linked from the hero score chip — DONE 2026-08-01: band legend live on what-is-ooze.html#scale, rendered from the BANDS constant, today marked, hero chip links to it | done
v5 | Growth     | LAUNCH BLOCKER (board 2026-08-01): base URL hardcoded across 7 surfaces (sitemap, robots, OG, canonicals, feed, JSON-LD) — one build-time constant so the domain cutover is a single-variable change — DONE 2026-08-01: scripts/lib/site-url.js is the one constant; generators require it; scripts/set-base-url.js rewrites static surfaces for cutover | done
v5 | Design     | Board: Sector Watch % color uses ≥0 for green while the jar uses ≥−2% — a −1% row shows green jar + amber number; align thresholds to the published state rule — DONE 2026-08-01: percentage color now derives from the same state field as the jar — one source of truth | done
v5 | Design     | Board: divergence chart illegible at 360px (axis text ~4px) and inverts color grammar (green=ward, off-token blue=household) — overflow-x container + one --ward token, household keeps ooze green — DONE 2026-08-01: overflow-x scroll + 640px min-width; --ward token: ward=cyan everywhere, household keeps ooze green (chart, dots, key, index file dots) | done
v5 | Website    | Board: statically stamp indicator pages + market.html at build time (score, value, prose) so pre-JS HTML never reads "—/100 OFFLINE" — crawlers and previews see the number — DONE 2026-08-01: static readings baked by static-pages.js + stamp.js (score, value, why-prose); og:image per page | done
v5 | Design     | Board: boot clearance auto-skips by default (score visible <1s); ceremony becomes an optional replay — DONE 2026-08-01: ceremony plays once per browser (localStorage), instant after; ?boot=1 + REPLAY link bring back the theater | done
v5 | Growth     | Board: share block (Copy Report / Post to X) on market.html + all indicator and gauge pages with per-page reading pre-filled; per-page OG cards that bake the number into the image — DONE 2026-08-01: foot-share strip in renderFooter = every chrome page; per-page OG cards via scripts/og-cards.js (headless Chrome, zero deps) carry the live number | done
v5 | Website    | Board: sitemap.xml missing all six market/* gauge pages + lessons; index.html and market.html missing canonical tags — DONE 2026-08-01: sitemap 23→35 URLs (gauge pages + lessons); canonicals stamped on index + market | done
v5 | Website    | Board: lessons wing folds into the facility — course.css points at lab.css tokens, OOZE ACADEMY wordmark links home, standard footer appended, "Today's Reading" link on every lesson — DONE 2026-08-01: course.css tokens aligned to lab.css, wordmark links home, TODAY'S READING nav chip, facility footer via course.js | done
v5 | Trust      | Board: policies.html + notes.html cover half the facility — add Ward M section (house rules apply) and disclose the two zero-weight aux jar lines so "complete recipe" is true — DONE 2026-08-01: Ward M annex in notes (#ward: recipe, fine print, house rules) + policies data-policy paragraph + aux-line disclosure fixes "complete recipe" | done
v5 | Data       | Board (Codex): Ward M partial-month labeling ("as of 2026-07, computed 07-30"), STALE flag when generated exceeds cadence, and route market collection through market.yml under oozebot identity for inspectable provenance | todo
v5 | Content    | Board: Ward M copy rewrite for civilians — engineering internals (NFCI, quote.close transport, anchor provenance) move to a linked methodology note; gauge pages gain the can-glass instrument — DONE 2026-08-01: prose rewritten plain (bond recession signal / fear gauge / credit index), internals moved to notes#ward; gauge pages gained the can-glass instrument | done
v5 | Business   | Business identity (V1): operator sets up email on the domain (forwarding OK); contact address published on about.html + policies.html | todo
v5 | Business   | Capture reopened honestly (V2 — supersedes the 2026-07-28 park by operator decision 2026-08-01): ESP account under the business email, NL_USER wired, promise = two weekly reports, double opt-in | todo
v5 | Trust      | Board fix batch 2026-08-02 (all shipped): tab-bar active-state bug, mock sponsor placeholder deleted, breadth anchors published in notes (worked example reproduces 50), share card units (oz) + dual band label unified, exact Sector Watch boundaries on-page, manual-cadence + monthly-mean disclosures on market.html, divergence chart lag note, history stub de-jargoned | done
v5 | Website    | Academy navigation repaired (2026-08-02): baked breadcrumbs on all 14 lessons, household indicator pages link lessons 01-08, course maps cross-link both wings, data map lists Ward M lessons, MISSION.md dead end -> about.html | done
v5 | Trust      | privacy.html + terms.html shipped (2026-08-02): honest zero-collection privacy policy with pre-disclosure rule for analytics/email/ads, educational-use terms with cite/share/verify grants — footer-linked site-wide, sitemapped (AdSense blocker #1 cleared) | done
v5 | Content    | Content volume 4 -> 16 articles (2026-08-02): twelve evergreen explainers — one per intake line incl. financial + aux case studies, how-the-score-works, reading-the-bands, ward-m-explained — token-resolved numbers, /files/ static pages, feed + sitemap (50 URLs) | done
v5 | Content    | EDITORIAL IDENTITY v1 (operator go 2026-08-02): Constitution LOCKED v1.0 (research/editorial/OOZEMETER-EDITORIAL-CONSTITUTION.md) + EDITION-STYLE-GUIDE.md frozen — mission, promise, voice, always/never, report anatomy, mechanics, chart+evidence rules, QA. NOTE the LOCK GATE it set is still binding: no automated weekly send is wired, deliberately | done
v5 | Content    | June five-ways exercise done (research/editorial/june-2026-five-ways.md): Brew/Axios/Economist/Housel/OOZEMeter versions + boundary extraction; 3 amendments proposed (one governing idea per report, bullets never in body prose, neighbor test beats register) | done
v5 | Content    | Archive reconstructions (operator ask 2026-08-02): 23 monthly reports for the trailing year — 12 household + 11 Ward M (Oct 2025 household = honest gap, skipped and explained) — generated deterministically by scripts/backfill-reports.js from the two public backtests, every figure re-derived and asserted against published scores; reconstruction disclaimer leads every report; /files/ pages + oozeonomics listing + sitemap (73 URLs) | done
v5 | Content    | Hermes pattern study (external agent): 10-15 sequential editions x 2-3 pubs, mechanics not phrasing, deliverable = adopt/adapt/reject page argued against the Constitution (brief in Constitution SS13) | todo
v5 | Growth     | "Cite this score" affordance (advisor 2026-08-02, index-is-the-IP): how-to-cite line + stable current-score reference (data/latest.json documented) + one-paragraph press blurb on about.html — make the score quotable by journalists, teachers, and YouTubers in 30 seconds | todo
v5 | Growth     | Press kit stub: jar SVG master, OG cards, one-line description, methodology one-pager link — a /press page or about.html section; grows only when someone actually asks | todo
v5 | Business   | Monthly ops snapshot (V3, after GA4 has data): cron pulls GA4 Data API monthly — visitors, returners, top pages, shares — rendered as one small ops page; do not build before there is a month of real data | todo
v5 | Business   | Weekly automation (V3): two reports go out every week — OOZE WEEKLY (household) + WARD M WEEKLY (market note), generated by the pipeline, published to site + RSS, emailed to the list | todo
v5 | Algorithm  | METHODOLOGY v3 (SEQUENCED AFTER Ward M live experience): Financial Conditions (NFCI) enters the flagship at 3% — spec in research/METHODOLOGY-V3-SPEC.md (verified 2026-08-14: data/latest.json publishes methodologyVersion 3.0.0, financial weight 3.00 live) | done
v5 | Trust      | v3 disclosure copy (notes + policies + revision record #2): GFC-calibrated bet stated plainly, studies linked — BLOCKS first v3 publish — shipped 2026-08-02: bet stated plainly in notes.html (single-episode benefit, dilution, ×0.97), policies v3.0.0 row cites 180 moved values + entry #2, studies linked | done
v5 | Website    | lab.js WEIGHTS + INDICATORS entry for the financial line; notes.html formula update (after data session ships v3) — shipped 2026-08-02: 7-entry WEIGHTS (sum 100), financial INDICATORS entry (🌡, 3%, honest FAQs), /financial/ static page, story.js narrative, notes formula annex | done
v5 | Content    | OOZEBOT: financial line narrative + divergence sentence (measured-fact language, never forecast) | todo
v5 | Growth     | Embeddable "Today's Ooze" widget | todo
v5 | Growth     | Threshold alerts (notify me above 70) | todo
v5 | Content    | Ooze Audio: monthly briefing read aloud (from newsletter text) - idea from design mock, not yet built | todo
v5 | Fun        | Lab anthem: original funky groove ("This Is How We Ooze It" licensed later) | todo
v5 | Fun        | More easter eggs: konami confetti, 10-tap incident report, April 1 fl-oz | todo
v5 | Ads        | AdSense application after legal + content volume | todo
`;
