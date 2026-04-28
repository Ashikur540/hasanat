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

// Umm al-Qura month number 1–12 via Intl.
function getHijriMonthForDate(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    month: "numeric",
    numberingSystem: "latn",
  }).formatToParts(date);
  const monthStr = parts.find((p) => p.type === "month")?.value ?? "1";
  const month = parseInt(monthStr, 10);
  return Math.min(12, Math.max(1, month));
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
