import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocationService, LOCATION_CACHE_KEY } from "@/hooks/useLocationService";
import { getLocationFromIP } from "@/lib/location/getLocationFromIP";

vi.mock("@/lib/location/getLocationFromIP", () => ({
	getLocationFromIP: vi.fn(),
}));

const mockGetLocationFromIP = vi.mocked(getLocationFromIP);

describe("useLocationService", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	it("loads from cache before requesting GPS", async () => {
		localStorage.setItem(
			LOCATION_CACHE_KEY,
			JSON.stringify({
				lat: 23.81,
				lng: 90.41,
				timestamp: Date.now(),
				manual: true,
				source: "manual",
			}),
		);

		Object.defineProperty(navigator, "geolocation", {
			configurable: true,
			value: {
				getCurrentPosition: vi.fn(),
			},
		});

		const { result } = renderHook(() => useLocationService());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.lat).toBe(23.81);
		expect(result.current.lng).toBe(90.41);
		expect(result.current.source).toBe("manual");
	});

	it("falls back to IP when GPS fails", async () => {
		mockGetLocationFromIP.mockResolvedValue({
			lat: 51.5072,
			lng: -0.1276,
			city: "London",
			country: "United Kingdom",
		});

		Object.defineProperty(navigator, "geolocation", {
			configurable: true,
			value: {
				getCurrentPosition: (
					_success: PositionCallback,
					error: PositionErrorCallback,
				) => {
					error({
						code: 2,
						message: "Position unavailable",
						PERMISSION_DENIED: 1,
						POSITION_UNAVAILABLE: 2,
						TIMEOUT: 3,
					} as GeolocationPositionError);
				},
			},
		});

		const { result } = renderHook(() => useLocationService());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.lat).toBe(51.5072);
		expect(result.current.lng).toBe(-0.1276);
		expect(result.current.source).toBe("ip");
		expect(result.current.city).toBe("London");
		expect(result.current.country).toBe("United Kingdom");
		expect(result.current.error).toBeNull();
	});
});
