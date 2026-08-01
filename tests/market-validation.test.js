const test = require('node:test');
const assert = require('node:assert/strict');

const {analyzeBacktest, analyzeGauge, quantile} = require('../scripts/lib/market-validation');

test('quantile interpolates the sorted historical distribution', () => {
  assert.equal(quantile([10, 20, 30, 40, 50], 0.25), 20);
  assert.equal(quantile([10, 20, 30, 40, 50], 0.95), 48);
});

test('anchor validation measures direct stress-tail frequency', () => {
  const report = analyzeGauge({
    history: [10, 20, 30, 40, 50].map((value, i) => ({month: `200${i}-01`, value})),
    anchors: [[10, 5], [30, 60], [50, 100]],
  });
  assert.equal(report.orientation, 'higher-is-more-stressful');
  assert.equal(report.observations, 5);
  assert.equal(report.anchors[1].rawPercentile, 50);
  assert.equal(report.anchors[1].stressTailShare, 60);
});

test('anchor validation reverses the stress tail for inverted gauges', () => {
  const report = analyzeGauge({
    history: [-2, -1, 0, 1, 2].map((value, i) => ({month: `200${i}-01`, value})),
    anchors: [[-2, 100], [-1, 80], [2, 5]],
  });
  assert.equal(report.orientation, 'lower-is-more-stressful');
  assert.equal(report.anchors[1].rawPercentile, 25);
  assert.equal(report.anchors[1].stressTailShare, 40);
  assert.deepEqual(report.coverage, {start: '2000-01', end: '2004-01'});
});

test('backtest validation requires and summarizes every anchored gauge', () => {
  const report = analyzeBacktest({
    generated: '2026-07-28T00:00:00.000Z',
    anchors: {
      rates: [[-1, 100], [1, 5]],
      energy: [[40, 10], [100, 90]],
    },
    gaugeHistory: {
      rates: [{month: '2000-01', value: -1}, {month: '2000-02', value: 1}],
      energy: [{month: '2000-01', value: 40}, {month: '2000-02', value: 100}],
    },
  });
  assert.deepEqual(Object.keys(report.gauges), ['rates', 'energy']);
  assert.equal(report.gauges.rates.orientation, 'lower-is-more-stressful');
  assert.equal(report.gauges.rates.terminalMonthPartial, false);
  assert.match(report.vintageBasis, /current-revised reconstruction/i);
  assert.throws(() => analyzeBacktest({anchors: {rates: [[-1, 100], [1, 5]]}, gaugeHistory: {}}), /missing full history.*rates/i);
});

test('anchor validation marks the retrieval month as partial', () => {
  const report = analyzeBacktest({
    generated: '2026-07-28T00:00:00.000Z',
    anchors: {rates: [[-1, 100], [1, 5]]},
    gaugeHistory: {rates: [{month: '2026-06', value: 0}, {month: '2026-07', value: 1}]},
  });
  assert.equal(report.gauges.rates.terminalMonthPartial, true);
});
