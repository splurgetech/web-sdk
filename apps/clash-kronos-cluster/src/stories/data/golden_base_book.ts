// 7 reels × 9 rows — index 0 and 8 are padding, visible rows are 1–7.
// Coordinate convention: board_row 1-7 → gridMultipliers visual_row 0-6 (vrow = board_row - 1).

// Base board: no wilds. Scatters in reel 0 at rows 3, 5, 7 (survive all tumbles since reel 0 is never in a win cluster).
// Win 1 cluster: L1 orthogonal blob at reels 1-3, rows 2-4 (7 cells).
// Win 2 cluster: H2 at reels 5-6, rows 2-6/2-4 (8 cells).
// Win 3 cluster: L1 at reels 3-4, rows 3-5 (6 cells) after tumbles.
const baseBoard = [
	// reel 0 — never wins; holds 3 scatter symbols
	[{ name: 'L3' }, { name: 'L2' }, { name: 'L1' }, { name: 'S' }, { name: 'L3' }, { name: 'S' }, { name: 'H1' }, { name: 'S' }, { name: 'L3' }],
	// reel 1 — L1 at rows 2,3,4 for win 1
	[{ name: 'L3' }, { name: 'L2' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'H2' }, { name: 'L1' }, { name: 'L2' }, { name: 'L3' }],
	// reel 2 — L1 at rows 2,3,4 for win 1
	[{ name: 'L3' }, { name: 'H3' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'H3' }, { name: 'L2' }, { name: 'L3' }],
	// reel 3 — L1 at row 2 for win 1; L1 at rows 3-5 for win 3 (post-tumble 1 refill)
	[{ name: 'L3' }, { name: 'H3' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'H3' }, { name: 'L3' }],
	// reel 4 — L1 at rows 3-5 for win 3
	[{ name: 'L3' }, { name: 'L2' }, { name: 'H2' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'H2' }, { name: 'L3' }, { name: 'L3' }],
	// reel 5 — H2 at rows 2-6 for win 2 (5 cells)
	[{ name: 'L3' }, { name: 'L3' }, { name: 'H2' }, { name: 'H2' }, { name: 'H2' }, { name: 'H2' }, { name: 'H2' }, { name: 'L1' }, { name: 'L3' }],
	// reel 6 — H2 at rows 2,3,4 for win 2 (3 cells)
	[{ name: 'L3' }, { name: 'L1' }, { name: 'H2' }, { name: 'H2' }, { name: 'H2' }, { name: 'L3' }, { name: 'L2' }, { name: 'H1' }, { name: 'L3' }],
];

// FS board spin 1: H2 cluster at reel 3 rows 2-5 and reel 4 rows 2-4 (7 cells).
// reel 3 row 2 must be H2 (index 2 in 9-element array).
const fsBoardSpin1 = [
	[{ name: 'L3' }, { name: 'H1' }, { name: 'L2' }, { name: 'L3' }, { name: 'L2' }, { name: 'L1' }, { name: 'L1' }, { name: 'H2' }, { name: 'L3' }],
	[{ name: 'L3' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'H3' }, { name: 'L2' }, { name: 'L3' }, { name: 'L3' }],
	[{ name: 'L3' }, { name: 'L2' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'L1' }, { name: 'H3' }, { name: 'L3' }],
	// reel 3: H2 at rows 2,3,4,5 (indices 2,3,4,5)
	[{ name: 'L3' }, { name: 'H3' }, { name: 'H2' }, { name: 'H2' }, { name: 'H2' }, { name: 'H2' }, { name: 'L3' }, { name: 'L1' }, { name: 'L3' }],
	// reel 4: H2 at rows 2,3,4 (indices 2,3,4)
	[{ name: 'L3' }, { name: 'L3' }, { name: 'H2' }, { name: 'H2' }, { name: 'H2' }, { name: 'L2' }, { name: 'H3' }, { name: 'L2' }, { name: 'L3' }],
	[{ name: 'L3' }, { name: 'L1' }, { name: 'L3' }, { name: 'L2' }, { name: 'L1' }, { name: 'H1' }, { name: 'L2' }, { name: 'H3' }, { name: 'L3' }],
	[{ name: 'L3' }, { name: 'H2' }, { name: 'L1' }, { name: 'L3' }, { name: 'L2' }, { name: 'L3' }, { name: 'L1' }, { name: 'L2' }, { name: 'L3' }],
];

