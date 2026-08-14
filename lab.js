/* ============ OOZEMETER SHARED LAB EQUIPMENT ============ */
/* Live public-data build. Current readings come from data/latest.js; auxiliary
   sensors without an automated feed are labeled as such and never enter Ooze. */

/* LIVE mode: pages load data/latest.js (written by scripts/collect.js) before
   this file; it defines window.LIVE_DATA. Present → real numbers. Absent →
   honest offline state (score 0, sensors offline). No hand-set values. */
const LD = (typeof window!=='undefined' && window.LIVE_DATA) || null;
const LIVE = !!LD;
function feedState(data,now=Date.now()){
  if(!data)return'offline';
  const generated=Date.parse(data.generated);
  if(!Number.isFinite(generated)||now-generated>2*864e5)return'stale';
  if(data.collection?.freshnessStatus==='degraded')return'degraded';
  return'current';
}
const FEED_STATE=feedState(LD);
const FEED_LABEL={current:'LIVE',degraded:'DEGRADED',stale:'STALE',offline:'OFFLINE'}[FEED_STATE];
const FEED_TITLE={
  current:'Collection pipeline current',
  degraded:`Collection current; ${LD?.collection?.staleLines?.length||0} intake line(s) stale`,
  stale:'Collection pipeline has not completed in more than 48 hours',
  offline:'Laboratory feed offline',
}[FEED_STATE];
const TODAY_SCORE = LD ? LD.ooze : 0, YESTERDAY = LD ? LD.prevOoze : 0;
const UPDATED = LD ? LD.updatedLabel : 'no collections yet';

const BANDS = [
  {max:20, name:'SMOOTH',      tier:'🟢 STABLE'},
  {max:40, name:'STICKY',      tier:'🟡 OBSERVATION'},
  {max:60, name:'SLIPPERY',    tier:'🟠 CONTAINMENT WATCH'},
  {max:80, name:'OOZING',      tier:'🟠 CONTAINMENT WARNING'},
  {max:100,name:'OVERFLOWING', tier:'🔴 OVERFLOW RISK'},
];
const MESS_TIER='☢ NATIONAL MESS';

