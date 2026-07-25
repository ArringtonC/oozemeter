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
v2 | Algorithm  | Backtest 2000→present on real FRED data, published anchors | done
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
v3 | Data       | Replace broad DRCLACBS auto proxy with NY Fed auto 30+ delinquency flow | todo
v3 | Algorithm  | Resolve ICSA monthly-average vs trailing four-week-mean methodology | todo
v3 | Algorithm  | Freeze CPI adjustment basis: current CPIAUCSL vs recommended NSA CUUR0000SA0 YoY | todo
v3 | Trust      | Reconcile UI source labels with original publishers and proxy disclosures | todo
v3 | Launch     | Push live: real number + cron running in the cloud | todo
v3 | Data       | Wire foreclosures feed (DRSFRMACBS already fetched — surface it) | todo
v3 | Data       | Wire manufacturing feed (INDPRO) | todo
v3 | Growth     | Real newsletter ESP behind the signup form (Buttondown) | todo
v3 | Growth     | Analytics + events on share, subscribe, session depth | todo
v3 | Growth     | Static per-slug pages (/gas/ not ?i=gas) + canonicals + sitemap | todo
v3 | Design     | OG share images per band + favicon (the Jar as an object) | todo
v3 | Design     | 404 page in facility voice | todo
v3 | Trust      | Privacy, terms, about, attribution pages | todo
v3 | Website    | Remove empty ad slots until there is traffic | done
v3 | Website    | Big-league navigation: Indicators/Tools dropdowns + mobile menu; homepage slimmed (cascade moved to what-is-ooze.html) | done
v3 | Launch     | Custom domain purchase + setup | todo
v4 | Content    | Golden-master report page (worst-case content, checked in) | todo
v4 | Design     | Prose ramp completed: h3, lists, captions, dateline | todo
v4 | Content    | Trending headlines intake (filter: does it move a line?) | todo
v4 | Content    | Auto-generated Daily Ooze Report pages from data | todo
v4 | Content    | Fast indexing (IndexNow + Indexing API) on publish | todo
v4 | Content    | Search Console gap miner loop | todo
v4 | Agents     | Burry refutation gate automated pre-publish | todo
v4 | Agents     | Operator control panel (agents propose, human approves) | todo
v4 | Content    | Forum/comments (giscus) on daily readings | todo
v5 | Data       | Per-line historical backfill (replace illustrative indicator charts) | todo
v5 | Data       | State-level live data (50 FRED series) → real rankings | todo
v5 | Algorithm  | Incident severity ratings C1-C5 (peak × duration × recovery) | todo
v5 | Algorithm  | Unit tests + golden-day fixtures | todo
v5 | Algorithm  | OOZEMAXING breadth status displayed on site | todo
v5 | Research   | Pre-2000 extension (1929-1999, fidelity tiers) | todo
v5 | Growth     | Embeddable "Today's Ooze" widget | todo
v5 | Growth     | Threshold alerts (notify me above 70) | todo
v5 | Fun        | Lab anthem: original funky groove ("This Is How We Ooze It" licensed later) | todo
v5 | Fun        | More easter eggs: konami confetti, 10-tap incident report, April 1 fl-oz | todo
v5 | Ads        | AdSense application after legal + content volume | todo
`;
