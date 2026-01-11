<script>
	import { goto } from '$app/navigation';
	import { user } from '$lib/services/auth';
	import { db, auth, sendPasswordResetEmail } from '$lib/services/auth';
	import Loader from '$lib/components/Loader.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';
	import { ref } from 'firebase/database';
	import { updateProfile as updateFirebaseProfile, updateEmail } from 'firebase/auth';

	let displayName = '';
	let email = '';
	let loading = false;
	let resetMessage = '';
	let resetLoading = false;

	$: if ($user) {
		displayName = $user.displayName || '';
		email = $user.email || '';
	}

	const updateProfile = async (e) => {
		e.preventDefault();
		loading = true;

		try {
			if (displayName && displayName !== $user.displayName) {
				await updateFirebaseProfile($user, { displayName });
			}

			if (email && email !== $user.email) {
				await updateEmail($user, email);
			}

			loading = false;
			await goto('/');
		} catch (error) {
			console.error('Error updating profile:', error);
			loading = false;
		}
	};

	const handlePasswordReset = async () => {
		resetMessage = '';
		resetLoading = true;
		try {
			await sendPasswordResetEmail($user.email);
			resetMessage = 'Password reset email sent! Check your inbox.';
		} catch (error) {
			console.error('Error sending reset email:', error);
			resetMessage = error.message || 'Error sending password reset email';
		} finally {
			resetLoading = false;
		}
	};

	if (!$user) {
		goto('/login');
	}
</script>

<svelte:head>
	<title>Your Profile</title>
</svelte:head>

<div class="w-full mt-2 max-w-sm m-auto card-polish p-5 bg-blue-100">
	<header>
		<div class="mx-auto text-center mb-5">
			<PageHeading>Your Profile</PageHeading>
		</div>
	</header>
	<form on:submit={updateProfile}>
		<div>
			<label class="block text-blue-500" for="displayName">Display Name</label>
			<div class="text-xs mb-2 text-black-100 italic">This will be the name that shows up on the leaderboard. Change this to your name.</div>
			<input
				bind:value={displayName}
				class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300"
				type="text"
				name="displayName"
			/>
		</div>
		<div>
			<label class="block mb-2 text-blue-500" for="email">Email</label>
			<input
				bind:value={email}
				class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300"
				type="email"
				name="email"
			/>
		</div>
		<div>
			<button
				type="submit"
				class="block text-center bg-blue-700 hover:bg-indigo-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto w-max-md"
				disabled={loading}
			>
				{#if loading}
					<Loader color="#FFF" style="height: 20px" />
				{:else}
					Update Profile
				{/if}
			</button>
		</div>
	</form>

	<div>
		{#if resetMessage}
			<div class="text-sm mb-4 {resetMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}">
				{resetMessage}
			</div>
		{/if}
		<button
			type="button"
			on:click={handlePasswordReset}
			disabled={resetLoading}
			class="block hover:text-indigo-500 text-blue-500 font-bold py-2 px-4 mb-6 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{resetLoading ? 'Sending...' : 'Reset Password?'}
		</button>
	</div>
</div>
