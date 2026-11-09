<script>
	import { onMount } from 'svelte';
	import { user } from '$lib/auth.js';
	import { read } from '$lib/data/db.js';
	import { medalTable, champions } from '$lib/domain/scoring.js';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ListSkeleton from '$lib/components/ballot/ListSkeleton.svelte';

	let table = [];
	let champs = [];
	let yearCount = 0;
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			const settings = (await read('settings')) || {};
			const locked = Object.entries(settings).filter(([, s]) => s?.locked);
			// Fetch every locked year in parallel.
			const yearsData = await Promise.all(
				locked.map(async ([year, s]) => ({
					year,
					results: (s.results || []).filter(Boolean),
					ballots: (await read(`ballots/${year}`)) || {}
				}))
			);
			const scored = yearsData.filter((y) => y.results.length);
			table = medalTable(scored);
			champs = champions(scored);
			yearCount = scored.length;
		} catch (err) {
			console.error(err);
			error = 'Couldn’t load all-time results.';
		} finally {
			loading = false;
		}
	});

	let sortKey = 'total';
	let asc = false;
	const columns = [
		{ key: 'displayName', label: 'Name' },
		{ key: 'gold', label: 'Gold' },
		{ key: 'silver', label: 'Silver' },
		{ key: 'bronze', label: 'Bronze' },
		{ key: 'total', label: 'Points' }
	];
	function sortBy(key) {
		if (sortKey === key) asc = !asc;
		else (sortKey = key), (asc = key === 'displayName');
	}
	$: sorted = [...table].sort((a, b) => {
		const av = a[sortKey];
		const bv = b[sortKey];
		const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
		return asc ? cmp : -cmp;
	});
	// Overall standing (by points) regardless of current sort.
	$: standing = Object.fromEntries(table.map((p, i) => [p.displayName, i + 1]));

	let selected = null;
	let sheetOpen = false;
	function open(p) {
		selected = p;
		sheetOpen = true;
	}

	const medals = [
		{ key: 'gold', color: '#C9A227', label: 'Gold' },
		{ key: 'silver', color: '#A8A9AD', label: 'Silver' },
		{ key: 'bronze', color: '#B0703A', label: 'Bronze' }
	];
	const placeText = (r) => (r === 1 ? '1st' : r === 2 ? '2nd' : r === 3 ? '3rd' : `${r}th`);

	/** Sparkline of finishing position (higher = better) oldest→newest. */
	function spark(history, w = 72, h = 24) {
		const pts = [...history].reverse();
		if (pts.length < 2) return '';
		const worst = Math.max(...pts.map((p) => p.of || p.rank), 3);
		return pts
			.map((p, i) => {
				const x = (i / (pts.length - 1)) * (w - 4) + 2;
				const y = ((p.rank - 1) / Math.max(1, worst - 1)) * (h - 4) + 2;
				return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
			})
			.join(' ');
	}
	$: myName = $user?.displayName;
	$: showTrend = yearCount >= 3;
</script>

<svelte:head><title>All-Time Medals</title></svelte:head>

