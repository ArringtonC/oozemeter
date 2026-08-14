# ENGINEERING RELIABILITY REPORT — OOZEMeter

**Agent 8 — Engineering & Reliability Auditor**
**Date:** 2026-08-14 · **Branch:** main · **Node:** v22.23.1
**Scope:** read-only. No production code was modified.

---

## 0. Verdict

The pipeline is materially better engineered than its size suggests. Parsers fail
closed, provenance is fingerprinted, the release gate is genuinely adversarial, and
`tests/backtest.integration.test.js` runs the collector *and* the backtest live and
asserts they publish byte-identical monthly history — that is a real defence against
the exact drift that burned this repo before.

But the failure mode the project is organised to prevent is currently happening in
three places at once:

1. **The public Atom feed is shipping an unresolved template token to readers right
   now.** `feed.xml:29` contains the literal string `{{s:2026-07}}` where the July
   score should be. The gate built to catch exactly this (`narrative-check.js`) does
   not read the file that produced it.
2. **Ward M's frozen calibration exists twice, and the two copies already disagree.**
   `collect-market.js:42` carries a 5-significant-figure truncation of
   `FROZEN_WARD_CALIBRATION`. The market integrity gate cannot detect this because it
   recomputes the score using the calibration embedded in the payload it is checking.
3. **Three indicator pages state a current value in prose that contradicts the live
   number printed 30 pixels above it.** Only one of the three (jobs) was previously
   documented.

Underneath that, the single canonical calculation the doctrine demands does not exist.
The scoring anchors live in two files, the interpolation kernel in five, the band
table in seven, and the token resolver in three — with the three resolvers already
handling different token grammars.

**Test suite state: 31 files, 174 tests, 174 pass, 0 fail** (run individually, per
instruction). No test is currently red. Seven test files are never executed by any
workflow.

---

## 1. PRIMARY TASK — Everything calculated in more than one place

Verified by reading both/all copies. "Divergent" means the copies **already** produce
different answers for some input, not that they might one day.

### D1 · Household stress-anchor table — 2 copies, in sync today

| Copy | Location |
|---|---|
| A | `scripts/collect.js:37-47` |
| B | `scripts/backtest.js:37-49` |

Byte-identical after whitespace/comment normalisation (verified programmatically).
Only two of the nine curves (`auto30Plus`, `financialConditions`) are imported from
`scripts/lib/methodology.js`; the other seven are copy-paste.

**Canonical:** `scripts/lib/methodology.js` — export `HOUSEHOLD_V3_ANCHORS`.
Both scripts already import from that file; there is no reason for the split.

### D2 · Per-month stress computation — 2 copies

| Copy | Location |
|---|---|
| A | `scripts/collect.js:101-116` (`stressesFor`) |
| B | `scripts/backtest.js:106-115` (inline `stresses`) |

Same seven expressions, and the source comment at `collect.js:100` says out loud
*"same math as backtest.js — keep in sync"*. The two disagree on the key name for the
employment line: `jobs` (collect) vs `employment` (backtest), which is why
`collect.js:49-57` needs a second weight table just to remap `METHODOLOGY_V3_WEIGHTS`.

**Canonical:** one exported `householdStresses({un,icsa,cpi,inflationYoY,mort,mdel,cdel,auto30,gas,cpiNow,nfci})`
in `methodology.js`, returning one agreed key set.

### D3 · Quarterly forward-fill — 2 copies

`scripts/collect.js:67` · `scripts/backtest.js:59-63`. Identical.
**Canonical:** `methodology.js`.

### D4 · Piecewise-linear interpolation — 5 implementations, semantically divergent

| # | Location | Behaviour |
|---|---|---|
| 1 | `scripts/lib/methodology.js:38-49` `interpolateAnchors` | throws on non-finite; **no monotonicity check** |
| 2 | `scripts/lib/methodology.js:212-222` `auto30PlusStress` | the same loop re-written against one fixed table, *inside the canonical module* |
| 3 | `scripts/lib/market-series.js:39-56` `interpolateAnchors` | validates finite pairs **and** strict monotonicity |
| 4 | `scripts/lib/market-integrity.js:32-42` `interpolate` | no validation at all |
| 5 | `scripts/backfill-reports.js:172-178` `interp` | sorts anchors; **divides by zero silently** on duplicate x |

