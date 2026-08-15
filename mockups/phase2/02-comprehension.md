# 02 — Comprehension & Accessibility

**Phase 2 of the design gauntlet.** Builds on `mockups/inspiration-board.html` (phase 1 — the four
directions and the encoding law) and `research/forensic/07-ux.md` (the element classification and the
five-level ladder). Nothing in those two documents is restated as new here; where I disagree with them
I say so and give the reason.

**Repo state:** `main`, working tree dirty (Ward M in flight) · payload `data/latest.json` generated
`2026-08-14`, month `2026-07`, ooze `26`, prev `27` · `data/editorial.json` generated `2026-08-14T12:46Z`.

**What I could and could not access — stated up front, per the workflow's honesty rule.**
Everything numeric below is either (a) read out of a file in this repo, (b) produced by code I executed
against `data/latest.json`, or (c) arithmetic I ran on the literal token values in `lab.css`. I did
**not** fetch FRED, Dribbble, or any external source. Where I cite the July labour-force figures
(`PAYEMS`, `CIVPART`, `EMRATIO`) I am quoting `research/forensic/07-ux.md` §1 as that audit's claim,
attributed, **not** re-verified by me. The contrast ratios, the readability scores, the featured-canister
sort, and the touch-target measurements are mine and reproducible from the commands in this document.

---

## 1. The 30-second test

### 1.1 What the test is

> **A stranger opens the homepage on a phone, spends 30 seconds, closes the tab, and tells one other
> person what they just saw. The test is passed if the second person could act on what they heard —
> and if nothing the stranger says is false.**

That second clause is the half everyone forgets. A page can score well on recall and still fail, because
a confidently-repeated wrong sentence is worse than a shrug. The current homepage fails mostly on the
second clause, which is why the panel's *first-time comprehension 3.5* and *integrity 8.8* can both be
true at once. The instrument is honest. The sentence it puts in a stranger's mouth is not.

The test is not my invention — it is the Constitution's own Reader Promise (§2) with a stopwatch on it:

| §2 promise | Deadline | Delivered on `index.html`? |
|---|---|---|
| 1. What the number is — reading, band, direction | 15s | **Yes.** This is the site's best work. |
| 2. Why it moved — which lines, in plain words, **with their observed values** | 30s | **No.** |
| 3. What a household would notice | 30s | **No.** Generated, never rendered. |
| 4. What to watch next — a named date | 3min | **No.** A rail link labelled *"When the next reading arrives"*; no date on the page. |

§2 also says *"A reader who gets only the first 15 seconds still leaves with #1."* Verified: they do.
**The 15-second promise is kept. The 30-second promise is not.** That is the whole gap, stated in the
project's own vocabulary.

### 1.2 The exact target sentence — July 2026

Using today's real values (jar 26, Sticky, down 1 from June, heaviest line housing 7 oz, relief from gas
and inflation), this is what a stranger must be able to say:

> **"It's a 0-to-100 score for how squeezed American households are. This month it's 26, which is on the
> calm side — calmer than 6 of every 10 months since 2003 — and it's down 1 from June. Housing is the
> heaviest piece of it. Gas and grocery prices are what eased."**

Measured (script in §2.1): **44 words · 4 sentences · avg 11.0 words · Flesch-Kincaid grade 4.0 · Gunning
Fog 8.0 · 17.6 seconds spoken at 150 wpm.** It fits the budget with 12 seconds of slack, which is the
margin you need for a real human who also has to find the information.

Five clauses, each independently scoreable. This is the rubric:

| # | Clause | The stranger must convey | Why it is non-negotiable |
|---|---|---|---|
| **A** | **Subject** | a 0–100 score, US households, money pressure | Without this the other four are noise. It is the only clause that makes the number mean anything. |
| **B** | **Reading + placement** | 26, and that 26 is low-ish by the site's own record | A bare `26/100` is unplaceable. `Calmer than 6 of every 10 months since 2003` is the placement. |
| **C** | **Direction** | down 1 from last month | The returner's headline (§11) and the "better or worse" question. |
| **D** | **Heaviest** | housing is the biggest single piece | *"Why?"* — and the one clause the current page makes impossible. |
| **E** | **Relief** | gas and grocery prices eased | *"Does it affect me?"* — the two lines a household feels first, which is a protected phrase for exactly this reason. |

Deliberately **not** in the target sentence: the word *ooze*, the word *ounces*, the word *containment*,
the band name *Sticky*, the number of intake lines, the methodology version, Ward M, and anything about
next month. A stranger who repeats the brand instead of the finding has failed the test, not passed it.

### 1.3 Scoring the current homepage

**Method, and its limit.** I read `index.html` end to end and executed its own rendering logic against
`data/latest.json`. This is an analytic score against the rubric above, not an empirical one — I ran no
browser and no user session. §1.5 gives the protocol to run it for real, which is worth more than my
number. Two points per clause.

| Clause | Score | What actually renders | Verdict |
|---|---|---|---|
| **A — Subject** | **0.5 / 2** | `index.html:36` kicker `Today's Containment Level`, overwritten at `:180` to `Containment Level — July 2026`. Then `26/100`. | The words *household*, *economic*, *stress*, *money*, and *United States* appear **nowhere in the rendered homepage** (`grep -c 'household' index.html` → 0). They exist only in `<meta name="description">` and `<title>`, which the visitor does not read. The one on-page noun is *Containment* — see §2.3. A stranger leaves knowing there is a number and not what it counts. |
| **B — Reading + placement** | **2 / 2** | `:37` big score with count-up · `:39` `STICKY` chip → `what-is-ooze.html#scale` · `:42` `Calmer than 6 of every 10 months since 2003` | **The strongest element on the site.** The verdict line does the band's job better than the band does: it is grade-4.5, self-glossing, and needs no vocabulary. Do not touch it. Note the implication — the band chip is *carried* by the verdict line, not the reverse. |
| **C — Direction** | **1.5 / 2** | `:40, :182–184` → `▼ −1 VS JUNE 2026`, coloured by `d>=0?amber:green` | Direction is legible. But `−1` names no unit, against the Constitution's own **four units, locked** (§3): *"A signed number never ships without one of these."* And in a flat month `d>=0` puts zero on the **up** branch: the headline would read **`▲ +0 VS JUNE 2026` in amber** — the warning colour, for a month that did not move. See §3.6. |
| **D — Heaviest** | **0 / 2** | Housing, credit and auto appear only in the Ledger, below the featured cards, as **`▲0` in amber**. Their ounces appear nowhere above the share card. | Total failure, and worse than absence — see §1.4. |
| **E — Relief** | **1 / 2** | Gas and inflation *are* two of the four featured cards. | But the card face is `name · glass · Level: 58 · ▼3`. The **observed value is not on the card** — `$4.01` never appears. A stranger repeats *"gas is at 58"*. |

