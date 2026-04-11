import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	collection,
	addDoc,
	updateDoc,
	doc,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import type { DeedCategory, DeedDifficulty } from "@/data/deeds";

interface CreateCustomDeedInput {
	name: string;
	emoji: string;
	category: DeedCategory;
	difficulty: DeedDifficulty;
	basePoints: number;
	description: string;
	hadithReference: string;
	visibility: "public" | "private";
}

export interface CreatedCustomDeed {
	id: string;
	name: string;
	emoji: string;
	category: DeedCategory;
	difficulty: DeedDifficulty;
	basePoints: number;
}

interface UpdateCustomDeedInput {
	id: string;
	name: string;
	emoji: string;
	category: DeedCategory;
	description: string;
	hadithReference: string;
	visibility: "public" | "private";
}

export function useDeedMutation() {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["custom_deeds", user?.uid] });
		// also invalidate the combined deeds query used in Deed Library
		queryClient.invalidateQueries({ queryKey: ["deeds", "custom", user?.uid] });
	};

	const createCustomDeed = useMutation({
		mutationFn: async (deed: CreateCustomDeedInput) => {
			if (!user) throw new Error("Not authenticated");
			const ref = await addDoc(collection(db, "custom_deeds"), {
				...deed,
				isPreset: false,
				userId: user.uid,
				pickCount: 0,
				isDeleted: false,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
			return {
				id: ref.id,
				name: deed.name,
				emoji: deed.emoji,
				category: deed.category,
				difficulty: deed.difficulty,
				basePoints: deed.basePoints,
			} satisfies CreatedCustomDeed;
		},
		onSuccess: invalidate,
	});

	const updateCustomDeed = useMutation({
		mutationFn: async ({ id, ...fields }: UpdateCustomDeedInput) => {
			if (!user) throw new Error("Not authenticated");
			await updateDoc(doc(db, "custom_deeds", id), {
				...fields,
				updatedAt: serverTimestamp(),
			});
		},
		onSuccess: invalidate,
	});

	const softDeleteCustomDeed = useMutation({
		mutationFn: async (id: string) => {
			if (!user) throw new Error("Not authenticated");
			await updateDoc(doc(db, "custom_deeds", id), {
				isDeleted: true,
				updatedAt: serverTimestamp(),
			});
		},
		onSuccess: invalidate,
	});

	return { createCustomDeed, updateCustomDeed, softDeleteCustomDeed };
}
