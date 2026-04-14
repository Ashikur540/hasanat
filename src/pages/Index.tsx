import {
	LandingNav,
	HeroSection,
	SpiritualGapSection,
	AmalGraphSection,
	DeedsLibrarySection,
	ProfileSection,
	LeaderboardSection,
	LandingFooter,
} from "@/features/landing";

const jsonLd = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "WebApplication",
			name: "Hasanat",
			alternateName: "AmalTrack",
			description:
				"A Muslim-first web app that transforms daily Islamic good deeds (amal) into a visible, living record of spiritual growth. Track hasanat, build streaks, explore 80+ verified deeds with Quran and Hadith references, and share your spiritual portfolio.",
			applicationCategory: "LifestyleApplication",
			operatingSystem: "Web",
			url: "https://hasanat.app",
			offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
			featureList: [
				"Daily Amal (good deed) tracking with checklist",
				"52-week Amal Graph heatmap — GitHub-style contribution graph for spiritual growth",
				"80+ verified Islamic deeds with authentic Quran and Hadith references",
				"Noor Streak — consecutive day tracking to maintain consistency",
				"Shareable spiritual portfolio at hasanat.app/@username",
				"Opt-in global leaderboard with full privacy controls",
				"Point system for motivation (Salah, Quran, Sadaqah, Dhikr, Character, Family, Fasting, Knowledge)",
			],
		},
		{
			"@type": "Organization",
			name: "Hasanat / AmalTrack",
			url: "https://hasanat.app",
			logo: "https://hasanat.app/favicon-96x96.png",
			description:
				"Building spiritual productivity tools for the Muslim Ummah — because every deed deserves to be remembered.",
		},
	],
};

const Index = () => {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className="min-h-screen bg-background">
				<LandingNav />
				<main>
					<HeroSection />

					<SpiritualGapSection />

					<AmalGraphSection />

					<DeedsLibrarySection />

					<ProfileSection />

					<LeaderboardSection />
				</main>
				<LandingFooter />
			</div>
		</>
	);
};

export default Index;