**Total: 5 / 10.** Consistent with the panel's 3.5 once you weight D at its true cost, because D does not
merely fail to inform — it misinforms, and §1.4 is why.

### 1.4 The false repeats — what the page currently puts in a stranger's mouth

Each of these is produced by code I executed, not inferred.

**FALSE REPEAT 1 — "The four things driving it are gas, inflation, jobs and financial conditions."**

`index.html:196` sorts by `Math.abs(delta)` then `stress`. Executed against the live payload:

```
1. gas         contrib= 4oz  delta=-3  stress=58
2. inflation   contrib= 2oz  delta=-3  stress=30
3. jobs        contrib= 2oz  delta=-1  stress=13
4. financial   contrib= 0oz  delta=-1  stress=10
featured ounces total = 8 of 26        not featured: housing, credit, auto  (7+6+5 = 18 of 26)
```

Under a heading that says **Intake Canisters**, above a link that says **VIEW ALL INTAKE LINES**, the
page presents four cards. Every convention of the layout says *these are the important ones*. They are
69% of the jar's ounces short, and **one of them contributes zero ounces**. This is the brief's defect #2,
confirmed by execution.

The detail the prior audits missed: **the correct sort is already in the same file, 114 lines below the
wrong one.** `index.html:310` reads `[...INDICATORS].sort((a,b)=>b.contrib-a.contrib).slice(0,3)` and
`:314` renders `Housing 7 oz · Credit Cards 6 oz · Auto Loans 5 oz` into `#scLine`.

> **The homepage's only correct, ounce-denominated statement of what the jar is made of is inside the
> share card — the component whose entire purpose is to be copied and taken somewhere else.** The site
> tells strangers on other platforms what it declines to tell the visitor standing in front of it.

That is not a missing feature. That is a fix with an existing comparator, in the same file, already
passing whatever review shipped it.

**FALSE REPEAT 2 — "Housing, credit cards and car loans are going up."**

`index.html:212–215`: `${x.delta>=0?'▲':'▼'}${Math.abs(x.delta)}` and
`color:${x.delta>=0?'var(--amber)':'var(--green)'}`. **Zero takes the `>=` branch.** Housing, credit and
auto all have `delta: 0`, so all three render **`▲0` in `--amber`** — an up-arrow in the warning colour,
for lines that did not move. Those three lines are **18 of the jar's 26 ounces**. A stranger asked
*"what's getting worse?"* reads the Ledger and names the three heaviest lines. Every word of that is
false, and it is caused by one character.

Neither `07-ux.md` nor the inspiration board reports this. It is live today, on the homepage and in the
hero delta, and it is the actual colour-carries-meaning bug on this site — see §3.6.

**FALSE REPEAT 3 — "Gas is at 58 and it went down 3."**

`.pk-can` renders `y.name`, the glass, `Level: ${l.stress}`, and `▲/▼${l.delta}`. It never renders
`l.value`. So the featured cards name seven lines and print not one observed value — a direct violation
of Constitution §4: *"No line is named in prose without the observed value that produced its score, in
the same sentence."* The prior audit specified the fixed card without noting that the shipped card
breaches this clause today. It does.

And in the Ledger the collision is sharper: `<b>$4.01</b>` sits in one grid column and `▼3` in the next,
46px apart, **in two different units, with neither unit named**. `$4.01` is dollars at the pump; `3` is
stress points on a 0–100 scale. See §3.6 — this, not the green/red polarity question, is the live
encoding defect in this component.

**FALSE REPEAT 4 — "It's some kind of lab simulation thing."**

`BOOT_LINES` (`:141–147`) is five lines: `DIVISION OF ECONOMIC CONTAINMENT`, `SPECIMEN US-ECON-01`,
`PRESSURE SENSORS ×8`, `INTEGRITY GATE`, `VISITOR CLEARANCE`. The subject of the site appears only as the
substring `ECON` inside an asset tag. Timing, computed from `:166–170`: `220 + 5×300 + 500` =
**2,220 ms minimum** before `endBoot()`, then the `.cine c1–c5` reveals stagger after it. That is ~7% of
the 30-second budget spent establishing genre, on the one visit where the reader decides whether this is
a measurement or a bit. It runs once per browser and honours reduced-motion — but "once per browser" *is*
the first-timer, which is the exact population this document is about.

*(The `×8` drift is `07-ux.md` §5.8 — there are 9 intake lines. Not re-reported.)*

### 1.5 What must be on the page for the test to pass

Clause-by-clause, mapped to an element. This is the acceptance criteria for whatever phase 2 builds — it
is not a layout, and it deliberately does not choose between the four directions on the inspiration board.

| Clause | Element that must carry it | Requirement |
|---|---|---|
| **A** | The kicker, `index.html:36` | Must name the subject in words a neighbour uses. `Containment Level — July 2026` fails. Something in the shape of *"How squeezed U.S. households are — July 2026"* passes. The lore keeps the byline; it does not keep the definition. §2.3 rules on this. |
| **B** | Big score + verdict line | **Unchanged.** Already passes. Add only the band gloss the Constitution already mandates and the page omits (§2.3). |
| **C** | Hero delta | Add the unit. Kill the `>=0` zero-is-up branch (§3.6). |
| **D** | **The block that replaces the featured canisters** | The three heaviest by ounces, printed as ounces, **against the printed whole** — `7 of 26`, never `7 oz` alone. `07-ux.md` §3 Level 2 drafted this; my addition is that the denominator is not decoration, it is the gloss that makes the unit self-teaching (§2.3). |
| **E** | Same block + `EDITORIAL.story` | Every card carries its observed value (§4 compliance). `EDITORIAL.story` renders below it — brief defect #1, a `div` and one line of JS. |

