export const getCurrentWeekKey = (): string => {
	const now = new Date();
	const year = now.getFullYear();
	const startOfYear = new Date(year, 0, 1);
	const dayOfYear = Math.floor(
		(now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
	);
	const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
	const mondayOffset = dayOfYear - (dayOfWeek - 1);
	const weekNum = Math.ceil((mondayOffset + 1) / 7);
	return `${year}-W${String(weekNum).padStart(2, "0")}`;
};

export const getCurrentMonthKey = (): string => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const getInitials = (displayName: string): string => {
	return displayName
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0]?.toUpperCase() ?? "")
		.join("");
};
