<script>
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { onDestroy } from 'svelte';
	import { user } from '$lib/auth.js';
	import { settingsFor, categoriesFor, ballotsFor, ballotFor, currentYear } from '$lib/data/queries.js';
	import { buildLeaderboard, resultsFeed, announcedCount } from '$lib/domain/scoring.js';
	import { categoryOf } from '$lib/domain/keys.js';
	import { toast } from '$lib/stores/toast.js';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ListSkeleton from '$lib/components/ballot/ListSkeleton.svelte';

	export let data;
	$: year = data.year;
	$: settings = settingsFor(year);
	$: cats = categoriesFor(year);
	$: ballots = ballotsFor(year);
	$: mine = ballotFor(year, $user.uid);

	$: locked = $settings.locked;
	$: results = $settings.results;
	$: total = $cats.value.length;
	$: board = buildLeaderboard($ballots.value || {}, results);
	$: announced = announcedCount(results);
	$: live = locked && announced > 0;
	$: final = live && total && announced >= total;
	$: feed = live ? resultsFeed($cats.value, $ballots.value || {}, results) : [];
	$: names = [...board].sort((a, b) => a.displayName.localeCompare(b.displayName));
	$: myPicks = ($mine.value?.votes || []).filter(Boolean).length;

	$: podium = live ? board.filter((r) => r.rank <= 3).slice(0, 3) : [];
	$: rest = live ? board.slice(podium.length) : [];
	$: me = board.find((r) => r.uid === $user.uid);
	$: maxScore = Math.max(1, announced);
	$: tied = board.reduce((m, r) => ((m[r.rank] = (m[r.rank] || 0) + 1), m), {});
	const rankLabel = (rank, t) => (t[rank] > 1 ? `T${rank}` : `${rank}`);

	// Rank deltas shown briefly after each new result, plus a toast.
	let prevRanks = null;
	let deltas = {};
	let lastCount = null;
	let deltaTimer;
	$: if (live && !$ballots.loading) onResults(results.length, board);
	function onResults(count, rows) {
		if (lastCount !== null && count > lastCount) {
			const newRanks = Object.fromEntries(rows.map((r) => [r.uid, r.rank]));
			deltas = Object.fromEntries(rows.map((r) => [r.uid, (prevRanks?.[r.uid] ?? r.rank) - r.rank]).filter(([, d]) => d));
			clearTimeout(deltaTimer);
			deltaTimer = setTimeout(() => (deltas = {}), 6000);
			const f = feed[0];
			if (f) {
				const gotIt = f.keys.some((k) => ($mine.value?.votes || []).includes(k));
				toast(`${f.category}: ${f.winner}${f.tie ? ' (tie)' : ''}`, {
					tone: 'gold',
					timeout: 7000,
					detail: `${f.correct} of ${f.total} got it${gotIt ? ' — <strong>including you!</strong>' : ''}`
				});
			}
		}
		prevRanks = Object.fromEntries(rows.map((r) => [r.uid, r.rank]));
		lastCount = count;
	}
	onDestroy(() => clearTimeout(deltaTimer));

	// Pin "you" to the bottom when your row is scrolled out of view.
	let meVisible = true;
	function watchMe(node, isMe) {
		if (!isMe) return {};
		const io = new IntersectionObserver(([e]) => (meVisible = e.isIntersecting), { rootMargin: '-60px 0px -80px 0px' });
		io.observe(node);
		return { destroy: () => (io.disconnect(), (meVisible = true)) };
	}

	let openFeed = null;
	$: whoGotIt = (keys) =>
		board.filter((r) => keys.some((k) => r.votes.includes(k))).map((r) => r.displayName);

	const podiumOrder = (p) => (p.length === 3 ? [p[1], p[0], p[2]] : p);
	const medal = (rank) => (rank <= 3 ? rank : null);
	const ordinal = (n) => ['1st', '2nd', '3rd'][n - 1] || `${n}th`;
	$: loading = $settings.loading || $cats.loading || $ballots.loading;
	$: denied = $ballots.error && !$ballots.value;
</script>

<svelte:head><title>Leaderboard · {year}</title></svelte:head>

