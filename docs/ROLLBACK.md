# OOZEMeter production rollback

Use this procedure when a methodology release, generated specimen, public permalink, or hosted collection run publishes an invalid production state. Preserve history: **do not force-push or rewrite `main`.**

## 1. Stop unattended publication

Disable the `daily-collection` workflow in GitHub Actions while investigating. Record the failed run URL and current production commit.

```bash
gh workflow disable collect.yml
```

## 2. Identify the last valid state

Inspect the commits that changed the canonical specimen and note the last valid fingerprint from `data/latest.json` and its matching file under `data/vintages/`.

```bash
git log --oneline -- data/latest.json
git show <last_valid_sha>:data/latest.json
```

The matching vintage must be `data/vintages/<collection.inputFingerprint>.json`.

## 3. Revert the invalid state

Use the path that matches the incident. Use `git revert`; never reset shared history.

### Specimen rollback after methodology v2 is established

Revert the invalid OOZEBOT specimen commits newest first. Keep the methodology-v2 release and its gate in place.

```bash
git checkout main
git pull --ff-only origin main
git revert <invalid_specimen_sha>
```

Resolve conflicts by restoring the complete canonical set from the same last-valid commit: `data/latest.json`, `data/latest.js`, `data/history.json`, editorial outputs, `feed.xml`, and stamped `index.html`. Do not mix artifacts from different fingerprints.

### Initial methodology v2 rollback

If the methodology-v2 release itself is invalid, its revert can remove `scripts/release-gate.js`. Record both commits before reverting, then restore and verify the pre-v2 tree without depending on a gate introduced by the release being removed.

```bash
INVALID_V2_SHA=<invalid_methodology_v2_release_sha>
PRE_V2_SHA="${INVALID_V2_SHA}^"
git revert "$INVALID_V2_SHA"

# The complete public/canonical artifact set must match the recorded pre-v2 tree.
git diff --exit-code "$PRE_V2_SHA" -- \
  data index.html feed.xml scripts/collect.js scripts/backtest.js \
  lab.js lab.css archive.html policies.html

# Run the verification commands that exist in the restored pre-v2 tree.
node --check scripts/collect.js
node --check lab.js
git diff --check
```

If the tree comparison fails, stop. Do not publish a hybrid of methodology versions.

## 4. Verify before restoring production

For a specimen rollback that retains methodology v2:

```bash
node scripts/release-gate.js
```

The gate must report `PASS` and one matching score, month, methodology version, permalink, and fingerprint across the homepage, report, newsletter, RSS, and vintage manifest. For an initial methodology v2 rollback, use the pre-v2 tree comparison and restored-tree checks above instead; the v2-only gate is intentionally not applicable.

## 5. Publish the rollback

```bash
git push origin main
```

Confirm the GitHub Pages deployment serves the last valid score and that the public feed state is not falsely marked `LIVE` for an invalid specimen.

## 6. Recover automation

Fix and verify the root cause on a separate branch. Re-enable the workflow only after the release gate passes, then use `workflow_dispatch` for one controlled collection before restoring the schedule.

```bash
gh workflow enable collect.yml
gh workflow run collect.yml
```

Verify the manual run, production permalinks, fingerprint, freshness state, failure issue behavior, and recovery behavior before considering the incident closed.
