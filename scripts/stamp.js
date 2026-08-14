#!/usr/bin/env node
/* AUDIT-4: stamp the collected reading into index.html's STATIC markup so
   crawlers, link previews, and no-JS renders see the real number instead of
   stale placeholders. Idempotent — run any time; the daily cron should run it
   right after collect.js. Also ensures the Dataset JSON-LD block (AUDIT-7)
   and the Atom feed link (AUDIT-5) exist in <head>. */
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('data/latest.json','utf8'));

const BANDS=[[20,'SMOOTH'],[40,'STICKY'],[60,'SLIPPERY'],[80,'OOZING'],[100,'OVERFLOWING']];
const TIERS=[[20,'🟢 STABLE'],[40,'🟡 OBSERVATION'],[60,'🟠 CONTAINMENT WATCH'],[80,'🟠 CONTAINMENT WARNING'],[94,'🔴 OVERFLOW RISK'],[100,'☢ NATIONAL MESS']];
const NAMES={gas:'Gas Prices',housing:'Housing',credit:'Credit Cards',auto:'Auto Loans',jobs:'Unemployment',inflation:'Inflation'};
const band=s=>BANDS.find(([m])=>s<=m)[1];
const tier=s=>TIERS.find(([m])=>s<=m)[1];
const level=s=>s<=20?1:s<=40?2:s<=60?3:s<=80?4:5;
const cap=w=>w[0]+w.slice(1).toLowerCase();

/* The placard used to assert "Integrity gate: PASS · fails closed" as a string
   literal, so a gate that failed, a gate that never ran, and a gate that passed
   all produced the same sentence on the page. Read the verdict the gate
   actually recorded, and refuse to stamp a claim we cannot support. */
let gate=null;
try{gate=JSON.parse(fs.readFileSync('data/gate-status.json','utf8'))}catch{}
if(!gate){
  console.error('data/gate-status.json is missing — run scripts/integrity.js before stamping.');
  console.error('Refusing to stamp an integrity claim this run cannot support.');
  process.exit(1);
}
if(gate.status!=='pass'){
  console.error(`integrity gate recorded status "${gate.status}" — refusing to stamp.`);
  process.exit(1);
}
if(gate.month!==d.month){
  console.error(`gate verdict covers ${gate.month} but data/latest.json publishes ${d.month} — stale gate artifact, refusing to stamp.`);
  process.exit(1);
}
const gateText=`Integrity gate: PASS${gate.warnings&&gate.warnings.length?` · ${gate.warnings.length} warning${gate.warnings.length===1?'':'s'}`:''} · fails closed`;

const s=d.ooze,delta=s-d.prevOoze;
const deltaTxt=`${delta>=0?'▲ +':'▼ −'}${Math.abs(delta)} VS ${d.prevMonthLabel.toUpperCase()}`;
const top3=Object.entries(d.lines).sort((a,b)=>b[1].contrib-a[1].contrib).slice(0,3)
  .map(([k,l])=>`${NAMES[k]||k} ${l.contrib} oz`).join(' · ');

let h=fs.readFileSync('index.html','utf8');
let missing=0;
const sub=(re,rep,label)=>{
  if(re.test(h))h=h.replace(re,rep);
  else{console.warn('stamp: marker missing —',label);missing++;}
};

sub(/<title>[^<]*<\/title>/,
  `<title>OOZEMeter — Ooze Level ${s}/100 (${cap(band(s))}) · ${d.monthLabel}</title>`,'title');
sub(/<meta name="description" content="[^"]*">/,
  `<meta name="description" content="The ${d.monthLabel} Ooze Level is ${s}/100 (${cap(band(s))}), ${delta>=0?'up':'down'} ${Math.abs(delta)} from ${d.prevMonthLabel}. One score for U.S. economic stress, computed from public data.">`,'meta description');
sub(/<meta property="og:title" content="[^"]*">/,
  `<meta property="og:title" content="OOZEMeter — Ooze Level ${s}/100 (${cap(band(s))}) · ${d.monthLabel}">`,'og title');
sub(/<meta property="og:description" content="[^"]*">/,
  `<meta property="og:description" content="The ${d.monthLabel} Ooze Level is ${s}/100 (${cap(band(s))}), ${delta>=0?'up':'down'} ${Math.abs(delta)} from ${d.prevMonthLabel}. One score for U.S. economic stress, computed from public data.">`,'og description');
sub(/aria-label="Containment jar, ooze level \d+ of 100"/,
  `aria-label="Containment jar, ooze level ${s} of 100"`,'jar aria-label');
