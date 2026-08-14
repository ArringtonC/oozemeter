#!/usr/bin/env node
/* AUDIT-1 + AUDIT-3: the post-collect integrity gate. Runs AFTER collect.js
   and BEFORE the cron commits. Exit 1 blocks the commit — the previous
   snapshot stays live, which is exactly the fail-closed behavior Burry specced.

   1. Revision detector: diff fresh data/history.json against the last
      committed version (git show HEAD). Any past-month change >= 1 point is
      logged to data/revisions.json — the site must catch its own number
      changing before a reader does.
   2. Calibration invariants: GFC-window peak must still read 90±2 and the
      calm floor must still sit near 10 — if a source revision breaks the
      ruler, we stop publishing until a human re-certifies it.
   3. Plausibility gate: per-line physical ranges + headline jump limit. A
      shifted spreadsheet column must never publish a confident wrong number. */
const fs=require('fs');
const {execFileSync,execSync}=require('child_process');

const NFCI_MONTHLY_REVISION_TOLERANCE=0.02;

const fail=[],warn=[];
const latest=JSON.parse(fs.readFileSync('data/latest.json','utf8'));
const history=JSON.parse(fs.readFileSync('data/history.json','utf8'));
const currentFingerprint=latest.collection?.inputFingerprint;
let currentVintage=null;
if(latest.methodologyVersion==='3.0.0'&&/^[a-f0-9]{64}$/.test(currentFingerprint||'')){
  try{currentVintage=JSON.parse(fs.readFileSync(`data/vintages/${currentFingerprint}.json`,'utf8'))}catch{}
}

/* ---- 1. revision detector ---- */
let prevHistory=null,prevLatest=null;
/* A swallowed failure here disables the revision detector silently: prevHistory
   stays null, nothing is compared, and the run reports PASS having checked
   nothing. Say so instead. */
try{prevHistory=JSON.parse(execSync('git show HEAD:data/history.json',{encoding:'utf8',stdio:['pipe','pipe','pipe']}))}
catch(e){warn.push(`revision detector inert: cannot read HEAD:data/history.json (${String(e.message).split('\n')[0]}) — this run compared nothing against the prior published history`)}
try{prevLatest=JSON.parse(execSync('git show HEAD:data/latest.json',{encoding:'utf8',stdio:['pipe','pipe','pipe']}))}
catch(e){warn.push(`headline sanity cap inert: cannot read HEAD:data/latest.json (${String(e.message).split('\n')[0]})`)}
if(prevHistory){
  const prevMap=new Map(prevHistory.map(([t,v])=>[t.toFixed(3),v]));
  const changes=[];
  for(const [t,v] of history){
    const old=prevMap.get(t.toFixed(3));
    if(old!=null&&Math.abs(old-v)>=1)changes.push({t,old,new:v});
  }
  if(changes.length){
    const log=fs.existsSync('data/revisions.json')?JSON.parse(fs.readFileSync('data/revisions.json','utf8')):[];
    const duplicate=log.some(entry=>JSON.stringify(entry.changes)===JSON.stringify(changes));
    if(!duplicate){
      /* Type it honestly. This detector sees that published history MOVED; it
         does not see WHY. A source revising and the instrument re-indexing
         itself (the CPI deflator moves and the whole gas line rescales) look
         identical from here. Calling every one of them a "source revision" told
         readers something we had not established. */
      const record={detected:latest.generated,type:'history-changed-cause-unattributed',changes};
      if(prevLatest?.methodologyVersion&&prevLatest.methodologyVersion!==latest.methodologyVersion){
        const compared=history.filter(([t])=>prevMap.has(t.toFixed(3))).length;
        const band=value=>value<=20?1:value<=40?2:value<=60?3:value<=80?4:5;
        record.type='methodology-recalibration';
        record.fromMethodologyVersion=prevLatest.methodologyVersion;
        record.toMethodologyVersion=latest.methodologyVersion;
        record.summary={
          monthsCompared:compared,
          monthsMovedAtLeastOne:changes.length,
          shareMovedPercent:Number((changes.length/compared*100).toFixed(1)),
          maxAbsoluteMove:Math.max(...changes.map(change=>Math.abs(change.new-change.old))),
          bandLabelFlips:changes.filter(change=>band(change.old)!==band(change.new)).length,
        };
        record.calibration={from:prevLatest.calibration,to:latest.calibration};
      }
      log.push(record);
      fs.writeFileSync('data/revisions.json',JSON.stringify(log,null,1));
    }
    warn.push(`revision: ${changes.length} past month(s) moved >=1pt (${duplicate?'already logged':'logged'} in data/revisions.json)`);
  }
}

/* NFCI is re-estimated across its entire history each week. Compare the stored
   monthly-mean baselines between v3 vintages, but ignore either vintage's
   newest (possibly partial) calendar month. Routine drift at or below 0.02 is
   expected churn. */
