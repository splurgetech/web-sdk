<script lang="ts" module>
	export type EmitterEventKronosStrike =
		| { type: 'kronosStrikePlay'; hits: { reel: number; row: number }[] }
		| { type: 'kronosStrikeClear' };
</script>

<script lang="ts">
	import * as PIXI from 'pixi.js';
	import { Graphics } from 'pixi-svelte';
	import { waitForTimeout } from 'utils-shared/wait';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	let hits = $state<{ reel: number; row: number }[]>([]);
	let visible = $state(false);

	context.eventEmitter.subscribeOnMount({
		kronosStrikePlay: async (e) => {
			hits = e.hits;
			visible = true;
			await waitForTimeout(800);
		},
		kronosStrikeClear: () => {
			hits = [];
			visible = false;
		},
	});

	let drawFn = $derived((g: PIXI.Graphics) => {
		for (const hit of hits) {
			const x = hit.reel * SYMBOL_SIZE;
			const y = (hit.row - 1) * SYMBOL_SIZE;
			g.rect(x, y, SYMBOL_SIZE, SYMBOL_SIZE).fill({ color: 0xffaa00, alpha: 0.5 });
			g.rect(x, y, SYMBOL_SIZE, SYMBOL_SIZE).stroke({ color: 0xffdd00, width: 3 });
		}
	});
</script>

<BoardContainer>
	{#if visible}
		<Graphics draw={drawFn} />
	{/if}
</BoardContainer>
