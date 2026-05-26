<script lang="ts" module>
	export type EmitterEventKronosBar =
		| { type: 'kronosBarShow' }
		| { type: 'kronosBarHide' }
		| { type: 'kronosBarUpdate'; progress: number; threshold: number; filled?: boolean };
</script>

<script lang="ts">
	import type * as PIXI from 'pixi.js';
	import { Graphics } from 'pixi-svelte';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, BOARD_DIMENSIONS } from '../game/constants';

	const context = getContext();

	const BAR_WIDTH = SYMBOL_SIZE * BOARD_DIMENSIONS.x * 0.8;
	const BAR_HEIGHT = SYMBOL_SIZE * 0.35;
	const BAR_X = SYMBOL_SIZE * BOARD_DIMENSIONS.x * 0.1;
	const BAR_Y = -SYMBOL_SIZE * 0.6;

	let show = $state(false);
	let progress = $state(0);
	let threshold = $state(22);
	let filled = $state(false);

	/** Stable callback — do not use $derived or inline arrows (pixi Graphics $effect loops). */
	function drawBar(g: PIXI.Graphics) {
		if (!show) {
			g.clear();
			return;
		}
		const safeThreshold = Math.max(threshold, 1);
		g.clear();
		g.rect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT).fill({ color: 0x222244, alpha: 0.8 });
		const fillWidth = (progress / safeThreshold) * BAR_WIDTH;
		if (fillWidth > 0) {
			g.rect(BAR_X, BAR_Y, fillWidth, BAR_HEIGHT).fill({
				color: filled ? 0xffdd00 : 0x44aaff,
				alpha: 0.9,
			});
		}
		g.rect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT).stroke({ color: 0xaaaacc, width: 2 });
	}

	context.eventEmitter.subscribeOnMount({
		kronosBarShow: () => (show = true),
		kronosBarHide: () => {
			show = false;
			progress = 0;
			filled = false;
		},
		kronosBarUpdate: (e) => {
			show = true;
			progress = e.progress;
			threshold = e.threshold;
			filled = e.filled ?? e.progress >= e.threshold;
		},
	});
</script>

<BoardContainer>
	{#if show}
		<Graphics draw={drawBar} />
	{/if}
</BoardContainer>
