import { derived } from 'svelte/store';
import { live, write, read } from './db.js';
import { withKeys, upsertKey } from '$lib/domain/keys.js';

export const YEAR = 2026;

/** All year settings (publicly readable, small). One shared listener. */
export const allSettings = live('settings');

export const years = derived(allSettings, ($s) =>
	Object.keys($s.value || {})
		.map(Number)
		.filter(Boolean)
		.sort((a, b) => b - a)
);

export function settingsFor(year) {
	return derived(allSettings, ($s) => {
		const s = $s.value?.[year] || {};
		return {
			loading: $s.loading,
			exists: !!$s.value?.[year],
			locked: !!s.locked,
			results: (s.results || []).filter(Boolean)
		};
	});
}

const categoriesCache = new Map();
/** Categories with precomputed keys. Groups are immutable after nominations. */
export function categoriesFor(year) {
	if (!categoriesCache.has(year)) {
		categoriesCache.set(
			year,
			derived(live(`groups/${year}`), ($g) => ({
				loading: $g.loading,
				error: $g.error,
				value: withKeys(Array.isArray($g.value) ? $g.value : Object.values($g.value || {}))
			}))
		);
	}
	return categoriesCache.get(year);
}

export const ballotFor = (year, uid) => live(`ballots/${year}/${uid}`);
export const ballotsFor = (year) => live(`ballots/${year}`);

/**
 * Save a pick. Reads the latest ballot first so rapid taps in different
 * categories never overwrite each other (RTDB applies local writes to the
 * cache immediately, so this sees in-flight picks too).
 */
export async function saveVote(year, user, key) {
	const existing = (await read(`ballots/${year}/${user.uid}`)) || {};
	const votes = upsertKey(existing.votes || [], key);
	await write(`ballots/${year}/${user.uid}`, { displayName: user.displayName || 'Anonymous', votes });
}

export async function saveResults(year, results) {
	await write(`settings/${year}/results`, results.filter(Boolean));
}

export async function saveLocked(year, locked) {
	await write(`settings/${year}/locked`, !!locked);
}

export async function isAdmin(uid) {
	try {
		return !!(await read(`admins/${uid}`));
	} catch {
		return false;
	}
}

/** Keep the current year's ballot name in sync after a profile rename. */
export async function syncBallotName(year, user, displayName) {
	const existing = await read(`ballots/${year}/${user.uid}`);
	if (existing) await write(`ballots/${year}/${user.uid}/displayName`, displayName);
}
