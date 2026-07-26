/* ============ OOZEMETER SHARED LAB EQUIPMENT ============ */
/* Live public-data build. Current readings come from data/latest.js; auxiliary
   sensors without an automated feed are labeled as such and never enter Ooze. */

/* LIVE mode: pages load data/latest.js (written by scripts/collect.js) before
   this file; it defines window.LIVE_DATA. Present → real numbers. Absent →
   honest offline state (score 0, sensors offline). No hand-set values. */
const LD = (typeof window!=='undefined' && window.LIVE_DATA) || null;
const LIVE = !!LD;
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

/* stressHist: 0-100 stress readings, yearly 2006 → 2026 (21 points) */
const INDICATORS = [
  {slug:'gas', emoji:'⛽', name:'Gas Prices', val:'$3.42', trend:'▲ +$0.02 today', dir:'up', contrib:7, weight:10,
   spark:[28,30,29,33,31,36,40],
   stressHist:[42,48,72,30,38,55,58,50,46,28,22,26,30,28,18,44,88,60,48,42,40],
   source:{name:'EIA Weekly Retail Gasoline (via FRED)', url:'https://www.eia.gov/petroleum/gasdiesel/'},
   why:`Gasoline is the price everyone sees twice a week, posted in foot-tall numbers on every corner. When it rises, the pain is immediate: commuters, delivery businesses, and family budgets all feel it within days. Economists watch it because fuel costs leak into the price of nearly everything that moves on a truck.`,
   vs2008:`In June 2008, the national average hit $4.11 — a record that, adjusted for inflation, still stings. Combined with the housing collapse, expensive fuel squeezed households from both sides. Today's $3.42 is elevated but nowhere near that intake line's 2008 peak pressure.`,
   faqs:[
     {q:'Why do gas prices rise?', a:'Crude oil is roughly half the pump price, so global oil markets drive most moves. The rest is refining capacity, distribution, taxes, and seasonal demand — summer blends and road-trip season push prices up most years.'},
     {q:'Does the president control gas prices?', a:'Mostly no. Prices are set by global supply and demand. Policy can nudge things at the margins (reserves, permits, taxes), but no administration sets the number on the sign.'},
     {q:'Which states pay the most?', a:'California, Hawaii, and Washington typically top the chart, driven by taxes, special fuel blends, and distance from refineries.'},
   ],
   related:['inflation','manufacturing','housing']},

  {slug:'housing', emoji:'🏠', name:'Housing', val:'6.81%', trend:'▲ 30-yr mortgage rate', dir:'up', contrib:14, weight:20,
   spark:[50,52,55,54,58,60,62],
   stressHist:[55,70,95,80,62,50,40,34,32,30,30,32,34,30,38,52,66,70,64,60,62],
   source:{name:'Freddie Mac PMMS', url:'https://www.freddiemac.com/pmms'},
   why:`Housing is most families' biggest monthly bill and biggest asset at the same time. When mortgage rates climb, affordability collapses for buyers and the whole chain slows: fewer sales, less construction, less spending on everything that fills a house. Housing led the economy into the last great crisis — this intake line gets a thick pipe.`,
   vs2008:`In 2008, this line ruptured. Subprime lending, teaser rates, and speculation sent prices to unsustainable heights; the collapse erased roughly $7 trillion in home equity and triggered a global financial crisis. Today's stress is different — high rates and low affordability, but far stricter lending and much stronger household equity.`,
   faqs:[
     {q:'What makes mortgage rates move?', a:'Mostly the 10-year Treasury yield plus a spread. When investors expect inflation or the Fed holds rates high, Treasury yields rise and mortgages follow.'},
     {q:'Is this like 2008?', a:'The stress source differs. 2008 was a credit-quality crisis — loans that should never have been written. Today is an affordability crisis — solid loans that few can afford to originate. Painful, but structurally safer.'},
     {q:'What is housing affordability?', a:'An index comparing the median family income against the income needed to buy the median home at current rates. Below 100 means the median family can’t afford the median house.'},
   ],
   related:['foreclosures','credit','jobs']},

  {slug:'credit', emoji:'💳', name:'Credit Cards', val:'3.2%', trend:'▲ delinquency, 2-yr high', dir:'up', contrib:13, weight:20,
   spark:[30,34,38,42,48,55,60],
   stressHist:[40,48,70,88,74,58,45,38,32,30,28,30,32,34,26,20,30,45,54,58,60],
   source:{name:'NY Fed Household Debt Report', url:'https://www.newyorkfed.org'},
   why:`Credit card stress is the economy's early-warning smoke detector. Cards are the first bill households skip when budgets crack — before the car payment, long before the mortgage. Rising delinquencies mean millions of kitchen-table budgets are already failing, months before it shows up anywhere else.`,
   vs2008:`Charge-off rates peaked above 10% in 2010 as unemployment destroyed household finances. Today's 3.2% delinquency is a fraction of that — but it has been climbing steadily from pandemic-era lows, which is exactly the kind of trend this facility exists to watch.`,
   faqs:[
     {q:'What is a delinquency?', a:'A payment more than 30 days late. At 90+ days it becomes "seriously delinquent," and when the bank gives up collecting, it becomes a charge-off.'},
     {q:'Why are balances rising?', a:'Inflation raised the cost of essentials while pandemic savings ran out. Many households bridge the gap on cards — at APRs above 21%, the highest on record.'},
     {q:'How much card debt does America carry?', a:'Over $1.1 trillion — an all-time high in nominal terms, though as a share of income it remains below the 2008 peak.'},
   ],
   related:['auto','housing','jobs']},

  {slug:'auto', emoji:'🚗', name:'Auto Loans', val:'7.9%', trend:'▲ average APR', dir:'up', contrib:9, weight:15,
   spark:[40,42,45,44,48,50,52],
   stressHist:[38,44,66,78,60,48,40,36,34,32,32,34,36,34,28,24,36,48,50,52,52],
   source:{name:'NY Fed / Experian', url:'https://www.newyorkfed.org'},
   why:`In most of America, no car means no job. That makes the auto loan the most defended payment in the household budget — families pay the car before the credit card, sometimes before the rent. So when auto delinquencies and repossessions rise, it signals stress that has already burned through every other line of defense.`,
   vs2008:`Repossessions surged past 1.9 million in 2009. Today's numbers are lower, but the average monthly payment on a new car now exceeds $730 — a record — and seven-year loan terms mean many borrowers owe more than the car is worth.`,
   faqs:[
     {q:'Why are car payments so high?', a:'Three compounding forces: vehicle prices jumped ~30% since 2020, interest rates roughly doubled, and buyers stretched to longer terms — which lowers the payment but raises the total cost.'},
     {q:'What is a repossession?', a:'When a lender reclaims the vehicle after missed payments, typically 60–90 days delinquent. It craters the borrower’s credit for years.'},
     {q:'Are EVs affected?', a:'EV depreciation has been unusually steep, leaving some borrowers deeply underwater — a new stress source this facility is monitoring.'},
   ],
   related:['credit','gas','jobs']},

  {slug:'jobs', emoji:'👷', name:'Unemployment', val:'4.4%', trend:'▲ +0.1 pt this month', dir:'up', contrib:15, weight:25,
   spark:[35,36,38,40,44,48,55],
   stressHist:[30,32,55,95,90,75,62,52,44,38,32,28,26,24,98,50,25,25,30,40,48],
   source:{name:'Bureau of Labor Statistics', url:'https://www.bls.gov'},
   why:`Employment is the heaviest-weighted intake line in the facility, and for good reason: a paycheck is the pressure valve for every other indicator. People with jobs pay their mortgages, cards, and car loans. When unemployment climbs, every other jar in the building starts bubbling within months. Recessions are, at their core, employment events.`,
   vs2008:`Unemployment peaked at 10.0% in October 2009 — nearly 15 million Americans out of work — and took over six years to recover. April 2020 was even more violent: 14.8% in a single month. Today's 4.4% is historically low, but the direction of travel is what raises this line's pressure.`,
   faqs:[
     {q:'What counts as unemployed?', a:'You must be jobless, available to work, and actively searching within the last four weeks. Discouraged workers who stopped looking are counted separately — a reason economists watch broader measures like U-6.'},
     {q:'What are initial jobless claims?', a:'The weekly count of new unemployment-benefit filings — the fastest-updating employment signal we have, published every Thursday.'},
     {q:'Why does a small rise matter?', a:'Unemployment has momentum. Historically, once the rate rises half a point off its low (the "Sahm rule"), it has nearly always kept rising into a recession.'},
   ],
   related:['manufacturing','credit','housing']},

  {slug:'inflation', emoji:'📈', name:'Inflation', val:'3.1%', trend:'▼ CPI cooling', dir:'down', contrib:6, weight:10,
   spark:[70,65,60,55,50,45,42],
   stressHist:[40,44,68,20,28,42,36,28,26,18,22,28,30,26,16,55,98,72,48,40,36],
   source:{name:'BLS Consumer Price Index', url:'https://www.bls.gov/cpi'},
   why:`Inflation is the silent leak — it doesn't take your job or your house, it just quietly makes everything you already do more expensive. It hits hardest at the bottom, where groceries and rent consume most of the paycheck. It also drives nearly every other line: the Fed's fight against inflation is why mortgage and auto rates are high.`,
   vs2008:`Mid-2008 saw a 5.6% oil-driven spike, followed by outright deflation during the crash. The modern benchmark is June 2022: 9.1%, the fastest since 1981 — the event that triggered the steepest rate-hiking cycle in four decades, whose pressure still fills several other jars in this facility.`,
   faqs:[
     {q:'What is CPI?', a:'The Consumer Price Index — the average price change of a fixed basket of goods and services a typical urban household buys. The headline inflation number you hear is CPI’s 12-month change.'},
     {q:'What is core inflation?', a:'CPI minus food and energy, whose prices swing wildly. Core shows the underlying trend, which is why the Fed watches it more closely than the headline.'},
     {q:'Is deflation good?', a:'No — falling prices sound nice but usually mean collapsing demand. People delay purchases, companies cut jobs, and the spiral feeds itself. Central banks fear deflation more than moderate inflation.'},
   ],
   related:['gas','housing','credit']},

  {slug:'foreclosures', emoji:'🏦', name:'Mortgage Distress', val:'—', trend:'auxiliary delinquency proxy', dir:'down', contrib:0, weight:0,
   spark:[20,21,20,22,21,22,22],
   stressHist:[35,55,90,98,92,80,62,45,34,28,24,22,20,18,10,8,12,16,18,20,20],
   source:{name:'Federal Reserve Mortgage Delinquency', seriesId:'DRSFRMACBS', url:'https://fred.stlouisfed.org/series/DRSFRMACBS'},
   why:`This auxiliary sensor measures residential mortgage delinquency at commercial banks. It is a mortgage-distress proxy, not a count or rate of foreclosure filings, and it does not add separate weight to the Ooze because mortgage delinquency already informs Housing.`,
   vs2008:`Mortgage delinquency surged during the Global Financial Crisis and confirms severe borrower distress, but it is not interchangeable with foreclosure filings. OOZEMeter keeps that distinction visible instead of presenting the proxy as a direct foreclosure rate.`,
   faqs:[
     {q:'Is this a foreclosure rate?', a:'No. DRSFRMACBS measures delinquent residential mortgages held by commercial banks. It is displayed only as a mortgage-distress proxy.'},
     {q:'Why use a proxy?', a:'A consistent public national foreclosure-filings series is not available through the same open acquisition path. The proxy remains useful when its limits are explicit.'},
     {q:'Does it affect the score twice?', a:'No. Mortgage delinquency informs Housing; this auxiliary file has zero additional weight.'},
   ],
   related:['housing','jobs','credit']},

  {slug:'manufacturing', emoji:'🏭', name:'Manufacturing', val:'—', trend:'auxiliary public-data sensor', dir:'up', contrib:0, weight:0,
   spark:[55,52,50,49,48,49,48],
   stressHist:[40,44,75,85,50,45,48,46,44,52,48,40,44,52,70,30,25,52,56,54,52],
   source:{name:'Federal Reserve Industrial Production', seriesId:'INDPRO', url:'https://fred.stlouisfed.org/series/INDPRO'},
   why:`Factories feel the economy early. OOZEMeter's public-data path uses Federal Reserve industrial production and Census manufacturers' shipments rather than republishing licensed ISM PMI data. This remains an auxiliary sensor with zero score weight until its transformation is frozen and backtested.`,
   vs2008:`Industrial production fell sharply during the Global Financial Crisis. Unlike PMI, INDPRO measures realized output rather than survey expectations, so the two should not be labeled as the same indicator.`,
   faqs:[
     {q:'Is this ISM PMI?', a:'No. The public candidate is Federal Reserve industrial production, with Census manufacturing shipments as context.'},
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

const WEIGHTS = [
  {name:'Employment', w:25},{name:'Housing', w:20},{name:'Credit Cards', w:20},
  {name:'Auto Loans', w:15},{name:'Gas Prices', w:10},{name:'Inflation', w:10},
];

/* Backtested monthly OOZE, 2000 → latest, computed from real FRED data by
   scripts/backtest.js. Calibration (published): calmest 2000-2025 month → 10,
   GFC peak (Jun 2009) → 90. Regenerate by rerunning the script — never hand-edit. */
const HISTORY = [[2000.000,38],[2000.083,40],[2000.167,41],[2000.250,39],[2000.333,41],[2000.417,44],[2000.500,43],[2000.583,43],[2000.667,43],[2000.750,43],[2000.833,46],[2000.917,46],[2001.000,46],[2001.083,50],[2001.167,50],[2001.250,53],[2001.333,55],[2001.417,54],[2001.500,52],[2001.583,51],[2001.667,53],[2001.750,50],[2001.833,47],[2001.917,48],[2002.000,49],[2002.083,49],[2002.167,50],[2002.250,50],[2002.333,49],[2002.417,47],[2002.500,46],[2002.583,46],[2002.667,46],[2002.750,45],[2002.833,44],[2002.917,46],[2003.000,45],[2003.083,47],[2003.167,48],[2003.250,44],[2003.333,42],[2003.417,41],[2003.500,40],[2003.583,43],[2003.667,42],[2003.750,40],[2003.833,38],[2003.917,37],[2004.000,35],[2004.083,36],[2004.167,34],[2004.250,36],[2004.333,39],[2004.417,41],[2004.500,38],[2004.583,36],[2004.667,35],[2004.750,36],[2004.833,37],[2004.917,35],[2005.000,33],[2005.083,31],[2005.167,35],[2005.250,35],[2005.333,33],[2005.417,32],[2005.500,35],[2005.583,37],[2005.667,48],[2005.750,42],[2005.833,34],[2005.917,34],[2006.000,35],[2006.083,34],[2006.167,35],[2006.250,41],[2006.333,46],[2006.417,43],[2006.500,46],[2006.583,44],[2006.667,37],[2006.750,35],[2006.833,35],[2006.917,36],[2007.000,34],[2007.083,36],[2007.167,36],[2007.250,39],[2007.333,39],[2007.417,42],[2007.500,43],[2007.583,42],[2007.667,42],[2007.750,48],[2007.833,52],[2007.917,52],[2008.000,55],[2008.083,55],[2008.167,58],[2008.250,61],[2008.333,62],[2008.417,66],[2008.500,71],[2008.583,72],[2008.667,72],[2008.750,76],[2008.833,71],[2008.917,73],[2009.000,81],[2009.083,84],[2009.167,85],[2009.250,87],[2009.333,88],[2009.417,90],[2009.500,89],[2009.583,88],[2009.667,88],[2009.750,87],[2009.833,82],[2009.917,84],[2010.000,83],[2010.083,82],[2010.167,83],[2010.250,79],[2010.333,77],[2010.417,78],[2010.500,74],[2010.583,75],[2010.667,75],[2010.750,71],[2010.833,73],[2010.917,71],[2011.000,69],[2011.083,68],[2011.167,71],[2011.250,71],[2011.333,72],[2011.417,72],[2011.500,70],[2011.583,70],[2011.667,70],[2011.750,67],[2011.833,66],[2011.917,64],[2012.000,62],[2012.083,62],[2012.167,62],[2012.250,60],[2012.333,60],[2012.417,60],[2012.500,59],[2012.583,59],[2012.667,57],[2012.750,55],[2012.833,55],[2012.917,54],[2013.000,54],[2013.083,53],[2013.167,54],[2013.250,53],[2013.333,52],[2013.417,52],[2013.500,49],[2013.583,49],[2013.667,50],[2013.750,49],[2013.833,46],[2013.917,45],[2014.000,43],[2014.083,45],[2014.167,44],[2014.250,40],[2014.333,41],[2014.417,40],[2014.500,39],[2014.583,38],[2014.667,37],[2014.750,33],[2014.833,33],[2014.917,31],[2015.000,31],[2015.083,30],[2015.167,31],[2015.250,30],[2015.333,32],[2015.417,30],[2015.500,29],[2015.583,28],[2015.667,27],[2015.750,26],[2015.833,24],[2015.917,23],[2016.000,20],[2016.083,19],[2016.167,21],[2016.250,21],[2016.333,21],[2016.417,22],[2016.500,21],[2016.583,21],[2016.667,20],[2016.750,20],[2016.833,18],[2016.917,18],[2017.000,19],[2017.083,19],[2017.167,17],[2017.250,17],[2017.333,17],[2017.417,17],[2017.500,18],[2017.583,17],[2017.667,21],[2017.750,17],[2017.833,18],[2017.917,17],[2018.000,16],[2018.083,16],[2018.167,16],[2018.250,16],[2018.333,17],[2018.417,18],[2018.500,16],[2018.583,16],[2018.667,15],[2018.750,15],[2018.833,14],[2018.917,12],[2019.000,12],[2019.083,12],[2019.167,11],[2019.250,12],[2019.333,13],[2019.417,14],[2019.500,11],[2019.583,11],[2019.667,10],[2019.750,10],[2019.833,11],[2019.917,12],[2020.000,12],[2020.083,10],[2020.167,43],[2020.250,42],[2020.333,42],[2020.417,41],[2020.500,38],[2020.583,37],[2020.667,35],[2020.750,36],[2020.833,35],[2020.917,36],[2021.000,33],[2021.083,33],[2021.167,33],[2021.250,31],[2021.333,29],[2021.417,27],[2021.500,22],[2021.583,21],[2021.667,21],[2021.750,15],[2021.833,12],[2021.917,10],[2022.000,12],[2022.083,12],[2022.167,15],[2022.250,15],[2022.333,17],[2022.417,19],[2022.500,20],[2022.583,17],[2022.667,17],[2022.750,23],[2022.833,22],[2022.917,17],[2023.000,19],[2023.083,20],[2023.167,21],[2023.250,22],[2023.333,22],[2023.417,23],[2023.500,24],[2023.583,28],[2023.667,25],[2023.750,26],[2023.833,24],[2023.917,22],[2024.000,21],[2024.083,23],[2024.167,25],[2024.250,26],[2024.333,26],[2024.417,26],[2024.500,26],[2024.583,23],[2024.667,20],[2024.750,21],[2024.833,23],[2024.917,22],[2025.000,23],[2025.083,23],[2025.167,21],[2025.250,21],[2025.333,22],[2025.417,23],[2025.500,22],[2025.583,22],[2025.667,22],[2025.833,20],[2025.917,19],[2026.000,17],[2026.083,18],[2026.167,22],[2026.250,25],[2026.333,28],[2026.417,25]];
/* real dates; NBER dating for recessions */
const EVENTS = [
  [2000.2,'MAR 10 2000 — Nasdaq peaks at 5,048. The dot-com bubble tops.'],
  [2001.2,'MAR 2001 — Recession begins (NBER). Nasdaq on its way to −78%.'],
  [2001.7,'SEP 11 2001 — Markets close for four days.'],
  [2007.6,'AUG 9 2007 — BNP Paribas freezes funds. The credit crunch begins.'],
  [2008.7,'SEP 15 2008 — Lehman Brothers files. Containment failed.'],
  [2009.8,'OCT 2009 — Unemployment peaks at 10.0%.'],
  [2020.3,'MAR–APR 2020 — 22M jobs lost; 6.87M claims in one week; unemployment 14.8%.'],
  [2022.45,'JUN 2022 — CPI peaks at 9.1%, fastest since 1981.'],
  [2023.2,'MAR 2023 — SVB fails; 3 of the 4 largest U.S. bank failures in weeks.'],
  [2026,'MID-2026 — Latest backtest reading: 25 (STICKY). Daily live collection pending.'],
];
/* Peaks are backtested from real FRED data (scripts/backtest.js), calibrated
   calm→10 / GFC→90. Stamps are data-driven: ≥80 failed, 55–79 stressed, <55 held. */
const INCIDENTS = [
  {year:2001, jump:2001.7,  name:'Dot-Com Bust',            dates:'NBER: Mar – Nov 2001',       stamp:'stressed', label:'Containment Stressed', peak:55, tags:['Tech','Jobs','9/11']},
  {year:2008, jump:2008.7,  name:'Global Financial Crisis', dates:'NBER: Dec 2007 – Jun 2009',  stamp:'failed',   label:'Containment Failed',   peak:90, tags:['Housing','Credit','Bank Failures']},
  {year:2020, jump:2020.3,  name:'COVID-19 Shock',          dates:'NBER: Feb – Apr 2020',       stamp:'held',     label:'Containment Held',     peak:43, tags:['Jobs','Stimulus']},
  {year:2022, jump:2022.45, name:'Inflation Surge',         dates:'CPI peak: Jun 2022',         stamp:'held',     label:'Containment Held',     peak:27, tags:['CPI','Energy','Vibecession']},
  {year:2023, jump:2023.2,  name:'Regional Bank Stress',    dates:'Mar – May 2023',             stamp:'held',     label:'Containment Held',     peak:28, tags:['Banks','Rates']},
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
  INDICATORS.forEach(x=>{x.val='—';x.trend='sensor offline';x.dir='down';x.contrib=0;});
  MOVERS.length=0;
}
function indBySlugRaw(slug){return INDICATORS.find(x=>x.slug===slug)}

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
    if(year>=y1&&year<=y2)return s1+(s2-s1)*(year-y1)/(y2-y1||1);
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
function sparkline(pts){
  const w=100,h=34,max=Math.max(...pts),min=Math.min(...pts);
  const xy=pts.map((p,i)=>`${(i/(pts.length-1)*w).toFixed(1)},${(h-4-((p-min)/(max-min||1))*(h-8)).toFixed(1)}`);
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <polygon class="fillpath" points="0,${h} ${xy.join(' ')} ${w},${h}"/>
    <polyline points="${xy.join(' ')}"/></svg>`;
}
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
        <a href="archive.html"${act('archive')}>Archive</a>
        <details class="nav-dd"><summary>Tools</summary><div class="dd-panel">
          <a href="personal.html"><span>🧬</span>Your Personal Ooze</a>
          <a href="states.html"><span>🗺</span>State Rankings</a>
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
            return `<a href="indicator.html?i=${slug}"><span>${y.emoji} ${y.name}</span><b>${l.value}</b><span class="sp-d ${l.delta>=0?'up':'down'}">${l.delta>=0?'▲':'▼'}${Math.abs(l.delta)}</span></a>`}).join('')}
          <span class="sp-foot">${LD.monthLabel} reading · ${TODAY_SCORE}/100</span>
        </div>`:''}
        </div>
        <button id="audioBtn" title="Toggle laboratory audio">AUDIO OFF</button>
        <div class="live" title="Laboratory feed"><i></i>LIVE</div>
        <details class="mnav"><summary aria-label="Open menu">☰</summary>
          <div class="mnav-panel">
            <div class="mnav-h">The Jar</div>
            <a href="index.html"><span>🫙</span>Today's Reading</a>
            <a href="what-is-ooze.html"><span>🌊</span>What is Ooze?</a>
            <div class="mnav-h">Indicators</div>
            ${indLinks}
            <div class="mnav-h">Facility</div>
            <a href="oozeonomics.html"><span>📰</span>Oozeonomics</a>
            <a href="archive.html"><span>🗄</span>Incident Archive</a>
            <a href="personal.html"><span>🧬</span>Your Personal Ooze</a>
            <a href="states.html"><span>🗺</span>State Rankings</a>
            <a href="notes.html"><span>📋</span>Lab Notes</a>
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
  /* mobile bottom tab bar — app-like reach on every page */
  const here=location.pathname.split('/').pop()||'index.html';
  const tabs=[
    ['index.html','🫙','Jar'],
    ['archive.html','📈','Chart'],
    ['what-is-ooze.html','🌊','Ooze?'],
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
            <li><a href="personal.html">Personal Ooze</a></li>
            <li><a href="states.html">State Rankings</a></li>
            <li><a href="notes.html">Lab Notes</a></li>
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
}

function adSlot(){
  return `<div class="ad-wrap"><div class="ad-slot">Advertisement — sponsor's beaker here</div></div>`;
}

function newsletterHTML(){
  return `
  <div class="newsletter">
    <h3>🧪 The Morning Specimen</h3>
    <p>Today's ooze level, the biggest leaks, and one thing worth knowing — collected daily at 08:00 ET. Free clearance.</p>
    <form class="nl-form" id="nlForm">
      <input type="email" required placeholder="your@email.gov" aria-label="Email address">
      <button class="btn primary" type="submit">Request Clearance</button>
    </form>
    <div class="nl-ok" id="nlOk"></div>
  </div>`;
}
function wireNewsletter(){
  const f=$('nlForm');
  if(!f)return;
  f.addEventListener('submit',e=>{
    e.preventDefault();
    /* ponytail: no backend yet — stores locally; swap for a real ESP later */
    localStorage.setItem('oozeletter',f.querySelector('input').value);
    f.style.display='none';
    $('nlOk').textContent='✓ Clearance granted — first specimen arrives tomorrow, 08:00 ET.';
    bloop(300,.1);
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

/* self-checks */
console.assert(Math.abs(INDICATORS.reduce((a,x)=>a+x.contrib,0)-TODAY_SCORE)<=3,'contributions drifted from headline score');
console.assert(WEIGHTS.reduce((a,x)=>a+x.w,0)===100,'weights ≠ 100%');
console.assert(STATES.length===50,'need 50 states');
console.assert(INDICATORS.every(x=>x.stressHist.length===21),'stressHist must span 2006–2026');
