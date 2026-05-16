import { useState, useEffect } from "react";
import { deleteField, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import { LOCATION_CACHE_KEY, LocationData } from "@/hooks/useLocationService";

const COORD_THRESHOLD = 0.01; // ~1km — reuse cached label if coords haven't moved more than this

interface GeocodeAddress {
	city?: string;
	town?: string;
	village?: string;
	county?: string;
	state_district?: string;
	country?: string;
	postcode?: string;
}

function buildLabel(address: GeocodeAddress): string {
	const city =
		address.city ||
		address.town ||
		address.village ||
		address.county ||
		address.state_district ||
		"";
	const postcode = address.postcode || "";
	if (city && postcode) return `${city} ${postcode}`;
	if (city) return city;
	return "";
}

function persistGeocodeToFirestore(
	uid: string,
	lat: number,
	lng: number,
	city: string,
	country: string,
	locationLabel: string,
) {
	// Explicitly delete absent fields so stale values from prior coords don't
	// linger in Firestore (setDoc merge:true only updates, never clears).
	const payload: Record<string, unknown> = {
		lat,
		lng,
		updatedAt: serverTimestamp(),
		city: city || deleteField(),
		country: country || deleteField(),
		locationLabel: locationLabel || deleteField(),
	};

	setDoc(doc(db, "users", uid), { location: payload }, { merge: true }).catch(
		(err: unknown) => {
			console.warn("Failed to sync reverse-geocode to Firestore:", err);
		},
	);
}

export function useReverseGeocode(
	lat: number | null,
	lng: number | null,
	language: string,
) {
	const { user } = useAuth();
	const [locationLabel, setLocationLabel] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (lat === null || lng === null) return;

		// Check existing hasanat-location cache for a stored label (offline fast-path)
		const raw = localStorage.getItem(LOCATION_CACHE_KEY);
		if (raw) {
			try {
				const entry: LocationData = JSON.parse(raw);
				if (
					entry.locationLabel &&
					Math.abs(entry.lat - lat) < COORD_THRESHOLD &&
					Math.abs(entry.lng - lng) < COORD_THRESHOLD
				) {
					setLocationLabel(entry.locationLabel);
					return;
				}
			} catch {
				// corrupt cache — fall through to fetch
			}
		}

		const acceptLang = language === "bn" ? "bn,en" : "en";

		setLoading(true);
		fetch(
			`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
			{
				headers: {
					"Accept-Language": acceptLang,
					"User-Agent": "AmalTrack/1.0 (contact@amaltrack.app)",
				},
			},
		)
			.then((res) => res.json())
			.then((data) => {
				const address: GeocodeAddress = data.address ?? {};
				const label = buildLabel(address);
				if (!label) return;

				setLocationLabel(label);
				const city =
					address.city ||
					address.town ||
					address.village ||
					address.county ||
					"";
				const country = address.country || "";

				// Overwrite label fields on cache. Never fall back to entry.city —
				// those values belong to OLD coords and are stale by definition.
				const existing = localStorage.getItem(LOCATION_CACHE_KEY);
				if (existing) {
					try {
						const entry: LocationData = JSON.parse(existing);
						localStorage.setItem(
							LOCATION_CACHE_KEY,
							JSON.stringify({
								lat: entry.lat,
								lng: entry.lng,
								source: entry.source,
								timestamp: entry.timestamp,
								manual: entry.manual,
								city: city || undefined,
								country: country || undefined,
								locationLabel: label,
							}),
						);
					} catch {
						// ignore — label will be re-fetched next time
					}
				}

				// Persist to Firestore so other devices show same city/country.
				if (user?.uid) {
					persistGeocodeToFirestore(
						user.uid,
						lat,
						lng,
						city,
						country,
						label,
					);
				}
			})
			.catch(() => {
				// silently fall back — widget shows coordinates instead
			})
			.finally(() => setLoading(false));
	}, [lat, lng, language, user?.uid]);

	return { locationLabel, loading };
}
