# OOZEMETER REVIEW BOARD — CONSOLIDATED FINDINGS
## Edition of 2026-08-03 (first weekly produced by the publication pipeline)
### Board Chair's report. Four officer reviews, adversarially challenged; every number below re-verified against the payloads by the Chair.

---

## PART 1 — PROS
*Ranked by how much they matter to the publication's future. "Protect" = what must survive the pipeline changing.*

---

**P1. The score reproduces. A stranger with a spreadsheet can audit the second half of the chain end to end.**

Evidence (Chair-verified, independently of Burry): weights `{jobs 24.25, housing 19.40, credit 19.40, auto 14.55, gas 9.70, inflation 9.70, financial 3.00}` against published stresses `{14, 44, 38, 44, 61, 33, 12}` → composite **35.183** → calibration `a=1.418684348943213, b=-23.96514845099034` → **25.948 → 26**. Floor-plus-largest-remainder over the seven exact shares gives jobs 3 / housing 6 / credit 6 / auto 5 / gas 4 / inflation 2 / financial 0 = **exactly 26**. The edition's claim *"Housing and credit each supplied six of the score's 26 contribution points, with auto pressure close behind at five"* (line 13) is arithmetically clean and the parts sum to the whole.

Ward M reproduces too: `(27+24+10+49+27+50)/6 = 31.1667` = published raw 31.17; `1.4025 × 31.17 − 7.0116 = 36.70 → 37`.

**Protect:** the property that published stresses → score → integer contributions is reconstructible with nothing but a calculator. Nothing in any refactor may break it.
**Correction the board adopts (from challenge, verified):** "reproduces from published data alone" is **false as stated**. `data/latest.json` ships no `weights` and no `anchors` — I grepped the keys. They exist only in `data/vintages/e3c85422….json`, which nothing reader-facing links. Claim the pro at its true scope, and fix the scope (see C14).

---

**P2. The calibration freeze is real in code, not rhetoric — and the board has located the *actual* proof, which no officer cited correctly.**

`research/market-backtest.json` publishes `applied: false` next to a better-fitting line. Burry cited the implied-vs-applied slope gap, which the challenge correctly demolished: `1.402462618842267` vs `impliedA 1.4024216429270573` is 4.1e-5 — 0.0013 score points. Declining that proves nothing.

The real evidence is one field over and the board adopts the challenger's version: `calibration.rawGfc = 69.17229064285482` while `calibrationDiagnostic.observedRawGfc = 69.1739573095215`. The frozen block is carrying the **original 2008-11 anchor raw across upstream data revisions** instead of recomputing it. That is what a freeze looks like.

**Protect:** `rawCalm` / `rawGfc` as stored historical constants, `applied:false`, and the diagnostic published anyway. The day those two fields start tracking their `observed*` twins, the product is over regardless of what the note says.

---

**P3. The unit firewall sentence. All four officers named it independently — the strongest cross-mandate agreement in the packet.**

> *"Those are changes inside the component readings, not points subtracted directly from the headline score."* (line 13)

Chair-verified as load-bearing, not decorative: gas has the **highest** line stress on the household panel (61) and the **largest** move (−11), yet supplies only **4** of 26 contribution points — fourth, behind housing 6, credit 6, auto 5. Credit's line-stress delta is exactly 0 and it contributes 6. Without this sentence a reader reconstructs "gas fell 11, so 26 should be 15" and is wrong by nearly a factor of three.

**Protect:** the sentence **and its position** — one line after the hazard, not in METHODOLOGY. If a compression pass ever has to choose between this sentence and any other in the edition, it keeps this one.
**Protect also (board addition):** the footer twin at line 51 is **not** a redundant echo, and Ive's instruction to cut it is overruled. §5 is explicit — *"the zero-weight firewall, the standing declaration, the provenance line and the sign-off run in every edition unconditionally, and their sameness is the product."* The in-body sentence is situational rescue; the footer is the constant. Keep both. **And write the second one:** Ward M runs the identical trap (*"Energy stress fell seven line-stress points"* next to *"Ward M registered 37"*) with a **different** conversion — one gauge point is 0.234 score points — and no firewall sentence at all.

---

**P4. Date discipline: the edition refuses to subtract 26 from 37, and forces the reader to an exact shared month.**

> *"the two headline scores should not be compared without checking their dates"* (line 6, inside the brief, not a footer)
> *"Latest exact shared month: June, with Ward M four points above Household OOZE."* (line 32)

Chair-verified: `data/market-history.json` final row is `{"month":"2026-06","market":30,"household":26,"divergence":4}`; 233 observations 2007-01 → 2026-06 with exactly one gap (2025-10) **left as a gap, no interpolation**. Refusing a bigger available number is the hardest discipline to hold and this pipeline held it.

**Protect:** the `exact-shared-month` basis, the un-interpolated gap, and the placement of the caveat at the point of misreading. Three officers converged here.

---

**P5. Content addressing is real. I recomputed both digests.**

`shasum -a 256` returns `8d97df62…aef` for `evidence.json` and `cee79aa2…173` for `edition.txt` — exactly what `validation.json` claims.

**Protect:** the mechanism, and the discipline of hashing the bytes actually shipped.
**Board adopts the challenge's correction:** stop selling this as tamper evidence. `validation.json` holds the digests, sits in the same directory, is itself unhashed (`8df2a860…`), and is written by the same hand that would do the editing. `edition.json` is not hashed at all (`fa36282c…`). What this buys today is **drift detection between artifacts in one build**. Make it tamper evidence by anchoring the digest in the git tag message, and hash `edition.json` too.

---

**P6. Register discipline. 514 words, zero exclamation points, zero intensifiers, zero doom.**

Chair-verified by direct scan: `!` × 0; no hits on sharply/surged/plunged/spiked/soared/dramatic/massive/alarming. The verbs are eased/fell/rose/unchanged throughout.

