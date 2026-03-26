import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => (
	<div className="min-h-screen bg-background">
		{/* Navbar skeleton */}
		<div className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/90 flex items-center px-6 gap-4">
			<Skeleton className="h-6 w-24" />
			<div className="flex-1" />
			<Skeleton className="h-8 w-8 rounded-full" />
			<Skeleton className="h-8 w-8 rounded-full" />
			<Skeleton className="h-8 w-8 rounded-full" />
		</div>

		<div className="container mx-auto px-4 pt-20 pb-6 space-y-6">
			{/* Page title */}
			<div className="space-y-2">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-8 w-56" />
				<Skeleton className="h-4 w-44" />
			</div>

			{/* Bento grid — mirrors the real dashboard layout */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Date widget */}
				<Skeleton className="h-36 rounded-xl" />
				{/* Prayer time widget */}
				<Skeleton className="h-36 rounded-xl" />
				{/* Farz checklist — spans 2 cols, 2 rows */}
				<Skeleton className="h-80 rounded-xl md:col-span-2 lg:col-span-2 lg:row-span-2" />
				{/* Hadith — spans 2 cols */}
				<Skeleton className="h-36 rounded-xl md:col-span-2 lg:col-span-2" />
				{/* Stats bar — full width */}
				<Skeleton className="h-24 rounded-xl md:col-span-2 lg:col-span-4" />
				{/* Today's deeds — spans 2 cols */}
				<Skeleton className="h-64 rounded-xl md:col-span-2 lg:col-span-2" />
				{/* Streak card */}
				<Skeleton className="h-64 rounded-xl md:col-span-2 lg:col-span-2" />
			</div>
		</div>
	</div>
);
