<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'MODE_BASE/book',
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
	import collect from './data/math_fixtures/base_collect.json';
	import globalMult from './data/math_fixtures/base_global_mult.json';
	import kronos from './data/math_fixtures/base_kronos.json';
	import multiTumble from './data/math_fixtures/base_multi_tumble.json';

	setContext();

	type FixtureBook = { gameType: string; events: unknown[] };

	const playFixture = (data: FixtureBook) => playBet({ ...data, state: data.events });
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
			if (books.length === 0) {
				console.warn('base_books is empty — run math export_storybook_fixtures.py');
				return;
			}
			const index = randomInteger({ min: 0, max: books.length - 1 });
			const data = books[index] as FixtureBook;
			console.log('Running math book at index', index, 'of', books.length);
			await playFixture(data);
		},
	})}
	{template}
/>

<Story
	name="fixture — no win"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => playFixture(noWin as FixtureBook),
	})}
	{template}
/>

<Story
	name="fixture — one cluster"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => playFixture(oneCluster as FixtureBook),
	})}
	{template}
/>

<Story
	name="fixture — hidden mult collect"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => playFixture(collect as FixtureBook),
	})}
	{template}
/>

<Story
	name="fixture — global mult"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => playFixture(globalMult as FixtureBook),
	})}
	{template}
/>

<Story
	name="fixture — kronos transform"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => playFixture(kronos as FixtureBook),
	})}
	{template}
/>

<Story
	name="fixture — multi tumble"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => playFixture(multiTumble as FixtureBook),
	})}
	{template}
/>
