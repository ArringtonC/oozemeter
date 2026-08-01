const fs = require('fs');
const path = require('path');
const {buildMarketNote} = require('./market-note');
const {latestSectorObservationDate} = require('./market-sector');
const {alignHistories} = require('./market-divergence');
const {validateAcquisitionManifest} = require('./market-backtest');
const {analyzeBacktest, renderValidationMarkdown} = require('./market-validation');

const EXPECTED_SENSORS = ['rates', 'volatility', 'credit', 'energy', 'dollar', 'breadth'];
const EXPECTED_TICKERS = ['SPY', 'QQQ', 'DIA', 'IWM', 'XLF', 'XLI', 'IYT', 'XLY', 'XLP', 'SMH', 'XLV'];
const EXPECTED_BACKTEST_SOURCES = [
  ...['T10Y3M', 'VIXCLS', 'NFCI', 'DCOILWTICO', 'DTWEXBGS'].map(id => `FRED:${id}`),
  ...EXPECTED_TICKERS.map(id => `YAHOO:${id}`),
];
const BREADTH_ANCHORS = [[0, 5], [10, 22], [20, 40], [35, 60], [55, 80], [80, 100]];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readPublishedJs(file, globalName) {
  const source = fs.readFileSync(file, 'utf8').trim();
  const prefix = `window.${globalName}=`;
  if (!source.startsWith(prefix) || !source.endsWith(';')) throw new Error(`${path.basename(file)} has an invalid wrapper`);
  return JSON.parse(source.slice(prefix.length, -1));
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function interpolate(anchors, value) {
  if (value <= anchors[0][0]) return anchors[0][1];
  const last = anchors.at(-1);
  if (value >= last[0]) return last[1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [x1, y1] = anchors[i];
    const [x2, y2] = anchors[i + 1];
    if (value >= x1 && value <= x2) return y1 + (y2 - y1) * (value - x1) / (x2 - x1);
  }
  throw new Error('Anchor interpolation failed');
}

function inspectMarketRelease(root) {
  const failures = [];
  const fail = message => failures.push(message);
  let market, sectors, history;
  try {
    market = readJson(path.join(root, 'data/market.json'));
    const marketJs = readPublishedJs(path.join(root, 'data/market.js'), 'MARKET_DATA');
    if (!same(market, marketJs)) fail('Market JSON/JavaScript drift');
  } catch (error) { fail(`Market publication unreadable: ${error.message}`); }
  try {
    sectors = readJson(path.join(root, 'data/sectors.json'));
    const sectorsJs = readPublishedJs(path.join(root, 'data/sectors.js'), 'SECTOR_DATA');
    if (!same(sectors, sectorsJs)) fail('Sector JSON/JavaScript drift');
  } catch (error) { fail(`Sector publication unreadable: ${error.message}`); }
  try {
    history = readJson(path.join(root, 'data/market-history.json'));
    const historyJs = readPublishedJs(path.join(root, 'data/market-history.js'), 'MARKET_HISTORY');
    if (!same(history, historyJs)) fail('Market history JSON/JavaScript drift');
  } catch (error) { fail(`Market history publication unreadable: ${error.message}`); }

  if (market) {
    const slugs = Object.keys(market.sensors || {});
    if (!same(slugs, EXPECTED_SENSORS)) fail(`Market sensors must be ${EXPECTED_SENSORS.join(', ')}`);
    const stresses = EXPECTED_SENSORS.map(slug => market.sensors && market.sensors[slug] && market.sensors[slug].stress);
    if (!stresses.every(value => Number.isInteger(value) && value >= 0 && value <= 100)) fail('Market sensor stresses must be integers from 0 to 100');
    else {
      const raw = stresses.reduce((sum, value) => sum + value, 0) / stresses.length;
      if (Math.abs(market.raw - +raw.toFixed(2)) > 0.001) fail('Market raw average does not recompute');
      const score = Math.round(Math.max(0, Math.min(100, market.calibration.a * raw + market.calibration.b)));
      if (market.score !== score) fail(`Market score does not recompute: expected ${score}, received ${market.score}`);
    }
    if (!Number.isFinite(Date.parse(market.generated))) fail('Market generated timestamp is invalid');
  }

  if (sectors) {
    if (!sectors.source || sectors.source.transport !== 'Yahoo Finance chart endpoint') fail('Sector quote transport provenance is missing');
    if (!sectors.source || sectors.source.field !== 'quote.close') fail('Sector quote field provenance is missing');
    if (!sectors.source || !/price return; distributions not reinvested/i.test(sectors.source.returnBasis || '')) fail('Sector return basis is missing');
    if (!sectors.source || sectors.source.windows !== '22- and 64-session intervals requiring 23 and 65 valid closes') fail('Sector session-window provenance is missing or incorrect');
    if (!sectors.source || !/unresolved/i.test(sectors.source.rightsStatus || '')) fail('Sector quote-rights status is missing');
    const rows = (sectors.groups || []).flatMap(group => Array.isArray(group.rows) ? group.rows : []);
    const symbols = rows.map(row => row.sym);
    if (!same(symbols, EXPECTED_TICKERS)) fail('Sector ticker roster or order drifted');
    const counts = {steady: 0, softening: 0, stressed: 0};
    const expectedDot = {steady: '🟢', softening: '🟡', stressed: '🔴'};
    for (const row of rows) {
      const finiteReturns = Number.isFinite(row.m1) && Number.isFinite(row.m3);
      if (!finiteReturns) fail(`Sector rows must contain finite 22- and 64-session returns: ${row.sym}`);
      const expected = finiteReturns ? (row.m1 >= -2 ? 'steady' : row.m1 >= -7 ? 'softening' : 'stressed') : row.state;
      if (row.state !== expected) fail(`Sector state mismatch for ${row.sym}`);
      if (row.dot !== expectedDot[expected]) fail(`Sector dot mismatch for ${row.sym}`);
      counts[expected]++;
    }
    const breadth = sectors.breadth || {};
    if (breadth.total !== rows.length || breadth.total !== 11 || breadth.steady !== counts.steady || breadth.softening !== counts.softening || breadth.stressed !== counts.stressed) {
      fail('Sector breadth counts do not reconcile');
    }
    const overall = counts.stressed >= 3 ? 'STRESSED' : counts.stressed >= 1 || counts.softening >= 4 ? 'SOFTENING' : counts.softening >= 2 ? 'MIXED' : 'CALM';
    if (sectors.overall !== overall) fail('Sector overall state does not recompute');
    try {
      if (!same(sectors.oozebot, buildMarketNote(sectors))) fail('OOZEBOT note drift');
    } catch (error) { fail(`OOZEBOT note invalid: ${error.message}`); }

    if (market && breadth.total) {
      const weakness = (0.5 * breadth.softening + breadth.stressed) / breadth.total * 100;
      const expectedStress = Math.round(interpolate(BREADTH_ANCHORS, weakness));
      if (!market.sensors || !market.sensors.breadth || market.sensors.breadth.stress !== expectedStress) fail('Market breadth gauge does not match Sector Watch');
      try {
        if (market.sensors.breadth.asOf !== latestSectorObservationDate(sectors)) fail('Market breadth observation date does not match Sector Watch rows');
      } catch (error) { fail(`Sector breadth observation date invalid: ${error.message}`); }
    }
  }

  if (history) {
    if (!/current-revised inputs; not release-time vintages/i.test(history.note || '')) fail('Market history vintage basis is missing');
    if (!/live breadth uses a 22-session daily interval requiring 23 closes/i.test(history.note || '')) fail('Market history breadth-method mismatch is missing');
    const rows = history.monthly || [];
    if (history.observations !== rows.length || !rows.length) fail('Market history observation count mismatch');
    if (rows.length && (history.start !== rows[0].month || history.end !== rows.at(-1).month)) fail('Market history coverage metadata mismatch');
    let previous = '';
    for (const row of rows) {
      if (!/^\d{4}-\d{2}$/.test(row.month) || row.month <= previous) fail(`Market history month order mismatch at ${row.month}`);
      if (![row.market, row.household].every(value => Number.isFinite(value) && value >= 0 && value <= 100) || !Number.isFinite(row.divergence)) {
        fail(`Market history scores must be finite numbers from 0 to 100 at ${row.month}`);
      } else if (row.divergence !== row.market - row.household) fail(`Divergence mismatch at ${row.month}`);
      previous = row.month;
    }
  }

  try {
    const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    if (!home.includes('data/market.js') || !home.includes('data/sectors.js') || !home.includes('M.score') || !home.includes('SW.breadth')) fail('Homepage Ward M card is not bound to canonical market data');
    const page = fs.readFileSync(path.join(root, 'market.html'), 'utf8');
    for (const asset of ['data/market.js', 'data/sectors.js', 'data/market-history.js']) if (!page.includes(asset)) fail(`Ward M page does not load ${asset}`);
  } catch (error) { fail(`Ward M public surfaces unreadable: ${error.message}`); }

  return {status: failures.length ? 'fail' : 'pass', failures};
}

function inspectCurrentMarketEvidence(root, now=new Date()) {
  const failures = [];
  const fail = message => failures.push(message);
  try {
    const backtest = readJson(path.join(root, 'research/market-backtest.json'));
    const household = readJson(path.join(root, 'data/history.json'));
    const history = readJson(path.join(root, 'data/market-history.json'));
    const validation = readJson(path.join(root, 'research/market-anchor-validation.json'));
    const report = fs.readFileSync(path.join(root, 'research/market-anchor-validation.md'), 'utf8');

    const acquired = Date.parse(backtest.generated);
    const current = now instanceof Date ? now.getTime() : Date.parse(now);
    const age = current - acquired;
    if (!Number.isFinite(acquired) || !Number.isFinite(current) || age < -60_000 || age > 15 * 60_000) {
      fail('Market backtest acquisition is not current for this evidence cycle');
    }
    for (const failure of validateAcquisitionManifest(backtest, EXPECTED_BACKTEST_SOURCES)) fail(failure);

    const expectedMonthly = alignHistories(backtest.monthly, household);
    const expectedStart = expectedMonthly[0]?.month;
    const expectedEnd = expectedMonthly.at(-1)?.month;
    if (!expectedMonthly.length || !same(history.monthly, expectedMonthly)
      || history.observations !== expectedMonthly.length
      || history.start !== expectedStart || history.end !== expectedEnd
      || history.generated !== backtest.generated
      || history.acquisitionFingerprint !== backtest.acquisition?.fingerprint) {
      fail('Market divergence does not match exact shared-month inputs');
    }

    const expectedValidation = analyzeBacktest(backtest);
    if (!same(validation, expectedValidation)) fail('Market anchor validation does not match the current backtest');
    if (report !== renderValidationMarkdown(expectedValidation)) fail('Market anchor Markdown does not reproduce from the current backtest');
  } catch (error) {
    fail(`Current Market evidence unreadable: ${error.message}`);
  }
  return {status: failures.length ? 'fail' : 'pass', failures};
}

module.exports = {inspectCurrentMarketEvidence, inspectMarketRelease};
