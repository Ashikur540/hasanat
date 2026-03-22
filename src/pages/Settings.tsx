import { motion } from "framer-motion";
import { FormProvider } from "react-hook-form";
import { Loader2 } from "lucide-react";
import {
	LanguageSettings,
	AppearanceSettings,
	NotificationSettings,
	LocationSettings,
	TimezoneSettings,
	PrivacySettings,
	AccountSettings,
	fadeUp,
	stagger,
} from "@/features/settings";
import { useI18n } from "@/i18n/I18nProvider";
import { useSettingsForm } from "@/features/settings/hooks/useSettingsForm";
import { DashboardSkeleton } from "@/common/components/skeletons/DashboardSkeleton";

const Settings = () => {
	const { t } = useI18n();
	const { form, isLoading } = useSettingsForm();

	return (
		<FormProvider {...form}>
			<motion.div
				initial="hidden"
				animate="visible"
				variants={stagger}
				className="container mx-auto px-4 py-6 space-y-6 max-w-2xl"
			>
				<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
					<h1 className="text-2xl md:text-3xl font-bold text-foreground">
						{t("settingsTitle")}
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						{t("settingsSubtitle")}
					</p>
				</motion.div>

				{isLoading ? (
					<DashboardSkeleton />
				) : (
					<>
						<LanguageSettings />
						<AppearanceSettings />
						<NotificationSettings />
						<LocationSettings />
						<TimezoneSettings />
						<PrivacySettings />
						<AccountSettings />
					</>
				)}
			</motion.div>
		</FormProvider>
	);
};

export default Settings;
