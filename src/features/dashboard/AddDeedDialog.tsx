import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Plus, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_INFO } from "@/data/deeds";
import { useI18n } from "@/i18n/I18nProvider";
import { useAddDeedModal } from "./hooks/useAddDeedModal";
import type { ModalDeed } from "./types";

const CATEGORIES = [
	"Salah",
	"Quran",
	"Sadaqah",
	"Dhikr",
	"Character",
	"Family",
	"Fasting",
	"Knowledge",
] as const;

interface AddDeedDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	addedDeedIds: Set<string>;
	onAdd: (deeds: ModalDeed[]) => Promise<void>;
}

const AddDeedDialog = ({
	open,
	onOpenChange,
	addedDeedIds,
	onAdd,
}: AddDeedDialogProps) => {
	const { t } = useI18n();
	const [selectedDeeds, setSelectedDeeds] = useState<Map<string, ModalDeed>>(new Map());
	const [isAdding, setIsAdding] = useState(false);

	const {
		filteredDeeds,
		search,
		setSearch,
		filterCategory,
		setFilterCategory,
		isLoading: deedsLoading,
		DIFFICULTY_INFO,
	} = useAddDeedModal(addedDeedIds);

	const handleToggleDeed = useCallback((deed: ModalDeed) => {
		setSelectedDeeds((prev) => {
			const next = new Map(prev);
			const key = `${deed.deedType}-${deed.id}`;
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.set(key, deed);
			}
			return next;
		});
	}, []);

	const handleOpenChange = (open: boolean) => {
		if (!open) setSelectedDeeds(new Map());
		onOpenChange(open);
	};

	const handleAdd = async () => {
		if (selectedDeeds.size === 0) return;
		setIsAdding(true);
		try {
			await onAdd(Array.from(selectedDeeds.values()));
			setSelectedDeeds(new Map());
		} finally {
			setIsAdding(false);
		}
	};

	const selectionCount = selectedDeeds.size;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="w-full mt-2 gap-1.5 h-10 border-dashed"
				>
					<Plus className="h-4 w-4" /> {t("todaysDeedsAddDeed")}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-screen-md max-h-[85vh] flex flex-col overflow-hidden p-0">
				<div className="flex flex-col gap-4 p-6 pb-4">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Sparkles className="h-4 w-4 text-primary" />{" "}
							{t("todaysDeedsAddToToday")}
						</DialogTitle>
					</DialogHeader>

					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={t("todaysDeedsSearch")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Category filters */}
					<div className="flex flex-wrap gap-1.5">
						<Button
							variant={filterCategory === null ? "default" : "outline"}
							size="sm"
							className="h-7 text-xs rounded-full"
							onClick={() => setFilterCategory(null)}
						>
							{t("todaysDeedsAll")}
						</Button>
						{CATEGORIES.map((cat) => {
							const info = CATEGORY_INFO[cat];
							return (
								<Button
									key={cat}
									variant={filterCategory === cat ? "default" : "outline"}
									size="sm"
									className="h-7 text-xs rounded-full gap-1"
									onClick={() =>
										setFilterCategory(filterCategory === cat ? null : cat)
									}
								>
									{info.emoji} {cat}
								</Button>
							);
						})}
					</div>
				</div>

				{/* Deed list */}
				<div className="flex-1 min-h-0 overflow-y-auto px-6">
					<div className="space-y-1 pb-2">
						{deedsLoading ? (
							<div className="space-y-2 py-2">
								{[1, 2, 3, 4].map((i) => (
									<Skeleton key={i} className="h-12 w-full rounded-lg" />
								))}
							</div>
						) : filteredDeeds.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">
								{search
									? t("todaysDeedsNoMatch")
									: t("todaysDeedsAllAdded")}
							</p>
						) : (
							filteredDeeds.map((deed) => {
								const key = `${deed.deedType}-${deed.id}`;
								const isSelected = selectedDeeds.has(key);
								const diffInfo = DIFFICULTY_INFO[deed.difficulty];
								return (
									<motion.div
										key={key}
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors group cursor-pointer ${
											isSelected
												? "bg-primary/8 border border-primary/20"
												: "hover:bg-muted/50"
										}`}
										onClick={() => handleToggleDeed(deed)}
									>
										<span className="text-lg shrink-0 mt-0.5">{deed.emoji}</span>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-foreground break-words">
												{deed.name}
											</p>
											<p className="text-[11px] text-muted-foreground break-words line-clamp-2 mt-0.5">
												{deed.description}
												{deed.creatorDisplayName && (
													<span className="ml-1 text-primary/60">
														· by {deed.creatorDisplayName}
													</span>
												)}
											</p>
										</div>
										<Badge
											variant="outline"
											className={`text-[9px] px-1.5 py-0 shrink-0 mt-0.5 ${diffInfo.color}`}
										>
											{diffInfo.label}
										</Badge>
										<button
											type="button"
											className={`h-7 w-7 shrink-0 rounded-md flex items-center justify-center transition-all mt-0.5 ${
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-60 group-hover:opacity-100 hover:bg-primary/10"
											}`}
											onClick={(e) => {
												e.stopPropagation();
												handleToggleDeed(deed);
											}}
										>
											{isSelected ? (
												<Check className="h-3.5 w-3.5" />
											) : (
												<Plus className="h-4 w-4 text-primary" />
											)}
										</button>
									</motion.div>
								);
							})
						)}
					</div>
				</div>

				{/* Sticky footer — only visible when deeds are selected */}
				<AnimatePresence>
					{selectionCount > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 12 }}
							transition={{ duration: 0.18 }}
							className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-background"
						>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSelectedDeeds(new Map())}
								disabled={isAdding}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								className="gap-1.5 min-w-[100px]"
								onClick={handleAdd}
								disabled={isAdding}
							>
								{isAdding ? (
									"Adding…"
								) : (
									<>
										Add ({selectionCount})
									</>
								)}
							</Button>
						</motion.div>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
};

export default AddDeedDialog;
