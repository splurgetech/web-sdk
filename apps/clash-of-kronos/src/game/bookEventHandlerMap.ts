import _ from 'lodash';

import { recordBookEvent, checkIsMultipleRevealEvents, type BookEventHandlerMap } from 'utils-book';
import { stateBet, stateUi } from 'state-shared';
import { sequence } from 'utils-shared/sequence';
import { waitForTimeout } from 'utils-shared/wait';

import { eventEmitter } from './eventEmitter';
import { playBookEvent } from './utils';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import type { BookEvent, BookEventOfType, BookEventContext } from './typesBookEvent';
import type { Position, RawSymbol } from './types';
import { getCascadeTrackerChestsActive, getCascadeTrackerMultiplier } from './constants';
import config from './config';

const winLevelSoundsPlay = ({ winLevelData }: { winLevelData: WinLevelData }) => {
	if (winLevelData?.alias === 'max') eventEmitter.broadcastAsync({ type: 'uiHide' });
	if (winLevelData?.sound?.sfx) {
		eventEmitter.broadcast({ type: 'soundOnce', name: winLevelData.sound.sfx });
	}
	if (winLevelData?.sound?.bgm) {
		eventEmitter.broadcast({ type: 'soundMusic', name: winLevelData.sound.bgm });
	}
	if (winLevelData?.type === 'big') {
		eventEmitter.broadcast({ type: 'soundLoop', name: 'sfx_bigwin_coinloop' });
	}
};

const winLevelSoundsStop = () => {
	eventEmitter.broadcast({ type: 'soundStop', name: 'sfx_bigwin_coinloop' });
	if (stateBet.activeBetModeKey === 'SUPERSPIN' || stateGame.gameType === 'freegame') {
		// check if SUPERSPIN, when finishing a bet.
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
	} else {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
	}
	eventEmitter.broadcastAsync({ type: 'uiShow' });
};

const animateSymbols = async ({ positions }: { positions: Position[] }) => {
	eventEmitter.broadcast({ type: 'boardShow' });
	await eventEmitter.broadcastAsync({
		type: 'boardWithAnimateSymbols',
		symbolPositions: positions,
	});
};