**Ordering rule, and it is the one thing I would argue hardest for:** heaviest first, movers second. The
current page is sorted by *what changed*; the target sentence needs *what it is made of*. In most months
the heavy lines are flat by construction, so a change-sorted module is structurally guaranteed to hide
the jar's composition exactly when composition is the only story. This is the same failure mode as the
empty state in §4 — a surface that only speaks when something moves is silent in the months that make up
most of the record.

**The empirical protocol** (worth more than my 5/10 — run it before and after):
five people who have never seen the site, phone, 30 seconds, close the tab, then *"tell me what that
was"* — recorded verbatim, no prompting. Score each transcript for the five clauses **and count false
statements separately**. Ship threshold: **clause A + B + C + D present in 4 of 5, and zero false
statements in 5 of 5.** Clause E is a bonus. A page that scores 5/5 on recall and produces one confident
falsehood has not passed.

---

## 2. Reading level

### 2.1 Method, and what the numbers are worth

Computed locally in Python: Flesch-Kincaid grade, Gunning Fog, Flesch Reading Ease, with `{{...}}` tokens
resolved first so I am measuring **what the reader sees**, not what the generator writes.

Both formulas are proxies calibrated on continuous prose. They punish polysyllables regardless of
familiarity — *household* and *everyone* cost the same as *containment* — and they are blind to short
jargon, which is precisely where this site's cost sits (*oz*, *line*, *level*, *jar*, *AUX*). **So the
formula is the floor of the analysis, not the analysis.** §2.3 does the part the formula cannot.

### 2.2 The scores

| Text | Rendered on the homepage? | Words | Avg sentence | **FK grade** | Fog | Ease |
|---|---|---|---|---|---|---|
| `EDITORIAL.verdict` | **Yes — the only one** | 6 | 6.0 | **4.5** | 9.1 | 73.8 |
| `EDITORIAL.summary` | No | 26 | 6.5 | **3.7** | 5.7 | 79.8 |
| `EDITORIAL.story` | **No** | 56 | 18.7 | **9.0** | 13.2 | 64.0 |
| *What a household would notice* | No (newsletter only) | 51 | 17.0 | **8.9** | 10.7 | 61.9 |

**The finding is the shape of that table, not any single row.** The site renders its grade-4.5 sentence
and withholds its grade-9 one. That is backwards in an instructive way: the withheld paragraphs are the
ones carrying the *causes*, and causes are what a first-timer needs and what the panel scored 3.5.
Rendering `story` will therefore **raise** the homepage's reading level from ~4.5 to ~9 — and that is the
correct trade, because 9 is a normal newspaper grade and 4.5 with no explanation is a scoreboard. But it
should be paid down to ~8 on the way in, and §2.3 says exactly which words to spend.

**The most expensive sentence on the site**, from `story`:

> *"Altogether the jar drained 1 point to 26, keeping the national containment level in the Sticky range."*

Sixteen words carrying four unglossed items: **the jar**, **1 point** (on which scale?), **national
containment level**, **the Sticky range**. `drained` is the one word doing honest work — it is physical,
it matches the graphic, and it is on the Constitution's §3 verb ladder. The sentence is not badly
written; it is written for a reader who has already been onboarded, and it is the third sentence a
first-timer would ever read.

### 2.3 The vocabulary ruling — which lore earns its place

The operator values this lore and it is not the problem. **Unglossed lore in a definitional position is
the problem.** The test I am applying is one line:

> **A coined term earns its place when the thing next to it teaches it. It costs the reader when it is
> the only thing naming a concept the reader does not yet have.**

That is not my rule, it is Constitution §3: *"Glossary at first use. The coined terms the jar, the
cascade, ounces, and the band names carry a glossing clause on first use in every piece."* **`index.html`
carries none of them** — verified: `grep -c 'Sticky territory' index.html` → 0, `grep -c 'ounce'` → 0.

