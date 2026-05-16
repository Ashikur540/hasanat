"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prayerEngine_js_1 = require("./prayerEngine.js");
(0, vitest_1.describe)("getPrayerWindows", () => {
    (0, vitest_1.it)("returns 5 prayer windows for Dhaka (BD) on a fixed date", () => {
        // 23.81°N, 90.41°E (Dhaka), 2026-05-15 12:00 UTC = ~18:00 local
        const windows = (0, prayerEngine_js_1.getPrayerWindows)(23.81, 90.41, new Date("2026-05-15T12:00:00Z"));
        for (const id of prayerEngine_js_1.PRAYER_IDS) {
            (0, vitest_1.expect)(windows[id].start).toBeInstanceOf(Date);
            (0, vitest_1.expect)(windows[id].end).toBeInstanceOf(Date);
            // end is after start
            (0, vitest_1.expect)(windows[id].end.getTime()).toBeGreaterThan(windows[id].start.getTime());
        }
    });
    (0, vitest_1.it)("isha window ends in the next day (uses tomorrow's fajr)", () => {
        const windows = (0, prayerEngine_js_1.getPrayerWindows)(23.81, 90.41, new Date("2026-05-15T12:00:00Z"));
        // isha ends close to tomorrow's pre-dawn
        const ishaEndsAfterIshaStartsBy = windows.isha.end.getTime() - windows.isha.start.getTime();
        (0, vitest_1.expect)(ishaEndsAfterIshaStartsBy).toBeGreaterThan(60 * 60 * 1000); // > 1h
    });
});
(0, vitest_1.describe)("getNearClosePrayers", () => {
    function fixedWindows() {
        const base = new Date("2026-05-15T00:00:00Z").getTime();
        const min = (m) => new Date(base + m * 60000);
        return {
            fajr: { start: min(0), end: min(60) },
            dhuhr: { start: min(120), end: min(240) },
            asr: { start: min(240), end: min(360) },
            maghrib: { start: min(360), end: min(420) },
            isha: { start: min(420), end: min(720) },
        };
    }
    (0, vitest_1.it)("returns empty when outside all windows", () => {
        const w = fixedWindows();
        const now = new Date("2026-05-15T01:30:00Z"); // 90 min in — gap between fajr-end and dhuhr-start
        (0, vitest_1.expect)((0, prayerEngine_js_1.getNearClosePrayers)(w, now, 20)).toEqual([]);
    });
    (0, vitest_1.it)("returns prayer when within window and within buffer", () => {
        const w = fixedWindows();
        // fajr ends at min 60. now = min 45 → 15 min left, within 20-min buffer
        const now = new Date("2026-05-15T00:45:00Z");
        const result = (0, prayerEngine_js_1.getNearClosePrayers)(w, now, 20);
        (0, vitest_1.expect)(result.length).toBe(1);
        (0, vitest_1.expect)(result[0].id).toBe("fajr");
        (0, vitest_1.expect)(result[0].minutesRemaining).toBe(15);
    });
    (0, vitest_1.it)("excludes prayer when within window but past buffer", () => {
        const w = fixedWindows();
        // dhuhr ends at min 240. now = min 130 → 110 min left, > 20-min buffer
        const now = new Date("2026-05-15T02:10:00Z");
        (0, vitest_1.expect)((0, prayerEngine_js_1.getNearClosePrayers)(w, now, 20)).toEqual([]);
    });
    (0, vitest_1.it)("sorts by minutesRemaining ascending", () => {
        const w = fixedWindows();
        // Two overlapping windows (asr ends at 360 = same as maghrib start)
        // Use a now that fits in a single window with two near-close at different buffers — synthetic test
        // Actually our shape has no overlaps, so re-craft an overlapping fixture
        const overlap = Object.assign(Object.assign({}, w), { asr: {
                start: new Date("2026-05-15T03:00:00Z"),
                end: new Date("2026-05-15T03:50:00Z"),
            }, maghrib: {
                start: new Date("2026-05-15T03:00:00Z"),
                end: new Date("2026-05-15T03:30:00Z"),
            } });
        const now = new Date("2026-05-15T03:25:00Z");
        const result = (0, prayerEngine_js_1.getNearClosePrayers)(overlap, now, 30);
        (0, vitest_1.expect)(result.map((c) => c.id)).toEqual(["maghrib", "asr"]);
    });
});
(0, vitest_1.describe)("prayerReminderBody", () => {
    (0, vitest_1.it)("English template includes prayer name + minutes", () => {
        const out = (0, prayerEngine_js_1.prayerReminderBody)("en", "Asr", 12);
        (0, vitest_1.expect)(out).toContain("Asr");
        (0, vitest_1.expect)(out).toContain("12");
    });
    (0, vitest_1.it)("Bengali template includes prayer name + minutes", () => {
        const out = (0, prayerEngine_js_1.prayerReminderBody)("bn", "আসর", 7);
        (0, vitest_1.expect)(out).toContain("আসর");
        (0, vitest_1.expect)(out).toContain("7");
    });
});
//# sourceMappingURL=prayerEngine.test.js.map