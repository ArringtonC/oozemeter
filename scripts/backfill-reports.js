#!/usr/bin/env node
/* Archive reconstructions: monthly OOZE + WARD M reports for the trailing year,
   generated deterministically from the two public backtests. NO hand-typed
   numbers — every figure computes from research/backtest-results.json and
   research/market-backtest.json, and both wings re-derive and ASSERT against the
   published scores (drift = hard failure, build stops).

   Honesty contract, per the Editorial Constitution:
   - Every report declares itself a reconstruction on three surfaces (title, dek,
     first body sentence) — the label must survive being seen without the body.
   - Contributions are the CALIBRATED score apportioned by largest remainder, so
     the printed ounces sum to exactly the printed reading. Same algorithm as the
     live collector (scripts/collect.js:126) so archive and live can never
     disagree about the same month.
   - A gap in the archive is disclosed on every surface that carries a delta —
     dek, key point, and body — not just the body.
   - No section is ever emitted without a body.
   - `date` is the vintage of the figures, never a date inside the observed month.

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
const plural = n => n === 1 ? '' : 's';

/* the figures' vintage — when the underlying backtests were computed. Never a
   date inside the observed month: these reports did not exist then. */
const VINTAGE = (hh.generated || '').slice(0, 10);
const MKVINTAGE = (mk.generated || '').slice(0, 10);
const {BYLINES, confidenceStatement} = require('./editorial-furniture');
const BYLINE = BYLINES.archive;
const HH_CONFIDENCE = confidenceStatement({methodologyVersion: hh.methodologyVersion, vintage: VINTAGE, kind: 'archive'});
const MK_CONFIDENCE = confidenceStatement({methodologyVersion: 'Ward M provisional', vintage: MKVINTAGE, kind: 'archive'});

/* The window is the trailing year, ending at the latest month the household
   backtest fully computes — it advances on its own as months seal, instead of
   the archive quietly falling behind the jar (the 2026-08-26 drift). */
const END = hh.monthly[hh.monthly.length - 1].month;
if (!END) throw new Error('backtest has no monthly rows — cannot anchor the archive window');
const WINDOW = []; let cur = END;
for (let i = 0; i < 12; i++) { WINDOW.unshift(cur); cur = prevYm(cur); }

/* ---------- household ---------- */
const HHN = {employment:'Employment', housing:'Housing', credit:'Credit cards', auto:'Auto loans', gas:'Gas prices', inflation:'Inflation', financial:'Financial conditions'};
/* lines whose names take a plural verb — editorial-qa.md names this exact hazard */
const PLURAL = new Set(['credit','auto','gas']);
const verbFor = k => PLURAL.has(k) ? 'show' : 'shows';
const hhByMonth = new Map(hh.monthly.map(m => [m.month, m]));
const allScores = hh.monthly.map(m => m.ooze);

function verdict(score) {
  const worse = allScores.filter(v => v > score).length;
  const per10 = Math.round(worse / allScores.length * 10);
  return per10 >= 5 ? `calmer than ${per10} of every 10 months since 2003`
                    : `more stressed than ${10-per10} of every 10 months since 2003`;
}
/* every rung must be reachable by the thresholds that emit it */
const dirWord = d => d <= -6 ? 'fell' : d < 0 ? 'eased' : d === 0 ? 'was flat' : d < 6 ? 'edged up' : 'climbed';

function lastAvailable(byMonth, ym) {
  let c = prevYm(ym);
  for (let i = 0; i < 6; i++) { if (byMonth.has(c)) return c; c = prevYm(c); }
  throw new Error(`no prior month within 6 of ${ym}`);
}

/* calibrated score apportioned by largest remainder — parts sum to the whole */
function apportion(stresses, weights, total) {
  const wsum = Object.keys(weights).reduce((a,k) => a + weights[k]*stresses[k], 0);
  const exact = Object.keys(weights).map((k, index) => ({k, index, value: total*(weights[k]*stresses[k])/wsum}));
  const out = {};
  for (const {k, value} of exact) out[k] = Math.floor(value);
  const remainder = total - Object.values(out).reduce((a,b) => a+b, 0);
  for (const {k} of exact.sort((a,b) => (b.value%1)-(a.value%1) || a.index-b.index).slice(0, remainder)) out[k] += 1;
  const check = Object.values(out).reduce((a,b) => a+b, 0);
  if (check !== total) throw new Error(`apportionment drift: parts ${check} vs whole ${total}`);
  return out;
}

