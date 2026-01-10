<script>
	import { goto } from '$app/navigation';
	import { user } from '$lib/services/auth';
	import { signInWithEmail } from '$lib/services/auth';
	import PageHeading from '$lib/components/PageHeading.svelte';

	let isResetting = false;
	let email = '';
	let password = '';
	let error = '';

	const handleLogin = async (e) => {
		e.preventDefault();
		error = '';
		try {
			await signInWithEmail(email, password);
			await goto('/');
		} catch (err) {
			error = err.message;
			console.warn(err);
		}
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		error = '';
		try {
			const { sendPasswordResetEmail } = await import('firebase/auth');
			const { auth } = await import('$lib/services/auth');
			await sendPasswordResetEmail(auth, email);
			isResetting = false;
			error = 'Password reset email sent!';
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
		<PageHeading>Login</PageHeading>
	</div>
	{#if !isResetting}
		<form on:submit={handleLogin}>
			{#if error}
				<div class="text-red-600 text-sm mb-4">{error}</div>
			{/if}
			<div>
				<label class="block mb-2 text-blue-500" for="email">Email</label>
				<input
					class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300"
					type="text"
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
				<button
					type="submit"
					class="block text-center bg-blue-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto"
				>
					Login
				</button>
			</div>
			<div class="mb-3">
				<p class="text-xs italic text-center">Don't have an account?</p>
				<a href="/register" class="block text-center mx-auto text-xs underline">Register</a>
			</div>
			<div>
				<button
					type="button"
					class="block text-center mx-auto text-xs underline"
					on:click={() => (isResetting = true)}
				>
					Forgot Password?
				</button>
			</div>
		</form>
	{:else}
		<form on:submit={handleResetPassword}>
			{#if error}
				<div class="text-green-600 text-sm mb-4">{error}</div>
			{/if}
			<div>
				<label class="block mb-2 text-blue-500" for="email">Email</label>
				<input
					class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300"
					type="text"
					name="email"
					bind:value={email}
					required
				/>
			</div>
			<div>
				<button
					type="submit"
					class="block text-center bg-blue-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto"
				>
					Reset Password
				</button>
			</div>
			<div class="mb-3">
				<p class="text-xs italic text-center">Don't have an account?</p>
				<a href="/register" class="block text-center mx-auto text-xs underline">Register</a>
			</div>
			<div>
				<button
					type="button"
					class="block text-center mx-auto text-xs underline"
					on:click={() => (isResetting = false)}
				>
					Return to Login
				</button>
			</div>
		</form>
	{/if}
</div>
