import { Moon } from "lucide-react";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";
import { useTimezoneService } from "@/hooks/useTimezoneService";
import { useHijriDate } from "@/hooks/useHijriDate";
import { useBanglaDate } from "@/hooks/useBanglaDate";
import { toBanglaNum } from "@/lib/timeFormatting";

const WEEKDAYS_EN = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
const WEEKDAYS_BN = [
	"রবিবার",
	"সোমবার",
	"মঙ্গলবার",
	"বুধবার",
	"বৃহস্পতিবার",
	"শুক্রবার",
	"শনিবার",
];

const DateCalendarWidget = () => {
	const { language } = useI18n();
	const { timezone } = useTimezoneService();

	const utcDate = new Date();
	const zonedDate = toZonedTime(utcDate, timezone);

	const hijri = useHijriDate();
	const banglaDate = useBanglaDate();

	const gregorianEn = formatInTimeZone(utcDate, timezone, "d MMMM yyyy");
	const gregorianBn = `${toBanglaNum(zonedDate.getDate())} ${zonedDate.toLocaleDateString("bn-BD", { month: "long" })} ${toBanglaNum(zonedDate.getFullYear())}`;

	const isBn = language === "bn";
	const dayNum = isBn ? toBanglaNum(hijri.day) : hijri.day;
	const monthName = isBn ? hijri.monthBn : hijri.month;
	const yearNum = isBn ? toBanglaNum(hijri.year) : hijri.year;
	const weekday = isBn
		? WEEKDAYS_BN[zonedDate.getDay()]
		: WEEKDAYS_EN[zonedDate.getDay()];

	return (
		<Card className="border-border/60 bg-card overflow-hidden h-full flex flex-col shadow-sm">
			<CardContent className="p-0 flex flex-col flex-1">
				{/* ── Hijri Hero ─────────────────────────────── */}
				<div className="relative bg-gradient-to-br from-[#081c10] via-[#1A7A4A] to-[#2D9E63] px-5 pt-4 pb-5 overflow-hidden flex-shrink-0">
					{/* Ambient crescent moon — large decorative shape */}
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						className="absolute -top-3 -right-3 w-28 h-28 text-white/[0.07] pointer-events-none select-none"
						aria-hidden="true"
					>
						<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
					</svg>

					{/* Concentric ring accent — bottom left */}
					<div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full border border-white/[0.06] pointer-events-none" />
					<div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full border border-white/[0.05] pointer-events-none" />

					{/* Top row: calendar label + bismillah */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-1.5">
							<Moon className="h-3 w-3 text-white/45" strokeWidth={2.5} />
							<span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.18em]">
								{isBn ? "হিজরি" : "Hijri Calendar"}
							</span>
						</div>
						<span className="font-arabic text-base text-white/20 select-none">
							﷽
						</span>
					</div>

					{/* Day number — the visual hero */}
					<div className="flex items-end gap-3">
						<span className="text-6xl font-black text-white leading-none tracking-tighter tabular-nums">
							{dayNum}
						</span>
						<div className="pb-0.5">
							<p className="text-sm font-bold text-white/90 leading-tight">
								{monthName}
							</p>
							<p className="text-xs text-white/40 font-medium mt-0.5 tabular-nums">
								{yearNum}&nbsp;
								<span className="text-white/30">AH</span>
							</p>
						</div>
					</div>
				</div>

				{/* ── Gregorian + Bangla ─────────────────────── */}
				<div className="px-4 py-3.5 flex-1 flex flex-col">
					{/* Gregorian date */}
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm font-bold text-foreground leading-tight">
								{weekday}
							</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								{isBn ? gregorianBn : gregorianEn}
							</p>
						</div>
						{/* Day-of-week indicator dots */}
						<div className="flex gap-0.5 mt-0.5">
							{Array.from({ length: 7 }).map((_, i) => (
								<div
									key={i}
									className={`w-1 h-1 rounded-full transition-colors ${
										i === zonedDate.getDay() ? "bg-primary" : "bg-border"
									}`}
								/>
							))}
						</div>
					</div>

					{/* Bangla date — anchored at bottom */}
					<div className="mt-auto pt-2.5 border-t border-border/50 flex items-center gap-2">
						<span className="text-base leading-none select-none">🇧🇩</span>
						<div>
							<p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
								{isBn ? "বাংলা" : "Bangla"}
							</p>
							<p className="text-sm font-semibold text-foreground leading-tight">
								{banglaDate}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default DateCalendarWidget;
