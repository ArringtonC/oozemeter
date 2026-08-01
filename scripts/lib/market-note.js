function formatPct(value) {
  const sign = value < 0 ? '−' : value > 0 ? '+' : '';
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

function buildMarketNote(payload) {
  if (!payload || !payload.breadth || !Array.isArray(payload.groups)) throw new Error('Sector payload is incomplete');
  const rows = payload.groups.flatMap(group => Array.isArray(group.rows) ? group.rows : []);
  const {steady, softening, stressed, total} = payload.breadth;
  if (![steady, softening, stressed, total].every(Number.isInteger)) throw new Error('Sector breadth counts must be integers');
  if (steady + softening + stressed !== total || rows.length !== total) throw new Error('Sector breadth counts do not reconcile');
  if (!rows.length || rows.some(row => !row.sym || !Number.isFinite(row.m1) || !/^\d{4}-\d{2}-\d{2}$/.test(row.asOf))) {
    throw new Error('Sector rows are incomplete');
  }
  const sorted = [...rows].sort((a, b) => a.m1 - b.m1 || a.sym.localeCompare(b.sym));
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  const asOf = rows.map(row => row.asOf).sort().at(-1);
  const paragraph = `Sector Watch is ${payload.overall}: ${steady} of ${total} tickers are steady, ${softening} softening, and ${stressed} stressed. ${weakest.sym} has the weakest 22-session price change at ${formatPct(weakest.m1)}; ${strongest.sym} is strongest at ${formatPct(strongest.m1)}. These measured states use the published 22-session thresholds and do not affect the household Ooze Score.`;
  return {
    byline: 'OOZEBOT',
    cadence: 'manual',
    asOf,
    paragraph,
  };
}

module.exports = {buildMarketNote};
