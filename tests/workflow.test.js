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
  assert.match(workflow, /node scripts\/release-gate\.js --inspect-only/);
  assert.ok(workflow.indexOf('node scripts/release-gate.js --inspect-only') < workflow.indexOf('git commit'));
});

test('daily collection prefers the keyed FRED API when the secret is configured', () => {
  assert.match(workflow, /name: verify collector contracts[\s\S]*FRED_API_KEY:\s*\$\{\{ secrets\.FRED_API_KEY \}\}/);
  assert.match(workflow, /name: collect release-aware specimen[\s\S]*FRED_API_KEY:\s*\$\{\{ secrets\.FRED_API_KEY \}\}/);
});

test('daily collection rebuilds divergence after the household history is sealed', () => {
  assert.match(workflow, /tests\/market-divergence\.test\.js/);
  assert.match(workflow, /node scripts\/collect\.js[\s\S]*node scripts\/build-market-divergence\.js[\s\S]*node scripts\/market-integrity\.js/);
  assert.ok(workflow.indexOf('node scripts/build-market-divergence.js') < workflow.indexOf('git commit'));
});
