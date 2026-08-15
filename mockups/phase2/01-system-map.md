# 01 — Current-System Map

**Phase 2 of the design gauntlet.** Phase 1 is `mockups/inspiration-board.html` (four directions + the encoding law). The UX audit is `research/forensic/07-ux.md`. This document is neither. It is the **wiring diagram**: what a designer is allowed to touch, what breaks if they do, and what the real copy says today.

- **Repo state read:** `main`, working tree dirty (Ward M in flight), 2026-08-14.
- **Payload read:** `data/latest.json` / `data/editorial.json`, both `generated: 2026-08-14T12:46:21.211Z`, month `2026-07`, ooze `26`, prev `27`.
- **Everything below was executed or grepped against the live tree.** Where I could not verify something in this environment, it says so in bold. No design references, URLs, or citations are invented here — the only external references in this document are FRED series IDs that appear verbatim in `data/latest.json`.

---

## 0. The one-paragraph version

`index.html` is a **static HTML shell that is rewritten every morning by `scripts/stamp.js` and then re-rendered on top of by inline JS**. Seventeen substrings in that shell are load-bearing regex targets; `stamp.js` now `process.exit(1)`s if **any one** of them fails to match, which reds the daily cron. Six of the page's modules have no static markup at all and exist only after JS runs. The paragraph that explains the number (`EDITORIAL.story`) is generated, gated, and rendered nowhere. The four featured cards are sorted by movement, not mass. Both are one-`div`-and-one-line-of-JS fixes that sit inside a minefield of exact-match regexes.

---

## 1. The exact render path of `index.html`

### 1.1 Legend

| Code | Meaning |
|---|---|
| **STATIC** | Ships in the HTML file, visible with JS off |
| **STAMPED** | Static markup that `scripts/stamp.js` rewrites daily from `data/latest.json` (marker = build-breaking) |
| **CLIENT** | Only exists after inline JS in `index.html` runs |
| **CHROME** | Injected by `lab.js` (`renderHeader` / `renderFooter`), same on every page |

Load order (`index.html:129–135`): `data/latest.js` → `data/editorial.js` → `data/market.js` → `data/sectors.js` → `articles.js` → `data/auto-articles.js` → `lab.js` → inline `<script>` (`:136–337`). Every `data/*.js` file is a one-line `window.X = {...}` mirror of the matching `data/*.json`.

### 1.2 Final DOM order (after all scripts run)

