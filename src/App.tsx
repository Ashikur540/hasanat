import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HelmetProvider } from "react-helmet-async";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/I18nProvider";
import { NotificationProvider } from "@/hooks/NotificationProvider";
import ConnectivityBanner from "@/common/components/ConnectivityBanner";
import { AuthProvider } from "@/features/auth";
import { router } from "@/routes";

const queryClient = new QueryClient();

const App = () => (
	<HelmetProvider>
	<QueryClientProvider client={queryClient}>
		<ReactQueryDevtools initialIsOpen={false} />
		<I18nProvider>
			<AuthProvider>
				<NotificationProvider>
					<TooltipProvider>
						<Toaster />
						<Sonner />
						<ConnectivityBanner />
						<RouterProvider
							router={router}
							future={{ v7_startTransition: true }}
						/>
					</TooltipProvider>
				</NotificationProvider>
			</AuthProvider>
		</I18nProvider>
	</QueryClientProvider>
	</HelmetProvider>
);

export default App;
