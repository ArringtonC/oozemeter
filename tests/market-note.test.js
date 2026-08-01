const test = require('node:test');
const assert = require('node:assert/strict');

const {buildMarketNote} = require('../scripts/lib/market-note');

const sectorPayload = {
  generated: '2026-07-28T12:00:00.000Z',
  overall: 'SOFTENING',
  breadth: {steady: 8, softening: 2, stressed: 1, total: 11},
  groups: [
    {name: 'Indexes', rows: [
      {sym: 'SPY', m1: 1.6, asOf: '2026-07-28'}, {sym: 'QQQ', m1: -4.4, asOf: '2026-07-28'},
      {sym: 'DIA', m1: 1.8, asOf: '2026-07-28'}, {sym: 'IWM', m1: -2.2, asOf: '2026-07-28'},
      {sym: 'XLI', m1: 0.7, asOf: '2026-07-28'}, {sym: 'IYT', m1: -0.2, asOf: '2026-07-28'},
      {sym: 'XLY', m1: -1.7, asOf: '2026-07-28'}, {sym: 'XLP', m1: 2.8, asOf: '2026-07-28'},
    ]},
    {name: 'Innovation', rows: [{sym: 'SMH', m1: -13.4, asOf: '2026-07-28'}]},
    {name: 'Financial', rows: [{sym: 'XLF', m1: 7.5, asOf: '2026-07-28'}]},
    {name: 'Defensive', rows: [{sym: 'XLV', m1: 4.3, asOf: '2026-07-28'}]},
  ],
};

test('OOZEBOT market note is one deterministic measured-fact paragraph', () => {
  const note = buildMarketNote(sectorPayload);
  assert.equal(note.asOf, '2026-07-28');
  assert.match(note.paragraph, /Sector Watch is SOFTENING/);
  assert.match(note.paragraph, /8 of 11 tickers are steady/);
  assert.match(note.paragraph, /SMH.*−13\.4%/);
  assert.match(note.paragraph, /XLF.*\+7\.5%/);
  assert.match(note.paragraph, /22-session price change/);
  assert.equal(note.cadence, 'manual');
  assert.doesNotMatch(note.paragraph, /\n|forecast|will |should /i);
});
