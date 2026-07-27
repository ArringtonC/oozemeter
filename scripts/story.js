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

const NAMES={gas:'gas prices',housing:'housing',credit:'credit cards',auto:'auto loans',jobs:'employment',inflation:'inflation',foreclosures:'mortgage distress',manufacturing:'manufacturing'};
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
  foreclosures:l=>` with mortgage delinquency at ${l.value}`,
  manufacturing:l=>``,
};

/* ---- verdict (canonical — stamp.js and the homepage consume this) ---- */
const worse=history.filter(([,v])=>v>d.ooze).length;
const per10=Math.round(worse/history.length*10);
const verdict=per10>=5?`Calmer than ${per10} of every 10 months since 2003`
  :`More stressed than ${10-per10} of every 10 months since 2003`;

/* ---- per-line narratives ---- */
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
else if(easers.length)
  s2=`The relief came from ${easers.map(([k,l])=>`${NAMES[k]} (down ${Math.abs(l.delta)} points)`).join(' and ')}.`;
else if(risers.length)
  s2=`The added pressure came from ${risers.map(([k,l])=>`${NAMES[k]} (up ${l.delta} points)`).join(' and ')}.`;
else s2=`No intake line moved more than a point or two.`;
const s3=`Altogether the jar ${delta<0?'drained':delta>0?'rose':'held at'} ${delta===0?'':Math.abs(delta)+' to '}${d.ooze}, keeping the national containment level in the ${band(d.ooze)} range.`;
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

/* ---- the monthly Ooze Report (auto article, golden-master shape) ---- */
const dateStr=d.generated.slice(0,10);
const article={
  slug:`ooze-report-${d.month}`,cat:'report',date:dateStr,auto:true,byline:BYLINE,
  title:`The ${d.monthLabel} Ooze Report: ${d.ooze}/100`,
  dek:summary.split('. ').slice(0,1).join('. ')+'.',
  keyPoints:[
    `${d.monthLabel} sealed at ${d.ooze} (${band(d.ooze)}), ${delta<0?'down':delta>0?'up':'flat'} ${Math.abs(delta)||''} vs ${d.prevMonthLabel}.`.replace('  ',' '),
    `${verdict}.`,
    `Largest pressure: ${NAMES[topK]} (${topL.contrib} oz)${easers.length?`; biggest relief: ${NAMES[easers[0][0]]} (${easers[0][1].delta} pts)`:''}.`,
  ],
  body:[
    story,
    '## Line by line',
    ...weighted.map(([k])=>lines[k]),
    '## Auxiliary sensors',
    ...[...AUX].map(k=>lines[k]),
    '## Confidence',
    confidence,
    'The next specimen seals when the coming month\'s jobs report and CPI land. Watch collection progress on the Specimen Progress page.',
  ],
};

/* ---- derived formats ---- */
const newsletter=
`OOZEMETER — THE ${d.monthLabel.toUpperCase()} OOZE REPORT
${'='.repeat(46)}
OOZE LEVEL: ${d.ooze}/100 (${band(d.ooze).toUpperCase()}) · ${delta>=0?'+':''}${delta} vs ${d.prevMonthLabel}
${verdict}.

${story}

LINE BY LINE
${weighted.map(([k])=>`· ${lines[k]}`).join('\n')}

CONFIDENCE
${confidence}

Read the full report: https://arringtonc.github.io/oozemeter/article.html?a=${article.slug}
The jar: https://arringtonc.github.io/oozemeter/
${BYLINE}`;

const rssSummary=`${summary} ${s2} ${easers.length||risers.length?'':''}Every figure is computed from cited public data and passed the facility's integrity gate before publication.`.slice(0,700);

const social=`🧪 ${d.monthLabel} Ooze Level: ${d.ooze}/100 (${band(d.ooze)}) — ${delta<0?'down':delta>0?'up':'flat'} ${Math.abs(delta)} from ${d.prevMonthLabel}. ${verdict}. Biggest pressure: ${NAMES[topK]}. Full report: arringtonc.github.io/oozemeter`;

/* ---- write outputs ---- */
const editorial={month:d.month,monthLabel:d.monthLabel,generated:d.generated,
  byline:BYLINE,verdict,summary,story,lines,confidence,newsletter,rssSummary,social,
  articleSlug:article.slug};
fs.writeFileSync('data/editorial.json',JSON.stringify(editorial,null,1));
fs.writeFileSync('data/editorial.js','window.EDITORIAL='+JSON.stringify(editorial)+';');

/* auto-articles: keyed by month — re-runs replace, never duplicate */
let autos=[];
try{const w={};eval(fs.readFileSync('data/auto-articles.js','utf8').replace('window.','w.'));autos=w.AUTO_ARTICLES||[]}catch{}
autos=autos.filter(a=>a.slug!==article.slug);
autos.push(article);
autos.sort((a,b)=>b.date.localeCompare(a.date));
fs.writeFileSync('data/auto-articles.js','window.AUTO_ARTICLES='+JSON.stringify(autos)+';');

console.log('OOZEBOT drafted:',article.title);
console.log('verdict:',verdict);
console.log('confidence:',confidence);
console.log(`outputs: editorial.json/.js · auto-articles.js (${autos.length} report${autos.length===1?'':'s'})`);
