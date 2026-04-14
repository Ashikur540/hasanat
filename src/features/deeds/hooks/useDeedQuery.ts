import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import { PRESET_DEEDS, type Deed } from "@/data/deeds";

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

	const customQuery = useQuery({
		queryKey: ["deeds", "custom", user?.uid ?? "anon"],
		queryFn: () => fetchCustomDeeds(user!.uid),
		enabled: !!user,
		staleTime: 5 * 60 * 1000,
	});

	const allDeeds: Deed[] = [
		...PRESET_DEEDS,
		...(customQuery.data ?? []),
	];

	return {
		allDeeds,
		isLoading: false,
		isError: false,
	};
}
