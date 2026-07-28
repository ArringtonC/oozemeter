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
const path=require('path');
const {collectionFingerprint}=require('./lib/fingerprint');
const {fetchWithRetry}=require('./lib/fetch');
const {parseFredCsv}=require('./lib/fred');
const {
  AUTO_30_PLUS_ANCHORS,
  auto30PlusStress,
  fetchNyFedAutoSeries,
  trailingFourWeekByMonth,
  yearOverYear,
}=require('./lib/methodology');

/* frozen calibration — derived once on the 2003-2025 window (backtest.js),
   calm month → 10, GFC peak Jun 2009 → 90. Do not re-derive daily. */
const CAL={a:1.4209110232483089,b:-24.62145011353958};
const METHODOLOGY_VERSION='2.0.0';
const FINGERPRINT_SCHEMA_VERSION=2;
const VINTAGE_RETENTION_POLICY='retain-all-unique-schema-v2-manifests';
const DATA_DIR=process.env.OOZEMETER_DATA_DIR||'data';
const dataPath=(...parts)=>path.join(DATA_DIR,...parts);

const ANCHORS={
  unemployment:[[3.5,5],[5,25],[6.5,45],[8,62],[10,78],[15,90],[25,100]],
  claimsK:[[200,5],[300,30],[400,60],[550,75],[700,85],[1000,95],[6000,100]],
  inflationYoY:[[-10,95],[-5,85],[0,45],[1,25],[2,10],[3,25],[4,40],[6,60],[9,80],[14,90],[20,100]],
  mortgageRate:[[3,10],[5,25],[7,50],[10,70],[15,90],[18.6,100]],
  mortgageDelinq:[[1,5],[2,25],[3,45],[5,65],[8,85],[11.5,95]],
  cardDelinq:[[1.5,10],[2.5,30],[3.5,50],[5,70],[6.8,90],[9,100]],
  auto30Plus:AUTO_30_PLUS_ANCHORS,
  gasReal:[[2,10],[3,35],[4,60],[5,85],[6.5,100]],
};
const MANUFACTURING_YOY_ANCHORS=[[-20,100],[-10,85],[-5,65],[0,35],[3,15],[6,5]];
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
  const res=await fetchWithRetry(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`);
  if(!res.ok)throw new Error(`${id}: HTTP ${res.status}`);
  return parseFredCsv(await res.text(),id);
}
const ffill=(s,months)=>{const o={};let l=null;for(const m of months){if(s[m]!=null)l=s[m];o[m]=l}return o};
const writeAtomic=(file,content)=>{
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const temporary=`${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary,content);
  fs.renameSync(temporary,file);
};

