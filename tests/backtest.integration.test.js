const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const repo = path.resolve(__dirname, '..');

test('backtest uses bounded retries for hosted FRED acquisition', () => {
  const source = fs.readFileSync(path.join(repo, 'scripts/backtest.js'), 'utf8');
  assert.match(source, /require\('\.\/lib\/fetch'\)/);
  assert.match(source, /await fetchWithRetry\(url\)/);
  assert.doesNotMatch(source, /await fetch\(url\)/);
});

test('backtest uses the NY Fed auto-specific 30-plus transition series', {timeout: 60000}, () => {
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
  assert.deepEqual(results.anchors.auto30Plus, [[5,5],[6,15],[7,30],[8,50],[9,70],[10,85],[11,95],[12,100]]);
  assert.equal(results.anchors.consumerDelinq, undefined);
  assert.equal(results.methodology.auto.source, 'New York Fed Consumer Credit Panel / Equifax');
  assert.equal(results.methodology.auto.metric, 'Previously current auto balance entering 30+ delinquency');
  assert.match(results.methodology.auto.workbook, /HHD_C_Report_\d{4}Q[1-4](?:\.xlsx)?$/);
  assert.equal(results.methodology.claims.transform, 'Trailing mean of the latest four weekly observations available in each month');
  assert.equal(results.methodology.inflation.seriesId, 'CPIAUCNS');
  assert.equal(results.methodology.inflation.transform, 'Same-month year-over-year percent change');
  assert.equal(results.methodology.historicalTiming.realTimeCompatible, false);
  assert.equal(results.methodology.historicalTiming.revisionBasis, 'Latest available revised observations');
  assert.match(results.methodology.historicalTiming.quarterlyAlignment, /observation quarter.*not release date/i);
  assert.ok(results.monthly[0].month >= '2003-01');

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
