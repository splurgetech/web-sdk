<script lang="ts" module>
	export type EmitterEventKronosBar =
		| { type: 'kronosBarShow' }
		| { type: 'kronosBarHide' }
		| { type: 'kronosBarUpdate'; progress: number; filled: boolean };
</script>

<script lang="ts">
	import * as PIXI from 'pixi.js';
	import { Graphics } from 'pixi-svelte';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, BOARD_DIMENSIONS } from '../game/constants';

	const context = getContext();

	const BAR_WIDTH = SYMBOL_SIZE * BOARD_DIMENSIONS.x * 0.8;
	const BAR_HEIGHT = SYMBOL_SIZE * 0.35;
	const BAR_X = SYMBOL_SIZE * BOARD_DIMENSIONS.x * 0.1;
	const BAR_Y = -SYMBOL_SIZE * 0.6;
	const MAX_PROGRESS = 20;

	let show = $state(false);
	let progress = $state(0);
	let filled = $state(false);

	context.eventEmitter.subscribeOnMount({
		kronosBarShow: () => (show = true),
		kronosBarHide: () => {
			show = false;
			progress = 0;
			filled = false;
		},
		kronosBarUpdate: (e) => {
			progress = e.progress;
			filled = e.filled;
		},
	});

	let drawFn = $derived((g: PIXI.Graphics) => {
		g.rect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT).fill({ color: 0x222244, alpha: 0.8 });
		const fillWidth = (progress / MAX_PROGRESS) * BAR_WIDTH;
		if (fillWidth > 0) {
			g.rect(BAR_X, BAR_Y, fillWidth, BAR_HEIGHT).fill({ color: filled ? 0xffdd00 : 0x44aaff, alpha: 0.9 });
		}
		g.rect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT).stroke({ color: 0xaaaacc, width: 2 });
	});
</script>

<BoardContainer>
	{#if show}
		<Graphics draw={drawFn} />
	{/if}
</BoardContainer>
