<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'MODE_BONUS/book',
		parameters: {
			docs: {
				description: {
					component:
						'Bonus (buy-bonus / free-spin) books. Auto-generation requires the freegame distribution which uses `force_freegame=True` — currently skipped in `run_fixtures.py` due to performance on laptops. Use the golden story in **MODE_BASE/book** for full FS sequences.',
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
	import { goldenBaseBook } from './data/golden_base_book';

	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';
	import { playBet } from '../game/utils';

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
	name="golden — base + free spins"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			await playBet({ ...goldenBaseBook, state: goldenBaseBook.events });
		},
	})}
	parameters={{
		docs: {
			description: {
				story:
					'Hand-authored reference for the full FS flow (base tumbles → scatter trigger → FS spins with persistent overlays). Math-backed bonus books will be added once freegame distribution is optimised.',
			},
		},
	}}
	{template}
/>
