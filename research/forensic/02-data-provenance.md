# 02 — DATA PROVENANCE MAP + DATA INTEGRITY REPORT

**Auditor:** Agent 2 (Data Auditor) · read-only pass, no production code modified
**Repo state:** `main`, working tree as of the audit; `data/latest.json` generated `2026-08-14T04:16:56Z`
**Ground truth:** FRED CSV transport (`https://fred.stlouisfed.org/graph/fredgraph.csv?id=…`) pulled independently during this audit
**Method:** every displayed stress re-derived from raw FRED CSVs in an independent Python replica, not read back from the repo's own artifacts

---

## 0. HEADLINE VERDICT

**The arithmetic is clean. The plumbing is not.**

I rebuilt the collector's entire scoring path from raw FRED CSVs in an independent
implementation and reproduced all seven weighted line stresses for the published
month exactly (jobs 13, inflation 30, housing 44, credit 38, auto 47, gas 58,
financial 10 → jar 26). Every displayed line value traces to a real, current
observation of the series it names. `collect.js` and `backtest.js` currently agree
on all 282 months and that agreement is gated daily in CI. The D-10 calibration
defect is genuinely fixed by construction.

What is *not* fixed is the **class**. The D-10 incident was: a research artifact
(`research/backtest-results.json`) that no scheduled job regenerates fed a
reader-visible generator (`backfill-reports.js` → `data/reconstruction-reports.js`),
and drifted. The gate added afterward (`narrative-check.js:126`) closes that hole
for **11 of the 23** generated archive articles. The other 12 — the `recon-ward-*`
reports — each bake a **household jar score** into reader-visible prose, sourced
from the same stale artifact, checked by nothing. That is the identical failure
mode, still open, on the same file, in the same generator, one line below the fix.

Separately, and more structurally: **`data/market-history.json` is a daily
cross-vintage join.** Its household column is refreshed every day from
`data/history.json`; its market column comes from `research/market-backtest.json`,
which only a manual `workflow_dispatch` refreshes (last: 2026-08-01). The file then
stamps itself `generated: market.generated` — the *market* timestamp — so the
artifact advertises a vintage its household column does not have, and publishes a
`divergence` column that subtracts a 13-day-old market number from a
13-hours-old household number. This runs in the daily cron.

And one methodology finding that is not a bug but is being *reported* as one: the
gas line deflates by `cpiNow`, the latest CPI print. Rotating that base forward one
year moves the published history by **0.40 score points on average, 0.56 max,
with 39 of 282 months shifting ≥0.5 point** — enough to flip rounding boundaries.
Those flips land in `data/revisions.json` indistinguishably from genuine upstream
source revisions, and the site tells readers the sources revised.

---

## 1. DATA PROVENANCE MAP

Every series the score depends on. Verified against FRED during this audit.

### 1.1 Weighted intake lines (seven, sum 100)

| # | Line | Weight | Series | Publisher | Transport |
|---|---|---|---|---|---|
| 1 | employment/`jobs` | 24.25 | `UNRATE` + `ICSA` | BLS / DOL-ETA | FRED |
| 2 | `housing` | 19.40 | `MORTGAGE30US` + `DRSFRMACBS` | Freddie Mac / FRB | FRED |
| 3 | `credit` | 19.40 | `DRCCLACBS` | FRB | FRED |
| 4 | `auto` | 14.55 | HHDC "Page 13 Data"/AUTO | FRBNY / Equifax CCP | XLSX scrape |
| 5 | `gas` | 9.70 | `GASREGW` ÷ `CPIAUCNS` | EIA / BLS | FRED |
| 6 | `inflation` | 9.70 | `CPIAUCNS` | BLS | FRED |
| 7 | `financial` | 3.00 | `NFCI` | Chicago Fed | FRED |

---

#### UNRATE — Civilian Unemployment Rate

| Field | Value |
|---|---|
| Source / Series | BLS Current Population Survey · `UNRATE` |
| Frequency | Monthly |
| Release schedule | Employment Situation, ~1st Friday, 08:30 ET |
| Observation period | Calendar month, dated at month start (`2026-07-01`) |
| Latest vintage (audit) | **4.1 (2026-07)**; 2026-06 = 4.2, 2026-05 = 4.3 |
| Revision behavior | Seasonal factors revised annually (Jan); levels effectively final |
| Seasonal adjustment | **SA** |
| Transformation | None |
| Normalization | `interp([[3.5,5],[5,25],[6.5,45],[8,62],[10,78],[15,90],[25,100]], v)` — `collect.js:38` |
| Combined as | `jobs = max(unrateStress, claimsStress)` — `collect.js:108` |
| Stale rule | `monthly` → 75d (`collect.js:60`) |
| Displayed | `4.1%` — **matches FRED exactly** |
| Failure behavior | throw → workflow fails → prior snapshot stays live |

