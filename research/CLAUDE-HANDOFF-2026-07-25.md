# OOZEMeter Research and `/teach` Handoff

**Prepared:** 2026-07-25  
**Project:** `/Users/arringtoncopeland/Desktop/Projects/oozemeter`  
**Branch:** `main`  
**Audience:** Claude/Opus or another implementation agent

## Executive summary

This session converted OOZEMeter's eight intake lines into a researched, teachable, and reproducible source system. It produced eight interactive `/teach` lessons, three detailed primary-source dossiers, a machine-readable acquisition registry, a visual data map, shared lesson assets, and flowmap tasks.

The research improves the website's methodological foundation but does **not yet change the live Ooze calculation**. Four implementation gaps were discovered and added to `tasks.js`: replace the broad auto-loan proxy, resolve claims smoothing, freeze CPI adjustment basis, and reconcile public source/proxy labels.

## User intent and constraints

- OOZEMeter is a **website**, not an app.
- Work is restricted to `/Users/arringtoncopeland/Desktop/Projects/oozemeter`.
- Research work belongs under `research/`.
- Each of the eight intake areas needs a Matt Pocock-style `/teach` lesson.
- Lessons should explain the measurement, why it matters, exact series, collection and revision process, direct data path, transformations, caveats, and auditability.
- Prefer government and official institutional sources.
- Separate documentation pages, exact series pages, machine-readable downloads/APIs, release schedules, and revision policies.
- Do not store credentials; examples requiring keys use placeholders.
- Avoid casually overwriting implementation files while building the independent research track.
- `tasks.js` is the task source of truth used by `flowmap.html`.

## Intake areas

1. Gas Prices
2. Housing
3. Credit Cards
4. Auto Loans
5. Unemployment
6. Inflation
7. Foreclosures
8. Manufacturing

## Work completed in this session

### Project discovery and review

- Anchored the session to the OOZEMeter repository.
- Inspected project structure and confirmed there was initially no README or AGENTS file.
- Reviewed:
  - `PRODUCT.md`
  - `REQUIREMENTS.md`
  - `DESIGN.md`
  - `improvements.md`
  - `research/HISTORY.md`
  - `tasks.js`
- Reviewed implementation and data flow:
  - `scripts/collect.js`
  - `scripts/backtest.js`
  - `data/latest.json`
  - `research/backtest-results.json`
  - `lab.js`
  - `index.html`
  - `.github/workflows/collect.yml`
- Rendered and visually inspected the homepage and flowmap.
- Identified source and methodology inconsistencies before writing lessons.

### Skill installation and teaching format

- Installed `mattpocock/skills` into the repository's local agent-skill directories.
- Verified 41 skill definitions.
- Read the installed `/teach` skill and its mission, resources, learning-record, and glossary formats.
- Read and used the installed research skill.

### Teaching workspace foundation

Created:

- `research/MISSION.md`
- `research/RESOURCES.md`
- `research/NOTES.md`
- `research/assets/course.css`
- `research/assets/course.js`

The shared assets provide the dark containment-lab visual language and reusable quiz behavior.

### Interactive `/teach` lessons

Created:

- `research/lessons/0001-gas-prices.html`
- `research/lessons/0002-housing.html`
- `research/lessons/0003-credit-cards.html`
- `research/lessons/0004-auto-loans.html`
- `research/lessons/0005-unemployment.html`
- `research/lessons/0006-inflation.html`
- `research/lessons/0007-foreclosures.html`
- `research/lessons/0008-manufacturing.html`

Each lesson includes:

- A tangible learning outcome
- Definition and mental model
- Primary and companion measurements
- Release cadence and signal role
- First-party source links
- Current versus recommended OOZEMeter transformation
- Interpretation/proxy warning
- Four-choice interactive retrieval check
- Course navigation

### Parallel primary-source research

Three parallel research workers completed all eight areas and wrote:

- `research/source-notes/gas-housing.md`
- `research/source-notes/credit-auto.md`
- `research/source-notes/labor-inflation-foreclosure-manufacturing.md`

