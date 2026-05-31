<script lang="ts" module>
	import type { Position, RawSymbol } from '../game/types';

	export type EmitterEventKronosTransform =
		| {
				type: 'kronosTransformPlay';
				fromSymbol: string;
				toSymbol: string;
				positions: Position[];
				board?: RawSymbol[][];
		  }
		| { type: 'kronosTransformClear' };
</script>

<script lang="ts">
	import type * as PIXI from 'pixi.js';
	import { Graphics } from 'pixi-svelte';
	import { waitForTimeout } from 'utils-shared/wait';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import { bookRowToSymbolY } from '../game/utils';

	const context = getContext();
	const PULSE_MS = 500;

	let positions = $state<Position[]>([]);
	let visible = $state(false);

	const cellCenter = (pos: Position) => ({
		x: (pos.reel + 0.5) * SYMBOL_SIZE,
		y: bookRowToSymbolY(pos.row),
	});

	function drawPulse(g: PIXI.Graphics) {
		if (!visible) {
			g.clear();
			return;
		}
		g.clear();
		for (const pos of positions) {
			const { x, y } = cellCenter(pos);
			g.circle(x, y, SYMBOL_SIZE * 0.45).fill({ color: 0xffaa00, alpha: 0.4 });
		}
	}

	context.eventEmitter.subscribeOnMount({
		kronosTransformPlay: async (emitterEvent) => {
			positions = emitterEvent.positions;
			visible = true;
			context.eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_wild_explode' });
			if (emitterEvent.board) {
				context.eventEmitter.broadcast({
					type: 'boardSettle',
					board: emitterEvent.board,
				});
			}
			await waitForTimeout(PULSE_MS);
			visible = false;
			positions = [];
		},
		kronosTransformClear: () => {
			visible = false;
			positions = [];
		},
	});
</script>

{#if visible}
	<BoardContainer>
		<Graphics draw={drawPulse} />
	</BoardContainer>
{/if}
