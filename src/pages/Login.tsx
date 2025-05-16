
import LoginForm from "@/components/auth/LoginForm";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  useEffect(() => {
    // Only redirect if user is authenticated and not loading
    if (user && !loading) {
      console.log("Login: User is authenticated, redirecting to dashboard");
      
      // Get the redirect path from location state or default to dashboard
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);
  
  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fitness-primary"></div>
      </div>
    );
  }
  
  // Only render the login form if user is NOT authenticated
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md mb-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-fitness-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">LH</span>
          </div>
          <h1 className="text-3xl font-bold">LadderHive Fitness</h1>
          <p className="text-muted-foreground mt-2">Your journey to better fitness starts here</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
