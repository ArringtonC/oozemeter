# OOZEMeter dependency graph

**Branch** `claim-gate` · **base commit** `82bc452` · **machine-readable twin** `data/dependency-graph.json`
· **traversal library** `scripts/lib/dependency-graph.js` · **proof** `tests/dependency-graph.test.js`

> OOZEMeter may say less, but it may not confidently say more than the evidence supports.

This document maps every public output from raw series to reader surface:
**RAW SERIES → DERIVED SERIES → SENSOR → STRESS VALUE → WEIGHT → CONTRIBUTION → SCORE → BAND → EDITORIAL CLAIM → UI SURFACE.**

It exists because independence has twice been established by reading a name and twice been wrong.
Nothing here is inferred from naming. Every relationship below was read out of
`scripts/collect.js`, `scripts/backtest.js`, `scripts/lib/methodology.js`, `scripts/collect-market.js`,
`scripts/backtest-market.js`, `scripts/collect-sectors.js`, `scripts/lib/*.js`, `scripts/story.js`,
`scripts/stamp.js`, `scripts/integrity.js`, `scripts/narrative-check.js`, `lab.js` and `index.html`,
line by line, and is carried on an edge with a file:line citation.

215 nodes · 398 edges · 112 alias tokens.

---

## 1. How to query it

```js
const {loadGraph, isUpstream, sharedRawSeries, areIndependent} = require('./scripts/lib/dependency-graph');
const graph = loadGraph();

isUpstream(graph, 'raw:fred:DRSFRMACBS', 'sensor:household:housing');   // true  — D1
isUpstream(graph, 'raw:fred:INDPRO',     'sensor:household:jobs');      // false — the legal pair
sharedRawSeries(graph, 'sensor:household:gas', 'sensor:household:inflation'); // ['raw:fred:CPIAUCNS']
```

Three rules for anyone building on this:

1. **Resolve names to node ids before asking anything.** `graph.aliases` maps 112 tokens to nodes.
   `graph.aliasCollisions` lists the tokens where comparing names gives the wrong answer.
2. **Independence is set disjointness, not absence of a direct edge.** Use `upstreamRawSeries(y)`
   and intersect. A direct-edge check would have missed the CPI-in-gas path entirely.
3. **Ask the right question about scored vs published.** Edges carrying `scored: false` reach a
   reader surface but never reach a stress value (AMTMNO is the live example). Pass
   `{scoredOnly: true}` for questions about the score; omit it for questions about published claims.

---

## 2. Raw series

### Household jar — 11 raw inputs

| Series | Publisher | Native cadence | Feeds |
|---|---|---|---|
| `UNRATE` | BLS | monthly | jobs |
| `ICSA` | DOL | weekly | jobs |
| `CPIAUCNS` | BLS | monthly (NSA) | inflation **and gas** |
| `MORTGAGE30US` | Freddie Mac | weekly | housing |
| `DRSFRMACBS` | Federal Reserve Board | quarterly | **housing and foreclosures** |
| `DRCCLACBS` | Federal Reserve Board | quarterly | credit |
| `GASREGW` | EIA | weekly | gas |
| `NFCI` | Chicago Fed | weekly | financial **and Ward M credit** |
| `INDPRO` | Federal Reserve Board | monthly | manufacturing (aux) |
| `AMTMNO` | Census | monthly | manufacturing display only, **not scored** |
| NY Fed HHDC `Page 13 Data / AUTO` | FRBNY | quarterly | auto |

### Ward M — 16 raw inputs

`T10Y3M` · `VIXCLS` · **`NFCI`** · `DCOILWTICO` · `DTWEXBGS` · 11 Yahoo `quote.close` tickers
(SPY QQQ DIA IWM XLF XLI IYT XLY XLP SMH XLV).

**Cross-wing intersection = {`NFCI`}, and only `NFCI`.** Proved by traversal, not by reading the
collector's import list. This is the fact behind `market.html:79` and `scripts/market-pages.js:32`.
It is a claim about *series identity*, not economic orthogonality — see U16.

---

## 3. Derived series — where the hidden dependencies live

Every FRED series is reduced to a **calendar-month arithmetic mean** at `scripts/lib/fred.js:38-41`
(household) or `scripts/lib/market-series.js:29-34` (Ward M). Two parsers, two code paths, one
shared raw series between them.

Then the transforms that matter:

