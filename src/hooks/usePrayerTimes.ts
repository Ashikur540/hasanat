import { useState, useEffect } from 'react';

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
  const [schedule, setSchedule] = useState<PrayerTime[]>(DEFAULT_SCHEDULE);
  const [sunrise, setSunrise] = useState("06:14");
  const [sunset, setSunset] = useState("18:05");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimes = async (lat: number, lng: number) => {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const res = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=2`);
        const data = await res.json();
        
        if (data && data.data && data.data.timings) {
          const t = data.data.timings;
          
          setSunrise(t.Sunrise);
          setSunset(t.Sunset);
          
          setSchedule([
            { id: "fajr", en: "Fajr", bn: "ফজর", emoji: "🌙", start: t.Fajr, end: t.Sunrise },
            { id: "duha", en: "Duha", bn: "ইশরাক/চাশত", emoji: "🌅", start: t.Sunrise, end: t.Dhuhr },
            { id: "dhuhr", en: "Dhuhr", bn: "যুহর", emoji: "☀️", start: t.Dhuhr, end: t.Asr },
            { id: "asr", en: "Asr", bn: "আসর", emoji: "🌤️", start: t.Asr, end: t.Maghrib },
            { id: "maghrib", en: "Maghrib", bn: "মাগরিব", emoji: "🌇", start: t.Maghrib, end: t.Isha },
            { id: "isha", en: "Isha", bn: "ইশা", emoji: "🌙", start: t.Isha, end: "23:59" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch prayer times:", error);
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchTimes(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  return { schedule, sunrise, sunset, loading };
};