| Term | Where it sits | Ruling | Reason |
|---|---|---|---|
| **the jar** | hero graphic, `story`, everywhere | **EARNS IT** | The cheapest metaphor on the site. It has a picture directly beside it whose fill *is* the number, so the graphic is the gloss. Physical, one syllable, a neighbour would say it. Keep, unchanged. |
| **ounces / oz** | share card only (5 occurrences, all in the copy-out block) | **EARNS IT — conditionally, and the condition is currently unmet** | `oz` is the only unit on the site under which the parts sum to the whole, which is the exact arithmetic clause D of the 30-second test needs. But **a unit that never appears cannot teach anything**, and it appears zero times above the share card. The condition: it must print as **"7 of the month's 26 ounces"**, never `7 oz` alone. The denominator *is* the glossing clause — it defines the unit and proves the fraction sweep (§12) in the same breath. Printed bare, it is a new word for nothing. |
| **containment / Containment Level** | `index.html:36`, the kicker — **the first words above the number**, and its label | **DOES NOT EARN IT — the single most expensive word on the page** | Four syllables, abstract, no physical referent for a household, and it is the one word carrying definitional load. It is the answer to *"26 what?"* and it answers *"contained what?"*. Ruling: **containment is excellent as an institution and fatal as a unit label.** Keep it in the byline, the boot, `Division of Economic Containment`, the sign-off, `notes.html` — everywhere it is flavour. Remove it from the kicker, which must state the subject (clause A). This is one string and it is the highest-leverage word change in this document. |
| **intake line** | Ledger, `notes.html`, `indicator.html` | **EARNS IT downstream — DOES NOT EARN IT as the homepage heading** | *"Intake Canisters"* is the heading over the answer to *"why did it move?"*, and it names apparatus rather than cause. The reader has not opted in yet. Ruling: the heading becomes the question — **`WHAT'S DRIVING IT`** — and the lore rides as an appositive subtitle, *"the seven intake lines"*. That is a glossing clause under §3, it costs nothing, and it teaches the term for free at the moment the reader can see what one is. On `indicator.html` and `notes.html`, where the reader clicked, *intake line* is correct and consistent — leave it. |
| **specimen** | `:71` specimen-sealed line, bottom of fold | **EARNS IT, and its position is why** | *"Monthly specimen sealed: July 2026 = 26"* does the most under-appreciated job on the page: it says the number is **fixed for the month**. That is the single most misunderstood property of the product. Its neighbours (*sealed*, *collected 2026-08-14*) gloss it. Keep. **Consequence:** the daily streak counter (`:236–243`) is not merely a taste question as `07-ux.md` §5.11 has it — it is a *comprehension contradiction*. One line teaches monthly; the widget four pixels away rewards daily. In this document's frame that is two surfaces disagreeing about the same fact, which §5 forbids. |
| **ward / Ward M** | rail, below fold, `--ward` hue | **EARNS IT** | Proper noun for a named wing, uniquely coloured, self-glossing on its own card (*MARKET OOZE · EXPERIMENTAL*, *Markets read N*). Priced correctly. **But** the §11 firewall sentence is absent: *"Every household report states, once, that the market wing exists and carries zero weight."* `grep -i 'zero.weight\|no score weight' index.html` → 0 hits. The card names the wing and never states the firewall. |
| **ooze** | brand, domain, 57 occurrences | **EARNS IT** | No first-timer needs to know what ooze *is* to say *"26 out of 100"*. It is a brand doing brand work, glossed by *What is Ooze?* in the rail. Zero comprehension cost. |
| **Level: 58** on the canister face | featured cards | **DOES NOT EARN IT — the worst kind** | A common word used in an uncommon way. It *looks* defined and is not. There is no scale, no unit, no observed value beside it, and "level" already means the band elsewhere on the same page (`data-level`, *Containment Level*). Three different senses of one word in one viewport. Replace with ounces-against-the-whole plus the observed value. |
| **AUX** | Ledger, auxiliary rows | **EARNS THE INTENT, FAILS THE DELIVERY** | The three-letter mark is correct and the Ledger is the only component that gets the firewall right. But the *explanation* lives in a `title` attribute (`:213`) — and **a tooltip does not exist on touch, is inconsistently announced by screen readers, and is not keyboard-reachable.** §4 requires the label *"in the same sentence as their number… never a footnote."* A tooltip is a footnote you cannot open on a phone. See §3.5. |
| **clearance check / boot** | first 2.2s | **DOES NOT EARN ITS POSITION** | Genre before subject, on the one visit that decides trust. §1.4. |

**Target for anything phase 2 ships: Flesch-Kincaid ≤ 8.0, Fog ≤ 10, no sentence over 22 words, and every
coined term glossed at first use on that surface — not on a linked one.**

---

## 3. Accessibility floor

All ratios computed by me from the literal hex values in `lab.css:2–23`, WCAG 2.x relative-luminance
formula, sRGB. Reproducible; the script is in this document's method notes.

### 3.1 Contrast — the tokens

| Token | Hex | vs `--bg` #070b06 | vs `--panel` #0e150c | Normal text | Large text |
|---|---|---|---|---|---|
| `--text` | `#e6f2da` | **17.06** | 15.98 | AAA | AAA |
| `--ooze` | `#a3ff12` | **15.92** | 14.91 | AAA | AAA |
| `--green` | `#4dffa1` | **15.23** | 14.26 | AAA | AAA |
| `--ward` | `#5fd7ff` | **11.94** | 11.18 | AAA | AAA |
| `--amber` | `#ffb02e` | **10.86** | 10.17 | AAA | AAA |
| `--ooze-deep` | `#5cb800` | **7.84** | 7.35 | AAA | AAA |
| `--muted` | `#8ba07c` | **7.00** | 6.56 | **AAA, exactly at the boundary** | AAA |
| `--red` | `#ff4d3d` | **6.02** | 5.64 | AA | AAA |
| `--dim` | `#708363` | **4.83** | **4.52** | AA | AAA |
| `--line-hard` @32% over bg | ≈`#2c4a0d` | **1.97** | 1.84 | — | fails 1.4.11 (needs 3.0) |

**This palette is in unusually good shape and that deserves saying** — six of nine tokens clear AAA on
both surfaces, and the accent is at 15.92:1. The problems are three specific ones:

**(a) `--dim` on `--panel` is AA by 0.02.** The comment at `lab.css:10` reads *"AA contrast on `--bg` for
small labels."* True on `--bg` (4.83). On `--panel` it is **4.52 against a 4.50 floor — a margin of
0.4%.** That is not a floor, it is a coincidence. Any panel that lightens, any `--dim` text over
`--glass`, any future `rgba` overlay drops it below AA silently. **Rule: `--dim` is not a token you may
place on anything but `--bg`, and phase 2 must not assume otherwise.**

**(b) The ratio is right and the size is wrong.** Contrast ratio does not model type size, and `--dim` is
used almost exclusively at the bottom of the scale. Counted in `lab.css`:

```
.52rem × 1    .54rem × 1    .56rem × 5    .58rem × 9    .60rem × 10
→ 26 rules render text at or under 9.6px, most of them --dim, most with .14–.34em letter-spacing
```

`.pvJ-label` is `.62rem` at **`.34em` letter-spacing** in `--dim`; `.division` is `.56rem` at `.34em`.
Wide tracking at ~9px destroys word-shape recognition, which is a *comprehension* cost before it is a
legibility one and it falls hardest on dyslexic readers. `07-ux.md` §5.15 named the type floor as the
weak axis; this is the quantification and the mechanism.

**(c) `--line-hard` at 1.97:1 fails SC 1.4.11 (3.0 for non-text UI).** It is the border of `.can-glass`,
`.njar`, the tabbar top rule, and the `.wc-aux` badge — i.e. the outline of the jar glyphs. The jar's
*fill* is the datum and it is high-contrast, so no information is lost; but the badge border at
`.wc-aux` (`.54rem`, `--dim`, `--line-hard` border) is a disclosure whose entire visual identity is
sub-threshold on all three axes at once.

