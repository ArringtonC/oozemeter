#!/usr/bin/env node
/* WARD M — Market Ooze collector v2 (standalone; touches no household pipeline).
   Slimmed per operator (2026-07-28): six gauges.

     rates       T10Y3M      Treasury/Board    yield-curve inversion
     volatility  VIXCLS      Cboe via FRED     option-market fear
     credit      NFCI        Chicago Fed       the methodology-v3 bridge
     energy      DCOILWTICO  EIA               WTI crude
     dollar      DTWEXBGS    Fed Board         broad dollar YoY
     breadth     Sector Watch (data/sectors.json) — share of the 11 quoted
                 ticker proxies weakening; the gauge that lets a sharp proxy decline
                 move this score

   Parked (anchors preserved in improvements.md): builders PERMIT,
   industry INDPRO, freight TSIFRGHT, speculative CBBTCUSD.

   Calibration frozen from scripts/backtest-market.js (2007-present):
   ward calm → 10, ward GFC peak → 90. Re-run the backtest to re-freeze.

   Manual candidate run order (scheduled use blocked on quote rights):
                       node scripts/collect-sectors.js  (breadth input)
                       node scripts/collect-market.js   → data/market.js|.json */
const fs=require('fs');
const path=require('path');
const {fetchWithRetry}=require('./lib/fetch');
const {dataRootFromEnv,writePublishedPair}=require('./lib/market-output');
const {interpolateAnchors,parseFredMonthly}=require('./lib/market-series');
const {FROZEN_WARD_CALIBRATION}=require('./lib/market-backtest');
const {latestSectorObservationDate}=require('./lib/market-sector');

