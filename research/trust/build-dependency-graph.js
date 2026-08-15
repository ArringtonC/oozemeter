#!/usr/bin/env node
/* Builds data/dependency-graph.json for the OOZEMeter trust layer.
   Every node and edge below was derived by reading scripts/collect.js,
   scripts/backtest.js, scripts/lib/methodology.js, scripts/collect-market.js,
   scripts/backtest-market.js, scripts/lib/*.js, scripts/story.js,
   scripts/stamp.js, scripts/integrity.js, scripts/narrative-check.js,
   lab.js and index.html line by line. Provenance is carried on each edge. */
const fs = require('fs');
const path = require('path');

/* Regenerate: node research/trust/build-dependency-graph.js [repoRoot] [commit]
   The prose fragments live beside this file as circular.json / unverifiable.json
   so the narrative and the machine-readable graph cannot drift apart. */
const ROOT = process.argv[2] || path.resolve(__dirname, '..', '..');
const COMMIT = process.argv[3] || (() => {
  try { return require('child_process').execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).trim() }
  catch { return 'unknown' }
})();

const nodes = [];
const edges = [];
const N = (id, kind, label, extra = {}) => { nodes.push({id, kind, label, ...extra}); return id; };
const E = (from, to, op, at, note) => { edges.push({from, to, op, at, ...(note ? {note} : {})}); };

/* ========================= RAW SERIES ========================= */
const fredRaw = (id, publisher, metric, cadence, wings, extra = {}) =>
  N(`raw:fred:${id}`, 'raw_series', metric, {
    seriesId: id, publisher, transport: 'FRED (keyed API, documented CSV fallback)',
    nativeCadence: cadence, wings, url: `https://fred.stlouisfed.org/series/${id}`, ...extra,
  });

fredRaw('UNRATE', 'U.S. Bureau of Labor Statistics', 'Civilian unemployment rate', 'monthly', ['household']);
fredRaw('ICSA', 'U.S. Department of Labor', 'Initial jobless claims', 'weekly', ['household']);
fredRaw('CPIAUCNS', 'U.S. Bureau of Labor Statistics', 'CPI-U all items, not seasonally adjusted', 'monthly', ['household'],
  {caution: 'Feeds TWO household sensors: inflation (year-over-year) and gas (deflator + global rebase level).'});
fredRaw('MORTGAGE30US', 'Freddie Mac', '30-year fixed mortgage rate', 'weekly', ['household']);
fredRaw('DRSFRMACBS', 'Federal Reserve Board', 'Residential mortgage delinquency at commercial banks', 'quarterly', ['household'],
  {caution: 'Feeds the WEIGHTED housing line AND the zero-weight foreclosures line. This is defect D1.'});
fredRaw('DRCCLACBS', 'Federal Reserve Board', 'Credit-card loan delinquency at commercial banks', 'quarterly', ['household']);
fredRaw('GASREGW', 'U.S. Energy Information Administration', 'U.S. regular gasoline retail price', 'weekly', ['household']);
fredRaw('NFCI', 'Federal Reserve Bank of Chicago', 'National Financial Conditions Index', 'weekly', ['household', 'ward'],
  {caution: 'The ONLY raw series shared by the household jar and Ward M. Fetched twice through two different parsers.'});
fredRaw('INDPRO', 'Federal Reserve Board', 'Total industrial production', 'monthly', ['household'],
  {caution: 'Also named as a PARKED Ward M sensor ("industry INDPRO", scripts/collect-market.js:15). Un-parking it would create a second cross-wing shared series.'});
fredRaw('AMTMNO', 'U.S. Census Bureau', "Manufacturers' new orders, total manufacturing", 'monthly', ['household'],
  {caution: 'Display-only. Collector variables call it shipmentsMonth/shipmentsYoY (scripts/collect.js:156-157) — AMTMNO is NEW ORDERS, not shipments.'});
N('raw:nyfed:HHDC_AUTO_30PLUS', 'raw_series', 'Previously current auto balance entering 30+ delinquency', {
  seriesId: 'NYFED_AUTO_30PLUS', publisher: 'Federal Reserve Bank of New York',
  transport: 'NY Fed HHDC xlsx workbook, worksheet "Page 13 Data", column AUTO',
  nativeCadence: 'quarterly', wings: ['household'],
  caution: 'A FLOW (transition into 30+), not a stock delinquency rate. Published prose calls it "auto-loan delinquency".',
});

fredRaw('T10Y3M', 'Federal Reserve Board yield inputs via FRED', '10-year minus 3-month Treasury spread', 'daily', ['ward']);
fredRaw('VIXCLS', 'Cboe', 'VIX close', 'daily', ['ward']);
fredRaw('DCOILWTICO', 'U.S. Energy Information Administration', 'WTI crude spot, Cushing OK', 'daily', ['ward']);
fredRaw('DTWEXBGS', 'Federal Reserve Board', 'Broad nominal U.S. dollar index', 'daily', ['ward']);

const TICKERS = ['SPY', 'QQQ', 'DIA', 'IWM', 'XLF', 'XLI', 'IYT', 'XLY', 'XLP', 'SMH', 'XLV'];
for (const sym of TICKERS) {
  N(`raw:yahoo:${sym}`, 'raw_series', `${sym} quote.close`, {
    seriesId: sym, publisher: 'Exchange close via Yahoo Finance chart endpoint',
    transport: 'https://query1.finance.yahoo.com/v8/finance/chart/{ticker} (undocumented; quote rights unresolved)',
    nativeCadence: 'daily', wings: ['ward'],
    caution: 'Price return, distributions not reinvested. Live gauge uses 22-session daily interval; the research backtest uses successive MONTHLY closes — two non-identical transforms behind one gauge name.',
  });
}

/* ========================= DERIVED SERIES ========================= */
const monthlyMean = (id, at, note) => {
  const nid = `derived:monthly-mean:${id}`;
  N(nid, 'derived_series', `${id} calendar-month arithmetic mean`, {transform: 'monthly-mean', at, ...(note ? {note} : {})});
  E(`raw:fred:${id}`, nid, 'monthly-mean', at, note);
  return nid;
};
for (const id of ['UNRATE', 'CPIAUCNS', 'MORTGAGE30US', 'DRSFRMACBS', 'DRCCLACBS', 'GASREGW', 'INDPRO', 'AMTMNO'])
  monthlyMean(id, 'scripts/lib/fred.js:38-41');
monthlyMean('NFCI', 'scripts/lib/fred.js:38-41',
  'Household copy. Ward M computes its own monthly mean through a SEPARATE parser (scripts/lib/market-series.js:29-34).');

N('derived:trailing4wk:ICSA', 'derived_series', 'Initial claims, trailing four-week mean keyed to the month of the 4th observation', {
  transform: 'trailing-4wk-mean', at: 'scripts/lib/methodology.js:200-210',
  caution: 'The window may straddle months: up to three of the four weeks can belong to the PRIOR calendar month. The monthly key is the month of the last observation only.',
});
E('raw:fred:ICSA', 'derived:trailing4wk:ICSA', 'trailing-4wk-mean', 'scripts/lib/methodology.js:200-210');
E('raw:fred:ICSA', 'derived:trailing4wk:ICSA', 'overwrite-monthly-mean', 'scripts/collect.js:83',
  'S.ICSA.monthly produced by fred.js is discarded and replaced.');

N('derived:claims-4wk-display:ICSA', 'derived_series', 'Mean of the last four weekly claims observations (display only)', {
  transform: 'mean-of-last-4-observations', at: 'scripts/collect.js:144-145',
  caution: 'A SECOND, different four-week mean from derived:trailing4wk:ICSA. This one is not month-keyed and is published as lines.jobs.secondary.value; it never touches the score.',
});
E('raw:fred:ICSA', 'derived:claims-4wk-display:ICSA', 'mean-of-last-4', 'scripts/collect.js:144-145');

N('derived:nyfed-quarter-to-month:AUTO', 'derived_series', 'NY Fed AUTO quarter label mapped to quarter-start month', {
  transform: 'quarter-to-month', at: 'scripts/lib/methodology.js:133-139',
});
E('raw:nyfed:HHDC_AUTO_30PLUS', 'derived:nyfed-quarter-to-month:AUTO', 'quarter-to-month', 'scripts/lib/methodology.js:133-139');