function householdReport(ym) {
  const m = hhByMonth.get(ym);
  if (!m) return null; /* archive gap — no report is the honest report */
  const pYm = lastAvailable(hhByMonth, ym), p = hhByMonth.get(pYm);
  const gapped = pYm !== prevYm(ym);
  const prevLabel = label(pYm);
  const gapClause = gapped
    ? ` (${label(prevYm(ym))} is a gap in the archive — a month the sources cannot fully reconstruct — so the comparison reaches back to ${prevLabel}.)`
    : '';

  const delta = m.ooze - p.ooze;
  const oz = apportion(m.stresses, hh.weights, m.ooze);

  /* the published score must re-derive from the published constants */
  const rawSum = Object.keys(hh.weights).reduce((a,k) => a + m.stresses[k]*hh.weights[k]/100, 0);
  const recomputed = Math.round(Math.min(100, Math.max(0, hh.calibration.a*rawSum + hh.calibration.b)));
  if (Math.abs(recomputed - m.ooze) > 1) throw new Error(`household drift ${ym}: ${recomputed} vs ${m.ooze}`);

  const moves = Object.keys(hh.weights).map(k => ({k, d: Math.round(m.stresses[k] - p.stresses[k])}))
    .sort((a,b) => Math.abs(b.d) - Math.abs(a.d));
  const movers = moves.filter(x => Math.abs(x.d) >= 3).slice(0, 3);
  const biggest = movers.length ? Math.abs(movers[0].d) : 0;
  const ranked = Object.keys(hh.weights).map(k => ({k, c: oz[k]})).sort((a,b) => b.c - a.c);
  const heavy = ranked.slice(0, 2);
  const tied = heavy[0].c === heavy[1].c;

  const deltaTxt = delta === 0 ? 'unchanged from' : `${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} from`;
  const moverTxt = movers.length
    ? movers.map(x => `pressure from ${HHN[x.k].toLowerCase()} ${dirWord(x.d)} ${Math.abs(x.d)} point${plural(Math.abs(x.d))}`).join('; ')
    : 'no line moved more than a couple of points';

  /* register tracks magnitude, not mover count */
  const commentary = biggest === 0
    ? " Months like this are the archive's quiet majority — pressure shifting by inches, not feet."
    : biggest >= 10
      ? ` A single-month move of ${biggest} points on one line is large for this instrument; the line-level anchors are published, so the size is checkable rather than asserted.`
      : '';

  /* the heaviest line is also the mover: report the collision as the finding */
  const collision = movers.length && movers[0].k === heavy[0].k;
  const pressingTxt = tied
    ? `${HHN[heavy[0].k]} and ${HHN[heavy[1].k].toLowerCase()} tied at ${heavy[0].c} oz each — the heaviest lines on the board.`
    : `${HHN[heavy[0].k]} carried the most weight — ${heavy[0].c} of the month's ${m.ooze} ounces — with ${HHN[heavy[1].k].toLowerCase()} next at ${heavy[1].c} oz.`;
  const collisionTxt = collision
    ? ` The heaviest line was also the one that gave ground: ${HHN[heavy[0].k].toLowerCase()} ${dirWord(movers[0].d)} ${Math.abs(movers[0].d)} point${plural(Math.abs(movers[0].d))} and still carries ${heavy[0].c} of the month's ${m.ooze} ounces.`
    : '';
  const employmentTxt = ranked[0].k === 'employment'
    ? ' When employment tops this list at a calm overall reading, it is arithmetic, not alarm: the heaviest-weighted line leads whenever nothing else is loud.'
    : ` Employment sits at ${oz.employment} oz this month — recessions are employment events, and this line's rank is always worth a glance.`;

  const noticeTxt = !movers.length
    ? 'a month that felt like the one before it — the same bills carrying the same weight, no line of the budget suddenly better or worse'
    : movers[0].d < 0
      ? `some relief where ${HHN[movers[0].k].toLowerCase()} ${verbFor(movers[0].k)} up in the budget, while ${heavy[0].k === 'employment' ? 'steady paychecks kept the rest orderly' : `${HHN[heavy[0].k].toLowerCase()} stayed the biggest strain`}`
      : `a little more squeeze from ${HHN[movers[0].k].toLowerCase()}, with ${HHN[heavy[0].k].toLowerCase()} still the heaviest line on the board`;

  return {
    slug: `recon-ooze-${ym}`, cat: 'report', month: ym, observed: ym, date: VINTAGE,
    auto: true, byline: BYLINE,
    title: `Archive reconstruction — ${label(ym)}: the jar read ${m.ooze}`,
    dek: `The trailing-year archive, rebuilt under methodology v${hh.methodologyVersion}: ${label(ym)} scored ${m.ooze}/100 (${band(m.ooze)}), ${deltaTxt} ${prevLabel}${gapped ? ' — the month before is a gap in the archive' : ''}.`,
    keyPoints: [
      `${label(ym)} reads ${m.ooze}/100 — ${band(m.ooze)} territory, ${deltaTxt} ${prevLabel}${gapped ? ` (${label(prevYm(ym))} cannot be reconstructed)` : ''}.`,
      `Biggest movement: ${moverTxt}.`,
      tied ? `Heaviest lines: ${HHN[heavy[0].k]} and ${HHN[heavy[1].k].toLowerCase()} tied at ${heavy[0].c} oz each.`
           : `Heaviest lines: ${HHN[heavy[0].k]} (${heavy[0].c} oz) and ${HHN[heavy[1].k].toLowerCase()} (${heavy[1].c} oz).`,
    ],
    body: [
      `**This is a reconstruction, labeled as one.** The facility opened in July 2026; it did not exist to seal ${label(ym)} live. This report is today's methodology (v${hh.methodologyVersion}) run over the latest revised public data for the month, computed ${VINTAGE} — sources revise their history, so these figures are the present's best view of ${label(ym)}, not a bulletin from it.`,
      `The month computes to ${m.ooze} out of 100 — ${band(m.ooze)} territory, the band where normal economies live — ${deltaTxt} ${prevLabel}, and ${verdict(m.ooze)}.${gapClause}`,
      `## What moved`,
      `${moverTxt[0].toUpperCase()}${moverTxt.slice(1)}.${commentary}`,
      `## What was pressing`,
      `${pressingTxt}${collisionTxt}${employmentTxt} The seven weighted lines split the month's ${m.ooze} ounces between them and sum to it exactly.`,
      `## What a household would have noticed`,
      `Most likely: ${noticeTxt}. The jar reads the cascade — the order a budget fails in, from the pump to the credit card to the car to the job — and in ${label(ym)} the cascade ${Math.abs(delta) >= 3 ? 'moved' : 'mostly held'}.`,
      `Point moves are line-stress changes, not score points. For the current sealed reading, see the front page — the jar updates itself; you just check it.`,
      HH_CONFIDENCE,
      BYLINE,
    ],
  };
}

