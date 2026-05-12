<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'MODE_BASE/book',
	});
</script>

<script lang="ts">
	import { randomInteger } from 'utils-shared/random';

	import { setContext } from '../game/context';
	import books from './data/base_books';
	import BookRunner from './BookRunner.svelte';

	setContext();

	const booksById = Object.fromEntries(books.map((book) => [book.id, book])) as Record<string, (typeof books)[number]>;
	const randomBook = () => books[randomInteger({ min: 0, max: books.length - 1 })];
</script>

<Story name="random">
	<BookRunner book={randomBook()} />
</Story>

<Story name="noWin">
	<BookRunner book={booksById['base-no-win']} />
</Story>

<Story name="oneLineStage1">
	<BookRunner book={booksById['base-one-line-stage-1']} />
</Story>

<Story name="multiLineStillStage1">
	<BookRunner book={booksById['base-multi-line-stage-1']} />
</Story>

<Story name="twoCascadesStage2">
	<BookRunner book={booksById['base-two-cascades-stage-2']} />
</Story>

<Story name="stage4ChestsUnlock">
	<BookRunner book={booksById['base-stage-4-chests-unlock']} />
</Story>

<Story name="stage5TwoX">
	<BookRunner book={booksById['base-stage-5-2x']} />
</Story>

<Story name="stage7FiveX">
	<BookRunner book={booksById['base-stage-7-5x']} />
</Story>

<Story name="lightningWild">
	<BookRunner book={booksById['base-lightning-wild']} />
</Story>

<Story name="surgeWildActiveChests">
	<BookRunner book={booksById['base-surge-wild-active-chests']} />
</Story>

<Story name="hammerWildSmash">
	<BookRunner book={booksById['base-hammer-wild-smash']} />
</Story>

<Story name="goldenEagleWild">
	<BookRunner book={booksById['base-golden-eagle-wild']} />
</Story>

<Story name="freeSpinTrigger3Scatters">
	<BookRunner book={booksById['base-free-spin-trigger-3-scatters']} />
</Story>
