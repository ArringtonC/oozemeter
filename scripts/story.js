#!/usr/bin/env node
/* ============================================================
   OOZEBOT — the internal editorial engine.
   Collect once. Explain once. Publish everywhere.

   Takes one validated dataset (data/latest.json) and emits every
   content surface the product needs:
     data/editorial.json / .js   — canonical editorial payload
     data/auto-articles.js       — the monthly Ooze Report (one per seal)
   Deterministic templates only: every clause is driven by a number.
   OOZEBOT drafts; the numbers decide. Run after collect.js in the cron.
   ============================================================ */
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('data/latest.json','utf8'));
const history=JSON.parse(fs.readFileSync('data/history.json','utf8'));
let revisions=[];try{revisions=JSON.parse(fs.readFileSync('data/revisions.json','utf8'))}catch{}

const NAMES={gas:'gas prices',housing:'housing',credit:'credit cards',auto:'auto loans',jobs:'employment',inflation:'inflation',financial:'financial conditions',foreclosures:'mortgage distress',manufacturing:'manufacturing'};
const AUX=new Set(Object.entries(d.lines).filter(([,l])=>l.contributesToOoze===false).map(([k])=>k));
const band=s=>[[20,'Smooth'],[40,'Sticky'],[60,'Slippery'],[80,'Oozing'],[100,'Overflowing']].find(([m])=>s<=m)[1];
const cap=t=>t[0].toUpperCase()+t.slice(1);
const BYLINE='Drafted by OOZEBOT · reviewed by the Division of Economic Containment';

const VALUE_CLAUSE={
  gas:l=>` with the pump price at ${l.value}`,
  housing:l=>` with the 30-year mortgage at ${l.value}`,
  credit:l=>` with card delinquency at ${l.value}`,
  auto:l=>` with auto-loan delinquency at ${l.value}`,
  jobs:l=>` with unemployment at ${l.value}`,
  inflation:l=>` as yearly price growth ran ${l.value}`,
  financial:l=>` with the Chicago Fed's conditions index at ${l.value}`,
  foreclosures:l=>` with mortgage delinquency at ${l.value}`,
  manufacturing:l=>``,
};

/* ---- verdict (canonical — stamp.js and the homepage consume this) ---- */
const worse=history.filter(([,v])=>v>d.ooze).length;
const per10=Math.round(worse/history.length*10);
const verdict=per10>=5?`Calmer than ${per10} of every 10 months since 2003`
  :`More stressed than ${10-per10} of every 10 months since 2003`;

/* ---- per-line narratives ---- */
const pts=n=>`${n} point${Math.abs(n)===1?'':'s'}`;
const PLURAL=new Set(['gas','credit','auto']); /* 'gas prices','credit cards','auto loans' take plural verbs */
const base={};    /* clean sentence, used inside the article */
const lines={};   /* + aux/stale caveats, used on indicator pages */
for(const [k,l] of Object.entries(d.lines)){
  const n=NAMES[k]||k,dd=l.delta,ad=Math.abs(dd),clause=VALUE_CLAUSE[k]?.(l)||'';
  let s;
  if(ad===0)s=`${cap(n)} ${PLURAL.has(k)?'were':'was'} flat this month${clause}.`;
  else if(ad<3)s=`${cap(n)} held roughly steady — ${dd>0?'up':'down'} ${pts(ad)}${clause}.`;
  else if(dd<=-8)s=`Pressure from ${n} fell sharply, down ${pts(ad)}${clause}.`;
  else if(dd<0)s=`Pressure from ${n} eased, down ${pts(ad)}${clause}.`;
  else if(dd>=8)s=`Pressure from ${n} jumped ${pts(ad)}${clause}.`;
  else s=`Pressure from ${n} climbed ${pts(ad)}${clause}.`;
  if(l.stale)s+=' Its source feed is overdue, so this reading may lag.';
  base[k]=s;
  lines[k]=AUX.has(k)?s+' (Auxiliary sensor — observed, but carries no score weight.)':s;
}

/* ---- household story ---- */
const weighted=Object.entries(d.lines).filter(([k])=>!AUX.has(k));
const [topK,topL]=[...weighted].sort((a,b)=>b[1].contrib-a[1].contrib)[0];
const easers=weighted.filter(([,l])=>l.delta<=-3).sort((a,b)=>a[1].delta-b[1].delta);
const risers=weighted.filter(([,l])=>l.delta>=3).sort((a,b)=>b[1].delta-a[1].delta);
const delta=d.ooze-d.prevOoze;