#### ICSA — Initial Claims

| Field | Value |
|---|---|
| Source / Series | DOL ETA · `ICSA` |
| Frequency | Weekly (Sat week-ending) |
| Release schedule | Thursdays 08:30 ET |
| Latest vintage | 209,000 (w/e 2026-08-08) |
| Revision behavior | Prior week revised every release; annual seasonal re-estimation restates **years** of history |
| Seasonal adjustment | **SA** |
| Transformation | Trailing mean of the last four weekly obs falling in/before each month — `methodology.js:200` |
| Normalization | `claimsK` anchors on `value/1000` — `collect.js:39` |
| Displayed (secondary) | `199000` — **matches** my independent 4-week mean of (189k, 198k, 200k, 209k) = 199,000 exactly |
| Historical peak (current vintage) | **6,137,000** (w/e 2020-04-04) |

> ⚠ `trailingFourWeekByMonth` keys each window by `ordered[index].date.slice(0,7)`.
> Months with 5 ICSA weeks get the window silently overwritten 5×, keeping only
> the last. That is the documented intent ("latest four weekly observations
> available at each month end") and matches the collector's own display path, so
> it is consistent — but it means the monthly claims value is a **window ending on
> the last week that lands in the month**, not a month average. Correctly
> disclosed at `backtest.js:186`.

#### CPIAUCNS — CPI-U, All Items

| Field | Value |
|---|---|
| Source / Series | BLS · `CPIAUCNS` |
| Frequency | Monthly |
| Release schedule | ~mid-month, 08:30 ET, for the prior month |
| Latest vintage | **333.918 (2026-07)**; 2025-07 = 323.048 |
| Revision behavior | **NSA index is never revised.** (The SA companion `CPIAUCSL` is.) |
| Seasonal adjustment | **NSA — deliberately, and correctly** |
| Transformation A | Same-month YoY % — `methodology.js:224` |
| Transformation B | Deflator for gas: `gas × cpiNow / cpi[m]` — `collect.js:113` |
| Displayed | `3.4%` · my computation: **3.3648%** → `toFixed(1)` = `3.4`. **Correct.** |

#### MORTGAGE30US — Freddie Mac PMMS 30-yr

| Field | Value |
|---|---|
| Frequency | Weekly (Thursday) · **NSA** |
| Latest vintage | 6.67 (2026-08-13) |
| Transformation | Calendar-month mean via `fred.js:39` for scoring; raw last obs for display |
| Normalization | `mortgageRate` anchors; `housing = max(rateStress, delinqStress)` |
| July-2026 month mean | **6.542** → stress 44.27 → **44** ✓ |

#### DRSFRMACBS / DRCCLACBS — FRB delinquency at commercial banks

| Field | Value |
|---|---|
| Frequency | **Quarterly**, dated quarter start · **SA** |
| Release schedule | ~8 weeks after quarter end |
| Latest vintage | Both `2026-01-01` (Q1 2026). DRSFRMACBS = **1.89**, DRCCLACBS = **2.92** |
| Transformation | `ffill()` quarter → months (`collect.js:67`) — **from observation quarter, not release date** |
| Displayed | foreclosures `1.9%` ✓ · credit `2.9%` ✓ |
| Credit stress check | `interp(cardDelinq, 2.92)` = 30 + 20×0.42 = **38.4 → 38** ✓ |
| Stale rule | `quarterly` → 250d. Current age **225d**. 25 days of headroom. |

#### NY Fed HHDC — AUTO 30+ transition flow

| Field | Value |
|---|---|
| Source | FRBNY Consumer Credit Panel / Equifax, `HHD_C_Report_2026Q2.xlsx`, sheet **"Page 13 Data"**, column header literal `AUTO` |
| Transport | **Not FRED.** iframe scrape → `<a href>` regex → XLSX → `unzip -p` → hand-rolled XML regex parse (`methodology.js:74-181`) |
| Frequency | Quarterly, label `26:Q2` → `2026-04` |
| Latest vintage | 7.9% (2026-04-01 = Q2 2026), age **135d** |
| Normalization | `AUTO_30_PLUS_ANCHORS` — shared import, single definition ✓ |
| Failure behavior | Every step throws on shape change; **fail-closed, good** |
| Fragility | Highest-risk acquisition path in the system: 4 chained undocumented shape assumptions on a third-party spreadsheet, protecting 14.55% of the score |

#### NFCI — Chicago Fed National Financial Conditions Index

| Field | Value |
|---|---|
| Frequency | Weekly (Wednesday-dated), released Wednesdays |
| Latest vintage | −0.549 (2026-08-07) |
| Revision behavior | **Entire history re-estimated every week.** Tolerance 0.02/month declared and monitored (`integrity.js:18,71-92`) |
| Transformation | Calendar-month mean |
| Displayed | `-0.55` — this is the **August partial-month mean of a single observation** |
| July month mean | **−0.5362** → stress 10.46 → **10** ✓ |

### 1.2 Auxiliary lines (weight 0, `contributesToOoze:false`)

- **`INDPRO`** — FRB Industrial Production, monthly, SA, revised for ~4 months + annual. Latest 2026-06 = 102.6395. YoY vs 2025-06 (101.4785) = **1.1441%** → displayed `1.1% YoY` ✓
- **`AMTMNO`** — Census M3 manufacturers' new orders, monthly, SA, heavily revised. Secondary display only.
- **`DRSFRMACBS`** — reused as `foreclosures`, correctly labeled a proxy.

### 1.3 Derived / cached artifacts (the divergence surface)

| Artifact | Written by | Refresh cadence | Read by |
|---|---|---|---|
| `data/latest.json` / `.js` | `collect.js:268-269` | **daily** | site, all gates |
| `data/history.json` | `collect.js:270` | **daily** | rss, story, integrity, narrative-check, build-market-divergence, sync-fallback |
| `data/vintages/<fp>.json` | `collect.js:295` | on fingerprint change | `integrity.js` NFCI baseline |
| `data/revisions.json` | `integrity.js:61` | on ≥1pt past-month move | `story.js`, `narrative-check.js`, tests |
| `lab.js` `HISTORY` | `sync-fallback-history.js` | **daily** | offline fallback, `compile-reports.js` |
| `index.html`, `market.html` | `stamp.js` | **daily** | readers |
| `data/editorial.json`, `data/auto-articles.js` | `story.js` | **daily** | readers |
| `feed.xml` | `rss.js` | **daily** | subscribers |
| `research/backtest-results.json` | `backtest.js` | ⚠ **manual only** | **`backfill-reports.js`** |
| `research/history-array.txt` | `backtest.js` | ⚠ **manual only** | paste target |
| `data/reconstruction-reports.js` | `backfill-reports.js` | ⚠ **manual only** | **readers** (`article.html`, `oozeonomics.html`) |
| `research/market-backtest.json` | `backtest-market.js` | ⚠ **manual dispatch** | `build-market-divergence.js`, `backfill-reports.js` |
| `data/market-history.json` | `build-market-divergence.js` | **daily** (mixed inputs) | `narrative-check.js`, market page |
| `data/market.json` | `collect-market.js` | ⚠ **manual dispatch** | `stamp.js` → `market.html` |

**`scripts/backtest.js` is not in `.github/workflows/collect.yml`.** CI runs it only
inside `tests/backtest.integration.test.js`, which redirects output to a temp dir
via `OOZEMETER_BACKTEST_OUTPUT` and then *asserts the repo copy is untouched*
(`tests/backtest.integration.test.js:158`). The repo artifact is structurally
guaranteed to go stale.

---

## 2. THE D-10 CLASS: EVERY PLACE A VALUE LIVES TWICE

Complete enumeration, ranked by whether it can reach a reader.

| # | Duplicated value | Locations | Reconciled by | Status |
|---|---|---|---|---|
| 1 | **Household score inside Ward M archive prose** | `backfill-reports.js:230,247` ← `research/backtest-results.json`, vs `data/history.json` | **nothing** | 🔴 **OPEN — D-10 repeat** |
| 2 | Market score vs household score vintage in `market-history.json` | `build-market-divergence.js:19-21` | `market-integrity.js` only under `--require-current-evidence`, which the daily cron never passes | 🔴 **OPEN** |
| 3 | Household score in `recon-ooze-*` | same generator | `narrative-check.js:122-138` | 🟢 gated (post-D-10 fix) |
| 4 | Calibration `{a,b}` | `methodology.js:27` → `collect.js:30`, `backtest.js:132`; cached in `latest.json`, `vintages/*`, `backtest-results.json` | single import + `backtest.integration.test.js:155` | 🟢 fixed by construction |
| 5 | **7 anchor curves** | `collect.js:37-47` **and** `backtest.js:37-49` — separate literals | `backtest.integration.test.js:155` (282-month deepEqual, daily) | 🟡 verified identical today; rule is a comment (`collect.js:100` "keep in sync"), gate is indirect |
| 6 | Largest-remainder apportionment | `collect.js:129-135` **and** `backfill-reports.js:74-84` | comment only (`backfill-reports.js:13`) | 🟡 |
| 7 | Piecewise interpolation | `methodology.js:38`, `backfill-reports.js:172` (re-sorts input), `market-series.js` | none | 🟡 |
| 8 | Band thresholds `[20,40,60,80,100]` | `lab.js:28`, `lab.js:261` `levelOf`, `rss.js:24`, `story.js:20`, `backfill-reports.js:30`, `weekly-brief.js:20`, `weekly-edition.js:5`, `integrity.js:46` | none | 🟡 **7 copies** |
| 9 | Weights | `methodology.js:11-19` (canonical), `lab.js:155-159`, `lab.js:38-134` per-indicator `weight:` | `release-gate.js:107-113` regex | 🟢 gated |
| 10 | `HISTORY` array | `data/history.json` ↔ `lab.js:165` | `sync-fallback-history.js` daily + `release-gate.js:123` prefix compare | 🟢 |
| 11 | Episode peaks | `lab.js:183-186` `INCIDENTS[].peak` | `release-gate.js:134-142` | 🟢 gated |
| 12 | Score in `index.html`/`market.html` static HTML | `stamp.js` | `stamp.js:105` fails if >3 markers missing | 🟢 |

`compile-reports.js:33` compares `lab.js HISTORY.length` against
`data/history.json.length` — **length only, not values.** A same-length value drift
passes. (Currently moot: `sync-fallback-history.js` rewrites the array daily.)

---

## 3. FINDINGS

### F-1 · CRITICAL — Ward M archive reports republish the household jar score from a manually-refreshed artifact, ungated

`scripts/backfill-reports.js:230` and `:247` embed the household score in
reader-visible Ward M prose:

```js
const levels = `Ward ${m.score}/100, household jar ${hhm.ooze}/100 — a ${Math.abs(gap)}-point gap, …`;
```

`hhm` comes from `hhByMonth` (`backfill-reports.js:55`), built from
`research/backtest-results.json` — the exact artifact that went stale in D-10.
The gate written in response filters it out:

```js
// scripts/narrative-check.js:126
const recon=(rc.window.RECON_ARTICLES||[]).filter(a=>/^recon-ooze-/.test(a.slug));
```

`narrative-check.js` reports `11 archive reconstructions` checked. There are **23**
`RECON_ARTICLES`; the 12 `recon-ward-*` are skipped. They are reader-visible
(`article.html:31`, `oozeonomics.html:48`, `static-pages.js:23`) and carry the
household number in the body **and** the divergence figure in `keyPoints[2]`.

Currently clean (I verified all 12 against `data/history.json` — 0 mismatches),
because `backtest.js` was run manually ~6 minutes before `collect.js` on 2026-08-14.
That is the same "currently clean" state D-10 was in before it drifted for 13 days.

**Recommendation:** drop the `^recon-ooze-` filter — scan `^recon-` and match the
`household jar (\d+)/100` / `Divergence vs the household jar: ([+-]?\d+)` patterns
against `data/history.json` too.

---

### F-2 · CRITICAL — `data/market-history.json` is a daily cross-vintage join stamped with the wrong vintage

`scripts/build-market-divergence.js` runs **every day** in `collect.yml`:

```js
:16 const marketPath   = 'research/market-backtest.json'   // manual dispatch only
:17 const householdPath = 'data/history.json'              // rewritten daily
:24 const payload = { generated: market.generated, … }     // MARKET timestamp
```

Observed right now:

| Field | Value | Actual vintage |
|---|---|---|
| `market-history.json.generated` | `2026-08-01T23:35:18Z` | market side only |
| `market` column | from `research/market-backtest.json` | 2026-08-01 |
| `household` column | from `data/history.json` | **2026-08-14** |
| `divergence` | `market − household` | **subtracts across 13 days of vintages** |

`market-integrity.js` has the correct check — `inspectCurrentMarketEvidence`
(`lib/market-integrity.js:143-176`) verifies `history.generated === backtest.generated`
and re-derives the alignment — but it is gated behind `--require-current-evidence`,
which **only `market.yml` passes**. The daily household cron calls bare
`node scripts/market-integrity.js`, which runs `inspectMarketRelease` only. That
path checks `row.divergence === row.market - row.household` (`:128`) — internally
consistent, vintage-blind.

Ward M's published divergence is the flagship claim of the whole market wing
("+11 points, the ward reading hotter"). Half of that subtraction moves daily; the
other half is frozen until a human clicks dispatch.

**Recommendation:** either record both vintages
(`generated: {market, household}`) and fail when the skew exceeds a stated window,
or stop recomputing divergence in the daily cron and let it move only when both
sides move.

---

### F-3 · MAJOR — Gas deflator base rotation silently restates the entire published history, and is logged to readers as a source revision

`collect.js:98,113` / `backtest.js:92,113`:

```js
const cpiNow = S.CPIAUCNS.last.value;              // 333.918 today
gas: interp(ANCHORS.gasReal, gas * cpiNow / cpi)   // every historical month
```

Every month, a new CPI print advances `cpiNow` and **all 282 historical months'
real gas prices rise together**. I measured this by holding all other inputs fixed
and rotating only the base:

| `cpiNow` base | mean \|score impact\| | max | months shifting ≥0.5 pt |
|---|---|---|---|
| 2026-06 (1 mo back) | 0.001 pt | 0.002 | 0 / 282 |
| 2025-07 (1 yr back) | **0.395 pt** | **0.559** | **39 / 282** |
| 2024-07 (2 yr back) | 0.715 pt | 0.997 | 257 / 282 |

Because scores are `Math.round()`ed, a year of base rotation flips roughly 39
months across a boundary — from the deflator alone, with no upstream revision.

`integrity.js:36-64` catches those flips and appends them to `data/revisions.json`
with a `detected` timestamp and no `type` field. `story.js:97` then tells readers:

```
"${sourceRevisionRuns} source-revision event(s) on the public record"
```

Some of those events are not source revisions. They are the instrument re-indexing
itself. **CLAIM TYPE: SUPPORTED-EXPLANATION** — I isolated the channel and measured it.

This is not an argument for more machinery. It is an argument for one of:
(a) freeze the deflator base with the calibration (a fixed base year is the standard
choice and makes the gas series reproducible forever), or (b) keep it and label the
revision entries so readers are not told the sources moved when the ruler did.

Note the asymmetry this creates with the frozen calibration: D-10's fix froze `{a,b}`
precisely so "a revision to the calmest month in 2021 cannot silently change the
published score for June 2009." `cpiNow` reintroduces exactly that coupling through
a different door — one CPI print moves all 282 months.

---

### F-4 · MAJOR — Every weekly line displays an observation from a different period than the stress, delta, and contribution printed beside it

`collect.js:187-194` attaches month-`M` values to freshest-observation displays:

```js
l.stress = Math.round(stM[k]);   // computed for M = 2026-07
l.delta  = deltas[k];            // 2026-07 vs 2026-06
l.asOf   = <freshest weekly obs> // 2026-08-xx
```

| Line | Displayed value | `asOf` | Stress computed from |
|---|---|---|---|
| `gas` | `$4.01` | 2026-08-10 | July mean **$3.9323** → 58 |
| `housing` | `6.67%` | **2026-08-13** | July mean **6.542%** → 44 |
| `financial` | `-0.55` | 2026-08-07 | July mean **−0.5362** → 10 |

lab.js:215 renders this as one string:

```
$4.01 · ▼ −3 pts vs June · as of 2026-08-10
```

A reader reads: *gas is $4.01 as of Aug 10 and that is 3 points lower than June.*
Neither half of that is what the number means. The −3 is July-vs-June; $4.01 is an
August observation that has not entered any score. Had housing's stress been
computed from its own displayed 6.67%, it would read **46**, not 44.

The cadence doctrine at `collect.js:3-8` deliberately chose per-line freshness — a
defensible product decision. The defect is that the *stress/delta/contribution*
travel with the value as if they described it. **CLAIM TYPE: SUPPORTED-EXPLANATION**
(verified numerically against FRED).

**Recommendation (no new data, less UI):** print the score-month's own observation
next to the score-month's stress, and show the fresher weekly print as a clearly
separate "since sealing" figure — or drop the fresher print. One period per row.

---

### F-5 · MAJOR — `lab.js` carries three "Today's …" prose numbers that no gate updates

`lab.js:205-218` overwrites `x.val` from `LIVE_DATA` but **never touches `vs2008`,
`why`, or `faqs`.** Those are static prose with baked current-day figures:

| Line | `lab.js` prose | FRED today | Δ |
|---|---|---|---|
| `jobs:90` | "Today's **4.4%** is historically low" | UNRATE 2026-07 = **4.1** | −0.3 pt (known defect) |
| `gas:42` | "Today's **$3.42** is elevated" | GASREGW = **$4.01** | **−$0.59, 17% low** |
| `credit:66` | "Today's **3.2%** delinquency" | DRCCLACBS = **2.9%** | +0.3 pt |

Only the jobs one is documented. Gas and credit are **new instances of the same
class**, and gas is the largest error on the site: it understates the pump price by
59 cents in a sentence whose whole rhetorical job is comparing today to 2008.

`narrative-check.js` scans `articles.js` + `auto-articles.js` + `recon-ooze-*` only.
`lab.js` INDICATORS prose is scanned by nothing.

---

### F-6 · MAJOR — Timeline event cites an unrevised 2020 claims figure that exists in no current FRED vintage

`lab.js:175`:

```js
[2020.3,'MAR–APR 2020 — 22M jobs lost; 6.87M claims in one week; unemployment 14.8%.'],
```

Current `ICSA` vintage, weeks around the peak:

```
2020-03-21  2,914,000
2020-03-28  5,946,000
2020-04-04  6,137,000   ← all-time maximum
2020-04-11  4,869,000
```

**6.87M appears nowhere.** It is the April-2020 published figure for w/e 2020-03-28,
before BLS/ETA seasonal-factor re-estimation revised it to 5,946,000. This is
textbook revised-vs-unrevised mixing on a reader surface: the site's own history
array is built from current-vintage ICSA, and this caption is not.

Verified correct in the same line: unemployment 14.8% (UNRATE 2020-04 = 14.8 ✓).
Verified correct at `lab.js:174`: "OCT 2009 — Unemployment peaks at 10.0%"
(UNRATE 2009-10 = 10.0 ✓).

---

### F-7 · MODERATE — The archive window end is a hardcoded date literal, now one month behind the published jar

`scripts/backfill-reports.js:46`:

```js
const END = '2026-06';
```

The published month is **2026-07**. `research/backtest-results.json` contains
2026-07 (I confirmed: range `2003-01 .. 2026-07`). The archive stops at June.
There is no `recon-ooze-2026-07`. The reader-facing archive silently trails the jar
by one month and will trail by N months for as long as nobody edits this literal —
with no warning, because a missing article is indistinguishable from a declared
"archive gap" (`backfill-reports.js:88` returns `null` for both).

---

### F-8 · MODERATE — The auto-article **title** bakes a raw score literal past the token gate

`scripts/story.js:125`:

```js
title:`The ${d.monthLabel} Ooze Report: ${d.ooze}/100`,
```

Current `data/auto-articles.js` title: `The July 2026 Ooze Report: 26/100`.

D-10's second fix routed body/dek scores through a single `{{s:…}}` `SCORE` token
(`story.js:70`) precisely because "the article persists, so a later revision would
strand a hardcoded 26 in a sentence." The **title** was not converted, and
`narrative-check.js:69`'s `CLAIM` regex has no pattern matching `Report: 26/100` —
it looks for `scored|reads|sealed at|drained…to|…`, none of which appear. The
title passes the gate that exists to catch exactly this.

Impact is currently bounded because `story.js` regenerates the single article daily.
It becomes real the moment article history accumulates or the cron pauses mid-month.

---

### F-9 · MODERATE — Credit and auto lines are a full quarter apart and the staleness rule cannot see it

Both are "quarterly" lines presented side by side in the same jar:

| Line | Series | Observation quarter | Age | Stale threshold |
|---|---|---|---|---|
| `credit` | `DRCCLACBS` | **Q1 2026** (2026-01-01) | 225 d | 250 d |
| `auto` | NY Fed HHDC | **Q2 2026** (2026-04-01) | 135 d | 250 d |
| `foreclosures` | `DRSFRMACBS` | Q1 2026 | 225 d | 250 d |

The score for month 2026-07 forward-fills a **January-dated** card-delinquency
observation and an **April-dated** auto observation. That is correct per the
declared method (`ffill` from observation quarter) and FRED genuinely has no newer
DRCCLACBS — this is not a collector bug. But 19.40% of the score currently rests on
an observation period that ended six months before the month being scored, and the
freshness indicator reads `"freshnessStatus":"current"` with `"staleLines":[]`
because a single 250-day threshold cannot distinguish "on schedule" from
"two quarters behind its sibling."

`STALE_DAYS.quarterly = 250` gives the credit line **25 days of headroom** before it
would flip to `degraded`. One delayed FRB release and the site's freshness badge
changes state on a line that has been six months old all along.

---

### F-10 · MODERATE — `research/data-source-registry.json` documents v2 weights

`research/data-source-registry.json` (`reviewed: 2026-07-25`) records
`"weight": 10` for gas and `"weight": 20` for housing — the **methodology v2**
weights. Live v3 weights are 9.70 and 19.40. The registry is the document that
exists to be the provenance record; it is describing a methodology the site retired.
No gate reads it.

---

### F-11 · MINOR — `financial` displays a one-observation "calendar-month mean"

`collect.js:174` displays `S.NFCI.monthly[nfciMonth]` where `nfciMonth` is the
**latest** obs month. For 2026-08 that is a mean over a single observation
(−0.549), labeled `transform: 'calendar-month mean'` and `cadence: 'weekly'`.
Value is arithmetically correct; the label overstates what was averaged.

---

### F-12 · NOT-A-PROBLEM — CPIAUCNS (NSA) mixed with SA series: checked, and it is the right call

I was asked specifically whether SA/NSA mixing matters. It does not, and the design
is better than the alternative:

- **`inflation`** uses NSA with a **same-month YoY** transform. Same-month YoY
  cancels the seasonal factor by construction. Using `CPIAUCSL` (SA) here would be
  *worse*, because SA factors are revised annually and would drag five years of
  history around; `CPIAUCNS` is **never revised**. This is the correct choice and
  it is disclosed (`collect.js:173`, `backtest.js:192`).
- **`gas`** deflates NSA gasoline by NSA CPI. Both carry seasonality, so the ratio
  retains a residual seasonal term. I sized it: CPI's NSA/SA gap runs ~0.4% over a
  year; at the `gasReal` anchor slope (25 stress pts per $1) on ~$4 gas that is
  ~0.4 stress points → ×9.70% weight ×1.4187 = **~0.06 score points**. Below the
  rounding grain. Not worth fixing.
- Mixing SA (`UNRATE`, `ICSA`, `DRCCLACBS`, `INDPRO`, `NFCI`) with NSA
  (`CPIAUCNS`, `MORTGAGE30US`, `GASREGW`) across *different* lines is not an error —
  each line is normalized independently through its own anchor curve before any
  addition. There is no cross-series arithmetic that would require a common basis,
  except the gas deflator, sized above.

**The real problem in this area is not SA/NSA. It is `cpiNow` (F-3).**

---

### F-13 · NOT-A-PROBLEM — things I tried to break and could not

Reported as prominently as the failures, because the audit brief asked for it:

- **All seven line stresses reproduce exactly** from raw FRED CSVs in an
  independent Python implementation: jobs 13, inflation 30, housing 44, credit 38,
  gas 58, financial 10 (auto 47 confirmed via anchor arithmetic on the displayed 7.9).
- **`collect.js` and `backtest.js` anchor tables are byte-identical** across all
  7 duplicated curves (mechanically diffed).
- **`research/backtest-results.json` currently agrees with `data/history.json` on
  all 282 months** (0 differing).
- **All 12 `recon-ward` household figures currently match** `data/history.json`
  (0 mismatches) — the F-1 hole is open, not currently leaking.
- **`lab.js HISTORY` matches `data/history.json`** (282 months, synced).
- **`narrative-check.js` passes** (21 articles + 11 reconstructions).
- **No silent fallback on FRED failure.** `fred.js:84-93`: API failure warns and
  falls to CSV; CSV enforces `header === 'observation_date,<ID>'` (`fred.js:49`).
  I confirmed FRED serves a bot-block HTML page for some series — that page fails
  the header check and throws. No stale-cache path exists; `collect.js:77` reads the
  previous snapshot **only** to compute `updateStatus`, never to substitute values.
- **`fred.js:28` rejects non-increasing observation dates** — duplicate/reordered
  rows cannot slip through.
- **Numeric parsing is strictly regex-validated** in both `fred.js:10` and
  `methodology.js:30`; `"."` and `""` are skipped, not coerced to 0.
- **Writes are atomic** (`collect.js:68-73`, tmp + rename).
- **Rounding is honest.** Contributions use largest-remainder and are asserted to
  sum to the headline (`collect.js:301`); `backfill-reports.js:82` throws on drift.
- **The gates that exist, fail closed.** `integrity.js`, `narrative-check.js`,
  `release-gate.js` all `exit 1`; `collect.yml` commits only after they pass, so a
  failure leaves the prior specimen live.

---

## 4. THE EMPLOYMENT BLIND SPOT — current magnitude (documented defect, quantified only)

Not re-reported as new per the brief. Recording the live magnitude because it is
the largest single accuracy exposure and it is **actively firing right now**:

| Series | 2025-07 | 2026-07 | Direction |
|---|---|---|---|
| `UNRATE` (the only level input) | 4.2 | **4.1** | ↓ *jar reads improvement* |
| `PAYEMS` | — | 158,858 (from 158,881 in June) | **↓ −23k m/m** |
| `CIVPART` | 62.2 | **61.4** | **↓ −0.8 pt in 12 months** |

Unemployment fell while payrolls fell and 0.8 points of participation left the
labor force. `jobs = max(interp(UNRATE), interp(ICSA/1000))` cannot see either.
The employment line printed **stress 13, delta −1** — its calmest posture — in a
month when the two series it does not read both deteriorated. This is the mechanism
described in `research/EMPLOYMENT-SIGNAL-DECISION-2026-08-11.md`, and the current
data is a live instance, not a hypothetical.

Related: `lab.css` `.down{color:var(--green)}` (documented) would paint a falling
participation rate green.

---

## 5. GAPS — QUESTIONS THIS INSTRUMENT CANNOT CURRENTLY ANSWER

1. **What was the score in real time?** Every historical month uses current-revised
   inputs and observation-quarter alignment. Disclosed at `backtest.js:201-206`, but
   it means no claim about early detection ("the score climbed a month earlier in
   2007") can be evidence — it is hindsight arithmetic.
2. **Which revisions were the sources and which were the ruler?**
   `data/revisions.json` records both in one undifferentiated stream (F-3).
3. **How much of the 282-month history is deflator-base drift?** Measurable, not measured.
4. **Is the NY Fed XLSX shape still what we think?** Four chained undocumented
   assumptions protecting 14.55% of the score, verified only by "it threw or it didn't."
5. **Has any line's anchor curve been validated out-of-sample?** Calibration pins two
   points (calm→10, GFC→90). The seven curves between them are asserted.
6. **What does the ward's divergence mean when its two halves are different ages?** (F-2)
7. **Is a 250-day quarterly staleness threshold right, or just non-firing?** It has
   never fired; 25 days of headroom on `credit` right now.
8. **What happens if `backtest.js` is never run again?** No alarm exists. The archive
   simply drifts, and only 11 of 23 articles would notice.
9. **Does anything verify `data/market.json` (manual, 2026-08-11) against
   `data/market-history.json` (daily, mixed)?** `stamp.js:98` writes market.html
   from the former; `narrative-check.js:58` validates tokens against the latter.
10. **Is `research/data-source-registry.json` meant to be authoritative?** It is
    stale, unread by any gate, and disagrees with live weights (F-10).
11. **Why 4-week trailing ICSA rather than the official 4-week MA (`IC4WSA`)?**
    Undocumented choice; the collector recomputes what FRED publishes.
12. **What is the intended lifetime of a `data/vintages/*.json` manifest?** Policy
    string says `retain-all-unique-schema-v3-manifests`; 7 files exist across two
    schema shapes with no reconciliation of the older ones.

---

## 6. RECOMMENDATIONS, RANKED — AND WHAT NOT TO BUILD

**Do (each removes a failure mode; none adds a data source):**

1. **F-1** — change `^recon-ooze-` to `^recon-` in `narrative-check.js:126` and add
   the household-jar/divergence patterns. ~5 lines. Closes the open D-10 repeat.
2. **F-2** — record both vintages in `market-history.json` and fail on skew, or stop
   recomputing divergence daily. Removes the only surface that silently subtracts
   across vintages.
3. **F-5, F-6** — correct or delete three stale prose numbers in `lab.js`
   (`$3.42`, `4.4%`, `3.2%`, `6.87M`). Prose that quotes a current number should
   carry a token or no number.
4. **F-3** — freeze the gas deflator base alongside the calibration. A fixed base
   makes the gas line reproducible forever and removes a whole category of phantom
   "revisions" from the public record.
5. **F-4** — one observation period per row.
6. **F-7** — derive `END` from `data/history.json` instead of the literal `'2026-06'`.
7. **F-8** — route the auto-article title through the `SCORE` token.

**Do not build:**

- No new indicators. F-13 shows the seven lines are computed correctly; the
  accuracy gap is the employment *specification* (already decided) and the vintage
  plumbing — neither is fixed by adding series.
- No generalized "vintage reconciliation framework." Three specific joins are wrong
  (F-1, F-2, F-7); fix those three.
- Do not consolidate the seven band-threshold copies or the two apportionment copies
  (#6, #7, #8 in §2) unless they actually diverge. They are identical today, they are
  three lines each, and a shared module buys less than the churn costs. **The
  duplicates that matter are the ones that cross a vintage boundary** — those are
  F-1 and F-2, and they are not solved by deduplication.
- Do not raise `STALE_DAYS.quarterly`. If `credit` trips at 250 days, that is the
  threshold working.

---

*Read-only audit. No production file was modified. Every FRED figure above was
fetched during this audit and is cited with its series ID; every code claim is
cited `file:line`.*
