
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If still loading, show a loading spinner
  if (loading) {
    console.log("ProtectedRoute: Still loading auth state");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-fitness-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // If not logged in, redirect to login page but preserve the intended destination
  if (!user) {
    console.log("ProtectedRoute: User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If logged in, render the child routes
  console.log("ProtectedRoute: User authenticated, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
