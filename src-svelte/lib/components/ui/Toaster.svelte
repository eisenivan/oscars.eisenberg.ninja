<script>
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { toasts, dismiss } from '$lib/stores/toast.js';
	import Icon from './Icon.svelte';
	const icons = { success: 'check', danger: 'alert', gold: 'trophy', default: 'info' };
	const tones = {
		success: 'text-success',
		danger: 'text-danger',
		gold: 'text-gold',
		default: 'text-muted'
	};
</script>

<div
	class="pointer-events-none fixed inset-x-0 bottom-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom)+12px)] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-6"
	role="status"
	aria-live="polite"
>
	{#each $toasts as t (t.id)}
		<div
			animate:flip={{ duration: 200 }}
			in:fly={{ y: 24, duration: 220 }}
			out:fly={{ y: 12, duration: 160 }}
			class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border border-line bg-surface p-3.5 shadow-lift"
		>
			<span class="mt-0.5 {tones[t.tone]}"><Icon name={icons[t.tone] || 'info'} size={18} /></span>
			<div class="min-w-0 flex-1 text-sm">
				<p class="font-medium text-fg">{t.message}</p>
				{#if t.detail}<p class="mt-0.5 text-muted">{@html t.detail}</p>{/if}
			</div>
			{#if t.action}
				<button
					class="-my-1 h-8 rounded-sm px-2.5 text-sm font-semibold text-gold hover:bg-surface-2"
					on:click={() => {
						t.action.run();
						dismiss(t.id);
					}}>{t.action.label}</button
				>
			{/if}
			<button
				class="-m-1 grid h-8 w-8 place-items-center rounded-sm text-muted hover:text-fg"
				aria-label="Dismiss"
				on:click={() => dismiss(t.id)}><Icon name="x" size={16} /></button
			>
		</div>
	{/each}
</div>
