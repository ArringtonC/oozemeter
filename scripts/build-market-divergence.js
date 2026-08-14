#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {alignHistories} = require('./lib/market-divergence');
const {writePublishedPair} = require('./lib/market-output');

const args = process.argv.slice(2);
const value = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};
const root = path.resolve(__dirname, '..');
const marketPath = path.resolve(value('--market', path.join(root, 'research/market-backtest.json')));
const householdPath = path.resolve(value('--household', path.join(root, 'data/history.json')));
const jsonPath = path.resolve(value('--json', path.join(root, 'data/market-history.json')));
const jsPath = path.resolve(value('--js', path.join(root, 'data/market-history.js')));

const market = JSON.parse(fs.readFileSync(marketPath, 'utf8'));
const household = JSON.parse(fs.readFileSync(householdPath, 'utf8'));
const monthly = alignHistories(market.monthly, household);
if (!monthly.length) throw new Error('Market and household histories have no exact shared months');
/* This file is a JOIN of two instruments refreshed on different cadences, and
   it used to carry one `generated` — the market's — while its household column
   tracked whatever the household backtest last produced. A reader taking
   `generated` as the vintage of the whole file got the wrong date for half of
   it. Stamp both sides and say when they disagree. */
/* data/history.json is a bare array with no vintage of its own; the collector
   run that writes it also writes latest.json, which is stamped. */
let householdVintage = household.generated || null;
if (!householdVintage) {
  try {
    householdVintage = JSON.parse(
      fs.readFileSync(path.join(path.dirname(householdPath), 'latest.json'), 'utf8')
    ).generated || null;
  } catch { householdVintage = null; }
}
const payload = {
  generated: market.generated,
  marketVintage: market.generated || null,
  householdVintage,
  vintagesAligned: !!(market.generated && householdVintage) &&
    market.generated.slice(0, 10) === householdVintage.slice(0, 10),
  acquisitionFingerprint: market.acquisition?.fingerprint || null,
  start: monthly[0].month,
  end: monthly[monthly.length - 1].month,
  observations: monthly.length,
  note: 'Exact shared monthly observations only, using current-revised inputs; not release-time vintages. Historical Sector Watch is a research reconstruction from successive monthly closes, while live breadth uses a 22-session daily interval requiring 23 closes. Missing household months remain gaps; no interpolation.',
  monthly,
};
const outputRoot = path.dirname(jsonPath);
const outputName = path.basename(jsonPath, '.json');
if (jsPath !== path.join(outputRoot, `${outputName}.js`)) {
  throw new Error('Market-history JSON and JavaScript outputs must be a same-directory named pair');
}
writePublishedPair({root: outputRoot, name: outputName, globalName: 'MARKET_HISTORY', payload});
console.log(JSON.stringify({status: 'pass', observations: monthly.length, start: payload.start, end: payload.end}));
