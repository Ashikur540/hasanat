import type { UserInfo } from "firebase/auth";

interface AvatarUserLike {
	photoURL: string | null;
	providerData?: Array<Pick<UserInfo, "photoURL"> | null>;
}

export const getUserPhotoURL = (
	user: AvatarUserLike | null | undefined,
): string | null => {
	if (!user) return null;
	if (typeof user.photoURL === "string" && user.photoURL.trim()) {
		return user.photoURL;
	}
	const providerPhoto = user.providerData?.find(
		(provider) =>
			typeof provider?.photoURL === "string" && provider.photoURL.trim(),
	)?.photoURL;
	return providerPhoto ?? null;
};

