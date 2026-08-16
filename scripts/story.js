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
/* ONE classifier, shared with the Claim Gate. story.js used to decide these
   states itself and the gate recomputed them independently — which is exactly
   the arrangement that let 2026-08-15 publish MIXED for a cross-check whose
   diagnostic feed had gone stale. The gate caught it and blocked the build,
   correctly, but two engines deciding the same truth is the defect. Truth is
   determined here once; this file now only chooses how to say it. */
const {classifyRelationship}=require('./lib/claim-gate');
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
/* ONE threshold ladder, several phrasings. A hand-chosen verb is a hand-typed
   number wearing a coat, so every verb on every surface — the per-line
   sentences below and the cross-check paragraphs further down — classifies the
   move here and only here. */
const moveClass=dd=>{
  const ad=Math.abs(dd);
  return ad===0?'flat':ad<3?'steady':ad>=8?(dd>0?'jumped':'plunged'):(dd>0?'climbed':'eased');
};
const base={};    /* clean sentence, used inside the article */
const lines={};   /* + aux/stale caveats, used on indicator pages */
for(const [k,l] of Object.entries(d.lines)){
  const n=NAMES[k]||k,dd=l.delta,ad=Math.abs(dd),clause=VALUE_CLAUSE[k]?.(l)||'';
  let s;
  const mc=moveClass(dd);
  if(mc==='flat')s=`${cap(n)} ${PLURAL.has(k)?'were':'was'} flat this month${clause}.`;
  else if(mc==='steady')s=`${cap(n)} held roughly steady — ${dd>0?'up':'down'} ${pts(ad)}${clause}.`;
  else if(mc==='plunged')s=`Pressure from ${n} fell sharply, down ${pts(ad)}${clause}.`;
  else if(mc==='eased')s=`Pressure from ${n} eased, down ${pts(ad)}${clause}.`;
  else if(mc==='jumped')s=`Pressure from ${n} jumped ${pts(ad)}${clause}.`;
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

/* the month's own score is always a token, never a literal: these articles
   persist, and a later source revision must re-resolve them, not strand them. */
const SCORE=`{{s:${d.month}}}`;
const s1=`For the average household, ${NAMES[topK]} was the largest source of financial pressure in ${d.monthLabel} — ${topL.contrib} of the month's ${SCORE} ounces${VALUE_CLAUSE[topK]?.(topL)||''}.`;
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
  ?`Altogether the jar held at ${SCORE}, keeping the national containment level in the ${band(d.ooze)} range.`
  :`Altogether the jar ${delta<0?'drained':'rose'} ${pts(Math.abs(delta))} to ${SCORE}, keeping the national containment level in the ${band(d.ooze)} range.`;
const story=`${s1} ${s2} ${s3}`;

/* ---- executive summary ---- */
const summary=`The ${d.monthLabel} Ooze Level sealed at ${SCORE} out of 100 — ${band(d.ooze)} territory, ${delta===0?'unchanged from':delta<0?`down ${Math.abs(delta)} from`:`up ${delta} from`} ${d.prevMonthLabel}. ${verdict}. The heaviest line was ${NAMES[topK]} at ${topL.contrib} ounces.`;

/* ---- cross-checks: "what doesn't add up?" -------------------------------
   A cross-check compares a figure the jar READS against a figure the score
   DOES NOT USE, and reports whether the two point the same way. A check can
   only exist where data/latest.json actually carries a comparison series that
   carries no score weight, so this block never invents one: the roster lists
   all seven weighted lines either way, and a line with no published comparison
   series is printed as a gap rather than counted as agreement.

   THE FIRING RULE, published and the same every month: a check fires when the
   jar's line and its comparison series moved in OPPOSITE directions this month
   AND both moved at least 3 points of line stress. Both figures are the
   `delta` fields in data/latest.json — same unit, same file — so any reader
   can reproduce the verdict from the raw payload.

   Escalation: employment escalates alone because it carries 24.25% of the
   formula; anything else needs two. */
const CC_FIRE=3;
/* A cross-check is only worth publishing if the comparison series is genuinely
   OUTSIDE the score. housing:foreclosures was neither — collect.js:110 computes
   housing as max(mortgage-rate stress, mortgage-DELINQUENCY stress), and the
   foreclosures line reads that same delinquency series. Publishing it would have
   printed "The jar reads X. It does not read mortgage delinquency" beside a
   public file where it plainly does. There is currently no zero-weight series
   for housing that isn't already an input, so housing is honestly unchecked.
   Every pair added here must be verified absent from scripts/collect.js first. */
const CC_PAIRS={jobs:'manufacturing'};
const moveText=dd=>{
  const ad=Math.abs(dd);
  switch(moveClass(dd)){
    case'flat':return'held flat';
    case'steady':return`held roughly steady, ${dd>0?'up':'down'} ${pts(ad)}`;
    case'plunged':return`fell sharply, down ${pts(ad)}`;
    case'eased':return`eased ${pts(ad)}`;
    case'jumped':return`jumped ${pts(ad)}`;
    default:return`climbed ${pts(ad)}`;
  }
};
const metricOf=l=>l?.source?.metric||null;
const publisherOf=l=>l?.source?.publisher||null;

const ccRows=[...weighted].sort((a,b)=>(b[1].contrib-a[1].contrib)||a[0].localeCompare(b[0])).map(([k,l])=>{
  const againstKey=CC_PAIRS[k];
  const against=againstKey?d.lines[againstKey]:null;
  const usable=!!(against&&metricOf(against)&&AUX.has(againstKey)&&typeof against.delta==='number');
  const row={slug:k,name:cap(NAMES[k]||k),contrib:l.contrib,
    jarReads:metricOf(l)||'—',jarPublisher:publisherOf(l)||'—',
    checked:usable,fired:false,
    against:usable?metricOf(against):null,
    againstPublisher:usable?publisherOf(against):null,
    againstSlug:usable?againstKey:null,
    rule:usable
      ? `Fires when ${NAMES[k]} and ${NAMES[againstKey]} move in opposite directions and both move at least ${CC_FIRE} points of line stress in the same month.`
      : 'No comparison series is published for this line yet, so no rule can fire.',
    /* the RESULT cell states the verdict; the CHECKED AGAINST cell states what
       it was compared with. An unchecked line has not agreed with anything, so
       it never gets the word "agrees" and never gets a tick. */
    result:usable?'agrees':'not checked'};
  if(usable){
    const a=l.delta,b=against.delta;
    /* Delegated. Opposed-but-under-threshold is MIXED not agreement; a stale
       series on either side is STALE, because a feed that stopped reporting
       cannot corroborate anything. Both rules live in lib/claim-gate.js so the
       gate and this generator can never reach different verdicts again. */
    const STATE={AGREES:'agrees',MIXED:'mixed',CONFLICT:'disagrees',
                 STALE:'stale',INSUFFICIENT:'insufficient'};
    const canonical=classifyRelationship({
      primaryDelta:a,diagnosticDelta:b,threshold:CC_FIRE,expected:'same',
      primaryStale:!!l.stale,diagnosticStale:!!against.stale});
    row.canonical=canonical;
    row.result=STATE[canonical]||'insufficient';
    row.fired=canonical==='CONFLICT';
    row.opposed=(a>0&&b<0)||(a<0&&b>0);
    row.staleSide=l.stale?NAMES[k]:against.stale?NAMES[againstKey]:null;
    row.jarMove=moveText(a);
    row.againstMove=moveText(b);
  }
  return row;
});
const ccRan=ccRows.filter(r=>r.checked).length;
const ccUnchecked=ccRows.length-ccRan;
const ccFired=ccRows.filter(r=>r.canonical==='CONFLICT');
const ccMixed=ccRows.filter(r=>r.canonical==='MIXED');
const ccStale=ccRows.filter(r=>r.canonical==='STALE');
const ccInsuf=ccRows.filter(r=>r.canonical==='INSUFFICIENT');
/* Order matters and is deliberate: a contradiction outranks everything, then a
   mixed reading, then a stale feed. Staleness ranks ABOVE quiet — a check that
   could not run this month must never leave the module reading as agreement. */
const ccState=ccRan===0?'nodata'
  :ccFired.length?((ccFired.length>1||ccFired.some(r=>r.slug==='jobs'))?'red':'amber')
  :ccMixed.length?'mixed'
  :(ccStale.length||ccInsuf.length)?'stale'
  :'quiet';
const CC_HEAD={
  quiet:{glyph:'·',label:'The checks agree'},
  mixed:{glyph:'~',label:'Mixed signals'},
  stale:{glyph:'—',label:'Not enough to check'},
  amber:{glyph:'≠',label:'One check disagrees'},
  red:{glyph:'≠',label:'Meaningful contradiction detected'},
  nodata:{glyph:'—',label:'Cross-checks could not run'},
}[ccState];
const ccBody=ccState==='nodata'
  ?['Cross-checks could not run this month — one or more comparison series has not released. A missing month stays missing.']
  :ccState==='quiet'
  ?["The numbers the jar reads and the numbers it doesn't are pointing the same way this month.",
    `${ccRan} cross-check${ccRan===1?'':'s'} ran — the same one${ccRan===1?'':'s'} every month, one for each line that has a published comparison series. Each compares a figure the jar reads against a figure the score does not use. None of them disagreed.`]
  :ccState==='stale'
  ?[...ccStale.flatMap(r=>[
      `We could not check ${NAMES[r.slug]} this month. ${cap(r.staleSide||r.against.toLowerCase())} has not reported a fresh figure, and a series that stopped reporting cannot corroborate anything.`,
      `This is not a clean bill of health and it is not a warning. It is the absence of a check. The jar's ${NAMES[r.slug]} line still carries ${r.contrib} of the month's ${SCORE} ounces; what we cannot tell you is whether the number the score does not use agrees with it.`,
    ]),
    ...ccInsuf.map(r=>`${cap(NAMES[r.slug])} and ${r.against.toLowerCase()} did not give us enough to compare this month — one of the two did not move at all, so there is no direction to set against the other.`)]
  :ccState==='mixed'
  ?ccMixed.flatMap(r=>[
      `${r.name} and ${r.against.toLowerCase()} moved in opposite directions this month, but not far enough for us to call it.`,
      `The jar's ${NAMES[r.slug]} line ${r.jarMove}. Over the same month ${r.against.toLowerCase()}, published by ${r.againstPublisher} and carrying no score weight, ${r.againstMove}. The rule needs both to move at least ${CC_FIRE} points of line stress before we report a contradiction, and only one of them did.`,
      `We are showing this rather than filing it under agreement, because they did not agree. Opposite directions below the threshold is a third answer, and calling it agreement would be the easier and less honest of the two options.`,
    ])
  :ccFired.flatMap(r=>[
      `${r.name} and ${r.against.toLowerCase()} point opposite ways this month.`,
      `The jar's ${NAMES[r.slug]} line ${r.jarMove}. Over the same month ${r.against.toLowerCase()}, published by ${r.againstPublisher} and carrying no score weight, ${r.againstMove}.`,
      `The jar reads ${r.jarReads.toLowerCase()}. It does not read ${r.against.toLowerCase()}. So this month's ${NAMES[r.slug]} line — ${r.contrib} of the jar's ${SCORE} ounces — is measuring only one of the two.`,
    ]);
/* The coverage note is printed in every state, including the state where there
   is nothing to disclose. A module that drops a component when the news is
   quiet teaches a reader within two visits that quiet means unimportant. */
const ccNote=ccUnchecked
  ?`${ccUnchecked} of the ${ccRows.length} weighted lines carry no published comparison series yet. They are listed below and marked as unchecked — never counted as agreement.`
  :`All ${ccRows.length} weighted lines carry a published comparison series.`;
/* Agreement needs a run to mean anything, and no edition has published these
   checks before, so the streak is one. Do not invent a longer one. */
const ccRun=ccState==='nodata'
  ?'A month with no comparison series is an absence, not a finding.'
  :'Agreement is a reading, not a blank space. This is the first edition to publish these checks; the run starts here.';
const ccCount=ccState==='nodata'?''
  :ccState==='stale'?`${ccStale.length+ccInsuf.length} of ${ccRan} check${ccRan===1?'':'s'} could not run`
  :ccMixed.length&&!ccFired.length?`${ccMixed.length} of ${ccRan} check${ccRan===1?'':'s'} mixed`
  :`${ccFired.length} of ${ccRan} check${ccRan===1?'':'s'} disagree`;
const crosschecks={state:ccState,glyph:CC_HEAD.glyph,label:CC_HEAD.label,count:ccCount,
  ran:ccRan,unchecked:ccUnchecked,fired:ccFired.map(r=>r.slug),mixed:ccMixed.map(r=>r.slug),
  stale:ccStale.map(r=>r.slug),insufficient:ccInsuf.map(r=>r.slug),threshold:CC_FIRE,
  body:ccBody,note:ccNote,run:ccRun,rows:ccRows};

/* ---- confidence statement ---- */
const staleN=d.collection?.staleLines?.length||0;
const sourceRevisionRuns=revisions.filter(entry=>entry.type!=='methodology-recalibration').length;
const recalibrationRuns=revisions.filter(entry=>entry.type==='methodology-recalibration').length;
const confidence=[
  `Methodology v${d.methodologyVersion||'2'}.`,
  d.collection?.freshnessStatus==='current'?'All source feeds current at collection.':`${staleN} source feed${staleN===1?'':'s'} flagged stale at collection.`,
  sourceRevisionRuns?`${sourceRevisionRuns} recorded change${sourceRevisionRuns===1?'':'s'} to published history on the public record (data/revisions.json); the cause of each is logged, not inferred.`:'No changes to published history on record.',
  recalibrationRuns?`${recalibrationRuns} methodology recalibration${recalibrationRuns===1?' is':'s are'} separately identified in that record.`:'No methodology recalibrations on record.',
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
    delta===0?`${d.monthLabel} sealed at ${SCORE} (${band(d.ooze)}), unchanged from ${d.prevMonthLabel}.`
      :`${d.monthLabel} sealed at ${SCORE} (${band(d.ooze)}), ${delta<0?'down':'up'} ${pts(Math.abs(delta))} from ${d.prevMonthLabel}.`,
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
    /* The cross-checks belong in the sealed report, not only on the homepage.
       The report is the artifact that persists, gets archived and gets emailed;
       a reader who opens July in six months should learn that the one live
       check could not run that month, which the homepage told them and this
       did not. Same canonical state, same wording, one source. */
    '## What doesn\'t add up',
    ...ccBody,
    /* The module's coverage note says the unchecked lines are "listed below",
       which is true beside the roster on the homepage and false here, where no
       roster follows. Same fact, stated for this surface. */
    ccUnchecked
      ? `${ccUnchecked} of the ${ccRows.length} weighted lines carry no published comparison series yet, and an unchecked line is never counted as agreement. The full roster runs on the <a href="index.html">front page</a>.`
      : ccNote,
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
  byline:BYLINE,verdict,summary,story,lines,confidence,crosschecks,newsletter,rssSummary,social,
  articleSlug:canonicalSlug};
fs.writeFileSync('data/editorial.json',JSON.stringify(editorial,null,1));
fs.writeFileSync('data/editorial.js','window.EDITORIAL='+JSON.stringify(editorial)+';');

/* auto-articles: keyed by month — re-runs replace, never duplicate.
   If a hand-written report (articles.js, cat report + month) already covers
   this seal, OOZEBOT stands down: the operator's voice outranks the engine. */
/* Fail CLOSED. This file is rewritten wholesale from `autos`, so a swallowed
   parse error meant an empty array and a one-article file — every prior monthly
   report deleted, by a robot, unattended, with a zero exit code. A missing file
   is a legitimate first run; a file that exists and will not parse is a reason
   to stop, not to start over. */
let autos=[];
if(fs.existsSync('data/auto-articles.js')){
  try{
    const w={};eval(fs.readFileSync('data/auto-articles.js','utf8').replace('window.','w.'));
    if(!Array.isArray(w.AUTO_ARTICLES))throw new Error('AUTO_ARTICLES is not an array');
    autos=w.AUTO_ARTICLES;
  }catch(e){
    console.error(`data/auto-articles.js exists but will not parse: ${e.message}`);
    console.error('Refusing to rewrite it — that would discard every archived report.');
    process.exit(1);
  }
}
autos=autos.filter(a=>a.slug!==article.slug);
if(!handCovered)autos.push(article);
else console.log('OOZEBOT stands down: hand-written report covers',d.monthLabel);
autos.sort((a,b)=>b.date.localeCompare(a.date));
fs.writeFileSync('data/auto-articles.js','window.AUTO_ARTICLES='+JSON.stringify(autos)+';');

console.log('OOZEBOT drafted:',article.title);
console.log('verdict:',verdict);
console.log('confidence:',confidence);
console.log(`cross-checks: ${ccState} — ${ccRan} ran, ${ccFired.length} disagree, ${ccMixed.length} mixed, ${ccUnchecked} line(s) with no comparison series`);
console.log(`outputs: editorial.json/.js · auto-articles.js (${autos.length} report${autos.length===1?'':'s'})`);
