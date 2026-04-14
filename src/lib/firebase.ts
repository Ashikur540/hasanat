import { initializeApp } from "firebase/app";
import {
	browserLocalPersistence,
	getAuth,
	GoogleAuthProvider,
	setPersistence,
} from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch((error: unknown) => {
	console.error("Failed to configure auth persistence:", error);
});

// Firestore — lazily initialized so the Firestore SDK is NOT bundled into the
// initial JS for unauthenticated users (landing page, auth page).
// Authenticated service files (todoService, streakService, etc.) all run after
// onAuthStateChanged confirms a user, by which point getDb() has already been
// called and _db is populated.
let _db: Firestore | null = null;

export const getDb = async (): Promise<Firestore> => {
	if (!_db) {
		const { getFirestore } = await import("firebase/firestore");
		_db = getFirestore(app);
	}
	return _db;
};

// Synchronous accessor — only valid after getDb() has been awaited at least once.
// Service files can use this safely since they only run for authenticated users,
// after AuthContext has already called getDb() via onAuthStateChanged.
export const db = new Proxy({} as Firestore, {
	get(_target, prop: string | symbol) {
		if (!_db) {
			throw new Error(
				`[firebase] db.${String(prop)} called before Firestore was initialized. Ensure getDb() is awaited first (AuthContext does this on sign-in).`
			);
		}
		return (_db as unknown as Record<string | symbol, unknown>)[prop];
	},
});

// Analytics only runs in browser environments
isSupported().then((supported) => {
	if (supported) getAnalytics(app);
});
