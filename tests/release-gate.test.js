const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

const {inspectRelease}=require('../scripts/lib/release-gate');
const {collectionFingerprint}=require('../scripts/lib/fingerprint');

function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'oozemeter-release-gate-'));
  const write=(file,content)=>{const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content)};
  const fingerprint='a'.repeat(64);
  const history=[[2003,10],[2009.417,90],[2020.167,42],[2022.75,24],[2023.583,29],[2026.417,27]];
  const latest={methodologyVersion:'2.0.0',month:'2026-06',monthLabel:'June 2026',generated:'2026-07-26T12:00:00.000Z',ooze:27,history,
    collection:{inputFingerprint:fingerprint,fingerprintSchemaVersion:2,freshnessStatus:'current',staleLines:[]},lines:{}};
  write('data/latest.json',JSON.stringify(latest));
  write('data/latest.js',`window.LIVE_DATA=${JSON.stringify(latest)};`);
  write('data/history.json',JSON.stringify(history));
  write(`data/vintages/${fingerprint}.json`,JSON.stringify({inputFingerprint:fingerprint,fingerprintSchemaVersion:2,
    methodology:{version:'2.0.0'},sources:{ICSA:{fingerprint:'b'.repeat(64)}},
    output:{historyFingerprint:collectionFingerprint(history)}}));
  write('data/editorial.json',JSON.stringify({month:'2026-06',generated:latest.generated,newsletter:'OOZE LEVEL: 27/100',articleSlug:'ooze-report-2026-06'}));
  write('index.html','<title>OOZEMeter — Ooze Level 27/100 (Sticky) · June 2026</title><a href="policies.html">Policies</a><span id="heroScore">27</span><script src="data/latest.js"></script>');
  write('policies.html','<b>v2.0.0</b><a href="index.html">Home</a>');
  write('archive.html','Comparable methodology-v2 history begins in 2003. Ex-post reconstruction using latest revised observations.');
  write('feed.xml','<title>Ooze Level June 2026: 27/100</title><link href="https://arringtonc.github.io/oozemeter/article.html?a=ooze-report-2026-06"/>');
  write('.github/workflows/collect.yml','workflow_dispatch: {}\npermissions:\n  contents: write\n  issues: write\nif: ${{ failure() }}\nalert on collection failure\nclose recovered collection alert\n');
  write('docs/ROLLBACK.md','Use git revert to restore data/latest.json, then use workflow_dispatch. Initial methodology v2 rollback uses git diff --exit-code against the pre-v2 commit.');
  return root;
}

