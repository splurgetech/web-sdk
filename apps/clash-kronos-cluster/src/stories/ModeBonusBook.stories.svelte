<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'MODE_BONUS/book',
		parameters: {
			docs: {
				description: {
					component:
						'Math-backed buy-bonus / free-spin books from `run_fixtures.py` (set `FIXTURE_BONUS_SIMS>0`) + `export_storybook_fixtures.py` in math-sdk. **`bonus_pool.json` must be non-empty** for `random` to run. Hand-authored event books are not supported here (they desync with tumble/cluster playback).',
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
	import books from './data/bonus_books';

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
	name="docs — generate math bonus fixtures first"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			// no-op: explains workflow when pool is empty
		},
	})}
	parameters={{
		docs: {
			description: {
				story:
					'If `bonus_pool.json` is empty: from `math-sdk/games/0_0_clash_kronos_cluster` run `FIXTURE_BONUS_SIMS=10 python run_fixtures.py` (expect long wall time), then `python export_storybook_fixtures.py --bonus-only`. Default `FIXTURE_BONUS_SIMS=0` keeps `run_fixtures.py` fast and leaves the pool empty until you opt in.',
			},
		},
	}}
	{template}
/>

<Story
	name="random"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			if (books.length === 0) {
				console.warn(
					'[MODE_BONUS/book] bonus_pool.json is empty — run math-sdk run_fixtures.py with FIXTURE_BONUS_SIMS>0 then export_storybook_fixtures.py --bonus-only.',
				);
				return;
			}
			const index = randomInteger({ min: 0, max: books.length - 1 });
			const data = books[index] as any;
			console.log('Running math bonus book at index', index);
			await playBet({ ...data, state: data.events });
		},
	})}
	parameters={{
		docs: {
			description: {
				story:
					'Picks a random book from the bonus math pool. Requires a non-empty `bonus_pool.json` from math export.',
			},
		},
	}}
	{template}
/>
