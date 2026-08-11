# OOZE Report Archive

Approved weekly editions are stored under [`editions/`](./editions/) in date-named folders.

## Editions

| Edition | Reader report | Operator appendix |
|---|---|---|
| [August 3, 2026](./editions/2026-08-03/) | [edition.txt](./editions/2026-08-03/edition.txt) | [operator-appendix.txt](./editions/2026-08-03/operator-appendix.txt) |

Each edition folder contains:

- `edition.txt` — subscriber-facing report.
- `edition.json` — structured editorial source with claim references.
- `evidence.json` — validated facts available to the writer.
- `validation.json` — evidence-validation result.
- `approval.json` — approval receipt bound to the evidence and edition hashes.
- `operator-appendix.txt` — integrity, freshness, calibration, and methodology diagnostics.

Archived files are immutable: approval may create a dated edition or confirm an identical archive, but it will not overwrite a different report under the same date.