The dossiers document:

- Exact series IDs
- Direct CSV, API, XLSX, or ZIP paths
- Publisher and delivery-layer attribution
- Cadence and units
- Historical coverage
- Release and revision behavior
- Licensing and redistribution constraints
- Leading/coincident/lagging timing
- Denominator and population traps
- Exercises for each topic

Some BLS web pages rejected automated GET inspection with HTTP 403. BLS series were checked through the official BLS API POST endpoint and metadata was cross-checked with FRED.

### Machine-readable source registry

Created:

- `research/data-source-registry.json`

Registry characteristics:

- 8 intake areas
- 18 documented series
- Formula weights total 100
- Original publisher preserved even when FRED is the transport layer
- Exact acquisition URLs and metadata links
- Frequency, units, coverage, role, formula status, weight, and implementation notes
- Direct 2026 Q1 New York Fed Household Debt and Credit workbook link with landing-page fallback
- EIA API key represented as `YOUR_KEY`

### Quick-reference map

Created:

- `research/reference/intake-data-map.html`

The map links all lessons and the machine-readable registry, and shows the primary ID, cadence, signal role, and major caveat for each intake line.

### Flowmap/task ledger

Updated `tasks.js`:

- Marked `/teach` foundation complete.
- Marked all eight lessons complete.
- Marked the source registry and data map complete.
- Added four implementation follow-ups:
  - Replace broad `DRCLACBS` auto proxy with NY Fed auto 30+ delinquency flow.
  - Resolve ICSA monthly-average versus trailing four-week-mean methodology.
  - Freeze CPI adjustment basis: current `CPIAUCSL` versus recommended NSA `CUUR0000SA0` year-over-year.
  - Reconcile UI source labels with original publishers and proxy disclosures.

## Research recommendations by area

| Area | Recommended production measurement | Practical acquisition |
|---|---|---|
| Gas | EIA U.S. Regular All Formulations Retail Gasoline Price | FRED `GASREGW` keyless CSV or EIA API v2 `EMM_EPMR_PTE_NUS_DPG` |
| Housing | Freddie Mac PMMS 30-year fixed mortgage rate | FRED `MORTGAGE30US`; add renter pressure using `CUSR0000SEHA` if desired |
| Credit Cards | Commercial-bank credit-card delinquent balance share | FRED `DRCCLACBS`; validate with NY Fed card transition data |
| Auto Loans | Flow into 30+ auto-loan delinquency | NY Fed HHDC workbook, `Page 13 Data`, `AUTO` column |
| Unemployment | `UNRATE` plus trailing four-week mean of `ICSA` | FRED keyless CSVs, retaining BLS/DOL as original publishers |
| Inflation | 12-month change in NSA headline CPI-U | BLS `CUUR0000SA0` API or FRED mirror `CPIAUCNS` |
| Foreclosures | Mortgage-delinquency proxy at launch | FRED `DRSFRMACBS`; never label it a foreclosure rate |
| Manufacturing | `INDPRO` YoY plus `AMTMNO` YoY | Federal Reserve/Census series through keyless FRED CSVs |

## Critical findings

### 1. Auto line is not currently defensible as auto-specific

The collector uses `DRCLACBS`, which covers broad consumer loans held by commercial banks. It is not an auto-only series and omits major nonbank auto-finance channels. Replace it with the New York Fed's auto 30+ delinquency transition series before presenting the line as auto-specific.

### 2. Claims smoothing differs between research and implementation

The research recommends a trailing four-week mean of `ICSA`. The current collector averages weekly claims inside each score month. Freeze one definition, test it historically, and document it.

### 3. CPI adjustment basis is unresolved

The collector currently computes year-over-year inflation from seasonally adjusted `CPIAUCSL`. The recommended public 12-month measure is based on NSA headline CPI-U (`CUUR0000SA0`, transported keylessly as `CPIAUCNS`). Seasonal adjustment affects revision behavior. The selected basis must be frozen and disclosed.

