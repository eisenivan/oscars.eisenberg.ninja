import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Public client config (not a secret - access is enforced by database.rules.json).
const firebaseConfig = {
	apiKey: 'AIzaSyCTs_zk_v9jtFhVXCjUAYJBKfWjf5LMOZU',
	authDomain: 'eisenberg-oscars.firebaseapp.com',
	projectId: 'eisenberg-oscars',
	storageBucket: 'eisenberg-oscars.appspot.com',
	messagingSenderId: '438075122494',
	appId: '1:438075122494:web:ffe656c3d5cf001095c26f'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
