#!/usr/bin/env node
/* Archive reconstructions: 12 monthly OOZE reports + 12 monthly WARD M reports
   for the trailing year, generated deterministically from the two public
   backtests. NO hand-typed numbers — every figure computes from
   research/backtest-results.json and research/market-backtest.json, and the
   market composite is re-derived from raw gauge values + published anchors,
   then ASSERTED against the backtest's own score (drift = hard failure).
   Honesty: every report opens by declaring itself a reconstruction — the
   facility opened July 2026; these are today's methodology run over the
   latest revised data, not seals published at the time.
   Output: data/reconstruction-reports.js (window.RECON_ARTICLES).
   Rerun after either backtest regenerates. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));

const hh = read('research/backtest-results.json');
const mk = read('research/market-backtest.json');

const BANDS = [[20,'Smooth'],[40,'Sticky'],[60,'Slippery'],[80,'Oozing'],[100,'Overflowing']];
const band = s => BANDS.find(([m]) => s <= m)[1];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const label = ym => {const [y,m] = ym.split('-').map(Number); return `${MONTH_NAMES[m-1]} ${y}`};
const prevYm = ym => {let [y,m] = ym.split('-').map(Number); m--; if(!m){m=12;y--;} return `${y}-${String(m).padStart(2,'0')}`};

/* trailing 12 sealed months, both wings aligned */
const END = '2026-06';
const WINDOW = []; let cur = END;
for (let i = 0; i < 12; i++) { WINDOW.unshift(cur); cur = prevYm(cur); }

/* ---------- household ---------- */
const HHN = {employment:'Employment', housing:'Housing', credit:'Credit cards', auto:'Auto loans', gas:'Gas prices', inflation:'Inflation', financial:'Financial conditions'};
const hhByMonth = new Map(hh.monthly.map(m => [m.month, m]));
const allScores = hh.monthly.map(m => m.ooze);

function verdict(score) {
  const worse = allScores.filter(v => v > score).length;
  const per10 = Math.round(worse / allScores.length * 10);
  return per10 >= 5 ? `calmer than ${per10} of every 10 months since 2003`
                    : `more stressed than ${10-per10} of every 10 months since 2003`;
}
const dirWord = d => d <= -3 ? 'fell' : d < 0 ? 'eased' : d < 3 ? 'edged up' : 'climbed';

function lastAvailable(byMonth, ym) {
  /* walk back to the nearest month the archive actually has — gaps stay gaps */
  let cur = prevYm(ym);
  for (let i = 0; i < 6; i++) { if (byMonth.has(cur)) return cur; cur = prevYm(cur); }
  throw new Error(`no prior month within 6 of ${ym}`);
}

