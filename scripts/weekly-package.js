#!/usr/bin/env node
/* ============================================================
   OOZEMeter weekly package builder — the Sunday stage.

   Runs the existing integrity gates, then assembles a dated
   weekly package from artifacts that already passed them.
   Writes nothing into data/; the repository is read-only here.

   Output layout (default root: .weekly/):
     .weekly/latest.json              pointer to the newest package
     .weekly/<YYYY-MM-DD>/package.json  full manifest
     .weekly/<YYYY-MM-DD>/discord.txt   Monday Discord summary
     .weekly/<YYYY-MM-DD>/email.txt     combined email body (ready only)
     .weekly/<YYYY-MM-DD>/READY|FAILED  marker the Monday stage keys on

   Exit code is nonzero when the package failed validation, so a
   scheduler can tell a bad week from a good one without parsing.
   ============================================================ */
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {buildWeeklyBrief} = require('./lib/weekly-brief');

const REPO = path.resolve(__dirname, '..');

/* Gates are the checks that already exist in this repository.
   blocking:false means a known, intentional block that must be
   reported but must not suppress the weekly brief. */
const GATES = [
  {name: 'household integrity', command: ['node', 'scripts/integrity.js'], blocking: true},
  {name: 'market integrity', command: ['node', 'scripts/market-integrity.js'], blocking: true},
  {name: 'frozen v2 baseline', command: ['python3', 'research/household_v2_baseline.py'], blocking: true},
  /* Ward historical evidence ages between manual refreshes. That is expected and
     must be shown, but it does not invalidate this week's household reading. */
  {name: 'divergence-history freshness', command: ['node', 'scripts/market-integrity.js', '--require-current-evidence'], blocking: false},
  {name: 'methodology v3 publication', command: ['node', 'scripts/release-gate.js', '--inspect-only'], blocking: false},
];

function flag(name, fallback = null) {
  const index = process.argv.indexOf(name);
  if (index < 0) return fallback;
  const value = process.argv[index + 1];
  return value && !value.startsWith('--') ? value : true;
}

function runGate(gate) {
  const [command, ...args] = gate.command;
  try {
    execFileSync(command, args, {cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
    return {name: gate.name, command: gate.command.join(' '), ok: true, blocking: gate.blocking};
  } catch (error) {
    /* Pass the last full line through untruncated: the brief's summarizer
       parses structured gate reports and renders one readable clause.
       Truncating here would corrupt the JSON and lose the blocker count. */
    const output = (error.stdout || error.stderr || error.message || '').trim();
    const detail = output.split('\n').filter(Boolean).slice(-1)[0] || '';
    return {name: gate.name, command: gate.command.join(' '), ok: false, blocking: gate.blocking, detail};
  }
}

function readPrevious(outRoot, date) {
  const pointer = path.join(outRoot, 'latest.json');
  if (!fs.existsSync(pointer)) return null;
  try {
    const latest = JSON.parse(fs.readFileSync(pointer, 'utf8'));
    if (!latest || latest.date === date) return null;
    const manifest = path.join(outRoot, latest.date, 'package.json');
    if (!fs.existsSync(manifest)) return null;
    const previous = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    return previous.status === 'ready' ? previous : null;
  } catch {
    return null;
  }
}

function main() {
  const outRoot = path.resolve(flag('--out', path.join(REPO, '.weekly')));
  const date = flag('--date') || new Date().toISOString().slice(0, 10);
  const skipGates = process.argv.includes('--skip-gates');
  const forcedFailure = flag('--force-gate-failure');

  let gates;
  if (skipGates) {
    gates = GATES.map(gate => ({name: gate.name, command: gate.command.join(' '), ok: true, blocking: gate.blocking, skipped: true}));
  } else {
    gates = GATES.map(runGate);
  }
  if (typeof forcedFailure === 'string') {
    gates = gates.map(gate => gate.name === forcedFailure
      ? {...gate, ok: false, detail: 'forced failure (test harness)'}
      : gate);
  }

  const previous = readPrevious(outRoot, date);
  const brief = buildWeeklyBrief({
    root: REPO,
    now: new Date(),
    gates,
    previous,
    nextRun: flag('--next-run'),
  });

  const packageDir = path.join(outRoot, date);
  fs.mkdirSync(packageDir, {recursive: true});
  const manifest = {date, ...brief};
  fs.writeFileSync(path.join(packageDir, 'package.json'), JSON.stringify(manifest, null, 1));
  fs.writeFileSync(path.join(packageDir, 'discord.txt'), brief.discord);

  const ready = brief.status === 'ready';
  if (ready) {
    fs.writeFileSync(path.join(packageDir, 'email.txt'), brief.email);
    fs.writeFileSync(path.join(packageDir, 'READY'), `${brief.generated}\n`);
    fs.rmSync(path.join(packageDir, 'FAILED'), {force: true});
  } else {
    fs.rmSync(path.join(packageDir, 'email.txt'), {force: true});
    fs.rmSync(path.join(packageDir, 'READY'), {force: true});
    fs.writeFileSync(path.join(packageDir, 'FAILED'), `${brief.generated}\n${brief.failures.join('\n')}\n`);
  }

  fs.writeFileSync(path.join(outRoot, 'latest.json'), JSON.stringify({
    date,
    status: brief.status,
    generated: brief.generated,
    packageDir,
  }, null, 1));

  console.log(JSON.stringify({
    date,
    status: brief.status,
    packageDir,
    household: brief.household ? brief.household.score : null,
    market: brief.market ? brief.market.score : null,
    failures: brief.failures,
  }));

  if (!ready) process.exitCode = 1;
}

main();
