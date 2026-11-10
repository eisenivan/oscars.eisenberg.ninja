<script>
	import { onDestroy, tick } from 'svelte';
	import { user } from '$lib/auth.js';
	import { activeYear } from '$lib/data/year.js';
	import { currentYear, settingsFor, categoriesFor, ballotFor, ballotsFor, saveVote } from '$lib/data/queries.js';
	import { byCategory, winnersOf } from '$lib/domain/keys.js';
	import { scoreVotes, buildLeaderboard, announcedCount } from '$lib/domain/scoring.js';
	import { toast, haptic } from '$lib/stores/toast.js';
	import CategoryCard from '$lib/components/ballot/CategoryCard.svelte';
	import BallotSkeleton from '$lib/components/ballot/BallotSkeleton.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	$: year = $activeYear;
	$: settings = settingsFor(year);
	$: cats = categoriesFor(year);
	$: mine = ballotFor(year, $user.uid);
	// Everyone's ballots are only readable once voting is locked.
	$: everyone = $settings.locked ? ballotsFor(year) : null;

	$: categories = $cats.value;
	$: editable = !$settings.locked && year === $currentYear;
	$: results = $settings.results;
	$: winners = winnersOf(results);
	$: announced = announcedCount(results);

	// Optimistic picks layered over the saved ballot.
	let pending = {};
	let saveState = {};
	$: if (year) (pending = {}), (saveState = {});
	$: saved = byCategory($mine.value?.votes);
	$: picks = { ...saved, ...pending };
	$: pickedCount = categories.filter((c) => picks[c.id]).length;
	$: hasBallot = Object.keys(saved).length > 0;

	$: showResults = $settings.locked && results.length > 0;
	$: score = scoreVotes(Object.values(picks), results);
	$: board = $everyone?.value ? buildLeaderboard($everyone.value, results) : [];
	$: myRow = board.find((r) => r.uid === $user.uid);

	$: loading = $settings.loading || $cats.loading || $mine.loading;

	const timers = {};
	async function pick({ detail: { cat, key } }) {
		haptic();
		const previous = picks[cat.id];
		pending = { ...pending, [cat.id]: key };
		saveState = { ...saveState, [cat.id]: 'saving' };
		clearTimeout(timers[cat.id]);
		autoAdvance(cat);
		try {
			await saveVote(year, $user, key);
			saveState = { ...saveState, [cat.id]: 'saved' };
			timers[cat.id] = setTimeout(() => {
				const { [cat.id]: _, ...rest } = saveState;
				saveState = rest;
			}, 1800);
			const { [cat.id]: __, ...restPending } = pending;
			pending = restPending;
		} catch (err) {
			console.error(err);
			const { [cat.id]: _, ...restPending } = pending;
			pending = previous && previous !== saved[cat.id] ? { ...restPending, [cat.id]: previous } : restPending;
			saveState = { ...saveState, [cat.id]: 'error' };
			toast(`Couldn’t save your ${cat.short} pick`, {
				tone: 'danger',
				timeout: 8000,
				action: { label: 'Retry', run: () => pick({ detail: { cat, key } }) }
			});
		}
	}
	onDestroy(() => Object.values(timers).forEach(clearTimeout));

	// After a pick, glide to the next empty category if it's off-screen.
	async function autoAdvance(cat) {
		const i = categories.findIndex((c) => c.id === cat.id);
		const next = [...categories.slice(i + 1), ...categories.slice(0, i)].find((c) => !picks[c.id]);
		if (!next) {
			if (pickedCount === categories.length)
				toast('Ballot complete!', { tone: 'gold', detail: 'You can change picks until voting closes.' });
			return;
		}
		await tick();
		const el = document.getElementById(`cat-${next.id}`);
		if (!el) return;
		const rect = el.getBoundingClientRect();
		if (rect.top > window.innerHeight * 0.75) {
			setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
		}
	}

	function jumpTo(id) {
		document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	// Highlight the chip/sidebar entry for the category in view.
	let activeId = null;
	let rail;
	function observe(node) {
		const io = new IntersectionObserver(
			(entries) => {
				const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
				if (top) activeId = top.target.dataset.cat;
			},
			{ rootMargin: '-140px 0px -55% 0px' }
		);
		const scan = () => node.querySelectorAll('[data-cat]').forEach((el) => io.observe(el));
		scan();
		const mo = new MutationObserver(scan);
		mo.observe(node, { childList: true, subtree: true });
		return { destroy: () => (io.disconnect(), mo.disconnect()) };
	}
	$: if (rail && activeId) {
		rail.querySelector(`[data-chip="${activeId}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
	}

	$: statusOf = (c) =>
		winners[c.id]
			? winners[c.id].includes(picks[c.id])
				? 'correct'
				: picks[c.id]
				? 'missed'
				: 'none'
			: picks[c.id]
			? 'picked'
			: 'empty';
	const statusIcon = { correct: 'check', missed: 'x', picked: 'check', none: 'trophy' };
	const statusColor = { correct: 'text-success', missed: 'text-danger', picked: 'text-gold', none: 'text-gold', empty: 'text-muted' };

	$: pct = categories.length ? Math.round(((showResults ? announced : pickedCount) / categories.length) * 100) : 0;
	$: ringPct = announced ? score / announced : 0;
	$: firstEmpty = categories.find((c) => !picks[c.id]);
</script>

<svelte:head><title>My Ballot · {year}</title></svelte:head>

<header class="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
	<div>
		<p class="label-caps">{year} Academy Awards</p>
		<h1 class="page-title mt-1">My Ballot</h1>
	</div>
	{#if !loading && !editable && !showResults}
		<p class="flex items-center gap-1.5 text-sm text-muted">
			<Icon name="lock" size={15} />
			{year === $currentYear ? 'Voting is closed' : 'Past ballot'}
		</p>
	{/if}
</header>

{#if loading}
	<BallotSkeleton />
{:else if !categories.length}
	<EmptyState icon="calendar" title="Nominations aren’t in yet">
		The {year} ballot will appear here once nominations are announced.
	</EmptyState>
{:else}
	<!-- Mobile/tablet: sticky progress + category chip rail -->
	<div
		class="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 -mx-4 mb-4 border-b border-line/70 bg-bg/90 px-4 pb-2 pt-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden"
	>
		<div class="mb-2 flex items-center gap-3">
			<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={showResults ? 'Categories announced' : 'Ballot progress'}>
				<div class="h-full rounded-full bg-gold-fill transition-[width] duration-500" style="width:{pct}%" />
			</div>
			<span class="tnum text-xs font-semibold text-muted">
				{#if showResults}<span class="text-fg">{score}</span>/{announced} correct{:else}{pickedCount}/{categories.length}{/if}
			</span>
		</div>
		<div bind:this={rail} class="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
			{#each categories as c (c.id)}
				{@const s = statusOf(c)}
				<button
					data-chip={c.id}
					on:click={() => jumpTo(c.id)}
					class="flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-[13px] font-medium transition
						{activeId === c.id ? 'border-gold-fill bg-gold-fill/15 text-fg' : 'border-line bg-surface text-muted'}"
				>
					{#if statusIcon[s]}<Icon name={statusIcon[s]} size={13} stroke={2.75} class={statusColor[s]} />{/if}
					{c.short}
				</button>
			{/each}
		</div>
	</div>

	<div class="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
		<!-- Desktop sidebar -->
		<aside class="hidden lg:block">
			<div class="sticky top-24 space-y-4">
				{#if showResults}
					<div class="card p-4">
						<div class="flex items-center gap-4">
							<svg viewBox="0 0 36 36" class="h-16 w-16 -rotate-90" aria-hidden="true">
								<circle cx="18" cy="18" r="15.5" fill="none" stroke="rgb(var(--surface-2))" stroke-width="4" />
								<circle cx="18" cy="18" r="15.5" fill="none" stroke="rgb(var(--gold-fill))" stroke-width="4" stroke-linecap="round" stroke-dasharray="{ringPct * 97.4} 97.4" class="transition-all duration-700" />
							</svg>
							<div>
								<p class="tnum font-display text-3xl font-semibold leading-none">{score}<span class="text-lg text-muted">/{announced}</span></p>
								<p class="mt-1 text-sm text-muted">correct so far</p>
							</div>
						</div>
						{#if myRow}
							<a href="/scoreboard/{year}" class="mt-3 flex items-center justify-between rounded-sm bg-surface-2 px-3 py-2 text-sm font-medium hover:bg-line/60">
								<span>You’re <strong class="tnum text-gold">#{myRow.rank}</strong> of {board.length}</span>
								<Icon name="chevron-right" size={16} class="text-muted" />
							</a>
						{/if}
					</div>
				{:else}
					<div class="card p-4">
						<p class="tnum font-display text-3xl font-semibold leading-none">{pickedCount}<span class="text-lg text-muted">/{categories.length}</span></p>
						<p class="mt-1 text-sm text-muted">{editable ? 'categories picked' : 'picks made'}</p>
						<div class="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
							<div class="h-full rounded-full bg-gold-fill transition-[width] duration-500" style="width:{pct}%" />
						</div>
					</div>
				{/if}
				<nav aria-label="Categories" class="max-h-[calc(100dvh-16rem)] overflow-y-auto pr-1">
					<ul class="space-y-0.5">
						{#each categories as c (c.id)}
							{@const s = statusOf(c)}
							<li>
								<button
									on:click={() => jumpTo(c.id)}
									class="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm transition
										{activeId === c.id ? 'bg-surface-2 font-semibold text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg'}"
								>
									<span class="grid w-4 place-items-center {statusColor[s]}">
										{#if statusIcon[s]}<Icon name={statusIcon[s]} size={14} stroke={2.75} />{:else}<span class="h-1.5 w-1.5 rounded-full bg-line" />{/if}
									</span>
									<span class="truncate">{c.short}</span>
								</button>
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</aside>

		<div>
			{#if showResults}
				<!-- Mobile score summary -->
				<div class="card mb-4 flex items-center gap-4 p-4 lg:hidden">
					<svg viewBox="0 0 36 36" class="h-14 w-14 shrink-0 -rotate-90" aria-hidden="true">
						<circle cx="18" cy="18" r="15.5" fill="none" stroke="rgb(var(--surface-2))" stroke-width="4" />
						<circle cx="18" cy="18" r="15.5" fill="none" stroke="rgb(var(--gold-fill))" stroke-width="4" stroke-linecap="round" stroke-dasharray="{ringPct * 97.4} 97.4" />
					</svg>
					<div class="min-w-0 flex-1">
						<p class="tnum font-display text-2xl font-semibold leading-none">{score}<span class="text-base text-muted"> / {announced} correct</span></p>
						{#if myRow}<p class="mt-1 text-sm text-muted">You’re <strong class="tnum text-gold">#{myRow.rank}</strong> of {board.length}</p>{/if}
					</div>
					<Button href="/scoreboard/{year}" variant="secondary" size="sm">Standings</Button>
				</div>
			{/if}

			{#if !editable && !hasBallot}
				<div class="card mb-4 flex items-center gap-3 p-4 text-sm text-muted">
					<Icon name="info" size={18} /> You didn’t submit a ballot for {year}.{#if showResults} Winners are shown below.{/if}
				</div>
			{/if}

			<div use:observe class="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
				{#each categories as cat, i (cat.id)}
					<CategoryCard
						{cat}
						index={i}
						pick={picks[cat.id]}
						winners={$settings.locked ? winners[cat.id] : undefined}
						{editable}
						{hasBallot}
						saveState={saveState[cat.id]}
						on:pick={pick}
					/>
				{/each}
			</div>
		</div>
	</div>

	{#if editable && firstEmpty && pickedCount > 0}
		<button
			on:click={() => jumpTo(firstEmpty.id)}
			class="fixed bottom-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom)+16px)] right-4 z-30 flex h-11 items-center gap-1.5 rounded-full bg-fg pl-3.5 pr-4 text-sm font-semibold text-bg shadow-lift lg:bottom-8 lg:right-8"
		>
			<Icon name="arrow-down" size={16} /> Next empty
		</button>
	{/if}
{/if}