test('release inspector accepts one internally consistent canonical specimen',()=>{
  const root=fixture();
  try{assert.deepEqual(inspectRelease(root),[])}finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('methodology v3 requires its fingerprint schema and mandatory front-end disclosure',()=>{
  const root=fixture();
  try{
    const latestPath=path.join(root,'data/latest.json');
    const latest=JSON.parse(fs.readFileSync(latestPath,'utf8'));
    latest.methodologyVersion='3.0.0';
    latest.collection.fingerprintSchemaVersion=3;
    fs.writeFileSync(latestPath,JSON.stringify(latest));
    fs.writeFileSync(path.join(root,'data/latest.js'),`window.LIVE_DATA=${JSON.stringify(latest)};`);
    const vintagePath=path.join(root,`data/vintages/${latest.collection.inputFingerprint}.json`);
    const vintage=JSON.parse(fs.readFileSync(vintagePath,'utf8'));
    vintage.fingerprintSchemaVersion=3;
    vintage.methodology.version='3.0.0';
    fs.writeFileSync(vintagePath,JSON.stringify(vintage));
    const revision={toMethodologyVersion:'3.0.0',summary:{monthsCompared:6,monthsMovedAtLeastOne:180,maxAbsoluteMove:2},
      calibration:{from:{a:1.4209110232483089,b:-24.62145011353958},to:{a:1.418684348943213,b:-23.96514845099034}}};
    fs.writeFileSync(path.join(root,'data/revisions.json'),JSON.stringify([{changes:[]},revision]));

    const blocked=inspectRelease(root).join('\n');
    assert.match(blocked,/methodology page.*v3\.0\.0/i);
    assert.match(blocked,/credit-driven-crisis limitation/i);
    assert.match(blocked,/Financial Conditions indicator/i);
    assert.match(blocked,/fallback history/i);
    assert.match(blocked,/archive.*methodology v3/i);
    assert.match(blocked,/page generator.*zero-weight/i);
    assert.match(blocked,/generated Ward NFCI page/i);

    fs.writeFileSync(path.join(root,'policies.html'),`<b>v3.0.0</b><a href="index.html">Home</a>
      Entry #2 moved 180 months; maximum move 2. Calibration a 1.4209 to 1.4187; b -24.6215 to -23.9651.`);
    fs.writeFileSync(path.join(root,'notes.html'),`Credit-driven crises: the measured benefit comes from the single historical episode 2007-2009.
      Slow tightening moved the reading about a month earlier; it did nothing in a fast shock.
      In calm markets the effect is slightly negative dilution. The studies are public in research/.
      All seven lines exist before the seal; six of seven crossed during the GFC.`);
    fs.writeFileSync(path.join(root,'lab.js'),`const WEIGHTS=[
      {name:'Employment',w:24.25},{name:'Housing',w:19.40},{name:'Credit Cards',w:19.40},
      {name:'Auto Loans',w:14.55},{name:'Gas Prices',w:9.70},{name:'Inflation',w:9.70},
      {name:'Financial Conditions',w:3.00}]; const INDICATORS=[{slug:'financial',weight:3}];
      /* Methodology v3 */ const HISTORY=${JSON.stringify(latest.history)};
      const INCIDENTS=[
        {name:'Global Financial Crisis',peak:90},{name:'COVID-19 Shock',peak:42},
        {name:'Inflation Surge',peak:24},{name:'Regional Bank Stress',peak:29},
      ];`);
    fs.writeFileSync(path.join(root,'articles.js'),
      'OOZEMAXING requires all seven weighted lines; six of seven crossed, including Financial Conditions.');
    fs.mkdirSync(path.join(root,'research/reference'),{recursive:true});
    fs.writeFileSync(path.join(root,'research/reference/intake-data-map.html'),
      'The weighted lines include Financial Conditions.');
    fs.mkdirSync(path.join(root,'scripts/lib'),{recursive:true});
    fs.writeFileSync(path.join(root,'scripts/lib/market-gauge-content.js'),
      'NFCI is a Ward M gauge and a weighted household input under methodology v3.');
    fs.writeFileSync(path.join(root,'scripts/market-pages.js'),
      'The credit gauge remains in Ward M and NFCI also has 3% household weight under methodology v3.');
    fs.mkdirSync(path.join(root,'market/credit'),{recursive:true});
    fs.writeFileSync(path.join(root,'market/credit/index.html'),
      'NFCI remains a Ward M gauge and is also a weighted household input under methodology v3.');
    fs.writeFileSync(path.join(root,'scripts/story.js'),
      `const NAMES={financial:'financial conditions'}; const VALUE_CLAUSE={financial:l=>' with NFCI at '+l.value};
       const sourceRevisions=revisions.filter(entry=>entry.type!=='methodology-recalibration');`);
    fs.writeFileSync(path.join(root,'archive.html'),
      'Comparable methodology v3 history begins in 2003. Ex-post reconstruction using latest revised observations.');
    assert.deepEqual(inspectRelease(root),[]);

    latest.history.push([2026.5,28]);
    fs.writeFileSync(latestPath,JSON.stringify(latest));
    fs.writeFileSync(path.join(root,'data/latest.js'),`window.LIVE_DATA=${JSON.stringify(latest)};`);
    fs.writeFileSync(path.join(root,'data/history.json'),JSON.stringify(latest.history));
    vintage.output.historyFingerprint=collectionFingerprint(latest.history);
    fs.writeFileSync(vintagePath,JSON.stringify(vintage));
    assert.deepEqual(inspectRelease(root),[],'a later live month must not invalidate the frozen v3 fallback prefix');
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('release inspector rejects editorial and homepage score drift',()=>{
  const root=fixture();
  try{
    const editorial=JSON.parse(fs.readFileSync(path.join(root,'data/editorial.json')));
    editorial.newsletter='OOZE LEVEL: 26/100';
    fs.writeFileSync(path.join(root,'data/editorial.json'),JSON.stringify(editorial));
    fs.writeFileSync(path.join(root,'index.html'),'<span id="heroScore">26</span>');
    const failures=inspectRelease(root).join('\n');
    assert.match(failures,/newsletter.*27\/100/i);
    assert.match(failures,/homepage.*27/i);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('release inspector rejects homepage month drift',()=>{
  const root=fixture();
  try{
    const indexPath=path.join(root,'index.html');
    fs.writeFileSync(indexPath,fs.readFileSync(indexPath,'utf8').replace('June 2026','May 2026'));
    assert.match(inspectRelease(root).join('\n'),/homepage month.*June 2026/i);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('release inspector rejects feed month drift',()=>{
  const root=fixture();
  try{
    const feedPath=path.join(root,'feed.xml');
    fs.writeFileSync(feedPath,fs.readFileSync(feedPath,'utf8').replace('June 2026','May 2026'));
    assert.match(inspectRelease(root).join('\n'),/feed month.*June 2026/i);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('release inspector requires an exact methodology version and rollback path',()=>{
  const root=fixture();
  try{
    fs.writeFileSync(path.join(root,'policies.html'),'<b>v2</b>');
    fs.rmSync(path.join(root,'docs/ROLLBACK.md'));
    const failures=inspectRelease(root).join('\n');
    assert.match(failures,/methodology page.*v2\.0\.0/i);
    assert.match(failures,/rollback/i);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('release inspector requires a pre-v2 rollback verification path',()=>{
  const root=fixture();
  try{
    fs.writeFileSync(path.join(root,'docs/ROLLBACK.md'),'Use git revert, data/latest, and workflow_dispatch.');
    assert.match(inspectRelease(root).join('\n'),/initial methodology v2 rollback/i);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('release inspector rejects malformed fingerprints and generated artifact drift',()=>{
  const root=fixture();
  try{
    const latest=JSON.parse(fs.readFileSync(path.join(root,'data/latest.json'),'utf8'));
    latest.collection.inputFingerprint='abc123';
    fs.writeFileSync(path.join(root,'data/latest.json'),JSON.stringify(latest));
    fs.writeFileSync(path.join(root,'data/history.json'),JSON.stringify([[2003,99]]));
    const failures=inspectRelease(root).join('\n');
    assert.match(failures,/64-character lowercase hex/i);
    assert.match(failures,/latest\.js/i);
    assert.match(failures,/history\.json/i);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('release inspector rejects a vintage from the wrong fingerprint schema',()=>{
  const root=fixture();
  try{
    const fingerprint='a'.repeat(64);
    const vintagePath=path.join(root,`data/vintages/${fingerprint}.json`);
    const vintage=JSON.parse(fs.readFileSync(vintagePath,'utf8'));
    vintage.fingerprintSchemaVersion=3;
    fs.writeFileSync(vintagePath,JSON.stringify(vintage));
    assert.match(inspectRelease(root).join('\n'),/vintage must use fingerprint schema v2/i);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('release-gate CLI emits a machine-readable passing report',()=>{
  const root=fixture();
  try{
    const cli=path.resolve(__dirname,'../scripts/release-gate.js');
    const run=spawnSync(process.execPath,[cli,'--inspect-only','--root',root],{encoding:'utf8'});
    assert.equal(run.status,0,run.stderr||run.stdout);
    const report=JSON.parse(run.stdout);
    assert.equal(report.status,'pass');
    assert.equal(report.methodologyVersion,'2.0.0');
    assert.equal(report.score,27);
    assert.equal(report.fingerprint,'a'.repeat(64));
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});