sub(/id="heroTheme" data-level="\d"/,`id="heroTheme" data-level="${level(s)}"`,'hero level');
sub(/id="heroScore">\d+</,`id="heroScore">${s}<`,'hero score');
sub(/(id="heroStatus"[^>]*>)[^<]*</,`$1${band(s)}<`,'hero status');
sub(/id="heroDelta">[^<]*</,`id="heroDelta">${deltaTxt}<`,'hero delta');
sub(/id="plcSealed">[^<]*</,`id="plcSealed">${gateText}<`,'placard integrity');
sub(/class="specimen-line cine c5">[^<]*<b>[^<]*<\/b>[^<]*</,
  `class="specimen-line cine c5">🧪 Monthly specimen sealed: <b>${d.monthLabel} = ${s}</b> · intake lines refresh as their data releases <`,'specimen line');
sub(/class="sc-score">\d+<span/,`class="sc-score">${s}<span`,'share score');
sub(/class="sc-status">[^<]*</,`class="sc-status">${band(s)} · ${tier(s)}<`,'share status');
sub(/id="scLine">[^<]*</,`id="scLine">${d.monthLabel}: biggest pressure sources — ${top3}<`,'share line');

/* ensure feed link + Dataset JSON-LD exist (idempotent inserts) */
const SITE=require('./lib/site-url');
if(!h.includes('application/atom+xml')){
  h=h.replace('<link rel="stylesheet" href="lab.css">',
    `<link rel="alternate" type="application/atom+xml" title="OOZEMeter — Oozeonomics" href="${SITE}/feed.xml">\n<link rel="stylesheet" href="lab.css">`);
}
const LD_MARK='<script type="application/ld+json" id="datasetLD">';
const ld=JSON.stringify({'@context':'https://schema.org','@type':'Dataset',
  name:'OOZEMeter Ooze Level',description:`Monthly U.S. economic stress score (0–100) computed from public data. ${d.monthLabel}: ${s}/100.`,
  url:SITE,creator:{'@type':'Organization',name:'OOZEMeter — Division of Economic Containment',url:SITE},
  temporalCoverage:'2003-01/'+d.month,license:'https://github.com/ArringtonC/oozemeter',
  distribution:[{'@type':'DataDownload',encodingFormat:'application/json',contentUrl:SITE+'/data/latest.json'}]});
if(h.includes(LD_MARK)){
  h=h.replace(new RegExp(LD_MARK.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\\s\\S]*?<\\/script>'),LD_MARK+ld+'</'+'script>');
}else{
  h=h.replace('</head>',LD_MARK+ld+'</'+'script>\n</head>');
}

/* verdict line (AUDIT-2), computed from the same history the archive uses */
try{
  let verdict;
  try{verdict=JSON.parse(fs.readFileSync('data/editorial.json','utf8')).verdict}catch{}
  if(!verdict){
    const hist=JSON.parse(fs.readFileSync('data/history.json','utf8'));
    const worse=hist.filter(([,v])=>v>s).length,per10=Math.round(worse/hist.length*10);
    verdict=per10>=5?`Calmer than ${per10} of every 10 months since 2003`
      :`More stressed than ${10-per10} of every 10 months since 2003`;
  }
  sub(/id="verdictLine">[^<]*</,`id="verdictLine">${verdict}<`,'verdict line');
}catch(e){console.warn('stamp: verdict skipped —',e.message)}

/* canonical (idempotent) */
if(!h.includes('rel="canonical"')){
  h=h.replace('<meta property="og:url"',`<link rel="canonical" href="${SITE}/">\n<meta property="og:url"`);
}
fs.writeFileSync('index.html',h);
console.log(`stamped index.html: ${s}/100 ${band(s)} (${d.monthLabel}), delta ${delta>=0?'+':''}${delta}, missing markers: ${missing}`);

/* ---- market.html: static score + band + canonical + live-number OG card ---- */
try{
  const md=JSON.parse(fs.readFileSync('data/market.json','utf8'));
  const wardBand=band(md.score); /* same BANDS scale the page JS uses (bandOf) */
  let m=fs.readFileSync('market.html','utf8');
  const msub=(re,rep,label)=>{
    if(re.test(m))m=m.replace(re,rep);
    else{console.warn('stamp(market): marker missing —',label);missing++;}
  };
  msub(/id="mktScore">[^<]*</,`id="mktScore">${md.score}<`,'market score');
  msub(/id="mktBand">[^<]*</,`id="mktBand">${wardBand}<`,'market band');
  if(!m.includes('rel="canonical"'))m=m.replace('<meta property="og:url"',`<link rel="canonical" href="${SITE}/market.html">\n<meta property="og:url"`);
  if(fs.existsSync('og-cards/market.png'))m=m.replace(/<meta property="og:image" content="[^"]*">/,`<meta property="og:image" content="${SITE}/og-cards/market.png">`);
  fs.writeFileSync('market.html',m);
  console.log(`stamped market.html: ${md.score}/100 ${wardBand}`);
}catch(e){console.warn('stamp(market) skipped —',e.message)}
/* Was missing>3: up to three markers could vanish from index.html and the cron
   would still report success, publishing a page with stale placeholders where
   the reading should be. Any missing marker means the page did not receive a
   number it was supposed to receive. */
if(missing>0)process.exit(1);
