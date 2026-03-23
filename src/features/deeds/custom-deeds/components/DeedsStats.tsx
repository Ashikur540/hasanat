import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nProvider';

interface DeedsStatsProps {
  totalDeeds: number;
  publicCount: number;
  totalPicks: number;
}

const DeedsStats = ({ totalDeeds, publicCount, totalPicks }: DeedsStatsProps) => {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className='flex flex-wrap gap-3'
    >
      {[
        {
          icon: '✦',
          label: t('myDeedsStatTotal'),
          value: totalDeeds,
          accent: 'text-primary',
        },
        {
          icon: '🌍',
          label: t('myDeedsStatPublic'),
          value: publicCount,
          accent: 'text-sky-600',
        },
        {
          icon: '👥',
          label: t('myDeedsStatPicked'),
          value: totalPicks.toLocaleString(),
          accent: 'text-emerald-600',
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className='flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5'
        >
          <span className='text-base'>{stat.icon}</span>
          <div>
            <div className={cn('text-lg font-bold leading-none', stat.accent)}>{stat.value}</div>
            <div className='mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground'>
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default DeedsStats;