const INDICATORS = [
  {slug:'gas', emoji:'⛽', name:'Gas Prices', val:'$3.42', trend:'▲ +$0.02 today', dir:'up', contrib:7, weight:9.7,
   spark:[28,30,29,33,31,36,40],
   source:{name:'EIA Weekly Retail Gasoline (via FRED)', url:'https://www.eia.gov/petroleum/gasdiesel/'},
   why:`Gasoline is the price everyone sees twice a week, posted in foot-tall numbers on every corner. When it rises, the pain is immediate: commuters, delivery businesses, and family budgets all feel it within days. Economists watch it because fuel costs leak into the price of nearly everything that moves on a truck.`,
   vs2008:`In June 2008, the national average hit $4.11 — a record that, adjusted for inflation, still stings. Combined with the housing collapse, expensive fuel squeezed households from both sides. Today's pump price — shown at the top of this page, from the live feed — is high in nominal terms but sits below that 2008 peak once inflation is accounted for.`,
   faqs:[
     {q:'Why do gas prices rise?', a:'Crude oil is roughly half the pump price, so global oil markets drive most moves. The rest is refining capacity, distribution, taxes, and seasonal demand — summer blends and road-trip season push prices up most years.'},
     {q:'Does the president control gas prices?', a:'Mostly no. Prices are set by global supply and demand. Policy can nudge things at the margins (reserves, permits, taxes), but no administration sets the number on the sign.'},
     {q:'Which states pay the most?', a:'California, Hawaii, and Washington typically top the chart, driven by taxes, special fuel blends, and distance from refineries.'},
   ],
   related:['inflation','manufacturing','housing']},

  {slug:'housing', emoji:'🏠', name:'Housing', val:'6.81%', trend:'▲ 30-yr mortgage rate', dir:'up', contrib:14, weight:19.4,
   spark:[50,52,55,54,58,60,62],
   source:{name:'Freddie Mac PMMS', url:'https://www.freddiemac.com/pmms'},
   why:`Housing is most families' biggest monthly bill and biggest asset at the same time. When mortgage rates climb, affordability collapses for buyers and the whole chain slows: fewer sales, less construction, less spending on everything that fills a house. Housing led the economy into the last great crisis — this intake line gets a thick pipe.`,
   vs2008:`In 2008, this line ruptured. Subprime lending, teaser rates, and speculation sent prices to unsustainable heights; the collapse erased roughly $7 trillion in home equity and triggered a global financial crisis. Today's stress is different — high rates and low affordability, but far stricter lending and much stronger household equity.`,
   faqs:[
     {q:'What makes mortgage rates move?', a:'Mostly the 10-year Treasury yield plus a spread. When investors expect inflation or the Fed holds rates high, Treasury yields rise and mortgages follow.'},
     {q:'Is this like 2008?', a:'The stress source differs. 2008 was a credit-quality crisis — loans that should never have been written. Today is an affordability crisis — solid loans that few can afford to originate. Painful, but structurally safer.'},
     {q:'What is housing affordability?', a:'An index comparing the median family income against the income needed to buy the median home at current rates. Below 100 means the median family can’t afford the median house.'},
   ],
   related:['foreclosures','credit','jobs']},

  {slug:'credit', emoji:'💳', name:'Credit Cards', val:'3.2%', trend:'▲ delinquency, 2-yr high', dir:'up', contrib:13, weight:19.4,
   spark:[30,34,38,42,48,55,60],
   source:{name:'NY Fed Household Debt Report', url:'https://www.newyorkfed.org'},
   why:`Credit card stress is the economy's early-warning smoke detector. Cards are the first bill households skip when budgets crack — before the car payment, long before the mortgage. Rising delinquencies mean millions of kitchen-table budgets are already failing, months before it shows up anywhere else.`,
   vs2008:`Charge-off rates peaked above 10% in 2010 as unemployment destroyed household finances. Today's delinquency rate — shown at the top of this page, from the live feed — remains a fraction of that. This line reads the level and its direction together; the current move is stated beside the reading rather than described here, because a sentence written once cannot keep up with a series that revises.`,
   faqs:[
     {q:'What is a delinquency?', a:'A payment more than 30 days late. At 90+ days it becomes "seriously delinquent," and when the bank gives up collecting, it becomes a charge-off.'},
     {q:'Why are balances rising?', a:'Inflation raised the cost of essentials while pandemic savings ran out. Many households bridge the gap on cards — at APRs near their historic highs.'},
     {q:'How much card debt does America carry?', a:'More than a trillion dollars, and an all-time high in nominal terms — though as a share of income it remains below the 2008 peak. The current balance is published quarterly by the New York Fed; we do not restate it here, because a figure typed into a sentence stops tracking the series it came from.'},
   ],
   related:['auto','housing','jobs']},

  {slug:'auto', emoji:'🚗', name:'Auto Loans', val:'7.9%', trend:'▲ average APR', dir:'up', contrib:9, weight:14.55,
   spark:[40,42,45,44,48,50,52],
   source:{name:'NY Fed / Equifax', url:'https://www.newyorkfed.org'},
   why:`In most of America, no car means no job. That makes the auto loan the most defended payment in the household budget — families pay the car before the credit card, sometimes before the rent. So when auto delinquencies and repossessions rise, it signals stress that has already burned through every other line of defense.`,
   vs2008:`Repossessions surged past 1.9 million in 2009. Today's numbers are lower, but the average monthly payment on a new car now exceeds $730 — a record — and seven-year loan terms mean many borrowers owe more than the car is worth.`,
   faqs:[
     {q:'Why are car payments so high?', a:'Three compounding forces: vehicle prices jumped ~30% since 2020, interest rates roughly doubled, and buyers stretched to longer terms — which lowers the payment but raises the total cost.'},
     {q:'What is a repossession?', a:'When a lender reclaims the vehicle after missed payments, typically 60–90 days delinquent. It craters the borrower’s credit for years.'},
     {q:'Are EVs affected?', a:'EV depreciation has been unusually steep, leaving some borrowers deeply underwater — a new stress source this facility is monitoring.'},
   ],
   related:['credit','gas','jobs']},

  {slug:'jobs', emoji:'👷', name:'Unemployment', val:'4.4%', trend:'▲ +0.1 pt this month', dir:'up', contrib:15, weight:24.25,
   spark:[35,36,38,40,44,48,55],
   source:{name:'Bureau of Labor Statistics', url:'https://www.bls.gov'},
   why:`Employment is the heaviest-weighted intake line in the facility, and for good reason: a paycheck is the pressure valve for every other indicator. People with jobs pay their mortgages, cards, and car loans. When unemployment climbs, every other jar in the building starts bubbling within months. Recessions are, at their core, employment events.`,
   vs2008:`Unemployment peaked at 10.0% in October 2009 — nearly 15 million Americans out of work — and took over six years to recover. April 2020 was even more violent: 14.8% in a single month. Today's rate — shown at the top of this page, from the live feed — is low by the standard of both those episodes. This line reads direction as well as level, and the current move is stated beside the reading rather than fixed in this sentence.`,
   faqs:[
     {q:'What counts as unemployed?', a:'You must be jobless, available to work, and actively searching within the last four weeks. Discouraged workers who stopped looking are counted separately — a reason economists watch broader measures like U-6.'},
     {q:'What are initial jobless claims?', a:'The weekly count of new unemployment-benefit filings — the fastest-updating employment signal we have, published every Thursday.'},
     {q:'Why does a small rise matter?', a:'Unemployment has momentum. Historically, once the rate rises half a point off its low (the "Sahm rule"), it has nearly always kept rising into a recession.'},
   ],
   related:['manufacturing','credit','housing']},

  {slug:'inflation', emoji:'📈', name:'Inflation', val:'3.1%', trend:'▼ CPI cooling', dir:'down', contrib:6, weight:9.7,
   spark:[70,65,60,55,50,45,42],
   source:{name:'BLS Consumer Price Index', url:'https://www.bls.gov/cpi'},
   why:`Inflation is the silent leak — it doesn't take your job or your house, it just quietly makes everything you already do more expensive. It hits hardest at the bottom, where groceries and rent consume most of the paycheck. It also drives nearly every other line: the Fed's fight against inflation is why mortgage and auto rates are high.`,
   vs2008:`Mid-2008 saw a 5.6% oil-driven spike, followed by outright deflation during the crash. The modern benchmark is June 2022: 9.1%, the fastest since 1981 — the event that triggered the steepest rate-hiking cycle in four decades, whose pressure still fills several other jars in this facility.`,
   faqs:[
     {q:'What is CPI?', a:'The Consumer Price Index — the average price change of a fixed basket of goods and services a typical urban household buys. The headline inflation number you hear is CPI’s 12-month change.'},
     {q:'What is core inflation?', a:'CPI minus food and energy, whose prices swing wildly. Core shows the underlying trend, which is why the Fed watches it more closely than the headline.'},
     {q:'Is deflation good?', a:'No — falling prices sound nice but usually mean collapsing demand. People delay purchases, companies cut jobs, and the spiral feeds itself. Central banks fear deflation more than moderate inflation.'},
   ],
   related:['gas','housing','credit']},

  {slug:'financial', emoji:'🌡', name:'Financial Conditions', val:'-0.54', trend:'▼ conditions loose', dir:'down', contrib:0, weight:3,
   spark:[12,12,11,12,12,12,12],
   source:{name:'Chicago Fed NFCI (via FRED)', seriesId:'NFCI', url:'https://fred.stlouisfed.org/series/NFCI'},
   why:`This line reads the financial system's plumbing: the Chicago Fed's National Financial Conditions Index compresses 105 measures of lending, funding, and risk appetite into one number. Positive means tighter than normal — banks pulling back, credit harder to get; negative means looser. It entered the jar in methodology v3 at 3% as a labeled bet: in backtesting it made the score climb about a month earlier during the slow credit tightening of 2007–08, and did nothing in the fast crash of 2020. Its measured benefit comes from that single historical episode, and in calm markets its arithmetic effect on the blended score is slightly negative. The full studies are public in the research archive.`,
   vs2008:`The NFCI rose far above average through 2007–08 as risk, credit, and leverage tightened together — months before household lines like unemployment confirmed the damage. That early climb in a slow, credit-driven crisis is exactly the pattern this line was added to catch. It is not a crystal ball: in fast shocks, everything moves at once and this line adds nothing.`,
   faqs:[
     {q:'Why is this line in the household jar at all?', a:'Because credit conditions reach households eventually — tighter lending becomes denied loans, higher rates, and slower hiring. At 3%, the line is large enough to show slow credit tightening early and small enough that every score movement still has a household explanation.'},
     {q:'Is this the stock market?', a:'No. The S&P 500 is not an input to the Ooze Score at any weight. The NFCI is a Federal Reserve index of lending and funding conditions; markets get their own separate instrument in Ward M, which never touches this score.'},
     {q:'What are the honest limits?', a:'The 3% weight is calibrated to credit-driven crises like 2007–09 — a bet, labeled as one. It detects slow tightening one to two months early, contributes nothing in fast shocks, and slightly dilutes the score in calm markets. The decision record and all four studies are public.'},
   ],
   related:['credit','housing','jobs']},

  {slug:'foreclosures', emoji:'🏦', name:'Mortgage Distress', val:'—', trend:'auxiliary delinquency proxy', dir:'down', contrib:0, weight:0,
   spark:[20,21,20,22,21,22,22],
   source:{name:'Federal Reserve Mortgage Delinquency', seriesId:'DRSFRMACBS', url:'https://fred.stlouisfed.org/series/DRSFRMACBS'},
   why:`This auxiliary sensor measures residential mortgage delinquency at commercial banks. It is a mortgage-distress proxy, not a count or rate of foreclosure filings, and it does not add separate weight to the Ooze because mortgage delinquency already informs Housing.`,
   vs2008:`Mortgage delinquency surged during the Global Financial Crisis and confirms severe borrower distress, but it is not interchangeable with foreclosure filings. OOZEMeter keeps that distinction visible instead of presenting the proxy as a direct foreclosure rate.`,
   faqs:[
     {q:'Is this a foreclosure rate?', a:'No. DRSFRMACBS measures delinquent residential mortgages held by commercial banks. It is displayed only as a mortgage-distress proxy.'},
     {q:'Why use a proxy?', a:'This line reads bank mortgage delinquency, which is a step earlier than foreclosure. The NY Fed household debt workbook this facility already downloads does carry national foreclosure figures; wiring them in is queued work, not an unavailable source. Saying otherwise would be an excuse dressed as a limitation.'},
     {q:'Does it affect the score twice?', a:'No. Mortgage delinquency informs Housing; this auxiliary file has zero additional weight.'},
   ],
   related:['housing','jobs','credit']},

  {slug:'manufacturing', emoji:'🏭', name:'Manufacturing', val:'—', trend:'auxiliary public-data sensor', dir:'up', contrib:0, weight:0,
   spark:[55,52,50,49,48,49,48],
   source:{name:'Federal Reserve Industrial Production', seriesId:'INDPRO', url:'https://fred.stlouisfed.org/series/INDPRO'},
   why:`Factories feel the economy early. OOZEMeter's public-data path uses Federal Reserve industrial production and Census manufacturers' new orders (AMTMNO) rather than republishing licensed ISM PMI data. This remains an auxiliary sensor with zero score weight until its transformation is frozen and backtested.`,
   vs2008:`Industrial production fell sharply during the Global Financial Crisis. Unlike PMI, INDPRO measures realized output rather than survey expectations, so the two should not be labeled as the same indicator.`,
   faqs:[
     {q:'Is this ISM PMI?', a:'No. The public candidate is Federal Reserve industrial production, with Census manufacturers\' new orders as context. New orders, not shipments — orders are the earlier signal.'},
     {q:'Does manufacturing still matter?', a:'It’s ~11% of GDP but punches far above that weight in cyclical signal — factory orders swing early and hard, making them a preview of the broader economy.'},
     {q:'What is industrial production?', a:'The Federal Reserve’s measure of actual physical output from factories, mines, and utilities.'},
   ],
   related:['jobs','gas','inflation']},
];

