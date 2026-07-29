#!/usr/bin/env node
/* WARD M backtest v2 — slimmed composite, recalibrated on its own history.
   Weighted gauges (operator cut, 2026-07-28): rates, volatility, credit,
   energy, dollar + BREADTH (share of the 11 Sector Watch tickers weakening,
   monthly closes via quoted markets — the gauge that lets a -13% sector week
   move the score). Parked sensors (builders/industry/freight/speculative)
   are documented in improvements.md with anchors intact.
   Doctrine: ward calm 2007-present → 10, ward GFC peak → 90.
   Run: node scripts/backtest-market.js → prints frozen constants,
   writes research/market-backtest.json */
const fs=require('fs');

async function fred(id){
  const res=await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`,
    {headers:{'User-Agent':'oozemeter ward-m backtest'}});
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
async function yahooMonthly(sym){
  const now=Math.floor(Date.now()/1000);
  const res=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?period1=1149120000&period2=${now}&interval=1mo`,
    {headers:{'User-Agent':'Mozilla/5.0 (oozemeter ward-m backtest)'}});
  if(!res.ok)throw new Error(`${sym}: HTTP ${res.status}`);
  const r=(await res.json()).chart.result[0];
  const out={};
  for(let i=0;i<r.timestamp.length;i++){
    const c=r.indicators.quote[0].close[i];
    if(c!=null)out[new Date(r.timestamp[i]*1000).toISOString().slice(0,7)]=c;
  }
  return out;
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
      const chg=(c/p-1)*100;n++;
      if(chg<-7)stress++;else if(chg<-2)soft++;
    }
    if(n>=8)weakness[m]=(0.5*soft+stress)/n*100;
  }

  const now=new Date();
  const results=[];
  for(let y=2007;y<=now.getFullYear();y++)for(let mo=1;mo<=12;mo++){
    const m=`${y}-${String(mo).padStart(2,'0')}`;
    if(y===now.getFullYear()&&mo>now.getMonth()+1)break;
    const vals={rates:S.T10Y3M[m],volatility:S.VIXCLS[m],credit:S.NFCI[m],
      energy:S.DCOILWTICO[m],dollar:yoy(S.DTWEXBGS,m),breadth:weakness[m]};
    if(Object.values(vals).some(v=>v==null))continue;
    const stresses={};
    for(const k in vals)stresses[k]=interp(A[k],vals[k]);
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
    breadthTickers:TICKERS,
    calibration:{rawCalm,rawGfc,a,b,rule:'ward calm 2007-present → 10, ward GFC peak → 90'},
    monthly:results.map(r=>({month:r.month,score:r.score,raw:+r.raw.toFixed(2)})),
  },null,1));
  console.log('wrote research/market-backtest.json');
})();