const fred=id=>`https://fred.stlouisfed.org/series/${id}`;
async function series(id){
  const res=await fetchWithRetry(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`,
    {headers:{'User-Agent':'oozemeter ward-m collector'}});
  if(!res.ok)throw new Error(`${id}: HTTP ${res.status}`);
  return parseFredMonthly(await res.text(),id);
}
const last=m=>Object.keys(m).sort().pop();
const prevKey=k=>{const[y,mo]=k.split('-').map(Number);return `${mo===1?y-1:y}-${String(mo===1?12:mo-1).padStart(2,'0')}`};
const yoy=(m,k)=>{const p=m[`${+k.slice(0,4)-1}${k.slice(4)}`];return p?((m[k]-p)/p*100):null};

/* Frozen Ward calibration — imported, never re-declared. A truncated local copy
   {a:1.4025,b:-7.0116} lived here until 2026-08-14 and published a different
   rounded score from the canonical pair on 10 distinct raw values. Same
   two-copies failure as the household jar's calibration; fixed the same way. */
const CAL={...FROZEN_WARD_CALIBRATION,rule:'ward calm 2007-present = 10, ward GFC peak = 90',
  episodes:[
    {name:'GFC peak',month:'2008-11',score:90},
    {name:'Euro stress',month:'2011-09',score:61},
    {name:'COVID',month:'2020-03',score:71},
    {name:'2022 tightening',month:'2022-09',score:76},
    {name:'Bank stress',month:'2023-02',score:60},
    {name:'Calmest',month:'2017-09',score:10},
  ]};

const SENSORS=[
 {slug:'rates',name:'Rates',emoji:'🏛',seriesId:'T10Y3M',publisher:'Federal Reserve Board yield inputs via FRED',
  metric:'10-year minus 3-month Treasury spread, monthly mean (pp)',
  anchors:[[-1.5,100],[-1,85],[-0.5,70],[0,45],[0.5,30],[1.5,15],[2.5,5]],
  value:(m,k)=>m[k],fmt:v=>`${v.toFixed(2)}pp`,
  read:'An inverted curve — short rates above long — has preceded most modern recessions.'},
 {slug:'volatility',name:'Volatility',emoji:'🌪',seriesId:'VIXCLS',publisher:'Cboe',
  metric:'VIX, monthly mean of daily closes',
  anchors:[[12,5],[16,20],[20,35],[30,60],[40,80],[60,100]],
  value:(m,k)=>m[k],fmt:v=>v.toFixed(1),
  read:'The option market\'s 30-day implied-volatility gauge. Spikes show repricing; low readings alone do not prove complacency.'},
 {slug:'credit',name:'Credit & Funding',emoji:'🏦',seriesId:'NFCI',publisher:'Federal Reserve Bank of Chicago',
  metric:'National Financial Conditions Index, monthly mean',
  anchors:[[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]],
  value:(m,k)=>m[k],fmt:v=>v.toFixed(2),
  read:'105 indicators of lending, funding, and risk appetite in one Fed index. The bridge sensor for methodology v3.'},
 {slug:'energy',name:'Energy',emoji:'🛢',seriesId:'DCOILWTICO',publisher:'U.S. Energy Information Administration',
  metric:'WTI crude, monthly mean $/bbl',
  anchors:[[40,10],[60,25],[80,50],[100,75],[130,95],[160,100]],
  value:(m,k)=>m[k],fmt:v=>`$${v.toFixed(0)}`,
  read:'Expensive oil squeezes everything that moves. The upstream cousin of the gas-price line.'},
 {slug:'dollar',name:'Dollar',emoji:'💵',seriesId:'DTWEXBGS',publisher:'Federal Reserve Board',
  metric:'Broad dollar index, year-over-year %',
  anchors:[[-5,10],[0,25],[4,45],[8,65],[12,85],[16,100]],
  value:yoy,fmt:v=>`${v>=0?'+':''}${v.toFixed(1)}%`,
  read:'Rapid broad-dollar appreciation can accompany global funding stress, but is not itself a funding-stress measure.'},
];
const BREADTH_ANCHORS=[[0,5],[10,22],[20,40],[35,60],[55,80],[80,100]];

(async()=>{
  const dataRoot=dataRootFromEnv();
  const sensors={};const weighted=[];
  for(const s of SENSORS){
    const m=await series(s.seriesId);
    let k=last(m),val=s.value(m,k),prevVal=s.value(m,prevKey(k));
    if(val==null){k=prevKey(k);val=s.value(m,k);prevVal=s.value(m,prevKey(k));}
    if(!Number.isFinite(val))throw new Error(`${s.seriesId}: current gauge value is not finite`);
    if(prevVal!=null&&!Number.isFinite(prevVal))throw new Error(`${s.seriesId}: previous gauge value is not finite`);
    const stress=Math.round(interpolateAnchors(s.anchors,val));
    const prevStress=prevVal==null?stress:Math.round(interpolateAnchors(s.anchors,prevVal));
    sensors[s.slug]={name:s.name,emoji:s.emoji,value:s.fmt(val),stress,delta:stress-prevStress,
      asOf:k,read:s.read,
      source:{publisher:s.publisher,transport:'FRED',seriesId:s.seriesId,metric:s.metric,url:fred(s.seriesId)}};
    weighted.push(stress);
    console.log(`${s.name.padEnd(16)} ${s.fmt(val).padStart(8)}  stress ${String(stress).padStart(3)}  (${k})`);
  }
  /* breadth — from the approved manual Sector Watch collection */
  let sd=null;try{sd=JSON.parse(fs.readFileSync(path.join(dataRoot,'sectors.json'),'utf8'))}catch(error){
    throw new Error(`breadth input unavailable: ${error.message}`);
  }
  if(sd){
    const b=sd.breadth;
    if(!b||![b.steady,b.softening,b.stressed,b.total].every(Number.isInteger)||b.total!==11||b.steady+b.softening+b.stressed!==b.total){
      throw new Error('breadth input failed reconciliation');
    }
    const weakness=(0.5*b.softening+b.stressed)/b.total*100;
    const stress=Math.round(interpolateAnchors(BREADTH_ANCHORS,weakness));
    /* delta against the previous published collection — never a hardcoded 0.
       Sector Watch is manual, so on a first run there IS no prior reading and
       the delta is null: an unmeasured value is published as unmeasured, never
       rendered as "unchanged" (Constitution S5). */
    let breadthDelta=null;
    try{
      const priorPath=path.join(dataRoot,'market.json');
      const prior=JSON.parse(fs.readFileSync(priorPath,'utf8'));
      const priorStress=prior?.sensors?.breadth?.stress;
      if(Number.isFinite(priorStress))breadthDelta=stress-priorStress;
    }catch{}
    sensors.breadth={name:'Breadth',emoji:'📊',value:`${b.total-b.softening-b.stressed}/${b.total} steady`,
      stress,delta:breadthDelta,asOf:latestSectorObservationDate(sd),
      read:'How many of the eleven Sector Watch tickers are weakening. One weakening ticker proxy moves this; a broad selloff maxes it.',
      source:{publisher:'Sector Watch manual proxy panel',transport:'derived from disclosed quote.close source',seriesId:'SECTOR-BREADTH',
        metric:`Weakness share: half-weight softening + full-weight stressed over ${b.total} tickers`,url:'market.html'}};
    weighted.push(stress);
    console.log(`${'Breadth'.padEnd(16)} ${sensors.breadth.value.padStart(8)}  stress ${String(stress).padStart(3)}  (${sensors.breadth.asOf})`);
  }
  if(weighted.length!==6)throw new Error(`Ward M requires six gauges; received ${weighted.length}`);
  const raw=weighted.reduce((a,b)=>a+b,0)/weighted.length;
  const score=Math.round(Math.max(0,Math.min(100,CAL.a*raw+CAL.b)));
  const payload={generated:new Date().toISOString(),score,raw:+raw.toFixed(2),
    calibration:CAL,
    calibrationStatus:'calibrated-to-own-history; anchors provisional',
    note:'Ward M measures market/financial-system stress. It is not household pressure and does not affect the Ooze Score.',
    sensors};
  writePublishedPair({root:dataRoot,name:'market',globalName:'MARKET_DATA',payload});
  console.log(`\nMARKET OOZE: ${score}/100 · wrote ${path.join(dataRoot,'market.js')} + ${path.join(dataRoot,'market.json')}`);
})();
