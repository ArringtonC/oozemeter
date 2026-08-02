const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {buildWeeklyBrief} = require('../scripts/lib/weekly-brief');

const NOW = new Date('2026-08-02T23:00:00.000Z');

function fixture(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-brief-'));
  fs.mkdirSync(path.join(root, 'data'), {recursive: true});
  const latest = {
    generated: '2026-08-01T15:24:45.288Z',
    methodologyVersion: '3.0.0',
    month: '2026-06',
    monthLabel: 'June 2026',
    prevMonthLabel: 'May 2026',
    ooze: 26,
    prevOoze: 29,
    collection: {status: 'ok', freshnessStatus: 'current', staleLines: []},
    lines: {
      gas: {delta: -11, contrib: 4, stale: false},
      housing: {delta: 1, contrib: 6, stale: false},
      inflation: {delta: -9, contrib: 2, stale: false},
      foreclosures: {delta: 2, contrib: 0, stale: false, contributesToOoze: false},
    },
  };
  const market = {
    generated: '2026-08-01T23:03:42.763Z',
    score: 37,
    calibrationStatus: 'calibrated-to-own-history; anchors provisional',
    sensors: {
      rates: {name: 'Rates', stress: 27, delta: -1, asOf: '2026-07'},
      energy: {name: 'Energy', stress: 49, delta: -7, asOf: '2026-07'},
      breadth: {name: 'Breadth', stress: 50, delta: 0, asOf: '2026-07-31'},
    },
  };
  const history = {
    generated: '2026-08-01T23:35:18.922Z',
    end: '2026-06',
    observations: 233,
    monthly: [
      {month: '2026-05', market: 34, household: 29, divergence: 5},
      {month: '2026-06', market: 36, household: 26, divergence: 10},
    ],
  };
  const editorial = {month: '2026-06', verdict: 'Calmer than 6 of every 10 months since 2003'};
  const files = {latest, market, history, editorial, ...overrides};
  fs.writeFileSync(path.join(root, 'data/latest.json'), JSON.stringify(files.latest));
  fs.writeFileSync(path.join(root, 'data/market.json'), JSON.stringify(files.market));
  fs.writeFileSync(path.join(root, 'data/market-history.json'), JSON.stringify(files.history));
  fs.writeFileSync(path.join(root, 'data/editorial.json'), JSON.stringify(files.editorial));
  return root;
}

const PASSING_GATES = [
  {name: 'household integrity', command: 'node scripts/integrity.js', ok: true, blocking: true},
  {name: 'market integrity', command: 'node scripts/market-integrity.js', ok: true, blocking: true},
];

