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
	const raw = snap.data().settings ?? {};
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
		},
	} as SettingsFormValues;
}

export async function patchSettings(
	uid: string,
	data: SettingsFormValues,
): Promise<void> {
	// Writes to the `settings` field on the existing user doc — no rule change needed
	await updateDoc(userRef(uid), { settings: data });
}
