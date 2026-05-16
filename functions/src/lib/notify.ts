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

	const targets = devicesSnap.docs
		.map((d) => ({ id: d.id, token: d.get("token") as string | undefined }))
		.filter((t): t is { id: string; token: string } => Boolean(t.token));

	if (targets.length === 0) return { sent: 0, pruned: 0, failed: 0 };

	let sent = 0;
	let pruned = 0;
	let failed = 0;

	await Promise.all(
		targets.map(async ({ id, token }) => {
			try {
				await messaging.send({
					token,
					notification,
					data,
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
