export type DevicePlatform =
	| "macos"
	| "windows"
	| "linux"
	| "android"
	| "ios"
	| "unknown";

export function isMacOS(): boolean {
	if (typeof navigator === "undefined") return false;
	return (
		/Mac/i.test(navigator.platform || "") ||
		/Mac OS X/i.test(navigator.userAgent)
	);
}

export function isSafari(): boolean {
	if (typeof navigator === "undefined") return false;
	const ua = navigator.userAgent;
	return /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua);
}

export function isStandalonePwa(): boolean {
	if (typeof window === "undefined") return false;
	return (
		window.matchMedia?.("(display-mode: standalone)").matches ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

export function detectDevicePlatform(): DevicePlatform {
	if (typeof navigator === "undefined") return "unknown";
	const ua = navigator.userAgent || "";
	const platform = navigator.platform || "";

	if (/Android/i.test(ua)) return "android";
	if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
	// iPadOS 13+ reports MacIntel — distinguish via touch
	if (
		/Mac/i.test(platform) &&
		"maxTouchPoints" in navigator &&
		(navigator as Navigator).maxTouchPoints > 1
	) {
		return "ios";
	}
	if (/Mac/i.test(platform) || /Mac OS X/i.test(ua)) return "macos";
	if (/Win/i.test(platform) || /Windows/i.test(ua)) return "windows";
	if (/Linux/i.test(platform) || /Linux/i.test(ua)) return "linux";
	return "unknown";
}
