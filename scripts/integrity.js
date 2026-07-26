#!/usr/bin/env node
/* AUDIT-1 + AUDIT-3: the post-collect integrity gate. Runs AFTER collect.js
   and BEFORE the cron commits. Exit 1 blocks the commit — the previous
   snapshot stays live, which is exactly the fail-closed behavior Burry specced.

   1. Revision detector: diff fresh data/history.json against the last
      committed version (git show HEAD). Any past-month change >= 1 point is
      logged to data/revisions.json — the site must catch its own number
      changing before a reader does.
   2. Calibration invariants: GFC peak (mid-2009) must still read 90±2 and the
      calm floor must still sit near 10 — if a source revision breaks the
      ruler, we stop publishing until a human re-certifies it.
   3. Plausibility gate: per-line physical ranges + headline jump limit. A
      shifted spreadsheet column must never publish a confident wrong number. */
const fs=require('fs');
const {execSync}=require('child_process');

const fail=[],warn=[];
const latest=JSON.parse(fs.readFileSync('data/latest.json','utf8'));
const history=JSON.parse(fs.readFileSync('data/history.json','utf8'));

/* ---- 1. revision detector ---- */
let prevHistory=null,prevLatest=null;
try{prevHistory=JSON.parse(execSync('git show HEAD:data/history.json',{encoding:'utf8'}))}catch{}
try{prevLatest=JSON.parse(execSync('git show HEAD:data/latest.json',{encoding:'utf8'}))}catch{}
if(prevHistory){
  const prevMap=new Map(prevHistory.map(([t,v])=>[t.toFixed(3),v]));
  const changes=[];
  for(const [t,v] of history){
    const old=prevMap.get(t.toFixed(3));
    if(old!=null&&Math.abs(old-v)>=1)changes.push({t,old,new:v});
  }
  if(changes.length){
    const log=fs.existsSync('data/revisions.json')?JSON.parse(fs.readFileSync('data/revisions.json','utf8')):[];
    log.push({detected:latest.generated,changes});
    fs.writeFileSync('data/revisions.json',JSON.stringify(log,null,1));
    warn.push(`revision: ${changes.length} past month(s) moved >=1pt (logged to data/revisions.json)`);
  }
}

/* ---- 2. calibration invariants ---- */
const gfcWin=history.filter(([t])=>t>=2008.5&&t<=2010);
const gfcPeak=Math.max(...gfcWin.map(([,v])=>v));
if(Math.abs(gfcPeak-90)>2)fail.push(`calibration broken: GFC peak reads ${gfcPeak}, expected 90±2`);
const calmWin=history.filter(([t])=>t>=2003&&t<=2025.99);
const calmMin=Math.min(...calmWin.map(([,v])=>v));
if(Math.abs(calmMin-10)>2)fail.push(`calibration broken: calm floor reads ${calmMin}, expected 10±2`);

/* ---- 3. plausibility gate ---- */
/* physical ranges per line's display value; a value outside these is a parse
   or unit error, not economics */
const RANGES={gas:[1,8],housing:[1,20],credit:[0,15],auto:[0,15],jobs:[0,30],inflation:[-15,25]};
for(const [k,[lo,hi]] of Object.entries(RANGES)){
  const l=latest.lines[k];
  if(!l){fail.push(`line missing: ${k}`);continue}
  const v=parseFloat(String(l.value).replace(/[^0-9.-]/g,''));
  if(!Number.isFinite(v)||v<lo||v>hi)fail.push(`implausible ${k}: "${l.value}" outside [${lo},${hi}]`);
  if(!(l.stress>=0&&l.stress<=100))fail.push(`stress out of range: ${k}=${l.stress}`);
}
if(!(latest.ooze>=0&&latest.ooze<=100))fail.push(`headline out of range: ${latest.ooze}`);
/* monthly jump cap: largest genuine jump on record is ~+23 (COVID). 30 means
   data error until a human certifies a genuine catastrophe and raises it. */
if(prevLatest&&Math.abs(latest.ooze-prevLatest.ooze)>30&&latest.month!==prevLatest.month)
  fail.push(`headline jumped ${prevLatest.ooze}→${latest.ooze} — exceeds the 30pt sanity cap`);

/* ---- verdict ---- */
warn.forEach(w=>console.warn('⚠',w));
if(fail.length){
  console.error('INTEGRITY GATE FAILED — refusing to publish:');
  fail.forEach(f=>console.error('✗',f));
  process.exit(1);
}
console.log(`integrity gate: PASS (${warn.length} warning${warn.length===1?'':'s'}) · GFC=${gfcPeak} calm=${calmMin} · headline ${latest.ooze}`);
