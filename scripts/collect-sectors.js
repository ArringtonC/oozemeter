#!/usr/bin/env node
/* WARD M — Sector Watch collector (manual; schedule blocked on quote rights).
   The operator's ETF dashboard, reported the way a newsroom reports markets:
   per-ticker STATE + percent change, never price levels or series. The panel
   is an equity-price proxy, not direct economic activity or independent sectors.

   Groups (advisor-reviewed):
     Indexes: SPY QQQ DIA IWM · Financial System: XLF XLI IYT
     Consumer: XLY XLP · Innovation: SMH · Defensive: XLV
   Cut: XLK (QQQ overlap), IBB (too niche), XLB/XME (optional cyclicals).

   State rule (published, provisional): 22-session change ≥ −2% → STEADY 🟢,
   −7% inclusive to below −2% → SOFTENING 🟡, below −7% → STRESSED 🔴.
   Breadth: count of softening/stressed ticker proxies → overall CALM / MIXED /
   SOFTENING / STRESSED.

   We store only derived readings (state, 22/64-session price changes, as-of),
   but that does not itself establish redistribution rights. The transport is
   undocumented and scheduled publishing remains disabled pending rights review.

   Approved manual run: node scripts/collect-sectors.js → data/sectors.js|.json */
const {buildMarketNote}=require('./lib/market-note');
const {fetchWithRetry}=require('./lib/fetch');
const {dataRootFromEnv,writePublishedPair}=require('./lib/market-output');
const {computeSessionChanges,parseYahooChart}=require('./lib/market-sector');

const GROUPS=[
 {name:'Market Indexes',tickers:[['SPY','U.S. large-cap equities'],['QQQ','Nasdaq-100 non-financial equities'],['DIA','Thirty price-weighted blue chips'],['IWM','U.S. small-cap equities']]},
 {name:'Financial & Cyclical Equities',tickers:[['XLF','S&P 500 financial equities'],['XLI','S&P 500 industrial equities'],['IYT','Listed transportation equities']]},
 {name:'Consumer Equities',tickers:[['XLY','S&P 500 consumer-discretionary equities'],['XLP','S&P 500 consumer-staples equities']]},
 {name:'Industry',tickers:[['SMH','U.S.-listed semiconductor equities']]},
 {name:'Defensive Equities',tickers:[['XLV','S&P 500 health-care equities']]},
];

async function closes(sym){
  const now=Math.floor(Date.now()/1000);
  const url=`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?period1=${now-200*86400}&period2=${now}&interval=1d`;
  const res=await fetchWithRetry(url,{headers:{'User-Agent':'Mozilla/5.0 (oozemeter sector watch)'}});
  if(!res.ok)throw new Error(`${sym}: HTTP ${res.status}`);
  const {observations,timezone}=parseYahooChart(await res.json(),sym);
  if(timezone!=='America/New_York')throw new Error(`${sym}: unexpected exchange timezone ${timezone||'missing'}`);
  return {observations,timezone};
}
const state=m1=>m1>=-2?['steady','🟢']:m1>=-7?['softening','🟡']:['stressed','🔴'];
const exchangeDate=(unix,timezone)=>{
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(unix*1000));
  const value=type=>parts.find(part=>part.type===type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
};

(async()=>{
  const dataRoot=dataRootFromEnv();
  const groups=[];let soft=0,stress=0,total=0;
  for(const g of GROUPS){
    const rows=[];
    for(const [sym,role] of g.tickers){
      const {observations:cs,timezone}=await closes(sym);
      const {last,m1,m3}=computeSessionChanges(cs);
      const [st,dot]=state(m1);
      total++;if(st==='softening')soft++;if(st==='stressed')stress++;
      rows.push({sym,role,state:st,dot,m1:+m1.toFixed(1),m3:+m3.toFixed(1),
        asOf:exchangeDate(last.t,timezone)});
      console.log(`${sym.padEnd(5)} ${dot} ${st.padEnd(10)} 1m ${m1>=0?'+':''}${m1.toFixed(1)}%  3m ${m3>=0?'+':''}${m3.toFixed(1)}%  (${role})`);
    }
    groups.push({name:g.name,rows});
  }
  const overall=stress>=3?'STRESSED':stress>=1||soft>=4?'SOFTENING':soft>=2?'MIXED':'CALM';
  const payload={generated:new Date().toISOString(),cadence:'manual; weekly schedule proposed but disabled pending quote-rights clearance',
    overall,breadth:{steady:total-soft-stress,softening:soft,stressed:stress,total},
    source:{transport:'Yahoo Finance chart endpoint',endpoint:'https://query1.finance.yahoo.com/v8/finance/chart/{ticker}',field:'quote.close',returnBasis:'price return; distributions not reinvested',windows:'22- and 64-session intervals requiring 23 and 65 valid closes',timezone:'America/New_York from response metadata',corporateActions:'provider close-field behavior; split adjustment remains a source risk',rightsStatus:'unresolved; scheduled publishing disabled pending licensed or explicitly permitted quote source'},
    note:'Manual report of derived ETF price-return states. This 11-ticker proxy panel is not direct economic activity or independent sector breadth. No price history is published, but quote rights remain unresolved. Not part of the household score.',
    stateRule:'22-session change: >= -2% steady; >= -7% and < -2% softening; < -7% stressed',
    groups};
  payload.oozebot=buildMarketNote(payload);
  writePublishedPair({root:dataRoot,name:'sectors',globalName:'SECTOR_DATA',payload});
  console.log(`\nSECTOR WATCH: ${overall} — ${total-soft-stress} steady · ${soft} softening · ${stress} stressed`);
})();
