import { writable } from 'svelte/store';

/** Toast: { id, message, detail?, tone: 'default'|'success'|'danger'|'gold', action?: { label, run } } */
export const toasts = writable([]);
let id = 0;

export function toast(message, opts = {}) {
	const t = { id: ++id, message, tone: 'default', timeout: 4000, ...opts };
	toasts.update((list) => [...list.slice(-2), t]);
	if (t.timeout) setTimeout(() => dismiss(t.id), t.timeout);
	return t.id;
}

export function dismiss(tid) {
	toasts.update((list) => list.filter((t) => t.id !== tid));
}

export function haptic(ms = 10) {
	try {
		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate?.(ms);
	} catch {}
}
