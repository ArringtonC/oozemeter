#!/usr/bin/env python3
"""Shadow-model experiment: what would a market signal do to the Ooze score?

Reads the frozen household backtest (research/backtest-results.json) and joins
three RESEARCH-ONLY market series (none touch production):
  - S&P 500 monthly closes  (Yahoo Finance chart API — unofficial, research only)
  - VIXCLS monthly mean     (FRED keyless CSV)
  - NFCI monthly mean       (FRED keyless CSV, Chicago Fed)

Variants (incumbent weights scaled to keep the sum at 100):
  V0  baseline (verifies this script reproduces the published integers)
  V1  +0.5% S&P 500 drawdown stress      (the boss's proposal)
  V2  +5%   S&P 500 drawdown stress      (what a *visible* equity weight does)
  V3  +5%   VIX market-stress signal
  V4  +5%   NFCI financial-conditions signal

Each variant is scored two ways:
  frozen  — keep production calibration constants (isolates the additive effect)
  recal   — re-derive calm→10 / GFC→90 on the variant's own series
            (what the calibration doctrine actually requires; shows how far the
             archive would be rewritten)

Run: python3 research/market-shadow-experiment.py
Writes research/market-shadow-results.json and prints the summary tables.
"""
import json,csv,urllib.request,datetime,statistics,os

HERE=os.path.dirname(os.path.abspath(__file__))
bt=json.load(open(os.path.join(HERE,'backtest-results.json')))
CAL=bt['calibration']; W=bt['weights']; MONTHLY=bt['monthly']

def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (oozemeter research)'})
    return urllib.request.urlopen(req,timeout=60).read().decode()

def fred_monthly_mean(series):
    rows=fetch(f'https://fred.stlouisfed.org/graph/fredgraph.csv?id={series}').strip().split('\n')[1:]
    acc={}
    for r in rows:
        d,v=r.split(',')
        if v in('.',''):continue
        acc.setdefault(d[:7],[]).append(float(v))
    return {k:sum(v)/len(v) for k,v in acc.items()}

def spx_monthly():
    j=json.loads(fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC'
                       '?period1=1009843200&period2=1785283200&interval=1mo'))
    r=j['chart']['result'][0]
    out={}
    for ts,c in zip(r['timestamp'],r['indicators']['quote'][0]['close']):
        if c is None:continue
        out[datetime.datetime.fromtimestamp(ts,datetime.UTC).strftime('%Y-%m')]=c
    return out

def interp(anchors,x):
    if x<=anchors[0][0]:return anchors[0][1]
    if x>=anchors[-1][0]:return anchors[-1][1]
    for (x1,y1),(x2,y2) in zip(anchors,anchors[1:]):
        if x1<=x<=x2:return y1+(y2-y1)*(x-x1)/(x2-x1)
    return 0

# market transforms → 0-100 stress (research anchors, same piecewise style)
DD_ANCHORS  =[[0,5],[5,15],[10,30],[20,55],[30,72],[40,85],[50,95],[60,100]]
VIX_ANCHORS =[[12,5],[16,20],[20,35],[30,60],[40,80],[60,100]]
NFCI_ANCHORS=[[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]]

print('fetching market series (research only)...')
spx=spx_monthly(); vix=fred_monthly_mean('VIXCLS'); nfci=fred_monthly_mean('NFCI')

# S&P drawdown from running peak of monthly closes
dd={};peak=0
for m in sorted(spx):
    peak=max(peak,spx[m]); dd[m]=(peak-spx[m])/peak*100

BANDS=[(20,'SMOOTH'),(40,'STICKY'),(60,'SLIPPERY'),(80,'OOZING'),(100,'OVERFLOWING')]
band=lambda s:next(n for m,n in BANDS if s<=m)
clamp=lambda x:max(0,min(100,x))

months=[r['month'] for r in MONTHLY]
raw_house={r['month']:sum(W[k]*r['stresses'][k] for k in W)/100 for r in MONTHLY}
published={r['month']:r['ooze'] for r in MONTHLY}

def series_for(kind):
    if kind=='dd':  return {m:interp(DD_ANCHORS,dd[m]) for m in months if m in dd}
    if kind=='vix': return {m:interp(VIX_ANCHORS,vix[m]) for m in months if m in vix}
    if kind=='nfci':return {m:interp(NFCI_ANCHORS,nfci[m]) for m in months if m in nfci}

def run_variant(name,kind,w):
    mk=series_for(kind) if kind else {}
    raw={}
    for m in months:
        if kind and m not in mk:continue
        h=raw_house[m]*(100-w)/100
        raw[m]=h+(w/100)*mk[m] if kind else raw_house[m]
    # frozen production calibration
    frozen={m:round(clamp(CAL['a']*v+CAL['b'])) for m,v in raw.items()}
    # doctrine recalibration on the variant's own series
    vals=list(raw.values())
    rc=min(vals); rg=max(v for m,v in raw.items() if '2007-01'<=m<='2010-12')
    a=(90-10)/(rg-rc); b=10-a*rc
    recal={m:round(clamp(a*v+b)) for m,v in raw.items()}
    return {'name':name,'kind':kind,'w':w,'raw':raw,'frozen':frozen,'recal':recal,
            'recal_constants':{'a':a,'b':b,'rawCalm':rc,'rawGfc':rg},'mkstress':mk}

