# Credit cards and auto loans as household-stress signals

Primary-source research notes for OozeMeter. Sources are limited to the Federal Reserve Board/FRED, the Federal Reserve Bank of New York (FRBNY), and CFPB. URLs and workbook locations were checked against the Q1 2026 releases available in July 2026.

## Bottom line for launch

| Area | Recommended launch input | Why | Backup / validation |
|---|---|---|---|
| Credit cards | **FRED `DRCCLACBS` — delinquency rate on credit-card loans at all commercial banks** | Directly measures payment failure; simple keyless CSV; quarterly, seasonally adjusted; 1991-present history; operationally stable | FRBNY **flow into 30+ delinquency, CC** (latest Household Debt and Credit XLSX, `Page 13 Data`, column `CC`) for broader credit-report coverage and earlier turning points; FRBNY **90+ balance share, CC** (`Page 12 Data`) for severity; `CORCCACBS` for lagged loss validation |
| Auto loans | **FRBNY flow into 30+ delinquency, AUTO** (latest XLSX, `Page 13 Data`, column `AUTO`) | Auto-specific, includes bank and auto-finance/dealer loans that appear on credit reports, and measures new distress rather than the accumulated stock | FRBNY **flow into 90+**, `Page 14 Data`; FRBNY **90+ balance share**, `Page 12 Data`; use G.19 new-auto APR only as a leading affordability-pressure context series |

**Do not launch an “auto delinquency” component using `DRCLACBS`.** It is a defensible *broad consumer-loan stress* series, but not a defensible auto-specific proxy. The label is “consumer loans,” not “auto loans”; its numerator and denominator include credit cards and other consumer loans at commercial banks, and it excludes auto loans held by credit unions, captive/dealer finance companies, and other nonbanks. FRBNY explicitly defines auto loans as both “Auto Bank” and “Auto Finance” loans and is therefore the correct primary source for an auto-specific national stress input.

A useful modeling choice is to retain both recommended series at quarterly cadence, publish the observation quarter and retrieval/release date separately, and avoid forward-filling them as though a repeated value were a new daily observation.

---

## Concepts that must not be conflated

| Concept | What it answers | Typical timing | Denominator / unit | Interpretation trap |
|---|---|---|---|---|
| **Delinquency rate (stock)** | “What share of balances is currently late?” | Coincident-to-lagging | Delinquent dollar balance / outstanding dollar balance, percent | Can fall because bad debt is charged off or the denominator grows—not because borrowers improved |
| **Transition into delinquency (flow)** | “What share of previously non-delinquent balances became newly delinquent this period?” | Early coincident; tends to lead the stock and charge-offs | New delinquent balance / prior-quarter balance not already delinquent, percent | Not the same as the number or share of people missing a payment; FRBNY uses balance-weighted transitions and special netting for nonmortgage debt |
| **Balance** | “How much debt is outstanding?” | Exposure/context, not a pure stress clock | Dollars, usually billions/trillions | Rises with prices, spending, population, access, and nominal growth; a higher balance is not automatically more distress |
| **APR / finance rate** | “What does new or revolving borrowing cost?” | Leading pressure, but indirect | Percent interest rate | A new-loan quote does not measure the effective rate on the existing loan stock, payment size, approval rate, or delinquency |
| **Charge-off rate** | “What losses did lenders recognize as uncollectible?” | Lagging | Net charge-offs during quarter / average loans, annualized percent | A lender accounting action, net of recoveries; it is neither the delinquency stock nor the household’s first missed payment |

