import { describe, expect, it } from "vitest";
import {
	activeSlotForLocalTime,
	curatedTips,
	hashIndex,
} from "./tips.js";

describe("hashIndex", () => {
	it("is deterministic for the same seed", () => {
		const a = hashIndex("user123|2026-05-15|morning", 10);
		const b = hashIndex("user123|2026-05-15|morning", 10);
		expect(a).toBe(b);
	});

	it("varies across seeds", () => {
		const a = hashIndex("user123|2026-05-15|morning", 10);
		const b = hashIndex("user123|2026-05-15|evening", 10);
		const c = hashIndex("user456|2026-05-15|morning", 10);
		// Not guaranteed to differ, but extremely likely; just sanity-check not all equal
		expect([a === b, a === c, b === c].filter(Boolean).length).toBeLessThan(3);
	});

	it("always returns value in [0, mod)", () => {
		for (let i = 0; i < 100; i++) {
			const v = hashIndex(`seed-${i}`, 7);
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(7);
		}
	});

	it("returns 0 when mod is 0 (defensive)", () => {
		expect(hashIndex("anything", 0)).toBe(0);
	});
});

describe("activeSlotForLocalTime", () => {
	it("matches morning at 8:00 sharp", () => {
		expect(activeSlotForLocalTime(8, 0)?.id).toBe("morning");
	});

	it("matches morning at 8:30 (edge of window)", () => {
		expect(activeSlotForLocalTime(8, 30)?.id).toBe("morning");
	});

	it("does not match morning at 8:31 (past window)", () => {
		expect(activeSlotForLocalTime(8, 31)).toBeNull();
	});

	it("matches evening at 15:30 (early edge)", () => {
		expect(activeSlotForLocalTime(15, 30)?.id).toBe("evening");
	});

	it("matches evening at 16:30 (late edge)", () => {
		expect(activeSlotForLocalTime(16, 30)?.id).toBe("evening");
	});

	it("matches night at 20:15", () => {
		expect(activeSlotForLocalTime(20, 15)?.id).toBe("night");
	});

	it("returns null between slots (e.g. 12:00)", () => {
		expect(activeSlotForLocalTime(12, 0)).toBeNull();
	});

	it("returns null at 23:00", () => {
		expect(activeSlotForLocalTime(23, 0)).toBeNull();
	});
});

describe("curatedTips", () => {
	it("has non-empty EN + BN pools", () => {
		expect(curatedTips.en.length).toBeGreaterThan(0);
		expect(curatedTips.bn.length).toBeGreaterThan(0);
	});
});
