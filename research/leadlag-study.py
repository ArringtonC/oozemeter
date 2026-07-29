#!/usr/bin/env python3
"""Lead-lag study: does a market signal LEAD the household composite in
OOZEMeter's own record (2003-2026)?  Plus the advisor's weight grid (0.5-5%).

Tests the operator's claim directly: "our numbers are lagging data, the
stock market is a leading indicator."

Market candidates: SPX drawdown stress (Yahoo, research-only) and NFCI
stress (Chicago Fed via FRED).  Household composite: the raw weighted
score from research/backtest-results.json.

corr(market_t, household_{t+k}) for k in -12..+12 months.
k > 0  →  market today correlates with household stress k months LATER
          (market LEADS).  Peak location answers the question.
Also: 6-month differences (removes the slow GFC hump), an event check on
every major drawdown episode, and the 0.5-5% weight grid.
"""
import json,datetime,math,os,urllib.request

HERE=os.path.dirname(os.path.abspath(__file__))
bt=json.load(open(os.path.join(HERE,'backtest-results.json')))
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
def spx_monthly():
    j=json.loads(fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=1009843200&period2=1785283200&interval=1mo'))
    r=j['chart']['result'][0];out={}
    for ts,c in zip(r['timestamp'],r['indicators']['quote'][0]['close']):
        if c is not None:out[datetime.datetime.fromtimestamp(ts,datetime.UTC).strftime('%Y-%m')]=c
    return out
def interp(anchors,x):
    if x<=anchors[0][0]:return anchors[0][1]
    if x>=anchors[-1][0]:return anchors[-1][1]
    for (x1,y1),(x2,y2) in zip(anchors,anchors[1:]):
        if x1<=x<=x2:return y1+(y2-y1)*(x-x1)/(x2-x1)
DD=[[0,5],[5,15],[10,30],[20,55],[30,72],[40,85],[50,95],[60,100]]
NF=[[-0.7,5],[-0.4,15],[-0.15,30],[0,40],[0.3,55],[0.8,70],[1.5,85],[3,100]]

print('fetching...')
spx=spx_monthly();nfci=fred_monthly_mean('NFCI')
dd={};peak=0
for m in sorted(spx):
    peak=max(peak,spx[m]);dd[m]=(peak-spx[m])/peak*100
mkt={'SPX drawdown':{m:interp(DD,dd[m]) for m in months if m in dd},
     'NFCI':{m:interp(NF,nfci[m]) for m in months if m in nfci}}

def corr(xs,ys):
    n=len(xs);mx=sum(xs)/n;my=sum(ys)/n
    sx=math.sqrt(sum((x-mx)**2 for x in xs));sy=math.sqrt(sum((y-my)**2 for y in ys))
    return sum((x-mx)*(y-my) for x,y in zip(xs,ys))/(sx*sy) if sx and sy else 0

def addm(m,k):
    y,mo=map(int,m.split('-'));mo+=k
    y+=(mo-1)//12;mo=(mo-1)%12+1
    return f'{y:04d}-{mo:02d}'

def leadlag(series,transform=None):
    hh=dict(house)
    ss=dict(series)
    if transform=='diff6':
        hh={m:house[m]-house[addm(m,-6)] for m in months if addm(m,-6) in house}
        ss={m:series[m]-series[addm(m,-6)] for m in series if addm(m,-6) in series}
    out={}
    for k in range(-12,13):
        pairs=[(ss[m],hh[addm(m,k)]) for m in ss if addm(m,k) in hh]
        if len(pairs)>30:out[k]=round(corr([p[0] for p in pairs],[p[1] for p in pairs]),3)
    return out

for name,s in mkt.items():
    for tr,label in [(None,'levels'),('diff6','6-mo changes')]:
        ll=leadlag(s,tr)
        best=max(ll,key=lambda k:ll[k])
        line=' '.join(f'{k:+d}:{ll[k]:.2f}' for k in [-12,-6,-3,-1,0,1,3,6,9,12] if k in ll)
        print(f'{name:14}{label:14} peak corr {ll[best]:.3f} at k={best:+d}   [{line}]')
print('  (k>0 means the market signal leads the household composite by k months)')

# event check: every month a NEW >=15% drawdown regime began → household composite 12m later
print('\ndrawdown episodes (monthly-close dd first crossing 15%):')
prev=0;events=[]
for m in sorted(dd):
    if m<months[0] or m>months[-1]:prev=dd[m];continue
    if dd[m]>=15 and prev<15:events.append(m)
    prev=dd[m]
for e in events:
    h0=house.get(e);h12=house.get(addm(e,12))
    if h0 is None or h12 is None:continue
    print(f'  {e}: dd hit 15% · household raw {h0:.0f} → 12mo later {h12:.0f} ({h12-h0:+.0f})  displayed {pub.get(e)}→{pub.get(addm(e,12))}')

# advisor weight grid: NFCI at 0.5-5%, recalibrated per doctrine
print('\nweight grid (NFCI component, doctrine recalibration):')
print(f"{'w':>5}{'chg':>6}{'%':>7}{'max|Δ|':>8}{'bands':>7}   GFC COVID 2022")
BANDS=[(20,'SM'),(40,'ST'),(60,'SL'),(80,'OO'),(100,'OV')]
band=lambda s:next(n for mx,n in BANDS if s<=mx)
mk=mkt['NFCI']
for w in [0.5,1,2,3,4,5]:
    raw={m:house[m]*(100-w)/100+(w/100)*mk[m] for m in months if m in mk}
    rc=min(raw.values());rg=max(v for m,v in raw.items() if '2007-01'<=m<='2010-12')
    a=(90-10)/(rg-rc);b=10-a*rc
    sc={m:round(max(0,min(100,a*v+b))) for m,v in raw.items()}
    diffs=[sc[m]-pub[m] for m in sc]
    nch=sum(1 for d in diffs if d)
    bf=sum(1 for m in sc if band(sc[m])!=band(pub[m]))
    pk=lambda f,t:max(v for m,v in sc.items() if f<=m<=t)
    print(f'{w:>5}{nch:>6}{nch/len(sc)*100:>6.1f}%{max(abs(d) for d in diffs):>8}{bf:>7}   {pk("2007-01","2010-12")}  {pk("2020-01","2020-12")}   {pk("2022-01","2022-12")}')
print(f'  (baseline peaks: GFC 90 · COVID 41 · 2022 24 · archive = {len(months)} months)')
