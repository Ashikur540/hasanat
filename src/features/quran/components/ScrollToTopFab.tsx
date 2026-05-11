import { ArrowUp } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface ScrollToTopFabProps {
	visible: boolean;
	progress: number;
	onClick: () => void;
}

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ScrollToTopFab = ({ visible, progress, onClick }: ScrollToTopFabProps) => {
	const { t } = useI18n();
	const clamped = Math.min(1, Math.max(0, progress));
	const dashOffset = CIRCUMFERENCE * (1 - clamped);

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={t("quranScrollToTop")}
			className={cn(
				"fixed right-4 bottom-24 md:bottom-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]/60 focus-visible:ring-offset-2",
				visible
					? "opacity-100 translate-y-0 pointer-events-auto"
					: "opacity-0 translate-y-2 pointer-events-none",
			)}
		>
			<svg
				className="absolute inset-0 h-full w-full -rotate-90"
				viewBox="0 0 48 48"
				aria-hidden
			>
				<circle
					cx="24"
					cy="24"
					r={RADIUS}
					fill="none"
					stroke="hsl(var(--primary-foreground) / 0.18)"
					strokeWidth="2"
				/>
				<circle
					cx="24"
					cy="24"
					r={RADIUS}
					fill="none"
					stroke="hsl(var(--gold))"
					strokeWidth="2"
					strokeLinecap="round"
					strokeDasharray={CIRCUMFERENCE}
					strokeDashoffset={dashOffset}
					style={{ transition: "stroke-dashoffset 120ms linear" }}
				/>
			</svg>
			<ArrowUp className="relative h-5 w-5" />
		</button>
	);
};

export default ScrollToTopFab;
