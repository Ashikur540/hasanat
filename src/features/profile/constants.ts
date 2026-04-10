export const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

export const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.07 } },
};

export const HEATMAP_WEEKS = 7;

export const HEATMAP_COLORS = [
	"bg-muted",
	"bg-primary/20",
	"bg-primary/40",
	"bg-primary/60",
	"bg-primary",
];

export interface ProfileBadge {
	name: string;
	emoji: string;
	desc: string;
	earned: boolean;
}

export const BADGES: ProfileBadge[] = [
	{
		name: "First Light",
		emoji: "🌅",
		desc: "Complete your first deed",
		earned: true,
	},
	{ name: "Week Warrior", emoji: "⚔️", desc: "7-day streak", earned: true },
	{
		name: "Quran Companion",
		emoji: "📖",
		desc: "Read Quran 30 days",
		earned: true,
	},
	{
		name: "Generous Soul",
		emoji: "💎",
		desc: "50 Sadaqah deeds",
		earned: false,
	},
	{
		name: "Night Owl",
		emoji: "🦉",
		desc: "20 Tahajjud prayers",
		earned: false,
	},
	{
		name: "Community Builder",
		emoji: "🏗️",
		desc: "Join 3 circles",
		earned: true,
	},
	{
		name: "Ramadan Champion",
		emoji: "🌙",
		desc: "Complete Ramadan challenge",
		earned: false,
	},
	{ name: "Century Club", emoji: "💯", desc: "100-day streak", earned: false },
];
