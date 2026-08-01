# Ward M anchor validation

Generated from the backtest acquisition at `2026-08-01T23:35:18.922Z`.
Acquisition receipt: `c0d1bff6ff1ba6d4f58ad1f91b139382d8e5e2e745307dc6b7f247e4d0caa906`.

This report checks every provisional raw-value anchor against available current-revised history, not release-time vintages. A terminal month matching the retrieval month is partial. `Raw percentile` is the anchor’s position in the observed distribution. `At least this stressful` is the share of historical observations on the stressful side of that anchor. These are descriptive checks, not a license to tune anchors until the backtest tells a preferred story.

## Coverage and distribution

| Gauge | Direction | Coverage | Terminal | N | p05 | p50 | p95 |
|---|---|---:|---|---:|---:|---:|---:|
| rates | lower-is-more-stressful | 1982-01–2026-07 | prior month | 535 | -0.49 | 1.58 | 3.39 |
| volatility | higher-is-more-stressful | 1990-01–2026-07 | prior month | 439 | 11.69 | 17.68 | 32 |
| credit | higher-is-more-stressful | 1971-01–2026-07 | prior month | 667 | -0.77 | -0.39 | 2.32 |
| energy | higher-is-more-stressful | 1986-01–2026-07 | prior month | 487 | 15.1 | 44.65 | 101.4 |
| dollar | higher-is-more-stressful | 2007-01–2026-07 | prior month | 235 | -8.62 | 1.08 | 12.58 |
| breadth | higher-is-more-stressful | 2006-07–2026-07 | prior month | 241 | 0 | 4.55 | 81.82 |

## rates

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| -1.5 | 100 | 0.75% | 0.75% |
| -1 | 85 | 3.37% | 3.36% |
| -0.5 | 70 | 5.06% | 5.05% |
| 0 | 45 | 10.86% | 10.84% |
| 0.5 | 30 | 22.85% | 22.8% |
| 1.5 | 15 | 47.19% | 47.1% |
| 2.5 | 5 | 73.03% | 72.9% |

## volatility

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| 12 | 5 | 7.53% | 92.48% |
| 16 | 20 | 37.67% | 62.41% |
| 20 | 35 | 63.24% | 36.9% |
| 30 | 60 | 92.92% | 7.29% |
| 40 | 80 | 98.4% | 1.82% |
| 60 | 100 | 99.77% | 0.46% |

## credit

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| -0.7 | 5 | 12.61% | 87.41% |
| -0.4 | 15 | 48.65% | 51.42% |
| -0.15 | 30 | 65.17% | 34.93% |
| 0 | 40 | 70.57% | 29.54% |
| 0.3 | 55 | 78.53% | 21.59% |
| 0.8 | 70 | 85.89% | 14.24% |
| 1.5 | 85 | 90.84% | 9.3% |
| 3 | 100 | 97.6% | 2.55% |

## energy

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| 40 | 10 | 47.74% | 52.36% |
| 60 | 25 | 64.2% | 35.93% |
| 80 | 50 | 82.51% | 17.66% |
| 100 | 75 | 93.83% | 6.37% |
| 130 | 95 | 99.79% | 0.41% |
| 160 | 100 | 100% | 0% |

## dollar

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| -5 | 10 | 16.67% | 83.4% |
| 0 | 25 | 41.45% | 58.72% |
| 4 | 45 | 71.37% | 28.94% |
| 8 | 65 | 87.61% | 12.77% |
| 12 | 85 | 94.02% | 6.38% |
| 16 | 100 | 98.72% | 1.7% |

## breadth

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| 0 | 5 | 22.29% | 100% |
| 10 | 22 | 66.67% | 33.61% |
| 20 | 40 | 75% | 25.31% |
| 35 | 60 | 81.25% | 19.09% |
| 55 | 80 | 90% | 10.37% |
| 80 | 100 | 95% | 5.39% |

## Interpretation rule

- Anchors outside the observed range are explicit extrapolation points.
- Closely clustered percentile ranks mean several score bands are competing for little historical variation.
- A high stress score attached to a common tail share should be justified by construct meaning, not crisis matching alone.
- Any anchor change requires a new Ward M methodology version, a before/after history comparison, and public explanation.
