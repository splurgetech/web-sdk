<script lang="ts" module>
	import type { Position } from '../game/types';

	export type HiddenMultCell = Position & { value: number };

	export type EmitterEventHiddenMultGrid =
		| { type: 'hiddenMultGridShow' }
		| { type: 'hiddenMultGridHide' }
		| { type: 'hiddenMultGridSet'; hiddenMults: HiddenMultCell[] }
		| { type: 'hiddenMultGridCollect'; collected: HiddenMultCell[] }
		| { type: 'hiddenMultGridClear' };
</script>

<script lang="ts">
	import { BitmapText, Container, SpineProvider, SpineTrack } from 'pixi-svelte';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import { bookRowToSymbolY } from '../game/utils';

	const context = getContext();

	let show = $state(false);
	let cells = $state<HiddenMultCell[]>([]);

	const cellKey = (c: HiddenMultCell) => `${c.reel},${c.row}`;

	context.eventEmitter.subscribeOnMount({
		hiddenMultGridShow: () => (show = true),
		hiddenMultGridHide: () => {
			show = false;
			cells = [];
		},
		hiddenMultGridSet: (e) => {
			show = true;
			cells = e.hiddenMults;
		},
		hiddenMultGridCollect: (e) => {
			const removed = new Set(e.collected.map(cellKey));
			cells = cells.filter((c) => !removed.has(cellKey(c)));
		},
		hiddenMultGridClear: () => (cells = []),
	});
</script>

<BoardContainer>
	{#if show}
		{#each cells as cell (cellKey(cell))}
			<Container x={(cell.reel + 0.5) * SYMBOL_SIZE} y={bookRowToSymbolY(cell.row)}>
				<SpineProvider key="anticipation" width={SYMBOL_SIZE * 0.19}>
					<SpineTrack trackIndex={0} animationName={'payframe'} loop />
				</SpineProvider>
				<BitmapText
					anchor={{ x: 0.5, y: 0.5 }}
					text={`${cell.value}x`}
					style={{
						fontFamily: 'gold',
						fontSize: SYMBOL_SIZE * 0.4,
						letterSpacing: -4,
					}}
				/>
			</Container>
		{/each}
	{/if}
</BoardContainer>
