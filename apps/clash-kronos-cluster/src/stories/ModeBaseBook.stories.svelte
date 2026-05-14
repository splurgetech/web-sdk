<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'MODE_BASE/book',
		parameters: {
			docs: {
				description: {
					component:
						'Math-backed books from `run_fixtures.py` + `export_storybook_fixtures.py` in math-sdk. Each named fixture targets one mechanic. **random** picks one of 50 real base-game simulation books. A `winInfo` step only pays clusters listed in that book—large symbol blobs on the board are not always one orthogonal cluster (or the book may end before another cascade).',
				},
			},
		},
	});
</script>

<script lang="ts">
	import {
		StoryGameTemplate,
		StoryLocale,
		type TemplateArgs,
		templateArgs,
	} from 'components-storybook';
	import { randomInteger } from 'utils-shared/random';

	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';
	import { playBet } from '../game/utils';
	import books from './data/base_books';
	import noWin from './data/math_fixtures/base_no_win.json';
	import oneCluster from './data/math_fixtures/base_one_cluster.json';
	import twoCascades from './data/math_fixtures/base_two_cascades.json';
	import multiTumble from './data/math_fixtures/base_multi_tumble.json';
	import kronosStrike from './data/math_fixtures/base_kronos_strike.json';

	setContext();
</script>

{#snippet template(args: TemplateArgs<any>)}
	<StoryGameTemplate
		skipLoadingScreen={args.skipLoadingScreen}
		action={async () => {
			await args.action?.(args.data);
		}}
	>
		<StoryLocale lang="en">
			<Game />
		</StoryLocale>
	</StoryGameTemplate>
{/snippet}

<Story
	name="random"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			const index = randomInteger({ min: 0, max: books.length - 1 });
			const data = books[index] as any;
			console.log('Running math book at index', index);
			await playBet({ ...data, state: data.events });
		},
	})}
	parameters={{
		docs: {
			description: {
				story:
					'Picks a random book from the 50-book math pool (real base-game sims, no FS). Only clusters in each step’s `winInfo` pay; other big blobs may be disconnected by a gap, diagonals-only, or a different symbol id. The book stops when the exported event list ends.',
			},
		},
	}}
	{template}
/>

<Story
	name="fixture — no win"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			const data = noWin as any;
			await playBet({ ...data, state: data.events });
		},
	})}
	parameters={{
		docs: {
			description: {
				story:
					'Zero-win base spin: board revealed, no clusters ≥ 5. Expect: reveal → setTotalWin 0 → finalWin 0. Verifies the idle/lose path and that no multiplier grid appears. (Fixture = one recorded spin; do not infer extra cascades beyond its events.)',
			},
		},
	}}
	{template}
/>

<Story
	name="fixture — one cluster"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			const data = oneCluster as any;
			await playBet({ ...data, state: data.events });
		},
	})}
	parameters={{
		docs: {
			description: {
				story:
					'Single recorded tumble chain: one `winInfo` for the first paying step (other 5+ blobs on the frame may not be one paid cluster for this book). Then `updateGrid` (pending tickets), `tumbleBoard`, `kronosBar` (after removals), `finalWin`.',
			},
		},
	}}
	{template}
/>

<Story
	name="fixture — two cascades"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			const data = twoCascades as any;
			await playBet({ ...data, state: data.events });
		},
	})}
	parameters={{
		docs: {
			description: {
				story:
					'Two cascade steps from one exported spin. Each step’s wins match the book only; multiplier ladder is Sugar Rush style (pending then 2×, etc.).',
			},
		},
	}}
	{template}
/>

<Story
	name="fixture — multi tumble"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			const data = multiTumble as any;
			await playBet({ ...data, state: data.events });
		},
	})}
	parameters={{
		docs: {
			description: {
				story:
					'Three+ tumble steps from one exported spin. Stops when the book’s event list ends—later boards may show unused 5+ shapes without a following `winInfo`.',
			},
		},
	}}
	{template}
/>

<Story
	name="fixture — kronos strike"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			const data = kronosStrike as any;
			await playBet({ ...data, state: data.events });
		},
	})}
	parameters={{
		docs: {
			description: {
				story:
					'After the tumble that pushes the bar to 20: `tumbleBoard` → `kronosBar` (full, **gold**) → staggered bolt VFX → `kronosStrike` → `kronosBar` reset to 0 → `enhancedBoard.settle` → next `winInfo`. The empty bar event is **after** the strike so the gold fill is visible through the tumble and bolt.',
			},
		},
	}}
	{template}
/>
