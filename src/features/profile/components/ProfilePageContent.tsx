import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import {
	Flame,
	Trophy,
	Heart,
	Star,
	Calendar,
	MapPin,
	Edit3,
	Share2,
	Eye,
	EyeOff,
	TrendingUp,
	Lock,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { countToLevel } from "@/lib/amalGraphCalculations";
import { ProfileCategoryList } from "./ProfileCategoryList";
import type { ProfileData } from "../types";
import {
	BADGES,
	HEATMAP_COLORS,
	HEATMAP_WEEKS,
	fadeUp,
	stagger,
} from "../constants";

interface ProfilePageContentProps {
	data: ProfileData;
	isOwner: boolean;
	activeTab: string;
	onActiveTabChange: (tab: string) => void;
	onEdit: () => void;
	onShare: () => void;
	t: (key: string) => string;
}

export function ProfilePageContent({
	data,
	isOwner,
	activeTab,
	onActiveTabChange,
	onEdit,
	onShare,
	t,
}: ProfilePageContentProps) {
	const today = new Date();
	const activityData = Array.from({ length: 49 }, (_, i) => {
		const date = format(subDays(today, 48 - i), "yyyy-MM-dd");
		return countToLevel(data.heatmapData[date] ?? 0);
	});

	const initials = data.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={stagger}
			className="container mx-auto px-4 py-6 space-y-6 max-w-2xl"
		>
			<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
				<Card className="border-border bg-card overflow-hidden">
					<div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/15" />
					<CardContent className="pt-0 pb-5 px-5 -mt-10">
						<div className="flex flex-col sm:flex-row sm:items-end gap-4">
							<Avatar className="h-20 w-20 border-4 border-card shadow-lg">
								{data.photoURL && (
									<AvatarImage src={data.photoURL} alt={data.name} />
								)}
								<AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0 sm:pb-1">
								<div className="flex items-center gap-2 flex-wrap">
									<h1 className="text-xl font-bold text-foreground">
										{data.name}
									</h1>
									<Badge variant="outline" className="text-primary text-[10px]">
										{data.level}
									</Badge>
									{data.isPublic ? (
										<Eye className="h-3.5 w-3.5 text-muted-foreground" />
									) : (
										<EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
									)}
								</div>
								<p className="text-sm text-muted-foreground mt-0.5">
									{data.bio}
								</p>
								<div className="flex gap-3 text-xs text-muted-foreground mt-1.5">
									<span className="flex items-center gap-1">
										<MapPin className="h-3 w-3" />
										{data.location}
									</span>
									<span className="flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										{t("profileJoined")} {data.createdAt}
									</span>
								</div>
							</div>
							{isOwner && (
								<div className="flex gap-2 sm:pb-1">
									<Button
										variant="outline"
										size="sm"
										className="gap-1.5 h-8 text-xs"
										onClick={onEdit}
									>
										<Edit3 className="h-3.5 w-3.5" /> {t("profileEdit")}
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="gap-1.5 h-8 text-xs"
										onClick={onShare}
									>
										<Share2 className="h-3.5 w-3.5" /> {t("profileShare")}
									</Button>
								</div>
							)}
						</div>
						<div className="grid grid-cols-4 gap-3 mt-5">
							{[
								{
									label: t("profileTotalDeeds"),
									value: data.totalDeeds,
									icon: Star,
									color: "text-primary",
								},
								{
									label: t("profilePoints"),
									value: data.totalPoints.toLocaleString(),
									icon: Trophy,
									color: "text-accent",
									tooltip: t("profilePointsDisclaimer"),
								},
								{
									label: t("profileStreak"),
									value: `${data.currentStreak}d`,
									icon: Flame,
									color: "text-orange-500",
								},
								{
									label: t("profileRank"),
									value: data.rank ? `#${data.rank}` : "—",
									icon: TrendingUp,
									color: "text-primary",
								},
							].map(({ label, value, icon: Icon, color, tooltip }) => (
								<TooltipProvider key={label}>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="text-center p-2.5 rounded-lg bg-muted/50">
												<Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
												<p className="text-lg font-bold text-foreground">
													{value}
												</p>
												<p className="text-[10px] text-muted-foreground">
													{label}
												</p>
											</div>
										</TooltipTrigger>
										{tooltip && (
											<TooltipContent className="max-w-xs">
												<p className="text-xs">{tooltip}</p>
											</TooltipContent>
										)}
									</Tooltip>
								</TooltipProvider>
							))}
						</div>
					</CardContent>
				</Card>
			</motion.div>

			<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
				<Tabs value={activeTab} onValueChange={onActiveTabChange}>
					<TabsList className="w-full grid grid-cols-3">
						<TabsTrigger value="overview">{t("profileOverview")}</TabsTrigger>
						<TabsTrigger value="badges">{t("profileBadges")}</TabsTrigger>
						<TabsTrigger value="activity">{t("profileActivity")}</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4 mt-4">
						<ProfileCategoryList categoryBreakdown={data.categoryBreakdown} />
						<Card className="border-border bg-card">
							<CardContent className="p-5">
								<div className="grid grid-cols-2 gap-4">
									<div className="text-center p-4 rounded-lg bg-accent/10">
										<Flame className="h-6 w-6 mx-auto text-accent mb-1" />
										<p className="text-2xl font-bold text-foreground">
											{data.currentStreak}
										</p>
										<p className="text-xs text-muted-foreground">
											{t("profileCurrentStreak")}
										</p>
									</div>
									<div className="text-center p-4 rounded-lg bg-primary/10">
										<Trophy className="h-6 w-6 mx-auto text-primary mb-1" />
										<p className="text-2xl font-bold text-foreground">
											{data.longestStreak}
										</p>
										<p className="text-xs text-muted-foreground">
											{t("profileLongestStreak")}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="badges" className="mt-4">
						<Card className="border-border bg-card relative">
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									{BADGES.filter((badge) => badge.earned).length}/
									{BADGES.length} {t("profileEarned")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									{BADGES.map((badge) => (
										<motion.div
											key={badge.name}
											whileHover={{ scale: 1.05 }}
											className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${badge.earned ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30 opacity-50"}`}
										>
											<span
												className={`text-2xl ${!badge.earned && "grayscale"}`}
											>
												{badge.emoji}
											</span>
											<p className="text-[11px] font-semibold text-foreground text-center leading-tight">
												{badge.name}
											</p>
											<p className="text-[9px] text-muted-foreground text-center">
												{badge.desc}
											</p>
											{badge.earned && (
												<Badge
													variant="outline"
													className="text-[8px] border-primary/40 text-primary px-1.5"
												>
													{t("profileEarned")}
												</Badge>
											)}
										</motion.div>
									))}
								</div>
							</CardContent>
							<div className="absolute inset-0 bg-background/80 backdrop-blur-0 flex items-center justify-center z-10 rounded-lg">
								<div className="text-center space-y-2 p-4">
									<Lock className="h-10 w-10 mx-auto text-muted-foreground" />
									<h3 className="text-lg font-bold text-foreground">
										{t("profileBadgesComingSoon")}
									</h3>
									<p className="text-sm text-muted-foreground">
										{t("profileBadgesComingSoonDesc")}
									</p>
								</div>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="activity" className="mt-4">
						<Card className="border-border bg-card">
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
									<Heart className="h-4 w-4" />{" "}
									{t("profileActivityWeeks").replace(
										"{weeks}",
										String(HEATMAP_WEEKS),
									)}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex gap-1 justify-center">
									{Array.from({ length: HEATMAP_WEEKS }).map((_, week) => (
										<div key={week} className="flex flex-col gap-1">
											{Array.from({ length: 7 }).map((_, day) => {
												const idx = week * 7 + day;
												const level = activityData[idx] || 0;
												return (
													<motion.div
														key={day}
														initial={{ opacity: 0, scale: 0 }}
														animate={{ opacity: 1, scale: 1 }}
														transition={{ delay: idx * 0.008 }}
														className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${HEATMAP_COLORS[level]}`}
														title={`${data.heatmapData[format(subDays(today, 48 - idx), "yyyy-MM-dd")] ?? 0} ${t("deedDeeds")}`}
													/>
												);
											})}
										</div>
									))}
								</div>
								<div className="flex items-center justify-center gap-1.5 mt-3">
									<span className="text-[10px] text-muted-foreground">
										{t("profileLess")}
									</span>
									{HEATMAP_COLORS.map((color, index) => (
										<div
											key={index}
											className={`w-3 h-3 rounded-sm ${color}`}
										/>
									))}
									<span className="text-[10px] text-muted-foreground">
										{t("profileMore")}
									</span>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</motion.div>

			<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
				<Card className="border-border bg-card">
					<CardContent className="p-5 text-center">
						<p className="text-sm text-foreground italic leading-relaxed">
							"{t("profileQuote")}"
						</p>
						<p className="text-xs text-muted-foreground mt-2">
							{t("profileQuoteRef")}
						</p>
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	);
}
