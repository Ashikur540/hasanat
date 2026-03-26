import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DeedCategory, DeedDifficulty } from "@/data/deeds";

export interface TodoInput {
  userId: string;
  date: string;
  deedId: string;
  deedType: "preset" | "custom";
  name: string;
  emoji: string;
  category: DeedCategory;
  difficulty: DeedDifficulty;
  points: number;
}

export async function addTodo(input: TodoInput): Promise<string> {
  const ref = await addDoc(collection(db, "todos"), {
    ...input,
    completed: false,
    completedAt: null,
    addedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function completeTodo(todoId: string): Promise<void> {
  await updateDoc(doc(db, "todos", todoId), {
    completed: true,
    completedAt: serverTimestamp(),
  });
}

export async function uncompleteTodo(todoId: string): Promise<void> {
  await updateDoc(doc(db, "todos", todoId), {
    completed: false,
    completedAt: null,
  });
}

export async function removeTodo(todoId: string): Promise<void> {
  await deleteDoc(doc(db, "todos", todoId));
}

/** Returns true if the deed is already in the user's todo list for the given date */
export async function isTodoDuplicate(
  userId: string,
  date: string,
  deedId: string,
): Promise<boolean> {
  const q = query(
    collection(db, "todos"),
    where("userId", "==", userId),
    where("date", "==", date),
    where("deedId", "==", deedId),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
