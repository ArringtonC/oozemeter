function parseYahooChart(payload, label = 'Yahoo chart') {
  if (!payload || !payload.chart || payload.chart.error) {
    throw new Error(`${label}: Yahoo chart error`);
  }
  if (!Array.isArray(payload.chart.result) || payload.chart.result.length !== 1) {
    throw new Error(`${label}: Yahoo quote response must contain exactly one result`);
  }
  const result = payload.chart.result[0];
  const timestamps = result && result.timestamp;
  const closes = result && result.indicators && Array.isArray(result.indicators.quote)
    && result.indicators.quote[0] && result.indicators.quote[0].close;
  if (!Array.isArray(timestamps) || !Array.isArray(closes) || !timestamps.length) {
    throw new Error(`${label}: Yahoo quote response schema changed`);
  }
  if (timestamps.length !== closes.length) {
    throw new Error(`${label}: Yahoo timestamp and close array lengths differ`);
  }
  const observations = [];
  let previous = -Infinity;
  for (let index = 0; index < timestamps.length; index += 1) {
    const timestamp = timestamps[index];
    if (!Number.isSafeInteger(timestamp) || timestamp <= 0 || !Number.isFinite(new Date(timestamp * 1000).getTime())) {
      throw new Error(`${label}: invalid Yahoo timestamp`);
    }
    if (timestamp <= previous) throw new Error(`${label}: Yahoo timestamps must be strictly increasing`);
    previous = timestamp;
    const close = closes[index];
    if (close == null) continue;
    if (!Number.isFinite(close) || close <= 0) throw new Error(`${label}: Yahoo closes must be finite positive values`);
    observations.push({t: timestamp, c: close});
  }
  if (!observations.length) throw new Error(`${label}: Yahoo response contains no valid closes`);
  const timezone = result.meta && result.meta.exchangeTimezoneName;
  if (typeof timezone !== 'string' || !timezone) throw new Error(`${label}: Yahoo exchange timezone is missing`);
  return {observations, timezone};
}

function computeSessionChanges(observations) {
  if (!Array.isArray(observations) || observations.length < 65) {
    throw new Error(`Expected at least 65 valid closes, received ${Array.isArray(observations) ? observations.length : 0}`);
  }
  let previousTimestamp = -Infinity;
  for (const observation of observations) {
    if (!Number.isFinite(observation.t) || !Number.isFinite(observation.c) || observation.c <= 0) {
      throw new Error('Sector observations must contain finite timestamps and positive finite closes');
    }
    if (observation.t <= previousTimestamp) throw new Error('Sector observations must be ordered by increasing timestamp');
    previousTimestamp = observation.t;
  }
  const last = observations.at(-1);
  return {
    last,
    m1: (last.c / observations.at(-23).c - 1) * 100,
    m3: (last.c / observations.at(-65).c - 1) * 100,
  };
}

function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function latestSectorObservationDate(sectors) {
  const rows = (sectors && Array.isArray(sectors.groups) ? sectors.groups : [])
    .flatMap(group => Array.isArray(group.rows) ? group.rows : []);
  if (!rows.length || rows.some(row => !validIsoDate(row.asOf))) {
    throw new Error('Sector observation date is missing or invalid');
  }
  return rows.map(row => row.asOf).sort().at(-1);
}

module.exports = {computeSessionChanges, latestSectorObservationDate, parseYahooChart};
