# OOZEMeter Intake-Line Resources

This file is the curated source registry for the OOZEMeter teaching workspace. The machine-readable acquisition map is [`data-source-registry.json`](data-source-registry.json).

## Completed primary-source dossiers

- [`source-notes/gas-housing.md`](source-notes/gas-housing.md) — EIA/FRED gas reconciliation; mortgage-rate, rent, delinquency, debt-service, price, and inventory constructs.
- [`source-notes/credit-auto.md`](source-notes/credit-auto.md) — card flow/stock/loss distinctions and the NY Fed auto-specific replacement for `DRCLACBS`.
- [`source-notes/labor-inflation-foreclosure-manufacturing.md`](source-notes/labor-inflation-foreclosure-manufacturing.md) — labor, CPI, mortgage-distress proxy, and public manufacturing alternatives to licensed PMI.

Detailed series-level citations are maintained in those dossiers and promoted into the machine-readable registry after verification.

## Knowledge

### Cross-cutting

- [FRED — Federal Reserve Bank of St. Louis](https://fred.stlouisfed.org/)
  Primary discovery and download surface for many public U.S. economic series. Use for: observations, source notes, units, frequency, and release metadata.
- [FRED API documentation](https://fred.stlouisfed.org/docs/api/fred/)
  First-party API reference. Use for: reproducible collection, series metadata, observations, and release calendars.
- [Bureau of Labor Statistics data](https://www.bls.gov/data/)
  Primary source for employment and consumer-price statistics. Use for: definitions, release tables, methodology, revisions, and APIs.
- [Federal Reserve data downloads](https://www.federalreserve.gov/data.htm)
  First-party Federal Reserve datasets. Use for: bank credit and delinquency definitions when the source is the Board rather than FRED.
- [New York Fed Center for Microeconomic Data](https://www.newyorkfed.org/microeconomics)
  Primary household debt and credit publications. Use for: credit-card, auto-loan, mortgage, balance, and delinquency analysis.

### Energy and housing

- [U.S. Energy Information Administration Open Data](https://www.eia.gov/opendata/)
  First-party fuel-price API and documentation. Use for: national retail gasoline observations and petroleum-series metadata.
- [Freddie Mac Primary Mortgage Market Survey](https://www.freddiemac.com/pmms)
  Primary weekly mortgage-rate publication. Use for: 30-year fixed mortgage rates, methodology, and release timing.
- [Federal Housing Finance Agency datasets](https://www.fhfa.gov/data)
  Primary house-price and mortgage-market data. Use for: national and state-level house-price research.

### Labor, prices, and production

- [Department of Labor unemployment insurance data](https://oui.doleta.gov/unemploy/claims.asp)
  Primary weekly unemployment-claims tables. Use for: claims definitions, revisions, and release context.
- [Federal Reserve Industrial Production](https://www.federalreserve.gov/releases/g17/)
  Primary G.17 release. Use for: manufacturing output definitions, revisions, and historical tables.
- [Census Manufacturers' Shipments, Inventories, and Orders](https://www.census.gov/manufacturing/m3/)
  Primary factory-orders release. Use for: new orders as a free manufacturing-demand sensor.

## Wisdom (Communities)

- [FRED Blog](https://fredblog.stlouisfed.org/)
  First-party worked examples showing how economists interpret and transform FRED series. Use for: interpretation patterns, not as a substitute for series metadata.

## Gaps

- Final series-level citation and reuse notes for every line.
- A first-party, free auto-loan delinquency series with the exact desired denominator and history.
- A free national foreclosure-filings feed; launch currently expects a mortgage-delinquency proxy.
- Final ruling on whether manufacturing and foreclosures remain auxiliary sensors or receive formula weights.