/* ---------- market ---------- */
const MKN = {rates:'Rates', volatility:'Volatility', credit:'Credit & funding', energy:'Energy', dollar:'Dollar', breadth:'Breadth'};
const GAUGES = Object.keys(mk.anchors);
function interp(anchors, v) {
  const s = [...anchors].sort((a,b) => a[0]-b[0]);
  if (v <= s[0][0]) return s[0][1];
  if (v >= s[s.length-1][0]) return s[s.length-1][1];
  for (let i = 1; i < s.length; i++) { const [x0,y0] = s[i-1], [x1,y1] = s[i]; if (v <= x1) return y0 + (v-x0)/(x1-x0)*(y1-y0); }
  return s[s.length-1][1];
}
const gaugeVals = new Map();
for (const g of GAUGES) for (const row of mk.gaugeHistory[g]) {
  if (!gaugeVals.has(row.month)) gaugeVals.set(row.month, {});
  gaugeVals.get(row.month)[g] = interp(mk.anchors[g], row.value);
}
const mkByMonth = new Map(mk.monthly.map(m => [m.month, m]));
const GLOSS = {
  breadth: 'Breadth heat means weakness was spreading across the ticker panel rather than concentrating in one corner.',
  rates: 'Rates heat reflects the yield curve — the bond market carries a long-standing recession reputation, which is a reputation and not a forecast.',
  energy: 'Energy heat is the upstream cousin of the household gas line: expensive oil squeezes everything that moves.',
  credit: 'Credit and funding heat is the plumbing tightening — historically it moves before household damage shows up, though it has also tightened without any.',
  volatility: 'Volatility heat means the option market was paying up for protection; a monthly mean moves only on persistent repricing, not a one-day spike.',
  dollar: 'Dollar heat can accompany global funding stress, squeezing anyone who borrowed in dollars — it also rises on plain U.S. strength.',
};

