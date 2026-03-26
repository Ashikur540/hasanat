import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import { checkStreakReset } from "@/lib/firestore/streakService";
import type { Streak } from "../types";

export function useStreak() {
	const { user } = useAuth();
	const [streak, setStreak] = useState<Streak | null>(null);
	const [loading, setLoading] = useState(true);

	// Check for streak reset on mount (replaces midnight Firebase Function)
	useEffect(() => {
		if (!user) return;

		checkStreakReset(user.uid).catch((err) => {
			console.error("Failed to check streak reset:", err);
		});
	}, [user]);

	useEffect(() => {
		if (!user) return;

		const unsubscribe = onSnapshot(
			doc(db, "streaks", user.uid),
			(snap) => {
				if (snap.exists()) {
					setStreak({ userId: snap.id, ...snap.data() } as Streak);
				} else {
					// No streak doc yet — user hasn't completed a full day yet
					setStreak(null);
				}
				setLoading(false);
			},
			(err) => {
				console.error("useStreak:", err);
				setLoading(false);
			},
		);

		return unsubscribe;
	}, [user]);

	return {
		currentStreak: streak?.currentStreak ?? 0,
		longestStreak: streak?.longestStreak ?? 0,
		lastStreakDate: streak?.lastStreakDate ?? null,
		loading,
	};
}
