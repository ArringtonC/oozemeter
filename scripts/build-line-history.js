#!/usr/bin/env node
/* Per-line stress history for the reader surfaces — one artifact the charts can
   trust. It publishes the per-month stress of every weighted line straight from
   the canonical backtest (research/backtest-results.json), so the Indicator
   pages and the Archive month drill-down draw from the same verified numbers the
   Ooze Chart already plots. No recomputation, no hand-typed values — if the
   backtest has a line we do not know how to publish, the build stops.

   Output: data/line-history.json + data/line-history.js (window.LINE_HISTORY).
   Run after scripts/backtest.js regenerates, before the static pages bake. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const bt = JSON.parse(fs.readFileSync(path.join(root, 'research/backtest-results.json'), 'utf8'));
if (!Array.isArray(bt.monthly) || !bt.monthly.length) throw new Error('backtest has no monthly rows');

/* backtest stress keys → site slugs (the site names the employment line "jobs";
   the backtest's model keys are canonical). An unmapped line is a loud stop,
   never a silent drop: the reader surface must not guess which lines exist. */
const SLUG = {
  employment: 'jobs', inflation: 'inflation', housing: 'housing',
  credit: 'credit', auto: 'auto', gas: 'gas', financial: 'financial',
};

const months = bt.monthly.map((m) => {
  if (!m || !m.month || !Number.isFinite(m.ooze)) throw new Error(`backtest row malformed: ${JSON.stringify(m)}`);
  const stresses = {};
  for (const [key, value] of Object.entries(m.stresses || {})) {
    const slug = SLUG[key];
    if (!slug) throw new Error(`backtest line "${key}" has no site slug — register it in build-line-history.js`);
    if (!Number.isFinite(value)) throw new Error(`non-finite stress on ${key} at ${m.month}`);
    stresses[slug] = value;
  }
  return {month: m.month, ooze: Math.round(m.ooze), stresses};
});

const out = {
  generated: new Date().toISOString(),
  methodologyVersion: bt.methodologyVersion,
  source: 'research/backtest-results.json',
  months,
};
fs.writeFileSync(path.join(root, 'data/line-history.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(root, 'data/line-history.js'), 'window.LINE_HISTORY=' + JSON.stringify(out) + ';\n');
console.log(JSON.stringify({
  status: 'pass',
  months: months.length,
  first: months[0]?.month,
  last: months[months.length - 1]?.month,
  lines: Object.keys(months[0]?.stresses || {}).length,
}));
