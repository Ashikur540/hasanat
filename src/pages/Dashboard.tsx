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
import { useStreak } from "@/features/dashboard/hooks/useStreak";
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

	const { currentStreak } = useStreak();

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

					{/* ── Islamic Hanging Lanterns ──────────────────────── */}
					<div className="absolute inset-0 pointer-events-none overflow-hidden">
						<svg
							viewBox="0 0 380 165"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="absolute right-0 top-0 h-full w-auto"
							preserveAspectRatio="xMaxYMin meet"
						>
							{/* Horizontal hanging wire */}
							<line
								x1="40"
								y1="3"
								x2="380"
								y2="3"
								stroke="white"
								strokeWidth="1.5"
								strokeOpacity="0.30"
							/>

							{/* ── Lantern A: Large (far right) ── */}
							<line
								x1="350"
								y1="3"
								x2="350"
								y2="20"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.28"
							/>
							<ellipse
								cx="350"
								cy="23"
								rx="3"
								ry="2.5"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.28"
							/>
							<line
								x1="341"
								y1="26"
								x2="359"
								y2="26"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.26"
							/>
							{/* Crown — 5 pointed arches */}
							<path
								d="M341 26 L340 37 Q343 31 346.5 37 Q349 31 350 37 Q351 31 353.5 37 Q357 31 360 37 L359 26"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.28"
								fill="none"
							/>
							<line
								x1="340"
								y1="37"
								x2="360"
								y2="37"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.26"
							/>
							{/* Body */}
							<path
								d="M340 37 C336 49 335 66 336 82 L364 82 C365 66 364 49 360 37"
								stroke="white"
								strokeWidth="1.5"
								strokeOpacity="0.28"
								fill="none"
							/>
							{/* Horizontal bands */}
							<line
								x1="336"
								y1="52"
								x2="364"
								y2="52"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.20"
							/>
							<line
								x1="335"
								y1="68"
								x2="365"
								y2="68"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.20"
							/>
							{/* Vertical ribs */}
							<line
								x1="350"
								y1="37"
								x2="350"
								y2="82"
								stroke="white"
								strokeWidth="0.8"
								strokeOpacity="0.18"
							/>
							<line
								x1="343"
								y1="39"
								x2="342"
								y2="81"
								stroke="white"
								strokeWidth="0.8"
								strokeOpacity="0.16"
							/>
							<line
								x1="357"
								y1="39"
								x2="358"
								y2="81"
								stroke="white"
								strokeWidth="0.8"
								strokeOpacity="0.16"
							/>
							{/* Arched panel windows */}
							<path
								d="M337 43 Q343.5 39 350 43 L350 67 Q343.5 71 337 67 Z"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.22"
								fill="none"
							/>
							<path
								d="M350 43 Q356.5 39 363 43 L363 67 Q356.5 71 350 67 Z"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.22"
								fill="none"
							/>
							{/* Bottom dome */}
							<path
								d="M336 82 Q350 96 364 82"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.28"
							/>
							{/* Bottom cone */}
							<path
								d="M343 89 Q350 112 357 89"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.26"
							/>
							{/* Finial */}
							<line
								x1="350"
								y1="112"
								x2="350"
								y2="118"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.24"
							/>
							<circle
								cx="350"
								cy="121"
								r="3"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.24"
								fill="none"
							/>

							{/* ── Lantern B: Medium ── */}
							<line
								x1="291"
								y1="3"
								x2="291"
								y2="36"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.25"
							/>
							<ellipse
								cx="291"
								cy="39"
								rx="2.5"
								ry="2"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.25"
							/>
							<line
								x1="283"
								y1="42"
								x2="299"
								y2="42"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.22"
							/>
							{/* Crown — 3 arches */}
							<path
								d="M283 42 L282 51 Q286.5 46 291 51 Q295.5 46 300 51 L299 42"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.25"
								fill="none"
							/>
							<line
								x1="282"
								y1="51"
								x2="300"
								y2="51"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.22"
							/>
							{/* Body */}
							<path
								d="M282 51 C279 60 278 72 279 83 L303 83 C304 72 303 60 300 51"
								stroke="white"
								strokeWidth="1.3"
								strokeOpacity="0.24"
								fill="none"
							/>
							<line
								x1="279"
								y1="63"
								x2="303"
								y2="63"
								stroke="white"
								strokeWidth="0.8"
								strokeOpacity="0.17"
							/>
							<line
								x1="279"
								y1="74"
								x2="303"
								y2="74"
								stroke="white"
								strokeWidth="0.8"
								strokeOpacity="0.17"
							/>
							<line
								x1="291"
								y1="51"
								x2="291"
								y2="83"
								stroke="white"
								strokeWidth="0.8"
								strokeOpacity="0.16"
							/>
							{/* Single arched window */}
							<path
								d="M280 55 Q291 51 302 55 L302 79 Q291 83 280 79 Z"
								stroke="white"
								strokeWidth="0.9"
								strokeOpacity="0.20"
								fill="none"
							/>
							{/* Bottom */}
							<path
								d="M279 83 Q291 95 303 83"
								stroke="white"
								strokeWidth="1.2"
								strokeOpacity="0.24"
							/>
							<path
								d="M285 89 Q291 106 297 89"
								stroke="white"
								strokeWidth="1.1"
								strokeOpacity="0.22"
							/>
							<line
								x1="291"
								y1="106"
								x2="291"
								y2="111"
								stroke="white"
								strokeWidth="1.1"
								strokeOpacity="0.21"
							/>
							<circle
								cx="291"
								cy="114"
								r="2.5"
								stroke="white"
								strokeWidth="1.1"
								strokeOpacity="0.21"
								fill="none"
							/>

							{/* ── Lantern C: Small ── */}
							<line
								x1="233"
								y1="3"
								x2="233"
								y2="19"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.22"
							/>
							<ellipse
								cx="233"
								cy="21"
								rx="2"
								ry="1.8"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.22"
							/>
							<line
								x1="226"
								y1="24"
								x2="240"
								y2="24"
								stroke="white"
								strokeWidth="0.9"
								strokeOpacity="0.20"
							/>
							<path
								d="M226 24 L225 32 Q229 28 233 32 Q237 28 241 32 L240 24"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.22"
								fill="none"
							/>
							<line
								x1="225"
								y1="32"
								x2="241"
								y2="32"
								stroke="white"
								strokeWidth="0.9"
								strokeOpacity="0.19"
							/>
							<path
								d="M225 32 C223 39 222 50 223 60 L243 60 C244 50 243 39 241 32"
								stroke="white"
								strokeWidth="1.1"
								strokeOpacity="0.22"
								fill="none"
							/>
							<line
								x1="223"
								y1="43"
								x2="243"
								y2="43"
								stroke="white"
								strokeWidth="0.8"
								strokeOpacity="0.16"
							/>
							<line
								x1="223"
								y1="52"
								x2="243"
								y2="52"
								stroke="white"
								strokeWidth="0.8"
								strokeOpacity="0.16"
							/>
							{/* Bottom */}
							<path
								d="M223 60 Q233 70 243 60"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.22"
							/>
							<path
								d="M228 66 Q233 79 238 66"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.20"
							/>
							<line
								x1="233"
								y1="79"
								x2="233"
								y2="83"
								stroke="white"
								strokeWidth="0.9"
								strokeOpacity="0.18"
							/>
							<circle
								cx="233"
								cy="85"
								r="2"
								stroke="white"
								strokeWidth="0.9"
								strokeOpacity="0.18"
								fill="none"
							/>

							{/* ── Lantern D: Tiny ── */}
							<line
								x1="180"
								y1="3"
								x2="180"
								y2="42"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.19"
							/>
							<ellipse
								cx="180"
								cy="44"
								rx="2"
								ry="1.8"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.19"
							/>
							<line
								x1="173"
								y1="47"
								x2="187"
								y2="47"
								stroke="white"
								strokeWidth="0.9"
								strokeOpacity="0.17"
							/>
							<path
								d="M173 47 L172 54 Q176 51 180 54 Q184 51 188 54 L187 47"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.19"
								fill="none"
							/>
							<line
								x1="172"
								y1="54"
								x2="188"
								y2="54"
								stroke="white"
								strokeWidth="0.9"
								strokeOpacity="0.17"
							/>
							<path
								d="M172 54 C170 60 170 68 171 76 L189 76 C190 68 190 60 188 54"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.19"
								fill="none"
							/>
							<line
								x1="171"
								y1="63"
								x2="189"
								y2="63"
								stroke="white"
								strokeWidth="0.7"
								strokeOpacity="0.14"
							/>
							{/* Bottom */}
							<path
								d="M171 76 Q180 85 189 76"
								stroke="white"
								strokeWidth="1"
								strokeOpacity="0.19"
							/>
							<path
								d="M175 81 Q180 92 185 81"
								stroke="white"
								strokeWidth="0.9"
								strokeOpacity="0.17"
							/>
							<line
								x1="180"
								y1="92"
								x2="180"
								y2="96"
								stroke="white"
								strokeWidth="0.9"
								strokeOpacity="0.16"
							/>
							<circle
								cx="180"
								cy="98"
								r="2"
								stroke="white"
								strokeWidth="0.9"
								strokeOpacity="0.16"
								fill="none"
							/>

							{/* ── 8-pointed star accents ── */}
							<g
								transform="translate(318,88)"
								fill="none"
								stroke="white"
								strokeOpacity="0.22"
								strokeWidth="1"
							>
								<path d="M0,-6 L1.5,-1.5 L6,0 L1.5,1.5 L0,6 L-1.5,1.5 L-6,0 L-1.5,-1.5Z" />
								<line
									x1="0"
									y1="-4"
									x2="0"
									y2="4"
									strokeOpacity="0.14"
									strokeWidth="0.6"
								/>
								<line
									x1="-4"
									y1="0"
									x2="4"
									y2="0"
									strokeOpacity="0.14"
									strokeWidth="0.6"
								/>
							</g>
							<g
								transform="translate(262,58)"
								fill="none"
								stroke="white"
								strokeOpacity="0.18"
								strokeWidth="0.9"
							>
								<path d="M0,-5 L1.2,-1.2 L5,0 L1.2,1.2 L0,5 L-1.2,1.2 L-5,0 L-1.2,-1.2Z" />
							</g>
							<g
								transform="translate(208,74)"
								fill="none"
								stroke="white"
								strokeOpacity="0.15"
								strokeWidth="0.8"
							>
								<path d="M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1Z" />
							</g>
						</svg>
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
								{`${day} ${month} ${year} · Keep going, you're on a ${currentStreak}-day streak!`}
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
										className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-2.5 text-right absolute bottom-2 right-2 sm:right-10 sm:block hidden"
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
										className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-right absolute bottom-2 right-2 sm:right-10 sm:block hidden"
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
