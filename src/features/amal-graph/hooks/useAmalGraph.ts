import { useQuery } from "@tanstack/react-query";
import {
	collection,
	query,
	where,
	orderBy,
	getDocs,
	doc,
	getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import { getTodayString, getStartDate, type TimeRange } from "@/lib/dateUtils";
import {
	calculateAmalGraphStats,
	type DeedLog,
	type AmalGraphStats,
} from "@/lib/amalGraphCalculations";

interface StaticData {
	longestStreak: number;
	totalPoints: number;
}

export interface AmalGraphData extends AmalGraphStats, StaticData {
	loading: boolean;
	staticLoading: boolean;
}

async function fetchDeedLogs(
	uid: string,
	range: TimeRange,
): Promise<DeedLog[]> {
	const snap = await getDocs(
		query(
			collection(db, "deed_logs"),
			where("userId", "==", uid),
			where("date", ">=", getStartDate(range)),
			where("date", "<=", getTodayString()),
			orderBy("date", "asc"),
		),
	);
	return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DeedLog);
}

async function fetchStaticData(uid: string): Promise<StaticData> {
	const [streakSnap, userSnap] = await Promise.all([
		getDoc(doc(db, "streaks", uid)),
		getDoc(doc(db, "users", uid)),
	]);
	return {
		longestStreak: streakSnap.data()?.longestStreak ?? 0,
		totalPoints: userSnap.data()?.totalPoints ?? 0,
	};
}

export function useAmalGraph(range: TimeRange): AmalGraphData {
	const { user } = useAuth();
	const uid = user?.uid ?? "";

	const logsQuery = useQuery({
		queryKey: ["amal_graph", "logs", uid, range],
		queryFn: () => fetchDeedLogs(uid, range),
		enabled: !!uid,
		staleTime: 5 * 60 * 1000,
	});

	const staticQuery = useQuery({
		queryKey: ["amal_graph", "static", uid],
		queryFn: () => fetchStaticData(uid),
		enabled: !!uid,
		staleTime: Infinity,
	});

	const stats = calculateAmalGraphStats(logsQuery.data ?? [], range);
	const staticData = staticQuery.data ?? { longestStreak: 0, totalPoints: 0 };

	return {
		...stats,
		...staticData,
		loading: logsQuery.isLoading,
		staticLoading: staticQuery.isLoading,
	};
}