const s1=`For the average household, ${NAMES[topK]} was the largest source of financial pressure in ${d.monthLabel} — ${topL.contrib} of the month's ${d.ooze} ounces${VALUE_CLAUSE[topK]?.(topL)||''}.`;
let s2;
if(easers.length&&risers.length)
  s2=`${cap(easers.map(([k,l])=>`${NAMES[k]} eased ${Math.abs(l.delta)} points`).join(' and '))}, while ${risers.map(([k,l])=>`${NAMES[k]} climbed ${l.delta}`).join(' and ')}.`;
else if(easers.length&&easers.every(([k])=>k==='gas'||k==='inflation')&&easers.length>=2)
  s2=`The relief came from the two lines everyone feels first: ${easers.map(([k,l])=>`${NAMES[k]} (down ${Math.abs(l.delta)} points)`).join(' and ')}.`;
else if(easers.length)
  s2=`The relief came from ${easers.map(([k,l])=>`${NAMES[k]} (down ${Math.abs(l.delta)} points)`).join(' and ')}.`;
else if(risers.length)
  s2=`The added pressure came from ${risers.map(([k,l])=>`${NAMES[k]} (up ${l.delta} points)`).join(' and ')}.`;
else s2=`No intake line moved more than a point or two.`;
const s3=delta===0
  ?`Altogether the jar held at ${d.ooze}, keeping the national containment level in the ${band(d.ooze)} range.`
  :`Altogether the jar ${delta<0?'drained':'rose'} ${pts(Math.abs(delta))} to ${d.ooze}, keeping the national containment level in the ${band(d.ooze)} range.`;
const story=`${s1} ${s2} ${s3}`;

/* ---- executive summary ---- */
const summary=`The ${d.monthLabel} Ooze Level sealed at ${d.ooze} out of 100 — ${band(d.ooze)} territory, ${delta===0?'unchanged from':delta<0?`down ${Math.abs(delta)} from`:`up ${delta} from`} ${d.prevMonthLabel}. ${verdict}. The heaviest line was ${NAMES[topK]} at ${topL.contrib} ounces.`;

/* ---- confidence statement ---- */
const staleN=d.collection?.staleLines?.length||0;
const revisedRuns=revisions.length;
const confidence=[
  `Methodology v${d.methodologyVersion||'2'}.`,
  d.collection?.freshnessStatus==='current'?'All source feeds current at collection.':`${staleN} source feed${staleN===1?'':'s'} flagged stale at collection.`,
  revisedRuns?`${revisedRuns} source-revision event${revisedRuns===1?'':'s'} on the public record (data/revisions.json).`:'No source revisions on record.',
  'Every figure traces to a cited public series; the integrity gate verified plausibility bounds and calibration anchors before publication.',
].join(' ');

/* ---- "what a household would notice" — the bridge paragraph. Every clause
   translates a number already established above; nothing new is claimed. ---- */
const feels=delta<=-2?'a little easier':delta>=2?'a little tighter':'about the same as';
const noticeClauses=[];
const L=d.lines;
if(L.gas.delta<=-3)noticeClauses.push('filling the tank hurt less');
else if(L.gas.delta>=3)noticeClauses.push('filling the tank hurt more');
if(L.inflation.delta<=-3)noticeClauses.push("grocery prices weren't rising as quickly");
else if(L.inflation.delta>=3)noticeClauses.push('prices climbed faster at the register');
if(L.jobs.stress<=25)noticeClauses.push('steady employment kept paychecks coming');
else if(L.jobs.delta>=5)noticeClauses.push('job worries crept up');
const noticeBody=noticeClauses.length
  ?cap(noticeClauses.length>1?noticeClauses.slice(0,-1).join(', ')+', and '+noticeClauses.at(-1):noticeClauses[0])+'. '
  :'';
const noticeClose=delta<0?'but for many families the month ended with a little more breathing room than it began.'
  :delta>0?'and for many families the month ended a little tighter than it began.'
  :'and for most families the month ended much the way it began.';
const noticed=`For most households, ${d.monthLabel.split(' ')[0]} probably felt ${feels}${feels.includes('same')?'':' than'} ${d.prevMonthLabel.split(' ')[0]}. ${noticeBody}${cap(NAMES[topK])} remained the biggest source of strain, ${noticeClose}`;

