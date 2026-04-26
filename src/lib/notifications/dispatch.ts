import { isMacOS, isSafari, isStandalonePwa } from "./platform";

export interface SystemNotificationPayload {
	title: string;
	body: string;
	tag: string;
}

export type DispatchFailureReason =
	| "permission"
	| "unsupported"
	| "no-sw"
	| "platform"
	| "error";

export type DispatchResult =
	| { ok: true; via: "sw" | "direct" }
	| { ok: false; reason: DispatchFailureReason; detail?: string };

let cachedRegistration: ServiceWorkerRegistration | null = null;

export async function getServiceWorkerRegistration(
	timeoutMs = 1500,
): Promise<ServiceWorkerRegistration | null> {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return null;
	}
	if (cachedRegistration) return cachedRegistration;

	try {
		const existing = await navigator.serviceWorker.getRegistration();
		if (existing?.active) {
			cachedRegistration = existing;
			return existing;
		}
		const registration = await Promise.race<ServiceWorkerRegistration | null>([
			navigator.serviceWorker.ready,
			new Promise<null>((resolve) =>
				window.setTimeout(() => resolve(null), timeoutMs),
			),
		]);
		if (registration) cachedRegistration = registration;
		return registration;
	} catch (error) {
		console.error("Failed to get service worker registration:", error);
		return null;
	}
}

export async function dispatchSystemNotification(
	payload: SystemNotificationPayload,
): Promise<DispatchResult> {
	if (typeof window === "undefined" || !("Notification" in window)) {
		return { ok: false, reason: "unsupported" };
	}
	// Read live permission, not stale React state. requestPermission resolves
	// before setPermissionStatus has flushed, so a closure capturing state
	// would reject a freshly-granted user.
	if (Notification.permission !== "granted") {
		return { ok: false, reason: "permission" };
	}

	const registration = await getServiceWorkerRegistration();
	if (registration?.showNotification) {
		try {
			await registration.showNotification(payload.title, {
				body: payload.body,
				tag: payload.tag,
				data: { url: "/dashboard" },
			});
			return { ok: true, via: "sw" };
		} catch (error) {
			console.error("Failed to show notification via Service Worker:", error);
		}
	}

	// Safari on macOS: bare tab cannot show Web Notifications without an
	// installed PWA. The constructor throws TypeError there.
	if (isSafari() && isMacOS() && !isStandalonePwa()) {
		return { ok: false, reason: "platform", detail: "safari-needs-pwa" };
	}

	try {
		const notification = new Notification(payload.title, {
			body: payload.body,
			tag: payload.tag,
		});
		window.setTimeout(() => notification.close(), 15000);
		return { ok: true, via: "direct" };
	} catch (error) {
		console.error("Failed to show notification via Notification API:", error);
		if (import.meta.env.DEV) {
			console.warn("[notifications] dispatch failed", {
				hasSW: Boolean(registration),
				ua: navigator.userAgent,
				standalone: isStandalonePwa(),
			});
		}
		return {
			ok: false,
			reason: "error",
			detail: error instanceof Error ? error.message : String(error),
		};
	}
}
