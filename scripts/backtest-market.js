#!/usr/bin/env node
/* WARD M backtest v2 — slimmed composite, recalibrated on its own history.
   Weighted gauges (operator cut, 2026-07-28): rates, volatility, credit,
   energy, dollar + BREADTH (share of the 11 Sector Watch tickers weakening,
   monthly closes via quoted markets — the gauge that lets a sharply weakening ticker proxy
   move the score). Parked sensors (builders/industry/freight/speculative)
   are documented in improvements.md with anchors intact.
   Doctrine: ward calm 2007-present → 10, ward GFC peak → 90.
   Run: node scripts/backtest-market.js → prints frozen constants,
   writes research/market-backtest.json */
const fs=require('fs');
const {interpolateAnchors,parseFredMonthly}=require('./lib/market-series');
const {parseYahooChart}=require('./lib/market-sector');

async function fred(id){
  const res=await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`,
    {headers:{'User-Agent':'oozemeter ward-m backtest'}});
  if(!res.ok)throw new Error(`${id}: HTTP ${res.status}`);
  return parseFredMonthly(await res.text(),id);
}
async function yahooMonthly(sym){
  const now=Math.floor(Date.now()/1000);
  const res=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?period1=1149120000&period2=${now}&interval=1mo`,
    {headers:{'User-Agent':'Mozilla/5.0 (oozemeter ward-m backtest)'}});
  if(!res.ok)throw new Error(`${sym}: HTTP ${res.status}`);
  const {observations}=parseYahooChart(await res.json(),sym);
  const out={};
  for(const {t,c} of observations){
    out[new Date(t*1000).toISOString().slice(0,7)]=c;
  }
  return out;
}

const yoy=(m,k)=>{const p=m[`${+k.slice(0,4)-1}${k.slice(4)}`];return p!=null&&m[k]!=null?((m[k]-p)/p*100):null};
const prevKey=k=>{const[y,mo]=k.split('-').map(Number);return `${mo===1?y-1:y}-${String(mo===1?12:mo-1).padStart(2,'0')}`};

const TICKERS=['SPY','QQQ','DIA','IWM','XLF','XLI','IYT','XLY','XLP','SMH','XLV'];
/* anchors — single source of truth mirrored in collect-market.js */
const A={
  rates:[[-1.5,100],[-1,85],[-0.5,70],[0,45],[0.5,30],[1.5,15],[2.5,5]],
  volatility:[[12,5],[16,20],[20,35],[30,60],[40,80],[60,100]],
  credit:[[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]],
  energy:[[40,10],[60,25],[80,50],[100,75],[130,95],[160,100]],
  dollar:[[-5,10],[0,25],[4,45],[8,65],[12,85],[16,100]],
  breadth:[[0,5],[10,22],[20,40],[35,60],[55,80],[80,100]],
};

