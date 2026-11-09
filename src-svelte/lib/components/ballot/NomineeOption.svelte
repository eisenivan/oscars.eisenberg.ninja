<script>
	import Icon from '../ui/Icon.svelte';
	export let candidate;
	export let name;
	export let checked = false;
	export let disabled = false;
	export let isWinner = false;
	export let tone = null; // 'success' | 'danger' | null
</script>

<label
	class="group relative flex min-h-[56px] cursor-pointer items-center gap-3 rounded-sm border px-3.5 py-2.5 transition
		{checked
		? 'border-gold-fill bg-gold-fill/10 ring-1 ring-gold-fill'
		: 'border-line bg-surface hover:border-gold-fill/50 hover:bg-surface-2'}
		{disabled ? 'pointer-events-none' : 'active:scale-[.99]'}"
>
	<input
		type="radio"
		class="peer sr-only"
		{name}
		value={candidate.key}
		{checked}
		{disabled}
		on:change
	/>
	<span
		class="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-gold-fill peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface
			{checked ? 'border-gold-fill bg-gold-fill text-on-gold' : 'border-line group-hover:border-gold-fill/60'}"
		aria-hidden="true"
	>
		{#if checked}<Icon name="check" size={14} stroke={3} />{/if}
	</span>
	<span class="min-w-0 flex-1">
		<span class="block text-[15px] font-semibold leading-snug">{candidate.text}</span>
		{#if candidate.subtext}
			<span class="mt-0.5 block text-[13px] leading-snug text-muted">{candidate.subtext}</span>
		{/if}
	</span>
	{#if isWinner}
		<span class="flex items-center gap-1 text-xs font-semibold {tone === 'danger' ? 'text-muted' : 'text-gold'}">
			<Icon name="trophy" size={15} /> Winner
		</span>
	{/if}
</label>
