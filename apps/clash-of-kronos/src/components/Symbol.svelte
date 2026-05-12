<script lang="ts">
	import SymbolSpine from './SymbolSpine.svelte';
	import SymbolSprite from './SymbolSprite.svelte';
	import { getSymbolInfo } from '../game/utils';
	import type { SymbolState, RawSymbol } from '../game/types';
	import { getContext } from '../game/context';
	import { BitmapText, Container, Graphics, Text } from 'pixi-svelte';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
	const symbolInfo = $derived(getSymbolInfo({ rawSymbol: props.rawSymbol, state: props.state }));
	const isSprite = $derived(symbolInfo.type === 'sprite');
	const label = $derived(
		({
			RUNE: 'RUNE',
			SHIELD: 'SHLD',
			HELMET: 'HELM',
			EAGLE: 'EAGL',
			PEGASUS: 'PEGA',
			KRONOS_SMALL: 'KRON',
			SCATTER: 'SUN',
			CHEST: props.rawSymbol.chestActive ? 'CHEST' : 'LOCK',
			WILD: 'WILD',
			WILD_LIGHTNING: 'BOLT',
			WILD_SURGE: 'SURG',
			WILD_HAMMER: 'HAMR',
			WILD_EAGLE: 'GOLD',
		})[props.rawSymbol.name],
	);
	const labelColor = $derived(props.rawSymbol.chestActive ? 0xffdd66 : 0xffffff);
</script>

{#if isSprite}
	<SymbolSprite {symbolInfo} x={props.x} y={props.y} oncomplete={props.oncomplete} />
{:else}
	<SymbolSpine
		loop={props.loop}
		{symbolInfo}
		x={props.x}
		y={props.y}
		showWinFrame={props.state === 'win' && !['S', 'M'].includes(props.rawSymbol.name)}
		listener={{
			complete: props.oncomplete,
			event: (_, event) => {
				if (event.data?.name === 'wildExplode') {
					context.eventEmitter?.broadcast({ type: 'soundOnce', name: 'sfx_wild_explode' });
				}
			},
		}}
	/>
{/if}

{#if label}
	<Container x={props.x} y={props.y}>
		<Graphics
			draw={(graphics) => {
				graphics.roundRect(-48, 24, 96, 24, 5);
				graphics.fill({ color: props.rawSymbol.chestActive ? 0x5f3a10 : 0x111827, alpha: 0.82 });
				graphics.stroke({ width: 1, color: props.rawSymbol.chestActive ? 0xffd166 : 0x9ca3af });
			}}
		/>
		<Text
			anchor={0.5}
			y={36}
			text={label}
			style={{
				fontFamily: 'Arial',
				fontSize: 13,
				fontWeight: '700',
				fill: labelColor,
			}}
		/>
	</Container>
{/if}

{#if props.rawSymbol.multiplier}
	<BitmapText
		anchor={0.5}
		x={props.x}
		y={props.y}
		text={`${props.rawSymbol.multiplier}X`}
		style={{
			fontFamily: 'gold',
			fontSize: 50,
		}}
	/>
{/if}

{#if props.rawSymbol.name === 'CHEST' && props.rawSymbol.chestValue}
	<BitmapText
		anchor={0.5}
		x={props.x}
		y={(props.y ?? 0) - 10}
		text={`${props.rawSymbol.chestValue}`}
		style={{
			fontFamily: 'gold',
			fontSize: 34,
		}}
	/>
{/if}
