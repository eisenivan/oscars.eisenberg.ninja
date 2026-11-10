import { keyFromName, withKeys } from './keys.js';

/**
 * Validation for season files (the nominees for one ceremony year) imported
 * from the admin panel. Template: static/templates/season-template.json.
 *
 * Accepted shapes:
 *   [ { id?, name, candidates: [ { text, subtext? } ] }, ... ]
 *   { year?, categories: [ ...same... ] }
 */

export const MIN_YEAR = 1929;
export const MAX_YEAR = 2100;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PLACEHOLDER = /\b(todo|tbd)\b/i;

export function slugify(s = '') {
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

const str = (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : typeof v === 'number' ? String(v) : '');

/** '' when valid, otherwise a message. */
export function validateYear(value) {
	const s = String(value ?? '').trim();
	if (!/^\d{4}$/.test(s)) return 'Enter a four-digit year.';
	const y = Number(s);
	if (y < MIN_YEAR || y > MAX_YEAR) return `Pick a year between ${MIN_YEAR} and ${MAX_YEAR}.`;
	return '';
}

/**
 * Parse pasted text (or an already-parsed object) into clean categories.
 * Returns { year, categories, errors, warnings, nominees }. Only import
 * when errors is empty.
 */
export function parseSeason(input) {
	const result = { year: null, categories: [], errors: [], warnings: [], nominees: 0 };
	let data = input;
	if (typeof input === 'string') {
		try {
			data = JSON.parse(input);
		} catch (err) {
			result.errors.push(`This isn’t valid JSON: ${err.message}`);
			return result;
		}
	}

	const list = Array.isArray(data) ? data : Array.isArray(data?.categories) ? data.categories : null;
	if (!list) {
		result.errors.push('Expected a list of categories, or an object with a "categories" list.');
		return result;
	}
	if (!Array.isArray(data) && data.year != null) {
		if (validateYear(data.year)) result.errors.push(`"year": ${validateYear(data.year)}`);
		else result.year = Number(data.year);
	}
	if (!list.length) result.errors.push('There are no categories.');

	const ids = new Set();
	const placeholders = [];
	list.forEach((cat, i) => {
		const where = `Category ${i + 1}${cat?.name ? ` (${str(cat.name)})` : ''}`;
		if (!cat || typeof cat !== 'object' || Array.isArray(cat)) {
			result.errors.push(`${where}: should be an object with "name" and "candidates".`);
			return;
		}
		const name = str(cat.name);
		if (!name) result.errors.push(`${where}: "name" is missing.`);

		const id = str(cat.id) || slugify(name);
		if (!cat.id && id) result.warnings.push(`${where}: no "id", so it will be "${id}".`);
		if (id && !ID.test(id)) result.errors.push(`${where}: id "${id}" can only use lowercase letters, numbers and single dashes.`);
		if (id && ids.has(id)) result.errors.push(`${where}: id "${id}" is used by another category.`);
		ids.add(id);

		if (!Array.isArray(cat.candidates)) {
			result.errors.push(`${where}: "candidates" should be a list.`);
			return;
		}
		if (cat.candidates.length < 2) result.errors.push(`${where}: needs at least 2 nominees.`);

		const keys = new Map();
		const candidates = [];
		cat.candidates.forEach((c, j) => {
			const at = `${where}, nominee ${j + 1}`;
			const text = str(typeof c === 'string' ? c : c?.text);
			const subtext = typeof c === 'string' ? '' : str(c?.subtext);
			if (!text) return result.errors.push(`${at}: "text" is missing.`);
			if (PLACEHOLDER.test(text) || PLACEHOLDER.test(subtext)) placeholders.push(at);
			const key = keyFromName(text);
			if (keys.has(key)) {
				result.errors.push(`${at}: “${text}” clashes with nominee ${keys.get(key) + 1}. Two nominees can’t have the same name.`);
			}
			keys.set(key, j);
			// RTDB rejects undefined, so leave subtext out instead.
			candidates.push(subtext ? { text, subtext } : { text });
		});
		result.nominees += candidates.length;
		result.categories.push({ id, name, candidates });
	});

	if (placeholders.length) {
		const n = placeholders.length;
		result.errors.unshift(
			`${n} nominee${n === 1 ? '' : 's'} still ${n === 1 ? 'has' : 'have'} a TODO placeholder, starting with ${placeholders[0]}. Fill them in, or delete subtext you don’t need.`
		);
	}
	return result;
}

/**
 * Which ballot keys would stop existing if `next` replaced `prev`.
 * Picks for removed keys stop counting.
 */
export function diffKeys(prev = [], next = []) {
	const flat = (cats) =>
		new Map(withKeys(cats).flatMap((cat) => cat.candidates.map((c) => [c.key, { key: c.key, category: cat.name, text: c.text }])));
	const a = flat(prev);
	const b = flat(next);
	return {
		removed: [...a.values()].filter((x) => !b.has(x.key)),
		added: [...b.values()].filter((x) => !a.has(x.key))
	};
}
