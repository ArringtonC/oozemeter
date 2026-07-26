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

const s=d.ooze,delta=s-d.prevOoze;
const deltaTxt=`${delta>=0?'▲ +':'▼ −'}${Math.abs(delta)} VS ${d.prevMonthLabel.toUpperCase()}`;
const top3=Object.entries(d.lines).sort((a,b)=>b[1].contrib-a[1].contrib).slice(0,3)
  .map(([k,l])=>`${NAMES[k]||k} +${l.contrib}`).join(' · ');

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
sub(/aria-label="Containment jar, ooze level \d+ of 100"/,
  `aria-label="Containment jar, ooze level ${s} of 100"`,'jar aria-label');
sub(/id="heroTheme" data-level="\d"/,`id="heroTheme" data-level="${level(s)}"`,'hero level');
sub(/id="heroScore">\d+</,`id="heroScore">${s}<`,'hero score');
sub(/id="heroStatus">[^<]*</,`id="heroStatus">${band(s)}<`,'hero status');
sub(/id="heroTier">[^<]*</,`id="heroTier">${tier(s)}<`,'hero tier');
sub(/id="heroDelta">[^<]*</,`id="heroDelta">${deltaTxt}<`,'hero delta');
sub(/id="instPressure">[^<]*</,`id="instPressure">${s} psi<`,'pressure');
sub(/id="instIntegrity">[^<]*</,`id="instIntegrity">${100-s}%<`,'integrity');
sub(/class="specimen-line cine c5">[^<]*<b>[^<]*<\/b>[^<]*</,
  `class="specimen-line cine c5">🧪 Monthly specimen sealed: <b>${d.monthLabel} = ${s}</b> · intake lines refresh as their data releases <`,'specimen line');
sub(/class="sc-score">\d+<span/,`class="sc-score">${s}<span`,'share score');
sub(/class="sc-status">[^<]*</,`class="sc-status">${tier(s)}<`,'share status');
sub(/id="scLine">[^<]*</,`id="scLine">${d.monthLabel}: top pressure — ${top3}<`,'share line');

/* ensure feed link + Dataset JSON-LD exist (idempotent inserts) */
const SITE='https://arringtonc.github.io/oozemeter';
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

fs.writeFileSync('index.html',h);
console.log(`stamped index.html: ${s}/100 ${band(s)} (${d.monthLabel}), delta ${delta>=0?'+':''}${delta}, missing markers: ${missing}`);
if(missing>3)process.exit(1); /* structure drifted badly — fail loud for the cron */
