import { readable, get as getStore } from 'svelte/store';
import { ref, onValue, get, set } from 'firebase/database';
import { db } from '$lib/firebase.js';
import { DEMO } from './demo-flag.js';

/* ------------------------------------------------------------------ *
 * Thin data layer. Every read/write in the app goes through here, so
 * subscriptions always clean themselves up and demo mode is one switch.
 * ------------------------------------------------------------------ */

const norm = (path) => path.replace(/^\/+|\/+$/g, '');

// ---- demo backend (dev only) ----
let demoTree = null;
const demoSubs = new Map();
async function demo() {
	if (import.meta.env.DEV && !demoTree) {
		const { buildTree } = await import('./demo.js');
		demoTree = demoTree || buildTree(DEMO);
	}
	return demoTree;
}
function demoRead(tree, path) {
	return norm(path)
		.split('/')
		.filter(Boolean)
		.reduce((node, part) => (node == null ? null : node[part] ?? null), tree);
}
function demoWrite(tree, path, value) {
	const parts = norm(path).split('/');
	const last = parts.pop();
	let node = tree;
	for (const p of parts) node = node[p] ??= {};
	node[last] = structuredClone(value);
	for (const [p, fns] of demoSubs) {
		if (p.startsWith(norm(path)) || norm(path).startsWith(p)) {
			const v = demoRead(tree, p);
			fns.forEach((fn) => fn(v));
		}
	}
}

/**
 * A readable store of { loading, value, error } for a database path.
 * The Firebase listener starts with the first subscriber and stops with
 * the last, and stores are shared per path.
 */
const cache = new Map();
export function live(path) {
	const key = norm(path);
	if (cache.has(key)) return cache.get(key);
	let last = { loading: true, value: null, error: null };
	const store = readable(last, (setState) => {
		if (last.loading === false) setState(last);
		const update = (v) => setState((last = v));
		if (import.meta.env.DEV && DEMO) {
			let fn;
			let cancelled = false;
			demo().then((tree) => {
				if (cancelled) return;
				fn = (value) => update({ loading: false, value, error: null });
				if (!demoSubs.has(key)) demoSubs.set(key, new Set());
				demoSubs.get(key).add(fn);
				fn(demoRead(tree, key));
			});
			return () => {
				cancelled = true;
				fn && demoSubs.get(key)?.delete(fn);
			};
		}
		return onValue(
			ref(db, key),
			(snap) => update({ loading: false, value: snap.val(), error: null }),
			(error) => update({ loading: false, value: last.value, error })
		);
	});
	cache.set(key, store);
	return store;
}

/** Current value of a path, from a live store if one is warm. */
export async function read(path) {
	if (import.meta.env.DEV && DEMO) return demoRead(await demo(), path);
	const snap = await get(ref(db, norm(path)));
	return snap.val();
}

export async function write(path, value) {
	if (import.meta.env.DEV && DEMO) {
		await new Promise((r) => setTimeout(r, 350)); // make saving states visible
		return demoWrite(await demo(), path, value);
	}
	return set(ref(db, norm(path)), value);
}

/** Wait for a live store's first value. */
export function ready(store) {
	return new Promise((resolve) => {
		let unsub = () => {};
		unsub = store.subscribe((s) => {
			if (!s.loading) {
				resolve(s);
				queueMicrotask(() => unsub());
			}
		});
	});
}

export function current(store) {
	return getStore(store).value;
}

/** Connection state: true, false, or null while unknown. */
export const connected = readable(null, (setState) => {
	if (import.meta.env.DEV && DEMO) {
		setState(true);
		return () => {};
	}
	return onValue(ref(db, '.info/connected'), (snap) => setState(!!snap.val()));
});
