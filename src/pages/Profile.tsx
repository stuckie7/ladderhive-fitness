
import AppLayout from "@/components/layout/AppLayout";
import UserProfile from "@/components/profile/UserProfile";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface UserProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  name: string;
  profile_photo_url?: string | null;
  profile?: any;
  stats?: {
    workoutsCompleted: number;
    totalMinutes: number;
    streakDays: number;
    caloriesBurned: number;
  };
}

interface UserWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  status: string;
  completed_at: string | null;
  workout: {
    id: string;
    title: string;
    description: string;
    duration: number;
    difficulty: string;
  };
}

const Profile = () => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
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
        const totalMinutes = completedWorkouts && completedWorkouts.length > 0 
          ? completedWorkouts.reduce((sum, workout) => 
              sum + ((workout.workout as any)?.duration || 0), 0)
          : 0;
        
        const caloriesBurned = Math.round(totalMinutes * 6.5); // Simple estimation
        
        // Calculate streak (placeholder logic - would need more complex date-based calculations in real app)
        const streakDays = completedWorkouts ? Math.min(completedWorkouts.length, 5) : 0;
        
        if (profile) {
          setUserData({
            id: user.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            profile_photo_url: profile.profile_photo_url,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email || '',
            email: user.email || '',
            stats: {
              workoutsCompleted: completedWorkouts ? completedWorkouts.length : 0,
              totalMinutes,
              streakDays,
              caloriesBurned
            }
          });
        }
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
      <div className="pb-24 md:pb-0">
        {isLoading ? (
          <ProfileSkeleton />
        ) : userData ? (
          <UserProfile userData={userData} />
        ) : (
          <div>No user data available</div>
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
