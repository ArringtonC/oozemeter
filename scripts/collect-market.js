#!/usr/bin/env node
/* WARD M — Market Ooze collector (standalone; touches no household pipeline).
   Nine market/financial-system sensors, every one an official public series,
   mapped from the operator's sector watchlist to licensing-clean equivalents:

     watchlist intent          sensor        series      (publisher via FRED)
     US02Y/US10Y/US30Y      →  rates         T10Y3M      Treasury/Board
     VIX                    →  volatility    VIXCLS      Cboe (citation)
     XLF / credit           →  credit        NFCI        Chicago Fed
     USO/CL1!/XLE           →  energy        DCOILWTICO  EIA
     ITB/XHB/LEN/DHI/NVR    →  builders      PERMIT      Census/HUD
     ###MANUFACTURING block →  industry      INDPRO      Fed Board
     IYT                    →  freight       TSIFRGHT    DOT BTS
     UUP                    →  dollar        DTWEXBGS    Fed Board
     GBTC                   →  speculative   CBBTCUSD    Coinbase (aux, 0-weight)

   Raw ticker/ETF prices (SPY, CAT, LEN…) are NOT used: index and exchange data
   can't be republished by a free public site (see market-signal review).

   Composite = mean of the eight weighted sensors (equal weights, PROVISIONAL).
   Ward M is an experimental instrument: separate from the Ooze Score, measures
   market/financial-system stress, NOT household pressure.

   Run: node scripts/collect-market.js   → data/market.js + data/market.json
   Daily cron wiring belongs to the data session's workflow batch. */
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

/* provisional anchors — every sensor 0-100, direction = market stress */
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
 {slug:'builders',name:'Builders',emoji:'🏗',seriesId:'PERMIT',publisher:'U.S. Census Bureau / HUD',
  metric:'Building permits, year-over-year %',
  anchors:[[-55,100],[-40,90],[-25,75],[-10,55],[0,30],[10,10]],
  value:yoy,fmt:v=>`${v>=0?'+':''}${v.toFixed(1)}%`,
  read:'Permits fall before construction jobs do. The homebuilder tickers\' public-data twin.'},
 {slug:'industry',name:'Industry',emoji:'🏭',seriesId:'INDPRO',publisher:'Federal Reserve Board',
  metric:'Industrial production, year-over-year %',
  anchors:[[-15,100],[-10,90],[-5,75],[-2,55],[0,35],[2,20],[4,10]],
  value:yoy,fmt:v=>`${v>=0?'+':''}${v.toFixed(1)}%`,
  read:'Realized factory output — the industrial watchlist block without the tickers.'},
 {slug:'freight',name:'Freight',emoji:'🚚',seriesId:'TSIFRGHT',publisher:'U.S. DOT Bureau of Transportation Statistics',
  metric:'Freight Transportation Services Index, year-over-year %',
  anchors:[[-15,100],[-10,90],[-5,70],[-2,50],[0,35],[2,22],[5,10]],
  value:yoy,fmt:v=>`${v>=0?'+':''}${v.toFixed(1)}%`,
  read:'If the economy moves, it moves on a truck first. The transports ETF, measured by the government.'},
 {slug:'dollar',name:'Dollar',emoji:'💵',seriesId:'DTWEXBGS',publisher:'Federal Reserve Board',
  metric:'Broad dollar index, year-over-year %',
  anchors:[[-5,10],[0,25],[4,45],[8,65],[12,85],[16,100]],
  value:yoy,fmt:v=>`${v>=0?'+':''}${v.toFixed(1)}%`,
  read:'A surging dollar means global funding stress and pressure on everyone who borrowed in it.'},
 {slug:'speculative',name:'Speculative',emoji:'🧪',seriesId:'CBBTCUSD',publisher:'Coinbase',
  metric:'Bitcoin drawdown from running peak, %',aux:true,
  anchors:[[0,5],[20,20],[40,45],[60,70],[80,90],[95,100]],
  value:'drawdown',fmt:v=>`−${v.toFixed(0)}%`,
  read:'Risk appetite\'s canary. Auxiliary: watched, zero weight in the composite.'},
];

(async()=>{
  const sensors={};const weighted=[];
  for(const s of SENSORS){
    const m=await series(s.seriesId);
    let k=last(m),val,prevVal;
    if(s.value==='drawdown'){
      let peak=0;const ddm={};
      for(const key of Object.keys(m).sort()){peak=Math.max(peak,m[key]);ddm[key]=(peak-m[key])/peak*100;}
      val=ddm[k];prevVal=ddm[prevKey(k)];
    }else{
      val=s.value(m,k);prevVal=s.value(m,prevKey(k));
      if(val==null){k=prevKey(k);val=s.value(m,k);prevVal=s.value(m,prevKey(k));}
    }
    const stress=Math.round(interp(s.anchors,val));
    const prevStress=prevVal==null?stress:Math.round(interp(s.anchors,prevVal));
    sensors[s.slug]={name:s.name,emoji:s.emoji,value:s.fmt(val),stress,delta:stress-prevStress,
      asOf:k,aux:!!s.aux,read:s.read,
      source:{publisher:s.publisher,transport:'FRED',seriesId:s.seriesId,metric:s.metric,url:fred(s.seriesId)}};
    if(!s.aux)weighted.push(stress);
    console.log(`${s.name.padEnd(16)} ${s.fmt(val).padStart(8)}  stress ${String(stress).padStart(3)}  (${k})${s.aux?'  AUX':''}`);
  }
  const score=Math.round(weighted.reduce((a,b)=>a+b,0)/weighted.length);
  const payload={generated:new Date().toISOString(),score,
    calibrationStatus:'experimental-provisional',
    note:'Ward M measures market/financial-system stress from official public series. It is not household pressure and does not affect the Ooze Score.',
    sensors};
  fs.writeFileSync('data/market.js','window.MARKET_DATA='+JSON.stringify(payload)+';\n');
  fs.writeFileSync('data/market.json',JSON.stringify(payload,null,1)+'\n');
  console.log(`\nMARKET OOZE (provisional): ${score}/100 · wrote data/market.js + data/market.json`);
})();