Copies 1, 4, 5 return a wrong number rather than throwing when handed a bad anchor
table. Copy 5 returns `NaN`, which then propagates into an archive report as `NaN`.

**Canonical:** `market-series.js`'s validating version, imported by all five call
sites. Delete `auto30PlusStress` in favour of `interpolateAnchors(AUTO_30_PLUS_ANCHORS, v)`.

### D5 · Ward M frozen calibration — 2 copies, **ALREADY DIVERGENT** 🔴

| Copy | Location | Value |
|---|---|---|
| A | `scripts/collect-market.js:42` | `{a: 1.4025, b: -7.0116}` |
| B | `scripts/lib/market-backtest.js:3-9` | `{a: 1.402462618842267, b: -7.011551886296619}` |

Copy A is the truncation that gets written into `data/market.json` and published.
Measured: the two constants produce **different rounded scores on 11 distinct raw
values** across `[0,100]` at 0.01 resolution — e.g. raw `34.59` → 41 (frozen) vs 42
(published constant); raw `70.24` → 91 vs 92. No currently published month lands on
one of those values, so nothing is wrong on screen today. Nothing prevents next
month's from landing there.

`scripts/lib/market-integrity.js:72` recomputes the score as
`market.calibration.a * raw + market.calibration.b` — **using the calibration embedded
in the file it is auditing**. The gate is self-referential and structurally incapable
of detecting this divergence.

**Canonical:** `FROZEN_WARD_CALIBRATION` in `scripts/lib/market-backtest.js`.
`collect-market.js` must import it; `market-integrity.js` must compare
`market.calibration` against the imported constant *before* recomputing.

### D6 · Ward M gauge anchor tables — 3 copies

| Copy | Location |
|---|---|
| A | `scripts/collect-market.js:55,60,65,70,75` (per-sensor) + `:79` (`BREADTH_ANCHORS`) |
| B | `scripts/backtest-market.js:44-51` (`A`) |
| C | `scripts/lib/market-integrity.js:15` (`BREADTH_ANCHORS`) |

`backtest-market.js:43` carries the comment *"anchors — single source of truth mirrored
in collect-market.js"*, which is a contradiction in terms. Copy C is a deliberate
independent re-derivation for the gate (see §1-good) and may stay; A and B must not
both exist.

**Canonical:** new `scripts/lib/market-anchors.js`.

### D7 · Band table (score → SMOOTH / STICKY / …) — 7 copies

| # | Location | Form |
|---|---|---|
| 1 | `lab.js:28-34` | `BANDS`, UPPERCASE, carries tier + emoji |
| 2 | `lab.js:261` | `levelOf` — same four thresholds again, as a ternary chain |
| 3 | `scripts/stamp.js:10` | `BANDS`, UPPERCASE |
| 4 | `scripts/stamp.js:11` | `TIERS`, separate 6-row threshold table |
| 5 | `scripts/story.js:20` | Title Case |
| 6 | `scripts/rss.js:24` | Title Case |
| 7 | `scripts/lib/weekly-edition.js:5` | Title Case |
| 8 | `scripts/integrity.js:47` | `band()` returning 1-5 |

Eight if you count `lab.js:330` `setFacility`, which uses a *fourth* threshold set
(80/90/95) for the alarm state. The 20/40/60/80 boundary appears in the repo more times
than the score does.

**Canonical:** `scripts/lib/bands.js` exporting `{bandName, bandLevel, tier}`, and
`collect.js` should emit the resolved band into `data/latest.json` so the browser reads
it rather than recomputing.

### D8 · Canonical-Truth token resolver — 3 copies, **ALREADY DIVERGENT** 🔴

| Copy | Location | Token grammar handled |
|---|---|---|
| A | `lab.js:235-249` `resolveClaims` | `s`, `peak`, `market-current`, `market`, `revision-old` — substitutes, never verifies |
| B | `scripts/narrative-check.js:39-66` `resolve` | all five — **verifies** each against its canonical JSON |
| C | `scripts/rss.js:15-20` `resolve` | **`s` and `peak` only** |

