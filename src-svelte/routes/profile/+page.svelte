<script>
	import { user, updateDisplayName, changeEmail, resetPassword, signOut, authMessage } from '$lib/auth.js';
	import { syncBallotName, currentYear } from '$lib/data/queries.js';
	import { themeMode } from '$lib/stores/theme.js';
	import { toast } from '$lib/stores/toast.js';
	import { goto } from '$app/navigation';
	import TextField from '$lib/components/ui/TextField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let name = $user.displayName || '';
	let email = $user.email || '';
	let savingName = false;
	let savingEmail = false;
	let sendingReset = false;
	let nameError = '';
	let emailError = '';

	async function saveName() {
		nameError = '';
		const n = name.trim();
		if (!n) return (nameError = 'Your name can’t be empty.');
		savingName = true;
		try {
			await updateDisplayName(n);
			await syncBallotName($currentYear, $user, n);
			toast('Name updated', { tone: 'success' });
		} catch (err) {
			nameError = authMessage(err);
		} finally {
			savingName = false;
		}
	}

	async function saveEmail() {
		emailError = '';
		savingEmail = true;
		try {
			await changeEmail(email.trim());
			toast('Check your inbox', { tone: 'success', detail: `Click the link we sent to ${email.trim()} to confirm the change.`, timeout: 8000 });
		} catch (err) {
			emailError = authMessage(err);
		} finally {
			savingEmail = false;
		}
	}

	async function reset() {
		sendingReset = true;
		try {
			await resetPassword($user.email);
			toast('Password reset email sent', { tone: 'success', detail: 'Check your spam folder if it doesn’t show up.' });
		} catch (err) {
			toast(authMessage(err), { tone: 'danger' });
		} finally {
			sendingReset = false;
		}
	}

	const themes = [
		{ value: 'system', label: 'System', icon: 'monitor' },
		{ value: 'light', label: 'Light', icon: 'sun' },
		{ value: 'dark', label: 'Dark', icon: 'moon' }
	];
	$: nameChanged = name.trim() && name.trim() !== $user.displayName;
	$: emailChanged = email.trim() && email.trim() !== $user.email;
</script>

<svelte:head><title>Profile · Oscars</title></svelte:head>

<div class="mx-auto max-w-2xl">
	<header class="mb-6 flex items-center gap-4">
		<Avatar name={name || $user.email} size={64} />
		<div class="min-w-0">
			<p class="label-caps">Profile</p>
			<h1 class="page-title mt-0.5 truncate">{$user.displayName || 'Your profile'}</h1>
		</div>
	</header>

	<div class="space-y-4">
		<section class="card p-5 sm:p-6">
			<form on:submit|preventDefault={saveName} class="space-y-4">
				<TextField label="Display name" bind:value={name} autocomplete="nickname" error={nameError} />
				<div class="flex items-center gap-3 rounded-sm bg-surface-2 px-3 py-2.5 text-sm">
					<Avatar name={name} size={28} />
					<span class="text-muted">On the leaderboard as <strong class="text-fg">{name.trim() || '—'}</strong></span>
				</div>
				<div class="flex justify-end"><Button type="submit" loading={savingName} disabled={!nameChanged}>Save name</Button></div>
			</form>
		</section>

		<section class="card p-5 sm:p-6">
			<form on:submit|preventDefault={saveEmail} class="space-y-4">
				<TextField label="Email" type="email" bind:value={email} autocomplete="email" error={emailError} hint="We’ll send a confirmation link to the new address. Your email changes after you click it." />
				<div class="flex justify-end"><Button type="submit" variant="secondary" loading={savingEmail} disabled={!emailChanged}>Change email</Button></div>
			</form>
		</section>

		<section class="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
			<div>
				<h2 class="text-lg font-semibold">Password</h2>
				<p class="text-sm text-muted">Get a link to set a new password.</p>
			</div>
			<Button variant="secondary" loading={sendingReset} on:click={reset}>Send reset email</Button>
		</section>

		<section class="card p-5 sm:p-6">
			<h2 class="mb-3 text-lg font-semibold">Appearance</h2>
			<Segmented options={themes} bind:value={$themeMode} label="Theme" full />
		</section>

		<Button variant="danger" full size="lg" on:click={async () => { await signOut(); goto('/login'); }}>
			<Icon name="logout" size={18} /> Log out
		</Button>
	</div>
</div>
