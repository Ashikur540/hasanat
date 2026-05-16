"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLocalDate = userLocalDate;
exports.userLocalHour = userLocalHour;
exports.userLocalMinute = userLocalMinute;
exports.shiftDate = shiftDate;
/**
 * Returns the user's local calendar date as YYYY-MM-DD for the given UTC instant.
 * Uses IANA tz string (e.g. "Asia/Dhaka") to handle DST + offset correctly.
 */
function userLocalDate(tz, instant) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(instant);
}
/**
 * Returns the user's local hour (0-23) for the given UTC instant.
 * Normalises the rare "24" case from `Intl.DateTimeFormat` back to 0.
 */
function userLocalHour(tz, instant) {
    const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        hour: "2-digit",
        hour12: false,
    }).format(instant);
    const h = Number(formatted);
    return h === 24 ? 0 : h;
}
/**
 * Returns the user's local minute (0-59) for the given UTC instant.
 */
function userLocalMinute(tz, instant) {
    const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        minute: "2-digit",
    }).format(instant);
    return Number(formatted);
}
/**
 * Adds (or subtracts) whole days to a YYYY-MM-DD string and returns YYYY-MM-DD.
 * Pure string math via UTC Date — safe across DST/timezone boundaries.
 */
function shiftDate(yyyyMmDd, days) {
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + days);
    return dt.toISOString().slice(0, 10);
}
//# sourceMappingURL=time.js.map