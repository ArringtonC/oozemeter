#!/usr/bin/env node
/* AUDIT-5: emit feed.xml (Atom) from articles.js + the current reading.
   Aggregator discovery + crawler pings + Buttondown RSS-to-email, one file.
   Run after collect.js in the daily cron. */
const fs=require('fs');
const SITE='https://arringtonc.github.io/oozemeter';
const d=JSON.parse(fs.readFileSync('data/latest.json','utf8'));
const window={};eval(fs.readFileSync('articles.js','utf8'));
try{eval(fs.readFileSync('data/auto-articles.js','utf8'))}catch{}
const ARTICLES=(window.ARTICLES||[]).concat(window.AUTO_ARTICLES||[]);
let EDITORIAL=null;try{EDITORIAL=JSON.parse(fs.readFileSync('data/editorial.json','utf8'))}catch{}

const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const band=s=>[[20,'Smooth'],[40,'Sticky'],[60,'Slippery'],[80,'Oozing'],[100,'Overflowing']].find(([m])=>s<=m)[1];

const entries=[];
/* the reading itself is the flagship entry — one per monthly seal */
entries.push({
  id:`${SITE}/#reading-${d.month}`,url:`${SITE}/`,
  title:`Ooze Level ${d.monthLabel}: ${d.ooze}/100 (${band(d.ooze)})`,
  date:new Date(d.generated).toISOString(),
  summary:EDITORIAL?.rssSummary||`The ${d.monthLabel} reading sealed at ${d.ooze}, ${d.ooze-d.prevOoze>=0?'up':'down'} ${Math.abs(d.ooze-d.prevOoze)} from ${d.prevMonthLabel}.`,
});
for(const a of ARTICLES){
  entries.push({id:`${SITE}/article.html?a=${a.slug}`,url:`${SITE}/article.html?a=${a.slug}`,
    title:a.title,date:new Date(a.date+'T12:00:00Z').toISOString(),summary:a.dek});
}
entries.sort((a,b)=>b.date.localeCompare(a.date));

const feed=`<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>OOZEMeter — Oozeonomics</title>
  <subtitle>The study of economic slime. One score for U.S. economic stress, from public data.</subtitle>
  <link href="${SITE}/"/>
  <link rel="self" href="${SITE}/feed.xml"/>
  <id>${SITE}/</id>
  <updated>${entries[0].date}</updated>
  <author><name>OOZEMeter — Division of Economic Containment</name></author>
${entries.map(e=>`  <entry>
    <title>${esc(e.title)}</title>
    <link href="${e.url}"/>
    <id>${e.id}</id>
    <updated>${e.date}</updated>
    <summary>${esc(e.summary)}</summary>
  </entry>`).join('\n')}
</feed>`;
fs.writeFileSync('feed.xml',feed);
console.log(`feed.xml: ${entries.length} entries, newest "${entries[0].title}"`);
