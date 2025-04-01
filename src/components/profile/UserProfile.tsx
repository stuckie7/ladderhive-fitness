
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";
import StatsGrid from "./StatsGrid";
import FitnessStats from "./FitnessStats";
import FitnessGoals from "./FitnessGoals";
import WorkoutSchedule from "./WorkoutSchedule";
import ProgressTracking from "./ProgressTracking";

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
  const stats = userData.stats || {
    workoutsCompleted: 0,
    totalMinutes: 0,
    streakDays: 0,
    caloriesBurned: 0
  };

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
            workoutsCompleted={stats.workoutsCompleted}
            totalMinutes={stats.totalMinutes}
            streakDays={stats.streakDays}
            caloriesBurned={stats.caloriesBurned}
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