The repo's documented history says `resolveClaims` was duplicated in `lab.js` and
`narrative-check.js`. That duplication was never removed, and a third copy has since
been added in `rss.js` with a smaller grammar. `articles.js` currently contains three
`{{market:…}}` and two `{{revision-old:…}}` tokens (`grep -o '{{[a-z-]*:' articles.js`).
Any of those appearing in a `title` or `dek` would be emitted raw into `feed.xml` by
copy C. Today none are in a title/dek — `june-2026-seal` and `ooze-report-2026-08-04`
use `{{s:}}`, `vibecession-measured` uses `{{peak:}}` — so this is loaded and unfired.

The `{{s:2026-07}}` currently *in* `feed.xml` comes from a different hole (see F1).

**Canonical:** `scripts/lib/claims.js` exporting `resolve(text, sources)` and
`assertNoTokens(text, where)`. Generate the browser copy from it at build time, or have
`collect.js` write the resolved strings into `data/editorial.json` so `lab.js` never
needs a resolver at all.

### D9 · Fractional-year month key `(y + (m-1)/12).toFixed(3)` — 5 copies

`lab.js:238` · `scripts/narrative-check.js:31` · `scripts/rss.js:14` ·
`scripts/collect.js:253` · `scripts/backtest.js:212`

The **inverse** function already lives canonically and tested in
`scripts/lib/market-divergence.js:1-10` (`fractionalYearToMonth`). The forward direction
belongs in the same module.

### D10 · Verdict sentence ("Calmer than N of every 10 months since 2003") — 2 copies

`scripts/story.js:37-40` · `scripts/stamp.js:74-77`.
`stamp.js` prefers `editorial.json` and falls back to its own copy, so a corrupt
editorial file silently swaps one implementation for the other.

### D11 · "Top-3 pressure sources" share line — 2 copies

`scripts/stamp.js:19-21` (bakes it into static HTML, using a `NAMES` map at `stamp.js:12`
that **omits** `financial`, `foreclosures`, `manufacturing` and falls back to the raw
slug) · `index.html:310-314` (recomputes at runtime from `INDICATORS`). Tie-breaks differ
(object insertion order vs array order). Today both produce
`Housing 7 oz · Credit Cards 6 oz · Auto Loans 5 oz`.

### D12 · FRED CSV parsing — 2 independent parsers

`scripts/lib/fred.js:45-56` `parseFredCsv` (also enforces strictly-increasing dates,
handles the `.` sentinel, supports the keyed JSON API) ·
`scripts/lib/market-series.js:7-37` `parseFredMonthly` (no date-order check).
Two teams' worth of validation on the same wire format.

**Canonical:** `fred.js`. Ward M should call `fetchFredSeries()` and take `.monthly`.

### D13 · `articles.js` evaluation — 2 copies with different substitution

`scripts/story.js:150` `eval(src.replace('window.','w3.'))` — **non-global** replace
`scripts/narrative-check.js:105` `eval(src.replace(/window\./g,'w.'))` — global

`articles.js` contains four occurrences of `window.`; three are inside prose strings, so
today the non-global version happens to hit the assignment first and works (verified).
Add one article whose prose mentions "window." above line 6 and `story.js` silently
loses the hand-written-report override (`story.js:152` `catch{}`) while
`narrative-check.js` keeps working.

---

### Duplication that should STAY (report it as a success, not a defect)

`scripts/lib/market-integrity.js:92` and `:101` independently re-derive the Sector Watch
state rule (`-2` / `-7`) and the overall-state rule that `collect-sectors.js:44,67`
computes. `market-integrity.js:15` likewise re-derives the breadth anchors. These are
**intentional independent re-implementations inside a gate**: if the collector's
arithmetic changes, the gate fails loudly. That is the correct use of a second copy and
must not be "deduplicated" away. The distinction is: a gate may re-derive; a *publisher*
may not.

---

## 2. Fails-invisibly defects — placeholders rendered as measurements

Ranked by how convincingly wrong the output is.

### F1 🔴 `feed.xml` is publishing a raw template token to subscribers **right now**

```
feed.xml:29
<summary>The July 2026 Ooze Level sealed at {{s:2026-07}} out of 100 — Sticky
territory, down 1 from June 2026. …</summary>
```

Chain: `story.js:88` builds `summary` with `SCORE = '{{s:2026-07}}'` → `story.js:176`
folds it into `rssSummary` → `story.js:182` writes it to `data/editorial.json` →
`rss.js:32` uses `EDITORIAL?.rssSummary` **without passing it through `resolve()`**
(contrast `rss.js:36`, which does resolve article titles and deks).

