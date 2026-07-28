const test = require('node:test');
const assert = require('node:assert/strict');
const {collectionFingerprint} = require('../scripts/lib/fingerprint');

function snapshot() {
  return {
    fingerprintSchemaVersion: 2,
    methodology: {
      version: '2.0.0',
      calibration: {a: 1.4, b: -24.6},
      weights: {jobs: 25, inflation: 10},
      anchors: {jobs: [[3.5, 5], [5, 25]]},
    },
    sources: {
      ICSA: [{date: '2026-06-06', value: 220001}, {date: '2026-06-13', value: 220002}],
      CPIAUCNS: [{date: '2025-06-01', value: 320.001}, {date: '2026-06-01', value: 331.201}],
      NYFED_AUTO_30PLUS: [{date: '2026-01-01', value: 7.74}],
    },
  };
}

test('fingerprint changes when methodology or calibration changes', () => {
  const original = snapshot();
  const revised = structuredClone(original);
  revised.methodology.calibration.a += 0.000001;
  assert.notEqual(collectionFingerprint(original), collectionFingerprint(revised));
});

test('fingerprint changes for raw or historical source revisions below display precision', () => {
  const original = snapshot();
  const revised = structuredClone(original);
  revised.sources.ICSA[0].value += 0.01;
  assert.notEqual(collectionFingerprint(original), collectionFingerprint(revised));
});

test('fingerprint is independent of object key insertion order', () => {
  const original = snapshot();
  const reordered = {
    sources: {NYFED_AUTO_30PLUS: original.sources.NYFED_AUTO_30PLUS, CPIAUCNS: original.sources.CPIAUCNS, ICSA: original.sources.ICSA},
    methodology: original.methodology,
    fingerprintSchemaVersion: original.fingerprintSchemaVersion,
  };
  assert.equal(collectionFingerprint(original), collectionFingerprint(reordered));
});
