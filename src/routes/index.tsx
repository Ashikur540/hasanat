import { createBrowserRouter } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/features/auth";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AmalGraph from "@/pages/AmalGraph";
import MyCity from "@/pages/MyCity";
import Deeds from "@/pages/Deeds";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Leaderboard from "@/pages/Leaderboard";
import Circles from "@/pages/Circles";
import Ramadan from "@/pages/Ramadan";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
	{ path: "/", element: <Index /> },
	{ path: "/auth", element: <Auth /> },
	{
		element: <ProtectedRoute />,
		children: [
			{
				element: <AppLayout />,
				children: [
					{ path: "/dashboard", element: <Dashboard /> },
					{ path: "/amal-graph", element: <AmalGraph /> },
					{ path: "/my-city", element: <MyCity /> },
					{ path: "/deeds", element: <Deeds /> },
					{ path: "/profile", element: <Profile /> },
					{ path: "/settings", element: <Settings /> },
					{ path: "/leaderboard", element: <Leaderboard /> },
					{ path: "/circles", element: <Circles /> },
					{ path: "/ramadan", element: <Ramadan /> },
				],
			},
		],
	},
	{ path: "*", element: <NotFound /> },
]);
