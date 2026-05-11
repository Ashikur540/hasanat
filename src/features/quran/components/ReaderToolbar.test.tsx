import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ReaderToolbar from "@/features/quran/components/ReaderToolbar";

vi.mock("@/i18n/I18nProvider", () => ({
	useI18n: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				quranSettings: "Settings",
				quranAyah: "Ayah",
				quranAyahs: "Ayahs",
			};
			return translations[key] ?? key;
		},
	}),
}));

describe("ReaderToolbar", () => {
	it("renders ayah count for the active surah", () => {
		render(
			<ReaderToolbar
				surah={{
					number: 1,
					nameArabic: "ٱلْفَاتِحَة",
					nameEnglish: "Al-Fatihah",
					ayahCount: 7,
				}}
				onOpenSettings={vi.fn()}
			/>,
		);
		expect(screen.getByText(/7 Ayahs/)).toBeInTheDocument();
	});

	it("invokes settings callback on click", () => {
		const onOpenSettings = vi.fn();
		render(<ReaderToolbar onOpenSettings={onOpenSettings} />);
		fireEvent.click(screen.getByRole("button", { name: /Settings/i }));
		expect(onOpenSettings).toHaveBeenCalledOnce();
	});
});
