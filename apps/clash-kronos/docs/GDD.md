# Clash of Kronos — Game Design Document

**Package:** `clash-kronos`  
**Math game ID:** `0_0_clash_kronos`

## Grid

7×7 visible cluster pays (5+ orthogonal). Tumble until no wins.

## Hidden multipliers

Each spin, 20–80% of cells receive a hidden value 1×–10× (weighted low). On cluster win, values collect into an additive **global multiplier** (starts at 0; no mult on wins until first collect). Pay at current global, then collect; collections apply on the next evaluation. Collected cells lose hidden mult for the rest of that spin.

## Global multiplier

- **Base:** resets each spin.
- **Free spins:** starts at 0 at bonus entry; accumulates across all FS spins.

## Kronos bar

Organic cluster win cells fill the bar (threshold 20). When the cascade is idle and bar ≥ 20: random pay symbol → other pay symbol or **WD** wild; bar resets; wins re-evaluate. Transform-generated wins do not fill the bar.

## Symbols

**A–G** pays (3 low / 2 mid / 2 high), **SC** scatter, **WD** wild (Kronos only).

## Free spins

| SC | Spins |
|----|-------|
| 3 | 8 |
| 4 | 10 |
| 5 | 12 |

Max 5 SC on board. Max 3 retriggers per bonus; then `FR0_NS` strips (no SC).

## Bonus buy

100× bet; ≥3 SC on entry (3 SC most likely).

## Targets

RTP 96–97%, wincap 10,000×.

## Book events

`reveal` (with `hiddenMults`), `winInfo`, `collectHiddenMults`, `updateGlobalMult`, `kronosBar`, `kronosTransform`, `tumbleBoard`, FS lifecycle, `finalWin`.
