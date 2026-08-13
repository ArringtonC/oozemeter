#!/usr/bin/env node
/* THE FLOW — historical replay, June–September 2007 and the full record.
   Proposed architecture only. Nothing here touches the published score.

   ONE FIXED RULE, declared before looking at 2007, applied to all 23 years:
     signal   = 4-week change in the instrument
     baseline = mean/sd of 4-week changes over the trailing 104 weeks (prior data only)
     z        = (signal - mean) / sd
     HORN     when |z| >= 3

   The rule is weight-free by construction: it asks how unusual a move is FOR THAT
   INSTRUMENT, with no reference to the instrument's weight in the jar. That is the
   point — a 3% weight is the right answer for the level and the wrong question
   for the flow.

   Usage:  node research/flow-replay-2007.js
   Data:   FRED NFCI (cached to /tmp by the caller) + research/backtest-results.json
*/
const fs = require('fs');
const path = require('path');

const WINDOW = 4;      // change window, weeks
const LOOKBACK = 104;  // trailing volatility window, weeks
const Z = 3;           // horn threshold
const CONFIRM_PTS = 3; // jar must rise this much to count as confirmation
const CONFIRM_MO = 6;  // ...within this many months

const nfciPath = process.env.NFCI_CSV || '/tmp/nfci.csv';
if (!fs.existsSync(nfciPath)) {
  console.error('need NFCI csv at ' + nfciPath);
  console.error('  curl -s "https://fred.stlouisfed.org/graph/fredgraph.csv?id=NFCI" -o /tmp/nfci.csv');
  process.exit(1);
}

const rows = fs.readFileSync(nfciPath, 'utf8').trim().split('\n').slice(1)
  .map(l => l.split(',')).filter(r => r[1] && r[1] !== '.').map(r => [r[0], +r[1]]);

/* --- the fixed rule --- */
const ch = rows.map((r, i) => i < WINDOW ? null : {d: r[0], raw: r[1], v: r[1] - rows[i-WINDOW][1]}).filter(Boolean);
const flow = [];
for (let i = LOOKBACK; i < ch.length; i++) {
  const w = ch.slice(i - LOOKBACK, i).map(x => x.v);          // prior data only — no lookahead
  const m = w.reduce((a, b) => a + b, 0) / w.length;
  const sd = Math.sqrt(w.reduce((a, b) => a + (b - m) ** 2, 0) / w.length);
  const z = sd > 0 ? (ch[i].v - m) / sd : 0;
  flow.push({d: ch[i].d, raw: ch[i].raw, v: ch[i].v, z,
    state: Math.abs(z) >= Z ? 'HORN' : Math.abs(z) >= 2 ? 'BUILDING' : 'QUIET'});
}

const jar = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'backtest-results.json'), 'utf8'));
const byMonth = new Map(jar.monthly.map(m => [m.month, m]));
const mo = d => d.slice(0, 7);

console.log('THE FLOW — historical replay');
console.log('rule: ' + WINDOW + 'wk change / ' + LOOKBACK + 'wk trailing vol, horn at |z| >= ' + Z);
console.log('='.repeat(78));

/* ---------- 1. the 2007 replay, week by week ---------- */
console.log('\n1. JUNE - SEPTEMBER 2007, WEEK BY WEEK\n');
console.log('  week        NFCI    4wk chg      z    FLOW');
for (const f of flow.filter(x => x.d >= '2007-06-01' && x.d <= '2007-10-05')) {
  const mark = f.state === 'HORN' ? '  <<< HORN' : '';
  console.log('  ' + f.d + '  ' + f.raw.toFixed(3).padStart(7) + '  ' +
    (f.v >= 0 ? '+' : '') + f.v.toFixed(3).padStart(7) + '  ' +
    f.z.toFixed(2).padStart(6) + '  ' + f.state.padEnd(9) + mark);
}

/* ---------- 2. the monthly sheet ---------- */
console.log('\n2. THE MONTHLY SHEET — level, flow, verification\n');
const first = flow.find(x => x.state === 'HORN' && x.d >= '2007-01-01');
const jarAtHorn = byMonth.get(mo(first.d)).ooze;

