import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import type { Deed } from "@/data/deeds";

export function useDeedMutation() {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	const createCustomDeed = useMutation({
		mutationFn: async (deed: Omit<Deed, "id" | "isPreset">) => {
			if (!user) throw new Error("Not authenticated");
			await addDoc(collection(db, "custom_deeds"), {
				...deed,
				isPreset: false,
				userId: user.uid,
				createdAt: serverTimestamp(),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["deeds", "custom", user?.uid],
			});
		},
	});

	return { createCustomDeed };
}
