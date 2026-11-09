<script>
	import Icon from './Icon.svelte';
	export let icon = 'info';
	export let title;
</script>

<div class="card flex flex-col items-center px-6 py-12 text-center">
	<span class="mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-gold"
		><Icon name={icon} size={22} /></span
	>
	<p class="font-display text-lg font-semibold">{title}</p>
	<div class="mt-1 max-w-sm text-sm text-muted"><slot /></div>
	{#if $$slots.action}<div class="mt-5"><slot name="action" /></div>{/if}
</div>
