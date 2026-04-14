import { Link } from "react-router-dom";
import { Twitter, Instagram, Github, Linkedin } from "lucide-react";
import { AppLogo } from "@/common/icons/AppLogo";

const CURRENT_LINKS = [
	{ label: "Features", href: "#features" },
	{ label: "Spiritual Gap", href: "#spiritual-gap" },
	{ label: "Deeds Library", href: "#library" },
	{ label: "Leaderboard", href: "#leaderboard" },
	{ label: "Ramadan Mode", href: "/ramadan" },
	{ label: "Amal Graph", href: "#features" },
	{ label: "Profile Share", href: "#" },
];

const UPCOMING_LINKS = [
	{ label: "Deed City" },
	{ label: "Accountability Circles" },
	{ label: "Ramadan Mode" },
	{ label: "Bad Deed Tracker" },
	{ label: "Kaffara Calculator" },
];

const LEGAL_LINKS = [
	{ label: "Privacy Policy", href: "#" },
	{ label: "Terms of Service", href: "#" },
	{ label: "Fatwa & Guidelines", href: "#" },
];

const SOCIAL = [
	{ icon: Twitter, label: "Twitter", href: "https://x.com/AshikurRahamaan" },
	{
		icon: Linkedin,
		label: "Website",
		href: "https://www.linkedin.com/in/md-ashikurrahman/",
	},
	{
		icon: Github,
		label: "GitHub",
		href: "https://github.com/ashikur540",
	},
];

const LandingFooter = () => {
	return (
		<footer className="border-t border-border dark:border-white/[0.08] bg-background py-16 relative z-20">
			<div className="max-w-7xl mx-auto px-6 md:px-12">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
					{/* Brand column (span 2) */}
					<div className="sm:col-span-2">
						<Link to="/" className="flex items-center gap-2.5 mb-4 w-fit">
							<AppLogo className="h-9 w-9" />
							<span className="text-lg font-bold text-foreground dark:text-white">
								Hasanat
							</span>
						</Link>
						<p className="text-sm text-muted-foreground dark:text-gray-400 leading-relaxed max-w-xs mb-6">
							The spiritual productivity platform helping Muslims build
							consistency, track daily amal (good deeds), and inspire the Ummah.
						</p>
						{/* Social icons */}
						<div className="flex items-center gap-2">
							{SOCIAL.map(({ icon: Icon, label, href }) => (
								<a
									key={label}
									href={href}
									aria-label={label}
									className="w-9 h-9 rounded-full bg-secondary dark:bg-white/[0.08] border border-border dark:border-white/[0.08] hover:bg-muted dark:hover:bg-white/[0.12] transition-colors flex items-center justify-center text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white"
								>
									<Icon className="w-4 h-4" />
								</a>
							))}
						</div>
					</div>

					{/* Product links */}
					<div>
						<h4 className="text-sm font-semibold text-foreground dark:text-white mb-4">
							Product
						</h4>
						<ul className="space-y-3">
							{CURRENT_LINKS.map(({ label, href }) => (
								<li key={label}>
									<a
										href={href}
										className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors"
									>
										{label}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Upcoming features */}
					<div>
						<h4 className="text-sm font-semibold text-foreground dark:text-white mb-4">
							Coming Soon
						</h4>
						<ul className="space-y-3">
							{UPCOMING_LINKS.map(({ label }) => (
								<li key={label} className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground dark:text-gray-500">
										{label}
									</span>
									<span className="text-[10px] font-semibold bg-primary/10 dark:bg-emerald-custom/10 text-primary dark:text-emerald-custom px-1.5 py-0.5 rounded-full border border-primary/20 dark:border-emerald-custom/20 leading-none">
										Upcoming
									</span>
								</li>
							))}
						</ul>
					</div>

					{/* Legal links */}
					<div>
						<h4 className="text-sm font-semibold text-foreground dark:text-white mb-4">
							Legal & Privacy
						</h4>
						<ul className="space-y-3">
							{LEGAL_LINKS.map(({ label, href }) => (
								<li key={label}>
									<a
										href={href}
										className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors"
									>
										{label}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="border-t border-border dark:border-white/[0.08] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-xs text-muted-foreground dark:text-gray-500">
						© 2025 Hasanat / AmalTrack. All rights reserved.
					</p>
					<p className="text-xs text-muted-foreground dark:text-gray-500 italic text-center">
						Niyyah: We use this platform to build consistency with sincerity for Allah alone.
					</p>
					<p className="text-xs text-muted-foreground dark:text-gray-500 italic text-center">
						Points and streaks are for motivation only. The true reward is with Allah (SWT).
					</p>
				</div>
			</div>
		</footer>
	);
};

export default LandingFooter;
