<script lang="ts">
	import { StoryGameTemplate, StoryLocale } from 'components-storybook';

	import Game from '../components/Game.svelte';
	import { playBet } from '../game/utils';
	import type { Bet } from '../game/typesBookEvent';

	type StorybookBook = Bet & {
		id: string;
		description: string;
	};

	type Props = {
		book: StorybookBook;
		skipLoadingScreen?: boolean;
	};

	const props: Props = $props();

	const runBook = async () => {
		console.log('Running book', props.book.id, props.book.description);
		await playBet({ ...props.book, state: props.book.events });
	};
</script>

<StoryGameTemplate skipLoadingScreen={props.skipLoadingScreen ?? true} action={runBook}>
	<StoryLocale lang="en">
		<Game />
	</StoryLocale>
</StoryGameTemplate>
