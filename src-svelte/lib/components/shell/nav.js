import { YEAR } from '$lib/data/queries.js';

export const navItems = (year) => [
	{ href: year === YEAR ? '/' : `/?year=${year}`, label: 'Ballot', icon: 'ballot', match: (p) => p === '/' },
	{ href: `/scoreboard/${year}`, label: 'Leaderboard', short: 'Board', icon: 'trophy', match: (p) => p.startsWith('/scoreboard') },
	{ href: '/all-time', label: 'All-Time', icon: 'medal', match: (p) => p.startsWith('/all-time') }
];
