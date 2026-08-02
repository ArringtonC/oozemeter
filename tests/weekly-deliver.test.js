const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const REPO = path.resolve(__dirname, '..');
const CLI = path.join(REPO, 'scripts', 'weekly-deliver.js');

function run(args) {
  try {
    return {code: 0, stdout: execFileSync('node', [CLI, ...args], {cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']})};
  } catch (error) {
    return {code: error.status, stdout: error.stdout || '', stderr: error.stderr || ''};
  }
}

function seed(status, {date = '2026-08-02', ageHours = 12} = {}) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-deliver-'));
  const dir = path.join(out, date);
  fs.mkdirSync(dir, {recursive: true});
  const generated = new Date(Date.now() - ageHours * 3600 * 1000).toISOString();
  const manifest = {
    date,
    status,
    generated,
    failures: status === 'ready' ? [] : ['market integrity failed: stale acquisition'],
    household: status === 'ready' ? {score: 26, band: 'Sticky'} : null,
    market: status === 'ready' ? {score: 37, band: null} : null,
    discord: status === 'ready'
      ? '**OOZEMeter Weekly Update**\nHousehold OOZE: 26 (Sticky)\nMarket OOZE (Ward M): 37'
      : '**OOZEMeter weekly run failed validation.**\nNo report was distributed.',
    email: status === 'ready' ? 'OOZEMETER WEEKLY BRIEF\n\nHOUSEHOLD OOZE\n  Score: 26/100' : null,
  };
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(manifest, null, 1));
  fs.writeFileSync(path.join(dir, 'discord.txt'), manifest.discord);
  if (status === 'ready') {
    fs.writeFileSync(path.join(dir, 'email.txt'), manifest.email);
    fs.writeFileSync(path.join(dir, 'READY'), `${generated}\n`);
  } else {
    fs.writeFileSync(path.join(dir, 'FAILED'), `${generated}\n`);
  }
  fs.writeFileSync(path.join(out, 'latest.json'), JSON.stringify({date, status, generated, packageDir: dir}, null, 1));
  return {out, dir};
}

test('a READY package emits the Discord summary and the email as separate deliverables', () => {
  const {out} = seed('ready');
  try {
    const result = run(['--out', out]);
    assert.equal(result.code, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.status, 'ready');
    assert.equal(payload.deliver, true);
    assert.match(payload.discord, /Household OOZE: 26/);
    assert.match(payload.email.body, /OOZEMETER WEEKLY BRIEF/);
    assert.match(payload.email.subject, /OOZEMeter Weekly Reports — 2026-08-02/);
  } finally {
    fs.rmSync(out, {recursive: true, force: true});
  }
});

test('a FAILED package emits the failure alert and no email', () => {
  const {out} = seed('failed');
  try {
    const result = run(['--out', out]);
    assert.notEqual(result.code, 0);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.status, 'failed');
    assert.equal(payload.deliver, true, 'a failure must still be announced, not silently dropped');
    assert.match(payload.discord, /failed validation/i);
    assert.equal(payload.email, null);
    assert.doesNotMatch(payload.discord, /Household OOZE: \d/);
  } finally {
    fs.rmSync(out, {recursive: true, force: true});
  }
});

test('a missing package is reported as a failure rather than silence', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-deliver-empty-'));
  try {
    const result = run(['--out', out]);
    assert.notEqual(result.code, 0);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.status, 'missing');
    assert.equal(payload.deliver, true);
    assert.match(payload.discord, /no weekly package/i);
    assert.equal(payload.email, null);
  } finally {
    fs.rmSync(out, {recursive: true, force: true});
  }
});

test('a stale package is refused instead of re-sending last week as if it were current', () => {
  const {out} = seed('ready', {ageHours: 100});
  try {
    const result = run(['--out', out, '--max-age-hours', '48']);
    assert.notEqual(result.code, 0);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.status, 'stale');
    assert.match(payload.discord, /stale/i);
    assert.equal(payload.email, null);
    assert.doesNotMatch(payload.discord, /Household OOZE: 26/);
  } finally {
    fs.rmSync(out, {recursive: true, force: true});
  }
});

test('the same package is not delivered twice unless resend is explicit', () => {
  const {out, dir} = seed('ready');
  try {
    const first = run(['--out', out, '--mark-delivered']);
    assert.equal(first.code, 0);
    assert.equal(JSON.parse(first.stdout).deliver, true);
    assert.ok(fs.existsSync(path.join(dir, 'DELIVERED')));

    const second = run(['--out', out, '--mark-delivered']);
    const payload = JSON.parse(second.stdout);
    assert.equal(payload.deliver, false);
    assert.equal(payload.status, 'already-delivered');
    assert.equal(payload.email, null);

    const forced = run(['--out', out, '--mark-delivered', '--resend']);
    assert.equal(JSON.parse(forced.stdout).deliver, true);
  } finally {
    fs.rmSync(out, {recursive: true, force: true});
  }
});
