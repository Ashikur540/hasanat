import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MIGRATION_MARKER_KEY = "hasanat-migration-v1";
const LANG_KEY = "hasanat-lang";
const TIMEZONE_KEY = "hasanat-timezone";
const LOCATION_KEY = "hasanat-location";

interface RemoteUser {
	timezone?: string;
	location?: { lat?: number; lng?: number };
	settings?: { language?: string; timeZone?: string };
}

/**
 * One-shot localStorage → Firestore migration for user preferences.
 * Runs on first sign-in per device. Idempotent via `hasanat-migration-v1` marker.
 * Only writes fields that are missing on remote — never overwrites server values.
 */
export async function runPreferencesMigration(uid: string): Promise<void> {
	if (localStorage.getItem(MIGRATION_MARKER_KEY) === "done") return;

	const lang = localStorage.getItem(LANG_KEY);
	const tz = localStorage.getItem(TIMEZONE_KEY);
	const locationRaw = localStorage.getItem(LOCATION_KEY);
	let parsedLocation: {
		lat: number;
		lng: number;
		source?: string;
		city?: string;
		country?: string;
		locationLabel?: string;
	} | null = null;

	if (locationRaw) {
		try {
			const parsed = JSON.parse(locationRaw);
			if (
				typeof parsed?.lat === "number" &&
				typeof parsed?.lng === "number"
			) {
				parsedLocation = parsed;
			}
		} catch {
			// corrupt cache — skip location
		}
	}

	// Skip short-circuit even when local cache is empty: we still need to check
	// remote for legacy `settings.timeZone` that requires backfill to top-level.

	try {
		const userRef = doc(db, "users", uid);
		const snap = await getDoc(userRef);
		const remote = (snap.exists() ? snap.data() : {}) as RemoteUser;

		const payload: Record<string, unknown> = {};

		if ((lang === "bn" || lang === "en") && !remote.settings?.language) {
			payload.settings = { language: lang };
			payload.settingsUpdatedAt = serverTimestamp();
		}
		// Top-level `timezone` is the single source of truth (Cloud Functions read it).
		// Backfill priority: local cache → deprecated remote settings.timeZone.
		if (!remote.timezone) {
			const backfillTz = tz ?? remote.settings?.timeZone ?? null;
			if (backfillTz) {
				payload.timezone = backfillTz;
				payload.timezoneUpdatedAt = serverTimestamp();
			}
		}
		if (
			parsedLocation &&
			(typeof remote.location?.lat !== "number" ||
				typeof remote.location?.lng !== "number")
		) {
			const loc: Record<string, unknown> = {
				lat: parsedLocation.lat,
				lng: parsedLocation.lng,
				source: parsedLocation.source ?? "manual",
				updatedAt: serverTimestamp(),
			};
			if (parsedLocation.city) loc.city = parsedLocation.city;
			if (parsedLocation.country) loc.country = parsedLocation.country;
			if (parsedLocation.locationLabel) {
				loc.locationLabel = parsedLocation.locationLabel;
			}
			payload.location = loc;
		}

		if (Object.keys(payload).length > 0) {
			await setDoc(userRef, payload, { merge: true });
		}

		localStorage.setItem(MIGRATION_MARKER_KEY, "done");
	} catch (err) {
		console.warn("Preferences migration failed:", err);
		// Do not set marker — retry on next sign-in.
	}
}