`data/editorial.json` currently holds unresolved tokens in **four** fields:
`summary` (1), `story` (2), `newsletter` (2), `rssSummary` (1).
`editorial.newsletter` is the email body.

Why nothing caught it:
- `narrative-check.js:108-113` scans `articles.js` + `auto-articles.js` + recon reports.
  **It never opens `data/editorial.json` or `feed.xml`.**
- `release-gate.js:61` checks only that `editorial.newsletter` *contains* the string
  `26/100` — which `story.js:158` supplies as a separate hardcoded line — so the gate
  passes while the body below it still says `{{s:2026-07}}`.

The correct guard already exists in this repo, at `scripts/compile-reports.js:113-117`:

```js
const leaked = out.match(/\{\{[^}]+\}\}/g);
if (leaked) { console.error(`unresolved canonical-truth tokens would reach a reader: …`); process.exit(1); }
```

It is applied to exactly one markdown file. Hoist it into `lib/claims.js` and run it
over `feed.xml`, `data/editorial.json`, `index.html` and every generated page.

### F2 🔴 Three indicator pages contradict their own live reading, in prose, on the same screen

`indicator.html:66` renders the live `x.val`; `indicator.html:92` renders the frozen
`x.vs2008` prose 26 lines below it.

| Page | Live value (verified vs FRED) | Prose claim | Location |
|---|---|---|---|
| `/gas/` | **$4.01** (`GASREGW` 2026-08-10 = 4.006) | "Today's **$3.42** is elevated but nowhere near…" | `lab.js:42` |
| `/credit/` | **2.9%** (`DRCCLACBS` 2026-01 = 2.92) | "Today's **3.2%** delinquency is a fraction of that" | `lab.js:66` |
| `/jobs/` | **4.1%** (`UNRATE` 2026-07 = 4.1) | "Today's **4.4%** is historically low" | `lab.js:90` |

Only the jobs case was previously documented. Gas is off by **17%**, credit by 10%.
The LIVE patch loop at `lab.js:207-218` updates `val`, `contrib`, `stress`, `dir`,
`trend` and `source` — it does not touch `why`, `vs2008` or `faqs`, and nothing in
`release-gate.js` or `narrative-check.js` inspects them. These are hand-written
sentences that read as measurements and drift silently forever.

Same class, unfired: `lab.js:38,50,62,74,86,98,110` `val:` placeholders. They are
overwritten when `LIVE_DATA` is present and blanked to `—` when it is not, so they are
currently safe — but they are three lines away from being rendered.

### F3 🟠 `stamp.js` tolerates up to three failed stampings and still exits 0

`scripts/stamp.js:24-27` warns and increments `missing`; `scripts/stamp.js:105` exits 1
only `if (missing > 3)`. Thirteen markers are stamped (`stamp.js:29-53`). Any three of
them can silently retain the **previous month's score** in the static HTML that
crawlers, link previews and no-JS renders consume, while the JS shows the new one.

`release-gate.js:68-69` re-checks only two of the thirteen: `id="heroScore"` and the
**month** in `<title>` — not the score inside the title. So
`<title>OOZEMeter — Ooze Level 27/100 (Sticky) · July 2026</title>` with a stale 27 and
a live 26 passes the release gate.

The threshold should be `missing > 0`, and `release-gate.js` should assert the score in
every stamped marker, not two of them.

### F4 🟠 `index.html` claims "Integrity gate: PASS · fails closed" as a hardcoded string

`scripts/stamp.js:44`:
```js
sub(/id="plcSealed">[^<]*</,`id="plcSealed">Integrity gate: PASS · fails closed<`,'placard integrity');
```
This is a literal, not a reading. Nothing in `stamp.js` consults an integrity result.
In the CI workflow `integrity.js` runs first and its exit 1 aborts the step (GitHub
Actions `run:` blocks use `bash -e`), so the sequencing is currently correct. But a
human running `node scripts/stamp.js` alone — or a future workflow reordering — publishes
a page asserting a gate passed that never ran. A placard that says PASS should be
written from a gate artifact (`integrity.js` should emit `data/gate.json`), not from a
string literal.

### F5 🟠 `integrity.js` reports PASS for checks it silently skipped

```js
scripts/integrity.js:31  try{prevHistory=JSON.parse(execSync('git show HEAD:data/history.json',…))}catch{}
scripts/integrity.js:32  try{prevLatest=JSON.parse(execSync('git show HEAD:data/latest.json',…))}catch{}
```

