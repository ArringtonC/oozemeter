const test = require('node:test');
const assert = require('node:assert/strict');

const {alignHistories, fractionalYearToMonth} = require('../scripts/lib/market-divergence');

test('fractional history keys convert to exact calendar months', () => {
  assert.equal(fractionalYearToMonth(2007), '2007-01');
  assert.equal(fractionalYearToMonth(2025.75), '2025-10');
  assert.equal(fractionalYearToMonth(2026 + 5 / 12), '2026-06');
});

test('divergence alignment joins exact shared months without interpolation', () => {
  const market = [
    {month: '2025-09', score: 40},
    {month: '2025-10', score: 50},
    {month: '2025-11', score: 60},
  ];
  const household = [
    [2025 + 8 / 12, 20],
    [2025 + 10 / 12, 30],
  ];
  assert.deepEqual(alignHistories(market, household), [
    {month: '2025-09', market: 40, household: 20, divergence: 20},
    {month: '2025-11', market: 60, household: 30, divergence: 30},
  ]);
});
