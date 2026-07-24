# OOZEMeter — Build Requirements

**Status:** the deployed site is a fully designed shell with `LIVE=false` in `lab.js`. Every current-value reading honestly shows 0 / offline. This document is the complete list of what it takes to flip that flag truthfully.

---

## 1. Product summary

One daily score (0–100 "Ooze Level") measuring U.S. economic stress, computed from public data with published weights, rendered as the Jar. Ad-supported media site. Success = daily habitual visits, multiple pages per session, shares, and search traffic.

---

## 2. Data requirements (the critical path)

### 2.1 Feeds per indicator

All FRED series are free via the FRED API (one free API key, generous limits). EIA is free with a key. The two problem children are foreclosures and PMI (licensed/paid) — both have free proxies to launch with.

| Indicator | Metric | Source / series | Cadence | Cost | Notes |
|---|---|---|---|---|---|
| Unemployment | Unemployment rate | FRED `UNRATE` | Monthly | Free | Headline input |
| | Initial jobless claims | FRED `ICSA` | Weekly | Free | Fastest-moving employment signal |
| | Job openings | FRED `JTSJOL` | Monthly | Free | Secondary |
| Housing | 30-yr mortgage rate | FRED `MORTGAGE30US` (Freddie Mac PMMS) | Weekly | Free | |
| | Home prices | FRED `CSUSHPINSA` (Case-Shiller) | Monthly, ~2mo lag | Free | |
| | Inventory | FRED `ACTLISCOU` (Realtor.com) | Monthly | Free | |
| Credit cards | Delinquency rate | FRED `DRCCLACBS` | Quarterly | Free | NY Fed quarterly report (CSV) for richer detail |
| | Card APR | FRED `TERMCBCCALLNS` | Quarterly | Free | |
| Auto loans | Delinquency | NY Fed Household Debt & Credit report (CSV download) | Quarterly | Free | No clean FRED series; parse the published XLSX |
| | Loan rate | FRED `TERMCBAUTO48NS` | Quarterly | Free | |
| Gas prices | National avg retail gasoline | **EIA API v2** series `PET.EMM_EPMR_PTE_NUS_DPG.W` | Weekly | Free (API key) | AAA has **no public API**; do not scrape AAA. EIA is the licensable equivalent |
| Inflation | CPI, Core CPI | FRED `CPIAUCSL`, `CPILFESL` | Monthly | Free | YoY % computed by us |
| Foreclosures | Mortgage delinquency (proxy) | FRED `DRSFRMACBS` | Quarterly | Free | True foreclosure filings = ATTOM (paid, ~$500+/mo). Launch with the free proxy, clearly labeled |
| Manufacturing | Industrial production (proxy) | FRED `INDPRO` + `AMTMNO` (new orders) | Monthly | Free | **ISM PMI is licensed** — do not republish PMI numbers without a license. Use IP/orders at launch |

**Data licensing rules (hard requirements):**
- FRED: free to use with attribution; some series carry source restrictions — check each series' notes page before launch.
- Never scrape AAA, ISM, or NAR. Their numbers are licensed products.
- Every displayed figure links to its original source (already in the design; keep it).