const ffill = (label, from, at) => {
  const nid = `derived:forward-fill:${label}`;
  N(nid, 'derived_series', `${label} forward-filled to every month 2003-01..now`, {
    transform: 'forward-fill', at,
    caution: 'Ex-post reconstruction. Every month between two quarterly observations carries the OLDER observation, so a stress delta can be identically zero for two months and then step.',
  });
  E(from, nid, 'forward-fill', at);
  return nid;
};
ffill('DRSFRMACBS', 'derived:monthly-mean:DRSFRMACBS', 'scripts/collect.js:67,95');
ffill('DRCCLACBS', 'derived:monthly-mean:DRCCLACBS', 'scripts/collect.js:67,96');
ffill('NYFED_AUTO_30PLUS', 'derived:nyfed-quarter-to-month:AUTO', 'scripts/collect.js:67,97');

N('derived:yoy:CPIAUCNS', 'derived_series', 'CPI-U same-month year-over-year percent change', {
  transform: 'year-over-year', at: 'scripts/lib/methodology.js:224-230',
  inputMonths: ['m', 'm-12'],
});
E('derived:monthly-mean:CPIAUCNS', 'derived:yoy:CPIAUCNS', 'yoy', 'scripts/lib/methodology.js:224-230');

N('derived:latest-observation:CPIAUCNS', 'derived_series', 'cpiNow — the newest CPI-U observation value, used as the rebase level for the whole gas history', {
  transform: 'latest-observation', at: 'scripts/collect.js:98 (backtest.js:92 uses the last monthly MEAN — equivalent for a monthly series, but a second code path)',
  caution: 'GLOBAL. Every historical gas stress is expressed in TODAY-dollars, so one new CPI print re-indexes the entire gas line and can move published history. integrity.js:50-54 names this "the instrument re-indexing itself".',
});
E('raw:fred:CPIAUCNS', 'derived:latest-observation:CPIAUCNS', 'latest-observation', 'scripts/collect.js:98');

N('derived:real-price:GAS', 'derived_series', 'Gas price in current dollars: GASREGW[m] × cpiNow ÷ CPIAUCNS[m]', {
  transform: 'cpi-deflate-and-rebase', at: 'scripts/collect.js:113 / scripts/backtest.js:113',
  caution: 'THE TRANSITIVE DEPENDENCY MOST READERS WOULD MISS: CPI is an input to the gas sensor, twice.',
});
E('derived:monthly-mean:GASREGW', 'derived:real-price:GAS', 'deflate-numerator', 'scripts/collect.js:113');
E('derived:latest-observation:CPIAUCNS', 'derived:real-price:GAS', 'rebase-level', 'scripts/collect.js:113');
E('derived:monthly-mean:CPIAUCNS', 'derived:real-price:GAS', 'deflate-denominator', 'scripts/collect.js:113');

N('derived:yoy:INDPRO', 'derived_series', 'Industrial production same-month year-over-year percent change', {
  transform: 'year-over-year', at: 'scripts/collect.js:152-153',
  caution: 'Evaluated at INDPRO\'s OWN latest month, not at the headline score month M.',
});
E('derived:monthly-mean:INDPRO', 'derived:yoy:INDPRO', 'yoy', 'scripts/collect.js:152-153');

N('derived:yoy:AMTMNO', 'derived_series', "Manufacturers' new orders same-month year-over-year percent change", {
  transform: 'year-over-year', at: 'scripts/collect.js:156-157', scored: false,
});
E('derived:monthly-mean:AMTMNO', 'derived:yoy:AMTMNO', 'yoy', 'scripts/collect.js:156-157');

N('derived:latest-observation:DRSFRMACBS', 'derived_series', 'Newest mortgage-delinquency observation and the one before it', {
  transform: 'latest-observation-pair', at: 'scripts/collect.js:147-149',
  caution: 'The foreclosures line scores the LAST OBSERVATION and its predecessor — a QUARTER-over-quarter move — while the housing line scores the FORWARD-FILLED value at the headline month M. Same raw series, two different vintages and two different time steps.',
});
E('raw:fred:DRSFRMACBS', 'derived:latest-observation:DRSFRMACBS', 'latest-observation-pair', 'scripts/collect.js:147-149');

/* ---- Ward M derived ---- */
const wardMonthly = (id, at) => {
  const nid = `derived:monthly-mean-ward:${id}`;
  N(nid, 'derived_series', `${id} calendar-month arithmetic mean (Ward M parser)`, {transform: 'monthly-mean', at});
  E(`raw:fred:${id}`, nid, 'monthly-mean', at);
  return nid;
};
for (const id of ['T10Y3M', 'VIXCLS', 'NFCI', 'DCOILWTICO', 'DTWEXBGS'])
  wardMonthly(id, 'scripts/lib/market-series.js:29-34');
nodes.find(n => n.id === 'derived:monthly-mean-ward:NFCI').caution =
  'ALIAS: same raw series as derived:monthly-mean:NFCI, computed by a second parser with different validation. Two derived nodes, one raw node.';

N('derived:yoy:DTWEXBGS', 'derived_series', 'Broad dollar index year-over-year percent change', {
  transform: 'year-over-year', at: 'scripts/collect-market.js:40',
});
E('derived:monthly-mean-ward:DTWEXBGS', 'derived:yoy:DTWEXBGS', 'yoy', 'scripts/collect-market.js:40');

for (const sym of TICKERS) {
  N(`derived:session-change-22:${sym}`, 'derived_series', `${sym} 22-session price change`, {
    transform: '22-session-change', at: 'scripts/lib/market-sector.js:53',
  });
  E(`raw:yahoo:${sym}`, `derived:session-change-22:${sym}`, 'session-change-22', 'scripts/lib/market-sector.js:53');
  N(`derived:state:${sym}`, 'derived_series', `${sym} state: steady / softening / stressed`, {
    transform: 'threshold-classify', at: 'scripts/collect-sectors.js:44',
    rule: '>= -2% steady; >= -7% and < -2% softening; < -7% stressed',
  });
  E(`derived:session-change-22:${sym}`, `derived:state:${sym}`, 'threshold-classify', 'scripts/collect-sectors.js:44');
  E(`derived:state:${sym}`, 'derived:breadth-counts', 'count', 'scripts/collect-sectors.js:60');
}
N('derived:breadth-counts', 'derived_series', 'Sector Watch counts: steady / softening / stressed / total=11', {
  transform: 'count', at: 'scripts/collect-sectors.js:53-69',
});
N('derived:weakness-share', 'derived_series', 'Weakness share = (0.5 × softening + stressed) ÷ 11 × 100', {
  transform: 'weighted-share', at: 'scripts/collect-market.js:111',
});
E('derived:breadth-counts', 'derived:weakness-share', 'weighted-share', 'scripts/collect-market.js:111');
E('derived:breadth-counts', 'derived:sector-overall', 'threshold-classify', 'scripts/collect-sectors.js:67');
N('derived:sector-overall', 'derived_series', 'Sector Watch overall label: CALM / MIXED / SOFTENING / STRESSED', {
  transform: 'threshold-classify', at: 'scripts/collect-sectors.js:67',
});

/* ========================= SENSORS + STRESS ========================= */
const sensor = (wing, slug, label, weight, opts = {}) => {
  const sid = `sensor:${wing}:${slug}`;
  N(sid, 'sensor', label, {wing, slug, weight, ...opts});
  const st = `stress:${wing}:${slug}`;
  N(st, 'stress_value', `${label} stress 0-100`, {wing, slug});
  return {sid, st};
};

