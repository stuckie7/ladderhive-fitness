import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Dumbbell, 
  Flame, 
  ChevronRight,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserData {
  name: string;
  email: string;
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
  const navigate = useNavigate();
  
  const stats = userData.stats || {
    workoutsCompleted: 0,
    totalMinutes: 0,
    streakDays: 0,
    caloriesBurned: 0
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const formatFitnessLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{userData.name}</CardTitle>
              <CardDescription>{userData.email}</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={userData.name} />
              <AvatarFallback className="bg-fitness-primary text-white text-lg">
                {getInitials(userData.name)}
              </AvatarFallback>
            </Avatar>
            {userData.profile && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fitness Level</p>
                <p className="font-medium">{formatFitnessLevel(userData.profile.fitnessLevel)}</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="flex flex-col items-center">
                <Dumbbell className="h-5 w-5 text-fitness-primary mb-1" />
                <p className="text-xl font-semibold">{stats.workoutsCompleted}</p>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex flex-col items-center">
                <Clock className="h-5 w-5 text-fitness-primary mb-1" />
                <p className="text-xl font-semibold">{stats.totalMinutes}</p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex flex-col items-center">
                <Calendar className="h-5 w-5 text-fitness-primary mb-1" />
                <p className="text-xl font-semibold">{stats.streakDays}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex flex-col items-center">
                <Flame className="h-5 w-5 text-fitness-primary mb-1" />
                <p className="text-xl font-semibold">{stats.caloriesBurned}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-2">
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="text-lg font-semibold">{userData.profile.height} cm</p>
              </div>
              <div className="text-center p-2">
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="text-lg font-semibold">{userData.profile.weight} kg</p>
              </div>
              <div className="text-center p-2">
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="text-lg font-semibold">{userData.profile.age}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Fitness Goals</p>
              <div className="flex flex-wrap gap-2">
                {userData.profile.fitnessGoals.map((goal, index) => (
                  <span 
                    key={index}
                    className="bg-fitness-primary/10 text-fitness-primary text-xs px-2 py-1 rounded-full"
                  >
                    {goal.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Workout Schedule</p>
              <div className="flex justify-between">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div 
                    key={day} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      userData.profile!.workoutDays.includes(day.toLowerCase())
                        ? "bg-fitness-primary text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"
                    }`}
                  >
                    {day.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Progress Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                Start tracking workouts to see your progress charts
              </p>
            </div>
          </div>
          
          <Button
            className="w-full bg-fitness-primary hover:bg-fitness-primary/90"
            onClick={() => navigate('/progress')}
          >
            <span>View Detailed Progress</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
