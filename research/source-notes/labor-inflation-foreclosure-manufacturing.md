# OozeMeter source notes: labor, inflation, foreclosure, and manufacturing

_Last source review: 2026-07-25. Scope: U.S. national household-economic-stress sensors. Sources are first-party federal statistical agencies, Federal Reserve/FRED, and ISM only for its own usage terms._

## Recommended launch bundle

| Area | Launch metric | Role in stress index | Timing |
|---|---|---|---|
| Labor | **UNRATE** plus **ICSA 4-week mean** as two separately normalized components | UNRATE measures the broad stock of joblessness; ICSA adds a fast flow signal | UNRATE coincident-to-lagging; ICSA leading-to-coincident |
| Inflation | **CPI-U all-items 12-month percent change**, with core CPI shown as context | Captures broad purchasing-power pressure households actually face | Coincident, but published with a lag and often persistent |
| Foreclosure | **DRSFRMACBS** labeled explicitly as a mortgage-delinquency proxy—not a foreclosure rate | Captures severe housing-payment distress earlier and more consistently than completed foreclosures | Lagging household/credit-cycle indicator |
| Manufacturing | **INDPRO 12-month percent change** plus **AMTMNO 12-month percent change** | Public, reproducible substitutes for licensed PMI: realized output plus demand pipeline | Orders usually lead; production is coincident |

Design rule: do not collapse unlike release frequencies before preserving each observation date, publication date, and vintage. A daily OozeMeter can be “recalculated daily from the latest available observations”; it is not daily economic data.

---

## 1. Labor: unemployment and initial claims

### What the measures mean

