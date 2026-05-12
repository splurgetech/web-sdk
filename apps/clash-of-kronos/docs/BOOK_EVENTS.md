# Clash of Kronos — book event protocol

Authoritative shapes live in [`src/game/typesBookEvent.ts`](../src/game/typesBookEvent.ts). The RGS/math emits JSON with these `type` values; the client **replays** them in order (`playBookEvents`). No round outcome is computed only on the client.

## Grid and indexing

- **Logical grid:** `board` is **5 reels** × **5 symbol rows per reel** in client-facing books (Stake math `reveal` with padding: top row + **3 visible** + bottom row).
- **`Position`:** `{ reel: 0..4, row: 0..4 }` in **client space** (after padding rows are folded into the matrix). **Row `0`** is the top padded row; **rows `1..3`** are the three visible rows; **row `4`** is bottom padding.
- Math SDK uses **internal** rows `0..2` before `win_info_event` adds `+1` to each `row` for the book. Fixtures in `storybook_fixtures.py` use **client** rows (`0..4`).

## Event order (typical base spin)

1. **`reveal`** — Initial stop; sets `gameType`, `board`, `paddingPositions`, `anticipation`.
2. **Zero or more cascade cycles** (each cycle with at least one win):
   - **`cascadeTrackerUpdate`** — Current tracker `stage` (1..7), `multiplier`, `gameType`, `chestsActive` (base: chests unlock at stage ≥ 4; free: stage ≥ 3).
   - **`chestUnlock`** / **`chestValuesUpdate`** — First time chests become active in the spin (optional; may mirror tracker threshold).
   - **`winInfo`** — All line wins for this cascade step; see invariants below.
   - **`updateTumbleWin`** — Running tumble total for UI (amount in **cents**).
   - **`lightningStrike`** / **`surgeChests`** / **`hammerCollect`** — Power-up resolution when applicable (before symbols drop).
   - **`tumbleBoard`** — `explodingSymbols` removed; `newSymbols` dropped per reel (top-first in client).
3. **`setTotalWin`** / **`setWin`** — End of spin (or end of feature segment as designed).
4. **`freeSpinTrigger`** / **`updateFreeSpin`** / **`freeSpinRetrigger`** / **`freeSpinEnd`** — Feature lifecycle.
5. **`finalWin`** — Round multiplier / final amount (cents).

## Invariants

| Event | Rule |
| ----- | ---- |
| `winInfo` | For each line win, **`kind`** is the **count of paying positions** on that line (usually 3–5). **`positions`** must list **every** cell that participates in that win (same count as `kind` for standard line wins). Multiple lines → multiple entries in `wins[]`; overlapping cells appear in each relevant entry. |
| `winInfo.meta` | Include `lineIndex`, `multiplier`, `winWithoutMult`, `globalMult`, `lineMultiplier`; cascade tracker should set `trackerStage` / `trackerMultiplier` when used. |
| `tumbleBoard` | **`explodingSymbols`** must match cells cleared **this** tumble; **`newSymbols`** length per reel equals count of explosions on that reel. After replay, implied board must match next `winInfo` / `reveal`. |
| `hammerSmash` | **`resultBoard`** is full client grid after smash; **`clearedPositions`** lists removed cells; hammer consumes one held charge. |

## Event reference

| `type` | Role |
| ------ | ---- |
| `reveal` | Show spin result; drive reel spin animation. |
| `cascadeTrackerUpdate` | Progress bar / multiplier stage for cascade feature. |
| `chestUnlock` | Highlight CHEST positions that become active. |
| `chestValuesUpdate` | Set `chestValue` / `chestActive` on positions. |
| `winInfo` | Line wins + optional `chestWins` / `powerUps`. |
| `updateTumbleWin` | Cumulative tumble win display. |
| `tumbleBoard` | Cascade animation (explode + drop). |
| `lightningStrike` | Replace symbols at `strikes[].position` with `toSymbol`. |
| `surgeChests` | Bump chest displayed values (`from` → `to`). |
| `hammerCollect` | Hammer armed from a winning wild. |
| `hammerSmash` | Grid clear + refill when zero-win with hammer held. |
| `setTotalWin` / `setWin` | Balance / win panels. |
| `freeSpinTrigger` | Enter bonus (scatter positions). |
| `updateFreeSpin` | Spin counter (`amount` is current index style per handler). |
| `freeSpinRetrigger` | Add spins. |
| `freeSpinEnd` | Bonus end summary. |
| `finalWin` | Close round. |
| `createBonusSnapshot` | Resume helper (replay subset before resume index). |

## Regenerating Storybook fixtures

From math-sdk:

```bash
cd games/0_0_clash_of_kronos && python storybook_fixtures.py
```

Updates `apps/clash-of-kronos/src/stories/data/*.ts` in `web-sdk` when `web-sdk` is a sibling of `math-sdk`.

## RTP target (~96%) and Stake Engine math artifacts

- **Target RTP** for Kronos sims is **0.96** in `games/0_0_clash_of_kronos/game_config.py`. After large simulation batches, adjust distribution quotas, reel strips (`reels/*.csv`), and the paytable until measured RTP matches the product target.
- **Stake Engine** packaging is described in the [math-sdk overview](https://stakeengine.github.io/math-sdk/math_docs/general_overview/): index weights, CSV tables, compressed logic books (for example `.jsonl.zst`), and provider metadata. Run `run.py` from a math-sdk environment with `PYTHONPATH` pointing at the repo root and required dependencies installed (including `zstandard`) to regenerate books and run format checks when enabled.
