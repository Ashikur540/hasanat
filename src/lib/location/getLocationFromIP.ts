export interface IPLocationData {
	lat: number;
	lng: number;
	city: string;
	country: string;
}

interface IPWhoIsResponse {
	success?: boolean;
	latitude?: number;
	longitude?: number;
	city?: string;
	country?: string;
}

interface GeoJSResponse {
	latitude?: string;
	longitude?: string;
	city?: string;
	country?: string;
}

type Provider = () => Promise<IPLocationData | null>;

const fromIpWhoIs: Provider = async () => {
	const response = await fetch("https://ipwho.is/");
	if (!response.ok) return null;
	const data = (await response.json()) as IPWhoIsResponse;
	if (
		data.success === false ||
		typeof data.latitude !== "number" ||
		typeof data.longitude !== "number"
	) {
		return null;
	}
	return {
		lat: data.latitude,
		lng: data.longitude,
		city: data.city || "",
		country: data.country || "",
	};
};

const fromGeoJS: Provider = async () => {
	const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
	if (!response.ok) return null;
	const data = (await response.json()) as GeoJSResponse;
	const lat = parseFloat(data.latitude || "");
	const lng = parseFloat(data.longitude || "");
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	return {
		lat,
		lng,
		city: data.city || "",
		country: data.country || "",
	};
};

export async function getLocationFromIP(): Promise<IPLocationData | null> {
	const providers: Provider[] = [fromIpWhoIs, fromGeoJS];
	for (const provider of providers) {
		try {
			const result = await provider();
			if (result) return result;
		} catch {
			// try next
		}
	}
	return null;
}
