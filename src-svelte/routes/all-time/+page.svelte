<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user, db } from '$lib/services/auth';
	import { ref, get } from 'firebase/database';
	import sortByLodash from 'lodash.sortby';
	import PageHeading from '$lib/components/PageHeading.svelte';

	const medalColors = {
		gold: 'bg-yellow-300',
		silver: 'bg-gray-300',
		bronze: 'bg-orange-300'
	};

	let sortByColumn = 'total';
	let sortAsc = false;
	let baseResults = [];
	let sortedResults = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		if (!$user) {
			await goto('/login');
			return;
		}

		try {
			const medals = {};

			// Get all settings to find available years
			const settingsRef = ref(db, '/settings');
			const settingsSnapshot = await get(settingsRef);
			const settingsData = settingsSnapshot.val() || {};

			// Process each year
			for (const year of Object.keys(settingsData).sort()) {
				// Get ballots for this year
				const ballotsRef = ref(db, `/ballots/${year}`);
				const ballotsSnapshot = await get(ballotsRef);
				const ballots = ballotsSnapshot.val() || {};

				// Get results for this year
				const settings = settingsData[year];
				const results = settings?.results || [];

				// Calculate scores for each person
				const scores = {};
				Object.keys(ballots).forEach((uid) => {
					const ballot = ballots[uid];
					const displayName = ballot.displayName;

					scores[displayName] = 0;
					results.forEach((winner) => {
						if (ballot.votes && ballot.votes.indexOf(winner) > -1) {
							scores[displayName] += 1;
						}
					});
				});

				// Rank the scores
				const sorted = sortByLodash(Object.entries(scores), ([, score]) => score)
					.reverse()
					.map(([name, score], index) => ({
						displayName: name,
						score,
						rank: index + 1
					}));

				// Handle ties for ranking
				const ranked = sorted.reduce((acc, entry, i) => {
					let rank = i + 1;
					const last = acc[acc.length - 1];
					if (last && entry.score === last.score) {
						rank = last.rank;
					}
					return [...acc, { ...entry, rank }];
				}, []);

				// Award medals for 1st, 2nd, 3rd
				ranked.forEach((entry) => {
					const name = entry.displayName;
					if (!medals[name]) {
						medals[name] = { gold: 0, silver: 0, bronze: 0 };
					}

					if (entry.rank === 1) {
						medals[name].gold += 1;
					} else if (entry.rank === 2) {
						medals[name].silver += 1;
					} else if (entry.rank === 3) {
						medals[name].bronze += 1;
					}
				});
			}

			// Convert to array and sort by points
			const results = Object.entries(medals)
				.map(([name, counts]) => ({
					displayName: name,
					gold: counts.gold,
					silver: counts.silver,
					bronze: counts.bronze,
					total: counts.gold * 3 + counts.silver * 2 + counts.bronze * 1
				}))
				.sort((a, b) => {
					// Sort by points first, then gold, then silver, then bronze
					if (b.total !== a.total) return b.total - a.total;
					if (b.gold !== a.gold) return b.gold - a.gold;
					if (b.silver !== a.silver) return b.silver - a.silver;
					if (b.bronze !== a.bronze) return b.bronze - a.bronze;
					return a.displayName.localeCompare(b.displayName);
				});

			baseResults = results;
			sortedResults = results;
			loading = false;
		} catch (err) {
			console.error('Error loading all-time results:', err);
			error = 'Failed to load results';
			loading = false;
		}
	});

	$: sortedResults = baseResults.length > 0 ? [...baseResults].sort((a, b) => {
		let aVal = a[sortByColumn];
		let bVal = b[sortByColumn];

		if (typeof aVal === 'string') {
			const cmp = aVal.localeCompare(bVal);
			return sortAsc ? cmp : -cmp;
		} else {
			return sortAsc ? aVal - bVal : bVal - aVal;
		}
	}) : [];

	function handleSort(column) {
		if (sortByColumn === column) {
			sortAsc = !sortAsc;
		} else {
			sortByColumn = column;
			sortAsc = false;
		}
	}

	$: sortIndicator = (column) => sortByColumn === column ? (sortAsc ? '↑' : '↓') : '';
</script>

<svelte:head>
	<title>All-Time Results</title>
</svelte:head>

<div class="mx-auto max-w-4xl">
	<div class="text-center mb-8">
		<PageHeading>All-Time Medal Count</PageHeading>
		<p class="text-sm text-gray-600 dark:text-gray-300">Winners across all years <em>(since we moved to an online ballot)</em></p>
	</div>

	{#if loading}
		<div class="text-center text-gray-600 py-8">
			<p>Loading results...</p>
		</div>
	{:else if error}
		<div class="text-center text-red-600 mb-4">
			{error}
		</div>
	{:else if sortedResults && sortedResults.length > 0}
		<div class="overflow-x-auto card-polish p-6">
			<table class="w-full border-collapse">
				<thead>
					<tr class="bg-blue-50 dark:bg-blue-900 border-b-2 border-blue-200 dark:border-blue-700">
						<th class="px-4 py-3 text-left font-semibold dark:text-gray-200">
							Rank
						</th>
						<th class="relative px-4 py-3 text-left font-semibold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 dark:text-gray-200" on:click={() => handleSort('displayName')}>
							Name
							<span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm">{sortIndicator('displayName')}</span>
						</th>
						<th class="relative px-4 py-3 text-center font-semibold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 dark:text-gray-200" on:click={() => handleSort('gold')}>
							<span class="inline-block px-2 py-1 rounded {medalColors.gold}">🥇</span>
							<span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm">{sortIndicator('gold')}</span>
						</th>
						<th class="relative px-4 py-3 text-center font-semibold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 dark:text-gray-200" on:click={() => handleSort('silver')}>
							<span class="inline-block px-2 py-1 rounded {medalColors.silver}">🥈</span>
							<span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm">{sortIndicator('silver')}</span>
						</th>
						<th class="relative px-4 py-3 text-center font-semibold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 dark:text-gray-200" on:click={() => handleSort('bronze')}>
							<span class="inline-block px-2 py-1 rounded {medalColors.bronze}">🥉</span>
							<span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm">{sortIndicator('bronze')}</span>
						</th>
						<th class="relative px-4 py-3 text-center font-semibold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 dark:text-gray-200" on:click={() => handleSort('total')}>
							Points
							<span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm">{sortIndicator('total')}</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{#each sortedResults as result, index}
						<tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
							<td class="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">#{index + 1}</td>
							<td class="px-4 py-3 font-medium dark:text-gray-200">{result.displayName}</td>
							<td class="px-4 py-3 text-center">
								<span class="inline-block px-3 py-1 rounded font-bold text-gray-900 {medalColors.gold}">
									{result.gold}
								</span>
							</td>
							<td class="px-4 py-3 text-center">
								<span class="inline-block px-3 py-1 rounded font-bold text-gray-900 {medalColors.silver}">
									{result.silver}
								</span>
							</td>
							<td class="px-4 py-3 text-center">
								<span class="inline-block px-3 py-1 rounded font-bold text-gray-900 {medalColors.bronze}">
									{result.bronze}
								</span>
							</td>
							<td class="px-4 py-3 text-center font-bold">{result.total}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="text-center text-gray-600 py-8">
			No results yet
		</div>
	{/if}
</div>
