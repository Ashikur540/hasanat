import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth";
import { useI18n } from "@/i18n/I18nProvider";
import {
	EditProfileDialog,
	ProfilePageContent,
	ShareProfileDialog,
	useProfileData,
} from "@/features/profile";

const Profile = () => {
	const { userId: paramUserId } = useParams<{ userId: string }>();
	const { user } = useAuth();
	const targetUserId = paramUserId ?? user?.uid ?? "";
	const isOwner = !paramUserId || paramUserId === user?.uid;
	const { data, loading, error } = useProfileData(targetUserId);
	const [activeTab, setActiveTab] = useState("overview");
	const [editOpen, setEditOpen] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);
	const { t } = useI18n();

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
				<Card className="border-border bg-card overflow-hidden">
					<div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/15" />
					<CardContent className="pt-0 pb-5 px-5 -mt-10">
						<div className="flex flex-col sm:flex-row sm:items-end gap-4">
							<Skeleton className="h-20 w-20 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-6 w-40" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-3 w-32" />
							</div>
						</div>
						<div className="grid grid-cols-4 gap-3 mt-5">
							{[1, 2, 3, 4].map((index) => (
								<Skeleton key={index} className="h-20 rounded-lg" />
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="container mx-auto px-4 py-6 max-w-2xl">
				<Card className="border-border bg-card">
					<CardContent className="p-8 text-center">
						<p className="text-muted-foreground">
							{error ? "Failed to load profile" : "User not found"}
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<>
			<ProfilePageContent
				data={data}
				isOwner={isOwner}
				isPrivateView={!data.isPublic && !isOwner}
				activeTab={activeTab}
				onActiveTabChange={setActiveTab}
				onEdit={() => setEditOpen(true)}
				onShare={() => setShareOpen(true)}
				t={t}
			/>
			<EditProfileDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				profile={{
					name: data.name,
					bio: data.bio,
					location: data.location,
					isPublic: data.isPublic,
				}}
				onSave={() => {}}
			/>
			<ShareProfileDialog
				open={shareOpen}
				onOpenChange={setShareOpen}
				profileUserId={targetUserId}
				profileName={data.name}
				stats={{
					totalDeeds: data.totalDeeds,
					currentStreak: data.currentStreak,
					level: data.level,
				}}
				heatmapData={data.heatmapData}
				photoURL={data.photoURL}
			/>
		</>
	);
};

export default Profile;
