# Clash of Kronos — Game Design Document

**Package:** `clash-kronos`  
**Math game ID:** `0_0_clash_kronos`

## Grid

6×6 visible cluster pays (5+ orthogonal). Tumble until no wins.

## Hidden multipliers

Each spin, 10–55% of cells receive a hidden value from **1×, 2×, 3×, 4×, 5×, 10×, or 20×** (mostly 1×–3×; 10× and 20× are rare). On cluster win, values collect into an additive **global multiplier** (starts at 0; no mult on wins until first collect). Pay at current global, then collect; collections apply on the next evaluation. Collected cells lose hidden mult for the rest of that spin.

## Global multiplier

- **Base:** resets each spin.
- **Free spins:** starts at 0 at bonus entry; accumulates across all FS spins.

## Kronos bar

Organic cluster win cells fill the bar (threshold 20). When the cascade is idle and bar ≥ 20: random pay symbol → other pay symbol or **W** wild; bar resets; wins re-evaluate. Transform-generated wins do not fill the bar.

**Resets at the start of every spin** (base and each free spin). Progress does not carry between spins; e.g. 5 cells toward the bar on one FS spin does not carry into the next.

## Symbols

**H1–H3 / L1–L4** pays (same IDs as cluster sample), **S** scatter, **W** wild (Kronos only).

## Free spins

| S | Initial spins | Retrigger (+spins) |
|----|----------------|-------------------|
| 3 | 8 | +4 |
| 4 | 10 | +5 |
| 5 | 12 | +6 |

Retrigger awards are 50% of initial. Max 5 S on board. Max 3 retriggers per bonus; then `FR0_NS` strips (no S).

**Forced entry** (bonus buy + sim `freegame` criteria): scatter count weights **89% / 10% / 1%** for 3 / 4 / 5 S. Organic triggers from reels/tumbles are separate.

## Bonus buy

100× bet; ≥3 S on entry (almost always exactly 3 S). Same FS rules and **same cluster paytable** as organic; **symbol strips** use `FR0_BUY` / `FR0_BUY_NS` (milder than organic `FR0` / `FR0_NS`).

## Targets

RTP 96–97%, wincap 10,000×. Cluster pays are identical in base and bonus buy. **Base spins** use `BR0` strips tuned for longer symbol runs (bigger clusters); **buy FS** uses `FR0_BUY` (same pays, different strips).

## Book events

`reveal` (with `hiddenMults`), `winInfo`, `collectHiddenMults`, `updateGlobalMult`, `kronosBar`, `kronosTransform`, `tumbleBoard`, FS lifecycle, `finalWin`.
