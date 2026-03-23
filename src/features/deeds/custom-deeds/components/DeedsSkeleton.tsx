import { Skeleton } from '@/components/ui/skeleton';

const DeedsSkeleton = () => (
  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
    {Array.from({ length: 6 }).map((_, index) => (
      <Skeleton key={index} className='h-48 rounded-xl' />
    ))}
  </div>
);

export default DeedsSkeleton;
