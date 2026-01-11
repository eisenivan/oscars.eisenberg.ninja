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
	let loading = true;
	let isAdmin = false;

	onMount(async () => {
		if (!$user) {
			await goto('/login');
			return;
		}

		// Check if user is admin
		try {
			const adminRef = ref(db, `/admins/${$user.uid}`);
			const adminSnap = await get(adminRef);
			isAdmin = adminSnap.exists() && adminSnap.val() !== null;
			
			console.log('Admin check:', { uid: $user.uid, exists: adminSnap.exists(), value: adminSnap.val(), isAdmin });

			if (!isAdmin) {
				loading = false;
				await goto('/');
				return;
			}
		} catch (error) {
			console.error('Error checking admin status:', error);
			loading = false;
			await goto('/');
			return;
		}

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
			loading = false;
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
		const index = tempResults.findIndex((x) => x && x.indexOf(category) > -1);

		if (index === -1) {
			tempResults.push(value);
		} else {
			tempResults[index] = value;
		}

		try {
			const resultsRef = ref(db, `settings/${id}/results`);
			const cleanResults = tempResults.filter((x) => x !== undefined && x !== null);
			await set(resultsRef, cleanResults);
			results = cleanResults;
		} catch (error) {
			console.error('Error updating results:', error);
		}
	};

	const clearCategory = async (categoryId) => {
		const tempResults = results.filter((x) => !x || !x.startsWith(`${categoryId}__`));
		try {
			const resultsRef = ref(db, `settings/${id}/results`);
			await set(resultsRef, tempResults);
			results = tempResults;
		} catch (error) {
			console.error('Error clearing category:', error);
		}
	};
</script>

<svelte:head>
	<title>Admin</title>
</svelte:head>

{#if loading}
	<div class="text-center text-gray-700 dark:text-gray-300">Loading...</div>
{:else if isAdmin}
	<div>
	<label class="border-solid inline-block pl-2 mb-6" for="locked">
		<input class="mr-2" on:change={updateLocked} type="checkbox" checked={locked} id="locked" />
		<span class="">Close voting</span>
	</label>

	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
		{#each categories as cat (cat.id)}
			<div class="mb-6">
				<div class="flex items-center mb-2">
					<h2 class="text-xl lg:text-2xl mr-1">{cat.name}</h2>
					<button
						on:click={() => clearCategory(cat.id)}
						class="px-2 py-1 text-sm bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 rounded hover:bg-red-300 dark:hover:bg-red-800"
					>
						Clear
					</button>
				</div>
				{#each cat.candidates as candidate (candidate.text)}
					{@const key = `${cat.id}__${keyFromName(candidate.text)}`}
					<div class="flex items-baseline pl-2 ml-2 border-l border-solid">
						<input
							checked={isSelected(results, key)}
							on:change={updateResults}
							class="mr-2"
							type="radio"
							name={cat.id}
							value={key}
							id={key}
						/>
						<label for={key} class="cursor-pointer">
							<span class="">{candidate.text}</span>
							{#if candidate.subtext}
								<span class="block pb-2 font-thin text-xs italic">{candidate.subtext}</span>
							{/if}
						</label>
					</div>
				{/each}
			</div>
		{/each}
	</div>
	</div>
{:else}
	<div class="text-center text-red-600 dark:text-red-400">
		You do not have permission to access this page.
	</div>
{/if}