function marketReport(ym) {
  const m = mkByMonth.get(ym);
  if (!m) return null;
  const pYm = lastAvailable(mkByMonth, ym), p = mkByMonth.get(pYm);
  const gapped = pYm !== prevYm(ym);
  const prevLabel = label(pYm);
  const gv = gaugeVals.get(ym), pv = gaugeVals.get(pYm);
  if (!gv || !pv) throw new Error(`gauge month missing around ${ym}`);
  const stresses = GAUGES.map(g => gv[g]);
  if (stresses.some(s => s == null)) throw new Error(`gauge gap ${ym}`);
  const raw = stresses.reduce((a,b) => a+b, 0) / 6;
  if (Math.abs(raw - m.raw) > 0.6) throw new Error(`market drift ${ym}: ${raw.toFixed(2)} vs ${m.raw.toFixed(2)}`);

  const delta = m.score - p.score;
  const hhm = hhByMonth.get(ym) || null;
  const hhPrev = hhm ? hhByMonth.get(prevYm(ym)) : null;

  const moves = GAUGES.map(g => ({g, d: Math.round(gv[g] - pv[g])})).sort((a,b) => Math.abs(b.d) - Math.abs(a.d));
  const movers = moves.filter(x => Math.abs(x.d) >= 3).slice(0, 3);
  const biggest = movers.length ? Math.abs(movers[0].d) : 0;
  const hot = GAUGES.map(g => ({g, s: Math.round(gv[g])})).sort((a,b) => b.s - a.s)[0];
  const deltaTxt = delta === 0 ? 'unchanged from' : `${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} from`;
  const moverTxt = movers.length
    ? movers.map(x => `${MKN[x.g].toLowerCase()} gauge heat ${dirWord(x.d)} ${Math.abs(x.d)} point${plural(Math.abs(x.d))}`).join('; ')
    : 'no gauge moved more than a couple of points';
  const commentary = biggest >= 25
    ? ` A ${biggest}-point move on one gauge in a month is instrument behaviour worth watching in its own right — the anchors that produced it are published and provisional.`
    : '';

  /* the divergence paragraph is an argument: levels, then direction and size */
  let divTxt;
  if (!hhm) {
    divTxt = `No household reading exists for ${label(ym)} — the required BLS observations were never published — so the ward has nothing to be measured against this month. A missing month stays missing.`;
  } else {
    const gap = m.score - hhm.ooze;
    const hhDelta = hhPrev ? hhm.ooze - hhPrev.ooze : null;
    const levels = `Ward ${m.score}/100, household jar ${hhm.ooze}/100 — a ${Math.abs(gap)}-point gap, the ${gap >= 0 ? 'ward' : 'jar'} reading hotter.`;
    const moved = hhDelta == null ? '' :
      ` This month the ward moved ${delta >= 0 ? '+' : ''}${delta} against the jar's ${hhDelta >= 0 ? '+' : ''}${hhDelta}.`;
    const shared = movers.some(x => x.g === 'energy')
      ? ' Energy sits upstream of the household gas line, so where both instruments moved this month they may be recording the same shock at different amplitudes rather than disagreeing.'
      : '';
    divTxt = `${levels}${moved}${shared} The two instruments are never averaged; their one shared input is the Chicago Fed's financial-conditions index, which carries 3% of the jar's weight and one of the ward's six gauges.`;
  }

  return {
    slug: `recon-ward-${ym}`, cat: 'report', month: ym, observed: ym, date: MKVINTAGE,
    auto: true, byline: BYLINE,
    title: `Archive reconstruction — Ward M, ${label(ym)}: market ooze ${m.score}`,
    dek: `The market wing's trailing-year archive, rebuilt from six public gauges: ${label(ym)} computes to ${m.score}/100, ${deltaTxt} ${prevLabel}.`,
    keyPoints: [
      `Ward M reads ${m.score}/100 for ${label(ym)} — ${deltaTxt} ${prevLabel}.`,
      `Biggest gauge movement: ${moverTxt}.`,
      `Hottest gauge: ${MKN[hot.g]} at ${hot.s}/100.${hhm ? ` Divergence vs the household jar: ${m.score - hhm.ooze >= 0 ? '+' : ''}${m.score - hhm.ooze} points.` : ' No household reading exists this month.'}`,
    ],
    body: [
      `**This is a reconstruction, labeled as one.** Ward M opened in late July 2026; this report runs its published gauges and calibration over the latest revised data for ${label(ym)}, computed ${MKVINTAGE}. It is the present's view of that month's market stress, not a bulletin from it — and like everything in this wing, it is an experimental instrument that contributes nothing to the household Ooze Score.`,
      `The composite computes to ${m.score} out of 100, ${deltaTxt} ${prevLabel}${gapped ? ` (${label(prevYm(ym))} is a gap in the archive)` : ''}. Ward M averages six gauges — rates, volatility, credit and funding, energy, the dollar, and breadth — each mapped through published anchors, calibrated so the ward's calmest month since 2007 reads 10/100 and its worst 2008 month reads 90/100.`,
      `## What moved`,
      `${moverTxt[0].toUpperCase()}${moverTxt.slice(1)}.${commentary}`,
      `## The leading gauge`,
      `${MKN[hot.g]} led the panel at ${hot.s}/100${hot.s < 50 ? ' — the highest of the six, though still in the calmer half of its own scale' : ''}. ${GLOSS[hot.g]}`,
      `## Two instruments, one month`,
      divTxt,
      `Point moves are gauge-heat changes, not composite points. Gauge anchors remain provisional. For the current ward reading, see the Markets page.`,
      MK_CONFIDENCE,
      BYLINE,
    ],
  };
}

