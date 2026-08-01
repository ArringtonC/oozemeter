const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {interpolateAnchors, parseFredMonthly} = require('../scripts/lib/market-series');

test('FRED market parser accepts dated finite observations and averages by month', () => {
  const monthly = parseFredMonthly('observation_date,T10Y3M\n2026-01-02,1.2\n2026-01-05,1.4\n2026-01-06,.\n', 'T10Y3M');
  assert.ok(Math.abs(monthly['2026-01'] - 1.3) < 1e-12);
  for (const [token, expected] of [['+1', 1], ['-1.25', -1.25], ['.5', 0.5], ['-.5', -0.5], ['1.', 1], ['+1.25e+2', 125], ['-2E-3', -0.002]]) {
    assert.equal(parseFredMonthly(`observation_date,X\n2026-01-02,${token}\n`, 'X')['2026-01'], expected);
  }
});

test('FRED market parser fails closed on malformed dates, values, and empty series', () => {
  assert.throws(() => parseFredMonthly('observation_date,VIXCLS\nnot-a-date,20\n', 'VIXCLS'), /invalid observation date/i);
  assert.throws(() => parseFredMonthly('observation_date,VIXCLS\n2026-01-02,not-a-number\n', 'VIXCLS'), /invalid numeric value/i);
  assert.throws(() => parseFredMonthly('observation_date,VIXCLS\n2026-01-02,.\n', 'VIXCLS'), /no finite observations/i);
  for (const token of ['0x10', 'Infinity', '1_000', ' 1.2', '1.2 ', '1.2\t']) {
    assert.throws(() => parseFredMonthly(`observation_date,VIXCLS\n2026-01-02,${token}\n`, 'VIXCLS'), /invalid numeric value/i);
  }
});

test('market anchor interpolation rejects non-finite input instead of returning calm', () => {
  const anchors = [[0, 5], [10, 100]];
  assert.equal(interpolateAnchors(anchors, 5), 52.5);
  assert.throws(() => interpolateAnchors(anchors, Number.NaN), /finite/i);
});

test('market anchor interpolation validates strict monotonicity before endpoint clamping', () => {
  assert.throws(() => interpolateAnchors([[0, 10], [0, 20], [2, 30]], -1), /strictly increasing/);
  assert.throws(() => interpolateAnchors([[0, 10], [-1, 20], [2, 30]], 3), /strictly increasing/);
});

test('canonical market backtest uses the strict shared parser and interpolation', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts/backtest-market.js'), 'utf8');
  assert.match(source, /require\('\.\/lib\/market-series'\)/);
  assert.match(source, /parseFredMonthly/);
  assert.match(source, /interpolateAnchors/);
  assert.doesNotMatch(source, /parseFloat\(/);
  assert.doesNotMatch(source, /return 0;/);
});