/* ---- the monthly Ooze Report (auto article, golden-master shape) ---- */
const dateStr=d.generated.slice(0,10);
const article={
  slug:`ooze-report-${d.month}`,cat:'report',date:dateStr,auto:true,byline:BYLINE,
  title:`The ${d.monthLabel} Ooze Report: ${d.ooze}/100`,
  dek:`${cap(NAMES[topK])} stayed the heaviest weight on household budgets${easers.length?`, while ${NAMES[easers[0][0]]}${easers[1]?` and ${NAMES[easers[1][0]]}`:''} supplied the month's relief`:''}.`,
  keyPoints:[
    delta===0?`${d.monthLabel} sealed at ${d.ooze} (${band(d.ooze)}), unchanged from ${d.prevMonthLabel}.`
      :`${d.monthLabel} sealed at ${d.ooze} (${band(d.ooze)}), ${delta<0?'down':'up'} ${pts(Math.abs(delta))} from ${d.prevMonthLabel}.`,
    `${verdict}.`,
    `Largest pressure: ${NAMES[topK]} (${topL.contrib} oz)${easers.length?`; biggest relief: ${NAMES[easers[0][0]]} (${easers[0][1].delta} pts)`:''}.`,
  ],
  body:[
    story+` ${verdict.replace('Calmer','This reading is calmer').replace('More stressed','This reading is more stressed')} — inside the range where normal economies tend to live.`,
    '## What a household would notice',
    noticed,
    '## Line by line',
    ...weighted.map(([k])=>base[k]),
    '## The auxiliary sensors (observed, not scored)',
    ...[...AUX].map(k=>base[k]),
    '## Confidence',
    confidence,
    'The next specimen seals when the coming month\'s jobs report and CPI land. Watch the collection assemble on the <a href="specimen-progress.html">Specimen Progress</a> page.',
  ],
};

/* hand-written coverage check (Canonical Truth: the permalink follows the
   coverage — operator voice outranks the engine) */
let handCovered=false,canonicalSlug=article.slug;
try{const w3={};eval(fs.readFileSync('articles.js','utf8').replace('window.','w3.'));
  const hand=(w3.ARTICLES||[]).find(a=>a.cat==='report'&&a.month===d.month);
  if(hand){handCovered=true;canonicalSlug=hand.slug;}}catch{}

/* ---- derived formats ---- */
const newsletter=
`OOZEMETER — THE ${d.monthLabel.toUpperCase()} OOZE REPORT
${'='.repeat(46)}
OOZE LEVEL: ${d.ooze}/100 (${band(d.ooze).toUpperCase()}) · ${delta>=0?'+':''}${delta} vs ${d.prevMonthLabel}
${verdict}.

${story}

WHAT A HOUSEHOLD WOULD NOTICE
${noticed}

LINE BY LINE
${weighted.map(([k])=>`· ${base[k]}`).join('\n')}

CONFIDENCE
${confidence}

Read the full report: https://arringtonc.github.io/oozemeter/article.html?a=${canonicalSlug}
The jar: https://arringtonc.github.io/oozemeter/
${BYLINE}`;

const rssSummary=`${summary} ${s2} Every figure is computed from cited public data and passed the facility's integrity gate before publication.`.slice(0,700);

const social=`🧪 ${d.monthLabel} Ooze Level: ${d.ooze}/100 (${band(d.ooze)}) — ${delta<0?'down':delta>0?'up':'flat'} ${Math.abs(delta)} from ${d.prevMonthLabel}. ${verdict}. Biggest pressure: ${NAMES[topK]}. Full report: arringtonc.github.io/oozemeter`;

/* ---- write outputs ---- */
const editorial={month:d.month,monthLabel:d.monthLabel,generated:d.generated,
  byline:BYLINE,verdict,summary,story,lines,confidence,newsletter,rssSummary,social,
  articleSlug:canonicalSlug};
fs.writeFileSync('data/editorial.json',JSON.stringify(editorial,null,1));
fs.writeFileSync('data/editorial.js','window.EDITORIAL='+JSON.stringify(editorial)+';');

/* auto-articles: keyed by month — re-runs replace, never duplicate.
   If a hand-written report (articles.js, cat report + month) already covers
   this seal, OOZEBOT stands down: the operator's voice outranks the engine. */
let autos=[];
try{const w={};eval(fs.readFileSync('data/auto-articles.js','utf8').replace('window.','w.'));autos=w.AUTO_ARTICLES||[]}catch{}
autos=autos.filter(a=>a.slug!==article.slug);
if(!handCovered)autos.push(article);
else console.log('OOZEBOT stands down: hand-written report covers',d.monthLabel);
autos.sort((a,b)=>b.date.localeCompare(a.date));
fs.writeFileSync('data/auto-articles.js','window.AUTO_ARTICLES='+JSON.stringify(autos)+';');

console.log('OOZEBOT drafted:',article.title);
console.log('verdict:',verdict);
console.log('confidence:',confidence);
console.log(`outputs: editorial.json/.js · auto-articles.js (${autos.length} report${autos.length===1?'':'s'})`);
