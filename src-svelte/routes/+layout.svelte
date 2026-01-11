<script>
	import '../lib/styles/app.css';
	import Chrome from '$lib/components/Chrome.svelte';
	import { initializing } from '$lib/services/auth';
	import Loader from '$lib/components/Loader.svelte';

	export let data;
</script>

<svelte:head>
	<title>Eisenberg Oscar Party</title>
	<meta name="description" content="Oscars voting application" />
</svelte:head>

{#if $initializing}
	<Chrome>
		<Loader />
	</Chrome>
{:else}
	<Chrome>
		<slot />
	</Chrome>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
