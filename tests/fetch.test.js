const test=require('node:test');
const assert=require('node:assert/strict');

const {fetchWithRetry}=require('../scripts/lib/fetch');

test('retries transient network failures before succeeding',async()=>{
  let calls=0;
  const response={ok:true,status:200};
  const result=await fetchWithRetry('https://example.test',{
    attempts:3,baseDelayMs:0,fetchImpl:async()=>{
      calls++;
      if(calls<3){const error=new Error('read ETIMEDOUT');error.code='ETIMEDOUT';throw error}
      return response;
    },
  });
  assert.equal(result,response);
  assert.equal(calls,3);
});

test('retries transient HTTP responses but not permanent ones',async()=>{
  let transientCalls=0;
  const success={ok:true,status:200};
  const transient=await fetchWithRetry('https://example.test',{
    attempts:3,baseDelayMs:0,fetchImpl:async()=>++transientCalls===1?{ok:false,status:503}:success,
  });
  assert.equal(transient,success);
  assert.equal(transientCalls,2);

  let permanentCalls=0;
  const notFound={ok:false,status:404};
  const permanent=await fetchWithRetry('https://example.test',{
    attempts:3,baseDelayMs:0,fetchImpl:async()=>{permanentCalls++;return notFound},
  });
  assert.equal(permanent,notFound);
  assert.equal(permanentCalls,1);
});
