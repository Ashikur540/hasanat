import { useI18n } from "@/i18n/I18nProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { toBanglaNum } from "@/lib/timeFormatting";
import { usePrayerChecklistState } from "@/hooks/usePrayerChecklistState";

interface FarzPrayerChecklistProps {
	onAllCompleted?: (allCompleted: boolean) => void;
}

const PRAYER_HADITHS: Record<string, { text: string; source: string }> = {
	fajr: {
		text: "Whoever performs the Fajr prayer is then under the protection of Allah.",
		source: "Muslim",
	},
	dhuhr: {
		text: "The gates of heaven are opened at midday and do not close until the Asr prayer.",
		source: "Tirmidhi",
	},
	asr: {
		text: "Whoever performs the two cool prayers (Fajr & Asr) will enter Paradise.",
		source: "Al-Bukhari",
	},
	maghrib: {
		text: "My Ummah will remain on goodness as long as they do not delay Maghrib.",
		source: "Ahmad",
	},
	isha: {
		text: "If they knew what is in Isha and Fajr, they would come even if they had to crawl.",
		source: "Al-Bukhari",
	},
};

const FarzPrayerChecklist = ({ onAllCompleted }: FarzPrayerChecklistProps) => {
	const { language } = useI18n();
	const isBn = language === "bn";
	const { loading } = usePrayerTimes();
	const { prayers, toggle, completed, progressPct, totalPoints } =
		usePrayerChecklistState(onAllCompleted);

	const allDone = completed === 5;

	return (
		<Card className="border-border/60 bg-card shadow-sm overflow-hidden">
			{/* Header */}
			<CardHeader className="pb-4 pt-5 px-5">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
						<span className="text-xl">🕌</span>
						{isBn ? "ফরজ নামায সমূহ" : "Farz Prayers"}
					</CardTitle>

					{/* Progress pill */}
					<div className="flex items-center gap-2.5">
						{/* Segmented dots */}
						<div className="flex items-center gap-1">
							{Array.from({ length: 5 }).map((_, i) => (
								<motion.div
									key={i}
									animate={{ scale: i < completed ? 1 : 0.8 }}
									transition={{ type: "spring", stiffness: 300, damping: 20 }}
									className={`h-2 w-2 rounded-full transition-colors duration-300 ${
										i < completed ? "bg-primary" : "bg-border"
									}`}
								/>
							))}
						</div>
						<span className="text-xs font-semibold text-muted-foreground tabular-nums">
							{isBn
								? `${toBanglaNum(completed)}/${toBanglaNum(5)}`
								: `${completed}/5`}
						</span>
					</div>
				</div>

				{/* Progress bar */}
				<div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
					<motion.div
						className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
						animate={{ width: `${progressPct}%` }}
						transition={{ type: "spring", stiffness: 120, damping: 20 }}
					/>
				</div>
			</CardHeader>

			<CardContent className="pt-0 px-4 pb-4 space-y-2.5">
				{loading ? (
					<div className="flex items-center justify-center py-10">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				) : (
					<AnimatePresence mode="popLayout">
						{prayers.map((p, idx) => {
							const hadith = PRAYER_HADITHS[p.id];
							return (
								<motion.div
									key={p.id}
									layout
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: idx * 0.04 }}
									onClick={() => toggle(p.id)}
									className={`relative flex items-stretch gap-0 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-200 group ${
										p.completed
											? "border-primary/25 bg-primary/5 shadow-sm"
											: "border-border/70 bg-card hover:border-primary/30 hover:shadow-sm hover:bg-muted/20"
									}`}
								>
									{/* Left accent bar */}
									<motion.div
										animate={{
											opacity: p.completed ? 1 : 0,
											width: p.completed ? 4 : 0,
										}}
										transition={{ duration: 0.2 }}
										className="shrink-0 bg-primary rounded-l-2xl"
									/>

									<div className="flex items-center gap-3 p-3.5 flex-1 min-w-0">
										{/* Custom checkbox */}
										<div
											className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
												p.completed
													? "border-primary bg-primary"
													: "border-muted-foreground/40 bg-transparent group-hover:border-primary/60"
											}`}
										>
											<AnimatePresence>
												{p.completed && (
													<motion.svg
														key="check"
														initial={{ scale: 0, opacity: 0 }}
														animate={{ scale: 1, opacity: 1 }}
														exit={{ scale: 0, opacity: 0 }}
														viewBox="0 0 10 8"
														fill="none"
														className="w-2.5 h-2 text-white"
													>
														<path
															d="M1 4l2.5 2.5L9 1"
															stroke="white"
															strokeWidth="1.8"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</motion.svg>
												)}
											</AnimatePresence>
										</div>

										{/* Emoji icon */}
										<div
											className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center text-lg transition-colors ${
												p.completed ? "bg-primary/10" : "bg-muted/60"
											}`}
										>
											{p.emoji}
										</div>

										{/* Prayer name + time */}
										<div className="shrink-0 w-16">
											<p
												className={`text-sm font-bold leading-tight transition-colors ${
													p.completed
														? "text-primary"
														: "text-foreground"
												}`}
											>
												{isBn ? p.bn : p.en}
											</p>
											<p className="text-xs text-muted-foreground font-medium tabular-nums mt-0.5">
												{p.time}
											</p>
										</div>

										{/* Divider */}
										<div className="self-stretch w-px bg-border/60 mx-0.5" />

										{/* Hadith */}
										{hadith && (
											<div className="flex-1 min-w-0 pr-1">
												<p
													className={`text-xs leading-relaxed line-clamp-2 transition-colors italic ${
														p.completed
															? "text-muted-foreground/80"
															: "text-muted-foreground"
													}`}
												>
													"{hadith.text}"
												</p>
												<p className="text-[10px] font-semibold text-primary/70 mt-0.5 not-italic">
													— {hadith.source}
												</p>
											</div>
										)}

										{/* Points + sparkle */}
										<div className="shrink-0 flex items-center gap-1">
											<AnimatePresence>
												{p.completed && (
													<motion.div
														key="sparkle"
														initial={{ scale: 0, rotate: -20 }}
														animate={{ scale: 1, rotate: 0 }}
														exit={{ scale: 0 }}
														className="text-primary"
													>
														<Sparkles className="h-3.5 w-3.5" />
													</motion.div>
												)}
											</AnimatePresence>
											<span
												className={`text-xs font-bold tabular-nums ${
													p.completed
														? "text-primary"
														: "text-muted-foreground"
												}`}
											>
												+{isBn ? toBanglaNum(p.points) : p.points}
											</span>
										</div>
									</div>
								</motion.div>
							);
						})}
					</AnimatePresence>
				)}

				{/* Points earned footer */}
				<AnimatePresence>
					{completed > 0 && !allDone && (
						<motion.div
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 4 }}
							className="flex items-center justify-between pt-1 px-1"
						>
							<span className="text-xs text-muted-foreground">
								{isBn ? "শহরে যোগ হচ্ছে" : "Contributing to city"}
							</span>
							<span className="text-sm font-bold text-primary">
								+{isBn ? toBanglaNum(totalPoints) : totalPoints}{" "}
								{isBn ? "পয়েন্ট" : "pts"}
							</span>
						</motion.div>
					)}
				</AnimatePresence>

				{/* All complete banner */}
				<AnimatePresence>
					{allDone && (
						<motion.div
							initial={{ opacity: 0, scale: 0.97, y: 6 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.97 }}
							className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/8 to-emerald-500/10 border border-primary/20"
						>
							<CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-bold text-primary">
									{isBn ? "মাশাআল্লাহ! সব নামায পড়া হয়েছে!" : "MashaAllah! All prayers complete!"}
								</p>
								<p className="text-xs text-muted-foreground mt-0.5">
									+{isBn ? toBanglaNum(totalPoints) : totalPoints}{" "}
									{isBn ? "পয়েন্ট অর্জিত হয়েছে" : "pts earned today"}
								</p>
							</div>
							<Sparkles className="h-4 w-4 text-primary shrink-0" />
						</motion.div>
					)}
				</AnimatePresence>
			</CardContent>
		</Card>
	);
};

export default FarzPrayerChecklist;
