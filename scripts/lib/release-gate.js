const fs=require('fs');
const path=require('path');
const {collectionFingerprint}=require('./fingerprint');

function inspectRelease(root){
  const failures=[];
  const escapeRegExp=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const read=file=>{
    try{return fs.readFileSync(path.join(root,file),'utf8')}
    catch{return null}
  };
  const json=file=>{
    const text=read(file);
    if(text==null){failures.push(`missing required release artifact: ${file}`);return null}
    try{return JSON.parse(text)}catch(e){failures.push(`invalid JSON in ${file}: ${e.message}`);return null}
  };

  const latest=json('data/latest.json');
  if(!latest)return failures;
  const version=latest.methodologyVersion;
  const fingerprintSchemas={'2.0.0':2,'3.0.0':3};
  const expectedFingerprintSchema=fingerprintSchemas[version];
  if(!expectedFingerprintSchema)failures.push(`unsupported methodology version: ${version||'missing'}`);
  const score=latest.ooze;
  const fingerprint=latest.collection?.inputFingerprint;
  if(!fingerprint)failures.push('current specimen fingerprint is missing');
  else if(!/^[a-f0-9]{64}$/.test(fingerprint))failures.push('current specimen fingerprint must be a 64-character lowercase hex digest');
  if(expectedFingerprintSchema&&latest.collection?.fingerprintSchemaVersion!==expectedFingerprintSchema)
    failures.push(`methodology v${version} must use fingerprint schema v${expectedFingerprintSchema}`);

  const latestJs=read('data/latest.js');
  if(latestJs==null)failures.push('data/latest.js is missing');
  else{
    try{
      const prefix='window.LIVE_DATA=';
      if(!latestJs.startsWith(prefix)||!latestJs.endsWith(';'))throw new Error('unexpected wrapper');
      const jsPayload=JSON.parse(latestJs.slice(prefix.length,-1));
      if(JSON.stringify(jsPayload)!==JSON.stringify(latest))failures.push('data/latest.js does not match data/latest.json');
    }catch(error){failures.push(`invalid data/latest.js: ${error.message}`)}
  }
  const history=json('data/history.json');
  if(history&&JSON.stringify(history)!==JSON.stringify(latest.history))failures.push('data/history.json does not match current specimen history');

  if(fingerprint){
    const vintage=json(`data/vintages/${fingerprint}.json`);
    if(vintage){
      if(vintage.inputFingerprint!==fingerprint)failures.push('vintage fingerprint does not match current specimen');
      if(vintage.methodology?.version!==version)failures.push('vintage methodology version does not match current specimen');
      if(expectedFingerprintSchema&&vintage.fingerprintSchemaVersion!==expectedFingerprintSchema)
        failures.push(`methodology v${version} vintage must use fingerprint schema v${expectedFingerprintSchema}`);
      if(history&&vintage.output?.historyFingerprint!==collectionFingerprint(history))failures.push('vintage history fingerprint does not match canonical history');
      for(const [source,component] of Object.entries(vintage.sources||{}))
        if(!/^[a-f0-9]{64}$/.test(component.fingerprint||''))failures.push(`vintage source fingerprint is invalid: ${source}`);
    }
  }

  const editorial=json('data/editorial.json');
  if(editorial){
    if(editorial.month!==latest.month)failures.push('editorial month does not match current specimen');
    if(editorial.generated!==latest.generated)failures.push('editorial generation time does not match current specimen');
    if(!String(editorial.newsletter||'').includes(`${score}/100`))failures.push(`newsletter does not contain canonical score ${score}/100`);
    if(!editorial.articleSlug)failures.push('editorial flagship article permalink is missing');
  }

  const index=read('index.html');
  if(index==null)failures.push('homepage is missing');
  else{
    if(!new RegExp(`id=["']heroScore["'][^>]*>${score}<`).test(index))failures.push(`homepage does not contain canonical score ${score}`);
    if(!new RegExp(`<title>[^<]*${escapeRegExp(latest.monthLabel)}</title>`).test(index))failures.push(`homepage month does not match current specimen ${latest.monthLabel}`);
  }

  const feed=read('feed.xml');
  if(feed==null)failures.push('RSS/Atom feed is missing');
  else{
    if(!feed.includes(`${score}/100`))failures.push(`RSS/Atom feed does not contain canonical score ${score}/100`);
    if(!feed.includes(`<title>Ooze Level ${latest.monthLabel}: ${score}/100`))failures.push(`feed month does not match current specimen ${latest.monthLabel}`);
    if(editorial?.articleSlug&&!feed.includes(`article.html?a=${editorial.articleSlug}`))failures.push('RSS/Atom feed does not contain the flagship report permalink');
  }

  const policies=read('policies.html');
  if(policies==null||!policies.includes(`v${version}`))failures.push(`methodology page must identify exact version v${version}`);
  const archive=read('archive.html');
  if(archive==null||!archive.includes('2003')||!/ex-post/i.test(archive)||!/latest revised observations/i.test(archive))
    failures.push('archive must disclose the 2003 boundary and ex-post latest-revised basis');

  if(version==='3.0.0'){
    const notes=read('notes.html')||'';
    const lab=read('lab.js')||'';
    const articles=read('articles.js')||'';
    const intakeMap=read('research/reference/intake-data-map.html')||'';
    const marketGaugeContent=read('scripts/lib/market-gauge-content.js')||'';
    const marketPageGenerator=read('scripts/market-pages.js')||'';
    const marketGaugePage=read('market/credit/index.html')||'';
    const story=read('scripts/story.js')||'';
    const revisions=json('data/revisions.json');
    const disclosureChecks=[
      [/credit[- ]driven/i,'credit-driven-crisis limitation'],
      [/2007[\s\S]{0,80}2009|single historical episode/i,'single-episode evidence limitation'],
      [/(?:1\s*[–-]\s*2|one\s+(?:to|or)\s+two|about\s+(?:a|one)\s+month).*earlier/i,'slow-tightening timing'],
      [/(?:fast\s+(?:shock|crash)[\s\S]{0,80}(?:nothing|no benefit)|(?:nothing|no benefit)[\s\S]{0,80}fast\s+(?:shock|crash))/i,'fast-shock limitation'],
      [/(?:calm[\s\S]{0,80}(?:dilut|negative)|(?:dilut|negative)[\s\S]{0,80}calm)/i,'calm-market dilution'],
      [/research\//i,'public research studies'],
    ];
    for(const [pattern,label] of disclosureChecks)
      if(!pattern.test(notes))failures.push(`methodology v3 disclosure missing from notes.html: ${label}`);
    const weightChecks=[
      [/name:\s*['"]Employment['"]\s*,\s*w:\s*24\.25/,'Employment 24.25'],
      [/name:\s*['"]Housing['"]\s*,\s*w:\s*19\.4(?:0)?/,'Housing 19.40'],
      [/name:\s*['"]Credit Cards['"]\s*,\s*w:\s*19\.4(?:0)?/,'Credit Cards 19.40'],
      [/name:\s*['"]Auto Loans['"]\s*,\s*w:\s*14\.55/,'Auto Loans 14.55'],
      [/name:\s*['"]Gas Prices['"]\s*,\s*w:\s*9\.7(?:0)?/,'Gas Prices 9.70'],
      [/name:\s*['"]Inflation['"]\s*,\s*w:\s*9\.7(?:0)?/,'Inflation 9.70'],
      [/name:\s*['"]Financial Conditions['"]\s*,\s*w:\s*3(?:\.0+)?/,'Financial Conditions 3.00'],
    ];
    for(const [pattern,label] of weightChecks)
      if(!pattern.test(lab))failures.push(`methodology v3 public weight missing from lab.js: ${label}`);
    if(!/\{[^{}]{0,240}slug:\s*['"]financial['"][^{}]{0,240}weight:\s*3(?:\.0+)?\b/.test(lab))
      failures.push('methodology v3 weighted Financial Conditions indicator missing from lab.js');
    const historyMatch=lab.match(/const HISTORY\s*=\s*(\[[\s\S]*?\]);/);
    if(!historyMatch)failures.push('methodology v3 fallback history missing from lab.js');
    else{
      try{
        const fallbackHistory=JSON.parse(historyMatch[1]).filter(([year])=>year>=2003);
        const transition=Array.isArray(revisions)?revisions.find(entry=>entry.toMethodologyVersion===version):null;
        const frozenMonths=transition?.summary?.monthsCompared||history?.length||0;
        if(fallbackHistory.length<frozenMonths||history&&
          JSON.stringify(fallbackHistory.slice(0,frozenMonths))!==JSON.stringify(history.slice(0,frozenMonths)))
          failures.push('methodology v3 frozen fallback history in lab.js does not match the transition archive');
      }catch(error){failures.push(`methodology v3 fallback history in lab.js is invalid: ${error.message}`)}
    }
    if(/Methodology v2/i.test(lab)||!/Methodology v3/i.test(lab))
      failures.push('methodology v3 fallback history label in lab.js is stale');
    const episodePeak=(from,to)=>history?.filter(([year])=>year>=from&&year<to).reduce((peak,[,value])=>Math.max(peak,value),-Infinity);
    for(const [name,from,to] of [
      ['Global Financial Crisis',2007,2011],['COVID-19 Shock',2020,2021],
      ['Inflation Surge',2022,2023],['Regional Bank Stress',2023,2024],
    ]){
      const peak=episodePeak(from,to);
      const pattern=new RegExp(`name:\\s*['"]${escapeRegExp(name)}['"][\\s\\S]{0,500}?peak:\\s*${peak}\\b`);
      if(!Number.isFinite(peak)||!pattern.test(lab))
        failures.push(`methodology v3 incident peak in lab.js is stale: ${name}`);
    }
    if(/\ball six lines\b/i.test(notes)||/five of six/i.test(notes)||!/six of seven/i.test(notes))
      failures.push('methodology v3 cadence/OOZEMAXING copy in notes.html is not synchronized');
    if(archive==null||!/methodology v3/i.test(archive))failures.push('archive must identify methodology v3 before publication');
    if(!/all seven weighted lines/i.test(articles)||!/six of seven/i.test(articles)||!/Financial Conditions/i.test(articles))
      failures.push('methodology v3 OOZEMAXING incident copy is not synchronized');
    if(/weighted six/i.test(intakeMap)||!/Financial Conditions/i.test(intakeMap))
      failures.push('methodology v3 public intake data map is not synchronized');
    if(!marketGaugeContent||/not a current household input|keeps it separate until live experience/i.test(marketGaugeContent))
      failures.push('methodology v3 Ward NFCI explanation still says the line is unweighted');
    if(!marketPageGenerator||/Separate instrument[\s\S]{0,80}0 oz[\s\S]{0,40}in household jar/i.test(marketPageGenerator))
      failures.push('methodology v3 Ward NFCI page generator still labels the line zero-weight');
    if(!marketGaugePage||/This gauge does not affect the household Ooze Score|not a current household input|keeps it separate until live experience|Separate instrument[\s\S]{0,80}0 oz[\s\S]{0,40}in household jar/i.test(marketGaugePage))
      failures.push('methodology v3 generated Ward NFCI page still says the line is unweighted');
    if((story.match(/\bfinancial\s*:/g)||[]).length<2)
      failures.push('methodology v3 OOZEBOT financial name/value narrative is missing');
    if(/revisedRuns\s*=\s*revisions\.length/.test(story)||!/methodology-recalibration/.test(story))
      failures.push('methodology v3 OOZEBOT confidence copy does not distinguish methodology recalibration');
    const revisionIndex=Array.isArray(revisions)?revisions.findIndex(entry=>entry.toMethodologyVersion===version):-1;
    const revision=revisionIndex>=0?revisions[revisionIndex]:null;
    if(!revision)failures.push('methodology v3 public revision record entry is missing');
    else{
      const normalizedPolicies=(policies||'').replace(/−/g,'-');
      const summary=revision.summary||{};
      const transition=revision.calibration||{};
      for(const [value,label] of [
        [`entry #${revisionIndex+1}`,'revision entry number'],
        [String(summary.monthsMovedAtLeastOne),'months moved'],
        [Number(transition.from?.a).toFixed(4),'prior calibration slope'],
        [Number(transition.from?.b).toFixed(4),'prior calibration intercept'],
        [Number(transition.to?.a).toFixed(4),'new calibration slope'],
        [Number(transition.to?.b).toFixed(4),'new calibration intercept'],
      ])if(!normalizedPolicies.toLowerCase().includes(value.toLowerCase()))
        failures.push(`methodology v3 policies revision summary missing: ${label}`);
      if(!new RegExp(`max(?:imum)?[^<]{0,60}${escapeRegExp(String(summary.maxAbsoluteMove))}`,'i').test(normalizedPolicies))
        failures.push('methodology v3 policies revision summary missing: maximum move');
    }
  }

  const workflow=read('.github/workflows/collect.yml');
  for(const [pattern,label] of [
    [/workflow_dispatch:/,'manual workflow dispatch'],[/contents:\s*write/,'contents write permission'],[/issues:\s*write/,'issues write permission'],
    [/failure\(\)/,'failure alert'],[/close recovered collection alert/i,'recovery behavior'],
  ])if(workflow==null||!pattern.test(workflow))failures.push(`workflow is missing ${label}`);

  const rollback=read('docs/ROLLBACK.md');
  if(rollback==null)failures.push('rollback procedure is missing');
  else for(const term of ['git revert','data/latest','workflow_dispatch','Initial methodology v2 rollback','git diff --exit-code'])
    if(!rollback.includes(term))failures.push(`rollback procedure is missing ${term}`);

  for(const file of fs.readdirSync(root).filter(name=>name.endsWith('.html'))){
    const html=read(file)||'';
    for(const match of html.matchAll(/href=["']([^"']+)["']/g)){
      const href=match[1];
      if(!href||href.startsWith('#')||/^(?:https?:|mailto:|javascript:)/.test(href)||/[{}$]/.test(href))continue;
      const clean=decodeURIComponent(href.split(/[?#]/)[0]);
      if(!clean)continue;
      const target=clean.startsWith('/')?path.join(root,clean):path.resolve(root,path.dirname(file),clean);
      if(!target.startsWith(path.resolve(root))||!fs.existsSync(target))failures.push(`public permalink from ${file} does not resolve: ${href}`);
    }
  }

  return [...new Set(failures)];
}

module.exports={inspectRelease};
