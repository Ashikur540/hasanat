import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import { registerPwaServiceWorker } from "@/lib/pwa";

registerPwaServiceWorker();

createRoot(document.getElementById("root")!).render(
	<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
		<App />
	</ThemeProvider>,
);
