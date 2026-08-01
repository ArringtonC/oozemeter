const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const repo = path.resolve(__dirname, '..');

test('backtest uses bounded retries for hosted FRED acquisition', () => {
  const source = fs.readFileSync(path.join(repo, 'scripts/backtest.js'), 'utf8');
  const fred = fs.readFileSync(path.join(repo, 'scripts/lib/fred.js'), 'utf8');
  assert.match(source, /require\('\.\/lib\/fred'\)/);
  assert.match(source, /fetchFredSeries\(id\)/);
  assert.match(fred, /fetcher=fetchWithRetry/);
  assert.doesNotMatch(source, /await fetch\(url\)/);
});

test('canonical v3 revision record independently satisfies the approved archive envelope', () => {
  const latest = JSON.parse(fs.readFileSync(path.join(repo, 'data/latest.json'), 'utf8'));
  const revisions = JSON.parse(fs.readFileSync(path.join(repo, 'data/revisions.json'), 'utf8'));
  const entry = revisions.find(item => item.toMethodologyVersion === '3.0.0');
  assert.ok(entry, 'methodology v3 revision entry must exist');
  const band = value => value <= 20 ? 1 : value <= 40 ? 2 : value <= 60 ? 3 : value <= 80 ? 4 : 5;
  const maxMove = Math.max(...entry.changes.map(change => Math.abs(change.new - change.old)));
  const bandFlips = entry.changes.filter(change => band(change.old) !== band(change.new)).length;
  const shareMovedPercent = Number((entry.changes.length / entry.summary.monthsCompared * 100).toFixed(1));
  assert.equal(entry.summary.monthsCompared, 281);
  assert.equal(entry.summary.monthsMovedAtLeastOne, entry.changes.length);
  assert.equal(entry.summary.shareMovedPercent, shareMovedPercent);
  assert.ok(shareMovedPercent >= 60 && shareMovedPercent <= 68, `unexpected archive churn: ${shareMovedPercent}%`);
  assert.equal(entry.summary.maxAbsoluteMove, maxMove);
  assert.ok(maxMove <= 2, `archive move exceeded approved envelope: ${maxMove}`);
  assert.equal(entry.summary.bandLabelFlips, bandFlips);
  assert.ok(bandFlips >= 7 && bandFlips <= 11, `unexpected band-label churn: ${bandFlips}`);
  assert.deepEqual(entry.calibration.to, latest.calibration);
  assert.deepEqual(entry.calibration.from, {a:1.4209110232483089,b:-24.62145011353958});
});

