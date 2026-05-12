<script lang="ts" module>
	import type { RawSymbol, Position } from '../game/types';

	type AddingBoard = RawSymbol[][];
	type ExplodingPositions = Position[];

	export type EmitterEventTumbleBoard =
		| { type: 'tumbleBoardShow' }
		| { type: 'tumbleBoardHide' }
		| { type: 'tumbleBoardInit'; addingBoard: AddingBoard }
		| { type: 'tumbleBoardReset' }
		| { type: 'tumbleBoardExplode'; explodingPositions: ExplodingPositions }
		| { type: 'tumbleBoardRemoveExploded' }
		| { type: 'tumbleBoardSlideDown' };
</script>

<script lang="ts">
	import _ from 'lodash';
	import { Tween } from 'svelte/motion';
	import { backOut } from 'svelte/easing';

	import { BoardContext } from 'components-shared';
	import { waitForResolve, waitForTimeout } from 'utils-shared/wait';

	import TumbleBoardBase from './TumbleBoardBase.svelte';
	import BoardContainer from './BoardContainer.svelte';
	import BoardMask from './BoardMask.svelte';
	import { getSymbolY } from '../game/utils';
	import { getContext } from '../game/context';

	const context = getContext();

	let show = $state(false);

	const waitForTumbleSymbolAnimation = async (target: { oncomplete: () => void }) => {
		let resolved = false;

		await Promise.race([
			waitForResolve((resolve) => {
				target.oncomplete = () => {
					resolved = true;
					resolve();
				};
			}),
			waitForTimeout(900),
		]);
		if (!resolved) target.oncomplete = () => {};
	};

	const createTumbleSymbol = ({ initY, rawSymbol }: { initY: number; rawSymbol: RawSymbol }) => {
		const symbolY = new Tween(initY);
		const oncomplete = () => {};

		const tumbleSymbol = $state({
			symbolY,
			rawSymbol,
			symbolState: 'static' as const,
			oncomplete,
		});

		return tumbleSymbol;
	};

	const initTumbleBoardAdding = ({ addingBoard }: { addingBoard: AddingBoard }) =>
		context.stateGameDerived.boardRaw().map((_, reelIndex) => {
			const addingReel = addingBoard[reelIndex] ?? [];

			return addingReel.map((rawSymbol, symbolIndex) => {
				const initY = getSymbolY(symbolIndex - 1 - addingReel.length);
				return createTumbleSymbol({ initY, rawSymbol });
			});
		});

	const initTumbleBoardBase = () =>
		context.stateGameDerived.boardRaw().map((rawSymbolReel) =>
			rawSymbolReel.map((rawSymbol, symbolIndex) => {
				const initY = getSymbolY(symbolIndex - 1);
				return createTumbleSymbol({ initY, rawSymbol });
			}),
		);

	context.eventEmitter.subscribeOnMount({
		tumbleBoardShow: () => (show = true),
		tumbleBoardHide: () => (show = false),
		tumbleBoardInit: ({ addingBoard }) => {
			context.stateGame.tumbleBoardAdding = initTumbleBoardAdding({ addingBoard });
			context.stateGame.tumbleBoardBase = initTumbleBoardBase();
		},
		tumbleBoardReset: () => {
			context.stateGame.tumbleBoardAdding = [];
			context.stateGame.tumbleBoardBase = [];
		},
		tumbleBoardExplode: async ({ explodingPositions }) => {
			const promises = explodingPositions.map(async (position) => {
				const tumbleSymbol = context.stateGame.tumbleBoardBase[position.reel]?.[position.row];
				if (!tumbleSymbol) return;
				tumbleSymbol.symbolState = 'explosion';
				await waitForTumbleSymbolAnimation(tumbleSymbol);
			});

			await Promise.all(promises);
		},
		tumbleBoardRemoveExploded: () => {
			context.stateGame.tumbleBoardBase.forEach((tumbleReel, reelIndex) => {
				context.stateGame.tumbleBoardBase[reelIndex] = tumbleReel.filter(
					(tumbleSymbol) => tumbleSymbol.symbolState !== 'explosion',
				);
			});
		},
		tumbleBoardSlideDown: async () => {
			const promises = _.flatten(
				context.stateGameDerived.tumbleBoardCombined().map((tumbleReel) =>
					tumbleReel.map(async (tumbleSymbol, symbolIndex) => {
						const targetY = getSymbolY(symbolIndex - 1);
						if (targetY === tumbleSymbol.symbolY.current) return;

						await tumbleSymbol.symbolY.set(targetY, {
							duration: 220,
							easing: backOut,
						});

						if (symbolIndex > 0 && symbolIndex < tumbleReel.length - 1) {
							tumbleSymbol.symbolState = 'land';
							context.stateGameDerived.onSymbolLand({ rawSymbol: tumbleSymbol.rawSymbol });
							await waitForTumbleSymbolAnimation(tumbleSymbol);
							tumbleSymbol.symbolState = 'static';
						}
					}),
				),
			);

			await Promise.all(promises);
		},
	});
</script>

{#if show}
	<BoardContext animate={false}>
		<BoardContainer>
			<BoardMask />
			<TumbleBoardBase />
		</BoardContainer>
	</BoardContext>

	<BoardContext animate={true}>
		<BoardContainer>
			<TumbleBoardBase />
		</BoardContainer>
	</BoardContext>
{/if}
