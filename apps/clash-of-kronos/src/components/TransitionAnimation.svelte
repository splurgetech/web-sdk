<script lang="ts">
	import { onMount } from 'svelte';
	import { SpineProvider, SpineTrack } from 'pixi-svelte';
	import { waitForTimeout } from 'utils-shared/wait';

	import { getContext } from '../game/context';

	type Props = {
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();
	let completed = false;

	const complete = () => {
		if (completed) return;
		completed = true;
		props.oncomplete();
	};

	onMount(() => {
		waitForTimeout(1200).then(complete);
	});
</script>

<SpineProvider
	key="transition"
	x={context.stateLayoutDerived.canvasSizes().width * 0.5}
	y={context.stateLayoutDerived.canvasSizes().height * 0.5}
	height={context.stateLayoutDerived.canvasSizes().height * 1.7}
>
	<SpineTrack
		trackIndex={0}
		animationName={'animation'}
		listener={{
			complete,
		}}
	/>
</SpineProvider>
