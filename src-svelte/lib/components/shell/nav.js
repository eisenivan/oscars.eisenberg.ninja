export const navItems = (year, current) => [
	{ href: year === current ? '/' : `/?year=${year}`, label: 'Ballot', icon: 'ballot', match: (p) => p === '/' },
	{ href: `/scoreboard/${year}`, label: 'Leaderboard', short: 'Board', icon: 'trophy', match: (p) => p.startsWith('/scoreboard') },
	{ href: '/all-time', label: 'All-Time', icon: 'medal', match: (p) => p.startsWith('/all-time') }
];
