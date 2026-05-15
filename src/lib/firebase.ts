import { initializeApp } from "firebase/app";
import {
	browserLocalPersistence,
	getAuth,
	GoogleAuthProvider,
	setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
	getMessaging,
	isSupported as isMessagingSupported,
	type Messaging,
} from "firebase/messaging";

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
export const db = getFirestore(app);

export const FCM_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as
	| string
	| undefined;

let messagingPromise: Promise<Messaging | null> | null = null;

export const getFirebaseMessaging = (): Promise<Messaging | null> => {
	if (messagingPromise) return messagingPromise;
	messagingPromise = isMessagingSupported()
		.then((supported) => (supported ? getMessaging(app) : null))
		.catch(() => null);
	return messagingPromise;
};

setPersistence(auth, browserLocalPersistence).catch((error: unknown) => {
	console.error("Failed to configure auth persistence:", error);
});

isSupported().then((supported) => {
	if (supported) getAnalytics(app);
});
