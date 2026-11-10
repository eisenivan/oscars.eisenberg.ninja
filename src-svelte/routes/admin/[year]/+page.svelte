<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/auth.js';
	import { settingsFor, categoriesFor, saveResults, saveLocked, isAdmin } from '$lib/data/queries.js';
	import { winnersOf, upsertKey, removeCategory, toggleKey, categoryOf } from '$lib/domain/keys.js';
	import { toast, haptic } from '$lib/stores/toast.js';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import ListSkeleton from '$lib/components/ballot/ListSkeleton.svelte';

	export let data;
	$: year = data.year;
	$: settings = settingsFor(year);
	$: cats = categoriesFor(year);

	let allowed = null;
	onMount(async () => {
		allowed = await isAdmin($user.uid);
		if (!allowed) goto('/');
	});

	$: results = $settings.results;
	$: winners = winnersOf(results);
	$: categories = $cats.value;
	$: pending = categories.filter((c) => !winners[c.id]);
	// Most recently announced first; a tie shows once.
	$: announced = [...new Set([...results].reverse().map(categoryOf))].map((id) => categories.find((c) => c.id === id)).filter(Boolean);
	const names = (cat, keys = []) => keys.map((k) => cat.candidates.find((x) => x.key === k)?.text).filter(Boolean).join(' & ');
	$: next = pending[0];

	let sheetCat = null;
	let sheetOpen = false;
	let confirmLock = false;
	let busy = false;
	let tieMode = false;
	const openCat = (c) => ((sheetCat = c), (tieMode = (winners[c.id] || []).length > 1), (sheetOpen = true));

	/** Normal tap: this nominee is the winner. Tie mode: add/remove it as a co-winner. */
	async function setWinner(cat, key) {
		haptic(15);
		const before = results;
		const updated = tieMode ? toggleKey(results, key) : upsertKey(results, key);
		if (!tieMode) sheetOpen = false;
		try {
			await saveResults(year, updated);
			const now = winnersOf(updated)[cat.id] || [];
			const label = now.length ? `${names(cat, now)}${now.length > 1 ? ' (tie)' : ''}` : 'cleared';
			toast(`${cat.short}: ${label}`, {
				tone: 'gold',
				timeout: 6000,
				action: { label: 'Undo', run: () => saveResults(year, before) }
			});
		} catch (err) {
			toast('Couldn’t save result', { tone: 'danger', detail: err.message });
		}
	}

	async function clear(cat) {
		const before = results;
		sheetOpen = false;
		await saveResults(year, removeCategory(results, cat.id));
		toast(`${cat.short} cleared`, { action: { label: 'Undo', run: () => saveResults(year, before) } });
	}

	async function toggleLock() {
		busy = true;
		try {
			await saveLocked(year, !$settings.locked);
			toast($settings.locked ? 'Voting closed' : 'Voting reopened', { tone: 'success' });
		} finally {
			busy = false;
			confirmLock = false;
		}
	}
</script>

<svelte:head><title>Results entry · {year}</title></svelte:head>