const MOVERS = [
  {dir:'up',   slug:'gas',       name:'Gas Prices',      why:'Refinery outages pushed the national average higher.', pts:'+6'},
  {dir:'up',   slug:'credit',    name:'Credit Defaults', why:'Card delinquencies hit a two-year high.',              pts:'+4'},
  {dir:'down', slug:'inflation', name:'Inflation',       why:'Core CPI cooled for a third straight month.',          pts:'−3'},
];

/* Methodology v3: Financial Conditions enters at 3.00; incumbents scale ×0.97.
   Sums to 100. Change only with a methodology revision (policies.html). */
const WEIGHTS = [
  {name:'Employment', w:24.25},{name:'Housing', w:19.4},{name:'Credit Cards', w:19.4},
  {name:'Auto Loans', w:14.55},{name:'Gas Prices', w:9.7},{name:'Inflation', w:9.7},
  {name:'Financial Conditions', w:3},
];

/* Methodology v3 backtested monthly OOZE, 2003 → latest, computed from public
   data by scripts/backtest.js. Calibration (published): calmest 2003-2025
   month → 10, GFC peak (Jun 2009) → 90. Regenerate with
   scripts/sync-fallback-history.js after collection — never hand-edit. */
const HISTORY = [[2003,44],[2003.083,46],[2003.167,47],[2003.25,44],[2003.333,42],[2003.417,41],[2003.5,39],[2003.583,41],[2003.667,41],[2003.75,38],[2003.833,36],[2003.917,34],[2004,32],[2004.083,33],[2004.167,31],[2004.25,32],[2004.333,36],[2004.417,37],[2004.5,34],[2004.583,32],[2004.667,31],[2004.75,32],[2004.833,32],[2004.917,30],[2005,29],[2005.083,26],[2005.167,31],[2005.25,30],[2005.333,29],[2005.417,28],[2005.5,32],[2005.583,34],[2005.667,45],[2005.75,40],[2005.833,34],[2005.917,33],[2006,35],[2006.083,33],[2006.167,35],[2006.25,41],[2006.333,47],[2006.417,44],[2006.5,47],[2006.583,44],[2006.667,38],[2006.75,39],[2006.833,38],[2006.917,39],[2007,37],[2007.083,39],[2007.167,39],[2007.25,42],[2007.333,43],[2007.417,45],[2007.5,46],[2007.583,46],[2007.667,46],[2007.75,52],[2007.833,56],[2007.917,57],[2008,59],[2008.083,60],[2008.167,63],[2008.25,65],[2008.333,67],[2008.417,70],[2008.5,75],[2008.583,76],[2008.667,77],[2008.75,79],[2008.833,75],[2008.917,77],[2009,83],[2009.083,84],[2009.167,86],[2009.25,88],[2009.333,89],[2009.417,90],[2009.5,89],[2009.583,88],[2009.667,88],[2009.75,86],[2009.833,82],[2009.917,82],[2010,81],[2010.083,79],[2010.167,80],[2010.25,76],[2010.333,75],[2010.417,76],[2010.5,71],[2010.583,71],[2010.667,71],[2010.75,67],[2010.833,68],[2010.917,66],[2011,63],[2011.083,62],[2011.167,64],[2011.25,63],[2011.333,64],[2011.417,64],[2011.5,63],[2011.583,63],[2011.667,64],[2011.75,60],[2011.833,59],[2011.917,58],[2012,56],[2012.083,56],[2012.167,55],[2012.25,54],[2012.333,54],[2012.417,54],[2012.5,53],[2012.583,52],[2012.667,51],[2012.75,50],[2012.833,49],[2012.917,49],[2013,50],[2013.083,49],[2013.167,49],[2013.25,49],[2013.333,48],[2013.417,47],[2013.5,46],[2013.583,46],[2013.667,47],[2013.75,46],[2013.833,44],[2013.917,43],[2014,41],[2014.083,43],[2014.167,43],[2014.25,39],[2014.333,40],[2014.417,39],[2014.5,38],[2014.583,38],[2014.667,37],[2014.75,34],[2014.833,34],[2014.917,33],[2015,32],[2015.083,31],[2015.167,32],[2015.25,32],[2015.333,34],[2015.417,32],[2015.5,31],[2015.583,30],[2015.667,29],[2015.75,28],[2015.833,27],[2015.917,25],[2016,23],[2016.083,22],[2016.167,24],[2016.25,24],[2016.333,24],[2016.417,25],[2016.5,24],[2016.583,24],[2016.667,24],[2016.75,23],[2016.833,22],[2016.917,22],[2017,22],[2017.083,22],[2017.167,20],[2017.25,21],[2017.333,20],[2017.417,20],[2017.5,20],[2017.583,20],[2017.667,23],[2017.75,19],[2017.833,20],[2017.917,19],[2018,18],[2018.083,18],[2018.167,18],[2018.25,18],[2018.333,19],[2018.417,19],[2018.5,17],[2018.583,17],[2018.667,15],[2018.75,16],[2018.833,15],[2018.917,14],[2019,13],[2019.083,13],[2019.167,13],[2019.25,12],[2019.333,14],[2019.417,14],[2019.5,12],[2019.583,11],[2019.667,11],[2019.75,11],[2019.833,12],[2019.917,13],[2020,12],[2020.083,11],[2020.167,42],[2020.25,42],[2020.333,41],[2020.417,40],[2020.5,37],[2020.583,34],[2020.667,34],[2020.75,33],[2020.833,32],[2020.917,33],[2021,31],[2021.083,31],[2021.167,31],[2021.25,29],[2021.333,27],[2021.417,26],[2021.5,21],[2021.583,20],[2021.667,20],[2021.75,14],[2021.833,11],[2021.917,10],[2022,12],[2022.083,11],[2022.167,14],[2022.25,15],[2022.333,17],[2022.417,19],[2022.5,21],[2022.583,18],[2022.667,18],[2022.75,24],[2022.833,23],[2022.917,19],[2023,20],[2023.083,21],[2023.167,22],[2023.25,24],[2023.333,23],[2023.417,24],[2023.5,25],[2023.583,29],[2023.667,26],[2023.75,28],[2023.833,26],[2023.917,24],[2024,24],[2024.083,25],[2024.167,27],[2024.25,28],[2024.333,28],[2024.417,28],[2024.5,28],[2024.583,26],[2024.667,23],[2024.75,24],[2024.833,25],[2024.917,25],[2025,25],[2025.083,25],[2025.167,24],[2025.25,24],[2025.333,24],[2025.417,25],[2025.5,23],[2025.583,23],[2025.667,23],[2025.833,22],[2025.917,21],[2026,19],[2026.083,19],[2026.167,24],[2026.25,28],[2026.333,30],[2026.417,27],[2026.5,26]];
/* Methodology v3 requires the NY Fed auto series, which begins in 2003. Trim
   the embedded fallback as well as live history rather than fabricating a
   comparable pre-series score. */
