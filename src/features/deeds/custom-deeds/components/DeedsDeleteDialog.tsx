import DeleteConfirmDialog from "@/common/components/DeleteConfirmDialog";
import type { CustomDeed } from "@/features/deeds/types";
import { useI18n } from "@/i18n/I18nProvider";

interface DeedsDeleteDialogProps {
	deed: CustomDeed | null;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

const DeedsDeleteDialog = ({
	deed,
	onOpenChange,
	onConfirm,
}: DeedsDeleteDialogProps) => {
	const { t } = useI18n();

	return (
		<DeleteConfirmDialog
			open={!!deed}
			onOpenChange={onOpenChange}
			title={t("myDeedsDeleteTitle")}
			description={`"${deed?.name}" ${t("myDeedsDeleteDesc")}`}
			confirmLabel={t("myDeedsDeleteAction")}
			onConfirm={onConfirm}
		/>
	);
};

export default DeedsDeleteDialog;
