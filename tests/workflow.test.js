const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflow = fs.readFileSync(path.resolve(__dirname, '..', '.github/workflows/collect.yml'), 'utf8');

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

test('daily collection enforces the methodology-v2 release gate before commit', () => {
  assert.match(workflow, /tests\/fetch\.test\.js/);
  assert.match(workflow, /tests\/backtest\.integration\.test\.js/);
  assert.match(workflow, /tests\/integrity\.test\.js/);
  assert.match(workflow, /tests\/release-gate\.test\.js/);
  assert.match(workflow, /node scripts\/release-gate\.js --inspect-only/);
  assert.ok(workflow.indexOf('node scripts/release-gate.js --inspect-only') < workflow.indexOf('git commit'));
});