/* --- household weighted --- */
const jobs = sensor('household', 'jobs', 'Employment', 24.25, {
  weightKey: 'employment (backtest.js) / jobs (collect.js) — SAME LINE, TWO KEYS',
  displayValue: 'UNRATE last observation', combiner: 'Math.max',
  at: 'scripts/collect.js:108',
});
E('derived:monthly-mean:UNRATE', jobs.sid, 'anchor-interp[unemployment]', 'scripts/collect.js:108');
E('derived:trailing4wk:ICSA', jobs.sid, 'anchor-interp[claimsK]', 'scripts/collect.js:108');
E(jobs.sid, jobs.st, 'max', 'scripts/collect.js:108',
  'Math.max(unemployment-branch, claims-branch). Both branches are structurally upstream in every month; only one is the argmax in any given month.');

const housing = sensor('household', 'housing', 'Housing', 19.40, {
  displayValue: 'MORTGAGE30US last observation', combiner: 'Math.max',
  at: 'scripts/collect.js:110',
  caution: 'DEFECT D1 ORIGIN. The displayed value is the mortgage RATE only; the stress may be driven entirely by the delinquency branch.',
});
E('derived:monthly-mean:MORTGAGE30US', housing.sid, 'anchor-interp[mortgageRate]', 'scripts/collect.js:110');
E('derived:forward-fill:DRSFRMACBS', housing.sid, 'anchor-interp[mortgageDelinq]', 'scripts/collect.js:110',
  'D1: the "independent" foreclosures diagnostic is one of housing\'s own two inputs.');
E(housing.sid, housing.st, 'max', 'scripts/collect.js:110');

const credit = sensor('household', 'credit', 'Credit Cards', 19.40, {displayValue: 'DRCCLACBS last observation', at: 'scripts/collect.js:111'});
E('derived:forward-fill:DRCCLACBS', credit.sid, 'anchor-interp[cardDelinq]', 'scripts/collect.js:111');
E(credit.sid, credit.st, 'anchor-interp', 'scripts/collect.js:111');

const auto = sensor('household', 'auto', 'Auto Loans', 14.55, {displayValue: 'NY Fed AUTO last observation', at: 'scripts/collect.js:112'});
E('derived:forward-fill:NYFED_AUTO_30PLUS', auto.sid, 'anchor-interp[auto30Plus]', 'scripts/collect.js:112');
E(auto.sid, auto.st, 'anchor-interp', 'scripts/lib/methodology.js:212-222');

const gas = sensor('household', 'gas', 'Gas Prices', 9.70, {
  displayValue: 'GASREGW last observation (NOMINAL)', at: 'scripts/collect.js:113',
  caution: 'The displayed pump price is nominal; the scored value is CPI-deflated and rebased to the newest CPI print.',
});
E('derived:real-price:GAS', gas.sid, 'anchor-interp[gasReal]', 'scripts/collect.js:113');
E(gas.sid, gas.st, 'anchor-interp', 'scripts/collect.js:113');

const inflation = sensor('household', 'inflation', 'Inflation', 9.70, {displayValue: 'CPI YoY at CPI last month', at: 'scripts/collect.js:109'});
E('derived:yoy:CPIAUCNS', inflation.sid, 'anchor-interp[inflationYoY]', 'scripts/collect.js:109');
E(inflation.sid, inflation.st, 'anchor-interp', 'scripts/collect.js:109');

const financial = sensor('household', 'financial', 'Financial Conditions', 3.00, {
  displayValue: 'NFCI monthly mean at NFCI last month (may be a PARTIAL month)', at: 'scripts/collect.js:114',
  caution: 'Display month (nfciMonth = newest NFCI month) and stress month (headline month M) differ.',
});
E('derived:monthly-mean:NFCI', financial.sid, 'anchor-interp[financialConditions]', 'scripts/collect.js:114');
E(financial.sid, financial.st, 'anchor-interp', 'scripts/lib/methodology.js:51-53');

/* --- household auxiliary (zero weight) --- */
const foreclosures = sensor('household', 'foreclosures', 'Mortgage Distress', 0, {
  auxiliary: true, calibrationStatus: 'provisional-auxiliary', at: 'scripts/collect.js:177-180',
  caution: 'Reads DRSFRMACBS — the same series as housing\'s second branch. NOT independent of housing.',
});
E('derived:latest-observation:DRSFRMACBS', foreclosures.sid, 'anchor-interp[mortgageDelinq]', 'scripts/collect.js:148-149');
E(foreclosures.sid, foreclosures.st, 'anchor-interp', 'scripts/collect.js:178');

const manufacturing = sensor('household', 'manufacturing', 'Manufacturing', 0, {
  auxiliary: true, calibrationStatus: 'provisional-auxiliary', at: 'scripts/collect.js:181-185',
  caution: 'Scored on INDPRO only. AMTMNO is displayed as secondary and carries NO weight in the stress value.',
});
E('derived:yoy:INDPRO', manufacturing.sid, 'anchor-interp[MANUFACTURING_YOY_ANCHORS]', 'scripts/collect.js:154-155');
E('derived:yoy:AMTMNO', manufacturing.sid, 'display-only', 'scripts/collect.js:185',
  'PUBLISHED BUT NOT SCORED. This edge must be excluded from any stress-level independence query; it is included here because it reaches a reader surface.');
E(manufacturing.sid, manufacturing.st, 'anchor-interp', 'scripts/collect.js:154');
edges.find(e => e.from === 'derived:yoy:AMTMNO' && e.to === manufacturing.sid).scored = false;

/* --- Ward M gauges --- */
const wardGauges = [
  ['rates', 'Rates', 'derived:monthly-mean-ward:T10Y3M'],
  ['volatility', 'Volatility', 'derived:monthly-mean-ward:VIXCLS'],
  ['credit', 'Credit & Funding', 'derived:monthly-mean-ward:NFCI'],
  ['energy', 'Energy', 'derived:monthly-mean-ward:DCOILWTICO'],
  ['dollar', 'Dollar', 'derived:yoy:DTWEXBGS'],
  ['breadth', 'Breadth', 'derived:weakness-share'],
];
for (const [slug, label, input] of wardGauges) {
  const g = sensor('ward', slug, label, 100 / 6, {
    equalWeighted: true, at: 'scripts/collect-market.js:56-84,111-129',
    ...(slug === 'credit' ? {caution: 'Same raw series (NFCI) as household sensor:household:financial. NAME COLLISION: "credit" also names a household sensor that reads DRCCLACBS.'} : {}),
  });
  E(input, g.sid, 'anchor-interp', 'scripts/collect-market.js:94');
  E(g.sid, g.st, 'anchor-interp+round', 'scripts/collect-market.js:94-95');
}

/* ========================= WEIGHTS / CONTRIBUTIONS / SCORE ========================= */
const HH_WEIGHTED = ['jobs', 'housing', 'credit', 'auto', 'gas', 'inflation', 'financial'];
const HH_AUX = ['foreclosures', 'manufacturing'];

N('constant:calibration:household:v3', 'constant', 'CALIBRATION_V3 a=1.418684348943213 b=-23.96514845099034 (FROZEN)', {
  at: 'scripts/lib/methodology.js:27',
  note: 'Derived once from the 7 weighted lines over 2003-2025 (calm=10, GFC peak=90) and frozen. No auxiliary series contributed. Changing it restates published history.',
});
N('constant:calibration:ward', 'constant', 'FROZEN_WARD_CALIBRATION a=1.402462618842267 b=-7.011551886296619', {
  at: 'scripts/lib/market-backtest.js:3-9',
  note: 'A truncated local copy {a:1.4025,b:-7.0116} lived in collect-market.js until 2026-08-14 and published a different rounded score on 10 raw values. Same two-copies failure class as the household calibration.',
});

for (const slug of HH_WEIGHTED) {
  N(`weight:household:${slug}`, 'weight', `METHODOLOGY_V3_WEIGHTS.${slug === 'jobs' ? 'employment' : slug}`, {
    at: 'scripts/lib/methodology.js:11-19', value: {jobs: 24.25, housing: 19.40, credit: 19.40, auto: 14.55, gas: 9.70, inflation: 9.70, financial: 3.00}[slug],
  });
  E(`stress:household:${slug}`, 'derived:weighted-sum:household', 'weight-multiply-and-sum', 'scripts/collect.js:118,127');
  E(`weight:household:${slug}`, 'derived:weighted-sum:household', 'weight-multiply-and-sum', 'scripts/collect.js:118,127');
}
for (const slug of HH_AUX)
  N(`weight:household:${slug}`, 'weight', `${slug} scoreWeight = 0`, {at: 'scripts/collect.js:179,183', value: 0});

