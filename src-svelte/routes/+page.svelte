<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/services/auth';
	import { db } from '$lib/services/auth';
	import { keyFromName, isSelected } from '$lib/helpers';
	import { YEAR } from '$lib/constants';
	import Loader from '$lib/components/Loader.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';
	import { ref, get, set, onValue } from 'firebase/database';

	let categories = [];
	let ballot = [];
	let locked = false;
	let results = [];
	let loading = true;

	onMount(async () => {
		if (!$user) {
			await goto('/login');
			return;
		}

		// Load categories
		try {
			const categoriesRef = ref(db, `/groups/${YEAR}`);
			const snapshot = await get(categoriesRef);
			categories = snapshot.val() || [];
			loading = false;
		} catch (error) {
			console.error('Error loading categories:', error);
		}

		// Listen to settings (locked status and results)
		const settingsRef = ref(db, `/settings/${YEAR}`);
		onValue(settingsRef, (snapshot) => {
			const settings = snapshot.val();
			if (settings) {
				locked = settings.locked || false;
				results = settings.results || [];
			}
		});

		// Load user's ballot
		try {
			const ballotRef = ref(db, `/ballots/${YEAR}/${$user.uid}/votes`);
			const snapshot = await get(ballotRef);
			ballot = snapshot.val() || [];
		} catch (error) {
			console.error('Error loading ballot:', error);
		}
	});

	const updateBallot = async (e) => {
		const value = e.target.value;
		const tempBallot = [...ballot];
		const category = value.split('__')[0];
		const index = tempBallot.findIndex((x) => x.indexOf(category) > -1);

		if (index === -1) {
			tempBallot.push(value);
		} else {
			tempBallot[index] = value;
		}

		try {
			const ballotRef = ref(db, `ballots/${YEAR}/${$user.uid}`);
			await set(ballotRef, { displayName: $user.displayName, votes: tempBallot });
			ballot = tempBallot;
		} catch (error) {
			console.error('Error updating ballot:', error);
		}
	};

	let tempScore = 0;
	$: if (ballot.length > 0 && results.length > 0) {
		tempScore = 0;
		results.forEach((winner) => {
			if (ballot.indexOf(winner) > -1) {
				tempScore += 1;
			}
		});
	}
</script>

<svelte:head>
	<title>My Ballot</title>
</svelte:head>

{#if loading}
	<Loader />
{:else}
	<div>
		<PageHeading>
			My Ballot
			{#if locked && results.length > 0}
				<span class="ml-2 text-sm">Score: {tempScore}/{results.length}</span>
			{/if}
		</PageHeading>

		<div
			class="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-blue-700 border-8 rounded-sm border-opacity-10 shadow-sm p-4 bg-blue-100"
		>
			{#each categories as cat (cat.id)}
				{@const winner = results.find((x) => x.indexOf(cat.id) > -1)}
				{@const won = ballot.indexOf(winner) > -1}
				{@const resultClass = locked && results.length > 0 && winner && won ? 'text-green-600' : locked && results.length > 0 && winner && !won ? 'text-red-600' : ''}
				{@const resultSymbol = locked && results.length > 0 && winner && won ? '✓' : locked && results.length > 0 && winner && !won ? '✕' : ''}
				<div class="mb-6">
					<h2 class="text-md font-semibold mb-2 uppercase">
						{cat.name}
						<i class={resultClass}>{resultSymbol}</i>
					</h2>
					{#each cat.candidates as candidate (candidate.text)}
						{@const key = `${cat.id}__${keyFromName(candidate.text)}`}
						<label
							class={`border-solid block pl-2 ml-2 border-l border-indigo-200 ${
								results.indexOf(key) > -1 ? resultClass : ''
							}`}
							for={key}
						>
							<input
								disabled={locked}
								on:change={updateBallot}
								checked={isSelected(ballot, key)}
								class="mr-2"
								type="radio"
								name={cat.id}
								value={key}
								id={key}
							/>
							<span class="uppercase">{candidate.text}</span>
							{#if candidate.subtext}
								<span class="block ml-6 pb-2 font-light text-xs italic">{candidate.subtext}</span>
							{/if}
						</label>
					{/each}
				</div>
			{/each}
		</div>
	</div>
{/if}
