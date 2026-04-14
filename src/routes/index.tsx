import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import AppLayout from "@/layout/AppLayout";
import { ProtectedRoute } from "@/features/auth";

const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AmalGraph = lazy(() => import("@/pages/AmalGraph"));
const Deeds = lazy(() => import("@/pages/Deeds"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const MyCustomDeeds = lazy(() => import("@/pages/MyCustomDeeds"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const withRouteSuspense = (element: ReactNode) => (
	<Suspense
		fallback={
			<div className="container mx-auto px-4 py-6 text-sm text-muted-foreground">
				Loading...
			</div>
		}
	>
		{element}
	</Suspense>
);

export const router = createBrowserRouter([
	{ path: "/", element: withRouteSuspense(<Index />) },
	{ path: "/auth", element: withRouteSuspense(<Auth />) },
	{ path: "/profile/:userId", element: withRouteSuspense(<Profile />) },
	// Public routes — accessible without login (AppLayout handles unauth state)
	{
		element: <AppLayout />,
		children: [{ path: "/deeds", element: withRouteSuspense(<Deeds />) }],
	},
	// Protected routes — redirect to /auth if not logged in
	{
		element: <ProtectedRoute />,
		children: [
			{
				element: <AppLayout />,
				children: [
					{ path: "/dashboard", element: withRouteSuspense(<Dashboard />) },
					{ path: "/amal-graph", element: withRouteSuspense(<AmalGraph />) },
					// { path: "/my-city", element: <MyCity /> },
					{ path: "/profile", element: withRouteSuspense(<Profile />) },
					{ path: "/settings", element: withRouteSuspense(<Settings />) },
					{ path: "/leaderboard", element: withRouteSuspense(<Leaderboard />) },
					// { path: "/circles", element: <Circles /> },
					// { path: "/ramadan", element: <Ramadan /> },
					{ path: "/my-deeds", element: withRouteSuspense(<MyCustomDeeds />) },
				],
			},
		],
	},
	{ path: "*", element: withRouteSuspense(<NotFound />) },
]);
