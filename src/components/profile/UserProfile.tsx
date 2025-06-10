
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileHeader from "./ProfileHeader";
import StatsGrid from "./StatsGrid";
import FitnessStats from "./FitnessStats";
import FitnessGoals from "./FitnessGoals";
import WorkoutSchedule from "./WorkoutSchedule";
import ProgressTracking from "./ProgressTracking";
import BodyMeasurements from "./BodyMeasurements";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface UserData {
  name: string;
  email: string;
  profile_photo_url?: string | null;
  profile?: {
    height: number;
    weight: number;
    age: number;
    gender: string;
    fitnessLevel: string;
    fitnessGoals: string[];
    workoutDays: string[];
    neck?: number;
    chest?: number;
    waist?: number;
    hips?: number;
  };
  stats?: {
    workoutsCompleted: number;
    totalMinutes: number;
    streakDays: number;
    caloriesBurned: number;
  };
}

interface UserProfileProps {
  userData: UserData;
}

const UserProfile = ({ userData }: UserProfileProps) => {
  const { user } = useAuth();
  const [realStats, setRealStats] = useState(userData.stats || {
    workoutsCompleted: 0,
    totalMinutes: 0,
    streakDays: 0,
    caloriesBurned: 0
  });

  useEffect(() => {
    const fetchRealStats = async () => {
      if (!user) return;

      try {
        // Update user statistics first
        const { error: updateError } = await supabase.rpc('update_user_workout_statistics', {
          p_user_id: user.id
        });

        if (updateError) {
          console.error('Error updating user statistics:', updateError);
        }

        // Fetch the updated statistics
        const { data: stats, error } = await supabase
          .from('user_workout_statistics')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && stats) {
          setRealStats({
            workoutsCompleted: stats.total_workouts || 0,
            totalMinutes: stats.total_minutes || 0,
            streakDays: stats.current_streak || 0,
            caloriesBurned: stats.total_calories || 0
          });
        }
      } catch (error) {
        console.error('Error fetching real stats:', error);
      }
    };

    fetchRealStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <ProfileHeader 
            name={userData.name} 
            email={userData.email} 
            fitnessLevel={userData.profile?.fitnessLevel}
            photoUrl={userData.profile_photo_url}
          />
        </CardHeader>
        <CardContent>
          <StatsGrid 
            workoutsCompleted={realStats.workoutsCompleted}
            totalMinutes={realStats.totalMinutes}
            streakDays={realStats.streakDays}
            caloriesBurned={realStats.caloriesBurned}
          />
        </CardContent>
      </Card>
      
      {userData.profile && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">Fitness Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FitnessStats 
              height={userData.profile.height}
              weight={userData.profile.weight}
              age={userData.profile.age}
            />
            
            <FitnessGoals goals={userData.profile.fitnessGoals} />
            
            <WorkoutSchedule workoutDays={userData.profile.workoutDays} />
          </CardContent>
        </Card>
      )}

      {userData.profile && (userData.profile.neck || userData.profile.chest || userData.profile.waist || userData.profile.hips) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">Body Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <BodyMeasurements 
              neck={userData.profile.neck}
              chest={userData.profile.chest}
              waist={userData.profile.waist}
              hips={userData.profile.hips}
            />
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Progress Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressTracking />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
