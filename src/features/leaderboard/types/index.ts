export type TimeFilter = "week" | "month" | "allTime";

export interface LeaderEntry {
	rank: number;
	name: string;
	initials: string;
	points: number;
	streak: number;
	deeds: number;
	trend: "up" | "down" | "same";
	isCurrentUser: boolean;
	badge?: string;
}

export interface LeaderboardDocument {
	userId: string;
	displayName: string;
	avatarInitials: string;
	weekPoints: number;
	weekDeeds: number;
	weekKey: string;
	monthPoints: number;
	monthDeeds: number;
	monthKey: string;
	allTimePoints: number;
	allTimeDeeds: number;
	currentStreak: number;
	updatedAt: any;
}
