<script>
	import { goto } from '$app/navigation';
	import { user } from '$lib/services/auth';
	import { auth } from '$lib/services/auth';

	let menuOpen = false;

	const handleLogout = async () => {
		const { signOut } = await import('firebase/auth');
		await signOut(auth);
		await goto('/login');
	};
</script>

<nav class="relative flex flex-wrap items-center justify-between px-2 navbar-expand-lg bg-blue-700 sm:mb-2 md:mb-6">
	<div class="container mx-auto flex flex-wrap items-center justify-between">
		<div class="w-full relative flex justify-between lg:w-auto lg:px-4 lg:static lg:block lg:justify-start">
			<a href="/" class="text-sm font-bold leading-relaxed inline-block mr-4 whitespace-nowrap uppercase text-white">
				<h1>oscars // eisenberg // ninja</h1>
			</a>
			<button
				on:click={() => (menuOpen = !menuOpen)}
				class="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
				type="button"
			>
				<span class="block relative w-6 h-px rounded-sm bg-white" />
				<span class="block relative w-6 h-px rounded-sm bg-white mt-1" />
				<span class="block relative w-6 h-px rounded-sm bg-white mt-1" />
			</button>
		</div>
		<div
			class={`lg:flex flex-grow items-center ${!menuOpen ? 'hidden sm:hidden lg:block' : ''}`}
			id="navbar-menu"
		>
			<ul class="flex flex-col lg:flex-row list-none ml-auto">
				{#if $user}
					<li>
						<a
							href="/"
							class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
						>
							My Ballot
						</a>
					</li>
					<li>
						<a
							href="/scoreboard"
							class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
						>
							Leaderboard
						</a>
					</li>
					<li>
						<a
							href="/profile"
							class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
						>
							Profile
						</a>
					</li>
					<li>
						<button
							on:click={handleLogout}
							class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
						>
							Logout
						</button>
					</li>
				{:else}
					<li>
						<a
							href="/login"
							class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
						>
							Login
						</a>
					</li>
					<li>
						<a
							href="/register"
							class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
						>
							Register
						</a>
					</li>
				{/if}
			</ul>
		</div>
	</div>
</nav>

<div class="container mx-auto mt-4 px-4">
	<slot />
</div>

<style>
	h1 {
		margin: 0;
	}
</style>
