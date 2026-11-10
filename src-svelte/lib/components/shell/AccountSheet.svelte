<script>
	import { goto } from '$app/navigation';
	import { user, signOut } from '$lib/auth.js';
	import { themeMode } from '$lib/stores/theme.js';
	import { activeYear } from '$lib/data/year.js';
	import { isAdmin } from '$lib/data/queries.js';
	import Sheet from '../ui/Sheet.svelte';
	import Icon from '../ui/Icon.svelte';
	import Avatar from '../ui/Avatar.svelte';
	import Segmented from '../ui/Segmented.svelte';

	export let open = false;
	let admin = false;
	$: if (open && $user) isAdmin($user.uid).then((v) => (admin = v));

	const themes = [
		{ value: 'system', label: 'System', icon: 'monitor' },
		{ value: 'light', label: 'Light', icon: 'sun' },
		{ value: 'dark', label: 'Dark', icon: 'moon' }
	];

	async function logout() {
		open = false;
		await signOut();
		await goto('/login');
	}
	const go = (href) => {
		open = false;
		goto(href);
	};
</script>

<Sheet bind:open title="Account">
	{#if $user}
		<div class="mb-5 flex items-center gap-3 rounded-md bg-surface-2 p-3">
			<Avatar name={$user.displayName || ''} size={44} highlight />
			<div class="min-w-0">
				<p class="truncate font-display text-lg font-semibold">{$user.displayName || 'No name yet'}</p>
				<p class="truncate text-sm text-muted">{$user.email}</p>
			</div>
		</div>
	{/if}
	<ul class="-mx-2 mb-5">
		<li>
			<button class="flex h-12 w-full items-center gap-3 rounded-sm px-2 text-left hover:bg-surface-2" on:click={() => go('/profile')}>
				<Icon name="user" class="text-muted" /> Profile <Icon name="chevron-right" size={18} class="ml-auto text-muted" />
			</button>
		</li>
		<li>
			<button class="flex h-12 w-full items-center gap-3 rounded-sm px-2 text-left hover:bg-surface-2" on:click={() => go('/about')}>
				<Icon name="info" class="text-muted" /> How it works <Icon name="chevron-right" size={18} class="ml-auto text-muted" />
			</button>
		</li>
		{#if admin}
			<li>
				<button class="flex h-12 w-full items-center gap-3 rounded-sm px-2 text-left hover:bg-surface-2" on:click={() => go(`/admin/${$activeYear}`)}>
					<Icon name="shield" class="text-muted" /> Enter results <Icon name="chevron-right" size={18} class="ml-auto text-muted" />
				</button>
			</li>
			<li>
				<button class="flex h-12 w-full items-center gap-3 rounded-sm px-2 text-left hover:bg-surface-2" on:click={() => go('/admin')}>
					<Icon name="calendar" class="text-muted" /> Seasons <Icon name="chevron-right" size={18} class="ml-auto text-muted" />
				</button>
			</li>
		{/if}
	</ul>
	<p class="label-caps mb-2">Theme</p>
	<Segmented options={themes} bind:value={$themeMode} label="Theme" full />
	<button class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-sm font-semibold text-danger hover:bg-danger/10" on:click={logout}>
		<Icon name="logout" size={18} /> Log out
	</button>
</Sheet>
