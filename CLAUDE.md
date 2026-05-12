# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (run from repo root)
pnpm install

# Run Storybook for a specific app (primary dev workflow)
pnpm run storybook --filter=<app-name>
# e.g. pnpm run storybook --filter=clash-kronos-cluster   (port 6008)
#      pnpm run storybook --filter=cluster                 (port 6001)
#      pnpm run storybook --filter=lines                   (port 6001)

# Run dev server for a specific app
pnpm run dev --filter=<app-name>

# Build a specific app
pnpm run build --filter=<app-name>

# Lint / format (run from repo root or filter to a package)
pnpm run lint
pnpm run format

# After editing any file in packages/pixi-svelte, rebuild it
pnpm run build --filter=pixi-svelte
```

All app packages use the same default ports (6001 Storybook, 3001 dev) except `clash-kronos-cluster` which uses 6008 / 3008 — run only one at a time unless ports differ.

Node 22.16.0, pnpm 10.5.0 required.

## Repository structure

```
apps/           # Game apps — each is a self-contained SvelteKit + Storybook app
  clash-kronos-cluster/   # Active Kronos cluster build (7×7, no wilds)
  cluster/                # Reference cluster sample (7×7, wild multiplier)
  lines/                  # Reference lines sample
  ...
packages/       # Shared local packages (workspace:*)
  config-*/           # Shared TS / Vite / Svelte / Storybook / Lingui configs
  pixi-svelte/        # Core PixiJS + Svelte integration; must be rebuilt after edits
  utils-book/         # playBookEvent / playBookEvents / sequence machinery
  utils-slots/        # createReelForCascading, createEnhanceBoard, padding utils
  utils-xstate/       # gameActor (XState FSM), createPrimaryMachines
  utils-event-emitter/ # eventEmitter (broadcast / broadcastAsync / subscribeOnMount)
  utils-layout/       # Layout sizes, canvas ratio, stateLayout context
  state-shared/       # Global stateBet (bet amount, win amount, turbo flag, etc.)
  constants-shared/   # Global constants
  components-ui-pixi/ # Ready-made pixi UI (BetButton, UI, etc.)
  components-ui-html/ # Ready-made HTML UI (Modals, etc.)
```

## Core architecture: book → emitter → component

Every game spin is a **book** — a JSON array of **bookEvents** returned by the RGS. The frontend plays them sequentially via `playBookEvents()`.

```
RGS book  →  playBookEvents()  →  bookEventHandlerMap[event.type]()
                                          │
                          eventEmitter.broadcast / broadcastAsync
                                          │
                          component.subscribeOnMount({ type: handler })
```

**`playBookEvents`** (from `utils-book`) iterates events in order using `sequence()` — each event fully resolves (including all `await broadcastAsync` calls) before the next begins. This sequencing is critical: it controls timing of animations.

**`bookEventHandlerMap`** (`src/game/bookEventHandlerMap.ts` in each app) — maps `bookEvent.type → async handler`. Handlers broadcast emitter events; they never touch DOM/Pixi directly.

**`eventEmitter`** — typed event bus. `broadcast()` is fire-and-forget; `broadcastAsync()` waits for all async subscribers to resolve (used to await animations).

**Components** call `context.eventEmitter.subscribeOnMount({ eventType: handler })` in `<script>` to register. Each component owns its own emitter event types, declared as a module-level `export type EmitterEventFoo = …` union.

**`typesEmitterEvent.ts`** — re-exports all component emitter event types and unions them into `EmitterEventGame`. `eventEmitter.ts` combines `EmitterEventGame` with shared UI event types into the final `EmitterEvent`.

## Adding a new book event (standard workflow)

1. **`typesBookEvent.ts`** — add a new type, add it to the `BookEvent` union.
2. **`bookEventHandlerMap.ts`** — add the handler; broadcast appropriate emitter events.
3. **New or existing component** — add `export type EmitterEventFoo = …` union at module level; call `subscribeOnMount` in script.
4. **`typesEmitterEvent.ts`** — import and add the new type to `EmitterEventGame`.
5. **`src/stories/data/base_events.ts` / `bonus_events.ts`** — add a sample payload for the `bookEvent/<type>` story.
6. **`ModeBaseBookEvent.stories.svelte` / `ModeBonusBookEvent.stories.svelte`** — add a `<Story>` entry.
7. **Test individually** via `MODE_BASE/bookEvent/<type>` story before testing end-to-end in `MODE_BASE/book/random`.

## Game state (`src/game/stateGame.svelte.ts`)

Each app maintains a `stateGame` Svelte 5 `$state` object containing the board (array of reel objects from `createReelForCascading`), `gameType` (`basegame` | `freegame`), tumble board state, and multiplier board. `stateGameDerived` holds computed helpers and the `enhancedBoard` object (spin, settle, preSpin).

## Context (`src/game/context.ts`)

`setContext()` is called **once** at the page entry (`+page.svelte`) and at the top of every Storybook story file — before `<Game />` renders. It sets four shared Svelte contexts: `ContextEventEmitter`, `ContextXstate`, `ContextLayout`, `ContextApp`. Components access them via `getContext()` from the app's own `context.ts`.

## Storybook story structure

Each app has four story files:
- `ComponentsGame.stories.svelte` — renders `<Game />` with optional emitter events for component-level testing.
- `ModeBaseBook.stories.svelte` — plays full base books from `data/base_books.ts`.
- `ModeBaseBookEvent.stories.svelte` — plays individual base book events from `data/base_events.ts`.
- `ModeBonusBook.stories.svelte` / `ModeBonusBookEvent.stories.svelte` — same for bonus mode.

Every story file calls `setContext()` before rendering `<Game />`.

## Clash of Kronos Cluster (`apps/clash-kronos-cluster`)

The active game under development. Canonical design: `apps/clash-kronos-cluster/docs/CLASH_KRONOS_CLUSTER_GDD.md`.

Key differences from the `cluster` reference app:
- **No wilds** — symbol set is `L1–L3`, `M1–M2`, `H1–H2`, `SCATTER` only.
- **Cell multiplier overlay** — `updateGrid` event (`gridMultipliers: number[][]`, 7×7) already exists in the cluster app and is the naming convention to follow.
- **New events to implement**: `kronosBar { progress: number; filled?: boolean }` and `kronosStrike { hits: { reel: number; row: number }[] }`.
- **Free spins**: cell multipliers persist across free spins (not reset between individual FS spins); reset only at bonus end.
- **Storybook port: 6008**, dev port: 3008.

The app was scaffolded from `apps/cluster` — all cluster patterns (tumble board, multiplier grid, free spin counter, global mult, etc.) are present as a starting point.

## Key constants per app (`src/game/constants.ts`)

`BOARD_DIMENSIONS`, `SYMBOL_SIZE`, `INITIAL_BOARD`, and the `SYMBOL_INFO_MAP` (maps symbol names to asset/animation descriptors) live here. Changing grid size means updating `INITIAL_BOARD` length and `BOARD_DIMENSIONS`. The board data shape is `RawSymbol[][]` — outer array is reels, inner is rows top-to-bottom including padding rows (±2 rows for cascading).

## packages/pixi-svelte note

This package is pre-built (consumed from its `dist/`). **Any edit to `packages/pixi-svelte/src/` requires `pnpm run build --filter=pixi-svelte`** before changes are visible in apps.