The Board defines delinquent loans as loans **30 days or more past due and still accruing interest plus loans in nonaccrual status**; its delinquency rate is delinquent dollar amount divided by total outstanding in the same category ([Board release](https://www.federalreserve.gov/releases/chargeoff/), [methodology](https://www.federalreserve.gov/releases/chargeoff/about.htm)). The Board defines charge-offs as loans removed from the books and charged against loss reserves; published charge-off rates are annualized and net of recoveries.

FRBNY defines “90+” as balances 90–119 days late, 120+ days late, or severely derogatory. Its transition rate is new (seriously) delinquent balance divided by the previous quarter’s balance that was not already (seriously) delinquent. For nonmortgage products such as cards and autos, “new delinquent balance” is based on the **net increase in aggregate delinquent balances across that person’s accounts of the loan type**, not a literal account-by-account roll rate ([FRBNY data dictionary](https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/pdf/data_dictionary_HHDC.pdf)).

---

# Credit cards

## What the metrics measure and why they reflect stress

Credit cards are revolving, typically variable-rate, unsecured debt used for day-to-day expenses, purchases, and cash advances ([CFPB definition](https://www.consumerfinance.gov/data-research/consumer-credit-trends/credit-cards/)). A missed card payment is a direct revealed inability or unwillingness to meet a near-term obligation. Because cards are unsecured and often repriced quickly with market rates, delinquency can react sooner than defaults on secured debt. It is still not a complete welfare measure: households may prioritize auto or mortgage payments over cards, and underwriting/composition changes can move aggregate rates.

### Best operational launch metric: `DRCCLACBS`

- **Series:** Delinquency Rate on Credit Card Loans, All Commercial Banks (`DRCCLACBS`).
- **Primary metadata:** [FRED series page](https://fred.stlouisfed.org/series/DRCCLACBS); original publisher is the Federal Reserve Board’s [Charge-Off and Delinquency Rates release](https://www.federalreserve.gov/releases/chargeoff/).
- **Exact data:** keyless CSV [`fredgraph.csv?id=DRCCLACBS`](https://fred.stlouisfed.org/graph/fredgraph.csv?id=DRCCLACBS). The documented FRED API alternative is `https://api.stlouisfed.org/fred/series/observations?series_id=DRCCLACBS&file_type=json&api_key=YOUR_KEY` ([API docs](https://fred.stlouisfed.org/docs/api/fred/series_observations.html)).
- **Cadence/lag:** quarterly, end of period; source data come from quarterly FFIEC Call Reports and become available about 60 days after quarter-end ([Board methodology](https://www.federalreserve.gov/releases/chargeoff/about.htm)).
- **Units/denominator:** percent, seasonally adjusted; delinquent card-loan dollar amount divided by total card-loan dollars outstanding at reporting commercial banks.
- **Coverage:** 1991 Q1-present in the checked CSV.
- **Timing:** coincident-to-lagging. It recognizes 30+ day delinquency, but the stock persists until cure, payoff, sale, or charge-off.
- **Why launch with it:** the concept is direct, the endpoint is stable, the history spans multiple cycles, and seasonality is already treated.
- **Coverage caveat:** lender-side commercial-bank reporting is not the same universe as all consumer credit files. It can be affected by which institutions own or securitize balances and by portfolio sales.

### Preferred early-warning/construct check: FRBNY CC transition into 30+

- **Series location:** [Household Debt and Credit landing page](https://www.newyorkfed.org/microeconomics/hhdc) → latest underlying-data workbook. Checked file: [`hhd_c_report_2026q1.xlsx`](https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/xls/hhd_c_report_2026q1.xlsx), worksheet **`Page 13 Data`**, date in column A and **`CC`** in column C. Chart/report title: “Flow into Early Delinquency (30+) by Loan Type” / underlying sheet title “New Delinquent Balances by Loan Type.”
- **Cadence/units:** quarterly, percent. New 30+ delinquent card balance divided by the prior quarter’s card balance not already 30+ delinquent.
- **Coverage:** 2003 Q1-present in the checked national sheet.
- **Timing:** early coincident and normally earlier than the 90+ stock or charge-off rate. A new 30-day failure must occur before the same balance can become 90+ or be charged off.
- **Universe:** FRBNY Consumer Credit Panel/Equifax; nationally representative panel of people with a Social Security number and credit report. It is consumer-credit-report based rather than restricted to commercial-bank Call Reports.
- **Operational drawback:** no stable series API; the quarter-stamped XLSX filename changes, and its workbook structure must be validated on every release.

### Backup and contextual metrics

1. **FRBNY percent of card balance 90+ days delinquent:** same XLSX, **`Page 12 Data`**, column **`CC`** (column E in the checked workbook), quarterly percent, 2003 Q1-present. This is a severe, lagging stock measure and a good “is early stress becoming serious?” check.
2. **FRBNY flow into serious delinquency (90+):** same XLSX, **`Page 14 Data`**, column **`CC`** (column C), quarterly percent, 2003 Q1-present. This is a severe flow; later than 30+ but less mechanically persistent than the 90+ stock.
3. **Credit-card charge-offs:** FRED [`CORCCACBS`](https://fred.stlouisfed.org/series/CORCCACBS), keyless [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=CORCCACBS), quarterly SA percent, 1985 Q1-present. It is annualized, net of recoveries, and lagging. Use for validation, not as the first household-stress alarm.
4. **Card APR:** FRED [`TERMCBCCALLNS`](https://fred.stlouisfed.org/series/TERMCBCCALLNS) (“all accounts”) or the more burden-relevant [`TERMCBCCINTNS`](https://fred.stlouisfed.org/series/TERMCBCCINTNS) (“accounts assessed interest”); keyless CSVs substitute the ID in `https://fred.stlouisfed.org/graph/fredgraph.csv?id=SERIES_ID`. FRED labels these monthly, NSA percent, with coverage beginning November 1994, but the CSV history is sparse (127 nonmissing observations through May 2026, roughly quarterly for much of the span); code must preserve missing months rather than silently forward-fill them. APR is leading cost pressure, not repayment failure.
5. **Card balances/limits:** FRBNY XLSX **`Page 10 Data`** (`Credit Card Balance`, `Available Credit`, `Limit`), quarterly trillions of dollars, 2003 Q1-present. Balance divided by limit can teach utilization, but the data dictionary warns that limits can use highest-ever balance when the reported limit is missing, likely overstating utilization. A simpler total-balance series is also in **`Page 3 Data`**, column `Credit Card`.
6. **CFPB originations (context only):** monthly number and aggregate limits of new cards—not delinquency. Exact CSVs: [number](https://files.consumerfinance.gov/data/consumer-credit-trends/credit-cards/num_data_CRC.csv) and [volume/limits](https://files.consumerfinance.gov/data/consumer-credit-trends/credit-cards/vol_data_CRC.csv), from the [origination page](https://www.consumerfinance.gov/data-research/consumer-credit-trends/credit-cards/origination-activity/). CFPB explicitly marks the latest six months as not final; the checked page also labels projected values. Do not feed projections into the observed stress index.

## Revisions and comparability

- Board/FRED series can be revised when Call Reports are corrected and when seasonal factors or historical methods change. The Board methodology documents a material reporting/methodology change in 2001 and revisions to earlier history. Use [ALFRED vintages for `DRCCLACBS`](https://alfred.stlouisfed.org/series?seid=DRCCLACBS) for reproducible backtests; store retrieval date and raw CSV hash.
- The FRBNY site publishes a new quarter-stamped workbook and may modify content/methods. Its terms expressly reserve the right to modify content, methods, schedules, and revision practices. No vintage API is advertised. Archive each workbook used. A spot comparison of the Q4 2025 and Q1 2026 workbooks found no changes in shared history on Pages 3, 12, 13, or 14, but that is evidence for one release pair—not a no-revision guarantee.
- Credit-report reporting practices matter: inactive/stale accounts are excluded, not all creditors update long-derogatory accounts, and results represent people with credit reports. The current technical note describes a 5% base panel and a 0.1% analysis subsample for most charts ([technical notes](https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/pdf/Technical_Notes_HHDC.pdf)).

## Common interpretation traps

- `DRCCLACBS = 3%` means roughly 3% of **reported card-loan dollars**, not 3% of cardholders or accounts.
- FRBNY’s 30+ transition denominator excludes balances already delinquent; it is not comparable to the stock’s all-balance denominator.
- A falling 90+ stock alongside rising charge-offs may reflect bad balances leaving the stock.
- Rising nominal card balances may mean higher prices or spending rather than distress; normalize or pair with delinquency.
- `TERMCBCCALLNS` includes accounts that may not revolve; “accounts assessed interest” is closer to borrowers carrying interest-bearing balances, but neither is a household payment-rate series.
- Comparing raw Board SA rates to FRBNY report series without documenting seasonal treatment and universe differences can create false precision.

## Three lesson-worthy credit-card exercises

1. **Flow, stock, loss pipeline.** Download FRBNY `Page 13 Data` CC 30+ flow and `Page 12 Data` CC 90+ stock plus FRED `CORCCACBS`. Standardize each series over a fixed training window, plot them around 2007–10 and 2020–23, and test lead/lag correlations from -4 to +4 quarters. Students must explain why chronology, denominator, and lender accounting—not just correlation—support 30+ → 90+ → charge-off.
2. **A denominator can tell a different story.** In the FRBNY workbook combine card balance and limit from `Page 10 Data`, card 90+ stock from Page 12, and card 30+ flow from Page 13. Find quarters where balance growth and delinquency disagree. Have students write two honest headlines for the same quarter and identify which quantity is exposure, which is incidence, and which is severity.
3. **Real-time backtest versus hindsight.** Retrieve current `DRCCLACBS`, then use ALFRED to select historical vintages. Recompute a simple z-score alert using only observations available by each simulated date. Compare turning points with a hindsight series and document revisions/publication lag. The deliverable is a provenance table with observation date, release/retrieval date, vintage, and transformation.

---

# Auto loans

## What the metrics measure and why they reflect stress

An auto loan is closed-end credit used to finance a new or used vehicle, with the vehicle as collateral ([CFPB definition](https://www.consumerfinance.gov/data-research/consumer-credit-trends/auto-loans/)). Payments are fixed and the vehicle may be necessary for employment, so missed payments are a strong revealed-stress event; repossession risk also makes households likely to prioritize auto payments. That priority can make auto delinquency a somewhat later signal than cards for some households, but a rise in *new* auto delinquency is still an incisive measure of payment strain.

### Best launch metric: FRBNY AUTO transition into 30+

- **Exact data:** [Household Debt and Credit landing page](https://www.newyorkfed.org/microeconomics/hhdc) → checked [`hhd_c_report_2026q1.xlsx`](https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/xls/hhd_c_report_2026q1.xlsx) → worksheet **`Page 13 Data`**, date column A, **`AUTO`** column B.
- **Definition:** new 30+ delinquent auto balance as a percent of the prior quarter’s auto balance not already 30+ delinquent. For nonmortgage debt, FRBNY calculates the new amount from the person-level net increase in aggregate delinquent balance for the loan type.
- **Cadence/units:** quarterly percent; report/workbook typically appears several weeks after quarter-end.
- **Coverage:** 2003 Q1-present in the checked national sheet.
- **Universe:** Auto Bank loans from banks/credit unions/savings institutions **and** Auto Finance loans from dealers and auto-finance companies, as reported to Equifax. This breadth is the decisive advantage over commercial-bank-only data.
- **Timing:** early coincident. It should lead 90+ transition/stock and ultimate charge-off or repossession, but it does not necessarily lead labor-income shocks that cause the missed payment.

### Backup auto metrics

1. **FRBNY flow into serious delinquency (90+):** same XLSX, **`Page 14 Data`**, column `AUTO` (B), quarterly percent, 2003 Q1-present. Severe flow; more lagged than 30+.
2. **FRBNY percent of auto balance 90+ delinquent:** **`Page 12 Data`**, column `AUTO` (D), quarterly percent, 2003 Q1-present. Severe stock; strongest intuitive backup but mechanically persistent and affected by charge-offs/cures.
3. **FRBNY auto balance:** **`Page 3 Data`**, column `Auto Loan`, quarterly trillions of dollars, 2003 Q1-present. This is exposure, not stress. `Page 8 Data` adds quarterly origination dollars by risk-score band (2004 Q1-present in the checked workbook); `Page 9 Data` has origination score percentiles (1999 Q2-present). Note that the checked Q1 2026 workbook flags a VantageScore 4.0 switch for some mortgage material, while its auto-score note still says Equifax Risk Score 3.0; validate score notes each release before longitudinal use.
4. **New-auto finance rate:** FRED [`RIFLPBCIANM60NM`](https://fred.stlouisfed.org/series/RIFLPBCIANM60NM), keyless [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=RIFLPBCIANM60NM), monthly NSA percent, August 2006-present; 72-month alternative [`RIFLPBCIANM72NM`](https://fred.stlouisfed.org/series/RIFLPBCIANM72NM), [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=RIFLPBCIANM72NM), August 2015-present. These are commercial-bank rates on **new-auto originations**, not APRs on the full outstanding auto-loan stock and not used-auto/captive-finance market coverage. Treat as leading affordability pressure only.
5. **CFPB originations (context only):** [monthly loan count CSV](https://files.consumerfinance.gov/data/consumer-credit-trends/auto-loans/num_data_AUT.csv) and [monthly dollar-volume CSV](https://files.consumerfinance.gov/data/consumer-credit-trends/auto-loans/vol_data_AUT.csv), from the [auto origination page](https://www.consumerfinance.gov/data-research/consumer-credit-trends/auto-loans/origination-activity/). These measure loans opened to purchase or refinance new/used autos, not payment distress. As with CFPB card data, late observations can be projected/not final.

## Is `DRCLACBS` a defensible auto-loan proxy?

**Answer: only for a deliberately labeled “commercial-bank consumer-loan delinquency” context series; no for an auto-loan component.**

- FRED’s exact title is [“Delinquency Rate on Consumer Loans, All Commercial Banks” (`DRCLACBS`)](https://fred.stlouisfed.org/series/DRCLACBS), not auto loans. Keyless [CSV](https://fred.stlouisfed.org/graph/fredgraph.csv?id=DRCLACBS); quarterly end-of-period, SA percent; 1987 Q1-present.
- The Board’s release separates “consumer loans” and “credit cards,” but does not publish an all-lender auto-specific delinquency series. “Consumer loans” is an umbrella portfolio class. It therefore moves with the mix and performance of cards and other consumer credit, not solely vehicles.
- Its institution universe is commercial banks. FRBNY’s auto definition includes banks, credit unions, dealers, and automobile finance companies. Captive and independent finance lenders are economically important precisely where an auto-stress index needs coverage.
- A longer history and convenient FRED endpoint do not repair construct validity. Mapping `DRCLACBS` to a UI label “auto delinquency” would be a provenance error.
- If used at all, label it exactly, treat it as a broad backup/context indicator, and never combine it with `DRCCLACBS` without testing double counting because card loans are part of consumer lending exposure.

## Revisions, coverage, and attribution

FRBNY methodology/revision cautions are the same as for cards: quarterly credit-report panel, inactive trades excluded, creditor reporting practices can alter measured status, and the latest workbook is mutable rather than a vintage API. Archive quarter-stamped source files and record worksheet/column mappings. CFPB explicitly warns that its newest six months can be non-final; do not interpret projections as observed originations.

FRED tags the Board series above **“Public Domain: Citation Requested.”** FRED’s [terms](https://fred.stlouisfed.org/legal/) request citation of both the original source and FRED, preservation of any copyright notice, and prohibit implying endorsement; commercial reuse has additional conditions. Suggested form: “Board of Governors of the Federal Reserve System (US), [series title] [ID], retrieved from FRED, Federal Reserve Bank of St. Louis.”

The New York Fed’s [Terms of Use](https://www.newyorkfed.org/privacy/termsofuse) grant a non-exclusive license to use, copy, and distribute content for personal or business purposes subject to conditions. For Household Debt and Credit data, the required source attribution is exactly **“New York Fed Consumer Credit Panel / Equifax.”** Do not strip the Equifax attribution, imply FRBNY endorsement, or reproduce FRBNY branding as OozeMeter branding. The data dictionary itself bears a New York Fed copyright notice and Equifax trademark notice.

CFPB is a federal source, but the dashboards identify their source as the **CFPB Consumer Credit Information Panel**. Preserve that attribution and link to the exact dashboard/CSV; do not assume that “government website” removes third-party panel-data conditions. These notes are a provenance review, not legal advice.

## Common interpretation traps

- A 30+ transition of 8% is a percent of previously non-delinquent **balance**, not 8% of drivers, borrowers, loans, or cars.
- Auto delinquency can rise because underwriting shifted toward riskier borrowers or used-car loan sizes/terms changed, even before economy-wide stress rises; that composition effect is real lender/borrower stress but not purely macroeconomic.
- A falling 90+ stock can coincide with more repossessions or charge-offs as severe balances leave the denominator/numerator.
- Auto balance growth can reflect vehicle-price inflation, longer maturities, or more borrowers. It is not itself proof of hardship.
- A 60- or 72-month new-auto bank rate is not a market-wide auto APR, monthly payment, used-car rate, or average coupon on existing loans.
- `DRCLACBS` cannot be relabeled “auto delinquency.” Commercial-bank scope and umbrella-product scope both fail the label.
- FRBNY’s credit-report population excludes people without a credit report/SSN and can miss inactive or no-longer-updated derogatory trades.

## Three lesson-worthy auto-loan exercises

1. **Proxy audit: does `DRCLACBS` earn the auto label?** Join quarterly `DRCLACBS` to FRBNY AUTO 30+ flow and AUTO 90+ stock. Compare levels, changes, turning points, and correlations over the common 2003-present window. Students produce a one-page construct-validity memo covering product universe, lender universe, denominator, seasonal adjustment, and timing; the correct conclusion must distinguish “correlated” from “measures the same thing.”
2. **Affordability pressure versus realized distress.** Aggregate monthly `RIFLPBCIANM60NM` to quarter averages, lag it 0–8 quarters, and compare with FRBNY AUTO 30+ and 90+ flows. Students identify where rate increases fail to predict delinquency and propose omitted variables (loan size, term, underwriting, income, used-car prices) without claiming causality from a bivariate chart.
3. **Three faces of the same auto cycle.** From the FRBNY workbook use auto balance (`Page 3`), auto originations by risk-score band (`Page 8`), and AUTO 30+/90+ transitions (`Pages 13–14`). Build an episode table for the Great Recession, pandemic forbearance/stimulus period, and post-pandemic normalization. For each episode, students must state whether a movement represents exposure, credit supply/composition, early payment stress, or severe payment stress—and select only one series for an index to avoid double counting.

---

## Implementation/provenance checklist

1. Discover the latest FRBNY workbook link from the [Household Debt and Credit page](https://www.newyorkfed.org/microeconomics/hhdc); do not blindly increment a filename.
2. Save the raw quarter-stamped XLSX, retrieval timestamp, SHA-256, report quarter, sheet name, header text, and source attribution.
3. Assert expected headers (`AUTO`, `CC`) and units before extraction; fail closed if sheets move.
4. For FRED, archive the raw CSV and use ALFRED vintages for backtests. Store observation date separately from release/retrieval date.
5. Keep all inputs quarterly at launch. If the public product refreshes daily, say “recalculated from the latest quarterly observation,” not “daily credit data.”
6. Publish metric labels that name the universe and denominator: e.g., “Commercial-bank card delinquent balance share” and “Share of previously current auto balance entering 30+ delinquency.”
7. Never average or splice Board and FRBNY levels as though they were interchangeable. If changing source, treat it as a methodology break and backfill consistently.
