<script>
	import Icon from './Icon.svelte';
	/** options: [{ value, label, icon? }] */
	export let options = [];
	export let value;
	export let label = '';
	export let full = false;
</script>

<div
	role="radiogroup"
	aria-label={label}
	class="inline-flex rounded-sm border border-line bg-surface-2 p-1 {full ? 'flex w-full' : ''}"
>
	{#each options as opt (opt.value)}
		<button
			type="button"
			role="radio"
			aria-checked={value === opt.value}
			on:click={() => (value = opt.value)}
			class="flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[6px] px-3 text-sm font-medium transition
				{value === opt.value ? 'bg-surface text-fg shadow-card' : 'text-muted hover:text-fg'}"
		>
			{#if opt.icon}<Icon name={opt.icon} size={16} />{/if}
			<span class:sr-only={opt.iconOnly}>{opt.label}</span>
		</button>
	{/each}
</div>
