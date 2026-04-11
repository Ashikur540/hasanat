import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/features/auth/AuthContext";

export const useAuthActions = () => {
  const { signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/unauthorized-domain") {
          setError(
            "This domain is not authorized in Firebase Auth. Add it in Firebase Console → Authentication → Settings → Authorized domains.",
          );
        } else if (err.code === "auth/popup-blocked") {
          setError("Popup was blocked. Please allow popups and try again.");
        } else if (err.code !== "auth/popup-closed-by-user") {
          setError("Sign in failed. Please try again.");
        }
      } else {
        const msg = err instanceof Error ? err.message : "";
        if (!msg.includes("popup-closed")) {
          setError("Sign in failed. Please try again.");
        }
      }
      console.error("Sign in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth", { replace: true });
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return {
    loading,
    error,
    handleGoogleSignIn,
    handleSignOut,
  };
};