| # | Module | Source lines | Kind | Data origin |
|---|---|---|---|---|
| 1 | `#alarmWash`, `#pageDrips` | `lab.js:357–359` | CHROME | `body[data-alert]`, set by `setFacility(TODAY_SCORE)` (`index.html:176`, `lab.js:329–332`). Fires only at ≥80. |
| 2 | `#boot` clearance overlay | `index.html:27` markup, `:141–171` logic | STATIC + CLIENT | `BOOT_LINES` literal at `:141–147`. Line `:144` hard-codes `PRESSURE SENSORS ×8` — there are **9** lines. Runs once per browser (`localStorage.oozeboot`), skipped entirely under `prefers-reduced-motion`, replayable via `?boot=1`. |
| 3 | `header` (wordmark, nav, **score-chip + score-pop**, audio, LIVE badge, mobile menu) | `lab.js:362–420` | CHROME | `INDICATORS` (lab.js literal) for nav links; `LD.lines` for the score-pop (`lab.js:390–396`); `FEED_STATE` for the badge. **The score-pop iterates all 9 lines with no AUX label — §5.2.** |
| 4 | `section.hero#top` → `.wrap.pvJ#heroTheme[data-level]` | `index.html:32–33` | STAMPED | `data-level` = `level(ooze)`; also re-set client-side by `setJar()` (`lab.js:326`). **Scope note: `[data-level]` is on this wrap, not `:root` — §3.3.** |
| 5 | `.kicker` "Today's Containment Level" | `:36`, overwritten `:180` | STATIC → CLIENT | **Not stamped.** No-JS / crawler view says "Today's Containment Level"; JS view says "Containment Level — July 2026". A month label that exists only in JS. |
| 6 | `.big-score` / `#heroScore` | `:37` | STAMPED | `d.ooze`. Animated 0→26 over 1.6 s by `startCountUp()` (`:246–255`), triggered from `endBoot()`. |
| 7 | `#heroStatus` (`a.status-chip` → `what-is-ooze.html#scale`) | `:39` | STAMPED + CLIENT `:181` | `band(s)` → `STICKY` |
| 8 | `#heroDelta` | `:40` | STAMPED + CLIENT `:182–184` | `s - d.prevOoze`; colour amber if ≥0, green if <0 |
| 9 | `.verdict#verdictLine` | `:42` | STAMPED (`stamp.js:100`) + CLIENT `:185` | **`data/editorial.json.verdict`.** Falls back to a computed `HISTORY` percentile in both stamp (`stamp.js:94–99`) and client (`:187–190`). **This is the only one of 13 editorial fields on the page.** |
| 10 | `#heroJar` + placard | `:44–51` | CLIENT (jar) / STAMPED (`#plcSealed`) | Jar built by `buildJar()` (`lab.js:295–316`), filled by `setJar()` at `+300 ms` after boot (`:155`). `#plcSealed` text comes from **`data/gate-status.json`**, not `latest.json` (`stamp.js:22–37`) — stamp refuses to run at all if that file is missing, non-`pass`, or covers a different month. |
| 11 | `.pvJ-label` "Intake Canisters" | `:53` | STATIC | — |
| 12 | **`#canCards` — the four featured canisters** | `:54` mount, `:194–204` logic | **CLIENT-ONLY** | `LD.lines` filtered to `contributesToOoze !== false`, **sorted by `Math.abs(delta)` desc, then `stress` desc, sliced to 4** (`:196`). Cards print name, stress-filled mini-jar, `Level: <stress>`, `▲/▼<delta>`. **Ounces are not on the card.** Defect §5.2 of the audit — verified live in §1.4 below. |
| 13 | "VIEW ALL INTAKE LINES →" | `:55` | STATIC | anchor to `#ledger` |
| 14 | `.pvJ-label.wide#ledger` "The Ledger" | `:57` | STATIC | — |
| 15 | **`#ledgerL` / `#ledgerR`** | `:59–60` mount, `:207–219` logic | **CLIENT-ONLY** | All 9 lines, sorted weighted-first, split in half. Each row: emoji, name, **`value`** (not stress), delta *or* the string `AUX`. Correct AUX handling — §5. |
| 16 | "Can I verify it?" + `.pv-evidence` (Methodology / Ooze Chart / Specimen Progress / Raw Data) | `:63–69` | STATIC | Four hard links. The trust spine. Nothing dynamic. |
| 17 | `.specimen-line` | `:71` | STAMPED, then **replaced** CLIENT `:224–225` | Stamp writes month + score. Client rewrites it to add `collected <date>` and the `FEED_STATE` freshness notice. Two different sentences depending on JS. |
| 18 | `#streakLine` | `:72`, `:236–243` | CLIENT-ONLY | `localStorage.oozestreak`. Nothing to do with the payload. |
| 19 | Replay-clearance link | `:73` | STATIC | `index.html?boot=1` |
| 20 | `aside.pvJ-rail` → `#latestFile` | `:80`, `:277–288` | CLIENT-ONLY | `ARTICLES` + `AUTO_ARTICLES` (newest first). Uses `EDITORIAL.articleSlug` only to decide whether the lead is the monthly seal (`:265–266`). Tease is derived from `LD.lines` deltas ≤ −3 (`:272–275`). Titles run through `resolveClaims()`. |
| 21 | `#recentFiles` | `:82`, `:290–295` | CLIENT-ONLY | next 3 articles |
| 22 | `#wardCard` | `:86`, `:298–307` | CLIENT-ONLY | `window.MARKET_DATA` + `window.SECTOR_DATA`. Only `--ward` consumer on this page. If `MARKET_DATA` is absent, `:307` hides `document.querySelectorAll('.file-h')[2]` — **an index-based selector; adding or removing any `.file-h` in the rail hides the wrong heading.** |
| 23 | `.pk-learn` (What is Ooze? / How the score works / When the next reading arrives) | `:90–94` | STATIC | — |
| 24 | `section#report` "Field Report" share block | `:102–125` | STATIC frame | `🚨` at `:109` is unconditional. `.sc-score` `:111` STAMPED + client `:311`; `.sc-status` `:112` STAMPED + client `:313`; `#scLine` `:113` STAMPED + client `:314` (top-3 **by `contrib`** — the share card already ranks by ounces while the hero cards do not). Copy/tweet text built at `:319–327`, wired `:328–334`. |
| 25 | `footer` | `lab.js:454–506` | CHROME | `INDICATORS` for the intake list; `LD.methodologyVersion` in the disclaimer |
| 26 | `nav.tabbar` (mobile ≤960px) | `lab.js:449–451` | CHROME | active tab from `renderHeader(active)` key + `<base>` guard |

### 1.3 What this means for a redesign

- **Six modules have zero static fallback**: `#canCards`, `#ledgerL/R`, `#streakLine`, `#latestFile`, `#recentFiles`, `#wardCard`. A crawler, a link preview, or a no-JS reader sees empty divs. Any new module (a story block, a "what doesn't add up" block) inherits that unless a marker is added to `stamp.js` — see §2.5.
- **`index.html` has no `<h1>`.** The only heading in the page body is `<h2 class="sec-title">Leak today's report</h2>` (`:105`). The document's sole `h2` is about sharing, not about the reading. `lab.js`'s footer adds `h4`s. Heading order today: *(none)* → h2 → h4.
- **The kicker is the only month label that isn't stamped**, so the static file's most human-readable line is generic.

### 1.4 The featured-canister sort, executed against today's payload

