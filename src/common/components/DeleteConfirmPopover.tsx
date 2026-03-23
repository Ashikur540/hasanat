import { useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface DeleteConfirmPopoverProps {
	trigger: React.ReactNode;
	title?: string;
	description?: string;
	confirmLabel?: string;
	onConfirm: () => void;
	onOpenChange?: (open: boolean) => void;
}

const DeleteConfirmPopover = ({
	trigger,
	title = "Remove this?",
	description,
	confirmLabel = "Remove",
	onConfirm,
	onOpenChange,
}: DeleteConfirmPopoverProps) => {
	const [open, setOpen] = useState(false);

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		onOpenChange?.(next);
	};

	const handleConfirm = () => {
		onConfirm();
		setOpen(false);
	};

	const handleCancel = () => {
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>
			<PopoverContent className="w-56 p-3" align="end">
				<p className="text-sm font-medium leading-snug">{title}</p>
				{description && (
					<p className="mt-0.5 text-xs text-muted-foreground truncate">
						{description}
					</p>
				)}
				<div className="mt-3 flex gap-2">
					<Button
						size="sm"
						variant="ghost"
						className="h-7 flex-1 text-xs"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						variant="destructive"
						className="h-7 flex-1 text-xs"
						onClick={handleConfirm}
					>
						{confirmLabel}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default DeleteConfirmPopover;