<header class="mb-6">
	<p class="label-caps">Since we moved online</p>
	<h1 class="page-title mt-1">All-Time Medals</h1>
	{#if !loading && yearCount}<p class="mt-1 text-sm text-muted">Gold 3 pts · Silver 2 · Bronze 1 · {yearCount} ceremonies</p>{/if}
</header>

{#if loading}
	<ListSkeleton rows={6} />
{:else if error}
	<EmptyState icon="alert" title={error}>Check your connection and refresh.</EmptyState>
{:else if !table.length}
	<EmptyState icon="medal" title="No results yet">Medals appear after the first ceremony is scored.</EmptyState>
{:else}
	<!-- Hall of Champions -->
	<section class="mb-6" aria-label="Past champions">
		<h2 class="label-caps mb-2">Hall of Champions</h2>
		<ul class="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
			{#each champs as c (c.year)}
				<li class="card flex min-w-[140px] shrink-0 items-center gap-3 px-3.5 py-3">
					<Icon name="trophy" size={20} class="text-gold" />
					<div class="min-w-0">
						<p class="tnum text-xs font-semibold text-muted">{c.year}</p>
						<p class="truncate font-display font-semibold">{c.names.join(' & ')}</p>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Mobile/tablet: cards -->
	<div class="lg:hidden">
		<label class="mb-3 flex items-center justify-end gap-2 text-sm text-muted">
			Sort by
			<select bind:value={sortKey} on:change={() => (asc = sortKey === 'displayName')} class="h-9 rounded-sm border border-line bg-surface px-2.5 font-semibold text-fg">
				{#each columns as c}<option value={c.key}>{c.label}</option>{/each}
			</select>
		</label>
		<ol class="grid gap-2 sm:grid-cols-2">
			{#each sorted as p (p.displayName)}
				{@const me = p.displayName === myName}
				<li>
					<button
						on:click={() => open(p)}
						class="flex w-full items-center gap-3 rounded-md border p-3 text-left transition active:scale-[.99]
							{me ? 'border-gold-fill bg-gold-fill/10' : 'border-line bg-surface'}"
					>
						<span class="tnum w-6 text-center font-display text-lg font-semibold text-muted">{standing[p.displayName]}</span>
						<Avatar name={p.displayName} size={40} medal={standing[p.displayName] <= 3 ? standing[p.displayName] : null} highlight={me} />
						<span class="min-w-0 flex-1">
							<span class="block truncate font-semibold">{p.displayName}</span>
							<span class="tnum mt-1 flex items-center gap-2.5 text-[13px] text-muted">
								{#each medals as m}
									<span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full" style="background:{m.color}" aria-hidden="true" />{p[m.key]}<span class="sr-only"> {m.label}</span></span>
								{/each}
							</span>
						</span>
						{#if p.history.length >= 3}<svg width="56" height="24" class="shrink-0 text-gold" aria-hidden="true"><path d={spark(p.history, 56, 24)} fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" /></svg>{/if}
						<span class="tnum w-9 text-right font-display text-xl font-semibold">{p.total}</span>
					</button>
				</li>
			{/each}
		</ol>
	</div>

	<!-- Desktop: table -->
	<div class="card hidden overflow-clip lg:block">
		<table class="w-full text-left">
			<thead class="sticky top-16 z-10 border-b border-line bg-surface-2">
				<tr>
					<th scope="col" class="w-16 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">#</th>
					{#each columns as c}
						<th scope="col" aria-sort={sortKey === c.key ? (asc ? 'ascending' : 'descending') : 'none'} class="px-2 py-1.5 {c.key === 'displayName' ? '' : 'text-center'}">
							<button on:click={() => sortBy(c.key)} class="inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-xs font-semibold uppercase tracking-wider hover:bg-line/50 {sortKey === c.key ? 'text-fg' : 'text-muted'}">
								{#if c.key in { gold: 1, silver: 1, bronze: 1 }}
									<span class="h-3 w-3 rounded-full" style="background:{medals.find((m) => m.key === c.key).color}" aria-hidden="true" />
								{/if}
								{c.label}
								<Icon name={sortKey === c.key && asc ? 'arrow-up' : 'arrow-down'} size={13} class={sortKey === c.key ? 'opacity-100' : 'opacity-0'} />
							</button>
						</th>
					{/each}
					{#if showTrend}<th scope="col" class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Trend</th>{/if}
				</tr>
			</thead>
			<tbody class="divide-y divide-line">
				{#each sorted as p (p.displayName)}
					{@const me = p.displayName === myName}
					<tr class="transition hover:bg-surface-2 {me ? 'bg-gold-fill/10' : ''}">
						<td class="tnum px-4 py-3 font-display text-lg font-semibold text-muted">{standing[p.displayName]}</td>
						<td class="px-4 py-2">
							<button on:click={() => open(p)} class="flex items-center gap-3 rounded-sm text-left font-semibold hover:underline">
								<Avatar name={p.displayName} size={34} medal={standing[p.displayName] <= 3 ? standing[p.displayName] : null} highlight={me} />
								{p.displayName}
							</button>
						</td>
						{#each medals as m}
							<td class="tnum px-4 py-3 text-center text-[15px] {p[m.key] ? 'font-semibold' : 'text-muted'}">{p[m.key]}</td>
						{/each}
						<td class="tnum px-4 py-3 text-center font-display text-xl font-semibold">{p.total}</td>
						{#if showTrend}<td class="px-4 py-3">
							<svg width="88" height="26" class="text-gold" aria-hidden="true"><path d={spark(p.history, 88, 26)} fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" /></svg>
						</td>{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<Sheet bind:open={sheetOpen} title={selected?.displayName || ''}>
	{#if selected}
		<div class="mb-4 grid grid-cols-4 gap-2 text-center">
			{#each medals as m}
				<div class="rounded-sm bg-surface-2 py-2.5">
					<p class="tnum font-display text-2xl font-semibold">{selected[m.key]}</p>
					<p class="flex items-center justify-center gap-1 text-xs text-muted"><span class="h-2 w-2 rounded-full" style="background:{m.color}" />{m.label}</p>
				</div>
			{/each}
			<div class="rounded-sm bg-gold-fill/15 py-2.5">
				<p class="tnum font-display text-2xl font-semibold text-gold">{selected.total}</p>
				<p class="text-xs text-muted">Points</p>
			</div>
		</div>
		<p class="label-caps mb-2">Year by year</p>
		<ul class="divide-y divide-line">
			{#each selected.history as h (h.year)}
				<li class="flex items-center justify-between py-2.5">
					<span class="tnum font-semibold">{h.year}</span>
					<span class="flex items-center gap-2 text-sm">
						{#if h.rank <= 3}<span class="h-2.5 w-2.5 rounded-full" style="background:{medals[h.rank - 1].color}" />{/if}
						<span class={h.rank <= 3 ? 'font-semibold' : 'text-muted'}>{placeText(h.rank)} of {h.of}</span>
						<span class="tnum w-12 text-right text-muted">{h.score} pts</span>
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</Sheet>
