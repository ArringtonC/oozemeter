const {fetchWithRetry} = require('./fetch');

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseFredNumber(rawValue, seriesId, date) {
  if (typeof rawValue !== 'string' || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(rawValue)) {
    throw new Error(`${seriesId}: invalid numeric value ${JSON.stringify(rawValue)} at ${date}`);
  }
  const value = Number(rawValue);
  if (!Number.isFinite(value)) throw new Error(`${seriesId}: invalid numeric value ${JSON.stringify(rawValue)} at ${date}`);
  return value;
}

function normalizeFredObservations(rows, seriesId) {
  const grouped = {};
  const observations = [];
  let last = null;
  let previousDate = '';

  for (const {date, rawValue} of rows) {
    if (!validDate(date)) {
      throw new Error(`${seriesId}: invalid observation date ${JSON.stringify(date)}`);
    }
    if (date <= previousDate) throw new Error(`${seriesId}: observation dates must be strictly increasing`);
    previousDate = date;
    if (rawValue === '.' || rawValue === '' || rawValue == null) continue;
    const value = parseFredNumber(rawValue, seriesId, date);
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

function parseFredCsv(csv, seriesId) {
  if (typeof csv !== 'string') throw new Error(`${seriesId}: FRED CSV response must be text`);
  const lines = csv.replace(/(?:\r?\n)+$/, '').split(/\r?\n/);
  const header = lines.shift();
  if (header !== `observation_date,${seriesId}`) throw new Error(`${seriesId}: unexpected FRED CSV header`);
  return normalizeFredObservations(lines.map(row => {
    const fields = row.split(',');
    if (fields.length !== 2) throw new Error(`${seriesId}: malformed FRED CSV row`);
    const [date, rawValue] = fields;
    return {date, rawValue};
  }), seriesId);
}

function parseFredApiJson(payload, seriesId) {
  let decoded;
  try {
    decoded = typeof payload === 'string' ? JSON.parse(payload) : payload;
  } catch (error) {
    throw new Error(`${seriesId}: invalid FRED API JSON: ${error.message}`);
  }
  if (!Array.isArray(decoded?.observations)) throw new Error(`${seriesId}: FRED API response has no observations array`);
  return normalizeFredObservations(decoded.observations.map(({date, value}) => ({date, rawValue:value})), seriesId);
}

async function fetchFredSeries(seriesId, options={}) {
  const {
    apiKey=process.env.FRED_API_KEY,
    fetcher=fetchWithRetry,
    warn=message=>console.warn(message),
  }=options;
  if(apiKey){
    const endpoint=new URL('https://api.stlouisfed.org/fred/series/observations');
    endpoint.searchParams.set('series_id',seriesId);
    endpoint.searchParams.set('api_key',apiKey);
    endpoint.searchParams.set('file_type','json');
    endpoint.searchParams.set('sort_order','asc');
    endpoint.searchParams.set('limit','100000');
    try{
      const response=await fetcher(endpoint.href);
      if(response.ok)return parseFredApiJson(await response.text(),seriesId);
      warn(`${seriesId}: FRED API returned HTTP ${response.status}; using documented CSV fallback`);
    }catch(error){
      warn(`${seriesId}: FRED API request failed; using documented CSV fallback`);
    }
  }
  const fallback=`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(seriesId)}`;
  const response=await fetcher(fallback);
  if(!response.ok)throw new Error(`${seriesId}: FRED CSV fallback HTTP ${response.status}`);
  return parseFredCsv(await response.text(),seriesId);
}

module.exports = {fetchFredSeries, parseFredApiJson, parseFredCsv};
