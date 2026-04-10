import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp } from "../constants";

interface ProfilePrivateViewProps {
	t: (key: string) => string;
}

export function ProfilePrivateView({ t }: ProfilePrivateViewProps) {
	return (
		<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
			<Card className="border-border bg-card">
				<CardContent className="p-8 text-center space-y-3">
					<Lock className="h-12 w-12 mx-auto text-muted-foreground" />
					<h2 className="text-xl font-bold text-foreground">{t("profilePrivate")}</h2>
					<p className="text-sm text-muted-foreground">{t("profilePrivateDesc")}</p>
					<p className="text-sm text-muted-foreground">
						{t("profilePrivateHiddenContent")}
					</p>
				</CardContent>
			</Card>
		</motion.div>
	);
}
