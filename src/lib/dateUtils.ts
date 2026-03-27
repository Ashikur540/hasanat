import {
  format,
  subDays,
  addDays,
  startOfMonth,
  differenceInDays,
  getISODay,
} from "date-fns";

export type TimeRange = "week" | "month" | "year";

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getYesterdayString(): string {
  return format(subDays(new Date(), 1), "yyyy-MM-dd");
}

// "year" = rolling 52-week window ending today (GitHub-style), not a calendar year
export const ROLLING_YEAR_WEEKS = 52;

export function getStartDate(range: TimeRange): string {
  const today = new Date();
  switch (range) {
    case "year":
      // 52 weeks × 7 days − 1 so today is the last day of the window
      return format(subDays(today, ROLLING_YEAR_WEEKS * 7 - 1), "yyyy-MM-dd");
    case "month":
      return format(startOfMonth(today), "yyyy-MM-dd");
    case "week":
      return format(subDays(today, 6), "yyyy-MM-dd");
  }
}

export function getTotalDaysInPeriod(range: TimeRange): number {
  const today = new Date();
  switch (range) {
    case "year":
      return ROLLING_YEAR_WEEKS * 7; // always 364
    case "month":
      return differenceInDays(today, startOfMonth(today)) + 1;
    case "week":
      return 7;
  }
}

// Returns the Monday on or before a given date (used for heatmap grid alignment)
export function getGridStart(date: Date): Date {
  const dayOfWeek = getISODay(date); // 1=Mon, 7=Sun
  return addDays(date, -(dayOfWeek - 1));
}

// Internal: same Hijri algorithm as useHijriDate hook — returns month number 1–12
function getHijriMonthForDate(date: Date): number {
  const gregorianDays = Math.floor(
    (date.getTime() - new Date(622, 6, 16).getTime()) / 86400000,
  );
  const hijriYear = Math.floor((30 * gregorianDays + 10646) / 10631);
  const daysInYear =
    gregorianDays - Math.floor((10631 * hijriYear - 10617) / 30);
  return Math.min(12, Math.ceil((daysInYear - 0.5) / 29.5));
}

// Returns all Gregorian dates in gregorianYear that fall in Ramadan (Hijri month 9)
export function getRamadanDates(gregorianYear: number): string[] {
  const result: string[] = [];
  let current = new Date(gregorianYear, 0, 1);
  const yearEnd = new Date(gregorianYear, 11, 31);
  while (current <= yearEnd) {
    if (getHijriMonthForDate(current) === 9) {
      result.push(format(current, "yyyy-MM-dd"));
    }
    current = addDays(current, 1);
  }
  return result;
}