**Floor for phase 2 — binding:**

| | Rule |
|---|---|
| Size | **≥ 0.75rem (12px)** for any text a first-timer must read to pass the 30-second test. Nothing in the new blocks below `.7rem`. |
| Colour | **`--muted` (7.00:1) is the minimum** for that text. `--dim` is reserved for ≤3-word chrome labels on `--bg` only — **never** a number, a unit, or a disclosure. |
| Tracking | **≤ .14em** below `.8rem`; **0** on anything that is a sentence. |
| Non-text | Any border carrying meaning uses `--muted` or above, not `--line-hard`. |

### 3.2 Focus states — mostly right, with one verified surprise

`lab.css:43` — `a, button, summary, select, [tabindex]` on `:focus-visible` get
`outline:2px solid var(--ooze); outline-offset:2px; border-radius:2px`. Correct pattern, correct
pseudo-class, generous offset.

**The surprise, and it is good news:** `--ooze` is *redefined* by `[data-level]` (`lab.css:24–28`) and
`#heroTheme` carries `data-level="2"`, so the focus ring inside the hero is `#8aff3c`, not `#a3ff12`. I
checked all five band accents against `--bg`: **15.23, 15.53, 17.24, 16.34, 16.79.** SC 1.4.11 needs 3.0.
**The focus indicator survives every theme swap with 5× headroom.** Verified, not assumed — worth
recording because a themed focus colour is normally where this breaks.

Two gaps, both **out of scope for phase 2** but recorded so they are not lost:
- `lab.css:518, :544` — `.nl-form input:focus` and `.calc-form input:focus` use `border-color` +
  `box-shadow: 0 0 14px rgba(163,255,18,.2)`. That is `:focus`, not `:focus-visible`, and it is a
  **colour-only focus indicator** — the glow at 20% alpha over near-black is far under 3:1. If phase 2
  adds any input (it should not), it uses the `:43` pattern.
- `lab.css:107` — `.score-pop` is `display:none` until `:hover`/`:focus-within`, so it is keyboard-
  reachable only via a focusable descendant. Not a phase 2 surface.

### 3.3 Touch targets

Computed from the shipped rules. WCAG 2.5.8 (AA) = 24×24 CSS px; 2.5.5 (AAA) and both platform HIGs = 44.

| Element | Computed height | 24 | 44 | Note |
|---|---|---|---|---|
| `.pv-evidence a` | 14 + 18.4 + 14 = **46.4px** | ✅ | ✅ | **The model.** The trust spine is the most tappable thing on the page. Correct instinct — copy this. |
| `.tabbar a` | 6 + 26.9 + 3 + 13.3 + 6 ≈ **55px** | ✅ | ✅ | |
| `.pk-can` | ≈ **171px** tall | ✅ | ✅ | |
| `.pk-lrow` | 11 + 19.5 + 11 ≈ **41.5px** | ✅ | ✗ | Full-width, so only marginal. It is the sole route to a line page for 5 of 9 lines. `padding:13px 0` → 45.5px. |
| `.status-chip` | 7 + 21.8 + 7 ≈ **35.8px** | ✅ | ✗ | **The one that matters.** This is *"what does STICKY mean?"* — the primary explanatory affordance for a first-timer — and it is the smallest interactive element in the hero. `padding:12px 16px` → 45.8px. One number. |
| `.pk-more` | inline `<a>`, `.68rem`, **no padding** ≈ **17.4px** | ✗ | ✗ | **Fails AA outright.** Three instances on the homepage: `VIEW ALL INTAKE LINES →`, `ALL FILES →`, `OPEN THE WARD →`. Fix: `display:inline-block; padding:12px 0` → 41px, or `padding:12px 14px` with the existing border → 45px. |

### 3.4 prefers-reduced-motion — and a correction to the prior audit

`lab.css:603–607` is thorough: `*{animation:none!important;transition:none!important}`, `.reveal`/`.cine`
reset to `opacity:1;transform:none`, `#boot{display:none}`. `index.html:162` additionally short-circuits
the boot straight to `endBoot()`.

`07-ux.md` §5.15 records this as *"prefers-reduced-motion is honored."* **That is not quite true, and the
exception is on the most important element on the page.**

`endBoot()` calls `startCountUp()` (`index.html:154`), and `startCountUp()` (`:246–255`) is driven by
`requestAnimationFrame`, not by CSS. **`animation:none!important` cannot stop it.** So a reader who has
asked their operating system for no motion still gets the headline number animating `0 → 26` over
1600 ms. `setJar()` is also fired on a 300 ms timeout (`:155`).

This is two failures in one:
- **Motion** — SC 2.3.3, and worse for a screen-magnifier user, for whom a changing primary datum at high
  zoom is genuinely disorienting.
- **Comprehension** — for 1.6 seconds the single number this entire page exists to communicate is
  **wrong**. It reads 0, then 7, then 14, then 21. A reader whose 30 seconds includes a screenshot, a
  glance, or a slow connection can read a false score off the hero. On a site whose differentiator is
  checkable claims, the headline figure is briefly uncheckable by construction.

Fix, three lines, in `index.html`:

```js
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
function startCountUp(){
  if(countStarted) return; countStarted = true;
  if(REDUCE){ $('heroScore').textContent = TODAY_SCORE; return; }   // ← the missing branch
  /* …existing rAF loop… */
}
```

Phase 2 rule: **any JS-driven animation must read the same media query the CSS does.** The stylesheet
cannot police `requestAnimationFrame`.

### 3.5 Is colour alone carrying meaning today?

SC 1.4.1. I checked every coloured surface on `index.html`:

