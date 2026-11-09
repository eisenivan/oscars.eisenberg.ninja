<script>
	import { user } from '$lib/auth.js';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const steps = [
		{ icon: 'ballot', title: 'Fill out your ballot', body: 'Pick one nominee in every category. Picks save as you tap, and you can change them until voting closes.' },
		{ icon: 'lock', title: 'Voting closes', body: 'Right before the ceremony, ballots lock. From then on, everyone can see everyone’s picks.' },
		{ icon: 'trophy', title: 'Follow along live', body: 'As each envelope opens, the leaderboard updates. One point per correct pick; ties share a rank.' },
		{ icon: 'medal', title: 'Chase the medals', body: 'Finish 1st, 2nd or 3rd for gold (3 pts), silver (2) or bronze (1) on the all-time board.' }
	];
	const tips = [
		['compare', 'Compare ballots', 'Open anyone’s ballot from the leaderboard and switch to “Compare” to see where you differ — and which differences are still in play.'],
		['users', 'Ties', 'Equal scores share a rank (1, 2, 2, 4). The next result usually breaks it.'],
		['user', 'Your name', 'The name on your profile is what everyone sees. Change it any time.'],
		['sparkles', 'Add to Home Screen', 'On your phone, use Share → Add to Home Screen for a full-screen app on Oscar night.']
	];
</script>

<svelte:head><title>How it works · Oscars</title></svelte:head>

<div class="mx-auto max-w-4xl">
	<header class="mb-8 text-center sm:mb-12">
		<p class="label-caps">Est. 2020</p>
		<h1 class="mt-2 font-display text-4xl font-semibold sm:text-5xl">How it works</h1>
		<p class="mx-auto mt-3 max-w-lg text-[17px] text-muted">The Eisenberg Oscar party ballot — born from necessity, kept for the trash talk.</p>
	</header>

	<ol class="grid gap-4 sm:grid-cols-2">
		{#each steps as s, i}
			<li class="card relative p-5 sm:p-6">
				<span class="absolute right-5 top-4 font-display text-5xl font-semibold text-surface-2" aria-hidden="true">{i + 1}</span>
				<span class="mb-4 grid h-11 w-11 place-items-center rounded-full bg-gold-fill/15 text-gold"><Icon name={s.icon} size={22} /></span>
				<h2 class="text-xl font-semibold">{s.title}</h2>
				<p class="mt-1.5 text-[15px] leading-relaxed text-muted">{s.body}</p>
			</li>
		{/each}
	</ol>

	<h2 class="mb-4 mt-10 text-2xl font-semibold">Good to know</h2>
	<ul class="card divide-y divide-line">
		{#each tips as [icon, title, body]}
			<li class="flex gap-4 p-5">
				<Icon name={icon} size={20} class="mt-0.5 text-gold" />
				<div>
					<p class="font-semibold">{title}</p>
					<p class="mt-0.5 text-[15px] leading-relaxed text-muted">{body}</p>
				</div>
			</li>
		{/each}
	</ul>

	{#if !$user}
		<div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
			<Button href="/register" size="lg">Create an account</Button>
			<Button href="/login" size="lg" variant="secondary">Log in</Button>
		</div>
	{/if}
</div>