If either fails — git unavailable, path renamed, corrupt JSON, first commit — then:
- the entire **revision detector** (lines 33-65) no-ops,
- the **30-point headline jump cap** (`integrity.js:133`, guarded by `if(prevLatest&&…)`)
  is disabled,
- and line 143 prints `integrity gate: PASS`.

A skipped check and a passed check produce the same console output and the same exit
code. Either should be a hard failure, or the PASS line must enumerate which checks ran.

### F6 🟠 `story.js` can silently destroy the auto-article archive

```js
scripts/story.js:190-196
let autos=[];
try{ … eval(fs.readFileSync('data/auto-articles.js','utf8')…); autos=w.AUTO_ARTICLES||[] }catch{}
autos=autos.filter(a=>a.slug!==article.slug);
if(!handCovered)autos.push(article);
fs.writeFileSync('data/auto-articles.js','window.AUTO_ARTICLES='+JSON.stringify(autos)+';');
```

Any read/parse error on `data/auto-articles.js` leaves `autos` as `[]` and the file is
then **overwritten with a single article**, deleting every prior monthly report. The
downstream gates would not notice: `narrative-check.js:143` only checks that
`editorial.articleSlug` resolves to *an* article, and it resolves to the survivor.
Only one auto-article exists today (`ooze-report-2026-07`), so the blast radius is
currently one month and grows monthly. Same silent-catch pattern at `story.js:152`,
which on failure lets OOZEBOT publish over a hand-written report.

### F7 🟠 `states.html` renders 50 fabricated scores in the real instrument's chrome

`lab.js:190-201` — comment reads `/* demo state stress scores */`. Rendered by
`states.html:56-71` into a podium and a ranking table with `bandOf()` band names and
`tierOf()` classifications identical in every visual respect to the live jar. It is
disclosed once, in body copy at `states.html:31`.

It is **not** disclosed in the page `<title>`, the `<meta name="description">`, or the
Open Graph tags (`states.html:7,8,16,17`), which read *"Which U.S. state is under the
most economic stress today?"*. A shared link therefore presents fabricated rankings as a
measurement, and the numbers are static and undated — California has read 74 since the
file was written. There is no automated test that `STATES` is labelled anywhere.

### F8 🟠 `personal.html` returns `50` as a division-by-zero guard

```js
personal.html:85   if(!income)return 50;
```
Entering `0` for income (the field is `required` and `min="0"`, so `0` submits) produces
exactly `50 / 100`, rendered with the same jar, band name, tier and **Copy My Report**
button as a real reading. `personal.html:107` copies
`🧬 MY PERSONAL OOZE: 50/100 — SLIPPERY` to the clipboard with no caveat.

Separately, 20 of the 100 points come from `stateScore` (`personal.html:89`), i.e. from
the fabricated `STATES` table — disclosed in the intro copy, absent from the copied
report text.

### F9 🟡 Offline mode paints every sensor green

`lab.js:227` sets `x.dir='down'` for **all** indicators when `LIVE_DATA` is absent, and
`lab.css:490` renders `.ind-meta .down{color:var(--green)}`. The offline indicator page
therefore shows `—` with a green "sensor offline" trend. Green is the site's
everything-is-fine colour. An outage should not be rendered in the reassurance colour;
offline needs its own neutral class.

(The documented `.down = green` concern at `lab.css:115` and `:490` is *correct* for the
lines that exist today, because `dir` is derived from **stress** delta at `lab.js:214`
— falling stress genuinely is good news. It becomes wrong the moment a payrolls or
participation line is added, where falling is bad. Worth fixing pre-emptively by naming
the classes `relieving`/`worsening` rather than `down`/`up`.)

### F10 🟡 Collector self-checks cannot fail

```js
scripts/collect.js:301  console.assert(Object.values(contrib).reduce((a,b)=>a+b,0)===ooze,…);
scripts/collect.js:302  console.assert(ooze>=0&&ooze<=100,'score out of range');
```
`console.assert` in Node prints to stderr and **returns**. Neither check can stop a
publish. The range check is redundantly covered by `integrity.js:130`; the contribution
reconciliation is covered only by `tests/collector.integration.test.js`, which runs
against whatever the network returns that day. Same pattern at `lab.js:593-595`, where
three invariants are asserted in a browser console nobody reads.

