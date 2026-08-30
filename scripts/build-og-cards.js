#!/usr/bin/env node
/* Per-band share cards: og-card-<band>.svg derived from og-card.svg with the
   jar's liquid recolored to the band's level color (same palette as the
   BANDS constant). PNG copies are rendered by a browser — the workflow cannot
   run one, so the PNGs are committed artifacts and these SVGs are their
   reviewed source. Rerun when the band palette changes, then re-render PNGs
   at 1200×630 and commit both. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const BANDS = {
  smooth: '#4dffa1', sticky: '#8aff3c', slippery: '#d8ff2e',
  oozing: '#ffb02e', overflowing: '#ff4d3d',
};
const src = fs.readFileSync(path.join(root, 'og-card.svg'), 'utf8');
const liquid = '<path d="M17 36 h30 v10 a11 11 0 0 1 -11 11 h-8 a11 11 0 0 1 -11 -11 z" fill="#a3ff12"/>';
if (!src.includes(liquid)) throw new Error('og-card.svg liquid path changed — update build-og-cards.js');
for (const [band, color] of Object.entries(BANDS)) {
  fs.writeFileSync(path.join(root, `og-card-${band}.svg`), src.replace(liquid, liquid.replace('#a3ff12', color)));
}
console.log('wrote', Object.keys(BANDS).length, 'band SVGs');
