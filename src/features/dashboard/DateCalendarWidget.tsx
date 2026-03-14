import { Moon, Calendar } from "lucide-react";
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

	return (
		<Card className="border-border bg-card overflow-hidden">
			<CardContent className="p-0">
				{/* Hijri header */}
				<div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Moon className="h-5 w-5 opacity-80" />
							<span className="text-xs font-semibold uppercase tracking-wider opacity-80">
								{isBn ? "হিজরি তারিখ" : "Hijri Date"}
							</span>
						</div>
						<span className="text-xs opacity-70 font-arabic">﷽</span>
					</div>
					<p className="text-2xl font-bold mt-2 font-arabic">
						{isBn
							? `${toBanglaNum(hijri.day)} ${hijri.monthBn} ${toBanglaNum(hijri.year)}`
							: `${hijri.day} ${hijri.month} ${hijri.year}`}
					</p>
				</div>

				{/* Gregorian + Bangla */}
				<div className="p-4 space-y-2.5">
					<div className="flex items-center gap-2.5">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<div>
							<p className="text-sm font-semibold text-foreground">
								{isBn
									? WEEKDAYS_BN[zonedDate.getDay()]
									: WEEKDAYS_EN[zonedDate.getDay()]}
							</p>
							<p className="text-xs text-muted-foreground">
								{isBn ? gregorianBn : gregorianEn}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2.5">
						<span className="text-base">🇧🇩</span>
						<div>
							<p className="text-xs text-muted-foreground">
								{isBn ? "বাংলা" : "Bangla"}
							</p>
							<p className="text-sm font-semibold text-foreground">
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
