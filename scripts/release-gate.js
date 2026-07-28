#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');
const {inspectRelease}=require('./lib/release-gate');

const args=process.argv.slice(2);
const value=flag=>{const i=args.indexOf(flag);return i>=0?args[i+1]:null};
const root=path.resolve(value('--root')||path.join(__dirname,'..'));
const inspectOnly=args.includes('--inspect-only');
const prepare=args.includes('--prepare');

function run(command,commandArgs){
  const result=spawnSync(command,commandArgs,{cwd:root,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error(`${command} ${commandArgs.join(' ')} exited ${result.status}`);
}

function report(){
  const latest=JSON.parse(fs.readFileSync(path.join(root,'data/latest.json'),'utf8'));
  const failures=inspectRelease(root);
  return {
    status:failures.length?'fail':'pass',
    methodologyVersion:latest.methodologyVersion,
    score:latest.ooze,
    month:latest.month,
    fingerprint:latest.collection?.inputFingerprint||null,
    fingerprintSchemaVersion:latest.collection?.fingerprintSchemaVersion||null,
    failures,
  };
}

try{
  if(!inspectOnly){
    if(prepare)run(process.execPath,['scripts/collect.js']);
    const tests=fs.readdirSync(path.join(root,'tests')).filter(f=>f.endsWith('.test.js')).sort().map(f=>`tests/${f}`);
    run(process.execPath,['--test','--test-concurrency=1',...tests]);
    for(const file of ['scripts/collect.js','scripts/backtest.js','scripts/integrity.js','scripts/story.js','scripts/narrative-check.js','scripts/stamp.js','scripts/rss.js','lab.js'])
      run(process.execPath,['--check',file]);
    for(const file of ['scripts/integrity.js','scripts/story.js','scripts/narrative-check.js','scripts/stamp.js','scripts/rss.js'])run(process.execPath,[file]);
    run('git',['diff','--check']);
  }
  const result=report();
  if(inspectOnly)process.stdout.write(JSON.stringify(result));
  else{
    console.log(`release gate: ${result.status.toUpperCase()} · methodology v${result.methodologyVersion} · ${result.month} ${result.score}/100`);
    console.log(`fingerprint schema v${result.fingerprintSchemaVersion}: ${result.fingerprint}`);
    result.failures.forEach(f=>console.error('✗',f));
  }
  if(result.status!=='pass')process.exitCode=1;
}catch(error){
  console.error('release gate: ERROR —',error.message);
  process.exitCode=1;
}
