<script lang="ts" module>
	import type { Position } from '../game/types';

	export type EmitterEventPowerUpOverlay =
		| { type: 'powerUpMessage'; message: string; duration?: number }
		| { type: 'powerUpClear' }
		| { type: 'hammerHeld'; held: boolean }
		| { type: 'powerUpPositions'; positions: Position[] };
</script>

<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { waitForTimeout } from 'utils-shared/wait';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import { getSymbolX, getSymbolY } from '../game/utils';
	import type { Position } from '../game/types';

	const context = getContext();
	let positions = $state<Position[]>([]);

	context.eventEmitter.subscribeOnMount({
		powerUpMessage: async ({ message, duration = 650 }) => {
			context.stateGame.powerUpMessage = message;
			await waitForTimeout(duration);
			context.stateGame.powerUpMessage = '';
		},
		powerUpClear: () => {
			context.stateGame.powerUpMessage = '';
			positions = [];
		},
		hammerHeld: ({ held }) => {
			context.stateGame.hammerHeld = held;
		},
		powerUpPositions: async ({ positions: nextPositions }) => {
			positions = nextPositions;
			await waitForTimeout(500);
			positions = [];
		},
	});
</script>

<BoardContainer>
	{#each positions as position}
		<Graphics
			draw={(graphics) => {
				graphics.circle(getSymbolX(position.reel), getSymbolY(position.row), SYMBOL_SIZE * 0.43);
				graphics.fill({ color: 0x8ecae6, alpha: 0.2 });
				graphics.stroke({ width: 5, color: 0xfff3b0, alpha: 1 });
			}}
		/>
	{/each}

	{#if context.stateGame.powerUpMessage}
		<Container x={SYMBOL_SIZE * 2.82} y={SYMBOL_SIZE * 1.5}>
			<Graphics
				draw={(graphics) => {
					graphics.roundRect(-160, -30, 320, 60, 8);
					graphics.fill({ color: 0x111827, alpha: 0.82 });
					graphics.stroke({ width: 2, color: 0xffd166, alpha: 1 });
				}}
			/>
			<Text
				anchor={0.5}
				text={context.stateGame.powerUpMessage}
				style={{
					fontFamily: 'Arial',
					fontSize: 22,
					fontWeight: '800',
					fill: 0xfff4bf,
				}}
			/>
		</Container>
	{/if}

	{#if context.stateGame.hammerHeld}
		<Container x={SYMBOL_SIZE * 4.7} y={-SYMBOL_SIZE * 0.5}>
			<Graphics
				draw={(graphics) => {
					graphics.roundRect(0, 0, SYMBOL_SIZE * 0.75, SYMBOL_SIZE * 0.34, 6);
					graphics.fill({ color: 0x5f3a10, alpha: 0.9 });
					graphics.stroke({ width: 2, color: 0xffd166, alpha: 1 });
				}}
			/>
			<Text
				x={SYMBOL_SIZE * 0.375}
				y={SYMBOL_SIZE * 0.17}
				anchor={0.5}
				text="HAMMER"
				style={{
					fontFamily: 'Arial',
					fontSize: 14,
					fontWeight: '800',
					fill: 0xfff4bf,
				}}
			/>
		</Container>
	{/if}
</BoardContainer>