HISTORY.splice(0,HISTORY.findIndex(([year])=>year>=2003));
/* real dates; NBER dating for recessions */
const EVENTS = [
  [2007.6,'AUG 9 2007 — BNP Paribas freezes funds. The credit crunch begins.'],
  [2008.7,'SEP 15 2008 — Lehman Brothers files. Containment failed.'],
  [2009.8,'OCT 2009 — Unemployment peaks at 10.0%.'],
  [2020.3,'MAR–APR 2020 — 22M jobs lost; a record 6.1M claims in one week; unemployment 14.8%.'],
  [2022.45,'JUN 2022 — CPI peaks at 9.1%, fastest since 1981.'],
  [2023.2,'MAR 2023 — SVB fails; 3 of the 4 largest U.S. bank failures in weeks.'],
  [2026,`MID-2026 — Methodology v3 live reading: ${TODAY_SCORE}/100.`],
];
/* Peaks are backtested from public data (scripts/backtest.js), calibrated
   calm→10 / GFC→90. Stamps are data-driven: ≥80 failed, 55–79 stressed, <55 held. */
const INCIDENTS = [
  {year:2008, jump:2008.7,  name:'Global Financial Crisis', dates:'NBER: Dec 2007 – Jun 2009',  stamp:'failed',   label:'Containment Failed',   peak:90, tags:['Housing','Credit','Bank Failures']},
  {year:2020, jump:2020.3,  name:'COVID-19 Shock',          dates:'NBER: Feb – Apr 2020',       stamp:'held',     label:'Containment Held',     peak:42, tags:['Jobs','Stimulus']},
  {year:2022, jump:2022.45, name:'Inflation Surge',         dates:'CPI peak: Jun 2022',         stamp:'held',     label:'Containment Held',     peak:24, tags:['CPI','Energy','Vibecession']},
  {year:2023, jump:2023.2,  name:'Regional Bank Stress',    dates:'Mar – May 2023',             stamp:'held',     label:'Containment Held',     peak:29, tags:['Banks','Rates']},
];

