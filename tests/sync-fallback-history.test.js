const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const script = path.resolve(__dirname, '../scripts/sync-fallback-history.js');

test('fallback history synchronizer copies the canonical history into lab.js', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oozemeter-fallback-'));
  try {
    fs.mkdirSync(path.join(root, 'data'));
    fs.writeFileSync(path.join(root, 'data/history.json'), JSON.stringify([[2003, 44], [2003.083, 46]]));
    fs.writeFileSync(path.join(root, 'lab.js'), 'const BEFORE=true;\nconst HISTORY = [[2003,45]];\nconst AFTER=true;\n');

    const run = spawnSync(process.execPath, [script, '--root', root], {encoding: 'utf8'});
    assert.equal(run.status, 0, run.stderr || run.stdout);
    assert.equal(
      fs.readFileSync(path.join(root, 'lab.js'), 'utf8'),
      'const BEFORE=true;\nconst HISTORY = [[2003,44],[2003.083,46]];\nconst AFTER=true;\n',
    );
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('fallback history synchronizer fails closed when the target declaration is absent', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oozemeter-fallback-'));
  try {
    fs.mkdirSync(path.join(root, 'data'));
    fs.writeFileSync(path.join(root, 'data/history.json'), JSON.stringify([[2003, 44]]));
    fs.writeFileSync(path.join(root, 'lab.js'), 'const OTHER = [];\n');

    const run = spawnSync(process.execPath, [script, '--root', root], {encoding: 'utf8'});
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /HISTORY declaration/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
