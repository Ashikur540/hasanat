import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/I18nProvider";
import { NotificationProvider } from "@/hooks/useNotifications";
import { AuthProvider } from "@/features/auth";
import { router } from "@/routes";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<I18nProvider>
			<AuthProvider>
				<NotificationProvider>
					<TooltipProvider>
						<Toaster />
						<Sonner />
						<RouterProvider
							router={router}
							future={{ v7_startTransition: true }}
						/>
					</TooltipProvider>
				</NotificationProvider>
			</AuthProvider>
		</I18nProvider>
	</QueryClientProvider>
);

export default App;