**Protect:** the flat register, and the word budget as a **ceiling paid for by cutting**, not a target. One amendment the board adopts from challenge: budget **unique** content words. Roughly 150 of the 514 are echo, so this is ~360 words of content padded to 514, and a total-word ceiling rewards padding.

---

**P7. The revision was logged before it shipped, and the publishable sentence already exists.**

`data/revisions.json[1]`: `detected 2026-08-01T15:24:45.288Z`, `type: "methodology-recalibration"`, `from 2.0.0 → to 3.0.0`, `summary: {monthsCompared: 281, monthsMovedAtLeastOne: 180, shareMovedPercent: 64.1, maxAbsoluteMove: 2, bandLabelFlips: 9}`, plus both calibration pairs.

That is §5 compliance at the data layer, and it is genuinely good engineering: the correction was quantified, structured and stored *first*. No officer found this.

**Protect:** the log-before-publish order and the quantified summary schema. Then render it (C1) — the reason C1 is blocking rather than fatal is precisely that the honest sentence is already computed and sitting in the repo.

---

**P8. Ties are reported as ties, and the schema is structurally incapable of ranking them.**

`evidence.json` ships `hh.topContribution: {"value": 6, "names": ["Housing", "Credit"]}` — a multi-slot array, not a single winner field. §10 mandates exactly this.

**Protect:** the array. Never let a single-slot `topContribution` enter the edition schema.
**But see C12** — the *policy* is a pro; *this instance* is a con, because the equality is manufactured by rounding. The board separates them deliberately.

---

**P9. Every prose unit in `edition.json` is bound to keyed claim IDs.**

Verified: every paragraph, bullet, chart node and watch item carries `claimIds`. This is the substrate for per-claim permalinks and a "cite this number" affordance.

**Protect:** never let a renderer emit prose that is not claim-bound.
**Board adopts the challenge's limit:** claim-binding proves the provenance of a **value**, not the truth of a **claim**. The market paragraph containing *"breadth was unchanged"* is fully bound to `market.breadth.delta = 0` and validation passed it. Missing fields: per-claim `basis`/`window` and a measured-vs-defaulted flag.

---

**P10. The CAPS-label-plus-plain-dek unit, where the dek is a falsifiable direction claim.**

> `HOUSEHOLD OOZE` / *"The jar got lighter. The long-term bills stayed heavy."*
> `MARKET OOZE` / *"Several market-stress lines eased. The dollar pushed the other way."*

**Protect the rule, not the typography:** the dek states a direction the block's own figures confirm or refute (26 from 29; energy −7, volatility −3, credit −2). That rule survives a template rewrite; "use caps then a dek" is a no-op — there are exactly two wings and both already have it.
**Killed in challenge, not resurrected:** the deck is nine words not ten, it is not the only line with craft (the market deck is the identical form), and "no adjectives doing the work" is inverted — *lighter* and *heavy* are the only work in a line with no number in it, which is the one line that least satisfies "numbers carry the drama."

---

## PART 2 — CONS
*Ranked by severity. Owner in brackets. **BLOCKING** = do not publish until fixed.*

---

### **C1 — BLOCKING. The edition publishes restated numbers as news and never says they were restated. [Claude/editorial + Hermes/renderer]**

This is the board's lead finding and it displaces every officer's stated blocker.

Chair-verified against `data/vintages/`. Four vintages generated 2026-07-26, 07-28, 07-30 and 2026-08-01T14:46:40Z all read `{month: "2026-06", ooze: 27, prevOoze: 30}` under `methodology 2.0.0`. The vintage generated 2026-08-01T15:24:45Z — **38 minutes later, with identical gas and housing inputs** — reads `{ooze: 26, prevOoze: 29}` under `methodology 3.0.0`. Between them: a seventh weighted component appears (`financial`, weight 3), every other weight is rescaled (jobs 25→24.25, housing 20→19.4, credit 20→19.4, auto 15→14.55, gas 10→9.7, inflation 10→9.7), and the calibration moves `a 1.4209110232 → 1.4186843489`, `b −24.62145011 → −23.96514845`.

`revisions.json` quantifies the blast radius: **180 of 281 months moved, 64.1% of the published archive, max move 2 points, 9 band-label flips.**

The edition contains the string "3.0.0" zero times and "revision" zero times. Line 11 — *"The June OOZE Score fell to 26 from 29 in May, a three-point decline"* — presents a restated pair as an observation. Line 51's METHODOLOGY paragraph mentions no version.

The pipeline's own gate said so and was overruled: `methodology v3 publication` is `ok:false` with 19 failures including **"archive must identify methodology v3 before publication"** and five `policies revision summary missing` items covering exactly the prior/new slope, prior/new intercept and maximum move that `revisions.json` already computes. Marked `blocking:false`.

§5 names this scenario and even names the incident: *"Where a genuine data revision moves a figure, both surfaces name the revision and quantify it… (The June 27-vs-26 incident is the cautionary tale)"*. A product whose differentiators are frozen calibration and public corrections unfroze its calibration, restated two-thirds of its history, flipped nine band labels, and published the output as this week's news.

**Fix (all of it exists as data):** the seal carries the version and the restatement; one sentence quantifies it from `revisions.json` — *"June was restated from 27 to 26 on 1 August under methodology 3.0.0; 180 of 281 archived months moved by at most two points and nine changed band label."*; METHODOLOGY names `3.0.0` and links the revision log; the archive identifies v3; and the five `policies revision summary` fields ship.

---

### **C2 — BLOCKING. "Breadth was unchanged" is false under every available baseline, and breadth is the entire reason Ward M is 37. [Codex/data owns the delta; Claude/editorial owns the retraction]**

> *"Dollar stress rose three, while breadth was unchanged."* (line 25)
> *"That mix shows easing in several sensors, not a verdict on the whole market."* (line 27)

Chair-verified three ways:

