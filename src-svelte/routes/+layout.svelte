<script>
	import '@fontsource-variable/inter';
	import '@fontsource-variable/fraunces';
	import '../lib/styles/app.css';
	import { user } from '$lib/auth.js';
	import TopBar from '$lib/components/shell/TopBar.svelte';
	import BottomTabs from '$lib/components/shell/BottomTabs.svelte';
	import StatusBanner from '$lib/components/shell/StatusBanner.svelte';
	import AccountSheet from '$lib/components/shell/AccountSheet.svelte';
	import Toaster from '$lib/components/ui/Toaster.svelte';
	import { afterNavigate } from '$app/navigation';

	let accountOpen = false;
	afterNavigate(() => (accountOpen = false));
</script>

<a
	href="#main"
	class="sr-only z-[70] rounded-sm bg-gold-fill px-3 py-2 text-on-gold focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
	>Skip to content</a
>

<TopBar on:menu={() => (accountOpen = true)} />
{#if $user}<StatusBanner />{/if}

<main
	id="main"
	class="mx-auto w-full max-w-7xl px-4 pb-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom)+32px)] pt-5 sm:px-6 sm:pt-8 lg:px-8 lg:pb-16"
>
	<slot />
</main>

{#if $user}
	<BottomTabs moreOpen={accountOpen} on:more={() => (accountOpen = true)} />
	<AccountSheet bind:open={accountOpen} />
{/if}
<Toaster />
