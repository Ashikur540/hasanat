import {
	doc,
	getDoc,
	setDoc,
	updateDoc,
	serverTimestamp,
	increment,
	collection,
	query,
	orderBy,
	limit,
	getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCurrentWeekKey, getCurrentMonthKey, getInitials } from "./periodUtils";
import type { TimeFilter, LeaderEntry, LeaderboardDocument } from "../types";

const POINTS_FIELD: Record<TimeFilter, keyof LeaderboardDocument> = {
	week: "weekPoints",
	month: "monthPoints",
	allTime: "allTimePoints",
};

const DEEDS_FIELD: Record<TimeFilter, keyof LeaderboardDocument> = {
	week: "weekDeeds",
	month: "monthDeeds",
	allTime: "allTimeDeeds",
};

export const updateLeaderboard = async (
	uid: string,
	pointsEarned: number,
	displayName: string,
): Promise<void> => {
	const currentWeekKey = getCurrentWeekKey();
	const currentMonthKey = getCurrentMonthKey();

	const ref = doc(db, "leaderboard", uid);
	const snap = await getDoc(ref);

	if (!snap.exists()) {
		await setDoc(ref, {
			userId: uid,
			displayName: displayName,
			avatarInitials: getInitials(displayName),
			weekPoints: pointsEarned,
			weekDeeds: 1,
			weekKey: currentWeekKey,
			monthPoints: pointsEarned,
			monthDeeds: 1,
			monthKey: currentMonthKey,
			allTimePoints: pointsEarned,
			allTimeDeeds: 1,
			currentStreak: 0,
			updatedAt: serverTimestamp(),
		});
		return;
	}

	const data = snap.data();
	const isNewWeek = data.weekKey !== currentWeekKey;
	const isNewMonth = data.monthKey !== currentMonthKey;

	await updateDoc(ref, {
		displayName: displayName,
		avatarInitials: getInitials(displayName),
		weekPoints: isNewWeek ? pointsEarned : increment(pointsEarned),
		weekDeeds: isNewWeek ? 1 : increment(1),
		weekKey: currentWeekKey,
		monthPoints: isNewMonth ? pointsEarned : increment(pointsEarned),
		monthDeeds: isNewMonth ? 1 : increment(1),
		monthKey: currentMonthKey,
		allTimePoints: increment(pointsEarned),
		allTimeDeeds: increment(1),
		updatedAt: serverTimestamp(),
	});
};

export const decrementLeaderboard = async (
	uid: string,
	points: number,
): Promise<void> => {
	const currentWeekKey = getCurrentWeekKey();
	const currentMonthKey = getCurrentMonthKey();

	const ref = doc(db, "leaderboard", uid);
	const snap = await getDoc(ref);

	if (!snap.exists()) return;

	const data = snap.data();
	const isNewWeek = data.weekKey !== currentWeekKey;
	const isNewMonth = data.monthKey !== currentMonthKey;

	if (isNewWeek || isNewMonth) return;

	const newWeekPoints = Math.max(0, (data.weekPoints || 0) - points);
	const newMonthPoints = Math.max(0, (data.monthPoints || 0) - points);
	const newAllTimePoints = Math.max(0, (data.allTimePoints || 0) - points);
	const newWeekDeeds = Math.max(0, (data.weekDeeds || 0) - 1);
	const newMonthDeeds = Math.max(0, (data.monthDeeds || 0) - 1);
	const newAllTimeDeeds = Math.max(0, (data.allTimeDeeds || 0) - 1);

	await updateDoc(ref, {
		weekPoints: newWeekPoints,
		weekDeeds: newWeekDeeds,
		monthPoints: newMonthPoints,
		monthDeeds: newMonthDeeds,
		allTimePoints: newAllTimePoints,
		allTimeDeeds: newAllTimeDeeds,
		updatedAt: serverTimestamp(),
	});
};

export const syncStreakToLeaderboard = async (
	uid: string,
	currentStreak: number,
): Promise<void> => {
	const ref = doc(db, "leaderboard", uid);
	const snap = await getDoc(ref);
	
	if (snap.exists()) {
		await updateDoc(ref, {
			currentStreak: currentStreak,
			updatedAt: serverTimestamp(),
		});
	}
};

export const fetchTopLeaderboard = async (
	timeFilter: TimeFilter,
	currentUserId?: string,
): Promise<LeaderEntry[]> => {
	const q = query(
		collection(db, "leaderboard"),
		orderBy(POINTS_FIELD[timeFilter], "desc"),
		limit(10),
	);

	const snap = await getDocs(q);
	return snap.docs.map((doc, index) => {
		const d = doc.data() as LeaderboardDocument;
		return {
			rank: index + 1,
			name: d.displayName || "Anonymous",
			initials: d.avatarInitials || "??",
			points: d[POINTS_FIELD[timeFilter]] || 0,
			streak: d.currentStreak || 0,
			deeds: d[DEEDS_FIELD[timeFilter]] || 0,
			trend: "same" as const,
			isCurrentUser: doc.id === currentUserId,
		};
	});
};

export const fetchUserLeaderboardEntry = async (
	uid: string,
	timeFilter: TimeFilter,
): Promise<LeaderEntry | null> => {
	const snap = await getDoc(doc(db, "leaderboard", uid));
	if (!snap.exists()) return null;

	const d = snap.data() as LeaderboardDocument;
	return {
		rank: -1,
		name: d.displayName || "Anonymous",
		initials: d.avatarInitials || "??",
		points: d[POINTS_FIELD[timeFilter]] || 0,
		streak: d.currentStreak || 0,
		deeds: d[DEEDS_FIELD[timeFilter]] || 0,
		trend: "same" as const,
		isCurrentUser: true,
	};
};
