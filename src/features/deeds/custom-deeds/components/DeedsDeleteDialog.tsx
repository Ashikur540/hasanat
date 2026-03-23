import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CustomDeed } from '@/features/deeds/types';
import { useI18n } from '@/i18n/I18nProvider';

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
    <AlertDialog open={!!deed} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('myDeedsDeleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            <strong className='text-foreground'>"{deed?.name}"</strong> {t('myDeedsDeleteDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('circlesCancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {t('myDeedsDeleteAction')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeedsDeleteDialog;
