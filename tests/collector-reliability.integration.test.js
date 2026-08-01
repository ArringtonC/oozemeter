const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const canonicalLatestPath = path.join(repo, 'data/latest.json');
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oozemeter-collector-'));
const latestPath = path.join(dataDir, 'latest.json');
const canonicalBefore = fs.readFileSync(canonicalLatestPath, 'utf8');

function collect() {
  const run = spawnSync(process.execPath, ['scripts/collect.js'], {
    cwd:repo,encoding:'utf8',timeout:55000,
    env:{...process.env,OOZEMETER_DATA_DIR:dataDir},
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  return JSON.parse(fs.readFileSync(latestPath, 'utf8'));
}

test('collector reports release state and fingerprints an atomic snapshot', {timeout:60000}, () => {
  collect();
  const second = collect();
  assert.equal(second.collection.status, 'ok');
  assert.equal(second.collection.fingerprintSchemaVersion, 3);
  assert.equal(second.collection.vintageRetentionPolicy, 'retain-all-unique-schema-v3-manifests');
  assert.match(second.collection.inputFingerprint, /^[a-f0-9]{64}$/);
  assert.equal(second.collection.changed, false);
  assert.ok(Object.values(second.lines).every(line => line.updateStatus === 'no-new-release'));
  const vintagePath = path.join(dataDir, 'vintages', `${second.collection.inputFingerprint}.json`);
  assert.ok(fs.existsSync(vintagePath));
  const vintage = JSON.parse(fs.readFileSync(vintagePath, 'utf8'));
  assert.equal(vintage.fingerprintSchemaVersion, 3);
  assert.equal(vintage.retentionPolicy, second.collection.vintageRetentionPolicy);
  assert.equal(vintage.methodology.version, second.methodologyVersion);
  assert.deepEqual(vintage.methodology.calibration, second.calibration);
  assert.match(vintage.sources.ICSA.fingerprint, /^[a-f0-9]{64}$/);
  assert.ok(vintage.sources.ICSA.observationCount > 1000);
  assert.match(vintage.sources.NYFED_AUTO_30PLUS.fingerprint, /^[a-f0-9]{64}$/);
  assert.ok(vintage.sources.NYFED_AUTO_30PLUS.observationCount > 90);
  assert.match(vintage.sources.NFCI.fingerprint, /^[a-f0-9]{64}$/);
  assert.ok(vintage.sources.NFCI.observationCount > 2500);
  assert.equal(vintage.sources.NFCI.revisionBaseline.transform, 'calendar-month mean');
  assert.equal(vintage.sources.NFCI.revisionBaseline.expectedAbsoluteTolerance, 0.02);
  assert.ok(vintage.sources.NFCI.revisionBaseline.monthlyMeans.length > 600);
  assert.equal(second.lines.financial.value,
    vintage.sources.NFCI.revisionBaseline.monthlyMeans.at(-1).value.toFixed(2));
  assert.match(vintage.output.historyFingerprint, /^[a-f0-9]{64}$/);
  assert.equal(fs.readFileSync(canonicalLatestPath, 'utf8'), canonicalBefore);
  fs.rmSync(dataDir, {recursive:true,force:true});
});