| Derived node | Formula | Where | Why it is easy to miss |
|---|---|---|---|
| `derived:real-price:GAS` | `GASREGW[m] × cpiNow ÷ CPIAUCNS[m]` | `collect.js:113` | **CPI is an input to gas, twice.** `data/latest.json` lists gas's source as GASREGW with no mention of CPI. |
| `derived:latest-observation:CPIAUCNS` (`cpiNow`) | newest CPI observation | `collect.js:98` | **Global.** Every historical gas stress is in *today* dollars, so one new CPI print re-indexes the entire gas line back to 2003. |
| `derived:trailing4wk:ICSA` | mean of 4 weekly obs, keyed to the month of the **last** one | `methodology.js:200-210` | Up to three of the four weeks can belong to the prior calendar month. |
| `derived:claims-4wk-display:ICSA` | mean of the last 4 observations, not month-keyed | `collect.js:144-145` | A **second, different** four-week mean. Both are called "trailing four-week mean". |
| `derived:forward-fill:{DRSFRMACBS, DRCCLACBS, NYFED_AUTO}` | carry the last quarterly observation across every month | `collect.js:67,95-97` | Deltas are **zero by construction** inside a quarter. See U4. |
| `derived:latest-observation:DRSFRMACBS` | newest obs **and its predecessor** | `collect.js:147-149` | The foreclosures line steps over a *quarter* while housing steps over a *month*, from the same series. |
| `derived:yoy:INDPRO` | YoY at **INDPRO's own newest month** | `collect.js:150-155` | Not the headline month. Root cause of the "over the same month" defect, U1. |
| `derived:weakness-share` | `(0.5 × softening + stressed) ÷ 11 × 100` | `collect-market.js:111` | Live uses a 22-session daily interval; the backtest uses successive **monthly** closes. Two transforms, one gauge name. |

---

## 4. Sensor by sensor

### 4.1 Household — the seven weighted lines

| Line | Weight | Inputs (all structurally live, every month) | Combiner |
|---|---|---|---|
| **jobs / employment** | 24.25 | `UNRATE` monthly mean · `ICSA` trailing-4wk | `Math.max` (`collect.js:108`) |
| **housing** | 19.40 | `MORTGAGE30US` monthly mean · **`DRSFRMACBS` forward-filled** | `Math.max` (`collect.js:110`) |
| **credit** | 19.40 | `DRCCLACBS` forward-filled | anchor interp |
| **auto** | 14.55 | NY Fed AUTO forward-filled | anchor interp |
| **gas** | 9.70 | `GASREGW` · **`CPIAUCNS[m]`** · **`cpiNow`** | anchor interp on the deflated price |
| **inflation** | 9.70 | `CPIAUCNS` YoY | anchor interp |
| **financial** | 3.00 | `NFCI` monthly mean | anchor interp |

Two lines are a **maximum of two branches**. Both branches are structurally upstream in every month;
only one is the argmax in any given month, and **which one is published nowhere** (U2). In the live
payload the mortgage-rate branch drives housing (6.67% → ≈46 stress against 1.9% delinquency → 23)
and the unemployment branch drives jobs. Either can flip without any surface changing.

### 4.2 Household — the two auxiliary lines (weight 0)

- **foreclosures** ← `DRSFRMACBS` newest observation. *Same raw series as housing's second branch.*
- **manufacturing** ← `INDPRO` YoY. `AMTMNO` is published as `secondary` and carries **no** weight
  in the stress value.

Both are scored at **their own newest month**, never at the headline month M, and never enter
`stressesFor(m)`. They have no history inside `data/history.json`.

### 4.3 Ward M — six equally weighted gauges

`rates` ← T10Y3M · `volatility` ← VIXCLS · **`credit` ← NFCI** · `energy` ← DCOILWTICO ·
`dollar` ← DTWEXBGS YoY · `breadth` ← Sector Watch weakness share ← 11 ticker states ← 11 Yahoo close series.

---

## 5. Weight → contribution → score → band

```
stressₖ ─┐
weightₖ ─┼→ wsum = Σ wⱼ·stressⱼ ─→ composite = wsum/100 ─→ ooze = round(clamp(a·composite + b))
         │        (all seven)                                   a,b = CALIBRATION_V3, FROZEN
         └→ contribₖ = floor(ooze · wₖstressₖ / wsum), largest-remainder to foot exactly to ooze
                                        ▲
                          every other weighted line enters here
```

**The normalizer is a coupling.** `contribₖ` depends on all seven lines. "Employment was the largest
source of financial pressure — 2 of the month's 26 ounces" reads as a statement about employment; it
is arithmetically a statement about the whole vector. If gas falls, employment's ounce count can rise
while employment does not move.

