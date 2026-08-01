# Sector Watch quote-rights review — 2026-08-01

## Decision: not cleared

No source reviewed here establishes permission for OOZEMeter to retrieve the 11 Sector Watch ETF proxies and repeatedly publish the resulting 22- and 64-session percentage changes and states in a public Git repository. The quote-rights gate therefore stays closed.

`market.yml` remains manual-only. The existing Yahoo collector remains the current no-fee operator-dispatched route; this review does **not** clear that route for scheduled collection or establish publication rights. The rejected stale-input cadence was not restored. A later engineering batch instead made the manual cycle refresh `research/market-backtest.json` before rebuilding divergence and descriptive anchor evidence, while the daily household workflow can only realign against the latest already-approved Market history. The refreshed backtest is cryptographically attested by GitHub's OIDC/Sigstore-backed artifact-attestation service before any downstream evidence is derived; the signed bundle is verified against the exact file and retained with the run's outputs. A separate consistency gate rejects stale source months, mismatched exact-month divergence, or JSON/Markdown anchor output that does not reproduce from the attested acquisition. This closes the stale-lineage defects in Tasks 3 and 4 without pretending that Task 2's rights gate is resolved or enabling a schedule.

This is a conservative rights decision, not a conclusion that every rejected source forbids every possible use. Where the reviewed first-party material did not affirmatively cover OOZEMeter's use, the result is “permission not established.”

## What was evaluated

| Candidate | First-party evidence | Result for this panel |
|---|---|---|
| Yahoo Finance | Yahoo's [general Terms of Service](https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html) prohibit automated access or collection without Yahoo's express prior permission. Yahoo's [API Terms of Use](https://legal.yahoo.com/us/en/yahoo/terms/product-atos/apitnc/index.html) require credentials and limit use to what Yahoo expressly permits. | **Not cleared.** The undocumented chart transport currently used by the manual collector has neither established permission nor API credentials. |
| Stooq | The first-party [Stooq site](https://stooq.com/) did not yield a retrievable terms grant during this review because access met its JavaScript challenge. Its crawl-visible footer attributes U.S.-exchange data to Infront. | **Not established.** No usable first-party redistribution grant was recovered. This is not a finding that Stooq prohibits the panel; it is a finding that permission could not be verified. |
| Alpha Vantage | The standard [Terms of Service](https://www.alphavantage.co/terms_of_service/) grant personal, non-commercial use unless otherwise agreed in writing. [Premium membership](https://www.alphavantage.co/premium/) describes access and call capacity, while the separate [market-data policy](https://www.alphavantage.co/realtime_data_policy/) directs business/commercial users to sales. | **Not cleared.** Neither a free-tier nor premium-page public-display or redistribution grant covering this recurring public panel was established. |
| Tiingo | Tiingo's [Terms of Use](https://api.tiingo.com/tos/) address Derived Products in §1.6 and API redistribution in §7.3. Its [pricing page](https://www.tiingo.com/about/pricing) labels individual and internal-commercial plans for internal use, while the [EOD product page](https://www.tiingo.com/products/end-of-day-stock-price-data) separately offers display/redistribution licensing. | **Closest candidate, but not cleared.** The public terms do not unambiguously authorize this exact output and retention pattern without Tiingo's written confirmation or an active display/redistribution license. |
| FRED or official-series twins | FRED's [Terms of Use](https://fred.stlouisfed.org/legal/terms/) say third-party copyrighted series still require the owner's permission and that FRED cannot grant it. FRED tags relevant equity-index material [“Copyrighted: Pre-Approval Required”](https://fred.stlouisfed.org/tags/series?ob=pv&od=desc&rt=s%26p+dow+jones+indices+llc&t=copyrighted%3A+pre-approval+required%3Bs%26p+dow+jones+indices+llc%3Bstock+market); [NASDAQCOM](https://fred.stlouisfed.org/series/NASDAQCOM) is another example carrying third-party rights conditions. | **No clean 11-proxy replacement established.** FRED transport does not remove the original owner's conditions, the reviewed index series do not recreate all 11 ETF roles, and no public first-party permission was found covering automated quote retrieval and redistribution for the complete ETF panel. Official issuer product pages or rosters are not, by themselves, a quote-redistribution license. |

## Why Tiingo is not yet a “yes”

Tiingo §1.6 names percentage returns and classifications as examples of outputs that can qualify as Derived Products when they are neither a substitute for Tiingo data nor reasonably reconstructible. The same section says its examples are not a safe harbor and warns that an accumulating sequence of percentage outputs can fail the test. Sector Watch would commit rounded 22- and 64-session values for 11 tickers on a recurring schedule. Even if each snapshot contains no raw price, the public Git sequence is persistent and reconstructible enough to create a material §1.6 risk.

Section 7.3 separately says API data are for internal use and that redistribution requires special permission and additional fees, with prescribed Tiingo attribution when redistribution is permitted. Thus §1.6's possible Derived Product path does not safely resolve §7.3 for this project: the exact recurring panel and its public history need an affirmative written determination, or OOZEMeter needs the separate display/redistribution license described on Tiingo's [EOD product page](https://www.tiingo.com/products/end-of-day-stock-price-data).

## Return basis and corporate actions if Tiingo is licensed

This policy is conditional; it does not authorize collection now.

1. Retrieve Tiingo EOD `adjClose`, not raw `close`. Tiingo's [EOD documentation](https://www.tiingo.com/documentation/end-of-day) describes adjusted fields and its split- and dividend-adjustment method.
2. Compute the 22- and 64-session changes from `adjClose`. Label them **split- and cash-dividend-adjusted returns**. Do not call them “price returns,” and remove the current “distributions not reinvested” description when this source actually replaces Yahoo.
3. Run after Tiingo's documented evening exchange-correction window. If a later correction or corporate-action adjustment changes an input, rebuild the affected states, percentages, and downstream breadth from the corrected adjusted series rather than patching a display value.
4. Keep raw observations transient unless the active license expressly permits storage. Persist only the approved derived output and the provenance needed to audit it, and follow Tiingo's required “Data sourced by Tiingo” attribution unless written terms approve another form.

## Exact unlock conditions

The gate may be reopened only after **one** of these is retained with the project records:

- written Tiingo confirmation that explicitly covers this exact 11-ticker product: recurring rounded 22- and 64-session percentage outputs, classifications/states, public display, and their accumulating public Git history, and that reconciles the use with §§1.6 and 7.3; or
- an active Tiingo EOD display/redistribution license whose written terms explicitly cover those outputs, public display, and Git-history retention.

After that evidence exists, a separate implementation batch must:

1. configure the licensed API credential without committing it;
2. replace Yahoo with transient Tiingo `adjClose` retrieval, schedule collection after the correction window, retain only license-approved derived output, and record the agreed attribution and return basis;
3. update and pass the collector, output, integrity, and workflow tests; and
4. only then enable `market.yml`, preserving the required refresh order: sectors first, then market, because market breadth reads `sectors.json`.

Until every applicable condition is satisfied, the scheduled workflow remains disabled. Under the operator's 2026-08-01 no-fee-source constraint, no reviewed source provides both the existing panel's analytical equivalence and an explicit recurring-publication grant. The defensible interim operation is therefore manual-only: refresh and cryptographically attest the exact Market backtest, apply the frozen Ward calibration without auto-tuning, regenerate exact shared-month divergence, regenerate descriptive anchor evidence, and require the signed acquisition and all outputs to reconcile before commit. Tasks 3 and 4 have that fail-closed manual path; Task 2 remains an external rights blocker and must not be represented as cleared.
