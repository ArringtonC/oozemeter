# Reweight proposal (DRAFT, not a change) — why the OOZEMeter reads 29 and what other weightings would say

Written 2026-11-08 from the published per-line stress history (data/line-history.json, methodology 3.0.0). No code changed, nothing published. Each alternative is re-calibrated with the frozen rule (calmest 2003–2025 month → 10, 2007–2010 peak → 90), as a version bump would require.

| weighting | Sep 2026 | May 2026 | 2022 inflation peak | COVID peak | GFC peak | calmest | months since 2024 higher than today |
|---|---|---|---|---|---|---|---|
| v3 (current) | 29 | 29 | 26 (2021-06) | 42 (2020-03) | 90 (2009-06) | 10 | 0 |
| equal (7 lines) | 30 | 32 | 33 (2022-10) | 37 (2020-04) | 90 (2009-06) | 10 | 1 |
| cost of living | 38 | 39 | 41 (2022-06) | 33 (2020-05) | 90 (2009-06) | 10 | 1 |
| balanced | 33 | 35 | 31 (2022-10) | 37 (2020-04) | 90 (2009-06) | 10 | 1 |

Reading:
- The September 2026 line stresses are gas 69, housing 48, auto 47, credit 37, inflation 36, jobs 14, financial 11. Under v3, jobs carry 24% and are calm, so the headline is 29.
- Under every weighting, September 2026 is already **at or above the whole 2021–22 inflation episode** and is the highest reading since 2024 (v3: 29 vs a 2021–22 peak of 26). Moving weight from jobs to prices lifts today to 33–38, still only the middle of the meter's own history (50th–58th percentile), because re-calibration lifts 2008 and 2022 by the same rule; the meter is a *relative* scale anchored on 2009 = 90.
- Small note: re-deriving the calibration here gives May 2026 = 29 where the published (frozen) record says 30; that one-point rounding drift is exactly why the pair is frozen.
- A reweight is a methodology version bump (3.1.0): it restates every published month, the public history array, the articles' quoted numbers, and the Ledger tile. It is not a maintenance edit.

Options (pick one, or none):
1. Keep v3 and say plainly on the site: "29 = prices hurt, jobs do not; 2008 was jobs."  (no restatement)
2. Add a second, clearly labelled dial, "cost-of-living stress", computed from gas + inflation + housing only, shown beside the headline, no change to the headline. (no restatement; new line, provisional-auxiliary like manufacturing)
3. Version 3.1.0 with the "balanced" weights. (restates history; needs the release gate, claim gate, articles and the Ledger tile updated together)

Recommendation: 2. It answers "it feels worse than 29" without rewriting the record.