console.log('  month     LEVEL  financial  employment  inflation  gas    FLOW       VERIFY');
for (const m of ['2007-05','2007-06','2007-07','2007-08','2007-09','2007-10','2007-11','2007-12']) {
  const r = byMonth.get(m); if (!r) continue;
  const wk = flow.filter(x => mo(x.d) === m);
  const peak = wk.length ? wk.reduce((a, b) => Math.abs(b.z) > Math.abs(a.z) ? b : a) : null;
  const st = peak ? peak.state : '—';
  let verify = '—';
  if (m >= mo(first.d)) {
    const rise = r.ooze - jarAtHorn;
    const monthsSince = (+m.slice(0,4) - +mo(first.d).slice(0,4)) * 12 + (+m.slice(5) - +mo(first.d).slice(5));
    verify = rise >= CONFIRM_PTS ? 'CONFIRMED +' + rise
      : monthsSince > CONFIRM_MO ? 'DID NOT VERIFY' : 'NOT YET';
  }
  console.log('  ' + m + '   ' + String(r.ooze).padStart(4) + '   ' +
    r.stresses.financial.toFixed(1).padStart(8) + '   ' +
    r.stresses.employment.toFixed(1).padStart(9) + '  ' +
    r.stresses.inflation.toFixed(1).padStart(8) + '  ' +
    r.stresses.gas.toFixed(1).padStart(5) + '  ' +
    st.padEnd(9) + '  ' + verify);
}

console.log('\n  horn sounded : ' + first.d);
console.log('  jar that month: ' + jarAtHorn);
const conf = ['2007-08','2007-09','2007-10','2007-11','2007-12','2008-01']
  .map(m => byMonth.get(m)).filter(Boolean).find(r => r.ooze - jarAtHorn >= CONFIRM_PTS);
if (conf) {
  const wks = Math.round((new Date(conf.month + '-15') - new Date(first.d)) / (7 * 864e5));
  console.log('  confirmed    : ' + conf.month + ' at ' + conf.ooze + ' (+' + (conf.ooze - jarAtHorn) + ')');
  console.log('  LEAD TIME    : ~' + wks + ' weeks between the flow moving and the level confirming');
}

/* ---------- 3. the honest part: how often does this same rule fire? ---------- */
console.log('\n3. THE SAME RULE ACROSS ALL 23 YEARS — false-horn check\n');
const modern = flow.filter(x => x.d >= '2003-01-01');
const fires = modern.filter(x => x.state === 'HORN');
const eps = [];
let cur = null;
for (const x of fires) {
  if (cur && (new Date(x.d) - new Date(cur.end)) <= 21 * 864e5) {
    cur.end = x.d; cur.peak = Math.max(cur.peak, Math.abs(x.z));
  } else { if (cur) eps.push(cur); cur = {start: x.d, end: x.d, peak: Math.abs(x.z)}; }
}
if (cur) eps.push(cur);

console.log('  episode                        peak z   jar at horn -> 6mo later');
for (const e of eps) {
  const m0 = mo(e.start);
  const r0 = byMonth.get(m0);
  const y = +m0.slice(0,4), mm = +m0.slice(5) + 6;
  const m6 = (y + Math.floor((mm-1)/12)) + '-' + String(((mm-1)%12)+1).padStart(2,'0');
  const r6 = byMonth.get(m6);
  const outcome = r0 && r6 ? (r6.ooze - r0.ooze >= CONFIRM_PTS
      ? 'CONFIRMED  ' + r0.ooze + ' -> ' + r6.ooze
      : 'cleared    ' + r0.ooze + ' -> ' + r6.ooze) : 'no jar data';
  console.log('  ' + e.start + ' -> ' + e.end + '   ' + e.peak.toFixed(1).padStart(5) + '   ' + outcome);
}
console.log('\n  ' + eps.length + ' horns in 23 years = ' + (eps.length/23).toFixed(2) + '/year');
console.log('  firing rate: ' + fires.length + '/' + modern.length + ' weeks = ' +
  (fires.length/modern.length*100).toFixed(1) + '%');
console.log('\n  NOTE: a "cleared" horn is not a failure. It is the instrument');
console.log('  noticing a real move that did not reach households, and saying so.');
