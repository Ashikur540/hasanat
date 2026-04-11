import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MosqueLogo } from "@/components/brand/MosqueLogo";

const NAV_LINKS = [
	{ label: "Features", href: "#features" },
	{ label: "Deeds Library", href: "#library" },
	{ label: "Leaderboard", href: "#leaderboard" },
];

const LandingNav = () => {
	const [scrolled, setScrolled] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

	return (
		<motion.nav
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.4 }}
			className={[
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300",
				scrolled
					? "border-b border-border dark:border-white/[0.05] bg-white/80 dark:bg-[#040d09]/90 backdrop-blur-xl shadow-sm dark:shadow-none"
					: "border-b border-transparent bg-transparent",
			].join(" ")}
		>
			<div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 md:px-12">
				{/* Logo */}
				<Link to="/" className="flex items-center gap-2.5 group">
					<MosqueLogo className="h-9 w-9 group-hover:brightness-110 transition-[filter]" iconClassName="h-[18px] w-[18px]" />
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
						<Link to="/auth">Get Started</Link>
					</Button>
				</div>
			</div>
		</motion.nav>
	);
};

export default LandingNav;