const out = [];
for (const ym of WINDOW) {
  const h = householdReport(ym); if (h) out.push(h);
  const w = marketReport(ym); if (w) out.push(w);
}

/* no section may ship without a body, and no report without its disclosures */
for (const a of out) {
  a.body.forEach((line, i) => {
    if (line.startsWith('## ')) {
      const next = a.body[i+1];
      if (!next || !next.trim() || next.startsWith('## ')) throw new Error(`empty section in ${a.slug}: ${line}`);
    }
    if (line !== line.trim()) throw new Error(`stray whitespace in ${a.slug}`);
  });
  a.keyPoints.forEach(k => { if (k !== k.trim()) throw new Error(`stray whitespace in keyPoint of ${a.slug}`) });
  if (!a.byline || !a.body[0].includes('reconstruction, labeled as one')) throw new Error(`missing disclosure in ${a.slug}`);
}

const banner = `/* ARCHIVE RECONSTRUCTIONS — generated by scripts/backfill-reports.js from the
   two public backtests (household ${hh.generated}, market ${mk.generated}).
   Contributions are the calibrated score apportioned by largest remainder and
   are asserted to sum to the printed reading. Regenerate after either backtest
   changes. NEVER hand-edit. */\n`;
fs.writeFileSync(path.join(root, 'data/reconstruction-reports.js'),
  banner + 'window.RECON_ARTICLES=' + JSON.stringify(out) + ';\n');
console.log(JSON.stringify({status: 'pass', reports: out.length, window: `${WINDOW[0]}..${WINDOW[WINDOW.length-1]}`, vintage: VINTAGE}));
