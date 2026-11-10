import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseSeason, validateYear, diffKeys, slugify } from './season.js';

const good = {
	year: 2027,
	categories: [
		{ id: 'best-picture', name: 'Best Picture', candidates: [{ text: 'Film A', subtext: 'Producers' }, { text: 'Film B' }] },
		{ name: 'Best Sound', candidates: ['Film A', 'Film C'] }
	]
};

describe('season import', () => {
	it('accepts the wrapped shape and normalizes nominees', () => {
		const r = parseSeason(JSON.stringify(good));
		expect(r.errors).toEqual([]);
		expect(r.year).toBe(2027);
		expect(r.nominees).toBe(4);
		expect(r.categories[0].candidates).toEqual([{ text: 'Film A', subtext: 'Producers' }, { text: 'Film B' }]);
		// id generated from name, with a warning
		expect(r.categories[1]).toEqual({ id: 'best-sound', name: 'Best Sound', candidates: [{ text: 'Film A' }, { text: 'Film C' }] });
		expect(r.warnings).toHaveLength(1);
	});

	it('accepts a bare array (the shape stored in the database)', () => {
		const r = parseSeason(good.categories);
		expect(r.errors).toEqual([]);
		expect(r.year).toBeNull();
	});

	it('rejects invalid JSON, duplicate ids, bad ids and clashing nominee keys', () => {
		expect(parseSeason('{nope').errors[0]).toMatch(/valid JSON/);
		const r = parseSeason([
			{ id: 'best_actor', name: 'A', candidates: [{ text: 'X' }, { text: 'Y' }] },
			{ id: 'x', name: 'B', candidates: [{ text: 'Same Name' }, { text: 'samename' }] },
			{ id: 'x', name: 'C', candidates: [{ text: 'Only one' }] }
		]);
		expect(r.errors.join('\n')).toMatch(/best_actor/);
		expect(r.errors.join('\n')).toMatch(/clashes/);
		expect(r.errors.join('\n')).toMatch(/used by another/);
		expect(r.errors.join('\n')).toMatch(/at least 2/);
	});

	it('refuses the untouched template', () => {
		const tpl = readFileSync(new URL('../../../static/templates/season-template.json', import.meta.url), 'utf8');
		const r = parseSeason(tpl);
		expect(r.categories).toHaveLength(24);
		expect(r.errors.length).toBeGreaterThan(0);
		expect(r.errors[0]).toMatch(/TODO/);
	});

	it('validates years', () => {
		expect(validateYear('2027')).toBe('');
		expect(validateYear('27')).not.toBe('');
		expect(validateYear(1800)).not.toBe('');
	});

	it('slugifies names', () => {
		expect(slugify('Best Makeup & Hairstyling')).toBe('best-makeup-hairstyling');
		expect(slugify('Mejor Película')).toBe('mejor-pelicula');
	});

	it('reports keys that a replacement would drop', () => {
		const prev = [{ id: 'a', name: 'A', candidates: [{ text: 'One' }, { text: 'Two' }] }];
		const next = [{ id: 'a', name: 'A', candidates: [{ text: 'One' }, { text: 'Too' }] }];
		const d = diffKeys(prev, next);
		expect(d.removed.map((x) => x.key)).toEqual(['a__two']);
		expect(d.added.map((x) => x.key)).toEqual(['a__too']);
	});
});
