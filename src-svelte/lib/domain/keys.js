/**
 * Ballot keys are stored as "<categoryId>__<nomineeKey>". The nominee key
 * format must stay byte-for-byte compatible with existing data.
 */
export function keyFromName(name) {
	return name.toLowerCase().replace(/\s/g, '');
}

export function candidateKey(categoryId, candidate) {
	return `${categoryId}__${keyFromName(candidate.text)}`;
}

/** Category id of a key. Exact match only - never substring search. */
export function categoryOf(key) {
	return typeof key === 'string' ? key.split('__')[0] : null;
}

/** Array of keys -> { [categoryId]: key }. Ignores null holes. */
export function byCategory(keys = []) {
	const map = {};
	for (const key of keys || []) {
		const cat = categoryOf(key);
		if (cat) map[cat] = key;
	}
	return map;
}

/** Replace (or add) the pick for the key's category. Returns a new array. */
export function upsertKey(keys = [], key) {
	const cat = categoryOf(key);
	const next = (keys || []).filter((k) => k && categoryOf(k) !== cat);
	next.push(key);
	return next;
}

/** Remove any key for a category. Returns a new array. */
export function removeCategory(keys = [], categoryId) {
	return (keys || []).filter((k) => k && categoryOf(k) !== categoryId);
}

/** "Best Supporting Actress" -> "Supporting Actress" for compact chips. */
export function shortName(name = '') {
	return name.replace(/^best\s+/i, '');
}

/** Categories with precomputed candidate keys, so templates don't recompute. */
export function withKeys(categories = []) {
	return (categories || []).filter(Boolean).map((cat) => ({
		...cat,
		short: shortName(cat.name),
		candidates: (cat.candidates || []).map((c) => ({ ...c, key: candidateKey(cat.id, c) }))
	}));
}
