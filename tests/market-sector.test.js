const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {computeSessionChanges, latestSectorObservationDate, parseYahooChart} = require('../scripts/lib/market-sector');

const yahooFixture = () => ({chart: {error: null, result: [{
  timestamp: [1704067200, 1704153600, 1704240000],
  meta: {exchangeTimezoneName: 'America/New_York'},
  indicators: {quote: [{close: [100, null, 102]}]},
}]}});

test('Yahoo chart parser returns only finite positive closes from an ordered aligned response', () => {
  assert.deepEqual(parseYahooChart(yahooFixture(), 'SPY'), {
    observations: [{t: 1704067200, c: 100}, {t: 1704240000, c: 102}],
    timezone: 'America/New_York',
  });
});

test('Yahoo chart parser fails closed on errors, malformed arrays, timestamps, closes, and empty output', () => {
  const responseError = yahooFixture();
  responseError.chart.error = {code: 'Bad Request'};
  assert.throws(() => parseYahooChart(responseError, 'SPY'), /chart error/i);
  const mismatched = yahooFixture();
  mismatched.chart.result[0].indicators.quote[0].close.pop();
  assert.throws(() => parseYahooChart(mismatched, 'SPY'), /array lengths/i);
  const unordered = yahooFixture();
  unordered.chart.result[0].timestamp[2] = unordered.chart.result[0].timestamp[0];
  assert.throws(() => parseYahooChart(unordered, 'SPY'), /strictly increasing/i);
  const outOfRange = yahooFixture();
  outOfRange.chart.result[0].timestamp[2] = Number.MAX_SAFE_INTEGER;
  assert.throws(() => parseYahooChart(outOfRange, 'SPY'), /invalid Yahoo timestamp/i);
  const badClose = yahooFixture();
  badClose.chart.result[0].indicators.quote[0].close[0] = -1;
  assert.throws(() => parseYahooChart(badClose, 'SPY'), /finite positive/i);
  const empty = yahooFixture();
  empty.chart.result[0].indicators.quote[0].close = [null, null, null];
  assert.throws(() => parseYahooChart(empty, 'SPY'), /no valid closes/i);
});

test('Sector Watch computes 22- and 64-session intervals from 23 and 65 closes', () => {
  const observations = Array.from({length: 65}, (_, index) => ({t: index, c: 100 + index}));
  const changes = computeSessionChanges(observations);
  assert.ok(Math.abs(changes.m1 - ((164 / 142 - 1) * 100)) < 1e-12);
  assert.ok(Math.abs(changes.m3 - 64) < 1e-12);
  assert.equal(changes.last, observations[64]);
});

test('Sector Watch fails closed without 65 finite ordered closes', () => {
  assert.throws(() => computeSessionChanges(Array.from({length: 64}, (_, index) => ({t: index, c: 100}))), /65/);
  const malformed = Array.from({length: 65}, (_, index) => ({t: index, c: 100}));
  malformed[10].c = Number.NaN;
  assert.throws(() => computeSessionChanges(malformed), /finite/);
});

test('breadth observation date comes from the latest underlying sector row', () => {
  const sectors = {groups: [{rows: [{asOf: '2026-07-27'}, {asOf: '2026-07-29'}]}, {rows: [{asOf: '2026-07-28'}]}]};
  assert.equal(latestSectorObservationDate(sectors), '2026-07-29');
  assert.throws(() => latestSectorObservationDate({groups: [{rows: [{asOf: 'bad-date'}]}]}), /observation date/);
});

test('live collectors use shared interval and underlying-date logic', () => {
  const sectorCollector = fs.readFileSync(path.join(__dirname, '..', 'scripts/collect-sectors.js'), 'utf8');
  const marketCollector = fs.readFileSync(path.join(__dirname, '..', 'scripts/collect-market.js'), 'utf8');
  const backtest = fs.readFileSync(path.join(__dirname, '..', 'scripts/backtest-market.js'), 'utf8');
  assert.match(sectorCollector, /computeSessionChanges/);
  assert.match(sectorCollector, /parseYahooChart/);
  assert.doesNotMatch(sectorCollector, /length-22|length-64/);
  assert.match(marketCollector, /latestSectorObservationDate/);
  assert.doesNotMatch(marketCollector, /asOf:sd\.generated/);
  assert.match(backtest, /parseYahooChart/);
  assert.doesNotMatch(backtest, /\.chart\.result\[0\]/);
});