Weighted lines (`contributesToOoze !== false`) and their `Math.abs(delta)` / `stress` / `contrib`:

| slug | delta | \|delta\| | stress | contrib |
|---|---|---|---|---|
| gas | −3 | 3 | 58 | **4** |
| inflation | −3 | 3 | 30 | **2** |
| jobs | −1 | 1 | 13 | **2** |
| financial | −1 | 1 | 10 | **0** |
| housing | 0 | 0 | 44 | **7** |
| credit | 0 | 0 | 38 | **6** |
| auto | 0 | 0 | 47 | **5** |

`sort((a,b) => |Δb|−|Δa| || stressB−stressA).slice(0,4)` → **gas, inflation, jobs, financial = 4+2+2+0 = 8 of 26 ounces.** The three heaviest (housing 7 + credit 6 + auto 5 = 18 of 26) appear nowhere above the Ledger. One featured card contributes zero. **Confirmed by execution, not by reading.**

Note the asymmetry: `:310` already computes `top3` by `contrib` for the share card, so the correct ranking exists in the same file, 114 lines below the wrong one.

---

## 2. Every marker `scripts/stamp.js` writes — the implementation hazard

`stamp.js` ends with `if(missing>0)process.exit(1)` (`:126–130`). The comment records the change from `>3`. **Any restructure that changes any of these substrings reds the daily build.**

Two things make this worse than it looks:

1. `index.html` is **written to disk before the exit check** (`:107`). A failing run still leaves a partially-stamped file, and the workflow's `git add … index.html` step never runs because the job aborts — so the tree is left dirty locally.
2. The `market.html` substitutions at `:115–120` **increment the same `missing` counter**. A broken marker in `market.html` reds the build with an `index.html`-shaped error budget.

### 2.1 The 15 `index.html` markers

| # | Label (as logged) | Regex | What the markup must keep |
|---|---|---|---|
| 1 | `title` | `/<title>[^<]*<\/title>/` | a `<title>` with no `<` inside. Safe. |
| 2 | `meta description` | `/<meta name="description" content="[^"]*">/` | **exact attribute order**, double quotes, no other attributes |
| 3 | `og title` | `/<meta property="og:title" content="[^"]*">/` | same |
| 4 | `og description` | `/<meta property="og:description" content="[^"]*">/` | same |
| 5 | `jar aria-label` | `/aria-label="Containment jar, ooze level \d+ of 100"/` | **the aria-label wording is a build dependency.** Rewriting it to anything else — "Ooze jar at 26 of 100", "Containment jar — 26/100" — reds the build. |
| 6 | `hero level` | `/id="heroTheme" data-level="\d"/` | `id="heroTheme"` immediately followed by one space and `data-level="N"`. **Inserting `class=` between them, or reordering, breaks it.** Single digit only. |
| 7 | `hero score` | `/id="heroScore">\d+</` | `id="heroScore"` must be the **last attribute** on its tag, content must start with digits then `<` |
| 8 | `hero status` | `/(id="heroStatus"[^>]*>)[^<]*</` | may carry later attributes, but **none may contain a `>`**; content may contain no child element |
| 9 | `hero delta` | `/id="heroDelta">[^<]*</` | last attribute; no child elements |
| 10 | `placard integrity` | `/id="plcSealed">[^<]*</` | last attribute; no child elements |
| 11 | `specimen line` | `/class="specimen-line cine c5">[^<]*<b>[^<]*<\/b>[^<]*</` | **the single most fragile marker.** Requires the class value **verbatim and in this order** — `specimen-line cine c5` — as the last attribute, and an inner shape of `text <b>text</b> text`. Dropping the `cine c5` reveal classes, reordering to `cine c5 specimen-line`, adding a class, or removing the `<b>` all red the build. |
| 12 | `share score` | `/class="sc-score">\d+<span/` | class exactly `sc-score`, last attribute, content = digits then `<span` |
| 13 | `share status` | `/class="sc-status">[^<]*</` | class exactly `sc-status`, last attribute, no children |
| 14 | `share line` | `/id="scLine">[^<]*</` | last attribute, no children |
| 15 | `verdict line` | `/id="verdictLine">[^<]*</` | last attribute, no children. Wrapped in `try` (`stamp.js:91–101`) but the `sub()` inside still counts toward `missing`. |

### 2.2 The 2 `market.html` markers (same counter)

| # | Label | Regex |
|---|---|---|
| 16 | `market score` | `/id="mktScore">[^<]*</` |
| 17 | `market band` | `/id="mktBand">[^<]*</` |

**All 17 verified present in the current tree by executing the regexes.**

### 2.3 Idempotent inserts — silent, not counted, but they need anchors

These do **not** increment `missing`, so a broken anchor fails quietly:

