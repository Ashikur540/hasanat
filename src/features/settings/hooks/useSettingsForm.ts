import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { useI18n } from "@/i18n/I18nProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { useSettingsApi } from "./useSettingsApi";
import { DEFAULT_SETTINGS, type SettingsFormValues } from "../types";
import type { Language } from "@/i18n/translations";

export function useSettingsForm() {
	const { settings, hasStoredAppearance, isLoading, updateSettings } = useSettingsApi();
	const { setLanguage } = useI18n();
	const { setTheme } = useTheme();

	const form = useForm<SettingsFormValues>({
		defaultValues: DEFAULT_SETTINGS,
		// `values` syncs Firestore data into the form automatically.
		// When settings loads/changes, RHF resets the form and isDirty → false.
		values: settings,
	});

	// Keep isDirty in a ref so the save effect only re-runs when the
	// debounced value settles — not on every isDirty state flip.
	const isDirtyRef = useRef(false);
	isDirtyRef.current = form.formState.isDirty;

	// Debounce the full form snapshot — serialize to string so useDebounce's
	// strict equality check works correctly for objects.
	const debouncedJson = useDebounce(JSON.stringify(form.watch()), 800);

	// Auto-save only when the user has actually changed something
	useEffect(() => {
		if (!isDirtyRef.current) return;
		updateSettings(JSON.parse(debouncedJson) as SettingsFormValues);
	}, [debouncedJson, updateSettings]);

	// Apply theme/language once when Firestore settings first load.
	// Using a ref so this only runs on initial load, not on every re-fetch.
	const settingsApplied = useRef(false);
	useEffect(() => {
		if (!settings || settingsApplied.current) return;
		settingsApplied.current = true;
		const hasLocalThemePreference =
			typeof window !== "undefined" && window.localStorage.getItem("theme") !== null;
		if (hasStoredAppearance && !hasLocalThemePreference) {
			setTheme(settings.appearance);
		}
		setLanguage(settings.language as Language);
	}, [settings, hasStoredAppearance, setTheme, setLanguage]);

	// Apply theme/language immediately when the user explicitly changes a field.
	// We intentionally skip `name === undefined` (full form reset from Firestore
	// reload) to avoid overwriting the active theme mid-session.
	useEffect(() => {
		const sub = form.watch((values, { name }) => {
			if (name === "language" && values.language) {
				setLanguage(values.language as Language);
			}
			if (name === "appearance" && values.appearance) {
				setTheme(values.appearance);
			}
		});
		return () => sub.unsubscribe();
	}, [form, setLanguage, setTheme]);

	return { form, isLoading };
}
