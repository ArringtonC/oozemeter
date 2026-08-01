const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

function run(cwd,command,args){
  const result=spawnSync(command,args,{cwd,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
  return result;
}

test('integrity gate records a historical revision set only once',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'oozemeter-integrity-'));
  const data=path.join(root,'data');fs.mkdirSync(data);
  const latest={generated:'2026-07-26T12:00:00.000Z',month:'2026-06',ooze:27,lines:{
    gas:{value:'$4.00',stress:50},housing:{value:'6.5%',stress:40},credit:{value:'2.9%',stress:30},
    auto:{value:'7.7%',stress:40},jobs:{value:'4.2%',stress:20},inflation:{value:'3.5%',stress:30},
  }};
  fs.writeFileSync(path.join(data,'latest.json'),JSON.stringify(latest));
  fs.writeFileSync(path.join(data,'history.json'),JSON.stringify([[2003,11],[2009,90]]));
  try{
    run(root,'git',['init','-q']);
    run(root,'git',['config','user.email','test@example.com']);
    run(root,'git',['config','user.name','Test']);
    run(root,'git',['add','data']);
    run(root,'git',['commit','-qm','baseline']);
    fs.writeFileSync(path.join(data,'history.json'),JSON.stringify([[2003,10],[2009,90]]));
    const script=path.resolve(__dirname,'../scripts/integrity.js');
    run(root,process.execPath,[script]);
    run(root,process.execPath,[script]);
    const revisions=JSON.parse(fs.readFileSync(path.join(data,'revisions.json')));
    assert.equal(revisions.length,1);
    assert.deepEqual(revisions[0].changes,[{t:2003,old:11,new:10}]);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('integrity gate records an exact methodology recalibration summary',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'oozemeter-v3-revision-'));
  const data=path.join(root,'data');fs.mkdirSync(data);
  const lines={
    gas:{value:'$4.00',stress:50},housing:{value:'6.5%',stress:40},credit:{value:'2.9%',stress:30},
    auto:{value:'7.7%',stress:40},jobs:{value:'4.2%',stress:20},inflation:{value:'3.5%',stress:30},
    financial:{value:'-0.50',stress:12,delta:0,contributesToOoze:true},
  };
  const previous={generated:'2026-07-31T12:00:00.000Z',methodologyVersion:'2.0.0',month:'2026-06',ooze:27,
    calibration:{a:1.4209110232483089,b:-24.62145011353958},lines};
  fs.writeFileSync(path.join(data,'latest.json'),JSON.stringify(previous));
  fs.writeFileSync(path.join(data,'history.json'),JSON.stringify([[2003,11],[2009,90],[2020.167,41]]));
  try{
    run(root,'git',['init','-q']);
    run(root,'git',['config','user.email','test@example.com']);
    run(root,'git',['config','user.name','Test']);
    run(root,'git',['add','data']);
    run(root,'git',['commit','-qm','baseline']);
    const current={...previous,generated:'2026-08-01T12:00:00.000Z',methodologyVersion:'3.0.0',
      calibration:{a:1.418684348943213,b:-23.96514845099034}};
    fs.writeFileSync(path.join(data,'latest.json'),JSON.stringify(current));
    fs.writeFileSync(path.join(data,'history.json'),JSON.stringify([[2003,10],[2009,90],[2020.167,42]]));
    run(root,process.execPath,[path.resolve(__dirname,'../scripts/integrity.js')]);
    const entry=JSON.parse(fs.readFileSync(path.join(data,'revisions.json')))[0];
    assert.equal(entry.type,'methodology-recalibration');
    assert.equal(entry.fromMethodologyVersion,'2.0.0');
    assert.equal(entry.toMethodologyVersion,'3.0.0');
    assert.deepEqual(entry.summary,{monthsCompared:3,monthsMovedAtLeastOne:2,shareMovedPercent:66.7,maxAbsoluteMove:1,bandLabelFlips:0});
    assert.deepEqual(entry.calibration,{from:previous.calibration,to:current.calibration});
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('integrity gate validates the entire frozen GFC calibration window',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'oozemeter-gfc-window-'));
  const data=path.join(root,'data');fs.mkdirSync(data);
  const latest={generated:'2026-08-01T12:00:00.000Z',methodologyVersion:'2.0.0',month:'2026-06',ooze:27,lines:{
    gas:{value:'$4.00',stress:50},housing:{value:'6.5%',stress:40},credit:{value:'2.9%',stress:30},
    auto:{value:'7.7%',stress:40},jobs:{value:'4.2%',stress:20},inflation:{value:'3.5%',stress:30},
  }};
  fs.writeFileSync(path.join(data,'latest.json'),JSON.stringify(latest));
  fs.writeFileSync(path.join(data,'history.json'),JSON.stringify([[2003,10],[2007.5,95],[2009.417,90]]));
  try{
    run(root,'git',['init','-q']);
    run(root,'git',['config','user.email','test@example.com']);
    run(root,'git',['config','user.name','Test']);
    run(root,'git',['add','data']);
    run(root,'git',['commit','-qm','baseline']);
    const result=spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/integrity.js')],{cwd:root,encoding:'utf8'});
    assert.equal(result.status,1);
    assert.match(result.stderr,/GFC peak reads 95, expected 90±2/);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('integrity gate ignores routine NFCI churn and flags revisions above 0.02',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'oozemeter-nfci-revision-'));
  const data=path.join(root,'data');
  const vintages=path.join(data,'vintages');
  fs.mkdirSync(vintages,{recursive:true});
  const oldFingerprint='a'.repeat(64),newFingerprint='b'.repeat(64);
  const lines={
    gas:{value:'$4.00',stress:50},housing:{value:'6.5%',stress:40},credit:{value:'2.9%',stress:30},
    auto:{value:'7.7%',stress:40},jobs:{value:'4.2%',stress:20},inflation:{value:'3.5%',stress:30},
    financial:{value:'-0.50',stress:12,delta:0,contributesToOoze:true},
  };
  const latest={generated:'2026-08-01T12:00:00.000Z',methodologyVersion:'3.0.0',month:'2026-06',ooze:27,
    calibration:{a:1.418684348943213,b:-23.96514845099034},collection:{inputFingerprint:oldFingerprint},lines};
  const baseline=monthlyMeans=>({sources:{NFCI:{revisionBaseline:{monthlyMeans}}}});
  const previousMeans=[{month:'2026-05',value:-0.50},{month:'2026-06',value:-0.40}];
  fs.writeFileSync(path.join(data,'latest.json'),JSON.stringify(latest));
  fs.writeFileSync(path.join(data,'history.json'),JSON.stringify([[2003,10],[2009,90]]));
  fs.writeFileSync(path.join(vintages,`${oldFingerprint}.json`),JSON.stringify(baseline(previousMeans)));
  try{
    run(root,'git',['init','-q']);
    run(root,'git',['config','user.email','test@example.com']);
    run(root,'git',['config','user.name','Test']);
    run(root,'git',['add','data']);
    run(root,'git',['commit','-qm','baseline']);
    latest.collection.inputFingerprint=newFingerprint;
    fs.writeFileSync(path.join(data,'latest.json'),JSON.stringify(latest));
    const currentPath=path.join(vintages,`${newFingerprint}.json`);
    fs.writeFileSync(currentPath,JSON.stringify(baseline([
      {month:'2026-05',value:-0.49},{month:'2026-06',value:-0.10},{month:'2026-07',value:-0.30},
    ])));
    const routine=run(root,process.execPath,[path.resolve(__dirname,'../scripts/integrity.js')]);
    assert.doesNotMatch(routine.stderr,/NFCI historical revision exceeded/);
    fs.writeFileSync(currentPath,JSON.stringify(baseline([
      {month:'2026-05',value:-0.46},{month:'2026-06',value:-0.10},{month:'2026-07',value:-0.30},
    ])));
    const flagged=run(root,process.execPath,[path.resolve(__dirname,'../scripts/integrity.js')]);
    assert.match(flagged.stderr,/NFCI historical revision exceeded 0\.02.*max \|Δ\|=0\.0400/);
    fs.writeFileSync(currentPath,JSON.stringify(baseline([
      {month:'2026-05',value:-0.46},{month:'2026-06',value:4.10},{month:'2026-07',value:-0.30},
    ])));
    const invalid=spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/integrity.js')],{cwd:root,encoding:'utf8'});
    assert.equal(invalid.status,1);
    assert.match(invalid.stderr,/implausible financial monthly mean: 2026-06=4\.1 outside \[-1\.5,4\]/);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('integrity gate rejects implausible NFCI values and financial stress jumps',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'oozemeter-nfci-plausibility-'));
  const data=path.join(root,'data');fs.mkdirSync(data);
  const latest={generated:'2026-08-01T12:00:00.000Z',methodologyVersion:'3.0.0',month:'2026-06',ooze:27,
    lines:{
      gas:{value:'$4.00',stress:50},housing:{value:'6.5%',stress:40},credit:{value:'2.9%',stress:30},
      auto:{value:'7.7%',stress:40},jobs:{value:'4.2%',stress:20},inflation:{value:'3.5%',stress:30},
      financial:{value:'4.01',stress:100,delta:31,contributesToOoze:true},
    }};
  fs.writeFileSync(path.join(data,'latest.json'),JSON.stringify(latest));
  fs.writeFileSync(path.join(data,'history.json'),JSON.stringify([[2003,10],[2009,90]]));
  try{
    run(root,'git',['init','-q']);
    run(root,'git',['config','user.email','test@example.com']);
    run(root,'git',['config','user.name','Test']);
    run(root,'git',['add','data']);
    run(root,'git',['commit','-qm','baseline']);
    const result=spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/integrity.js')],{cwd:root,encoding:'utf8'});
    assert.equal(result.status,1);
    assert.match(result.stderr,/implausible financial.*outside \[-1\.5,4\]/);
    assert.match(result.stderr,/financial stress jumped 31 points.*30pt sanity cap/);
  }finally{fs.rmSync(root,{recursive:true,force:true})}
});
