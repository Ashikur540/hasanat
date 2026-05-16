import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Client-side user-points helper.
 * Streak evaluation is owned by the `streakDailyEvaluate` Cloud Function — clients
 * only mutate points and todo/deed_log state.
 */
export async function updateUserPoints(
	userId: string,
	points: number,
): Promise<void> {
	const userRef = doc(db, "users", userId);
	await setDoc(
		userRef,
		{
			totalPoints: increment(points),
		},
		{ merge: true },
	);
}
