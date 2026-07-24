#!/usr/bin/env node
/* OOZEMeter daily collector — Gate 2.
   Cadence doctrine:
   - HEADLINE ooze = last COMPLETE month (publishes automatically ~mid-month,
     once that month's jobs report + CPI are in FRED — "the best time").
   - Each intake LINE shows its freshest observation with its own asOf;
     lines update whenever their data releases (weekly gas/mortgage,
     monthly jobs/CPI, quarterly delinquencies).
   Writes data/latest.json (API shape) + data/latest.js (site loads this).
   Run: node scripts/collect.js */

const fs=require('fs');

/* frozen calibration — derived once on the 2000-2025 window (backtest.js),
   calm month → 10, GFC peak Jun 2009 → 90. Do not re-derive daily. */
const CAL={a:1.4828,b:-27.4883};

const ANCHORS={
  unemployment:[[3.5,5],[5,25],[6.5,45],[8,62],[10,78],[15,90],[25,100]],
  claimsK:[[200,5],[300,30],[400,60],[550,75],[700,85],[1000,95],[6000,100]],
  inflationYoY:[[-10,95],[-5,85],[0,45],[1,25],[2,10],[3,25],[4,40],[6,60],[9,80],[14,90],[20,100]],
  mortgageRate:[[3,10],[5,25],[7,50],[10,70],[15,90],[18.6,100]],
  mortgageDelinq:[[1,5],[2,25],[3,45],[5,65],[8,85],[11.5,95]],
  cardDelinq:[[1.5,10],[2.5,30],[3.5,50],[5,70],[6.8,90],[9,100]],
  consumerDelinq:[[1.5,10],[2.5,35],[3.5,60],[4.85,85],[6,100]],
  gasReal:[[2,10],[3,35],[4,60],[5,85],[6.5,100]],
};
const WEIGHTS={jobs:25,housing:20,credit:20,auto:15,gas:10,inflation:10};
/* quarterly obs are dated at quarter START and publish ~5mo later — a healthy
   feed's oldest normal age is ~240d, so the alarm line sits at 250 */
const STALE_DAYS={weekly:21,monthly:75,quarterly:250};

function interp(an,x){
  if(x<=an[0][0])return an[0][1];
  const l=an[an.length-1];if(x>=l[0])return l[1];
  for(let i=0;i<an.length-1;i++){const[x1,y1]=an[i],[x2,y2]=an[i+1];
    if(x>=x1&&x<=x2)return y1+(y2-y1)*(x-x1)/(x2-x1);}
  return 0;
}

