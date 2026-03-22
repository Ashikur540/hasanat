import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, BookOpen, Filter, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
	CATEGORY_INFO,
	DIFFICULTY_INFO,
	type DeedCategory,
	type DeedDifficulty,
} from "@/data/deeds";
import { DeedCard, CreateDeedDialog, useDeedQuery } from "@/features/deeds";
import { useI18n } from "@/i18n/I18nProvider";

const ALL_CATEGORIES: (DeedCategory | "All")[] = [
	"All",
	"Salah",
	"Quran",
	"Sadaqah",
	"Dhikr",
	"Character",
	"Family",
	"Fasting",
	"Knowledge",
];
const ALL_DIFFICULTIES: (DeedDifficulty | "all")[] = [
	"all",
	"easy",
	"medium",
	"hard",
	"exceptional",
];

const PAGE_SIZE = 18;

const catKeyMap: Record<string, string> = {
	All: "catAll",
	Salah: "catSalah",
	Quran: "catQuran",
	Sadaqah: "catSadaqah",
	Dhikr: "catDhikr",
	Character: "catCharacter",
	Family: "catFamily",
	Fasting: "catFasting",
	Knowledge: "catKnowledge",
};

const Deeds = () => {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<DeedCategory | "All">("All");
	const [difficulty, setDifficulty] = useState<DeedDifficulty | "all">("all");
	const [createOpen, setCreateOpen] = useState(false);
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const { t } = useI18n();

	const { allDeeds, isLoading, isError } = useDeedQuery();

	// Reset pagination when filters change
	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [category, difficulty, search]);

	const filtered = useMemo(
		() =>
			allDeeds.filter((d) => {
				if (category !== "All" && d.category !== category) return false;
				if (difficulty !== "all" && d.difficulty !== difficulty) return false;
				if (
					search &&
					!d.name.toLowerCase().includes(search.toLowerCase()) &&
					!d.description.toLowerCase().includes(search.toLowerCase())
				)
					return false;
				return true;
			}),
		[allDeeds, category, difficulty, search],
	);

	const visible = filtered.slice(0, visibleCount);
	const hasMore = filtered.length > visibleCount;

	const filterKey = `${category}-${difficulty}-${search}`;

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
						onValueChange={(v) => setCategory(v as DeedCategory | "All")}
					>
						<TabsList className="h-auto flex-wrap">
							{ALL_CATEGORIES.map((cat) => (
								<TabsTrigger key={cat} value={cat} className="gap-1.5 text-xs">
									{cat !== "All" && <span>{CATEGORY_INFO[cat].emoji}</span>}
									{t(catKeyMap[cat] as any)}
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
							onClick={() => setDifficulty(d)}
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

			{isError && (
				<Card className="border-destructive/30 bg-destructive/5">
					<CardContent className="p-6 flex items-center gap-3 text-destructive">
						<AlertCircle className="h-5 w-5 shrink-0" />
						<p className="text-sm">Failed to load deeds. Please refresh the page.</p>
					</CardContent>
				</Card>
			)}

			{isLoading ? (
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<Card key={i} className="border-border bg-card">
							<CardContent className="p-5 space-y-3">
								<div className="flex items-start gap-3">
									<Skeleton className="h-8 w-8 rounded-md" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-3 w-full" />
										<Skeleton className="h-3 w-5/6" />
										<div className="flex gap-2 pt-1">
											<Skeleton className="h-5 w-16 rounded-full" />
											<Skeleton className="h-5 w-14 rounded-full" />
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
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
							<Button
								variant="outline"
								onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
								className="gap-2"
							>
								Load More
								<span className="text-xs text-muted-foreground">
									({filtered.length - visibleCount} remaining)
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