// FS board spin 2: H2 cluster at reel 2 rows 3-5 and reel 3 rows 3-5 (6 cells).
// reel 2 rows 3,4,5 = H2; reel 3 rows 3,4,5 = H2 — overlaps with gridFs1 stamps on reel 3.
const fsBoardSpin2 = [
	[{ name: 'L3' }, { name: 'L3' }, { name: 'H3' }, { name: 'L1' }, { name: 'L2' }, { name: 'H2' }, { name: 'L1' }, { name: 'L3' }, { name: 'L3' }],
	[{ name: 'L3' }, { name: 'H3' }, { name: 'L2' }, { name: 'L3' }, { name: 'L1' }, { name: 'L1' }, { name: 'H3' }, { name: 'L2' }, { name: 'L3' }],
	// reel 2: H2 at rows 3,4,5 (indices 3,4,5)
	[{ name: 'L3' }, { name: 'L1' }, { name: 'L1' }, { name: 'H2' }, { name: 'H2' }, { name: 'H2' }, { name: 'L3' }, { name: 'H3' }, { name: 'L3' }],
	// reel 3: H2 at rows 3,4,5 (indices 3,4,5) — rows 1,2 are not H2, only the win cells
	[{ name: 'L3' }, { name: 'L2' }, { name: 'L3' }, { name: 'H2' }, { name: 'H2' }, { name: 'H2' }, { name: 'L1' }, { name: 'L2' }, { name: 'L3' }],
	[{ name: 'L3' }, { name: 'H1' }, { name: 'L1' }, { name: 'L2' }, { name: 'L3' }, { name: 'L1' }, { name: 'H3' }, { name: 'L1' }, { name: 'L3' }],
	[{ name: 'L3' }, { name: 'L2' }, { name: 'H2' }, { name: 'L1' }, { name: 'H3' }, { name: 'L3' }, { name: 'L2' }, { name: 'H1' }, { name: 'L3' }],
	[{ name: 'L3' }, { name: 'L3' }, { name: 'L2' }, { name: 'H3' }, { name: 'L1' }, { name: 'L2' }, { name: 'H3' }, { name: 'L3' }, { name: 'L3' }],
];

// gridMultipliers[reel][vrow] where vrow = board_row - 1 (0-indexed 0–6).

// After win 1 (L1: reel1 rows2-4, reel2 rows2-4, reel3 row2 → vrows1-3 / vrow1):
const grid1 = [
	[0, 0, 0, 0, 0, 0, 0],
	[0, 2, 2, 2, 0, 0, 0], // reel 1 vrows 1-3
	[0, 2, 2, 2, 0, 0, 0], // reel 2 vrows 1-3
	[0, 2, 0, 0, 0, 0, 0], // reel 3 vrow 1
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
];

// After win 2 (H2: reel5 rows2-6=vrows1-5, reel6 rows2-4=vrows1-3):
const grid2 = [
	[0, 0, 0, 0, 0, 0, 0],
	[0, 2, 2, 2, 0, 0, 0],
	[0, 2, 2, 2, 0, 0, 0],
	[0, 2, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 2, 2, 2, 2, 2, 0], // reel 5 vrows 1-5
	[0, 2, 2, 2, 0, 0, 0], // reel 6 vrows 1-3
];

// After win 3 (L1: reel3 rows3-5=vrows2-4, reel4 rows3-5=vrows2-4):
const grid3 = [
	[0, 0, 0, 0, 0, 0, 0],
	[0, 2, 2, 2, 0, 0, 0],
	[0, 2, 2, 2, 0, 0, 0],
	[0, 2, 2, 2, 2, 0, 0], // reel 3: vrow1 from win1 + vrows2-4 from win3
	[0, 0, 2, 2, 2, 0, 0], // reel 4: vrows2-4 from win3
	[0, 2, 2, 2, 2, 2, 0],
	[0, 2, 2, 2, 0, 0, 0],
];

// After Kronos strike: hits = {reel1,row2}, {reel3,row2}, {reel4,row2}, {reel6,row1}
// hit a cell with 2× → doubles to 4×; hit a cell with 0× → becomes 2×
const grid4PostStrike = [
	[0, 0, 0, 0, 0, 0, 0],
	[0, 4, 2, 2, 0, 0, 0], // reel 1: vrow1 was 2 → 4
	[0, 2, 2, 2, 0, 0, 0],
	[0, 4, 2, 2, 2, 0, 0], // reel 3: vrow1 was 2 → 4
	[0, 2, 2, 2, 2, 0, 0], // reel 4: vrow1 was 0 → 2
	[0, 2, 2, 2, 2, 2, 0],
	[2, 2, 2, 2, 0, 0, 0], // reel 6: vrow0 was 0 → 2
];

