// Dev-only in-memory database for demo mode. See demo-flag.js.
import { withKeys } from '$lib/domain/keys.js';
import groups2026 from './fixtures/groups-2026.json';
import groups2025 from './fixtures/groups-2025.json';
import settings2026 from './fixtures/settings-2026.json';
import settings2025 from './fixtures/settings-2025.json';

export const demoUser = {
	uid: 'demo-me',
	displayName: 'Ivan',
	email: 'demo@example.com'
};

const NAMES = ['Sarah', 'Dan', 'Mia', 'Rachel', 'Josh', 'Grandma Ruth', 'Ben', 'Lena', 'Noah', 'Aunt Debbie', 'Eli'];

// Deterministic pseudo-random so screenshots are stable.
function rng(seed) {
	let s = seed;
	return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function makeBallots(groups, results, seed, accuracy) {
	const rand = rng(seed);
	const winners = Object.fromEntries((results || []).map((k) => [k.split('__')[0], k]));
	const cats = withKeys(groups);
	const people = [[demoUser.uid, demoUser.displayName], ...NAMES.map((n, i) => [`u${i}`, n])];
	const ballots = {};
	people.forEach(([uid, displayName], p) => {
		const skill = accuracy - p * 0.025 + rand() * 0.1;
		const votes = cats.map((cat) => {
			const w = winners[cat.id];
			if (w && rand() < skill) return w;
			return cat.candidates[Math.floor(rand() * cat.candidates.length)].key;
		});
		ballots[uid] = { displayName, votes };
	});
	return ballots;
}

export function buildTree(mode) {
	const final2026 = settings2026.results || [];
	const results2026 = mode === 'open' ? [] : mode === 'final' ? final2026 : final2026.slice(0, 11);
	const ballots2026 = makeBallots(groups2026, final2026, 7, 0.62);
	if (mode === 'open') {
		// Partially filled ballot and only some people submitted.
		ballots2026[demoUser.uid].votes = ballots2026[demoUser.uid].votes.slice(0, 14);
		['u8', 'u9', 'u10'].forEach((u) => delete ballots2026[u]);
	}
	return {
		settings: {
			2025: { locked: true, results: settings2025.results || [] },
			2026: { locked: mode !== 'open', results: results2026 }
		},
		groups: { 2025: groups2025, 2026: groups2026 },
		ballots: {
			2025: makeBallots(groups2025, settings2025.results, 3, 0.6),
			2026: ballots2026
		},
		admins: { [demoUser.uid]: true }
	};
}
