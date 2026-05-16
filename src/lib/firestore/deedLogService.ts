import {
	collection,
	doc,
	addDoc,
	deleteDoc,
	query,
	where,
	getDocs,
	serverTimestamp,
	getDoc as getFirestoreDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DeedCategory } from "@/data/deeds";
import { updateUserPoints } from "./streakService";
import {
	updateLeaderboard,
	decrementLeaderboard,
} from "@/features/leaderboard";

export interface DeedLogInput {
	userId: string;
	date: string;
	deedId: string;
	deedType: "preset" | "custom";
	todoId: string;
	name: string;
	emoji: string;
	category: DeedCategory;
	pointsAtLogTime: number;
}

/**
 * Create deed_log AND add points. Streak is evaluated nightly by the
 * `streakDailyEvaluate` Cloud Function — not here.
 */
export async function createDeedLog(input: DeedLogInput): Promise<void> {
	await addDoc(collection(db, "deed_logs"), {
		...input,
		loggedAt: serverTimestamp(),
	});

	await updateUserPoints(input.userId, input.pointsAtLogTime);

	const userRef = doc(db, "users", input.userId);
	const userSnap = await getFirestoreDoc(userRef);
	const displayName = userSnap.data()?.name || "Anonymous";
	await updateLeaderboard(input.userId, input.pointsAtLogTime, displayName);
}

/**
 * Deletes the deed_log associated with a todo AND subtracts points.
 * Called when a user unchecks a todo on the same day.
 * Same-day enforcement is handled by the caller (useTodayTodos).
 */
export async function deleteDeedLogByTodoId(
	userId: string,
	todoId: string,
): Promise<void> {
	const q = query(
		collection(db, "deed_logs"),
		where("userId", "==", userId),
		where("todoId", "==", todoId),
	);
	const snap = await getDocs(q);

	const points = snap.docs[0]?.data()?.pointsAtLogTime ?? 0;

	await Promise.all(
		snap.docs.map((d) => deleteDoc(doc(db, "deed_logs", d.id))),
	);

	if (points > 0) {
		await updateUserPoints(userId, -points);
		await decrementLeaderboard(userId, points);
	}
}
