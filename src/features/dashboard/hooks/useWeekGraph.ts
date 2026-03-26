import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import { format } from "date-fns";
import type { WeekGraphDay } from "../types";

function getLast7Days(): string[] {
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date();
		d.setDate(d.getDate() - (6 - i));
		return format(d, "yyyy-MM-dd");
	});
}

export function useWeekGraph() {
	const { user } = useAuth();
	const [data, setData] = useState<WeekGraphDay[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user) return;

		const last7 = getLast7Days();
		const sevenDaysAgo = last7[0]; // earliest date in the range

		// Single-field query — no composite index needed.
		// Date range filtering is done client-side.
		const q = query(
			collection(db, "deed_logs"),
			where("userId", "==", user.uid),
		);

		const unsubscribe = onSnapshot(
			q,
			(snap) => {
				const countsByDate: Record<string, number> = {};
				snap.docs.forEach((d) => {
					const date = d.data().date as string;
					if (date >= sevenDaysAgo) {
						countsByDate[date] = (countsByDate[date] ?? 0) + 1;
					}
				});
				setData(
					last7.map((date) => ({ date, count: countsByDate[date] ?? 0 })),
				);
				setLoading(false);
			},
			(err) => {
				console.error("useWeekGraph:", err);
				setLoading(false);
			},
		);

		return unsubscribe;
	}, [user]);

	const weekTotal = data.reduce((sum, d) => sum + d.count, 0);

	return { data, weekTotal, loading };
}
