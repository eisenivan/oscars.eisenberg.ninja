import { redirect } from '@sveltejs/kit';
import { YEAR } from '$lib/data/queries.js';

export function load() {
	throw redirect(307, `/scoreboard/${YEAR}`);
}
