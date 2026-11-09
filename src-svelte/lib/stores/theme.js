import { writable } from 'svelte/store';

/** 'system' | 'light' | 'dark'. app.html applies the initial class pre-paint. */
const KEY = 'theme';
const browser = typeof window !== 'undefined';

function read() {
	try {
		return (browser && localStorage.getItem(KEY)) || 'system';
	} catch {
		return 'system';
	}
}

const media = browser ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function apply(mode) {
	if (!browser) return;
	const dark = mode === 'dark' || (mode === 'system' && media.matches);
	document.documentElement.classList.toggle('dark', dark);
	document
		.querySelectorAll('meta[name="theme-color"]')
		.forEach((m) => m.setAttribute('content', dark ? '#0E0D0B' : '#FAF7F0'));
	isDark.set(dark);
}

export const isDark = writable(false);
export const themeMode = writable(read());

if (browser) {
	themeMode.subscribe((mode) => {
		try {
			localStorage.setItem(KEY, mode);
		} catch {}
		apply(mode);
	});
	media.addEventListener('change', () => {
		let mode;
		themeMode.subscribe((m) => (mode = m))();
		if (mode === 'system') apply(mode);
	});
}