N('derived:weighted-sum:household', 'derived_series', 'wsum = Σ weightₖ × stressₖ over the seven weighted lines', {
  at: 'scripts/collect.js:118,127',
  caution: 'THE NORMALIZER. Every contribution is a share of this sum, so contribₖ depends on ALL SEVEN lines, not just line k.',
});
N('score:household:composite', 'score', 'Raw composite = wsum ÷ 100', {at: 'scripts/collect.js:118'});
E('derived:weighted-sum:household', 'score:household:composite', 'divide-100', 'scripts/collect.js:118');
N('score:household:ooze', 'score', 'Ooze Score 0-100 (headline, month M = last complete month)', {at: 'scripts/collect.js:117,124'});
E('score:household:composite', 'score:household:ooze', 'calibrate+clamp+round', 'scripts/collect.js:117,124');
E('constant:calibration:household:v3', 'score:household:ooze', 'calibrate', 'scripts/collect.js:117');
N('score:household:prevOoze', 'score', 'Prior-month Ooze Score (month P)', {at: 'scripts/collect.js:124'});
E('score:household:composite', 'score:household:prevOoze', 'calibrate+clamp+round[month P]', 'scripts/collect.js:124');
N('score:household:history', 'score', 'data/history.json — every complete month, calibrated', {at: 'scripts/collect.js:252-253,270'});
E('score:household:composite', 'score:household:history', 'calibrate-per-month', 'scripts/collect.js:252-253');
N('delta:household:ooze', 'derived_series', 'Headline delta = ooze − prevOoze', {at: 'scripts/story.js:76'});
E('score:household:ooze', 'delta:household:ooze', 'subtract', 'scripts/story.js:76');
E('score:household:prevOoze', 'delta:household:ooze', 'subtract', 'scripts/story.js:76');

for (const slug of [...HH_WEIGHTED, ...HH_AUX]) {
  N(`contribution:household:${slug}`, 'contribution', `${slug} ounces`, {
    at: slug === 'foreclosures' || slug === 'manufacturing' ? 'scripts/collect.js:189-190 (always 0)' : 'scripts/collect.js:129-135',
    method: 'floor(ooze × wₖstressₖ / wsum) then largest-remainder to foot exactly to ooze',
  });
  if (HH_WEIGHTED.includes(slug)) {
    E(`stress:household:${slug}`, `contribution:household:${slug}`, 'proportional-share', 'scripts/collect.js:129-131');
    E(`weight:household:${slug}`, `contribution:household:${slug}`, 'proportional-share', 'scripts/collect.js:129-131');
    E('derived:weighted-sum:household', `contribution:household:${slug}`, 'normalize', 'scripts/collect.js:130',
      'Coupling: this makes every other weighted line transitively upstream of THIS line\'s ounces.');
    E('score:household:ooze', `contribution:household:${slug}`, 'scale-to-headline', 'scripts/collect.js:130');
  }
  N(`delta:household:${slug}`, 'derived_series', `${slug} stress delta`, {
    at: slug === 'foreclosures' ? 'scripts/collect.js:178' : slug === 'manufacturing' ? 'scripts/collect.js:182' : 'scripts/collect.js:136-138',
    timeStep: slug === 'foreclosures' ? 'newest DRSFRMACBS observation vs the one before it — a QUARTER step'
      : slug === 'manufacturing' ? "newest INDPRO month vs the month before it — MAY NOT BE THE HEADLINE MONTH M"
      : 'round(stress[M]) − round(stress[P]) — headline month step',
  });
  E(`stress:household:${slug}`, `delta:household:${slug}`, 'subtract-rounded', 'scripts/collect.js:136-138');
}

N('band:household', 'band', 'Smooth / Sticky / Slippery / Oozing / Overflowing', {at: 'scripts/story.js:20, scripts/stamp.js:10, lab.js levelOf'});
E('score:household:ooze', 'band:household', 'threshold-classify', 'scripts/story.js:20');
N('tier:household', 'band', 'STABLE / OBSERVATION / CONTAINMENT WATCH / CONTAINMENT WARNING / OVERFLOW RISK / NATIONAL MESS', {at: 'scripts/stamp.js:11'});
E('score:household:ooze', 'tier:household', 'threshold-classify', 'scripts/stamp.js:11');
N('flag:household:oozemaxing', 'derived_series', 'oozemaxing = every weighted stress ≥ 60', {at: 'scripts/collect.js:264'});
for (const slug of HH_WEIGHTED) E(`stress:household:${slug}`, 'flag:household:oozemaxing', 'all-at-least-60', 'scripts/collect.js:264');

N('score:ward:raw', 'score', 'Ward raw = mean of the six gauge stresses', {at: 'scripts/collect-market.js:133'});
for (const [slug] of wardGauges) E(`stress:ward:${slug}`, 'score:ward:raw', 'mean-of-six', 'scripts/collect-market.js:133');
N('score:ward:score', 'score', 'Market Ooze 0-100', {at: 'scripts/collect-market.js:134'});
E('score:ward:raw', 'score:ward:score', 'calibrate+clamp+round', 'scripts/collect-market.js:134');
E('constant:calibration:ward', 'score:ward:score', 'calibrate', 'scripts/collect-market.js:46,134');
N('band:ward', 'band', 'Ward band, reusing the household BANDS scale', {at: 'scripts/stamp.js:113'});
E('score:ward:score', 'band:ward', 'threshold-classify', 'scripts/stamp.js:113');

N('derived:divergence:market-minus-household', 'derived_series', 'divergence = ward score − household score, exact shared months only', {
  at: 'scripts/lib/market-divergence.js:12-29',
  caution: 'A JOIN of two instruments. raw:fred:NFCI is upstream of BOTH columns, so divergence is not a comparison of two disjoint measurement systems.',
});
E('score:ward:score', 'derived:divergence:market-minus-household', 'join+subtract', 'scripts/build-market-divergence.js:20');
E('score:household:history', 'derived:divergence:market-minus-household', 'join+subtract', 'scripts/build-market-divergence.js:20');

/* ========================= GATE / PROVENANCE NODES ========================= */
N('artifact:revisions', 'artifact', 'data/revisions.json — logged changes to published history', {at: 'scripts/integrity.js:38-75'});
E('score:household:history', 'artifact:revisions', 'diff-vs-git-HEAD', 'scripts/integrity.js:34,38-44');
N('artifact:gate-status', 'artifact', 'data/gate-status.json — integrity verdict', {at: 'scripts/integrity.js:151-159'});
E('score:household:ooze', 'artifact:gate-status', 'plausibility-and-calibration-checks', 'scripts/integrity.js:104-144');
E('score:household:history', 'artifact:gate-status', 'calibration-invariants', 'scripts/integrity.js:104-110');
N('artifact:vintage', 'artifact', 'data/vintages/<inputFingerprint>.json', {at: 'scripts/collect.js:271-295'});
for (const id of ['UNRATE', 'ICSA', 'CPIAUCNS', 'MORTGAGE30US', 'DRSFRMACBS', 'DRCCLACBS', 'GASREGW', 'NFCI', 'INDPRO', 'AMTMNO'])
  E(`raw:fred:${id}`, 'artifact:vintage', 'fingerprint', 'scripts/collect.js:198-201,229');
E('raw:nyfed:HHDC_AUTO_30PLUS', 'artifact:vintage', 'fingerprint', 'scripts/collect.js:202-209');

/* ========================= EDITORIAL CLAIMS ========================= */
const claim = (id, text, opts) => N(`claim:${id}`, 'editorial_claim', text, opts);

claim('editorial:verdict', 'Calmer/More stressed than N of every 10 months since 2003', {at: 'scripts/story.js:37-40'});
E('score:household:ooze', 'claim:editorial:verdict', 'template', 'scripts/story.js:37-40');
E('score:household:history', 'claim:editorial:verdict', 'template', 'scripts/story.js:37-40');

