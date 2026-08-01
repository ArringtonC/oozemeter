#!/usr/bin/env python3
"""GFC-exclusion sensitivity analysis (advisor's falsifier for the 3% result).

Question: judged ONLY on months outside 2007-01..2010-12, does any weight of
the NFCI Financial Conditions component still earn its keep?

Scoring is identical to the weight study (component blended, doctrine
recalibration on the full record — the GFC anchor is required by the
calibration rule and cannot itself be excluded). Only the EVALUATION
window changes: every metric below ignores 2007-2010.

Ex-GFC metrics per weight:
  benefit — earlier upward band-boundary crossings (20/40/60) vs baseline
            in ex-GFC episodes; COVID Feb/Mar boosts; mean unrounded boost
            during 2022 (the tightening year preceding the 2023-26 household
            drift) and the number of 2022 months visibly boosted >=1
  cost    — ex-GFC false positives, archive churn, band flips, confusion
"""
import json,os,urllib.request
from household_v2_baseline import load_household_v2_baseline

HERE=os.path.dirname(os.path.abspath(__file__))
bt=load_household_v2_baseline()
W=bt['weights']
months=[r['month'] for r in bt['monthly']]
house={r['month']:sum(W[k]*r['stresses'][k] for k in W)/100 for r in bt['monthly']}
pub={r['month']:r['ooze'] for r in bt['monthly']}
GFC=lambda m:'2007-01'<=m<='2010-12'

def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (oozemeter research)'})
    return urllib.request.urlopen(req,timeout=60).read().decode()
rows=fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=NFCI').strip().split('\n')[1:]
acc={}
for r in rows:
    d,v=r.split(',')
    if v in('.',''):continue
    acc.setdefault(d[:7],[]).append(float(v))
nfci={k:sum(v)/len(v) for k,v in acc.items()}
def interp(anchors,x):
    if x<=anchors[0][0]:return anchors[0][1]
    if x>=anchors[-1][0]:return anchors[-1][1]
    for (x1,y1),(x2,y2) in zip(anchors,anchors[1:]):
        if x1<=x<=x2:return y1+(y2-y1)*(x-x1)/(x2-x1)
NF=[[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]]
mk={m:interp(NF,nfci[m]) for m in months if m in nfci}

def addm(m,k):
    y,mo=map(int,m.split('-'));mo+=k
    y+=(mo-1)//12;mo=(mo-1)%12+1
    return f'{y:04d}-{mo:02d}'
BANDS=[(20,'SMOOTH'),(40,'STICKY'),(60,'SLIPPERY'),(80,'OOZING'),(100,'OVERFLOWING')]
band=lambda s:next(n for mx,n in BANDS if s<=mx)

def upward_crossings(sc,thr):
    """months where the series first reaches >=thr after >=3 months below"""
    out=[];below=0
    for m in sorted(sc):
        if sc[m]>=thr:
            if below>=3:out.append(m)
            below=0
        else:below+=1
    return out

print(f"{'w%':>5} | {'earlier crossings ex-GFC':>25}{'covFeb':>8}{'covMar':>8}{'2022 boost':>12}{'2022 vis':>9} | {'FP':>4}{'churn':>8}{'bands':>7}{'conf':>6}")
print('-'*105)
results=[]
for w in [1,2,3,4,5,7.5,10]:
    raw={m:house[m]*(100-w)/100+(w/100)*mk[m] for m in months if m in mk}
    rc=min(raw.values());rg=max(v for m,v in raw.items() if GFC(m))
    a=(90-10)/(rg-rc);b=10-a*rc
    sc={m:round(max(0,min(100,a*v+b))) for m,v in raw.items()}
    ex=[m for m in sc if not GFC(m)]
    # benefit: earlier band crossings outside GFC
    earlier=[]
    for thr in (20,40,60):
        cb=[c for c in upward_crossings({m:pub[m] for m in months},thr) if not GFC(c)]
        cv=[c for c in upward_crossings(sc,thr) if not GFC(c)]
        for c in cv:
            nb=[x for x in cb if abs((int(x[:4])*12+int(x[5:]))-(int(c[:4])*12+int(c[5:])))<=6]
            if nb and c<min(nb):earlier.append(f'{thr}:{c}<{min(nb)}')
    boost22=[a*(raw[m])+b-(a*house[m]+b) for m in sc if m.startswith('2022')]
    vis22=sum(1 for m in sc if m.startswith('2022') and sc[m]-pub[m]>=1)
    fp=[m for m in ex if addm(m,12) in pub and sc[m]-pub[m]>=1 and pub[addm(m,12)]-pub[m]<=0]
    diffs=[sc[m]-pub[m] for m in ex]
    nch=sum(1 for d in diffs if d)
    bf=sum(1 for m in ex if band(sc[m])!=band(pub[m]))
    conf=[m for m in ex if addm(m,-1) in sc and abs(sc[m]-sc[addm(m,-1)])>=2 and abs(pub[m]-pub[addm(m,-1)])<=0]
    row={'w':w,'earlier':earlier,'covFeb':sc.get('2020-02',0)-pub.get('2020-02',0),
         'covMar':sc.get('2020-03',0)-pub.get('2020-03',0),
         'boost22':round(sum(boost22)/len(boost22),2),'vis22':vis22,
         'fp':len(fp),'fp_list':fp,'churn':round(nch/len(ex)*100,1),'bands':bf,'conf':len(conf)}
    results.append(row)
    print(f"{w:>5} | {(', '.join(earlier) or 'NONE'):>25}{row['covFeb']:>+8}{row['covMar']:>+8}{row['boost22']:>+12}{row['vis22']:>9} | {row['fp']:>4}{row['churn']:>7}%{row['bands']:>7}{row['conf']:>6}")

r10=[r for r in results if r['w']==10][0]
print(f"\nFP months ex-GFC @10%: {r10['fp_list']}")
json.dump(results,open(os.path.join(HERE,'gfc-sensitivity-results.json'),'w'),indent=1)
print('wrote research/gfc-sensitivity-results.json')
