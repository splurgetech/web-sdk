# Clash of Kronos (Cluster) — Game Design Document

**Studio:** Odd Job Gaming  
**Game:** Clash of Kronos — Cluster variant  
**Package:** `clash-kronos-cluster`  
**Math game ID:** `0_0_clash_kronos_cluster`

This is the **canonical** design document for all mechanics, math targets, and SDK alignment for Clash of Kronos (Cluster). The old lines-based Clash of Kronos GDD has been deprecated — see pointer in that file.

---

## Grid

- **7 columns × 7 rows** — **49** total symbol positions.
- Cluster pays only — no paylines, no wilds.

---

## Win mechanic — cluster pays

- **Minimum cluster size:** **5** touching symbols (orthogonal neighbours only — no diagonal).
- Winning clusters are **removed** from the grid.
- **New symbols tumble down** to fill empty positions.
- After each tumble, clusters are re-evaluated.
- Process repeats until **no new clusters** are found, then the round ends.

---

## Cell multiplier overlay — sum-multiplier formula

After a winning cluster is removed, **multiplier overlays are written onto those grid cells** before the next tumble:

| Event | Cell multiplier value |
|---|---|
| First win touching this cell | **2×** |
| Each subsequent win touching same cell | **doubles** (2 → 4 → 8 → …) |
| Per-cell cap | **128×** |

**Win calculation per cluster:**

```
clusterWin = basePay(size, symbol) * max(1, sum of cell multipliers on all cells in that cluster)
```

`max(1, ...)` ensures the **first** cluster of a spin pays normally when all overlays are still zero.

### Base vs free spins multiplier persistence

| Mode | Cell multiplier reset |
|---|---|
| **Base game** | Reset to zero at **end of each paid spin** |
| **Free spins** | Persist for the **entire bonus** — never reset between individual free spins; cleared only at bonus end |

---

## Symbol set

| Tier | IDs | Notes |
|---|---|---|
| Low | `L1`, `L2`, `L3` | High frequency, small pays |
| Mid | `M1`, `M2` | Moderate frequency, medium pays |
| High | `H1`, `H2` | Low frequency, highest pays |
| Scatter | `SCATTER` | All 7 reels; triggers free spins |

No wilds. Placeholder IDs used until art is finalised; paytable keys must stay consistent with reel CSV stop IDs.

### Paytable structure

Per **exact cluster size** `n` for `n = 5..49` (or cap at max realistic size). Not range bands. Values are **TBD** tunable constants until simulation locks them.

---

## Kronos bar

- Counts **every exploded symbol cell** removed in a winning cluster across the whole tumble sequence of a spin.
- Bar range: **0–20**.
- When bar reaches **20** it **stays at 20** until the strike resolves.
- After strike, bar **resets to 0**.
- Bar can reach 20 again later **in the same spin** for a **second strike** — does not stack to 40.

---

## Kronos strike

Triggered when the bar fills to 20. Runs **after** the cascade step that completed the "20 symbols" condition, **before** the next tumble evaluation.

**Default implementation:**

- Choose a **uniform random count in [3, 6]** inclusive.
- Choose **uniform random cells with replacement** (same cell can be hit multiple times).
- **Effect per hit:**
  - Cell has **no multiplier overlay** → set **2×**
  - Cell already has overlay → **double** it (e.g. 2× hit twice → 8×)
- Emit a **single book event** listing all hits in order: `kronosStrike { hits: [{reel, row}, …] }`.

---

## Scatters and free spins

| Scatters anywhere | Free spins awarded |
|---|---|
| 3 | 10 |
| 4 | 12 |
| 5 | 15 |
| 6 | 20 |
| 7 | 30 |

- **Same table for retrigger** during free spins.
- **No cap** on total free spin count from retriggering.
- **Anticipation:** enabled — configure `anticipation_triggers` from min trigger − 1 (i.e. 2 scatters triggers anticipation).
- All Kronos bar / strike mechanics remain active during free spins.

---

## Bonus buy

- **Cost:** **100×** bet.
- **RTP target:** same as base game.
- Entry boards always show **≥ 3 scatters**.
- 4–7 scatters still possible via weighted simulation distributions.
- Implemented as a `bonus` bet mode (`force_freegame` + scatter count weights mirroring `0_0_cluster` patterns).

---

## Economy / math targets

| Target | Value |
|---|---|
| Win cap | **5000×** bet |
| RTP | **96–97%** band |
| Volatility | TBD via simulation |
| Base cost | **1.0** (default until decided) |
| Symbol pays | TBD via simulation |
| Wild variants | None |

---

## Book events (proposed minimum set)

Align names between math and web implementations for deterministic replay:

| Event | Description |
|---|---|
| `reveal` | Initial board state |
| Tumble board update | Board state after each tumble |
| `winInfo` / tumble win | Cluster wins this step |
| `kronosBar` | `{ progress: number, filled: boolean }` — bar state after each cluster removal |
| `kronosStrike` | `{ hits: [{reel, row}, …] }` — all strike hits in order |
| `gridMultipliers` | Snapshot of overlay grid after meaningful changes |
| `finalWin` | Round total |
| FS trigger / FS counter / FS end | Free spins lifecycle |
| `wincap` | Emitted if win cap is hit |

---

## Reel strips

- CSV files under `games/0_0_clash_kronos_cluster/reels/` — each column is one reel, each row is a stop.
- **SCATTER** appears on all **7 reels**.
- **7 regular symbols** only (`L1`–`L3`, `M1`–`M2`, `H1`–`H2`).
- No wilds.

---

## Math SDK notes

- Fork from `math-sdk/games/0_0_cluster/` — game ID `0_0_clash_kronos_cluster`.
- Grid config: `num_reels = 7`, `num_rows = 7`.
- Replace free-spin grid mult loop with sum-mult rules above.
- Win eval: `basePay * max(1, sum(cellMult))`, enforce 128× cap after each cell update.
- Bar/strike: new module `game_kronos_bar.py` — pure functions for bar state machine and `apply_strike`.
- Prefer `Cluster.get_clusters` (no wild substitution needed — set wild key unused).

---

## Web SDK notes

- App: `web-sdk/apps/clash-kronos-cluster/` (package `clash-kronos-cluster`).
- Fork from `apps/cluster/` — same Vite + Svelte + Storybook pattern.
- Storybook port: **6008**.
- Extend `typesBookEvent.ts` with `kronosBar`, `kronosStrike`, `gridMultipliers` payloads.
- Implement handlers in `bookEventHandlerMap.ts`.
- Board UI: adapt cluster tumble presentation to 7×7 with overlay multiplier rendering.

---

## Document history

- Initial GDD written from locked design decisions — Clash of Kronos Cluster variant (replaces old lines-based Clash of Kronos GDD).
