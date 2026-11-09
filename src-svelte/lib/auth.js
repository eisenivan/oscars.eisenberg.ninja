import { writable } from 'svelte/store';
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	updateProfile,
	sendPasswordResetEmail,
	verifyBeforeUpdateEmail,
	signOut as fbSignOut
} from 'firebase/auth';
import { auth } from './firebase.js';
import { DEMO } from './data/demo-flag.js';

export const user = writable(null);

let resolveReady;
/** Resolves once Firebase has restored (or not) the session. */
export const authReady = new Promise((r) => (resolveReady = r));

if (typeof window !== 'undefined') {
	if (import.meta.env.DEV && DEMO) {
		import('./data/demo.js').then(({ demoUser }) => {
			user.set(DEMO === 'anon' ? null : { ...demoUser });
			resolveReady();
		});
	} else {
		onAuthStateChanged(auth, (u) => {
			user.set(u);
			resolveReady();
		});
	}
}

export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

export async function signUp(email, password, displayName) {
	const result = await createUserWithEmailAndPassword(auth, email, password);
	await updateProfile(result.user, { displayName });
	user.set(auth.currentUser);
	return result;
}

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export async function signOut() {
	if (DEMO) return user.set(null);
	await fbSignOut(auth);
}

export async function updateDisplayName(displayName) {
	if (DEMO) return user.update((u) => ({ ...u, displayName }));
	await updateProfile(auth.currentUser, { displayName });
	// Firebase mutates the same object; re-set so subscribers update.
	user.set(Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser));
}

/** Sends a verification link; the email changes once the user clicks it. */
export const changeEmail = (email) => (DEMO ? Promise.resolve() : verifyBeforeUpdateEmail(auth.currentUser, email));

/** Human-readable Firebase auth errors. */
export function authMessage(err) {
	const code = err?.code || '';
	const map = {
		'auth/invalid-email': 'That email address doesn’t look right.',
		'auth/user-not-found': 'No account with that email.',
		'auth/wrong-password': 'Wrong email or password.',
		'auth/invalid-credential': 'Wrong email or password.',
		'auth/invalid-login-credentials': 'Wrong email or password.',
		'auth/email-already-in-use': 'An account with that email already exists.',
		'auth/weak-password': 'Use at least 6 characters.',
		'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
		'auth/requires-recent-login': 'Please log out and back in, then try again.',
		'auth/network-request-failed': 'Network error. Check your connection.'
	};
	return map[code] || err?.message || 'Something went wrong.';
}
