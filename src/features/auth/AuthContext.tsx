import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import {
	User,
	onAuthStateChanged,
	signInWithPopup,
	signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
	doc,
	setDoc,
	getDoc,
	updateDoc,
	serverTimestamp,
} from "firebase/firestore";
import { getUserPhotoURL } from "@/lib/userAvatar";
import { runPreferencesMigration } from "@/lib/preferencesMigration";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signInWithGoogle: () => Promise<void>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let unsubscribe = () => undefined;
		let cancelled = false;

		const initializeAuth = async () => {
			if (cancelled) {
				return;
			}

			unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
				try {
					if (firebaseUser) {
						const userRef = doc(db, "users", firebaseUser.uid);
						const userSnap = await getDoc(userRef);
						const resolvedPhotoURL = getUserPhotoURL(firebaseUser);
						if (!userSnap.exists()) {
							// Auto-detect browser timezone so Cloud Functions
							// (tipDispatch, prayerReminderDispatch, streakDailyEvaluate)
							// have the field from day 1. User can override in Settings.
							let detectedTz = "UTC";
							try {
								detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
							} catch {
								// Fallback: UTC
							}
							await setDoc(userRef, {
								uid: firebaseUser.uid,
								name: firebaseUser.displayName,
								email: firebaseUser.email,
								photoURL: resolvedPhotoURL,
								username: firebaseUser.email?.split("@")[0] ?? firebaseUser.uid,
								isPublic: true,
								isOnLeaderboard: false,
								createdAt: serverTimestamp(),
								timezone: detectedTz,
								timezoneUpdatedAt: serverTimestamp(),
							});
						} else if (
							resolvedPhotoURL &&
							!(userSnap.data() as { photoURL?: string | null }).photoURL
						) {
							await updateDoc(userRef, { photoURL: resolvedPhotoURL });
						}
						// One-shot localStorage → Firestore preferences migration.
						// Idempotent via marker key; skips fields already on remote.
						void runPreferencesMigration(firebaseUser.uid);
					}
					setUser(firebaseUser);
				} catch (err) {
					setUser(firebaseUser);
				} finally {
					setLoading(false);
				}
			});
		};

		initializeAuth();

		return () => {
			cancelled = true;
			unsubscribe();
		};
	}, []);

	const signInWithGoogle = async () => {
		await signInWithPopup(auth, googleProvider);
	};

	const signOut = async () => {
		await firebaseSignOut(auth);
	};

	return (
		<AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
};