- **Month over month** — the basis of the other five deltas in that same sentence — `gaugeHistory.breadth` runs June `4.545455` → July `27.272727`, i.e. stress **13 → 50**. The five FRED gauges fell 10 in aggregate (June 147 → July 137). Hold breadth at 13: raw = 150/6 = 25.0, score = `1.4025×25 − 7.0116` = **28**. Ward M is 37 because of breadth and nothing else.
- **Against the prior published cycle** — breadth went **56 → 50**, and the operator's own commit title `9b7af31` says so in a public repo: *"Ward M refresh 2026-08-01: full-July means, ward 37 (breadth eases 56→50)"*.
- **Zero is not one of the answers.**

The mechanism is confirmed at `scripts/collect-market.js:115-118`: `const priorPath = path.join(dataRoot,'market.json')` … while **line 136 writes that same file**. A re-run diffs the file against the copy it is about to overwrite. Published breadth delta is `0` in **every** version that has a breadth field — across stress values 37 (`eb767ae`), 56 (`1966e46`), 50 (`9b7af31`), 50 (working tree). The board rules **for Burry and against the prior compliance review**: the code comment says an unmeasured value is published as unmeasured, and the null path is real, but here the collector computed a *finite, self-referential zero*. Rendering null as "not measured" does not touch this bug.

**Fix:** (a) retract and re-issue the MARKET OOZE paragraph, stating the driver — breadth 13 → 50, the whole move; (b) source the delta from a prior-cycle snapshot the collector cannot overwrite; (c) CI asserts breadth delta is non-zero whenever the sector panel counts change; (d) **the same defect sits eight lines earlier** at `collect-market.js:91` — `const prevStress = prevVal==null ? stress : …` manufactures delta 0 for all five FRED gauges whenever the prior month is absent. Fix breadth only and you leave "unmeasured rendered as unchanged" in five of six sensors.
**Rejected:** Zuckerberg's fix ("state +7 on its own backtest basis and lead with it") would attach a stated rise to a false attribution and harden a figure whose freshness gate is `ok:false`.

---

### **C3 — BLOCKING. The validation record is structurally incapable of reporting the failures the evidence record contains. [Codex/data]**

Two hashed artifacts in one directory contradict each other:

- `evidence.json` — `divergence-history freshness: ok:false` and `methodology v3 publication: ok:false` (19 failures).
- `validation.json` — `{"status":"pass","failures":[]}`.

Mechanism verified: `scripts/lib/weekly-brief.js:226` filters `gates.filter(gate => gate.blocking && !gate.ok)`, so `failures[]` can never contain a non-blocking failure; `scripts/weekly-package.js:36` hardcodes both gates `blocking:false` permanently, so a gate whose own failure string reads *"before publication"* can never stop a publication.

A publication selling verifiable honesty shipped a clean bill of health over two recorded failures, in its first real edition. That is not a triage problem, it is a reporting-integrity problem, and it must be fixed **before** the 19 items.

**Fix:** `validation.json` reports all failed gates with their blocking classification; `status` becomes `pass` / `pass-with-disclosed-failures` / `fail`. Gate classification moves out of a hardcoded literal and into a dated, reviewable register with an expiry.

---

### **C4 — BLOCKING (cheap). "Household inputs current" is printed on the reader's page over two January-dated observations supplying 11 of 26 points. [Hermes/renderer + Codex/data]**

> *"Evidence status: Household inputs current; Ward M anchors provisional"* (line 48)
> *"Housing and credit remained tied as the largest **current** contributions at six points each."* (line 20; also lines 6 and 15)

Verified: `credit` value 2.9%, `asOf 2026-01-01`, cadence quarterly, delta 0, contrib **6**; `auto` 7.7%, `asOf 2026-01-01`, quarterly, delta 0, contrib **5**. Eleven of 26 points are 214 days old on a page whose governing idea is *"check the dates."*

The word is not the writer's invention: `evidence.json` sets `householdFreshness: "current"`, `householdStaleLines: []`, and `latest.json` marks credit `stale:false`. The bug is a conflation — `collect.js` computes `freshnessStatus` as `staleLines.length ? 'degraded' : 'current'` against `STALE_DAYS.quarterly = 250`. "No release was missed" and "recently observed" are different predicates sharing one field.

The board partly sides with Burry's challenger: "current" is a defensible term of art, since those January prints *are* the latest existing releases for DRCCLACBS and the NY Fed workbook. It is blocking anyway, because the edition prints the term unglossed on the one surface that renders without the body. This is a ten-minute renderer fix, not a rebuild.

**Fix:** no line appears in prose without its `asOf`. Split `freshnessStatus` into `releasesCurrent` and `observationAge`. Print *"Credit-card delinquency, still 2.9% as of the January quarter."* And kill the follow-on promise the edition cannot keep: line 39's *"when the observation month advances"* cannot resolve a quarterly series — credit's next observation is Q2, and no advancing month delivers it.

---

### **C5 — SERIOUS (top). The edition has no verdict line. It is not staged, and the archive already emits one. [Hermes/renderer + Claude/editorial]**

§6.2 mandates the verdict line — historical placement against the full record — and §10 specifies its form: *"percentile-against-full-history, never a superlative."* The Constitution's own Appendix records the archive corpus achieving it **23/23**. The weekly engine dropping it is a **regression, not a deferral**.

The board draws a distinction all four officers blurred: §16 stages the **placement line** (§11 — streaks, trailing extremes, band crossings), blocker *"no engine reads a second row of its own history at render time,"* interim behaviour *"Editions carry the verdict line only."* The edition carries neither. It ships the interim behaviour of a staged rule while omitting the unstaged rule that interim behaviour was defined around.

The fact is computed and stable: `data/history.json` holds 281 monthly points from 2003; **178 of 281 = 63.3%** read above 26. Chair-verified against §10's stability clause: >25 = 65.5%, >26 = 63.3%, >27 = 61.9% — all "six of every ten." It survives a one-point move.

