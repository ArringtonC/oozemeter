# Weekly delivery channels — setup status

Two channels carry the weekly OOZEMeter product: **Discord** (Monday summary)
and **email** (full reports). This file tracks what is wired and what is not.

---

## Email — Gmail via Himalaya

**Status: WIRED AND VERIFIED END TO END (2026-08-02).**

| Item | Value |
|---|---|
| Config | `~/.config/himalaya/config.toml` (mode `0600`) |
| Account | `oozemeter` (default) |
| Address | `arrington.copeland@gmail.com` |
| IMAP | `imap.gmail.com:993` TLS |
| SMTP | `smtp.gmail.com:587` STARTTLS |
| Secret | macOS Keychain, service `oozemeter-gmail` |

Verified with live sends, not just config parsing:

- IMAP authenticates — `himalaya folder list` returns the full folder tree.
- The server's `\Sent` flag sits on `[Gmail]/Sent Mail`, confirming the alias.
- Test message sent, exit `0`, landed in INBOX.
- **Saved to Sent exactly once** — no duplicate, so the alias fix holds.
- A real weekly brief (`OOZEMeter Weekly Reports — 2026-08-03`) was built by
  the Sunday stage, staged by the Monday stage, and delivered successfully.

The App Password is stored in the Keychain only. It never appears in the config
file, this repository, or shell history.

### Re-storing the password (if it ever needs rotating)

```bash
security add-generic-password -a arrington.copeland@gmail.com -s oozemeter-gmail -w -U
```

The `-w` with no value prompts securely. Get a fresh 16-character App Password
at <https://myaccount.google.com/apppasswords> if Gmail invalidates the old one.

### Why the folder aliases matter

The config uses the plural `folder.aliases.X` spelling. The pre-1.2.0 singular
`[folder.alias]` form parses without error but is *silently ignored*, so `sent`
falls through to a folder Gmail does not have (`[Gmail]/Sent Mail` is the real
one). Save-to-Sent then fails **after** SMTP already delivered, himalaya exits
non-zero, and any caller that retries re-sends the whole message — duplicate
weekly reports. The "exactly once in Sent" check above is what proves this is
configured correctly; keep it in any future verification.

---

## Discord — bot

**Status: WIRED AND VERIFIED (2026-08-02).**

| Item | Value |
|---|---|
| Bot | `OOZEBOT#7192` (app/bot ID `1533629174823125042`) |
| Server | `OOZEMeter` (`1533631423498424490`) |
| Channel | `#general` (`1533631424593395744`) |
| Owner / allowlist | `468902102995959808` |
| Secrets | `~/.hermes/.env`, mode `0600` |
| Service | launchd `ai.hermes.gateway`, auto-start + auto-restart |

Verified against the live Discord API, not just config:

- Token authenticates; `/users/@me` returns `OOZEBOT`.
- **Both privileged intents already enabled** — Message Content and Server
  Members (`raw_flags 565248`). This is the #1 cause of silent bots.
- Gateway log: `[Discord] Connected as OOZEBOT#7192`.
- A real message was posted to `#general` and accepted (`200`).
- `#general` is in `DISCORD_FREE_RESPONSE_CHANNELS`, so it answers without
  an `@mention`.

### Outstanding portal cleanup (cosmetic, not blocking)

`bot_public` is still `true`, so anyone with the app ID could invite OOZEBOT
to their own server. It could do nothing there — `DISCORD_ALLOWED_USERS`
restricts it to one user — but close it anyway:

1. **Installation** tab → Install Link → **None** → Save
2. **Bot** tab → uncheck **Public Bot** → Save

Discord rejects the second step until the first is done ("Private application
cannot have a default authorization link").

---

## Scheduled jobs

Both registered, `no_agent` (script-only, zero token cost):

| Job | ID | Schedule | Delivery |
|---|---|---|---|
| Sunday build | `355f7ca34c51` | `0 18 * * 0` | local (silent unless it fails) |
| Monday delivery | `b0819ecdc57a` | `0 8 * * 1` | `discord:1533631424593395744` |

Scripts live in `~/.hermes/scripts/`:

- `oozemeter-weekly-build.sh` — runs gates, writes the dated package, prints a
  one-line receipt on success and a loud alert on failure.
- `oozemeter-weekly-deliver.sh` — reads the package, emails the full reports,
  prints the Discord summary. **Prints nothing when the package was already
  delivered**, so a re-run cannot double-post.

Both dry-run successfully end to end.
