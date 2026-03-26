import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DeedCategory } from "@/data/deeds";
import { completeDeedWithEffects, uncompleteDeedWithEffects } from "./streakService";

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
 * Create deed_log AND update points + check streak
 * Replaces Firebase Function logic
 */
export async function createDeedLog(input: DeedLogInput): Promise<void> {
  // 1. Create the deed_log
  await addDoc(collection(db, "deed_logs"), {
    ...input,
    loggedAt: serverTimestamp(),
  });

  // 2. Update points + check streak (client-side)
  await completeDeedWithEffects(input.userId, input.pointsAtLogTime);
}

/**
 * Deletes the deed_log associated with a todo AND subtracts points.
 * Called when a user unchecks a todo on the same day.
 * Same-day enforcement is handled by the caller (useTodayTodos).
 * Note: Does NOT revert streak (once earned, stays until midnight)
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
  
  // Get points from the deed_log before deleting
  const points = snap.docs[0]?.data()?.pointsAtLogTime ?? 0;
  
  // Delete the deed_log(s)
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "deed_logs", d.id))));
  
  // Subtract points (don't revert streak)
  if (points > 0) {
    await uncompleteDeedWithEffects(userId, points);
  }
}
