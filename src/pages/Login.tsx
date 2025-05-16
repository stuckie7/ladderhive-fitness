
import LoginForm from "@/components/auth/LoginForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  useEffect(() => {
    // Only redirect if user is logged in and we're not still loading
    // Also check redirectAttempted to prevent multiple redirects
    if (user && !loading && !redirectAttempted) {
      setRedirectAttempted(true);
      navigate("/dashboard");
    }
  }, [user, loading, navigate, redirectAttempted]);
  
  // If still loading auth state, don't render anything yet to prevent flashing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fitness-primary"></div>
      </div>
    );
  }
  
  // Only render the login form if user is not authenticated
  if (!user) {
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
  }
  
  // Return empty div while redirecting, this prevents render cycles
  return <div></div>;
};

export default Login;
