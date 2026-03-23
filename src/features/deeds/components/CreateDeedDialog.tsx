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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
	CATEGORY_INFO,
	DIFFICULTY_INFO,
	type DeedCategory,
	type DeedDifficulty,
} from "@/data/deeds";
import { useDeedMutation } from "@/features/deeds/hooks/useDeedMutation";

interface CreateDeedDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const CreateDeedDialog = ({ open, onOpenChange }: CreateDeedDialogProps) => {
	const [name, setName] = useState("");
	const [category, setCategory] = useState<DeedCategory>("Salah");
	const [difficulty, setDifficulty] = useState<DeedDifficulty>("easy");
	const [description, setDescription] = useState("");
	const [hadith, setHadith] = useState("");
	const [emoji, setEmoji] = useState("✨");

	const { createCustomDeed } = useDeedMutation();

	const handleSubmit = () => {
		if (!name.trim()) return;
		createCustomDeed.mutate(
			{
				name: name.trim(),
				category,
				difficulty,
				basePoints: DIFFICULTY_INFO[difficulty].points,
				emoji,
				hadithReference: hadith.trim(),
				description: description.trim(),
			},
			{
				onSuccess: () => {
					setName("");
					setDescription("");
					setHadith("");
					setEmoji("✨");
					onOpenChange(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Custom Deed</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
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
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label>Category</Label>
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
							<Label>Difficulty</Label>
							<Select
								value={difficulty}
								onValueChange={(v) => setDifficulty(v as DeedDifficulty)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(Object.keys(DIFFICULTY_INFO) as DeedDifficulty[]).map(
										(d) => (
											<SelectItem key={d} value={d}>
												{DIFFICULTY_INFO[d].label} (+{DIFFICULTY_INFO[d].points}
												pts)
											</SelectItem>
										),
									)}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="space-y-1.5">
						<Label>Description</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Brief description of the deed..."
							rows={2}
							maxLength={200}
						/>
					</div>
					<div className="space-y-1.5">
						<Label>Hadith Reference (optional)</Label>
						<Input
							value={hadith}
							onChange={(e) => setHadith(e.target.value)}
							placeholder="e.g. Bukhari 1234"
							maxLength={100}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={createCustomDeed.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!name.trim() || createCustomDeed.isPending}
					>
						{createCustomDeed.isPending ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
							</>
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
