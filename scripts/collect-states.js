#!/usr/bin/env node
/* State employment stress — provisional regional wing.
   Each state's civilian unemployment rate runs through the SAME published
   unemployment anchor curve the national jar's employment line uses, so a
   state reading is directly comparable to the national figure — one line of
   the jar's seven, deliberately uncalibrated and labeled as such. It is never
   presented as a full state Ooze Score: the other six lines (housing, credit,
   auto, gas, inflation, financial) have no state-level feeds yet, and the page
   says so.

   Output: data/states.json + data/states.js (window.STATE_DATA).
   Run: node scripts/collect-states.js (FRED CSV transport — no key needed). */
const fs = require('fs');
const path = require('path');
const {fetchFredSeries} = require('./lib/fred');
const {interpolateAnchors, UNEMPLOYMENT_ANCHORS} = require('./lib/methodology');

const root = path.resolve(__dirname, '..');
const STATECODES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],
  ['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],
  ['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],
  ['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],
  ['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],
  ['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],
  ['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],
  ['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],
  ['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],
  ['WY','Wyoming'],
];
const stressOf = (rate) => interpolateAnchors(UNEMPLOYMENT_ANCHORS, rate);

(async () => {
  const states = [];
  for (const [code, name] of STATECODES) {
    const s = await fetchFredSeries(code + 'UR');
    const pairs = Object.entries(s.monthly).sort(([a], [b]) => a.localeCompare(b));
    const [month, unrate] = pairs[pairs.length - 1];
    const prev = pairs[pairs.length - 2];
    if (unrate == null || !Number.isFinite(unrate)) throw new Error(`${code}: no usable unemployment observation`);
    const stress = stressOf(unrate);
    if (stress < 0 || stress > 100) throw new Error(`${code}: stress out of range at ${unrate}%`);
    states.push({
      code, name, month, unrate,
      stress: Math.round(stress * 10) / 10,
      prevUnrate: prev && prev[1] != null ? prev[1] : null,
      delta: prev && prev[1] != null ? Math.round((stressOf(prev[1]) - stress) * 10) / 10 : null,
    });
    process.stdout.write(`${code} ${unrate}% `);
  }
  console.log('fetched');
  const payload = {
    generated: new Date().toISOString(),
    methodologyVersion: '3.0.0 (employment leg only)',
    source: 'FRED <ST>UR — state civilian unemployment rate',
    method: {
      transform: 'State unemployment rate through the published UNEMPLOYMENT_ANCHORS curve (the national employment line uses the same curve)',
      calibration: 'none — anchor stress 0–100, not a jar score',
      disclosure: 'One line of the jar\'s seven. State-level feeds for housing, credit, auto, gas, inflation and financial conditions are queued; until they land, a state reading is employment stress and is never called a full Ooze Score.',
      cadence: 'Monthly, state seasonally adjusted (BLS LAUS via FRED)',
    },
    states: states.sort((a, b) => b.stress - a.stress || a.name.localeCompare(b.name)),
  };
  fs.writeFileSync(path.join(root, 'data/states.json'), JSON.stringify(payload, null, 1));
  fs.writeFileSync(path.join(root, 'data/states.js'), 'window.STATE_DATA=' + JSON.stringify(payload) + ';\n');
  console.log(JSON.stringify({status: 'pass', states: states.length, range: `${states[0].stress}..${states[states.length-1].stress}`}));
})();