/* demo state stress scores */
const STATES = [
  ['Alabama',58],['Alaska',55],['Arizona',65],['Arkansas',57],['California',74],
  ['Colorado',60],['Connecticut',61],['Delaware',59],['Florida',71],['Georgia',64],
  ['Hawaii',69],['Idaho',54],['Illinois',66],['Indiana',56],['Iowa',48],
  ['Kansas',51],['Kentucky',60],['Louisiana',70],['Maine',52],['Maryland',62],
  ['Massachusetts',58],['Michigan',63],['Minnesota',50],['Mississippi',68],['Missouri',58],
  ['Montana',53],['Nebraska',46],['Nevada',72],['New Hampshire',47],['New Jersey',65],
  ['New Mexico',67],['New York',63],['North Carolina',59],['North Dakota',44],['Ohio',61],
  ['Oklahoma',62],['Oregon',64],['Pennsylvania',60],['Rhode Island',62],['South Carolina',61],
  ['South Dakota',45],['Tennessee',58],['Texas',66],['Utah',52],['Vermont',49],
  ['Virginia',55],['Washington',59],['West Virginia',69],['Wisconsin',53],['Wyoming',50],
];

/* LIVE: patch indicators + movers from collected data. Offline: blank all
   "current" readings; educational content stays either way. */
if(LD){
  if(Array.isArray(LD.history))HISTORY.splice(0,HISTORY.length,...LD.history);
  for(const x of INDICATORS){
    const l=LD.lines[x.slug];
    if(!l){x.val='—';x.trend='auxiliary sensor — feed pending';x.dir='down';x.contrib=0;continue;}
    x.val=l.value;
    x.contrib=l.contrib;
    x.stress=l.stress||0;
    x.contributesToOoze=l.contributesToOoze!==false;
    x.dir=l.delta>=0?'up':'down';
    x.trend=`${l.delta>=0?'▲ +':'▼ −'}${Math.abs(l.delta)} pts vs ${LD.prevMonthLabel.split(' ')[0]}`
      +(l.stale?' · ⚠ STALE FEED':'')+` · as of ${l.asOf}`;
    if(l.source)x.source={name:`${l.source.publisher} — ${l.source.metric}`,url:l.source.url};
  }
  MOVERS.length=0;
  for(const m of LD.movers){
    const y=indBySlugRaw(m.slug);
    MOVERS.push({dir:m.delta>=0?'up':'down',slug:m.slug,name:y.name,
      why:`Line pressure ${m.delta>=0?'rose':'eased'} ${Math.abs(m.delta)} points vs ${LD.prevMonthLabel}.`,
      pts:`${m.delta>=0?'+':'−'}${Math.abs(m.delta)}`});
  }
}else{
  INDICATORS.forEach(x=>{x.val='—';x.trend='sensor offline';x.dir='down';x.contrib=0;x.contributesToOoze=x.weight>0;});
  MOVERS.length=0;
}
function indBySlugRaw(slug){return INDICATORS.find(x=>x.slug===slug)}

/* Canonical Truth: prose never remembers unchecked numbers. Dynamic household
   tokens resolve from HISTORY. Source-assertion tokens carry a frozen display
   value whose source coordinate is independently verified by narrative-check. */
function resolveClaims(text){
  if(!text)return text;
  const hmap=new Map(HISTORY.map(([t,v])=>[t.toFixed(3),v]));
  const key=ym=>{const[y,m]=ym.split('-').map(Number);return(y+(m-1)/12).toFixed(3)};
  return text
    .replace(/\{\{s:(\d{4}-\d{2})\}\}/g,(_,ym)=>{const v=hmap.get(key(ym));return v==null?'—':Math.round(v)})
    .replace(/\{\{peak:(\d{4}-\d{2})\.\.(\d{4}-\d{2})\}\}/g,(_,a,b)=>{
      const ta=+key(a),tb=+key(b);
      const w=HISTORY.filter(([t])=>t>=ta-0.001&&t<=tb+0.001).map(([,v])=>v);
      return w.length?Math.round(Math.max(...w)):'—';
    })
    .replace(/\{\{market-current:\d{4}-\d{2}=(\d{1,3})\}\}/g,'$1')
    .replace(/\{\{market:\d{4}-\d{2}=(\d{1,3})\}\}/g,'$1')
    .replace(/\{\{revision-old:\d+\.\d+\.\d+:\d{4}-\d{2}=(\d{1,3})\}\}/g,'$1');
}

/* ============ HELPERS ============ */
const $=id=>document.getElementById(id);
const LEVELCOLORS=['#4dffa1','#8aff3c','#d8ff2e','#ffb02e','#ff4d3d'];
/* dual-format freshness, CNBC-style: relative while fresh, absolute once old */
const relTime=d=>{
  const days=Math.round((Date.now()-new Date(d))/864e5);
  return days<=0?'today':days<7?days+'d ago':days<30?Math.round(days/7)+'w ago'
    :days<365?Math.round(days/30)+'mo ago'
    :new Date(d).toLocaleDateString('en-US',{month:'short',year:'numeric'});
};
const levelOf=s=>s<=20?1:s<=40?2:s<=60?3:s<=80?4:5;
const bandOf=s=>BANDS[levelOf(s)-1];
const tierOf=s=>s>=95?MESS_TIER:bandOf(s).tier;
const indBySlug=slug=>INDICATORS.find(x=>x.slug===slug);

