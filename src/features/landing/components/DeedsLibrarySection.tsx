import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Heart, Coins, Sun, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stagger } from "../animations";
import LandingDeedCard from "./LandingDeedCard";
import { useI18n } from "@/i18n/I18nProvider";

const DeedsLibrarySection = () => {
	const { t } = useI18n();

	const DEEDS = useMemo(() => [
		{
			icon: BookOpen,
			iconColorClass: "text-blue-700 dark:text-blue-400",
			iconBgClass: "bg-blue-100 dark:bg-blue-900/50",
			difficulty: "Hard" as const,
			title: t("libraryDeed1Title"),
			description: t("libraryDeed1Desc"),
			points: 30,
			hadithQuote: t("libraryDeed1Hadith"),
		},
		{
			icon: Heart,
			iconColorClass: "text-rose-700 dark:text-rose-400",
			iconBgClass: "bg-rose-100 dark:bg-rose-900/50",
			difficulty: "Medium" as const,
			title: t("libraryDeed2Title"),
			description: t("libraryDeed2Desc"),
			points: 15,
			hadithQuote: t("libraryDeed2Hadith"),
		},
		{
			icon: Coins,
			iconColorClass: "text-amber-700 dark:text-amber-400",
			iconBgClass: "bg-amber-100 dark:bg-amber-900/50",
			difficulty: "Easy" as const,
			title: t("libraryDeed3Title"),
			description: t("libraryDeed3Desc"),
			points: 5,
			hadithQuote: t("libraryDeed3Hadith"),
		},
		{
			icon: Sun,
			iconColorClass: "text-emerald-700 dark:text-emerald-400",
			iconBgClass: "bg-emerald-100 dark:bg-emerald-900/50",
			difficulty: "Exceptional" as const,
			title: t("libraryDeed4Title"),
			description: t("libraryDeed4Desc"),
			points: 100,
			hadithQuote: t("libraryDeed4Hadith"),
		},
	], [t]);

	return (
		<section
			id="library"
			aria-label="Deeds Library"
			className="py-24 relative z-20"
		>
			<div className="max-w-7xl mx-auto px-6 md:px-12">
				{/* Header */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
					<div className="max-w-2xl">
						{/* Label */}
						<div className="flex items-center gap-2 mb-4">
							<Library className="w-4 h-4 text-primary dark:text-emerald-custom" />
							<span className="text-sm font-bold tracking-widest text-primary dark:text-emerald-custom uppercase">
								{t("libraryBadge")}
							</span>
						</div>

						{/* Section title */}
						<h2 className="text-4xl md:text-5xl font-bold text-foreground dark:text-white leading-tight font-sans">
							{t("libraryHeading")}
						</h2>
						<p className="text-muted-foreground dark:text-gray-400 mt-4 text-base md:text-lg leading-relaxed">
							{t("libraryDesc")}
						</p>
					</div>

					<Button
						variant="outline"
						size="lg"
						asChild
						className="shrink-0 dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 rounded-full"
					>
						<Link to="/deeds">{t("libraryCTA")}</Link>
					</Button>
				</div>

				{/* Deed cards grid */}
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
					variants={stagger}
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
				>
					{DEEDS.map((deed) => (
						<LandingDeedCard key={deed.title} {...deed} />
					))}
				</motion.div>

				{/* Category note */}
				<motion.p
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="text-center text-sm text-muted-foreground dark:text-gray-500 mt-10"
				>
					{t("libraryCategories")}
				</motion.p>
			</div>
		</section>
	);
};

export default DeedsLibrarySection;
