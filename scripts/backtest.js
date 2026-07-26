#!/usr/bin/env node
/* OOZEMeter backtest — real public data vs. proposed calibration.
   FRED series need no key; auto distress comes from the NY Fed HHDC workbook.
   Run: node scripts/backtest.js
   Writes research/backtest-results.json and prints episode peaks. */

const {
  AUTO_30_PLUS_ANCHORS,
  auto30PlusStress,
  fetchNyFedAutoSeries,
  trailingFourWeekByMonth,
  yearOverYear,
} = require('./lib/methodology');

const SERIES = {
  UNRATE:      'Unemployment rate',
  ICSA:        'Initial jobless claims (weekly, fast signal)',
  CPIAUCNS:    'CPI-U, not seasonally adjusted (YoY computed)',
  MORTGAGE30US:'30yr mortgage rate',
  DRSFRMACBS:  'Mortgage delinquency rate',
  DRCCLACBS:   'Credit card delinquency rate',
  GASREGW:     'Regular gas, $/gal (nominal, deflated by CPI)',
};

/* ---- published anchor curves: [indicator value, stress 0-100] ----
   Calibration doctrine: piecewise-linear, fixed, chosen so the scale is
   absolute (90+ = depression-class). The single modern tuning target is
   GFC peak ≈ 90; everything else falls where the data puts it. */
const ANCHORS = {
  unemployment: [[3.5,5],[5,25],[6.5,45],[8,62],[10,78],[15,90],[25,100]],
  /* weekly initial claims, thousands (trailing 4-week mean) — the fast
     signal that catches crises months before unemployment/delinquencies move */
  claimsK:      [[200,5],[300,30],[400,60],[550,75],[700,85],[1000,95],[6000,100]],
  inflationYoY: [[-10,95],[-5,85],[0,45],[1,25],[2,10],[3,25],[4,40],[6,60],[9,80],[14,90],[20,100]],
  mortgageRate: [[3,10],[5,25],[7,50],[10,70],[15,90],[18.6,100]],
  mortgageDelinq:[[1,5],[2,25],[3,45],[5,65],[8,85],[11.5,95]],
  cardDelinq:   [[1.5,10],[2.5,30],[3.5,50],[5,70],[6.8,90],[9,100]],
  auto30Plus:   AUTO_30_PLUS_ANCHORS,
  gasReal:      [[2,10],[3,35],[4,60],[5,85],[6.5,100]],
};
const WEIGHTS = { employment:25, housing:20, credit:20, auto:15, gas:10, inflation:10 };

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

