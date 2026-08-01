const crypto = require('node:crypto');

const FROZEN_WARD_CALIBRATION = Object.freeze({
  a:1.402462618842267,
  b:-7.011551886296619,
  rawCalm:12.129772057910289,
  rawGfc:69.17229064285482,
  rule:'ward calm 2007-present → 10, ward GFC peak → 90',
});

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function describeSourceSeries({transport, endpoint, series}) {
  if (typeof transport !== 'string' || !transport || typeof endpoint !== 'string' || !endpoint) {
    throw new Error('Market source provenance is incomplete');
  }
  const observations = Object.entries(series || {})
    .filter(([month, value]) => /^\d{4}-\d{2}$/.test(month) && Number.isFinite(value))
    .sort(([a], [b]) => a.localeCompare(b));
  if (!observations.length) throw new Error('Market source series has no finite monthly observations');
  return {
    transport,
    endpoint,
    observations:observations.length,
    latestObservationMonth:observations.at(-1)[0],
    sha256:sha256(observations),
  };
}

function buildAcquisitionManifest({generated, sources}) {
  if (!Number.isFinite(Date.parse(generated))) throw new Error('Market acquisition timestamp is invalid');
  const orderedSources = Object.fromEntries(Object.entries(sources || {}).sort(([a], [b]) => a.localeCompare(b)));
  if (!Object.keys(orderedSources).length) throw new Error('Market acquisition has no sources');
  const receipt = {version:1, generated, sources:orderedSources};
  return {...receipt, fingerprint:sha256(receipt)};
}

function monthOrdinal(month) {
  const match = /^(\d{4})-(\d{2})$/.exec(month || '');
  if (!match) return null;
  const year = Number(match[1]);
  const value = Number(match[2]);
  if (value < 1 || value > 12) return null;
  return year * 12 + value - 1;
}

function validateAcquisitionManifest(backtest, expectedSources=[]) {
  const failures = [];
  const acquisition = backtest?.acquisition;
  if (!acquisition || acquisition.version !== 1) return ['Market acquisition receipt is missing or unsupported'];
  if (backtest.generated !== acquisition.generated) failures.push('Market acquisition generated time does not match its receipt');
  const sources = acquisition.sources || {};
  if (expectedSources.length && JSON.stringify(Object.keys(sources).sort()) !== JSON.stringify([...expectedSources].sort())) {
    failures.push('Market acquisition source roster drifted');
  }
  const generatedMonth = typeof acquisition.generated === 'string' ? acquisition.generated.slice(0, 7) : '';
  const generatedOrdinal = monthOrdinal(generatedMonth);
  for (const [id, source] of Object.entries(sources)) {
    const latest = monthOrdinal(source?.latestObservationMonth);
    if (typeof source?.transport !== 'string' || typeof source?.endpoint !== 'string'
      || !Number.isInteger(source?.observations) || source.observations < 1
      || !/^[0-9a-f]{64}$/.test(source?.sha256 || '') || latest == null) {
      failures.push(`Market acquisition source is malformed: ${id}`);
    } else if (generatedOrdinal == null || latest > generatedOrdinal || generatedOrdinal - latest > 2) {
      failures.push(`Market acquisition source observation is stale or future-dated: ${id}`);
    }
  }
  const receipt = {version:acquisition.version, generated:acquisition.generated, sources};
  if (acquisition.fingerprint !== sha256(receipt)) failures.push('Market acquisition receipt fingerprint mismatch');
  return failures;
}

function finiteRows(rows) {
  if (!Array.isArray(rows) || !rows.length) throw new Error('Ward M backtest has no rows');
  for (const row of rows) {
    if (!/^\d{4}-\d{2}$/.test(row?.month) || !Number.isFinite(row?.raw)) {
      throw new Error('Ward M backtest row is malformed');
    }
  }
  return rows;
}

function applyFrozenCalibration(rows) {
  return finiteRows(rows).map(row => ({
    ...row,
    score:Math.round(Math.max(0, Math.min(100,
      FROZEN_WARD_CALIBRATION.a * row.raw + FROZEN_WARD_CALIBRATION.b))),
  }));
}

function deriveCalibrationDiagnostic(rows) {
  const valid = finiteRows(rows);
  const gfc = valid.filter(row => row.month <= '2010-12');
  if (!gfc.length) throw new Error('Ward M backtest has no GFC calibration window');
  const observedRawCalm = Math.min(...valid.map(row => row.raw));
  const observedRawGfc = Math.max(...gfc.map(row => row.raw));
  return {
    observedRawCalm,
    observedRawGfc,
    impliedA:(90 - 10) / (observedRawGfc - observedRawCalm),
    impliedB:10 - ((90 - 10) / (observedRawGfc - observedRawCalm)) * observedRawCalm,
    applied:false,
    note:'Descriptive diagnostic only; frozen Ward M calibration is not auto-tuned.',
  };
}

module.exports = {
  FROZEN_WARD_CALIBRATION,
  applyFrozenCalibration,
  buildAcquisitionManifest,
  deriveCalibrationDiagnostic,
  describeSourceSeries,
  validateAcquisitionManifest,
};
