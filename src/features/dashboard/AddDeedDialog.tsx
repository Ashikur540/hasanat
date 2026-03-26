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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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
	onAdd: (deed: ModalDeed) => Promise<void>;
}

const AddDeedDialog = ({
	open,
	onOpenChange,
	addedDeedIds,
	onAdd,
}: AddDeedDialogProps) => {
	const { t } = useI18n();

	const {
		filteredDeeds,
		search,
		setSearch,
		filterCategory,
		setFilterCategory,
		isLoading: deedsLoading,
		DIFFICULTY_INFO,
	} = useAddDeedModal(addedDeedIds);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="w-full mt-2 gap-1.5 h-10 border-dashed"
				>
					<Plus className="h-4 w-4" /> {t("todaysDeedsAddDeed")}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-screen-md max-h-[85vh] flex flex-col overflow-hidden">
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

				{/* Deed list */}
				<ScrollArea className="h-[400px] -mx-1">
					<div className="space-y-1 px-1">
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
								const diffInfo = DIFFICULTY_INFO[deed.difficulty];
								return (
									<motion.div
										key={`${deed.deedType}-${deed.id}`}
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group overflow-hidden"
									>
										<span className="text-lg shrink-0">{deed.emoji}</span>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-foreground truncate">
												{deed.name}
											</p>
											<p className="text-[11px] text-muted-foreground truncate">
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
											className={`text-[9px] px-1.5 py-0 shrink-0 ${diffInfo.color}`}
										>
											{diffInfo.label}
										</Badge>
										<Button
											size="sm"
											variant="ghost"
											className="h-7 w-7 p-0 shrink-0 opacity-60 group-hover:opacity-100 hover:bg-primary/10"
											onClick={() => onAdd(deed)}
										>
											<Plus className="h-4 w-4 text-primary" />
										</Button>
									</motion.div>
								);
							})
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

export default AddDeedDialog;
