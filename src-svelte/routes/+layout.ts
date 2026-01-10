import { redirect } from '@sveltejs/kit';
import { user, initializing } from '$lib/services/auth';
import { get } from 'svelte/store';

export async function load({ url }) {
	const publicRoutes = ['/login', '/register'];
	const isPublicRoute = publicRoutes.includes(url.pathname);

	// Get current values
	const authUser = get(user);
	const isInitializing = get(initializing);

	// If still initializing, just return (let the page show loader)
	if (isInitializing) {
		return {
			user: authUser
		};
	}

	// Only redirect authenticated users away from login/register
	if (authUser && isPublicRoute) {
		throw redirect(302, '/');
	}

	return {
		user: authUser
	};
}
