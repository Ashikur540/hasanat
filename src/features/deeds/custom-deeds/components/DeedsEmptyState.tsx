import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';

interface DeedsEmptyStateProps {
  isFiltered: boolean;
  onCreateClick: () => void;
}

const DeedsEmptyState = ({ isFiltered, onCreateClick }: DeedsEmptyStateProps) => {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className='col-span-full'
    >
      <Card className='border-border'>
        <CardContent className='p-16 text-center'>
          <div className='mb-4 text-5xl'>{isFiltered ? '🔍' : '✨'}</div>
          <h3 className='mb-2 text-lg font-semibold text-foreground'>
            {isFiltered ? t('myDeedsEmptyFilteredTitle') : t('myDeedsEmptyDefaultTitle')}
          </h3>
          <p className='mx-auto mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground'>
            {isFiltered ? t('myDeedsEmptyFilteredDesc') : t('myDeedsEmptyDefaultDesc')}
          </p>
          {!isFiltered && (
            <Button onClick={onCreateClick} className='gap-2'>
              <Plus className='h-4 w-4' />
              {t('myDeedsCreateFirst')}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeedsEmptyState;
