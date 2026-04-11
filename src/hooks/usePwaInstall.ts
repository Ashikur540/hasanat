import { useCallback, useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
}

interface NavigatorWithStandalone extends Navigator {
	standalone?: boolean;
}

const IOS_SAFARI_REGEX = /^((?!chrome|android).)*safari/i;

export const usePwaInstall = () => {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [isInstalled, setIsInstalled] = useState(() => {
		if (typeof window === "undefined") {
			return false;
		}

		const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
		const isIosStandalone = Boolean(
			(window.navigator as NavigatorWithStandalone).standalone,
		);
		return isStandalone || isIosStandalone;
	});

	const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
	const isIosDevice = /iPad|iPhone|iPod/.test(userAgent);
	const isIosSafari = isIosDevice && IOS_SAFARI_REGEX.test(userAgent);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const onBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			setDeferredPrompt(event as BeforeInstallPromptEvent);
		};

		const onAppInstalled = () => {
			setDeferredPrompt(null);
			setIsInstalled(true);
		};

		window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
		window.addEventListener("appinstalled", onAppInstalled);

		return () => {
			window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
			window.removeEventListener("appinstalled", onAppInstalled);
		};
	}, []);

	const canPromptInstall = useMemo(
		() => !isInstalled && deferredPrompt !== null,
		[deferredPrompt, isInstalled],
	);

	const install = useCallback(async () => {
		if (!deferredPrompt) {
			return "unavailable" as const;
		}

		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		setDeferredPrompt(null);

		if (outcome === "accepted") {
			setIsInstalled(true);
			return "accepted" as const;
		}

		return "dismissed" as const;
	}, [deferredPrompt]);

	return {
		isInstalled,
		isIosSafari,
		canPromptInstall,
		install,
	};
};
