function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseFredMonthly(csv, seriesId) {
  if (typeof csv !== 'string') throw new Error(`${seriesId}: FRED response must be text`);
  const lines = csv.replace(/(?:\r?\n)+$/, '').split(/\r?\n/);
  if (lines.length < 2) throw new Error(`${seriesId}: no finite observations`);
  const header = lines.shift().split(',');
  if (header.length !== 2 || header[0] !== 'observation_date' || header[1] !== seriesId) {
    throw new Error(`${seriesId}: unexpected FRED CSV header`);
  }
  const grouped = {};
  for (const line of lines) {
    const fields = line.split(',');
    if (fields.length !== 2) throw new Error(`${seriesId}: malformed CSV row`);
    const [date, raw] = fields;
    if (!validDate(date)) throw new Error(`${seriesId}: invalid observation date ${date}`);
    if (raw === '.' || raw === '') continue;
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw)) {
      throw new Error(`${seriesId}: invalid numeric value ${raw}`);
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error(`${seriesId}: invalid numeric value ${raw}`);
    (grouped[date.slice(0, 7)] ??= []).push(value);
  }
  const monthly = {};
  for (const [month, values] of Object.entries(grouped)) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    if (!Number.isFinite(mean)) throw new Error(`${seriesId}: non-finite monthly mean at ${month}`);
    monthly[month] = mean;
  }
  if (!Object.keys(monthly).length) throw new Error(`${seriesId}: no finite observations`);
  return monthly;
}

function interpolateAnchors(anchors, value) {
  if (!Number.isFinite(value)) throw new Error('Market gauge value must be finite');
  if (!Array.isArray(anchors) || anchors.length < 2 || anchors.some(pair => !Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isFinite))) {
    throw new Error('Market anchors must contain finite pairs');
  }
  for (let index = 0; index < anchors.length - 1; index++) {
    if (!(anchors[index + 1][0] > anchors[index][0])) throw new Error('Market anchor values must be strictly increasing');
  }
  if (value <= anchors[0][0]) return anchors[0][1];
  const last = anchors.at(-1);
  if (value >= last[0]) return last[1];
  for (let index = 0; index < anchors.length - 1; index++) {
    const [x1, y1] = anchors[index];
    const [x2, y2] = anchors[index + 1];
    if (value >= x1 && value <= x2) return y1 + (y2 - y1) * (value - x1) / (x2 - x1);
  }
  throw new Error('Market gauge value did not match an anchor interval');
}

module.exports = {interpolateAnchors, parseFredMonthly};