- **Atom feed link** (`stamp.js:74–77`): if `application/atom+xml` is absent, inserts before the literal string `<link rel="stylesheet" href="lab.css">`. Change that line and the feed link stops being self-healing.
- **Dataset JSON-LD** (`:78–88`): replaces everything between `<script type="application/ld+json" id="datasetLD">` and the next `</script>`; if the marker is absent, inserts before `</head>`.
- **Canonical** (`:104–106`): if `rel="canonical"` is absent, inserts before the literal `<meta property="og:url"`.
- **market.html OG image** (`:122`): swaps `<meta property="og:image" content="…">` only if `og-cards/market.png` exists.

### 2.4 The other gates that read `index.html`

Anyone restructuring the page has to satisfy four more consumers, none of which is `stamp.js`:

| Gate | Assertion | File |
|---|---|---|
| `release-gate.js` | `id=["']heroScore["'][^>]*>${score}<` must match | `scripts/lib/release-gate.js:68` |
| `release-gate.js` | `<title>[^<]*${monthLabel}</title>` must match | `:69` |
| `narrative-check.js` | `index.html` must contain **no** `{{…}}` token in the static file | `scripts/narrative-check.js` (generated-surface loop) |
| `tests/public-labels.test.js:45` | `index.html` source must literally match `/const amount=x\.contributesToOoze\?.*:'AUX'/` | — |
| `tests/public-labels.test.js:46` | source must contain `PROVISIONAL AUXILIARY SENSOR … 0-WEIGHT … DOES NOT ALTER THE OOZE SCORE` | — |
| `tests/public-labels.test.js:66–67` | source must contain `COLLECTION PIPELINE STALE` and `STALE INTAKE LINE` | — |
| `tests/market-public.test.js:68` | source must contain `` breadth.total} ticker proxies steady `` | — |

**These four test assertions grep the JavaScript source text of `index.html`, not the rendered output.** A refactor that moves the ledger renderer into `lab.js`, or renames `amount`, or changes the AUX string, fails `node --test` in the cron's *first* step — before collection even runs. This is the least discoverable constraint in the system, and it is not in `stamp.js`.

### 2.5 The token rule for any new prose block — read this before writing the story module

`EDITORIAL.story` contains `{{s:2026-07}}` **twice**. `resolveClaims()` (`lab.js:235–249`) is what turns it into `26`.

- **Client-side render → you MUST call `resolveClaims(EDITORIAL.story)`.** `index.html:185` currently renders `EDITORIAL.verdict` *without* it. That is safe only because today's verdict happens to carry no token; it is a latent hole.
- **The narrative gate will not save you here.** `narrative-check.js` reads `index.html` **from disk**. A token injected into the DOM at runtime is invisible to it. A raw `{{s:2026-07}}` would ship to readers with a green build.
- **Conversely, do not stamp `story` into the static file.** `stamp.js` has no `resolveClaims`; writing `editorial.story` raw into `index.html` puts a `{{…}}` into the file that `narrative-check.js` **does** scan → build red. If the story must be server-rendered for no-JS readers, `stamp.js` needs a token resolver first. That is a real piece of work, not a `sub()` call.
- **Bare score literals in prose** are checked by the `CLAIM` regex (`narrative-check.js:69`) only against `articles.js` / `data/auto-articles.js` / `data/reconstruction-reports.js`. `index.html` prose is *not* scanned for literals. That is not permission — the Constitution still forbids them, and `stamp.js` is the sanctioned way to put a number into the static file.

---

## 3. Design token inventory (`lab.css`)

### 3.1 `:root` — the full set (`lab.css:2–23`)

| Token | Value | Notes |
|---|---|---|
| `--bg` | `#070b06` | page canvas. Relative luminance 0.00298. |
| `--bg2` | `#0b110a` | used only inside `.wave` and gradients |
| `--panel` | `#0e150c` | every card / rail / ledger surface |
| `--line` | `rgba(163,255,18,.14)` | hairline. Derived from `--ooze`'s literal RGB, **not** from `var(--ooze)` — it does **not** re-tint by band. |
| `--line-hard` | `rgba(163,255,18,.32)` | same caveat |
| `--text` | `#e6f2da` | |
| `--muted` | `#8ba07c` | |
| `--dim` | `#708363` | annotated in source: *"AA contrast on --bg for small labels"* |
| `--ooze` | `#a3ff12` | the accent. **Overridden by `[data-level]` — see 3.2.** |
| `--ooze-deep` | `#5cb800` | jar liquid bottom stop; also band-overridden |
| `--status` | `#ffb02e` | band chip / status ring; also band-overridden |
| `--amber` | `#ffb02e` | fixed; "up / worse" delta colour |
| `--red` | `#ff4d3d` | fixed |
| `--green` | `#4dffa1` | fixed; "down / relief" delta colour |
| `--ward` | `#5fd7ff` | **RESERVED.** Source comment: *"THE market-wing hue — every Ward M reference uses this, nothing else does."* On `index.html` its only consumers are `#wardCard`'s dot (`:302`) and the `CATL.explainer/manual` article-tag colours (`:260`) — **that second use is already a violation of the reservation and should be resolved, not extended.** |
| `--glass` | `rgba(200,255,190,.05)` | jar neck |
| `--radius` | `14px` | |
| `--ease` | `cubic-bezier(.22,1,.36,1)` | *"the settle curve — declared once"* |
| `--mono` | `'IBM Plex Mono', ui-monospace, monospace` | body default |
| `--display` | `'Unbounded', sans-serif` | weights 400/600/800/900 loaded |

