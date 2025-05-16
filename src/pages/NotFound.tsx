
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);
  
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-6xl font-bold mb-4 text-gray-800 dark:text-gray-200">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Oops! Page not found</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            onClick={handleGoBack} 
            variant="outline" 
            className="mb-4 sm:mb-0"
          >
            Go Back
          </Button>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
