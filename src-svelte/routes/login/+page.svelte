<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signIn, resetPassword, authMessage } from '$lib/auth.js';
	import AuthCard from '$lib/components/shell/AuthCard.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let mode = 'login'; // login | reset
	let email = '';
	let password = '';
	let error = '';
	let notice = '';
	let busy = false;

	async function submit() {
		error = notice = '';
		busy = true;
		try {
			if (mode === 'login') {
				await signIn(email.trim(), password);
				await goto($page.url.searchParams.get('next') || '/', { invalidateAll: true });
			} else {
				await resetPassword(email.trim());
				notice = `We sent a reset link to ${email.trim()}. Check spam if you don’t see it.`;
			}
		} catch (err) {
			error = authMessage(err);
		} finally {
			busy = false;
		}
	}
	function switchMode(m) {
		mode = m;
		error = notice = '';
	}
</script>

<svelte:head><title>{mode === 'login' ? 'Log in' : 'Reset password'} · Oscars</title></svelte:head>

<AuthCard
	title={mode === 'login' ? 'Welcome back' : 'Reset password'}
	subtitle={mode === 'login' ? 'Log in to fill out your Oscar ballot.' : 'We’ll email you a link to choose a new one.'}
>
	<form on:submit|preventDefault={submit} class="space-y-4" novalidate>
		{#if error}
			<p class="flex items-start gap-2 rounded-sm bg-danger/10 p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} class="mt-px" />{error}</p>
		{/if}
		{#if notice}
			<p class="flex items-start gap-2 rounded-sm bg-success/10 p-3 text-sm text-success" role="status"><Icon name="check" size={18} class="mt-px" />{notice}</p>
		{/if}
		<TextField label="Email" type="email" bind:value={email} autocomplete="email" inputmode="email" required />
		{#if mode === 'login'}
			<TextField label="Password" type="password" bind:value={password} autocomplete="current-password" required />
			<div class="-mt-1 text-right">
				<button type="button" class="text-sm font-medium text-gold hover:underline" on:click={() => switchMode('reset')}>Forgot password?</button>
			</div>
		{/if}
		<Button type="submit" size="lg" full loading={busy}>{mode === 'login' ? 'Log in' : 'Send reset link'}</Button>
		{#if mode === 'reset'}
			<Button variant="ghost" full on:click={() => switchMode('login')}><Icon name="chevron-left" size={18} /> Back to log in</Button>
		{/if}
	</form>
	<svelte:fragment slot="footer">
		New here? <a href="/register" class="font-semibold text-gold hover:underline">Create an account</a>
		<span class="mx-1.5">·</span><a href="/about" class="hover:text-fg hover:underline">How it works</a>
	</svelte:fragment>
</AuthCard>
