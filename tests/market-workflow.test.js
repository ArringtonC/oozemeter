const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflowPath = path.join(__dirname, '..', '.github/workflows/market.yml');

test('hosted Ward M workflow remains manual-only until quote rights are cleared', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  assert.match(workflow, /workflow_dispatch/);
  assert.doesNotMatch(workflow, /schedule:/);
  assert.match(workflow, /QUOTE RIGHTS GATE/);
  assert.match(workflow, /tests\/market-output\.test\.js/);
  assert.match(workflow, /tests\/market-integrity\.test\.js/);
  assert.match(workflow, /node scripts\/collect-sectors\.js[\s\S]*node scripts\/collect-market\.js/);
  assert.match(workflow, /node scripts\/market-integrity\.js/);
  assert.match(workflow, /git add data\/market\.json data\/market\.js data\/sectors\.json data\/sectors\.js/);
});

test('hosted Ward M workflow has serialized push and failure recovery alerts', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  assert.match(workflow, /contents:\s*write/);
  assert.match(workflow, /issues:\s*write/);
  assert.match(workflow, /cancel-in-progress:\s*false/);
  assert.match(workflow, /\[OOZEMeter\] Ward M collection failure/);
  assert.match(workflow, /gh issue close/);
  assert.match(workflow, /actions\/checkout@11d5960a326750d5838078e36cf38b85af677262/);
  assert.match(workflow, /actions\/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020/);
});

test('hosted Ward M workflow runs strict Yahoo parser and Sector Watch interval contracts', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  assert.match(workflow, /tests\/market-sector\.test\.js/);
});
