<script>
	import { page } from '$app/stores';
	import { activeYear } from '$lib/data/year.js';
	import { currentYear } from '$lib/data/queries.js';
	import Icon from '../ui/Icon.svelte';
	import { navItems } from './nav.js';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let moreOpen = false;
	$: items = navItems($activeYear, $currentYear);
	$: path = $page.url.pathname;
	$: moreActive = moreOpen || /^\/(profile|about|admin)/.test(path);
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-safe backdrop-blur-md lg:hidden"
	aria-label="Main"
>
	<ul class="mx-auto grid h-tabbar max-w-lg grid-cols-4">
		{#each items as item}
			{@const active = item.match(path)}
			<li>
				<a
					href={item.href}
					aria-current={active ? 'page' : undefined}
					class="flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-wide transition
						{active ? 'text-gold' : 'text-muted active:text-fg'}"
				>
					<span class="grid h-7 w-14 place-items-center rounded-full transition {active ? 'bg-gold-fill/15' : ''}">
						<Icon name={item.icon} size={21} stroke={active ? 2.25 : 1.75} />
					</span>
					{item.short || item.label}
				</a>
			</li>
		{/each}
		<li>
			<button
				on:click={() => dispatch('more')}
				aria-haspopup="dialog"
				aria-expanded={moreOpen}
				class="flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-wide
					{moreActive ? 'text-gold' : 'text-muted'}"
			>
				<span class="grid h-7 w-14 place-items-center rounded-full {moreActive ? 'bg-gold-fill/15' : ''}">
					<Icon name="more" size={21} />
				</span>
				More
			</button>
		</li>
	</ul>
</nav>