<header class="mb-6 flex flex-wrap items-end justify-between gap-3">
	<div>
		<p class="label-caps">{year} Academy Awards</p>
		<h1 class="page-title mt-1 flex items-center gap-3">
			Leaderboard
			{#if live && !final}
				<span class="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 font-sans text-xs font-bold uppercase tracking-wider text-danger">
					<span class="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-danger" /> Live
				</span>
			{/if}
		</h1>
	</div>
	{#if !loading}
		<p class="tnum text-sm text-muted">
			{#if live}{announced} of {total} announced{:else if locked}Voting closed · {board.length} ballots{:else}{board.length} ballots in{/if}
		</p>
	{/if}
</header>

{#if loading}
	<ListSkeleton />
{:else if !locked}
	<!-- Before lock: who's in, no ranking -->
	<div class="grid gap-6 lg:grid-cols-12">
		<section class="lg:col-span-7">
			<div class="card p-5 sm:p-6">
				<div class="mb-5 flex items-center justify-between">
					<h2 class="text-xl font-semibold">Who’s in</h2>
					<span class="tnum text-sm text-muted">{board.length} {board.length === 1 ? 'ballot' : 'ballots'}</span>
				</div>
				{#if denied}
					<p class="text-sm text-muted">Ballots stay private until voting closes.</p>
				{:else if names.length}
					<ul class="grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-4 md:grid-cols-5">
						{#each names as p (p.uid)}
							<li class="flex flex-col items-center gap-1.5 text-center">
								<Avatar name={p.displayName} size={52} highlight={p.uid === $user.uid} />
								<span class="w-full truncate text-[13px] font-medium {p.uid === $user.uid ? 'text-gold' : ''}">{p.displayName}</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-sm text-muted">Nobody yet — be the first.</p>
				{/if}
			</div>
		</section>
		<aside class="lg:col-span-5">
			<div class="card p-5 sm:p-6">
				<p class="label-caps">Your ballot</p>
				<p class="tnum mt-2 font-display text-4xl font-semibold">{myPicks}<span class="text-xl text-muted">/{total}</span></p>
				<div class="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
					<div class="h-full rounded-full bg-gold-fill" style="width:{total ? (myPicks / total) * 100 : 0}%" />
				</div>
				<p class="mt-3 text-sm text-muted">Rankings appear once voting closes and the first envelope is opened.</p>
				{#if year === $currentYear}
					<Button href="/" full class="mt-5">{myPicks < total ? 'Finish my ballot' : 'Review my ballot'}</Button>
				{/if}
			</div>
		</aside>
	</div>
{:else if !board.length}
	<EmptyState icon="users" title="No ballots for {year}">Nobody filled out a ballot this year.</EmptyState>
{:else}
	<div class="grid gap-6 lg:grid-cols-12 lg:gap-8">
		<section class="lg:col-span-7" aria-label="Standings">
			{#if live}
				<!-- Podium -->
				<div class="card mb-4 overflow-hidden px-3 pb-0 pt-6 sm:px-6">
					<ol class="flex items-end justify-center gap-2 sm:gap-6">
						{#each podiumOrder(podium) as p (p.uid)}
							{@const h = p.rank === 1 ? 'h-24 sm:h-28' : p.rank === 2 ? 'h-16 sm:h-20' : 'h-12 sm:h-14'}
							<li class="flex w-1/3 max-w-[160px] flex-col items-center">
								<a href="/scoreboard/{year}/{p.uid}" class="group flex flex-col items-center">
									{#if p.rank === 1}<Icon name="star" size={18} class="mb-1 fill-current text-gold-fill" />{/if}
									<Avatar name={p.displayName} size={p.rank === 1 ? 64 : 52} medal={p.rank} highlight={p.uid === $user.uid} />
									<span class="mt-2 w-full truncate text-center text-sm font-semibold group-hover:underline {p.uid === $user.uid ? 'text-gold' : ''}">{p.displayName}</span>
									<span class="tnum text-xs text-muted">{p.score} pts</span>
								</a>
								<div class="mt-2 grid w-full place-items-center rounded-t-sm {h}
									{p.rank === 1 ? 'bg-gold-fill/25' : 'bg-surface-2'}">
									<span class="font-display text-2xl font-semibold {p.rank === 1 ? 'text-gold' : 'text-muted'}">{rankLabel(p.rank, tied)}</span>
								</div>
							</li>
						{/each}
					</ol>
				</div>
			{/if}

			<ol class="space-y-1.5">
				{#each live ? rest : names.map((n) => ({ ...n, rank: null })) as row (row.uid)}
					{@const isMe = row.uid === $user.uid}
					<li animate:flip={{ duration: 450 }} use:watchMe={isMe}>
						<a
							href="/scoreboard/{year}/{row.uid}"
							class="group flex min-h-[56px] items-center gap-3 rounded-md border px-3 py-2 transition sm:px-4
								{isMe ? 'border-gold-fill bg-gold-fill/10' : 'border-line bg-surface hover:bg-surface-2'}"
						>
							{#if row.rank}
								<span class="tnum w-8 text-center font-display text-lg font-semibold text-muted" title={tied[row.rank] > 1 ? 'Tied' : undefined}>{rankLabel(row.rank, tied)}</span>
							{/if}
							<Avatar name={row.displayName} size={36} highlight={isMe} />
							<span class="min-w-0 flex-1">
								<span class="flex items-center gap-2">
									<span class="truncate font-semibold">{row.displayName}</span>
									{#if isMe}<span class="text-xs font-semibold text-gold">You</span>{/if}
									{#if deltas[row.uid]}
										<span transition:fade class="flex items-center text-xs font-bold {deltas[row.uid] > 0 ? 'text-success' : 'text-danger'}">
											<Icon name={deltas[row.uid] > 0 ? 'arrow-up' : 'arrow-down'} size={12} stroke={3} />{Math.abs(deltas[row.uid])}
										</span>
									{/if}
								</span>
								{#if live}
									<span class="mt-1.5 block h-1 overflow-hidden rounded-full bg-surface-2">
										<span class="block h-full rounded-full bg-gold-fill/70 transition-[width] duration-700" style="width:{(row.score / maxScore) * 100}%" />
									</span>
								{/if}
							</span>
							{#if live}<span class="tnum w-8 text-right font-display text-xl font-semibold">{row.score}</span>{/if}
							<Icon name="chevron-right" size={18} class="text-muted transition group-hover:translate-x-0.5" />
						</a>
					</li>
				{/each}
			</ol>
			{#if !live}
				<p class="mt-4 text-center text-sm text-muted">Tap a name to see their ballot. Scores start with the first envelope.</p>
			{/if}
		</section>

		<!-- Results feed -->
		{#if live}
			<aside class="lg:col-span-5" aria-label="Announced results">
				<div class="lg:sticky lg:top-24">
					<h2 class="mb-3 text-xl font-semibold">Results</h2>
					<ol class="card divide-y divide-line overflow-hidden lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto">
						{#each feed as f, i (f.key)}
							<li>
								<button
									class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
									aria-expanded={openFeed === f.key}
									on:click={() => (openFeed = openFeed === f.key ? null : f.key)}
								>
									<span class="grid h-8 w-8 shrink-0 place-items-center rounded-full {i === 0 && !final ? 'bg-gold-fill text-on-gold' : 'bg-surface-2 text-gold'}">
										<Icon name="trophy" size={15} />
									</span>
									<span class="min-w-0 flex-1">
										<span class="label-caps block !text-[11px]">{f.category.replace(/^Best /, '')}</span>
										<span class="block truncate font-display text-[17px] font-semibold">{f.winner}</span>
									</span>
									<span class="text-right">
										<span class="tnum block text-sm font-semibold">{f.total ? Math.round((f.correct / f.total) * 100) : 0}%</span>
										<span class="block text-[11px] text-muted">got it</span>
									</span>
								</button>
								{#if openFeed === f.key}
									<p class="px-4 pb-3 pl-[60px] text-sm text-muted">
										{whoGotIt(f.keys).join(', ') || 'Nobody picked it.'}
									</p>
								{/if}
							</li>
						{/each}
					</ol>
				</div>
			</aside>
		{/if}
	</div>

	<!-- Pinned "you" row -->
	{#if live && me && !meVisible && me.rank > 3}
		<a
			href="/scoreboard/{year}/{me.uid}"
			transition:fade={{ duration: 150 }}
			class="fixed inset-x-4 bottom-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom)+12px)] z-30 mx-auto flex max-w-lg items-center gap-3 rounded-md border border-gold-fill bg-surface px-4 py-2.5 shadow-lift lg:bottom-6"
		>
			<span class="tnum w-8 text-center font-display text-lg font-semibold text-gold">{rankLabel(me.rank, tied)}</span>
			<Avatar name={me.displayName} size={32} highlight />
			<span class="flex-1 truncate font-semibold">You · {ordinal(me.rank)} of {board.length}</span>
			<span class="tnum font-display text-xl font-semibold">{me.score}</span>
		</a>
	{/if}
{/if}
