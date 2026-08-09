const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const repo = path.resolve(__dirname, '..');

function runNarrativeCheck(cwd = repo) {
  return spawnSync(process.execPath, ['scripts/narrative-check.js'], {
    cwd,
    encoding: 'utf8',
  });
}

function narrativeFixture() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oozemeter-narrative-'));
  for (const item of ['scripts', 'data']) {
    fs.cpSync(path.join(repo, item), path.join(tempRoot, item), {recursive: true});
  }
  fs.copyFileSync(path.join(repo, 'articles.js'), path.join(tempRoot, 'articles.js'));
  return tempRoot;
}

test('narrative gate accepts source-backed score claims and calibration definitions', () => {
  const run = runNarrativeCheck();
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.match(run.stdout, /narrative integrity: PASS/);
});

test('narrative gate still rejects an invented raw score claim', () => {
  const tempRoot = narrativeFixture();
  try {
    const articlesPath = path.join(tempRoot, 'articles.js');
    const articles = fs.readFileSync(articlesPath, 'utf8');
    fs.writeFileSync(articlesPath, articles.replace(
      "dek:'The study of economic slime: how stress actually moves through household budgets, measured instead of narrated.'",
      "dek:'The live household meter reads 88.'",
    ));

    const run = runNarrativeCheck(tempRoot);
    assert.notEqual(run.status, 0, 'an invented raw score must fail closed');
    assert.match(run.stderr, /raw score literal \"reads 88\"/);
  } finally {
    fs.rmSync(tempRoot, {recursive: true, force: true});
  }
});

for (const [label, claim] of [
  ['arbitrary numeric range', 'The live household meter reads 88-99 today.'],
  ['generic definitional word', 'The live household meter reads 88 because the alert requires attention.'],
  ['valid definition in the same sentence', 'Each line is scored 0-100 against fixed public anchors, and the live household meter reads 88.'],
]) {
  test(`narrative gate rejects an invented score hidden behind ${label}`, () => {
    const tempRoot = narrativeFixture();
    try {
      const articlesPath = path.join(tempRoot, 'articles.js');
      const articles = fs.readFileSync(articlesPath, 'utf8');
      fs.writeFileSync(articlesPath, articles.replace(
        "dek:'The study of economic slime: how stress actually moves through household budgets, measured instead of narrated.'",
        `dek:'${claim}'`,
      ));

      const run = runNarrativeCheck(tempRoot);
      assert.notEqual(run.status, 0, `${label} must fail closed`);
      assert.match(run.stderr, /raw score literal \"reads 88\"/);
    } finally {
      fs.rmSync(tempRoot, {recursive: true, force: true});
    }
  });
}

test('narrative gate rejects a frozen assertion that disagrees with its canonical source', () => {
  const tempRoot = narrativeFixture();
  try {
    const articlesPath = path.join(tempRoot, 'articles.js');
    const articles = fs.readFileSync(articlesPath, 'utf8');
    fs.writeFileSync(articlesPath, articles.replace(
      '{{market:2026-06=30}}',
      '{{market:2026-06=31}}',
    ));

    const run = runNarrativeCheck(tempRoot);
    assert.notEqual(run.status, 0, 'a mismatched source assertion must fail closed');
    assert.match(run.stderr, /expects 31, but data\/market-history\.json \(2026-06\) records 30/);
  } finally {
    fs.rmSync(tempRoot, {recursive: true, force: true});
  }
});