test('a passing weekly run produces a READY package with both scores and no invented labels', () => {
  const root = fixture();
  try {
    const brief = buildWeeklyBrief({root, now: NOW, gates: PASSING_GATES});
    assert.equal(brief.status, 'ready');
    assert.deepEqual(brief.failures, []);
    assert.equal(brief.household.score, 26);
    assert.equal(brief.household.band, 'Sticky');
    assert.equal(brief.household.month, '2026-06');
    assert.equal(brief.market.score, 37);
    assert.equal(brief.market.band, null, 'Ward M has no published band vocabulary and must not invent one');
    assert.match(brief.discord, /Household OOZE: 26 \(Sticky\)/);
    assert.match(brief.discord, /Market OOZE \(Ward M\): 37/);
    assert.match(brief.email, /HOUSEHOLD OOZE/);
    assert.match(brief.email, /MARKET OOZE/);
    assert.match(brief.email, /SYSTEM CHECK/);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('week-over-week change comes from the previous weekly package, never from monthly history', () => {
  const root = fixture();
  try {
    const previous = {generated: '2026-07-26T23:00:00.000Z', household: {score: 29}, market: {score: 32}};
    const brief = buildWeeklyBrief({root, now: NOW, gates: PASSING_GATES, previous});
    assert.equal(brief.household.weeklyChange, -3);
    assert.equal(brief.market.weeklyChange, 5);
    assert.match(brief.discord, /down 3/);
    assert.match(brief.discord, /up 5/);

    const first = buildWeeklyBrief({root, now: NOW, gates: PASSING_GATES});
    assert.equal(first.household.weeklyChange, null);
    assert.equal(first.market.weeklyChange, null);
    assert.match(first.discord, /first weekly package/i);
    assert.doesNotMatch(first.discord, /\bup 0\b|\bdown 0\b/);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('a failed blocking gate produces a FAILED package that publishes no scores', () => {
  const root = fixture();
  try {
    const gates = [
      {name: 'household integrity', command: 'node scripts/integrity.js', ok: true, blocking: true},
      {name: 'market integrity', command: 'node scripts/market-integrity.js', ok: false, blocking: true, detail: 'stale acquisition'},
    ];
    const brief = buildWeeklyBrief({root, now: NOW, gates});
    assert.equal(brief.status, 'failed');
    assert.ok(brief.failures.some(failure => /market integrity/.test(failure)));
    assert.match(brief.discord, /failed validation/i);
    assert.match(brief.discord, /No report was distributed/i);
    assert.doesNotMatch(brief.discord, /\b26\b|\b37\b/);
    assert.equal(brief.email, null);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('the intentionally blocked publication gate is reported without failing the weekly run', () => {
  const root = fixture();
  try {
    const gates = [
      ...PASSING_GATES,
      {name: 'methodology v3 publication', command: 'node scripts/release-gate.js --inspect-only', ok: false, blocking: false, detail: 'disclosure copy pending'},
    ];
    const brief = buildWeeklyBrief({root, now: NOW, gates});
    assert.equal(brief.status, 'ready');
    assert.match(brief.email, /methodology v3 publication: blocked \(expected\)/);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('a gate detail is summarized to one readable line, never a raw JSON dump', () => {
  const root = fixture();
  const rawJson = JSON.stringify({
    status: 'fail',
    failures: ['disclosure missing from notes.html', 'fallback history is stale', 'archive must identify v3'],
  });
  try {
    const gates = [
      ...PASSING_GATES,
      {name: 'methodology v3 publication', command: 'node scripts/release-gate.js --inspect-only', ok: false, blocking: false, detail: rawJson},
    ];
    const brief = buildWeeklyBrief({root, now: NOW, gates});
    assert.equal(brief.status, 'ready');
    const gateLine = brief.email.split('\n').find(line => /methodology v3 publication/.test(line));
    assert.ok(gateLine.length < 160, `gate line should stay readable, got ${gateLine.length} chars`);
    assert.doesNotMatch(gateLine, /[{}"]/, 'gate line must not contain raw JSON punctuation');
    assert.match(gateLine, /3 blocker/);
    assert.match(gateLine, /disclosure missing from notes\.html/);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('stale or missing household evidence fails closed instead of publishing a stale score', () => {
  const stale = fixture({
    latest: {
      generated: '2026-08-01T15:24:45.288Z', methodologyVersion: '3.0.0', month: '2026-06', monthLabel: 'June 2026',
      prevMonthLabel: 'May 2026', ooze: 26, prevOoze: 29,
      collection: {status: 'ok', freshnessStatus: 'stale', staleLines: ['gas']},
      lines: {gas: {delta: -11, contrib: 4, stale: true}},
    },
  });
  try {
    const brief = buildWeeklyBrief({root: stale, now: NOW, gates: PASSING_GATES});
    assert.equal(brief.status, 'failed');
    assert.ok(brief.failures.some(failure => /stale/i.test(failure)));
  } finally {
    fs.rmSync(stale, {recursive: true, force: true});
  }

  const missing = fixture();
  fs.rmSync(path.join(missing, 'data/market.json'));
  try {
    const brief = buildWeeklyBrief({root: missing, now: NOW, gates: PASSING_GATES});
    assert.equal(brief.status, 'failed');
    assert.ok(brief.failures.some(failure => /market\.json/.test(failure)));
  } finally {
    fs.rmSync(missing, {recursive: true, force: true});
  }
});

test('a non-finite or malformed score fails closed', () => {
  for (const ooze of [null, 'twenty-six', Number.NaN, 26.5]) {
    const root = fixture({
      latest: {
        generated: '2026-08-01T15:24:45.288Z', methodologyVersion: '3.0.0', month: '2026-06', monthLabel: 'June 2026',
        prevMonthLabel: 'May 2026', ooze, prevOoze: 29,
        collection: {status: 'ok', freshnessStatus: 'current', staleLines: []},
        lines: {gas: {delta: -11, contrib: 4, stale: false}},
      },
    });
    try {
      const brief = buildWeeklyBrief({root, now: NOW, gates: PASSING_GATES});
      assert.equal(brief.status, 'failed', `expected failure for ooze=${String(ooze)}`);
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
  }
});

test('the biggest movers are read from the data and exclude auxiliary lines', () => {
  const root = fixture();
  try {
    const brief = buildWeeklyBrief({root, now: NOW, gates: PASSING_GATES});
    assert.equal(brief.household.biggestMover.key, 'gas');
    assert.equal(brief.household.biggestMover.delta, -11);
    assert.equal(brief.market.biggestMover.key, 'energy');
    assert.equal(brief.market.biggestMover.delta, -7);
    assert.doesNotMatch(JSON.stringify(brief.household.biggestMover), /foreclosures/);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('the brief states the divergence basis and never claims causality between the two scores', () => {
  const root = fixture();
  try {
    const brief = buildWeeklyBrief({root, now: NOW, gates: PASSING_GATES});
    assert.equal(brief.divergence.month, '2026-06');
    assert.equal(brief.divergence.value, 10);
    assert.match(brief.email, /exact shared month/i);
    assert.doesNotMatch(brief.email, /because|causes|will |forecast|predict/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
