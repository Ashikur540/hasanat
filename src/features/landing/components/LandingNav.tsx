import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/common/icons/AppLogo";
import { useAuth } from "@/features/auth";

const NAV_LINKS = [
	{ label: "Features", href: "#features" },
	{ label: "Deeds Library", href: "#library" },
	{ label: "Leaderboard", href: "#leaderboard" },
];

const LandingNav = () => {
	const [scrolled, setScrolled] = useState(false);
	const { theme, setTheme } = useTheme();
	const { user } = useAuth();

	const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<motion.nav
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.4 }}
			className={[
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-x-0 border-t-0",
				scrolled
					? "glass-panel"
					: "bg-background/90 backdrop-blur-xl border-none border-border shadow-none",
			].join(" ")}
		>
			<div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 md:px-12">
				{/* Logo */}
				<Link to="/" className="flex items-center gap-2.5 group">
					<AppLogo className="h-9 w-9 group-hover:brightness-110 transition-[filter]" />
					<span className="text-xl font-bold text-foreground dark:text-white tracking-tight">
						Hasanat
					</span>
				</Link>

				{/* Desktop nav links */}
				<div className="hidden md:flex items-center gap-8">
					{NAV_LINKS.map((link) => (
						<a
							key={link.label}
							href={link.href}
							className="text-sm font-medium text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white transition-colors"
						>
							{link.label}
						</a>
					))}
				</div>

				{/* Auth CTAs + Theme toggle */}
				<div className="flex items-center gap-2">
					{/* Theme toggle */}
					<button
						onClick={toggleTheme}
						aria-label="Toggle theme"
						className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white hover:bg-secondary dark:hover:bg-white/[0.08] transition-colors"
					>
						{theme === "dark" ? (
							<Sun className="w-4 h-4" />
						) : (
							<Moon className="w-4 h-4" />
						)}
					</button>

					<Button size="sm" className="rounded-full px-5" asChild>
						<Link to={user ? "/dashboard" : "/auth"}>
							{user ? "Go to Dashboard" : "Get Started"}
						</Link>
					</Button>
				</div>
			</div>
		</motion.nav>
	);
};

export default LandingNav;
