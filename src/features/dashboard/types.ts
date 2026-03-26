import type { Timestamp } from "firebase/firestore";
import type { DeedCategory, DeedDifficulty } from "@/data/deeds";

export interface Todo {
  id: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  deedId: string;
  deedType: "preset" | "custom";
  name: string;
  emoji: string;
  category: DeedCategory;
  difficulty: DeedDifficulty;
  points: number;
  completed: boolean;
  completedAt: Timestamp | null;
  addedAt: Timestamp;
  isMandatory?: boolean; // For the 5-prayer combined todo
}

export interface DeedLog {
  id: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  deedId: string;
  deedType: "preset" | "custom";
  todoId: string;
  name: string;
  emoji: string;
  category: DeedCategory;
  pointsAtLogTime: number;
  loggedAt: Timestamp;
}

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string; // "YYYY-MM-DD"
  updatedAt: Timestamp;
}

export interface WeekGraphDay {
  date: string; // "YYYY-MM-DD"
  count: number;
}

/** Unified deed shape used in the Add Deed modal — merges preset + custom */
export interface ModalDeed {
  id: string;
  deedType: "preset" | "custom";
  name: string;
  emoji: string;
  category: DeedCategory;
  difficulty: DeedDifficulty;
  points: number;
  description: string;
  hadithReference?: string;
  /** Only for public custom deeds created by others */
  creatorDisplayName?: string;
  pickCount?: number;
}
