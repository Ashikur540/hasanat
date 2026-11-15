import {
	deleteField,
	doc,
	getDoc,
	serverTimestamp,
	setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type LocationSource = "gps" | "ip" | "manual";

export interface PrivateCoords {
	lat: number;
	lng: number;
	source?: LocationSource;
}

export interface LocationLabels {
	city?: string;
	country?: string;
	locationLabel?: string;
}

/**
 * Exact coordinates point to where someone lives, so they sit in a document
 * only the owner can read. The public user document keeps just the city and
 * country that profiles show.
 */
export const privateLocationRef = (uid: string) =>
	doc(db, "users", uid, "private", "location");

export async function readPrivateCoords(
	uid: string,
): Promise<PrivateCoords | null> {
	const snap = await getDoc(privateLocationRef(uid));
	const data = snap.data() as Partial<PrivateCoords> | undefined;
	if (typeof data?.lat !== "number" || typeof data?.lng !== "number") {
		return null;
	}
	return { lat: data.lat, lng: data.lng, source: data.source };
}

export async function savePrivateCoords(
	uid: string,
	coords: PrivateCoords,
): Promise<void> {
	await setDoc(privateLocationRef(uid), {
		lat: coords.lat,
		lng: coords.lng,
		source: coords.source ?? "manual",
		updatedAt: serverTimestamp(),
	});
}

/**
 * Public `geo` fields for the user document. It also clears coordinates that
 * older app versions saved there, so every location save cleans them up.
 */
export function publicGeoPayload(labels: LocationLabels) {
	return {
		city: labels.city || deleteField(),
		country: labels.country || deleteField(),
		locationLabel: labels.locationLabel || deleteField(),
		lat: deleteField(),
		lng: deleteField(),
		source: deleteField(),
	};
}

export async function savePublicLabels(
	uid: string,
	labels: LocationLabels,
): Promise<void> {
	await setDoc(
		doc(db, "users", uid),
		{ geo: publicGeoPayload(labels) },
		{ merge: true },
	);
}
