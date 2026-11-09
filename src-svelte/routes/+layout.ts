import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { user, authReady } from '$lib/auth.js';

// Pure client-side app served by the adapter-static fallback.
export const ssr = false;
export const prerender = false;

const PUBLIC = ['/login', '/register', '/about'];
const AUTH_ONLY = ['/login', '/register'];

export async function load({ url }) {
	await authReady;
	const u = get(user);
	const path = url.pathname;

	if (!u && !PUBLIC.includes(path)) {
		const next = path === '/' ? '' : `?next=${encodeURIComponent(path + url.search)}`;
		throw redirect(307, `/login${next}`);
	}
	if (u && AUTH_ONLY.includes(path)) {
		throw redirect(307, url.searchParams.get('next') || '/');
	}
	return { signedIn: !!u };
}
