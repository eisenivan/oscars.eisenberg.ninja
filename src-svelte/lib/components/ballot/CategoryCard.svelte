<script>
	import { slide } from 'svelte/transition';
	import Icon from '../ui/Icon.svelte';
	import Pill from '../ui/Pill.svelte';
	import Spinner from '../ui/Spinner.svelte';
	import NomineeOption from './NomineeOption.svelte';
	import NomineeRow from './NomineeRow.svelte';
	import { createEventDispatcher } from 'svelte';

	export let cat;
	export let index = 0;
	export let pick = undefined; // selected key
	export let winners = []; // winning key(s); more than one for a tie
	export let editable = false;
	export let saveState = null; // saving | saved | error
	export let pickLabel = 'Your pick';
	export let hasBallot = true;

	const dispatch = createEventDispatcher();
	let expanded = false;

	$: won = winners || [];
	$: outcome = !won.length ? (pick ? 'pending' : null) : !pick ? 'none' : won.includes(pick) ? 'correct' : 'missed';
	$: visible = editable || expanded
		? cat.candidates
		: cat.candidates.filter((c) => c.key === pick || won.includes(c.key));
	$: hidden = cat.candidates.length - visible.length;
</script>

<fieldset
	id="cat-{cat.id}"
	aria-labelledby="h-{cat.id}"
	data-cat={cat.id}
	class="card block w-full min-w-0 scroll-mt-[136px] p-4 sm:p-5 lg:scroll-mt-24
		{outcome === 'correct' ? 'border-success/40' : ''} {outcome === 'missed' ? 'border-danger/30' : ''}"
>
	<div class="mb-3">
		<div class="flex h-6 items-center justify-between gap-3">
			<p class="label-caps tnum">{String(index + 1).padStart(2, '0')}</p>
			<div class="flex shrink-0 items-center" aria-live="polite">
			{#if saveState === 'saving'}
				<span class="flex items-center gap-1.5 text-xs font-medium text-muted"><Spinner size={13} /> Saving…</span>
			{:else if saveState === 'saved'}
				<Pill tone="success" icon="check">Saved</Pill>
			{:else if saveState === 'error'}
				<Pill tone="danger" icon="alert">Not saved</Pill>
			{:else if outcome === 'correct'}
				<Pill tone="success" icon="check">Correct</Pill>
			{:else if outcome === 'missed'}
				<Pill tone="danger" icon="x">Missed</Pill>
			{:else if outcome === 'none'}
				<Pill tone="gold" icon="trophy">Announced</Pill>
			{:else if outcome === 'pending' && !editable}
				<Pill icon="clock">Pending</Pill>
			{:else if editable && !pick}
				<span class="text-xs font-medium text-muted">Pick one</span>
			{/if}
			</div>
		</div>
		<h2 class="mt-1 text-[19px] font-semibold leading-tight sm:text-xl" id="h-{cat.id}">{cat.name}</h2>
		{#if won.length > 1}
			<p class="mt-1 flex items-center gap-1 text-[13px] font-medium text-gold"><Icon name="trophy" size={13} /> Tie · {won.length} winners</p>
		{/if}
	</div>

	{#if editable}
		<div class="space-y-2" role="radiogroup" aria-label={cat.name}>
			{#each cat.candidates as candidate (candidate.key)}
				<NomineeOption
					{candidate}
					name={cat.id}
					checked={pick === candidate.key}
					on:change={() => dispatch('pick', { cat, key: candidate.key })}
				/>
			{/each}
		</div>
	{:else}
		<div class="space-y-1">
			{#each visible as candidate (candidate.key)}
				<NomineeRow
					{candidate}
					isPick={candidate.key === pick}
					isWinner={won.includes(candidate.key)}
					{outcome}
					{pickLabel}
				/>
			{/each}
			{#if !pick && !won.length && !expanded}
				<p class="px-3.5 py-2 text-sm italic text-muted">{hasBallot ? 'No pick in this category' : 'No ballot submitted'}</p>
			{/if}
		</div>
		{#if hidden > 0 || expanded}
			<button
				class="mt-2 flex h-9 items-center gap-1 rounded-sm px-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg"
				aria-expanded={expanded}
				on:click={() => (expanded = !expanded)}
			>
				<Icon name="chevron-down" size={16} class="transition {expanded ? 'rotate-180' : ''}" />
				{expanded ? 'Show less' : `Show all ${cat.candidates.length} nominees`}
			</button>
		{/if}
	{/if}
</fieldset>
