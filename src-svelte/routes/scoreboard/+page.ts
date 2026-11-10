import { redirect } from '@sveltejs/kit';
import { loadCurrentYear } from '$lib/data/queries.js';

export async function load() {
	throw redirect(307, `/scoreboard/${await loadCurrentYear()}`);
}
