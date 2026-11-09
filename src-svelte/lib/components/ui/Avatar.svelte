<script>
	export let name = '';
	export let size = 40;
	/** null | 1 | 2 | 3 - medal ring */
	export let medal = null;
	export let highlight = false;
	$: initials =
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0])
			.join('')
			.toUpperCase() || '?';
	const rings = { 1: '#C9A227', 2: '#A8A9AD', 3: '#B0703A' };
</script>

<span
	class="inline-grid shrink-0 place-items-center rounded-full font-display font-semibold
		{highlight ? 'bg-gold-fill text-on-gold' : 'bg-surface-2 text-fg'}"
	style="width:{size}px;height:{size}px;font-size:{Math.round(size * 0.38)}px;{medal
		? `box-shadow:0 0 0 3px rgb(var(--surface)),0 0 0 ${size > 48 ? 6 : 5}px ${rings[medal]}`
		: ''}"
	aria-hidden="true">{initials}</span
>
