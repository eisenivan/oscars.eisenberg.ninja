<script>
	import { goto } from '$app/navigation';
	import { user } from '$lib/services/auth';
	import { signUpWithEmail } from '$lib/services/auth';
	import PageHeading from '$lib/components/PageHeading.svelte';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let displayName = '';
	let error = '';

	const handleSignUp = async (e) => {
		e.preventDefault();
		error = '';

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		try {
			await signUpWithEmail(email, password, displayName);
			await goto('/');
		} catch (err) {
			error = err.message;
			console.warn(err);
		}
	};

	if ($user) {
		goto('/');
	}
</script>

<div class="w-full mt-2 max-w-xs m-auto bg-blue-100 p-5 border-blue-700 border-8 rounded-sm border-opacity-10 shadow-sm">
	<div class="mx-auto text-center mb-5">
		<PageHeading>Register</PageHeading>
	</div>
	<form on:submit={handleSignUp}>
		{#if error}
			<div class="text-red-600 text-sm mb-4">{error}</div>
		{/if}
		<div>
			<label class="block mb-2 text-blue-500" for="displayName">Display Name</label>
			<input
				class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300"
				type="text"
				name="displayName"
				bind:value={displayName}
				required
			/>
		</div>
		<div>
			<label class="block mb-2 text-blue-500" for="email">Email</label>
			<input
				class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300"
				type="email"
				name="email"
				bind:value={email}
				required
			/>
		</div>
		<div>
			<label class="block mb-2 text-blue-500" for="password">Password</label>
			<input
				class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300"
				type="password"
				name="password"
				bind:value={password}
				required
			/>
		</div>
		<div>
			<label class="block mb-2 text-blue-500" for="confirmPassword">Confirm Password</label>
			<input
				class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300"
				type="password"
				name="confirmPassword"
				bind:value={confirmPassword}
				required
			/>
		</div>
		<div>
			<button
				type="submit"
				class="block text-center bg-blue-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto"
			>
				Register
			</button>
		</div>
		<div class="mb-3">
			<p class="text-xs italic text-center">Already have an account?</p>
			<a href="/login" class="block text-center mx-auto text-xs underline">Login</a>
		</div>
	</form>
</div>
