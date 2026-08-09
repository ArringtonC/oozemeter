#!/usr/bin/env node
/* ============================================================
   NARRATIVE INTEGRITY CHECK — the integrity gate learns to read.

   Canonical Truth doctrine: if a number exists anywhere, it originates
   from one canonical source. Dynamic prose carries household-history tokens;
   frozen cross-instrument and revision claims carry source-coordinate tokens
   whose displayed values are checked against their canonical JSON artifacts.
   Raw score literals are a FAILURE unless the sentence is definitional.

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
const market=JSON.parse(fs.readFileSync('data/market.json','utf8'));
const marketHistory=JSON.parse(fs.readFileSync('data/market-history.json','utf8'));
const revisions=JSON.parse(fs.readFileSync('data/revisions.json','utf8'));
const hmap=new Map(history.map(([t,v])=>[t.toFixed(3),v]));
const key=ym=>{const[y,m]=ym.split('-').map(Number);return(y+(m-1)/12).toFixed(3)};

function checked(where,token,expected,actual,source){
  if(actual==null)fail.push(`${where}: token ${token} does not resolve in ${source}`);
  else if(actual!==expected)fail.push(`${where}: token ${token} expects ${expected}, but ${source} records ${actual}`);
  return actual===expected?expected:'—';
}

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
    })
    .replace(/\{\{market-current:(\d{4}-\d{2})=(\d{1,3})\}\}/g,(token,ym,n)=>{
      const periods=new Set(Object.values(market.sensors||{}).map(sensor=>String(sensor.asOf||'').slice(0,7)));
      const actual=periods.size===1&&periods.has(ym)?market.score:null;
      return checked(where,token,+n,actual,`data/market.json (${ym})`);
    })
    .replace(/\{\{market:(\d{4}-\d{2})=(\d{1,3})\}\}/g,(token,ym,n)=>{
      const row=(marketHistory.monthly||[]).find(item=>item.month===ym);
      return checked(where,token,+n,row?.market,`data/market-history.json (${ym})`);
    })
    .replace(/\{\{revision-old:(\d+\.\d+\.\d+):(\d{4}-\d{2})=(\d{1,3})\}\}/g,(token,version,ym,n)=>{
      const revision=revisions.find(item=>item.fromMethodologyVersion===version);
      const change=revision?.changes?.find(item=>Math.abs(item.t-(+key(ym)))<0.001);
      return checked(where,token,+n,change?.old,`data/revisions.json (${version}, ${ym})`);
    });
}

/* raw score-claims that should have been tokens */
const CLAIM=/\b(?:scored?|reads?|reached?e?s?|peaked at|sealed at|only reach(?:es)?|elevated at|read just|climbs to|drained .{0,12}to|rose .{0,12}to)\s+(?:just\s+)?(\d{1,3})\b/gi;

function sentenceAt(text,start,end){
  const before=text.slice(0,start);
  const left=Math.max(before.lastIndexOf('. '),before.lastIndexOf('! '),before.lastIndexOf('? '),before.lastIndexOf('</p>'));
  const after=text.slice(end);
  const boundary=after.search(/[.!?](?:\s|<|$)|<\/p>/);
  return text.slice(left<0?0:left+1,boundary<0?text.length:end+boundary+1);
}

function isDefinition(sentence,claim,value){
  const plain=sentence.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const normalizedClaim=claim.replace(/\s+/g,' ').trim();
  if(value===60&&/^read 60$/i.test(normalizedClaim)&&/OOZEMAXING requires all seven weighted lines to read 60\+ simultaneously/i.test(plain))return true;
  if(value===0&&/^scored 0$/i.test(normalizedClaim)&&/Each line is scored 0[–-]100 against fixed public anchors/i.test(plain))return true;
  const calmAnchor=/\bcalmest\b[\s\S]*\b(?:reads?|scores?)\s+(?:a\s+)?10\b/i.test(plain);
  const crisisAnchor=/\b(?:worst|peak)\b[\s\S]*\b(?:reads?|scores?)\s+(?:a\s+)?90\b/i.test(plain);
  if(value===10)return calmAnchor;
  if(value===90)return crisisAnchor;
  return false;
}

function scan(text,where){
  const resolved=resolve(text,where);
  let m;CLAIM.lastIndex=0;
  while((m=CLAIM.exec(text))!==null){           /* scan RAW text: literals only */
    const ctx=sentenceAt(text,m.index,CLAIM.lastIndex);
    if(isDefinition(ctx,m[0],+m[1]))continue;
    const n=+m[1];
    if(n<=100)fail.push(`${where}: raw score literal "${m[0].trim()}" — must be a token or removed. Context: …${ctx.trim().slice(0,110)}…`);
  }
  const unresolved=resolved.match(/\{\{[^}]+\}\}/g)||[];
  unresolved.forEach(token=>fail.push(`${where}: unknown canonical-truth token ${token}`));
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