### F11 🟡 Ward M's live breadth gauge uses a different transform than the one it was calibrated on

Disclosed honestly at `backtest-market.js:137` and enforced as a required disclosure
string at `market-integrity.js:119` — credit where due. But the substance stands: the
frozen calibration was derived from breadth computed as *successive monthly closes,
>2% / >7% thresholds, 11 tickers* (`backtest-market.js:71-86`), while the published
gauge is computed from *22-session daily intervals* (`market-sector.js:53`,
`collect-sectors.js:44`). One sixth of the Ward M composite is fed by a transform the
calibration has never seen. Classify as **PLAUSIBLE-MECHANISM** for divergence, not
demonstrated error — but it should be measured, not just disclosed.

---

## 3. Test suite assessment

### Current state (verified, run per-file)

```
31 files · 174 tests · 174 pass · 0 fail
```

Strongest work in the repo, and it should be said plainly: `fred.test.js` (9),
`market-integrity.test.js` (11), `release-gate.test.js` (10), `methodology.test.js` (11)
and `market-output.test.js` (7) are adversarial — they assert the code *refuses*
malformed input, not that it accepts good input. `tests/market-output.test.js` even
tests rollback on a second rename failure. `tests/backtest.integration.test.js:8` is the
single most valuable test in the repo: it runs `backtest.js` and `collect.js` live and
asserts `results.monthly.map(r=>r.ooze)` deep-equals `history.map(r=>r[1])`.

### Coverage holes

**7 of 31 test files are never run by any workflow.** Union of
`.github/workflows/collect.yml:25` and `.github/workflows/market.yml:24` omits:
`market-gauges`, `weekly-brief`, `weekly-deliver`, `weekly-edition`,
`weekly-email-message`, `weekly-package`, `weekly-recipients` — 32 tests, including the
entire email-delivery refusal ladder.

**No test executes browser code.** Everything touching `lab.js` (`public-labels.test.js`,
`release-gate.test.js`) is a **regex over the source text**. `tests/public-labels.test.js`
"public chrome distinguishes current, degraded, stale, and offline feeds" asserts
`assert.match(lab, /function feedState\(data,now=Date\.now\(\)\)/)` — it never calls
`feedState`. The four feed states, `levelOf`, `bandOf`, `tierOf`, `scoreAt`,
`resolveClaims` and `personalOoze` have zero behavioural coverage.

### Specific tests needed

**Known historical months (golden master)** — the highest-value missing test.
A frozen fixture of the ten source series for, say, `2009-06`, `2020-04`, `2021-12`,
`2026-07`, run through `householdStresses` + calibration, asserting the exact published
score and the exact per-line stresses. Today the only history check is
`backtest.integration` which needs the network and 60s; a fixture-driven golden master
runs in milliseconds and pins the numbers a source revision must not quietly move.
Assert `2009-06 → 90` and `2003-01 → 44` specifically, since those are the calibration
pegs and appear in published prose.

