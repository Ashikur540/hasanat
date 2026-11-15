import { useAuth } from "@/features/auth";
import { db } from "@/lib/firebase";
import {
  readPrivateCoords,
  savePrivateCoords,
  savePublicLabels,
} from "@/lib/firestore/userLocation";
import { getLocationFromIP } from "@/lib/location/getLocationFromIP";
import { deleteField, doc, getDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

export interface LocationData {
  lat: number;
  lng: number;
  source: "gps" | "ip" | "manual";
  city?: string;
  country?: string;
  locationLabel?: string;
  timestamp: number;
  manual: boolean;
}

interface LocationState {
  data: LocationData | null;
  loading: boolean;
  error: string | null;
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

interface RemoteLocation {
  lat?: number;
  lng?: number;
  source?: LocationData["source"];
  city?: string;
  country?: string;
  locationLabel?: string;
}

export const LOCATION_CACHE_KEY = "hasanat-location";
const GEOLOCATION_TIMEOUT = 10000;
const INITIAL_STATE: LocationState = {
  data: null,
  loading: true,
  error: null,
};

function parseLocationCache(raw: string | null): LocationData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LocationData;
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") {
      return null;
    }
    /**
     * We don't trust IP-based locations — they usually point to the user's
     * internet provider, not where the user actually is. So we ignore any
     * old IP entry and let the browser ask for GPS again.
     */
    if (parsed.source === "ip") return null;
    return parsed;
  } catch {
    return null;
  }
}

async function readFirestoreLocation(
  uid: string,
): Promise<LocationData | null> {
  try {
    const [coords, snap] = await Promise.all([
      readPrivateCoords(uid),
      getDoc(doc(db, "users", uid)),
    ]);
    const data = (snap.data() ?? {}) as {
      geo?: RemoteLocation;
      location?: RemoteLocation | string;
    };
    /**
     * Older builds saved exact coordinates on the public user document, in
     * `geo` or even earlier in `location`. If we find them there, we move them
     * to the private document so other people can no longer read them.
     */
    const legacy =
      data.geo && typeof data.geo.lat === "number"
        ? data.geo
        : typeof data.location === "object"
          ? data.location
          : undefined;
    const remote: RemoteLocation | undefined = coords
      ? { ...data.geo, ...coords }
      : legacy && { ...data.geo, ...legacy };
    if (
      !remote ||
      typeof remote.lat !== "number" ||
      typeof remote.lng !== "number"
    ) {
      return null;
    }
    if (!coords) {
      void moveLegacyCoords(uid, {
        lat: remote.lat,
        lng: remote.lng,
        source: remote.source,
      }, remote, typeof data.location === "object");
    }
    /**
     * Same reason we skip IP-sourced cache: these are usually pointing to the
     * user's ISP, not the user. We pretend it isn't there so the app tries
     * a fresh GPS lookup instead.
     */
    if (remote.source === "ip") return null;
    return {
      lat: remote.lat,
      lng: remote.lng,
      source: remote.source ?? "gps",
      city: remote.city,
      country: remote.country,
      locationLabel: remote.locationLabel,
      timestamp: Date.now(),
      manual: remote.source === "manual",
    };
  } catch (err) {
    console.warn("Firestore location read failed:", err);
    return null;
  }
}

function tryGPS(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    const timeoutId = setTimeout(() => resolve(null), GEOLOCATION_TIMEOUT);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId);
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: "gps",
          timestamp: Date.now(),
          manual: false,
        });
      },
      () => {
        clearTimeout(timeoutId);
        resolve(null);
      },
      {
        timeout: GEOLOCATION_TIMEOUT,
        maximumAge: 60000,
        enableHighAccuracy: true,
      },
    );
  });
}

async function tryIP(): Promise<LocationData | null> {
  const ip = await getLocationFromIP();
  if (!ip) return null;
  return {
    lat: ip.lat,
    lng: ip.lng,
    city: ip.city,
    country: ip.country,
    source: "ip",
    timestamp: Date.now(),
    manual: false,
  };
}

