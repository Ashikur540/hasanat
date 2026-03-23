import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import type { CustomDeed } from "@/features/deeds/types";

async function fetchUserCustomDeeds(userId: string): Promise<CustomDeed[]> {
	const q = query(
		collection(db, "custom_deeds"),
		where("userId", "==", userId),
		where("isDeleted", "==", false),
	);
	const snap = await getDocs(q);
	return snap.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	})) as CustomDeed[];
}

export function useCustomDeedQuery() {
	const { user } = useAuth();

	return useQuery({
		queryKey: ["custom_deeds", user?.uid ?? "anon"],
		queryFn: () => fetchUserCustomDeeds(user!.uid),
		enabled: !!user,
		staleTime: 5 * 60 * 1000,
	});
}
