import { cn } from "@/lib/utils";

interface OrnamentDividerProps {
	className?: string;
	variant?: "default" | "compact";
}

const OrnamentDivider = ({
	className,
	variant = "default",
}: OrnamentDividerProps) => (
	<div
		className={cn(
			"flex items-center justify-center gap-3 text-[hsl(var(--gold))]/70",
			className,
		)}
		aria-hidden
	>
		<span className="h-px flex-1 bg-gradient-to-r from-transparent via-current to-current/0" />
		<svg
			width={variant === "compact" ? 14 : 18}
			height={variant === "compact" ? 14 : 18}
			viewBox="0 0 24 24"
			fill="none"
			className="shrink-0"
		>
			<path
				d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
				fill="currentColor"
				opacity="0.55"
			/>
			<circle cx="12" cy="12" r="2" fill="currentColor" />
		</svg>
		<span className="h-px flex-1 bg-gradient-to-l from-transparent via-current to-current/0" />
	</div>
);

export default OrnamentDivider;
