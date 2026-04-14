import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useI18n } from "@/i18n/I18nProvider";

const ConnectivityBanner = () => {
	const { isOffline } = useOnlineStatus();
	const { language } = useI18n();
	const isBn = language === "bn";

	return (
		<AnimatePresence>
			{isOffline && (
				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 14 }}
					transition={{ duration: 0.2 }}
					className="fixed z-[120] left-4 right-4 bottom-24 md:bottom-4 md:left-1/2 md:right-auto md:-translate-x-1/2"
				>
					<div
						className={[
							"rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm flex items-center gap-2.5",
							"bg-yellow-500/15 border-yellow-500/35 text-yellow-900 dark:text-yellow-200",
						].join(" ")}
					>
						<WifiOff className="h-4 w-4 shrink-0" />
						<p className="text-xs md:text-sm font-medium">
							{isBn
								? "ইন্টারনেট নেই। আবার সংযোগ হলে ডাটা আপডেট হবে।"
								: "No internet connection. Data will sync when you're back online."}
						</p>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default ConnectivityBanner;
