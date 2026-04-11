import { useEffect, useState, useCallback } from "react";
import {
	collection,
	query,
	where,
	onSnapshot,
	Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import { useToast } from "@/hooks/use-toast";
import {
	addTodo,
	completeTodo,
	uncompleteTodo,
	removeTodo,
	isTodoDuplicate,
	type TodoInput,
} from "@/lib/firestore/todoService";
import {
	createDeedLog,
	deleteDeedLogByTodoId,
} from "@/lib/firestore/deedLogService";
import { format } from "date-fns";
import type { Todo } from "../types";

export function useTodayTodos(allPrayersCompleted: boolean = false) {
	const { user } = useAuth();
	const { toast } = useToast();
	const [todos, setTodos] = useState<Todo[]>([]);
	const [loading, setLoading] = useState(true);

	const today = format(new Date(), "yyyy-MM-dd");

	useEffect(() => {
		if (!user) return;

		const q = query(
			collection(db, "todos"),
			where("userId", "==", user.uid),
			where("date", "==", today),
		);

		const unsubscribe = onSnapshot(
			q,
			(snap) => {
				const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Todo);
				// Sort client-side by addedAt ascending (avoids composite index requirement)
				docs.sort((a, b) => {
					const aTime = a.addedAt?.toMillis?.() ?? 0;
					const bTime = b.addedAt?.toMillis?.() ?? 0;
					return aTime - bTime;
				});

				// Prepend the mandatory 5-prayer todo (synthetic, not in Firestore)
				const mandatoryTodo: Todo = {
					id: "mandatory_5_prayers",
					userId: user.uid,
					date: today,
					deedId: "salah_fard_5",
					deedType: "preset",
					name: "Pray all 5 Farz Salah",
					emoji: "🕌",
					category: "Salah",
					difficulty: "hard",
					points: 60,
					completed: allPrayersCompleted,
					completedAt: allPrayersCompleted ? Timestamp.now() : null,
					addedAt: Timestamp.now(),
					isMandatory: true,
				};
				setTodos([mandatoryTodo, ...docs]);
				setLoading(false);
			},
			(err) => {
				console.error("useTodayTodos:", err);
				setLoading(false);
			},
		);

		return unsubscribe;
	}, [user, today, allPrayersCompleted]);

	/** Add a deed to today's todo list. Returns false if already added. */
	const addDeedToToday = useCallback(
		async (input: Omit<TodoInput, "userId" | "date">): Promise<boolean> => {
			if (!user) return false;

			const duplicate = await isTodoDuplicate(user.uid, today, input.deedId);
			if (duplicate) {
				toast({
					title: "Already in today's list",
					description: `${input.emoji} ${input.name} is already added for today.`,
				});
				return false;
			}

			await addTodo({ ...input, userId: user.uid, date: today });
			toast({
				title: "Added to today's list",
				description: `${input.emoji} ${input.name} has been added to your today checklist.`,
			});
			return true;
		},
		[user, today, toast],
	);

	/**
	 * Toggle a todo's completed state.
	 * Completing → creates a deed_log.
	 * Uncompleting → deletes the deed_log (same-day only).
	 */
	const toggleTodo = useCallback(
		async (todo: Todo): Promise<void> => {
			if (!user) return;

			if (!todo.completed) {
				await completeTodo(todo.id);
				await createDeedLog({
					userId: user.uid,
					date: today,
					deedId: todo.deedId,
					deedType: todo.deedType,
					todoId: todo.id,
					name: todo.name,
					emoji: todo.emoji,
					category: todo.category,
					pointsAtLogTime: todo.points,
				});
			} else {
				await uncompleteTodo(todo.id);
				await deleteDeedLogByTodoId(user.uid, todo.id);
			}
		},
		[user, today],
	);

	/** Remove a todo from today's list. Also cleans up its deed_log if completed. */
	const deleteTodo = useCallback(
		async (todo: Todo): Promise<void> => {
			if (!user) return;
			if (todo.completed) {
				await deleteDeedLogByTodoId(user.uid, todo.id);
			}
			await removeTodo(todo.id);
		},
		[user],
	);

	// Exclude mandatory todo from counts (it's always there)
	const regularTodos = todos.filter((t) => !t.isMandatory);
	const completedCount = todos.filter((t) => t.completed).length;
	const totalCount = todos.length;

	// Calculate points from deed_logs (not from todos)
	// because individual prayers create separate deed_logs with actual points
	const [todayPoints, setTodayPoints] = useState(0);

	useEffect(() => {
		if (!user) return;

		const deedLogsQuery = query(
			collection(db, "deed_logs"),
			where("userId", "==", user.uid),
			where("date", "==", today),
		);

		const unsubscribe = onSnapshot(
			deedLogsQuery,
			(snap) => {
				const total = snap.docs.reduce((sum, doc) => {
					return sum + (doc.data().pointsAtLogTime ?? 0);
				}, 0);
				setTodayPoints(total);
			},
			(err) => {
				console.error("useTodayTodos deed_logs query:", err);
			},
		);

		return unsubscribe;
	}, [user, today]);

	const addedDeedIds = new Set(regularTodos.map((t) => t.deedId));

	return {
		todos,
		loading,
		completedCount,
		totalCount,
		todayPoints,
		addedDeedIds,
		addDeedToToday,
		toggleTodo,
		deleteTodo,
	};
}