(async()=>{
  let previous=null;
  try{previous=JSON.parse(fs.readFileSync(dataPath('latest.json'),'utf8'))}catch(error){
    if(error.code!=='ENOENT')console.warn(`previous snapshot ignored: ${error.message}`);
  }
  const ids=['UNRATE','ICSA','CPIAUCNS','MORTGAGE30US','DRSFRMACBS','DRCCLACBS','GASREGW','INDPRO','AMTMNO'];
  const S={};
  for(const id of ids){S[id]=await fetchSeries(id);process.stdout.write(id+' ')}
  S.ICSA.monthly=trailingFourWeekByMonth(S.ICSA.observations);
  const nyFedAuto=await fetchNyFedAutoSeries();
  S.NYFED_AUTO_30PLUS=nyFedAuto;
  console.log('fetched');

  const now=new Date();
  const months=[];
  for(let y=2003;y<=now.getFullYear();y++)
    for(let m=1;m<=12;m++){
      if(y===now.getFullYear()&&m>now.getMonth()+1)break;
      months.push(`${y}-${String(m).padStart(2,'0')}`);
    }
  const ff={DRSFRMACBS:ffill(S.DRSFRMACBS.monthly,months),
            DRCCLACBS:ffill(S.DRCCLACBS.monthly,months),
            NYFED_AUTO_30PLUS:ffill(S.NYFED_AUTO_30PLUS.monthly,months)};
  const cpiNow=S.CPIAUCNS.last.value;

  /* per-month raw stresses (same math as backtest.js — keep in sync) */
  function stressesFor(m){
    const un=S.UNRATE.monthly[m],icsa=S.ICSA.monthly[m],cpi=S.CPIAUCNS.monthly[m];
    const inflationYoY=yearOverYear(S.CPIAUCNS.monthly,m);
    const mort=S.MORTGAGE30US.monthly[m],gas=S.GASREGW.monthly[m];
    const mdel=ff.DRSFRMACBS[m],cdel=ff.DRCCLACBS[m],auto30=ff.NYFED_AUTO_30PLUS[m];
    if([un,icsa,cpi,inflationYoY,mort,gas,mdel,cdel,auto30].some(v=>v==null))return null;
    return{
      jobs:Math.max(interp(ANCHORS.unemployment,un),interp(ANCHORS.claimsK,icsa/1000)),
      inflation:interp(ANCHORS.inflationYoY,inflationYoY),
      housing:Math.max(interp(ANCHORS.mortgageRate,mort),interp(ANCHORS.mortgageDelinq,mdel)),
      credit:interp(ANCHORS.cardDelinq,cdel),
      auto:auto30PlusStress(auto30),
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
  const exactContributions=Object.keys(WEIGHTS).map((k,index)=>({
    k,index,value:ooze*(WEIGHTS[k]*stM[k])/wsum,
  }));
  for(const {k,value} of exactContributions)contrib[k]=Math.floor(value);
  const remainder=ooze-Object.values(contrib).reduce((sum,value)=>sum+value,0);
  for(const {k} of exactContributions.sort((a,b)=>(b.value%1)-(a.value%1)||a.index-b.index).slice(0,remainder))
    contrib[k]+=1;
  for(const k in WEIGHTS){
    deltas[k]=Math.round(stM[k])-Math.round(stP[k]);
  }

  /* freshest per-line display values + own asOf (release-driven) */
  const days=d=>Math.round((now-new Date(d))/864e5);
  const cpiMonth=S.CPIAUCNS.last.date.slice(0,7);
  const cpiYoY=yearOverYear(S.CPIAUCNS.monthly,cpiMonth);
  const claimsWindow=S.ICSA.observations.slice(-4);
  const claimsFourWeek=claimsWindow.reduce((sum,item)=>sum+item.value,0)/claimsWindow.length;
  const fred=id=>`https://fred.stlouisfed.org/series/${id}`;
  const mortgageObservations=S.DRSFRMACBS.observations;
  const mortgageStress=interp(ANCHORS.mortgageDelinq,S.DRSFRMACBS.last.value);
  const priorMortgageStress=interp(ANCHORS.mortgageDelinq,mortgageObservations[mortgageObservations.length-2].value);
  const indproMonths=Object.keys(S.INDPRO.monthly).sort();
  const indproMonth=indproMonths[indproMonths.length-1],priorIndproMonth=indproMonths[indproMonths.length-2];
  const indproYoY=yearOverYear(S.INDPRO.monthly,indproMonth);
  const priorIndproYoY=yearOverYear(S.INDPRO.monthly,priorIndproMonth);
  const manufacturingStress=interp(MANUFACTURING_YOY_ANCHORS,indproYoY);
  const priorManufacturingStress=interp(MANUFACTURING_YOY_ANCHORS,priorIndproYoY);
  const shipmentsMonth=S.AMTMNO.last.date.slice(0,7);
  const shipmentsYoY=yearOverYear(S.AMTMNO.monthly,shipmentsMonth);
  const LINES={
    gas:{value:`$${S.GASREGW.last.value.toFixed(2)}`,asOf:S.GASREGW.last.date,cadence:'weekly',
      source:{publisher:'U.S. Energy Information Administration',transport:'FRED',seriesId:'GASREGW',metric:'U.S. regular gasoline retail price',url:fred('GASREGW'),proxy:false}},
    housing:{value:`${S.MORTGAGE30US.last.value.toFixed(2)}%`,asOf:S.MORTGAGE30US.last.date,cadence:'weekly',
      source:{publisher:'Freddie Mac',transport:'FRED',seriesId:'MORTGAGE30US',metric:'30-year fixed mortgage rate',url:fred('MORTGAGE30US'),proxy:true},
      secondary:{publisher:'Federal Reserve Board',seriesId:'DRSFRMACBS',metric:'Residential mortgage delinquency at commercial banks',asOf:S.DRSFRMACBS.last.date,proxy:true}},
    credit:{value:`${S.DRCCLACBS.last.value.toFixed(1)}%`,asOf:S.DRCCLACBS.last.date,cadence:'quarterly',
      source:{publisher:'Federal Reserve Board',transport:'FRED',seriesId:'DRCCLACBS',metric:'Credit-card loan delinquency at commercial banks',url:fred('DRCCLACBS'),proxy:false}},
    auto:{value:`${S.NYFED_AUTO_30PLUS.last.value.toFixed(1)}%`,asOf:S.NYFED_AUTO_30PLUS.last.date,cadence:'quarterly',
      source:{publisher:'Federal Reserve Bank of New York',transport:'NY Fed HHDC workbook',seriesId:'Page 13 Data / AUTO',metric:'Previously current auto balance entering 30+ delinquency',url:S.NYFED_AUTO_30PLUS.sourceUrl,proxy:false}},
    jobs:{value:`${S.UNRATE.last.value.toFixed(1)}%`,asOf:S.UNRATE.last.date,cadence:'monthly',
      source:{publisher:'U.S. Bureau of Labor Statistics',transport:'FRED',seriesId:'UNRATE',metric:'Civilian unemployment rate',url:fred('UNRATE'),proxy:false},
      secondary:{publisher:'U.S. Department of Labor',seriesId:'ICSA',value:claimsFourWeek,asOf:claimsWindow[claimsWindow.length-1].date,transform:'trailing four-week mean'}},
    inflation:{value:`${cpiYoY.toFixed(1)}%`,asOf:S.CPIAUCNS.last.date,cadence:'monthly',
      source:{publisher:'U.S. Bureau of Labor Statistics',transport:'FRED',seriesId:'CPIAUCNS',metric:'CPI-U all items',url:fred('CPIAUCNS'),proxy:false,seasonalAdjustment:'not seasonally adjusted',transform:'same-month year-over-year percent change'}},
    foreclosures:{value:`${S.DRSFRMACBS.last.value.toFixed(1)}%`,asOf:S.DRSFRMACBS.last.date,cadence:'quarterly',
      stress:Math.round(mortgageStress),delta:Math.round(mortgageStress)-Math.round(priorMortgageStress),contributesToOoze:false,
      scoreWeight:0,calibrationStatus:'provisional-auxiliary',
      source:{publisher:'Federal Reserve Board',transport:'FRED',seriesId:'DRSFRMACBS',metric:'Residential mortgage delinquency at commercial banks',url:fred('DRSFRMACBS'),proxy:true}},
    manufacturing:{value:`${indproYoY.toFixed(1)}% YoY`,asOf:S.INDPRO.last.date,cadence:'monthly',
      stress:Math.round(manufacturingStress),delta:Math.round(manufacturingStress)-Math.round(priorManufacturingStress),contributesToOoze:false,
      scoreWeight:0,calibrationStatus:'provisional-auxiliary',
      source:{publisher:'Federal Reserve Board',transport:'FRED',seriesId:'INDPRO',metric:'Total industrial production year-over-year change',url:fred('INDPRO'),proxy:true,transform:'same-month year-over-year percent change; auxiliary manufacturing proxy only'},
      secondary:{publisher:'U.S. Census Bureau',seriesId:'AMTMNO',value:shipmentsYoY,asOf:S.AMTMNO.last.date,transform:'same-month year-over-year percent change'}},
  };
  for(const k in LINES){
    const l=LINES[k];
    if(stM[k]!=null){l.stress=Math.round(stM[k]);l.contrib=contrib[k];l.delta=deltas[k]}
    else l.contrib=0;
    l.stale=days(l.asOf)>STALE_DAYS[l.cadence];
    const prior=previous?.lines?.[k];
    l.updateStatus=prior&&prior.asOf===l.asOf&&prior.value===l.value?'no-new-release':'new-observation';
  }
  const staleLines=Object.entries(LINES).filter(([,line])=>line.stale).map(([slug])=>slug);
  const displayInputs=Object.fromEntries(Object.entries(LINES).map(([slug,line])=>
    [slug,{value:line.value,asOf:line.asOf,seriesId:line.source.seriesId}]));
  const sourceSnapshots=Object.fromEntries(ids.map(id=>[id,{
    transport:'FRED CSV',
    observations:S[id].observations.map(({date,value})=>({date,value})),
  }]));
  sourceSnapshots.NYFED_AUTO_30PLUS={
    transport:'NY Fed HHDC workbook',
    sourceUrl:S.NYFED_AUTO_30PLUS.sourceUrl,
    worksheetPath:S.NYFED_AUTO_30PLUS.worksheetPath,
    observations:Object.entries(S.NYFED_AUTO_30PLUS.monthly)
      .map(([month,value])=>({date:`${month}-01`,value}))
      .sort((a,b)=>a.date.localeCompare(b.date)),
  };
  const methodologySnapshot={
    version:METHODOLOGY_VERSION,
    calibration:CAL,
    weights:WEIGHTS,
    anchors:ANCHORS,
    manufacturingYoYAnchors:MANUFACTURING_YOY_ANCHORS,
    transforms:{
      claims:'Trailing mean of the latest four weekly observations available at each month end',
      inflation:'Same-month year-over-year percent change of non-seasonally-adjusted CPI-U',
      quarterly:'Forward-filled from observation quarter for ex-post historical reconstruction',
    },
  };
  const fingerprintSnapshot={
    fingerprintSchemaVersion:FINGERPRINT_SCHEMA_VERSION,
    methodology:methodologySnapshot,
    sources:sourceSnapshots,
  };
  const inputFingerprint=collectionFingerprint(fingerprintSnapshot);
  const sourceComponents=Object.fromEntries(Object.entries(sourceSnapshots).map(([id,source])=>{
    const observations=source.observations;
    return[id,{
      fingerprint:collectionFingerprint(source),
      observationCount:observations.length,
      firstObservation:observations[0]?.date||null,
      lastObservation:observations[observations.length-1]?.date||null,
      ...(source.sourceUrl?{sourceUrl:source.sourceUrl}:{}),
    }];
  }));
  const changed=previous?.collection?.inputFingerprint!==inputFingerprint;
  const movers=Object.entries(deltas).filter(([,d])=>d!==0)
    .sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,3)
    .map(([slug,delta])=>({slug,delta}));

  const monthName=m=>new Date(m+'-15').toLocaleString('en-US',{month:'long',year:'numeric'});
  const hist=complete.map(m=>{const st=stressesFor(m);const[y,mo]=m.split('-');
    return[+(+y+(+mo-1)/12).toFixed(3),Math.round(cal(composite(st)))]});
  const payload={
    generated:now.toISOString(),
    methodologyVersion:METHODOLOGY_VERSION,
    month:M,monthLabel:monthName(M),prevMonth:P,prevMonthLabel:monthName(P),
    ooze,prevOoze,
    updatedLabel:`${monthName(M)} reading · collected ${now.toISOString().slice(0,10)}`,
    collection:{status:'ok',changed,inputFingerprint,fingerprintSchemaVersion:FINGERPRINT_SCHEMA_VERSION,
      vintageRetentionPolicy:VINTAGE_RETENTION_POLICY,
      freshnessStatus:staleLines.length?'degraded':'current',staleLines},
    calibration:CAL,lines:LINES,movers,history:hist,
    oozemaxing:Object.values(stM).every(v=>v>=60),
  };

  const payloadJson=JSON.stringify(payload,null,1);
  writeAtomic(dataPath('latest.json'),payloadJson);
  writeAtomic(dataPath('latest.js'),'window.LIVE_DATA='+JSON.stringify(payload)+';');
  writeAtomic(dataPath('history.json'),JSON.stringify(hist));
  const vintagePath=dataPath('vintages',`${inputFingerprint}.json`);
  const vintageManifest={
    generated:payload.generated,
    fingerprintSchemaVersion:FINGERPRINT_SCHEMA_VERSION,
    retentionPolicy:VINTAGE_RETENTION_POLICY,
    methodology:methodologySnapshot,
    inputFingerprint,
    sources:sourceComponents,
    inputs:displayInputs,
    output:{
      month:payload.month,
      ooze:payload.ooze,
      prevOoze:payload.prevOoze,
      historyFingerprint:collectionFingerprint(hist),
    },
  };
  let writeVintage=!fs.existsSync(vintagePath);
  if(!writeVintage){
    try{
      const existingVintage=JSON.parse(fs.readFileSync(vintagePath,'utf8'));
      writeVintage=existingVintage.fingerprintSchemaVersion!==FINGERPRINT_SCHEMA_VERSION||
        existingVintage.retentionPolicy!==VINTAGE_RETENTION_POLICY;
    }catch{writeVintage=true}
  }
  if(writeVintage)writeAtomic(vintagePath,JSON.stringify(vintageManifest,null,1));
  console.log(`headline: ${payload.monthLabel} = ${ooze} (prev ${prevOoze}) · movers:`,
    movers.map(m=>`${m.slug} ${m.delta>0?'+':''}${m.delta}`).join(', ')||'none');
  console.log('lines:',Object.entries(LINES).map(([k,l])=>`${k} ${l.value} (as of ${l.asOf}${l.stale?' STALE':''})`).join(' · '));

  /* self-checks */
  console.assert(Object.values(contrib).reduce((a,b)=>a+b,0)===ooze,'contrib split drifted from headline');
  console.assert(ooze>=0&&ooze<=100,'score out of range');
})();