const updateBoardPositions = (
	updates: {
		position: Position;
		rawSymbol: BookEventOfType<'lightningStrike'>['strikes'][number]['toSymbol'];
	}[],
) => {
	eventEmitter.broadcast({
		type: 'boardUpdateSymbols',
		updates,
	});
};

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
		eventEmitter.broadcast({ type: 'cascadeTrackerReset' });
		eventEmitter.broadcast({ type: 'powerUpClear' });
		const isBonusGame = checkIsMultipleRevealEvents({ bookEvents });
		if (isBonusGame) {
			eventEmitter.broadcast({ type: 'stopButtonEnable' });
			recordBookEvent({ bookEvent });
		}

		stateGame.gameType = bookEvent.gameType;
		await stateGameDerived.enhancedBoard.spin({
			revealEvent: bookEvent,
			paddingBoard: config.paddingReels[bookEvent.gameType] as RawSymbol[][],
		});
		eventEmitter.broadcast({ type: 'soundScatterCounterClear' });
	},
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_winlevel_small' });
		await sequence(bookEvent.wins, async (win) => {
			await animateSymbols({ positions: win.positions });
		});
	},
	cascadeTrackerUpdate: async (bookEvent: BookEventOfType<'cascadeTrackerUpdate'>) => {
		stateGame.gameType = bookEvent.gameType;
		const multiplier = getCascadeTrackerMultiplier({
			gameType: bookEvent.gameType,
			stage: bookEvent.stage,
		});
		const chestsActive = getCascadeTrackerChestsActive({
			gameType: bookEvent.gameType,
			stage: bookEvent.stage,
		});
		await eventEmitter.broadcastAsync({
			type: 'cascadeTrackerUpdate',
			stage: bookEvent.stage,
			multiplier,
			gameType: bookEvent.gameType,
			chestsActive,
		});
	},
	chestUnlock: async (bookEvent: BookEventOfType<'chestUnlock'>) => {
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_update' });
		await eventEmitter.broadcastAsync({
			type: 'powerUpPositions',
			positions: bookEvent.positions,
		});
		await eventEmitter.broadcastAsync({
			type: 'powerUpMessage',
			message: 'CHESTS UNLOCK',
			duration: 500,
		});
	},
	chestValuesUpdate: async (bookEvent: BookEventOfType<'chestValuesUpdate'>) => {
		const board = stateGameDerived.boardRaw();
		const updates = bookEvent.updates
			.map(({ position, value, active }) => {
				const current = board[position.reel]?.[position.row];
				if (!current) return undefined;
				return {
					position,
					rawSymbol: {
						...current,
						chestValue: value,
						chestActive: active,
					},
				};
			})
			.filter((update) => update !== undefined);

		eventEmitter.broadcast({ type: 'boardUpdateSymbols', updates });
		await waitForTimeout(150);
	},
	tumbleBoard: async (bookEvent: BookEventOfType<'tumbleBoard'>) => {
		eventEmitter.broadcast({ type: 'boardHide' });
		eventEmitter.broadcast({ type: 'tumbleBoardShow' });
		eventEmitter.broadcast({ type: 'tumbleBoardInit', addingBoard: bookEvent.newSymbols });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_explosion_b' });
		await eventEmitter.broadcastAsync({
			type: 'tumbleBoardExplode',
			explodingPositions: bookEvent.explodingSymbols,
		});
		eventEmitter.broadcast({ type: 'tumbleBoardRemoveExploded' });
		await eventEmitter.broadcastAsync({ type: 'tumbleBoardSlideDown' });
		eventEmitter.broadcast({
			type: 'boardSettle',
			board: stateGameDerived
				.tumbleBoardCombined()
				.map((tumbleReel) => tumbleReel.map((tumbleSymbol) => tumbleSymbol.rawSymbol)),
		});
		eventEmitter.broadcast({ type: 'tumbleBoardReset' });
		eventEmitter.broadcast({ type: 'tumbleBoardHide' });
		eventEmitter.broadcast({ type: 'boardShow' });
	},
	lightningStrike: async (bookEvent: BookEventOfType<'lightningStrike'>) => {
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_update' });
		await eventEmitter.broadcastAsync({
			type: 'powerUpMessage',
			message: 'LIGHTNING WILDS',
			duration: 450,
		});
		await eventEmitter.broadcastAsync({
			type: 'powerUpPositions',
			positions: bookEvent.strikes.map((strike) => strike.position),
		});
		updateBoardPositions(
			bookEvent.strikes.map((strike) => ({
				position: strike.position,
				rawSymbol: strike.toSymbol,
			})),
		);
	},
	surgeChests: async (bookEvent: BookEventOfType<'surgeChests'>) => {
		const board = stateGameDerived.boardRaw();
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_update' });
		await eventEmitter.broadcastAsync({
			type: 'powerUpMessage',
			message: 'CHEST SURGE',
			duration: 450,
		});
		eventEmitter.broadcast({
			type: 'boardUpdateSymbols',
			updates: bookEvent.updates
				.map(({ position, to }) => {
					const current = board[position.reel]?.[position.row];
					if (!current) return undefined;
					return {
						position,
						rawSymbol: {
							...current,
							chestValue: to,
							chestActive: true,
						},
					};
				})
				.filter((update) => update !== undefined),
		});
		await eventEmitter.broadcastAsync({
			type: 'powerUpPositions',
			positions: bookEvent.updates.map((update) => update.position),
		});
	},
	hammerCollect: async () => {
		eventEmitter.broadcast({ type: 'hammerHeld', held: true });
		await eventEmitter.broadcastAsync({
			type: 'powerUpMessage',
			message: 'HAMMER HELD',
			duration: 450,
		});
	},
	hammerSmash: async (bookEvent: BookEventOfType<'hammerSmash'>) => {
		eventEmitter.broadcast({ type: 'hammerHeld', held: false });
		await eventEmitter.broadcastAsync({
			type: 'powerUpMessage',
			message: 'HAMMER SMASH',
			duration: 500,
		});
		await eventEmitter.broadcastAsync({
			type: 'powerUpPositions',
			positions: bookEvent.clearedPositions,
		});
		eventEmitter.broadcast({
			type: 'boardSettle',
			board: bookEvent.resultBoard,
		});
		const chestsActive = getCascadeTrackerChestsActive({
			gameType: stateGame.gameType,
			stage: bookEvent.trackerStage,
		});
		await eventEmitter.broadcastAsync({
			type: 'cascadeTrackerUpdate',
			stage: bookEvent.trackerStage,
			multiplier: getCascadeTrackerMultiplier({
				gameType: stateGame.gameType,
				stage: bookEvent.trackerStage,
			}),
			gameType: stateGame.gameType,
			chestsActive,
		});
	},
	updateTumbleWin: async (bookEvent: BookEventOfType<'updateTumbleWin'>) => {
		stateBet.winBookEventAmount = bookEvent.amount;
	},
	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
		stateBet.winBookEventAmount = bookEvent.amount;
	},
	freeSpinTrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
		// animate scatters
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
		await animateSymbols({ positions: bookEvent.positions });
		// show free spin intro
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_superfreespin' });
		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'jng_intro_fs' });
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinIntroUpdate',
			totalFreeSpins: bookEvent.totalFs,
		});
		stateGame.gameType = 'freegame';
		eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
		eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		stateUi.freeSpinCounterShow = true;
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: undefined,
			total: bookEvent.totalFs,
		});
		stateUi.freeSpinCounterTotal = bookEvent.totalFs;
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerButtonShow' });
		eventEmitter.broadcast({ type: 'drawerFold' });
	},
	freeSpinRetrigger: async (bookEvent: BookEventOfType<'freeSpinRetrigger'>) => {
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
		await animateSymbols({ positions: bookEvent.positions });
		await eventEmitter.broadcastAsync({
			type: 'powerUpMessage',
			message: `+${bookEvent.totalFs} FREE SPINS`,
			duration: 700,
		});
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: stateUi.freeSpinCounterCurrent,
			total: stateUi.freeSpinCounterTotal + bookEvent.totalFs,
		});
		stateUi.freeSpinCounterTotal += bookEvent.totalFs;
	},
	updateFreeSpin: async (bookEvent: BookEventOfType<'updateFreeSpin'>) => {
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		stateUi.freeSpinCounterShow = true;
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: bookEvent.amount + 1,
			total: bookEvent.total,
		});
		stateUi.freeSpinCounterCurrent = bookEvent.amount + 1;
		stateUi.freeSpinCounterTotal = bookEvent.total;
	},
	freeSpinEnd: async (bookEvent: BookEventOfType<'freeSpinEnd'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		stateGame.gameType = 'basegame';
		eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
		eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_youwon_panel' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinOutroCountUp',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
		eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
		stateUi.freeSpinCounterShow = false;
		await eventEmitter.broadcastAsync({ type: 'transition' });
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerUnfold' });
		eventEmitter.broadcast({ type: 'drawerButtonHide' });
	},
	setWin: async (bookEvent: BookEventOfType<'setWin'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		eventEmitter.broadcast({ type: 'winShow' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'winUpdate',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'winHide' });
	},
	finalWin: async () => {
		// Do nothing
	},
	// customised
	createBonusSnapshot: async (bookEvent: BookEventOfType<'createBonusSnapshot'>) => {
		const { bookEvents } = bookEvent;

		function findLastBookEvent<T>(type: T) {
			return _.findLast(bookEvents, (bookEvent) => bookEvent.type === type) as
				| BookEventOfType<T>
				| undefined;
		}

		const lastFreeSpinTriggerEvent = findLastBookEvent('freeSpinTrigger' as const);
		const lastUpdateFreeSpinEvent = findLastBookEvent('updateFreeSpin' as const);
		const lastSetTotalWinEvent = findLastBookEvent('setTotalWin' as const);
		const lastCascadeTrackerUpdateEvent = findLastBookEvent('cascadeTrackerUpdate' as const);

		if (lastFreeSpinTriggerEvent) await playBookEvent(lastFreeSpinTriggerEvent, { bookEvents });
		if (lastUpdateFreeSpinEvent) playBookEvent(lastUpdateFreeSpinEvent, { bookEvents });
		if (lastCascadeTrackerUpdateEvent) playBookEvent(lastCascadeTrackerUpdateEvent, { bookEvents });
		if (lastSetTotalWinEvent) playBookEvent(lastSetTotalWinEvent, { bookEvents });
	},
};