`ooze → band` (Smooth/Sticky/Slippery/Oozing/Overflowing, `story.js:20`) and
`ooze → tier` (`stamp.js:11`). Ward: `mean of six gauges → raw → calibrate → score → band` reusing
the same BANDS scale (`stamp.js:113`).

`divergence = ward score − household score` over exact shared months
(`lib/market-divergence.js:12-29`) — a **join of two instruments that share `NFCI`**.

---

## 6. Editorial claims and reader surfaces

`scripts/story.js` (OOZEBOT) turns `data/latest.json` into every content surface. The claim nodes:
verdict · summary · story (s1/s2/s3) · per-line sentences · "what a household would notice" ·
confidence · the six cross-check claim nodes · newsletter · rssSummary · social · the monthly article.
`scripts/stamp.js` writes page furniture, the integrity placard and the market furniture.
`scripts/market-pages.js` and `scripts/lib/market-gauge-content.js` write the Ward M gauge pages.

Reader surfaces carrying those claims: `index.html` (hero, ounce bar, four featured cans **with the
cross-check gutter and its screen-reader string**, cross-check section, ledger, placard) ·
`indicator.html` · `article.html` · `feed.xml` · `archive.html` · `market.html` ·
`market/<gauge>/index.html` · `notes.html` · `policies.html` · OG cards · and the four public JSON
payloads `data/latest.json`, `data/editorial.json`, `data/market.json`, `data/market-history.json`.

**The screen-reader string is a first-class node** (`ui:index.html#ccGutter-screenreader`). D2's false
"agrees" survived longest there precisely because a sighted proofreader never sees it.

### The cross-check claim chain, in full

```
delta:household:jobs ────────┐
delta:household:manufacturing┼→ crosscheck rows → state → body → note/run/count
                             │        ▲                    │
claim:crosscheck:pair-legality┘        │                    └→ index.html #crosscheck
   (asserted by a CODE COMMENT,       claim:crosscheck:same-month
    story.js:116-124)                 (asserted by a TEMPLATE STRING, story.js:196)
```

Both preconditions of the published verdict are currently held by prose, not by a program. That is
the gap this graph closes.

---

## 7. Alias collapse — the known attack vector

`graph.aliases` maps 112 tokens. `graph.aliasCollisions` records where name comparison lies:

| Token | Resolves to | Risk |
|---|---|---|
| **`credit`** | `sensor:household:credit` (DRCCLACBS) **and** `sensor:ward:credit` (NFCI) | **HIGH** — one word, two sensors, two series, two wings. A slug-keyed validator silently answers the wrong question. |
| **`Financial Conditions` / `Credit & Funding`** | one series (`NFCI`) under two names in two wings | **HIGH** — name-based independence checking *passes*; series-based checking *fails*. |
| **`housing`** | a `Math.max` of two series, displayed as one | **HIGH** — prose names a two-input maximum while showing one input. |
| **`jobs` / `employment`** | one line, three key spellings (`collect.js` `jobs`; `backtest.js` and `METHODOLOGY_V3_WEIGHTS` `employment`) | MEDIUM — two engines that must stay in sync, mapped only at `collect.js:50`. |
| **`foreclosures`** | `DRSFRMACBS`, which is mortgage **delinquency** | MEDIUM — the slug says foreclosures; `lab.js:120` discloses it, the slug does not. |
| **`manufacturing` / `industry`** | `INDPRO`, in a live household sensor and a **parked Ward M sensor** (`collect-market.js:15`) | MEDIUM — un-parking it creates a second cross-wing shared series and falsifies "the only input the two instruments have in common". |
| **`shipments`** | `AMTMNO`, which is new **orders** | MEDIUM — collector variable names only, today. |
| **`gas` / `energy`** | GASREGW and DCOILWTICO — different series, adjacent names | LOW — no graph edge; the relationship is causal, not computational. |

---

## 8. HIDDEN CIRCULAR RELATIONSHIPS

Full records with paths and file:line citations in `data/dependency-graph.json →
hiddenCircularRelationships`.

