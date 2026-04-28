import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { MapPin } from "lucide-react";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { fadeUp } from "./animations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/I18nProvider";
import { useToast } from "@/hooks/use-toast";
import { useLocationService } from "@/hooks/useLocationService";
import { getLocationFromIP } from "@/lib/location/getLocationFromIP";
import { LocationPermissionDialog } from "@/components/dialogs/LocationPermissionDialog";

const LocationSettings = () => {
	const { t } = useI18n();
	const { toast } = useToast();
	const {
		lat,
		lng,
		source,
		city,
		country,
		loading: locationLoading,
		setCachedLocation,
	} = useLocationService();
	const [locationDialogOpen, setLocationDialogOpen] = useState(false);

	const handleRetryGeolocation = async () => {
		if (!navigator.geolocation) {
			const ipLocation = await getLocationFromIP();
			if (ipLocation) {
				setCachedLocation(
					ipLocation.lat,
					ipLocation.lng,
					false,
					ipLocation.city,
					ipLocation.country,
					"ip",
				);
				toast({ title: "Location updated from IP fallback" });
				return;
			}
			toast({ title: "Geolocation is not supported", variant: "destructive" });
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setCachedLocation(latitude, longitude, false);
				toast({ title: "Location updated successfully (GPS)" });
			},
			async () => {
				const ipLocation = await getLocationFromIP();
				if (ipLocation) {
					setCachedLocation(
						ipLocation.lat,
						ipLocation.lng,
						false,
						ipLocation.city,
						ipLocation.country,
						"ip",
					);
					toast({ title: "Location updated" });
					return;
				}
				toast({
					title: "Unable to get location. Please set manually.",
					variant: "destructive",
				});
			},
			{ timeout: 10000 },
		);
	};

	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	const getCachedLocationTimestamp = () => {
		try {
			const cached = localStorage.getItem("hasanat-location");
			if (cached) {
				const data = JSON.parse(cached);
				return data.timestamp ? formatTimestamp(data.timestamp) : null;
			}
		} catch {
			return null;
		}
		return null;
	};

	return (
		<>
			<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
				<Card className="border-border bg-card">
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<MapPin className="h-4 w-4 text-primary" />{" "}
							{t("settingsLocationTitle")}
						</CardTitle>
						<CardDescription>
							Manage your precise location for local features
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3 p-3 rounded-lg bg-secondary/30 border border-border">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<Label className="text-sm font-medium">
										{t("settingsLocationCurrent")}
									</Label>
									{locationLoading ? (
										<div className="flex items-center gap-2">
											<Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
											<span className="text-xs text-muted-foreground">
												{t("settingsLocationSearching")}
											</span>
										</div>
									) : lat && lng ? (
										<div className="space-y-1">
											<p className="text-sm font-mono text-foreground">
												{lat.toFixed(4)}°, {lng.toFixed(4)}°
											</p>
											{(city || country) && (
												<p className="text-xs text-muted-foreground">
													{[city, country].filter(Boolean).join(", ")}
												</p>
											)}
											{source && (
												<p className="text-xs text-muted-foreground">
													Source: {source.toUpperCase()}
												</p>
											)}
											{getCachedLocationTimestamp() && (
												<p className="text-xs text-muted-foreground">
													{t("settingsLocationLastUpdated")}:{" "}
													{getCachedLocationTimestamp()}
												</p>
											)}
										</div>
									) : (
										<p className="text-sm text-muted-foreground">Not Set</p>
									)}
								</div>
							</div>
						</div>

						<div className="flex gap-2 flex-wrap">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setLocationDialogOpen(true)}
								className="flex-1"
							>
								<MapPin className="h-4 w-4 mr-2" />
								{t("settingsLocationChange")}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleRetryGeolocation}
								className="flex-1"
								disabled={locationLoading}
							>
								{locationLoading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										{t("settingsLocationSearching")}
									</>
								) : (
									<>
										<MapPin className="h-4 w-4 mr-2" />
										{t("settingsLocationRefresh")}
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			<LocationPermissionDialog
				open={locationDialogOpen}
				onOpenChange={setLocationDialogOpen}
			/>
		</>
	);
};

export default LocationSettings;
