<script>
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Icon from './Icon.svelte';
	export let open = false;
	export let title = '';
	/** Bottom sheet on phones; centered dialog from sm up. */

	let panel;
	function close() {
		open = false;
	}
	function onKey(e) {
		if (open && e.key === 'Escape') close();
	}
	$: if (open && panel) setTimeout(() => panel?.focus(), 30);
	let w = 0;
	$: mobile = w < 640;
</script>

<svelte:window on:keydown={onKey} bind:innerWidth={w} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
		<div
			class="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
			transition:fade={{ duration: 180 }}
			on:click={close}
			aria-hidden="true"
		/>
		<div
			bind:this={panel}
			tabindex="-1"
			role="dialog"
			aria-modal="true"
			aria-label={title}
			class="relative max-h-[85dvh] w-full overflow-y-auto rounded-t-lg border border-line bg-surface pb-safe shadow-sheet focus:outline-none sm:max-w-md sm:rounded-lg"
			transition:fly={{ y: mobile ? 400 : 16, duration: 250, easing: cubicOut }}
		>
			<div class="sticky top-0 z-10 flex items-center justify-between bg-surface px-5 pb-2 pt-3">
				<span class="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-line sm:hidden" />
				<h2 class="pt-3 text-xl font-semibold">{title}</h2>
				<button
					class="-mr-2 mt-2 grid h-10 w-10 place-items-center rounded-sm text-muted hover:bg-surface-2 hover:text-fg"
					on:click={close}
					aria-label="Close"><Icon name="x" /></button
				>
			</div>
			<div class="px-5 pb-6 pt-1"><slot /></div>
		</div>
	</div>
{/if}