**UNRATE** is the seasonally adjusted U-3 unemployment rate: unemployed people as a percentage of the civilian labor force. “Unemployed” means no job, available for work, and actively searched in the prior four weeks (or waiting to be recalled from temporary layoff). The universe is the civilian noninstitutional population age 16+, not active-duty military or people in institutions. It comes from BLS’s household-based Current Population Survey (CPS), not employer payroll records. The exact BLS series is `LNS14000000`; FRED republishes it as [`UNRATE`](https://fred.stlouisfed.org/series/UNRATE). BLS definitions and methods are in the [CPS concepts page](https://www.bls.gov/cps/definitions.htm) and [CPS Handbook of Methods](https://www.bls.gov/opub/hom/cps/).

**ICSA** is the seasonally adjusted count of initial claims for unemployment insurance during a week ending Saturday. An initial claim asks the state UI agency to determine basic eligibility after separation from an employer; it is a flow of new claims, not the number of all unemployed people and not necessarily the number who ultimately receive benefits. The U.S. Department of Labor Employment and Training Administration (ETA) publishes the [weekly claims release and data](https://oui.doleta.gov/unemploy/claims.asp); FRED republishes the national series as [`ICSA`](https://fred.stlouisfed.org/series/ICSA). The official [weekly release archive](https://oui.doleta.gov/unemploy/archive.asp) is useful for release-vintage teaching.

### Why they reflect household stress

* Job loss removes labor income, increases benefit dependence, and can trigger missed rent, mortgage, utility, and debt payments.
* UNRATE captures the accumulated stock of people actively seeking work; it aligns with how widespread labor-market stress has become.
* ICSA reacts quickly to layoffs and therefore warns before a monthly stock measure fully turns. Combining the two avoids asking one metric to be both fast and comprehensive.

### Cycle behavior

* **ICSA: leading-to-coincident.** Layoffs can rise near the beginning of a downturn and claims arrive weekly. Use a four-week moving average to reduce holiday, weather, strike, and administrative noise. It can also emit false alarms and misses many workers.
* **UNRATE: coincident-to-lagging.** Employers may cut hours and hiring before jobs; people’s labor-force entry/exit can also delay or mute the rate. It often remains elevated after output begins recovering.

### Launch specification

1. **UNRATE level**, percentage points, seasonally adjusted, monthly.
2. **Four-week trailing mean of ICSA**, persons, seasonally adjusted, weekly ending Saturday. Compute from the four published weekly observations; alternatively use FRED’s first-party-derived [`IC4WSA`](https://fred.stlouisfed.org/series/IC4WSA).
3. Normalize each against its own history, then combine. Do not average the raw percent and count. A transparent initial weighting is 60% UNRATE / 40% claims, but label it heuristic and sensitivity-test it.

Useful backups/context:

* [`U6RATE`](https://fred.stlouisfed.org/series/U6RATE), BLS U-6 (unemployed + marginally attached + part-time for economic reasons, as a share of labor force plus marginally attached), monthly SA; broader but only available from 1994.
* [`CCSA`](https://fred.stlouisfed.org/series/CCSA), continued claims / insured unemployment, weekly SA; measures persistence among UI-covered claimants.
* [`PAYEMS`](https://fred.stlouisfed.org/series/PAYEMS), total nonfarm payroll employment, monthly SA; an establishment-survey cross-check, not a household-stress rate.

### Exact acquisition, cadence, units, history, revisions

| Series | Exact source/download | Cadence and units | Coverage | Revision behavior |
|---|---|---|---|---|
| UNRATE / `LNS14000000` | BLS [public data API v2](https://www.bls.gov/developers/api_signature_v2.htm), series ID `LNS14000000`; BLS [CPS flat files](https://download.bls.gov/pub/time.series/ln/); FRED [series page](https://fred.stlouisfed.org/series/UNRATE), [keyless CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=UNRATE) | Monthly; percent; SA; Employment Situation usually first Friday after reference month | Jan. 1948–present | CPS monthly estimates are sample estimates. BLS annually revises seasonal factors for the most recent five years; updated population controls can create January level breaks and are generally not carried backward through the official historical series. Errors can also be corrected. Preserve ALFRED vintages if teaching “what was known then”: [UNRATE vintage series](https://alfred.stlouisfed.org/series?seid=UNRATE). |
| ICSA | DOL ETA [weekly claims data](https://oui.doleta.gov/unemploy/claims.asp) and [archive](https://oui.doleta.gov/unemploy/archive.asp); FRED [series page](https://fred.stlouisfed.org/series/ICSA), [keyless CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=ICSA) | Weekly ending Saturday; number of claims; SA; normally released Thursday | Jan. 7, 1967–present in FRED | The latest week is preliminary and commonly revised the following week as states update submissions. Seasonal factors are updated annually and can revise history. Extraordinary federal programs and state reporting problems can break comparability. Use [ICSA in ALFRED](https://alfred.stlouisfed.org/series?seid=ICSA) for vintage exercises. |

### Licensing and attribution

BLS states that information on its site is generally in the public domain unless otherwise indicated; follow its [copyright guidance](https://www.bls.gov/bls/copyright.htm). Federal DOL data are generally U.S. government works, but inspect any file-specific notice. The FRED pages tag both series “Public Domain: Citation Requested.” Attribute the original publisher and series, and if served through FRED also say “retrieved from FRED, Federal Reserve Bank of St. Louis,” with retrieval date. FRED access does not erase an original source’s restrictions for other series; consult [FRED legal notices](https://fred.stlouisfed.org/legal/).

### Common interpretation traps

* UNRATE’s denominator changes: a discouraged person who stops active search leaves the labor force and is not unemployed, so UNRATE can fall without a job gain.
* UNRATE is not the share of the population without work and does not measure job quality, hours cuts, wage loss, or geographic disparity.
* ICSA excludes workers ineligible for or not filing UI, including many self-employed, new entrants, exhausted claimants, and some contingent workers. Rules and take-up vary by state and era.
* A claim is an administrative event, not an approved benefit or unique person in every historical circumstance.
* Weekly claims are noisy; compare same adjustment basis and use the four-week mean. Pandemic-era program changes and fraud/backlogs are structural breaks.
* Do not call ICSA “unemployment.” It measures emerging insured-job-loss claims; UNRATE measures active-search unemployment in a survey.

### Three lesson-worthy exercises

1. **Stock versus flow:** plot weekly ICSA (and its four-week mean) with monthly UNRATE around 2001, 2007–09, and 2020. Ask students to identify which turns first and explain why claims cannot be converted directly into an unemployment rate.
2. **Denominator detective:** combine UNRATE with BLS labor-force participation (`CIVPART`) and employment-population ratio (`EMRATIO`). Find a period when unemployment fell but the other measures did not improve similarly; write a denominator-based explanation.
3. **Real-time revision lab:** use ALFRED vintages for ICSA and UNRATE to compare first-published with latest values. Recompute a threshold alert and record whether its first trigger date changes.

---

## 2. Inflation: headline and core CPI

### What the measures mean

The Consumer Price Index for All Urban Consumers (CPI-U) measures average price change over time for a weighted basket purchased by urban consumers, covering roughly 88% of the U.S. population. It measures price change—not the absolute cost of living and not every household’s personal inflation. BLS’s [CPI Handbook of Methods](https://www.bls.gov/opub/hom/cpi/) explains sampling, weights, quality adjustment, and shelter treatment.

* **Headline CPI-U, all items:** BLS `CUUR0000SA0` (not seasonally adjusted, NSA) or `CUSR0000SA0` (seasonally adjusted, SA); FRED’s SA counterpart is [`CPIAUCSL`](https://fred.stlouisfed.org/series/CPIAUCSL).
* **Core CPI-U, all items less food and energy:** BLS `CUUR0000SA0L1E` (NSA) or `CUSR0000SA0L1E` (SA); FRED’s SA counterpart is [`CPILFESL`](https://fred.stlouisfed.org/series/CPILFESL).

Headline includes food and energy—the volatile categories households cannot simply ignore. Core excludes them to reveal more persistent underlying inflation; it is an analytic signal, not a claim that food and fuel do not matter.

### Why it reflects household stress and cycle behavior

Faster price growth erodes purchasing power when nominal income does not keep pace, strains cash budgets, and particularly harms households with little liquid buffer. Inflation is generally **coincident** with current prices but is published about two weeks after the month and can persist after the initiating shock. Core can be a persistence signal; neither is a reliable standalone business-cycle leader. Inflation can rise during strong demand or during supply shocks, so high CPI does not necessarily imply strong household finances.

### Launch specification and YoY calculation

Use the **12-month percent change in the NSA headline index** for the principal household-pressure measure:

```text
headline_yoy_t = 100 * (CUUR0000SA0_t / CUUR0000SA0_(t-12) - 1)
core_yoy_t     = 100 * (CUUR0000SA0L1E_t / CUUR0000SA0L1E_(t-12) - 1)
```

NSA is conventional for 12-month CPI changes because matching calendar months largely controls seasonality and its history is not routinely revised for new seasonal factors. Display core YoY beside headline as persistence context. If month-over-month momentum is taught or scored, use SA indexes and label the transformation; do not mix NSA levels into MoM comparisons.

Backups/context: BLS CPI-U shelter (`CUUR0000SAH1`) to show housing’s lagged contribution; food-at-home (`CUUR0000SAF11`) and energy (`CUUR0000SA0E`) to explain household-visible divergence. These are diagnostics, not substitutes for broad headline CPI.

### Exact acquisition, cadence, units, history, revisions

| Series | Exact source/download | Cadence and units | Coverage | Revision behavior |
|---|---|---|---|---|
| Headline CPI-U | BLS API series `CUUR0000SA0` (NSA) / `CUSR0000SA0` (SA) using [API v2](https://www.bls.gov/developers/api_signature_v2.htm); BLS [CPI flat files](https://download.bls.gov/pub/time.series/cu/), especially [`cu.data.1.AllItems`](https://download.bls.gov/pub/time.series/cu/cu.data.1.AllItems); FRED [`CPIAUCSL`](https://fred.stlouisfed.org/series/CPIAUCSL), [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL) | Monthly; index 1982–84=100; SA or NSA; release generally mid-month | BLS all-items CPI-U extends to 1913 in NSA historical tables; FRED SA `CPIAUCSL` begins Jan. 1947 | NSA CPI indexes are generally not revised after publication except error correction. BLS recalculates seasonal factors annually and revises the previous five years of SA indexes. Relative-importance weights update and methodology changes can affect interpretation without rewriting all prior NSA observations. |
| Core CPI-U | BLS API `CUUR0000SA0L1E` (NSA) / `CUSR0000SA0L1E` (SA); same [flat-file directory](https://download.bls.gov/pub/time.series/cu/); FRED [`CPILFESL`](https://fred.stlouisfed.org/series/CPILFESL), [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPILFESL) | Monthly; index 1982–84=100; SA or NSA | Jan. 1957–present in FRED SA series | Same NSA/SA revision distinction as headline. Preserve index values, source series ID, adjustment basis, and retrieval date. |

### Licensing and attribution

BLS data are generally public domain unless marked otherwise; cite [BLS copyright guidance](https://www.bls.gov/bls/copyright.htm). FRED labels these BLS series “Public Domain: Citation Requested.” Recommended attribution: “U.S. Bureau of Labor Statistics, CPI-U [exact BLS/FRED ID], retrieved [date]” and add FRED if its delivery endpoint is used.

### Common interpretation traps

* **Index level versus inflation rate:** 320 is not “320% inflation.” Inflation is a percent change between index levels.
* **YoY base effects:** a large or small denominator 12 months earlier can move YoY even when current monthly momentum is unchanged.
* **Headline versus core:** core is smoother, but excluding food and energy can understate immediate household pain. Headline is not “wrong” because it is volatile.
* **SA versus NSA:** do not compare a SA month-over-month calculation with an NSA one or splice series silently. SA history can revise.
* CPI-U is a national urban average; spending patterns differ by income, age, tenure, geography, and household composition. It is not a personal inflation calculator.
* Shelter uses rent and owners’ equivalent rent, not home purchase prices or mortgage payments, and commonly lags market rents.
* Falling inflation means prices are rising more slowly, not that the price level has returned to where it began; that would require deflation.

### Three lesson-worthy exercises

1. **Build inflation from levels:** retrieve NSA headline and core indexes from the BLS API, calculate YoY with the formula above, and compare to a naïve `12 * monthly percent change`. Explain why the latter can diverge.
2. **Base-effect simulator:** hold the current index path fixed but replace the year-ago denominator with values ±2%. Show the change in reported YoY and distinguish “new price pressure” from arithmetic base effect.
3. **One basket, different stories:** chart headline, core, shelter, food-at-home, and energy YoY. Students choose two household archetypes and explain why the national headline can understate one household’s experience and overstate another’s without invalidating CPI.

---

## 3. Foreclosures: use mortgage delinquency honestly as a proxy

### What DRSFRMACBS measures

[`DRSFRMACBS`](https://fred.stlouisfed.org/series/DRSFRMACBS) is the **seasonally adjusted delinquency rate on single-family residential mortgages booked in domestic offices of all commercial banks**, quarterly at end of period, in percent. The Board of Governors publishes it in [Charge-Off and Delinquency Rates on Loans and Leases at Commercial Banks](https://www.federalreserve.gov/releases/chargeoff/delallsa.htm); FRED provides a [keyless CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=DRSFRMACBS).

It is **not a foreclosure rate**. Delinquency means a contractual payment is past due under the reporting definition; foreclosure is a later legal/servicing process, and many delinquent loans cure, modify, refinance, or enter forbearance without foreclosure. It also covers mortgages held on commercial-bank books, not the whole U.S. mortgage market (for example, many securitized/GSE loans are outside the population).

### Why it reflects household stress and cycle behavior

Mortgage delinquency is direct evidence that some households cannot or do not make housing-debt payments. It tends to rise after income shocks, unemployment, payment resets, or exhausted buffers. It is a **lagging** household and credit-cycle indicator: a borrower misses payments only after stress materializes, delinquency status accumulates, and the quarterly bank report arrives later. It may lead completed foreclosure filings because delinquency is earlier in the resolution pipeline.

### Launch specification

Use the **level of DRSFRMACBS** (percentage of relevant mortgage balances/loans under the source definition) or its deviation from a long-run baseline. Product language must say:

> “Commercial-bank single-family mortgage delinquency rate (quarterly), used as a national foreclosure-risk proxy.”

Never label it “foreclosures,” “households in foreclosure,” or the share of all mortgages delinquent. Freeze the latest quarter until a new release; show its observation quarter and staleness.

Best backups/context:

1. **FHFA National Mortgage Database (NMDB) Residential Mortgage Performance Statistics**: broad loan-level sample-based mortgage performance, with national/state/metro breakdowns. Use the [dashboard and documentation](https://www.fhfa.gov/data/dashboard/nmdb-residential-mortgage-performance-statistics) or exact [all-quarterly ZIP download](https://www.fhfa.gov/document/d/nmdb/nmdb-mortgage-performance-statistics-all-quarterly.zip). This is the strongest public-domain path for a broader mortgage-performance sensor, subject to its sampling and release lag.
2. **New York Fed Quarterly Report on Household Debt and Credit**: mortgage delinquency and transition context from the Consumer Credit Panel; reports and downloadable data are on the [first-party HHDC page](https://www.newyorkfed.org/microeconomics/hhdc.html). It is quarterly and sample/credit-report based.
3. Federal Reserve NSA counterpart to DRSFRMACBS (linked from the [FRED series page](https://fred.stlouisfed.org/series/DRSFRMACBS)) for checking seasonal-adjustment sensitivity—not a separate construct.

### Exact acquisition, cadence, units, history, revisions

| Series | Exact source/download | Cadence and units | Coverage | Revision behavior |
|---|---|---|---|---|
| DRSFRMACBS | Fed [SA delinquency table](https://www.federalreserve.gov/releases/chargeoff/delallsa.htm); FRED [metadata](https://fred.stlouisfed.org/series/DRSFRMACBS), [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=DRSFRMACBS); [ALFRED vintages](https://alfred.stlouisfed.org/series?seid=DRSFRMACBS) | Quarterly, end of period; percent; SA | 1991 Q1–present | Bank regulatory/reporting inputs can be revised and seasonal factors/history may change. The latest quarter should not be treated as immutable. Store release vintage or use ALFRED to make backtests honest. |
| FHFA NMDB performance | [Aggregate-statistics landing page](https://www.fhfa.gov/data/national-mortgage-database-aggregate-statistics), [all-quarterly ZIP](https://www.fhfa.gov/document/d/nmdb/nmdb-mortgage-performance-statistics-all-quarterly.zip), [technical documentation](https://www.fhfa.gov/document/d/nmdb/national-mortgage-database-technical-documentation) | Quarterly; multiple rates/counts by geography and loan status | Coverage depends on selected NMDB table; verify metadata before extraction | Sample weights, credit-record updates, definitions, and refreshes can revise values. Version the downloaded ZIP and documentation. |
| NY Fed HHDC | [Report/data page](https://www.newyorkfed.org/microeconomics/hhdc.html) | Quarterly; balances, rates, and transitions depending on table | Mostly 1999 onward for Consumer Credit Panel report series | Credit-panel records and seasonal/report production can revise; retain the workbook/report edition used. |

### Licensing and attribution

The Fed/FRED page tags DRSFRMACBS “Public Domain: Citation Requested.” FHFA materials are federal-government data unless a file says otherwise. NY Fed is a Federal Reserve Bank rather than a federal agency; follow its [terms of use](https://www.newyorkfed.org/privacy/termsofuse) and attribute the report/table. Do not assume every chart image or third-party item on a government/Reserve Bank site has the same status as the underlying data. Cite exact series/table, original institution, retrieval date, and any FRED delivery layer.

### Common interpretation traps

* Delinquency is a **proxy**, not foreclosure. A rising rate says more bank-held mortgages are late, not that the same share will lose homes.
* The denominator is commercial-bank-booked single-family mortgages, not all owner households or all outstanding mortgages; portfolio composition can change.
* A rate does not reveal the number of affected households, severity bucket, dollar balance, cure rate, or geographic concentration.
* Forbearance and reporting policy can suppress or reclassify measured delinquency without eliminating household hardship.
* Quarterly end-of-period data are stale relative to weekly labor data; forward-filling does not make them higher-frequency.
* Completed foreclosures are especially lagging and affected by state law, moratoria, servicing capacity, and loss-mitigation policy.

### Three lesson-worthy exercises

1. **Proxy audit:** draw a delinquency → cure/modify/forbear → foreclosure pipeline. For each arrow list a reason DRSFRMACBS can rise without an equal rise in foreclosures, then rewrite three misleading dashboard labels.
2. **Coverage comparison:** align DRSFRMACBS, one FHFA NMDB national delinquency measure, and a NY Fed mortgage-delinquency series. Compare turning points and levels; explain differences using denominator, sample, loan ownership, and definition rather than assuming one source is wrong.
3. **Lag map:** cross-correlate monthly UNRATE with quarterly DRSFRMACBS after aggregating labor data to quarter. Test several lags, then discuss why correlation and chosen lag do not establish that unemployment alone causes delinquency.

---

## 4. Manufacturing: public alternatives to licensed PMI

### Why not make ISM PMI a launch dependency

ISM’s Manufacturing PMI is a valuable diffusion index based on survey respondents reporting improvement, no change, or deterioration; 50 is the no-change threshold. But ISM’s own [Terms of Service](https://www.ismworld.org/footer/terms-of-use/) state that its products and data are protected by U.S. and international copyright and other IP laws, limit use to personal/non-commercial use, and require express written permission to reproduce ISM material. The terms also prohibit automated collection. `ISM`, `PMI`, and report branding may involve trademarks. Therefore OozeMeter should not scrape, redistribute, cache, or use PMI as a commercial/product input without a written license. Linking to a public release and paraphrasing facts is not the same as having redistribution or automated-use rights; obtain counsel/permission for product use.

Use two first-party public series that capture related but not identical constructs:

* **INDPRO**: the Federal Reserve’s real-output index for manufacturing, mining, and electric/gas utilities. It measures realized physical industrial output, not manager sentiment. [`INDPRO`](https://fred.stlouisfed.org/series/INDPRO) is monthly, SA, index 2017=100. The Fed’s [G.17 release](https://www.federalreserve.gov/releases/g17/current/default.htm) describes coverage and provides releases/download links.
* **AMTMNO**: Census Manufacturers’ New Orders: Total Manufacturing, a monthly SA nominal dollar flow. It measures orders received, a demand pipeline that often turns before output, but it is not a diffusion index. FRED republishes it as [`AMTMNO`](https://fred.stlouisfed.org/series/AMTMNO); the original source is Census’s [Manufacturers’ Shipments, Inventories, and Orders (M3)](https://www.census.gov/manufacturing/m3/).

### Why manufacturing reflects household stress and cycle behavior

Manufacturing is cyclical and transmits demand weakness through factory hours, overtime, layoffs, supplier orders, freight, and manufacturing-region incomes. It is an indirect household sensor: a fall in output/orders is not household hardship itself, and manufacturing is a smaller share of employment than services.

* **AMTMNO: leading-to-coincident.** New orders can foreshadow production and hiring, but large aircraft/defense orders create lumps and nominal values rise with prices.
* **INDPRO: coincident.** Realized output tracks current industrial activity; production may fall after orders and can be distorted by weather, strikes, supply constraints, utility demand, or mining.

### Launch specification

1. **INDPRO 12-month percent change**: `100 * (INDPRO_t / INDPRO_(t-12) - 1)`. Reverse its orientation for stress (lower growth = more stress).
2. **AMTMNO 12-month percent change**, also reverse-oriented, but flag it as nominal. For a cleaner “real” experiment, deflate orders by CPI-U and state that CPI is an imperfect deflator for manufactured orders.
3. Keep the two components visible and separately normalized. They jointly approximate “output now + orders pipeline”; they do **not** recreate PMI’s survey breadth, supplier-delivery component, or 50-point threshold.

Backups/context:

* [`IPMAN`](https://fred.stlouisfed.org/series/IPMAN), Industrial Production: Manufacturing (NAICS), narrows INDPRO by excluding mining and utilities; often conceptually better if the lesson title is strictly manufacturing.
* [`TCU`](https://fred.stlouisfed.org/series/TCU), total industry capacity utilization, monthly percent SA; indicates slack but can fall because estimated capacity rises.
* Census/FRED nondefense capital-goods orders excluding aircraft (linked among related M3 series on the [AMTMNO page](https://fred.stlouisfed.org/series/AMTMNO)) as a business-investment pipeline; narrower and still nominal.

### Exact acquisition, cadence, units, history, revisions

| Series | Exact source/download | Cadence and units | Coverage | Revision behavior |
|---|---|---|---|---|
| INDPRO | Fed [G.17 current release and downloads](https://www.federalreserve.gov/releases/g17/current/default.htm); FRED [metadata](https://fred.stlouisfed.org/series/INDPRO), [keyless CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=INDPRO); [ALFRED](https://alfred.stlouisfed.org/series?seid=INDPRO) | Monthly; index 2017=100; SA; usually released around mid-month | Jan. 1919–present | Recent months revise as higher-quality production data replace estimates; annual G.17 revisions can revise years of history, seasonal factors, benchmarks, and base-year representation. Vintage-safe evaluation requires ALFRED or saved release files. |
| AMTMNO | Census [M3 landing/downloads](https://www.census.gov/manufacturing/m3/); Census [Economic Indicators API documentation](https://www.census.gov/data/developers/data-sets/economic-indicators.html) and [`m3` variables](https://api.census.gov/data/timeseries/eits/m3/variables.html) (`category_code=MTM`, `data_type_code=NO`, seasonally adjusted; API currently requires a Census key); FRED [metadata](https://fred.stlouisfed.org/series/AMTMNO), [keyless CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=AMTMNO); [ALFRED](https://alfred.stlouisfed.org/series?seid=AMTMNO) | Monthly; millions of dollars; SA; full M3 generally about one month after reference month | Feb. 1992–present in FRED | Recent months revise as late reports arrive; seasonal adjustment and annual benchmark/reclassification work can revise history. Census notes that semiconductor new-orders data are unavailable. Save API/download vintage. |

### Licensing and attribution

Fed and Census series shown here are federal public data; FRED tags INDPRO and AMTMNO “Public Domain: Citation Requested.” Attribute Board of Governors (G.17) or U.S. Census Bureau (M3), exact series ID, adjustment/units, retrieval date, and FRED if used. ISM is the exception: its first-party terms assert copyright/IP protection, personal/non-commercial limits, permission requirements, and anti-automation restrictions. Public visibility is not a data license.

### Common interpretation traps

* INDPRO is **total industry**, not only manufacturing; use IPMAN if the displayed claim says manufacturing.
* An index level of 102 does not mean output grew 102%; calculate a percent change. Re-basing an index does not change growth rates.
* AMTMNO is nominal: inflation can make orders rise while real demand stagnates. Its level is also unsuitable for direct comparison to INDPRO.
* Total orders can be dominated by volatile transportation, defense, or other large-ticket bookings; one month is not a trend.
* New orders may be canceled and do not equal shipments, production, revenue, or jobs.
* PMI is a diffusion index, not percent growth. INDPRO/AMTMNO are licensed-PMI **alternatives**, not transformations or replicas; there is no defensible “50” mapping without a fitted, validated model.
* Industrial activity can weaken while service-heavy household labor markets remain firm, and vice versa. Treat this as an indirect cyclical sensor.

### Three lesson-worthy exercises

1. **Construct comparison:** standardize PMI (for classroom viewing only under applicable terms), INDPRO YoY, and AMTMNO YoY over a limited period. Identify disagreements and explain them through survey diffusion vs output vs nominal order value—not by forcing a conversion formula.
2. **Nominal-to-real orders:** divide AMTMNO by CPIAUCSL (rescaled consistently), calculate YoY for nominal and deflated orders, and find periods where their stress signals disagree. Critique CPI-U as a deflator for producer orders.
3. **Vintage recession alert:** use ALFRED INDPRO and AMTMNO vintages to implement a simple two-signal rule. Compare real-time and revised trigger dates around 2001, 2008, and 2020; then report false positives and the cost of waiting for confirmation.

---

## Cross-series implementation and teaching checklist

1. Store `series_id`, original publisher, delivery provider, units, frequency, seasonal-adjustment status, observation date, release/retrieval timestamp, and vintage.
2. Transform only after validating units and sorting dates. A 12-month change needs the exact month 12 observations earlier, not merely “about 365 days.”
3. Keep weekly ICSA at weekly grain until its four-week mean is built; align to monthly data only after preserving the weekly source dates.
4. Forward-filled quarterly DRSFRMACBS must retain its quarter label and a “last updated” date. Do not count repeated daily values as new evidence.
5. Orient components explicitly: higher UNRATE/ICSA/CPI/delinquency = more stress; lower INDPRO/orders growth = more stress.
6. Fit normalizers only on a declared training window. Report sensitivity to weights, window, winsorization, pandemic extremes, and revised data.
7. Publish source links and plain-language caveats beside each sensor. “Proxy,” “nominal,” “survey,” “bank-held,” and “seasonally adjusted” are material, not footnote trivia.
8. For reproducibility without API keys, FRED keyless CSV URLs are convenient, but the original publisher remains the source and must be credited. For production API access, review [FRED API documentation](https://fred.stlouisfed.org/docs/api/fred/) and its key/terms requirements.
