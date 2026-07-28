#!/usr/bin/env node
/* Static per-slug pages + sitemap (Season 2: clean URLs for SEO).
   /gas/ … /manufacturing/  — one real page per intake line (from indicator.html)
   /files/<slug>/           — one real page per article (from article.html)
   Each generated page: <base href> so shared chrome resolves, FORCED_SLUG so the
   template renders the right file, static title/description/canonical/og:url.
   Idempotent — rerun after new articles publish (cron wiring pending; the
   workflow file belongs to the data session right now). */
const fs=require('fs'),path=require('path'),vm=require('vm');

const SITE='https://arringtonc.github.io/oozemeter';
const read=f=>fs.readFileSync(f,'utf8');

/* evaluate the site's own data in a browser-shaped sandbox — no duplicated lists */
const ctx={window:{},console,Date,location:{search:''}};
vm.createContext(ctx);
vm.runInContext(read('data/latest.js'),ctx);
vm.runInContext(read('lab.js'),ctx);
vm.runInContext(read('articles.js'),ctx);
vm.runInContext(read('data/auto-articles.js'),ctx);
const {INDICATORS,resolveClaims}=vm.runInContext('({INDICATORS,resolveClaims})',ctx);
const ARTICLES=(ctx.window.ARTICLES||[]).concat(ctx.window.AUTO_ARTICLES||[]);

/* with <base>, fragment-only links would navigate to the parent — intercept them */
const FRAG_FIX=`document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;e.preventDefault();var t=document.getElementById(a.getAttribute('href').slice(1));if(t)t.scrollIntoView({behavior:'smooth'});history.replaceState(null,'',location.pathname+a.getAttribute('href'))});`;

function bake(template,{base,slug,title,desc,url}){
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
  sub(/<script src="data\/latest\.js"><\/script>/,`<script>window.FORCED_SLUG='${slug}';${FRAG_FIX}</script>\n<script src="data/latest.js"></script>`,'forced slug');
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
    desc:esc(`${x.name}: current reading, 20-year stress history, why it matters, and how it feeds the Ooze Score.`),
  }));
  urls.push(url);
}

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
const ROOT=['','what-is-ooze.html','oozeonomics.html','archive.html','notes.html',
  'personal.html','states.html','specimen-progress.html','policies.html','about.html'];
const entry=u=>{const[loc,mod]=u.split('|');return `  <url><loc>${loc}</loc>${mod?`<lastmod>${mod}</lastmod>`:''}</url>`};
fs.writeFileSync('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROOT.map(p=>entry(SITE+'/'+p)).concat(urls.map(entry)).join('\n')}
</urlset>
`);
console.log(`static-pages: ${INDICATORS.length} indicator pages, ${ARTICLES.length} article pages, sitemap ${ROOT.length+urls.length} URLs`);
