import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Globe,
  ListTodo,
  Lock,
  Pencil,
  Trash2,
  UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CATEGORY_INFO, DIFFICULTY_INFO } from '@/data/deeds';
import { cn } from '@/lib/utils';
import type { CustomDeed } from '@/features/deeds/types';
import { useI18n } from '@/i18n/I18nProvider';

interface DeedsCardProps {
  deed: CustomDeed;
  index?: number;
  onEdit: (deed: CustomDeed) => void;
  onDelete: (deed: CustomDeed) => void;
}

const DeedsCard = ({ deed, index = 0, onEdit, onDelete }: DeedsCardProps) => {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const categoryInfo = CATEGORY_INFO[deed.category];
  const difficultyInfo = DIFFICULTY_INFO[deed.difficulty];

  const createdDate = deed.createdAt
    ? deed.createdAt.toDate().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card
      className='overflow-hidden border-border bg-card transition-all duration-200 hover:shadow-lg'
      style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
    >
      <div className='h-[3px] bg-gradient-to-r from-primary to-primary/40' />

      <CardContent className='p-5'>
        <div className='mb-3 flex items-start gap-3'>
          <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 text-xl'>
            {deed.emoji}
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-2'>
              <h3 className='text-sm font-semibold leading-tight text-foreground'>{deed.name}</h3>
              <div className='flex flex-shrink-0 items-center gap-1'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-muted-foreground hover:text-foreground'
                      onClick={() => onEdit(deed)}
                    >
                      <Pencil className='h-3.5 w-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('myDeedsEditTooltip')}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-muted-foreground hover:text-destructive'
                      onClick={() => onDelete(deed)}
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('myDeedsRemoveTooltip')}</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
              <Badge variant='outline' className={cn('px-2 py-0 text-[10px]', categoryInfo.color)}>
                {categoryInfo.emoji} {deed.category}
              </Badge>
              <Badge
                variant='outline'
                className={cn('px-2 py-0 text-[10px] font-semibold', difficultyInfo.color)}
              >
                {difficultyInfo.label}
              </Badge>
              <span className='text-xs font-bold text-primary'>+{deed.basePoints} pts</span>
            </div>
          </div>
        </div>

        {deed.description && (
          <p
            className={cn(
              'mb-2 pl-14 text-xs leading-relaxed text-muted-foreground',
              !expanded && 'line-clamp-2',
            )}
          >
            {deed.description}
          </p>
        )}

        {deed.hadithReference && (
          <p className='mb-2 flex items-start gap-1 pl-14 text-[10px] italic text-muted-foreground'>
            <span className='flex-shrink-0'>📖</span>
            <em>{deed.hadithReference}</em>
          </p>
        )}

        {deed.description && deed.description.length > 80 && (
          <button
            type='button'
            onClick={() => setExpanded((value) => !value)}
            className='mb-2 flex items-center gap-0.5 pl-14 text-[10px] text-primary/70 hover:text-primary'
          >
            {expanded ? (
              <>
                <ChevronUp className='h-3 w-3' />
                {t('myDeedsShowLess')}
              </>
            ) : (
              <>
                <ChevronDown className='h-3 w-3' />
                {t('myDeedsShowMore')}
              </>
            )}
          </button>
        )}

        <div className='flex flex-wrap items-center gap-4 border-t border-border pt-3 pl-14'>
          <div className='flex items-center gap-1.5'>
            <span className='text-sm'>
              <ListTodo className='size-4' />
            </span>
            <span className='text-xs font-bold text-foreground'>0</span>
            <span className='text-[10px] text-muted-foreground'>{t('myDeedsPracticedByMe')}</span>
          </div>

          {deed.visibility === 'public' && (
            <div className='flex items-center gap-1.5'>
              <span className='text-sm'>
                <UsersRound className='size-4' />
              </span>
              <span className='text-xs font-bold text-foreground'>{deed.pickCount.toLocaleString()}</span>
              <span className='text-[10px] text-muted-foreground'>
                {t('myDeedsPracticedByOthers')}
              </span>
            </div>
          )}

          {createdDate && (
            <div className='ml-auto flex items-center gap-1.5'>
              <Badge
                variant='outline'
                className={cn(
                  'ml-auto px-2 py-0 text-[10px]',
                  deed.visibility === 'public'
                    ? 'border-sky-200 bg-sky-50 text-sky-600'
                    : 'text-muted-foreground',
                )}
              >
                {deed.visibility === 'public' ? (
                  <>
                    <Globe className='mr-1 h-2.5 w-2.5' />
                    {t('settingsPublic')}
                  </>
                ) : (
                  <>
                    <Lock className='mr-1 h-2.5 w-2.5' />
                    {t('settingsPrivate')}
                  </>
                )}
              </Badge>
              <span className='ml-auto text-[10px] text-muted-foreground'>
                {t('myDeedsCreatedOn')} {createdDate}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeedsCard;
