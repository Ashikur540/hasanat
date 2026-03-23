import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, BookOpen, Filter, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_INFO, DIFFICULTY_INFO } from "@/data/deeds";
import {
	ALL_CATEGORIES,
	ALL_DIFFICULTIES,
	categoryTranslationKeyMap,
	DeedCard,
	CreateDeedDialog,
	useDeedFilters,
	useDeedQuery,
} from "@/features/deeds";
import { useI18n } from "@/i18n/I18nProvider";
import { DeedsListSkeleton } from "@/features/deeds/components/DeedsListSkeleton";

const Deeds = () => {
	const [createOpen, setCreateOpen] = useState(false);
	const { t } = useI18n();

	const { allDeeds, isLoading, isError } = useDeedQuery();
	const {
		search,
		setSearch,
		category,
		setCategory,
		difficulty,
		setDifficulty,
		filtered,
		visible,
		hasMore,
		remainingCount,
		filterKey,
		loadMore,
	} = useDeedFilters({ deeds: allDeeds });

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="container mx-auto px-4 py-6 space-y-6"
		>
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
			>
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
						<BookOpen className="h-7 w-7 text-primary" /> {t("deedLibrary")}
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						{allDeeds.length} {t("deedLibraryDesc")}
					</p>
				</div>
				<Button className="gap-2" onClick={() => setCreateOpen(true)}>
					<Plus className="h-4 w-4" /> {t("deedCreateCustom")}
				</Button>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
				className="space-y-4"
			>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={t("deedSearchPlaceholder")}
						className="pl-10"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className="overflow-x-auto">
					<Tabs
						value={category}
						onValueChange={(v) => setCategory(v as typeof category)}
					>
						<TabsList className="h-auto flex-wrap">
							{ALL_CATEGORIES.map((cat) => (
								<TabsTrigger key={cat} value={cat} className="gap-1.5 text-xs">
									{cat !== "All" && <span>{CATEGORY_INFO[cat].emoji}</span>}
									{t(categoryTranslationKeyMap[cat])}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<span className="text-xs text-muted-foreground mr-1">
						{t("deedDifficulty")}
					</span>
					{ALL_DIFFICULTIES.map((d) => (
						<Button
							key={d}
							variant={difficulty === d ? "default" : "outline"}
							size="sm"
							className="h-7 text-xs"
							onClick={() => setDifficulty(d as typeof difficulty)}
						>
							{d === "all" ? t("catAll") : DIFFICULTY_INFO[d].label}
							{d !== "all" && (
								<span className="ml-1 opacity-60">
									+{DIFFICULTY_INFO[d].points}
								</span>
							)}
						</Button>
					))}
				</div>
			</motion.div>

			{!isLoading && !isError && (
				<motion.div
					key={filterKey + "-count"}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.2 }}
					className="text-sm text-muted-foreground"
				>
					{t("deedShowing")} {filtered.length}{" "}
					{filtered.length !== 1 ? t("deedDeeds") : t("deedDeed")}
				</motion.div>
			)}

			{isLoading ? (
				<DeedsListSkeleton />
			) : (
				<>
					<AnimatePresence mode="wait">
						<motion.div
							key={filterKey}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
						>
							{visible.map((deed, i) => (
								<DeedCard key={deed.id} deed={deed} index={i} />
							))}
						</motion.div>
					</AnimatePresence>

					{hasMore && (
						<div className="flex justify-center pt-2">
							<Button variant="outline" onClick={loadMore} className="gap-2">
								Load More
								<span className="text-xs text-muted-foreground">
									({remainingCount} remaining)
								</span>
							</Button>
						</div>
					)}

					{!isLoading && filtered.length === 0 && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.3 }}
						>
							<Card className="border-border bg-card">
								<CardContent className="p-10 text-center">
									<p className="text-muted-foreground">{t("deedNoMatch")}</p>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</>
			)}

			<CreateDeedDialog open={createOpen} onOpenChange={setCreateOpen} />
		</motion.div>
	);
};

export default Deeds;
