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
import { useAuth } from "@/features/auth";
import { format } from "date-fns";
import {
	calculateAmalGraphStats,
	type DeedLog,
} from "@/lib/amalGraphCalculations";
import type { ProfileData } from "../types";
import { computeLevel, ALL_CATEGORIES } from "../types";

interface UserDoc {
	name: string;
	bio?: string;
	location?: string;
	isPublic?: boolean;
	totalPoints: number;
	photoURL?: string;
	createdAt: { toDate: () => Date } | null;
}

interface StreakDoc {
	currentStreak: number;
	longestStreak: number;
}

interface LeaderboardDoc {
	allTimeDeeds?: number;
}

interface FirestoreErrorLike {
	code?: string;
}

async function fetchUser(userId: string): Promise<UserDoc | "private" | null> {
	try {
		const userSnap = await getDoc(doc(db, "users", userId));
		if (!userSnap.exists()) return null;
		return userSnap.data() as UserDoc;
	} catch (error) {
		const firestoreError = error as FirestoreErrorLike;
		if (firestoreError.code === "permission-denied") {
			return "private";
		}
		throw error;
	}
}

async function fetchStreak(userId: string): Promise<StreakDoc> {
	const streakSnap = await getDoc(doc(db, "streaks", userId));
	return streakSnap.exists()
		? (streakSnap.data() as StreakDoc)
		: { currentStreak: 0, longestStreak: 0 };
}

async function fetchDeedLogs(userId: string): Promise<DeedLog[]> {
	const snap = await getDocs(
		query(collection(db, "deed_logs"), where("userId", "==", userId)),
	);
	return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DeedLog);
}

async function fetchUserRank(userId: string): Promise<number | null> {
	try {
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
	} catch {
		return null;
	}
}

async function fetchLeaderboardSummary(
	userId: string,
): Promise<LeaderboardDoc | null> {
	const summarySnap = await getDoc(doc(db, "leaderboard", userId));
	if (!summarySnap.exists()) return null;
	return summarySnap.data() as LeaderboardDoc;
}

export function useProfileData(userId: string) {
	const { user: viewer } = useAuth();
	const isOwner = viewer?.uid === userId;

	const userQuery = useQuery({
		queryKey: ["profile", "user", userId],
		queryFn: () => fetchUser(userId),
		enabled: !!userId,
		staleTime: Infinity,
	});

	const canViewFullData =
		userQuery.data !== "private" &&
		!!userQuery.data &&
		((userQuery.data.isPublic ?? true) || isOwner);

	const streakQuery = useQuery({
		queryKey: ["profile", "streak", userId],
		queryFn: () => fetchStreak(userId),
		enabled: !!userId && canViewFullData,
		staleTime: 5 * 60 * 1000,
	});

	const logsQuery = useQuery({
		queryKey: ["profile", "logs", userId],
		queryFn: () => fetchDeedLogs(userId),
		enabled: !!userId && canViewFullData,
		staleTime: 5 * 60 * 1000,
	});

	const rankQuery = useQuery({
		queryKey: ["profile", "rank", userId],
		queryFn: () => fetchUserRank(userId),
		enabled: !!userId && canViewFullData,
		staleTime: 5 * 60 * 1000,
	});

	const leaderboardSummaryQuery = useQuery({
		queryKey: ["profile", "leaderboard-summary", userId],
		queryFn: () => fetchLeaderboardSummary(userId),
		enabled: !!userId && userQuery.data !== "private" && !!userQuery.data,
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
		userQuery.isLoading ||
		(canViewFullData &&
			(streakQuery.isLoading || logsQuery.isLoading || rankQuery.isLoading)) ||
		(!canViewFullData && leaderboardSummaryQuery.isLoading);
	const error =
		userQuery.error ||
		(canViewFullData ? streakQuery.error || logsQuery.error : null);

	if (loading || error) {
		return {
			data: null,
			loading,
			error: error as Error | null,
		};
	}

	if (userQuery.data === "private") {
		const emptyCategoryBreakdown = ALL_CATEGORIES.map((category) => ({
			category,
			deedCount: 0,
			consistencyPct: 0,
			daysWithThisCat: 0,
		}));

		return {
			data: {
				name: "Private User",
				bio: "",
				location: "",
				isPublic: false,
				totalPoints: 0,
				photoURL: null,
				createdAt: "N/A",
				currentStreak: 0,
				longestStreak: 0,
				totalDeeds: 0,
				activeDays: 0,
				consistency: 0,
				topCategory: "",
				mostLoggedDeed: null,
				categoryBreakdown: emptyCategoryBreakdown,
				heatmapData: {},
				rank: null,
				level: computeLevel(0),
			},
			loading: false,
			error: null,
		};
	}

	if (!userQuery.data) {
		return {
			data: null,
			loading: false,
			error: null,
		};
	}

	const user = userQuery.data;
	const leaderboardSummary = leaderboardSummaryQuery.data;
	const fallbackDeeds = leaderboardSummary?.allTimeDeeds ?? 0;
	const streak = streakQuery.data ?? { currentStreak: 0, longestStreak: 0 };
	const logs = logsQuery.data ?? [];

	const stats = calculateAmalGraphStats(logs, "year");
	const totalDeeds = canViewFullData ? stats.totalDeeds : fallbackDeeds;
	const activeDays = canViewFullData ? stats.activeDays : 0;
	const consistency = canViewFullData ? stats.consistency : 0;
	const topCategory = canViewFullData ? stats.topCategory : "";
	const heatmapData = canViewFullData ? stats.heatmapData : {};

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
		isPublic: user.isPublic ?? true,
		totalPoints: user.totalPoints || 0,
		photoURL: user.photoURL || null,
		createdAt: user.createdAt
			? format(user.createdAt.toDate(), "MMM yyyy")
			: "N/A",
		currentStreak: streak.currentStreak,
		longestStreak: streak.longestStreak,
		totalDeeds,
		activeDays,
		consistency,
		topCategory,
		mostLoggedDeed,
		categoryBreakdown: canViewFullData ? categoryBreakdownZeroPadded : [],
		heatmapData,
		rank: rankQuery.data ?? null,
		level: computeLevel(totalDeeds),
	};

	return {
		data,
		loading: false,
		error: null,
	};
}
