import { motion } from "framer-motion";
import {
	Flame,
	ShieldCheck,
	Activity,
	CheckCircle2,
	ArrowLeft,
	Share,
} from "lucide-react";
import { fadeUp, stagger } from "../animations";

// 2 rows × 18 columns = 36 cells
const PROFILE_HEATMAP: number[] = [
	0, 1, 2, 3, 4, 4, 3, 2, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 2, 3, 4, 3, 4, 3, 2, 4,
	4, 2, 3, 4, 4, 3, 4, 2, 4, 4,
];

const LEVEL_CLASSES: Record<number, string> = {
	0: "bg-heatmap-0",
	1: "bg-heatmap-1",
	2: "bg-heatmap-2",
	3: "bg-heatmap-3",
	4: "bg-heatmap-4 dark:shadow-[0_0_5px_rgba(80,200,120,0.5)]",
};

const FEATURES = [
	{
		icon: Flame,
		iconClass: "text-amber-500 dark:text-gold-custom",
		iconBgClass:
			"bg-amber-100 dark:bg-gold-custom/10 border-amber-200 dark:border-gold-custom/20",
		title: "The Noor Streak",
		description:
			"Track consecutive days of deed logging. Your Noor (light) grows stronger with every unbroken day — miss one and you'll want to rebuild.",
	},
	{
		icon: ShieldCheck,
		iconClass: "text-primary dark:text-emerald-custom",
		iconBgClass:
			"bg-primary/10 dark:bg-emerald-custom/10 border-primary/20 dark:border-emerald-custom/20",
		title: "Privacy First (Ikhlas)",
		description:
			"Hide individual deeds or your entire profile. Sincerity before visibility — share only what you choose.",
	},
];