function householdReport(ym) {
  const m = hhByMonth.get(ym);
  if (!m) return null; /* archive gap — no report is the honest report */
  const pYm = lastAvailable(hhByMonth, ym), p = hhByMonth.get(pYm);
  const gapNote = pYm === prevYm(ym) ? '' : ` (${label(prevYm(ym))} is a gap in the archive — a month the sources cannot fully reconstruct — so the comparison reaches back to ${label(pYm)})`;
  const delta = m.ooze - p.ooze;
  const prevLabel = label(pYm);
  const contrib = k => Math.round(m.stresses[k] * hh.weights[k] / 100);
  const contribSum = Object.keys(hh.weights).reduce((a,k) => a + m.stresses[k]*hh.weights[k]/100, 0);
  /* sanity: weighted raw must map to the published score through the backtest calibration */
  const calibrated = Math.round(Math.min(100, Math.max(0, hh.calibration.a*contribSum + hh.calibration.b)));
  if (Math.abs(calibrated - m.ooze) > 1) throw new Error(`household drift ${ym}: recomputed ${calibrated} vs backtest ${m.ooze}`);

  const moves = Object.keys(hh.weights)
    .map(k => ({k, d: Math.round(m.stresses[k] - p.stresses[k])}))
    .sort((a,b) => Math.abs(b.d) - Math.abs(a.d));
  const movers = moves.filter(x => Math.abs(x.d) >= 3).slice(0, 3);
  const heavy = Object.keys(hh.weights).map(k => ({k, c: contrib(k)})).sort((a,b) => b.c - a.c).slice(0, 2);
  const deltaTxt = delta === 0 ? 'unchanged from' : `${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} from`;
  const moverTxt = movers.length
    ? movers.map(x => `${HHN[x.k].toLowerCase()} ${dirWord(x.d)} ${Math.abs(x.d)} point${Math.abs(x.d)===1?'':'s'}`).join('; ')
    : 'no line moved more than a couple of points';
  const noticeTxt = movers.length === 0
    ? 'a month that felt like the one before it — the same bills carrying the same weight, no line of the budget suddenly better or worse'
    : movers[0].d < 0
      ? `some relief where ${HHN[movers[0].k].toLowerCase()} shows up in the budget, while ${heavy[0].k === 'employment' ? 'steady paychecks kept the rest orderly' : `${HHN[heavy[0].k].toLowerCase()} stayed the biggest strain`}`
      : `a little more squeeze from ${HHN[movers[0].k].toLowerCase()}, with ${HHN[heavy[0].k].toLowerCase()} still the heaviest line on the board`;

  return {
    slug: `recon-ooze-${ym}`, cat: 'report', month: ym, date: `${ym}-28`,
    title: `Archive reconstruction — ${label(ym)}: the jar read ${m.ooze}`,
    dek: `The trailing-year archive, rebuilt under methodology v${hh.methodologyVersion}: ${label(ym)} scored ${m.ooze}/100 (${band(m.ooze)}), ${deltaTxt} the month before.`,
    keyPoints: [
      `${label(ym)} reads ${m.ooze}/100 — ${band(m.ooze)} territory, ${deltaTxt} ${prevLabel}.`,
      `Biggest movement: ${moverTxt}.`,
      `Heaviest lines: ${HHN[heavy[0].k]} (${heavy[0].c} oz) and ${HHN[heavy[1].k].toLowerCase()} (${heavy[1].c} oz).`,
    ],
    body: [
      `**This is a reconstruction, labeled as one.** The facility opened in July 2026; it did not exist to seal ${label(ym)} live. This report is today's methodology (v${hh.methodologyVersion}) run over the latest revised public data for the month — sources revise their history, so these figures are the present's best view of ${label(ym)}, not a bulletin from it.`,
      `The month computes to ${m.ooze} out of 100 — ${band(m.ooze)} territory, ${deltaTxt} ${prevLabel}${gapNote}, and ${verdict(m.ooze)}.`,
      `## What moved`,
      `${moverTxt[0].toUpperCase()}${moverTxt.slice(1)}.${movers.length > 1 ? '' : ' Months like this are the archive\'s quiet majority — pressure shifting by inches, not feet.'}`,
      `## What was pressing`,
      `${HHN[heavy[0].k]} carried the most weight — ${heavy[0].c} of the month's ${m.ooze} ounces — with ${HHN[heavy[1].k].toLowerCase()} next at ${heavy[1].c}. ${heavy[0].k === 'employment' ? 'When employment tops this list at a calm overall reading, it is arithmetic, not alarm: the heaviest-weighted line leads whenever nothing else is loud.' : 'Recessions are employment events, and the employment line\'s position on this list is always worth a glance.'}`,
      `## What a household would have noticed`,
      `Most likely: ${noticeTxt}. The jar reads the cascade, and in ${label(ym)} the cascade ${Math.abs(delta) >= 3 ? 'moved' : 'mostly held'}.`,
      `Every figure above recomputes from the public backtest (research/backtest-results.json). The live jar and its current seal are on the front page — the jar updates itself; you just check it.`,
    ],
  };
}

/* ---------- market ---------- */
const MKN = {rates:'Rates', volatility:'Volatility', credit:'Credit & funding', energy:'Energy', dollar:'Dollar', breadth:'Breadth'};
const GAUGES = Object.keys(mk.anchors);
function interp(anchors, v) {
  const pts = anchors; /* [[value,stress]...] — may run descending in value */
  const sorted = [...pts].sort((a,b) => a[0]-b[0]);
  if (v <= sorted[0][0]) return sorted[0][1];
  if (v >= sorted[sorted.length-1][0]) return sorted[sorted.length-1][1];
  for (let i = 1; i < sorted.length; i++) {
    const [x0,y0] = sorted[i-1], [x1,y1] = sorted[i];
    if (v <= x1) return y0 + (v-x0)/(x1-x0)*(y1-y0);
  }
  return sorted[sorted.length-1][1];
}
const gaugeVals = new Map(); /* month -> {gauge: stress} */
for (const g of GAUGES) {
  for (const row of mk.gaugeHistory[g]) {
    if (!gaugeVals.has(row.month)) gaugeVals.set(row.month, {});
    gaugeVals.get(row.month)[g] = interp(mk.anchors[g], row.value);
  }
}
const mkByMonth = new Map(mk.monthly.map(m => [m.month, m]));

