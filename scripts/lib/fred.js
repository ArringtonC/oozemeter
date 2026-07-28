function parseFredCsv(csv, seriesId) {
  const rows = String(csv).trim().split(/\r?\n/).slice(1);
  const grouped = {};
  const observations = [];
  let last = null;

  for (const row of rows) {
    if (!row) continue;
    const [date, rawValue] = row.split(',');
    if (rawValue === '.' || rawValue === '' || rawValue == null) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`${seriesId}: invalid observation date ${JSON.stringify(date)}`);
    }
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      throw new Error(`${seriesId}: invalid numeric value ${JSON.stringify(rawValue)} at ${date}`);
    }
    observations.push({date, value});
    (grouped[date.slice(0, 7)] ??= []).push(value);
    last = {date, value};
  }

  if (!last) throw new Error(`${seriesId}: no valid observations`);
  const monthly = {};
  for (const [month, values] of Object.entries(grouped)) {
    monthly[month] = values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  return {monthly, last, observations};
}

module.exports = {parseFredCsv};
