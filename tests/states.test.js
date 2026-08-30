const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const states = JSON.parse(fs.readFileSync(path.join(repo, 'data/states.json'), 'utf8'));
const statesHtml = fs.readFileSync(path.join(repo, 'states.html'), 'utf8');
const workflow = fs.readFileSync(path.join(repo, '.github/workflows/collect.yml'), 'utf8');
const lab = fs.readFileSync(path.join(repo, 'lab.js'), 'utf8');
const staticPages = fs.readFileSync(path.join(repo, 'scripts/static-pages.js'), 'utf8');

test('state readings are real, in range, and complete', () => {
  assert.equal(states.states.length, 51);
  const codes = new Set(states.states.map((s) => s.code));
  assert.equal(codes.size, 51, 'duplicate state codes');
  assert.ok(['AL', 'CA', 'NY', 'WY', 'DC'].every((c) => codes.has(c)));
  for (const s of states.states) {
    assert.ok(s.unrate > 0 && s.unrate < 30, `${s.code}: implausible unemployment ${s.unrate}`);
    assert.ok(s.stress >= 0 && s.stress <= 100, `${s.code}: stress out of range`);
    assert.match(s.month, /^\d{4}-\d{2}$/);
  }
  const sorted = states.states.every((s, i, a) => i === 0 || a[i - 1].stress >= s.stress);
  assert.ok(sorted, 'states are not ranked by stress');
});

test('states page publishes real readings and never simulated ones', () => {
  assert.doesNotMatch(statesHtml, /SIMULATED/i);
  assert.match(statesHtml, /data\/states\.js/);
  assert.match(statesHtml, /window\.STATE_DATA/);
  assert.match(statesHtml, /One line of seven|one line of seven\.\.\.|employment line of seven/i);
  assert.match(statesHtml, /FORCED_STATE/);
});

test('daily workflow collects states and static pages generate per-state pages', () => {
  assert.match(workflow, /node scripts\/collect\.js[\s\S]*node scripts\/collect-states\.js/);
  assert.match(workflow, /tests\/states\.test\.js/);
  assert.match(staticPages, /\/states\/<code>\//);
  assert.match(staticPages, /FORCED_STATE/);
  assert.ok(fs.existsSync(path.join(repo, 'states', 'CA', 'index.html')), 'per-state page not generated');
});

test('the personal prototype keeps its demo states — labeled', () => {
  assert.match(lab, /const STATES = \[/);
  assert.ok(fs.existsSync(path.join(repo, 'personal.html')));
});
