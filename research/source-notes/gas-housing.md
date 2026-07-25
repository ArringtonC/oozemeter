# OozeMeter source notes: gas prices and housing

_Primary/first-party research only. Sources checked 2026-07-25. This note distinguishes a timely stress **signal** from a complete measure of household welfare; neither topic should be represented as affecting every household equally._

## Recommended launch choices

| Area | Launch metric | Role in a household-stress index | Recommended transform |
|---|---|---|---|
| Gas | EIA U.S. Regular All Formulations Retail Gasoline Price, exposed in FRED as `GASREGW` and in EIA API v2 as series `EMM_EPMR_PTE_NUS_DPG` | Timely, visible out-of-pocket price shock; mostly coincident with what drivers face | Weekly percent change and/or deviation of the **real** price from a rolling baseline; do not score the nominal level alone across decades |
| Housing | Freddie Mac PMMS 30-year fixed mortgage average, FRED `MORTGAGE30US` | Timely financing-pressure/entry-affordability signal for prospective buyers and movers | Weekly level or change, preferably paired later with a price/income measure; label it “new-borrower mortgage conditions,” not “current homeowner burden” |

If OozeMeter can support two housing sensors at launch, add BLS CPI rent of primary residence (`CUSR0000SEHA`, year-over-year change) to cover renters. Keep delinquency, house prices, and inventory as explanatory/validation series at first rather than blending all of them into one supposedly direct burden measure.

---

# 1. Gas prices

## What the launch series measures

