import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { fadeUp, stagger } from "../animations";
import AmalGraphDemo from "./AmalGraphDemo";
import { useI18n } from "@/i18n/I18nProvider";

const LEVEL_CLASSES = [
	"bg-heatmap-0",
	"bg-heatmap-1",
	"bg-heatmap-2",
	"bg-heatmap-3",
	"bg-heatmap-4",
];

const AmalGraphSection = () => {
	const { t } = useI18n();

	const features = useMemo(() => [
		{ title: t("graphFeature1Title"), desc: t("graphFeature1Desc") },
		{ title: t("graphFeature2Title"), desc: t("graphFeature2Desc") },
		{ title: t("graphFeature3Title"), desc: t("graphFeature3Desc") },
	], [t]);

	return (
		<section
			id="features"
			aria-label="Amal Graph Feature"
			className="py-24 bg-secondary/20 dark:bg-black/20 relative z-20"
		>
			<div className="max-w-7xl mx-auto px-6 md:px-12">
				{/* Section header */}
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					variants={stagger}
					className="text-center mb-12"
				>
					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="inline-flex items-center gap-2 bg-primary/10 dark:bg-emerald-custom/10 text-primary dark:text-emerald-custom px-3 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/20 dark:border-emerald-custom/20"
					>
						<BarChart3 className="w-4 h-4" />
						{t("graphBadge")}
					</motion.div>

					<motion.h2
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground dark:text-white mb-4 font-serif"
					>
						{t("graphHeading")}{" "}
						<span className="text-primary dark:text-emerald-custom dark:drop-shadow-[0_0_10px_rgba(80,200,120,0.4)]">
							{t("graphHeadingHighlight")}
						</span>
					</motion.h2>

					<motion.p
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="text-muted-foreground dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto"
					>
						{t("graphSubtext")}
					</motion.p>
				</motion.div>

				{/* Heatmap demo card */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl border border-border dark:border-white/[0.08] shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] rounded-3xl p-6 md:p-10 relative overflow-hidden"
				>
					{/* Background glow */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 dark:bg-emerald-custom/10 rounded-full blur-[100px] pointer-events-none" />

					<div className="relative z-10">
						{/* Stats + legend row */}
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
							<div>
								<h3 className="text-lg md:text-xl font-semibold text-foreground dark:text-white">
									{t("graphStatsTitle")}
								</h3>
								<p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
									<span className="font-semibold text-primary dark:text-emerald-custom">
										1,245
									</span>{" "}
									{t("graphTotalDeeds")} ·{" "}
									<span className="font-semibold text-foreground dark:text-white">
										52
									</span>{" "}
									{t("graphWeeksOf")}
								</p>
							</div>
							{/* Color legend */}
							<div className="flex items-center gap-2">
								<span className="text-xs text-muted-foreground dark:text-gray-500">
									{t("graphLess")}
								</span>
								<div className="flex gap-1">
									{LEVEL_CLASSES.map((cls, i) => (
										<div
											key={i}
											className={`w-3.5 h-3.5 rounded-[3px] ${cls} ${i === 4 ? "dark:shadow-[0_0_6px_rgba(80,200,120,0.6)]" : ""}`}
										/>
									))}
								</div>
								<span className="text-xs text-muted-foreground dark:text-gray-500">
									{t("graphMore")}
								</span>
							</div>
						</div>

						<AmalGraphDemo />
					</div>
				</motion.div>

				{/* Feature bullets below heatmap */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
					{features.map((f) => (
						<motion.div
							key={f.title}
							initial={{ opacity: 0, y: 15 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{ duration: 0.4 }}
							className="bg-card/60 dark:bg-white/[0.03] border border-border dark:border-white/[0.06] rounded-2xl p-5"
						>
							<h4 className="font-semibold text-foreground dark:text-white mb-1.5">
								{f.title}
							</h4>
							<p className="text-sm text-muted-foreground dark:text-gray-400 leading-relaxed">
								{f.desc}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default AmalGraphSection;
