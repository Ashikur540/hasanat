import { registerSW } from "virtual:pwa-register";

export const registerPwaServiceWorker = () => {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return;
	}

	registerSW({
		immediate: true,
		onRegisteredSW(swUrl) {
			if (import.meta.env.DEV) {
				console.info("[PWA] Service worker registered:", swUrl);
			}
		},
		onRegisterError(error) {
			console.error("[PWA] Service worker registration failed:", error);
		},
	});
};
