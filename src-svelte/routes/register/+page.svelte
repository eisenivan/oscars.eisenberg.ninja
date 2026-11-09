<script>
	import { goto } from '$app/navigation';
	import { signUp, authMessage } from '$lib/auth.js';
	import AuthCard from '$lib/components/shell/AuthCard.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let displayName = '';
	let email = '';
	let password = '';
	let confirm = '';
	let error = '';
	let busy = false;
	let touchedConfirm = false;

	$: mismatch = touchedConfirm && confirm && password !== confirm;
	$: short = password && password.length < 6;

	async function submit() {
		error = '';
		touchedConfirm = true;
		if (!displayName.trim()) return (error = 'Add the name you want on the leaderboard.');
		if (password !== confirm) return (error = 'Passwords don’t match.');
		busy = true;
		try {
			await signUp(email.trim(), password, displayName.trim());
			await goto('/', { invalidateAll: true });
		} catch (err) {
			error = authMessage(err);
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Create account · Oscars</title></svelte:head>

<AuthCard title="Join the party" subtitle="Make an account to fill out your ballot.">
	<form on:submit|preventDefault={submit} class="space-y-4" novalidate>
		{#if error}
			<p class="flex items-start gap-2 rounded-sm bg-danger/10 p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} class="mt-px" />{error}</p>
		{/if}
		<TextField label="Your name" hint="This is how you’ll appear on the leaderboard." bind:value={displayName} autocomplete="nickname" required />
		<TextField label="Email" type="email" bind:value={email} autocomplete="email" inputmode="email" required />
		<TextField label="Password" type="password" bind:value={password} autocomplete="new-password" error={short ? 'Use at least 6 characters.' : ''} required />
		<TextField label="Confirm password" type="password" bind:value={confirm} autocomplete="new-password" on:blur={() => (touchedConfirm = true)} error={mismatch ? 'Passwords don’t match.' : ''} required>
			{#if confirm && password === confirm}
				<p class="flex items-center gap-1.5 text-[13px] text-success"><Icon name="check" size={14} /> Passwords match</p>
			{/if}
		</TextField>
		<Button type="submit" size="lg" full loading={busy}>Create account</Button>
	</form>
	<svelte:fragment slot="footer">
		Already have an account? <a href="/login" class="font-semibold text-gold hover:underline">Log in</a>
	</svelte:fragment>
</AuthCard>
