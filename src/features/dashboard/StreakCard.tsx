import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useStreak } from "./hooks/useStreak";
import { useWeekGraph } from "./hooks/useWeekGraph";
import { format } from "date-fns";
import { useId } from "react";

const StreakCard = () => {
	const { t } = useI18n();
	const {
		currentStreak,
		longestStreak,
		lastStreakDate,
		loading: streakLoading,
	} = useStreak();
	const { data: weekData, loading: weekLoading } = useWeekGraph();

	const loading = streakLoading || weekLoading;
	const today = format(new Date(), "yyyy-MM-dd");

	// Build 7-day dot array from weekData
	const weekDots = weekData.map((d) => ({
		date: d.date,
		active: d.count > 0,
		isToday: d.date === today,
	}));

	const weekCompleted = weekDots.filter((d) => d.active).length;

	if (loading) {
		return (
			<Card className="border-0 overflow-hidden relative h-full rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-800 dark:via-emerald-700 dark:to-teal-700">
				<CardContent className="p-6 relative z-10">
					<Skeleton className="h-3 w-24 bg-white/20 mb-4" />
					<Skeleton className="h-14 w-20 bg-white/20 mb-2" />
					<Skeleton className="h-3 w-48 bg-white/20 mb-6" />
					<div className="flex gap-1">
						{[...Array(7)].map((_, i) => (
							<Skeleton
								key={i}
								className="flex-1 h-1.5 rounded-full bg-white/20"
							/>
						))}
					</div>
					<Skeleton className="h-2.5 w-16 bg-white/20 mx-auto mt-2" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-0 overflow-hidden relative h-full rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-800 dark:via-emerald-700 dark:to-teal-700">
			<div className="absolute -right-4 -bottom-4 opacity-10 text-white">
				<Flame className="h-28 w-28 fill-current" />
			</div>
			<CardContent className="p-6 relative z-10 text-white">
				<div className="flex justify-between items-center mb-4">
					<h3 className="font-bold uppercase tracking-widest text-xs opacity-80">
						{t("streakCurrent")}
					</h3>
					<motion.div
						animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
						transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
					>
						<GradientFlame className="h-7 w-7 fill-current drop-shadow-lg" />
					</motion.div>
				</div>

				<div className="flex items-baseline gap-2 mb-2">
					<motion.span
						className="text-6xl font-black tracking-tight leading-none"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: "spring", stiffness: 200 }}
					>
						{currentStreak}
					</motion.span>
					<span className="text-xl font-medium opacity-80">
						{t("commonDays")}
					</span>
				</div>

				<p className="text-xs opacity-60 mb-6">
					{t("streakBest")}: {longestStreak} {t("commonDays")}
					{lastStreakDate && (
						<span className="ml-1">• Last: {lastStreakDate}</span>
					)}
				</p>

				<div className="flex justify-between items-center gap-1">
					{weekDots.length > 0
						? weekDots.map((dot, i) => (
								<motion.div
									key={dot.date}
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: i * 0.05, type: "spring" }}
									className={`flex-1 h-1.5 rounded-full transition-colors ${
										dot.active
											? "bg-white/40"
											: dot.isToday
												? "bg-white/30"
												: "bg-white/20"
									}`}
								/>
							))
						: [...Array(7)].map((_, i) => (
								<div
									key={i}
									className="flex-1 h-1.5 rounded-full bg-white/20"
								/>
							))}
				</div>
				<p className="text-[10px] text-center mt-2 opacity-60">
					{weekCompleted}/7 {t("streakThisWeek")}
				</p>
			</CardContent>
		</Card>
	);
};

export default StreakCard;

const GradientFlame = ({ className }: { className?: string }) => {
	const gradientId = useId();

	return (
		<svg
			viewBox="0 0 24 24"
			className={className}
			fill="none"
			aria-hidden="true"
		>
			<defs>
				<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#ffbc57" />
					<stop offset="62.37%" stopColor="#f69f53" />
					<stop offset="100%" stopColor="#ff860c" />
				</linearGradient>
			</defs>
			<path
				d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
				fill={`url(#${gradientId})`}
				stroke={`url(#${gradientId})`}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