function scoreAt(year){
  for(let i=0;i<HISTORY.length-1;i++){
    const [y1,s1]=HISTORY[i],[y2,s2]=HISTORY[i+1];
    if(Math.abs(year-y1)<0.001)return s1;
    if(Math.abs(year-y2)<0.001)return s2;
    if(year>=y1&&year<=y2){
      if(y2-y1>0.12)return null;
      return s1+(s2-s1)*(year-y1)/(y2-y1||1);
    }
  }
  return TODAY_SCORE;
}

/* ============ LAB AUDIO ============ */
let AC=null,audioOn=false;
function bloop(f=170,vol=.1){
  if(!audioOn)return;
  AC??=new (window.AudioContext||window.webkitAudioContext)();
  const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
  o.type='sine';
  o.frequency.setValueAtTime(f,t);
  o.frequency.exponentialRampToValueAtTime(f*.4,t+.18);
  g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(.001,t+.22);
  o.connect(g);g.connect(AC.destination);
  o.start(t);o.stop(t+.24);
}

/* ============ JAR COMPONENT ============ */
function buildJar(el){
  let bubbles='';
  for(let i=0;i<10;i++){
    const s=4+Math.round(((i*37)%100)/100*8);
    bubbles+=`<span class="bubble" style="left:${8+((i*53)%84)}%;width:${s}px;height:${s}px;animation-delay:${(i*.47).toFixed(2)}s"></span>`;
  }
  el.innerHTML=`
    <div class="tap-msg">⚠ Do not tap the glass</div>
    <div class="drip d1"></div><div class="drip d2"></div>
    <div class="jar-lid"></div><div class="jar-neck"></div>
    <div class="jar-glass">
      <div class="liquid"><div class="wave a"></div><div class="wave b"></div>${bubbles}</div>
      <div class="glass-shine"></div>
      <div class="ticks">${[80,60,40,20].map(t=>`<div class="tick" style="top:${100-t}%">${t}</div>`).join('')}</div>
    </div>`;
  el.addEventListener('click',()=>{
    el.classList.remove('tapped');void el.offsetWidth;el.classList.add('tapped');
    const m=el.querySelector('.tap-msg');m.classList.add('show');
    setTimeout(()=>m.classList.remove('show'),1800);
    bloop(90,.15);
  });
}
/* staged motion: filling wakes the jar (waves, bubbles), then it comes to rest.
   Interaction calls setJar/wakeJar again; stillness is the default state. */
function wakeJar(jarEl,settleAfter=1800){
  jarEl.classList.remove('settled');
  clearTimeout(jarEl._settleT);
  jarEl._settleT=setTimeout(()=>jarEl.classList.add('settled'),settleAfter);
}
function setJar(jarEl,themeEl,score){
  jarEl.querySelector('.liquid').style.height=Math.min(score,98)+'%';
  themeEl.dataset.level=levelOf(score);
  wakeJar(jarEl);
}
function setFacility(score){
  document.body.dataset.alert=score>=95?'mess':score>=90?'flicker':score>=80?'alarm':'';
  if(!document.body.dataset.alert)delete document.body.dataset.alert;
}

