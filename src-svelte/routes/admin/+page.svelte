<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/auth.js';
	import { allSettings, years, currentYear, categoriesFor, saveSeason, rawCategories, isAdmin } from '$lib/data/queries.js';
	import { parseSeason, validateYear, diffKeys } from '$lib/domain/season.js';
	import { toast } from '$lib/stores/toast.js';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import ListSkeleton from '$lib/components/ballot/ListSkeleton.svelte';

	const TEMPLATE = '/templates/season-template.json';
	const MAX_ERRORS = 8;

	let allowed = null;
	onMount(async () => {
		allowed = await isAdmin($user.uid);
		if (!allowed) goto('/');
	});

	$: settings = $allSettings.value || {};

	// ---- editor state ----
	let yearText = null;
	$: if (yearText === null && !$allSettings.loading) yearText = String(($years[0] || $currentYear) + 1);
	let source = '';
	let fileName = '';
	let form;

	$: yearError = yearText ? validateYear(yearText) : '';
	$: year = yearError ? null : Number(yearText);
	$: exists = year != null && !!settings[year];
	$: parsed = source.trim() ? parseSeason(source) : null;
	$: valid = parsed && !parsed.errors.length && year != null;
	$: yearMismatch = parsed?.year && year && parsed.year !== year;

	// When replacing, show which existing picks would stop counting.
	$: existing = exists ? categoriesFor(year) : null;
	$: diff = valid && exists && $existing && !$existing.loading ? diffKeys($existing.value, parsed.categories) : null;
	$: locked = exists && !!settings[year]?.locked;
	$: resultCount = exists ? (settings[year]?.results || []).filter(Boolean).length : 0;

	function useText(text, name = '') {
		source = text;
		fileName = name;
		const p = parseSeason(text);
		if (p.year) yearText = String(p.year);
	}

	async function onFile(e) {
		const file = e.currentTarget.files?.[0];
		e.currentTarget.value = '';
		if (file) useText(await file.text(), file.name);
	}

	async function loadTemplate() {
		const res = await fetch(TEMPLATE);
		const tpl = await res.json();
		if (year) tpl.year = year;
		useText(JSON.stringify(tpl, null, 2), 'season-template.json');
	}

	async function edit(y) {
		const cats = (await rawCategories(y)) || [];
		yearText = String(y);
		useText(JSON.stringify({ year: y, categories: Array.isArray(cats) ? cats : Object.values(cats) }, null, 2), `${y} (current nominees)`);
		await tick();
		form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	async function download(y) {
		const cats = (await rawCategories(y)) || [];
		const blob = new Blob([JSON.stringify({ year: y, categories: cats }, null, 2)], { type: 'application/json' });
		const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `season-${y}.json` });
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function reset() {
		source = '';
		fileName = '';
		yearText = String(($years[0] || $currentYear) + 1);
	}

	// ---- save ----
	let confirmOpen = false;
	let saving = false;
	async function save() {
		saving = true;
		try {
			const { created } = await saveSeason(year, parsed.categories);
			confirmOpen = false;
			toast(created ? `${year} created. Voting is open.` : `${year} nominees replaced`, { tone: 'success', timeout: 6000 });
			reset();
		} catch (err) {
			toast('Couldn’t save the season', { tone: 'danger', detail: err.message });
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head><title>Seasons · Admin</title></svelte:head>

<div class="mx-auto max-w-3xl">
	<header class="mb-6">
		<p class="label-caps">Admin</p>
		<h1 class="page-title mt-1">Seasons</h1>
	</header>

	{#if !allowed || $allSettings.loading}
		<ListSkeleton rows={4} />
	{:else}
		<section class="mb-8">
			<h2 class="label-caps mb-2">All seasons · {$years.length}</h2>
			<ul class="card divide-y divide-line">
				{#each $years as y (y)}
					{@const s = settings[y] || {}}
					{@const n = (s.results || []).filter(Boolean).length}
					<li class="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
						<span class="tnum font-display text-xl font-semibold">{y}</span>
						{#if y === $currentYear}<Pill tone="gold" icon="star">Current</Pill>{/if}
						{#if !s.locked}
							<Pill tone="success">Voting open</Pill>
						{:else}
							<Pill icon="lock">Closed{n ? ` · ${n} results` : ''}</Pill>
						{/if}
						<span class="ml-auto flex gap-1">
							<Button size="sm" variant="ghost" on:click={() => download(y)}>Export</Button>
							<Button size="sm" variant="ghost" on:click={() => edit(y)}>Edit</Button>
							<Button size="sm" variant="secondary" href="/admin/{y}">Results</Button>
						</span>
					</li>
				{:else}
					<li class="px-4 py-3 text-sm text-muted">No seasons yet.</li>
				{/each}
			</ul>
		</section>

		<section bind:this={form} class="card scroll-mt-24 p-4 sm:p-6">
			<h2 class="font-display text-2xl font-semibold">{exists ? `Replace ${year} nominees` : 'Add a season'}</h2>
			<p class="mt-1 text-[15px] text-muted">
				Paste a season file or load one. Start from the
				<a href={TEMPLATE} download class="font-semibold text-gold hover:underline">template</a>, which has every
				category from last year with TODO nominees to fill in.
			</p>

			<div class="mt-5 grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-start">
				<TextField label="Year" bind:value={yearText} inputmode="numeric" error={yearError} />
				<div class="space-y-1.5">
					<span class="block text-sm font-medium text-fg">Nominees file</span>
					<div class="flex flex-wrap gap-2">
						<label class="inline-flex h-12 cursor-pointer items-center gap-2 rounded-sm border border-line bg-surface px-4 font-medium hover:bg-surface-2">
							<Icon name="arrow-up" size={18} /> Load .json
							<input type="file" accept=".json,application/json" class="sr-only" on:change={onFile} />
						</label>
						<Button variant="secondary" class="h-12" on:click={loadTemplate}>Start from template</Button>
						{#if source}<Button variant="ghost" class="h-12" on:click={reset}>Clear</Button>{/if}
					</div>
					{#if fileName}<p class="text-[13px] text-muted">Loaded {fileName}</p>{/if}
				</div>
			</div>

			<label for="season-json" class="mt-5 block text-sm font-medium text-fg">JSON</label>
			<textarea
				id="season-json"
				bind:value={source}
				rows="14"
				spellcheck="false"
				placeholder={'{\n  "year": 2027,\n  "categories": [\n    { "id": "best-picture", "name": "Best Picture",\n      "candidates": [ { "text": "Film", "subtext": "Producers" } ] }\n  ]\n}'}
				class="mt-1.5 w-full rounded-sm border border-line bg-surface px-3.5 py-3 font-mono text-[13px] leading-relaxed text-fg placeholder:text-muted/60 focus:border-gold-fill focus:outline-none focus:ring-2 focus:ring-gold-fill/60"
			/>

			{#if parsed}
				{#if parsed.errors.length}
					<div class="mt-4 rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-danger" role="alert">
						<p class="flex items-center gap-2 font-semibold"><Icon name="alert" size={16} /> {parsed.errors.length} problem{parsed.errors.length === 1 ? '' : 's'} to fix</p>
						<ul class="mt-2 list-disc space-y-1 pl-5">
							{#each parsed.errors.slice(0, MAX_ERRORS) as e}<li>{e}</li>{/each}
						</ul>
						{#if parsed.errors.length > MAX_ERRORS}<p class="mt-2">…and {parsed.errors.length - MAX_ERRORS} more.</p>{/if}
					</div>
				{:else}
					<div class="mt-4 rounded-sm border border-success/30 bg-success/10 p-4 text-sm">
						<p class="flex items-center gap-2 font-semibold text-success"><Icon name="check" size={16} /> {parsed.categories.length} categories · {parsed.nominees} nominees</p>
						{#each parsed.warnings.slice(0, MAX_ERRORS) as w}<p class="mt-1 text-muted">{w}</p>{/each}
					</div>
				{/if}

				{#if yearMismatch}
					<p class="mt-3 flex items-center gap-2 text-sm text-danger"><Icon name="alert" size={16} /> The file says {parsed.year}, but you’re saving it as {year}.</p>
				{/if}

				{#if diff && diff.removed.length}
					<div class="mt-3 rounded-sm border border-danger/30 p-4 text-sm">
						<p class="font-semibold text-danger">{diff.removed.length} existing nominee{diff.removed.length === 1 ? '' : 's'} will be removed or renamed</p>
						<p class="mt-1 text-muted">Picks for these stop counting{resultCount ? ', and any results for them are lost' : ''}.</p>
						<ul class="mt-2 space-y-0.5">
							{#each diff.removed.slice(0, MAX_ERRORS) as r}<li><span class="text-muted">{r.category}:</span> {r.text}</li>{/each}
						</ul>
					</div>
				{/if}

				{#if parsed.categories.length && !parsed.errors.length}
					<details class="mt-4 rounded-sm border border-line">
						<summary class="cursor-pointer px-4 py-3 font-medium">Preview ballot</summary>
						<ol class="divide-y divide-line border-t border-line">
							{#each parsed.categories as c (c.id)}
								<li class="px-4 py-3">
									<p class="label-caps">{c.name} <span class="normal-case tracking-normal text-muted/70">· {c.id}</span></p>
									<ul class="mt-1 text-sm">
										{#each c.candidates as n}
											<li>{n.text}{#if n.subtext}<span class="text-muted"> · {n.subtext}</span>{/if}</li>
										{/each}
									</ul>
								</li>
							{/each}
						</ol>
					</details>
				{/if}
			{/if}

			<Button full class="mt-5" disabled={!valid} on:click={() => (confirmOpen = true)}>
				{exists ? `Replace ${year || ''} nominees` : `Create ${year || ''} season`}
			</Button>
		</section>

		<p class="mt-6 text-sm text-muted">
			Back up the database before big changes: <code class="rounded bg-surface-2 px-1.5 py-0.5 text-[13px]">npm run backup</code>
		</p>
	{/if}
</div>

<Sheet bind:open={confirmOpen} title={exists ? `Replace ${year} nominees?` : `Create ${year}?`}>
	<p class="mb-5 text-[15px] text-muted">
		{#if !exists}
			{year} becomes the current season for everyone and voting opens right away, with
			{parsed?.categories.length} categories.
		{:else if diff?.removed.length}
			{diff.removed.length} nominee{diff.removed.length === 1 ? '' : 's'} people may have picked will disappear.
			{locked ? 'Voting is already closed for this year.' : ''} This can’t be undone without a backup.
		{:else}
			The categories and nominees for {year} will be replaced. Existing picks still match.
		{/if}
	</p>
	<div class="flex gap-3">
		<Button variant="secondary" full on:click={() => (confirmOpen = false)}>Cancel</Button>
		<Button full loading={saving} on:click={save}>{exists ? 'Replace' : 'Create season'}</Button>
	</div>
</Sheet>
