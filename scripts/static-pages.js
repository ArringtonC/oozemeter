#!/usr/bin/env node
/* Static per-slug pages + sitemap (Season 2: clean URLs for SEO).
   /gas/ … /manufacturing/  — one real page per intake line (from indicator.html)
   /files/<slug>/           — one real page per article (from article.html)
   Each generated page: <base href> so shared chrome resolves, FORCED_SLUG so the
   template renders the right file, static title/description/canonical/og:url.
   Idempotent — rerun after new articles publish (cron wiring pending; the
   workflow file belongs to the data session right now). */
const fs=require('fs'),path=require('path'),vm=require('vm');

const SITE=require('./lib/site-url');
const read=f=>fs.readFileSync(f,'utf8');

/* evaluate the site's own data in a browser-shaped sandbox — no duplicated lists */
const ctx={window:{},console,Date,location:{search:''}};
vm.createContext(ctx);
vm.runInContext(read('data/latest.js'),ctx);
vm.runInContext(read('lab.js'),ctx);
vm.runInContext(read('articles.js'),ctx);
vm.runInContext(read('data/auto-articles.js'),ctx);
try{vm.runInContext(read('data/reconstruction-reports.js'),ctx)}catch(e){}
const {INDICATORS,resolveClaims}=vm.runInContext('({INDICATORS,resolveClaims})',ctx);
const ARTICLES=(ctx.window.ARTICLES||[]).concat(ctx.window.AUTO_ARTICLES||[]).concat(ctx.window.RECON_ARTICLES||[]);

/* with <base>, fragment-only links would navigate to the parent — intercept them */
const FRAG_FIX=`document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;e.preventDefault();var t=document.getElementById(a.getAttribute('href').slice(1));if(t)t.scrollIntoView({behavior:'smooth'});history.replaceState(null,'',location.pathname+a.getAttribute('href'))});`;

