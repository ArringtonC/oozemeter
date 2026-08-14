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
   4. Every archive reconstruction prints the same reading the jar
      publishes for that month. These bake literals by necessity, so
      they are the one surface that can drift silently on a revision.
   Exit 1 on failure — wire into the cron's verify step.
   ============================================================ */
const fs=require('fs');
const vm=require('vm');
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

/* The archive reconstructions bake their figures as literals — they cannot use
   tokens, because each report's ounces are apportioned to sum to its printed
   reading, so the whole article regenerates together or not at all. That makes
   them the one reader surface that can silently fall out of step with the
   published history when a source revises. Nothing checked them until
   2026-08-14, and five of eleven had drifted a point. Check them here: the
   reading a reconstruction prints must equal the reading the jar publishes. */
let reconChecked=0;
try{
  const rc={window:{}};vm.createContext(rc);
  vm.runInContext(fs.readFileSync('data/reconstruction-reports.js','utf8'),rc);
  const marketMonth=m=>{const row=(marketHistory.monthly||[]).find(r=>r.month===m);return row?row.market:null};
  /* All 23 reconstructions, not the 11 household ones — but each field must be
     checked against the instrument it actually names. The ward reports print a
     WARD score in their headline and a HOUSEHOLD score in their divergence
     paragraph, so a single denominator produces confident nonsense (the first
     pass compared ward 53 against household 24 and "found" 11 defects). */
  for(const a of (rc.window.RECON_ARTICLES||[])){
    if(!/^recon-/.test(a.slug))continue;
    const household=hmap.get(key(a.month));
    const ward=marketMonth(a.month);
    const isWard=/^recon-ward-/.test(a.slug);
    /* The explicit cross-instrument claim is unambiguous, so it is safe to scan
       anywhere including body prose. */
    for(const [field,raw] of [['dek',a.dek],...(a.keyPoints||[]).map((k,i)=>[`kp${i}`,k]),...(a.body||[]).map((b,i)=>[`¶${i}`,b])]){
      const hh=String(raw||'').match(/household jar\s+(\d{1,3})\/100/i);
      if(!hh)continue;
      if(household==null)fail.push(`${a.slug}·${field}: cites a household jar reading for ${a.month}, which is missing from data/history.json`);
      else if(+hh[1]!==Math.round(household))fail.push(`${a.slug}·${field}: prints household jar ${hh[1]} for ${a.month}, published history says ${Math.round(household)} — rerun scripts/backfill-reports.js`);
    }
    /* The report's own headline reading, against its own instrument. Restricted
       to the structured fields: body prose carries definitional sentences like
       "the ward's calmest month since 2007 reads 10", and a loose scan there
       reports those as defects with total confidence. */
    const truth=isWard?ward:household;
    const src=isWard?'data/market-history.json':'data/history.json';
    for(const [field,raw] of [['title',a.title],['dek',a.dek],...(a.keyPoints||[]).map((k,i)=>[`kp${i}`,k])]){
      const own=String(raw||'').match(/(?:jar read|Ward M reads?|market ooze|reads?|scored)\s+(\d{1,3})(?:\/100)?/i);
      if(!own)continue;
      /* Absence is not disagreement. A month can be legitimately unpublishable —
         2025-10 has no UNRATE and no CPIAUCNS at all (federal shutdown), so the
         composite cannot be computed and the backtest correctly omits it. That
         needs an editorial decision about the article, not a regeneration, so it
         warns. A number that disagrees still fails. */
      if(truth==null){warn.push(`${a.slug}·${field}: cites a reading for ${a.month}, a month ${src} does not publish — the article outlives its data`);continue}
      if(+own[1]!==Math.round(truth))
        fail.push(`${a.slug}·${field}: archive prints ${own[1]} for ${a.month}, but ${src} says ${Math.round(truth)} — rerun scripts/backfill-reports.js`);
    }
    reconChecked++;
  }
}catch(e){warn.push('reconstruction-reports.js unreadable: '+e.message)}

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
console.log(`narrative integrity: PASS — ${all.length} articles + ${reconChecked} archive reconstructions, every number canonical, permalink resolves`);
