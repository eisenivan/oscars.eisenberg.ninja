<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/services/auth';
	import { db } from '$lib/services/auth';
	import sortBy from 'lodash.sortby';
	import Loader from '$lib/components/Loader.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';
	import { ref, get, onValue } from 'firebase/database';

	export let data;

	const year = data.year;

	function dynamicColor(index) {
		const colors = [
			'bg-blue-600',
			'bg-blue-500',
			'bg-blue-400',
			'bg-blue-300',
			'bg-blue-300',
			'bg-blue-200'
		];
		return colors[index] || 'bg-blue-100';
	}

	let ballots = {};
	let results = [];
	let masterBallot = {};
	let loading = true;
	let rankedSortedBallots = [];
	let locked = false;

	onMount(async () => {
		if (!$user) {
			await goto('/login');
			return;
		}

		// Load categories
		try {
			const masterRef = ref(db, `/groups/${year}`);
			const snapshot = await get(masterRef);
			masterBallot = snapshot.val() || {};
		} catch (error) {
			console.error('Error loading master ballot:', error);
		}

		// Listen to ballots
		const ballotsRef = ref(db, `/ballots/${year}`);
		onValue(ballotsRef, (snapshot) => {
			ballots = snapshot.val() || {};
			loading = false;
			updateLeaderboard();
		});

		// Listen to results
		const settingsRef = ref(db, `/settings/${year}`);
		onValue(settingsRef, (snapshot) => {
			const settings = snapshot.val();
			results = settings?.results || [];
			locked = settings?.locked || false;
			updateLeaderboard();
		});
	});

	function updateLeaderboard() {
		if (Object.keys(ballots).length === 0) return;

		Object.keys(ballots).forEach((key) => {
			ballots[key].score = 0;
			results.forEach((winner) => {
				if (ballots[key].votes && ballots[key].votes.indexOf(winner) > -1) {
					ballots[key].score += 1;
				}
			});
		});

		const ballotArray = Object.keys(ballots).map((uid) => ({ uid, ...ballots[uid] }));
		const sortedBallots = sortBy(ballotArray, ['score', 'displayName']).reverse();

		// Set ranks
		rankedSortedBallots = sortedBallots.reduce((acc, x, i) => {
			let rank = i + 1;
			const lastBallot = acc[acc.length - 1];

			if (lastBallot && x.score === lastBallot.score) {
				rank = lastBallot.rank;
			}
			return [...acc, { ...x, rank }];
		}, []);
	}
</script>

<svelte:head>
	<title>Leaderboard - {year}</title>
</svelte:head>

{#if !loading}
	<div class="mx-auto max-w-lg text-center">
		<PageHeading>Leaderboard - {year}</PageHeading>
		<p class="text-xs mb-2 dark:text-gray-300">
			{results.length} of {Object.keys(masterBallot).length} categories announced
		</p>
		<a href="/scoreboard" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">← Back to Year Selection</a>
	</div>
	<div class="max-w-lg mx-auto border-blue-700 border-8 rounded-sm border-opacity-10 shadow-sm">
		{#each rankedSortedBallots as ballot (ballot.displayName)}
			<div
				class={`grid grid-cols-leaderboard gap-x-2 p-2 ${dynamicColor(ballot.rank)} ${
					$user?.displayName === ballot.displayName ? 'transform scale-105 shadow-lg' : ''
				}`}
			>
				<div class="bg-white dark:bg-slate-800 dark:text-gray-100 rounded-full p-0.5 font-black text-center">#{ballot.rank}</div>
				<div class={`flex items-center dark:text-gray-900 ${$user?.displayName === ballot.displayName ? 'font-bold italic' : ''}`}>
					{#if locked}
						<a
							href={`/scoreboard/${year}/${ballot.uid}`}
							class="underline hover:text-blue-800 dark:hover:text-blue-200"
						>
							{ballot.displayName}
						</a>
					{:else}
						{ballot.displayName}
					{/if}
				</div>
				<div class="flex items-center font-black text-right dark:text-gray-900">{ballot.score}</div>
			</div>
		{/each}
	</div>
{:else}
	<Loader />
{/if}
