# Publication Review — 2026-07-27
Three reviewers: clean-room editorial-UX auditor · Burry as a cold visitor · Jobs reading the front page.
Full agent outputs summarized; action items extracted below.

## Verdicts
- Auditor: "An excellent instrument wearing a publication's badge... there is not a single article headline anywhere on index.html."
- Jobs: "We wrote the lead and buried it below a card grid. A newspaper that did this would fire the editor."
- Burry (as user): "Worth one bookmark and zero citations: a genuinely reproducible number wrapped in a costume, undermined by its own unaudited prose — fix the copy and it's the only economic dashboard I'd let a normal person read."

## TRACK A — Truth bugs (Burry, urgent; violate our own policies)
A1. Articles contradict v2 data: vibecession piece says 2022 peaked 27 (data: 24; its June-2022 anchor reads 19); archive copy says COVID 43 (data: 41), BP-era 74 (data: 78). v1 numbers left standing after the 244-value recalibration. Editorial policy currently false on the flagship explainer.
A2. October 2025 silently missing from history (federal shutdown) — chart draws through the gap unannotated. "Silently absent = silently stale," same sin.
A3. Flagship permalink broken: EDITORIAL.articleSlug → withdrawn auto-report; article.html silently falls back to a different article. Newsletter links to a masked 404.
A4. Contributions sum 28 vs headline 27 on the page — show the rounding or reconcile.
A5. "25 years" vs "23 years" copy inconsistency.
A6. Fake specimen-temp gauge (98.6°F invented) on a no-invented-numbers site. Replace with a real reading or drop.
A7. Standing rule: refutation loop must read the PROSE (CI-check every number in articles.js + archive copy against history.json).

## TRACK B — Front page restructure (Jobs + auditor, prototype)
B1. The lead: EDITORIAL.story becomes the linked lead block under the verdict — headline, dek, byline, timestamp, "Read the full report →".
B2. Headlines on the homepage: "Latest from Oozeonomics" 3-4 news-cards (template exists in oozeonomics.html); teasers demoted.
B3. Reorder: hero(+story) → movers/rail → latest articles → share → deeper. Cut File 01 cards (rerun of hero nodes) to the chip row.
B4. Movers get editorial 'why' from EDITORIAL.lines (kill boilerplate).
B5. Cross-link indicators ↔ articles ↔ archive (relevance via cat/month fields); archive links the OOZEMAXING file.
B6. Newsletter mounts on article.html + index (highest-intent pages); it's only on indicator pages today.
B7. Oozeonomics section front: newest report leads full-width, then grid.
B8. Homepage ends with a read-next hand-off, not just "Post to X".
B9. Burry's ledger idea: compact six-line table (value · as-of · stress · weight · contribution · source) near the fold; jar as garnish, arithmetic closes visibly.
