/**
 * Dev-only demo mode: `?demo` (or `?demo=open|live|final|anon`) serves fixture data
 * from memory with a fake signed-in user, so every screen can be reviewed
 * without a Firebase account. `import.meta.env.DEV` is false in production
 * builds, so this and the fixtures are tree-shaken away.
 */
function detect() {
	if (!import.meta.env.DEV || typeof window === 'undefined') return null;
	const param = new URLSearchParams(window.location.search).get('demo');
	if (param !== null) {
		const mode = param || 'live';
		if (mode === 'off') {
			sessionStorage.removeItem('demo');
			return null;
		}
		sessionStorage.setItem('demo', mode);
		return mode;
	}
	return sessionStorage.getItem('demo');
}

export const DEMO = detect();
