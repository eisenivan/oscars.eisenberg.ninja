<script>
	import Spinner from './Spinner.svelte';
	/** primary | secondary | ghost | danger */
	export let variant = 'primary';
	/** md | sm | lg */
	export let size = 'md';
	export let href = undefined;
	export let type = 'button';
	export let loading = false;
	export let disabled = false;
	export let full = false;
	let className = '';
	export { className as class };

	const variants = {
		primary: 'bg-gold-fill text-on-gold hover:brightness-105 active:brightness-95 font-semibold',
		secondary: 'bg-surface text-fg border border-line hover:bg-surface-2 font-medium',
		ghost: 'text-fg hover:bg-surface-2 font-medium',
		danger: 'bg-danger/10 text-danger hover:bg-danger/15 font-semibold'
	};
	const sizes = {
		sm: 'h-9 px-3 text-sm gap-1.5 rounded-sm',
		md: 'h-11 px-4 text-[15px] gap-2 rounded-sm',
		lg: 'h-12 px-5 text-base gap-2 rounded-md'
	};
	$: cls = `relative inline-flex items-center justify-center select-none whitespace-nowrap transition
		disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]}
		${full ? 'w-full' : ''} ${className}`;
</script>

{#if href}
	<a {href} class={cls} {...$$restProps} on:click><slot /></a>
{:else}
	<button {type} class={cls} disabled={disabled || loading} aria-busy={loading} {...$$restProps} on:click>
		<span class="inline-flex items-center gap-[inherit]" class:invisible={loading}><slot /></span>
		{#if loading}
			<span class="absolute inset-0 grid place-items-center"><Spinner /></span>
		{/if}
	</button>
{/if}
