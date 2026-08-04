const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');
const gauges = ['rates', 'volatility', 'credit', 'energy', 'dollar', 'sector-watch'];
const lessons = ['0009-rates.html', '0010-volatility.html', '0011-credit-funding.html', '0012-energy.html', '0013-dollar.html', '0014-sector-watch.html'];

test('all six Ward M gauge files have deep public sections and canonical URLs', () => {
  for (const slug of gauges) {
    const file = path.join(root, 'market', slug, 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, new RegExp(`<link rel="canonical" href="https://arringtonc\\.github\\.io/oozemeter/market/${slug}/">`));
    assert.match(html, /Why this gauge matters/i);
    assert.match(html, /How it behaved in 2008/i);
    assert.match(html, /Frequently asked questions/i);
    assert.match(html, /data\/market\.js/);
    /* since methodology v3 the NFCI gauge shares its series with the household
       jar at 3% weight, so the blanket firewall sentence is false for it */
    if (slug === 'credit') assert.match(html, /shares its series with the household jar/i);
    else assert.match(html, /does not affect the household Ooze Score/i);
    assert.match(html, /current-vintage reconstruction, not the release-time view available in 2008/i);
  }
});

test('all six Ward M teach lessons document measurement, interpretation, and reproduction', () => {
  for (const file of lessons) {
    const html = fs.readFileSync(path.join(root, 'research/lessons', file), 'utf8');
    assert.match(html, /Know the measurement/i);
    assert.match(html, /Interpret it without overclaiming/i);
    assert.match(html, /Reproduce the data path/i);
    assert.match(html, /Limits|limitation/i);
  }
});

test('source-signed lessons preserve the material gauge limitations', () => {
  const page = slug => fs.readFileSync(path.join(root, 'market', slug, 'index.html'), 'utf8');
  assert.match(page('rates'), /cycle-warning measure, not a contemporaneous stress meter/i);
  assert.match(page('rates'), /modeled par yields/i);
  assert.match(page('volatility'), /risk-neutral distribution and volatility risk premium/i);
  assert.match(page('credit'), /entire NFCI history can change/i);
  assert.match(page('energy'), /falling WTI can accompany collapsing demand/i);
  assert.match(page('dollar'), /historical reconstruction under the revised methodology/i);
  const sectors = page('sector-watch');
  assert.match(sectors, /11-ticker equity breadth proxy panel/i);
  assert.match(sectors, /not a total-return series/i);
  assert.match(sectors, /live gauge uses a 22-session daily interval; the research backtest uses successive monthly closes/i);
  assert.match(sectors, /at least 65 valid quote\.close observations/i);
  assert.match(sectors, /22-session and 64-session intervals/i);
  assert.match(sectors, /quote rights remain unresolved/i);
});

test('committed Ward M lessons and gauge pages match a clean generator run', () => {
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ward-pages-'));
  execFileSync(process.execPath, [path.join(root, 'scripts/market-pages.js')], {
    env: {...process.env, MARKET_PAGES_ROOT: outputRoot},
  });
  for (const slug of gauges) {
    assert.equal(fs.readFileSync(path.join(outputRoot, 'market', slug, 'index.html'), 'utf8'), fs.readFileSync(path.join(root, 'market', slug, 'index.html'), 'utf8'));
  }
  for (const file of lessons) {
    assert.equal(fs.readFileSync(path.join(outputRoot, 'research/lessons', file), 'utf8'), fs.readFileSync(path.join(root, 'research/lessons', file), 'utf8'));
  }
});
