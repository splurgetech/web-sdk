<script lang="ts" module>
	import type { Position } from '../game/types';

	export type EmitterEventKronosStrike =
		| { type: 'kronosStrikePlay'; hits: Position[] }
		| { type: 'kronosStrikeClear' };
</script>

<script lang="ts">
	import { Graphics } from 'pixi-svelte';
	import { waitForTimeout } from 'utils-shared/wait';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	const BOLT_STAGGER_MS = 72;
	const TRAIL_MS = 160;

	let hits = $state<Position[]>([]);
	let visible = $state(false);

	function boltPolyline(hit: Position, seed: number): { x: number; y: number }[] {
		const cx = hit.reel * SYMBOL_SIZE + SYMBOL_SIZE * 0.5;
		const cy = hit.row * SYMBOL_SIZE + SYMBOL_SIZE * 0.5;
		const topY = cy - SYMBOL_SIZE * 1.35;
		const steps = 5;
		const zig = (i: number, mag: number) => {
			const s = Math.sin(seed * 1.7 + i * 2.1) * mag;
			const c = Math.cos(seed * 0.9 + i * 1.3) * mag * 0.35;
			return s + c;
		};
		const pts: { x: number; y: number }[] = [{ x: cx + zig(0, 6), y: topY }];
		for (let i = 1; i <= steps; i++) {
			const t = i / steps;
			const y = topY + (cy - topY) * t;
			const spread = (1 - t) * 18;
			pts.push({ x: cx + zig(i, spread), y });
		}
		pts.push({ x: cx, y: cy + SYMBOL_SIZE * 0.08 });
		return pts;
	}

	context.eventEmitter.subscribeOnMount({
		kronosStrikePlay: async (e) => {
			hits = [];
			visible = true;
			for (const hit of e.hits) {
				hits = [...hits, hit];
				context.eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_explosion_b' });
				await waitForTimeout(BOLT_STAGGER_MS);
			}
			await waitForTimeout(TRAIL_MS);
		},
		kronosStrikeClear: () => {
			hits = [];
			visible = false;
		},
	});

	let drawFn = $derived((g: any) => {
		g.clear();
		if (!visible) return;

		const core = 0xb8f0ff;
		const glow = 0x4aa8ff;

		hits.forEach((hit, hi) => {
			const pts = boltPolyline(hit, hit.reel * 13 + hit.row * 7 + hi);
			if (pts.length < 2) return;

			// Outer glow
			g.moveTo(pts[0].x, pts[0].y);
			for (let i = 1; i < pts.length; i++) {
				g.lineTo(pts[i].x, pts[i].y);
			}
			g.stroke({ width: 7, color: glow, alpha: 0.35, cap: 'round', join: 'round' });

			g.moveTo(pts[0].x, pts[0].y);
			for (let i = 1; i < pts.length; i++) {
				g.lineTo(pts[i].x, pts[i].y);
			}
			g.stroke({ width: 3, color: core, alpha: 0.95, cap: 'round', join: 'round' });

			const last = pts[pts.length - 1];
			g.circle(last.x, last.y, SYMBOL_SIZE * 0.22).fill({ color: 0xffffff, alpha: 0.55 });
			g.circle(last.x, last.y, SYMBOL_SIZE * 0.12).fill({ color: core, alpha: 0.9 });
		});
	});
</script>

<BoardContainer>
	{#if visible}
		<Graphics draw={drawFn} />
	{/if}
</BoardContainer>