(async()=>{
  const S={};
  for(const id of ['T10Y3M','VIXCLS','NFCI','DCOILWTICO','DTWEXBGS']){
    process.stdout.write(`fetching ${id}... `);
    S[id]=await fred(id);
    console.log(Object.keys(S[id]).length+' months');
  }
  const px={};
  for(const t of TICKERS){
    process.stdout.write(`fetching ${t}... `);
    px[t]=await yahooMonthly(t);
    console.log(Object.keys(px[t]).length+' months');
  }
  /* monthly breadth weakness: share of tickers down >2% (half-weight) / >7% (full) */
  const weakness={};
  const months=new Set();
  for(const t of TICKERS)Object.keys(px[t]).forEach(m=>months.add(m));
  for(const m of [...months].sort()){
    let soft=0,stress=0,n=0;
    for(const t of TICKERS){
      const c=px[t][m],p=px[t][prevKey(m)];
      if(c==null||p==null)continue;
      const chg=(c/p-1)*100;
      if(!Number.isFinite(chg))throw new Error(`${t} ${m}: non-finite monthly price change`);
      n++;
      if(chg<-7)stress++;else if(chg<-2)soft++;
    }
    if(n>=8)weakness[m]=(0.5*soft+stress)/n*100;
  }
  const historyRows=series=>Object.entries(series)
    .filter(([month,value])=>/^\d{4}-\d{2}$/.test(month)&&Number.isFinite(value))
    .sort(([a],[b])=>a.localeCompare(b))
    .map(([month,value])=>({month,value:+value.toFixed(6)}));
  const dollarHistory={};
  for(const month of Object.keys(S.DTWEXBGS)){
    const value=yoy(S.DTWEXBGS,month);
    if(value!=null)dollarHistory[month]=value;
  }
  const gaugeHistory={
    rates:historyRows(S.T10Y3M),
    volatility:historyRows(S.VIXCLS),
    credit:historyRows(S.NFCI),
    energy:historyRows(S.DCOILWTICO),
    dollar:historyRows(dollarHistory),
    breadth:historyRows(weakness),
  };

  const now=new Date();
  const results=[];
  for(let y=2007;y<=now.getFullYear();y++)for(let mo=1;mo<=12;mo++){
    const m=`${y}-${String(mo).padStart(2,'0')}`;
    if(y===now.getFullYear()&&mo>now.getMonth()+1)break;
    const vals={rates:S.T10Y3M[m],volatility:S.VIXCLS[m],credit:S.NFCI[m],
      energy:S.DCOILWTICO[m],dollar:yoy(S.DTWEXBGS,m),breadth:weakness[m]};
    if(Object.values(vals).some(v=>v==null))continue;
    const stresses={};
    for(const k in vals)stresses[k]=interpolateAnchors(A[k],vals[k]);
    const raw=Object.values(stresses).reduce((a,b)=>a+b,0)/6;
    results.push({month:m,raw,stresses});
  }
  const rawCalm=Math.min(...results.map(r=>r.raw));
  const rawGfc=Math.max(...results.filter(r=>r.month<='2010-12').map(r=>r.raw));
  const a=(90-10)/(rawGfc-rawCalm),b=10-a*rawCalm;
  for(const r of results)r.score=Math.round(Math.max(0,Math.min(100,a*r.raw+b)));
  console.log(`\ncalibration: raw calm ${rawCalm.toFixed(1)} → 10 · raw GFC peak ${rawGfc.toFixed(1)} → 90 · a=${a.toFixed(4)} b=${b.toFixed(4)}`);
  const peak=(f,t)=>{const rr=results.filter(x=>x.month>=f&&x.month<=t);return rr.reduce((p,c)=>c.score>p.score?c:p,rr[0])};
  for(const [name,f,t] of [['GFC','2007-01','2010-12'],['Euro stress','2011-01','2012-12'],['COVID','2020-01','2020-12'],
      ['2022 tightening','2022-01','2022-12'],['Bank stress','2023-01','2023-12'],['Latest 12mo',results[results.length-13].month,results[results.length-1].month]]){
    const p=peak(f,t);
    const tops=Object.entries(p.stresses).sort((x,y)=>y[1]-x[1]).slice(0,3).map(([k,v])=>`${k} ${Math.round(v)}`).join(', ');
    console.log(`${name.padEnd(16)} peak ${String(p.score).padStart(3)} in ${p.month}  (${tops})`);
  }
  const calm=results.reduce((p,c)=>c.score<p.score?c:p);
  console.log(`calmest          ${calm.score} in ${calm.month}`);
  console.log(`LATEST           ${results[results.length-1].score} in ${results[results.length-1].month}`);
  fs.writeFileSync('research/market-backtest.json',JSON.stringify({
    generated:new Date().toISOString(),anchors:A,gauges:Object.keys(A),
    basis:'Current-revised research reconstruction, not release-time vintages. Historical breadth uses successive monthly Yahoo closes; live Sector Watch uses a 22-session daily interval requiring 23 closes, so the two breadth transforms are not identical.',
    breadthTickers:TICKERS,
    gaugeHistory,
    calibration:{rawCalm,rawGfc,a,b,rule:'ward calm 2007-present → 10, ward GFC peak → 90'},
    monthly:results.map(r=>({month:r.month,score:r.score,raw:+r.raw.toFixed(2)})),
  },null,1));
  console.log('wrote research/market-backtest.json');
})();
