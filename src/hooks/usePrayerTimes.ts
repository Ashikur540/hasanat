import { useEffect, useState } from 'react';
import { useLocationService } from '@/hooks/useLocationService';
import { getPrayerTimes } from '@/lib/prayer/prayerEngine';

export interface PrayerTime {
  id: string;
  en: string;
  bn: string;
  emoji: string;
  start: string;
  end: string;
}

const DEFAULT_SCHEDULE: PrayerTime[] = [
  { id: "fajr", en: "Fajr", bn: "ফজর", emoji: "🌙", start: "04:59", end: "06:14" },
  { id: "duha", en: "Duha", bn: "ইশরাক/চাশত", emoji: "🌅", start: "06:14", end: "12:10" },
  { id: "dhuhr", en: "Dhuhr", bn: "যুহর", emoji: "☀️", start: "12:10", end: "15:33" },
  { id: "asr", en: "Asr", bn: "আসর", emoji: "🌤️", start: "15:33", end: "18:05" },
  { id: "maghrib", en: "Maghrib", bn: "মাগরিব", emoji: "🌇", start: "18:05", end: "19:20" },
  { id: "isha", en: "Isha", bn: "ইশা", emoji: "🌙", start: "19:20", end: "23:59" },
];

export const usePrayerTimes = () => {
  const { lat, lng, loading: locationLoading } = useLocationService();
  const [schedule, setSchedule] = useState<PrayerTime[]>(DEFAULT_SCHEDULE);
  const [sunrise, setSunrise] = useState('06:14');
  const [sunset, setSunset] = useState('18:05');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locationLoading) {
      setLoading(true);
      return;
    }

    if (lat === null || lng === null) {
      setLoading(false);
      return;
    }

    try {
      const prayerTimes = getPrayerTimes(lat, lng);
      setSunrise(prayerTimes.sunrise);
      setSunset(prayerTimes.sunset);

      setSchedule([
        {
          id: 'fajr',
          en: 'Fajr',
          bn: 'ফজর',
          emoji: '🌙',
          start: prayerTimes.fajr,
          end: prayerTimes.sunrise,
        },
        {
          id: 'duha',
          en: 'Duha',
          bn: 'ইশরাক/চাশত',
          emoji: '🌅',
          start: prayerTimes.sunrise,
          end: prayerTimes.dhuhr,
        },
        {
          id: 'dhuhr',
          en: 'Dhuhr',
          bn: 'যুহর',
          emoji: '☀️',
          start: prayerTimes.dhuhr,
          end: prayerTimes.asr,
        },
        {
          id: 'asr',
          en: 'Asr',
          bn: 'আসর',
          emoji: '🌤️',
          start: prayerTimes.asr,
          end: prayerTimes.maghrib,
        },
        {
          id: 'maghrib',
          en: 'Maghrib',
          bn: 'মাগরিব',
          emoji: '🌇',
          start: prayerTimes.maghrib,
          end: prayerTimes.isha,
        },
        {
          id: 'isha',
          en: 'Isha',
          bn: 'ইশা',
          emoji: '🌙',
          start: prayerTimes.isha,
          end: '23:59',
        },
      ]);
    } catch (error) {
      console.error('Failed to calculate prayer times:', error);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, locationLoading]);

  return { schedule, sunrise, sunset, loading };
};