variants=[run_variant('V0 baseline',None,0),
          run_variant('V1 +0.5% SPX drawdown','dd',0.5),
          run_variant('V2 +5% SPX drawdown','dd',5),
          run_variant('V3 +5% VIX stress','vix',5),
          run_variant('V4 +5% NFCI conditions','nfci',5)]

v0=variants[0]
assert all(v0['frozen'][m]==published[m] for m in months), 'baseline fails to reproduce published scores'
print(f'baseline reproduces all {len(months)} published integers exactly\n')

EPISODES=[('GFC','2007-01','2010-12'),('COVID','2020-01','2020-12'),
          ('2022 inflation+bear','2022-01','2022-12'),('Bank stress 2023','2023-01','2023-12')]

def peak(scored,f,t):
    xs=[(m,s) for m,s in scored.items() if f<=m<=t]
    return max(xs,key=lambda x:x[1]) if xs else ('—',0)

summary=[]
for v in variants[1:]:
    for mode in('frozen','recal'):
        s=v[mode]; base=v0['frozen']
        common=[m for m in s if m in base]
        diffs=[s[m]-base[m] for m in common]
        nchanged=sum(1 for d in diffs if d!=0)
        bandflips=sum(1 for m in common if band(s[m])!=band(base[m]))
        row={'variant':v['name'],'mode':mode,
             'months':len(common),
             'integer_changed':nchanged,
             'pct_changed':round(nchanged/len(common)*100,1),
             'max_abs_diff':max(abs(d) for d in diffs),
             'mean_abs_diff':round(statistics.mean(abs(d) for d in diffs),2),
             'band_label_flips':bandflips,
             'episode_peaks':{n:{'base':peak(base,f,t)[1],'variant':peak(s,f,t)[1]} for n,f,t in EPISODES}}
        summary.append(row)

# divergence census: market screams / households calm, and the reverse
mk=variants[2]['mkstress']  # SPX drawdown stress
housearn={m:published[m] for m in months}
div_market_only=[m for m in months if m in mk and mk[m]>=55 and housearn[m]<=30]
div_house_only=[m for m in months if m in mk and mk[m]<=15 and housearn[m]>=35]

# §5 scenario math at the latest month, w=0.5 frozen calibration
last=months[-1]
h=raw_house[last]
def scen(mkstress,w=0.5):
    rawv=h*(100-w)/100+(w/100)*mkstress
    return CAL['a']*rawv+CAL['b']
cur=CAL['a']*h+CAL['b']
scenarios={
  'current unrounded score':round(cur,2),
  'S&P +10% (dd 0, stress 5)':round(scen(5),2),
  'S&P -10% (dd 10, stress 30)':round(scen(30),2),
  'S&P -35% + VIX spike (stress 90)':round(scen(90),2),
  'max possible (stress 100)':round(scen(100),2),
  'w=0.5 max displayed swing (pts)':round(CAL['a']*0.5,2),
}

print(f"{'variant':30}{'mode':8}{'chg':>5}{'%':>6}{'max|Δ|':>7}{'mean':>6}{'bands':>6}")
for r in summary:
    print(f"{r['variant']:30}{r['mode']:8}{r['integer_changed']:>5}{r['pct_changed']:>6}{r['max_abs_diff']:>7}{r['mean_abs_diff']:>6}{r['band_label_flips']:>6}")
print('\nepisode peaks (base → variant):')
for r in summary:
    e=r['episode_peaks']
    print(f"  {r['variant']:28}{r['mode']:8}"+'  '.join(f"{n}:{d['base']}→{d['variant']}" for n,d in e.items()))
print(f"\ndivergence census (SPX-drawdown stress vs published score):")
print(f"  market stressed (≥55) while households calm (≤30): {len(div_market_only)} months  {div_market_only[:8]}{'...' if len(div_market_only)>8 else ''}")
print(f"  market at highs (≤15) while households stressed (≥35): {len(div_house_only)} months  {div_house_only[:8]}{'...' if len(div_house_only)>8 else ''}")
print('\n§5 scenarios at',last,f'(household raw {h:.2f}, displayed {published[last]}):')
for k,vv in scenarios.items():print(f'  {k}: {vv}')

json.dump({'generated':datetime.datetime.now(datetime.UTC).isoformat(),
           'note':'research only — SPX via Yahoo (unofficial), VIX/NFCI via FRED keyless CSV',
           'anchors':{'dd':DD_ANCHORS,'vix':VIX_ANCHORS,'nfci':NFCI_ANCHORS},
           'summary':summary,'scenarios':scenarios,
           'divergence':{'market_only':div_market_only,'house_only':div_house_only},
           'recal_constants':{v['name']:v['recal_constants'] for v in variants[1:]}},
          open(os.path.join(HERE,'market-shadow-results.json'),'w'),indent=1)
print('\nwrote research/market-shadow-results.json')