function marketReport(ym) {
  const m = mkByMonth.get(ym);
  if (!m) return null;
  const pYm = lastAvailable(mkByMonth, ym), p = mkByMonth.get(pYm);
  const gv = gaugeVals.get(ym), pv = gaugeVals.get(pYm);
  if (!gv || !pv) throw new Error(`gauge month missing around ${ym}`);
  const stresses = GAUGES.map(g => gv[g]);
  if (stresses.some(s => s == null) || stresses.length !== 6) throw new Error(`gauge gap ${ym}`);
  const raw = stresses.reduce((a,b) => a+b, 0) / 6;
  /* HARD CHECK: our re-derivation must match the backtest's published raw */
  if (Math.abs(raw - m.raw) > 0.6) throw new Error(`market drift ${ym}: rederived raw ${raw.toFixed(2)} vs backtest ${m.raw.toFixed(2)}`);
  const delta = m.score - p.score;
  const prevLabel = label(pYm);
  const hhm = hhByMonth.get(ym) || null;
  const divergence = hhm ? m.score - hhm.ooze : null;

  const moves = GAUGES.map(g => ({g, d: Math.round(gv[g] - pv[g])})).sort((a,b) => Math.abs(b.d) - Math.abs(a.d));
  const movers = moves.filter(x => Math.abs(x.d) >= 3).slice(0, 3);
  const hot = GAUGES.map(g => ({g, s: Math.round(gv[g])})).sort((a,b) => b.s - a.s)[0];
  const deltaTxt = delta === 0 ? 'unchanged from' : `${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} from`;
  const moverTxt = movers.length
    ? movers.map(x => `${MKN[x.g].toLowerCase()} ${dirWord(x.d)} ${Math.abs(x.d)} point${Math.abs(x.d)===1?'':'s'}`).join('; ')
    : 'no gauge moved more than a couple of points';
  const divTxt = divergence == null ? '' :
    divergence >= 8 ? `Markets ran ${divergence} points hotter than the household jar (${hhm.ooze}) — the ward jumpy while kitchens stayed calmer, which is the divergence this wing exists to show.` :
    divergence <= -8 ? `The household jar (${hhm.ooze}) ran ${-divergence} points hotter than markets — pressure on kitchens the ward did not share.` :
    `The two instruments roughly agreed: ward ${m.score}, household jar ${hhm.ooze}.`;

  return {
    slug: `recon-ward-${ym}`, cat: 'report', month: ym, date: `${ym}-27`,
    title: `Archive reconstruction — Ward M, ${label(ym)}: market ooze ${m.score}`,
    dek: `The market wing's trailing-year archive, rebuilt from six public gauges: ${label(ym)} computes to ${m.score}/100, ${deltaTxt} the month before.`,
    keyPoints: [
      `Ward M reads ${m.score}/100 for ${label(ym)} — ${deltaTxt} ${prevLabel}.`,
      `Biggest gauge movement: ${moverTxt}.`,
      `Hottest gauge: ${MKN[hot.g]} at ${hot.s}. ${divergence == null ? '' : `Divergence vs the household jar: ${divergence > 0 ? '+' : ''}${divergence}.`}`,
    ],
    body: [
      `**This is a reconstruction, labeled as one.** Ward M opened in late July 2026; this report runs its published gauges and calibration over the latest revised data for ${label(ym)}. It is the present's view of that month's market stress, not a bulletin from it — and like everything in this wing, it is an experimental instrument that contributes nothing to the household Ooze Score.`,
      `The composite computes to ${m.score} out of 100, ${deltaTxt} ${prevLabel}. Ward M averages six gauges — rates, volatility, credit & funding, energy, the dollar, and breadth — each mapped through published anchors, calibrated so the ward's calmest month since 2007 reads 10 and its worst 2008 month reads 90.`,
      `## What moved`,
      `${moverTxt[0].toUpperCase()}${moverTxt.slice(1)}.`,
      `## The hot gauge`,
      `${MKN[hot.g]} ran hottest at ${hot.s}. ${hot.g === 'breadth' ? 'Breadth heat means weakness was spreading across the ticker panel rather than concentrating in one corner.' : hot.g === 'rates' ? 'Rates heat reflects the yield curve — the bond market\'s long-running recession signal.' : hot.g === 'energy' ? 'Energy heat is the upstream cousin of the household gas line: expensive oil squeezes everything that moves.' : hot.g === 'credit' ? 'Credit & funding heat is the one that historically precedes household damage — the plumbing tightening before kitchens feel it.' : hot.g === 'volatility' ? 'Volatility heat means the option market was paying up for protection — persistent repricing, not a one-day spike, is what moves a monthly mean.' : 'Dollar heat can accompany global funding stress — rapid appreciation squeezes everyone who borrowed in dollars.'}`,
      `## Two instruments, one month`,
      `${divTxt}`,
      `Every figure recomputes from the public market backtest (research/market-backtest.json) — raw gauge values, published anchors, frozen calibration. The live ward is on the Markets page.`,
    ],
  };
}

const out = [];
for (const ym of WINDOW) {
  const h = householdReport(ym); if (h) out.push(h);
  const w = marketReport(ym); if (w) out.push(w);
}
const banner = `/* ARCHIVE RECONSTRUCTIONS — generated by scripts/backfill-reports.js from the
   two public backtests (household ${hh.generated}, market ${mk.generated}).
   Regenerate after either backtest changes. NEVER hand-edit. */\n`;
fs.writeFileSync(path.join(root, 'data/reconstruction-reports.js'),
  banner + 'window.RECON_ARTICLES=' + JSON.stringify(out) + ';\n');
console.log(JSON.stringify({status: 'pass', reports: out.length, window: `${WINDOW[0]}..${WINDOW[WINDOW.length-1]}`}));
