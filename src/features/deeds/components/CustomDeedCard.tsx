import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Pencil,
	Trash2,
	Globe,
	Lock,
	ChevronDown,
	ChevronUp,
	ListTodo,
	UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_INFO, DIFFICULTY_INFO } from "@/data/deeds";
import type { CustomDeed } from "@/features/deeds/types";

interface CustomDeedCardProps {
	deed: CustomDeed;
	index?: number;
	onEdit: (deed: CustomDeed) => void;
	onDelete: (deed: CustomDeed) => void;
}

const CustomDeedCard = ({
	deed,
	index = 0,
	onEdit,
	onDelete,
}: CustomDeedCardProps) => {
	const [expanded, setExpanded] = useState(false);
	const catInfo = CATEGORY_INFO[deed.category];
	const diffInfo = DIFFICULTY_INFO[deed.difficulty];

	const createdDate = deed.createdAt
		? deed.createdAt.toDate().toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: null;

	return (
		<Card
			className="border-border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden"
			style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
		>
			{/* Top accent bar */}
			<div className="h-[3px] bg-gradient-to-r from-primary to-primary/40" />

			<CardContent className="p-5">
				{/* Row 1: emoji + name + actions */}
				<div className="flex items-start gap-3 mb-3">
					<div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-xl flex-shrink-0">
						{deed.emoji}
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<h3 className="text-sm font-semibold text-foreground leading-tight">
								{deed.name}
							</h3>
							<div className="flex items-center gap-1 flex-shrink-0">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-muted-foreground hover:text-foreground"
											onClick={() => onEdit(deed)}
										>
											<Pencil className="h-3.5 w-3.5" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Edit deed</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-muted-foreground hover:text-destructive"
											onClick={() => onDelete(deed)}
										>
											<Trash2 className="h-3.5 w-3.5" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Remove deed</TooltipContent>
								</Tooltip>
							</div>
						</div>

						{/* Badges */}
						<div className="flex items-center gap-1.5 flex-wrap mt-1.5">
							<Badge
								variant="outline"
								className={cn("text-[10px] px-2 py-0", catInfo.color)}
							>
								{catInfo.emoji} {deed.category}
							</Badge>
							<Badge
								variant="outline"
								className={cn(
									"text-[10px] px-2 py-0 font-semibold",
									diffInfo.color,
								)}
							>
								{diffInfo.label}
							</Badge>
							<span className="text-xs font-bold text-primary">
								+{deed.basePoints} pts
							</span>
						</div>
					</div>
				</div>

				{/* Description */}
				{deed.description && (
					<p
						className={cn(
							"text-xs text-muted-foreground leading-relaxed mb-2 pl-14",
							!expanded && "line-clamp-2",
						)}
					>
						{deed.description}
					</p>
				)}

				{/* Hadith */}
				{deed.hadithReference && (
					<p className="text-[10px] text-muted-foreground italic pl-14 mb-2 flex items-start gap-1">
						<span className="flex-shrink-0">📖</span>
						<em>{deed.hadithReference}</em>
					</p>
				)}

				{/* Expand toggle (if description is long) */}
				{deed.description && deed.description.length > 80 && (
					<button
						type="button"
						onClick={() => setExpanded((v) => !v)}
						className="text-[10px] text-primary/70 hover:text-primary flex items-center gap-0.5 pl-14 mb-2"
					>
						{expanded ? (
							<>
								<ChevronUp className="h-3 w-3" /> Show less
							</>
						) : (
							<>
								<ChevronDown className="h-3 w-3" /> Show more
							</>
						)}
					</button>
				)}

				{/* Stats row */}
				<div className="flex items-center gap-4 pt-3 border-t border-border flex-wrap pl-14">
					<div className="flex items-center gap-1.5">
						<span className="text-sm">
							<ListTodo className="size-4" />
						</span>
						<span className="text-xs font-bold text-foreground">0</span>
						<span className="text-[10px] text-muted-foreground">
							Practiced by me
						</span>
					</div>
					{deed.visibility === "public" && (
						<div className="flex items-center gap-1.5">
							<span className="text-sm">
								<UsersRound className="size-4" />
							</span>
							<span className="text-xs font-bold text-foreground">
								{deed.pickCount.toLocaleString()}
							</span>
							<span className="text-[10px] text-muted-foreground">
								Practiced by others
							</span>
						</div>
					)}
					{createdDate && (
						<div className="ml-auto flex items-center gap-1.5">
							<Badge
								variant="outline"
								className={cn(
									"text-[10px] px-2 py-0 ml-auto",
									deed.visibility === "public"
										? "text-sky-600 border-sky-200 bg-sky-50"
										: "text-muted-foreground",
								)}
							>
								{deed.visibility === "public" ? (
									<>
										<Globe className="h-2.5 w-2.5 mr-1" />
										Public
									</>
								) : (
									<>
										<Lock className="h-2.5 w-2.5 mr-1" />
										Private
									</>
								)}
							</Badge>
							<span className="text-[10px] text-muted-foreground ml-auto">
								Created {createdDate}
							</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default CustomDeedCard;
