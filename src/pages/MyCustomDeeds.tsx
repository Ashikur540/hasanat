import { useState } from 'react';
import { motion } from 'framer-motion';
import {
	CreateDeedDialog,
	useCustomDeedQuery,
	useDeedMutation,
	DeedsDeleteDialog,
	DeedsGrid,
	DeedsHeader,
	DeedsResultCount,
	DeedsSkeleton,
	DeedsStats,
	DeedsToolbar,
	useDeedsFilters,
	useDeedsStats,
} from '@/features/deeds';
import type { CustomDeed } from '@/features/deeds/types';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/i18n/I18nProvider';

const MyCustomDeeds = () => {
	const { t } = useI18n();
	const { toast } = useToast();
	const { data: deeds = [], isLoading } = useCustomDeedQuery();
	const { softDeleteCustomDeed } = useDeedMutation();

	const [createOpen, setCreateOpen] = useState(false);
	const [editDeed, setEditDeed] = useState<CustomDeed | null>(null);
	const [deleteDeed, setDeleteDeed] = useState<CustomDeed | null>(null);

	const {
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
	} = useDeedsFilters({ deeds });

	const { totalDeeds, publicCount, totalPicks } = useDeedsStats({ deeds });

	const handleDelete = () => {
		if (!deleteDeed) return;
		softDeleteCustomDeed.mutate(deleteDeed.id, {
			onSuccess: () => {
				toast({ title: t('myDeedsDeletedToast',).replace('{name}', deleteDeed.name) });
				setDeleteDeed(null);
			},
		});
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className='container mx-auto space-y-6 px-4 py-6'
		>
			<DeedsHeader deedsCount={totalDeeds} onCreateClick={() => setCreateOpen(true)} />

			{!isLoading && deeds.length > 0 && (
				<DeedsStats
					totalDeeds={totalDeeds}
					publicCount={publicCount}
					totalPicks={totalPicks}
				/>
			)}

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
			>
				<DeedsToolbar
					search={search}
					onSearchChange={setSearch}
					sort={sort}
					onSortChange={setSort}
					visibility={visibility}
					onVisibilityChange={setVisibility}
					category={category}
					onCategoryChange={setCategory}
				/>
			</motion.div>

			{!isLoading && filtered.length > 0 && (
				<DeedsResultCount
					count={filtered.length}
					isFiltered={isFiltered}
					onClearFilters={resetFilters}
				/>
			)}

			{isLoading ? (
				<DeedsSkeleton />
			) : (
				<DeedsGrid
					deeds={filtered}
					filterKey={filterKey}
					isFiltered={isFiltered}
					onCreateClick={() => setCreateOpen(true)}
					onEdit={setEditDeed}
					onDelete={setDeleteDeed}
				/>
			)}

			<CreateDeedDialog open={createOpen} onOpenChange={setCreateOpen} />

			{editDeed && (
				<CreateDeedDialog
					key={editDeed.id}
					open={!!editDeed}
					onOpenChange={(open) => !open && setEditDeed(null)}
					editDeed={editDeed}
					onEditSuccess={() => toast({ title: t('myDeedsUpdatedToast') })}
				/>
			)}

			<DeedsDeleteDialog
				deed={deleteDeed}
				onOpenChange={(open) => !open && setDeleteDeed(null)}
				onConfirm={handleDelete}
			/>
		</motion.div>
	);
};

export default MyCustomDeeds;