**Fix:** one mandatory verdict line under the seal. *"June's 26 is calmer than roughly six of every ten months since 2003."* It must carry its methodology version (C1), because that history has been restated twice in nine days.
**Adjudication on the run:** the five-month run (Jan 19 → 20 → 24 → 27 → 29 → June 26, i.e. **seven points above where the year started**) is the §11 placement line, and §16 stages it with a named blocker. The board does **not** order it shipped this week — but §16 also says a staged rule prints its interim behaviour, so the edition may not imply a trend it hasn't computed. *"The direction improved"* (line 11) is the edition's only trend claim and it points the opposite way from the run. Delete it or qualify it to one month.

---

### **C6 — SERIOUS. Zero observed values. 0 `$`, 0 `%`, 0 `/100` in 514 words about household economic pressure. [Claude/editorial + Hermes/renderer]**

Chair-verified by character scan. §4's first bullet: *"No line is named in prose without the observed value that produced its score, in the same sentence."* §16 stages this **for the archive only**, blocker = `backtest-results.json` discards raw observables. `data/latest.json` does not: it ships `$4.10` (7/27), `6.66%` (7/30), `2.9%` (Q1), `7.7%` (Q1), `4.2%` (6/01), `3.5%` (6/01), `−0.54` (7/24). §4 is **not staged for the live weekly**, and the edition ships bare.

Gas is named three times; the pump price appears zero times.

**Board adjudication of the officers' direct conflict (see Part 3):** add the observed value with its own `asOf`; do **not** delete the line-stress unit.

---

### **C7 — SERIOUS. The market section prints deltas and never levels, omits one of six sensors, and buries the hottest reading on the panel. [Claude/editorial]**

> *"Energy stress fell seven line-stress points, volatility fell three, and credit and funding fell two. Dollar stress rose three, while breadth was unchanged."* (line 25)

Levels: breadth **50**, energy **49**, dollar 27, rates 27, volatility 24, credit 10. Sum 187; 187/6 = 31.1667 = the published raw — **Ward M is a flat unweighted mean of six equal sensors**, so a reader who is given five of six cannot reconstruct 37 *in principle*. Rates (−1, 0.73pp) is silently absent from a sentence that reads complete. Breadth — 50, the top of the panel, sitting at the midpoint of the scale, the single largest input at 27% of raw — is disposed of in three words and paired with the display string *"6/11 steady,"* which reads benign.

**Fix:** level first, delta second, all six or a stated five. *"Energy 49, down seven. Breadth 50 — the hottest sensor on the panel."*
**Also:** §4 — *"The subject of a movement sentence is pressure from X, never X… on the Ward M side the subject is gauge heat."* The edition writes *"volatility fell three"* and *"credit and funding fell two"* — bare claims about volatility and credit, not about gauges. "Gauge heat" appears nowhere.

---

### **C8 — SERIOUS. One sentence, six deltas, two different comparison windows, presented identically. [Codex/data + Hermes/renderer]**

Verified in `scripts/collect-market.js`: the five FRED sensors compute `delta = stress − prevStress` against `prevKey(k)`, the previous **month** of the series. Breadth computes its delta against the **previously published `data/market.json`** — an interval of whatever elapsed between collector runs. Line 25 lists all six as one series of moves, in an edition whose centrepiece essay is *"OOZEMeter has two clocks."*

This survives the C2 fix. Even with a correct breadth delta, mixed windows in one list is a false equivalence.

**Fix:** every delta prints the window it was measured over. Add `basis` and `window` to each fact in `evidence.json`, and make the renderer structurally unable to emit a delta without one.

---

### **C9 — SERIOUS. The household model and Ward M share an input, the edition never says so, and the public page still calls that input unweighted. [Codex/data + Claude/editorial]**

`data/latest.json` `lines.financial`: seriesId **NFCI**, value **−0.54**, stress **12**, `contributesToOoze: true`. `data/market.json` `sensors.credit`: seriesId **NFCI**, value **−0.54**, stress **10**. Same series, same displayed number, two live payloads, **two different stresses**, no explanation anywhere on the site.

The edition prints one of them as market evidence (*"credit and funding fell two"*, line 25) and closes with *"Ward M summarizes market and financial-system stress and does not affect the household score"* (line 51). The firewall claim survives on weights — `financial.contrib = 0`, exact share 0.266 — but nothing in 514 words tells the reader the two instruments share a series, and the zero is a rounding outcome this month, not a structural guarantee.

Meanwhile the release gate flags three times that the **public** Ward NFCI page *"still says the line is unweighted"* while `contributesToOoze: true`. §6b is explicit: *"Where a household line and a ward gauge draw on the same upstream series, the report names the shared shock and reports amplitude — never calm."*

**Fix:** ship the three NFCI page corrections; reconcile or explain the 12-vs-10 stress; and the firewall sentence names the shared series in the same paragraph.

---

### **C10 — SERIOUS (structural). The single gauge carrying Ward M's entire move is the only unauditable input in the publication. [Codex/data — and it is a strategy question, not a bug]**

`data/sectors.json` disclaims itself in its own note, verbatim: *"Manual report of derived ETF price-return states. This 11-ticker proxy panel is not direct economic activity or independent sector breadth. No price history is published, but quote rights remain unresolved."* Cadence: *"manual; weekly schedule proposed but disabled pending quote-rights clearance."* Its `source.url` in the collector is `market.html` — the site pointing at itself. `rightsStatus: "unresolved; scheduled publishing disabled pending licensed or explicitly permitted quote source."`

At 1/6 of raw × slope 1.4025, a 37-gauge-point breadth swing is **8.65 Ward M points** on an instrument whose published range runs roughly 10 to 90. One hand-entered panel with no published history and unresolved quote rights can move the market instrument nine points a month, unilaterally, and no reader can check it.

Every honesty mechanism this project has built — SHA-256 digests, input fingerprints, vintage manifests, frozen calibration, FRED series IDs with live URLs — blankets the five gauges no reasonable person would doubt, and covers the load-bearing one not at all. Fixing C2 closes the falsehood and leaves this exposure entirely intact.

