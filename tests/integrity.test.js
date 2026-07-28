const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

function run(cwd,command,args){
  const result=spawnSync(command,args,{cwd,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
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
