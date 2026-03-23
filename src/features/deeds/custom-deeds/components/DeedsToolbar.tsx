import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import DeedsSearchBar from '@/features/deeds/components/DeedsSearchBar';
import DeedsCategoryFilter from '@/features/deeds/components/DeedsCategoryFilter';
import type { DeedCategoryFilter } from '@/features/deeds/constants';
import type { SortOption, VisibilityFilter } from '@/features/deeds/custom-deeds/types';
import { useI18n } from '@/i18n/I18nProvider';

interface DeedsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  visibility: VisibilityFilter;
  onVisibilityChange: (value: VisibilityFilter) => void;
  category: DeedCategoryFilter;
  onCategoryChange: (value: DeedCategoryFilter) => void;
}

const DeedsToolbar = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
  visibility,
  onVisibilityChange,
  category,
  onCategoryChange,
}: DeedsToolbarProps) => {
  const { t } = useI18n();

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: t('myDeedsSortNewest') },
    { value: 'oldest', label: t('myDeedsSortOldest') },
    { value: 'az', label: t('myDeedsSortAz') },
    { value: 'za', label: t('myDeedsSortZa') },
    { value: 'picked', label: t('myDeedsSortPicked') },
  ];

  const currentSortLabel =
    sortOptions.find((option) => option.value === sort)?.label ?? t('myDeedsSortLabel');

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap gap-2'>
        <div className='min-w-48 flex-1'>
          <DeedsSearchBar
            value={search}
            onChange={onSearchChange}
            placeholder={t('myDeedsSearchPlaceholder')}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='gap-2 font-medium'>
              <ArrowUpDown className='h-3.5 w-3.5 text-muted-foreground' />
              {currentSortLabel}
              <ChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-40'>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className='flex items-center justify-between'
              >
                {option.label}
                {sort === option.value && <Check className='h-3.5 w-3.5 text-primary' />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='flex items-center gap-1 rounded-lg bg-muted p-1'>
          {(
            [
              ['all', t('catAll')],
              ['public', `🌍 ${t('settingsPublic')}`],
              ['private', `🔒 ${t('settingsPrivate')}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type='button'
              onClick={() => onVisibilityChange(value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                visibility === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <DeedsCategoryFilter value={category} onChange={onCategoryChange} variant='pills' />
    </div>
  );
};

export default DeedsToolbar;
