const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const REPO = path.resolve(__dirname, '..');
const CLI = path.join(REPO, 'scripts', 'weekly-package.js');

function run(args, env = {}) {
  try {
    const stdout = execFileSync('node', [CLI, ...args], {
      cwd: REPO,
      env: {...process.env, ...env},
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {code: 0, stdout};
  } catch (error) {
    return {code: error.status, stdout: error.stdout || '', stderr: error.stderr || ''};
  }
}

test('the Sunday build stage writes a dated READY package the Monday stage can read', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-package-'));
  try {
    const result = run(['--out', out, '--date', '2026-08-02', '--skip-gates']);
    assert.equal(result.code, 0, result.stderr);

    const packageDir = path.join(out, '2026-08-02');
    const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
    assert.equal(manifest.status, 'ready');
    assert.equal(manifest.date, '2026-08-02');
    assert.ok(Number.isInteger(manifest.household.score));
    assert.ok(Number.isInteger(manifest.market.score));

    assert.ok(fs.existsSync(path.join(packageDir, 'discord.txt')));
    assert.ok(fs.existsSync(path.join(packageDir, 'email.txt')));
    assert.equal(fs.readFileSync(path.join(packageDir, 'discord.txt'), 'utf8'), manifest.discord);

    /* the READY marker is what Monday keys on */
    assert.ok(fs.existsSync(path.join(packageDir, 'READY')));
    assert.ok(!fs.existsSync(path.join(packageDir, 'FAILED')));

    /* latest pointer lets Monday find the newest package without guessing */
    const latest = JSON.parse(fs.readFileSync(path.join(out, 'latest.json'), 'utf8'));
    assert.equal(latest.date, '2026-08-02');
    assert.equal(latest.status, 'ready');
  } finally {
    fs.rmSync(out, {recursive: true, force: true});
  }
});

test('a failing gate writes a FAILED package with no email and a nonzero exit', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-package-fail-'));
  try {
    const result = run(['--out', out, '--date', '2026-08-02', '--force-gate-failure', 'market integrity']);
    assert.notEqual(result.code, 0);

    const packageDir = path.join(out, '2026-08-02');
    const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
    assert.equal(manifest.status, 'failed');
    assert.ok(manifest.failures.some(failure => /market integrity/.test(failure)));
    assert.equal(manifest.email, null);

    assert.ok(fs.existsSync(path.join(packageDir, 'FAILED')));
    assert.ok(!fs.existsSync(path.join(packageDir, 'READY')));
    assert.ok(!fs.existsSync(path.join(packageDir, 'email.txt')));

    const discord = fs.readFileSync(path.join(packageDir, 'discord.txt'), 'utf8');
    assert.match(discord, /failed validation/i);
    assert.doesNotMatch(discord, /Household OOZE: \d/);
  } finally {
    fs.rmSync(out, {recursive: true, force: true});
  }
});

test('the second run picks up the previous package for week-over-week change', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-package-prev-'));
  try {
    run(['--out', out, '--date', '2026-07-26', '--skip-gates']);

    /* rewrite the older package with different scores so the delta is observable */
    const older = path.join(out, '2026-07-26', 'package.json');
    const manifest = JSON.parse(fs.readFileSync(older, 'utf8'));
    const shifted = manifest.household.score + 4;
    manifest.household.score = shifted;
    manifest.market.score = manifest.market.score - 2;
    fs.writeFileSync(older, JSON.stringify(manifest, null, 1));

    const result = run(['--out', out, '--date', '2026-08-02', '--skip-gates']);
    assert.equal(result.code, 0, result.stderr);
    const next = JSON.parse(fs.readFileSync(path.join(out, '2026-08-02', 'package.json'), 'utf8'));
    assert.equal(next.household.weeklyChange, next.household.score - shifted);
    assert.equal(next.market.weeklyChange, 2);
  } finally {
    fs.rmSync(out, {recursive: true, force: true});
  }
});

test('the CLI never mutates repository data artifacts', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-package-readonly-'));
  const before = execFileSync('git', ['status', '--porcelain', 'data'], {cwd: REPO, encoding: 'utf8'});
  try {
    run(['--out', out, '--date', '2026-08-02', '--skip-gates']);
    const after = execFileSync('git', ['status', '--porcelain', 'data'], {cwd: REPO, encoding: 'utf8'});
    assert.equal(after, before);
  } finally {
    fs.rmSync(out, {recursive: true, force: true});
  }
});

test('divergence-history freshness is reported as a non-blocking gate, not silently ignored', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-package-evidence-'));
  try {
    const result = run(['--out', out, '--date', '2026-08-02']);
    const manifest = JSON.parse(fs.readFileSync(path.join(out, '2026-08-02', 'package.json'), 'utf8'));
    const gate = manifest.gates.find(entry => /divergence-history freshness/.test(entry.name));
    assert.ok(gate, 'the weekly gate roster must include the Ward current-evidence check');
    assert.equal(gate.blocking, false, 'stale Ward history must not block the household weekly brief');
    assert.match(manifest.email, /divergence-history freshness/);
    /* a stale Ward acquisition must never silently pass as current */
    if (!gate.ok) assert.match(manifest.email, /divergence-history freshness: blocked \(expected\)/);
  } finally {
    fs.rmSync(out, {recursive: true, force: true});
  }
});
