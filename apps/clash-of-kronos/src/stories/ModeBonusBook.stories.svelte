<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'MODE_BONUS/book',
	});
</script>

<script lang="ts">
	import { randomInteger } from 'utils-shared/random';

	import { setContext } from '../game/context';
	import books from './data/bonus_books';
	import BookRunner from './BookRunner.svelte';

	setContext();

	const booksById = Object.fromEntries(books.map((book) => [book.id, book])) as Record<string, (typeof books)[number]>;
	const randomBook = () => books[randomInteger({ min: 0, max: books.length - 1 })];
</script>

<Story name="random">
	<BookRunner book={randomBook()} />
</Story>

<Story name="noWin">
	<BookRunner book={booksById['bonus-no-win']} />
</Story>

<Story name="stage3ChestsUnlock">
	<BookRunner book={booksById['bonus-stage-3-chests-unlock']} />
</Story>

<Story name="stage4TwoX">
	<BookRunner book={booksById['bonus-stage-4-2x']} />
</Story>

<Story name="stage7TenX">
	<BookRunner book={booksById['bonus-stage-7-10x']} />
</Story>

<Story name="retrigger3Scatters">
	<BookRunner book={booksById['bonus-retrigger-3-scatters']} />
</Story>

<Story name="retrigger4Scatters">
	<BookRunner book={booksById['bonus-retrigger-4-scatters']} />
</Story>

<Story name="lightningWild">
	<BookRunner book={booksById['bonus-lightning-wild']} />
</Story>

<Story name="freeSpinEnd">
	<BookRunner book={booksById['bonus-free-spin-end']} />
</Story>
