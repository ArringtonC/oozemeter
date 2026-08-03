# Weekly delivery channels — setup status

Two channels carry the weekly OOZEMeter product: **Discord** (Monday summary)
and **email** (full reports). This file tracks what is wired and what is not.

---

## Email — Gmail via Himalaya

**Status: configured, awaiting your App Password.**

| Item | Value |
|---|---|
| Config | `~/.config/himalaya/config.toml` (mode `0600`) |
| Account | `oozemeter` (default) |
| Address | `arrington.copeland@gmail.com` |
| IMAP | `imap.gmail.com:993` TLS |
| SMTP | `smtp.gmail.com:587` STARTTLS |
| Secret | macOS Keychain, service `oozemeter-gmail` |

Verified: config parses, `himalaya account list` shows the account, no literal
password anywhere in the file.

### The one step only you can do

Gmail rejects your normal password when 2FA is on. Create an **App Password**:

1. <https://myaccount.google.com/apppasswords>
2. Name it `OOZEMeter`, copy the 16-character value.
3. Store it in the Keychain — the `-w` with no value prompts securely, so the
   secret never lands in your shell history:

```bash
security add-generic-password -a arrington.copeland@gmail.com -s oozemeter-gmail -w
```

4. Verify end to end:

```bash
himalaya folder list                        # proves IMAP auth works
printf 'From: arrington.copeland@gmail.com\nTo: arrington.copeland@gmail.com\nSubject: OOZEMeter test\n\nchannel check\n' \
  | himalaya template send                  # proves SMTP + save-to-Sent work
```

If step 4's send exits non-zero, **do not retry blindly** — check whether the
message actually arrived first. See the folder-alias warning below.

### Why the folder aliases matter

The config uses the plural `folder.aliases.X` spelling. The pre-1.2.0 singular
`[folder.alias]` form parses without error but is *silently ignored*, so `sent`
falls through to a folder Gmail does not have (`[Gmail]/Sent Mail` is the real
one). Save-to-Sent then fails **after** SMTP already delivered, himalaya exits
non-zero, and any caller that retries re-sends the whole message — duplicate
weekly reports.

---

## Discord — bot

**Status: not started. Gateway is not running; no Discord keys are set.**

### Step 1 — Create the application

<https://discord.com/developers/applications> → **New Application** → name it
`OOZEBOT` → **Bot** → **Reset Token** → copy it. Treat that token like a
password; anyone holding it controls the bot.

### Step 2 — Enable Privileged Gateway Intents (the step everyone skips)

Same **Bot** page → **Privileged Gateway Intents**:

| Intent | Required? |
|---|---|
| Presence Intent | optional |
| **Server Members Intent** | **ON** |
| **Message Content Intent** | **ON** |

**This is the #1 reason Discord bots appear online but never respond.** Without
Message Content Intent the bot receives events with empty text — it literally
cannot see what you typed. Click **Save Changes**.

For a private bot, also turn **Public Bot** OFF (then use the manual invite URL
in step 3, since Discord's own link generator requires Public Bot on).

### Step 3 — Invite it to your server

Replace `YOUR_APP_ID` with the Application ID from the General Information page:

```text
https://discord.com/oauth2/authorize?client_id=YOUR_APP_ID&scope=bot+applications.commands&permissions=274878286912
```

That permission set covers View Channels, Send Messages, Read Message History,
Attach Files, Embed Links, Send Messages in Threads, and Add Reactions.

### Step 4 — Get your own user ID

Discord → **Settings → Advanced → Developer Mode ON**, then right-click your own
name → **Copy User ID**. Without this the gateway denies everyone by default,
which is the correct safe posture.

### Step 5 — Configure and start

Add to `~/.hermes/.env` (secrets belong here, never in `config.yaml`):

```bash
DISCORD_BOT_TOKEN=<token from step 1>
DISCORD_ALLOWED_USERS=<your user ID from step 4>
```

Then:

```bash
hermes gateway install   # run as a user service, survives reboot
hermes gateway status    # expect: running
```

DM the bot to confirm it answers. In server channels it only replies when
`@mentioned` unless you add the channel to `DISCORD_FREE_RESPONSE_CHANNELS`.

---

## Step 6 — Register the two cron jobs

Only after **both** channels answer. Scheduling delivery into a dead channel
produces silent weekly failures, which is worse than no automation.

```text
Sunday build:     0 18 * * 0   America/Chicago   workdir = this repo
Monday delivery:  0 8  * * 1   America/Chicago   workdir = this repo
```

Ask me to create them once `hermes gateway status` reports running and the
himalaya test send lands in your inbox.
