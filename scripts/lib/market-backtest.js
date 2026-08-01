const FROZEN_WARD_CALIBRATION = Object.freeze({
  a:1.402462618842267,
  b:-7.011551886296619,
  rawCalm:12.129772057910289,
  rawGfc:69.17229064285482,
  rule:'ward calm 2007-present → 10, ward GFC peak → 90',
});

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
  deriveCalibrationDiagnostic,
};
