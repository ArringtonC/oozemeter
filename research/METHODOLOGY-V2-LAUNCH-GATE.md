# Methodology v2.0.0 launch gate

**Release candidate:** methodology v2.0.0
**Canonical specimen:** June 2026 · 27/100
**Fingerprint schema:** v2
**Fingerprint:** `52bb55cae17509e53caadd7be9a9811638a9403c28587f7102ac05ecf82969a2`

Run the complete local gate with:

```bash
node scripts/release-gate.js --prepare
```

## Local release criteria

- [x] All focused tests green: **39 passed, 0 failed**
- [x] Live official-source collection completed
- [x] Numerical integrity gate passed: GFC peak 90; calm floor 10; headline 27
- [x] Historical revision set recorded once; repeat runs do not duplicate the event
- [x] Collector/backtest tests write only to isolated temporary directories
- [x] Rounded line contributions reconcile exactly to the headline
- [x] Backtest and canonical history agree for every comparable month
- [x] Transient official-source network failures use bounded retries
- [x] Missing official monthly releases render as gaps, never interpolated scores
- [x] Narrative integrity passed: four articles, canonical numbers, valid flagship permalink
- [x] No unresolved canonical history tokens or unapproved raw score claims
- [x] Current specimen fingerprint has a matching schema-v2 vintage
- [x] Archive discloses its 2003 boundary and ex-post/latest-revised timing basis
- [x] Homepage, flagship report, newsletter, RSS, and canonical specimen agree
- [x] Public local permalinks resolve
- [x] Workflow permissions include repository-content and issue writes
- [x] Failure issue and recovery contracts are tested
- [x] Public `LIVE`, `DEGRADED`, `STALE`, and `OFFLINE` states are tested
- [x] Public methodology history identifies exact version `v2.0.0`
- [x] Rollback procedure documented in `docs/ROLLBACK.md`
- [x] Initial-v2 rollback has a release-independent verification path
- [x] JavaScript syntax and Git whitespace checks passed

## Hosted release criteria

Hosted verification began on July 28, 2026. Release commit `894e9c9` and the
subsequent hosted freshness commit `73de860` are the verified production chain.

- [x] GitHub Actions accepts the workflow and requested permissions
- [x] Manual `workflow_dispatch` run `30353102637` completed successfully
- [x] OOZEBOT committed one internally consistent freshness specimen as `73de860`
- [x] GitHub Pages deployment `30353128217` completed successfully
- [x] Production serves June 2026 at 27/100 with methodology v2.0.0 and the canonical schema-v2 fingerprint
- [x] Production header reports `LIVE`
- [x] Production report permalink, feed, methodology page, archive, and raw specimen resolve
- [ ] Failure alert can open or update one issue without duplication
- [ ] A subsequent successful run closes the standing failure issue
- [x] Rollback command path is available to the operator

## Release rule

Do not tune weights, anchors, or source semantics during production burn-in. Any scoring change requires a documented version change and a before/after historical comparison.
