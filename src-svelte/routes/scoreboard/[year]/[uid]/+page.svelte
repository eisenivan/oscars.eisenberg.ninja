<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/services/auth';
	import { db } from '$lib/services/auth';
	import { keyFromName, isSelected } from '$lib/helpers';
	import Loader from '$lib/components/Loader.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';
	import { ref, get } from 'firebase/database';

	export let data;

	const year = data.year;
	const uid = data.uid;

	let categories = [];
	let ballotVotes = [];
	let hasBallot = false;
	let displayName = '';
	let results = [];
	let locked = false;
	let loading = true;
	let notAvailable = false;
	let myBallotVotes = [];
	let compareMode = false;

	onMount(async () => {
		if (!$user) {
			await goto('/login');
			return;
		}

		try {
			const settingsSnap = await get(ref(db, `/settings/${year}`));
			const settings = settingsSnap.val() || {};
			locked = settings.locked || false;
			results = settings.results || [];

			if (!locked) {
				notAvailable = true;
				loading = false;
				return;
			}

			const categoriesSnap = await get(ref(db, `/groups/${year}`));
			categories = categoriesSnap.val() || [];

			const ballotSnap = await get(ref(db, `/ballots/${year}/${uid}`));
			const ballotData = ballotSnap.val();

			if (ballotData) {
				displayName = ballotData.displayName || 'Unknown';
				ballotVotes = ballotData.votes || [];
				hasBallot = ballotVotes.length > 0;
			} else {
				notAvailable = true;
			}

			// Load logged-in user's ballot for comparison
			const myBallotSnap = await get(ref(db, `/ballots/${year}/${$user.uid}`));
			const myBallotData = myBallotSnap.val();
			if (myBallotData) {
				myBallotVotes = myBallotData.votes || [];
			}
		} catch (error) {
			console.error('Error loading ballot:', error);
			notAvailable = true;
		} finally {
			loading = false;
		}
	});

	const selectedKeyForCategory = (cat) => ballotVotes.find((vote) => vote.startsWith(`${cat.id}__`));

	const candidateForKey = (cat, key) =>
		cat?.candidates?.find((candidate) => `${cat.id}__${keyFromName(candidate.text)}` === key) || null;
</script>

<svelte:head>
	<title>{displayName ? `${displayName}'s Ballot` : 'Ballot'} - {year}</title>
</svelte:head>

{#if loading}
	<Loader />
{:else}
	<div>
		<PageHeading>{displayName ? `${displayName}'s Ballot` : 'Ballot'} - {year}</PageHeading>
		<a href={`/scoreboard/${year}`} class="text-blue-600 dark:text-blue-400 hover:underline text-sm text-left mt-2">← Back to Leaderboard</a>

		{#if notAvailable}
			<div class="mx-auto max-w-lg text-center mt-6 text-red-600 dark:text-red-400">
				Ballot is not available. It may be unpublished, not submitted, or the year is not locked.
			</div>
		{:else}
			{#if myBallotVotes.length > 0}
				<div class="mt-4 flex items-center">
					<input
						type="checkbox"
						id="compare-checkbox"
						bind:checked={compareMode}
						class="mr-2"
					/>
					<label for="compare-checkbox" class="text-sm text-gray-700 dark:text-gray-300">
						Compare with my ballot
					</label>
				</div>
			{/if}
			<div class="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-blue-700 border-8 rounded-sm border-opacity-10 card-polish p-4 bg-blue-100">
				{#each categories as cat (cat.id)}
					{@const winnerKey = results.find((x) => x.indexOf(cat.id) > -1)}
					{@const winningCandidate = winnerKey ? candidateForKey(cat, winnerKey) : null}
					{@const userKey = selectedKeyForCategory(cat)}
					{@const userWon = hasBallot && locked && results.length > 0 && userKey && userKey === winnerKey}
					{@const resultClass = hasBallot && locked && results.length > 0 && winnerKey && userWon ? 'text-green-600' : hasBallot && locked && results.length > 0 && winnerKey && !userWon ? 'text-red-600' : ''}
					{@const resultSymbol = hasBallot && locked && results.length > 0 && winnerKey && userWon ? '✓' : hasBallot && locked && results.length > 0 && winnerKey && !userWon ? '✕' : ''}
					<div class="mb-6">
						<h2 class="text-md font-semibold mb-2 uppercase">
							{cat.name}
							<i class={resultClass}>{resultSymbol}</i>
						</h2>
						{#if !hasBallot && locked && results.length > 0 && winnerKey && winningCandidate}
							<div class="text-xs mt-1 text-blue-700 dark:text-blue-400">Winner: {winningCandidate.text}</div>
						{/if}
						{#each cat.candidates as candidate (candidate.text)}
							{@const key = `${cat.id}__${keyFromName(candidate.text)}`}
							{@const isWinner = results.indexOf(key) > -1}
							{@const isMyPick = isSelected(myBallotVotes, key)}
					{@const isDifferentPick = compareMode && isSelected(ballotVotes, key) !== isMyPick}
							<label
								class={`border-solid block pl-2 ml-2 border-l border-indigo-200 py-1 ${
									isWinner ? resultClass : ''
								} ${isDifferentPick ? 'bg-yellow-100 dark:bg-yellow-800/50' : ''}`}
								for={key}
							>
								<div class="flex items-center">
									<input
										disabled={true}
										checked={isSelected(ballotVotes, key)}
										class="mr-2"
										type="radio"
										name={cat.id}
										value={key}
										id={key}
									/>
									<span class="uppercase">{candidate.text}</span>
									{#if compareMode && isMyPick && !isSelected(ballotVotes, key)}
										<span class="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-200">My Pick</span>
									{/if}
									{#if locked && results.length > 0 && isWinner}
										<span class="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-300">Winner</span>
									{/if}
								</div>
								{#if candidate.subtext}
									<span class="block ml-6 pb-2 font-light text-xs italic">{candidate.subtext}</span>
								{/if}
							</label>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
