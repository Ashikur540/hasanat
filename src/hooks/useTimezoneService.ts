import { useState, useEffect } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";

export interface TimezoneServiceReturn {
	timezone: string;
	isAutoDetected: boolean;
	setTimezone: (tz: string) => void;
}

export const COMMON_TIMEZONES = [
	{ label: "UTC (Coordinated Universal Time)", value: "UTC" },
	{ label: "GMT (Greenwich Mean Time)", value: "GMT" },
	{ label: "Asia/Dhaka (Bangladesh)", value: "Asia/Dhaka" },
	{ label: "Asia/Kolkata (India)", value: "Asia/Kolkata" },
	{ label: "Asia/Dubai (UAE)", value: "Asia/Dubai" },
	{ label: "Asia/Istanbul (Turkey)", value: "Asia/Istanbul" },
	{ label: "Asia/Jakarta (Indonesia)", value: "Asia/Jakarta" },
	{ label: "Asia/Bangkok (Thailand)", value: "Asia/Bangkok" },
	{ label: "Asia/Singapore", value: "Asia/Singapore" },
	{ label: "Asia/Tokyo (Japan)", value: "Asia/Tokyo" },
	{ label: "Asia/Hong_Kong", value: "Asia/Hong_Kong" },
	{ label: "Australia/Sydney", value: "Australia/Sydney" },
	{ label: "Europe/London (UK)", value: "Europe/London" },
	{ label: "Europe/Paris (France)", value: "Europe/Paris" },
	{ label: "Europe/Berlin (Germany)", value: "Europe/Berlin" },
	{ label: "Europe/Madrid (Spain)", value: "Europe/Madrid" },
	{ label: "Europe/Moscow (Russia)", value: "Europe/Moscow" },
	{ label: "Africa/Cairo (Egypt)", value: "Africa/Cairo" },
	{ label: "Africa/Johannesburg (South Africa)", value: "Africa/Johannesburg" },
	{ label: "America/New_York (EST)", value: "America/New_York" },
	{ label: "America/Chicago (CST)", value: "America/Chicago" },
	{ label: "America/Denver (MST)", value: "America/Denver" },
	{ label: "America/Los_Angeles (PST)", value: "America/Los_Angeles" },
	{ label: "America/Toronto (Canada)", value: "America/Toronto" },
	{ label: "America/Mexico_City", value: "America/Mexico_City" },
	{ label: "America/Sao_Paulo (Brazil)", value: "America/Sao_Paulo" },
	{ label: "America/Buenos_Aires (Argentina)", value: "America/Buenos_Aires" },
	{ label: "Pacific/Auckland (New Zealand)", value: "Pacific/Auckland" },
];

const STORAGE_KEY = "hasanat-timezone";

function autoDetectTimezone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch {
		return "UTC";
	}
}

function syncTimezoneToFirestore(uid: string, tz: string) {
	setDoc(
		doc(db, "users", uid),
		{ timezone: tz, timezoneUpdatedAt: serverTimestamp() },
		{ merge: true },
	).catch((error: unknown) => {
		console.warn("Failed to sync timezone to Firestore:", error);
	});
}

export function useTimezoneService(): TimezoneServiceReturn {
	const { user } = useAuth();
	const [timezone, setTimezoneState] = useState<string>(() => {
		// First paint: read cache to avoid UTC flash. Firestore overrides shortly.
		return localStorage.getItem(STORAGE_KEY) ?? autoDetectTimezone();
	});
	const [isAutoDetected, setIsAutoDetected] = useState<boolean>(() => {
		return !localStorage.getItem(STORAGE_KEY);
	});

	// On auth resolve, hydrate from Firestore (source of truth).
	useEffect(() => {
		if (!user?.uid) return;
		let cancelled = false;
		void (async () => {
			try {
				const snap = await getDoc(doc(db, "users", user.uid));
				if (cancelled || !snap.exists()) return;
				const remote = (snap.data() as { timezone?: string }).timezone;
				if (typeof remote === "string" && remote.length > 0) {
					setTimezoneState((prev) => {
						if (prev === remote) return prev;
						localStorage.setItem(STORAGE_KEY, remote);
						return remote;
					});
					setIsAutoDetected(false);
				} else {
					// No remote value — backfill from local detection
					const fallback = autoDetectTimezone();
					syncTimezoneToFirestore(user.uid, fallback);
				}
			} catch (err) {
				console.warn("Failed to read timezone from Firestore:", err);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [user?.uid]);

	const setTimezone = (tz: string) => {
		setTimezoneState(tz);
		setIsAutoDetected(false);
		localStorage.setItem(STORAGE_KEY, tz);
		if (user?.uid) syncTimezoneToFirestore(user.uid, tz);
	};

	return {
		timezone,
		isAutoDetected,
		setTimezone,
	};
}
