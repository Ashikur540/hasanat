import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/i18n/I18nProvider";
import { NotificationProvider } from "@/hooks/useNotifications";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AmalGraph from "./pages/AmalGraph";
import MyCity from "./pages/MyCity";
import Deeds from "./pages/Deeds";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Leaderboard from "./pages/Leaderboard";
import Circles from "./pages/Circles";
import Ramadan from "./pages/Ramadan";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<I18nProvider>
			<NotificationProvider>
				<TooltipProvider>
					<Toaster />
					<Sonner />
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<Index />} />
							<Route path="/auth" element={<Auth />} />
							<Route element={<AppLayout />}>
								<Route path="/dashboardsss" element={<Dashboard />} />
								<Route path="/amal-graph" element={<AmalGraph />} />
								<Route path="/my-city" element={<MyCity />} />
								<Route path="/deeds" element={<Deeds />} />
								<Route path="/profile" element={<Profile />} />
								<Route path="/settings" element={<Settings />} />
								<Route path="/leaderboard" element={<Leaderboard />} />
								<Route path="/circles" element={<Circles />} />
								<Route path="/ramadan" element={<Ramadan />} />
							</Route>
							<Route path="*" element={<NotFound />} />
						</Routes>
					</BrowserRouter>
				</TooltipProvider>
			</NotificationProvider>
		</I18nProvider>
	</QueryClientProvider>
);

export default App;