| Surface | Carriers | Verdict |
|---|---|---|
| Ledger + canister deltas | `▲`/`▼` glyph **and** amber/green | ✅ **Satisfied** — the glyph is the redundant carrier. |
| Hero delta | `▲ +` / `▼ −` glyph, sign, **and** the words `VS JUNE 2026` | ✅ Satisfied. |
| Band accent (`[data-level]` retheming the whole page) | the word `STICKY` in `.status-chip` | ✅ Satisfied. |
| `.fi-dot` category dots in the rail | the category label prints immediately after | ✅ Satisfied. |
| **AUX rows** | the literal string `AUX` **and** `--dim` | ✅ Satisfied for *state*… |
| …but the **meaning** of AUX | a `title` attribute, and nothing else | ❌ **Not a 1.4.1 failure — a delivery failure.** Invisible on touch, unreliable to screen readers, not keyboard-reachable. Constitution §4 says the label rides *in the same sentence as the number, never a footnote*. Promote it to visible text: `AUX · no score weight`, `--muted`, `.7rem`. It costs 15 characters and it is the difference between a disclosure and a gesture at one. |
| `--ward` reserved hue | Today the Ward card also prints `MARKET OOZE · EXPERIMENTAL` | ✅ Satisfied **today**. **Standing rule for phase 2:** `--ward` may never be the sole carrier of the zero-weight firewall. A reserved hue is a *colour-only encoding of provenance*, and provenance is exactly the thing that must never be colour-only. |

**Net: `index.html` currently passes 1.4.1.** The exposure is entirely forward-looking, which is what
§3.6 is about.

### 3.6 Ruling on `.down{color:var(--green)}` — does it matter for THIS work?

Two prior positions, and they disagree:

- **`07-ux.md` §5.14** — NOT-A-PROBLEM, downgraded. *"Every value these classes currently colour is a
  stress delta, where 'down' genuinely is relief… There is no surface today on which 'down = green'
  prints a falsehood."* Sequencing: fix it when the cross-check module ships, not before.
- **`inspiration-board.html` D2** — *"it caught a live defect… down is coded as good, in two separate
  components… it is the same mistake our algorithm made, sitting in our CSS."*

**My ruling: `07-ux.md` is right about today's render. The inspiration board is right about the law.
Both are looking at the wrong bug.**

I verified the render. `lab.css:115` and `:490` are `.score-pop .sp-d.down` and `.ind-meta .down`; the
homepage's own deltas use inline styles, not these classes; and every value any of them colour is a
*stress* delta, where down is relief. **No falsehood renders today.** The downgrade holds and I would not
open a ticket on it.

But the polarity question is not what is costing comprehension in this component. **Two things are, and
both are live right now:**

**(i) The unit collision.** `.pk-lrow` prints `<b>$4.01</b>` and `▼3` in adjacent grid columns, 46px
apart, in two different units, **naming neither**. `$4.01` is dollars at the pump. `3` is stress points on
a 0–100 scale. A stranger reads *"Gas Prices, four dollars one, down three"* — down three cents? three
percent? It is three points of a hidden index. The Constitution's own **four units, locked** (§3) is
unambiguous: *"A signed number never ships without one of these"* — `oz`, `points`, `/100`. **`▼3` ships
without any of them, in the two most-read components on the site, on all seven weighted lines, every
month.** That is a live §3 violation, it fires 7× per render, and it is squarely in this document's lane.

**(ii) Zero is rendered as an increase, in the warning colour.** `x.delta>=0` (§1.4, FALSE REPEAT 2).
Housing, credit and auto — 18 of 26 ounces — currently show `▲0` in `--amber`. This *is* the
colour-carries-meaning bug that is live on this site, and it is not the one either prior document
reports. In a flat month the hero itself reads `▲ +0 VS JUNE 2026` in amber.

**So, for THIS work:**

| | |
|---|---|
| **`.down{green}` polarity** | **A precondition, not a ticket.** Do not open it. Adopt the inspiration board's D2 law — *hue may never carry state alone; two states that must be distinguished are luminance-matched* — as the **build rule** for every element phase 2 ships, and ship the polarity guard *inside* the component that first renders a value-delta rather than a stress-delta. That is `07-ux.md`'s sequencing and it is correct. Note the D2 arithmetic is real and I re-derived it: `--green` 15.23:1, `--red` 6.02:1 — **green is 2.81× the luminance of red on this canvas**; `--green` vs `--amber` is only 1.40:1, so those two are near-luminance-matched and are the better opposed pair on this palette. |
| **The `>=0` zero branch** | **Fix now.** Three characters plus a third state. Live falsehood about 18 of 26 ounces. |
| **The missing units** | **Fix now, and it is inseparable from the §1.5 rebuild** — the new block cannot print ounces against the whole while the Ledger beneath it prints unlabelled points. |

**Proposed third state**, so zero has a shape, a word, and a neutral hue rather than borrowing "up":

```
delta > 0   ▲ +N points     --amber
delta < 0   ▼ −N points     --green
delta === 0   —  flat       --muted     ← new; shape, word, and hue all neutral
```

`--muted` is 7.00:1 and `flat` is on the Constitution's §3 verb ladder (*was flat*), so the neutral state
is reachable by the engine that owns it. Three lines of JS; removes a false claim about the majority of
the jar.

---

## 4. The empty state

### 4.1 The problem, stated precisely

Most months nothing contradicts the reading. If the module only speaks when something fires, then in the
common case the page shows either a blank, a shrug, or — worse — a green tick that quietly asserts
something the facility did not measure.

The brief's seed copy is *"Nothing contradicts this week. The signals agree."* Two things to fix before
anything else: **it is a negation** (a blank space with a sentence in front of it), and **it says
week** — the jar seals monthly (`notes.html:39`, and the specimen line four inches above it). Ship
`this week` and the page has two surfaces disagreeing about the instrument's own cadence, which §5
forbids.

Three moves turn an absence into a finding:

1. **Name the count and the roster.** A number of things that *happened* is an event, not a void. And
   name that they are the same checks every month — §5: *"Repetition is mandatory for a promise…
   their sameness is the product."*
2. **Show the work, not the conclusion.** An empty result only informs a reader who can see where you
   looked. Seven rows reading *agrees* is the finding rendered; one sentence saying *"nothing to report"*
   is the finding hidden.
3. **Give it a run.** §6c — a state unchanged across editions reports the streak as the finding. This is
   the one thing an absence can be: a time series. `agreed for {{cc:streak}} editions running` is a
   sentence about data. *"Nothing to report"* is not.

### 4.2 The copy — the quiet reading

