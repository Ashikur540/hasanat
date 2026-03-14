import { useState, useEffect } from "react";

export interface LocationData {
	lat: number;
	lng: number;
	timestamp: number;
	manual: boolean;
}

export interface UseLocationServiceReturn {
	lat: number | null;
	lng: number | null;
	loading: boolean;
	error: string | null;
	setCachedLocation: (lat: number, lng: number, manual: boolean) => void;
}

const LOCATION_CACHE_KEY = "hasanat-location";
const GEOLOCATION_TIMEOUT = 5000; // 5 seconds

export function useLocationService(): UseLocationServiceReturn {
	const [lat, setLat] = useState<number | null>(null);
	const [lng, setLng] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Check if location is already cached
		const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY);

		if (cachedLocation) {
			try {
				const locationData: LocationData = JSON.parse(cachedLocation);
				setLat(locationData.lat);
				setLng(locationData.lng);
				setLoading(false);
				return;
			} catch (e) {
				if (process.env.NODE_ENV === "development") {
					console.error("Failed to parse cached location:", e);
				}
				localStorage.removeItem(LOCATION_CACHE_KEY);
			}
		}

		// If no cache, request geolocation
		if (!navigator.geolocation) {
			setError("Geolocation is not supported by this browser");
			setLoading(false);
			return;
		}

		const timeoutId = setTimeout(() => {
			setError("Geolocation request timed out");
			setLoading(false);
		}, GEOLOCATION_TIMEOUT);

		navigator.geolocation.getCurrentPosition(
			(position) => {
				clearTimeout(timeoutId);
				const { latitude, longitude } = position.coords;

				const locationData: LocationData = {
					lat: latitude,
					lng: longitude,
					timestamp: Date.now(),
					manual: false,
				};

				localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
				setLat(latitude);
				setLng(longitude);
				setError(null);
				setLoading(false);
			},
			(positionError) => {
				clearTimeout(timeoutId);

				if (positionError.code === positionError.PERMISSION_DENIED) {
					// User denied permission - return null coordinates but don't show error
					// Component using this hook will handle showing a dialog
					setLat(null);
					setLng(null);
					setError(null);

					// Cache this decision so we don't ask again
					const locationData: LocationData = {
						lat: 0,
						lng: 0,
						timestamp: Date.now(),
						manual: false,
					};
					localStorage.setItem(
						LOCATION_CACHE_KEY,
						JSON.stringify(locationData),
					);
				} else if (positionError.code === positionError.POSITION_UNAVAILABLE) {
					setError("Location information is unavailable");
				} else if (positionError.code === positionError.TIMEOUT) {
					setError("Geolocation request timed out");
				} else {
					setError("An error occurred while retrieving your location");
				}

				setLat(null);
				setLng(null);
				setLoading(false);
			},
		);

		return () => clearTimeout(timeoutId);
	}, []);

	const setCachedLocation = (
		latitude: number,
		longitude: number,
		manual: boolean,
	) => {
		const locationData: LocationData = {
			lat: latitude,
			lng: longitude,
			timestamp: Date.now(),
			manual,
		};

		localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
		setLat(latitude);
		setLng(longitude);
		setError(null);
	};

	return {
		lat,
		lng,
		loading,
		error,
		setCachedLocation,
	};
}