/* ============ CHARTS ============ */
/* 20-year stress chart with recession shading (2008-09, 2020) */
function bigChart(hist){
  const w=640,h=200,pad=18,y0=2006,y1=2026;
  const X=yr=>pad+(yr-y0)/(y1-y0)*(w-2*pad);
  const Y=v=>h-24-(v/100)*(h-44);
  const xy=hist.map((v,i)=>`${X(y0+i).toFixed(1)},${Y(v).toFixed(1)}`);
  const grid=[25,50,75].map(g=>`<line x1="${pad}" y1="${Y(g)}" x2="${w-pad}" y2="${Y(g)}" stroke="rgba(163,255,18,.08)"/>
    <text x="${pad}" y="${Y(g)-4}" fill="#708363" font-size="9">${g}</text>`).join('');
  const band=(a,b,label)=>`<rect x="${X(a)}" y="${Y(100)}" width="${X(b)-X(a)}" height="${h-44}" fill="rgba(255,77,61,.07)"/>
    <text x="${X(a)+3}" y="${Y(100)+11}" fill="rgba(255,77,61,.7)" font-size="8" letter-spacing="1">${label}</text>`;
  const years=[2006,2011,2016,2021,2026].map(yr=>
    `<text x="${X(yr)}" y="${h-8}" fill="#708363" font-size="9" text-anchor="middle">${yr}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="20-year stress history chart">
    ${grid}${band(2007.8,2009.5,'GFC')}${band(2020,2020.8,'COVID')}
    <polygon points="${X(y0)},${Y(0)} ${xy.join(' ')} ${X(y1)},${Y(0)}" fill="rgba(163,255,18,.08)"/>
    <polyline points="${xy.join(' ')}" fill="none" stroke="#a3ff12" stroke-width="1.8"/>
    <circle cx="${X(y1)}" cy="${Y(hist[hist.length-1])}" r="4" fill="#a3ff12"/>
    ${years}</svg>`;
}

/* ============ SHARED CHROME ============ */
function renderHeader(active){
  document.body.insertAdjacentHTML('afterbegin',`
  <div id="alarmWash"></div>
  <div id="pageDrips"><i></i><i></i><i></i></div>`);
  const indLinks=INDICATORS.map(x=>`<a href="indicator.html?i=${x.slug}"><span>${x.emoji}</span>${x.name}</a>`).join('');
  const act=k=>k===active?' class="active"':'';
  document.getElementById('page').insertAdjacentHTML('afterbegin',`
  <header>
    <div class="wrap nav">
      <a class="brand" href="index.html" style="text-decoration:none">
        <div class="wordmark">OOZE<em>METER</em></div>
        <div class="division">Division of Economic Containment</div>
      </a>
      <nav class="nav-links">
        <a href="what-is-ooze.html"${act('what')}>What is Ooze?</a>
        <details class="nav-dd"><summary>Indicators</summary><div class="dd-panel">${indLinks}</div></details>
        <a href="oozeonomics.html"${act('news')}>Oozeonomics</a>
        <a href="market.html"${act('market')}>Markets</a>
        <a href="archive.html"${act('archive')}>Archive</a>
        <details class="nav-dd"><summary>Tools</summary><div class="dd-panel">
          <a href="market.html"><span>📊</span>Market Ooze (Ward M)</a>
          <a href="personal.html"><span>🧬</span>Your Personal Ooze</a>
          <a href="states.html"><span>🗺</span>State Rankings</a>
          <a href="specimen-progress.html"><span>⏳</span>Specimen Progress</a>
        </div></details>
        <a href="notes.html"${act('notes')}>Lab Notes</a>
      </nav>
      <div class="nav-right">
        <div class="score-wrap">
        <a class="score-chip" href="index.html" title="${LIVE?`Current Ooze Level: ${TODAY_SCORE}/100 (${bandOf(TODAY_SCORE).name}) — ${UPDATED}`:'Sensors offline'}">
          <span class="scj"><i style="height:${Math.max(TODAY_SCORE,4)}%;background:${LIVE?LEVELCOLORS[levelOf(TODAY_SCORE)-1]:'var(--dim)'}"></i></span>
          <b style="color:${LIVE?LEVELCOLORS[levelOf(TODAY_SCORE)-1]:'var(--dim)'}">${LIVE?TODAY_SCORE:'—'}</b>
          <small>${LIVE?bandOf(TODAY_SCORE).name:'OFFLINE'}</small>
        </a>
        ${LIVE?`<div class="score-pop">
          ${Object.entries(LD.lines).map(([slug,l])=>{
            const y=INDICATORS.find(i=>i.slug===slug);
            if(!y)return ''; /* a line the payload knows but this UI doesn't yet — never crash the chrome over it */
            return `<a href="indicator.html?i=${slug}"><span style="display:flex;align-items:center;gap:8px"><span class="njar"><i style="height:${l.stress||0}%;background:${LEVELCOLORS[levelOf(l.stress||0)-1]}"></i></span>${y.name}</span><b>${l.value}</b><span class="sp-d ${l.delta>=0?'up':'down'}">${l.delta>=0?'▲':'▼'}${Math.abs(l.delta)}</span></a>`}).join('')}
          <span class="sp-foot">${LD.monthLabel} reading · ${TODAY_SCORE}/100</span>
        </div>`:''}
        </div>
        <button id="audioBtn" title="Toggle laboratory audio">AUDIO OFF</button>
        <div class="live ${FEED_STATE}" title="${FEED_TITLE}"><i></i>${FEED_LABEL}</div>
        <details class="mnav"><summary aria-label="Open menu">☰</summary>
          <div class="mnav-panel">
            <div class="mnav-h">The Jar</div>
            <a href="index.html"><span>🫙</span>Today's Reading</a>
            <a href="what-is-ooze.html"><span>🌊</span>What is Ooze?</a>
            <div class="mnav-h">Indicators</div>
            ${indLinks}
            <div class="mnav-h">Facility</div>
            <a href="oozeonomics.html"><span>📰</span>Oozeonomics</a>
            <a href="market.html"><span>📊</span>Market Ooze (Ward M)</a>
            <a href="archive.html"><span>🗄</span>Incident Archive</a>
            <a href="personal.html"><span>🧬</span>Your Personal Ooze</a>
            <a href="states.html"><span>🗺</span>State Rankings</a>
            <a href="specimen-progress.html"><span>⏳</span>Specimen Progress</a>
            <a href="notes.html"><span>📋</span>Lab Notes</a>
            <a href="about.html"><span>🪪</span>About</a>
          </div>
        </details>
      </div>
    </div>
  </header>`);
  $('audioBtn').addEventListener('click',e=>{
    audioOn=!audioOn;
    e.target.textContent=audioOn?'AUDIO ON':'AUDIO OFF';
    e.target.classList.toggle('on',audioOn);
    bloop(220);
  });
  setInterval(()=>{ if(audioOn&&Math.random()<.5) bloop(120+Math.random()*90,.05); },5000);
  /* dropdowns close on outside tap — the one behavior details can't do alone */
  document.addEventListener('click',e=>{
    document.querySelectorAll('details.nav-dd[open],details.mnav[open]').forEach(d=>{
      if(!d.contains(e.target))d.removeAttribute('open');
    });
  });
  /* mobile bottom tab bar — app-like reach on every page.
     Active tab follows the renderHeader section key where one maps (so Ward M
     gauge pages light Markets); otherwise a page belongs to NO tab. Directory
     pages ship a <base> tag, root pages never do — without that check an empty
     path tail fell back to index.html and lit the Jar tab falsely. */
  const TAB_BY_KEY={market:'market.html',what:'what-is-ooze.html',archive:'archive.html',personal:'personal.html'};
  const tail=location.pathname.split('/').pop();
  const here=TAB_BY_KEY[active]||(document.querySelector('base')?'':(tail&&tail.endsWith('.html')?tail:'index.html'));
  const tabs=[
    ['index.html','🫙','Jar'],
    ['archive.html','📈','Chart'],
    ['what-is-ooze.html','🌊','Ooze?'],
    ['market.html','📊','Markets'],
    ['personal.html','🧬','My Ooze'],
  ];
  document.body.insertAdjacentHTML('beforeend',`<nav class="tabbar" aria-label="Quick navigation">
    ${tabs.map(([h,ic,l])=>`<a href="${h}"${h===here?' class="active"':''}><span>${ic}</span><small>${l}</small></a>`).join('')}
  </nav>`);
}

function renderFooter(){
  document.getElementById('page').insertAdjacentHTML('beforeend',`
  <footer>
    <div class="wrap">
      <div class="foot-share">
        <span class="fs-label">📎 Leak this file</span>
        <button class="btn" id="fsCopy">Copy link</button>
        <a class="btn" id="fsPost" target="_blank" rel="noopener">Post to X</a>
      </div>
      <div class="foot-grid">
        <div>
          <div class="wordmark" style="margin-bottom:12px">OOZE<em>METER</em></div>
          <p>Watch the economy… before it spills over. A classified facility that accidentally makes economics understandable, built on boring, trustworthy public data.</p>
        </div>
        <div>
          <h4>Intake Lines</h4>
          <ul>${INDICATORS.map(x=>`<li><a href="indicator.html?i=${x.slug}">${x.name}</a></li>`).join('')}</ul>
        </div>
        <div>
          <h4>Facility Map</h4>
          <ul>
            <li><a href="archive.html">Incident Archive</a></li>
            <li><a href="market.html">Market Ooze (Ward M)</a></li>
            <li><a href="personal.html">Personal Ooze</a></li>
            <li><a href="states.html">State Rankings</a></li>
            <li><a href="notes.html">Lab Notes</a></li>
            <li><a href="about.html">About the Facility</a></li>
            <li><a href="policies.html">Policies & Methodology History</a></li>
            <li><a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a></li>
          </ul>
        </div>
        <div>
          <h4>Instrument Calibration</h4>
          <ul>
            <li><a href="https://fred.stlouisfed.org" target="_blank" rel="noopener">FRED — St. Louis Fed</a></li>
            <li><a href="https://www.bls.gov" target="_blank" rel="noopener">Bureau of Labor Statistics</a></li>
            <li><a href="https://www.eia.gov/petroleum/gasdiesel/" target="_blank" rel="noopener">EIA Gasoline Data</a></li>
            <li><a href="https://www.freddiemac.com/pmms" target="_blank" rel="noopener">Freddie Mac PMMS</a></li>
            <li><a href="https://www.newyorkfed.org" target="_blank" rel="noopener">NY Fed — Household Debt</a></li>
          </ul>
        </div>
      </div>
      <p class="disclaimer">OOZEMeter is an educational visualization, not financial advice. National readings use public data under methodology ${LD?.methodologyVersion||'offline'}; state and personal tools remain educational prototypes. This facility is not responsible for lost savings, spilled specimens, or feelings about the housing market. © 2026 OOZEMeter.</p>
    </div>
  </footer>`);
  const fsText=()=>`${document.title} ${location.href.split('?')[0].split('#')[0]}`;
  const fsCopy=document.getElementById('fsCopy');
  fsCopy.addEventListener('click',()=>{
    navigator.clipboard.writeText(fsText()).then(()=>{fsCopy.textContent='Copied ✓';setTimeout(()=>fsCopy.textContent='Copy link',1600)});
    if(typeof gtag==='function')gtag('event','share',{method:'copy',page:location.pathname});
  });
  document.getElementById('fsPost').href='https://twitter.com/intent/tweet?text='+encodeURIComponent(fsText());
}

/* adSlot() removed 2026-08-14: dead code, never called, and the board killed
   the placeholder sponsor unit on 2026-08-02. A mocked-up ad on a facility that
   promises no fake numbers is the wrong first impression to leave lying around. */

/* The Morning Specimen — Buttondown behind the form. To open signups:
   create the Buttondown account, paste its username here, done. Until then
   the form stays honestly closed — no fake clearance, no lost addresses. */
const NL_USER='';
function newsletterHTML(){
  if(!NL_USER)return `
  <div class="newsletter">
    <h3>🧪 The Morning Specimen</h3>
    <p>The Ooze Report by email, when each specimen seals. The facility's mail line isn't connected yet — until it is, the <a href="feed.xml">RSS feed</a> carries every report.</p>
  </div>`;
  return `
  <div class="newsletter">
    <h3>🧪 The Morning Specimen</h3>
    <p>The Ooze Report in your inbox when each specimen seals. Free clearance; leave anytime.</p>
    <form class="nl-form" id="nlForm">
      <input type="email" name="email" required placeholder="your@email.gov" aria-label="Email address">
      <button class="btn primary" type="submit">Request Clearance</button>
    </form>
    <div class="nl-ok" id="nlOk"></div>
  </div>`;
}
function wireNewsletter(){
  const f=$('nlForm');
  if(!f)return;
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    try{
      await fetch(`https://buttondown.com/api/emails/embed-subscribe/${NL_USER}`,
        {method:'POST',mode:'no-cors',body:new FormData(f)});
      f.style.display='none';
      $('nlOk').textContent='✓ Clearance requested — check your inbox to confirm.';
      bloop(300,.1);
    }catch{
      $('nlOk').textContent='⚠ Mail line jammed — try again in a moment.';
    }
  });
}

