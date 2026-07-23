# Design

## Theme

Dark containment-laboratory instrument panel. Scene: someone checking the economy on their phone over morning coffee, or glancing at a second monitor; the dark phosphor surface reads as "instrument," and the glowing jar is the focal point. Near-black green-tinted background with a faint blueprint grid.

## Color

- `--bg` #070b06 (near-black, green-tinted; never pure black)
- `--panel` #0e150c
- `--text` #e6f2da / `--muted` #8ba07c / `--dim` #5c6e50
- `--ooze` #a3ff12 phosphor green (level-themed: #4dffa1 → #c8ff2a as stress rises)
- `--amber` #ffb02e (warnings), `--red` #ff4d3d (overflow), `--green` #4dffa1 (relief)
- Strategy: committed. The phosphor green carries identity; amber/red reserved for meaningfully elevated states.
- Hairlines: rgba(163,255,18,.14) and .32; solid only, no dashes.

## Typography

- Display: Unbounded (800/900) for scores, headings, wordmark.
- Body/data: IBM Plex Mono for everything else; uppercase + letter-spacing for instrument labels.
- Scores use tabular numerals.

## Components

- The Jar: CSS liquid with rotating-blob surface waves and bubbles; `settled` class stills all motion. Level 5 alone stays boiling.
- Containment chamber: rig bar (beacon + lamps), instrument console (gauge, temp, integrity), caution label.
- Pressure nodes: pill buttons with animated intake pipes on hover (desktop only; pipes hidden on mobile).
- Cards, incident files (rotated stamps), replay panel with gradient range slider, tier chips, ad slots (hairline placeholders), newsletter card.

## Motion

- Staged: boot sequence → cinematic reveal → fill → rest. Stillness is default.
- Facility alerts: red wash at 80+, flicker at 90+, page drips at 95+ (event-driven only).
- Ease: cubic-bezier(.22,1,.36,1) for fills and reveals. prefers-reduced-motion disables all.

## Layout

- Max width 1180px (860px for prose pages). Hero: nodes | chamber | nodes grid collapsing to stacked chamber-first on <900px.
- Section chrome: uppercase file labels with hairline rules ("File 01 — Pressure Sources").
