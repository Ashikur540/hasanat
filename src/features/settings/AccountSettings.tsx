import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, LogOut, Trash2, Lock } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { fadeUp } from "./animations";
import { useAuth } from "../auth";
import { toast } from "sonner";

const AccountSettings = () => {
	const { t } = useI18n();
	const { signOut } = useAuth();

	return (
		<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
			<Card className="border-destructive/30 bg-card">
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2 text-destructive">
						<Lock className="h-4 w-4" /> {t("settingsAccount")}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Button
						variant="outline"
						className="w-full justify-between"
						size="sm"
						onClick={signOut}
					>
						<span className="flex items-center gap-2">
							<LogOut className="h-4 w-4" /> {t("settingsSignOut")}
						</span>
						<ChevronRight className="h-4 w-4 text-muted-foreground" />
					</Button>
					<Button
						variant="outline"
						className="w-full justify-between text-destructive hover:text-destructive"
						size="sm"
						onClick={() =>
							toast.info("Account deletion is not implemented yet.")
						}
					>
						<span className="flex items-center gap-2">
							<Trash2 className="h-4 w-4" /> {t("settingsDeleteAccount")}
						</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default AccountSettings;
