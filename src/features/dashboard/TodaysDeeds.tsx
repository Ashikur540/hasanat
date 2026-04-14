import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import DeleteConfirmPopover from "@/common/components/DeleteConfirmPopover";
import { useTodayTodos } from "./hooks/useTodayTodos";
import AddDeedDialog from "./AddDeedDialog";
import type { ModalDeed } from "./types";

const difficultyColors: Record<string, string> = {
	easy: "text-emerald-500 dark:text-emerald-400",
	medium: "text-primary",
	hard: "text-orange-500 dark:text-orange-400",
	exceptional: "text-amber-500 dark:text-amber-400",
};

interface TodaysDeedsProps {
	autoCompleteSalah?: boolean;
}

const TodaysDeeds = ({ autoCompleteSalah = false }: TodaysDeedsProps) => {
	const { t } = useI18n();
	const [dialogOpen, setDialogOpen] = useState(false);

	const {
		todos,
		loading,
		completedCount,
		totalCount,
		addedDeedIds,
		addDeedToToday,
		toggleTodo,
		deleteTodo,
	} = useTodayTodos(autoCompleteSalah);

	const handleAddDeed = async (deeds: ModalDeed[]) => {
		for (const deed of deeds) {
			await addDeedToToday({
				deedId: deed.id,
				deedType: deed.deedType,
				name: deed.name,
				emoji: deed.emoji,
				category: deed.category,
				difficulty: deed.difficulty,
				points: deed.points,
			});
		}
		setDialogOpen(false);
	};

	return (
		<Card className="border-border bg-card">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-xl font-bold">
						{t("todaysDeedsTitle")}
					</CardTitle>
					<div className="flex items-center gap-3">
						{!loading && (
							<>
								<Progress
									value={
										totalCount > 0 ? (completedCount / totalCount) * 100 : 0
									}
									className="w-24 h-2"
								/>
								<span className="text-sm font-semibold text-muted-foreground">
									{completedCount}/{totalCount}
								</span>
							</>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-2 pt-0">
				{/* ── Loading skeletons ── */}
				{loading && (
					<div className="space-y-2">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				)}

				{/* ── All todos (mandatory + user-added) ── */}
				<AnimatePresence mode="popLayout">
					{todos.map((todo) => {
						const isMandatory = todo.isMandatory === true;

						return (
							<motion.div
								key={todo.id}
								layout
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20, height: 0 }}
								transition={{ duration: 0.25 }}
								onClick={() => !isMandatory && toggleTodo(todo)}
								className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
									isMandatory
										? todo.completed
											? "border-amber-400/40 bg-amber-50/60 dark:bg-amber-950/20"
											: "border-amber-300/30 bg-amber-50/30 dark:bg-amber-950/10"
										: `cursor-pointer group ${
												todo.completed
													? "border-primary/20 bg-primary/5"
													: "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
											}`
								}`}
							>
								<div onClick={(e) => e.stopPropagation()}>
									<Checkbox
										checked={todo.completed}
										disabled={isMandatory}
										onCheckedChange={() => toggleTodo(todo)}
										className={`h-5 w-5 rounded-md border-2 ${
											isMandatory ? "cursor-not-allowed opacity-80" : ""
										}`}
									/>
								</div>
								<span className="text-xl shrink-0">{todo.emoji}</span>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-1.5">
										<p
											className={`text-sm font-medium transition-colors ${
												todo.completed
													? "line-through text-muted-foreground"
													: "text-foreground"
											}`}
										>
											{todo.name}
										</p>
										{isMandatory && (
											<Badge
												variant="outline"
												className="text-[9px] px-1.5 py-0 border-amber-400/60 text-amber-600 dark:text-amber-400 shrink-0"
											>
												Mandatory
											</Badge>
										)}
									</div>
									<p className="text-xs text-muted-foreground/70">
										{isMandatory
											? todo.completed
												? "MashaAllah! All prayers done 🤲"
												: "The first thing accounted for on the Day of Judgment is Salah"
											: todo.category}
									</p>
								</div>
								<span
									className={`text-xs font-bold uppercase ${difficultyColors[todo.difficulty]}`}
								>
									{todo.difficulty}
								</span>
								{isMandatory ? (
									<div className="h-6 w-6 flex items-center justify-center opacity-30">
										<Lock className="h-3.5 w-3.5" />
									</div>
								) : (
									<div onClick={(e) => e.stopPropagation()}>
										<DeleteConfirmPopover
											trigger={
												<Button
													size="sm"
													variant="ghost"
													className="h-6 w-6 p-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-destructive/10"
												>
													<X className="h-3.5 w-3.5 text-destructive" />
												</Button>
											}
											title="Remove deed?"
											description={todo.name}
											confirmLabel="Remove"
											onConfirm={() => deleteTodo(todo)}
										/>
									</div>
								)}
							</motion.div>
						);
					})}
				</AnimatePresence>

				{/* ── Add Deed Dialog ── */}
				<AddDeedDialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					addedDeedIds={addedDeedIds}
					onAdd={handleAddDeed}
				/>
			</CardContent>
		</Card>
	);
};

export default TodaysDeeds;
