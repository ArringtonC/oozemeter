const test = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {alignHistories, fractionalYearToMonth} = require('../scripts/lib/market-divergence');

const root = path.resolve(__dirname, '..');
const builder = path.join(root, 'scripts/build-market-divergence.js');

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

test('divergence builder tracks the latest exact shared input month deterministically', () => {
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ward-divergence-'));
  const marketPath = path.join(outputRoot, 'market.json');
  const householdPath = path.join(outputRoot, 'household.json');
  const jsonPath = path.join(outputRoot, 'market-history.json');
  const jsPath = path.join(outputRoot, 'market-history.js');
  const market = {
    generated: '2026-07-31T00:00:00.000Z',
    monthly: [
      {month: '2026-05', score: 20},
      {month: '2026-06', score: 30},
      {month: '2026-07', score: 40},
    ],
  };
  const run = () => execFileSync(process.execPath, [
    builder,
    '--market', marketPath,
    '--household', householdPath,
    '--json', jsonPath,
    '--js', jsPath,
  ], {cwd: root, encoding: 'utf8'});

  fs.writeFileSync(marketPath, JSON.stringify(market));
  fs.writeFileSync(householdPath, JSON.stringify([
    [2026 + 4 / 12, 10],
    [2026 + 5 / 12, 25],
  ]));
  run();
  assert.equal(JSON.parse(fs.readFileSync(jsonPath, 'utf8')).end, '2026-06');

  fs.writeFileSync(householdPath, JSON.stringify([
    [2026 + 4 / 12, 10],
    [2026 + 6 / 12, 35],
  ]));
  run();
  const refreshed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  assert.equal(refreshed.end, '2026-07');
  assert.deepEqual(refreshed.monthly, [
    {month: '2026-05', market: 20, household: 10, divergence: 10},
    {month: '2026-07', market: 40, household: 35, divergence: 5},
  ]);

  const firstJson = fs.readFileSync(jsonPath, 'utf8');
  const firstJs = fs.readFileSync(jsPath, 'utf8');
  run();
  assert.equal(fs.readFileSync(jsonPath, 'utf8'), firstJson);
  assert.equal(fs.readFileSync(jsPath, 'utf8'), firstJs);
});
