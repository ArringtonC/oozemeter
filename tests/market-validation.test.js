const test = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {analyzeBacktest, analyzeGauge, quantile} = require('../scripts/lib/market-validation');

const root = path.resolve(__dirname, '..');
const validator = path.join(root, 'scripts/validate-market-anchors.js');

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

test('anchor report command is deterministic and never tunes its input anchors', () => {
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ward-anchor-validation-'));
  const inputPath = path.join(outputRoot, 'market-backtest.json');
  const jsonPath = path.join(outputRoot, 'market-anchor-validation.json');
  const reportPath = path.join(outputRoot, 'market-anchor-validation.md');
  const backtest = {
    generated: '2026-08-01T00:00:00.000Z',
    anchors: {
      rates: [[-1, 100], [0, 45], [1, 5]],
      volatility: [[10, 5], [20, 35], [40, 80]],
    },
    gaugeHistory: {
      rates: [
        {month: '2026-06', value: -0.5},
        {month: '2026-07', value: 0.5},
      ],
      volatility: [
        {month: '2026-06', value: 15},
        {month: '2026-07', value: 25},
      ],
    },
  };
  const input = `${JSON.stringify(backtest, null, 2)}\n`;
  const run = () => execFileSync(process.execPath, [
    validator,
    '--input', inputPath,
    '--json', jsonPath,
    '--report', reportPath,
  ], {cwd: root, encoding: 'utf8'});

  fs.writeFileSync(inputPath, input);
  run();
  const firstJson = fs.readFileSync(jsonPath, 'utf8');
  const firstReport = fs.readFileSync(reportPath, 'utf8');
  const validation = JSON.parse(firstJson);
  assert.deepEqual(
    validation.gauges.rates.anchors.map(({raw, stress}) => [raw, stress]),
    backtest.anchors.rates,
  );
  assert.match(firstReport, /descriptive checks, not a license to tune anchors/i);
  assert.match(firstReport, /Any anchor change requires a new Ward M methodology version/i);
  assert.equal(fs.readFileSync(inputPath, 'utf8'), input);

  run();
  assert.equal(fs.readFileSync(jsonPath, 'utf8'), firstJson);
  assert.equal(fs.readFileSync(reportPath, 'utf8'), firstReport);
  assert.equal(fs.readFileSync(inputPath, 'utf8'), input);
});
