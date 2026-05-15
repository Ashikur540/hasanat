import { getToken, onMessage } from "firebase/messaging";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, FCM_VAPID_KEY, getFirebaseMessaging } from "@/lib/firebase";
import { detectDevicePlatform } from "@/lib/notifications/platform";

const DEVICE_ID_KEY = "hasanat-fcm-device-id";

const getOrCreateDeviceId = (): string => {
	let id = localStorage.getItem(DEVICE_ID_KEY);
	if (!id) {
		id =
			typeof crypto !== "undefined" && "randomUUID" in crypto
				? crypto.randomUUID()
				: `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		localStorage.setItem(DEVICE_ID_KEY, id);
	}
	return id;
};

export async function registerFcmToken(uid: string): Promise<string | null> {
	if (!FCM_VAPID_KEY) {
		console.warn(
			"[FCM] VITE_FIREBASE_VAPID_KEY missing — push disabled. Generate in Firebase Console → Cloud Messaging → Web Push certificates.",
		);
		return null;
	}
	const messaging = await getFirebaseMessaging();
	if (!messaging) return null;

	try {
		const token = await getToken(messaging, { vapidKey: FCM_VAPID_KEY });
		if (!token) return null;

		const deviceId = getOrCreateDeviceId();
		await setDoc(
			doc(db, "users", uid, "devices", deviceId),
			{
				token,
				platform: detectDevicePlatform(),
				userAgent: navigator.userAgent,
				updatedAt: serverTimestamp(),
			},
			{ merge: true },
		);
		return token;
	} catch (error) {
		console.warn("[FCM] token registration failed:", error);
		return null;
	}
}

export async function setupForegroundMessageListener(
	onPush: (payload: { title?: string; body?: string }) => void,
): Promise<void> {
	const messaging = await getFirebaseMessaging();
	if (!messaging) return;
	onMessage(messaging, (payload) => {
		onPush({
			title: payload.notification?.title,
			body: payload.notification?.body,
		});
	});
}