async function moveLegacyCoords(
  uid: string,
  coords: { lat: number; lng: number; source?: LocationData["source"] },
  labels: RemoteLocation,
  clearLegacyLocation: boolean,
): Promise<void> {
  try {
    await savePrivateCoords(uid, coords);
    await savePublicLabels(uid, labels);
    if (clearLegacyLocation) {
      await updateDoc(doc(db, "users", uid), { location: deleteField() });
    }
  } catch (err) {
    console.warn("Moving location to the private document failed:", err);
  }
}

async function syncLocationToFirestore(
  uid: string,
  data: LocationData,
): Promise<void> {
  try {
    /**
     * When the user moves, the old city name no longer belongs to the new
     * coordinates. We wipe those old labels here so they don't linger —
     * the reverse-geocoder will fill in fresh ones a moment later.
     */
    await Promise.all([
      savePrivateCoords(uid, data),
      savePublicLabels(uid, data),
    ]);
  } catch (err) {
    console.error("Firestore location sync failed:", err);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useLocationService(): UseLocationServiceReturn {
  const { user } = useAuth();
  const [state, setState] = useState<LocationState>(INITIAL_STATE);

  /**
   * Saves a freshly resolved location everywhere it needs to live: React
   * state, the local cache, and (if signed in) Firestore. We skip Firestore
   * for IP-based guesses since they're unreliable.
   */
  const applyLocation = useCallback(
    (data: LocationData, syncRemote: boolean) => {
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(data));
      setState({ data, loading: false, error: null });
      if (syncRemote && user?.uid && data.source !== "ip") {
        void syncLocationToFirestore(user.uid, data);
      }
    },
    [user?.uid],
  );

  /**
   * Works out where the user is, trying sources in order: what we saved in
   * Firestore, then the local cache, then live GPS, then a rough IP guess.
   * Visitors who aren't signed in get nothing — keeps the landing page free
   * of permission popups.
   */
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    async function resolve() {
      // 1. Firestore — cross-device source of truth.
      const remote = await readFirestoreLocation(uid!);
      if (cancelled) return;
      if (remote) {
        applyLocation(remote, false);
        return;
      }
      // 2. localStorage cache — offline / first-paint fast path.
      const cached = parseLocationCache(
        localStorage.getItem(LOCATION_CACHE_KEY),
      );
      if (cancelled) return;
      if (cached) {
        applyLocation(cached, true);
        return;
      }
      // 3. Browser GPS — primary live source.
      const gps = await tryGPS();
      if (cancelled) return;
      if (gps) {
        applyLocation(gps, true);
        return;
      }
      // 4. IP geolocation — last-resort fallback (LOCAL ONLY, not synced).
      const ip = await tryIP();
      if (cancelled) return;
      if (ip) {
        applyLocation(ip, true);
        return;
      }
      // 5. All failed — prompt user to set manually.
      setState({
        data: null,
        loading: false,
        error: "Please set your location manually",
      });
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [uid, applyLocation]);

  /**
   * Used when the user picks a location themselves — either by hitting
   * "Use Current Location" in Settings or typing coordinates manually.
   */
  const setCachedLocation = useCallback(
    (
      lat: number,
      lng: number,
      manual: boolean,
      city?: string,
      country?: string,
      sourceOverride?: LocationData["source"],
    ) => {
      applyLocation(
        {
          lat,
          lng,
          source: sourceOverride ?? (manual ? "manual" : "gps"),
          city,
          country,
          timestamp: Date.now(),
          manual,
        },
        true,
      );
    },
    [applyLocation],
  );

  return {
    lat: state.data?.lat ?? null,
    lng: state.data?.lng ?? null,
    source: state.data?.source ?? null,
    city: state.data?.city ?? null,
    country: state.data?.country ?? null,
    loading: state.loading,
    error: state.error,
    setCachedLocation,
  };
}
