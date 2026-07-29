#!/usr/bin/env node
/* WARD M — Market Ooze collector v2 (standalone; touches no household pipeline).
   Slimmed per operator (2026-07-28): six gauges.

     rates       T10Y3M      Treasury/Board    yield-curve inversion
     volatility  VIXCLS      Cboe via FRED     option-market fear
     credit      NFCI        Chicago Fed       the methodology-v3 bridge
     energy      DCOILWTICO  EIA               WTI crude
     dollar      DTWEXBGS    Fed Board         broad dollar YoY
     breadth     Sector Watch (data/sectors.json) — share of the 11 quoted
                 sectors weakening; the gauge that lets a -13% sector week
                 move this score

   Parked (anchors preserved in improvements.md): builders PERMIT,
   industry INDPRO, freight TSIFRGHT, speculative CBBTCUSD.

   Calibration frozen from scripts/backtest-market.js (2007-present):
   ward calm → 10, ward GFC peak → 90. Re-run the backtest to re-freeze.

   Run order (weekly): node scripts/collect-sectors.js  (breadth input)
                       node scripts/collect-market.js   → data/market.js|.json */
const fs=require('fs');

const fred=id=>`https://fred.stlouisfed.org/series/${id}`;
async function series(id){
  const res=await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`,
    {headers:{'User-Agent':'oozemeter ward-m collector'}});
  if(!res.ok)throw new Error(`${id}: HTTP ${res.status}`);
  const rows=(await res.text()).trim().split('\n').slice(1);
  const acc={};
  for(const r of rows){
    const [d,v]=r.split(',');
    if(v==='.'||v===''||v==null)continue;
    (acc[d.slice(0,7)]??=[]).push(parseFloat(v));
  }
  const monthly={};
  for(const k in acc)monthly[k]=acc[k].reduce((a,b)=>a+b,0)/acc[k].length;
  return monthly;
}
function interp(anchors,x){
  if(x<=anchors[0][0])return anchors[0][1];
  const last=anchors[anchors.length-1];
  if(x>=last[0])return last[1];
  for(let i=0;i<anchors.length-1;i++){
    const [x1,y1]=anchors[i],[x2,y2]=anchors[i+1];
    if(x>=x1&&x<=x2)return y1+(y2-y1)*(x-x1)/(x2-x1);
  }
  return 0;
}
const last=m=>Object.keys(m).sort().pop();
const prevKey=k=>{const[y,mo]=k.split('-').map(Number);return `${mo===1?y-1:y}-${String(mo===1?12:mo-1).padStart(2,'0')}`};
const yoy=(m,k)=>{const p=m[`${+k.slice(0,4)-1}${k.slice(4)}`];return p?((m[k]-p)/p*100):null};

/* frozen from scripts/backtest-market.js (6-gauge composite, 2007-present) */
const CAL={a:1.4025,b:-7.0116,rule:'ward calm 2007-present = 10, ward GFC peak = 90',
  episodes:[
    {name:'GFC peak',month:'2008-11',score:90},
    {name:'Euro stress',month:'2011-09',score:61},
    {name:'COVID',month:'2020-03',score:71},
    {name:'2022 tightening',month:'2022-09',score:76},
    {name:'Bank stress',month:'2023-02',score:60},
    {name:'Calmest',month:'2017-09',score:10},
  ]};

const SENSORS=[
 {slug:'rates',name:'Rates',emoji:'🏛',seriesId:'T10Y3M',publisher:'U.S. Treasury via Federal Reserve Board',
  metric:'10-year minus 3-month Treasury spread, monthly mean (pp)',
  anchors:[[-1.5,100],[-1,85],[-0.5,70],[0,45],[0.5,30],[1.5,15],[2.5,5]],
  value:(m,k)=>m[k],fmt:v=>`${v.toFixed(2)}pp`,
  read:'An inverted curve — short rates above long — has preceded most modern recessions.'},
 {slug:'volatility',name:'Volatility',emoji:'🌪',seriesId:'VIXCLS',publisher:'Cboe',
  metric:'VIX, monthly mean of daily closes',
  anchors:[[12,5],[16,20],[20,35],[30,60],[40,80],[60,100]],
  value:(m,k)=>m[k],fmt:v=>v.toFixed(1),
  read:'The option market\'s 30-day fear gauge. Spikes mark panic; calm can mark complacency.'},
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
  read:'A surging dollar means global funding stress and pressure on everyone who borrowed in it.'},
];
const BREADTH_ANCHORS=[[0,5],[10,22],[20,40],[35,60],[55,80],[80,100]];

(async()=>{
  const sensors={};const weighted=[];
  for(const s of SENSORS){
    const m=await series(s.seriesId);
    let k=last(m),val=s.value(m,k),prevVal=s.value(m,prevKey(k));
    if(val==null){k=prevKey(k);val=s.value(m,k);prevVal=s.value(m,prevKey(k));}
    const stress=Math.round(interp(s.anchors,val));
    const prevStress=prevVal==null?stress:Math.round(interp(s.anchors,prevVal));
    sensors[s.slug]={name:s.name,emoji:s.emoji,value:s.fmt(val),stress,delta:stress-prevStress,
      asOf:k,read:s.read,
      source:{publisher:s.publisher,transport:'FRED',seriesId:s.seriesId,metric:s.metric,url:fred(s.seriesId)}};
    weighted.push(stress);
    console.log(`${s.name.padEnd(16)} ${s.fmt(val).padStart(8)}  stress ${String(stress).padStart(3)}  (${k})`);
  }
  /* breadth — from the Sector Watch weekly collection */
  let sd=null;try{sd=JSON.parse(fs.readFileSync('data/sectors.json','utf8'))}catch{}
  if(sd){
    const b=sd.breadth;
    const weakness=(0.5*b.softening+b.stressed)/b.total*100;
    const stress=Math.round(interp(BREADTH_ANCHORS,weakness));
    sensors.breadth={name:'Breadth',emoji:'📊',value:`${b.total-b.softening-b.stressed}/${b.total} steady`,
      stress,delta:0,asOf:sd.generated.slice(0,10),
      read:'How many of the eleven Sector Watch tickers are weakening. One bleeding sector moves this; a broad selloff maxes it.',
      source:{publisher:'Quoted markets (Sector Watch, weekly)',transport:'derived',seriesId:'SECTOR-BREADTH',
        metric:`Weakness share: half-weight softening + full-weight stressed over ${b.total} tickers`,url:'market.html'}};
    weighted.push(stress);
    console.log(`${'Breadth'.padEnd(16)} ${sensors.breadth.value.padStart(8)}  stress ${String(stress).padStart(3)}  (${sensors.breadth.asOf})`);
  }else{
    console.warn('breadth: data/sectors.json missing — run collect-sectors.js first; scoring without it');
  }
  const raw=weighted.reduce((a,b)=>a+b,0)/weighted.length;
  const score=Math.round(Math.max(0,Math.min(100,CAL.a*raw+CAL.b)));
  const payload={generated:new Date().toISOString(),score,raw:+raw.toFixed(2),
    calibration:CAL,
    calibrationStatus:'calibrated-to-own-history; anchors provisional',
    note:'Ward M measures market/financial-system stress. It is not household pressure and does not affect the Ooze Score.',
    sensors};
  fs.writeFileSync('data/market.js','window.MARKET_DATA='+JSON.stringify(payload)+';\n');
  fs.writeFileSync('data/market.json',JSON.stringify(payload,null,1)+'\n');
  console.log(`\nMARKET OOZE: ${score}/100 · wrote data/market.js + data/market.json`);
})();
