# Weekly OOZEMeter automation — operator runbook

**Status:** structure built and tested locally. Delivery channels are **not**
connected yet; see "What you still have to do" at the bottom.

The weekly product is two stages, deliberately separated so a bad build on
Sunday can never become a confident-looking email on Monday.

```text
SUNDAY 18:00 America/Chicago      MONDAY 08:00 America/Chicago
─────────────────────────────     ─────────────────────────────
run integrity gates               read newest package
      ↓                                 ↓
read validated artifacts          READY?  → Discord summary + email
      ↓                           FAILED? → failure alert, no report
build both reports                MISSING/STALE? → refusal alert
      ↓                                 ↓
write dated package               mark DELIVERED
      ↓
READY or FAILED marker
```

## Stage 1 — Sunday build

```bash
node scripts/weekly-package.js --next-run "Monday 08:00 America/Chicago"
```

Writes to `.weekly/<YYYY-MM-DD>/` (gitignored — this is a distribution
artifact, not repository truth):

| File | Contents |
|---|---|
| `package.json` | full manifest: scores, movers, divergence, gate results |
| `discord.txt` | the Monday Discord summary |
| `email.txt` | the combined email body (READY packages only) |
| `READY` / `FAILED` | the marker the Monday stage keys on |
| `../latest.json` | pointer to the newest package |

Exit code is `0` for READY and `1` for FAILED, so a scheduler can tell a good
week from a bad one without parsing prose.

### Gates

Blocking gates (any failure ⇒ FAILED package, no scores published):

- `household integrity` — `node scripts/integrity.js`
- `market integrity` — `node scripts/market-integrity.js`
- `frozen v2 baseline` — `python3 research/household_v2_baseline.py`

Non-blocking gates (reported in the brief, do not suppress it):

- `divergence-history freshness` — Ward historical evidence ages between manual
  refreshes. Expected, shown, never silently treated as current.
- `methodology v3 publication` — the intentional disclosure/front-end block.

The distinction matters: a stale Ward *history* does not make this week's
*household* reading wrong, but it must never be presented as fresh.

## Stage 2 — Monday delivery

```bash
node scripts/weekly-deliver.js --mark-delivered
```

Emits one JSON object on stdout and refuses in four cases, each announced:

| Status | Meaning | Email sent? |
|---|---|---|
| `ready` | healthy package | yes |
| `failed` | Sunday validation failed | no — alert only |
| `missing` | no package was built | no — alert only |
| `stale` | package older than `--max-age-hours` (default 48) | no — alert only |
| `already-delivered` | double-send guard | no — silent, `--resend` overrides |

The delivery stage **never computes a score, regenerates a report, or invents a
number.** It only reads or refuses. Last week's numbers are never re-sent as if
they were current.

## Honesty rules encoded in the builder

These are enforced by tests, not convention:

- **No invented Ward band.** The household jar has a published band vocabulary
  (Smooth/Sticky/Slippery/Oozing/Overflowing). Ward M does not, so `band` is
  `null` and the email prints "not published for Ward M."
- **No fake week-over-week change.** The first package reports "no prior weekly
  package" rather than a misleading `0`.
- **Week-over-week comes from the previous weekly package**, never from monthly
  history — those are different cadences and must not be conflated.
- **Auxiliary lines are excluded** from "biggest mover" (they carry no score weight).
- **Divergence is labeled as an exact shared month**, with the standing
  disclaimer that Ward M is not household pressure.
- **No causal or predictive language** between the two scores.
- **Malformed input fails closed** — non-integer, missing, or stale scores
  produce a FAILED package rather than a plausible-looking wrong one.

## Scheduling

Once the delivery channels are connected, schedule with Hermes cron:

```text
Sunday build:     0 18 * * 0   (America/Chicago)
Monday delivery:  0 8  * * 1   (America/Chicago)
```

Use `workdir` so the jobs run inside this repository. The build job is a good
candidate for `no_agent=True` script mode: its stdout is already the exact
status line, and an empty/failed run should alert rather than narrate.

## What you still have to do

These require credentials or accounts and cannot be fabricated:

1. **Discord** — create the bot, invite it, set `DISCORD_BOT_TOKEN` and
   `DISCORD_ALLOWED_USERS` in `~/.hermes/.env`, then `hermes gateway install`.
   The gateway is currently **not running**.
2. **Email** — configure an SMTP account (Himalaya v1.2.0 is installed but has
   no config at `~/.config/himalaya/config.toml`). Use the `folder.aliases.X`
   syntax; the pre-1.2.0 `[folder.alias]` form is silently ignored and causes
   duplicate sends on retry.
3. **Register the two cron jobs** once both channels answer.

Until then both stages run correctly and produce the exact payloads to send;
they simply have nowhere to deliver them.

## Two reports, one system

**OOZE Report** — how much pressure ordinary households are feeling. Existing
household indicators, calibration `a=1.4209, b=-24.6215`, methodology v3.

**Market OOZE (Ward M)** — how freely capital is moving. Frozen calibration
`a=1.402462618842267, b=-7.011551886296619`, anchors provisional.

The scores stay separate on purpose. A strong market does not mean households
are doing well, and the brief never implies that it does.