function bake(template,{base,slug,title,desc,url,image,staticMain,forcedVar='FORCED_SLUG',staticAnchor="<main class=\"wrap-narrow\" id=\"main\"></main>"}){
  let h=template;
  const sub=(re,rep,label)=>{
    if(!re.test(h))throw new Error(`static-pages: anchor missing — ${label} (${url})`);
    h=h.replace(re,rep);
  };
  sub(/<meta charset="utf-8">/,`<meta charset="utf-8">\n<base href="${base}">`,'charset');
  sub(/<title>[^<]*<\/title>/,`<title>${title}</title>`,'title');
  sub(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${desc}">`,'description');
  sub(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${title}">`,'og:title');
  sub(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${desc}">`,'og:description');
  sub(/<meta property="og:url" content="[^"]*">/,`<meta property="og:url" content="${url}">\n<link rel="canonical" href="${url}">`,'og:url');
  sub(/<script src="data\/latest\.js"><\/script>/,`<script>window.${forcedVar}='${slug}';${FRAG_FIX}</script>\n<script src="data/latest.js"></script>`,'forced redirect');
  if(image)sub(/<meta property="og:image" content="[^"]*">/,`<meta property="og:image" content="${image}">`,'og:image');
  /* pre-JS content: crawlers, previews, and no-JS visitors see the real reading;
     the page script replaces the dynamic chrome wholesale on load */
  if(staticMain){
    const re=new RegExp(staticAnchor.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    const close=staticAnchor.slice(staticAnchor.indexOf('<',1));
    sub(re,staticAnchor.slice(0,staticAnchor.indexOf('>')+1)+staticMain+close,'static main');
  }
  return h;
}

const esc=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const clip=s=>{s=s.trim();return s.length>158?s.slice(0,155).trimEnd()+'…':s};
const urls=[];

/* --- indicators: /<slug>/ --- */
const indT=read('indicator.html');
for(const x of INDICATORS){
  const url=`${SITE}/${x.slug}/`;
  fs.mkdirSync(x.slug,{recursive:true});
  fs.writeFileSync(path.join(x.slug,'index.html'),bake(indT,{
    base:'../',slug:x.slug,url,
    title:esc(`OOZEMeter — ${x.name} | Today's Reading & Stress History`),
    desc:esc(`${x.name}: current reading of ${x.val}, why it matters, and how it feeds the Ooze Score.`),
    image:fs.existsSync(`og-cards/${x.slug}.png`)?`${SITE}/og-cards/${x.slug}.png`:undefined,
    staticMain:`<h1>${x.emoji} ${esc(x.name)}</h1><p><b>Current reading: ${esc(x.val)}</b> · ${esc(x.trend)}</p><p>${esc(x.why)}</p><p><a href="index.html">See today's Ooze Level →</a></p>`,
  }));
  urls.push(url);
}

/* --- states: /states/<code>/ — one SEO surface per state --- */
try{
  const states=JSON.parse(fs.readFileSync(path.join('data','states.json'),'utf8'));
  const band=vm.runInContext('bandOf',ctx);
  for(const st of states.states){
    const url=`${SITE}/states/${st.code}/`;
    const rank=states.states.findIndex(x=>x.code===st.code)+1;
    fs.mkdirSync(path.join('states',st.code),{recursive:true});
    fs.writeFileSync(path.join('states',st.code,'index.html'),bake(read('states.html'),{
      base:'../../',slug:st.code,forcedVar:'FORCED_STATE',staticAnchor:'<div class="sec-sub" id="stateStatic"></div>',url,
      title:`${st.name} Employment Stress | ${st.unrate}% unemployment — OOZEMeter`,
      desc:`${st.name}: unemployment ${st.unrate}% through the published anchor curve — employment stress ${st.stress}/100 (${band(Math.round(st.stress)).name}), ranked #${rank} of ${states.states.length}. One line of seven; provisional regional wing.`,
      staticMain:`<h1>${st.name} Employment Stress</h1><p><b>Unemployment: ${st.unrate}%</b> · stress <b>${st.stress}/100</b> · ${band(Math.round(st.stress)).name} · ranked #${rank} of ${states.states.length}</p><p><a href="../../index.html">See today's Ooze Level →</a></p>`,
    }));
    urls.push(url);
  }
}catch(e){console.warn('state pages skipped:',e.message)}

/* --- articles: /files/<slug>/ --- */
const artT=read('article.html');
for(const a of ARTICLES){
  const url=`${SITE}/files/${a.slug}/`;
  fs.mkdirSync(path.join('files',a.slug),{recursive:true});
  fs.writeFileSync(path.join('files',a.slug,'index.html'),bake(artT,{
    base:'../../',slug:a.slug,url,
    title:esc(`${resolveClaims(a.title)} — Oozeonomics | OOZEMeter`),
    desc:esc(clip(resolveClaims(a.dek))),
  }));
  urls.push(url+`|${a.date}`);
}

/* --- sitemap --- */
/* the ?i= / ?a= template pages stay out — their static /slug/ twins are canonical */
/* states.html was deliberately excluded while its readings were simulated
   placeholders; since 2026-08-27 it publishes real unemployment stress, and
   its per-state twins are canonical for each state. */
const ROOT=['','what-is-ooze.html','oozeonomics.html','archive.html','notes.html',
  'personal.html','specimen-progress.html','policies.html','about.html','market.html',
  'privacy.html','terms.html','states.html'];
/* Ward M gauge files + academy lessons (public, linked from gauge pages) */
try{
  for(const g of require('./lib/market-gauge-content')){
    urls.push(`${SITE}/market/${g.slug}/`);
    urls.push(`${SITE}/research/lessons/${g.lesson}`);
  }
}catch(e){console.warn('sitemap: market pages skipped —',e.message)}
const entry=u=>{const[loc,mod]=u.split('|');return `  <url><loc>${loc}</loc>${mod?`<lastmod>${mod}</lastmod>`:''}</url>`};
fs.writeFileSync('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROOT.map(p=>entry(SITE+'/'+p)).concat(urls.map(entry)).join('\n')}
</urlset>
`);
console.log(`static-pages: ${INDICATORS.length} indicator pages, ${ARTICLES.length} article pages, sitemap ${ROOT.length+urls.length} URLs`);