// FS spin 1 overlay (fresh — finalWin cleared grid): H2 cluster at reel3 rows2-5, reel4 rows2-4.
const gridFs1 = [
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 2, 2, 2, 2, 0, 0], // reel 3 vrows 1-4
	[0, 2, 2, 2, 0, 0, 0], // reel 4 vrows 1-3
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
];

// FS spin 2 overlay (persists from FS1): H2 cluster at reel2 rows3-5, reel3 rows3-5.
// reel2 vrows2-4 → new 2×; reel3 vrows2-4 → were 2× (from FS1) → doubled to 4×; reel3 vrow1 stays 2×.
const gridFs2 = [
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 2, 2, 2, 0, 0], // reel 2: vrows 2-4 = 2× (new)
	[0, 2, 4, 4, 4, 0, 0], // reel 3: vrow1=2×(unchanged), vrows2-4=4×(doubled)
	[0, 2, 2, 2, 0, 0, 0], // reel 4: unchanged from FS1
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
];

export const goldenBaseBook = {
	gameType: 'basegame' as const,
	events: [
		// ── BASE GAME ────────────────────────────────────────────────────────────
		// 0 — reveal
		{
			index: 0,
			type: 'reveal' as const,
			board: baseBoard,
			paddingPositions: [0, 0, 0, 0, 0, 0, 0],
			anticipation: [0, 0, 0, 0, 0, 0, 0],
			gameType: 'basegame' as const,
		},
		// 1 — win 1: L1 cluster (reels 1-3, rows 2-4; 7 cells)
		{
			index: 1,
			type: 'winInfo' as const,
			totalWin: 60,
			wins: [
				{
					symbol: 'L1' as const,
					clusterSize: 7,
					win: 60,
					positions: [
						{ reel: 1, row: 2 }, { reel: 1, row: 3 }, { reel: 1, row: 4 },
						{ reel: 2, row: 2 }, { reel: 2, row: 3 }, { reel: 2, row: 4 },
						{ reel: 3, row: 2 },
					],
					meta: { globalMult: 1, clusterMult: 1, winWithoutMult: 0.6, overlay: { reel: 2, row: 3 } },
				},
			],
		},
		// 2
		{ index: 2, type: 'updateTumbleWin' as const, amount: 60 },
		// 3 — grid after win 1 (7 cells → 2×)
		{ index: 3, type: 'updateGrid' as const, gridMultipliers: grid1 },
		// 4 — bar: 7 symbols exploded
		{ index: 4, type: 'kronosBar' as const, progress: 7, filled: false },
		// 5 — tumble: remove win 1 cells, drop new symbols
		{
			index: 5,
			type: 'tumbleBoard' as const,
			explodingSymbols: [
				{ reel: 1, row: 2 }, { reel: 1, row: 3 }, { reel: 1, row: 4 },
				{ reel: 2, row: 2 }, { reel: 2, row: 3 }, { reel: 2, row: 4 },
				{ reel: 3, row: 2 },
			],
			newSymbols: [
				[],
				[{ name: 'H2' }, { name: 'L2' }, { name: 'L3' }],
				[{ name: 'L3' }, { name: 'H3' }, { name: 'L2' }],
				[{ name: 'H3' }],
				[], [], [],
			],
		},
		// 6 — win 2: H2 cluster (reel5 rows2-6 + reel6 rows2-4; 8 cells)
		{
			index: 6,
			type: 'winInfo' as const,
			totalWin: 460,
			wins: [
				{
					symbol: 'H2' as const,
					clusterSize: 8,
					win: 400,
					positions: [
						{ reel: 5, row: 2 }, { reel: 5, row: 3 }, { reel: 5, row: 4 },
						{ reel: 5, row: 5 }, { reel: 5, row: 6 },
						{ reel: 6, row: 2 }, { reel: 6, row: 3 }, { reel: 6, row: 4 },
					],
					meta: { globalMult: 1, clusterMult: 1, winWithoutMult: 4.0, overlay: { reel: 5, row: 4 } },
				},
			],
		},
		// 7
		{ index: 7, type: 'updateTumbleWin' as const, amount: 460 },
		// 8 — grid after win 2
		{ index: 8, type: 'updateGrid' as const, gridMultipliers: grid2 },
		// 9 — bar: 7+8=15
		{ index: 9, type: 'kronosBar' as const, progress: 15, filled: false },
		// 10 — tumble: remove win 2 cells
		{
			index: 10,
			type: 'tumbleBoard' as const,
			explodingSymbols: [
				{ reel: 5, row: 2 }, { reel: 5, row: 3 }, { reel: 5, row: 4 },
				{ reel: 5, row: 5 }, { reel: 5, row: 6 },
				{ reel: 6, row: 2 }, { reel: 6, row: 3 }, { reel: 6, row: 4 },
			],
			newSymbols: [
				[], [], [], [], [],
				[{ name: 'L1' }, { name: 'L3' }, { name: 'H3' }, { name: 'L2' }, { name: 'H3' }],
				[{ name: 'L2' }, { name: 'H1' }, { name: 'L3' }],
			],
		},
		// 11 — win 3: L1 cluster (reels 3-4, rows 3-5; 6 cells)
		{
			index: 11,
			type: 'winInfo' as const,
			totalWin: 550,
			wins: [
				{
					symbol: 'L1' as const,
					clusterSize: 6,
					win: 90,
					positions: [
						{ reel: 3, row: 3 }, { reel: 3, row: 4 }, { reel: 3, row: 5 },
						{ reel: 4, row: 3 }, { reel: 4, row: 4 }, { reel: 4, row: 5 },
					],
					meta: { globalMult: 1, clusterMult: 1, winWithoutMult: 0.9, overlay: { reel: 3, row: 4 } },
				},
			],
		},
		// 12
		{ index: 12, type: 'updateTumbleWin' as const, amount: 550 },
		// 13 — grid after win 3 (bar was 15+6=21 → triggers at 20 → will emit filled)
		{ index: 13, type: 'updateGrid' as const, gridMultipliers: grid3 },
		// 14 — bar fills (progress capped at 20)
		{ index: 14, type: 'kronosBar' as const, progress: 20, filled: true },
		// 15 — Kronos strike: 4 hits
		{
			index: 15,
			type: 'kronosStrike' as const,
			hits: [
				{ reel: 1, row: 2 },
				{ reel: 3, row: 2 },
				{ reel: 4, row: 2 },
				{ reel: 6, row: 1 },
			],
		},
		// 16 — grid after strike (hit cells doubled / set to 2×)
		{ index: 16, type: 'updateGrid' as const, gridMultipliers: grid4PostStrike },
		// 17 — bar reset to 0
		{ index: 17, type: 'kronosBar' as const, progress: 0, filled: false },
		// 18 — tumble: remove win 3 cells (no further wins — board settles)
		{
			index: 18,
			type: 'tumbleBoard' as const,
			explodingSymbols: [
				{ reel: 3, row: 3 }, { reel: 3, row: 4 }, { reel: 3, row: 5 },
				{ reel: 4, row: 3 }, { reel: 4, row: 4 }, { reel: 4, row: 5 },
			],
			newSymbols: [
				[], [], [],
				[{ name: 'H3' }, { name: 'L2' }, { name: 'L3' }],
				[{ name: 'L2' }, { name: 'H3' }, { name: 'L1' }],
				[], [],
			],
		},
		// 19
		{ index: 19, type: 'setTotalWin' as const, amount: 550 },
		// 20 — finalWin: clears grid + bar
		{ index: 20, type: 'finalWin' as const, amount: 550 },
		// 21 — FS trigger: 3 scatters at reel0 rows 3, 5, 7 (S cells in baseBoard, survive all tumbles)
		{
			index: 21,
			type: 'freeSpinTrigger' as const,
			totalFs: 2,
			positions: [
				{ reel: 0, row: 3 },
				{ reel: 0, row: 5 },
				{ reel: 0, row: 7 },
			],
		},

		// ── FREE SPINS — 2 spins total ─────────────────────────────────────────
		// 22 — counter: about to play spin 1 of 2
		{ index: 22, type: 'updateFreeSpin' as const, amount: 1, total: 2 },
		// 23 — reveal: FS spin 1
		{
			index: 23,
			type: 'reveal' as const,
			board: fsBoardSpin1,
			paddingPositions: [0, 0, 0, 0, 0, 0, 0],
			anticipation: [0, 0, 0, 0, 0, 0, 0],
			gameType: 'freegame' as const,
		},
		// 24 — FS win 1: H2 cluster (reel3 rows2-5, reel4 rows2-4; 7 cells)
		{
			index: 24,
			type: 'winInfo' as const,
			totalWin: 200,
			wins: [
				{
					symbol: 'H2' as const,
					clusterSize: 7,
					win: 200,
					positions: [
						{ reel: 3, row: 2 }, { reel: 3, row: 3 }, { reel: 3, row: 4 }, { reel: 3, row: 5 },
						{ reel: 4, row: 2 }, { reel: 4, row: 3 }, { reel: 4, row: 4 },
					],
					meta: { globalMult: 1, clusterMult: 1, winWithoutMult: 2.0, overlay: { reel: 3, row: 3 } },
				},
			],
		},
		// 25
		{ index: 25, type: 'updateTumbleWin' as const, amount: 200 },
		// 26 — FS grid (persists for the entire bonus)
		{ index: 26, type: 'updateGrid' as const, gridMultipliers: gridFs1 },
		// 27 — bar: 7 cells
		{ index: 27, type: 'kronosBar' as const, progress: 7, filled: false },
		// 28 — tumble (no further wins in FS spin 1)
		{
			index: 28,
			type: 'tumbleBoard' as const,
			explodingSymbols: [
				{ reel: 3, row: 2 }, { reel: 3, row: 3 }, { reel: 3, row: 4 }, { reel: 3, row: 5 },
				{ reel: 4, row: 2 }, { reel: 4, row: 3 }, { reel: 4, row: 4 },
			],
			newSymbols: [
				[], [], [],
				[{ name: 'L3' }, { name: 'L2' }, { name: 'H3' }, { name: 'L1' }],
				[{ name: 'H3' }, { name: 'L3' }, { name: 'L2' }],
				[], [],
			],
		},
		// 29
		{ index: 29, type: 'setTotalWin' as const, amount: 200 },
		// 30 — counter: about to play spin 2 of 2
		{ index: 30, type: 'updateFreeSpin' as const, amount: 2, total: 2 },
		// 31 — reveal: FS spin 2 (grid overlays from spin 1 persist)
		{
			index: 31,
			type: 'reveal' as const,
			board: fsBoardSpin2,
			paddingPositions: [0, 0, 0, 0, 0, 0, 0],
			anticipation: [0, 0, 0, 0, 0, 0, 0],
			gameType: 'freegame' as const,
		},
		// 32 — FS win 2: H2 cluster (reel2 rows3-5, reel3 rows3-5; 6 cells)
		// reel3 rows3-5 overlap with gridFs1 stamps → those cells were 2× → get doubled to 4×
		{
			index: 32,
			type: 'winInfo' as const,
			totalWin: 440,
			wins: [
				{
					symbol: 'H2' as const,
					clusterSize: 6,
					win: 240,
					positions: [
						{ reel: 2, row: 3 }, { reel: 2, row: 4 }, { reel: 2, row: 5 },
						{ reel: 3, row: 3 }, { reel: 3, row: 4 }, { reel: 3, row: 5 },
					],
					meta: { globalMult: 1, clusterMult: 6, winWithoutMult: 5.0, overlay: { reel: 3, row: 4 } },
				},
			],
		},
		// 33
		{ index: 33, type: 'updateTumbleWin' as const, amount: 240 },
		// 34 — grid after FS2 win: prior 2× on reel3 vrows2-4 doubled to 4×; reel2 new 2×
		{ index: 34, type: 'updateGrid' as const, gridMultipliers: gridFs2 },
		// 35 — bar: 7 (FS1) + 6 (FS2 win) = 13
		{ index: 35, type: 'kronosBar' as const, progress: 13, filled: false },
		// 36 — tumble: remove FS2 win cells (no further wins)
		{
			index: 36,
			type: 'tumbleBoard' as const,
			explodingSymbols: [
				{ reel: 2, row: 3 }, { reel: 2, row: 4 }, { reel: 2, row: 5 },
				{ reel: 3, row: 3 }, { reel: 3, row: 4 }, { reel: 3, row: 5 },
			],
			newSymbols: [
				[], [],
				[{ name: 'L1' }, { name: 'H1' }, { name: 'L3' }],
				[{ name: 'L3' }, { name: 'L1' }, { name: 'L2' }],
				[], [], [],
			],
		},
		// 37
		{ index: 37, type: 'setTotalWin' as const, amount: 440 },
		// 38 — FS outro (2 spins played)
		{ index: 38, type: 'freeSpinEnd' as const, amount: 440, winLevel: 1 },
	],
};
