#!/usr/bin/env node
/* WARD M backtest — gives the Market Ooze composite the same calibration
   doctrine as the jar: monthly composite computed back through history,
   calmest month → 10, GFC peak → 90, constants frozen into the collector.
   Window: 2007-01 → present (DTWEXBGS YoY begins 2007).
   Run: node scripts/backtest-market.js
   Writes research/market-backtest.json + prints the constants + episode peaks. */
const fs=require('fs');

async function series(id){
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

/* identical anchors to collect-market.js — one source of truth would be lib’d
   later; for now any change must be made in BOTH files */
const A={
  rates:[[-1.5,100],[-1,85],[-0.5,70],[0,45],[0.5,30],[1.5,15],[2.5,5]],
  volatility:[[12,5],[16,20],[20,35],[30,60],[40,80],[60,100]],
  credit:[[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]],
  energy:[[40,10],[60,25],[80,50],[100,75],[130,95],[160,100]],
  builders:[[-55,100],[-40,90],[-25,75],[-10,55],[0,30],[10,10]],
  industry:[[-15,100],[-10,90],[-5,75],[-2,55],[0,35],[2,20],[4,10]],
  freight:[[-15,100],[-10,90],[-5,70],[-2,50],[0,35],[2,22],[5,10]],
  dollar:[[-5,10],[0,25],[4,45],[8,65],[12,85],[16,100]],
};

(async()=>{
  const S={};
  for(const [k,id] of Object.entries({T10Y3M:'T10Y3M',VIXCLS:'VIXCLS',NFCI:'NFCI',DCOILWTICO:'DCOILWTICO',
    PERMIT:'PERMIT',INDPRO:'INDPRO',TSIFRGHT:'TSIFRGHT',DTWEXBGS:'DTWEXBGS'})){
    process.stdout.write(`fetching ${id}... `);
    S[k]=await series(id);
    console.log(Object.keys(S[k]).length+' months');
  }
  const now=new Date();
  const results=[];
  for(let y=2007;y<=now.getFullYear();y++)for(let mo=1;mo<=12;mo++){
    const m=`${y}-${String(mo).padStart(2,'0')}`;
    if(y===now.getFullYear()&&mo>now.getMonth()+1)break;
    const vals={
      rates:S.T10Y3M[m],volatility:S.VIXCLS[m],credit:S.NFCI[m],energy:S.DCOILWTICO[m],
      builders:yoy(S.PERMIT,m),industry:yoy(S.INDPRO,m),freight:yoy(S.TSIFRGHT,m),dollar:yoy(S.DTWEXBGS,m),
    };
    if(Object.values(vals).some(v=>v==null))continue;
    const stresses={};
    for(const k in vals)stresses[k]=interp(A[k],vals[k]);
    const raw=Object.values(stresses).reduce((a,b)=>a+b,0)/8;
    results.push({month:m,raw,stresses});
  }
  const rawCalm=Math.min(...results.map(r=>r.raw));
  const rawGfc=Math.max(...results.filter(r=>r.month>='2007-01'&&r.month<='2010-12').map(r=>r.raw));
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
    generated:new Date().toISOString(),anchors:A,
    calibration:{rawCalm,rawGfc,a,b,rule:'ward calm 2007-present → 10, ward GFC peak → 90'},
    monthly:results.map(r=>({month:r.month,score:r.score,raw:+r.raw.toFixed(2)})),
  },null,1));
  console.log('wrote research/market-backtest.json');
})();