function wireReveals(){
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.classList.add('in');
    e.target.querySelectorAll('.weight-bar i').forEach(b=>b.style.width=b.dataset.w*4+'%');
    io.unobserve(e.target);
  }),{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}

/* ============ ANALYTICS (GA4, ported from the Tryst playbook) ============ */
/* Inert until GA_ID is set. To activate: create a GA4 property for the site,
   paste the measurement ID (G-XXXXXXXXXX) here, done — loads on every page. */
const GA_ID='';
if(GA_ID&&typeof document!=='undefined'){
  const gs=document.createElement('script');
  gs.async=true;gs.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;
  document.head.appendChild(gs);
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){dataLayer.push(arguments)};
  gtag('js',new Date());gtag('config',GA_ID);
  const ev=(name,params)=>gtag('event',name,params||{});
  const page=location.pathname;
  /* named events by what the visitor clicks — no PII */
  document.addEventListener('click',e=>{
    const a=e.target.closest('a');
    if(a){
      const href=a.getAttribute('href')||'';
      if(/^indicator\.html\?i=/.test(href))ev('indicator_click',{page,line:href.split('=')[1]});
      else if(/^article\.html\?a=/.test(href))ev('article_click',{page,file:href.split('=')[1]});
      else if(/latest\.json/.test(href))ev('raw_data_click',{page});
      else if(/^(notes|archive|specimen-progress)\.html/.test(href))ev('verify_click',{page,to:href.split('.')[0]});
      return;
    }
    if(e.target.closest('#copyBtn'))ev('report_copy',{page});
    if(e.target.closest('.jar'))ev('jar_tap',{page});
  },{passive:true});
  document.addEventListener('submit',e=>{
    if(e.target&&e.target.id==='nlForm')ev('email_signup',{page});
  },true);
}

/* self-checks */
console.assert(INDICATORS.reduce((a,x)=>a+x.contrib,0)===TODAY_SCORE,'contributions drifted from headline score');
console.assert(WEIGHTS.reduce((a,x)=>a+x.w,0)===100,'weights ≠ 100%');
console.assert(STATES.length===50,'need 50 states');
