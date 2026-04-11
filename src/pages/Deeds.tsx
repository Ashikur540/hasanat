import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
	DeedCard,
	CreateDeedDialog,
	useDeedFilters,
	useDeedQuery,
	mapDeedToTodayTodoInput,
	type CreatedCustomDeed,
} from "@/features/deeds";
import { useTodayTodos } from "@/features/dashboard";
import DeedsSearchBar from "@/features/deeds/components/DeedsSearchBar";
import DeedsCategoryFilter from "@/features/deeds/components/DeedsCategoryFilter";
import DeedsDifficultyFilter from "@/features/deeds/components/DeedsDifficultyFilter";
import { useI18n } from "@/i18n/I18nProvider";
import { DeedsListSkeleton } from "@/features/deeds/components/DeedsListSkeleton";
import type { Deed } from "@/data/deeds";

const Deeds = () => {
	const [createOpen, setCreateOpen] = useState(false);
	const { t } = useI18n();
	const { addDeedToToday } = useTodayTodos();

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

	const handleAddFromDeedCard = async (deed: Deed) => {
		await addDeedToToday(mapDeedToTodayTodoInput(deed));
	};

	const handleCreatedDeed = async (
		createdDeed: CreatedCustomDeed,
		addToTodo: boolean,
	) => {
		if (!addToTodo) return;

		await addDeedToToday(
			mapDeedToTodayTodoInput({ ...createdDeed, deedType: "custom" }),
		);
	};

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
				<DeedsSearchBar
					value={search}
					onChange={setSearch}
					placeholder={t("deedSearchPlaceholder")}
				/>
				<DeedsCategoryFilter
					value={category}
					onChange={setCategory}
					variant="tabs"
				/>
				<DeedsDifficultyFilter value={difficulty} onChange={setDifficulty} />
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

			{isError && (
				<Card className="border-destructive/50 bg-destructive/5">
					<CardContent className="p-6 flex items-center gap-3 text-destructive">
						<AlertCircle className="h-5 w-5" />
						<span className="text-sm">Failed to load deeds. Please refresh.</span>
					</CardContent>
				</Card>
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
								<DeedCard
									key={deed.id}
									deed={deed}
									index={i}
									onAddToTodo={handleAddFromDeedCard}
								/>
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

			<CreateDeedDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				onCreateSuccess={handleCreatedDeed}
			/>
		</motion.div>
	);
};

export default Deeds;
