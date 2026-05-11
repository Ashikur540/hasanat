export const formatRelativeTime = (timestamp: number): string => {
	const diff = Date.now() - timestamp;
	if (diff < 0) return "just now";
	const minute = 60_000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const week = 7 * day;
	if (diff < minute) return "just now";
	if (diff < hour) {
		const m = Math.floor(diff / minute);
		return `${m} min${m === 1 ? "" : "s"} ago`;
	}
	if (diff < day) {
		const h = Math.floor(diff / hour);
		return `${h} hr${h === 1 ? "" : "s"} ago`;
	}
	if (diff < week) {
		const d = Math.floor(diff / day);
		return `${d} day${d === 1 ? "" : "s"} ago`;
	}
	const w = Math.floor(diff / week);
	if (w < 5) return `${w} week${w === 1 ? "" : "s"} ago`;
	const date = new Date(timestamp);
	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};
