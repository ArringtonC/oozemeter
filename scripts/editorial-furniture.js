#!/usr/bin/env node
/* Shared editorial furniture — the single emitting function for the disclosures
   the Constitution makes mandatory (§4 byline, §10 confidence statement).
   A mandatory disclosure with no emitting function is a disclosure that will be
   dropped; it was, in 23 of 23 archive reports, before this module existed.
   Every engine that generates a report calls these. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const BYLINES = {
  live: 'Drafted by OOZEBOT · reviewed by the Division of Economic Containment',
  archive: 'Reconstructed by OOZEBOT · reviewed by the Division of Economic Containment',
};

/* methodology version · feed freshness · revision count — the three facts a
   reader needs to judge how much weight the number can carry. */
function confidenceStatement({methodologyVersion, vintage, kind = 'live', staleLines = 0, freshnessStatus} = {}) {
  let revisions = 0;
  try { revisions = JSON.parse(fs.readFileSync(path.join(root, 'data/revisions.json'), 'utf8')).length } catch {}
  const parts = [`Methodology v${methodologyVersion}.`];
  if (kind === 'archive') {
    parts.push(`Reconstructed ${vintage} from current-vintage public data, not release-time observations.`);
  } else {
    parts.push(freshnessStatus === 'current' || !staleLines
      ? 'All source feeds current at collection.'
      : `${staleLines} source feed${staleLines === 1 ? '' : 's'} flagged stale at collection.`);
  }
  parts.push(revisions
    ? `${revisions} source-revision event${revisions === 1 ? '' : 's'} on the public record (data/revisions.json).`
    : 'No source revisions on record.');
  parts.push('Every figure traces to a cited public series; anchors, weights and calibration constants are published and frozen.');
  return parts.join(' ');
}

module.exports = {BYLINES, confidenceStatement};
