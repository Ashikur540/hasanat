import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, GoogleSignInButton } from "@/features/auth";
import { useI18n } from "@/i18n/I18nProvider";

const Auth = () => {
	const { user, loading } = useAuth();
	const { t } = useI18n();

	if (loading) return null;
	if (user) return <Navigate to="/dashboard" replace />;

	return (
		<>
		<Helmet>
			<title>Sign In | Hasanat</title>
			<meta name="robots" content="noindex" />
			<link rel="canonical" href="https://hasanat.app/auth" />
		</Helmet>
		<div className="min-h-screen bg-background flex items-center justify-center px-4">
			<div className="absolute inset-0 -z-10">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
			</div>
			<Card className="w-full max-w-md border-border shadow-xl">
				<CardHeader className="text-center space-y-3 pb-4">
					<p className="font-arabic text-xl text-primary">﷽</p>
					<div>
						<CardTitle className="text-2xl font-bold">{t("authWelcome")}</CardTitle>
						<CardDescription className="mt-1">{t("authSubtitle")}</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">Continue with</span>
						</div>
					</div>
					<GoogleSignInButton />
					<p className="text-center text-xs text-muted-foreground leading-relaxed italic border-t border-border pt-4">
						"Points are for your motivation only. The true reward of every deed is with Allah alone."
					</p>
				</CardContent>
			</Card>
		</div>
		</>
	);
};

export default Auth;