| # | Severity | Relationship | State |
|---|---|---|---|
| **C1** | CRITICAL | **housing ↔ foreclosures via `DRSFRMACBS`** — D1 itself | **Structurally intact.** Only the `CC_PAIRS` entry was removed (`story.js:124`). The prohibition survives as a comment no program reads. One line re-publishes it. The two ends do not even read the same vintage: housing scores the forward-filled value at M, foreclosures scores the newest raw observation — same series, two vintages, two time steps. |
| **C2** | CRITICAL | **gas ↔ inflation via `CPIAUCNS`** | **Latent.** Gas is CPI-deflated *and* rebased to `cpiNow`. Invisible in every public artifact. `story.js:84-85` already groups gas and inflation as "the two lines everyone feels first" — presentational today, one edit from an independence claim. |
| **C3** | MAJOR | **every weighted line ↔ every other line's ounces** via the `wsum` normalizer | **Live and published.** Any ranking or cross-check keyed on contributions inherits all seven lines' dependencies. |
| **C4** | MAJOR | **Ward M `credit` ↔ household `financial` via `NFCI`** | **Disclosed and gated** (`lib/release-gate.js:150-157`) — but by string-matching the word NFCI in four files, not by traversal. A *second* shared series would not trip it, and the parked `industry INDPRO` sensor is exactly that. Also: two derived nodes over one raw node, from two parsers, never compared. |
| **C5** | MAJOR | **divergence series ← both instruments, `NFCI` upstream of both** | **Latent disclosure gap.** The divergence note discloses vintage and breadth-transform basis and says nothing about the shared series. The shared component is small but it is the component that moves in a funding crisis — the episodes the chart narrates. |
| **C6** | MAJOR | **`cpiNow` → whole gas history → revision log → confidence claim** | **Live.** `integrity.js:50-54` already names it ("the instrument re-indexing itself") and types the record honestly. The confidence sentence then *counts* those records. A monthly deflator rebase can inflate a public integrity statistic. |
| **C7** | MODERATE | **calibration invariant checks the ruler against the two marks the ruler was built from** | **Live.** `CALIBRATION_V3` was *defined* to send rawCalm→10 and rawGfc→90; `integrity.js:104-110` then verifies history reads 10 and 90 there. A real drift detector, not independent verification — and `OOZEMETER_RECALIBRATE=1` closes the loop for real. |
| **C8** | MODERATE | **Ward M energy ↔ household gas** — economic parent and child, no graph edge | Series-level disjointness is the only independence traversal can prove. Crude is a principal input to the retail pump price; the repo says so out loud in two places. |
| **C9** | MODERATE | **OOZEMAXING breadth flag ↔ band** — both read the same seven stresses | "Slippery, and six of seven lines above 60" is one fact stated twice, not two facts agreeing. |
| **C10** | MINOR | **jobs is internally a max of two labour-market series** | Not circular (BLS stock vs DOL flow). Recorded because the sensor's identity changes month to month and nothing says which branch spoke. |

---

## 9. CURRENTLY UNVERIFIABLE RELATIONSHIPS

Full records in `data/dependency-graph.json → currentlyUnverifiableRelationships`.

