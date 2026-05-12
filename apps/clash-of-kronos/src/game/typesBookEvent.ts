import type { BetType } from 'rgs-requests';

import type { SymbolName, RawSymbol, GameType, Position } from './types';

// book events shared with scatter game
type BookEventReveal = {
	index: number;
	type: 'reveal';
	board: RawSymbol[][];
	paddingPositions: number[];
	anticipation: number[];
	gameType: GameType;
};

type BookEventSetTotalWin = {
	index: number;
	type: 'setTotalWin';
	amount: number;
};

type BookEventFinalWin = {
	index: number;
	type: 'finalWin';
	amount: number;
};

type BookEventFreeSpinTrigger = {
	index: number;
	type: 'freeSpinTrigger';
	totalFs: number;
	positions: Position[];
};

type BookEventUpdateFreeSpin = {
	index: number;
	type: 'updateFreeSpin';
	amount: number;
	total: number;
};

type BookEventFreeSpinRetrigger = {
	index: number;
	type: 'freeSpinRetrigger';
	totalFs: number;
	positions: Position[];
};

type BookEventSetWin = {
	index: number;
	type: 'setWin';
	amount: number;
	winLevel: number;
};

type BookEventFreeSpinEnd = {
	index: number;
	type: 'freeSpinEnd';
	amount: number;
	winLevel: number;
};

type BookEventWinInfo = {
	index: number;
	type: 'winInfo';
	totalWin: number;
	wins: {
		symbol: SymbolName;
		kind: number;
		win: number;
		positions: Position[];
		chestWins?: {
			position: Position;
			amount: number;
		}[];
		powerUps?: Extract<
			SymbolName,
			'WILD_LIGHTNING' | 'WILD_SURGE' | 'WILD_HAMMER' | 'WILD_EAGLE'
		>[];
		meta: {
			lineIndex: number;
			multiplier: number;
			winWithoutMult: number;
			globalMult: number;
			lineMultiplier: number;
			trackerStage?: number;
			trackerMultiplier?: number;
		};
	}[];
};

type BookEventCascadeTrackerUpdate = {
	index: number;
	type: 'cascadeTrackerUpdate';
	stage: number;
	multiplier: number;
	gameType: GameType;
	chestsActive: boolean;
};

type BookEventChestUnlock = {
	index: number;
	type: 'chestUnlock';
	positions: Position[];
};

type BookEventChestValuesUpdate = {
	index: number;
	type: 'chestValuesUpdate';
	updates: {
		position: Position;
		value: number;
		active: boolean;
	}[];
};

type BookEventTumbleBoard = {
	index: number;
	type: 'tumbleBoard';
	explodingSymbols: Position[];
	newSymbols: RawSymbol[][];
};

type BookEventLightningStrike = {
	index: number;
	type: 'lightningStrike';
	strikes: {
		position: Position;
		toSymbol: RawSymbol;
	}[];
};

type BookEventSurgeChests = {
	index: number;
	type: 'surgeChests';
	updates: {
		position: Position;
		from: number;
		to: number;
	}[];
};

type BookEventHammerCollect = {
	index: number;
	type: 'hammerCollect';
	position?: Position;
};

type BookEventHammerSmash = {
	index: number;
	type: 'hammerSmash';
	clearedPositions: Position[];
	newSymbols: RawSymbol[][];
	resultBoard: RawSymbol[][];
	trackerStage: number;
	trackerMultiplier: number;
};

type BookEventUpdateTumbleWin = {
	index: number;
	type: 'updateTumbleWin';
	amount: number;
};

// customised
type BookEventCreateBonusSnapshot = {
	index: number;
	type: 'createBonusSnapshot';
	bookEvents: BookEvent[];
};

export type BookEvent =
	| BookEventReveal
	| BookEventWinInfo
	| BookEventCascadeTrackerUpdate
	| BookEventChestUnlock
	| BookEventChestValuesUpdate
	| BookEventTumbleBoard
	| BookEventLightningStrike
	| BookEventSurgeChests
	| BookEventHammerCollect
	| BookEventHammerSmash
	| BookEventUpdateTumbleWin
	| BookEventSetTotalWin
	| BookEventFreeSpinTrigger
	| BookEventFreeSpinRetrigger
	| BookEventUpdateFreeSpin
	| BookEventCreateBonusSnapshot
	| BookEventFinalWin
	| BookEventSetWin
	| BookEventFreeSpinEnd;

export type Bet = BetType<BookEvent>;
export type BookEventOfType<T> = Extract<BookEvent, { type: T }>;
export type BookEventContext = { bookEvents: BookEvent[] };
