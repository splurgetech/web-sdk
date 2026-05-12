<script lang="ts" module>
	import type { GameType } from '../game/types';

	export type EmitterEventCascadeTracker =
		| {
				type: 'cascadeTrackerUpdate';
				stage: number;
				multiplier: number;
				gameType: GameType;
				chestsActive: boolean;
		  }
		| { type: 'cascadeTrackerReset' };
</script>

<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { waitForTimeout } from 'utils-shared/wait';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { CASCADE_TRACKER_STAGE_TEXT, SYMBOL_SIZE } from '../game/constants';
	import type { GameType } from '../game/types';

	const context = getContext();

	const stageText = (stage: number, gameType: GameType) => {
		return CASCADE_TRACKER_STAGE_TEXT[gameType][stage - 1] ?? '-';
	};

	let pulseStage = $state(0);

	context.eventEmitter.subscribeOnMount({
		cascadeTrackerUpdate: async ({ stage, multiplier, chestsActive }) => {
			context.stateGame.cascadeStage = stage;
			context.stateGame.cascadeMultiplier = multiplier;
			context.stateGame.chestsActive = chestsActive;
			pulseStage = stage;
			await waitForTimeout(280);
			pulseStage = 0;
		},
		cascadeTrackerReset: () => {
			context.stateGame.cascadeStage = 0;
			context.stateGame.cascadeMultiplier = 1;
			context.stateGame.chestsActive = false;
			context.stateGame.hammerHeld = false;
		},
	});
</script>

<BoardContainer>
	<Container x={SYMBOL_SIZE * 0.08} y={-SYMBOL_SIZE * 0.5}>
		{#each [1, 2, 3, 4, 5, 6, 7] as stage}
			{@const active = context.stateGame.cascadeStage >= stage}
			{@const pulse = pulseStage === stage}
			<Container x={(stage - 1) * SYMBOL_SIZE * 0.67}>
				<Graphics
					draw={(graphics) => {
						graphics.roundRect(0, 0, SYMBOL_SIZE * 0.58, SYMBOL_SIZE * 0.34, 6);
						graphics.fill({
							color: active ? 0xb98526 : 0x20222a,
							alpha: active ? 0.95 : 0.78,
						});
						graphics.stroke({
							width: pulse ? 4 : 2,
							color: active ? 0xffe08a : 0x6b7280,
							alpha: 1,
						});
					}}
				/>
				<Text
					x={SYMBOL_SIZE * 0.29}
					y={SYMBOL_SIZE * 0.11}
					anchor={0.5}
					text={`${stage}`}
					style={{
						fontFamily: 'Arial',
						fontSize: 16,
						fontWeight: '700',
						fill: 0xffffff,
					}}
				/>
				<Text
					x={SYMBOL_SIZE * 0.29}
					y={SYMBOL_SIZE * 0.25}
					anchor={0.5}
					text={stageText(stage, context.stateGame.gameType)}
					style={{
						fontFamily: 'Arial',
						fontSize: 11,
						fontWeight: '700',
						fill: active ? 0xfff4bf : 0xd1d5db,
					}}
				/>
			</Container>
		{/each}
	</Container>
</BoardContainer>
