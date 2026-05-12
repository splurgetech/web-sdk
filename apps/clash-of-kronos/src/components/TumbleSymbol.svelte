<script lang="ts">
	import Symbol from './Symbol.svelte';
	import SymbolWrap from './SymbolWrap.svelte';
	import { getSymbolX } from '../game/utils';
	import type { SymbolState, RawSymbol } from '../game/types';

	type Props = {
		reelIndex: number;
		tumbleSymbol: {
			symbolY: { current: number };
			rawSymbol: RawSymbol;
			symbolState: SymbolState;
			oncomplete: () => void;
		};
	};

	const props: Props = $props();
</script>

<SymbolWrap x={getSymbolX(props.reelIndex)} y={props.tumbleSymbol.symbolY.current}>
	<Symbol
		state={props.tumbleSymbol.symbolState}
		rawSymbol={props.tumbleSymbol.rawSymbol}
		oncomplete={props.tumbleSymbol.oncomplete}
	/>
</SymbolWrap>
