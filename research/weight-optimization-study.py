#!/usr/bin/env python3
"""Weight-optimization study (constrained): a forward-looking Financial
Conditions component WILL enter the flagship score; 0% is not an option.
Find the optimal weight in {1,2,3,4,5,7.5,10} by maximizing early detection
of genuine household stress while minimizing false positives and preserving
the household-pressure interpretation.

Component designs tested:
  FC-nfci : monthly-mean NFCI -> stress (piecewise anchors)
  FC-fast : max(NFCI stress, VIX stress) -- same max(level, speed) design
            the employment line already uses (UNRATE vs ICSA)

All variants recalibrated per doctrine (calm->10, GFC peak->90) on their own
series.  Baseline = published household-only integers (reproduced exactly).

Metrics per (design, weight):
  EARLY DETECTION (the benefit column)
    - GFC: first month displayed score crosses 40 (SLIPPERY) and 60,
      vs baseline; max and count of integer-point boosts during the
      pre-crisis ramp window 2007-01..2008-08
    - COVID: variant-baseline at 2020-02 (the seal before the claims spike)
      and 2020-03; first month >=40
  FALSE POSITIVES (the cost column)
    - months where variant >= baseline+1 while the baseline household score
      FELL or was flat over the following 12 months (warnings that led
      nowhere), with the calendar clusters named
  INTERPRETATION (the damage column)
    - % of 281 archived integers changed, max |delta|, band-label flips
    - confusion months: |MoM change of variant| >= 2 while |MoM change of
      baseline| <= 0 -- the score moved and no household line explains it
"""
import json,datetime,os,urllib.request
from household_v2_baseline import load_household_v2_baseline

HERE=os.path.dirname(os.path.abspath(__file__))
bt=load_household_v2_baseline()
W=bt['weights'];CAL=bt['calibration']
months=[r['month'] for r in bt['monthly']]
house={r['month']:sum(W[k]*r['stresses'][k] for k in W)/100 for r in bt['monthly']}
pub={r['month']:r['ooze'] for r in bt['monthly']}

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
def interp(anchors,x):
    if x<=anchors[0][0]:return anchors[0][1]
    if x>=anchors[-1][0]:return anchors[-1][1]
    for (x1,y1),(x2,y2) in zip(anchors,anchors[1:]):
        if x1<=x<=x2:return y1+(y2-y1)*(x-x1)/(x2-x1)
NF=[[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]]
VX=[[12,5],[16,20],[20,35],[30,60],[40,80],[60,100]]

print('fetching NFCI + VIX...')
nfci=fred_monthly_mean('NFCI');vix=fred_monthly_mean('VIXCLS')
FC={'FC-nfci':{m:interp(NF,nfci[m]) for m in months if m in nfci},
    'FC-fast':{m:max(interp(NF,nfci[m]),interp(VX,vix[m])) for m in months if m in nfci and m in vix}}

BANDS=[(20,'SMOOTH'),(40,'STICKY'),(60,'SLIPPERY'),(80,'OOZING'),(100,'OVERFLOWING')]
band=lambda s:next(n for mx,n in BANDS if s<=mx)
def addm(m,k):
    y,mo=map(int,m.split('-'));mo+=k
    y+=(mo-1)//12;mo=(mo-1)%12+1
    return f'{y:04d}-{mo:02d}'
def first_cross(sc,thr,f,t):
    for m in sorted(sc):
        if f<=m<=t and sc[m]>=thr:return m
    return '—'

results=[]
for design,mk in FC.items():
    for w in [1,2,3,4,5,7.5,10]:
        raw={m:house[m]*(100-w)/100+(w/100)*mk[m] for m in months if m in mk}
        rc=min(raw.values());rg=max(v for m,v in raw.items() if '2007-01'<=m<='2010-12')
        a=(90-10)/(rg-rc);b=10-a*rc
        sc={m:round(max(0,min(100,a*v+b))) for m,v in raw.items()}
        # benefit: GFC + COVID detection
        gfc40b=first_cross(pub,40,'2006-01','2009-12');gfc40v=first_cross(sc,40,'2006-01','2009-12')
        gfc60b=first_cross(pub,60,'2006-01','2009-12');gfc60v=first_cross(sc,60,'2006-01','2009-12')
        ramp=[sc[m]-pub[m] for m in sc if '2007-01'<=m<='2008-08']
        cvd40b=first_cross(pub,40,'2020-01','2020-12');cvd40v=first_cross(sc,40,'2020-01','2020-12')
        # cost: false positives
        fp=[m for m in sc if addm(m,12) in pub and sc[m]-pub[m]>=1 and pub[addm(m,12)]-pub[m]<=0]
        # damage: churn + confusion
        diffs=[sc[m]-pub[m] for m in sc]
        nch=sum(1 for d in diffs if d)
        bf=sum(1 for m in sc if band(sc[m])!=band(pub[m]))
        conf=[m for m in sc if addm(m,-1) in sc and abs(sc[m]-sc[addm(m,-1)])>=2 and abs(pub[m]-pub[addm(m,-1)])<=0]
        results.append({'design':design,'w':w,
          'gfc40':f'{gfc40b}->{gfc40v}','gfc60':f'{gfc60b}->{gfc60v}',
          'ramp_max':max(ramp),'ramp_boosted':sum(1 for d in ramp if d>=1),
          'covid_feb':sc.get('2020-02',0)-pub.get('2020-02',0),
          'covid_mar':sc.get('2020-03',0)-pub.get('2020-03',0),
          'covid40':f'{cvd40b}->{cvd40v}',
          'fp_months':len(fp),'fp_list':fp,
          'churn_pct':round(nch/len(sc)*100,1),'max_diff':max(abs(d) for d in diffs),
          'band_flips':bf,'confusion':len(conf),'conf_list':conf})

hdr=f"{'design':9}{'w%':>5} | {'GFC cross 40':>17}{'cross 60':>19}{'rampMax':>8}{'ramp≥1':>7} | {'covFeb':>7}{'covMar':>7} | {'FP':>4} | {'churn':>7}{'max':>4}{'bands':>6}{'conf':>5}"
print('\n'+hdr);print('-'*len(hdr))
for r in results:
    print(f"{r['design']:9}{r['w']:>5} | {r['gfc40']:>17}{r['gfc60']:>19}{r['ramp_max']:>8}{r['ramp_boosted']:>7} | "
          f"{r['covid_feb']:>+7}{r['covid_mar']:>+7} | {r['fp_months']:>4} | {r['churn_pct']:>6}%{r['max_diff']:>4}{r['band_flips']:>6}{r['confusion']:>5}")

# name the false-positive clusters at the heaviest weight for each design
for design in FC:
    r=[x for x in results if x['design']==design and x['w']==10][0]
    yrs={}
    for m in r['fp_list']:yrs[m[:4]]=yrs.get(m[:4],0)+1
    print(f"\n{design} @10% false-positive months by year: {dict(sorted(yrs.items()))}")
    if r['conf_list']:print(f"{design} @10% confusion months: {r['conf_list']}")

json.dump(results,open(os.path.join(HERE,'weight-optimization-results.json'),'w'),indent=1)
print('\nwrote research/weight-optimization-results.json')
