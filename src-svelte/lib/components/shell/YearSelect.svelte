<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { years, currentYear } from '$lib/data/queries.js';
	import { activeYear, hrefForYear } from '$lib/data/year.js';
	import Icon from '../ui/Icon.svelte';

	$: options = $years.length ? $years : [$currentYear];
	// Only meaningful on year-scoped pages.
	$: scoped = $page.url.pathname === '/' || /^\/(scoreboard|admin\/)/.test($page.url.pathname);

	function change(e) {
		goto(hrefForYear($page.url.pathname, Number(e.currentTarget.value), $currentYear));
	}
</script>

{#if scoped}
	<label class="relative inline-flex items-center">
		<span class="sr-only">Year</span>
		<select
			value={$activeYear}
			on:change={change}
			class="tnum h-9 appearance-none rounded-full border border-line bg-surface-2 pl-3.5 pr-8 text-sm font-semibold text-fg hover:border-gold-fill/60 focus:outline-none focus:ring-2 focus:ring-gold-fill/60"
		>
			{#each options as y (y)}
				<option value={y}>{y}</option>
			{/each}
		</select>
		<Icon name="chevron-down" size={16} class="pointer-events-none absolute right-2.5 text-muted" />
	</label>
{/if}
