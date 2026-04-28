export interface IPLocationData {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

interface GeoJSResponse {
  latitude?: string;
  longitude?: string;
  city?: string;
  country?: string;
}

type Provider = () => Promise<IPLocationData | null>;

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
  const providers: Provider[] = [fromGeoJS];
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
