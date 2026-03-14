import { useState } from "react";
import { Navigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { GoogleIcon } from "@/common/icons/GoogleIcon";

const Auth = () => {
	const { signInWithGoogle, user, loading } = useAuth();
	const { t } = useI18n();
	const [signingIn, setSigningIn] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Still resolving auth state → render nothing to avoid flash
	if (loading) return null;

	// Already signed in → send to dashboard immediately
	if (user) return <Navigate to="/dashboard" replace />;

	const handleGoogleSignIn = async () => {
		setSigningIn(true);
		setError(null);
		try {
			await signInWithGoogle();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "";
			if (!msg.includes("popup-closed"))
				setError("Sign in failed. Please try again.");
			console.error("Sign in error:", err);
			setSigningIn(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center px-4">
			<div className="absolute inset-0 -z-10">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
			</div>

			<Card className="w-full max-w-md border-border shadow-xl">
				<CardHeader className="text-center space-y-3 pb-4">
					<p className="font-arabic text-xl text-primary">﷽</p>
					<div>
						<CardTitle className="text-2xl font-bold">
							{t("authWelcome")}
						</CardTitle>
						<CardDescription className="mt-1">
							{t("authSubtitle")}
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-5">
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">
								Continue with
							</span>
						</div>
					</div>

					<Button
						className="w-full gap-3 h-11 font-medium"
						variant="outline"
						onClick={handleGoogleSignIn}
						loading={signingIn}
					>
						{!signingIn && <GoogleIcon />}
						{signingIn ? "Signing in..." : "Continue with Google"}
					</Button>

					{error && (
						<p className="text-center text-xs text-destructive">{error}</p>
					)}

					<p className="text-center text-xs text-muted-foreground leading-relaxed italic border-t border-border pt-4">
						"Points are for your motivation only. The true reward of every deed
						is with Allah alone."
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default Auth;
