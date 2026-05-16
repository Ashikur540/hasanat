import { getLocationFromIP } from "@/lib/location/getLocationFromIP";
import { useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";

export interface LocationData {
  lat: number;
  lng: number;
  timestamp: number;
  manual: boolean;
  source: "gps" | "ip" | "manual";
  city?: string;
  country?: string;
  locationLabel?: string;
}

export interface UseLocationServiceReturn {
  lat: number | null;
  lng: number | null;
  source: LocationData["source"] | null;
  city: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
  setCachedLocation: (
    lat: number,
    lng: number,
    manual: boolean,
    city?: string,
    country?: string,
    sourceOverride?: LocationData["source"],
  ) => void;
}

export const LOCATION_CACHE_KEY = "hasanat-location";
const GEOLOCATION_TIMEOUT = 10000; // 5 seconds

function parseLocationCache(raw: string | null): LocationData | null {
  if (!raw) return null;

  try {
    const locationData = JSON.parse(raw) as LocationData;
    if (
      typeof locationData.lat !== "number" ||
      typeof locationData.lng !== "number"
    ) {
      return null;
    }
    return locationData;
  } catch {
    return null;
  }
}

async function syncLocationToFirestore(
  uid: string,
  lat: number,
  lng: number,
  source: LocationData["source"],
): Promise<void> {
  try {
    await setDoc(
      doc(db, "users", uid),
      {
        location: { lat, lng, source, updatedAt: serverTimestamp() },
      },
      { merge: true },
    );
  } catch (err) {
    console.error("Failed to sync location to Firestore:", err);
  }
}

export function useLocationService(): UseLocationServiceReturn {
  const { user } = useAuth();
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [source, setSource] = useState<LocationData["source"] | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedLocation = parseLocationCache(
      localStorage.getItem(LOCATION_CACHE_KEY),
    );
    if (cachedLocation) {
      setLat(cachedLocation.lat);
      setLng(cachedLocation.lng);
      setSource(cachedLocation.source);
      setCity(cachedLocation.city || null);
      setCountry(cachedLocation.country || null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const resolveLocation = async () => {
      const applyLocation = (locationData: LocationData) => {
        localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
        setLat(locationData.lat);
        setLng(locationData.lng);
        setSource(locationData.source);
        setCity(locationData.city || null);
        setCountry(locationData.country || null);
        setError(null);
        setLoading(false);
      };

      const applyManualRequired = () => {
        setLat(null);
        setLng(null);
        setSource(null);
        setCity(null);
        setCountry(null);
        setError("Please set your location manually");
        setLoading(false);
      };

      const tryIPFallback = async () => {
        const ipLocation = await getLocationFromIP();
        if (cancelled) return;

        if (ipLocation) {
          applyLocation({
            lat: ipLocation.lat,
            lng: ipLocation.lng,
            city: ipLocation.city,
            country: ipLocation.country,
            timestamp: Date.now(),
            manual: false,
            source: "ip",
          });
          return;
        }

        applyManualRequired();
      };

      if (!navigator.geolocation) {
        await tryIPFallback();
        return;
      }

      const timeoutId = setTimeout(() => {
        void tryIPFallback();
      }, GEOLOCATION_TIMEOUT);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (cancelled) return;
          clearTimeout(timeoutId);
          applyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
            manual: false,
            source: "gps",
          });
        },
        async () => {
          clearTimeout(timeoutId);
          await tryIPFallback();
        },
        {
          timeout: GEOLOCATION_TIMEOUT,
          maximumAge: 60000,
          enableHighAccuracy: true,
        },
      );
    };

    void resolveLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mirror current lat/lng to Firestore whenever user + coords are available.
  // Server-side notifications (prayer reminders) read from users/{uid}.location.
  useEffect(() => {
    if (!user || lat == null || lng == null || !source) return;
    void syncLocationToFirestore(user.uid, lat, lng, source);
  }, [user, lat, lng, source]);

  const setCachedLocation = (
    latitude: number,
    longitude: number,
    manual: boolean,
    cityName?: string,
    countryName?: string,
    sourceOverride?: LocationData["source"],
  ) => {
    const locationData: LocationData = {
      lat: latitude,
      lng: longitude,
      timestamp: Date.now(),
      manual,
      source: sourceOverride ?? (manual ? "manual" : "gps"),
      city: cityName,
      country: countryName,
    };

    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
    setLat(latitude);
    setLng(longitude);
    setSource(locationData.source);
    setCity(cityName || null);
    setCountry(countryName || null);
    setError(null);
  };

  return {
    lat,
    lng,
    source,
    city,
    country,
    loading,
    error,
    setCachedLocation,
  };
}
