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

## Cell multiplier overlay — sum-multiplier formula (Sugar Rush ladder)

After a winning cluster is removed, **multiplier overlays are written onto those grid cells** before the next tumble:

| Event | Stored cell value | UI |
|---|---|---|
| First win touching this cell | **Pending** (`-1` in book JSON) | Dimmed ticket, **no** numeric mult |
| Second win touching same cell | **2×** | Show **2 X** |
| Each further win on same cell | **doubles** (2 → 4 → 8 → …) | Show value |
| Per-cell cap | **128×** | |

Within one **paying step** (one cluster-evaluation pass / one `winInfo` batch before the next tumble), each cell advances the ladder **at most once**, even if it appears in **multiple** winning clusters (e.g. wild-linked splits).

**Win calculation per cluster:** only cells with stored value **≥ 2** contribute to the sum. Pending (`-1`) and empty (`0`) contribute **0**.

```
clusterWin = basePay(size, symbol) * max(1, sum of numeric cell multipliers on all cells in that cluster)
```

`max(1, ...)` ensures the **first** cluster of a spin pays normally when all overlays are still zero (or only pending tickets that do not add to the sum until promoted to 2×).

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

- Counts **every exploded symbol cell** removed in a winning cluster across the whole tumble sequence of a spin (increment **after** each tumble removes symbols and new symbols have settled).
- Bar range: **0–20** (display may show a brief “full” state when the count reaches the threshold).
- When the bar reaches **20** after a tumble’s removals: **bolt collected**, bar **resets to 0** immediately (Kronos “holds” the bolt); wilds are **not** placed yet.
- After the **next** tumble’s symbols have **settled**, Kronos fires **before** the next cluster evaluation; then bar can fill again in the same spin for a **second strike** — does not stack to 40.

---

## Kronos strike

Triggered when the bar reaches **20** from removals in a completed tumble. The bolt is applied **only after** that tumble’s **explode + refill + settle** finishes: **`kronosStrike`** runs **before** the next **`winInfo`** / cluster pass on that settled grid (wilds are not inserted mid-cascade).

**Implementation:**

- Build the set of **paying symbol names** that appear on the **7×7 visible grid** (exclude scatter and any existing **`W`**).
- Pick **one** name uniformly at random from that set (never a symbol absent from the board).
- Replace **every** cell of that name with **`W`** (wild). `W` does not appear on reel strips; it exists only after the strike.
- Run **one** cluster pass with wilds substituting orthogonally (`W` matches adjacent pay symbols; a single `W` can contribute to multiple clusters).
- Emit **`kronosStrike`** with ordered **`hits`** and a padded **`board`** snapshot (same shape as `reveal.board`) so the client can settle the grid replay-identically.
- **No** `updateGrid` event is emitted solely for the strike; ladder updates follow normal winning tumbles only.

---

## Scatters and free spins

| Scatters anywhere | Free spins awarded |
|---|---|
| 3 | 10 |
| 4 | 12 |
| 5 | 15 |
| 6 | 20 |
| 7 | 30 |

- **Same table for retrigger** during free spins (until the total-FS cap is reached).
- **Total free spin cap:** **50** (initial award + all retriggers combined). `tot_fs` is clamped to 50 after each trigger; no further retriggers apply once at the cap.
- **Scatter presentation at cap:** once `tot_fs` is at the cap, new free-spin outcomes are drawn from a scatter-free reel layout (`FR0_NS`: same as `FR0` with `S` replaced by `L1`) so players do not see 3+ scatter symbols with no possible retrigger.
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
| Win cap | **25,000×** bet |
| RTP | **~96.5%** target (`game_config.rtp`; verify with `run.py`) |
| Volatility | TBD via simulation |
| Base cost | **1.0** (default until decided) |
| Symbol pays | Stepped ladder (SR1000-shaped), scaled by `PAYTABLE_SCALE` (default **0.0007** in math `game_config`); see `paytable_sugar_rush1000.py`; Rust **optimization** produces weighted `lookUpTable_*_0` for ~96.5% RTP |
| Wild variants | `W` from Kronos bolts only (not on strips) |

---

## Book events (proposed minimum set)

Align names between math and web implementations for deterministic replay:

| Event | Description |
|---|---|
| `reveal` | Initial board state |
| Tumble board update | Board state after each tumble |
| `winInfo` / tumble win | Cluster wins this step |
| `kronosBar` | `{ progress: number, filled: boolean }` — after each tumble, reflects removals (`filled: true` at 20 = bolt collected, gold); a following `kronosBar(0)` is emitted **after** `kronosStrike` so the client can show gold until the bolt resolves |
| `kronosStrike` | `{ hits: [{reel, row}, …], board }` — bolt order + padded board after wilds |
| `gridMultipliers` | Snapshot of overlay grid (`0` empty, `-1` pending ticket, `>=2` numeric mult) |
| `finalWin` | Round total |
| FS trigger / FS counter / FS end | Free spins lifecycle |
| `wincap` | Emitted if win cap is hit |

---

## Reel strips

- CSV files under `games/0_0_clash_kronos_cluster/reels/` — each column is one reel, each row is a stop.
- **SCATTER** appears on all **7 reels**.
- **7 regular symbols** on strips (`L1`–`L3`, `M1`–`M2`, `H1`–`H2`).
- **`W`** appears on the grid only from **Kronos bolts**, not from reel strips.

---

## Math SDK notes

- Fork from `math-sdk/games/0_0_cluster/` — game ID `0_0_clash_kronos_cluster`.
- Grid config: `num_reels = 7`, `num_rows = 7`.
- Replace free-spin grid mult loop with sum-mult rules above.
- Win eval: `basePay * max(1, sum(numeric cell mults))`; pending `-1` contributes 0; cap **128×** per cell after each update.
- Bar/strike: `game_kronos_bar.py` — bar state machine and `apply_kronos_bolts` (replace all cells of one random on-board paying symbol with `W`).
- Clustering: `Cluster.get_clusters(..., wild_key="wild")` so `W` substitutes orthogonally in the post-strike evaluation.

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
