import { writable } from 'svelte/store';

function createThemeStore() {
	// Check if we're in browser
	const isBrowser = typeof window !== 'undefined';
	
	// Check localStorage first, then system preference
	let initialDark = false;
	if (isBrowser) {
		const stored = localStorage.getItem('theme');
		if (stored) {
			initialDark = stored === 'dark';
		} else {
			// Check system preference
			initialDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
	}

	const { subscribe, set } = writable(initialDark);

	// Apply initial theme
	function applyTheme(isDark) {
		if (isBrowser) {
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
			const html = document.documentElement;
			if (isDark) {
				html.classList.add('dark');
			} else {
				html.classList.remove('dark');
			}
		}
	}

	// Apply initial theme
	applyTheme(initialDark);

	return {
		subscribe,
		toggle: () => {
			let newValue;
			subscribe((current) => {
				newValue = !current;
			})();
			applyTheme(newValue);
			set(newValue);
		},
		setDark: (isDark) => {
			applyTheme(isDark);
			set(isDark);
		}
	};
}

export const theme = createThemeStore();
