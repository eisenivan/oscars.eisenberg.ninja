import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { YEAR } from './queries.js';

/** The year the user is looking at, from the URL (/scoreboard/2025, /?year=2025). */
export const activeYear = derived(page, ($page) => {
	const y = Number($page.params?.year || $page.url.searchParams.get('year'));
	return y || YEAR;
});

/** Where the year picker should go for the current route. */
export function hrefForYear(pathname, year) {
	if (pathname.startsWith('/scoreboard')) return `/scoreboard/${year}`;
	if (pathname.startsWith('/admin')) return `/admin/${year}`;
	return year === YEAR ? '/' : `/?year=${year}`;
}
