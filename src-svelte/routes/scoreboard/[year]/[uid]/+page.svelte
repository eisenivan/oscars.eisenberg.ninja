<script>
	import { user } from '$lib/auth.js';
	import { settingsFor, categoriesFor, ballotsFor } from '$lib/data/queries.js';
	import { byCategory, winnersOf } from '$lib/domain/keys.js';
	import { buildLeaderboard, announcedCount } from '$lib/domain/scoring.js';
	import CategoryCard from '$lib/components/ballot/CategoryCard.svelte';
	import BallotSkeleton from '$lib/components/ballot/BallotSkeleton.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	export let data;
	$: ({ year, uid } = data);
	$: settings = settingsFor(year);
	$: cats = categoriesFor(year);
	$: ballots = ballotsFor(year);

	$: isMe = uid === $user.uid;
	$: theirs = $ballots.value?.[uid];
	$: mineB = $ballots.value?.[$user.uid];
	$: them = byCategory(theirs?.votes);
	$: me = byCategory(mineB?.votes);
	$: winners = winnersOf($settings.results);
	$: announced = announcedCount($settings.results);
	$: board = buildLeaderboard($ballots.value || {}, $settings.results);
	$: row = board.find((r) => r.uid === uid);
	$: name = theirs?.displayName || 'Ballot';
	$: canCompare = !isMe && mineB?.votes?.length;

	let mode = 'theirs';
	const modes = [
		{ value: 'theirs', label: 'Their ballot' },
		{ value: 'compare', label: 'Compare' },
		{ value: 'diff', label: 'Differences' }
	];

	$: categories = $cats.value;
	$: same = categories.filter((c) => them[c.id] && them[c.id] === me[c.id]).length;
	$: different = categories.filter((c) => them[c.id] !== me[c.id]);
	$: pendingDiff = different.filter((c) => !winners[c.id]).length;
	$: shown = mode === 'diff' ? different : categories;
	$: candidate = (cat, key) => cat.candidates.find((c) => c.key === key);

	$: loading = $settings.loading || $cats.loading || $ballots.loading;
</script>

<svelte:head><title>{name} · {year}</title></svelte:head>

<a href="/scoreboard/{year}" class="mb-4 inline-flex h-9 items-center gap-1 rounded-sm pr-2 text-sm font-medium text-muted hover:text-fg">
	<Icon name="chevron-left" size={18} /> Leaderboard
</a>

{#if loading}
	<BallotSkeleton />
{:else if !$settings.locked || !theirs}
	<EmptyState icon="lock" title="Ballot not available">
		{#if !$settings.locked}Ballots are private until voting closes.{:else}This person didn’t submit a ballot for {year}.{/if}
		<svelte:fragment slot="action"><Button href="/scoreboard/{year}" variant="secondary">Back to leaderboard</Button></svelte:fragment>
	</EmptyState>
{:else}
	<header class="mb-6 flex flex-wrap items-center gap-4">
		<Avatar name={name} size={56} medal={row && row.rank <= 3 && announced ? row.rank : null} highlight={isMe} />
		<div class="min-w-0 flex-1">
			<p class="label-caps">{year} ballot</p>
			<h1 class="page-title mt-0.5 truncate">{isMe ? 'Your ballot' : name}</h1>
		</div>
		{#if row && announced}
			<div class="flex gap-6 text-right">
				<div>
					<p class="tnum font-display text-3xl font-semibold leading-none text-gold">#{row.rank}</p>
					<p class="mt-1 text-xs text-muted">of {board.length}</p>
				</div>
				<div>
					<p class="tnum font-display text-3xl font-semibold leading-none">{row.score}</p>
					<p class="mt-1 text-xs text-muted">of {announced}</p>
				</div>
			</div>
		{/if}
	</header>

	{#if canCompare}
		<div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="w-full sm:w-auto"><Segmented options={modes} bind:value={mode} label="View" full /></div>
			{#if mode !== 'theirs'}
				<p class="tnum flex flex-wrap gap-x-3 text-sm text-muted">
					<span><strong class="text-fg">{same}</strong> same</span>
					<span><strong class="text-info">{different.length}</strong> different</span>
					<span><strong class="text-fg">{pendingDiff}</strong> different &amp; pending</span>
				</p>
			{/if}
		</div>
	{/if}

	{#if mode === 'theirs' || !canCompare}
		<div class="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each categories as cat, i (cat.id)}
				<CategoryCard {cat} index={i} pick={them[cat.id]} winners={winners[cat.id]} pickLabel={isMe ? 'Your pick' : `${name.split(' ')[0]}’s pick`} />
			{/each}
		</div>
	{:else if !shown.length}
		<EmptyState icon="check" title="Identical ballots">You and {name} made exactly the same picks.</EmptyState>
	{:else}
		<!-- Compare: Them vs You -->
		<div class="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 px-5 pb-2 md:grid">
			<span class="label-caps">Category</span>
			<span class="label-caps truncate">{name}</span>
			<span class="label-caps">You</span>
		</div>
		<ul class="space-y-2.5">
			{#each shown as cat (cat.id)}
				{@const w = winners[cat.id] || []}
				{@const t = them[cat.id]}
				{@const m = me[cat.id]}
				{@const agree = t && t === m}
				<li class="card p-4 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-4 md:px-5 {agree ? '' : 'border-l-4 border-l-info'}">
					<div class="mb-2 flex items-center justify-between md:mb-0 md:block">
						<p class="font-display text-[17px] font-semibold leading-tight">{cat.short}</p>
						{#if w.length}
							<p class="flex items-center gap-1 text-xs font-medium text-gold md:mt-1"><Icon name="trophy" size={13} /> {w.map((k) => candidate(cat, k)?.text).join(' & ')}{w.length > 1 ? ' (tie)' : ''}</p>
						{:else}
							<p class="text-xs text-muted md:mt-1">Pending</p>
						{/if}
					</div>
					{#if agree}
						<p class="flex items-center gap-2 text-[15px] md:col-span-2">
							<span class="text-xs font-semibold uppercase tracking-wider text-muted">Both</span>
							<span class="font-semibold">{candidate(cat, t)?.text}</span>
							{#if w.length}<Icon name={w.includes(t) ? 'check' : 'x'} size={16} stroke={2.75} class={w.includes(t) ? 'text-success' : 'text-danger'} />{/if}
						</p>
					{:else}
						{#each [[name.split(' ')[0], t], ['You', m]] as [who, key], j}
							<p class="flex items-center gap-2 py-0.5 text-[15px]">
								<span class="w-14 shrink-0 truncate text-xs font-semibold uppercase tracking-wider text-muted md:hidden">{who}</span>
								<span class="truncate {key ? 'font-semibold' : 'italic text-muted'} {j === 1 ? 'text-info' : ''}">{key ? candidate(cat, key)?.text : 'No pick'}</span>
								{#if w.length && key}<Icon name={w.includes(key) ? 'check' : 'x'} size={16} stroke={2.75} class={w.includes(key) ? 'text-success' : 'text-danger'} />{/if}
							</p>
						{/each}
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
{/if}
