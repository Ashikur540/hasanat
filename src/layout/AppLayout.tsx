import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
	BarChart3,
	Building2,
	BookOpen,
	Users,
	User,
	Home,
	Settings,
	Trophy,
	Sun,
	Moon,
	Monitor,
	Globe,
	BookHeart,
	LogOut,
	Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { useTheme } from "next-themes";
import { useAuth, useAuthActions } from "@/features/auth";
import { AppLogo } from "@/common/icons/AppLogo";

const AppLayout = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { t, language, setLanguage } = useI18n();
	const { theme, setTheme } = useTheme();
	const { user } = useAuth();
	const { handleSignOut } = useAuthActions();
	const isActive = (path: string) => location.pathname === path;

	const userInitials = user?.displayName
		? user.displayName
				.split(" ")
				.map((n) => n[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "?";

	const navLinks = [
		{ to: "/dashboard", label: t("navDashboard"), icon: Home },
		{ to: "/amal-graph", label: t("navAmalGraph"), icon: BarChart3 },
		// { to: "/my-city", label: t("navDeedsCity"), icon: Building2 },
		{ to: "/deeds", label: t("navDeeds"), icon: BookOpen },
		{ to: "/leaderboard", label: t("navLeaderboard"), icon: Trophy },
		// { to: "/circles", label: t("navCircles"), icon: Users },
	];

	const mobileLeftLinks = [
		{ to: "/amal-graph", label: t("navGraph"), icon: BarChart3 },
		{ to: "/deeds", label: t("navDeeds"), icon: BookOpen },
	];

	const mobileRightLinks = [
		{ to: "/profile", label: t("navProfile"), icon: User },
		{ to: "/settings", label: t("navSettings"), icon: Settings },
	];

	const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

	return (
		<div className="min-h-screen bg-background bg-gradient-mesh flex flex-col">
			<div className="fixed inset-0 bg-circuit-pattern pattern-fade-bottom pointer-events-none z-0 opacity-55" />
			<nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-x-0 border-t-0">
				<div className="container mx-auto flex h-14 items-center justify-between px-4">
					<Link to="/dashboard" className="flex items-center gap-2.5 group">
						<AppLogo className="h-9 w-9 group-hover:brightness-110 transition-[filter]" />
						<span className="text-xl font-bold text-foreground dark:text-white tracking-tight">
							Hasanat
						</span>
					</Link>

					<div className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => (
							<Button
								key={link.to}
								variant={isActive(link.to) ? "secondary" : "ghost"}
								size="sm"
								className={cn(
									"gap-2",
									isActive(link.to) && "font-semibold text-primary",
								)}
								asChild
							>
								<Link to={link.to}>
									<link.icon className="h-4 w-4" />
									{link.label}
								</Link>
							</Button>
						))}
					</div>

					<div className="flex items-center gap-1">
						{/* Language dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Globe className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={() => setLanguage("en")}
									className={cn(
										language === "en" && "font-semibold text-primary",
									)}
								>
									🇺🇸 English
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setLanguage("bn")}
									className={cn(
										language === "bn" && "font-semibold text-primary",
									)}
								>
									🇧🇩 বাংলা
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Theme toggle */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<ThemeIcon className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={() => setTheme("light")}
									className={cn(
										theme === "light" && "font-semibold text-primary",
									)}
								>
									<Sun className="h-4 w-4 mr-2" /> {t("settingsLight")}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setTheme("dark")}
									className={cn(
										theme === "dark" && "font-semibold text-primary",
									)}
								>
									<Moon className="h-4 w-4 mr-2" /> {t("settingsDark")}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setTheme("system")}
									className={cn(
										theme === "system" && "font-semibold text-primary",
									)}
								>
									<Monitor className="h-4 w-4 mr-2" /> {t("settingsSystem")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						{user ? (
							<>
								<Button
									variant="ghost"
									size="icon"
									className="hidden md:inline-flex h-8 w-8"
									asChild
								>
									<Link to="/settings">
										<Settings className="h-4 w-4" />
									</Link>
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Avatar className="h-8 w-8 cursor-pointer">
											<AvatarImage
												src={user.photoURL ?? undefined}
												alt={user.displayName ?? "User"}
											/>
											<AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
												{userInitials}
											</AvatarFallback>
										</Avatar>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuItem asChild>
											<Link to="/profile" className="flex items-center gap-2">
												<User className="h-4 w-4" /> Profile
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link to="/my-deeds" className="flex items-center gap-2">
												<BookHeart className="h-4 w-4" /> My Deeds
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={handleSignOut}
											className="text-destructive focus:text-destructive gap-2"
										>
											<LogOut className="h-4 w-4" /> Sign out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</>
						) : (
							<Button
								size="sm"
								className="h-8 gap-1.5"
								onClick={() => navigate("/auth")}
							>
								Sign In
							</Button>
						)}
					</div>
				</div>
			</nav>

			<main className="flex-1 pt-14 pb-24 md:pb-6 relative z-10">
				<Outlet />
			</main>

			{/* Mobile Bottom Nav */}
			<nav className="fixed bottom-4 left-0 right-0 z-50 md:hidden px-4">
				<div className="relative flex items-center justify-between bg-background/95 backdrop-blur-xl rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-border/40 h-16 px-6 max-w-sm mx-auto">
					{/* Left items */}
					<div className="flex items-center gap-6">
						{mobileLeftLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className="flex flex-col items-center gap-1 relative py-1"
							>
								<link.icon
									className={cn(
										"h-5 w-5 transition-colors",
										isActive(link.to)
											? "text-primary"
											: "text-muted-foreground/70",
									)}
								/>
								{isActive(link.to) && (
									<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
								)}
							</Link>
						))}
					</div>

					{/* Center elevated button */}
					<Link
						to="/dashboard"
						className="absolute left-1/2 -translate-x-1/2 -top-5 flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-[0_4px_16px_rgba(26,122,74,0.45)] transition-transform active:scale-95"
					>
						<Leaf className="h-6 w-6 text-white" />
					</Link>

					{/* Right items */}
					<div className="flex items-center gap-6">
						{mobileRightLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className="flex flex-col items-center gap-1 relative py-1"
							>
								<link.icon
									className={cn(
										"h-5 w-5 transition-colors",
										isActive(link.to)
											? "text-primary"
											: "text-muted-foreground/70",
									)}
								/>
								{isActive(link.to) && (
									<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
								)}
							</Link>
						))}
					</div>
				</div>
			</nav>
		</div>
	);
};