for (const slug of [...HH_WEIGHTED, ...HH_AUX]) {
  claim(`editorial:line:${slug}`, `Per-line sentence for ${slug} (moveClass verb + VALUE_CLAUSE)`, {
    at: 'scripts/story.js:50-68',
    caution: 'VALUE_CLAUSE glues the line\'s DISPLAY value to the line\'s STRESS DELTA. For gas, housing, jobs and financial these two have different as-of dates and different aggregations.',
  });
  E(`delta:household:${slug}`, `claim:editorial:line:${slug}`, 'template', 'scripts/story.js:56-64');
  E(`sensor:household:${slug}`, `claim:editorial:line:${slug}`, 'display-value-template', 'scripts/story.js:24-34');
}

claim('editorial:story', 'The household story paragraph (s1 + s2 + s3)', {at: 'scripts/story.js:80-94'});
for (const slug of HH_WEIGHTED) {
  E(`contribution:household:${slug}`, 'claim:editorial:story', 'template', 'scripts/story.js:80');
  E(`delta:household:${slug}`, 'claim:editorial:story', 'template', 'scripts/story.js:82-89');
}
E('score:household:ooze', 'claim:editorial:story', 'token{{s:M}}', 'scripts/story.js:79,92-93');
E('band:household', 'claim:editorial:story', 'template', 'scripts/story.js:92-93');

claim('editorial:summary', 'Executive summary', {at: 'scripts/story.js:97'});
E('claim:editorial:verdict', 'claim:editorial:summary', 'template', 'scripts/story.js:97');
E('band:household', 'claim:editorial:summary', 'template', 'scripts/story.js:97');
E('delta:household:ooze', 'claim:editorial:summary', 'template', 'scripts/story.js:97');

claim('editorial:noticed', '"What a household would notice" bridge paragraph', {at: 'scripts/story.js:236-251'});
for (const slug of ['gas', 'inflation', 'jobs']) E(`delta:household:${slug}`, 'claim:editorial:noticed', 'threshold-template', 'scripts/story.js:239-244');
E('stress:household:jobs', 'claim:editorial:noticed', 'threshold-template', 'scripts/story.js:243');
E('delta:household:ooze', 'claim:editorial:noticed', 'threshold-template', 'scripts/story.js:236');

claim('editorial:confidence', 'Confidence statement', {at: 'scripts/story.js:226-232'});
E('artifact:revisions', 'claim:editorial:confidence', 'count', 'scripts/story.js:224-225');
E('artifact:gate-status', 'claim:editorial:confidence', 'assertion', 'scripts/story.js:231',
  'The sentence "the integrity gate verified plausibility bounds and calibration anchors before publication" is a STRING LITERAL in story.js — it does not read data/gate-status.json. Same failure class stamp.js:18-32 already fixed for the placard.');

/* --- cross-checks --- */
claim('editorial:crosscheck:pair-legality', 'Implicit claim: the comparison series carries no score weight and is not an input to the line it checks', {
  at: 'scripts/story.js:116-124 (a PROSE COMMENT, not an executable check)',
  caution: 'CC_PAIRS is a hand-maintained literal. Nothing in code proves the pair is disjoint. This graph exists to replace that comment.',
});
claim('editorial:crosscheck:same-month', 'Published claim: "Over the same month <comparison series> …"', {
  at: 'scripts/story.js:196,201',
  caution: 'Not enforced anywhere. delta:household:manufacturing steps over INDPRO\'s own latest month pair; delta:household:jobs steps over the headline month pair.',
});
claim('editorial:crosscheck:rows', 'Per-line cross-check row: checked / result (agrees | mixed | disagrees | not checked) / rule', {at: 'scripts/story.js:139-172'});
E('delta:household:jobs', 'claim:editorial:crosscheck:rows', 'compare-direction-and-magnitude', 'scripts/story.js:157-167');
E('delta:household:manufacturing', 'claim:editorial:crosscheck:rows', 'compare-direction-and-magnitude', 'scripts/story.js:157-167');
E('sensor:household:jobs', 'claim:editorial:crosscheck:pair-legality', 'hand-asserted', 'scripts/story.js:124');
E('sensor:household:manufacturing', 'claim:editorial:crosscheck:pair-legality', 'hand-asserted', 'scripts/story.js:124');
E('claim:editorial:crosscheck:pair-legality', 'claim:editorial:crosscheck:rows', 'precondition', 'scripts/story.js:142');
E('claim:editorial:crosscheck:same-month', 'claim:editorial:crosscheck:body', 'precondition', 'scripts/story.js:196,201');
for (const slug of HH_WEIGHTED) E(`contribution:household:${slug}`, 'claim:editorial:crosscheck:rows', 'row-ordering', 'scripts/story.js:139');
claim('editorial:crosscheck:state', 'Headline state: quiet | mixed | amber | red | nodata', {at: 'scripts/story.js:177-187'});
E('claim:editorial:crosscheck:rows', 'claim:editorial:crosscheck:state', 'aggregate', 'scripts/story.js:173-180');
claim('editorial:crosscheck:body', 'Cross-check body paragraphs, including "The jar reads X. It does not read Y."', {at: 'scripts/story.js:188-203'});
E('claim:editorial:crosscheck:state', 'claim:editorial:crosscheck:body', 'branch', 'scripts/story.js:188-203');
E('score:household:ooze', 'claim:editorial:crosscheck:body', 'token{{s:M}}', 'scripts/story.js:202');
claim('editorial:crosscheck:note', 'Coverage note: N of the 7 weighted lines carry no published comparison series', {at: 'scripts/story.js:207-209'});
E('claim:editorial:crosscheck:rows', 'claim:editorial:crosscheck:note', 'count', 'scripts/story.js:207-209');
claim('editorial:crosscheck:run', 'Streak statement: "This is the first edition to publish these checks; the run starts here."', {
  at: 'scripts/story.js:212-214',
  caution: 'A STRING LITERAL with no backing counter. It has been emitted on every edition since the checks shipped, so it becomes false on edition two.',
});

claim('editorial:newsletter', 'Plain-text newsletter', {at: 'scripts/story.js:287-306'});
claim('editorial:rssSummary', 'RSS summary (700 chars)', {at: 'scripts/story.js:308'});
claim('editorial:social', 'Social card text', {at: 'scripts/story.js:310'});
claim('editorial:article', 'Monthly Ooze Report auto-article', {at: 'scripts/story.js:255-277'});
for (const c of ['newsletter', 'rssSummary', 'social', 'article']) {
  E('claim:editorial:story', `claim:editorial:${c}`, 'compose', 'scripts/story.js:255-310');
  E('claim:editorial:verdict', `claim:editorial:${c}`, 'compose', 'scripts/story.js:255-310');
  E('score:household:ooze', `claim:editorial:${c}`, 'literal-or-token', 'scripts/story.js:255-310');
}
E('claim:editorial:confidence', 'claim:editorial:article', 'compose', 'scripts/story.js:273-274');
E('claim:editorial:noticed', 'claim:editorial:article', 'compose', 'scripts/story.js:267-268');

claim('market:sector-note', 'OOZEBOT Sector Watch paragraph', {at: 'scripts/lib/market-note.js:19'});
E('derived:breadth-counts', 'claim:market:sector-note', 'template', 'scripts/lib/market-note.js:19');
E('derived:sector-overall', 'claim:market:sector-note', 'template', 'scripts/lib/market-note.js:19');
for (const sym of TICKERS) E(`derived:session-change-22:${sym}`, 'claim:market:sector-note', 'extremes', 'scripts/lib/market-note.js:15-19');

