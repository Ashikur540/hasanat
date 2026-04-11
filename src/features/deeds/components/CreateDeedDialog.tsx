import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Globe, Lock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	CATEGORY_INFO,
	DIFFICULTY_INFO,
	type DeedCategory,
	type DeedDifficulty,
} from "@/data/deeds";
import { useDeedMutation } from "@/features/deeds/hooks/useDeedMutation";
import type { CreatedCustomDeed } from "@/features/deeds/hooks/useDeedMutation";
import type { CustomDeed } from "@/features/deeds/types";

interface CreateDeedDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** When provided the dialog operates in edit mode */
	editDeed?: CustomDeed;
	onEditSuccess?: () => void;
	onCreateSuccess?: (
		createdDeed: CreatedCustomDeed,
		addToTodo: boolean,
	) => Promise<void> | void;
}

const CreateDeedDialog = ({
	open,
	onOpenChange,
	editDeed,
	onEditSuccess,
	onCreateSuccess,
}: CreateDeedDialogProps) => {
	const isEdit = !!editDeed;

	const [name, setName] = useState(editDeed?.name ?? "");
	const [category, setCategory] = useState<DeedCategory>(
		editDeed?.category ?? "Salah",
	);
	const [difficulty, setDifficulty] = useState<DeedDifficulty>(
		editDeed?.difficulty ?? "easy",
	);
	const [description, setDescription] = useState(editDeed?.description ?? "");
	const [hadith, setHadith] = useState(editDeed?.hadithReference ?? "");
	const [emoji, setEmoji] = useState(editDeed?.emoji ?? "✨");
	const [visibility, setVisibility] = useState<"public" | "private">(
		editDeed?.visibility ?? "public",
	);
	const [addToTodo, setAddToTodo] = useState(true);

	const { createCustomDeed, updateCustomDeed } = useDeedMutation();
	const isPending = isEdit
		? updateCustomDeed.isPending
		: createCustomDeed.isPending;

	const resetCreate = () => {
		setName("");
		setDescription("");
		setHadith("");
		setEmoji("✨");
		setVisibility("public");
		setAddToTodo(true);
	};

	const handleSubmit = () => {
		if (!name.trim()) return;

		if (isEdit && editDeed) {
			updateCustomDeed.mutate(
				{
					id: editDeed.id,
					name: name.trim(),
					emoji,
					category,
					description: description.trim(),
					hadithReference: hadith.trim(),
					visibility,
				},
				{
					onSuccess: () => {
						onOpenChange(false);
						onEditSuccess?.();
					},
				},
			);
		} else {
			createCustomDeed.mutate(
				{
					name: name.trim(),
					category,
					difficulty,
					basePoints: DIFFICULTY_INFO[difficulty].points,
					emoji,
					hadithReference: hadith.trim(),
					description: description.trim(),
					visibility,
				},
				{
					onSuccess: async (createdDeed) => {
						await onCreateSuccess?.(createdDeed, addToTodo);
						resetCreate();
						onOpenChange(false);
					},
				},
			);
		}
	};


	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-screen-md">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Deed" : "Create Custom Deed"}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Emoji + Name */}
					<div className="grid grid-cols-[60px_1fr] gap-3">
						<div className="space-y-1.5">
							<Label>Emoji</Label>
							<Input
								value={emoji}
								onChange={(e) => setEmoji(e.target.value)}
								className="text-center text-lg"
								maxLength={2}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Deed Name</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. Visit the sick"
								maxLength={60}
							/>
						</div>
					</div>

					{/* Category + Difficulty */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<div className="flex items-center h-5">
								<Label>Category</Label>
							</div>
							<Select
								value={category}
								onValueChange={(v) => setCategory(v as DeedCategory)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(Object.keys(CATEGORY_INFO) as DeedCategory[]).map((cat) => (
										<SelectItem key={cat} value={cat}>
											{CATEGORY_INFO[cat].emoji} {cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1.5">
							<div className="flex items-center gap-1.5 h-5">
								<Label>Difficulty</Label>
								<Tooltip>
									<TooltipTrigger asChild>
										<Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
									</TooltipTrigger>
									<TooltipContent>
										{isEdit
											? "Locked after creation to keep your history accurate."
											: "Sets the point value. Cannot be changed after creation."}
									</TooltipContent>
								</Tooltip>
							</div>
							<Select
								value={difficulty}
								onValueChange={(v) => setDifficulty(v as DeedDifficulty)}
								disabled={isEdit}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(Object.keys(DIFFICULTY_INFO) as DeedDifficulty[]).map((d) => (
										<SelectItem key={d} value={d}>
											{DIFFICULTY_INFO[d].label} (+{DIFFICULTY_INFO[d].points} pts)
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Description */}
					<div className="space-y-1.5">
						<Label>Description</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Brief description of the deed..."
							rows={2}
							maxLength={300}
						/>
					</div>

					{/* Hadith */}
					<div className="space-y-1.5">
						<Label>Hadith Reference (optional)</Label>
						<Input
							value={hadith}
							onChange={(e) => setHadith(e.target.value)}
							placeholder="e.g. Bukhari 1234"
							maxLength={100}
						/>
					</div>

					{/* Visibility */}
					<div className="space-y-1.5">
						<Label>Visibility</Label>
						<div className="grid grid-cols-2 gap-2">
							{(
								[
									{
										v: "public" as const,
										icon: Globe,
										title: "Public",
										sub: "Others can discover and pick this deed",
									},
									{
										v: "private" as const,
										icon: Lock,
										title: "Private",
										sub: "Only visible to you",
									},
								] as const
							).map((opt) => {
								const Icon = opt.icon;
								const selected = visibility === opt.v;
								return (
									<button
										key={opt.v}
										type="button"
										onClick={() => setVisibility(opt.v)}
										className={cn(
											"p-3 rounded-lg border text-left transition-all duration-150",
											selected
												? "border-primary bg-primary/5"
												: "border-border bg-background hover:border-primary/40",
										)}
									>
										<Icon
											className={cn(
												"h-4 w-4 mb-1",
												selected ? "text-primary" : "text-muted-foreground",
											)}
										/>
										<div
											className={cn(
												"text-xs font-semibold",
												selected ? "text-primary" : "text-foreground",
											)}
										>
											{opt.title}
										</div>
										<div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
											{opt.sub}
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Add to today's todo — create mode only */}
					{!isEdit && (
						<div className="flex items-center gap-2">
							<Checkbox
								id="addToTodo"
								checked={addToTodo}
								onCheckedChange={(v) => setAddToTodo(!!v)}
							/>
							<label
								htmlFor="addToTodo"
								className="text-sm font-medium text-foreground cursor-pointer"
							>
								Add to today's todo list
							</label>
							<Tooltip>
								<TooltipTrigger asChild>
									<Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
								</TooltipTrigger>
								<TooltipContent>
									Deed will appear in your dashboard checklist today
								</TooltipContent>
							</Tooltip>
						</div>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0.5">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!name.trim() || isPending}>
						{isPending ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
							</>
						) : isEdit ? (
							"Save Changes"
						) : (
							"Create Deed"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateDeedDialog;
