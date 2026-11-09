<script>
	import { user } from '$lib/auth.js';
	import { activeYear } from '$lib/data/year.js';
	import { settingsFor, categoriesFor, ballotFor, YEAR } from '$lib/data/queries.js';
	import { connected } from '$lib/data/db.js';
	import { categoryOf } from '$lib/domain/keys.js';
	import Icon from '../ui/Icon.svelte';

	$: year = $activeYear;
	$: settings = settingsFor(year);
	$: cats = categoriesFor(year);
	$: mine = $user ? ballotFor(year, $user.uid) : null;

	$: total = $cats.value.length;
	$: picked = new Set((($mine && $mine.value?.votes) || []).filter(Boolean).map(categoryOf)).size;
	$: announced = $settings.results.length;
	$: latestKey = $settings.results[announced - 1];
	$: latestCat = $cats.value.find((c) => c.id === categoryOf(latestKey));
	$: latest = latestCat?.candidates.find((c) => c.key === latestKey);
	$: firstEmpty = $cats.value.find(
		(c) => !(($mine && $mine.value?.votes) || []).some((k) => k && categoryOf(k) === c.id)
	);

	$: state = !$settings.exists
		? null
		: !$settings.locked
		? 'open'
		: announced === 0
		? 'waiting'
		: total && announced >= total
		? 'final'
		: 'live';

	// Avoid flashing "offline" during the initial connection.
	let offline = false;
	let timer;
	$: {
		clearTimeout(timer);
		if ($connected === false) timer = setTimeout(() => (offline = true), 2500);
		else offline = false;
	}
</script>

{#if offline}
	<div class="border-b border-danger/30 bg-danger/10 text-danger">
		<p class="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-sm font-medium sm:px-6 lg:px-8">
			<Icon name="wifi-off" size={16} /> You’re offline. Picks will save when you reconnect.
		</p>
	</div>
{/if}

{#if state && !$settings.loading && !$cats.loading}
	<div class="border-b border-line/70 bg-surface/60">
		<div class="mx-auto flex min-h-[40px] max-w-7xl items-center gap-2 px-4 py-2 text-[13px] sm:px-6 sm:text-sm lg:px-8">
			{#if state === 'open'}
				<span class="h-2 w-2 shrink-0 rounded-full bg-gold-fill" />
				<span class="font-semibold">Voting open</span>
				<span class="text-muted">· {picked} of {total} picked</span>
				{#if firstEmpty && year === YEAR}
					<a href="/#cat-{firstEmpty.id}" class="ml-auto flex items-center gap-0.5 font-semibold text-gold hover:underline">
						Next pick <Icon name="chevron-right" size={16} />
					</a>
				{/if}
			{:else if state === 'waiting'}
				<Icon name="lock" size={15} class="text-muted" />
				<span class="font-semibold">Voting closed</span>
				<span class="truncate text-muted">· Waiting for the first envelope</span>
			{:else if state === 'live'}
				<span class="relative flex h-2 w-2 shrink-0">
					<span class="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-danger" />
				</span>
				<span class="font-semibold text-danger">Live</span>
				<span class="tnum shrink-0 text-muted">· {announced} of {total}</span>
				{#if latest}
					<span class="hidden min-w-0 truncate text-muted sm:inline">
						· Latest: {latestCat.short} → <em class="font-display not-italic text-fg">{latest.text}</em>
					</span>
					<a href="/scoreboard/{year}" class="ml-auto flex shrink-0 items-center gap-0.5 font-semibold text-gold hover:underline">
						Standings <Icon name="chevron-right" size={16} />
					</a>
				{/if}
			{:else}
				<Icon name="trophy" size={15} class="text-gold" />
				<span class="font-semibold">Final results</span>
				<span class="text-muted">· {year}</span>
				<a href="/scoreboard/{year}" class="ml-auto flex items-center gap-0.5 font-semibold text-gold hover:underline">
					Standings <Icon name="chevron-right" size={16} />
				</a>
			{/if}
		</div>
	</div>
{/if}