if(prevLatest?.methodologyVersion==='3.0.0'&&latest.methodologyVersion==='3.0.0'){
  const previousFingerprint=prevLatest.collection?.inputFingerprint;
  let previousVintage=null;
  if(/^[a-f0-9]{64}$/.test(previousFingerprint||'')){
    try{previousVintage=JSON.parse(execFileSync('git',['show',`HEAD:data/vintages/${previousFingerprint}.json`],{encoding:'utf8'}))}catch{}
  }
  const priorMeans=previousVintage?.sources?.NFCI?.revisionBaseline?.monthlyMeans;
  const nextMeans=currentVintage?.sources?.NFCI?.revisionBaseline?.monthlyMeans;
  if(Array.isArray(priorMeans)&&Array.isArray(nextMeans)){
    const priorMap=new Map(priorMeans.map(({month,value})=>[month,value]));
    const priorNewestMonth=priorMeans.at(-1)?.month;
    const newestMonth=nextMeans.at(-1)?.month;
    const outliers=nextMeans.filter(({month,value})=>month!==newestMonth&&month!==priorNewestMonth&&priorMap.has(month)&&
      Math.abs(value-priorMap.get(month))>NFCI_MONTHLY_REVISION_TOLERANCE+1e-12)
      .map(({month,value})=>({month,old:priorMap.get(month),new:value,
        absoluteChange:Math.abs(value-priorMap.get(month))}));
    if(outliers.length){
      const largest=Math.max(...outliers.map(item=>item.absoluteChange));
      warn.push(`NFCI historical revision exceeded ${NFCI_MONTHLY_REVISION_TOLERANCE.toFixed(2)} in ${outliers.length} month(s); max |Δ|=${largest.toFixed(4)}`);
    }
  }else warn.push('NFCI historical revision check unavailable: monthly-mean vintage baseline missing');
}

/* ---- 2. calibration invariants ---- */
const gfcWin=history.filter(([t])=>t>=2007&&t<2011);
const gfcPeak=Math.max(...gfcWin.map(([,v])=>v));
if(Math.abs(gfcPeak-90)>2)fail.push(`calibration broken: GFC peak reads ${gfcPeak}, expected 90±2`);
const calmWin=history.filter(([t])=>t>=2003&&t<=2025.99);
const calmMin=Math.min(...calmWin.map(([,v])=>v));
if(Math.abs(calmMin-10)>2)fail.push(`calibration broken: calm floor reads ${calmMin}, expected 10±2`);

/* ---- 3. plausibility gate ---- */
/* physical ranges per line's display value; a value outside these is a parse
   or unit error, not economics */
const RANGES={gas:[1,8],housing:[1,20],credit:[0,15],auto:[0,15],jobs:[0,30],inflation:[-15,25]};
if(latest.methodologyVersion==='3.0.0')RANGES.financial=[-1.5,4];
for(const [k,[lo,hi]] of Object.entries(RANGES)){
  const l=latest.lines[k];
  if(!l){fail.push(`line missing: ${k}`);continue}
  const v=parseFloat(String(l.value).replace(/[^0-9.-]/g,''));
  if(!Number.isFinite(v)||v<lo||v>hi)fail.push(`implausible ${k}: "${l.value}" outside [${lo},${hi}]`);
  if(!(l.stress>=0&&l.stress<=100))fail.push(`stress out of range: ${k}=${l.stress}`);
}
if(latest.methodologyVersion==='3.0.0'&&latest.lines.financial){
  if(latest.lines.financial.contributesToOoze!==true)fail.push('financial line must be weighted in methodology v3');
  if(!Number.isFinite(latest.lines.financial.delta))fail.push('financial stress delta is missing or non-finite');
  else if(Math.abs(latest.lines.financial.delta)>30)
    fail.push(`financial stress jumped ${latest.lines.financial.delta} points — exceeds the 30pt sanity cap`);
  if(/^[a-f0-9]{64}$/.test(currentFingerprint||'')){
    const monthlyMeans=currentVintage?.sources?.NFCI?.revisionBaseline?.monthlyMeans;
    if(!Array.isArray(monthlyMeans))fail.push('financial monthly-mean vintage baseline is missing');
    else{
      const invalid=monthlyMeans.find(({month,value})=>month>='2003-01'&&month<=latest.month&&
        (!Number.isFinite(value)||value<RANGES.financial[0]||value>RANGES.financial[1]));
      if(invalid)fail.push(`implausible financial monthly mean: ${invalid.month}=${invalid.value} outside [-1.5,4]`);
      if(!monthlyMeans.some(({month})=>month===latest.month))fail.push(`financial monthly mean for score month ${latest.month} is missing`);
    }
  }
}
if(!(latest.ooze>=0&&latest.ooze<=100))fail.push(`headline out of range: ${latest.ooze}`);
/* monthly jump cap: largest genuine jump on record is ~+23 (COVID). 30 means
   data error until a human certifies a genuine catastrophe and raises it. */
if(prevLatest&&Math.abs(latest.ooze-prevLatest.ooze)>30&&latest.month!==prevLatest.month)
  fail.push(`headline jumped ${prevLatest.ooze}→${latest.ooze} — exceeds the 30pt sanity cap`);

/* ---- verdict ----
   Record it. index.html used to stamp "Integrity gate: PASS" as a string
   literal, so a gate that never ran and a gate that passed produced the same
   page. The page now has to read this file to make that claim. */
warn.forEach(w=>console.warn('⚠',w));
const verdict={
  status:fail.length?'fail':'pass',
  month:latest.month,
  headline:latest.ooze,
  warnings:warn,
  failures:fail,
  generated:latest.generated,
};
try{fs.writeFileSync('data/gate-status.json',JSON.stringify(verdict,null,1))}
catch(e){console.error('could not write data/gate-status.json:',e.message);process.exit(1)}
if(fail.length){
  console.error('INTEGRITY GATE FAILED — refusing to publish:');
  fail.forEach(f=>console.error('✗',f));
  process.exit(1);
}
console.log(`integrity gate: PASS (${warn.length} warning${warn.length===1?'':'s'}) · GFC=${gfcPeak} calm=${calmMin} · headline ${latest.ooze}`);
