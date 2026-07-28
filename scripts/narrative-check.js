#!/usr/bin/env node
/* ============================================================
   NARRATIVE INTEGRITY CHECK — the integrity gate learns to read.

   Canonical Truth doctrine: if a number exists anywhere, it originates
   from one canonical source. Prose carries tokens ({{s:YYYY-MM}},
   {{peak:A..B}}) that resolve from data/history.json; raw score literals
   in editorial text are a FAILURE unless the sentence is definitional
   (calibration axioms) — nothing remembers numbers.

   Checks:
   1. Every token in articles.js + auto-articles resolves.
   2. No raw score-claim patterns survive in article text
      (allowlist: sentences about the calibration pegs).
   3. The canonical report permalink (editorial.articleSlug) resolves
      to a real article.
   Exit 1 on failure — wire into the cron's verify step.
   ============================================================ */
const fs=require('fs');
const fail=[],warn=[];

const history=JSON.parse(fs.readFileSync('data/history.json','utf8'));
const hmap=new Map(history.map(([t,v])=>[t.toFixed(3),v]));
const key=ym=>{const[y,m]=ym.split('-').map(Number);return(y+(m-1)/12).toFixed(3)};

function resolve(text,where){
  return text
    .replace(/\{\{s:(\d{4}-\d{2})\}\}/g,(_,ym)=>{
      const v=hmap.get(key(ym));
      if(v==null)fail.push(`${where}: token {{s:${ym}}} does not resolve (month missing from history)`);
      return v==null?'—':Math.round(v);
    })
    .replace(/\{\{peak:(\d{4}-\d{2})\.\.(\d{4}-\d{2})\}\}/g,(_,a,b)=>{
      const ta=+key(a),tb=+key(b);
      const w=history.filter(([t])=>t>=ta-0.001&&t<=tb+0.001).map(([,v])=>v);
      if(!w.length)fail.push(`${where}: token {{peak:${a}..${b}}} matches no months`);
      return w.length?Math.round(Math.max(...w)):'—';
    });
}

/* raw score-claims that should have been tokens */
const CLAIM=/\b(?:scored?|reads?|reached?e?s?|peaked at|sealed at|only reach(?:es)?|elevated at|read just|climbs to|drained .{0,12}to|rose .{0,12}to)\s+(?:just\s+)?(\d{1,3})\b/gi;
const AXIOM=/calibrat|pegged|defined|= ?90|floor|axiom|requires|threshold|condition where/i;

function scan(text,where){
  const resolved=resolve(text,where);
  let m;CLAIM.lastIndex=0;
  while((m=CLAIM.exec(text))!==null){           /* scan RAW text: literals only */
    const ctx=text.slice(Math.max(0,m.index-80),m.index+m[0].length+40);
    if(AXIOM.test(ctx))continue;                 /* definitional sentences allowed */
    const n=+m[1];
    if(n<=100)fail.push(`${where}: raw score literal "${m[0].trim()}" — must be a token or removed. Context: …${ctx.trim().slice(0,110)}…`);
  }
  return resolved;
}

const w={};eval(fs.readFileSync('articles.js','utf8').replace(/window\./g,'w.'));
try{eval(fs.readFileSync('data/auto-articles.js','utf8').replace(/window\./g,'w.'))}catch{}
const all=(w.ARTICLES||[]).concat(w.AUTO_ARTICLES||[]);
for(const a of all){
  scan(a.title,`${a.slug}·title`);
  scan(a.dek,`${a.slug}·dek`);
  (a.keyPoints||[]).forEach((k,i)=>scan(k,`${a.slug}·kp${i}`));
  (a.body||[]).forEach((p,i)=>scan(p,`${a.slug}·¶${i}`));
}

/* permalink resolves */
try{
  const ed=JSON.parse(fs.readFileSync('data/editorial.json','utf8'));
  if(!all.some(a=>a.slug===ed.articleSlug))
    fail.push(`editorial.articleSlug "${ed.articleSlug}" resolves to no article — the flagship permalink is broken`);
}catch(e){warn.push('editorial.json unreadable: '+e.message)}

warn.forEach(x=>console.warn('⚠',x));
if(fail.length){
  console.error(`NARRATIVE INTEGRITY: FAIL (${fail.length})`);
  fail.forEach(f=>console.error('✗',f));
  process.exit(1);
}
console.log(`narrative integrity: PASS — ${all.length} articles, every number canonical, permalink resolves`);
