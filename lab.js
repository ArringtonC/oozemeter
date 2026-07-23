/* ============ OOZEMETER SHARED LAB EQUIPMENT ============ */
/* Demo build: all figures illustrative. Real feeds (FRED/BLS/AAA) come later. */

const TODAY_SCORE = 67, YESTERDAY = 64;
const UPDATED = 'Jul 23, 2026 · 08:00 ET';

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
   source:{name:'AAA National Average', url:'https://gasprices.aaa.com'},
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

  {slug:'foreclosures', emoji:'🏦', name:'Foreclosures', val:'0.26%', trend:'— flat monthly rate', dir:'down', contrib:2, weight:0,
   spark:[20,21,20,22,21,22,22],
   stressHist:[35,55,90,98,92,80,62,45,34,28,24,22,20,18,10,8,12,16,18,20,20],
   source:{name:'ATTOM Data', url:'https://www.attomdata.com'},
   why:`Foreclosure is the terminal stage of household financial failure — every foreclosure represents a family that exhausted every option. The rate is a lagging indicator (it takes months of missed payments to reach a filing), but when it moves, it confirms that stress elsewhere in the facility was real, not noise.`,
   vs2008:`This was 2008's signature catastrophe: 2.9 million filings in 2010 alone, entire neighborhoods emptied, "REO" and "short sale" entering the national vocabulary. Today's rate is near historic lows — strict post-2008 lending plus massive home equity mean owners in trouble can usually sell rather than default.`,
   faqs:[
     {q:'What is a foreclosure?', a:'The legal process where a lender takes back a home after sustained non-payment, typically beginning after 120 days of delinquency.'},
     {q:'Why are foreclosures so low despite high rates?', a:'Two shields: most owners hold sub-4% mortgages from the refinancing wave, and record equity means distressed owners can sell at a profit instead of defaulting.'},
     {q:'What would change that?', a:'A serious rise in unemployment. Foreclosures follow job losses with a lag of roughly 6–12 months — which is why this facility weights employment so heavily.'},
   ],
   related:['housing','jobs','credit']},

  {slug:'manufacturing', emoji:'🏭', name:'Manufacturing', val:'48.7', trend:'▼ PMI contracting', dir:'up', contrib:1, weight:0,
   spark:[55,52,50,49,48,49,48],
   stressHist:[40,44,75,85,50,45,48,46,44,52,48,40,44,52,70,30,25,52,56,54,52],
   source:{name:'ISM Manufacturing PMI', url:'https://www.ismworld.org'},
   why:`Factories feel the economy first. Orders get cancelled before workers get laid off, which makes the Purchasing Managers' Index (PMI) one of the best leading indicators available: below 50 means the factory sector is shrinking. It's a small pipe into the jar, but it often starts flowing before the big ones.`,
   vs2008:`PMI cratered to 33.1 in December 2008 — the deepest factory contraction since 1980 — months after the housing lines had already ruptured. Today's 48.7 signals mild contraction: not an emergency, but the kind of low-grade pressure worth logging.`,
   faqs:[
     {q:'What is PMI?', a:'A monthly survey of purchasing managers on orders, production, employment, and deliveries. Above 50 = expansion, below 50 = contraction. It’s fast, forward-looking, and rarely revised.'},
     {q:'Does manufacturing still matter?', a:'It’s ~11% of GDP but punches far above that weight in cyclical signal — factory orders swing early and hard, making them a preview of the broader economy.'},
     {q:'What is industrial production?', a:'The Fed’s measure of actual physical output from factories, mines, and utilities — the "what happened" to PMI’s "what’s coming."'},
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

const HISTORY = [
  [2000,38],[2001,52],[2002,46],[2003,35],[2005,30],[2007,48],[2008,98],[2009,86],
  [2010,72],[2011,60],[2013,44],[2015,32],[2017,25],[2019,28],[2020,96],[2021,45],
  [2022,71],[2023,50],[2024,52],[2025,60],[2026,TODAY_SCORE],
];
const EVENTS = [
  [2001,'DOT-COM BUST — Nasdaq loses 78% from peak. The jar gets sticky.'],
  [2008,'LEHMAN BROTHERS COLLAPSES — Containment failed. The jar overflows.'],
  [2020,'COVID-19 SHOCK — 22M jobs lost in two months. Overflow, again.'],
  [2022,'INFLATION SURGE — CPI peaks at 9.1%, fastest since 1981.'],
  [2026,'TODAY — Elevated stress, below recession territory.'],
];
const INCIDENTS = [
  {year:2001, name:'Dot-Com Bust',            stamp:'held',     label:'Containment Held',     peak:52, tags:['Tech','Jobs']},
  {year:2008, name:'Global Financial Crisis', stamp:'failed',   label:'Containment Failed',   peak:98, tags:['Housing','Credit','Bank Failures']},
  {year:2020, name:'COVID-19 Shock',          stamp:'failed',   label:'Containment Failed',   peak:96, tags:['Jobs','Shutdowns']},
  {year:2022, name:'Inflation Surge',         stamp:'stressed', label:'Containment Stressed', peak:71, tags:['CPI','Energy']},
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

/* ============ HELPERS ============ */
const $=id=>document.getElementById(id);
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
    <text x="${pad}" y="${Y(g)-4}" fill="#5c6e50" font-size="9">${g}</text>`).join('');
  const band=(a,b,label)=>`<rect x="${X(a)}" y="${Y(100)}" width="${X(b)-X(a)}" height="${h-44}" fill="rgba(255,77,61,.07)"/>
    <text x="${X(a)+3}" y="${Y(100)+11}" fill="rgba(255,77,61,.7)" font-size="8" letter-spacing="1">${label}</text>`;
  const years=[2006,2011,2016,2021,2026].map(yr=>
    `<text x="${X(yr)}" y="${h-8}" fill="#5c6e50" font-size="9" text-anchor="middle">${yr}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="20-year stress history chart">
    ${grid}${band(2007.8,2009.5,'GFC')}${band(2020,2020.8,'COVID')}
    <polygon points="${X(y0)},${Y(0)} ${xy.join(' ')} ${X(y1)},${Y(0)}" fill="rgba(163,255,18,.08)"/>
    <polyline points="${xy.join(' ')}" fill="none" stroke="#a3ff12" stroke-width="1.8"/>
    <circle cx="${X(y1)}" cy="${Y(hist[hist.length-1])}" r="4" fill="#a3ff12"/>
    ${years}</svg>`;
}

/* ============ SHARED CHROME ============ */
function renderHeader(active){
  const links=[
    ['index.html#pressure','Pressure Sources','pressure'],
    ['archive.html','Incident Archive','archive'],
    ['personal.html','Your Ooze','personal'],
    ['states.html','State Rankings','states'],
    ['notes.html','Lab Notes','notes'],
  ];
  document.body.insertAdjacentHTML('afterbegin',`
  <div id="alarmWash"></div>
  <div id="pageDrips"><i></i><i></i><i></i></div>`);
  document.getElementById('page').insertAdjacentHTML('afterbegin',`
  <header>
    <div class="wrap nav">
      <a class="brand" href="index.html" style="text-decoration:none">
        <div class="wordmark">OOZE<em>METER</em></div>
        <div class="division">Division of Economic Containment</div>
      </a>
      <nav class="nav-links">
        ${links.map(([h,t,k])=>`<a href="${h}"${k===active?' class="active"':''}>${t}</a>`).join('')}
      </nav>
      <div class="nav-right">
        <button id="audioBtn" title="Toggle laboratory audio">AUDIO OFF</button>
        <div class="live"><i></i>LABORATORY FEED</div>
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
            <li><a href="https://gasprices.aaa.com" target="_blank" rel="noopener">AAA Gas Prices</a></li>
            <li><a href="https://www.freddiemac.com/pmms" target="_blank" rel="noopener">Freddie Mac PMMS</a></li>
            <li><a href="https://www.newyorkfed.org" target="_blank" rel="noopener">NY Fed — Household Debt</a></li>
          </ul>
        </div>
      </div>
      <p class="disclaimer">OOZEMeter is an educational visualization, not financial advice. This facility is not responsible for lost savings, spilled specimens, or feelings about the housing market. Demo build — figures are illustrative. © 2026 OOZEMeter.</p>
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
console.assert(INDICATORS.reduce((a,x)=>a+x.contrib,0)===TODAY_SCORE,'contributions ≠ headline score');
console.assert(WEIGHTS.reduce((a,x)=>a+x.w,0)===100,'weights ≠ 100%');
console.assert(STATES.length===50,'need 50 states');
console.assert(INDICATORS.every(x=>x.stressHist.length===21),'stressHist must span 2006–2026');
