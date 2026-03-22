import { useState, useEffect } from "react";
import { LOCATION_CACHE_KEY, LocationData } from "@/hooks/useLocationService";

const COORD_THRESHOLD = 0.01; // ~1km — reuse cached label if coords haven't moved more than this

function buildLabel(address: Record<string, string>): string {
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

export function useReverseGeocode(
	lat: number | null,
	lng: number | null,
	language: string,
) {
	const [locationLabel, setLocationLabel] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (lat === null || lng === null) return;

		// Check existing hasanat-location cache for a stored label
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
				const label = buildLabel(data.address ?? {});
				if (label) {
					setLocationLabel(label);
					// Merge label into the existing hasanat-location entry
					const existing = localStorage.getItem(LOCATION_CACHE_KEY);
					if (existing) {
						try {
							const entry: LocationData = JSON.parse(existing);
							localStorage.setItem(
								LOCATION_CACHE_KEY,
								JSON.stringify({ ...entry, locationLabel: label }),
							);
						} catch {
							// ignore — label will be re-fetched next time
						}
					}
				}
			})
			.catch(() => {
				// silently fall back — widget shows coordinates instead
			})
			.finally(() => setLoading(false));
	}, [lat, lng, language]);

	return { locationLabel, loading };
}
