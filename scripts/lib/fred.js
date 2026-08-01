const {fetchWithRetry} = require('./fetch');

function normalizeFredObservations(rows, seriesId) {
  const grouped = {};
  const observations = [];
  let last = null;

  for (const {date, rawValue} of rows) {
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

function parseFredCsv(csv, seriesId) {
  const rows = String(csv).trim().split(/\r?\n/).slice(1);
  return normalizeFredObservations(rows.filter(Boolean).map(row => {
    const [date, rawValue] = row.split(',');
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
