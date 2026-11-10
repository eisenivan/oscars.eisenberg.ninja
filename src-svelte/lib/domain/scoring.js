import { byCategory, categoryOf, winnersOf } from './keys.js';

/** One point per category whose pick is a winner (any of them, for a tie). */
export function scoreVotes(votes = [], results = []) {
	const winners = winnersOf(results);
	let score = 0;
	for (const [cat, pick] of Object.entries(byCategory(votes))) if (winners[cat]?.includes(pick)) score += 1;
	return score;
}

/** Number of categories with at least one winner (ties count once). */
export function announcedCount(results = []) {
	return Object.keys(winnersOf(results)).length;
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

/**
 * One entry per announced category, newest first, with how many ballots
 * got it. A tie is one entry with several `keys` and winners joined by "&".
 */
export function resultsFeed(categories = [], ballots = {}, results = []) {
	const catById = Object.fromEntries((categories || []).map((c) => [c.id, c]));
	const all = Object.values(ballots || {});
	return Object.entries(winnersOf(results))
		.map(([catId, keys]) => {
			const cat = catById[catId];
			const names = keys.map((k) => cat?.candidates?.find((c) => c.key === k)?.text || k.split('__')[1]);
			const correct = all.filter((b) => keys.some((k) => (b?.votes || []).includes(k))).length;
			return {
				key: catId,
				keys,
				tie: keys.length > 1,
				categoryId: catId,
				category: cat?.name || catId,
				winner: names.join(' & '),
				correct,
				total: all.length
			};
		})
		.reverse();
}

/** Per-category outcome for a ballot. winnersMap comes from winnersOf(). */
export function outcome(votesMap, winnersMap, categoryId) {
	const winners = winnersMap[categoryId] || [];
	const pick = votesMap[categoryId];
	if (!winners.length) return pick ? 'pending' : 'empty';
	if (!pick) return 'none';
	return winners.includes(pick) ? 'correct' : 'missed';
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

export { byCategory, winnersOf };