export default AppLayout;

const HasanatLogo = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		width={228}
		height={228}
		viewBox="0 0 228 228"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		{...props}
	>
		<mask
			id="mask0_805_60"
			style={{
				maskType: "alpha",
			}}
			maskUnits="userSpaceOnUse"
			x={0}
			y={0}
			width={228}
			height={228}
		>
			<rect width={228} height={228} fill="url(#pattern0_805_60)" />
		</mask>
		<g mask="url(#mask0_805_60)">
			<g filter="url(#filter0_dd_805_60)">
				<rect
					x={-44.8818}
					y={-29.1733}
					width={317.315}
					height={285.898}
					rx={24}
					fill="url(#paint0_linear_805_60)"
				/>
			</g>
		</g>
		<defs>
			<pattern
				id="pattern0_805_60"
				patternContentUnits="objectBoundingBox"
				width={1}
				height={1}
			>
				<use xlinkHref="#image0_805_60" transform="scale(0.0019685)" />
			</pattern>
			<filter
				id="filter0_dd_805_60"
				x={-56.8818}
				y={-31.1733}
				width={341.315}
				height={309.898}
				filterUnits="userSpaceOnUse"
				colorInterpolationFilters="sRGB"
			>
				<feFlood floodOpacity={0} result="BackgroundImageFix" />
				<feColorMatrix
					in="SourceAlpha"
					type="matrix"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
					result="hardAlpha"
				/>
				<feMorphology
					radius={4}
					operator="erode"
					in="SourceAlpha"
					result="effect1_dropShadow_805_60"
				/>
				<feOffset dy={4} />
				<feGaussianBlur stdDeviation={3} />
				<feComposite in2="hardAlpha" operator="out" />
				<feColorMatrix
					type="matrix"
					values="0 0 0 0 0.996078 0 0 0 0 0.603922 0 0 0 0 0 0 0 0 0.2 0"
				/>
				<feBlend
					mode="normal"
					in2="BackgroundImageFix"
					result="effect1_dropShadow_805_60"
				/>
				<feColorMatrix
					in="SourceAlpha"
					type="matrix"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
					result="hardAlpha"
				/>
				<feMorphology
					radius={3}
					operator="erode"
					in="SourceAlpha"
					result="effect2_dropShadow_805_60"
				/>
				<feOffset dy={10} />
				<feGaussianBlur stdDeviation={7.5} />
				<feComposite in2="hardAlpha" operator="out" />
				<feColorMatrix
					type="matrix"
					values="0 0 0 0 0.996078 0 0 0 0 0.603922 0 0 0 0 0 0 0 0 0.2 0"
				/>
				<feBlend
					mode="normal"
					in2="effect1_dropShadow_805_60"
					result="effect2_dropShadow_805_60"
				/>
				<feBlend
					mode="normal"
					in="SourceGraphic"
					in2="effect2_dropShadow_805_60"
					result="shape"
				/>
			</filter>
			<linearGradient
				id="paint0_linear_805_60"
				x1={-44.8818}
				y1={-29.1733}
				x2={239.469}
				y2={286.425}
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#FE9A00" />
				<stop offset={0.623682} stopColor="#EC8000" />
				<stop offset={1} stopColor="#E17100" />
			</linearGradient>
			<image
				id="image0_805_60"
				width={508}
				height={508}
				preserveAspectRatio="none"
				xlinkHref="data:image/png;base64,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"
			/>
		</defs>
	</svg>
);
