import { forwardRef } from "react";
import { format, subDays } from "date-fns";
import { countToLevel } from "@/lib/amalGraphCalculations";
import type { AmalLevel } from "../types";

interface ProfileShareCardProps {
	name: string;
	level: AmalLevel;
	totalDeeds: number;
	currentStreak: number;
	heatmapData: Record<string, number>;
	photoURL?: string | null;
}

const HEATMAP_COLORS = ["#EBEDF0", "#9BE9A8", "#40C463", "#30A14E", "#1A7A4A"];

export const ProfileShareCard = forwardRef<
	HTMLDivElement,
	ProfileShareCardProps
>(({ name, level, totalDeeds, currentStreak, heatmapData, photoURL }, ref) => {
	const today = new Date();
	const last49Days = Array.from({ length: 49 }, (_, i) => {
		const date = subDays(today, 48 - i);
		const dateStr = format(date, "yyyy-MM-dd");
		const count = heatmapData[dateStr] || 0;
		return countToLevel(count);
	});

	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div
			ref={ref}
			style={{
				position: "absolute",
				left: "-9999px",
				top: "0",
				width: "480px",
				height: "240px",
				backgroundColor: "#FAFAF8",
				padding: "24px",
				fontFamily:
					'Inter, "Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
				boxSizing: "border-box",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100%",
					gap: "16px",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<div
							style={{
								width: "32px",
								height: "32px",
								borderRadius: "50%",
								backgroundColor: photoURL ? "transparent" : "#1A7A4A",
								color: "white",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "14px",
								fontWeight: "bold",
								backgroundImage: photoURL ? `url(${photoURL})` : "none",
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
						>
							{!photoURL && initials}
						</div>
						<div>
							<div
								style={{
									fontSize: "18px",
									fontWeight: "bold",
									color: "#1A3C2A",
								}}
							>
								{name}
							</div>
							<div style={{ fontSize: "11px", color: "#1A7A4A" }}>{level}</div>
						</div>
					</div>
					<div
						style={{
							fontSize: "20px",
							fontWeight: "bold",
							color: "#1A7A4A",
							fontFamily: '"Al Majeed Quranic", serif',
						}}
					>
						حَسَنَات
					</div>
				</div>

				<div
					style={{
						display: "flex",
						gap: "2px",
						justifyContent: "center",
						flexWrap: "wrap",
						maxWidth: "280px",
						margin: "0 auto",
					}}
				>
					{last49Days.map((level, i) => (
						<div
							key={i}
							style={{
								width: "12px",
								height: "12px",
								backgroundColor: HEATMAP_COLORS[level],
								borderRadius: "2px",
							}}
						/>
					))}
				</div>

				<div
					style={{
						display: "flex",
						gap: "24px",
						justifyContent: "center",
					}}
				>
					<div style={{ textAlign: "center" }}>
						<div
							style={{
								fontSize: "24px",
								fontWeight: "bold",
								color: "#1A3C2A",
							}}
						>
							{totalDeeds}
						</div>
						<div style={{ fontSize: "11px", color: "#6B7280" }}>Total Deeds</div>
					</div>
					<div style={{ textAlign: "center" }}>
						<div
							style={{
								fontSize: "24px",
								fontWeight: "bold",
								color: "#1A3C2A",
							}}
						>
							{currentStreak}d
						</div>
						<div style={{ fontSize: "11px", color: "#6B7280" }}>
							Current Streak
						</div>
					</div>
				</div>

				<div
					style={{
						marginTop: "auto",
						textAlign: "center",
						fontSize: "10px",
						color: "#9CA3AF",
					}}
				>
					hasanat.app • Track your good deeds
				</div>
			</div>
		</div>
	);
});

ProfileShareCard.displayName = "ProfileShareCard";
