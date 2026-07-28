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
  if(version!=='2.0.0')failures.push(`latest methodology version must be 2.0.0, found ${version||'missing'}`);
  const score=latest.ooze;
  const fingerprint=latest.collection?.inputFingerprint;
  if(!fingerprint)failures.push('current specimen fingerprint is missing');
  else if(!/^[a-f0-9]{64}$/.test(fingerprint))failures.push('current specimen fingerprint must be a 64-character lowercase hex digest');
  if(latest.collection?.fingerprintSchemaVersion!==2)failures.push('current specimen must use fingerprint schema v2');

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
