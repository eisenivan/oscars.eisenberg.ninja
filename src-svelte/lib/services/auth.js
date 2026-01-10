import { writable } from 'svelte/store';
import {
	initializeApp,
	getApps,
	getApp
} from 'firebase/app';
import {
	getAuth,
	onAuthStateChanged
} from 'firebase/auth';
import {
	getDatabase
} from 'firebase/database';

const firebaseConfig = {
	apiKey: 'AIzaSyCTs_zk_v9jtFhVXCjUAYJBKfWjf5LMOZU',
	authDomain: 'eisenberg-oscars.firebaseapp.com',
	projectId: 'eisenberg-oscars',
	storageBucket: 'eisenberg-oscars.appspot.com',
	messagingSenderId: '438075122494',
	appId: '1:438075122494:web:ffe656c3d5cf001095c26f'
};

// Initialize Firebase
let app;
if (!getApps().length) {
	app = initializeApp(firebaseConfig);
} else {
	app = getApp();
}

export const auth = getAuth(app);
export const db = getDatabase(app);

// Auth store
export const user = writable(null);
export const initializing = writable(true);

// Initialize auth listener
onAuthStateChanged(auth, (authUser) => {
	user.set(authUser);
	initializing.set(false);
});

export const signOut = async () => {
	await auth.signOut();
};

export const signInWithEmail = async (email, password) => {
	const { signInWithEmailAndPassword } = await import('firebase/auth');
	return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email, password, displayName) => {
	const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
	const result = await createUserWithEmailAndPassword(auth, email, password);
	await updateProfile(result.user, { displayName });
	return result;
};

export const sendPasswordResetEmail = async (email) => {
	const { sendPasswordResetEmail: resetEmail } = await import('firebase/auth');
	return resetEmail(auth, email);
};