**Boundary values** — for every anchor table, assert stress at each anchor x exactly,
at x±ε, below the first anchor, above the last, and at the interior knots. Nine
household curves × ~7 anchors ≈ 130 assertions, all cheap. Currently only
`auto30Plus` and `financialConditions` have any anchor test
(`methodology.test.js` #111, #119). Also assert `interpolateAnchors` **throws** on a
non-monotonic table — copies 1, 4 and 5 in D4 currently do not.

**Missing data** — `stressesFor` must return `null` when any of the ten inputs is
null (`collect.js:106`), and the month must be excluded from `complete`. Assert that a
gap in the middle of the series produces a *gap*, not a forward-filled score. There is
a page-level test for this (`public-labels` #82 "archive renders missing months as
gaps") but none at the computation level.

**Stale data** — `STALE_DAYS = {weekly:21, monthly:75, quarterly:250}`
(`collect.js:60`). Assert: at exactly 21 days a weekly line is not stale; at 22 it is;
that `staleLines` and `freshnessStatus:'degraded'` are set together; that `feedState`
returns `'stale'` at generated+48h+1ms and `'current'` at +48h−1ms
(`lab.js:10-16`). Assert a stale line still publishes its value rather than blanking.

**Revised data** — `integrity.js` revision detection is tested (#26, #27) but only for
the *logging* path. Missing: assert that when `git show HEAD:data/history.json`
**fails**, the gate exits non-zero rather than printing PASS (F5). Assert the NFCI
0.02 tolerance boundary at exactly 0.02 and 0.0201. Assert an auto-article title whose
baked literal disagrees with revised history is rejected — `narrative-check.js:122-137`
does this for recon reports but not for `story.js:125`, which bakes
`${d.ooze}/100` into the title as a literal.

**Extreme values** — feed the collector a COVID-scale week (`ICSA` 6.87M),
`UNRATE` 14.8, `inflationYoY` −5, `NFCI` 3.0, and assert the score clamps to `[0,100]`,
that no anchor extrapolates past its endpoint, and that the 30-point jump cap
(`integrity.js:133`) fires. Also the degenerate cases: `CPI` = 0 (division at
`collect.js:113` `gas*cpiNow/cpi`), `previousValue` = 0 in `yearOverYear`
(`methodology.js:228` — handled, untested).

**API failure** — `fred.test.js` covers malformed payloads well. Missing: FRED returns
200 with an empty body; FRED returns HTML (an error page) with a 200; the keyed API
succeeds for 8 of 10 series and 503s on the 9th; NY Fed serves a valid `.xlsx` whose
`Page 13 Data` sheet has been renamed; `unzip` is absent from `PATH`. Every one of these
must produce a non-zero exit, never a partial `latest.json`.

**Conflicting signals** — the employment line is `max(UNRATE, ICSA)` (`collect.js:108`).
Assert both branches win under the right inputs, and assert the published `jobs.value`
is the UNRATE display value even when the claims branch is what set the stress — the
current payload shows `jobs.value = "4.1%"` with `stress = 13`, and a reader cannot tell
which input produced 13. Add a `drivenBy` field and test it.

**Offline mode** — load `lab.js` in `jsdom` (or refactor its pure functions into a
requireable module) with `window.LIVE_DATA` undefined and assert: score renders `—`
not `0`; `FEED_LABEL === 'OFFLINE'`; every indicator shows `—`; **no indicator carries
the green class** (F9); the copy-report text says SENSORS OFFLINE.

**Auxiliary signals** — well covered at the payload level (#79, #83, `collector.integration`).
Missing: assert `contrib === 0` and `scoreWeight === 0` for `foreclosures` and
`manufacturing` *and* that removing them from `data/latest.json` does not change `ooze`
— i.e. prove non-contribution rather than asserting the label.

**Score invariants** — none of these exist today:
- `Σ contrib === ooze` exactly (currently only `console.assert` at `collect.js:301`);
- every `contrib >= 0`;
- the largest-remainder distribution (`collect.js:129-135`) is deterministic under
  reordering and gives the extra point to the largest fractional part, ties broken by
  declaration index;
- `0 <= ooze <= 100` for 10,000 randomised stress vectors;
- monotonicity: raising any single line's stress never lowers `ooze`;
- `ooze` is a pure function of the seven stresses — same stresses in, same score out,
  independent of collection date.

**Duplicate-consistency gates (until the duplicates are removed)**
- `assert.deepEqual(collectAnchors, backtestAnchors)` (D1);
- `assert.deepEqual(collectMarketCAL, FROZEN_WARD_CALIBRATION)` (D5) — this one
  **fails today** and would have caught the truncation;
- `assert.deepEqual(collectMarketAnchors, backtestMarketAnchors)` (D6);
- one band table imported by all seven consumers, asserted once (D7);
- `assertNoTokens()` over `feed.xml`, `data/editorial.json`, `index.html` and every
  generated page (D8/F1) — **fails today**.

**Prose-vs-data gate** — extract every `Today's <value>` / `Today's $<value>` from
`lab.js` `vs2008` and `why` strings and assert it matches `data/latest.json`'s value for
that slug, or that the sentence is date-qualified. **Fails today, three times** (F2).

---

## 4. Other observations

**Data ingestion.** `fetchWithRetry` (`lib/fetch.js`) is correct: bounded attempts,
exponential backoff, a sane retryable-status set, a 45s `AbortSignal.timeout`, and it
rethrows on the final attempt. `fred.js:75-89` prefers the keyed API and falls back to
the documented CSV transport, warning without leaking the key. Good.

**Scheduled jobs.** `collect.yml` pins actions to 40-char SHAs, serialises on a
`concurrency` group shared with `market.yml`, opens/updates exactly one failure issue
and closes it on recovery. `market.yml` is manual-only pending quote rights, and
cryptographically attests `research/market-backtest.json` before deriving evidence from
it — genuinely unusual rigour. One note: `collect.yml:46` uses
`git add … data/ …` — a directory add. It is scoped, but given the documented 2026-08-02
PII incident, an explicit file list would be safer.

**Cached / historical data.** `lab.js:165` `HISTORY` fallback and `data/history.json`
are **in sync** — 282 rows, zero differences (verified programmatically).
`sync-fallback-history.js` runs in CI before the release gate and is tested. This is the
duplication story done right: a generator, a gate, and a test.

**Performance / mobile.** `index.html` loads seven render-blocking scripts
(`data/latest.js`, `data/editorial.js`, `data/market.js`, `data/sectors.js`,
`articles.js` 68 KB, `data/auto-articles.js`, `lab.js` 44 KB) plus `lab.css` 52 KB plus
three Google Fonts requests — ~180 KB of blocking JS before first paint, on a page whose
payload is one number. `articles.js` is 38% of that and is needed only for the research
rail below the fold. `defer` on everything except `data/latest.js`, and lazy-loading
`articles.js`, is a free win.

**Accessibility.** `@media(prefers-reduced-motion:reduce)` at `lab.css:612-616` kills all
animation and transition globally — correctly done. 20 responsive breakpoints. But
`index.html` carries only two `aria-label`s, the jar is a `<div>` with a click handler
and no keyboard affordance (`lab.js:310`), and colour is the sole carrier of
up/down meaning in the score popover and indicator meta (`lab.css:114-115`, `489-490`).

**Dead code.** `lab.js` `MOVERS` (147-151, repopulated at 219-225), `bigChart` (336-353),
`adSlot` (508-510), `relTime` (255-260) and nine `spark` arrays (39, 51, 63, 75, 87, 99,
111, 123, 135) are referenced by **no HTML page**. `INCIDENTS` (182-187) is referenced
only by the internal `flowmap.html` — yet `release-gate.js:133-142` spends four
assertions validating its `peak` values against history. Roughly 60 lines of lab.js is
maintained for nobody.

---

## 5. Recommended order of work

1. **Resolve tokens before publication.** Hoist `compile-reports.js:113-117` into
   `lib/claims.js`; run `assertNoTokens()` over `feed.xml` and `data/editorial.json`
   in the workflow. Fixes a live reader-facing defect today. (F1)
2. **Import `FROZEN_WARD_CALIBRATION` in `collect-market.js:42`; assert equality in
   `market-integrity.js`.** One-line change, closes a recurrence of the exact failure
   the repo is scarred by. (D5)
3. **Delete the three stale `Today's …` prose claims, or make them tokens.**
   Add the prose-vs-data gate. (F2)
4. **`stamp.js:105` → `if(missing>0)`; extend `release-gate.js` to check the score in
   every stamped marker.** (F3)
5. **Make `integrity.js:31-32` fail loudly**, and have it emit `data/gate.json` that
   `stamp.js:44` reads instead of asserting PASS from a literal. (F4, F5)
6. **`story.js:191` → fail closed** rather than silently truncating the archive. (F6)
7. **Collapse D1–D4, D7–D9, D12** into `lib/` modules. Add the duplicate-consistency
   tests as the intermediate step, before the refactor, so the refactor is provably
   behaviour-preserving.
8. **Disclose or delete `STATES`.** Either label it in title/meta/OG on `states.html`
   and in the `personal.html` copy text, or remove the pages until regional feeds exist.
   (F7, F8)
9. **Run all 31 test files in CI.** (7 files, 32 tests currently unrun.)
10. **Delete the dead 60 lines of `lab.js`** and the four release-gate assertions
    guarding `INCIDENTS`, which no reader surface renders.

---

*Read-only audit. No production file was modified. All FRED values verified against
`https://fred.stlouisfed.org/graph/fredgraph.csv?id=<SERIES>` on 2026-08-14:
`UNRATE` 2026-07 = 4.1 · `GASREGW` 2026-08-10 = 4.006 · `DRCCLACBS` 2026-01 = 2.92 ·
`PAYEMS` 2026-06→07 = 158881 → 158858 · `CIVPART` 2026-04→07 = 61.8 → 61.4.*
