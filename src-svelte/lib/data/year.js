import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { currentYear } from './queries.js';

/** The year the user is looking at, from the URL (/scoreboard/2025, /?year=2025). */
export const activeYear = derived([page, currentYear], ([$page, $current]) => {
	const y = Number($page.params?.year || $page.url.searchParams.get('year'));
	return y || $current;
});

/** Where the year picker should go for the current route. */
export function hrefForYear(pathname, year, current) {
	if (pathname.startsWith('/scoreboard')) return `/scoreboard/${year}`;
	if (pathname.startsWith('/admin')) return `/admin/${year}`;
	return year === current ? '/' : `/?year=${year}`;
}
