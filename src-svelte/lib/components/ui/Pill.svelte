<script>
	import Icon from './Icon.svelte';
	/** neutral | gold | success | danger | info */
	export let tone = 'neutral';
	export let icon = undefined;
	let className = '';
	export { className as class };
	const tones = {
		neutral: 'bg-surface-2 text-muted',
		gold: 'bg-gold-fill/15 text-gold',
		success: 'bg-success/10 text-success',
		danger: 'bg-danger/10 text-danger',
		info: 'bg-info/10 text-info'
	};
</script>

<span
	class="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2 text-xs font-semibold {tones[tone]} {className}"
>
	{#if icon}<Icon name={icon} size={13} stroke={2.5} />{/if}<slot />
</span>