Measured: **81 words · 8 sentences · avg 10.1 · FK grade 3.5 · Fog 6.0 · ~19s silent read at 250 wpm.**
Every figure is a token; no bare score literal; no verb a threshold cannot emit.

*Token forms follow the contract **proposed** in `07-ux.md` §4.4 (`{{x:SERIES:field}}`, `{{line:slug:field}}`)
— that resolver does not exist yet. `resolveClaims()` (`lab.js:235–249`) today handles exactly five forms:
`{{s:}}`, `{{peak:}}`, `{{market:}}`, `{{market-current:}}`, `{{revision-old:}}`. The series IDs are real
and are the audit's §4.2 cross-check roster; `{{cc:ran}}` / `{{cc:streak}}` are new and would need emitting
from the payload.*

```
  WHAT DOESN'T ADD UP?                                    The checks agree
  ──────────────────────────────────────────────────────────────────────────

  The numbers the jar reads and the numbers it doesn't are pointing the
  same way this month.

  {{cc:ran}} cross-checks ran — the same ones every month, one for each line
  the score is built from. Each compares a figure the jar reads against a
  figure the score does not use. None of them disagreed.

    Housing        mortgage rate {{x:MORTGAGE30US:value}}   vs housing starts        agrees
    Credit cards   delinquency {{x:DRCCLACBS:value}}        vs balances and card APR agrees
    Auto loans     delinquency {{line:auto:value}}          vs vehicle sales         agrees
    Gas            pump {{x:GASREGW:value}}                 vs crude oil             agrees
    Employment     unemployment {{x:UNRATE:value}}          vs share of adults working agrees
    Inflation      headline {{x:CPIAUCNS:value}}            vs core prices           agrees
    Financial      conditions {{x:NFCI:value}}              vs the adjusted index    agrees

  Agreement is a reading, not a blank space. These checks have now agreed
  for {{cc:streak}} editions running.

  Cross-check series carry no score weight. This does not change the
  reading of {{s:2026-07}}.

  See what would make each check fire ▸
```

**First-edition variant** (no streak yet — §8: *write every branch to publishable standard*), replacing
the penultimate paragraph:

> *Agreement is a reading, not a blank space. This is the first edition to publish these checks; the run
> starts here.*

**Standing-finding variant** (§6c, three or more consecutive editions):

> *Agreement is a reading, not a blank space. These checks have agreed in every edition since
> {{cc:since}} — the finding this month is the run, not any one check.*

**No-data variant** — `07-ux.md` §4.2 already wrote this correctly and it uses a protected phrase. Use it
verbatim, do not re-draft:

> *"Cross-checks could not run this month — one or more comparison series has not released. A missing
> month stays missing."*

### 4.3 Why the roster, and why it is *bigger* than the loud state

This is the design decision, not a copy decision, and it is the answer to *"designed and dignified rather
than filler."*

> **When something fires, the paragraph is the evidence. When nothing fires, the roster is the evidence.**
> So the quiet state is not a shrunken version of the loud one — it is the fuller one.

