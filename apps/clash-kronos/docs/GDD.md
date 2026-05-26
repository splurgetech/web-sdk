# Clash of Kronos — Game Design Document

**Package:** `clash-kronos`  
**Math game ID:** `0_0_clash_kronos`

## Grid

6×6 visible cluster pays (5+ orthogonal). Tumble until no wins.

## Hidden multipliers

Each spin, 10–50% of cells receive a hidden value 1×–10× (heavily weighted to 1×–3×). On cluster win, values collect into an additive **global multiplier** (starts at 0; no mult on wins until first collect). Pay at current global, then collect; collections apply on the next evaluation. Collected cells lose hidden mult for the rest of that spin.

## Global multiplier

- **Base:** resets each spin.
- **Free spins:** starts at 0 at bonus entry; accumulates across all FS spins.

## Kronos bar

Organic cluster win cells fill the bar (threshold 20). When the cascade is idle and bar ≥ 20: random pay symbol → other pay symbol or **W** wild; bar resets; wins re-evaluate. Transform-generated wins do not fill the bar.

## Symbols

**H1–H3 / L1–L4** pays (same IDs as cluster sample), **S** scatter, **W** wild (Kronos only).

## Free spins

| S | Spins |
|----|-------|
| 3 | 8 |
| 4 | 10 |
| 5 | 12 |

Max 5 S on board. Max 3 retriggers per bonus; then `FR0_NS` strips (no S).

**Forced entry** (bonus buy + sim `freegame` criteria): scatter count weights **89% / 10% / 1%** for 3 / 4 / 5 S. Organic triggers from reels/tumbles are separate.

## Bonus buy

100× bet; ≥3 S on entry (almost always exactly 3 S).

## Targets

RTP 96–97%, wincap 10,000×.

## Book events

`reveal` (with `hiddenMults`), `winInfo`, `collectHiddenMults`, `updateGlobalMult`, `kronosBar`, `kronosTransform`, `tumbleBoard`, FS lifecycle, `finalWin`.