[EIA's weekly retail gasoline methodology](https://www.eia.gov/petroleum/gasdiesel/gas_proc-methods.php) defines a volume-weighted estimate of the cash pump price, including federal, state, and local taxes, for regular gasoline. Prices represent 8:00 a.m. local time Monday, usually self-service (full-service where that is the only option). EIA collects regular, midgrade, and premium prices from a stratified sample of retail outlets; the current methodology describes a 1,000-outlet sample, imputation for nonresponse, and publication around 10:00 a.m. ET Tuesday. The national regular-grade response represented by weighted annual sales volume is at least 80% before publication.

The corresponding [FRED `GASREGW` page](https://fred.stlouisfed.org/series/GASREGW) describes the same concept as “US Regular All Formulations Gas Price”: dollars per gallon, not seasonally adjusted, weekly ending Monday. FRED's older note says “approximately 900 retail outlets”; EIA's current methodology says a 1,000-outlet sample. Treat EIA's current methodology as authoritative and avoid hard-coding the older sample count in lesson copy.

## Why it reflects household stress

- Gasoline is frequently purchased and highly salient. A sudden rise immediately reduces cash available for other purchases for households that must drive.
- Exposure is heterogeneous: rural/suburban drivers, long commuters, lower-MPG vehicles, and households with little budget slack are more exposed; transit users and EV households are less exposed.
- The pump price is a **price**, not a household expenditure share. It omits gallons purchased, driving adjustment, vehicle efficiency, income, and regional variation.

## Timing classification

**Coincident, with occasional leading information for broader inflation sentiment.** The observation is what consumers face that Monday and is released the next day. It is not a reliable leading indicator of household distress by itself. Oil/refining shocks can raise it before some downstream prices, but recessions can also push gasoline down while household stress rises; therefore its sign is not a universal business-cycle sign.

## Exact access, cadence, units, coverage, and revisions

### Preferred underlying source: EIA API v2

- Human-readable table: [EIA U.S. weekly gasoline and diesel retail prices](https://www.eia.gov/dnav/pet/pet_pri_gnd_dcus_nus_w.htm).
- Methodology: [Methodology for EIA Weekly Retail Gasoline Price Estimates](https://www.eia.gov/petroleum/gasdiesel/gas_proc-methods.php).
- API documentation and free-key registration: [EIA Open Data API documentation](https://www.eia.gov/opendata/documentation.php). Production calls require a free individual API key; `DEMO_KEY` is useful for examples/testing, not a production dependency.
- Exact API route (substitute the real key):

```text
https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=YOUR_KEY&frequency=weekly&data[0]=value&facets[duoarea][]=NUS&facets[product][]=EPMR&facets[process][]=PTE&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=5000
```

The tested response identifies `series=EMM_EPMR_PTE_NUS_DPG`, description “U.S. Regular All Formulations Retail Gasoline Prices (Dollars per Gallon),” and units `$/GAL`. API v2 returns data values as JSON strings, so parse explicitly as decimal/number. Use explicit sorting and paginate if a request can exceed 5,000 rows.

- **Cadence/lag:** weekly observation for Monday; normally published Tuesday morning (Wednesday after certain federal holidays).
- **Units/adjustment:** current dollars per gallon, taxes included; not seasonally adjusted.
- **Coverage:** national regular series begins 1990-08-20; EIA's table shows 1990-present.
- **Revisions:** the retail-price methodology does not promise an immutable vintage. Weekly estimates are normally used as released, but EIA can correct errors and change methods/samples. A documented break occurred on 2018-05-14: the new sample/method is not directly comparable with 2018-05-07. Preserve ingest timestamp and raw payload; do not silently rewrite a backtest after source corrections.

### Convenience mirror: FRED `GASREGW`

- Metadata/notes: [FRED `GASREGW`](https://fred.stlouisfed.org/series/GASREGW).
- No-key CSV download: [FRED graph CSV for `GASREGW`](https://fred.stlouisfed.org/graph/fredgraph.csv?id=GASREGW).
- Vintage/revision inspection: [ALFRED `GASREGW`](https://alfred.stlouisfed.org/series?seid=GASREGW).
- **Cadence, units, coverage:** weekly ending Monday; dollars per gallon, NSA; 1990-08-20 onward.

### Explicit reconciliation: `GASREGW` vs EIA API

They are **not two independent measurements**. `GASREGW` is FRED's distribution of the underlying EIA national regular-all-formulations retail series; EIA API v2 identifies that source series as `EMM_EPMR_PTE_NUS_DPG`. Matching dates should match values after FRED has ingested the release.

- Choose **EIA API** when first-party provenance, rich route metadata, and fastest direct publication path matter. Cost: a key and more parsing/operational work.
- Choose **FRED CSV** when OozeMeter already uses FRED, needs a keyless stable CSV, or needs ALFRED vintage tools. Cost: an intermediary/cache and the possibility of a short release-ingestion delay.
- Do not average them, count them as two signals, or fail over from one to the other without checking observation date and value. A correct ingestion test joins on `period/date` and asserts equality within display precision, while tolerating the newest EIA row being temporarily absent from FRED.

## Backup metrics

1. **BLS average retail price of regular gasoline — `APU000074714`.** [FRED metadata](https://fred.stlouisfed.org/series/APU000074714); [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=APU000074714); direct BLS public-data API endpoint pattern: `https://api.bls.gov/publicAPI/v2/timeseries/data/APU000074714`. Monthly, U.S. dollars per gallon, NSA, from 1976-01. BLS says average-price data are best for the price level in a month, not price change over time; use the CPI item index for change. This is a useful cross-check but is slower than EIA and has a different sample/concept, so small differences are expected.
2. **BLS CPI-U gasoline (all types) — `CUSR0000SETB01`.** [FRED metadata](https://fred.stlouisfed.org/series/CUSR0000SETB01); [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=CUSR0000SETB01); BLS API endpoint pattern `https://api.bls.gov/publicAPI/v2/timeseries/data/CUSR0000SETB01`. Monthly, seasonally adjusted index (1982-84=100), 1967-present. Best for measuring gasoline price inflation, not a dollar pump price. CPI seasonal factors can be revised; unadjusted `CUUR0000SETB01` is preferable for year-over-year teaching comparisons.
3. **Real gas price derived from EIA + CPI-U all items.** Divide `GASREGW` by CPI-U (`CPIAUCSL` or NSA `CPIAUCNS`) after aligning weekly gas to a monthly period. This is a model-derived measure, not an official EIA series. It makes multi-decade comparisons more meaningful, but alignment and seasonal-adjustment choices must be disclosed.

## Revision and licensing/attribution caveats

- EIA's [copyright and reuse page](https://www.eia.gov/about/copyrights_reuse.php) says U.S. government publications and EIA data/files/databases are public domain and reusable; it requests an acknowledgment including publication date. EIA's logo is trademarked, and third-party/licensed photos or materials on EIA pages are not automatically reusable.
- FRED tags EIA/BLS/Federal Reserve/FHFA/Census government series as “Public Domain: Citation Requested.” Cite the **original publisher and series**, and say “retrieved via FRED” when applicable.
- BLS current CPI seasonally adjusted series and seasonal factors may be revised; most unadjusted CPI indexes are not routinely revised except corrections. Do not mix a revised CPI denominator with a frozen historical gas-price vintage without recording the policy.

## Common interpretation traps

1. **Nominal-level trap:** $3 in 1990 is not economically equivalent to $3 today. Use inflation-adjusted levels or rate-of-change features for long histories.
2. **Seasonality trap:** summer blends/travel, taxes, and regional formulation rules matter; raw weekly levels are NSA.
3. **National-average trap:** a volume-weighted national sample is not the price every household sees.
4. **Exposure trap:** price is not burden. Miles driven, fuel economy, gallons, and income determine household impact.
5. **Cycle-sign trap:** falling gas can accompany recession and rising unemployment. It should not mechanically lower the whole stress index without other signals.
6. **Method-break trap:** flag 2018-05-14; do not teach the week-over-week movement across that boundary as purely economic.
7. **False corroboration:** FRED and EIA versions are the same source, not independent confirmation.

## Three lesson-worthy exercises

1. **Provenance reconciliation lab.** Fetch the last 52 observations from EIA API and FRED CSV, normalize dates/numeric types, outer-join, and classify mismatches as release timing, missing values, or true discrepancies. Students write an assertion that avoids double counting and records source retrieval time.
2. **Nominal vs real stress lab.** Convert weekly `GASREGW` to monthly average, deflate by CPI-U, and compare nominal-level, real-level, month-over-month, and year-over-year stress transforms around 2008, 2020, and 2022. Ask which transform creates the fewest misleading historical claims.
3. **Burden heterogeneity scenario.** Calculate monthly fuel cost for three fictional households using price × miles ÷ MPG, then divide by income. Hold the national pump price constant while changing commute, vehicle, and income. The takeaway is why a national price sensor must not be described as a universal household burden.

---

# 2. Housing

Housing has at least four different constructs: **financing conditions** (mortgage rate), **realized distress** (delinquency), **asset/acquisition price** (HPI), and **market balance** (inventory/months' supply). They move at different times and can point in opposite directions. A high-quality lesson should teach that choosing among them is a construct decision, not just a data-availability decision.

## Best launch metric: Freddie Mac PMMS 30-year fixed rate

### What it measures

The [Freddie Mac Primary Mortgage Market Survey](https://www.freddiemac.com/pmms) reports a national weekly average 30-year fixed mortgage rate based on thousands of loan applications submitted to Freddie Mac through Loan Product Advisor by lenders across the country. Results are released Thursdays at 12 p.m. ET and average offered loan rates from the prior Thursday through Wednesday. On 2022-11-17 Freddie Mac changed PMMS methodology from its prior survey approach to applications submitted by lenders; [FRED's `MORTGAGE30US` notes](https://fred.stlouisfed.org/series/MORTGAGE30US) flag this change.

### Why it reflects stress

A higher rate raises the payment required for a given new loan and reduces the price a payment-constrained buyer can afford. It also creates “rate lock-in,” discouraging owners with old low-rate mortgages from moving. It is highly salient, weekly, and has a long history.

But it is **not the rate paid by all households**. Existing fixed-rate borrowers retain their contract rate, renters do not pay it directly, applicant composition can change, and taxes/insurance/down payment/home price are absent. Call it a new-borrower financing-pressure sensor.

### Timing classification

**Leading for housing transactions and construction; coincident for quoted financing conditions; not a coincident measure of realized household distress.** Rate changes can precede sales, price, construction, delinquency, and measured shelter inflation. The household cash-flow effect is immediate only for a new purchase/refinance or adjustable-rate reset.

### Exact access, cadence, units, coverage, and revisions

- Freddie Mac page/methodology FAQ: [PMMS](https://www.freddiemac.com/pmms).
- Direct historical workbook: [Freddie Mac rates since 1971 XLSX](https://www.freddiemac.com/pmms/docs/historicalweeklydata.xlsx).
- FRED metadata: [`MORTGAGE30US`](https://fred.stlouisfed.org/series/MORTGAGE30US).
- FRED no-key CSV: [download `MORTGAGE30US`](https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US).
- Vintage inspection: [ALFRED `MORTGAGE30US`](https://alfred.stlouisfed.org/series?seid=MORTGAGE30US).
- **Cadence/lag:** weekly ending Thursday; released Thursday noon ET, covering prior Thursday-Wednesday applications.
- **Units/adjustment:** percent, not seasonally adjusted.
- **Coverage:** 1971-04-02 onward.
- **Revisions/method changes:** Freddie Mac does not state on the PMMS landing page that every weekly observation is final and immutable. Store raw weekly snapshots and permit corrections. Explicitly mark the 2022-11-17 methodology change; do not interpret the adjacent-week change as fully like-for-like without checking Freddie Mac's methodological research note. Application-based values also reflect the applicant/lender mix.

### Licensing/attribution

This is the main launch caveat. FRED labels the series copyrighted and says “Copyright, 2016, Freddie Mac. Reprinted with permission.” Freddie Mac's PMMS page says its information may be used with proper attribution and that alteration of the document/content is prohibited; it also provides data “as is” without warranties. Cite “Freddie Mac Primary Mortgage Market Survey®” and link the source. Before shipping a downloadable derivative dataset or redistributing the full history, review [Freddie Mac Terms of Use](https://www.freddiemac.com/terms-of-use) and obtain legal/product approval if needed. A chart of attributed observations is not automatically permission for every form of bulk redistribution.

## Explicit reconciliation: rate vs delinquency vs price vs inventory

| Candidate | Construct and timing | Strength | Why it should/should not launch as the primary stress input |
|---|---|---|---|
| **Mortgage rate (`MORTGAGE30US`)** | Financing condition; leading for activity, coincident for new quotes | Weekly, long history, intuitive and actionable | **Best launch choice** for freshness and pedagogy, but label narrowly; high rates do not raise payments for most existing fixed-rate borrowers |
| **Mortgage delinquency (`DRSFRMACBS`)** | Realized payment failure; lagging outcome | Direct evidence that some borrowers are unable/late to pay | Better as lagging validation/guardrail. Quarterly, delayed, and restricted to single-family residential mortgages booked in domestic offices of commercial banks—not all mortgages or households |
| **Mortgage debt service (`MDSP`)** | Required mortgage payments / aggregate disposable income; coincident-to-lagging burden | Closest first-party aggregate burden concept | Strong backup/validation, but quarterly, modeled/aggregate, available only from 2005 in FRED, and can stay low because the stock of owners has fixed old rates even while new buyers face severe conditions |
| **FHFA purchase-only HPI (`HPIPONM226S`)** | Repeat-sale home-value change; coincident-to-lagging transaction price | Monthly, public first-party, geographically rich | Useful affordability ingredient, not standalone stress. Rising prices hurt buyers but raise owner equity; falling prices help entrants but can signal weak demand/negative equity |
| **New-home months' supply (`MSACSR`)** | For-sale new homes divided by sales rate; often leading/cyclical market balance | Monthly and public; illuminates demand/supply turning points | Context only. It covers **new** homes, not the full housing stock; a high value can mean more supply (helpful) or collapsed sales (stress), so its stress sign is ambiguous |
| **Rent CPI (`CUSR0000SEHA`)** | Change in rents paid for primary residences; lagging/smoothed shelter cost | Covers renters and is monthly | Recommended second housing sensor if scope allows. It is an index/rate-of-change measure, not a rent level or rent-to-income burden, and BLS rent sampling makes it slower-moving than asking rents |

**Decision rule:** launch the mortgage rate because OozeMeter needs a timely signal, but never present it as “housing stress for everyone.” Use delinquency and MDSP to test whether financing pressure eventually becomes realized/aggregate burden. Use HPI and inventory to explain why the same mortgage rate can produce different affordability and market outcomes. Add rent CPI when renter coverage matters more than maintaining a single weekly housing input.

## Backup/source dossiers

### A. Federal Reserve commercial-bank mortgage delinquency — `DRSFRMACBS`

- Metadata: [FRED `DRSFRMACBS`](https://fred.stlouisfed.org/series/DRSFRMACBS); [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=DRSFRMACBS).
- Direct release/table: [Federal Reserve, delinquency rates, all banks, seasonally adjusted](https://www.federalreserve.gov/releases/chargeoff/delallsa.htm).
- Method: [Federal Reserve “About this release”](https://www.federalreserve.gov/releases/chargeoff/about.htm). The rate is delinquent loan dollars divided by outstanding loan dollars, calculated from quarterly Call Reports filed by all commercial banks.
- **Cadence/units:** quarterly, end of period; percent; seasonally adjusted.
- **Coverage:** 1991-Q1 onward.
- **Revision behavior:** Call Report inputs may be amended and historical calculations have been revised for reporting/method changes. Freeze vintages for backtests; ALFRED is available from the FRED page.
- **Trap:** “all commercial banks” does not mean all mortgages. It excludes loans outside the relevant bank-book portfolio and is balance-weighted, not a share of households.
- **License:** Federal Reserve government series is tagged public domain/citation requested; cite the Board release and series ID.

### B. Federal Reserve mortgage debt-service ratio — `MDSP`

- Metadata: [FRED `MDSP`](https://fred.stlouisfed.org/series/MDSP); [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=MDSP).
- Direct source/methodology: [Federal Reserve Household Debt Service and Financial Obligations Ratios](https://www.federalreserve.gov/releases/housedebt/).
- **Measure:** total quarterly required mortgage payments divided by total quarterly disposable personal income.
- **Cadence/units/coverage:** quarterly, seasonally adjusted percent; 2005-Q1 onward in FRED.
- **Revision behavior:** it combines and estimates underlying debt, payment, and income data, which can be revised; treat history as revisable and archive vintages.
- **Trap:** ratio of aggregate totals is not the average household ratio, and it excludes renters. Composition and the stock of fixed-rate loans damp the response to today's quote.
- **License:** Federal Reserve public data; citation requested.

### C. FHFA monthly purchase-only HPI — `HPIPONM226S`

- FRED metadata: [`HPIPONM226S`](https://fred.stlouisfed.org/series/HPIPONM226S); [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=HPIPONM226S).
- FHFA overview/method: [FHFA HPI](https://www.fhfa.gov/data/hpi) and [HPI FAQs](https://www.fhfa.gov/faqs/hpi).
- Exact direct workbook: [U.S. and Census Division monthly purchase-only history XLSX](https://www.fhfa.gov/hpi/download/monthly/hpi_po_monthly_hist.xlsx); dataset catalog: [FHFA HPI datasets](https://www.fhfa.gov/data/hpi/datasets?tab=monthly-data).
- **Measure:** weighted repeat-sales price movement for single-family properties with conforming conventional mortgages purchased/securitized by Fannie Mae or Freddie Mac. Purchase-only uses sales transactions; do not confuse with all-transactions `USSTHPI`, which adds appraisal/refinance data.
- **Cadence/units/coverage:** monthly; seasonally adjusted index, Jan 1991=100; 1991-01 onward. FHFA also provides quarterly/all-transactions data extending to 1975.
- **Revision behavior:** explicitly revises history each release. FHFA receives new originations with about a two-month delay; new repeat transactions and seasoned loans revise prior periods, especially recent ones, and seasonal factors can change.
- **Trap:** an index is not a typical house price; coverage is conforming/Enterprise-linked and repeat-sale properties. Rising HPI has opposite welfare implications for entrants and existing owners.
- **License/attribution:** U.S. government data; cite with type and adjustment, e.g. “Source: FHFA HPI® (purchase-only, seasonally adjusted, nominal).” `FHFA HPI®` is a registered mark; attribution does not imply endorsement.

`USSTHPI` is acceptable when the lesson needs 1975-era coverage: [FRED `USSTHPI`](https://fred.stlouisfed.org/series/USSTHPI), [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=USSTHPI), quarterly NSA index (1980-Q1=100), estimated from sales prices **and appraisal data**. For a clean buyer-acquisition-price concept, prefer purchase-only `HPIPONM226S`.

### D. Census/HUD new-home months' supply — `MSACSR`

- Metadata: [FRED `MSACSR`](https://fred.stlouisfed.org/series/MSACSR); [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=MSACSR).
- Direct program/data: [Census New Residential Sales](https://www.census.gov/construction/nrs/index.html); [Census time-series tool](https://www.census.gov/econ/currentdata/?programCode=RESSALES); [download all New Home Sales data](https://www.census.gov/econ_getzippedfile/?programCodes=RESSALES).
- Method: [Survey of Construction methodology](https://www.census.gov/construction/soc/methodology.html).
- **Measure:** new houses for sale divided by new houses sold; the number of months current new-home inventory would last at the current sales rate if no homes were added.
- **Cadence/units/coverage:** monthly; seasonally adjusted months' supply; 1963-01 onward.
- **Revision behavior:** recent survey estimates are revised as late reports arrive and seasonal factors/benchmarks update; Census visibly republishes corrected tables and revised historical ranges. Snapshot releases rather than assuming the latest file reproduces what users knew at the time.
- **Traps:** denominator effects can spike supply when sales collapse; “inventory” is new single-family homes only; it does not measure listings available to a typical existing-home buyer.
- **License:** Census/HUD U.S. government data are generally public domain; cite both agencies and the release. Agency seals/logos and any third-party page assets are separate.

### E. BLS CPI rent of primary residence — `CUSR0000SEHA`

- Metadata: [FRED `CUSR0000SEHA`](https://fred.stlouisfed.org/series/CUSR0000SEHA); [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=CUSR0000SEHA); direct BLS API pattern `https://api.bls.gov/publicAPI/v2/timeseries/data/CUSR0000SEHA`.
- BLS methods: [CPI Handbook of Methods](https://www.bls.gov/opub/hom/cpi/).
- **Cadence/units/coverage:** monthly, seasonally adjusted index 1982-84=100; 1953-01 onward.
- **Revision behavior:** seasonally adjusted indexes/factors can be revised; use NSA `CUUR0000SEHA` for year-over-year classroom work when vintage stability is important.
- **Traps:** use percent change, not index points as dollars. The rent sample captures contracted rents and therefore lags rapidly changing asking rents; it is not rent-to-income.
- **License:** BLS government data; public domain/citation requested.

## Housing common interpretation traps

1. **Stock vs flow:** today's mortgage quote is a flow price for applicants; most owners' payments reflect an old fixed-rate stock.
2. **Tenure blindness:** a mortgage-only signal ignores renters; rent-only ignores owners and prospective buyers.
3. **Direction ambiguity:** higher home prices burden buyers but benefit incumbent owner equity; falling prices can coexist with recession and default risk.
4. **Inventory denominator:** months' supply can rise because listings increase or because sales collapse.
5. **Coverage slippage:** new-home data are not all listings; bank-book delinquency is not all mortgages; FHFA HPI is not every cash/jumbo transaction.
6. **Rate-only affordability:** payment depends jointly on rate, price, loan size, term, down payment, tax, insurance, and income.
7. **Aggregation:** `MDSP` is a ratio of national totals, not the median household's debt-service ratio.
8. **Lag mismatch:** do not forward-fill quarterly delinquency/MDSP and label it “daily housing stress.” Say the score is recalculated from the latest available observation and expose each component's as-of date.
9. **Revision leakage:** latest revised HPI/Census history in a historical backtest can use information unavailable at the time. Use ALFRED or archived release snapshots.
10. **Copyright assumption:** FRED availability does not make Freddie Mac PMMS unrestricted public-domain data.

## Three lesson-worthy exercises

1. **One rate, different households.** Compute principal-and-interest payment for the same loan at several `MORTGAGE30US` rates, then compare (a) a new buyer, (b) an existing owner with a fixed 3% mortgage, and (c) a renter. Students explain why a national rate shock is leading/large for one group and zero directly for another.
2. **Four constructs, four timelines.** Plot weekly mortgage rates, monthly FHFA HPI year-over-year growth, monthly new-home months' supply, and quarterly bank mortgage delinquency around 2006-10 and 2020-24. Have students label leading/coincident/lagging behavior and write one causal claim the chart **cannot** establish.
3. **Vintage-safe composite design.** Build two housing subindexes: (A) rate only and (B) rate + rent CPI + lagged delinquency. Enforce as-of dates and compare latest-revised vs real-time-vintage backtests. Require a leave-one-input-out table and a written decision on whether delinquency belongs in the live score or only validates it.

---

## Implementation/teaching checklist

- Display source, exact series ID, units, adjustment, frequency, observation date, retrieval date, and transformation beside every chart.
- Keep underlying observations separate from derived scores; preserve raw payloads and hashes/ingest timestamps.
- Mark known method breaks (`GASREGW` 2018-05-14; PMMS 2022-11-17).
- Never treat source mirrors as independent corroboration.
- Use vintage data or archived releases for claims about what OozeMeter “would have shown” historically.
- Phrase output precisely: “weekly new-borrower mortgage conditions” and “weekly national regular gasoline price,” not “real-time household costs.”
- Document weights as heuristic unless validated; run leave-one-input-out and episode tests across oil shocks, recessions, and housing booms/busts.
