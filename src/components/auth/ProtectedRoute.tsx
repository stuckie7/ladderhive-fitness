
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Create or fetch daily progress when user is authenticated
  useEffect(() => {
    const ensureDailyProgress = async () => {
      if (!user) return;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if there's an entry for today
        const { data, error } = await supabase
          .from('daily_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();
        
        if (error) throw error;
        
        // If no entry exists for today, create one
        if (!data) {
          await supabase
            .from('daily_progress')
            .insert({
              user_id: user.id,
              date: today
            });
        }
      } catch (error) {
        console.error('Error ensuring daily progress:', error);
      }
    };
    
    ensureDailyProgress();
  }, [user]);

  // If still loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-fitness-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child routes
  return <>{children}</>;
};

export default ProtectedRoute;
