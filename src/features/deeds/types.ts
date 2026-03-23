import type { DeedCategory, DeedDifficulty } from "@/data/deeds";
import type { Timestamp } from "firebase/firestore";

export interface CustomDeed {
	id: string;
	userId: string;
	name: string;
	emoji: string;
	category: DeedCategory;
	difficulty: DeedDifficulty;
	basePoints: number;
	description: string;
	hadithReference: string;
	visibility: "public" | "private";
	pickCount: number;
	isDeleted: boolean;
	isPreset: false;
	createdAt: Timestamp | null;
	updatedAt: Timestamp | null;
}
