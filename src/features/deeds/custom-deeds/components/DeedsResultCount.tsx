import { useI18n } from '@/i18n/I18nProvider';

interface DeedsResultCountProps {
  count: number;
  isFiltered: boolean;
  onClearFilters: () => void;
}

const DeedsResultCount = ({
  count,
  isFiltered,
  onClearFilters,
}: DeedsResultCountProps) => {
  const { t } = useI18n();

  return (
    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
      {t('deedShowing')} <strong className='text-foreground'>{count}</strong>{' '}
      {count === 1 ? t('deedDeed') : t('deedDeeds')}
      {isFiltered && (
        <button
          type='button'
          onClick={onClearFilters}
          className='ml-1 text-xs text-primary hover:underline'
        >
          · {t('myDeedsClearFilters')}
        </button>
      )}
    </div>
  );
};

export default DeedsResultCount;
