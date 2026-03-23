import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DeedsListSkeleton = () => {
	return (
		<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{Array.from({ length: 6 }).map((_, i) => (
				<Card key={i} className="border-border bg-card">
					<CardContent className="p-5 space-y-3">
						<div className="flex items-start gap-3">
							<Skeleton className="h-8 w-8 rounded-md" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-full" />
								<Skeleton className="h-3 w-5/6" />
								<div className="flex gap-2 pt-1">
									<Skeleton className="h-5 w-16 rounded-full" />
									<Skeleton className="h-5 w-14 rounded-full" />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};
