import { AnimatePresence, motion } from 'framer-motion';
import type { CustomDeed } from '@/features/deeds/types';
import DeedsCard from '@/features/deeds/custom-deeds/components/DeedsCard';
import DeedsEmptyState from '@/features/deeds/custom-deeds/components/DeedsEmptyState';

interface DeedsGridProps {
  deeds: CustomDeed[];
  filterKey: string;
  isFiltered: boolean;
  onCreateClick: () => void;
  onEdit: (deed: CustomDeed) => void;
  onDelete: (deed: CustomDeed) => void;
}

const DeedsGrid = ({
  deeds,
  filterKey,
  isFiltered,
  onCreateClick,
  onEdit,
  onDelete,
}: DeedsGridProps) => (
  <AnimatePresence mode='wait'>
    <motion.div
      key={filterKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
    >
      {deeds.length === 0 ? (
        <DeedsEmptyState isFiltered={isFiltered} onCreateClick={onCreateClick} />
      ) : (
        deeds.map((deed, index) => (
          <motion.div
            key={deed.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.5) }}
          >
            <DeedsCard deed={deed} index={index} onEdit={onEdit} onDelete={onDelete} />
          </motion.div>
        ))
      )}
    </motion.div>
  </AnimatePresence>
);

export default DeedsGrid;
