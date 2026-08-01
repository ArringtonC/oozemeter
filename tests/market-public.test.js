const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const market = fs.readFileSync(path.join(root, 'market.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const marketCollector = fs.readFileSync(path.join(root, 'scripts/collect-market.js'), 'utf8');
const marketJson = fs.readFileSync(path.join(root, 'data/market.json'), 'utf8');
const marketJs = fs.readFileSync(path.join(root, 'data/market.js'), 'utf8');

test('Ward M renders the exact shared-history divergence chart', () => {
  assert.match(market, /data\/market-history\.js/);
  assert.match(market, /id="divergenceChart"/);
  assert.match(market, /Ward M vs\. the household jar/i);
  assert.match(market, /missing months remain gaps/i);
  assert.match(market, /renderDivergenceChart/);
});

test('Ward M exposes the deterministic OOZEBOT weekly market note', () => {
  assert.match(market, /id="marketNote"/);
  assert.match(market, /SD\.oozebot/);
  assert.match(market, /measured market note/i);
  const sectors = JSON.parse(fs.readFileSync(path.join(root, 'data/sectors.json'), 'utf8'));
  assert.equal(sectors.oozebot.byline, 'OOZEBOT');
  assert.equal(sectors.oozebot.asOf, sectors.groups.flatMap(group => group.rows).map(row => row.asOf).sort().at(-1));
  assert.doesNotMatch(sectors.oozebot.paragraph, /\n/);
});

test('Sector Watch public labels match its live observation windows', () => {
  assert.match(market, /observation collected/);
  assert.match(market, /\/22 sessions/);
  assert.doesNotMatch(market, /\/1mo|week of/);
});

test('Ward M metadata describes Sector Watch as manual rather than weekly', () => {
  assert.doesNotMatch(market, /<meta[^>]+content="[^"]*weekly/i);
  assert.match(market, /<meta[^>]+content="[^"]*manual/i);
});

test('published divergence data contains exact reconciled observations', () => {
  const history = JSON.parse(fs.readFileSync(path.join(root, 'data/market-history.json'), 'utf8'));
  assert.equal(history.observations, history.monthly.length);
  assert.equal(history.start, history.monthly[0].month);
  assert.equal(history.end, history.monthly.at(-1).month);
  assert.match(history.note, /current-revised inputs; not release-time vintages/i);
  assert.ok(history.monthly.some(row => row.month === '2025-09'));
  assert.ok(!history.monthly.some(row => row.month === '2025-10'));
  assert.ok(history.monthly.some(row => row.month === '2025-11'));
  for (const row of history.monthly) assert.equal(row.divergence, row.market - row.household);
});

test('Ward M links every gauge card to its deep public file', () => {
  assert.match(market, /market\/\$\{slug==='breadth'\?'sector-watch':slug\}\//);
  for (const slug of ['rates', 'volatility', 'credit', 'energy', 'dollar', 'sector-watch']) {
    assert.ok(fs.existsSync(path.join(root, 'market', slug, 'index.html')), `${slug} page missing`);
  }
});

test('current-comparison copy does not imply a lead or call a sticky ward quiet', () => {
  assert.doesNotMatch(market, /both wings quiet/i);
  assert.doesNotMatch(market, /preceded household pressure/i);
  assert.match(market, /does not establish timing or causality/i);
});

test('homepage describes Sector Watch as ticker proxies rather than sectors', () => {
  assert.match(home, /breadth\.total} ticker proxies steady/);
  assert.doesNotMatch(home, /breadth\.total} sectors steady/);
});

test('Ward M methodology does not describe ticker-proxy movement as literal sector behavior', () => {
  for (const source of [market, marketCollector, marketJson, marketJs]) {
    assert.doesNotMatch(source, /bleeding sector/i);
    assert.match(source, /weakening ticker proxy/i);
  }
});
