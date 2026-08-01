const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  FROZEN_WARD_CALIBRATION,
  applyFrozenCalibration,
  deriveCalibrationDiagnostic,
} = require('../scripts/lib/market-backtest');

test('Ward M historical scores use frozen calibration instead of silently retuning', () => {
  assert.deepEqual(FROZEN_WARD_CALIBRATION, {
    a:1.402462618842267,
    b:-7.011551886296619,
    rawCalm:12.129772057910289,
    rawGfc:69.17229064285482,
    rule:'ward calm 2007-present → 10, ward GFC peak → 90',
  });
  const rows = [
    {month:'2017-09', raw:FROZEN_WARD_CALIBRATION.rawCalm},
    {month:'2008-11', raw:FROZEN_WARD_CALIBRATION.rawGfc},
    {month:'2026-07', raw:30.46},
  ];
  const scored = applyFrozenCalibration(rows);
  assert.deepEqual(scored.map(row => row.score), [10,90,36]);
  const diagnostic = deriveCalibrationDiagnostic(rows);
  assert.equal(diagnostic.observedRawCalm, FROZEN_WARD_CALIBRATION.rawCalm);
  assert.equal(diagnostic.observedRawGfc, FROZEN_WARD_CALIBRATION.rawGfc);
  assert.equal(diagnostic.applied, false);
});

test('Market backtest supports isolated output and imports the frozen-calibration helper', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../scripts/backtest-market.js'), 'utf8');
  assert.match(source, /require\('\.\/lib\/market-backtest'\)/);
  assert.match(source, /OOZEMETER_MARKET_BACKTEST_OUTPUT/);
  assert.match(source, /applyFrozenCalibration\(results\)/);
  assert.doesNotMatch(source, /const a=\(90-10\)\/\(rawGfc-rawCalm\)/);
});
