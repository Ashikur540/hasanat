import { useState, useEffect } from "react";
import {
	Sunrise,
	Sunset,
	Loader2,
	AlertCircle,
	MapPin,
	Clock,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useLocationService } from "@/hooks/useLocationService";
import { useTimezoneService } from "@/hooks/useTimezoneService";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useCurrentPrayer } from "@/hooks/useCurrentPrayer";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";

import {
	formatTimeLeft,
	formatTimeInTimezone,
	getCurrentTimeInMinutes,
} from "@/lib/timeFormatting";

const PrayerTimeWidget = () => {
	const { language } = useI18n();
	const isBn = language === "bn";
	const { schedule, sunrise, sunset, loading } = usePrayerTimes();
	const { lat, lng } = useLocationService();
	const { timezone } = useTimezoneService();
	const { locationLabel, loading: geocodeLoading } = useReverseGeocode(
		lat,
		lng,
		language,
	);
	const { isOffline } = useOnlineStatus();

	const [, setNowMins] = useState(() => getCurrentTimeInMinutes());
	const nowMins = getCurrentTimeInMinutes();
	const prayer = useCurrentPrayer(schedule, nowMins);

	useEffect(() => {
		const interval = setInterval(() => {
			setNowMins(getCurrentTimeInMinutes());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<Card className="border-border bg-card overflow-hidden h-full min-h-[180px] flex items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</Card>
		);
	}

	return (
		<Card className="border-border bg-card overflow-hidden h-full flex flex-col">
			<CardContent className="p-0 flex flex-col flex-1">
				{/* Offline indicator */}
				{isOffline && (
					<div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center gap-2">
						<AlertCircle className="h-4 w-4 text-yellow-600" />
						<span className="text-xs text-yellow-700 dark:text-yellow-500">
							{isBn
								? "অফলাইন মোড - শেষ আপডেট ব্যবহার করছি"
								: "Offline mode - using cached times"}
						</span>
					</div>
				)}

				{/* Location/Timezone info */}
				{lat && lng && timezone && (
					<div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between gap-2">
						{/* Location pill */}
						<div className="flex items-center gap-1.5 bg-primary/8 border border-primary/15 rounded-full px-2.5 py-1 min-w-0 max-w-[60%]">
							<div className="relative flex-shrink-0">
								<MapPin className="h-3 w-3 text-primary" />
							</div>
							{geocodeLoading ? (
								<span className="h-2.5 w-16 rounded-full bg-muted animate-pulse inline-block" />
							) : (
								<span className="text-xs font-medium text-foreground/80 truncate transition-opacity duration-300">
									{locationLabel ?? `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`}
								</span>
							)}
						</div>

						{/* Timezone pill */}
						<div className="flex items-center gap-1.5 bg-muted/50 border border-border/50 rounded-full px-2.5 py-1 flex-shrink-0">
							<Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
							<span className="text-xs text-muted-foreground whitespace-nowrap">
								{timezone.split("/").pop()?.replace(/_/g, " ") ?? timezone}
							</span>
						</div>
					</div>
				)}

				{/* Current prayer hero */}
				<div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-4 flex-1 flex flex-col justify-center gap-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Sunrise className="h-4 w-4 text-accent" />
							<span className="text-xs text-muted-foreground">
								{formatTimeInTimezone(sunrise, timezone)}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xs text-muted-foreground">
								{formatTimeInTimezone(sunset, timezone)}
							</span>
							<Sunset className="h-4 w-4 text-accent" />
						</div>
					</div>

					<div className="text-center">
						<span className="text-3xl mb-1 block">{prayer.current.emoji}</span>
						<p className="text-lg font-bold text-foreground">
							{isBn ? prayer.current.bn : prayer.current.en}
						</p>
						<div className="flex items-center justify-center gap-1 mt-1">
							<span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
							<span className="text-xs font-medium text-success">
								{isBn ? "চলমান" : "Active"}
							</span>
						</div>
					</div>

					<Progress value={prayer.progressPct} className="h-2" />
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>{formatTimeInTimezone(prayer.current.start, timezone)}</span>
						<span className="font-semibold text-foreground">
							{formatTimeLeft(prayer.remaining, isBn)}
						</span>
						<span>{formatTimeInTimezone(prayer.current.end, timezone)}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default PrayerTimeWidget;