async function fetchSeries(id){
  const res=await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`);
  if(!res.ok)throw new Error(`${id}: HTTP ${res.status}`);
  const rows=(await res.text()).trim().split('\n').slice(1);
  const out={};                                     // 'YYYY-MM' -> avg value
  const acc={};
  for(const r of rows){
    const [d,v]=r.split(',');
    if(v==='.'||v===''||v==null)continue;
    const key=d.slice(0,7);
    (acc[key]??=[]).push(parseFloat(v));
  }
  for(const k in acc)out[k]=acc[k].reduce((a,b)=>a+b,0)/acc[k].length;
  return out;
}

/* quarterly series → forward-fill to months */
function ffill(series,months){
  const out={};let last=null;
  for(const m of months){ if(series[m]!=null)last=series[m]; out[m]=last; }
  return out;
}

(async()=>{
  const data={};
  for(const id of Object.keys(SERIES)){
    process.stdout.write(`fetching ${id}... `);
    data[id]=await fetchSeries(id);
    console.log(`${Object.keys(data[id]).length} months`);
  }
  process.stdout.write('fetching NY Fed auto 30+ flow... ');
  const nyFedAuto=await fetchNyFedAutoSeries();
  data.NYFED_AUTO_30PLUS=nyFedAuto.monthly;
  console.log(`${Object.keys(data.NYFED_AUTO_30PLUS).length} quarters`);

  const months=[];
  const now=new Date();
  for(let y=2000;y<=now.getFullYear();y++)
    for(let m=1;m<=12;m++){
      const key=`${y}-${String(m).padStart(2,'0')}`;
      if(y===now.getFullYear()&&m>now.getMonth()+1)break;
      months.push(key);
    }

  const ff={DRSFRMACBS:ffill(data.DRSFRMACBS,months),
            DRCCLACBS:ffill(data.DRCCLACBS,months),
            NYFED_AUTO_30PLUS:ffill(data.NYFED_AUTO_30PLUS,months)};
  const cpiNow=Object.entries(data.CPIAUCSL).sort().pop()[1];

  const results=[];
  for(const m of months){
    const un=data.UNRATE[m];
    const icsa=data.ICSA[m];
    const cpi=data.CPIAUCSL[m];
    const prev=`${+m.slice(0,4)-1}${m.slice(4)}`;
    const cpiPrev=data.CPIAUCSL[prev];
    const mort=data.MORTGAGE30US[m];
    const mdel=ff.DRSFRMACBS[m], cdel=ff.DRCCLACBS[m], auto30=ff.NYFED_AUTO_30PLUS[m];
    const gasNom=data.GASREGW[m];
    if([un,icsa,cpi,cpiPrev,mort,mdel,cdel,auto30,gasNom].some(v=>v==null))continue;

    const stresses={
      /* level (unemployment) OR speed (claims spike) — whichever screams louder */
      employment:Math.max(interp(ANCHORS.unemployment,un),interp(ANCHORS.claimsK,icsa/1000)),
      inflation:interp(ANCHORS.inflationYoY,(cpi/cpiPrev-1)*100),
      housing:Math.max(interp(ANCHORS.mortgageRate,mort),interp(ANCHORS.mortgageDelinq,mdel)),
      credit:interp(ANCHORS.cardDelinq,cdel),
      auto:auto30PlusStress(auto30),
      gas:interp(ANCHORS.gasReal,gasNom*cpiNow/cpi),
    };
    const ooze=Object.entries(WEIGHTS).reduce((a,[k,w])=>a+w*stresses[k],0)/100;
    results.push({month:m,ooze,stresses});
  }

  /* ---- calibration: two published points on the frozen 2000-2025 window ----
     calmest month → 10 (so SMOOTH is reachable) · GFC peak → 90 (the doctrine).
     After this run the printed a/b constants get frozen into collect.js. */
  const win=results.filter(x=>x.month>='2000-01'&&x.month<='2025-12');
  const rawCalm=Math.min(...win.map(x=>x.ooze));
  const rawGfc=Math.max(...win.filter(x=>x.month>='2007-01'&&x.month<='2010-12').map(x=>x.ooze));
  const a=(90-10)/(rawGfc-rawCalm), b=10-a*rawCalm;
  console.log(`\ncalibration: raw calm ${rawCalm.toFixed(1)} → 10 · raw GFC peak ${rawGfc.toFixed(1)} → 90 · a=${a.toFixed(4)} b=${b.toFixed(4)}`);
  for(const r of results)r.ooze=Math.round(Math.max(0,Math.min(100,a*r.ooze+b))*10)/10;

  const peak=(from,to)=>{
    const r=results.filter(x=>x.month>=from&&x.month<=to);
    return r.reduce((a,b)=>b.ooze>a.ooze?b:a,r[0]);
  };
  const episodes=[
    ['Dot-com / 9-11','2000-01','2003-12'],
    ['Pre-GFC calm','2004-01','2006-12'],
    ['GFC','2007-01','2010-12'],
    ['Recovery trough','2014-01','2019-12'],
    ['COVID','2020-01','2020-12'],
    ['Inflation surge','2021-06','2022-12'],
    ['Bank stress','2023-01','2023-12'],
  ];
  console.log('\n=== WHAT THE DATA SAYS (monthly OOZE, real FRED data) ===');
  for(const [name,a,b] of episodes){
    const p=peak(a,b);
    if(!p){console.log(`${name}: no data`);continue;}
    const tops=Object.entries(p.stresses).sort((x,y)=>y[1]-x[1]).slice(0,3)
      .map(([k,v])=>`${k} ${Math.round(v)}`).join(', ');
    console.log(`${name.padEnd(18)} peak ${String(p.ooze).padStart(5)} in ${p.month}  (top: ${tops})`);
  }
  const latest=results[results.length-1];
  const topsNow=Object.entries(latest.stresses).sort((x,y)=>y[1]-x[1])
    .map(([k,v])=>`${k} ${Math.round(v)}`).join(', ');
  console.log(`\nLATEST REAL READING   ${latest.ooze} in ${latest.month}  (${topsNow})`);
  const min=results.reduce((a,b)=>b.ooze<a.ooze?b:a);
  console.log(`Calmest month         ${min.ooze} in ${min.month}`);

  /* the June-2009 breadth check quoted in Lab Notes — keep the copy honest */
  const jun09=results.find(x=>x.month==='2009-06');
  if(jun09)console.log('\n2009-06 line stresses:',Object.entries(jun09.stresses).map(([k,v])=>`${k} ${Math.round(v)}`).join(' · '));

  require('fs').writeFileSync('research/backtest-results.json',
    JSON.stringify({generated:new Date().toISOString(),anchors:ANCHORS,weights:WEIGHTS,
      methodology:{
        auto:{
          source:'New York Fed Consumer Credit Panel / Equifax',
          metric:'Previously current auto balance entering 30+ delinquency',
          workbook:nyFedAuto.sourceUrl,
          worksheet:'Page 13 Data',
          column:'AUTO',
          frequency:'quarterly',
        },
      },
      calibration:{rawCalm,rawGfc,a,b,rule:'calm 2003-2025 → 10, GFC peak → 90'},monthly:results},null,1));
  console.log('wrote research/backtest-results.json');

  /* emit the site's HISTORY array (monthly, calibrated) for lab.js */
  const hist=results.map(r=>{const [y,mo]=r.month.split('-');return `[${(+y+(+mo-1)/12).toFixed(3)},${Math.round(r.ooze)}]`});
  require('fs').writeFileSync('research/history-array.txt',hist.join(','));
  console.log('wrote research/history-array.txt (paste target: lab.js HISTORY)');
})();
