<script>
	/** Read-only nominee row for locked ballots and results. */
	import Icon from '../ui/Icon.svelte';
	export let candidate;
	export let isPick = false;
	export let isWinner = false;
	export let pickLabel = 'Your pick';
	export let outcome = null; // correct | missed | pending | null
	export let highlight = false; // compare: differs
</script>

<div
	class="relative flex min-h-[48px] items-center gap-3 rounded-sm px-3.5 py-2
		{isWinner ? 'bg-gold-fill/10' : isPick ? 'bg-surface-2' : ''}
		{highlight ? 'ring-1 ring-info/60' : ''}"
>
	{#if isWinner}
		<span class="absolute inset-y-1.5 left-0 w-1 rounded-full bg-gold-fill" aria-hidden="true" />
	{/if}
	<span class="grid w-5 shrink-0 place-items-center {isWinner ? 'text-gold' : 'text-muted'}">
		{#if isWinner}<Icon name="trophy" size={17} />{:else if isPick}<Icon
				name={outcome === 'missed' ? 'x' : 'check'}
				size={17}
				stroke={2.5}
				class={outcome === 'missed' ? 'text-danger' : 'text-fg'}
			/>{:else}<span class="h-1.5 w-1.5 rounded-full bg-line" />{/if}
	</span>
	<span class="min-w-0 flex-1">
		<span class="block text-[15px] leading-snug {isPick || isWinner ? 'font-semibold' : 'text-muted'}"
			>{candidate.text}</span
		>
		{#if candidate.subtext && (isPick || isWinner)}
			<span class="block text-[13px] leading-snug text-muted">{candidate.subtext}</span>
		{/if}
	</span>
	<span class="flex shrink-0 flex-col items-end gap-1">
		{#if isWinner}<span class="text-xs font-semibold text-gold">Winner</span>{/if}
		{#if isPick}
			<span class="text-xs font-semibold {outcome === 'missed' ? 'text-danger' : outcome === 'correct' ? 'text-success' : 'text-muted'}"
				>{pickLabel}</span
			>
		{/if}
		<slot />
	</span>
</div>
