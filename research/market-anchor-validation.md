# Ward M anchor validation

Generated from the backtest acquisition at `2026-08-16T21:19:09.752Z`.
Acquisition receipt: `8581a5137d0a64c4365d7a515cab82776808b98caf8bf4f6930c45c2d221d52b`.

This report checks every provisional raw-value anchor against available current-revised history, not release-time vintages. A terminal month matching the retrieval month is partial. `Raw percentile` is the anchor’s position in the observed distribution. `At least this stressful` is the share of historical observations on the stressful side of that anchor. These are descriptive checks, not a license to tune anchors until the backtest tells a preferred story.

## Coverage and distribution

| Gauge | Direction | Coverage | Terminal | N | p05 | p50 | p95 |
|---|---|---:|---|---:|---:|---:|---:|
| rates | lower-is-more-stressful | 1982-01–2026-08 | partial retrieval month | 536 | -0.49 | 1.58 | 3.39 |
| volatility | higher-is-more-stressful | 1990-01–2026-08 | partial retrieval month | 440 | 11.69 | 17.67 | 31.99 |
| credit | higher-is-more-stressful | 1971-01–2026-08 | partial retrieval month | 668 | -0.79 | -0.39 | 2.32 |
| energy | higher-is-more-stressful | 1986-01–2026-08 | partial retrieval month | 488 | 15.1 | 44.69 | 101.37 |
| dollar | higher-is-more-stressful | 2007-01–2026-08 | partial retrieval month | 236 | -8.62 | 1 | 12.57 |
| breadth | higher-is-more-stressful | 2006-07–2026-08 | partial retrieval month | 242 | 0 | 4.55 | 81.59 |

## rates

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| -1.5 | 100 | 0.75% | 0.75% |
| -1 | 85 | 3.36% | 3.36% |
| -0.5 | 70 | 5.05% | 5.04% |
| 0 | 45 | 10.84% | 10.82% |
| 0.5 | 30 | 22.8% | 22.76% |
| 1.5 | 15 | 47.29% | 47.2% |
| 2.5 | 5 | 73.08% | 72.95% |

## volatility

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| 12 | 5 | 7.52% | 92.5% |
| 16 | 20 | 37.81% | 62.27% |
| 20 | 35 | 63.33% | 36.82% |
| 30 | 60 | 92.94% | 7.27% |
| 40 | 80 | 98.41% | 1.82% |
| 60 | 100 | 99.77% | 0.45% |

## credit

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| -0.7 | 5 | 10.79% | 89.22% |
| -0.4 | 15 | 49.03% | 51.05% |
| -0.15 | 30 | 65.22% | 34.88% |
| 0 | 40 | 70.46% | 29.64% |
| 0.3 | 55 | 78.41% | 21.71% |
| 0.8 | 70 | 85.91% | 14.22% |
| 1.5 | 85 | 90.85% | 9.28% |
| 3 | 100 | 97.45% | 2.69% |

## energy

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| 40 | 10 | 47.64% | 52.46% |
| 60 | 25 | 64.07% | 36.07% |
| 80 | 50 | 82.14% | 18.03% |
| 100 | 75 | 93.84% | 6.35% |
| 130 | 95 | 99.79% | 0.41% |
| 160 | 100 | 100% | 0% |

## dollar

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| -5 | 10 | 16.6% | 83.47% |
| 0 | 25 | 41.7% | 58.47% |
| 4 | 45 | 71.49% | 28.81% |
| 8 | 65 | 87.66% | 12.71% |
| 12 | 85 | 94.04% | 6.36% |
| 16 | 100 | 98.72% | 1.69% |

## breadth

| Raw anchor | Stress | Raw percentile | At least this stressful |
|---:|---:|---:|---:|
| 0 | 5 | 22.41% | 100% |
| 10 | 22 | 66.8% | 33.47% |
| 20 | 40 | 75.1% | 25.21% |
| 35 | 60 | 81.33% | 19.01% |
| 55 | 80 | 90.04% | 10.33% |
| 80 | 100 | 95.02% | 5.37% |

## Interpretation rule

- Anchors outside the observed range are explicit extrapolation points.
- Closely clustered percentile ranks mean several score bands are competing for little historical variation.
- A high stress score attached to a common tail share should be justified by construct meaning, not crisis matching alone.
- Any anchor change requires a new Ward M methodology version, a before/after history comparison, and public explanation.
