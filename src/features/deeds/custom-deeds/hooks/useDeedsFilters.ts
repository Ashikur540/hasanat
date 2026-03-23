import { useMemo, useState } from 'react';
import type { DeedCategoryFilter } from '@/features/deeds/constants';
import type { CustomDeed } from '@/features/deeds/types';
import type { SortOption, VisibilityFilter } from '@/features/deeds/custom-deeds/types';

interface UseDeedsFiltersOptions {
  deeds: CustomDeed[];
}

export function useDeedsFilters({ deeds }: UseDeedsFiltersOptions) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<DeedCategoryFilter>('All');
  const [visibility, setVisibility] = useState<VisibilityFilter>('all');
  const [sort, setSort] = useState<SortOption>('newest');

  const filtered = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return deeds
      .filter((deed) => category === 'All' || deed.category === category)
      .filter((deed) => visibility === 'all' || deed.visibility === visibility)
      .filter(
        (deed) =>
          !searchText ||
          deed.name.toLowerCase().includes(searchText) ||
          deed.description.toLowerCase().includes(searchText),
      )
      .sort((a, b) => {
        if (sort === 'newest') {
          return (b.createdAt?.toDate().getTime() ?? 0) - (a.createdAt?.toDate().getTime() ?? 0);
        }
        if (sort === 'oldest') {
          return (a.createdAt?.toDate().getTime() ?? 0) - (b.createdAt?.toDate().getTime() ?? 0);
        }
        if (sort === 'az') return a.name.localeCompare(b.name);
        if (sort === 'za') return b.name.localeCompare(a.name);
        if (sort === 'picked') return b.pickCount - a.pickCount;
        return 0;
      });
  }, [deeds, category, visibility, search, sort]);

  const isFiltered = category !== 'All' || visibility !== 'all' || search !== '';

  const resetFilters = () => {
    setCategory('All');
    setVisibility('all');
    setSearch('');
  };

  const filterKey = `${category}-${visibility}-${search}-${sort}`;

  return {
    search,
    setSearch,
    category,
    setCategory,
    visibility,
    setVisibility,
    sort,
    setSort,
    filtered,
    isFiltered,
    resetFilters,
    filterKey,
  };
}