claim('market:shared-series-disclosure', '"The Chicago Fed NFCI … is the only input the two instruments have in common"', {
  at: 'scripts/market-pages.js:32, market.html:79, scripts/lib/market-gauge-content.js:54,59',
  verifiableBy: 'assertion cross-wing-shared-raw-series',
});
E('raw:fred:NFCI', 'claim:market:shared-series-disclosure', 'assertion-subject', 'scripts/market-pages.js:32');
claim('market:separate-instrument', '"Separate instrument · 0 oz in household jar" chip on every non-credit gauge page', {
  at: 'scripts/market-pages.js:29,33',
});
for (const [slug] of wardGauges) if (slug !== 'credit') E(`sensor:ward:${slug}`, 'claim:market:separate-instrument', 'assertion-subject', 'scripts/market-pages.js:29');
claim('market:divergence-basis', 'Divergence note: exact shared months, current-revised inputs, non-identical breadth transforms', {
  at: 'scripts/build-market-divergence.js:47',
  caution: 'Discloses the vintage and the breadth-transform mismatch. Does NOT disclose that NFCI is upstream of both columns.',
});
E('derived:divergence:market-minus-household', 'claim:market:divergence-basis', 'template', 'scripts/build-market-divergence.js:47');

claim('stamp:page-furniture', 'index.html title, meta description, OG title/description, hero score, hero status, hero delta, share card, specimen line, Dataset JSON-LD', {at: 'scripts/stamp.js:51-88'});
E('score:household:ooze', 'claim:stamp:page-furniture', 'stamp', 'scripts/stamp.js:51-70');
E('band:household', 'claim:stamp:page-furniture', 'stamp', 'scripts/stamp.js:51-69');
E('tier:household', 'claim:stamp:page-furniture', 'stamp', 'scripts/stamp.js:69');
for (const slug of [...HH_WEIGHTED, ...HH_AUX]) E(`contribution:household:${slug}`, 'claim:stamp:page-furniture', 'top-3', 'scripts/stamp.js:41-42');
claim('stamp:integrity-placard', '"Integrity gate: PASS · N warnings · fails closed"', {at: 'scripts/stamp.js:22-37,65'});
E('artifact:gate-status', 'claim:stamp:integrity-placard', 'read-verdict', 'scripts/stamp.js:22-37');
claim('stamp:market-furniture', 'market.html static score + band', {at: 'scripts/stamp.js:111-124'});
E('score:ward:score', 'claim:stamp:market-furniture', 'stamp', 'scripts/stamp.js:119-120');
E('band:ward', 'claim:stamp:market-furniture', 'stamp', 'scripts/stamp.js:120');

claim('lab:indicator-prose', 'lab.js INDICATORS why / vs2008 / faqs — hand-written per-line copy', {
  at: 'lab.js:37-157',
  caution: 'Hand-typed values. narrative-check.js:180-200 checks ONLY "Today\'s <value>" and only WARNS. Everything else in this prose is unchecked.',
});
for (const slug of [...HH_WEIGHTED, ...HH_AUX]) E(`sensor:household:${slug}`, 'claim:lab:indicator-prose', 'hand-written', 'lab.js:37-157');
claim('lab:no-stock-market-input', '"The S&P 500 is not an input to the Ooze Score at any weight."', {
  at: 'lab.js:110', verifiableBy: 'assertion sp500-not-upstream-of-ooze',
});
E('score:household:ooze', 'claim:lab:no-stock-market-input', 'assertion-subject', 'lab.js:110');
claim('gauge:market-gauge-content', 'Ward M per-gauge lesson copy (measurement / limits / reproduce / faqs)', {at: 'scripts/lib/market-gauge-content.js'});
for (const [slug] of wardGauges) E(`sensor:ward:${slug}`, 'claim:gauge:market-gauge-content', 'hand-written', 'scripts/lib/market-gauge-content.js');

/* ========================= UI SURFACES ========================= */
const ui = (id, label, opts) => N(`ui:${id}`, 'ui_surface', label, opts);

ui('index.html#hero', 'Homepage hero: score, band, delta, jar aria-label', {at: 'index.html:45-56,221'});
E('claim:stamp:page-furniture', 'ui:index.html#hero', 'render', 'scripts/stamp.js:59-64');
E('score:household:ooze', 'ui:index.html#hero', 'client-render', 'index.html:221');
ui('index.html#ozBar', 'Ounce composition bar + aria-label', {at: 'index.html:287-291'});
for (const slug of HH_WEIGHTED) E(`contribution:household:${slug}`, 'ui:index.html#ozBar', 'render', 'index.html:287-291');
ui('index.html#canCards', 'Four featured intake cards with the cross-check gutter glyph', {at: 'index.html:295-306'});
E('claim:editorial:crosscheck:rows', 'ui:index.html#canCards', 'gutter-glyph', 'index.html:276-286');
ui('index.html#ccGutter-screenreader', 'Screen-reader text for the cross-check gutter', {
  at: 'index.html:276-286,300,335',
  caution: 'DEFECT D2 SURFACE. The false string "agrees" survived longest here because a sighted proofreader never sees it.',
});
E('claim:editorial:crosscheck:rows', 'ui:index.html#ccGutter-screenreader', 'render', 'index.html:276-286');
ui('index.html#crosscheck', 'Cross-check section: glyph, state label, count, body, note, roster, run, rules', {at: 'index.html:71-95,323-343'});
for (const c of ['state', 'body', 'note', 'run', 'rows']) E(`claim:editorial:crosscheck:${c}`, 'ui:index.html#crosscheck', 'render', 'index.html:323-343');
ui('index.html#storyBody', 'The written monthly reading (tokens resolved client-side)', {
  at: 'index.html:317-319',
  caution: 'resolveClaims uses lab.js HISTORY. If data/latest.js fails to load, HISTORY stays the FROZEN fallback array (lab.js:158) and {{s:M}} resolves against stale history while the STAMPED hero shows the live number.',
});
E('claim:editorial:story', 'ui:index.html#storyBody', 'resolve-tokens+render', 'index.html:317, lab.js:228-242');
ui('index.html#ledger', 'Full intake ledger, AUX badges', {at: 'index.html:345-360'});
for (const slug of [...HH_WEIGHTED, ...HH_AUX]) {
  E(`contribution:household:${slug}`, 'ui:index.html#ledger', 'render', 'index.html:345-360');
  E(`delta:household:${slug}`, 'ui:index.html#ledger', 'render', 'index.html:345-360');
}
ui('index.html#placard', 'Integrity placard', {at: 'index.html plcSealed'});
E('claim:stamp:integrity-placard', 'ui:index.html#placard', 'render', 'scripts/stamp.js:65');
ui('indicator.html', 'Per-line indicator page', {at: 'indicator.html, lab.js:37-157'});
E('claim:lab:indicator-prose', 'ui:indicator.html', 'render', 'lab.js:37-157');
for (const slug of [...HH_WEIGHTED, ...HH_AUX]) E(`claim:editorial:line:${slug}`, 'ui:indicator.html', 'render', 'scripts/story.js:67');
ui('article.html', 'Monthly Ooze Report permalink', {at: 'article.html, data/auto-articles.js'});
E('claim:editorial:article', 'ui:article.html', 'render', 'scripts/story.js:343');
ui('feed.xml', 'Atom feed', {at: 'scripts/rss.js'});
E('claim:editorial:rssSummary', 'ui:feed.xml', 'render', 'scripts/rss.js');
ui('archive.html', 'Archive + reconstruction reports', {at: 'archive.html, data/reconstruction-reports.js'});
E('score:household:history', 'ui:archive.html', 'render', 'scripts/narrative-check.js:122-165');
ui('market.html', 'Ward M page: gauges, Sector Watch, divergence chart', {at: 'market.html'});
E('score:ward:score', 'ui:market.html', 'render', 'scripts/stamp.js:119');
E('claim:market:sector-note', 'ui:market.html', 'render', 'market.html');
E('derived:divergence:market-minus-household', 'ui:market.html', 'render', 'market.html');
E('claim:market:divergence-basis', 'ui:market.html', 'render', 'market.html');
for (const [slug] of wardGauges) {
  ui(`market/${slug}/index.html`, `Ward M ${slug} gauge page`, {at: 'scripts/market-pages.js'});
  E(`stress:ward:${slug}`, `ui:market/${slug}/index.html`, 'render', 'scripts/market-pages.js');
  E('claim:gauge:market-gauge-content', `ui:market/${slug}/index.html`, 'render', 'scripts/market-pages.js');
  E(slug === 'credit' ? 'claim:market:shared-series-disclosure' : 'claim:market:separate-instrument',
    `ui:market/${slug}/index.html`, 'render', 'scripts/market-pages.js:29-33');
}
ui('notes.html', 'Lab Notes / methodology narrative', {at: 'notes.html'});
E('claim:market:shared-series-disclosure', 'ui:notes.html', 'render', 'notes.html:65-66');
ui('policies.html', 'Methodology + revision policy', {at: 'policies.html'});
E('artifact:revisions', 'ui:policies.html', 'render', 'scripts/lib/release-gate.js:176-190');
ui('api:data/latest.json', 'Public payload', {at: 'scripts/collect.js:268'});
E('score:household:ooze', 'ui:api:data/latest.json', 'publish', 'scripts/collect.js:268');
ui('api:data/editorial.json', 'Public editorial payload (token CARRIER; exempt from the reader-surface token scan)', {
  at: 'scripts/story.js:316',
  caution: 'narrative-check.js:209 explicitly skips data/editorial.json in the unresolved-token scan. Any consumer that does not run resolveClaims ships raw {{s:…}} to a reader.',
});
E('claim:editorial:story', 'ui:api:data/editorial.json', 'publish', 'scripts/story.js:316');
E('claim:editorial:crosscheck:rows', 'ui:api:data/editorial.json', 'publish', 'scripts/story.js:316');
ui('api:data/market.json', 'Ward M payload', {at: 'scripts/collect-market.js:140'});
E('score:ward:score', 'ui:api:data/market.json', 'publish', 'scripts/collect-market.js:140');
ui('api:data/sectors.json', 'Sector Watch payload', {at: 'scripts/collect-sectors.js:75'});
E('derived:breadth-counts', 'ui:api:data/sectors.json', 'publish', 'scripts/collect-sectors.js:75');
ui('api:data/market-history.json', 'Divergence series', {at: 'scripts/build-market-divergence.js:55'});
E('derived:divergence:market-minus-household', 'ui:api:data/market-history.json', 'publish', 'scripts/build-market-divergence.js:55');
ui('og-cards', 'Open Graph share images', {at: 'scripts/og-cards.js'});
E('score:household:ooze', 'ui:og-cards', 'render', 'scripts/og-cards.js');

