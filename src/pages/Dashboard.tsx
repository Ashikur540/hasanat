import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
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
} from "@/features/dashboard";
import { useHijriDate } from "@/hooks/useHijriDate";

const fadeUp = {
	hidden: { opacity: 0, y: 18 },
	visible: { opacity: 1, y: 0 },
};
const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.07 } },
};

const Dashboard = () => {
	const { t } = useI18n();
	const { day, month, year } = useHijriDate();
	const { user } = useAuth();
	const [allFarzCompleted, setAllFarzCompleted] = useState(false);

	const userName = user?.displayName || "Friend";
	const greeting = t("dashGreetingTemplate").replace("{name}", userName);

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={stagger}
			className="container mx-auto px-4 py-6 space-y-4"
		>
			{/* ── Hero Header ─────────────────────────────────── */}
			<motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
				<div className="relative rounded-2xl overflow-hidden">
					{/* Layered gradient background */}
					<div className="absolute inset-0 bg-gradient-to-br from-[#0a2218] via-[#1A7A4A] to-[#2aaa68]" />

					{/* Decorative concentric rings — top-right */}
					<div className="absolute -top-16 -right-16 w-72 h-72 rounded-full border border-white/[0.06] pointer-events-none" />
					<div className="absolute -top-8 -right-8 w-56 h-56 rounded-full border border-white/[0.08] pointer-events-none" />
					<div className="absolute top-0 right-0 w-40 h-40 rounded-full border border-white/[0.10] pointer-events-none" />
					<div className="absolute top-6 right-6 w-24 h-24 rounded-full border border-white/[0.08] pointer-events-none" />

					{/* Star / geometric accents */}
					<div className="absolute bottom-4 right-28 text-white/[0.08] text-5xl select-none pointer-events-none font-thin">
						✦
					</div>
					<div className="absolute top-3 right-52 text-white/[0.06] text-2xl select-none pointer-events-none">
						✦
					</div>
					<div className="absolute bottom-2 right-6 text-white/[0.05] text-7xl select-none pointer-events-none font-thin">
						✦
					</div>

					{/* Content */}
					<div className="relative z-10 p-5 md:p-7 flex items-start justify-between gap-4">
						<div className="min-w-0">
							<p className="font-arabic text-2xl text-white/75 mb-2 leading-none">
								﷽
							</p>
							<h1 className="text-xl md:text-2xl font-bold text-white leading-snug">
								{greeting}
							</h1>
							<p className="text-white/55 text-sm mt-1.5 flex items-center gap-2">
								<span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300/80 animate-pulse shrink-0" />
								{`${day} ${month} ${year} · Keep going, you're on a ${23}-days streak!`}
							</p>
						</div>

						{/* Farz completion badge */}
						<div className="shrink-0">
							<AnimatePresence mode="wait">
								{allFarzCompleted ? (
									<motion.div
										key="done"
										initial={{ scale: 0.85, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.85, opacity: 0 }}
										className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-2.5 text-right"
									>
										<p className="text-white text-xs font-bold tracking-wide">
											All Farz ✓
										</p>
										<p className="text-emerald-200 text-xs mt-0.5">
											MashaAllah 🤲
										</p>
									</motion.div>
								) : (
									<motion.div
										key="pending"
										initial={{ scale: 0.85, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.85, opacity: 0 }}
										className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-right"
									>
										<p className="text-white/70 text-xs font-semibold tracking-wide">
											Farz Prayers
										</p>
										<p className="text-emerald-300/70 text-xs mt-0.5">
											Track below ↓
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</motion.div>

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
					<TodaysDeeds autoCompleteSalah={allFarzCompleted} />
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
					<Card className="border-border/30 bg-muted/15">
						<CardContent className="p-4 text-center">
							<p className="text-xs text-muted-foreground/60 italic leading-relaxed max-w-2xl mx-auto">
								"{t("dashPointsDisclaimer")}"
							</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</motion.div>
	);
};

export default Dashboard;