**Fix:** breadth carries a permanent standing disclosure in every edition naming it manual, unlicensed and history-less; publish the panel counts as a dated series so the delta is checkable; and either resolve quote rights or cap breadth's weight below the point where one unauditable input can dominate the composite.

---

### **C11 — SERIOUS. The edition replaced the canonical anatomy with nine invented blocks, and shipped no close, no byline, no sources, no links. [Claude/editorial + Hermes/renderer]**

§6 names seven sections and states *"These seven names are the publication's furniture and are used verbatim by every engine… Adding, renaming, or reordering a section is an amendment to this section."* **Zero of the seven appear in this edition.** Missing: The seal, The verdict line, The placement line, What's still pressing, **What a household would notice** (mandatory in §4 *and* §6.6), The close. In their place: One-Minute Brief, WHAT CHANGED, Chart of the Week, Something We Found Interesting, What We're Watching, This Edition At A Glance. No amendment exists.

Consequences the reader feels: no §7 sign-off (*"The jar updates itself; you just check it."* — a protected phrase, already written, simply absent); no OOZEBOT byline (§4: *"the last line of every generated report"*); no confidence statement (§10: *"methodology version, stale count, revision count… on every generated report without exception"* — which is also the natural home for C1); **no sources paragraph** (§10: *"the close names the sources, and the sources are named in the prose above it"*); and `grep http` returns nothing — an economic score published citing zero sources, with nowhere for a reader to go. The unpublished July draft at `reports/drafts/2026-07/edition.txt` closed with a full provenance paragraph, the confidence statement and the byline. The published edition dropped all three.

**Fix:** restore the seven names and the close. Three links minimum (the jar, Ward M, methodology/archive). Emit byline, confidence statement and provenance from the shared furniture module. If the operator wants the nine-block shape, that is a §14 amendment, filed and dated — not a silent substitution.

---

### **C12 — SERIOUS. The housing/credit "tie" is a largest-remainder artifact, and the edition builds five statements and a watch item on it. [Codex/data + Claude/editorial]**

Chair-computed exact shares before integer allocation: **housing 6.308, credit 5.448** — a 0.86-point, ~16% relative gap. Floors give housing 6, credit 5, summing to 23; the largest-remainder pass distributes three points to auto (.731), jobs (.509) and **credit (.448)**. Credit reaches 6 only on the third remainder. Housing carries about 16% more of the jar than credit does.

The claim appears on lines 6, 13, 20, 39 and 47 — brief, body, WHAT CHANGED bullet, watch item, and dashboard. §10's stability clause condemns it: *"Any sentence written to be repeated out of context must be stable against a one-point move in the underlying number."* A single stress point in either line breaks it.

**Board adjudication (the officers split — see Part 3):** the *policy* of reporting equals as equal is correct and constitutional and is protected at **P8**. Burry's *"manufactured by Math.floor"* overreaches — largest-remainder is disclosed, deterministic, and the integers are the published unit. What survives at full strength is the word **"remained."** `data/history.json` is 281 `[year, score]` pairs and nothing else; **no per-line contribution history is published anywhere**, so no reader can check whether they were tied in May. An unverifiable word in the one claim the edition repeats five times and promotes to a watch item is the defect.

**Fix:** publish contribution history, or stop using "remained." Add a materiality rule: no "tied" language when the pre-rounding gap exceeds a published threshold. Cut the repetitions from five to one.

---

### **C13 — SERIOUS. "Chart of the Week" cannot emit a chart, and it suppresses the one fact that would make its own thesis worth reading. [Hermes/renderer]**

Verified in `edition.json`: the `chart` node contains `heading`, `text` and `claimIds` and **no `series` field, no axis, no data**. The schema is incapable of keeping the heading's promise. §9 — *"Every chart answers one question and is captioned with it… Axes never imply data we do not have."*

Three constructions typeset scores as calendar dates — *"May 29 → June 26"*, *"June 30 → current reading 37"* — nineteen lines after the masthead trained the reader that `Month Number` is this publication's date format (*"August 3, 2026"*, line 2).

And the block shows 2 of 233 available shared months while suppressing the single most interesting fact in the repo for the two-clocks thesis: **March 2026, Ward M 53 against households 24, divergence +29, compressing to +5 in April** — a 24-point collapse in one month, verified in `market-history.json`.

**Fix:** ship a monospace table from data already in the repo (Feb–Jun: household 20/24/27/29/26, Ward M 27/53/32/30/30, gap +7/+29/+5/+1/+4, axis labelled /100), or rename the block to what it contains. Label the reconstruction: the June 30 comes from `research/market-backtest.json`, whose own note says the two breadth transforms are **not identical** — and §7 already supplies the protected sentence for this exact case, *"This is a reconstruction, labeled as one."*

