## OOZEMeter contradiction UI — curated shortlist (18 of 28)

I verified the load-bearing claims against the repo before cutting. Results of that check are folded in below, including two corrections and one finding that reorders the whole exploration.

---

### GROUP A — THE DEFINITION PAGE (claim above evidence, hairlines not boxes)
*Seeds a mockup where the contradiction is carried by typography and adjacency, no chart.*

**A1. Our World in Data — the subtitle IS the definition**
*What:* Chart title is the bare indicator name; the subtitle is the agency's verbatim definition ("Share of the labor force without work, but actively looking for a job and available to start soon"); source demoted below the plot; a standing "What you should know about this indicator" section.
*Borrow:* Print the official definition as the subtitle and light only **"but actively looking for a job"** in `--ooze` against `--muted`. The mechanism of the entire contradiction is four words inside BLS/ILO's own wording — so the distortion is demonstrated, not asserted. Steal the standing rubric as the fixed header for the INTERPRETATION tier.
*Confidence:* **Highest in the set.** Researcher fetched the page directly and quoted verbatim. Independently plausible — it is OWID's house pattern on every grapher page.

**A2. The Economist — chart furniture (tag, claim, measurement, demoted source)**
*What:* Fixed flush-left stack: red hairline + solid corner tag → bold title that is a claim → lighter subtitle stating what is measured and in what units → plot with horizontal gridlines only → source bottom-left, dimmed.
*Borrow:* Two ranks that never merge — a display CLAIM line containing **zero digits**, and beneath it a mono MEASUREMENT line. Source never adjacent to the claim. The corner tag becomes the signal-state tag: short solid bar + 1px `--line-hard` rule running the panel width. **Do not import the red** — `--ward:#5fd7ff` is the only non-ooze hue this system permits.
*Confidence:* Good, with an honest caveat the researcher already made: economist.com was not fetchable, so this rests on reconstructions (`theme_economist` lineage, Ritz's matplotlib writeup) plus a convention observable on any Graphic Detail chart. It is a house style, not a single artefact — cite it that way.

**A3. Sarah Leo, "Mistakes, we've drawn a few" — The Economist, April 2019**
*What:* An Economist visual journalist audited her own magazine's archive, sorted chart failures into three named categories (misleading / confusing / failing to make a point), and reprinted each flawed original beside her redesign at equal size.
*Borrow:* (1) The taxonomy is shipped precedent for a serious publication printing the word "misleading" about itself — that licenses your DISTORTED state. (2) Reproduce the headline framing exactly as published, in `--dim`, beside your reframing at equal size, one vertical `--line-hard` between them. Quote the claim; don't characterise it. Adjacency does the argument.
*Confidence:* Solid on existence and authorship (Nieman Lab, FlowingData 29 Mar 2019, Boing Boing 28 Mar 2019, consistent across all three). The original is on medium.economist.com and was not fetched — treat the three category names as secondary-sourced.

**A4. Print editorial furniture — kicker and pull quote**
*What:* Kicker frames/categorises above the headline; pull quote lifts a phrase from the body, sets it large and bounded by rules, as a second entry point.
*Borrow:* Signal state becomes the KICKER (`.58rem`, `.34em` tracking, uppercase, `--dim` — "SIGNAL: DISTORTED"), not a badge. The **"but"** becomes a PULL QUOTE: its own short indented line with `--line-hard` above and below. That slot is the centuries-trained print signal for "here is the twist," and readers already know how to read it. All numbers live *below* it as evidence.
*Confidence:* Convention, not an artefact — standard newsroom terminology, cross-checkable in any style guide. **I cut the standfirst and nut-graf halves of this reference**, which the researcher's own family warning identifies as the fragile part: a robot-templated "X improved, but Y fell" sentence degrades to mad-libs within a month, and your automation gate is shut for exactly that reason. `.kicker` already exists at lab.css:184.

---

### GROUP B — THE INSTRUMENT ROW (four rows, one gutter, one annunciation)
*Seeds a mockup that is a monospace table, not a chart.*

**B1. Aviation's FLAG-vs-DISAGREE split (Boeing 737 PFD comparator monitors + failure flags)**
*What:* Two deliberately different grammars for two different failures. **DISAGREE** (IAS >5kt for ≥5s, ALT >200ft for ≥5s, AOA >10° for ≥10s): both readings stay fully displayed, unchanged; an amber line of type appears in the gutter between them; no aural, no master caution, no flash. **FLAG**: when no valid source exists, the number is *removed* — blanked or dashed — and a word (SPEED, ALT, ATT) occupies the space where the numeral was.
*Borrow:* MIXED/DISTORTED keep every number fully visible and add a typographic annunciation **in the gap between the two contradicting figures**. UNCERTAIN deletes the numeral and leaves frame, label and units standing with a word in the hole (STALE / NO PRINT / NOT EVALUATED). Every dashboard does the opposite — it tints or greys the number, which fails to communicate doubt *and* makes the display look broken. Second half: publish a numeric threshold **and a dwell requirement** ("differs by more than X for two consecutive prints") on the page.
*Confidence:* Well-documented convention; thresholds via Flight Safety Foundation and the aviationhunt 737 PFD flags reference (fetched, blanking language quoted); a real AOA DISAGREE event documented at aerossurance.com. Not a design shot — cite as instrumentation convention.
*Merged:* I collapsed the researcher's two separate entries into one, because the *split between them* is the borrow, not either half alone.

**B2. `ntpq -p` tally column — the falseticker mark** (with unified diff as corroborating precedent)
*What:* Monospace table of time sources, one per row. First column is a single character encoding that source's standing against the computed consensus: `x` = falseticker (disagrees with the majority), `-` = discarded by clustering, `+` = combined, `*` = system peer. Consensus computed first, then every source marked in place.
*Borrow:* Four labour indicators as four fixed-width rows; compute what the majority say; mark each row's agreement in a single-glyph left gutter. Contradiction becomes a vertical scan — three rows one mark, one row another — in about a second, no chart, no ramp, no arrows. **"Falseticker" is a real term of art** the editorial voice can legitimately quote, and it teaches the mechanism. From unified diff, add the discipline that the gutter glyph marks **role, not verdict** — `+` means "new value," never "good" — so the `-23,000` can sit inside a `+` line without contradiction.
*Confidence:* Highest in group. docs.ntpsec.org fetched directly, tally codes read verbatim. Unified diff is POSIX-specified and the researcher ran it locally. **I merged the diff entry into this one** — the operator does not need two monospace-gutter references.

**B3. Nagios exit codes + Grafana Alerting states — the orthogonal axis**
*What:* Nagios defines UNKNOWN as exit code 3 — numerically past CRITICAL but explicitly *not a worse severity*; it means the check failed, not the thing. Grafana makes it structural: No Data and Error are separate states from Alerting with independent routing. Grafana also has Pending — the condition must hold through a period before the alert is called.
*Borrow:* Severity and knowledge are two independent dimensions, and "we don't know" must never be a point on the severity ramp. Implement as an orthogonal `[data-epistemic]` attribute, **not** a level 6 — lab.css already keys severity off `[data-level="1"–"5"]`, each remapping `--ooze`. This is the change that keeps the green→acid ramp meaning exactly one thing forever. Pending gives you the dwell rule from B1 a home in the state machine.
*Confidence:* nagios-plugins.org guidelines fetched directly; Grafana's "No Data and Error states" is current official docs. Both first-hand verifiable.

**B4. QARTOD data flags — NOAA IOOS real-time ocean QC**
*What:* Every individual datapoint carries a quality flag: 1 Pass, 2 Not Evaluated, 3 Suspect, 4 Fail, 9 Missing. Per-observation, not per-panel. Flag 3's official wording: data "considered to be either suspect or of high interest… flagged suspect to draw further attention to them by operators."
*Borrow:* Attach the epistemic flag to the **datum**, not the panel, so a reader sees *which* number is suspect. Steal the vocabulary: "suspect / of high interest" is calmer and more accurate than "conflict" or "warning," and "not evaluated" is an honest, non-alarming way to publish a number nobody has checked. Earns a flag-key page, which is a genuine field-report artifact.
*Confidence:* QARTOD Data Flags Manual v1.2 (public NOAA PDF) plus AOOS portal docs; definitions confirmed against both. Strong.

**B5. Masimo Signal IQ (SET pulse oximetry, Rad-5 / Radical-7)**
*What:* SpO2 shows as a large numeral; immediately adjacent, a Signal IQ bar whose height encodes the device's confidence in that number. When it falls low the indicator turns red and posts "Low Signal IQ" — while the SpO2 number keeps displaying at full fidelity. The plethysmograph is shown too, so the clinician can judge for themselves.
*Borrow:* Confidence gets its **own adjacent mark with its own scale** — never opacity, blur or grey on the number itself. Degrading legibility to express doubt makes the display feel broken; a separate bar says "this is exactly what we measured, and separately here is how much we'd lean on it." Corollary: show the raw series next to the figure.
*Confidence:* Masimo whitepaper LAB5318B and Rad-5/Radical-7 operator manuals on techdocs.masimo.com. First-hand-verifiable vendor documentation.

**B6. IEC 60601-1-8 Table 2 — medical alarm priority coding**
*What:* Visual priority is colour **and flash rate together**: high = red flashing 1.4–2.8 Hz, medium = yellow 0.4–0.8 Hz, low = cyan or yellow **constant, 100% duty cycle, no flashing**. Urgency is encoded primarily in motion; the lowest actionable state is *required* to be still. Cyan is the standard's designated low-priority colour.
*Borrow:* Motion, not colour, carries urgency — therefore MIXED and DISTORTED get **no motion whatsoever**. This is the principled argument against the default instinct to make a contradiction badge pulse. It also independently validates cyan as the low-arousal signal colour, which Ward M already owns.
*Confidence:* Table 2 values via TI application note SSZT261 and Same Sky's published guide. Widely documented standard.
*Why I kept this despite it being a rule rather than a mockup seed:* it is **actionable here, not merely validating**. See "what everyone missed," item 3 — the house rule the researchers all cited as law is currently violated in lab.css.

---

### GROUP C — THE GHOST AND THE LADDER (explanatory, degrading to static)
*Seeds a mockup where the interpretation is drawn as chart furniture.*

**C1. THE GHOST LINE — Bloomberg "What's Really Warming the World" (2015) + NYT Upshot "You Draw It" (2015)**
*What:* Bloomberg pins the observed temperature line so it never leaves, then draws candidate explanations against it one at a time; you watch five fail before greenhouse gases lock on. NYT removes the data line entirely and makes the reader draw their prediction, then snaps the truth in beside their wrong guess and leaves both on screen.
*Borrow:* Pin the OBSERVED thing as a fixed reference, then draw the expectation against it in the same units on the same axis. The static, generatable version needs no interaction at all: draw "unemployment fell 0.1pt, so you'd expect roughly +X jobs" as a dimmed dashed counterfactual with the actual −23,000 solid over it; hatch the wedge between them at `rgba(163,255,18,.08)`, label it once. **The wedge is the people who left the workforce** — the hidden variable is drawn, not explained. Generalises with no new vocabulary: CONFIRMED = no wedge, MIXED = wedge, DISTORTED = wedge pointing the flattering way. Also take Burn-Murdoch's two disciplines: **kill the legend** (label each line at its own terminus) and **label reference lines by their meaning, not their maths** ("if the jobs market were actually improving").
*Confidence:* Mixed and honestly flagged. Bloomberg 403s to direct fetch; verified via Shorty Awards entry, CLEANET.org listing, Data Stories ep. 059, studiogeorge.nl interview — creators, date and NASA GISS sourcing consistent across all. NYT not fetchable, but verified via **Gregor Aisch's own blog** (driven-by-data.net, 28 May 2015) — an author writing about his own piece, which is the strongest available substitute. "You Draw It" is a recurring NYT format, so cite it as a convention.
*Merged:* three researcher entries (Bloomberg, You Draw It, Burn-Murdoch) collapsed into one device. They are the same move.

**C2. BLS's own U-1 … U-6 ladder**
*What:* The Employment Situation release publishes six measures. U-3 is the headline. U-4 adds discouraged workers, U-5 adds all marginally attached, U-6 adds part-time-for-economic-reasons. **The agency itself publishes the ladder that contradicts its own headline.**
*Borrow:* Show the headline as ONE RUNG, not a fact. Short vertical ladder, U-3 in `--ooze`, U-4/5/6 beneath in `--muted`/`--dim`, each labelled in plain English by who it adds ("+ people who gave up looking"). "The headline is narrow, not wrong" becomes structural rather than argued. `.sw-row` already defines a 4-column hairline grid at `.76rem` (lab.css:334); the jar's `.ticks` rail is the same object rotated.
*Confidence:* Good, with a correction. **I killed the VUDlab Simpson's-paradox half of this reference.** The researcher flagged the URL as possibly stale and admitted to not fetching it — passing through a URL nobody loaded is exactly the failure mode this brief forbids. The BLS half stands on its own and is stronger: bls.gov 403s direct fetch, but U-1…U-6 definitions are confirmed via bls.gov/cps/definitions.htm and bls.gov/lau/stalt-archived.htm. This is also the **maximum-honesty move in the entire shortlist** — you are not second-guessing the source, you are publishing what the source already publishes and the press ignores.

**C3. Bret Victor — "Explorable Explanations" (2011) and Tangle**
*What:* Coined the term. The load-bearing technique is the **reactive document**: prose containing adjustable numbers inline, where dragging a number inside a sentence updates the consequences in the surrounding clauses. His third technique, "contextual information," is about dropping the cost of verifying a claim so low that readers check things they'd otherwise take on faith.
*Borrow:* Put the variable **inside the sentence**, not in a widget beside it: "If the ⟨0⟩ people who left the labour force had kept looking, unemployment would read 4.1%." Drag it and the rate climbs past 4.2%. Whole mechanism, one line, one interaction, no economics vocabulary. Underline the draggable in `--line-hard`, set it in Unbounded against Plex Mono body — it reads as an editable field in a lab instrument, not a SaaS slider. **Critical constraint from the family warning:** the sentence must already be true and complete at its default value. A slider you must drag to discover the point is a point you failed to write.
*Confidence:* worrydream.com fetched directly and read; definitions quoted from the page; Tangle is Victor's own library. Strong.
*Note:* the "contextual information" half is **already ~90% shipped in this repo** — see "what everyone missed," item 5.

**C4. Heuer, "Analysis of Competing Hypotheses" (CIA) + ODNI Intelligence Community Directive 203**
*What:* ACH is a matrix — hypotheses across the top, evidence down the side, cells marked consistent/inconsistent. Its key concept is **diagnosticity**: evidence consistent with every hypothesis has zero value no matter how strong it feels. You proceed by disconfirming. ICD 203 is the binding analytic standard for US intelligence products and requires two things: keep LIKELIHOOD separate from CONFIDENCE (it explicitly forbids putting both in one sentence), and visibly separate underlying information from assumptions from judgement.
*Borrow:* **This is the only reference in the shortlist that handles the oil case.** Present two named hypotheses as equals — "H1: relief at the pump" / "H2: demand is collapsing" — list the same evidence rows under both marked consistent/inconsistent, then state which observation would actually *separate* them (freight volumes, refinery margins). It reads rigorous rather than confused. ICD 203 supplies your three epistemic states their vocabulary and the rule never to blend them in one sentence. It also gives DISTORTED a **principled definition instead of an editorial opinion**: distorted = the headline is consistent with both hypotheses, therefore non-diagnostic, therefore it is telling you nothing while appearing to tell you something.
*Confidence:* Strong. ICD 203 is a primary public PDF at intelligence.gov (mirrored at archive.dni.gov); Heuer's book is CIA-published and free online; the 8-step process and diagnosticity principle confirmed via SANS ISC and Pherson Associates. Verified by search rather than fetch, but these are primary government documents the operator can open directly.

---

### GROUP D — ENCODING LAW (the constraints every mockup must satisfy)
*Not a mockup direction of its own — the ruleset the other three are graded against. Reviewed item-by-item like the rest.*

**D1. WCAG relative luminance + SC 1.4.1, computed against oozemeter's actual tokens**
*What:* WCAG weights green 0.7152 vs red 0.2126. Against your real `--bg:#070b06`: `--green:#4dffa1` = 15.23:1, `--red:#ff4d3d` = 6.02:1 — green is **2.81× the luminance of red** on your canvas. Green screams, red mutters. SC 1.4.1 (Level A) separately forbids colour as the only carrier of information; red-green deficiency affects ~8% of men of Northern European descent.
*Borrow:* Hue may never carry state alone, and any two states that must be distinguished should be luminance-matched so neither outranks the other by brightness. Redundant encoding, never absent encoding — hue may reinforce a state it never has to carry.
*Confidence:* **I re-ran the formula myself against the literal hex values.** Every number reproduces exactly: 15.23, 6.02, 2.81×. Also confirmed `--ward` = 11.94:1 and `--amber` = 10.86:1.
*One correction to the citation:* the researcher wrote that `.ind-meta .down{color:var(--green)}` appears at "lab.css:115 and 490." Line 490 is exactly that rule. Line 115 is `.score-pop .sp-d.down{color:var(--green)}` — the same bug in a different selector, not a repeat of the same rule. The finding stands and is arguably worse (two places, two components); the citation was imprecise. In a product whose thesis is verifiable honesty, fix the citation.

**D2. Slopegraph on a re-polarised stress axis (Tufte 1983/2006, catalogued in the FT Visual Vocabulary)**
*What:* Two time points, one shared axis, one line per series. Direction is slope; the pre-attentive signal is lines **crossing**. No colour, no gridlines, no legend, no fills. The FT Visual Journalism team's Visual Vocabulary classifies charts by the relationship you want to show — Deviation is "variation from a reference point," built on an explicit zero rule.
*Borrow:* **All four employment indicators fell.** On a raw direction axis they are four down-ticks in perfect agreement — which is precisely why the current stylesheet renders the contradiction as consensus. Flip unemployment's sign onto a shared "toward stress ↑ / away from stress ↓" axis and one line goes the opposite way from three. The contradiction becomes a **shape**, in one hue, in about a second. Strokes on near-black with no fills is the one chart form that does not degrade on #070b06. Alternative form from the same family: a single `--line-hard` zero rule with four short deviation bars off it — survives at `.58rem` labels in a ~200px column, which most contradiction visualisations do not.
*Confidence:* Slopegraph attribution to Tufte is canonical (Visual Display 1983 p.158; Beautiful Evidence 2006). FT repo fetched directly by one researcher (github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary); the nine families are listed there. The re-polarisation insight is the researcher's own arithmetic, correctly flagged as such — and it is right.
*Merged:* the FT "Deviation family" entry and the Tufte slopegraph entry are the same insight arriving twice. Kept the sharper articulation.

**D3. Facebook "Disputed" flag → Related Articles (Meta, 20 Dec 2017) + the implied truth effect (Pennycook, Bear, Collins & Rand, *Management Science* 2020)**
*What:* Facebook shipped a red "Disputed" badge and killed it in Dec 2017; PM Tessa Lyons said a strong image like a red flag can entrench belief, and it was replaced with adjacent context instead of a verdict. Separately, Pennycook et al. (two experiments, 6,739 participants) found that warning a **subset** of false headlines makes the *unwarned* false headlines read as MORE accurate — absence of a badge is read as evidence of vetting.
*Borrow:* **Never badge only the contradictions.** If DISTORTED is a stamp and CONFIRMED is the absence of one, every indicator you haven't examined silently reads as verified. All three states must be stamped equally — CONFIRMED must cost as much ink as DISTORTED — and resolution sits *next to* the claim as context, not on top of it as a verdict. A containment lab stamps every sample, not just the contaminated ones; `.stamp` already exists at lab.css:429 with three variants.
*Confidence:* Strong on both halves. Meta Newsroom post is live and corroborated by same-day TechCrunch/TIME/Axios coverage. Pennycook DOI 10.1287/mnsc.2019.3478 is a real, located paper.
*Counterweight the researcher supplied and I endorse:* do **not** design defensively around the backfire effect. Wood & Porter, "The Elusive Backfire Effect" (*Political Behavior*, 2019), 10,100+ subjects across 52 issues, found no corrections capable of triggering it, and Nyhan has walked back the 2010 result. Be direct.

**D4. van der Bles, van der Linden, Freeman & Spiegelhalter, *PNAS* 2020, 117(14):7672–7683**
*What:* Four experiments plus a field experiment on the live BBC News site, on contested topics including climate and immigration statistics. Communicating uncertainty produced only a small decrease in trust — and per the abstract, that decrease was "mostly for verbal uncertainty communication." Numeric ranges cost meaningfully less trust than hedging words.
*Borrow:* Render UNCERTAIN as an **explicit numeric range with its reason** — "58.9–59.1%, revision pending" — never as "roughly," "may be," "unclear," or a question mark. Being specific about the limits of knowledge is nearly free; being vague about them is what costs credibility. A range is two numerals and a rule — less ink than a hedge sentence, and it reads as instrument tolerance rather than weakness.
*Confidence:* Strong. DOI 10.1073/pnas.1913678117, PubMed 32205438; abstract fetched, the verbal-vs-numeric asymmetry quoted not inferred.

---

## CUT — and why

| Reference | Why killed |
|---|---|
| **Bland–Altman plot** (Lancet 1986) | Real, elegant, ~47k citations — and **not computable here**. Limits of agreement are ±1.96 SD; you have four indicators and one month. There is no distribution to take an SD of. Position-encodes-concordance is already delivered by D2 at zero cost. |
| **WMO surface station model** | The most seductive kill. A ten-variable glyph in one ink is exactly the "unexplained glyph / legend the reader must visit first" that the monitoring researcher's own warning forbids, for a reader with five seconds and no training. Overlaps B2/B4 anyway. |
| **VUDlab Simpson's paradox explorable** | Researcher admitted not fetching vudlab.com and flagged the URL as possibly stale. Passing through a link nobody opened is the one thing this brief forbids. The BLS half of that entry survives as C2 and is stronger. |
| **Parable of the Polygons** | Fetched and real, but its borrow ("one hidden term, one control") duplicates C3, and its remaining contribution — that a characterful voice can raise credibility — is a morale argument, not a buildable design move. |
| **Distill.pub "Why Momentum Really Works"** | Fetched and real. But "linked views" needs interaction the family warning says will rot under an unattended robot, and "put caveats in a margin rail" is close enough to "good hierarchy" to fail the generic test. |
| **Print standfirst / nut graf** (half of A4) | The exact templated-sentence failure mode your automation gate exists to catch. Kicker and pull quote survive; the robot-authored sentence does not. |
| **IEC 60601-1-8 as a standalone** | *Not cut* — kept as B6, because it turned out to be actionable rather than merely validating. See below. |

---

## THE THREE I'D MOCK UP FIRST

**1. D1 + D2 together: the re-polarised slope, and the bug it exposes.**
Not because it is the prettiest, but because it is the only one where the exploration found the product actively lying. `lab.css:490` — `.ind-meta .down{color:var(--green)}` — paints all four falling employment indicators bright green at 15.23:1 on your background. The stylesheet does not merely fail to show the contradiction; **it renders it as consensus, loudly.** Flipping the axis fixes the encoding and produces the five-second read in the same move, in one hue, with no new component. Build this first because it is a correction, not a feature.

**2. A1: the definition with four words lit.**
It solves the hardest constraint — five seconds, no economics paragraph — with the least machinery, and it is the only device in the set with **nothing to fact-check**, because the incriminating words are the agency's. It is robot-safe: the definition is a constant, not a generated sentence, so it cannot degrade into mad-libs the way a standfirst will. It generalises to oil by printing both definitions and lighting the clause that diverges. Cheapest strong thing here.

**3. B1: the DISAGREE / FLAG split.**
Because it gives all four required states a coherent grammar for the cost of one CSS state and zero new hues: MIXED/DISTORTED keep every number and add amber type in the gutter between the two figures; UNCERTAIN deletes the numeral and leaves the frame, label and units standing with a word in the hole. **Removal as a first-class state is the single most on-brand move available** — a containment lab that will not print a figure it cannot stand behind — and it is the one thing every competitor gets wrong by greying the number instead.

---

## THE SINGLE BIGGEST RISK

**The data does not exist yet, and the score is already distorted.**

`data/latest.json` → `lines.jobs` carries **one** headline series and **one** secondary:

```
"seriesId": "UNRATE",  "value": "4.1%"
"secondary": { "seriesId": "ICSA", "value": 198750 }
"stress": 14,  "contrib": 3,  "delta": -2
```

PAYEMS, CIVPART and EMRATIO are not collected. **Every geometric device in this shortlist — the slopegraph, the tally column, the small multiples, the deviation bars, the ghost wedge — requires four sibling series under one line, and the schema has no slot for them.** The entire shortlist is downstream of a collector and schema change nobody scoped.

Worse: `"stress": 14` on a 0–100 scale means the jobs line is currently scored **calm**, because stress is keyed to UNRATE, which improved. It contributes 3 points to the published Ooze Score with `delta: -2` — i.e. the product currently reports the labour market as *getting better*. This is not a visual-design defect. Fix the palette, ship any of the eighteen references above, and you will render a beautiful, honest, accessible visualisation of a number that is itself wrong. **The contradiction has to be fixed in the collector and the scoring before it is worth designing a way to display it.**

---

## WHAT ALL FOUR RESEARCHERS MISSED

1. **The schema.** Above. All four designed for four sibling indicators; the repo has one plus a claims proxy. This is the finding that reorders the project.

2. **The score, not just the colour.** The antipatterns researcher got closest — "the stylesheet manufactures the false impression" — but stopped at CSS. The distortion is already inside `stress`/`contrib`/`delta`. Nobody traced it that far.

3. **The house rule they all cited as law is currently violated in the code.** Every family summary leaned on "stillness as the resting state, motion happens once then settles." But `lab.css:195` is `[data-level="5"] .jar{animation:shake .35s linear infinite}` — infinite motion. And `.35s` linear ≈ **2.9 Hz**, which lands at the top of IEC 60601-1-8's *high-priority* flash band (1.4–2.8 Hz). The jar currently annunciates level 5 with the motion signature of a life-threatening medical alarm. That makes B6 actionable rather than decorative, and it means the monitoring researcher's tonal warning — "ordinary economic ambiguity must not read as an emergency" — describes a bug that already shipped.

4. **The severity ramp is non-monotonic in luminance.** Levels 1→5 measure 0.757, 0.773, 0.863, 0.816, 0.840. **Level 3 is the brightest thing on the ramp** — brighter than 4 and 5. Adding an orthogonal epistemic axis (B3) on top of a severity ramp that does not already order correctly will compound the ambiguity rather than resolve it. Fix the ramp before layering.

5. **Bret Victor's "contextual information" layer is ~90% already built, and nobody noticed.** Every line in `latest.json` already ships `source: {publisher, transport, seriesId, metric, url, proxy}` and some carry `transform`. "Every number is one hover from its source series ID" is not a feature to design — it is a `<details>` or a title attribute away. Cheapest win in the entire exploration, and it went unclaimed because all four researchers read `lab.css` and none read `data/`.

6. **Mobile.** Not one of the four addressed it. The tabbar is fixed-bottom (`lab.css:121`), body type runs `.58–.78rem`, and B2's tally table wants four columns plus a gutter while D2's slopegraph wants horizontal room for terminal labels. The two cheapest devices in the shortlist are the two most likely to break on a phone. Mock at 375px first, not last.

7. **Nobody asked what CONFIRMED looks like.** Every reference optimises for showing disagreement. If no month in your history ever renders CONFIRMED, the three states are decorative and D3's implied-truth problem returns through the back door. Run the states against `data/history.json` before designing them — if CONFIRMED never fires, the taxonomy is wrong, not the layout.