import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useRef,
	type ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nProvider";

const deedTips = {
	en: [
		"Smile at someone today — it's a form of charity! 😊",
		"Recite Surah Al-Ikhlas 3 times — equal to reading the entire Quran!",
		"Say SubhanAllah 33x, Alhamdulillah 33x, Allahu Akbar 34x after every salah.",
		"Give water to someone thirsty — one of the best forms of sadaqah.",
		"Make dua for your parents — their blessings are a path to Jannah.",
		"Read just 1 page of Quran today — consistency matters more than quantity.",
		"Forgive someone who wronged you — Allah loves those who forgive.",
		"Help a neighbor — the Prophet ﷺ emphasized the rights of neighbors.",
		"Fast a voluntary Monday or Thursday — following the Sunnah.",
		"Teach someone something beneficial — a deed that continues after you.",
		"If you can, share a hadith or Quran verse that inspires you with a friend or on social media — you never know who might need to hear it!",
		"If you missed a prayer, make it up as soon as you can — it's never too late to return to Allah.",
	],
	bn: [
		"আজ কাউকে হাসুন — এটি সাদাকাহর একটি রূপ! 😊",
		"সূরা আল-ইখলাস ৩ বার পড়ুন — পুরো কুরআন পড়ার সমান!",
		"প্রতি সালাতের পর সুবহানাল্লাহ ৩৩x, আলহামদুলিল্লাহ ৩৩x, আল্লাহু আকবার ৩৪x বলুন।",
		"তৃষ্ণার্তকে পানি দিন — সাদাকাহর সেরা রূপগুলোর একটি।",
		"আপনার বাবা-মায়ের জন্য দোয়া করুন — তাদের দোয়া জান্নাতের পথ।",
		"আজ কুরআনের মাত্র ১ পৃষ্ঠা পড়ুন — ধারাবাহিকতা পরিমাণের চেয়ে বেশি গুরুত্বপূর্ণ।",
		"যে আপনার ক্ষতি করেছে তাকে ক্ষমা করুন — আল্লাহ ক্ষমাশীলদের ভালোবাসেন।",
		"একজন প্রতিবেশীকে সাহায্য করুন — নবী ﷺ প্রতিবেশীর অধিকারের উপর জোর দিয়েছেন।",
		"সোমবার বা বৃহস্পতিবার নফল রোজা রাখুন — সুন্নাহ অনুসরণ।",
		"কাউকে উপকারী কিছু শেখান — এমন আমল যা আপনার পরেও চলতে থাকে।",
		"যদি পারেন, তাহলে একটি হাদিস বা কুরআনের আয়াত শেয়ার করুন যা আপনাকে অনুপ্রাণিত করে একটি বন্ধুর সাথে বা সোশ্যাল মিডিয়ায় — আপনি কখন জানবেন কে এটি শুনতে চাইতে পারে!",
		"যদি আপনি কোনো সালাত মিস করেন, তাহলে যত তাড়াতাড়ি সম্ভব তত দ্রুত এটি কাজা আদায় করুন — আল্লাহর কাছে ফিরে আসা কখনই খুবই দেরি না!",
	],
};

interface NotificationSettings {
	dailyReminder: boolean;
	streakAlerts: boolean;
	circleUpdates: boolean;
	weeklyReport: boolean;
	deedTips: boolean;
	reminderTime: string;
}

interface NotificationContextType {
	settings: NotificationSettings;
	updateSetting: (
		key: keyof NotificationSettings,
		value: boolean | string,
	) => void;
	sendTestNotification: (
		type: "reminder" | "streak" | "tip" | "weekly",
	) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const { toast } = useToast();
	const { t, language } = useI18n();
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const [settings, setSettings] = useState<NotificationSettings>(() => {
		try {
			const saved = localStorage.getItem("hasanat-notif-settings");
			if (saved) return JSON.parse(saved);
		} catch {
			// If parsing fails, return defaults
		}
		return {
			dailyReminder: true,
			streakAlerts: true,
			circleUpdates: false,
			weeklyReport: true,
			deedTips: true,
			reminderTime: "08:00",
		};
	});

	useEffect(() => {
		localStorage.setItem("hasanat-notif-settings", JSON.stringify(settings));
	}, [settings]);

	const updateSetting = useCallback(
		(key: keyof NotificationSettings, value: boolean | string) => {
			setSettings((prev) => ({ ...prev, [key]: value }));
		},
		[],
	);

	const sendTestNotification = useCallback(
		(type: "reminder" | "streak" | "tip" | "weekly") => {
			const tips = deedTips[language] || deedTips.en;
			const randomTip = tips[Math.floor(Math.random() * tips.length)];

			switch (type) {
				case "reminder":
					toast({
						title: t("notifReminderTitle"),
						description: t("notifReminderBody"),
					});
					break;
				case "streak":
					toast({
						title: t("notifStreakTitle"),
						description: t("notifStreakBody"),
						variant: "destructive",
					});
					break;
				case "tip":
					toast({ title: t("notifTipTitle"), description: randomTip });
					break;
				case "weekly":
					toast({
						title: t("notifWeeklyTitle"),
						description: t("notifWeeklyBody"),
					});
					break;
			}
		},
		[toast, t, language],
	);

	// Auto deed tips every 2 minutes if enabled
	useEffect(() => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		if (settings.deedTips) {
			// Show a tip after 30 seconds, then every 2 minutes
			const timeout = setTimeout(() => {
				sendTestNotification("tip");
				intervalRef.current = setInterval(
					() => sendTestNotification("tip"),
					120000,
				);
			}, 30000);
			return () => {
				clearTimeout(timeout);
				if (intervalRef.current) clearInterval(intervalRef.current);
			};
		}
	}, [settings.deedTips, sendTestNotification]);

	return (
		<NotificationContext.Provider
			value={{ settings, updateSetting, sendTestNotification }}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotifications = () => {
	const ctx = useContext(NotificationContext);
	if (!ctx)
		throw new Error(
			"useNotifications must be used within NotificationProvider",
		);
	return ctx;
};
