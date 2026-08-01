#!/usr/bin/env node
/* Per-page OG cards with the LIVE reading baked into the image (board V2).
   Renders 1200x630 HTML via headless Chrome — zero npm dependencies.
   Cards: og-card.png (jar score), og-cards/market.png (ward score),
   og-cards/<slug>.png (each indicator's current value).
   Rerun after collection, before push: node scripts/og-cards.js
   ponytail: local Chrome only; if the daily cron should regenerate these,
   that's a Codex note (ubuntu runners ship Chrome). */
const fs = require('fs');
const path = require('path');
const os = require('os');
const {execFileSync} = require('child_process');
const vm = require('vm');

const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const read = f => fs.readFileSync(f, 'utf8');
const d = JSON.parse(read('data/latest.json'));
const md = JSON.parse(read('data/market.json'));

const ctx = {window: {}, console, Date, location: {search: ''}};
vm.createContext(ctx);
vm.runInContext(read('data/latest.js'), ctx);
vm.runInContext(read('lab.js'), ctx);
const {INDICATORS, BANDS} = vm.runInContext('({INDICATORS,BANDS})', ctx);
const band = s => BANDS.find(b => s <= b.max).name;

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card({kicker, big, small, line, fill, hue}) {
  return `<!doctype html><meta charset="utf-8"><style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#070b06;color:#e6f2da;font-family:'IBM Plex Mono',Menlo,monospace;display:flex;align-items:center;padding:0 90px;gap:70px;
    background-image:linear-gradient(rgba(163,255,18,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(163,255,18,.03) 1px,transparent 1px);background-size:48px 48px}
  .jar{width:190px;height:300px;flex:none;border:3px solid #2a3524;border-top:14px solid #2a3524;border-radius:6px 6px 60px 60px;position:relative;overflow:hidden;background:rgba(200,255,190,.05)}
  .fill{position:absolute;left:0;right:0;bottom:0;height:${fill}%;background:${hue};opacity:.9}
  .k{font-size:26px;letter-spacing:.24em;color:#8ba07c;text-transform:uppercase;margin-bottom:18px}
  .b{font-family:Unbounded,'IBM Plex Mono',monospace;font-weight:900;font-size:150px;line-height:1;letter-spacing:-.04em}
  .b small{font-size:44px;color:#708363}
  .s{display:inline-block;border:2px solid ${hue};color:${hue};padding:10px 26px;margin-top:22px;font-size:34px;font-weight:800;letter-spacing:.2em}
  .l{margin-top:26px;font-size:24px;color:#8ba07c;max-width:640px;line-height:1.5}
  .br{position:fixed;bottom:44px;left:90px;font-size:22px;letter-spacing:.3em;color:#708363}
  </style><body>
  <div class="jar"><div class="fill"></div></div>
  <div><div class="k">${esc(kicker)}</div><div class="b">${esc(big)}<small>${esc(small)}</small></div>
  <div class="s">${esc(line[0])}</div><div class="l">${esc(line[1])}</div></div>
  <div class="br">OOZEMETER · DIVISION OF ECONOMIC CONTAINMENT</div></body>`;
}

const OOZE = '#a3ff12', WARD = '#5fd7ff';
const jobs = [];
jobs.push(['og-card.png', card({kicker: `Ooze Level · ${d.monthLabel}`, big: String(d.ooze), small: '/100',
  line: [band(d.ooze), 'One score for U.S. household economic stress, computed from public data.'],
  fill: d.ooze, hue: OOZE})]);
jobs.push(['og-cards/market.png', card({kicker: 'Market Ooze · Ward M', big: String(md.score), small: '/100',
  line: ['EXPERIMENTAL', 'Market and financial-system stress — a separate instrument that never fills the household jar.'],
  fill: md.score, hue: WARD})]);
for (const x of INDICATORS) {
  const l = d.lines[x.slug === 'jobs' ? 'jobs' : x.slug] || {};
  jobs.push([`og-cards/${x.slug}.png`, card({kicker: `${x.name} · Intake Line`, big: x.val, small: '',
    line: [x.trend.replace(/[▲▼]\s*/, ''), `How ${x.name.toLowerCase()} feeds the ${d.monthLabel} Ooze Level of ${d.ooze}/100.`],
    fill: Math.min(100, (l.stress ?? x.contrib * 8)), hue: OOZE})]);
}

fs.mkdirSync('og-cards', {recursive: true});
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
for (const [out, html] of jobs) {
  const src = path.join(tmp, 'c.html');
  fs.writeFileSync(src, html);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--force-device-scale-factor=1',
    `--screenshot=${path.resolve(out)}`, '--window-size=1200,630', '--hide-scrollbars', `file://${src}`],
    {stdio: 'pipe'});
  console.log('rendered', out);
}
fs.rmSync(tmp, {recursive: true, force: true});
console.log(JSON.stringify({status: 'pass', cards: jobs.length}));
