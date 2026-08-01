const test = require('node:test');
const assert = require('node:assert/strict');
const {fetchFredSeries, parseFredApiJson, parseFredCsv} = require('../scripts/lib/fred');

test('parses dated FRED observations while preserving exact weekly dates', () => {
  const result = parseFredCsv('observation_date,ICSA\n2026-06-06,220000\n2026-06-13,224000\n', 'ICSA');
  assert.deepEqual(result.observations, [
    {date: '2026-06-06', value: 220000},
    {date: '2026-06-13', value: 224000},
  ]);
  assert.equal(result.monthly['2026-06'], 222000);
  assert.deepEqual(result.last, {date: '2026-06-13', value: 224000});
});

test('averages weekly NFCI observations within each calendar month', () => {
  const result = parseFredCsv(
    'observation_date,NFCI\n2026-06-05,-0.60\n2026-06-12,-0.50\n2026-07-03,-0.30\n',
    'NFCI',
  );
  assert.equal(result.monthly['2026-06'], -0.55);
  assert.equal(result.monthly['2026-07'], -0.30);
});

test('parses the keyed FRED API observation contract', () => {
  const result = parseFredApiJson(JSON.stringify({observations:[
    {date:'2026-06-05',value:'-0.60'},{date:'2026-06-12',value:'-0.50'},
  ]}), 'NFCI');
  assert.equal(result.monthly['2026-06'], -0.55);
  assert.deepEqual(result.last, {date:'2026-06-12',value:-0.50});
});

test('prefers the keyed FRED API when configured', async () => {
  const calls=[];
  const result=await fetchFredSeries('NFCI',{
    apiKey:'test-key',
    fetcher:async url=>{
      calls.push(url);
      return{ok:true,status:200,text:async()=>JSON.stringify({observations:[{date:'2026-06-05',value:'-0.50'}]})};
    },
  });
  assert.equal(calls.length,1);
  const url=new URL(calls[0]);
  assert.equal(url.origin,'https://api.stlouisfed.org');
  assert.equal(url.searchParams.get('series_id'),'NFCI');
  assert.equal(url.searchParams.get('api_key'),'test-key');
  assert.equal(result.monthly['2026-06'],-0.50);
});

test('falls back to FRED CSV without exposing a failed API key', async () => {
  const calls=[],warnings=[];
  const result=await fetchFredSeries('NFCI',{
    apiKey:'secret-test-key',
    warn:message=>warnings.push(message),
    fetcher:async url=>{
      calls.push(url);
      if(calls.length===1)return{ok:false,status:403,text:async()=>''};
      return{ok:true,status:200,text:async()=> 'observation_date,NFCI\n2026-06-05,-0.50\n'};
    },
  });
  assert.equal(calls.length,2);
  assert.match(calls[0],/^https:\/\/api\.stlouisfed\.org\//);
  assert.equal(calls[1],'https://fred.stlouisfed.org/graph/fredgraph.csv?id=NFCI');
  assert.equal(result.monthly['2026-06'],-0.50);
  assert.equal(warnings.length,1);
  assert.doesNotMatch(warnings[0],/secret-test-key/);
});

test('fails closed on a malformed FRED numeric field', () => {
  assert.throws(
    () => parseFredCsv('observation_date,UNRATE\n2026-06-01,not-a-number\n', 'UNRATE'),
    /UNRATE: invalid numeric value.*2026-06-01/,
  );
});

test('fails closed when FRED returns no observations', () => {
  assert.throws(() => parseFredCsv('observation_date,CPIAUCNS\n', 'CPIAUCNS'), /CPIAUCNS: no valid observations/);
});
