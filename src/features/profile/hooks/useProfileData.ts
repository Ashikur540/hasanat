import { useQuery } from "@tanstack/react-query";
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import {
	calculateAmalGraphStats,
	type DeedLog,
} from "@/lib/amalGraphCalculations";
import { fetchTopLeaderboard } from "@/features/leaderboard/lib/leaderboardService";
import type { ProfileData, AmalLevel } from "../types";
import { computeLevel, ALL_CATEGORIES } from "../types";
import type { DeedCategory } from "@/data/deeds";

interface UserDoc {
	name: string;
	bio?: string;
	location?: string;
	isPublic: boolean;
	totalPoints: number;
	photoURL?: string;
	createdAt: { toDate: () => Date } | null;
}

interface StreakDoc {
	currentStreak: number;
	longestStreak: number;
}

async function fetchUserAndStreak(
	userId: string,
): Promise<{ user: UserDoc; streak: StreakDoc } | null> {
	const [userSnap, streakSnap] = await Promise.all([
		getDoc(doc(db, "users", userId)),
		getDoc(doc(db, "streaks", userId)),
	]);

	if (!userSnap.exists()) return null;

	const userData = userSnap.data() as UserDoc;
	const streakData = streakSnap.exists()
		? (streakSnap.data() as StreakDoc)
		: { currentStreak: 0, longestStreak: 0 };

	return {
		user: userData,
		streak: streakData,
	};
}

async function fetchDeedLogs(userId: string): Promise<DeedLog[]> {
	const snap = await getDocs(
		query(collection(db, "deed_logs"), where("userId", "==", userId)),
	);
	return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DeedLog);
}

async function fetchUserRank(userId: string): Promise<number | null> {
	const entries = await fetchTopLeaderboard("allTime");
	const userEntry = entries.find((e) => e.isCurrentUser);
	if (userEntry) return userEntry.rank;

	const userDoc = await getDoc(doc(db, "leaderboard", userId));
	if (!userDoc.exists()) return null;

	const userPoints = userDoc.data().allTimePoints || 0;
	const allDocs = await getDocs(collection(db, "leaderboard"));
	let rank = 1;
	allDocs.forEach((d) => {
		const points = d.data().allTimePoints || 0;
		if (points > userPoints) rank++;
	});

	return rank;
}

export function useProfileData(userId: string) {
	const userQuery = useQuery({
		queryKey: ["profile", "user", userId],
		queryFn: () => fetchUserAndStreak(userId),
		enabled: !!userId,
		staleTime: Infinity,
	});

	const logsQuery = useQuery({
		queryKey: ["profile", "logs", userId],
		queryFn: () => fetchDeedLogs(userId),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
	});

	const rankQuery = useQuery({
		queryKey: ["profile", "rank", userId],
		queryFn: () => fetchUserRank(userId),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
	});

	if (!userId) {
		return {
			data: null,
			loading: false,
			error: new Error("No user ID provided"),
		};
	}

	const loading =
		userQuery.isLoading || logsQuery.isLoading || rankQuery.isLoading;
	const error = userQuery.error || logsQuery.error || rankQuery.error;

	if (loading || error || !userQuery.data) {
		return {
			data: null,
			loading,
			error: error as Error | null,
		};
	}

	const { user, streak } = userQuery.data;
	const logs = logsQuery.data ?? [];

	const stats = calculateAmalGraphStats(logs, "year");

	const categoryBreakdownZeroPadded = ALL_CATEGORIES.map((cat) => {
		const existing = stats.categoryBreakdown.find((c) => c.category === cat);
		return (
			existing ?? {
				category: cat,
				deedCount: 0,
				consistencyPct: 0,
				daysWithThisCat: 0,
			}
		);
	});

	const deedCounts: Record<string, { name: string; emoji: string; count: number }> = {};
	logs.forEach((log) => {
		const key = log.deedId;
		if (!deedCounts[key]) {
			deedCounts[key] = { name: log.name, emoji: log.emoji, count: 0 };
		}
		deedCounts[key].count++;
	});

	const mostLoggedDeed =
		Object.values(deedCounts).sort((a, b) => b.count - a.count)[0] ?? null;

	const data: ProfileData = {
		name: user.name || "Anonymous",
		bio: user.bio || "",
		location: user.location || "",
		isPublic: user.isPublic ?? false,
		totalPoints: user.totalPoints || 0,
		photoURL: user.photoURL || null,
		createdAt: user.createdAt
			? format(user.createdAt.toDate(), "MMM yyyy")
			: "N/A",
		currentStreak: streak.currentStreak,
		longestStreak: streak.longestStreak,
		totalDeeds: stats.totalDeeds,
		activeDays: stats.activeDays,
		consistency: stats.consistency,
		topCategory: stats.topCategory,
		mostLoggedDeed,
		categoryBreakdown: categoryBreakdownZeroPadded,
		heatmapData: stats.heatmapData,
		rank: rankQuery.data ?? null,
		level: computeLevel(stats.totalDeeds),
	};

	return {
		data,
		loading: false,
		error: null,
	};
}
