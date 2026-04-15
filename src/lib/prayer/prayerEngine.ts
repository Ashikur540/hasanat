import {
	CalculationMethod,
	Coordinates,
	Madhab,
	PrayerTimes as AdhanPrayerTimes,
} from "adhan";

export interface PrayerEngineTimes {
	fajr: string;
	sunrise: string;
	sunset: string;
	dhuhr: string;
	asr: string;
	maghrib: string;
	isha: string;
}

function formatAsHHMM(time: Date): string {
	const hours = String(time.getHours()).padStart(2, "0");
	const minutes = String(time.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
}

export function getPrayerTimes(
	lat: number,
	lng: number,
	date: Date = new Date(),
): PrayerEngineTimes {
	const coordinates = new Coordinates(lat, lng);
	const params = CalculationMethod.UmmAlQura();
	params.madhab = Madhab.Shafi;

	const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);

	return {
		fajr: formatAsHHMM(prayerTimes.fajr),
		sunrise: formatAsHHMM(prayerTimes.sunrise),
		sunset: formatAsHHMM(prayerTimes.sunset),
		dhuhr: formatAsHHMM(prayerTimes.dhuhr),
		asr: formatAsHHMM(prayerTimes.asr),
		maghrib: formatAsHHMM(prayerTimes.maghrib),
		isha: formatAsHHMM(prayerTimes.isha),
	};
}
