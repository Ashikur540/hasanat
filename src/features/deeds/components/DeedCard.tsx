import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { CATEGORY_INFO, DIFFICULTY_INFO, type Deed } from "@/data/deeds";
import { motion } from "framer-motion";

interface DeedCardProps {
	deed: Deed;
	index?: number;
	onAddToTodo?: (deed: Deed) => void;
}

const DeedCard = ({ deed, index = 0, onAddToTodo }: DeedCardProps) => {
	const catInfo = CATEGORY_INFO[deed.category];
	const diffInfo = DIFFICULTY_INFO[deed.difficulty];

	return (
		<motion.div
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.6) }}
			whileHover={{ y: -4, transition: { duration: 0.2 } }}
		>
			<Card className="border-border bg-card hover:shadow-lg transition-shadow duration-200 group h-full relative">
				{/* Add to todo button — top-right corner */}
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={() => onAddToTodo?.(deed)}
							className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all duration-200 z-10"
						>
							<Plus className="h-3.5 w-3.5" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="left">Add to today's todo</TooltipContent>
				</Tooltip>

				<CardContent className="p-5">
					<div className="flex items-start gap-3">
						<span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-200">
							{deed.emoji}
						</span>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-1 flex-wrap">
								<h3 className="text-sm font-semibold text-foreground">
									{deed.name}
								</h3>
								{!deed.isPreset && (
									<Badge variant="outline" className="text-[10px] px-1.5 py-0">
										Custom
									</Badge>
								)}
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed mb-3">
								{deed.description}
							</p>
							<div className="flex items-center gap-2 flex-wrap">
								<Badge
									variant="outline"
									className={`text-[10px] px-2 py-0 ${catInfo.color}`}
								>
									{catInfo.emoji} {deed.category}
								</Badge>
								<Badge
									variant="outline"
									className={`text-[10px] px-2 py-0 font-semibold ${diffInfo.color}`}
								>
									{diffInfo.label}
								</Badge>
								<span className="text-xs font-bold text-primary ml-auto">
									+{deed.basePoints} pts
								</span>
							</div>
							{deed.hadithReference && (
								<p className="text-[10px] text-muted-foreground mt-2 italic">
									📜 {deed.hadithReference}
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default DeedCard;
