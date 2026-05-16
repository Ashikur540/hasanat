import { describe, expect, it, vi } from "vitest";
import { getLocationFromIP } from "@/lib/location/getLocationFromIP";

describe("getLocationFromIP", () => {
	it("returns normalized location data on success", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					latitude: 23.8103,
					longitude: 90.4125,
					city: "Dhaka",
					country: "Bangladesh",
				}),
			}),
		);

		const result = await getLocationFromIP();

		expect(result).toEqual({
			lat: 23.8103,
			lng: 90.4125,
			city: "Dhaka",
			country: "Bangladesh",
		});
	});

	it("returns null when API payload is invalid", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ city: "Dhaka" }),
			}),
		);

		const result = await getLocationFromIP();
		expect(result).toBeNull();
	});
});
