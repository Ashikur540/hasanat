import type { DeedCategory, DeedDifficulty } from "@/data/deeds";
import type { TodoInput } from "@/lib/firestore/todoService";

type TodoMappableDeed = {
	id: string;
	name: string;
	emoji: string;
	category: DeedCategory;
	difficulty: DeedDifficulty;
	basePoints: number;
	isPreset?: boolean;
	deedType?: "preset" | "custom";
};

export function mapDeedToTodayTodoInput(
	deed: TodoMappableDeed,
): Omit<TodoInput, "userId" | "date"> {
	const deedType =
		deed.deedType ?? (deed.isPreset === false ? "custom" : "preset");

	return {
		deedId: deed.id,
		deedType,
		name: deed.name,
		emoji: deed.emoji,
		category: deed.category,
		difficulty: deed.difficulty,
		points: deed.basePoints,
	};
}
