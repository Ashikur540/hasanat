import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { LandingNav, HeroSection } from "@/features/landing";

// Below-fold sections — lazy-loaded so they don't block the initial paint
const SpiritualGapSection = lazy(
	() => import("@/features/landing/components/SpiritualGapSection")
);
const AmalGraphSection = lazy(
	() => import("@/features/landing/components/AmalGraphSection")
);
const DeedsLibrarySection = lazy(
	() => import("@/features/landing/components/DeedsLibrarySection")
);
const ProfileSection = lazy(
	() => import("@/features/landing/components/ProfileSection")
);
const LeaderboardSection = lazy(
	() => import("@/features/landing/components/LeaderboardSection")
);
const LandingFooter = lazy(
	() => import("@/features/landing/components/LandingFooter")
);

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
			<Helmet>
				<title>Hasanat — Track Your Amal | The GitHub for Good Deeds</title>
				<meta
					name="description"
					content="Hasanat (AmalTrack) helps Muslims track daily Islamic good deeds (amal), build streaks, and visualize spiritual growth with a GitHub-style Amal Graph. 80+ verified deeds with Quran and Hadith references."
				/>
				<meta name="robots" content="index, follow" />
				<link rel="canonical" href="https://hasanat.app/" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://hasanat.app/" />
				<meta property="og:title" content="Hasanat — Track Your Amal | The GitHub for Good Deeds" />
				<meta
					property="og:description"
					content="The GitHub for your spiritual life. Track daily amal (good deeds), visualize consistency with a 52-week Amal Graph, and inspire the Ummah with every action."
				/>
				<meta property="og:image" content="https://hasanat.app/og-image.png" />
				<meta property="og:image:width" content="1200" />
				<meta property="og:image:height" content="630" />
				<meta property="og:site_name" content="Hasanat" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@HasanatApp" />
				<meta name="twitter:title" content="Hasanat — Track Your Amal | The GitHub for Good Deeds" />
				<meta
					name="twitter:description"
					content="Track daily Islamic good deeds, build streaks, visualize your spiritual growth. 80+ verified deeds with Hadith references."
				/>
				<meta name="twitter:image" content="https://hasanat.app/og-image.png" />
				<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
			</Helmet>
			<div className="min-h-screen bg-background">
				<LandingNav />
				<main>
					{/* Above-fold — loaded eagerly */}
					<HeroSection />

					{/* Below-fold — lazy-loaded, defers parse/exec until needed */}
					<Suspense fallback={null}>
						<SpiritualGapSection />
						<AmalGraphSection />
						<DeedsLibrarySection />
						<ProfileSection />
						<LeaderboardSection />
					</Suspense>
				</main>
				<Suspense fallback={null}>
					<LandingFooter />
				</Suspense>
			</div>
		</>
	);
};

export default Index;