### 3.2 `[data-level]` band overrides (`lab.css:24–28`)

Each band re-tints **three** tokens:

| Level | Band | `--ooze` | `--ooze-deep` | `--status` |
|---|---|---|---|---|
| 1 | SMOOTH 0–20 | `#4dffa1` | `#12b56a` | `#4dffa1` |
| 2 | **STICKY 21–40 ← today** | `#8aff3c` | `#4ec800` | `#8aff3c` |
| 3 | SLIPPERY 41–60 | `#d8ff2e` | `#93b800` | `#d8ff2e` |
| 4 | OOZING 61–80 | `#b6ff1e` | `#6fae00` | `#ffb02e` |
| 5 | OVERFLOWING 81–100 | `#c8ff2a` | `#7fae00` | `#ff4d3d` |

Design intent, made explicit: **the ooze stays green all the way up; only `--status` goes amber then red.** The liquid never turns into a warning colour. That is a deliberate encoding — hue carries "this is ooze", the status ring carries severity — and it is worth preserving.

`[data-level]` also gates motion, not just colour:
`[data-level="5"] .jar{animation:shake}` (`:193`), `[data-level="5"] .wave{animation-duration:2.6s}` (`:205`), bubble counts per level (`:208–211`), `[data-level="5"] .drip{animation:jarDrip}` (`:223`), and the settle rules at `:214–218`.

**Scope trap.** On `index.html` the attribute lives on `div.wrap.pvJ#heroTheme` (`:33`), **not** on `:root` or `<body>`. So:
- `.big-score` (inside) is band-tinted → today renders `#8aff3c`.
- `.share-card .sc-score` (`section#report`, outside) uses `:root --ooze` → renders `#a3ff12`.
- The header score-chip, the footer, and `#report` are all outside the re-tint.

Two different greens for the same number on the same page. If a redesign wants one green, move `data-level` up to `<html>`/`<body>` — **but marker #6 (`id="heroTheme" data-level="\d"`) must survive the move, and `setJar()` (`lab.js:326`) writes `themeEl.dataset.level`, so both `stamp.js` and the JS call site have to change together.**

### 3.3 The parallel ramp that disagrees

`lab.js:253`: `LEVELCOLORS = ['#4dffa1','#8aff3c','#d8ff2e','#ffb02e','#ff4d3d']`.

This is used for every mini-jar fill (`#canCards` `:201`, the ledger's `njar`, the header score-pop, `#latestFile`'s thumb). It matches the `--ooze` CSS ramp at levels 1–3 and matches **`--status`** at levels 4–5. So a level-4 canister fill is amber while a level-4 hero jar is green. **Two ramps, one system.** Any token work should collapse them or document why they differ.

### 3.4 Accessibility floors already established

Measured with the WCAG relative-luminance formula against the literal tokens:

| Token | vs `--bg` `#070b06` | vs `--panel` `#0e150c` |
|---|---|---|
| `--text` `#e6f2da` | 17.06 : 1 | 15.98 : 1 |
| `--muted` `#8ba07c` | 7.00 : 1 | 6.56 : 1 |
| `--dim` `#708363` | **4.83 : 1** | **4.52 : 1** |
| `--ooze` `#a3ff12` | 15.92 : 1 | 14.91 : 1 |
| `--ward` `#5fd7ff` | 11.94 : 1 | 11.18 : 1 |
| `--amber` `#ffb02e` | 10.86 : 1 | 10.17 : 1 |
| `--green` `#4dffa1` | 15.23 : 1 | 14.26 : 1 |
| `--red` `#ff4d3d` | **6.02 : 1** | 5.64 : 1 |

**The floor is `--dim` at 4.52:1 on `--panel`.** It clears AA for normal text (4.5) by 0.02. Nothing may be dimmer than `--dim` on a panel. The inspiration board already flagged the second number here: **`--green` is 2.81× the luminance of `--red`** (0.7567 vs 0.2690). Green shouts, red mutters. Two states that must be told apart should be luminance-matched, and per WCAG 1.4.1 hue may never be the sole carrier.

Other established floors, all of which a redesign inherits:

