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
  const history=[[2003,10],[2026.417,27]];
  const latest={methodologyVersion:'2.0.0',month:'2026-06',monthLabel:'June 2026',generated:'2026-07-26T12:00:00.000Z',ooze:27,history,
    collection:{inputFingerprint:fingerprint,fingerprintSchemaVersion:2,freshnessStatus:'current',staleLines:[]},lines:{}};
  write('data/latest.json',JSON.stringify(latest));
  write('data/latest.js',`window.LIVE_DATA=${JSON.stringify(latest)};`);
  write('data/history.json',JSON.stringify(history));
  write(`data/vintages/${fingerprint}.json`,JSON.stringify({inputFingerprint:fingerprint,fingerprintSchemaVersion:2,
    methodology:{version:'2.0.0'},sources:{ICSA:{fingerprint:'b'.repeat(64)}},
    output:{historyFingerprint:collectionFingerprint(history)}}));
  write('data/editorial.json',JSON.stringify({month:'2026-06',generated:latest.generated,newsletter:'OOZE LEVEL: 27/100',articleSlug:'ooze-report-2026-06'}));
  write('index.html','<a href="policies.html">Policies</a><span id="heroScore">27</span><script src="data/latest.js"></script>');
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