/* ========================= ALIASES ========================= */
const aliases = {};
const alias = (nodeId, names) => { for (const n of names) (aliases[n] ??= []).push(nodeId); };

alias('raw:fred:UNRATE', ['UNRATE', 'unemployment', 'Unemployment', 'Civilian unemployment rate', 'unemployment rate']);
alias('raw:fred:ICSA', ['ICSA', 'claims', 'claimsK', 'initial jobless claims', 'weekly claims', 'jobs.secondary']);
alias('raw:fred:CPIAUCNS', ['CPIAUCNS', 'CPI', 'CPI-U', 'CPI-U all items', 'yearly price growth', 'the CPI deflator', 'cpiNow']);
alias('raw:fred:MORTGAGE30US', ['MORTGAGE30US', '30-year mortgage', '30yr mortgage rate', 'mortgage rate', 'mortgageRate']);
alias('raw:fred:DRSFRMACBS', ['DRSFRMACBS', 'mortgage delinquency', 'mortgageDelinq', 'Residential mortgage delinquency at commercial banks',
  'Federal Reserve Mortgage Delinquency', 'mortgage distress', 'Mortgage Distress', 'foreclosures', 'Foreclosures',
  'single-family mortgage delinquency rate', 'housing.secondary']);
alias('raw:fred:DRCCLACBS', ['DRCCLACBS', 'cardDelinq', 'card delinquency', 'credit cards', 'Credit Cards',
  'Credit-card loan delinquency at commercial banks']);
alias('raw:fred:GASREGW', ['GASREGW', 'gas', 'Gas Prices', 'pump price', 'U.S. regular gasoline retail price', 'gasReal']);
alias('raw:fred:NFCI', ['NFCI', 'financial', 'Financial Conditions', 'financialConditions', 'National Financial Conditions Index',
  'Chicago Fed NFCI', "the Chicago Fed's conditions index", 'Credit & Funding', 'the methodology-v3 bridge',
  'credit (Ward M gauge slug)']);
alias('raw:fred:INDPRO', ['INDPRO', 'manufacturing', 'Manufacturing', 'industrial production',
  'Total industrial production year-over-year change', 'industry (parked Ward M sensor)']);
alias('raw:fred:AMTMNO', ['AMTMNO', "manufacturers' new orders", 'new orders', 'shipmentsYoY (MISNOMER in scripts/collect.js:157)',
  'shipmentsMonth (MISNOMER in scripts/collect.js:156)', 'manufacturing.secondary']);
alias('raw:nyfed:HHDC_AUTO_30PLUS', ['NYFED_AUTO_30PLUS', 'auto', 'Auto Loans', 'auto-loan delinquency', 'auto30Plus',
  'Page 13 Data / AUTO', 'Previously current auto balance entering 30+ delinquency', 'AUTO']);
alias('raw:fred:T10Y3M', ['T10Y3M', 'rates', 'Rates', 'yield curve', '10-year minus 3-month Treasury spread']);
alias('raw:fred:VIXCLS', ['VIXCLS', 'volatility', 'Volatility', 'VIX', 'the fear gauge']);
alias('raw:fred:DCOILWTICO', ['DCOILWTICO', 'energy', 'Energy', 'WTI', 'WTI crude', 'oil']);
alias('raw:fred:DTWEXBGS', ['DTWEXBGS', 'dollar', 'Dollar', 'broad dollar index']);
for (const sym of TICKERS) alias(`raw:yahoo:${sym}`, [sym]);
alias('derived:weakness-share', ['SECTOR-BREADTH', 'breadth', 'Breadth', 'Sector Watch', 'sector breadth']);

/* which alias strings resolve to more than one node, or hide a wing distinction */
const collisions = [
  {token: 'credit', resolvesTo: ['sensor:household:credit (raw:fred:DRCCLACBS)', 'sensor:ward:credit (raw:fred:NFCI)'],
   risk: 'HIGH — one word, two sensors, two different raw series, two different wings. A slug-keyed validator will silently answer the wrong question.'},
  {token: 'Financial Conditions / Credit & Funding', resolvesTo: ['sensor:household:financial', 'sensor:ward:credit'],
   risk: 'HIGH — two different names for the SAME raw series (NFCI) in two wings. Name-based independence checking passes; series-based checking fails.'},
  {token: 'jobs / employment', resolvesTo: ['sensor:household:jobs'],
   risk: 'MEDIUM — collect.js keys the line "jobs" (scripts/collect.js:50,108) while backtest.js keys the identical line "employment" (scripts/backtest.js:108) and METHODOLOGY_V3_WEIGHTS keys it "employment". One line, three key spellings across the two engines that must stay in sync.'},
  {token: 'foreclosures', resolvesTo: ['sensor:household:foreclosures (raw:fred:DRSFRMACBS)'],
   risk: 'MEDIUM — the slug says foreclosures; the series is mortgage DELINQUENCY. lab.js:120 discloses it; the slug does not.'},
  {token: 'manufacturing / industry', resolvesTo: ['sensor:household:manufacturing (raw:fred:INDPRO)', 'PARKED sensor:ward:industry (raw:fred:INDPRO)'],
   risk: 'MEDIUM — un-parking the Ward M industry sensor (scripts/collect-market.js:15) creates a SECOND cross-wing shared series and falsifies "the only input the two instruments have in common".'},
  {token: 'gas / energy', resolvesTo: ['sensor:household:gas (raw:fred:GASREGW)', 'sensor:ward:energy (raw:fred:DCOILWTICO)'],
   risk: 'LOW — different series, adjacent names. Ward copy calls WTI "the upstream cousin of the gas-price line" (scripts/collect-market.js:76). No graph edge exists; the relationship is economic, not computational.'},
  {token: 'housing', resolvesTo: ['sensor:household:housing — MAX(MORTGAGE30US, DRSFRMACBS)'],
   risk: 'HIGH — the published DISPLAY value is MORTGAGE30US alone, so "housing" in prose names a two-input maximum while showing one input.'},
  {token: 'shipments', resolvesTo: ['raw:fred:AMTMNO'],
   risk: 'MEDIUM — collector variable names call new orders "shipments". A future prose surface reading that variable name would publish the wrong metric name.'},
];