<div class="mx-auto max-w-3xl">
	<header class="mb-6">
		<a href="/admin" class="mb-2 inline-flex items-center gap-0.5 text-sm font-medium text-muted hover:text-fg"><Icon name="chevron-left" size={16} /> Seasons</a>
		<p class="label-caps">Admin · {year}</p>
		<h1 class="page-title mt-1">Results entry</h1>
	</header>

	{#if !allowed || $settings.loading || $cats.loading}
		<ListSkeleton rows={5} />
	{:else}
		<section class="card mb-4 flex items-center justify-between gap-4 p-4 sm:p-5">
			<div class="flex items-center gap-3">
				<span class="grid h-10 w-10 place-items-center rounded-full {$settings.locked ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}">
					<Icon name="lock" size={19} />
				</span>
				<div>
					<p class="font-semibold">{$settings.locked ? 'Voting closed' : 'Voting open'}</p>
					<p class="text-sm text-muted">{$settings.locked ? 'Ballots are locked and public.' : 'People can still change picks.'}</p>
				</div>
			</div>
			<button
				role="switch"
				aria-checked={$settings.locked}
				aria-label="Close voting"
				on:click={() => (confirmLock = true)}
				class="relative h-8 w-14 shrink-0 rounded-full transition {$settings.locked ? 'bg-gold-fill' : 'bg-line'}"
			>
				<span class="absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all {$settings.locked ? 'left-7' : 'left-1'}" />
			</button>
		</section>

		{#if next}
			<button on:click={() => openCat(next)} class="mb-6 flex w-full items-center gap-4 rounded-md bg-gold-fill p-4 text-left text-on-gold shadow-lift transition active:scale-[.99] sm:p-5">
				<Icon name="trophy" size={26} />
				<span class="flex-1">
					<span class="block text-xs font-bold uppercase tracking-[0.14em] opacity-70">Next up · {announced.length + 1} of {categories.length}</span>
					<span class="block font-display text-xl font-semibold">{next.name}</span>
				</span>
				<Icon name="chevron-right" size={22} />
			</button>
		{:else}
			<p class="card mb-6 flex items-center gap-3 p-4 font-semibold text-success"><Icon name="check" /> All {categories.length} categories announced.</p>
		{/if}

		<div class="grid gap-6 md:grid-cols-2">
			<section>
				<h2 class="label-caps mb-2">Pending · {pending.length}</h2>
				<ul class="card divide-y divide-line">
					{#each pending as c (c.id)}
						<li><button on:click={() => openCat(c)} class="flex min-h-[52px] w-full items-center justify-between px-4 text-left hover:bg-surface-2">{c.short}<Icon name="chevron-right" size={18} class="text-muted" /></button></li>
					{:else}
						<li class="px-4 py-3 text-sm text-muted">None</li>
					{/each}
				</ul>
			</section>
			<section>
				<h2 class="label-caps mb-2">Announced · {announced.length}</h2>
				<ul class="card divide-y divide-line">
					{#each announced as c (c.id)}
						<li>
							<button on:click={() => openCat(c)} class="flex min-h-[52px] w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface-2">
								<Icon name="trophy" size={16} class="text-gold" />
								<span class="min-w-0 flex-1">
									<span class="block text-xs text-muted">{c.short}</span>
									<span class="block truncate font-semibold">{names(c, winners[c.id])}{#if winners[c.id]?.length > 1}<span class="ml-1.5 text-xs font-medium text-gold">Tie</span>{/if}</span>
								</span>
							</button>
						</li>
					{:else}
						<li class="px-4 py-3 text-sm text-muted">None yet</li>
					{/each}
				</ul>
			</section>
		</div>
	{/if}
</div>

<Sheet bind:open={sheetOpen} title={sheetCat?.name || ''}>
	{#if sheetCat}
		<div class="mb-3 flex items-center justify-between gap-3">
			<p class="text-sm text-muted">{tieMode ? 'Tap every winner. Tap again to remove.' : 'Tap the winner.'}</p>
			<label class="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium">
				Tie
				<button
					role="switch"
					aria-checked={tieMode}
					aria-label="Tie: more than one winner"
					on:click={() => (tieMode = !tieMode)}
					class="relative h-7 w-12 rounded-full transition {tieMode ? 'bg-gold-fill' : 'bg-line'}"
				>
					<span class="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all {tieMode ? 'left-6' : 'left-1'}" />
				</button>
			</label>
		</div>
		<ul class="space-y-2">
			{#each sheetCat.candidates as c (c.key)}
				{@const won = (winners[sheetCat.id] || []).includes(c.key)}
				<li>
					<button
						on:click={() => setWinner(sheetCat, c.key)}
						class="flex min-h-[56px] w-full items-center gap-3 rounded-sm border px-4 py-2.5 text-left transition active:scale-[.99] {won ? 'border-gold-fill bg-gold-fill/10' : 'border-line hover:bg-surface-2'}"
					>
						<span class="min-w-0 flex-1">
							<span class="block font-semibold">{c.text}</span>
							{#if c.subtext}<span class="block truncate text-[13px] text-muted">{c.subtext}</span>{/if}
						</span>
						{#if won}<Icon name="trophy" size={18} class="text-gold" />{/if}
					</button>
				</li>
			{/each}
		</ul>
		{#if winners[sheetCat.id]}
			<Button variant="danger" full class="mt-4" on:click={() => clear(sheetCat)}>Clear result</Button>
		{/if}
	{/if}
</Sheet>

<Sheet bind:open={confirmLock} title={$settings.locked ? 'Reopen voting?' : 'Close voting?'}>
	<p class="mb-5 text-[15px] text-muted">
		{$settings.locked
			? 'People will be able to change their picks again, and ballots become private.'
			: 'Ballots lock and everyone can see everyone’s picks. Do this right before the ceremony starts.'}
	</p>
	<div class="flex gap-3">
		<Button variant="secondary" full on:click={() => (confirmLock = false)}>Cancel</Button>
		<Button full loading={busy} on:click={toggleLock}>{$settings.locked ? 'Reopen' : 'Close voting'}</Button>
	</div>
</Sheet>
