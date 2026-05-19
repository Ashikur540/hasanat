import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

if (!admin.apps.length) admin.initializeApp();

export interface NotificationPayload {
	title: string;
	body: string;
}

export interface DispatchResult {
	sent: number;
	pruned: number;
	failed: number;
}

const STALE_TOKEN_CODES = new Set([
	"messaging/registration-token-not-registered",
	"messaging/invalid-argument",
	"messaging/invalid-registration-token",
]);

/**
 * Send FCM message to every device registered for the user.
 * Stale tokens are pruned from `users/{uid}/devices/{deviceId}`.
 */
export async function dispatchToUserDevices(
	uid: string,
	notification: NotificationPayload,
	data: Record<string, string> = {},
): Promise<DispatchResult> {
	const firestore = admin.firestore();
	const messaging = admin.messaging();

	const devicesSnap = await firestore
		.collection("users")
		.doc(uid)
		.collection("devices")
		.get();

	let pruned = 0;

	/**
	 * Devices not refreshed in 30+ days are almost certainly stale (data cleared,
	 * uninstalled PWA, browser switched). Admin SDK can return "success" for
	 * these tokens, so age-based pruning is needed beyond error-code pruning.
	 */
	const STALE_MS = 30 * 24 * 60 * 60 * 1000;
	const nowMs = Date.now();
	type Target = { id: string; token: string };
	const targets: Target[] = [];
	for (const d of devicesSnap.docs) {
		const token = d.get("token") as string | undefined;
		const updatedAt = d.get("updatedAt") as
			| admin.firestore.Timestamp
			| undefined;
		if (!token) continue;
		if (updatedAt && nowMs - updatedAt.toMillis() > STALE_MS) {
			await d.ref.delete();
			pruned++;
			logger.info("device pruned (stale)", { uid, deviceId: d.id });
			continue;
		}
		targets.push({ id: d.id, token });
	}

	if (targets.length === 0) return { sent: 0, pruned, failed: 0 };

	let sent = 0;
	let failed = 0;

	await Promise.all(
		targets.map(async ({ id, token }) => {
			try {
				await messaging.send({
					token,
					notification,
					data,
					/**
					 * High urgency wakes browsers on locked Android / closed tabs.
					 * Default is "normal" — battery-savers may delay or drop those.
					 * TTL caps queue time so a late delivery doesn't surprise users.
					 */
					webpush: {
						headers: { Urgency: "high", TTL: "1800" },
						notification: {
							icon: "/web-app-manifest-192x192.png",
							badge: "/favicon-96x96.png",
							requireInteraction: false,
						},
					},
					android: {
						priority: "high",
						notification: {
							channelId: "hasanat-reminders",
							priority: "high",
						},
					},
				});
				sent++;
			} catch (err: unknown) {
				const code =
					(err as { errorInfo?: { code?: string }; code?: string })?.errorInfo
						?.code ??
					(err as { code?: string })?.code ??
					"unknown";
				if (STALE_TOKEN_CODES.has(code)) {
					await firestore
						.collection("users")
						.doc(uid)
						.collection("devices")
						.doc(id)
						.delete();
					pruned++;
					logger.info("fcm token pruned", { uid, deviceId: id, code });
				} else {
					failed++;
					logger.warn("fcm send failed", { uid, deviceId: id, code });
				}
			}
		}),
	);

	return { sent, pruned, failed };
}
