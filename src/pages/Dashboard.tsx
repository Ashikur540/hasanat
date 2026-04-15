import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth";
import {
	DateCalendarWidget,
	FarzPrayerChecklist,
	HadithWidget,
	PrayerTimeWidget,
	StatsBar,
	StreakCard,
	TodaysDeeds,
	CityPreview,
	DashboardHeader,
} from "@/features/dashboard";
import { useDashboardCompletionConfetti } from "@/features/dashboard/hooks/useDashboardCompletionConfetti";
import { useI18n } from "@/i18n/I18nProvider";

const fadeUp = {
	hidden: { opacity: 0, y: 18 },
	visible: { opacity: 1, y: 0 },
};
const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.07 } },
};

const Dashboard = () => {
	const { user } = useAuth();
	const [allFarzCompleted, setAllFarzCompleted] = useState(false);
	const [allTodayCompleted, setAllTodayCompleted] = useState(false);
	const { t } = useI18n();

	useDashboardCompletionConfetti(allTodayCompleted, user?.uid);

	return (
		<>
			<Helmet>
				<title>Dashboard | Hasanat</title>
				<meta name="robots" content="noindex" />
			</Helmet>
			<motion.div
				initial="hidden"
				animate="visible"
				variants={stagger}
				className="container mx-auto px-4 py-6 space-y-4"
			>
				<DashboardHeader allFarzCompleted={allFarzCompleted} />

				{/* ── Bento Grid ──────────────────────────────────── */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* ── Zone A: Stats overview — full width ── */}
					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="col-span-1 md:col-span-2 lg:col-span-4"
					>
						<StatsBar />
					</motion.div>

					{/* ── Zone B: Primary actions — side by side ── */}
					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="col-span-1 md:col-span-2 lg:col-span-2"
					>
						<FarzPrayerChecklist onAllCompleted={setAllFarzCompleted} />
					</motion.div>

					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="col-span-1 md:col-span-2 lg:col-span-2"
					>
						<TodaysDeeds
							autoCompleteSalah={allFarzCompleted}
							onAllTodayCompletedChange={setAllTodayCompleted}
						/>
					</motion.div>

					{/* ── Zone C: Info strip — 4 equal cards, all h-full ── */}
					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="col-span-1 h-full"
					>
						<DateCalendarWidget />
					</motion.div>

					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="col-span-1 h-full"
					>
						<PrayerTimeWidget />
					</motion.div>

					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="col-span-1 h-full"
					>
						<StreakCard />
					</motion.div>

					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="col-span-1 h-full"
					>
						<CityPreview />
					</motion.div>

					{/* ── Zone D: Hadith — full width ── */}
					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="col-span-1 md:col-span-2 lg:col-span-4"
					>
						<HadithWidget />
					</motion.div>

					{/* ── Zone E: Disclaimer footer ── */}
					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="col-span-1 md:col-span-2 lg:col-span-4"
					>
						<Card className="border-border/30 bg-muted">
							<CardContent className="p-4 text-center">
								<p className="text-xs text-muted-foreground/60 italic leading-relaxed max-w-2xl mx-auto">
									"{t("dashPointsDisclaimer")}"
								</p>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</motion.div>
		</>
	);
};

export default Dashboard;
