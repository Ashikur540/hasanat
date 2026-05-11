import { motion } from "framer-motion";
import { CloudFog, CalendarX, Eye, Activity } from "lucide-react";
import { fadeUp, stagger } from "../animations";
import { useI18n } from "@/i18n/I18nProvider";

const SpiritualGapSection = () => {
	const { t } = useI18n();
	const last5Days = [
		{ points: 8 },
		{ points: 18 },
		{ points: 24 },
		{ points: 35 },
		{ points: 42 },
	];

	return (
		<section
			id="spiritual-gap"
			aria-label="Spiritual Gap"
			className="py-24 relative z-20"
		>
			<div className="max-w-7xl mx-auto px-6 md:px-12">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					variants={stagger}
					className="text-center max-w-3xl mx-auto mb-14"
				>
					<motion.p
						variants={fadeUp}
						className="text-sm md:text-base tracking-[0.18em] uppercase font-semibold text-primary dark:text-emerald-custom"
					>
						{t("gapEyebrow")}
					</motion.p>
					<motion.h2
						variants={fadeUp}
						className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground dark:text-white font-sans"
					>
						{t("gapHeading")}
					</motion.h2>
					<motion.p
						variants={fadeUp}
						className="mt-5 md:text-lg text-muted-foreground dark:text-gray-400 leading-relaxed"
					>
						{t("gapSubtext")}
					</motion.p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.1 }}
					transition={{ duration: 0.5 }}
				>
					<div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border shadow-xl border-stone-200 dark:border-stone-800">
						{/* Left panel — problem */}
						<div className="p-8 md:p-10 relative group bg-stone-100/50 dark:bg-stone-900/40 dark:backdrop-blur-sm">
							<div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay" />
							<div className="relative z-10">
								<div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-6 bg-white border-stone-300 dark:bg-stone-800 dark:border-stone-700">
									<CloudFog className="w-6 h-6 text-stone-400 dark:text-stone-500" />
								</div>
								<h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight text-stone-700 dark:text-stone-300">
									{t("gapProblemTitle")}
								</h2>
								<p className="text-base leading-relaxed mb-6 text-stone-600 dark:text-stone-400">
									{t("gapProblemDesc")}
								</p>

								<ul className="space-y-2 mb-8 text-stone-600 dark:text-stone-400">
									{[
										t("gapProblemItem1"),
										t("gapProblemItem2"),
										t("gapProblemItem3"),
									].map((item) => (
										<li key={item} className="flex items-start gap-2 text-sm">
											<span className="text-red-500 mt-0.5">✗</span>
											<span>{item}</span>
										</li>
									))}
								</ul>

								<div className="border rounded-xl p-5 opacity-60 grayscale blur-[1px] group-hover:blur-none transition-all duration-500 border-stone-300 bg-stone-200/50 dark:border-stone-800 dark:bg-stone-950/50">
									<div className="flex items-center gap-3 mb-4 opacity-50">
										<CalendarX className="w-5 h-5 text-stone-400 dark:text-stone-500" />
										<span className="text-sm text-stone-400 dark:text-stone-500">
											{t("gapEmptyRecord")}
										</span>
									</div>
									<div className="flex gap-2">
										{[...Array(5)].map((_, i) => (
											<div
												key={`empty-cell-${i}`}
												className="w-6 h-6 rounded bg-stone-300 dark:bg-stone-800"
											/>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Right panel — solution */}
						<div className="p-8 md:p-10 relative overflow-hidden ring-1 ring-inset bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white ring-emerald-400/40 dark:from-[#0a1b14] dark:to-stone-900 dark:ring-emerald-500/30">
							<div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] bg-emerald-400/20 dark:bg-emerald-500/10" />
							<div className="relative z-10">
								<div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-6 shadow-lg bg-emerald-100 border-emerald-400/50 shadow-emerald-200/50 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:shadow-emerald-500/20">
									<Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
								</div>
								<h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight text-stone-800 dark:text-white">
									{t("gapSolutionTitle")}
								</h2>
								<p className="text-base leading-relaxed mb-6 text-stone-700 dark:text-stone-300">
									{t("gapSolutionDesc")}
								</p>

								<ul className="space-y-2 mb-8 text-stone-700 dark:text-stone-300">
									{[
										t("gapSolutionItem1"),
										t("gapSolutionItem2"),
										t("gapSolutionItem3"),
									].map((item) => (
										<li key={item} className="flex items-start gap-2 text-sm">
											<span className="mt-0.5 text-emerald-600 dark:text-emerald-400">
												✓
											</span>
											<span>{item}</span>
										</li>
									))}
								</ul>

								<div className="border rounded-xl p-5 backdrop-blur-md relative shadow-xl border-emerald-400/40 bg-white/90 shadow-emerald-300/30 dark:border-emerald-500/30 dark:bg-stone-900/80 dark:shadow-emerald-500/10">
									<div className="absolute -inset-0.5 rounded-xl blur opacity-50 bg-gradient-to-r from-emerald-400/0 via-emerald-400/30 to-emerald-400/0 dark:from-emerald-500/0 dark:via-emerald-500/20 dark:to-emerald-500/0" />
									<div className="relative flex items-center justify-between mb-4">
										<div className="flex items-center gap-3">
											<Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
											<span className="text-sm font-medium text-stone-800 dark:text-white">
												{t("gapConsistentAction")}
											</span>
										</div>
										<span className="text-xs px-2 py-1 rounded text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10">
											{t("gapLive")}
										</span>
									</div>
									<div className="flex gap-2">
										{last5Days.map((day, i) => {
											const opacity =
												day.points > 0
													? Math.min(day.points / 50 + 0.2, 1)
													: 0.1;
											return (
												<div
													key={`active-cell-${i}`}
													className="bg-emerald-600 dark:bg-emerald-500"
													style={{
														width: "24px",
														height: "24px",
														borderRadius: "4px",
														opacity,
														boxShadow:
															opacity > 0.6
																? "0 0 10px rgba(16, 185, 129, 0.5)"
																: "none",
													}}
												/>
											);
										})}
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

export default SpiritualGapSection;
