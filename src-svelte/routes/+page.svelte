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
	let hasBallot = false;
	
	// Year selection for past ballots
	let availableYears = [];
	let selectedYear = YEAR;
	let showYearDropdown = false;
	let dropdownElement = null;
	let settingsUnsubscribe = null;

	onMount(async () => {
		if (!$user) {
			await goto('/login');
			return;
		}

		// Load available years
		try {
			const settingsRef = ref(db, '/settings');
			const settingsSnapshot = await get(settingsRef);
			const settingsData = settingsSnapshot.val() || {};
			availableYears = Object.keys(settingsData)
				.map(year => parseInt(year))
				.sort((a, b) => b - a);
		} catch (error) {
			console.error('Error loading years:', error);
		}

		// Load the current year ballot
		await loadBallot(selectedYear);

		// Click outside handler for dropdown
		const handleClickOutside = (event) => {
			if (dropdownElement && !dropdownElement.contains(event.target)) {
				showYearDropdown = false;
			}
		};
		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
			if (settingsUnsubscribe) {
				settingsUnsubscribe();
			}
		};
	});

	async function loadBallot(year) {
		loading = true;

		// Unsubscribe from previous settings listener
		if (settingsUnsubscribe) {
			settingsUnsubscribe();
		}

		// Load categories
		try {
			const categoriesRef = ref(db, `/groups/${year}`);
			const snapshot = await get(categoriesRef);
			categories = snapshot.val() || [];
		} catch (error) {
			console.error('Error loading categories:', error);
		}

		// Listen to settings (locked status and results)
		const settingsRef = ref(db, `/settings/${year}`);
		settingsUnsubscribe = onValue(settingsRef, (snapshot) => {
			const settings = snapshot.val();
			if (settings) {
				locked = settings.locked || false;
				results = settings.results || [];
			}
		});

		// Load user's ballot
		try {
			const ballotRef = ref(db, `/ballots/${year}/${$user.uid}/votes`);
			const snapshot = await get(ballotRef);
			if (snapshot.exists()) {
				ballot = snapshot.val() || [];
				hasBallot = ballot.length > 0;
			} else {
				ballot = [];
				hasBallot = false;
			}
		} catch (error) {
			console.error('Error loading ballot:', error);
			hasBallot = false;
		}

		loading = false;
	}

	async function selectYear(year) {
		selectedYear = year;
		showYearDropdown = false;
		await loadBallot(year);
	}

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
			const ballotRef = ref(db, `ballots/${selectedYear}/${$user.uid}`);
			await set(ballotRef, { displayName: $user.displayName, votes: tempBallot });
			ballot = tempBallot;
			hasBallot = ballot.length > 0;
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
			{#if hasBallot && locked && results.length > 0}
				<span class="ml-2 text-sm">Score: {tempScore}/{results.length}</span>
			{/if}
			{#if !hasBallot}
				<span class="ml-2 text-sm text-gray-600 dark:text-gray-300 italic">No ballot submitted</span>
			{/if}
		</PageHeading>

		<!-- Year Selector Dropdown -->
		{#if availableYears.length > 1}
			<div class="max-w-xs mb-6 mt-6" bind:this={dropdownElement}>
				<label for="year-select" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
					View Ballot:
				</label>
				<div class="relative">
					<button
						id="year-select"
						on:click={() => showYearDropdown = !showYearDropdown}
						class="w-full p-3 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-lg text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<span class="text-blue-700 dark:text-blue-400 font-medium">
							{selectedYear} {selectedYear === YEAR ? '(Current)' : ''}
						</span>
						<span class="text-blue-500 dark:text-blue-400">▼</span>
					</button>

					{#if showYearDropdown}
						<div class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
							{#each availableYears as year (year)}
								<button
									on:click={() => selectYear(year)}
									class="w-full p-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900 focus:bg-blue-50 dark:focus:bg-blue-900 focus:outline-none border-b border-gray-100 dark:border-gray-700 last:border-b-0 {year === selectedYear ? 'bg-blue-100 dark:bg-blue-900 font-semibold' : ''}"
								>
									<span class="text-gray-900 dark:text-gray-100">{year}</span>
									{#if year === YEAR}
										<span class="text-xs text-blue-600 dark:text-blue-400 ml-2">(Current)</span>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<div
			class="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-blue-700 border-8 rounded-sm border-opacity-10 card-polish p-4 bg-blue-100"
		>
			{#each categories as cat (cat.id)}
				{@const winner = results.find((x) => x.indexOf(cat.id) > -1)}
				{@const winningCandidate = cat.candidates && winner ? cat.candidates.find((c) => `${cat.id}__${keyFromName(c.text)}` === winner) : null}
				{@const won = hasBallot && ballot.indexOf(winner) > -1}
				{@const resultClass = hasBallot && locked && results.length > 0 && winner && won ? 'text-green-600' : hasBallot && locked && results.length > 0 && winner && !won ? 'text-red-600' : ''}
				{@const resultSymbol = hasBallot && locked && results.length > 0 && winner && won ? '✓' : hasBallot && locked && results.length > 0 && winner && !won ? '✕' : ''}
				<div class="mb-6">
					<h2 class="text-md font-semibold mb-2 uppercase">
						{cat.name}
						<i class={resultClass}>{resultSymbol}</i>
					</h2>
					{#if !hasBallot && locked && results.length > 0 && winner && winningCandidate}
						<div class="text-xs mt-1 text-blue-700 dark:text-blue-400">Winner: {winningCandidate.text}</div>
					{/if}
					{#each cat.candidates as candidate (candidate.text)}
						{@const key = `${cat.id}__${keyFromName(candidate.text)}`}
						{@const isWinner = results.indexOf(key) > -1}
						<label
							class={`border-solid block pl-2 ml-2 border-l border-indigo-200 ${
								isWinner ? resultClass : ''
							}`}
							for={key}
						>
							<input
								disabled={locked || selectedYear !== YEAR}
								on:change={updateBallot}
								checked={isSelected(ballot, key)}
								class="mr-2"
								type="radio"
								name={cat.id}
								value={key}
								id={key}
							/>
							<span class="uppercase">{candidate.text}</span>
							{#if locked && results.length > 0 && isWinner}
								<span class="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-300">Winner</span>
							{/if}
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
