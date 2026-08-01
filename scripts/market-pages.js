#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const gauges = require('./lib/market-gauge-content');
const {atomicWrite} = require('./lib/market-output');
const SITE = require('./lib/site-url');

const root = path.resolve(process.env.MARKET_PAGES_ROOT || path.resolve(__dirname, '..'));
const historicalBasis = 'Historical incident files use the latest data available at retrieval: a current-vintage reconstruction, not the release-time view available in 2008. Revised series can change, and a terminal calendar month may be partial.';
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
const list = items => `<ol>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
const sourceList = sources => `<ul>${sources.map(([name, url]) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(name)}</a></li>`).join('')}</ul>`;

function gaugePage(gauge) {
  const title = `${gauge.name} — Ward M Gauge | OOZEMeter`;
  const description = `${gauge.name}: current Ward M reading, measurement, 2008 comparison, limitations, sources, and FAQs.`;
  const related = gauges.filter(item => item.slug !== gauge.slug).map(item => `<a href="market/${item.slug}/"><span>${item.emoji}</span> ${escapeHtml(item.name)}</a>`).join('');
  const faqs = gauge.faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('');
  const faqJson = JSON.stringify({'@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: gauge.faqs.map(([question, answer]) => ({'@type': 'Question', name: question, acceptedAnswer: {'@type': 'Answer', text: answer}}))}).replace(/</g, '\\u003c');
  const roster = gauge.roster ? `<div class="chart-panel"><h2>Published proxy roster</h2><table class="rank-table"><thead><tr><th>Ticker</th><th>Economic role</th></tr></thead><tbody>${gauge.roster.map(([ticker, role]) => `<tr><td><b>${ticker}</b></td><td>${escapeHtml(role)}</td></tr>`).join('')}</tbody></table></div>` : '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><base href="../../"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#070b06">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${SITE}/market/${gauge.slug}/">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;800;900&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet"><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="lab.css"><script type="application/ld+json">${faqJson}</script></head>
<body><div id="page"><main class="wrap-narrow">
<div class="localnav"><b>${gauge.emoji} ${escapeHtml(gauge.name)}</b><nav><a href="#reading">Reading</a><a href="#why">Why it matters</a><a href="#vs2008">vs 2008</a><a href="#method">Method</a><a href="#faq">FAQ</a></nav><a class="btn primary" href="market.html">Ward M ▸</a></div>
<div class="crumbs"><a href="index.html">Facility</a> / <a href="market.html">Ward M</a> / ${escapeHtml(gauge.name)}</div>
<div class="ind-head"><div class="ind-title"><div class="intake">Ward M gauge · experimental</div><h1>${gauge.emoji} ${escapeHtml(gauge.name)}</h1></div><div class="contrib-chip">Separate instrument · <b>0 oz</b> in household jar</div></div>
<div class="ind-reading" id="reading"><div class="ind-val" id="gaugeValue">—</div><div class="ind-meta"><span id="gaugeStress">Ward M data loading</span><br><span id="gaugeAsOf"></span></div></div>
<div class="prose"><p><strong>This gauge does not affect the household Ooze Score.</strong> It contributes one-sixth of the experimental Ward M raw composite before Ward M calibration.</p></div>
<div class="prose" id="why"><h2>Why this gauge matters</h2><p>${escapeHtml(gauge.why)}</p><h3>What it measures</h3><p>${escapeHtml(gauge.measurement)}</p><p>${escapeHtml(gauge.release)}</p><h3>Interpret it without overclaiming</h3><p>${escapeHtml(gauge.interpretation)}</p></div>
<div class="prose" id="vs2008"><h2>How it behaved in 2008</h2><p><strong>Historical basis:</strong> ${escapeHtml(historicalBasis)}</p><div class="incident-callout"><span class="ic-stamp">Incident File — 2008</span><p>${escapeHtml(gauge.vs2008)}</p></div></div>
<div class="prose" id="method"><h2>Reproduce the data path</h2>${list(gauge.reproduce)}<h3>Limits</h3><p>${escapeHtml(gauge.limits)}</p><p>This gauge's provisional anchors are percentile-checked against its full history in the <a href="https://github.com/ArringtonC/oozemeter/blob/main/research/market-anchor-validation.md" target="_blank" rel="noopener">anchor-validation report</a>.</p><h3>Primary and institutional sources</h3>${sourceList(gauge.sources)}</div>
${roster}
<div class="prose faq" id="faq"><h2>Frequently asked questions</h2>${faqs}</div>
<div class="prose"><p><a href="research/lessons/${gauge.lesson}">🎓 OOZE ACADEMY field training: Lesson ${gauge.lesson.slice(2, 4)} — ${escapeHtml(gauge.name)} →</a></p></div>
<div><h2 style="font-family:var(--display);font-size:1.25rem">Other Ward M files</h2><div class="related">${related}</div></div>
</main></div><script src="data/market.js"></script><script src="data/sectors.js"></script><script src="data/latest.js"></script><script src="lab.js"></script><script>
renderHeader('market');const sensor=window.MARKET_DATA&&window.MARKET_DATA.sensors&&window.MARKET_DATA.sensors[${JSON.stringify(gauge.sensor)}];if(sensor){document.getElementById('gaugeValue').textContent=sensor.value;document.getElementById('gaugeStress').textContent='Ward M stress '+sensor.stress+'/100 · '+(sensor.delta>=0?'▲ +':'▼ ')+Math.abs(sensor.delta);document.getElementById('gaugeAsOf').textContent='Observation '+sensor.asOf+' · collected '+window.MARKET_DATA.generated.slice(0,10)}else{document.getElementById('gaugeStress').textContent='Ward M gauge offline'}renderFooter();wireReveals();
</script></body></html>
`;
}

function lessonPage(gauge, index) {
  const number = String(index + 9).padStart(2, '0');
  const roster = gauge.roster ? `<h2>4 · Know the eleven proxies</h2><table><thead><tr><th>Ticker</th><th>Role</th></tr></thead><tbody>${gauge.roster.map(([ticker, role]) => `<tr><td><strong>${ticker}</strong></td><td>${escapeHtml(role)}</td></tr>`).join('')}</tbody></table>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lesson ${number} — ${escapeHtml(gauge.name)} · OOZEMeter</title><meta name="description" content="Learn the ${escapeHtml(gauge.name)} Ward M gauge, its limits, and reproducible data path."><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="../assets/course.css"></head><body>
<header><div class="nav"><div><div class="brand">OOZE<em>ACADEMY</em></div><div class="lesson-id">Ward M field training</div></div><a href="../reference/intake-data-map.html">Data map</a></div></header><main>
<section class="hero"><div class="eyebrow">Lesson ${number} · ${escapeHtml(gauge.seriesId)}</div><h1>${gauge.emoji} ${escapeHtml(gauge.name)}</h1><p class="lede">${escapeHtml(gauge.lede)}</p><div class="goal"><strong>Tangible win:</strong> Explain what this gauge measures, what it cannot prove, and reproduce the exact Ward M input.</div></section>
<h2>1 · Know the measurement</h2><div class="grid"><div class="card"><div class="label">Published input</div><div class="metric">${escapeHtml(gauge.seriesId)}</div><p>${escapeHtml(gauge.measurement)}</p></div><div class="card"><div class="label">Release clock</div><div class="metric">${escapeHtml(gauge.release.split(';')[0])}</div><p>Ward M retains the observation period and collection time.</p></div></div>
<h2>2 · Interpret it without overclaiming</h2><div class="card"><p>${escapeHtml(gauge.interpretation)}</p></div><div class="card warning"><strong>Limits:</strong><p>${escapeHtml(gauge.limits)}</p></div>
<h2>3 · Reproduce the data path</h2><div class="exercise">${list(gauge.reproduce)}</div>
${roster}
<h2>${gauge.roster ? '5' : '4'} · Compare with 2008</h2><div class="card warning"><strong>Historical basis:</strong><p>${escapeHtml(historicalBasis)}</p></div><div class="card"><p>${escapeHtml(gauge.vs2008)}</p></div>
<h2>${gauge.roster ? '6' : '5'} · Source desk</h2><div class="source-card">${sourceList(gauge.sources)}</div>
<h2>Course map</h2><div class="course-map">${gauges.map(item => `<a href="${item.lesson}"${item.slug === gauge.slug ? ' aria-current="page"' : ''}>${item.emoji} ${escapeHtml(item.name)}</a>`).join('')}</div>
<div class="next"><a href="../../market/${gauge.slug}/">Open the public gauge file →</a></div>
</main></body></html>`;
}

for (const [index, gauge] of gauges.entries()) {
  atomicWrite(path.join(root, 'market', gauge.slug, 'index.html'), gaugePage(gauge));
  atomicWrite(path.join(root, 'research', 'lessons', gauge.lesson), lessonPage(gauge, index));
}
console.log(JSON.stringify({status: 'pass', gaugePages: gauges.length, lessons: gauges.length}));