test('public decision studies reconstruct the frozen v2 household-only baseline', () => {
  const script = `
import json, sys
sys.path.insert(0, 'research')
from household_v2_baseline import load_household_v2_baseline
baseline = load_household_v2_baseline()
print(json.dumps({
  'weights': baseline['weights'],
  'calibration': baseline['calibration'],
  'months': len(baseline['monthly']),
  'first': baseline['monthly'][0]['ooze'],
  'last': baseline['monthly'][-1]['ooze'],
}))`;
  const run = spawnSync('python3', ['-c', script], {
    cwd:repo,encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const baseline = JSON.parse(run.stdout);
  assert.deepEqual(baseline.weights, {employment:25,housing:20,credit:20,auto:15,gas:10,inflation:10});
  assert.deepEqual(baseline.calibration, {a:1.4209110232483089,b:-24.62145011353958});
  assert.equal(baseline.months, 281);
  assert.equal(baseline.first, 45);
  assert.equal(baseline.last, 27);
  for(const file of ['market-shadow-experiment.py','leadlag-study.py','weight-optimization-study.py','gfc-sensitivity-study.py']){
    const source = fs.readFileSync(path.join(repo, 'research', file), 'utf8');
    assert.match(source, /load_household_v2_baseline\(\)/);
    assert.doesNotMatch(source, /json\.load\(open\(os\.path\.join\(HERE,'backtest-results\.json'\)\)\)/);
  }
});

test('methodology v3 backtest and collector share one calibrated canonical history', {timeout: 60000}, () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oozemeter-backtest-'));
  const outputPath = path.join(tempDir, 'backtest-results.json');
  const historyOutputPath = path.join(tempDir, 'history-array.txt');
  const canonicalHistoryPath = path.join(repo, 'research/history-array.txt');
  const canonicalHistoryBefore = fs.readFileSync(canonicalHistoryPath, 'utf8');
  const run = spawnSync(process.execPath, ['scripts/backtest.js'], {
    cwd: repo,
    encoding: 'utf8',
    timeout: 55000,
    env: {...process.env, OOZEMETER_BACKTEST_OUTPUT:outputPath,
      OOZEMETER_BACKTEST_HISTORY_OUTPUT:historyOutputPath},
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const results = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  assert.equal(results.methodologyVersion, '3.0.0');
  assert.equal(Object.values(results.weights).reduce((sum, weight) => sum + weight, 0), 100);
  assert.equal(results.weights.financial, 3);
  assert.deepEqual(results.anchors.financialConditions, [[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]]);
  assert.deepEqual(results.anchors.auto30Plus, [[5,5],[6,15],[7,30],[8,50],[9,70],[10,85],[11,95],[12,100]]);
  assert.equal(results.anchors.consumerDelinq, undefined);
  assert.equal(results.methodology.auto.source, 'New York Fed Consumer Credit Panel / Equifax');
  assert.equal(results.methodology.auto.metric, 'Previously current auto balance entering 30+ delinquency');
  assert.match(results.methodology.auto.workbook, /HHD_C_Report_\d{4}Q[1-4](?:\.xlsx)?$/);
  assert.equal(results.methodology.claims.transform, 'Trailing mean of the latest four weekly observations available in each month');
  assert.equal(results.methodology.inflation.seriesId, 'CPIAUCNS');
  assert.equal(results.methodology.inflation.transform, 'Same-month year-over-year percent change');
  assert.equal(results.methodology.financial.seriesId, 'NFCI');
  assert.equal(results.methodology.financial.transform, 'Calendar-month mean of weekly observations');
  assert.equal(results.methodology.historicalTiming.realTimeCompatible, false);
  assert.equal(results.methodology.historicalTiming.revisionBasis, 'Latest available revised observations');
  assert.match(results.methodology.historicalTiming.quarterlyAlignment, /observation quarter.*not release date/i);
  assert.ok(results.monthly[0].month >= '2003-01');
  const peak = (from, to) => Math.max(...results.monthly.filter(row => row.month >= from && row.month <= to).map(row => row.ooze));
  assert.ok(Math.abs(peak('2007-01', '2010-12') - 90) <= 2);
  assert.ok(Math.abs(Math.min(...results.monthly.filter(row => row.month <= '2025-12').map(row => row.ooze)) - 10) <= 2);
  assert.ok(Math.abs(peak('2020-01', '2020-12') - 41) <= 2);

  const dataDir = path.join(tempDir, 'data');
  const collection = spawnSync(process.execPath, ['scripts/collect.js'], {
    cwd:repo,encoding:'utf8',timeout:55000,
    env:{...process.env,OOZEMETER_DATA_DIR:dataDir},
  });
  assert.equal(collection.status, 0, collection.stderr || collection.stdout);
  const history = JSON.parse(fs.readFileSync(path.join(dataDir, 'history.json'), 'utf8'));
  assert.deepEqual(results.monthly.map(row=>row.ooze), history.map(row=>row[1]),
    'backtest and collector must publish identical canonical monthly scores');
  assert.ok(fs.existsSync(historyOutputPath));
  assert.equal(fs.readFileSync(canonicalHistoryPath,'utf8'),canonicalHistoryBefore);
  fs.rmSync(tempDir, {recursive:true,force:true});
});
