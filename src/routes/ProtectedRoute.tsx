import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/common/components/skeletons/DashboardSkeleton";

const ProtectedRoute = () => {
	const { user, loading } = useAuth();

	if (loading) return <DashboardSkeleton />;

	return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
