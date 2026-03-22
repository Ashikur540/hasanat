import { useState, useEffect } from "react";

/**
 * Generic debounce hook. Returns a debounced copy of `value` that only
 * updates after `delay` ms have passed without a new value arriving.
 *
 * Works with primitives, objects, and arrays — for objects pass a
 * serialized string (e.g. JSON.stringify) if you need stable comparison.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}
