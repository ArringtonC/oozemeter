const RETRYABLE_STATUS=new Set([408,425,429,500,502,503,504]);

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function fetchWithRetry(url,options={}){
  const {
    attempts=3,
    baseDelayMs=1000,
    timeoutMs=45000,
    fetchImpl=globalThis.fetch,
    ...fetchOptions
  }=options;
  let lastError=null;
  for(let attempt=1;attempt<=attempts;attempt++){
    try{
      const requestOptions={...fetchOptions};
      if(timeoutMs&&!requestOptions.signal)requestOptions.signal=AbortSignal.timeout(timeoutMs);
      const response=await fetchImpl(url,requestOptions);
      if(!RETRYABLE_STATUS.has(response.status)||attempt===attempts)return response;
      lastError=new Error(`HTTP ${response.status}`);
    }catch(error){
      lastError=error;
      if(attempt===attempts)throw error;
    }
    const delay=baseDelayMs*2**(attempt-1);
    if(delay>0)await sleep(delay);
  }
  throw lastError||new Error(`fetch failed: ${url}`);
}

module.exports={fetchWithRetry};
