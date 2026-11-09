<script>
	import { page } from '$app/stores';
	import { user } from '$lib/auth.js';
	import { activeYear } from '$lib/data/year.js';
	import { themeMode, isDark } from '$lib/stores/theme.js';
	import Icon from '../ui/Icon.svelte';
	import Avatar from '../ui/Avatar.svelte';
	import Wordmark from './Wordmark.svelte';
	import YearSelect from './YearSelect.svelte';
	import { navItems } from './nav.js';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	$: items = navItems($activeYear);
	$: path = $page.url.pathname;

	function toggleTheme() {
		themeMode.set($isDark ? 'light' : 'dark');
	}
</script>

<header class="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md" style="padding-top: env(safe-area-inset-top)">
	<div class="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-16 lg:px-8">
		<Wordmark />

		{#if $user}
			<nav class="ml-8 hidden h-full items-stretch gap-1 lg:flex" aria-label="Main">
				{#each items as item}
					<a
						href={item.href}
						aria-current={item.match(path) ? 'page' : undefined}
						class="relative flex items-center px-3 text-[15px] font-medium transition
							{item.match(path) ? 'text-fg' : 'text-muted hover:text-fg'}"
					>
						{item.label}
						{#if item.match(path)}
							<span class="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold-fill" />
						{/if}
					</a>
				{/each}
			</nav>
		{/if}

		<div class="ml-auto flex items-center gap-1.5 sm:gap-2">
			{#if $user}<YearSelect />{/if}
			<button
				on:click={toggleTheme}
				class="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
				aria-label={$isDark ? 'Switch to light theme' : 'Switch to dark theme'}
			>
				<Icon name={$isDark ? 'sun' : 'moon'} size={19} />
			</button>
			{#if $user}
				<button
					class="hidden rounded-full lg:block"
					on:click={() => dispatch('menu')}
					aria-label="Account menu"
				>
					<Avatar name={$user.displayName || $user.email || ''} size={36} />
				</button>
			{:else}
				<a href="/about" class="hidden h-10 items-center px-3 text-sm font-medium text-muted hover:text-fg sm:flex">About</a>
			{/if}
		</div>
	</div>
</header>
