import { cn } from "@/lib/utils";

interface AyahNumberMedallionProps {
	value: number | string;
	size?: "sm" | "md" | "lg";
	tone?: "primary" | "gold";
	className?: string;
}

const sizeMap = {
	sm: "h-8 w-8 text-[10px]",
	md: "h-10 w-10 text-xs",
	lg: "h-14 w-14 text-sm",
} as const;

const AyahNumberMedallion = ({
	value,
	size = "md",
	tone = "primary",
	className,
}: AyahNumberMedallionProps) => {
	const stroke =
		tone === "gold" ? "hsl(var(--gold))" : "hsl(var(--primary))";
	const fillBg =
		tone === "gold"
			? "hsl(var(--gold) / 0.12)"
			: "hsl(var(--primary) / 0.10)";

	return (
		<span
			className={cn(
				"relative inline-flex shrink-0 items-center justify-center font-semibold tabular-nums",
				sizeMap[size],
				tone === "gold"
					? "text-[hsl(var(--gold-foreground))]"
					: "text-primary",
				className,
			)}
		>
			<svg
				viewBox="0 0 48 48"
				className="absolute inset-0 h-full w-full"
				aria-hidden
			>
				<polygon
					points="24,2 30,8 38,8 38,16 44,22 38,28 38,36 30,36 24,42 18,36 10,36 10,28 4,22 10,16 10,8 18,8"
					fill={fillBg}
					stroke={stroke}
					strokeWidth="1.2"
					strokeLinejoin="round"
					opacity="0.95"
				/>
				<polygon
					points="24,8 28,12 34,12 34,18 38,22 34,26 34,32 28,32 24,36 20,32 14,32 14,26 10,22 14,18 14,12 20,12"
					fill="none"
					stroke={stroke}
					strokeWidth="0.6"
					opacity="0.45"
				/>
			</svg>
			<span className="relative z-10">{value}</span>
		</span>
	);
};

export default AyahNumberMedallion;
