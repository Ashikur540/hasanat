import { registerSW } from "virtual:pwa-register";

export const registerPwaServiceWorker = () => {
	if (!import.meta.env.PROD) {
		return;
	}

	registerSW({ immediate: true });
};