- **Focus**: one global rule, `lab.css:43` — `a:focus-visible, button:focus-visible, summary:focus-visible, select:focus-visible, [tabindex]:focus-visible { outline:2px solid var(--ooze); outline-offset:2px; border-radius:2px }`. Do not remove; extend it if new interactive elements aren't `a`/`button`/`summary`.
- **Reduced motion**: `lab.css:603–607` kills *all* animation and transition, forces `.reveal`/`.cine` visible, and `display:none`s `#boot`. `index.html:162` independently short-circuits the boot ceremony. Both paths must keep working.
- **Type**: smallest declared size is `.52rem` (≈8.3 px, `.tabbar a small`), then `.54rem` (×1), `.56rem` (×5), `.58rem` (×9), `.6rem` (×10). Roughly **26 rules sit at or below 9.6 px**, most of them `--dim` with `.18–.34em` letter-spacing. **This is the weakest accessibility axis in the system** and Phase 2 should raise the floor rather than inherit it.
- **Touch/zoom**: form inputs are pinned to `font-size:16px` (`:517`, `:543`) to stop iOS zoom. `.tabbar` respects `env(safe-area-inset-bottom)` (`:121`).
- **Anchors**: `[id]{scroll-margin-top:130px}` (`:142`) — clears the sticky header + localnav.
- **Semantics on the jar**: `role="img"` + `aria-label` (`index.html:45`, re-set at `:177`). The aria-label text is a stamp marker (§2.1 #5).

### 3.5 A live CSS defect the designers will hit

`lab.css:174–178`:

```css
/* ============ AD SLOTS ============ */
  margin:0 auto;max-width:728px;min-height:90px;display:flex;align-items:center;justify-content:center;
  border:1px solid var(--line);border-radius:8px;color:var(--dim);
  font-size:.6rem;letter-spacing:.34em;text-transform:uppercase;background:rgba(0,0,0,.2);
}
```

The selector is gone. `git log -L 172,180:lab.css` shows commit `bc9d5f4` deleted the `.ad-slot{` line and the `.ad-wrap` rule but left the declaration body — confirmed by diff, not inferred.

Per CSS Syntax Level 3 error recovery, the parser consumes component values into the prelude until it finds the next `{`, which is **`.hero{` on line 181**. That makes the prelude invalid and drops the whole rule — so **`.hero{padding:0 0 30px; border-bottom:1px solid var(--line); position:relative}` never applies**, and `section{padding:74px 0}` (`:169`) wins instead, giving the hero ~74 px of dead space above the score and no `position:relative`.

**I could not execute a browser in this environment, so treat the visual consequence as high-confidence-but-unconfirmed:** the orphaned block and the deleted selector are verified from the file and from git; the swallow-the-next-rule behaviour is the spec'd recovery path, not something I ran. One devtools check on `.hero` confirms or refutes it in ten seconds. Fix is one line: delete `:174–178`.

---

## 4. The live July 2026 editorial payload — write against this, never lorem

Source: `data/editorial.json`, `generated 2026-08-14T12:46:21.211Z`, `month 2026-07`. Reproduced verbatim, tokens **unresolved** exactly as they exist on disk. `{{s:2026-07}}` resolves to **`26`**.

**`byline`**
> Drafted by OOZEBOT · reviewed by the Division of Economic Containment

**`verdict`** — *the only field on the homepage today*
> Calmer than 6 of every 10 months since 2003

**`summary`**
> The July 2026 Ooze Level sealed at `{{s:2026-07}}` out of 100 — Sticky territory, down 1 from June 2026. Calmer than 6 of every 10 months since 2003. The heaviest line was housing at 7 ounces.

**`story`** — *generated daily, gate-passing, rendered nowhere*
> For the average household, housing was the largest source of financial pressure in July 2026 — 7 of the month's `{{s:2026-07}}` ounces with the 30-year mortgage at 6.67%. The relief came from the two lines everyone feels first: gas prices (down 3 points) and inflation (down 3 points). Altogether the jar drained 1 point to `{{s:2026-07}}`, keeping the national containment level in the Sticky range.

*Resolved, as a reader would see it:* "…7 of the month's **26** ounces with the 30-year mortgage at 6.67%… the jar drained 1 point to **26**…" — **179 characters of already-written, already-gated answer.** Two tokens; both need `resolveClaims()`.

**`lines`** — one sentence per intake line, rendered today **only** on `indicator.html:73–76` ("Why it changed this month")

| slug | copy |
|---|---|
| `gas` | Pressure from gas prices eased, down 3 points with the pump price at $4.01. |
| `housing` | Housing was flat this month with the 30-year mortgage at 6.67%. |
| `credit` | Credit cards were flat this month with card delinquency at 2.9%. |
| `auto` | Auto loans were flat this month with auto-loan delinquency at 7.9%. |
| `jobs` | Employment held roughly steady — down 1 point with unemployment at 4.1%. |
| `inflation` | Pressure from inflation eased, down 3 points as yearly price growth ran 3.4%. |
| `financial` | Financial conditions held roughly steady — down 1 point with the Chicago Fed's conditions index at -0.55. |
| `foreclosures` | Mortgage distress held roughly steady — up 2 points with mortgage delinquency at 1.9%. (Auxiliary sensor — observed, but carries no score weight.) |
| `manufacturing` | Pressure from manufacturing climbed 3 points. (Auxiliary sensor — observed, but carries no score weight.) |

Note the shape: **every sentence carries its observed value in the same clause as its verb**, and the two AUX lines carry the disclosure in the same sentence, verbatim and identically. Any card design that shows a line must be able to carry that pair. (`manufacturing` is the one that does *not* carry a value — the copy says "climbed 3 points" with no observed number, while `latest.json` publishes `1.1% YoY`. Worth raising with the story engine's owner.)

**`confidence`** — 424 chars, rendered on the homepage nowhere
> Methodology v3.0.0. All source feeds current at collection. 2 recorded changes to published history on the public record (data/revisions.json); the cause of each is logged, not inferred. 1 methodology recalibration is separately identified in that record. Every figure traces to a cited public series; the integrity gate verified plausibility bounds and calibration anchors before publication.

**Other fields on disk, none of them on `index.html`**: `month`, `monthLabel`, `generated`, `newsletter` (the full plain-text edition, including a *"WHAT A HOUSEHOLD WOULD NOTICE"* paragraph that exists **only** inside this string), `rssSummary`, `social`, `articleSlug`.

**The household paragraph, extracted from `newsletter`** — it has no field of its own, which is why nothing renders it:
> For most households, July probably felt about the same as June. Filling the tank hurt less, grocery prices weren't rising as quickly, and steady employment kept paychecks coming. Housing remained the biggest source of strain, but for many families the month ended with a little more breathing room than it began.

⚠️ **This is the sentence `research/forensic/07-ux.md` §0 identifies as the site's live false positive** — *"steady employment kept paychecks coming"* in a month where participation and the employment-population ratio both fell. If a Phase 2 mockup surfaces this paragraph on the homepage, it surfaces that claim. **Do not promote the household paragraph without the Level-4 contradiction module beside it.** The story field is safe to promote today; the household paragraph is not.

### 4.1 Tally

13 fields in `data/editorial.json`. `index.html` reads **two** (`verdict` `:185`, `articleSlug` `:265`) and renders **one**.

---

## 5. AUX (zero-weight) handling — disclosed where, dropped where

### 5.1 The three different zeros

The system has **three** ways a line can print `0`, and today they are visually identical:

| Line | `weight` | `contributesToOoze` | `contrib` today | Meaning of the zero |
|---|---|---|---|---|
| `financial` | 3 | **true** | 0 | Weighted line whose stress (10) × weight (3%) **rounds to zero ounces this month** |
| `foreclosures` | 0 | **false** | 0 | Zero-weight by design — double-counts Housing |
| `manufacturing` | 0 | **false** | 0 | Zero-weight by design — transform not yet frozen |

`index.html:194` filters on `contributesToOoze`, so `financial` — a genuinely zero-ounce card — is eligible to be featured, and today **is** featured. Any redesign that ranks by ounces must decide what a 0-oz weighted line looks like. It is not the same thing as AUX, and it must not be labelled AUX.

### 5.2 Where AUX is disclosed

| Surface | Ref | Treatment |
|---|---|---|
| **The Ledger** (`index.html`) | `:212–215` | Delta replaced by the literal string `AUX`; colour forced to `--dim`; `title="PROVISIONAL AUXILIARY SENSOR · 0-WEIGHT · DOES NOT ALTER THE OOZE SCORE"`. Rows also sorted weighted-first (`:210`). **This is the reference implementation.** |
| `archive.html` | `:274` | `r-oz` shows `AUX` instead of `+0` |
| `indicator.html` header | `:59` | `Intake Line 08 — auxiliary sensor` in place of the `N% of formula` string |
| `notes.html` | `:54` | Full paragraph naming both lines, both series IDs, and the reason |
| `lab.js` `INDICATORS` | `:122–144` | `why` / `vs2008` / `faqs` all restate zero weight |
| `articles.js` | `:303`, `:320` | Two dedicated explainers: `foreclosures-aux-explained`, `manufacturing-aux-explained` |
| Ward M (`market.html`) | `:127–128` | `.ward-can.aux` dashed border + `<span class="wc-aux" title="Auxiliary — zero weight in the composite">AUX</span>` — **the badge pattern the household side does not have** |
| Editorial copy | `editorial.json.lines` | The disclosure is inside the sentence, not a footnote |

### 5.3 Where it is silently dropped — five places

1. **`lab.js:390–396` — the header score-pop. On every page of the site, including the homepage.**
   Iterates all of `LD.lines`, renders each with an identical mini-jar, value, and colour-coded delta, and closes with `<span class="sp-foot">July 2026 reading · 26/100</span>`. `foreclosures` shows a red-amber `▲2` and `manufacturing` shows `▲3` under a footer asserting a 26/100 reading — implying both moved the score. No badge, no dimming, no weight. This is UX-audit §5.4 and it is the highest-traffic instance.

2. **`what-is-ooze.html:86–87` — `#allLines`.**
   ```js
   $('allLines').innerHTML=INDICATORS.map(y=>
     `<a href="indicator.html?i=${y.slug}"><span>${y.emoji}</span> ${y.name} <span class="r-oz">+${y.contrib}</span></a>`).join('');
   ```
   No `contributesToOoze` check. Renders `+0` for `financial`, `foreclosures`, **and** `manufacturing` — the three different zeros of §5.1, identically. `archive.html:274` does the same job correctly, six lines of code away in a sibling file. **This is on the flagship first-timer explainer, whose step 06 climax is Foreclosures.**

3. **`indicator.html:110` — Cross-References.** Same `+${y.contrib}` with no check. `housing.related` includes `foreclosures`, so the Housing page's cross-reference row prints `🏦 Mortgage Distress +0` with no label.

4. **`indicator.html:62` — the contribution chip.** `lineLive = LIVE && x.val !== '—'`. `latest.json` now publishes `1.9%` for foreclosures and `1.1% YoY` for manufacturing, so `lineLive` is **true** for both and the chip reads **"Feeding the jar this month: +0 oz"** — asserting a feed that by design does not exist. The comment at `:42` (*"foreclosures/manufacturing stay pending even in LIVE"*) is stale: it was true when the values were `—`, and the collector has since wired both.

5. **`indicator.html:99` — "How it feeds the ooze".** Emits *"is an auxiliary sensor — it doesn't carry formula weight, **but it feeds the daily reading**"* immediately followed by *"Its current stress reading contributes **+0 of this month's 26 oz**"*. Two clauses of one sentence contradict each other.

6. *(Not a drop, but note it.)* `index.html:194` and `:272` both filter AUX out **silently** — no "2 auxiliary lines not shown here" affordance above the Ledger. The filtering is correct; the absence of a pointer is a comprehension gap, not an honesty one.

### 5.4 The rule for Phase 2

The Constitution's requirement (per UX audit §5.4) is that a non-scoring input carries its label **in the same sentence as its number, verbatim and identically each time — never a footnote, never once per report.** The Ledger and Ward M meet it. Four component paths do not. **Any new component that renders a line's ounces must take the AUX branch, and the `AUX` string and the `PROVISIONAL AUXILIARY SENSOR · 0-WEIGHT · DOES NOT ALTER THE OOZE SCORE` tooltip are asserted by `tests/public-labels.test.js:45–46` against the literal source of `index.html` — keep them or update the test in the same commit.**

---

## 6. Consolidated hazard list for a designer

Ranked by how quietly it fails.

| # | Hazard | Fails as |
|---|---|---|
| 1 | Any of the **17 stamp markers** (§2.1–2.2) changed | Red daily cron, `exit 1`, no publish |
| 2 | `tests/public-labels.test.js` / `market-public.test.js` **source-text greps** on `index.html` (§2.4) | Red cron in the *verify* step, before collection |
| 3 | `release-gate.js` `heroScore` + `<title>` month checks (§2.4) | Red cron at the end |
| 4 | Rendering `EDITORIAL.story` **without** `resolveClaims()` (§2.5) | **Silent.** `{{s:2026-07}}` ships to readers; the gate cannot see runtime DOM |
| 5 | Stamping `story` into the static file without a resolver (§2.5) | Red build via `narrative-check.js` (this one fails loudly — by design) |
| 6 | `document.querySelectorAll('.file-h')[2]` (`index.html:307`) | **Silent.** Add or remove a rail heading → wrong heading hidden when Ward M is absent |
| 7 | Any new ounces-rendering component missing the AUX branch (§5.4) | **Silent** falsehood on a trust site |
| 8 | Moving `data-level` off `#heroTheme` (§3.2) | Breaks marker #6 **and** `setJar()` together |
| 9 | Dropping `.cine c5` from `.specimen-line` (§2.1 #11) | Red build — the reveal-animation classes are a build dependency |
| 10 | `lab.css:174–178` orphaned block (§3.5) | Already failing, silently. Delete it before building anything on `.hero`. |

## 7. What I could not verify

- **Browser-rendered confirmation** that the orphaned CSS block at `lab.css:174–178` swallows the `.hero` rule. The deleted selector and the orphaned declarations are verified from the file and from `git log -L`; the parser-recovery consequence is reasoned from the CSS Syntax Level 3 error-recovery algorithm, not executed. Needs one devtools check.
- *(Corrected during writing — no longer a gap.)* `data/gate-status.json` **is** present and reads `{"status":"pass","month":"2026-07","headline":26,"warnings":[],"failures":[],"generated":"2026-08-14T12:46:21.211Z"}`. `stamp.js:22–36` hard-requires it and exits 1 if it is missing, non-`pass`, or covers a different month than `latest.json` — so the placard string at `#plcSealed` is the only claim on the page sourced from the gate rather than from the payload.
- **No network access was used.** Every FRED series ID quoted above appears verbatim in `data/latest.json`; none was fetched or re-verified here. The July 2026 FRED cross-checks in `research/forensic/07-ux.md` §1 are that document's, fetched on 2026-08-13, and are cited as its findings — not re-confirmed by me.