const ProfileSection = () => {
	return (
		<section
			aria-label="Profile Feature"
			className="py-24 relative z-20 overflow-hidden"
		>
			{/* Background */}
			<div className="absolute inset-0 bg-secondary/20 dark:bg-black/30 -z-10" />
			{/* Subtle glow — dark mode */}
			<div className="absolute top-1/2 right-0 w-96 h-96 -translate-y-1/2 translate-x-1/2 opacity-0 dark:opacity-100 bg-gold-custom/10 rounded-full blur-[100px] pointer-events-none transition-opacity" />

			<div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
				{/* Left: copy */}
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					variants={stagger}
					className="space-y-6"
				>
					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="inline-flex items-center gap-2 bg-amber-100 dark:bg-gold-custom/10 text-amber-700 dark:text-gold-custom px-3 py-1.5 rounded-full text-sm font-medium border border-amber-200 dark:border-gold-custom/20"
					>
						<Flame className="w-4 h-4" />
						Shareable Profile
					</motion.div>

					{/* Shiny title */}
					<motion.h2
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground dark:text-white leading-tight"
					>
						A Spiritual Portfolio
						<br />
						to{" "}
						<span className="text-primary dark:text-emerald-custom dark:drop-shadow-[0_0_10px_rgba(80,200,120,0.4)]">
							Inspire
						</span>
					</motion.h2>

					<motion.p
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="text-muted-foreground dark:text-gray-400 text-base md:text-lg leading-relaxed"
					>
						Share your progress without compromising your sincerity. Every
						believer gets a profile at{" "}
						<code className="bg-muted dark:bg-white/10 px-2 py-0.5 rounded text-foreground dark:text-white font-mono text-sm border border-border dark:border-white/10">
							hasanat.app/@username
						</code>
						. Inspire your family and friends to join the race for good.
					</motion.p>

					<motion.ul variants={stagger} className="space-y-4 pt-2">
						{FEATURES.map((feat) => (
							<motion.li
								key={feat.title}
								variants={fadeUp}
								transition={{ duration: 0.4 }}
								className="flex gap-4"
							>
								<div
									className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${feat.iconBgClass}`}
								>
									<feat.icon className={`w-5 h-5 ${feat.iconClass}`} />
								</div>
								<div>
									<h3 className="font-semibold text-foreground dark:text-white">
										{feat.title}
									</h3>
									<p className="text-sm text-muted-foreground dark:text-gray-400 leading-relaxed mt-0.5">
										{feat.description}
									</p>
								</div>
							</motion.li>
						))}
					</motion.ul>
				</motion.div>

				{/* Right: phone mockup */}
				<motion.div
					initial={{ opacity: 0, x: 30 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="flex justify-center relative"
				>
					{/* Glow behind phone */}
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<div className="w-72 h-72 opacity-0 dark:opacity-50 bg-emerald-custom/15 rounded-full blur-[100px] transition-opacity" />
					</div>

					{/* Phone chrome */}
					<div className="relative z-10 w-[280px] sm:w-[320px]">
						{/* Outer phone frame */}
						<div className="bg-gray-300 dark:bg-[#1c1c1e] rounded-[3.2rem] p-[10px] border-[6px] border-gray-400 dark:border-[#2c2c2e] shadow-2xl dark:shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_40px_rgba(80,200,120,0.08)]">
							{/* Screen */}
							<div className="bg-[#f2f2f7] dark:bg-[#061209] rounded-[2.6rem] overflow-hidden relative">
								{/* Status bar */}
								<div className="relative flex items-center justify-between px-5 pt-3 pb-1">
									<span className="text-[11px] font-semibold text-gray-800 dark:text-white leading-none">
										9:41
									</span>
									{/* Pill notch */}
									<div className="absolute left-1/2 -translate-x-1/2 top-2 w-[90px] h-[22px] bg-black rounded-full" />
									{/* Battery indicator */}
									<div className="flex items-center gap-1">
										<svg
											width="16"
											height="8"
											viewBox="0 0 16 8"
											fill="none"
											className="opacity-70"
										>
											<rect
												x="0.5"
												y="0.5"
												width="13"
												height="7"
												rx="1.5"
												stroke="currentColor"
												className="text-gray-700 dark:text-white"
												strokeWidth="1"
											/>
											<rect
												x="1.5"
												y="1.5"
												width="10"
												height="5"
												rx="0.8"
												className="fill-gray-700 dark:fill-white"
											/>
											<path
												d="M14.5 2.5v3"
												stroke="currentColor"
												className="text-gray-700 dark:text-white"
												strokeWidth="1"
												strokeLinecap="round"
											/>
										</svg>
									</div>
								</div>

								{/* Profile content */}
								<div className="px-4 pb-5 pt-2 space-y-3.5">
									<div className="flex justify-between items-center mb-6">
										<ArrowLeft className="w-5 h-5 text-gray-400" />
										<Share className="w-5 h-5 text-gray-400" />
									</div>

									<div className="flex flex-col items-center text-center py-8">
										<div className="relative mb-3">
											<div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-900 to-slate-900 border-2 border-emerald-custom/50 flex items-center justify-center">
												<span className="text-2xl font-serif text-white">
													AR
												</span>
											</div>
											<div className="absolute -bottom-2 -right-2 bg-slate-900 border border-border p-1.5 rounded-full">
												<ShieldCheck className="w-3 h-3 text-emerald-200 dark:text-emerald-100" />
											</div>
										</div>
										<h3 className="dark:text-white text-slate-800 font-semibold text-lg">
											Ashikur Rahman
										</h3>
										<p className="text-sm text-gray-500">@ashikur_r</p>
									</div>

									{/* Stats row */}
									<div className="grid grid-cols-3 gap-2">
										{[
											{ label: "Noor Streak", value: "28d", accent: true },
											{ label: "Deeds", value: "725", accent: false },
											{ label: "Points", value: "2.4k", accent: false },
										].map((s) => (
											<div
												key={s.label}
												className="text-center bg-white/70 dark:bg-white/[0.06] rounded-xl py-5 border border-gray-200/80 dark:border-white/[0.06]"
											>
												<p
													className={`text-base font-bold leading-none ${s.accent ? "text-amber-500 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}
												>
													{s.value}
												</p>
												<p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-none">
													{s.label}
												</p>
											</div>
										))}
									</div>

									{/* Amal Graph */}
									<div>
										<p className="text-[11px] font-semibold text-gray-500 dark:text-gray-300 mb-2 flex items-center gap-1.5">
											<Activity className="w-3.5 h-3.5 text-primary dark:text-emerald-custom" />
											Amal Graph
										</p>
										{/* 2 rows of heatmap cells */}
										<div className="flex flex-col gap-1 py-2.5">
											{[
												PROFILE_HEATMAP.slice(0, 18),
												PROFILE_HEATMAP.slice(18, 36),
											].map((row, ri) => (
												<div key={ri} className="flex gap-1">
													{row.map((level, i) => (
														<div
															key={i}
															className={`flex-1 h-3.5 rounded-[3px] ${LEVEL_CLASSES[level]}`}
														/>
													))}
												</div>
											))}
										</div>
									</div>

									{/* Recent deeds */}
									<div className="space-y-2">
										{[
											{ label: "Read Surah Al-Kahf", pts: 30 },
											{ label: "Hidden Sadaqah", pts: 5 },
										].map((d) => (
											<div
												key={d.label}
												className="flex items-center justify-between bg-white/60 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5"
											>
												<div className="flex items-center gap-2">
													<CheckCircle2 className="w-4 h-4 text-primary dark:text-emerald-custom shrink-0" />
													<span className="text-xs font-medium text-gray-800 dark:text-white">
														{d.label}
													</span>
												</div>
												<span className="text-xs font-mono font-bold text-primary dark:text-emerald-custom">
													+{d.pts}
												</span>
											</div>
										))}
									</div>

									{/* Home indicator */}
									<div className="flex justify-center pt-1">
										<div className="w-24 h-1 rounded-full bg-gray-400/40 dark:bg-white/20" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default ProfileSection;
