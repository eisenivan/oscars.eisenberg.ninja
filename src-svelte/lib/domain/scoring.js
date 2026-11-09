import { byCategory, categoryOf } from './keys.js';

export function scoreVotes(votes = [], results = []) {
	const picked = new Set(votes || []);
	let score = 0;
	for (const winner of results || []) if (winner && picked.has(winner)) score += 1;
	return score;
}

/**
 * Competition ranking ("1, 2, 2, 4"). Sorts by score desc, then name asc.
 * Entries need { score, displayName }. Returns new objects with `rank`.
 */
export function rankEntries(entries) {
	const sorted = [...entries].sort(
		(a, b) => b.score - a.score || (a.displayName || '').localeCompare(b.displayName || '')
	);
	let prev = null;
	return sorted.map((entry, i) => {
		const rank = prev && prev.score === entry.score ? prev.rank : i + 1;
		prev = { score: entry.score, rank };
		return { ...entry, rank };
	});
}

/** ballots: { [uid]: { displayName, votes } } -> ranked rows keyed by uid. */
export function buildLeaderboard(ballots = {}, results = []) {
	const rows = Object.entries(ballots || {}).map(([uid, b]) => ({
		uid,
		displayName: b?.displayName || 'Unknown',
		votes: b?.votes || [],
		score: scoreVotes(b?.votes, results)
	}));
	return rankEntries(rows);
}

/** How many ballots picked each announced winner. Newest result first. */
export function resultsFeed(categories = [], ballots = {}, results = []) {
	const catById = Object.fromEntries((categories || []).map((c) => [c.id, c]));
	const all = Object.values(ballots || {});
	return (results || [])
		.filter(Boolean)
		.map((winnerKey) => {
			const cat = catById[categoryOf(winnerKey)];
			const winner = cat?.candidates?.find((c) => c.key === winnerKey);
			const correct = all.filter((b) => (b?.votes || []).includes(winnerKey)).length;
			return {
				key: winnerKey,
				categoryId: cat?.id,
				category: cat?.name || categoryOf(winnerKey),
				winner: winner?.text || winnerKey.split('__')[1],
				correct,
				total: all.length
			};
		})
		.reverse();
}

/** Per-category outcome for a ballot. */
export function outcome(votesMap, resultsMap, categoryId) {
	const winner = resultsMap[categoryId];
	const pick = votesMap[categoryId];
	if (!winner) return pick ? 'pending' : 'empty';
	if (!pick) return 'none';
	return pick === winner ? 'correct' : 'missed';
}

/**
 * yearsData: [{ year, ballots, results }] for locked years.
 * All-time is aggregated by display name (as before) because some people
 * have used different accounts across years.
 */
export function medalTable(yearsData = []) {
	const people = {};
	for (const { year, ballots, results } of yearsData) {
		const ranked = buildLeaderboard(ballots, results);
		for (const row of ranked) {
			const name = row.displayName;
			people[name] ??= { displayName: name, gold: 0, silver: 0, bronze: 0, history: [] };
			const p = people[name];
			p.history.push({ year: Number(year), rank: row.rank, score: row.score, of: ranked.length });
			if (row.rank === 1) p.gold += 1;
			else if (row.rank === 2) p.silver += 1;
			else if (row.rank === 3) p.bronze += 1;
		}
	}
	return Object.values(people)
		.map((p) => ({
			...p,
			total: p.gold * 3 + p.silver * 2 + p.bronze,
			history: p.history.sort((a, b) => b.year - a.year)
		}))
		.sort(
			(a, b) =>
				b.total - a.total ||
				b.gold - a.gold ||
				b.silver - a.silver ||
				b.bronze - a.bronze ||
				a.displayName.localeCompare(b.displayName)
		);
}

/** Year champions (all rank-1 names) for the Hall of Champions strip. */
export function champions(yearsData = []) {
	return yearsData
		.map(({ year, ballots, results }) => ({
			year: Number(year),
			names: buildLeaderboard(ballots, results)
				.filter((r) => r.rank === 1)
				.map((r) => r.displayName)
		}))
		.filter((c) => c.names.length)
		.sort((a, b) => b.year - a.year);
}

export { byCategory };
