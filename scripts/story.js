#!/usr/bin/env node
/* The Household Story Engine. Turns the month's data into plain-English
   sentences a person remembers — one generation, many outputs (homepage,
   indicator pages, newsletter, RSS). Deterministic templates only: every
   clause is driven by a number in data/latest.json, never invented.
   Run after collect.js in the daily cron. Writes data/story.js + .json. */
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('data/latest.json','utf8'));

const NAMES={gas:'gas prices',housing:'housing',credit:'credit cards',auto:'auto loans',jobs:'employment',inflation:'inflation',foreclosures:'mortgage distress',manufacturing:'manufacturing'};
const AUX=new Set(['foreclosures','manufacturing']); /* observed, zero score weight */
const band=s=>[[20,'Smooth'],[40,'Sticky'],[60,'Slippery'],[80,'Oozing'],[100,'Overflowing']].find(([m])=>s<=m)[1];
const cap=t=>t[0].toUpperCase()+t.slice(1);

/* clause fragments tied to each line's displayed value */
const VALUE_CLAUSE={
  gas:l=>` with the pump price at ${l.value}`,
  housing:l=>` with the 30-year mortgage at ${l.value}`,
  credit:l=>` with card delinquency at ${l.value}`,
  auto:l=>` with auto-loan delinquency at ${l.value}`,
  jobs:l=>` with unemployment at ${l.value}`,
  inflation:l=>` as yearly price growth ran ${l.value}`,
};

/* ---- per-line "why it changed" sentences ---- */
const lines={};
for(const [k,l] of Object.entries(d.lines)){
  const n=NAMES[k]||k,dd=l.delta,ad=Math.abs(dd);
  let s;
  if(ad<3)s=`${cap(n)} held roughly steady this month (${dd>=0?'+':''}${dd} points)${VALUE_CLAUSE[k]?.(l)||''}.`;
  else if(dd<=-8)s=`${cap(n)} pressure eased sharply — down ${ad} points${VALUE_CLAUSE[k]?.(l)||''}.`;
  else if(dd<0)s=`${cap(n)} pressure eased ${ad} points${VALUE_CLAUSE[k]?.(l)||''}.`;
  else if(dd>=8)s=`${cap(n)} pressure jumped ${ad} points${VALUE_CLAUSE[k]?.(l)||''}.`;
  else s=`${cap(n)} pressure climbed ${ad} points${VALUE_CLAUSE[k]?.(l)||''}.`;
  if(AUX.has(k))s+=' (Auxiliary sensor — observed, but carries no score weight.)';
  if(l.stale)s+=' Its source feed is overdue, so this reading may lag.';
  lines[k]=s;
}

/* ---- the monthly household story ---- */
const entries=Object.entries(d.lines).filter(([k])=>!AUX.has(k));
const [topK,topL]=entries.sort((a,b)=>b[1].contrib-a[1].contrib)[0];
const easers=entries.filter(([,l])=>l.delta<=-3).sort((a,b)=>a[1].delta-b[1].delta);
const risers=entries.filter(([,l])=>l.delta>=3).sort((a,b)=>b[1].delta-a[1].delta);
const delta=d.ooze-d.prevOoze;

const s1=`For the average household, ${NAMES[topK]} was the largest source of financial pressure in ${d.monthLabel} — ${topL.contrib} of the month's ${d.ooze} ounces${VALUE_CLAUSE[topK]?.(topL)||''}.`;
let s2;
if(easers.length&&risers.length)
  s2=`${cap(easers.map(([k,l])=>`${NAMES[k]} eased ${Math.abs(l.delta)} points`).join(' and '))}, while ${risers.map(([k,l])=>`${NAMES[k]} climbed ${l.delta}`).join(' and ')}.`;
else if(easers.length)
  s2=`The relief came from ${easers.map(([k,l])=>`${NAMES[k]} (down ${Math.abs(l.delta)} points)`).join(' and ')}.`;
else if(risers.length)
  s2=`The added pressure came from ${risers.map(([k,l])=>`${NAMES[k]} (up ${l.delta} points)`).join(' and ')}.`;
else
  s2=`No intake line moved more than a point or two.`;
const s3=`Altogether the jar ${delta<0?'drained':delta>0?'rose':'held at'} ${delta===0?'':Math.abs(delta)+' to '}${d.ooze}, keeping the national containment level in the ${band(d.ooze)} range.`;

const story={month:d.month,monthLabel:d.monthLabel,generated:d.generated,
  story:`${s1} ${s2} ${s3}`,lines};
fs.writeFileSync('data/story.json',JSON.stringify(story,null,1));
fs.writeFileSync('data/story.js','window.STORY='+JSON.stringify(story)+';');
console.log('story:',story.story);
