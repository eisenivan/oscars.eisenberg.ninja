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
	let error = null;

	onMount(async () => {
		if (!$user) {
			await goto('/login');
			return;
		}

		// Safety timeout to prevent infinite loading
		const timeoutId = setTimeout(() => {
			if (loading) {
				console.warn('Leaderboard load timeout');
				loading = false;
			}
		}, 5000);

		// Load categories
		try {
			const masterRef = ref(db, `/groups/${year}`);
			const snapshot = await get(masterRef);
			masterBallot = snapshot.val() || {};
		} catch (err) {
			console.error('Error loading master ballot:', err);
			error = 'Failed to load categories';
			loading = false;
		}

		// Listen to ballots
		const ballotsRef = ref(db, `/ballots/${year}`);
		const unsubscribeBallots = onValue(ballotsRef, (snapshot) => {
			try {
				ballots = snapshot.val() || {};
				loading = false;
				updateLeaderboard();
			} catch (err) {
				console.error('Error processing ballots:', err);
				error = 'Failed to load ballots';
				loading = false;
			}
		}, (err) => {
			console.error('Error listening to ballots:', err);
			error = 'Failed to load ballots';
			loading = false;
		});

		// Listen to results
		const settingsRef = ref(db, `/settings/${year}`);
		const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
			try {
				const settings = snapshot.val() || {};
				results = settings?.results || [];
				locked = settings?.locked || false;
				loading = false;
				updateLeaderboard();
			} catch (err) {
				console.error('Error processing settings:', err);
				error = 'Failed to load settings';
				loading = false;
			}
		}, (err) => {
			console.error('Error listening to settings:', err);
			error = 'Failed to load settings';
			loading = false;
		});

		// Cleanup function
		return () => {
			clearTimeout(timeoutId);
			unsubscribeBallots?.();
			unsubscribeSettings?.();
		};
	});

	function updateLeaderboard() {
		let ballotArray;

		if (locked) {
			// When voting is locked, calculate and display scores
			Object.keys(ballots).forEach((key) => {
				ballots[key].score = 0;
				results.forEach((winner) => {
					if (ballots[key].votes && ballots[key].votes.indexOf(winner) > -1) {
						ballots[key].score += 1;
					}
				});
			});

			ballotArray = Object.keys(ballots).map((uid) => ({ uid, ...ballots[uid] }));
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
		} else {
			// When voting is open, just show names of who has filled out ballots
			ballotArray = Object.keys(ballots)
				.map((uid) => ({ uid, displayName: ballots[uid].displayName }))
				.sort((a, b) => a.displayName.localeCompare(b.displayName));

			rankedSortedBallots = ballotArray.map((ballot, i) => ({
				...ballot,
				score: 0,
				rank: i + 1
			}));
		}
	}
</script>

<svelte:head>
	<title>Leaderboard - {year}</title>
</svelte:head>

{#if !loading}
	<div class="mx-auto max-w-lg text-center">
		<PageHeading>Leaderboard - {year}</PageHeading>
		{#if error}
			<div class="text-red-600 mb-4">
				{error}
			</div>
		{:else if locked}
			<p class="text-xs mb-2 dark:text-gray-300">
				{results.length} of {Object.keys(masterBallot).length} categories announced
			</p>
		{:else}
			<p class="text-xs mb-2 dark:text-gray-300">
				{Object.keys(ballots).length} people have filled out ballots
			</p>
		{/if}
		<a href="/scoreboard" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">← Back to Year Selection</a>
	</div>
	{#if rankedSortedBallots.length > 0}
		<div class="max-w-lg mx-auto border-blue-700 border-8 rounded-sm border-opacity-10 shadow-sm">
			{#each rankedSortedBallots as ballot (ballot.displayName)}
				<div
					class={`grid ${locked ? 'grid-cols-leaderboard' : 'grid-cols-1'} gap-x-2 p-2 ${dynamicColor(ballot.rank)} ${
						$user?.displayName === ballot.displayName ? 'transform scale-105 shadow-lg' : ''
					}`}
				>
					<div class="bg-white dark:bg-slate-800 dark:text-gray-100 rounded-full p-0.5 font-black text-center">#{ballot.rank}</div>
					<div class={`flex items-center dark:text-gray-900 ${$user?.displayName === ballot.displayName ? 'font-bold italic' : ''}`}>
						{ballot.displayName}
					</div>
					{#if locked}
						<div class="flex items-center font-black text-right dark:text-gray-900">{ballot.score}</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center text-gray-600 dark:text-gray-400 py-8">
			<p>No ballots yet</p>
		</div>
	{/if}
{:else}
	<Loader />
{/if}
