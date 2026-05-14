<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Symbol from '../components/Symbol.svelte';

	const { Story } = defineMeta({
		title: 'Components/<Symbol>',
		component: Symbol,
		args: {
			x: 100,
			y: 100,
			rawSymbol: { name: 'S', scatter: true },
			state: 'static',
		},
		parameters: {
			docs: {
				description: {
					component:
						'Pixi symbol for Clash Kronos Cluster. The symbols matrix uses paytable ids (L1–L3, M1–M2, H1–H2, S, W), not every asset key in assets.ts.',
				},
			},
		},
	});
</script>

<script lang="ts">
	import { Container, Text } from 'pixi-svelte';
	import { StoryPixiApp } from 'components-storybook';

	import type { RawSymbol } from '../game/types';
	import { SYMBOL_STATES } from '../game/types';
	import { setContext } from '../game/context';
	import assets from '../game/assets';

	setContext();

	/** Row height / state column width (wider columns reduce label overlap for long states like postWinStatic). */
	const BASE = 148;

	/** Clash Kronos Cluster paytable / math symbol set (orthogonal cluster game). */
	const SYMBOLS_KRONOS: RawSymbol[] = [
		{ name: 'S', scatter: true },
		{ name: 'W' },
		{ name: 'L1' },
		{ name: 'L2' },
		{ name: 'L3' },
		{ name: 'M1' },
		{ name: 'M2' },
		{ name: 'H1' },
		{ name: 'H2' },
	];
</script>

<Story name="component">
	{#snippet template(args)}
		<StoryPixiApp {assets}>
			<Symbol {...args} oncomplete={() => console.log('complete')} />
		</StoryPixiApp>
	{/snippet}
</Story>

<Story name="symbols">
	{#snippet template()}
		<StoryPixiApp {assets}>
			<!-- Single grid: two wide columns were placed at x>1200 and clipped by the canvas (browser scroll does not pan Pixi). -->
			<Container scale={0.55} x={20} y={20}>
				{#each SYMBOLS_KRONOS as symbol, rowIndex}
					{#each SYMBOL_STATES as state, columnIndex}
						{@const x = (columnIndex + 1) * BASE}
						{@const y = (rowIndex + 1) * BASE}
						<Text {x} y={y - 86} anchor={{ x: 0.5, y: 0 }} text={`${symbol.name}: ${state}`} />
						<Symbol {x} {y} rawSymbol={symbol} {state} loop />
					{/each}
				{/each}
			</Container>
		</StoryPixiApp>
	{/snippet}
</Story>
