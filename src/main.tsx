import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import { registerPwaServiceWorker } from "@/lib/pwa";

registerPwaServiceWorker();

// Cleanup: keys obsoleted by Cloud Functions (server now owns scheduling + dedup).
// Safe to delete unconditionally — Cloud Functions are the source of truth.
localStorage.removeItem("hasanat-notif-sent-v1");
localStorage.removeItem("hasanat-notif-tip-schedule-v1");

createRoot(document.getElementById("root")!).render(
	<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
		<App />
	</ThemeProvider>,
);
