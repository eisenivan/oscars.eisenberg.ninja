<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/services/auth';
	import { db } from '$lib/services/auth';
	import { YEAR } from '$lib/constants';
	import Loader from '$lib/components/Loader.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';
	import { ref, get } from 'firebase/database';

	let years = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		if (!$user) {
			await goto('/login');
			return;
		}

		try {
			// Get all years that have settings (publicly readable)
			const settingsRef = ref(db, '/settings');
			const snapshot = await get(settingsRef);
			const settingsData = snapshot.val() || {};
			
			// Extract years from the settings data
			const yearList = Object.keys(settingsData)
				.map(year => parseInt(year))
				.sort((a, b) => b - a); // Sort descending
			
			years = yearList;
		} catch (err) {
			console.error('Error loading years:', err);
			error = 'Failed to load years';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Leaderboard History</title>
</svelte:head>

{#if loading}
	<Loader />
{:else}
	<div class="mx-auto max-w-lg text-center">
		<PageHeading>Leaderboard History</PageHeading>
		<p class="text-sm text-gray-600 mb-6">Select a year to view past leaderboards</p>
	</div>

	{#if error}
		<div class="mx-auto max-w-lg text-center text-red-600 mb-4">
			{error}
		</div>
	{/if}

	<div class="mx-auto max-w-lg">
		<div class="space-y-3">
			{#each years as year (year)}
				<a
					href="/scoreboard/{year}"
					class="block p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-center font-semibold"
				>
					{year} {year === YEAR ? '(Current)' : ''}
				</a>
			{/each}
		</div>

		{#if years.length === 0}
			<p class="text-center text-gray-600 mt-6">No past leaderboards found</p>
		{/if}
	</div>
{/if}
