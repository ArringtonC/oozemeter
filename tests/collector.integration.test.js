const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const repo = path.resolve(__dirname, '..');

test('collector emits methodology v2 values with traceable sources', {timeout: 60000}, () => {
  const run = spawnSync(process.execPath, ['scripts/collect.js'], {
    cwd: repo,
    encoding: 'utf8',
    timeout: 55000,
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const payload = JSON.parse(fs.readFileSync(path.join(repo, 'data/latest.json'), 'utf8'));

  assert.equal(payload.methodologyVersion, '2.0.0');
  assert.equal(payload.lines.auto.source.publisher, 'Federal Reserve Bank of New York');
  assert.equal(payload.lines.auto.source.metric, 'Previously current auto balance entering 30+ delinquency');
  assert.match(payload.lines.auto.source.url, /HHD_C_Report_\d{4}Q[1-4](?:\.xlsx)?$/);
  assert.equal(payload.lines.auto.source.proxy, false);

  assert.equal(payload.lines.jobs.secondary.seriesId, 'ICSA');
  assert.equal(payload.lines.jobs.secondary.transform, 'trailing four-week mean');
  assert.match(payload.lines.jobs.secondary.asOf, /^20\d{2}-\d{2}-\d{2}$/);

  assert.equal(payload.lines.inflation.source.seriesId, 'CPIAUCNS');
  assert.equal(payload.lines.inflation.source.seasonalAdjustment, 'not seasonally adjusted');
  assert.equal(payload.lines.inflation.source.transform, 'same-month year-over-year percent change');

  assert.equal(payload.lines.gas.source.publisher, 'U.S. Energy Information Administration');
  assert.equal(payload.lines.gas.source.transport, 'FRED');
  assert.equal(payload.lines.gas.source.seriesId, 'GASREGW');
});
