import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import {
	DEFAULT_SETTINGS,
	type SettingsFormValues,
} from "@/features/settings/types";

const userRef = (uid: string) => doc(db, "users", uid);

export async function fetchSettings(uid: string): Promise<SettingsFormValues> {
	const snap = await getDoc(userRef(uid));
	if (!snap.exists()) return DEFAULT_SETTINGS;
	const userData = snap.data();
	const raw = userData.settings ?? {};
	const profileVisibilityFromUser =
		userData.isPublic === false ? "private" : "public";
	// Merge with defaults so new fields are always present
	return {
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
	} as SettingsFormValues;
}

export async function patchSettings(
	uid: string,
	data: SettingsFormValues,
): Promise<void> {
	// Keep legacy profile visibility (`users.isPublic`) synced with settings privacy.
	await updateDoc(userRef(uid), {
		settings: data,
		isPublic: data.privacy.profileVisibility !== "private",
	});
}