### 2.2 Historical backfill
- Pull 25 years of history for every series at first run (one-time job). Powers the incident archive (replacing today's illustrative reconstruction) and the per-indicator 20-year charts.

### 2.3 State-level data (for State Rankings, Phase 2)
- Unemployment by state: FRED `<ST>UR` series (e.g. `CAUR`). Free.
- State house prices: FHFA HPI via FRED. Free.
- Replaces the simulated table currently labeled as placeholder.

---

## 3. Scoring engine

### 3.1 Normalization (must be reproducible and published)
For each indicator *i* on day *t*:
1. Fetch latest value and 25-year trailing history.
2. `stress_i = percentile rank of current value within trailing window` × 100, oriented so higher = more stress (invert where needed, e.g. job openings).
3. For multi-metric indicators (e.g. Employment = UNRATE + ICSA + JTSJOL), average sub-metric stresses with fixed, published sub-weights.
4. `OOZE = Σ (weight_i × stress_i)`, weights: Employment 25, Housing 20, Credit 20, Auto 15, Gas 10, Inflation 10 (= 100). Foreclosures/Manufacturing are display-only sensors at launch (as the site already states) or weights get rebalanced — decide before launch and publish it.
5. Round to integer; band and tier mapping already defined in `lab.js`.

### 3.2 Derived values
- **Delta**: today vs. previous collection.
- **Movers**: per-indicator contribution change vs. previous collection, top 3 by |change|.
- **Staleness**: each indicator carries `asOf`; if a feed is older than 2× its cadence, mark that line "stale" in the UI rather than silently showing old data. The score still computes; honesty is a UI state we already have patterns for.

### 3.3 Validation
- Unit tests: contributions sum to score; weights sum to 100; percentile function against known fixtures; inversion orientation per series (a rising `UNRATE` must raise stress).
- Golden-file test: one frozen day of raw inputs → expected score.

---

## 4. Architecture

### Phase 1 (launch, ~$0/mo infrastructure)
```
GitHub Actions (cron, daily 12:00 UTC)
  └─ node scripts/collect.js
       ├─ fetch FRED + EIA (keys in repo secrets)
       ├─ compute stress, score, movers, deltas
       ├─ write data/latest.json + data/history.json
       └─ commit → GitHub Pages redeploys automatically
Frontend: fetch('data/latest.json') → flip LIVE mode at runtime
```
- No servers, no database. The repo is the database; the commit history is the audit log (fits "every score reproducible").
- Failure mode: if collection fails, the last committed JSON stays live and the UI shows the previous `asOf` date. Action failure notifies via GitHub email.

### Phase 2 (scale/features)
- Custom domain (`oozemeter.com`) on Pages, or move to Cloudflare Pages.
- Static site generation (Eleventy or a 50-line node script) to stamp real `/gas/`, `/housing/` URLs from the existing `indicator.html` template + `lab.js` data. Required for serious SEO; the `?i=` URLs are fine until then.
- Newsletter send + alert thresholds need a worker/cron with an email provider (below).

---

## 5. Frontend work items
- [ ] `lab.js`: replace `LIVE` constant with a fetch of `data/latest.json` (fall back to offline state if fetch fails — the state that exists today).
- [ ] Real sparklines/charts from `history.json` (chart code already accepts arrays).
- [ ] Staleness badge per indicator card/page.
- [ ] Archive: replace illustrative `HISTORY` anchors with computed monthly score backfill.
- [ ] Sitemap.xml, robots.txt, canonical URLs, Open Graph + Twitter card images (a static jar share image per band is enough to start).
- [ ] FAQ structured data (schema.org `FAQPage`) on indicator pages — content already exists.
- [ ] 404 page (Pages supports `404.html`) in facility voice ("SPECIMEN NOT FOUND").

---

## 6. Newsletter & alerts
- **Phase 1**: replace the localStorage stub with a real ESP. Buttondown (~$9/mo) or Mailchimp free tier. A `<form action>` POST works with zero backend.
- **Phase 2**: "The Morning Specimen" automated daily send generated from `latest.json` (score, delta, top movers, one-line explanation + 5 links back to the site).
- **Phase 3**: threshold alerts ("notify me if Ooze > 70") — requires storing subscriber preferences: the first feature that genuinely needs a database (Supabase/Cloudflare D1 free tiers suffice).

---

## 7. Monetization prerequisites (AdSense)
- [ ] Custom domain (AdSense will not approve `*.github.io`).
- [ ] Privacy policy + terms pages (required), cookie consent (CMP) for EEA/UK if ads serve there.
- [ ] `ads.txt` at domain root.
- [ ] Substantive content volume: the 8 indicator pages + methodology qualify; add 10–20 evergreen explainers ("What is CPI?", "Why do gas prices rise?" — the FAQ content is the seed) before applying.
- [ ] Replace the placeholder ad slots with real ad units only after approval; keep the current slot positions.

---

## 8. Legal & trust
- [ ] Disclaimer on every page (exists) + dedicated `/about` explaining who runs it and the methodology promise.
- [ ] Privacy policy (analytics + ads + newsletter data).
- [ ] Attribution page listing every data source and license (partially exists in footer; formalize).
- [ ] The word "illustrative/simulated" must vanish only when the real thing ships — never show simulated data unlabeled (current site complies).

---

## 9. Analytics & ops
- Plausible (~$9/mo) or GA4 (free) — pageviews, top pages, referrers, return-visitor rate.
- Uptime: GitHub Pages SLA is adequate; add a free UptimeRobot check.
- Collection-job monitoring: GitHub Actions failure emails; optionally a "last collection" freshness check that opens an issue automatically.

---

## 10. Milestones

| # | Milestone | Definition of done | Est. effort |
|---|---|---|---|
| M1 | Real score | Actions cron computes daily score from FRED/EIA; site fetches `latest.json`; jar shows a real number with real `asOf` | 2–4 days |
| M2 | Real history | 25-yr backfill; archive + indicator charts use it | 1–2 days |
| M3 | SEO foundation | Custom domain, static per-indicator URLs, sitemap, OG images, 404 | 1–2 days |
| M4 | Newsletter live | Real ESP signup + manual weekly send | half day + ongoing |
| M5 | AdSense ready | Legal pages, 10+ evergreen articles, CMP, application submitted | 1–2 weeks (mostly writing) |
| M6 | State rankings live | State FRED series wired, simulated table replaced | 2–3 days |
| M7 | Alerts + auto newsletter | Subscriber DB, threshold sends | 1 week |

**Recurring costs at launch (M1–M4):** domain ~$12/yr; everything else $0. First paid line items: ESP (~$9/mo), analytics (~$9/mo optional), ATTOM only if real foreclosure filings matter (~$500+/mo — defer).

---

## 11. Open decisions
1. Foreclosures & Manufacturing: keep as unweighted "auxiliary sensors" (current site copy) or fold into the weighted six?
2. Update cadence messaging: most inputs are weekly/monthly — is the honest pitch "recalculated daily from the freshest available data" (recommended) or "daily data"? (It cannot honestly be the latter.)
3. Domain name purchase (oozemeter.com availability check needed).
4. Percentile window: fixed 25y vs. full history — affects how 2008 scores relative to today. Recommend fixed 25y rolling; must be published in Lab Notes either way.
