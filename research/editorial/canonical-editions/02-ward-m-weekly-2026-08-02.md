# CANONICAL EDITION 02 — THE WARD M WEEKLY
### STATUS: REJECTED — rewrite required, not approved

Hand-written 2026-08-02 against the LOCKED Editorial Constitution v1.0. Independent
adversarial review returned **NO**: the edition's central narrative is inverted.
**It is not a golden master and the automation gate stays shut.** Fixed in this
revision: the false "share no inputs" firewall claim.

**Why it was rejected** (verified against payloads):
- "The official gauges cooled" — the ward ROSE 7 points, 30 → 37. The edition
  quotes that same June 30 three paragraphs later.
- "Breadth was unchanged at 50" — the payload's `delta: 0` was hardcoded, not
  measured. The backtest shows breadth climbed 13 → 50, the largest move on the
  panel and the entire reason the ward rose. (The generator has since been fixed
  to publish an unmeasured delta as `null` rather than as zero.)
- Missing three mandatory §6 sections, including "What a household would notice",
  which §2 marks *Always*.
- The confidence statement is not the one `scripts/editorial-furniture.js` emits:
  it pairs the archive branch with the live byline and invents a methodology
  version the payload does not carry.
- "The curve is not inverted this week" — the rates gauge is a July monthly mean
  and cannot speak to any week.
- "the only one above the midpoint" — breadth is 50, which is the midpoint.
- Blocked upstream: `data/market.json` carries no prior score, so no ward edition
  can satisfy §6.1's delta requirement until it does. That belongs in §16.

Figures transcribed from `data/market.json` and `data/sectors.json` (collected
2026-08-01, Sector Watch observation 2026-08-01) and `data/market-history.json`
for the last shared month. Nothing here is estimated.

*Compliance notes for the reviewer are in square brackets at the end — they are
not part of the edition.*

---

## THE WARD M WEEKLY
### Week of 2 August 2026 · Market Containment Wing · EXPERIMENTAL

**Ward M reads 37 out of 100. It is an experimental instrument and it
contributes nothing to the household Ooze Score.**

**The panel is softening, and one ticker is doing almost all of it.** Sector
Watch runs eleven proxies: six steady, four softening, one stressed. The stressed
row is semiconductors — SMH down 17.6% over 22 trading sessions. The next-worst
row is the Nasdaq-100 proxy at −6.6%, then small caps at −3.1%, industrials at
−2.9%, transports at −2.1%. Financials are up 6.2% and health care up 2.5% in
the same window. That shape — one deep hole and a shallow tilt everywhere else —
is what a 50 out of 100 breadth reading is made of: half-weight for each
softening row, full weight for the stressed one, three of eleven, mapped through
the published anchors.

**What moved.** The official gauges cooled. Energy gauge heat fell 7 points with
WTI at $80 a barrel; volatility fell 3 with the VIX monthly mean at 17.1; credit
and funding fell 2 with the Chicago Fed index at −0.54, deep in the loose half
of its range. Dollar heat edged up 3 with the broad index 0.5% above a year ago.
Rates heat held at 27 with the 10-year minus 3-month spread at 0.73 points —
positive, so the curve is not inverted this week. Breadth was unchanged at 50.

**The leading gauge.** Breadth led the panel at 50 out of 100 — the highest of
the six, and the only one above the midpoint of its own scale. Breadth heat means
weakness was spreading across the ticker panel rather than concentrating in one
corner, which is precisely the claim this week's data complicates: the spread is
shallow and the concentration is real. Five gauges out of six are reading in the
calmer half of their ranges.

**Two instruments, one month.** Ward 37 out of 100 against a household jar of 26
out of 100 — an 11-point gap with the ward reading hotter. The two are on
different clocks: the ward's gauges are July monthly means collected 1 August,
while the jar's standing seal is June, so this gap is not a same-month
comparison. The last month both instruments sealed exactly was June 2026: ward
30, jar 26, a 4-point gap. The two instruments are never averaged, and they overlap in exactly one
place: the Chicago Fed's index at -0.54 is one of the ward's six gauges and
carries 3% of the jar's weight.

**Next.** Sector Watch refreshes when the operator runs a collection — scheduled
collection stays disabled until quote-redistribution rights are cleared, which
is a licensing question and not a technical one. Gauge months roll when their
Federal Reserve, Cboe and EIA series post.

*Methodology v Ward M provisional. Reconstructed 2026-08-01 from current-vintage
public data, not release-time observations. 2 source-revision events on the
public record (data/revisions.json). Every figure traces to a cited public
series; anchors, weights and calibration constants are published and frozen.
Gauge anchors remain provisional.*

*Drafted by OOZEBOT · reviewed by the Division of Economic Containment*

---

### Compliance notes (not part of the edition)

- **§5 firewall, first sentence:** the zero-weight declaration leads, in full
  words — the corpus's most reliably kept promise (12/12) and the reason it is
  §5's repetition rule rather than a style preference.
- **§4 observed values:** every gauge carries its real value in the same
  sentence — $80, 17.1, −0.54, 0.73pp, +0.5%. No gauge is named by heat alone.
- **§3 units:** every level prints `/100`; every move prints "points" and is
  named as gauge heat, never composite points; the breadth arithmetic is shown
  so the 50 reproduces from the paragraph that states it.
- **§5 never-predict:** the rates gauge is described as *not inverted this week*
  — a state, not a signal. The recession reputation is deliberately withheld
  because the gauge is not elevated (§5's added clause: a gauge below the calm
  half of its scale does not receive recession vocabulary).
- **§6b divergence as argument:** levels, then the clock difference, then the
  last exactly-shared month. It reports the 11-point gap without characterising
  it as agreement or disagreement, and refuses the false same-month reading that
  a bare comparison would imply.
- **§8 governing idea:** stated in paragraph two — the panel is softening but the
  weakness is one ticker deep — and the leading-gauge paragraph explicitly
  complicates the gauge's own stock gloss rather than reciting it.
- **§6 no empty sections and §9 gaps:** every section carries a body; nothing is
  interpolated.
- **§2.4 next:** names what refreshes it and the real blocker, without promising
  a date the facility does not control.
