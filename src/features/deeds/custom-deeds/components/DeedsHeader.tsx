import { Sparkles, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';

interface DeedsHeaderProps {
  deedsCount: number;
  onCreateClick: () => void;
}

const DeedsHeader = ({ deedsCount, onCreateClick }: DeedsHeaderProps) => {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'
    >
      <div>
        <h1 className='flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl'>
          <Sparkles className='h-7 w-7 text-primary' />
          {t('myDeedsTitle')}
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          {deedsCount} {deedsCount === 1 ? t('deedDeed') : t('deedDeeds')} {t('myDeedsCreatedSuffix')}
        </p>
      </div>

      <Button className='gap-2 flex-shrink-0' onClick={onCreateClick}>
        <Plus className='h-4 w-4' />
        {t('myDeedsCreate')}
      </Button>
    </motion.div>
  );
};

export default DeedsHeader;
