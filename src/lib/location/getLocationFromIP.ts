export interface IPLocationData {
	lat: number;
	lng: number;
	city: string;
	country: string;
}

interface IPAPIResponse {
	latitude?: number;
	longitude?: number;
	city?: string;
	country_name?: string;
}

export async function getLocationFromIP(): Promise<IPLocationData | null> {
	try {
		const response = await fetch("https://ipapi.co/json/");
		if (!response.ok) {
			return null;
		}

		const data = (await response.json()) as IPAPIResponse;
		if (
			typeof data.latitude !== "number" ||
			typeof data.longitude !== "number"
		) {
			return null;
		}

		return {
			lat: data.latitude,
			lng: data.longitude,
			city: data.city || "",
			country: data.country_name || "",
		};
	} catch {
		return null;
	}
}
