const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const repo = path.resolve(__dirname, '..');

test('collector emits methodology v3 values with traceable sources', {timeout: 60000}, () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oozemeter-collector-'));
  const canonicalPath = path.join(repo, 'data/latest.json');
  const canonicalBefore = fs.readFileSync(canonicalPath, 'utf8');
  const run = spawnSync(process.execPath, ['scripts/collect.js'], {
    cwd: repo,
    encoding: 'utf8',
    timeout: 55000,
    env: {...process.env, OOZEMETER_DATA_DIR:dataDir},
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const payload = JSON.parse(fs.readFileSync(path.join(dataDir, 'latest.json'), 'utf8'));

  assert.equal(payload.methodologyVersion, '3.0.0');
  assert.equal(payload.collection.fingerprintSchemaVersion, 3);
  const staleLines = Object.entries(payload.lines).filter(([, line]) => line.stale).map(([slug]) => slug);
  assert.deepEqual(payload.collection.staleLines, staleLines);
  assert.equal(payload.collection.freshnessStatus, staleLines.length ? 'degraded' : 'current');
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
  assert.equal(payload.lines.financial.source.publisher, 'Federal Reserve Bank of Chicago');
  assert.equal(payload.lines.financial.source.transport, 'FRED');
  assert.equal(payload.lines.financial.source.seriesId, 'NFCI');
  assert.equal(payload.lines.financial.source.transform, 'calendar-month mean');
  assert.equal(payload.lines.financial.cadence, 'weekly');
  assert.equal(payload.lines.financial.contributesToOoze, true);
  assert.notEqual(payload.lines.financial.calibrationStatus, 'provisional-auxiliary');
  assert.ok(Array.isArray(payload.history));
  assert.ok(payload.history.length > 250);
  assert.ok(payload.history[0][0] >= 2003);
  const contributionTotal = Object.values(payload.lines)
    .filter(line => line.contributesToOoze !== false)
    .reduce((sum,line) => sum + line.contrib, 0);
  assert.equal(contributionTotal, payload.ooze, 'rounded line contributions must reconcile to the headline');

  assert.equal(payload.lines.foreclosures.source.seriesId, 'DRSFRMACBS');
  assert.equal(payload.lines.foreclosures.source.proxy, true);
  assert.equal(payload.lines.foreclosures.contributesToOoze, false);
  assert.equal(payload.lines.foreclosures.scoreWeight, 0);
  assert.equal(payload.lines.foreclosures.calibrationStatus, 'provisional-auxiliary');
  assert.equal(payload.lines.manufacturing.source.seriesId, 'INDPRO');
  assert.equal(payload.lines.manufacturing.source.proxy, true);
  assert.equal(payload.lines.manufacturing.secondary.seriesId, 'AMTMNO');
  assert.equal(payload.lines.manufacturing.contributesToOoze, false);
  assert.equal(payload.lines.manufacturing.scoreWeight, 0);
  assert.equal(payload.lines.manufacturing.calibrationStatus, 'provisional-auxiliary');
  assert.equal(fs.readFileSync(canonicalPath, 'utf8'), canonicalBefore);
  fs.rmSync(dataDir, {recursive:true,force:true});
});
