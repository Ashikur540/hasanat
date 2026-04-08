import { useQuery } from "@tanstack/react-query";
import { fetchTopLeaderboard, fetchUserLeaderboardEntry } from "../lib/leaderboardService";
import type { TimeFilter, LeaderEntry } from "../types";

export const useLeaderboard = (timeFilter: TimeFilter, uid: string | null) => {
	const { data: entries = [], isLoading: entriesLoading } = useQuery({
		queryKey: ["leaderboard", timeFilter, uid],
		queryFn: () => fetchTopLeaderboard(timeFilter, uid || undefined),
		enabled: !!uid,
		refetchInterval: 10000,
	});

	const userInTop10 = entries.find((e) => e.isCurrentUser);

	const { data: userEntry = null, isLoading: userLoading } = useQuery({
		queryKey: ["leaderboard", "user", uid, timeFilter],
		queryFn: () => fetchUserLeaderboardEntry(uid!, timeFilter),
		enabled: !!uid && !userInTop10,
		refetchInterval: 10000,
	});

	return {
		entries,
		userEntry: userInTop10 || userEntry,
		loading: entriesLoading || userLoading,
	};
};