### 4. Foreclosures is a proxy label

`DRSFRMACBS` measures the delinquent balance share of single-family residential mortgages held by commercial banks. It is not a foreclosure filing, start, completion, or repossession rate. Consider renaming the UI line to **Mortgage Distress**, or always show **mortgage delinquency proxy**.

### 5. Manufacturing is auxiliary

`INDPRO` and `AMTMNO` are public output/orders sensors, not replications of ISM PMI. ISM data has copyright, automation, and commercial-use restrictions. Keep manufacturing unweighted until its transformation and household-stress value are backtested.

### 6. Gas attribution must distinguish publisher from transport

`GASREGW` is published by EIA and delivered through FRED. UI attribution should not say AAA for that value.

## Known website consistency issues

- Requirements proposed EIA gas data; the collector uses the FRED mirror; interface copy referenced AAA.
- Auto-loan stress uses broad consumer-loan delinquency.
- ATTOM and ISM appeared in product copy despite access/licensing constraints.
- `lab.js` retains older canned values/source labels beneath live-data patching.
- Homepage/footer copy has said figures are illustrative even when local data is real.
- Strong claims such as household budgets failing in a fixed order need evidence or softer wording.
- `tasks.js`, `improvements.md`, and `REQUIREMENTS.md` have not always been synchronized; treat `tasks.js` as current.

## Verification completed

A fresh targeted verifier was created under the macOS temporary directory, run, and deleted. Results:

- Registry: 8 areas, 18 series, weights total 100
- 9 HTML files checked
- All internal links resolved
- 8 quizzes each have four equal-word-count choices and one correct answer
- `research/assets/course.js` passes `node --check`
- `tasks.js` has 64 valid rows and 9 completed `/teach` rows
- 16/16 keyless GET acquisition routes returned HTTP 200 in the full verification
- Official BLS API POST for `CUUR0000SA0` returned observations
- Direct New York Fed workbook returned a valid XLSX response

No canonical repository test/lint/build command existed, so these are targeted checks rather than a claim that a full suite is green.

## Current repository state at handoff creation

```text
## main...origin/main [ahead 18]
 M tasks.js
?? research/MISSION.md
?? research/NOTES.md
?? research/RESOURCES.md
?? research/assets/
?? research/data-source-registry.json
?? research/lessons/
?? research/reference/
?? research/source-notes/
```

The research artifacts and `tasks.js` changes are uncommitted. Do not overwrite concurrent work without checking the latest diff.

## Implementation update completed after handoff creation

The source-correct automation phase was subsequently implemented:

- Added `scripts/lib/methodology.js` with NY Fed workbook discovery/parsing, trailing four-week claims smoothing, NSA CPI year-over-year calculation, and auto-specific scoring.
- Added focused unit and live integration tests under `tests/`.
- Removed `DRCLACBS` from `scripts/collect.js` and `scripts/backtest.js`.
- Replaced it with the NY Fed `Page 13 Data` / `AUTO` 30-plus-day delinquency transition series.
- Froze inflation as non-seasonally-adjusted CPI-U year-over-year using `CPIAUCNS`.
- Froze claims as the trailing mean of the latest four weekly `ICSA` observations available in each month.
- Recalibrated methodology v2 over the comparable 2003-2025 period: `a=1.4209110232483089`, `b=-24.62145011353958`.
- Added per-line publisher, transport, series ID, metric, URL, observation date, cadence, proxy status, and transform metadata to live output.
- Added zero-weight auxiliary feeds for mortgage distress (`DRSFRMACBS`) and manufacturing (`INDPRO` with `AMTMNO` context); both are explicitly disclosed as proxies.
- Added atomic writes, SHA-256 input fingerprints, `new-observation` versus `no-new-release` status, and compact vintage manifests under `data/vintages/`.
- Updated `lab.js` to consume collector provenance, disclose mortgage distress as a proxy, remove ISM/AAA mismatches, and use live methodology-v2 history.
- Strengthened `.github/workflows/collect.yml` with pre-collection tests, `unzip` verification, concurrency control, and release-aware commit messages.
- Marked the six source/methodology/trust automation rows complete in `tasks.js`.

