# Clash of Kronos — web-sdk (fresh Stake Engine)

This checkout is the **canonical StakeEngine/web-sdk** clone used to build **Clash of Kronos**.

- **Cloned:** 2026-05-10 from `https://github.com/StakeEngine/web-sdk.git` at `origin/main` (see `git log -1`).
- **Game app:** `apps/clash-of-kronos/` — copied from the upstream `lines` sample; `package.json` name is `clash-of-kronos`. Config: `apps/clash-of-kronos/src/game/config.ts` (`gameID` matches math: `0_0_clash_of_kronos`).
- **Cursor / VS Code:** open **`clash-of-kronos.code-workspace`** in this repo (File → Open Workspace from File…) so the project is named **clash-of-kronos** and both **web-sdk** and **math-sdk** appear in the sidebar. Requires `web-sdk` and `math-sdk` as sibling folders.

## Run Storybook for this game

```bash
pnpm install
pnpm run storybook --filter=clash-of-kronos
```

Use **Node 22.16.0** and **pnpm 10.5.0** per the upstream README.
