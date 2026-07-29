#!/usr/bin/env node
/* WARD M — Sector Watch collector (weekly cadence).
   The operator's ETF dashboard, reported the way a newsroom reports markets:
   per-sector STATE + percent change, never price levels or series. Users
   verify against any quote service — that is the point of using tickers.

   Groups (advisor-reviewed):
     Indexes: SPY QQQ DIA IWM · Financial System: XLF XLI IYT
     Consumer: XLY XLP · Innovation: SMH · Defensive: XLV
   Cut: XLK (QQQ overlap), IBB (too niche), XLB/XME (optional cyclicals).

   State rule (published, provisional): 1-month change ≥ −2% → STEADY 🟢,
   −2% to −7% → SOFTENING 🟡, below −7% → STRESSED 🔴.
   Breadth: count of softening/stressed sectors → overall CALM / MIXED /
   SOFTENING / STRESSED.

   We store only derived readings (state, 1m%, 3m%, as-of) — no price data
   is archived or republished. Zero weight anywhere; not part of any score.

   Run weekly: node scripts/collect-sectors.js → data/sectors.js|.json */
const fs=require('fs');

const GROUPS=[
 {name:'Market Indexes',tickers:[['SPY','Broad U.S. market'],['QQQ','Technology / growth'],['DIA','Blue-chip industrials'],['IWM','Small caps — the Main Street proxy']]},
 {name:'Financial System',tickers:[['XLF','Banks, lending, credit'],['XLI','Industrials & business investment'],['IYT','Transportation & logistics']]},
 {name:'Consumer',tickers:[['XLY','Discretionary — willingness to spend'],['XLP','Staples — defensive spending']]},
 {name:'Innovation',tickers:[['SMH','Semiconductors — capex & AI demand']]},
 {name:'Defensive',tickers:[['XLV','Healthcare']]},
];

async function closes(sym){
  const now=Math.floor(Date.now()/1000);
  const url=`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?period1=${now-200*86400}&period2=${now}&interval=1d`;
  const res=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (oozemeter sector watch)'}});
  if(!res.ok)throw new Error(`${sym}: HTTP ${res.status}`);
  const j=await res.json();
  const r=j.chart.result[0];
  const out=[];
  for(let i=0;i<r.timestamp.length;i++){
    const c=r.indicators.quote[0].close[i];
    if(c!=null)out.push({t:r.timestamp[i],c});
  }
  return out;
}
const pct=(a,b)=>(a/b-1)*100;
const state=m1=>m1>=-2?['steady','🟢']:m1>=-7?['softening','🟡']:['stressed','🔴'];

(async()=>{
  const groups=[];let soft=0,stress=0,total=0;
  for(const g of GROUPS){
    const rows=[];
    for(const [sym,role] of g.tickers){
      const cs=await closes(sym);
      const last=cs[cs.length-1];
      const m1=pct(last.c,cs[Math.max(0,cs.length-22)].c);
      const m3=pct(last.c,cs[Math.max(0,cs.length-64)].c);
      const [st,dot]=state(m1);
      total++;if(st==='softening')soft++;if(st==='stressed')stress++;
      rows.push({sym,role,state:st,dot,m1:+m1.toFixed(1),m3:+m3.toFixed(1),
        asOf:new Date(last.t*1000).toISOString().slice(0,10)});
      console.log(`${sym.padEnd(5)} ${dot} ${st.padEnd(10)} 1m ${m1>=0?'+':''}${m1.toFixed(1)}%  3m ${m3>=0?'+':''}${m3.toFixed(1)}%  (${role})`);
    }
    groups.push({name:g.name,rows});
  }
  const overall=stress>=3?'STRESSED':stress>=1||soft>=4?'SOFTENING':soft>=2?'MIXED':'CALM';
  const payload={generated:new Date().toISOString(),cadence:'weekly',
    overall,breadth:{steady:total-soft-stress,softening:soft,stressed:stress,total},
    note:'Weekly journalistic report of quoted-market changes. Derived states only; no price data archived or republished. Not part of any score. Verify any row against a public quote for its ticker.',
    stateRule:'1-month change: >= -2% steady, -2% to -7% softening, below -7% stressed',
    groups};
  fs.writeFileSync('data/sectors.js','window.SECTOR_DATA='+JSON.stringify(payload)+';\n');
  fs.writeFileSync('data/sectors.json',JSON.stringify(payload,null,1)+'\n');
  console.log(`\nSECTOR WATCH: ${overall} — ${total-soft-stress} steady · ${soft} softening · ${stress} stressed`);
})();
