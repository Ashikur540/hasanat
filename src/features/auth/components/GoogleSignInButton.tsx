import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/common/icons/GoogleIcon";
import { useAuthActions } from "@/features/auth/hooks/useGoogleAuth";

export const GoogleSignInButton = () => {
	const { loading, error, handleGoogleSignIn } = useAuthActions();
	return (
		<>
			<Button
				className="w-full gap-3 h-11 font-medium"
				variant="outline"
				onClick={handleGoogleSignIn}
				loading={loading}
			>
				{!loading && <GoogleIcon />}
				{loading ? "Signing in..." : "Continue with Google"}
			</Button>
			{error && <p className="text-center text-xs text-destructive">{error}</p>}
		</>
	);
};
