import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
	translations,
	type Language,
	type TranslationKey,
} from "@/i18n/translations";

interface I18nContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const LANGUAGE_CACHE_KEY = "hasanat-lang";

function readCachedLanguage(): Language {
	const saved = localStorage.getItem(LANGUAGE_CACHE_KEY);
	return saved === "bn" ? "bn" : "en";
}

function persistLanguageToFirestore(uid: string, lang: Language) {
	setDoc(
		doc(db, "users", uid),
		{
			settings: { language: lang },
			settingsUpdatedAt: serverTimestamp(),
		},
		{ merge: true },
	).catch((err: unknown) => {
		console.warn("Failed to sync language to Firestore:", err);
	});
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
	const [language, setLanguageState] = useState<Language>(readCachedLanguage);
	const [authUid, setAuthUid] = useState<string | null>(null);

	useEffect(() => {
		document.documentElement.lang = language;
	}, [language]);

	// Direct Firebase auth subscription — I18nProvider sits outside AuthProvider
	// in the tree, so we cannot use useAuth() here.
	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (user: User | null) => {
			setAuthUid(user?.uid ?? null);
		});
		return unsub;
	}, []);

	// On auth resolve, hydrate language from Firestore (source of truth).
	// localStorage cache only powers first paint before auth resolves.
	useEffect(() => {
		if (!authUid) return;
		let cancelled = false;
		void (async () => {
			try {
				const snap = await getDoc(doc(db, "users", authUid));
				if (cancelled || !snap.exists()) return;
				const remote = (snap.data() as { settings?: { language?: string } })
					.settings?.language;
				if (remote === "bn" || remote === "en") {
					setLanguageState((prev) => {
						if (prev === remote) return prev;
						localStorage.setItem(LANGUAGE_CACHE_KEY, remote);
						return remote;
					});
				}
			} catch (err) {
				console.warn("Failed to read language from Firestore:", err);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [authUid]);

	const setLanguage = useCallback(
		(lang: Language) => {
			setLanguageState(lang);
			localStorage.setItem(LANGUAGE_CACHE_KEY, lang);
			if (authUid) persistLanguageToFirestore(authUid, lang);
		},
		[authUid],
	);

	const t = useCallback(
		(key: TranslationKey): string => {
			return translations[language][key] || translations.en[key] || key;
		},
		[language],
	);

	return (
		<I18nContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</I18nContext.Provider>
	);
};

export const useI18n = () => {
	const ctx = useContext(I18nContext);
	if (!ctx) throw new Error("useI18n must be used within I18nProvider");
	return ctx;
};