/* ========================= ASSERTIONS ========================= */
const assertions = [
  {id: 'D1-reproduces', kind: 'upstream', from: 'raw:fred:DRSFRMACBS', to: 'sensor:household:housing', expect: true,
   why: 'Defect D1. scripts/collect.js:110 — housing = max(interp(mortgageRate, MORTGAGE30US), interp(mortgageDelinq, DRSFRMACBS)). Any cross-check pairing housing against foreclosures is circular.'},
  {id: 'D1-comparison-side', kind: 'upstream', from: 'raw:fred:DRSFRMACBS', to: 'sensor:household:foreclosures', expect: true,
   why: 'The other end of D1. Both ends true ⇒ the pair shares a raw series ⇒ ILLEGAL cross-check.'},
  {id: 'jobs-manufacturing-legal', kind: 'upstream', from: 'raw:fred:INDPRO', to: 'sensor:household:jobs', expect: false,
   why: 'INDPRO must NOT be upstream of jobs. jobs = max(UNRATE, ICSA-4wk) only. This is what makes jobs:manufacturing a legal pair.'},
  {id: 'jobs-manufacturing-legal-reverse', kind: 'disjoint-raw', a: 'sensor:household:jobs', b: 'sensor:household:manufacturing', expect: true,
   why: 'Full disjointness both directions: {UNRATE, ICSA} ∩ {INDPRO, AMTMNO} = ∅.'},
  {id: 'gas-depends-on-cpi', kind: 'upstream', from: 'raw:fred:CPIAUCNS', to: 'sensor:household:gas', expect: true,
   why: 'The transitive deflator dependency. GASREGW is CPI-deflated AND rebased to the newest CPI print (scripts/collect.js:113).'},
  {id: 'gas-inflation-illegal', kind: 'disjoint-raw', a: 'sensor:household:gas', b: 'sensor:household:inflation', expect: false,
   why: 'gas and inflation both read CPIAUCNS. Pairing them in any cross-check, contrast or "these two disagree" claim would be D1 again.'},
  {id: 'nfci-shared-household', kind: 'upstream', from: 'raw:fred:NFCI', to: 'sensor:household:financial', expect: true},
  {id: 'nfci-shared-ward', kind: 'upstream', from: 'raw:fred:NFCI', to: 'sensor:ward:credit', expect: true},
  {id: 'cross-wing-shared-raw-series', kind: 'shared-raw-set', a: 'score:household:ooze', b: 'score:ward:score',
   expect: ['raw:fred:NFCI'],
   why: 'Proves market.html:79 / market-pages.js:32: "they overlap in exactly one place". True at series identity. NOT a claim of economic orthogonality.'},
  {id: 'ward-credit-not-household-credit', kind: 'disjoint-raw', a: 'sensor:household:credit', b: 'sensor:ward:credit', expect: true,
   why: 'The name collision does NOT correspond to a shared series. Household credit reads DRCCLACBS; ward credit reads NFCI.'},
  {id: 'sp500-not-upstream-of-ooze', kind: 'upstream-any', from: TICKERS.map(t => `raw:yahoo:${t}`), to: 'score:household:ooze', expect: false,
   why: 'Backs lab.js:110 "The S&P 500 is not an input to the Ooze Score at any weight."'},
  {id: 'ward-not-upstream-of-ooze', kind: 'upstream', from: 'score:ward:score', to: 'score:household:ooze', expect: false,
   why: 'Backs "Ward M … does not affect the Ooze Score" (scripts/collect-market.js:138).'},
  {id: 'amtmno-not-scored', kind: 'upstream', from: 'raw:fred:AMTMNO', to: 'stress:household:manufacturing', expect: false,
   scoredEdgesOnly: true,
   why: 'AMTMNO is display-only. It reaches the reader surface but not the stress value.'},
  {id: 'contribution-coupling', kind: 'upstream', from: 'raw:fred:GASREGW', to: 'contribution:household:jobs', expect: true,
   why: 'The largest-remainder split normalizes by wsum, so every weighted line is upstream of every OTHER line\'s ounce count. "Employment was N of the month\'s M ounces" is a claim about all seven lines.'},
  {id: 'divergence-not-independent', kind: 'shared-raw-set', a: 'score:ward:score', b: 'score:household:history',
   expect: ['raw:fred:NFCI'],
   why: 'The divergence series is not a comparison of two disjoint measurement systems.'},
];

/* legal cross-check pairs, computed downstream by the validator, recorded here as the expected answer */
const crosscheckPolicy = {
  rule: 'A cross-check between weighted line L and comparison sensor C is LEGAL only if (a) C carries zero score weight, (b) upstreamRawSeries(L) ∩ upstreamRawSeries(C) = ∅, and (c) delta(L) and delta(C) are computed over the SAME month pair.',
  published: {jobs: 'manufacturing'},
  legalBySeriesDisjointness: {
    jobs: ['foreclosures', 'manufacturing'],
    housing: ['manufacturing'],
    credit: ['foreclosures', 'manufacturing'],
    auto: ['foreclosures', 'manufacturing'],
    gas: ['foreclosures', 'manufacturing'],
    inflation: ['foreclosures', 'manufacturing'],
    financial: ['foreclosures', 'manufacturing'],
  },
  illegalBySeriesDisjointness: {housing: ['foreclosures']},
  failsConditionC: {
    note: 'NO currently published pair satisfies condition (c). delta:household:manufacturing steps over INDPRO\'s own latest month pair; delta:household:foreclosures steps over a QUARTER; delta of every weighted line steps over the headline month pair M vs P.',
    affected: ['jobs:manufacturing (published, live)'],
  },
};

const graph = {
  schema: 'oozemeter.dependency-graph/1',
  version: '1.0.0',
  generated: new Date().toISOString(),
  repo: {branch: 'claim-gate', commit: COMMIT},
  doctrine: 'OOZEMeter may say less, but it may not confidently say more than the evidence supports. Independence is never inferred from naming; it is proved by traversal over this graph.',
  readme: {
    query: 'isUpstream(x, y) = there exists a directed path x -> … -> y in edges.',
    independence: 'upstreamRawSeries(y) = { n : n.kind === "raw_series" and isUpstream(n, y) }. Two sensors are independent iff their upstreamRawSeries sets are disjoint.',
    scoredEdges: 'Edges carrying scored:false reach a reader surface but not a stress value. Independence queries about SCORE must exclude them; queries about PUBLISHED CLAIMS must include them.',
    aliasRule: 'Resolve every name through `aliases` to a node id BEFORE querying. Never compare names. `aliasCollisions` lists the tokens where name-based comparison gives the wrong answer.',
  },
  nodeKinds: ['raw_series', 'derived_series', 'sensor', 'stress_value', 'weight', 'contribution', 'score', 'band', 'constant', 'artifact', 'editorial_claim', 'ui_surface'],
  nodes,
  edges,
  aliases,
  aliasCollisions: collisions,
  assertions,
  crosscheckPolicy,
  hiddenCircularRelationships: JSON.parse(fs.readFileSync(path.join(__dirname, 'circular.json'), 'utf8')),
  currentlyUnverifiableRelationships: JSON.parse(fs.readFileSync(path.join(__dirname, 'unverifiable.json'), 'utf8')),
};

/* sanity: every edge endpoint exists */
const ids = new Set(nodes.map(n => n.id));
const dangling = edges.filter(e => !ids.has(e.from) || !ids.has(e.to));
if (dangling.length) {
  console.error('DANGLING EDGES:', JSON.stringify(dangling, null, 1));
  process.exit(1);
}
const dupes = nodes.map(n => n.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupes.length) { console.error('DUPLICATE NODE IDS:', dupes); process.exit(1); }

fs.writeFileSync(path.join(ROOT, 'data/dependency-graph.json'), JSON.stringify(graph, null, 1));
console.log(`wrote data/dependency-graph.json — ${nodes.length} nodes, ${edges.length} edges, ${Object.keys(aliases).length} alias tokens`);
