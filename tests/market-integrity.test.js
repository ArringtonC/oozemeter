const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {inspectMarketRelease} = require('../scripts/lib/market-integrity');
const root = path.resolve(__dirname, '..');

function disposableCopy() {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'ward-integrity-'));
  fs.mkdirSync(path.join(copy, 'data'));
  for (const file of ['market.json', 'market.js', 'sectors.json', 'sectors.js', 'market-history.json', 'market-history.js']) {
    fs.copyFileSync(path.join(root, 'data', file), path.join(copy, 'data', file));
  }
  for (const file of ['index.html', 'market.html']) fs.copyFileSync(path.join(root, file), path.join(copy, file));
  return copy;
}

test('current Ward M release passes numerical and public parity checks', () => {
  assert.deepEqual(inspectMarketRelease(root).failures, []);
  const sectors = JSON.parse(fs.readFileSync(path.join(root, 'data/sectors.json')));
  assert.equal(sectors.source.transport, 'Yahoo Finance chart endpoint');
  assert.equal(sectors.source.field, 'quote.close');
  assert.equal(sectors.source.returnBasis, 'price return; distributions not reinvested');
  assert.match(sectors.source.rightsStatus, /unresolved/i);
  const market = JSON.parse(fs.readFileSync(path.join(root, 'data/market.json')));
  assert.equal(market.sensors.rates.source.publisher, 'Federal Reserve Board yield inputs via FRED');
  assert.match(market.sensors.dollar.read, /can accompany global funding stress/i);
  assert.match(market.sensors.breadth.source.transport, /quote\.close/);
});

test('integrity gate rejects JSON/JavaScript drift and score drift', () => {
  const copy = disposableCopy();
  const market = JSON.parse(fs.readFileSync(path.join(copy, 'data/market.json')));
  market.score += 1;
  fs.writeFileSync(path.join(copy, 'data/market.json'), JSON.stringify(market));
  const failures = inspectMarketRelease(copy).failures.join('\n');
  assert.match(failures, /market JSON\/JavaScript drift/i);
  assert.match(failures, /market score does not recompute/i);
});

test('integrity gate rejects sector-state and OOZEBOT factual drift', () => {
  const copy = disposableCopy();
  const sectors = JSON.parse(fs.readFileSync(path.join(copy, 'data/sectors.json')));
  sectors.groups[0].rows[0].state = 'stressed';
  sectors.oozebot.paragraph = 'Markets look fine.';
  fs.writeFileSync(path.join(copy, 'data/sectors.json'), JSON.stringify(sectors));
  fs.writeFileSync(path.join(copy, 'data/sectors.js'), `window.SECTOR_DATA=${JSON.stringify(sectors)};\n`);
  const failures = inspectMarketRelease(copy).failures.join('\n');
  assert.match(failures, /sector state mismatch/i);
  assert.match(failures, /OOZEBOT note drift/i);
});

test('integrity gate protects Sector Watch interval provenance and finite returns', () => {
  const copy = disposableCopy();
  const sectors = JSON.parse(fs.readFileSync(path.join(copy, 'data/sectors.json')));
  sectors.source.windows = 'calendar guesses';
  sectors.groups[0].rows[0].m3 = null;
  fs.writeFileSync(path.join(copy, 'data/sectors.json'), JSON.stringify(sectors));
  fs.writeFileSync(path.join(copy, 'data/sectors.js'), `window.SECTOR_DATA=${JSON.stringify(sectors)};\n`);
  const failures = inspectMarketRelease(copy).failures.join('\n');
  assert.match(failures, /session-window provenance/i);
  assert.match(failures, /finite 22- and 64-session returns/i);
});

test('integrity gate rejects a breadth date that is newer than its underlying rows', () => {
  const copy = disposableCopy();
  const market = JSON.parse(fs.readFileSync(path.join(copy, 'data/market.json')));
  market.sensors.breadth.asOf = '2099-01-01';
  fs.writeFileSync(path.join(copy, 'data/market.json'), JSON.stringify(market));
  fs.writeFileSync(path.join(copy, 'data/market.js'), `window.MARKET_DATA=${JSON.stringify(market)};\n`);
  assert.match(inspectMarketRelease(copy).failures.join('\n'), /breadth observation date/i);
});

test('integrity gate rejects divergence arithmetic drift', () => {
  const copy = disposableCopy();
  const history = JSON.parse(fs.readFileSync(path.join(copy, 'data/market-history.json')));
  history.monthly[0].divergence += 1;
  fs.writeFileSync(path.join(copy, 'data/market-history.json'), JSON.stringify(history));
  fs.writeFileSync(path.join(copy, 'data/market-history.js'), `window.MARKET_HISTORY=${JSON.stringify(history)};\n`);
  assert.match(inspectMarketRelease(copy).failures.join('\n'), /divergence mismatch/i);
});

test('integrity gate rejects null and out-of-range history scores', () => {
  const copy = disposableCopy();
  const history = JSON.parse(fs.readFileSync(path.join(copy, 'data/market-history.json')));
  history.monthly[0] = {month: history.monthly[0].month, market: null, household: null, divergence: 0};
  history.monthly[1].market = 101;
  history.monthly[1].divergence = history.monthly[1].market - history.monthly[1].household;
  fs.writeFileSync(path.join(copy, 'data/market-history.json'), JSON.stringify(history));
  fs.writeFileSync(path.join(copy, 'data/market-history.js'), `window.MARKET_HISTORY=${JSON.stringify(history)};\n`);
  assert.match(inspectMarketRelease(copy).failures.join('\n'), /history scores must be finite numbers from 0 to 100/i);
});
