import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { motion } from "framer-motion";
import { useHadith } from "@/hooks/useHadith";
import { Skeleton } from "@/components/ui/skeleton";

const HadithWidget = () => {
	const { language } = useI18n();
	const { hadith, loading } = useHadith();
	const isBn = language === "bn";

	if (loading) {
		return (
			<Card className="border-border bg-card h-full relative overflow-hidden flex items-center justify-center">
				<div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
					<BookOpen className="w-32 h-32" />
				</div>
				<Skeleton className="w-full h-4 mb-2" />
				<Skeleton className="w-full h-4 mb-2" />
				<Skeleton className="w-3/4 h-4" />
			</Card>
		);
	}

	if (!hadith) {
		return (
			<Card className="border-border bg-card h-full relative overflow-hidden">
				<div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
					<BookOpen className="w-32 h-32" />
				</div>
				<CardHeader className="pb-3 relative z-10">
					<div className="flex items-center gap-2">
						<BookOpen className="h-4 w-4 text-primary" />
						<h3 className="text-sm font-bold text-foreground">
							{isBn ? "আজকের হাদিস" : "Hadith of the Day"}
						</h3>
					</div>
				</CardHeader>
				<CardContent className="relative z-10">
					<p className="text-sm text-muted-foreground">
						{isBn ? "হাদিস লোড করতে পারা যায়নি" : "Unable to load hadith"}
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-border bg-card h-full relative overflow-hidden">
			<div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
				<BookOpen className="w-32 h-32" />
			</div>
			<CardHeader className="pb-3 relative z-10">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<BookOpen className="h-4 w-4 text-primary" />
						<h3 className="text-sm font-bold text-foreground">
							{isBn ? "আজকের হাদিস" : "Hadith of the Day"}
						</h3>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4 relative z-10">
				{/* Arabic Text */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="text-center md:text-right"
				>
					<p className="font-arabic text-xl md:text-2xl leading-loose text-foreground">
						{hadith.arabic}
					</p>
				</motion.div>

				{/* Translation */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="border-t border-border pt-4 mt-2"
				>
					<div className="flex flex-col md:flex-row gap-4 items-center md:items-start text-center md:text-left">
						<p className="text-sm text-foreground/90 leading-relaxed flex-1 font-medium">
							"{hadith.en}"
						</p>
						<p className="text-sm text-muted-foreground leading-relaxed flex-1 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
							"{hadith.bn}"
						</p>
					</div>
				</motion.div>

				{/* Reference */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="text-center md:text-right"
				>
					<p className="text-xs text-primary/80 font-medium inline-block bg-primary/10 px-2 py-1 rounded-md mt-2">
						{hadith.reference}
					</p>
				</motion.div>
			</CardContent>
		</Card>
	);
};

export default HadithWidget;
