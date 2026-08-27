const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflow = fs.readFileSync(path.resolve(__dirname, '..', '.github/workflows/collect.yml'), 'utf8');

test('write-capable daily workflow pins third-party actions to commit SHAs', () => {
  assert.doesNotMatch(workflow, /uses:\s+actions\/(?:checkout|setup-node)@v\d+/);
  assert.match(workflow, /uses:\s+actions\/checkout@[0-9a-f]{40}/);
  assert.match(workflow, /uses:\s+actions\/setup-node@[0-9a-f]{40}/);
});

test('daily collection opens or updates one actionable failure issue', () => {
  assert.match(workflow, /permissions:\s*\n\s+contents: write\s*\n\s+issues: write/);
  assert.match(workflow, /name: alert on collection failure[\s\S]*if:.*failure\(\)/);
  assert.match(workflow, /GH_TOKEN:.*github\.token/);
  assert.match(workflow, /gh issue list[\s\S]*gh issue comment[\s\S]*gh issue create/);
  assert.match(workflow, /GITHUB_SERVER_URL.*GITHUB_REPOSITORY.*GITHUB_RUN_ID/);
});

test('daily collection closes the standing alert after recovery', () => {
  assert.match(workflow, /name: close recovered collection alert[\s\S]*if:.*success\(\)/);
  assert.match(workflow, /gh issue close[\s\S]*--comment/);
});

test('daily collection enforces the methodology release gate before commit', () => {
  assert.match(workflow, /tests\/fetch\.test\.js/);
  assert.match(workflow, /tests\/backtest\.integration\.test\.js/);
  assert.match(workflow, /tests\/integrity\.test\.js/);
  assert.match(workflow, /tests\/release-gate\.test\.js/);
  assert.match(workflow, /tests\/narrative-check\.test\.js/);
  assert.match(workflow, /tests\/sync-fallback-history\.test\.js/);
  assert.match(workflow, /node scripts\/sync-fallback-history\.js[\s\S]*node scripts\/release-gate\.js --inspect-only/);
  assert.match(workflow, /node scripts\/release-gate\.js --inspect-only/);
  assert.match(workflow, /git add[^\n]*\blab\.js\b/);
  assert.ok(workflow.indexOf('node scripts/sync-fallback-history.js') < workflow.indexOf('node scripts/release-gate.js --inspect-only'));
  assert.ok(workflow.indexOf('node scripts/release-gate.js --inspect-only') < workflow.indexOf('git commit'));
});

test('daily collection prefers the keyed FRED API when the secret is configured', () => {
  assert.match(workflow, /name: verify collector contracts[\s\S]*FRED_API_KEY:\s*\$\{\{ secrets\.FRED_API_KEY \}\}/);
  assert.match(workflow, /name: collect release-aware specimen[\s\S]*FRED_API_KEY:\s*\$\{\{ secrets\.FRED_API_KEY \}\}/);
});

test('daily household seal rebuilds exact-month divergence from the latest approved Market history', () => {
  assert.match(workflow, /tests\/market-divergence\.test\.js/);
  assert.match(workflow, /node scripts\/collect\.js[\s\S]*node scripts\/build-market-divergence\.js[\s\S]*node scripts\/market-integrity\.js[\s\S]*node scripts\/release-gate\.js --inspect-only/);
  assert.match(workflow, /git add[^\n]*data\/market-history\.json data\/market-history\.js/);
  assert.ok(workflow.indexOf('node scripts/build-market-divergence.js') < workflow.indexOf('git commit'));
});

test('source revisions regenerate the archive before any gate compares', () => {
  /* The archive reconstructions bake literals, so a FRED revision that moves the
     jar's history necessarily drifts them. collect.yml must rebuild backtest ->
     reconstructions -> static pages from the same revised data BEFORE
     narrative-check runs, and commit research/, files/ and sitemap.xml with
     them — the artifacts the reconstructions assert against. This is the
     2026-08-14 / 2026-08-26 drift, twice in a fortnight — pin it. */
  assert.ok(workflow.indexOf('node scripts/backtest.js') < workflow.indexOf('node scripts/backfill-reports.js'));
  assert.ok(workflow.indexOf('node scripts/backfill-reports.js') < workflow.indexOf('node scripts/static-pages.js'));
  assert.ok(workflow.indexOf('node scripts/static-pages.js') < workflow.indexOf('node scripts/narrative-check.js'));
  assert.match(workflow, /node scripts\/backtest\.js[\s\S]*node scripts\/backfill-reports\.js[\s\S]*node scripts\/narrative-check\.js/);
  assert.match(workflow, /git add[^\n]*\bresearch\//);
  assert.match(workflow, /git add[^\n]*\bfiles\//);
  assert.match(workflow, /git add[^\n]*\bsitemap\.xml\b/);
});
