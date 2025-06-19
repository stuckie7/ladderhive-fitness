import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileHeader from "./ProfileHeader";
import StatsGrid from "./StatsGrid";
import FitnessStats from "./FitnessStats";
import FitnessGoals from "./FitnessGoals";
import WorkoutSchedule from "./WorkoutSchedule";
import ProgressTracking from "./ProgressTracking";
import BodyMeasurements from "./BodyMeasurements";
import FitbitConnectionStatus from "./FitbitConnectionStatus";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { HeartPulse, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HealthIntegration from "@/components/Health/HealthIntegration";

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
    daily_step_goal?: number;
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
  const [showHealthModal, setShowHealthModal] = useState(false);
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
      {/* Health Integration Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <HeartPulse className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg font-medium">Health Integration</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowHealthModal(true)}
            className="flex items-center space-x-1"
          >
            <span>View Health Stats</span>
            <HeartPulse className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your Fitbit to track your fitness metrics and sync your workout data.
          </p>
        </CardContent>
      </Card>

      {/* Health Integration Modal */}
      <Dialog open={showHealthModal} onOpenChange={setShowHealthModal}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-slate-100">Health & Fitness Integration</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowHealthModal(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <HealthIntegration initialStepGoal={userData.profile?.daily_step_goal} />
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-2">
          <ProfileHeader 
            name={userData.name} 
            email={userData.email} 
            fitnessLevel={userData.profile?.fitnessLevel}
            photoUrl={userData.profile_photo_url}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <StatsGrid 
            workoutsCompleted={realStats.workoutsCompleted}
            totalMinutes={realStats.totalMinutes}
            streakDays={realStats.streakDays}
            caloriesBurned={realStats.caloriesBurned}
          />
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Fitness Goals</h3>
              <FitnessGoals goals={userData.profile?.fitnessGoals || []} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Body Measurements</h3>
              <BodyMeasurements 
                neck={userData.profile?.neck}
                chest={userData.profile?.chest}
                waist={userData.profile?.waist}
                hips={userData.profile?.hips}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Health Integrations</h3>
              <FitbitConnectionStatus />
            </div>
          </div>
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
