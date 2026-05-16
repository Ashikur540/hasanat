"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tips_js_1 = require("./tips.js");
(0, vitest_1.describe)("hashIndex", () => {
    (0, vitest_1.it)("is deterministic for the same seed", () => {
        const a = (0, tips_js_1.hashIndex)("user123|2026-05-15|morning", 10);
        const b = (0, tips_js_1.hashIndex)("user123|2026-05-15|morning", 10);
        (0, vitest_1.expect)(a).toBe(b);
    });
    (0, vitest_1.it)("varies across seeds", () => {
        const a = (0, tips_js_1.hashIndex)("user123|2026-05-15|morning", 10);
        const b = (0, tips_js_1.hashIndex)("user123|2026-05-15|evening", 10);
        const c = (0, tips_js_1.hashIndex)("user456|2026-05-15|morning", 10);
        // Not guaranteed to differ, but extremely likely; just sanity-check not all equal
        (0, vitest_1.expect)([a === b, a === c, b === c].filter(Boolean).length).toBeLessThan(3);
    });
    (0, vitest_1.it)("always returns value in [0, mod)", () => {
        for (let i = 0; i < 100; i++) {
            const v = (0, tips_js_1.hashIndex)(`seed-${i}`, 7);
            (0, vitest_1.expect)(v).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(v).toBeLessThan(7);
        }
    });
    (0, vitest_1.it)("returns 0 when mod is 0 (defensive)", () => {
        (0, vitest_1.expect)((0, tips_js_1.hashIndex)("anything", 0)).toBe(0);
    });
});
(0, vitest_1.describe)("activeSlotForLocalTime", () => {
    (0, vitest_1.it)("matches morning at 8:00 sharp", () => {
        var _a;
        (0, vitest_1.expect)((_a = (0, tips_js_1.activeSlotForLocalTime)(8, 0)) === null || _a === void 0 ? void 0 : _a.id).toBe("morning");
    });
    (0, vitest_1.it)("matches morning at 8:30 (edge of window)", () => {
        var _a;
        (0, vitest_1.expect)((_a = (0, tips_js_1.activeSlotForLocalTime)(8, 30)) === null || _a === void 0 ? void 0 : _a.id).toBe("morning");
    });
    (0, vitest_1.it)("does not match morning at 8:31 (past window)", () => {
        (0, vitest_1.expect)((0, tips_js_1.activeSlotForLocalTime)(8, 31)).toBeNull();
    });
    (0, vitest_1.it)("matches evening at 15:30 (early edge)", () => {
        var _a;
        (0, vitest_1.expect)((_a = (0, tips_js_1.activeSlotForLocalTime)(15, 30)) === null || _a === void 0 ? void 0 : _a.id).toBe("evening");
    });
    (0, vitest_1.it)("matches evening at 16:30 (late edge)", () => {
        var _a;
        (0, vitest_1.expect)((_a = (0, tips_js_1.activeSlotForLocalTime)(16, 30)) === null || _a === void 0 ? void 0 : _a.id).toBe("evening");
    });
    (0, vitest_1.it)("matches night at 20:15", () => {
        var _a;
        (0, vitest_1.expect)((_a = (0, tips_js_1.activeSlotForLocalTime)(20, 15)) === null || _a === void 0 ? void 0 : _a.id).toBe("night");
    });
    (0, vitest_1.it)("returns null between slots (e.g. 12:00)", () => {
        (0, vitest_1.expect)((0, tips_js_1.activeSlotForLocalTime)(12, 0)).toBeNull();
    });
    (0, vitest_1.it)("returns null at 23:00", () => {
        (0, vitest_1.expect)((0, tips_js_1.activeSlotForLocalTime)(23, 0)).toBeNull();
    });
});
(0, vitest_1.describe)("curatedTips", () => {
    (0, vitest_1.it)("has non-empty EN + BN pools", () => {
        (0, vitest_1.expect)(tips_js_1.curatedTips.en.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(tips_js_1.curatedTips.bn.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=tips.test.js.map