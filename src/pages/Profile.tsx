
import AppLayout from "@/components/layout/AppLayout";
import UserProfile from "@/components/profile/UserProfile";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Fetch user profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        // Fetch user workout stats
        const { data: completedWorkouts, error: workoutsError } = await supabase
          .from('user_workouts')
          .select('*, workout:workouts(*)')
          .eq('user_id', user.id)
          .eq('status', 'completed');
        
        if (workoutsError) throw workoutsError;
        
        // Calculate stats
        const totalMinutes = completedWorkouts.reduce((sum, workout) => sum + workout.workout.duration, 0);
        const caloriesBurned = Math.round(totalMinutes * 6.5); // Simple estimation
        
        // Calculate streak (placeholder logic - would need more complex date-based calculations in real app)
        const streakDays = Math.min(completedWorkouts.length, 5);
        
        setUserData({
          ...profile,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email,
          email: user.email,
          stats: {
            workoutsCompleted: completedWorkouts.length,
            totalMinutes,
            streakDays,
            caloriesBurned
          }
        });
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);
  
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          userData && <UserProfile userData={userData} />
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
