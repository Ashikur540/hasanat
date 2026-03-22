import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import type { Deed } from "@/data/deeds";

async function fetchPresetDeeds(): Promise<Deed[]> {
	const snap = await getDocs(collection(db, "deeds"));
	return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deed));
}

async function fetchCustomDeeds(userId: string): Promise<Deed[]> {
	const q = query(
		collection(db, "custom_deeds"),
		where("userId", "==", userId),
	);
	const snap = await getDocs(q);
	return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deed));
}

export function useDeedQuery() {
	const { user } = useAuth();

	const presetQuery = useQuery({
		queryKey: ["deeds", "preset"],
		queryFn: fetchPresetDeeds,
		staleTime: Infinity,
	});

	const customQuery = useQuery({
		queryKey: ["deeds", "custom", user?.uid ?? "anon"],
		queryFn: () => fetchCustomDeeds(user!.uid),
		enabled: !!user,
		staleTime: 5 * 60 * 1000,
	});

	const allDeeds: Deed[] = [
		...(presetQuery.data ?? []),
		...(customQuery.data ?? []),
	];

	return {
		allDeeds,
		isLoading: presetQuery.isLoading,
		isError: presetQuery.isError,
	};
}