### Independent-review closure

An independent pre-commit review identified two blocking concerns. Both were resolved:

1. The reported public-label failure was caused by the checkout changing during review. The final auxiliary-label implementation was reread and the exact workflow contract now passes.
2. The original fingerprint covered only rounded display values. Fingerprint schema v2 now hashes a canonical snapshot containing methodology version, calibration, weights, anchors, transforms, and every raw dated observation from all FRED and NY Fed inputs. Compact vintage manifests preserve per-source hashes, observation ranges/counts, methodology configuration, and a history-output hash.

Additional hardening from that review:

- FRED CSV parsing now fails closed on malformed numeric values or an empty observation set.
- Backtest output and the archive disclose that history is an ex-post reconstruction using latest revised observations, not a release-time vintage.
- `INDPRO` is explicitly marked as a manufacturing proxy because it is total industrial production, including mining and utilities.
- The daily workflow now runs fingerprint, FRED parser, live NY Fed, collector, collector-reliability, methodology, and public-label contracts serially before publication.
- Final local verification: **22 tests passed, 0 failed**, all relevant JavaScript syntax checks passed, and `git diff --check` passed.

Follow-on reliability work then closed the remaining operational decisions:

- Vintage policy is now explicit and machine-readable: retain every unique schema-v2 manifest. Existing manifests are immutable except for metadata-schema migration.
- GitHub Actions opens or updates a single `[OOZEMeter] Daily collection failure` issue with the failed run URL, then closes that standing issue after a successful recovery run.
- Mortgage Distress and Manufacturing now publish `scoreWeight: 0` and `calibrationStatus: provisional-auxiliary`; homepage hover copy states that they do not alter the Ooze score.
- Collector output now publishes `freshnessStatus` and `staleLines`. The public header independently marks the feed `STALE` after 48 hours without a successful collection, marks current collections with stale inputs `DEGRADED`, and otherwise shows `LIVE` or `OFFLINE` honestly.
- Controlled-release work added `scripts/release-gate.js`, a tested canonical-artifact inspector, exact public version `v2.0.0`, and `docs/ROLLBACK.md`. The gate verifies the fingerprint/vintage pair, archive disclosures, homepage/report/newsletter/RSS agreement, public permalinks, workflow permissions, alert/recovery contracts, and rollback prerequisites.
- The release gate exposed duplicate revision-log entries during repeated local runs. `scripts/integrity.js` now deduplicates identical revision sets, with a regression test proving repeated runs preserve one event.
- Independent release review found and resolved test artifact mutation, rounded-contribution drift, collector/backtest history divergence, and a rollback verification circularity. Collector and backtest tests now use isolated output directories; contributions sum exactly to the headline; canonical histories match month-for-month; and initial-v2 rollback verification does not depend on a gate removed by the revert.
- The prior hosted failure was a FRED `ETIMEDOUT`, not a methodology failure. Official-source fetches now use bounded retries for transient network and HTTP failures.
- Latest complete local gate: **37 tests passed, 0 failed**; live source collection, numerical integrity, narrative integrity, OOZEBOT outputs, static stamping, RSS, syntax, link, browser-console, and Git whitespace checks passed. See `research/METHODOLOGY-V2-LAUNCH-GATE.md`.

### Remaining review decisions

1. Keep manufacturing zero-weight unless its provisional visualization anchors receive a dedicated backtest and methodology review.
2. Treat pre-2003 scores as a separate fidelity tier; do not splice the old broad auto proxy into methodology v2.
3. Run the controlled hosted release and production-parity checks before beginning calibration or additional feature work.

## Shell note

The user's `~/.zshrc` contains a stale line sourcing `~/.openclaw/completions/openclaw.zsh`. New Zsh shells may print a missing-file warning. The OOZEMeter work was not routed through OpenClaw. Do not modify the user's `.zshrc` without explicit authorization.
