<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/services/auth';
	import { db } from '$lib/services/auth';
	import { keyFromName, isSelected } from '$lib/helpers';
	import { ref, get, onValue, set } from 'firebase/database';

	export let data;

	let id = data.id;
	let locked = true;
	let categories = [];
	let results = [];

	onMount(async () => {
		// Load categories for the year specified in the URL parameter
		try {
			const categoriesRef = ref(db, `/groups/${id}`);
			const snapshot = await get(categoriesRef);
			categories = snapshot.val() || [];
		} catch (error) {
			console.error('Error loading categories:', error);
		}

		// Listen to settings
		const settingsRef = ref(db, `/settings/${id}`);
		onValue(settingsRef, (snapshot) => {
			const settings = snapshot.val();
			if (settings) {
				locked = settings.locked || false;
				results = settings.results || [];
			}
		});
	});

	const updateLocked = async (e) => {
		const value = e.target.checked;
		try {
			const lockedRef = ref(db, `settings/${id}/locked`);
			await set(lockedRef, !!value);
			locked = value;
		} catch (error) {
			console.error('Error updating locked status:', error);
		}
	};

	const updateResults = async (e) => {
		const value = e.target.value;
		const tempResults = [...results];
		const category = value.split('__')[0];
		const index = tempResults.findIndex((x) => x.indexOf(category) > -1);

		if (index === -1) {
			tempResults.push(value);
		} else {
			tempResults[index] = value;
		}

		try {
			const resultsRef = ref(db, `settings/${id}/results`);
			await set(resultsRef, tempResults);
			results = tempResults;
		} catch (error) {
			console.error('Error updating results:', error);
		}
	};
</script>

<svelte:head>
	<title>Admin</title>
</svelte:head>

<div>
	<label class="border-solid block pl-2 mb-6" for="locked">
		<input class="mr-2" on:change={updateLocked} type="checkbox" checked={locked} id="locked" />
		<span class="">Close voting</span>
	</label>

	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
		{#each categories as cat (cat.id)}
			<div class="mb-6">
				<h2 class="text-xl lg:text-2xl mb-2">{cat.name}</h2>
				{#each cat.candidates as candidate (candidate.text)}
					{@const key = `${cat.id}__${keyFromName(candidate.text)}`}
					<label class="border-solid block pl-2 ml-2 border-l" for={key}>
						<input
							checked={isSelected(results, key)}
							on:change={updateResults}
							class="mr-2"
							type="radio"
							name={cat.id}
							value={key}
							id={key}
						/>
						<span class="">{candidate.text}</span>
						{#if candidate.subtext}
							<span class="block ml-6 pb-2 font-thin text-xs italic">{candidate.subtext}</span>
						{/if}
					</label>
				{/each}
			</div>
		{/each}
	</div>
</div>
