"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRAYER_LABELS = exports.PRAYER_IDS = void 0;
exports.getPrayerWindows = getPrayerWindows;
exports.getNearClosePrayers = getNearClosePrayers;
exports.prayerReminderBody = prayerReminderBody;
const adhan_1 = require("adhan");
exports.PRAYER_IDS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
exports.PRAYER_LABELS = {
    fajr: { en: "Fajr", bn: "ফজর" },
    dhuhr: { en: "Dhuhr", bn: "যুহর" },
    asr: { en: "Asr", bn: "আসর" },
    maghrib: { en: "Maghrib", bn: "মাগরিব" },
    isha: { en: "Isha", bn: "ইশা" },
};
/**
 * Computes raw Adhan prayer times for a single day using UmmAlQura + Shafi madhab.
 * Matches client-side config so server + client always agree on times.
 */
function computeTimes(lat, lng, date) {
    const coordinates = new adhan_1.Coordinates(lat, lng);
    const params = adhan_1.CalculationMethod.UmmAlQura();
    params.madhab = adhan_1.Madhab.Shafi;
    return new adhan_1.PrayerTimes(coordinates, date, params);
}
/**
 * Returns 5 prayer windows {start, end} as Date instants for the given location/day.
 * Isha's end uses tomorrow's Fajr so the window spans midnight cleanly.
 */
function getPrayerWindows(lat, lng, date = new Date()) {
    const today = computeTimes(lat, lng, date);
    const tomorrowDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    const tomorrow = computeTimes(lat, lng, tomorrowDate);
    return {
        fajr: { start: today.fajr, end: today.sunrise },
        dhuhr: { start: today.dhuhr, end: today.asr },
        asr: { start: today.asr, end: today.maghrib },
        maghrib: { start: today.maghrib, end: today.isha },
        isha: { start: today.isha, end: tomorrow.fajr },
    };
}
/**
 * Returns prayers currently in their window AND ending within `bufferMinutes`.
 * Matches client-side `getNearClosePrayerCandidates` behaviour but operates on
 * Date instants (no HH:mm string round-trip).
 */
function getNearClosePrayers(windows, now, bufferMinutes) {
    const out = [];
    const effectiveBuffer = Math.max(0, bufferMinutes);
    for (const id of exports.PRAYER_IDS) {
        const w = windows[id];
        if (now < w.start || now > w.end)
            continue;
        const minutesRemaining = Math.floor((w.end.getTime() - now.getTime()) / 60000);
        if (minutesRemaining < 0 || minutesRemaining > effectiveBuffer)
            continue;
        out.push({ id, minutesRemaining, end: w.end });
    }
    return out.sort((a, b) => a.minutesRemaining - b.minutesRemaining);
}
/**
 * Builds the localized push-notification body for a near-close prayer reminder.
 * EN/BN templates only — extend the switch above to add more languages.
 */
function prayerReminderBody(language, prayerLabel, minutesRemaining) {
    if (language === "bn") {
        return `${prayerLabel} এর ওয়াক্ত শেষ হতে ${minutesRemaining} মিনিট বাকি। সালাত পড়ে থাকলে চেক করে দিন।`;
    }
    return `${prayerLabel} time is ending in ${minutesRemaining} minutes. If you prayed, mark it now.`;
}
//# sourceMappingURL=prayerEngine.js.map