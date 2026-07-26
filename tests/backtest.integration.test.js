const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const repo = path.resolve(__dirname, '..');

test('backtest uses the NY Fed auto-specific 30-plus transition series', {timeout: 60000}, () => {
  const run = spawnSync(process.execPath, ['scripts/backtest.js'], {
    cwd: repo,
    encoding: 'utf8',
    timeout: 55000,
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const results = JSON.parse(fs.readFileSync(path.join(repo, 'research/backtest-results.json'), 'utf8'));
  assert.deepEqual(results.anchors.auto30Plus, [[5,5],[6,15],[7,30],[8,50],[9,70],[10,85],[11,95],[12,100]]);
  assert.equal(results.anchors.consumerDelinq, undefined);
  assert.equal(results.methodology.auto.source, 'New York Fed Consumer Credit Panel / Equifax');
  assert.equal(results.methodology.auto.metric, 'Previously current auto balance entering 30+ delinquency');
  assert.match(results.methodology.auto.workbook, /HHD_C_Report_\d{4}Q[1-4](?:\.xlsx)?$/);
  assert.equal(results.methodology.claims.transform, 'Trailing mean of the latest four weekly observations available in each month');
  assert.equal(results.methodology.inflation.seriesId, 'CPIAUCNS');
  assert.equal(results.methodology.inflation.transform, 'Same-month year-over-year percent change');
  assert.ok(results.monthly[0].month >= '2003-01');
});