**Also fix the framing.** *"Something We Found Interesting"* nominates +4 as the finding. Chair-verified: median divergence across 233 shared months is **−3**, the range is −60 to +58, and 88 rows sit at +4 or wider — so +4 is the **62nd percentile**, mildly market-leaning. (Jobs' *"dead median"* is wrong and is not resurrected.) Either give +4 its historical placement in the same sentence, or lead with the March→April collapse, which is a real, checkable, non-forecasting observation.

---

### **C14 — SERIOUS. The reproducibility chain is broken at the observation end, and the vintage manifest mislabels its own inputs. [Codex/data]**

`data/latest.json` ships no `weights` and no `anchors`; they live only in an unlinked vintage file. Worse, three of seven scored lines do not reproduce from the displayed value even with the anchors — and the mismatch set is perfectly predicted by the date mismatch: **gas** ($4.10, 7/27) → 62.5 vs published 61; **housing** (6.66%, 7/30) → 45.75 vs published 44; **financial** (−0.54, 7/24) → 10.33 vs published 12. The four whose display date falls inside the scored month reproduce exactly. The cause is at `scripts/collect.js:113` vs :140/:160 — the scoring input is the **June monthly mean, CPI-deflated**; the attached display value is the **latest weekly nominal**.

And `data/vintages/e3c85422….json` — the artifact whose entire purpose is reproducibility — records `inputs.gas: {"value":"$4.10","asOf":"2026-07-27"}` as the input to a **June** score. It is not the input.

**Fix:** publish `weights` and `anchors` in `latest.json`; split `scoringObservation` and `displayObservation` into separate labelled fields on every line; correct the vintage manifest to record the scoring input.

---

### **C15 — SERIOUS. Selection happens upstream of editorial judgement and nobody is watching it. [Codex/data]**

`latest.json` carries nine lines. `evidence.json` carries seven. **`foreclosures` (1.9%, delta +2) and `manufacturing` (1.1% YoY, delta +3)** never reach the evidence packet — both `contributesToOoze: false`, and both moving *up*. An edition that leads with *"The pattern is narrow rather than broad"* (line 15) had two of the lines moving the wrong way filtered out before a human saw them. §4 is explicit that non-scoring inputs carry their label **in the same sentence as their number**, *"verbatim and identically each time. Never a footnote, never once per report."*

That is where a house style becomes a house bias, and it is invisible to anyone reviewing only `edition.txt`.

**Fix:** the evidence packet carries every line in the payload, with `contributesToOoze` on each. Non-scoring lines get their label and their number.

---

### **C16 — MINOR. ~150 of 514 words are echo; three blocks add zero new facts. [Claude/editorial]**

Verified: housing-and-credit-tied-at-six on lines 6, 13, 20 and 47; divergence +4 on lines 32, 35 and 46; score/band/−3 on lines 6, 11 and 43-44. WHAT CHANGED restates lines 13 and 20 near-verbatim.

The board **upgrades this from minor to enabling**: every remedy above is funded by the words this frees. But the board **overrules** the specific cut list — METHODOLOGY's firewall (line 51) is not a duplicate of line 27 (a scope claim vs a causal claim), and §5 requires the standing declaration to run unconditionally. Cut WHAT CHANGED's echo, not the disclosures. And per §6c, a top answer unchanged for three editions reports the *streak* as the finding rather than reprinting it as news — which is not computable until contribution history is published (C12).

---

### **C17 — MINOR. Unlabeled hedges and a broken idiom. [Claude/editorial]**

*"mostly July evidence"* (lines 6, 31): all six sensors carry July dates — five `2026-07`, breadth `2026-07-31` — and `evidence.json` contains no coverage fact backing "mostly." An unlabeled estimate of coverage in a publication that bans unlabeled estimates, hedging **downward** from a fully-July panel. Replace with the fact: five July monthly means plus one 22-session window ending 31 July; the dollar gauge is year-over-year.

*"That date label does more work than it looks."* (line 35) — a broken comparative ellipsis, in the slot built for the most-quoted line. §4's last bullet is literally *"Read it out loud before it ships."*

Naming: five names for two instruments in 514 words — Ward M ×9, Household OOZE ×6, Market OOZE ×1, OOZE Score ×1, OOZEMeter ×1, plus "THE OOZE REPORT". The edition standardised on the name with the **lowest** circulation anywhere else: the site headline reads *"Today's Containment Level"*, the site body uses "Ooze Score" six times, and `data/market.json`'s own shipped note says *"does not affect the Ooze Score."* §5: *"Never let two surfaces disagree about the same fact."* A product's name is a fact. Lock **"the Ooze Score"** and propagate it to the payload note, the card and the methodology block in one change.

---

## PART 3 — WHERE THE BOARD DISAGREED, AND HOW THE CHAIR RULES

**1. Jobs vs. Zuckerberg/Hermes — subtract line-stress, or add observed values?**
Jobs argued to delete line-stress deltas from reader prose entirely and publish observed value plus contribution points, explicitly disagreeing with the prior compliance review. **Ruled against Jobs.** §4 does not offer the choice: *"No line is named in prose without the observed value that produced its score, in the same sentence."* It says add, not swap. And Jobs' own challenge exposed the fatal flaw: his replacement would print `$4.10` (7/27) beside 4 contribution points under a heading reading "The June OOZE Score," pairing a July observation with a June contribution — committing the exact date error his own blocking con indicts. His two cons contradict each other and he did not notice. **Ruling: keep line-stress, keep the firewall sentence, add the observed value, and every printed value carries its own `asOf`.**

**2. Ive vs. the prior compliance review — ratify the nine blocks as an anatomy amendment?**
Ive said "ratify the order, not the accumulation." **Both are overruled.** The order *is* the accumulation, because the names being ordered are themselves the unauthorised part — §6 names seven sections and the edition ships none of them. The prior review at least located the decision correctly as an amendment; Ive's alternative is incoherent. **Ruling: restore the seven canonical names. If the operator wants One-Minute Brief and Chart of the Week, file a §14 amendment and apply it to every engine simultaneously — but the seal, the verdict line, "What a household would notice" and the close come back this week regardless.**

**3. Burry vs. the prior compliance review — is the breadth zero a "hardcoded literal" fixed by rendering null?**
**Ruled for Burry, decisively, on verified code.** The collector emits null only when there is no prior field at all; here it computed a finite, self-referential zero by diffing `market.json` against the copy it was about to overwrite. Rendering null correctly changes nothing. **And the board extends past Burry:** he prescribed `sectors.json` history as the alternative source, but `sectors.json` publishes none and says so; and the identical defect sits at `collect-market.js:91` for all five FRED gauges.

**4. Burry vs. Ive on the `divergence-history freshness` gate.**
Burry rated it minor — the gate fails on a 15-minute acquisition clock while every substantive check (row-for-row history match, fingerprint, anchor validation) passed, so the +4 is sound. Ive rated it a disclosure failure — a caveat attached to a number on the reader's page cannot live only in the operator appendix. **Both are right about different things and the board adopts both:** the +4 stands (I reconciled the June row independently: market 30 from the backtest gauges, household 26, divergence 4). The *disclosure* does not. Line 48 discloses that Ward M's anchors are provisional and says nothing about the freshness failure behind the divergence figure. **Ruling: the number publishes; the gate result publishes with it, or the gate is reclassified in a dated register with a stated reason. The appendix boundary is correct for build noise and wrong for a caveat that attaches to a printed number.**

**5. Zuckerberg vs. Jobs on the tie — safe-to-cite restraint, or manufactured claim?**
Zuckerberg nominated the tie as the pro that makes every other number safe to cite; his challenger killed it as a rounding artifact; Jobs' version of the same pro survived. **Ruling: split them.** The *policy* — a multi-slot `topContribution`, never a single winner field — is a genuine pro and is protected at P8. *This instance* is a con: housing 6.308 vs credit 5.448 is a 16% gap, and the equality exists only because credit caught the third largest remainder. **Zuckerberg's instruction to "protect it forever" is overruled** — he nominated the least stable number in the edition as the guarantor of the rest.

**6. Zuckerberg on "two clocks" as a competitive moat.**
**Killed and stays killed.** A cadence mismatch between a monthly seal and a market-cadence gauge is a defect, not a moat; a competitor with one cadence has no problem to copy; and narrating a defect charmingly every week is how a defect becomes permanent furniture. The four-word form *"OOZEMeter has two clocks"* is good copy and survives at P4 — but the paragraph it sits in must be rebuilt to §6b (levels, then direction and size of change, then what the pair means for a household), and the variant *"Two meters, two clocks"* eleven lines above it must go, because §7 says protected phrasing is used verbatim or not at all.

**7. Zuckerberg on moving the date caveat off the brief's final position for shareability.**
**Overruled.** §4: *"A caveat a reader can scroll past is not a caveat; a caveat that dies in an RSS card is not a caveat either."* The forward unit is precisely the object that gets stripped of everything below it. Terminal position is the position that survives truncation. Fix the grammar in C17; leave the caveat where it is.

**8. Jobs' "one interpretive sentence per section" and "the deck is the only line with craft."**
**Both killed in challenge; not resurrected.** The edition already carries at least six interpretive sentences, so the prescription would be a reduction disguised as an addition; the deck is nine words, its only work is done by adjectives, and the identical form already appears in the market section. Mandating an opposing-clause deck with only two sections manufactures opposition in weeks where the data does not oppose itself.

---

## PART 4 — THE STRATEGIC QUESTION: IS WEEKLY THE RIGHT CADENCE?

**The board's answer: yes — but not for this. Weekly is the right cadence for the *publication* and the wrong cadence for the *household score*, and this edition has the two backwards.**

The Constitution already reached this conclusion and the board is ratifying it rather than inventing it. §16, staged rules register, row three:

> *"§2/§6 — a weekly edition reports week-over-week change. Blocker: `data/latest.json` stores only month-over-month `delta`; no engine retains a prior-week snapshot, **so a weekly cannot say how far a weekly-cadence line moved in seven days**. Owner: Codex. Interim behaviour: **The edition prints the current level and states the limit in plain words rather than implying a weekly move it cannot measure.** Caught in canonical edition 01 during review — the first sentence the locked Constitution killed."*

This edition does none of the three. It prints no levels (0 `$`, 0 `%`, 0 `/100`, no market sensor levels). It states no limit. And it implies exactly one weekly move it could not measure — *"breadth was unchanged"* — which is the specific failure §16 was written to prevent, shipped in the first weekly, from the one input the collector diffs against a file it is about to overwrite.

Three things follow, and the board treats them as the answer.

**First, the payload does not currently contain a weekly.** This kills Zuckerberg's proposed inversion as written. `latest.json` carries `updateStatus` on every line and it reads `no-new-release` for gas, housing, credit, auto, jobs *and* inflation. The only line marked `new-observation` this cycle is `financial` (NFCI −0.54) — and it contributes **zero** points. A "weekly lede" built from $4.10, 6.66%, NFCI and breadth would repeat next week exactly as the monthly does. What the payload holds is a weekly *dateline* over month-old *observations*.

**Second, the seal is not the frozen thing anyone assumed.** Jobs' blocking con said five of six glance rows cannot change until the July seal, so the next three issues are already written. The archive refutes it: June read **27** in the vintages of 07-26, 07-28, 07-30 and 08-01T14:46, and **26** at 08-01T15:24, with prevOoze moving 30 → 29 in the same step — roughly 34 hours before publication. The risk is not a frozen headline. It is a **moving headline wearing a fixed date**, in the publication that made date discipline its product. That is a much better argument for weekly than the one Jobs killed — restatements happen between seals, and a weekly is the only cadence that can catch them.

**Third, the honest weekly is available today, and it is not the one any officer proposed.** A weekly whose every delta is month-over-month is a monthly with a weekly dateline, and shipping four of those trains a subscriber that opening is optional. But a weekly that prints **levels** — the pump at $4.10, the mortgage at 6.66%, breadth at 50 out of 100, the panel at 187/6 — and states in plain words that it cannot yet measure a seven-day move, is honest, is different every week as the levels move, and is deliverable this month with no new plumbing. That is §16's interim behaviour, and it happens also to be C6 and C7's fix. The three findings collapse into one change.

**Ruling.**

1. **Keep the weekly cadence. Ratified.** Ward M runs on market cadence and genuinely moves; the archive shows the household seal itself moving between editions; and an appointment is the cheapest retention mechanism that exists.
2. **Move the spine, not the calendar.** The sealed monthly score becomes a **standing anchor block** — seal, band, verdict line, and the sentence *"unchanged since the June seal,"* which is honest, cheap, and reads as discipline rather than staleness. The lead becomes what this week's evidence actually is: levels across both panels, Ward M, and the sector tape.
3. **Hard precondition, owned by Codex, before the cadence claim is legitimate:** a prior-cycle snapshot store the collector cannot overwrite, so that "this week" means something for every line. Until it ships, every edition prints levels and states the §16 limit in plain words, and **prints no delta it cannot name a window for.**
4. **Add the appointment.** §4 — *"End reports with when the next reading arrives"* — and §6.7's close. The July draft declined to name a date because the packet lacks a release calendar; the board rules that is a **missing keyed fact, not a judgement call**. A BLS release calendar is an acquirable fact, not a forecast. Add it to the evidence packet. And §6 says a section is never published empty — where the date cannot be named, the section says why. This edition omitted the close entirely rather than printing its no-data sentence.

If the operator will not fund (3), the board's answer changes: publish monthly at the seal with a market note, because a weekly that cannot measure a week is a promise the pipeline breaks in its own dateline every seven days.

---

## PART 5 — VERDICT

**Do not publish. Publish with named fixes, on a re-issue.**

The engineering underneath this edition is better than the edition — I reproduced the household score, all seven contributions, Ward M's 37, the June divergence of +4 and both SHA-256 digests from published files alone, and the calibration freeze is real in code rather than in prose. That substrate is worth the operator's next year, and most of what is wrong here is renderer and editorial, not foundational. But this edition cannot ship, and the reason is not any of the four blockers the officers brought. **Between 14:46 and 15:24 on 1 August the household model went from methodology 2.0.0 to 3.0.0 — a seventh weighted component, every weight rescaled, both calibration constants changed — restating 180 of 281 archived months, flipping nine band labels, and moving June from 27 to 26 and May from 30 to 29. The edition then printed *"The June OOZE Score fell to 26 from 29 in May"* as this week's observation, said the word "revision" zero times and "3.0.0" zero times, and shipped over a release gate whose own failure text reads "archive must identify methodology v3 before publication," marked non-blocking, while `validation.json` — in the same directory, under the same hash chain — reported `"status":"pass","failures":[]`.** A publication whose entire differentiator is frozen calibration and public corrections unfroze its calibration, restated two-thirds of its history, and published the result as news under a clean bill of health. Add to that a flatly false sentence — *"breadth was unchanged"*, when breadth went 13 to 50 month-over-month and 56 to 50 against the last cycle, is the sole reason Ward M reads 37 instead of 28, and is contradicted by the operator's own public commit title one directory over — and the first real weekly contains two statements a motivated stranger disproves in ninety seconds using files this project published on purpose. **Fix C1, C2, C3 and C4, re-issue with a new hash and a correction note under §15, and ship C5 through C7 in the same pass because they are what makes the thing worth reading rather than merely defensible.** Then the honest sentence this edition should have led with — *"June was restated from 27 to 26 under a new methodology; 180 of 281 months moved, and we are showing you all of them"* — becomes the best advertisement this publication will ever run, and it is already computed, in `revisions.json`, waiting for a renderer.

---

## Officer verdicts

**JOBS** (claims killed in challenge: 2)

I read it once at speed and here is what I came away knowing: OOZEMeter's number went down a little and OOZEMeter is careful about dates. Not one fact about my own life — gas is named four times and the pump price is never printed — and not one number I could repeat to another person. It is honest, it is short, and it is about the instrument instead of the world, which is a fixable problem; the unfixable-by-editing problem is that a monthly seal cannot be a weekly lead, so the next three issues are already written and they say 26. Put the weekly numbers on the front, the observed values inside the sentences, and one line of history under the score, and I would put my name on it. Not on this one.

**IVE** (claims killed in challenge: 3)

There is a real object in here and it is about six lines long: a CAPS label, a plain dek, and a pair of short sentences that land the number — "The jar got lighter. The long-term bills stayed heavy." Everything around it is the same handful of facts wearing nine hats; four of the nine blocks introduce one new fact between them, that fact is the June Ward M reading of 30, and it is typeset as a calendar date. The prose has genuine restraint — 514 words, no exclamation points, no intensifiers — but the structure has none, because nothing in it was decided; it accumulated. I disagree with the prior review's recommendation to ratify these nine blocks as an anatomy: ratify the order, cut to five, give the document one heading grammar and a second horizontal rule, and put the number where the jar is — first.

**ZUCKERBERG** (claims killed in challenge: 2)

No — as shipped this edition cannot recruit a reader it does not already have. 514 words with zero dollar signs, zero percent signs, zero links, and a headline number printed four times without ever saying it is out of 100 or where 26 sits in 281 months of record; there is nothing a stranger can cite, check, or click, which means the whole "the Ooze Score fell to 26" distribution strategy has no landing surface. It has one genuinely quotable sentence — "The jar got lighter. The long-term bills stayed heavy." — and it is buried in a subhead with no number attached, while the biggest verified move in the packet (Ward M 30 to 37) goes unstated under a heading that says things eased. Ship the subject line as "The jar got lighter. The bills didn't. Ooze Score 26/100." and the opening as "The Ooze Score is 26 out of 100 for June, down 3 from May — calmer than 6 of every 10 months since 2003. That is Sticky territory, the band where normal economies live: pressure from gas fell 11 line-stress points with the pump at $4.10, while the mortgage line held at 6.66%." — because the number, the scale, the placement and one price a person actually pays are what make it forwardable, and all four already exist in evidence.json.

**BURRY** (claims killed in challenge: 1)

The arithmetic is clean and the plumbing is better than it needs to be — I reproduced the household score, all seven contributions, Ward M's 37, the June divergence of +4, and both SHA-256 hashes from published files alone, and the calibration diagnostic proves the freeze is real rather than rhetorical. Then the edition told the reader that the only gauge that moved didn't move. Breadth went 13 to 50 and dragged Ward M from 28 to 37; the sentence "breadth was unchanged" is contradicted by the operator's own commit title ("breadth eases 56→50") sitting in a public repo, which is roughly a ninety-second kill for anyone who cares to look, and the fix already in HEAD does not close it because the collector still diffs data/market.json against the copy it is about to overwrite. Publish this only after retracting that sentence, labelling the January-dated credit and auto observations that supply 11 of the 26 points, and dropping the housing/credit "tie" that exists solely because 6.31 and 5.45 both round through Math.floor — a publication whose entire differentiator is verifiable honesty cannot afford a false "no change" in its first real edition.