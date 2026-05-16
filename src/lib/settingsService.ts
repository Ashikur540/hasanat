import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import {
	DEFAULT_SETTINGS,
	type SettingsFormValues,
} from "@/features/settings/types";

const userRef = (uid: string) => doc(db, "users", uid);

export interface SettingsPayload {
	settings: SettingsFormValues;
	hasStoredAppearance: boolean;
}

export async function fetchSettings(uid: string): Promise<SettingsPayload> {
	const snap = await getDoc(userRef(uid));
	if (!snap.exists()) {
		return {
			settings: DEFAULT_SETTINGS,
			hasStoredAppearance: false,
		};
	}
	const userData = snap.data();
	const raw = userData.settings ?? {};
	const hasStoredAppearance = typeof raw.appearance === "string";
	const profileVisibilityFromUser =
		userData.isPublic === false ? "private" : "public";
	// Merge with defaults so new fields are always present
	return {
		settings: {
			...DEFAULT_SETTINGS,
			...raw,
			notifications: {
				...DEFAULT_SETTINGS.notifications,
				...(raw.notifications ?? {}),
			},
			privacy: {
				...DEFAULT_SETTINGS.privacy,
				...(raw.privacy ?? {}),
				profileVisibility:
					raw.privacy?.profileVisibility ?? profileVisibilityFromUser,
			},
		},
		hasStoredAppearance,
	} as SettingsPayload;
}

export async function patchSettings(
	uid: string,
	data: SettingsFormValues,
): Promise<void> {
	// setDoc({merge:true}) is upsert-safe; stamp settingsUpdatedAt for
	// last-write-wins conflict resolution across devices.
	await setDoc(
		userRef(uid),
		{
			settings: data,
			isPublic: data.privacy.profileVisibility !== "private",
			settingsUpdatedAt: serverTimestamp(),
		},
		{ merge: true },
	);
}