| # | Severity | What cannot be verified | Machine-checkable? |
|---|---|---|---|
| **U1** | **CRITICAL** | **"Over the same month"** (`story.js:196,201`). `delta:jobs` steps 2026-06→2026-07; `delta:manufacturing` steps 2026-05→2026-06, because manufacturing is scored at INDPRO's own newest month. From the graph plus the live payload this is not merely unverifiable — **it is false right now.** Same class as D2. Call it **D3**. | yes — publish the month pair per line and require identical pairs |
| **U2** | MAJOR | Which branch of `Math.max` drove jobs and housing. No `driver` field anywhere. | yes |
| **U3** | MAJOR | Display value vs stress value are different months, different aggregations, sometimes a partial month (financial). The delta cannot be reproduced from the payload — contradicting the module's own promise at `story.js:110-111`. | yes |
| **U4** | MAJOR | **Flat-month semantics.** Forward-filled lines print "was flat this month" when the truth is "no new observation". `line.updateStatus` already carries the distinguishing fact and the prose does not read it. *In scope per the run brief.* | yes |
| **U5** | MODERATE | "All source feeds current at collection" published about a feed whose newest observation is 226 days old (quarterly threshold is 250). Defensible; the word "current" is not. | yes |
| **U6** | MODERATE | The claims "month" can be three-quarters a different month; and the displayed four-week mean is a different number from the scored one, both called the same thing. | yes |
| **U7** | MODERATE | Ward M breadth has two non-identical transforms behind one name; no artifact records which produced which point. | yes |
| **U8** | MODERATE | The breadth delta (−37, the largest number on the ward page) is computed against whatever `data/market.json` was on disk at the last manual run. No retained receipt. | yes |
| **U9** | MODERATE | The auto line publishes a **flow** ("previously current balance entering 30+") under the words "auto-loan delinquency". | yes |
| **U10** | MODERATE | The confidence sentence asserts the integrity gate ran, as a string literal — `story.js` never opens `data/gate-status.json`. Exactly the class `stamp.js:18-32` already fixed for the placard. | yes |
| **U11** | MODERATE | "This is the first edition to publish these checks; the run starts here" — a literal with no counter. It has already published more than once. | yes |
| **U12** | MODERATE | Client-side token resolution silently falls back to `lab.js`'s frozen HISTORY when `data/latest.js` fails to load, while the hero score is stamped statically. Invisible to CI. | partially |
| **U13** | MODERATE | `data/editorial.json` is exempt from the reader-surface token scan (`narrative-check.js:209`) and is a public URL. The exemption is an assumption about every third-party consumer. | no |
| **U14** | MODERATE | **Cross-check pair legality is a code comment** (`story.js:116-124`). Nothing reads collect.js, nothing traverses, nothing fails. This is the gap the graph exists to close. | yes |
| **U15** | MODERATE | Nothing asserts `CALIBRATION_V3` reproduces from its own published `rawCalm`/`rawGfc`. It does; no test says so. Ward M does better and carries both inline — after a truncated second copy of the ward calibration published a different rounded score on 10 raw values until 2026-08-14. | yes |
| **U16** | MODERATE | "The only input the two instruments have in common" is true at *series identity* and now provable. It cannot be strengthened toward economic independence: T10Y3M and MORTGAGE30US both track the rate cycle, DCOILWTICO feeds GASREGW, XLF is an equity read on the banking system NFCI measures. | series-identity half only |
| **U17** | MINOR | Two engines, two key spellings for one line (`jobs` / `employment`), with duplicated `Math.max`/`interp` source held in sync by a comment. | yes |
| **U18** | MINOR | `AMTMNO` is called "shipments" in the collector. No public surface prints it today; a previous edition already published that error once. | yes |
| **U19** | MINOR | Auxiliary lines are scored at their own months, have no history in `data/history.json`, and cannot be backtested against the score without new work. Root cause of U1. | yes |

---

## 10. Cross-check pair legality, computed

**Rule.** A cross-check between weighted line *L* and comparison sensor *C* is legal only if
**(a)** *C* carries zero score weight, **(b)** `upstreamRawSeries(L) ∩ upstreamRawSeries(C) = ∅`,
and **(c)** `delta(L)` and `delta(C)` are computed over the **same month pair**.

| Weighted line | Legal by (a)+(b) | Illegal by (b) |
|---|---|---|
| jobs | foreclosures, manufacturing | — |
| **housing** | manufacturing | **foreclosures — D1** |
| credit | foreclosures, manufacturing | — |
| auto | foreclosures, manufacturing | — |
| gas | foreclosures, manufacturing | — |
| inflation | foreclosures, manufacturing | — |
| financial | foreclosures, manufacturing | — |

**No currently published pair satisfies condition (c).** `jobs:manufacturing` — the one live check —
fails it: manufacturing's delta steps over INDPRO's own newest month pair, jobs' delta steps over the
headline month pair. Condition (c) does not exist in code at all today.

Legality by disjointness is **necessary, not sufficient**. C8 is the counter-example: two disjoint
series can still be parent and child economically, and traversal will happily bless the pair.

---

## 11. What falls out automatically (the regression proof)

`tests/dependency-graph.test.js`, 11 tests, all passing:

- **D1 reproduces.** `raw:fred:DRSFRMACBS → derived:monthly-mean:DRSFRMACBS →
  derived:forward-fill:DRSFRMACBS → sensor:household:housing`. Housing and foreclosures share exactly
  `['raw:fred:DRSFRMACBS']`; `areIndependent` is `false`.
- **The jobs/manufacturing pair is legal.** `isUpstream(INDPRO, jobs) === false`;
  `upstreamRawSeries(jobs) === {UNRATE, ICSA}`; the pair is independent.
- Gas depends transitively on CPI, so gas and inflation are not independent.
- Name collisions do not survive traversal: household `credit` and ward `credit` are independent;
  household `financial` and ward `credit` share `NFCI`.
- The two instruments share exactly one raw series.
- No equity ticker is upstream of the Ooze Score (backs `lab.js:110`).
- `AMTMNO` reaches the manufacturing claim but not the manufacturing stress value.
- Contribution normalization couples every weighted line to every other.
- All 15 declared assertions in `graph.assertions` hold.

Existing gates re-run individually and unchanged: `workflow`, `release-gate`, `narrative-check`,
`integrity`, `market-integrity`, `public-labels` — all PASS. Nothing was loosened.