async function fetchSeries(id){
  const res=await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`);
  if(!res.ok)throw new Error(`${id}: HTTP ${res.status}`);
  const rows=(await res.text()).trim().split('\n').slice(1);
  const acc={};let last=null;
  for(const r of rows){
    const[d,v]=r.split(',');
    if(v==='.'||v===''||v==null)continue;
    (acc[d.slice(0,7)]??=[]).push(parseFloat(v));
    last={date:d,value:parseFloat(v)};
  }
  const monthly={};
  for(const k in acc)monthly[k]=acc[k].reduce((a,b)=>a+b,0)/acc[k].length;
  return{monthly,last};
}
const ffill=(s,months)=>{const o={};let l=null;for(const m of months){if(s[m]!=null)l=s[m];o[m]=l}return o};

(async()=>{
  const ids=['UNRATE','ICSA','CPIAUCSL','MORTGAGE30US','DRSFRMACBS','DRCCLACBS','DRCLACBS','GASREGW'];
  const S={};
  for(const id of ids){S[id]=await fetchSeries(id);process.stdout.write(id+' ')}
  console.log('fetched');

  const now=new Date();
  const months=[];
  for(let y=2000;y<=now.getFullYear();y++)
    for(let m=1;m<=12;m++){
      if(y===now.getFullYear()&&m>now.getMonth()+1)break;
      months.push(`${y}-${String(m).padStart(2,'0')}`);
    }
  const ff={DRSFRMACBS:ffill(S.DRSFRMACBS.monthly,months),
            DRCCLACBS:ffill(S.DRCCLACBS.monthly,months),
            DRCLACBS:ffill(S.DRCLACBS.monthly,months)};
  const cpiNow=S.CPIAUCSL.last.value;

  /* per-month raw stresses (same math as backtest.js — keep in sync) */
  function stressesFor(m){
    const un=S.UNRATE.monthly[m],icsa=S.ICSA.monthly[m],cpi=S.CPIAUCSL.monthly[m];
    const cpiPrev=S.CPIAUCSL.monthly[`${+m.slice(0,4)-1}${m.slice(4)}`];
    const mort=S.MORTGAGE30US.monthly[m],gas=S.GASREGW.monthly[m];
    const mdel=ff.DRSFRMACBS[m],cdel=ff.DRCCLACBS[m],adel=ff.DRCLACBS[m];
    if([un,icsa,cpi,cpiPrev,mort,gas,mdel,cdel,adel].some(v=>v==null))return null;
    return{
      jobs:Math.max(interp(ANCHORS.unemployment,un),interp(ANCHORS.claimsK,icsa/1000)),
      inflation:interp(ANCHORS.inflationYoY,(cpi/cpiPrev-1)*100),
      housing:Math.max(interp(ANCHORS.mortgageRate,mort),interp(ANCHORS.mortgageDelinq,mdel)),
      credit:interp(ANCHORS.cardDelinq,cdel),
      auto:interp(ANCHORS.consumerDelinq,adel),
      gas:interp(ANCHORS.gasReal,gas*cpiNow/cpi),
    };
  }
  const cal=raw=>Math.max(0,Math.min(100,CAL.a*raw+CAL.b));
  const composite=st=>Object.entries(WEIGHTS).reduce((a,[k,w])=>a+w*st[k],0)/100;

  /* headline = last complete month; delta vs the month before */
  const complete=months.filter(m=>stressesFor(m));
  const M=complete[complete.length-1],P=complete[complete.length-2];
  const stM=stressesFor(M),stP=stressesFor(P);
  const ooze=Math.round(cal(composite(stM))),prevOoze=Math.round(cal(composite(stP)));

  /* contributions: calibrated score split proportionally to weighted stress */
  const wsum=Object.entries(WEIGHTS).reduce((a,[k,w])=>a+w*stM[k],0);
  const contrib={},deltas={};
  for(const k in WEIGHTS){
    contrib[k]=Math.round(ooze*(WEIGHTS[k]*stM[k])/wsum);
    deltas[k]=Math.round(stM[k])-Math.round(stP[k]);
  }

  /* freshest per-line display values + own asOf (release-driven) */
  const days=d=>Math.round((now-new Date(d))/864e5);
  const cpiYoY=(()=>{const e=Object.entries(S.CPIAUCSL.monthly).sort();
    const[lm,lv]=e[e.length-1];const pv=S.CPIAUCSL.monthly[`${+lm.slice(0,4)-1}${lm.slice(4)}`];
    return(lv/pv-1)*100})();
  const LINES={
    gas:     {value:`$${S.GASREGW.last.value.toFixed(2)}`,      asOf:S.GASREGW.last.date,      cadence:'weekly'},
    housing: {value:`${S.MORTGAGE30US.last.value.toFixed(2)}%`, asOf:S.MORTGAGE30US.last.date, cadence:'weekly'},
    credit:  {value:`${S.DRCCLACBS.last.value.toFixed(1)}%`,    asOf:S.DRCCLACBS.last.date,    cadence:'quarterly'},
    auto:    {value:`${S.DRCLACBS.last.value.toFixed(1)}%`,     asOf:S.DRCLACBS.last.date,     cadence:'quarterly'},
    jobs:    {value:`${S.UNRATE.last.value.toFixed(1)}%`,       asOf:S.UNRATE.last.date,       cadence:'monthly'},
    inflation:{value:`${cpiYoY.toFixed(1)}%`,                   asOf:S.CPIAUCSL.last.date,     cadence:'monthly'},
  };
  for(const k in LINES){
    const l=LINES[k];
    l.stress=Math.round(stM[k]);l.contrib=contrib[k];l.delta=deltas[k];
    l.stale=days(l.asOf)>STALE_DAYS[l.cadence];
  }
  const movers=Object.entries(deltas).filter(([,d])=>d!==0)
    .sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,3)
    .map(([slug,delta])=>({slug,delta}));

  const monthName=m=>new Date(m+'-15').toLocaleString('en-US',{month:'long',year:'numeric'});
  const payload={
    generated:now.toISOString(),
    month:M,monthLabel:monthName(M),prevMonth:P,prevMonthLabel:monthName(P),
    ooze,prevOoze,
    updatedLabel:`${monthName(M)} reading · collected ${now.toISOString().slice(0,10)}`,
    calibration:CAL,lines:LINES,movers,
    oozemaxing:Object.values(stM).every(v=>v>=60),
  };

  fs.mkdirSync('data',{recursive:true});
  fs.writeFileSync('data/latest.json',JSON.stringify(payload,null,1));
  fs.writeFileSync('data/latest.js','window.LIVE_DATA='+JSON.stringify(payload)+';');
  const hist=complete.map(m=>{const st=stressesFor(m);const[y,mo]=m.split('-');
    return[+(+y+(+mo-1)/12).toFixed(3),Math.round(cal(composite(st)))]});
  fs.writeFileSync('data/history.json',JSON.stringify(hist));
  console.log(`headline: ${payload.monthLabel} = ${ooze} (prev ${prevOoze}) · movers:`,
    movers.map(m=>`${m.slug} ${m.delta>0?'+':''}${m.delta}`).join(', ')||'none');
  console.log('lines:',Object.entries(LINES).map(([k,l])=>`${k} ${l.value} (as of ${l.asOf}${l.stale?' STALE':''})`).join(' · '));

  /* self-checks */
  console.assert(Math.abs(Object.values(contrib).reduce((a,b)=>a+b,0)-ooze)<=3,'contrib split drifted from headline');
  console.assert(ooze>=0&&ooze<=100,'score out of range');
})();
