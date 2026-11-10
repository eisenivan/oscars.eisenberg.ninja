import { describe, it, expect } from 'vitest';
import { keyFromName, categoryOf, byCategory, upsertKey, removeCategory, withKeys } from './keys.js';
import { scoreVotes, rankEntries, buildLeaderboard, outcome, medalTable, resultsFeed, announcedCount } from './scoring.js';
import { winnersOf, toggleKey } from './keys.js';

describe('keys', () => {
	it('keeps the legacy nominee key format', () => {
		expect(keyFromName('Avatar: Fire and Ash')).toBe('avatar:fireandash');
		expect(keyFromName('Mr. Nobody Against Putin')).toBe('mr.nobodyagainstputin');
	});

	it('matches categories exactly, not by substring', () => {
		const votes = ['best-supporting-actor__seanpenn'];
		expect(byCategory(votes)['best-actor']).toBeUndefined();
		expect(upsertKey(votes, 'best-actor__x')).toEqual(['best-supporting-actor__seanpenn', 'best-actor__x']);
		expect(categoryOf('best-sound__f1')).toBe('best-sound');
	});

	it('replaces a pick in the same category and drops holes', () => {
		expect(upsertKey(['a__1', null, 'b__1'], 'a__2')).toEqual(['b__1', 'a__2']);
		expect(removeCategory(['a__1', 'b__1'], 'a')).toEqual(['b__1']);
	});

	it('precomputes candidate keys', () => {
		const [cat] = withKeys([{ id: 'best-picture', name: 'Best Picture', candidates: [{ text: 'F1' }] }]);
		expect(cat.short).toBe('Picture');
		expect(cat.candidates[0].key).toBe('best-picture__f1');
	});
});

describe('scoring', () => {
	it('scores and ignores null results', () => {
		expect(scoreVotes(['a__1', 'b__2'], ['a__1', null, 'b__3'])).toBe(1);
		expect(scoreVotes(undefined, ['a__1'])).toBe(0);
	});

	it('uses competition ranking with ties', () => {
		const ranked = rankEntries([
			{ displayName: 'C', score: 2 },
			{ displayName: 'A', score: 5 },
			{ displayName: 'B', score: 5 },
			{ displayName: 'D', score: 1 }
		]);
		expect(ranked.map((r) => [r.displayName, r.rank])).toEqual([
			['A', 1],
			['B', 1],
			['C', 3],
			['D', 4]
		]);
	});

	it('keys leaderboard rows by uid so duplicate names are fine', () => {
		const rows = buildLeaderboard(
			{ u1: { displayName: 'Sam', votes: ['a__1'] }, u2: { displayName: 'Sam', votes: [] } },
			['a__1']
		);
		expect(rows.map((r) => r.uid)).toEqual(['u1', 'u2']);
	});

	it('reports per-category outcome', () => {
		expect(outcome({ a: 'a__1' }, { a: ['a__1'] }, 'a')).toBe('correct');
		expect(outcome({ a: 'a__2' }, { a: ['a__1'] }, 'a')).toBe('missed');
		expect(outcome({ a: 'a__2' }, { a: ['a__1', 'a__2'] }, 'a')).toBe('correct');
		expect(outcome({ a: 'a__2' }, {}, 'a')).toBe('pending');
		expect(outcome({}, { a: ['a__1'] }, 'a')).toBe('none');
		expect(outcome({}, {}, 'a')).toBe('empty');
	});

	it('builds a medal table with points and history', () => {
		const table = medalTable([
			{ year: 2024, results: ['a__1'], ballots: { u1: { displayName: 'A', votes: ['a__1'] }, u2: { displayName: 'B', votes: [] } } },
			{ year: 2025, results: ['a__1'], ballots: { u1: { displayName: 'A', votes: [] }, u2: { displayName: 'B', votes: ['a__1'] } } }
		]);
		expect(table[0]).toMatchObject({ displayName: 'A', gold: 1, silver: 1, total: 5 });
		expect(table[0].history.map((h) => h.year)).toEqual([2025, 2024]);
	});

	it('builds a newest-first results feed with pick counts', () => {
		const cats = withKeys([{ id: 'a', name: 'Best A', candidates: [{ text: 'One' }, { text: 'Two' }] }]);
		const feed = resultsFeed(cats, { u1: { votes: ['a__one'] }, u2: { votes: ['a__two'] } }, ['a__one']);
		expect(feed[0]).toMatchObject({ category: 'Best A', winner: 'One', correct: 1, total: 2 });
	});
});

describe('category ties', () => {
	const results = ['a__1', 'b__1', 'b__2'];

	it('groups winners by category', () => {
		expect(winnersOf(results)).toEqual({ a: ['a__1'], b: ['b__1', 'b__2'] });
		expect(winnersOf(['a__1', 'a__1'])).toEqual({ a: ['a__1'] });
		expect(announcedCount(results)).toBe(2);
	});

	it('gives one point for picking either tied winner, never two', () => {
		expect(scoreVotes(['a__1', 'b__2'], results)).toBe(2);
		expect(scoreVotes(['a__2', 'b__1'], results)).toBe(1);
		// A malformed ballot with both tied nominees still only scores once.
		expect(scoreVotes(['b__1', 'b__2'], results)).toBe(1);
	});

	it('shows a tie as one feed entry', () => {
		const cats = [{ id: 'b', name: 'Best B', candidates: [{ text: 'One', key: 'b__1' }, { text: 'Two', key: 'b__2' }] }];
		const ballots = { u1: { votes: ['b__1'] }, u2: { votes: ['b__2'] }, u3: { votes: ['b__3'] } };
		const feed = resultsFeed(cats, ballots, results);
		expect(feed).toHaveLength(2);
		expect(feed[0]).toMatchObject({ key: 'b', keys: ['b__1', 'b__2'], tie: true, winner: 'One & Two', correct: 2, total: 3 });
	});

	it('toggles a winner without touching the rest of the category', () => {
		expect(toggleKey(['a__1', 'b__1'], 'b__2')).toEqual(['a__1', 'b__1', 'b__2']);
		expect(toggleKey(['a__1', 'b__1', 'b__2'], 'b__1')).toEqual(['a__1', 'b__2']);
	});
});