A module that visibly shrinks when it has nothing to report teaches the reader within two visits that
quiet means unimportant, and from then on the block is a siren: it is only *read* when it is red. Seven
monospace rows, each naming a real series and a real comparison, are seven checkable facts. That is the
opposite of filler — it is the instrument, printed. It also lands exactly on the inspiration board's
**Instrument Row** direction (*"monospace rows, one gutter glyph, no chart… makes 'these instruments
disagree' a permanent published state rather than a paragraph"*) and it is the state that direction was
actually designed for.

**No green tick. This is the ruling I would defend hardest in this section.**

A `✅` on this block is a **lie of scope**. The checks agreed about the *instrument*; a green tick reads
as *everything is fine with the economy*, which is a claim about the world that nobody made and that in
July 2026 would be actively wrong (the labour-force finding in `07-ux.md` §1). It also overloads
`--green`, which on this site already means *relief, stress fell* — using it for *"the checks concur"*
teaches the reader that green means good news, and then the first red month reads as a forecast.

**State marking, therefore:**

| State | Mark | Colour | Label |
|---|---|---|---|
| checks agree | `·` hairline gutter | `--muted` 7.00:1 | `The checks agree` |
| one fires | `▲` gutter on that row only | `--amber` 10.86:1 | `One check disagrees` |
| two+, or employment | `▲` gutter | `--red` 6.02:1 | `Meaningful contradiction detected` |

`--muted`/`--amber`/`--red` are 7.00 / 10.86 / 6.02 against `--bg` — all clear AA, and the gutter glyph
carries the state redundantly, so 1.4.1 holds. Note `--red` at 6.02 is the *dimmest* of the three: the
loudest state is the quietest colour on this canvas. That is the D2 luminance law biting, and it is fine
here **because the label text carries the escalation** — but it means the red state must not rely on the
hue to feel louder. Give it the gutter mark and the label, not a brighter red.

### 4.4 Accessibility of the roster

- **Real semantics.** Seven rows of paired data is what `<table>` exists for. `<caption>`, `scope="col"`
  headers, `agrees` as literal cell text. Not `<div>`s. This is the module most likely to be read aloud
  and the one where "seven of seven agree" must survive linearisation.
- **Type.** Rows at `.75rem` minimum in `--muted`; the `agrees` column never `--dim` (it is a datum, not
  chrome — §3.1 rule).
- **Tracking.** `0` on the sentences, `≤.14em` on the column heads.
- **Non-interactive rows.** ≥32px row height. If a row links to its evidence, ≥44px and it takes the
  `lab.css:43` focus outline.
- **Mobile.** Seven rows × three columns does not fit at 360px. Collapse each check to two lines —
  line name + result on the first, the two compared figures on the second — rather than shrinking the
  type. `.pk-ledger` already does the right thing at `max-width:700px` (`lab.css:266`); follow it.
- **Reduced motion.** No reveal stagger on this block. It is the module a skeptic screenshots.

### 4.5 What the empty state must never say

- ❌ *"No contradictions found."* — a negation, and *found* implies a search whose scope is unstated.
- ❌ *"Everything checks out."* / *"All clear."* — claims about the world. §5, never sensationalise, and
  its inverse: never reassure beyond what was measured.
- ❌ *"The economy is healthy."* — not measured, not measurable here, and a forecast in disguise.
- ❌ Any use of *"Recessions are employment events."* Protected under §7, which requires the employment
  line's **rank and ounces in the same section**. Employment is 2 oz and ranks fifth. Quoting it here
  would be a §7 violation wearing the costume of §7 compliance. Recording the trap because this block
  is exactly where a future generator will reach for it.
- ❌ A shrunken box, a collapsed accordion, or a `display:none`. §4.3.

---

## 5. What I am ruling out

Beyond the workflow's rejected list, and for comprehension reasons specifically:

- **A "reading level" toggle or a simple-English mode.** Two registers is two products and neither gets
  edited. The Constitution's voice already *is* the plain register — §3, *"a sentence a neighbor would
  say out loud… when the neighbor test and the register conflict, the neighbor wins."* The fix is to
  render the plain sentence that already exists, not to author a second one.
- **A tooltip or hover glossary for the lore.** §2.3 and §3.5: hover does not exist on touch. Terms are
  glossed inline by their appositive or they are removed from the definitional position. There is no
  third option.
- **An onboarding overlay / first-visit tour.** It would sit exactly where the boot sequence already
  sits, spending the same 30-second budget, and a page that needs a tour has not been fixed.
- **Renaming the lore.** *The jar*, *ooze*, *specimen*, *ward* all earn their place (§2.3). Only
  *containment-as-a-unit-label*, *Intake Canisters-as-a-heading*, and *Level:-on-a-card* are being
  charged, and all three are strings, not concepts.

---

## 6. The list, in build order

Each item is scoped to what this document establishes; the `07-ux.md` cross-reference is given where the
finding is theirs and I am only adding the comprehension or accessibility argument.

**Fixes that are live falsehoods — these are not design work**

1. `delta === 0` renders `▲0` in `--amber` in the Ledger, the canisters, and the hero delta. Add the
   neutral third state (§3.6). *New in this document. 18 of 26 ounces currently mis-stated.*
2. `startCountUp()` ignores `prefers-reduced-motion` — the headline number is wrong for 1600ms for a
   reader who asked for no motion (§3.4). *Corrects `07-ux.md` §5.15.*
3. `▼3` ships with no unit beside `$4.01` — §3 four-units violation, 7× per render (§3.6).

**The 30-second test — clause D and A**

4. Re-sort the featured block to heaviest-by-ounces, print **ounces against the printed whole**, and put
   the observed value on every card face. The comparator already exists at `index.html:310`
   (§1.4). *`07-ux.md` §5.2; my addition is the existing-comparator finding and the §4 card-level breach.*
5. Render `EDITORIAL.story` beneath it. *`07-ux.md` §5.1. A `div` and one line of JS.*
6. Kicker: `Containment Level` → the subject, in a neighbour's words (§2.3). One string.
7. Gloss the band on first use, as the Constitution already specifies verbatim: *"That is Sticky
   territory — the band where normal economies live."* (§2.3, §3 of the Constitution).

**Accessibility floor**

8. `.status-chip` `padding:7px 16px` → `12px 16px` (35.8 → 45.8px). One number, and it is the
   first-timer's primary explanatory affordance (§3.3).
9. `.pk-more` → `display:inline-block; padding:12px 0`. Currently 17.4px; fails WCAG 2.5.8 outright.
   Three instances on the homepage (§3.3).
10. `.pk-lrow` `padding:11px 0` → `13px 0` (41.5 → 45.5px) (§3.3).
11. Promote the AUX `title` attribute to visible text: `AUX · no score weight` in `--muted` (§3.5).
12. Adopt the phase-2 type/colour floor: ≥.75rem, `--muted` minimum, ≤.14em tracking, `--dim` on `--bg`
    only (§3.1).

**The module**

13. Build the empty state *first*, not last (§4). It is the state most months are in, it is the one the
    brief says is judged as hard as the loud one, and building it first prevents the module from being
    designed as a siren with a fallback.
14. `--ward` may never solely carry the zero-weight firewall; the §11 firewall sentence is currently
    absent from `index.html` entirely (§2.3, §3.5).

---

## 7. Method notes — reproducing every number in this document

```bash
# featured-canister sort, executed against the live payload  (§1.4)
node -e "const d=require('./data/latest.json');
  const W=Object.entries(d.lines).filter(([,l])=>l.contributesToOoze!==false);
  console.log([...W].sort((a,b)=>(Math.abs(b[1].delta)-Math.abs(a[1].delta))||(b[1].stress-a[1].stress))
    .slice(0,4).map(([k,l])=>k+' '+l.contrib+'oz').join(' | '))"
# → gas 4oz | inflation 2oz | jobs 2oz | financial 0oz

# constitutional deliverables absent from the homepage  (§1.1, §2.3)
grep -c 'household' index.html            # → 0
grep -c 'ounce' index.html                # → 0
grep -c 'Sticky territory' index.html     # → 0
grep -in 'zero.weight\|no score weight' index.html   # → no hits

# type-size census  (§3.1)
grep -o 'font-size:\.[0-9]*rem' lab.css | sort | uniq -c | sort -rn
```

Contrast ratios: WCAG 2.x relative luminance
(`L = .2126R + .7152G + .0722B` on linearised sRGB), `(L₁+.05)/(L₂+.05)`, run against the literal hex
values at `lab.css:2–23`.

Readability: Flesch-Kincaid `.39·ASL + 11.8·ASW − 15.59`, Gunning Fog `.4·(ASL + 100·poly/W)`, tokens
resolved before measurement. Syllable counting is heuristic and errs on irregular words; the scores are
reported to one decimal but should be read to the nearest half-grade.

Touch targets: computed from the shipped rule's padding plus `font-size × line-height 1.6` (`body`,
`lab.css:32`), no rendered measurement.

---

*Phase 2 · Comprehension & Accessibility. Read-only — no production file was modified. Every internal
figure is reproducible from §7; no external source was fetched, and the July labour-force figures are
attributed to `research/forensic/07-ux.md` §1 rather than re-verified here.*
