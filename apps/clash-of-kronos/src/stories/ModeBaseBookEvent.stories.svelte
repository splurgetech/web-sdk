<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'MODE_BASE/bookEvent',
	});
</script>

<script lang="ts">
	import {
		StoryGameTemplate,
		StoryLocale,
		type TemplateArgs,
		templateArgs,
	} from 'components-storybook';

	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';
	import { playBookEvent } from '../game/utils';
	import events from './data/base_events';

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
	name="reveal"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.reveal,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="cascadeTrackerUpdate"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.cascadeTrackerUpdate,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="chestUnlock"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.chestUnlock,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="chestValuesUpdate"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.chestValuesUpdate,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="winInfo"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.winInfo,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="updateTumbleWin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.updateTumbleWin,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="tumbleBoard"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.tumbleBoard,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="lightningStrike"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.lightningStrike,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="surgeChests"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.surgeChests,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="hammerCollect"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.hammerCollect,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="hammerSmash"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.hammerSmash,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="freeSpinTrigger"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.freeSpinTrigger,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="freeSpinRetrigger"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.freeSpinRetrigger,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="updateFreeSpin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.updateFreeSpin,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="setTotalWin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.setTotalWin,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="setWin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.setWin,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="freeSpinEnd"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.freeSpinEnd,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>

<Story
	name="finalWin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.finalWin,
		action: async (data) => await playBookEvent(data, { bookEvents: [] }),
	})}
	{template}
/>
