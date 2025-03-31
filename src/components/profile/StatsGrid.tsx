
import { BarChart3, Calendar, Clock, Dumbbell, Flame } from "lucide-react";
import StatCard from "./StatCard";

interface StatsGridProps {
  workoutsCompleted: number;
  totalMinutes: number;
  streakDays: number;
  caloriesBurned: number;
}

const StatsGrid = ({ 
  workoutsCompleted, 
  totalMinutes, 
  streakDays, 
  caloriesBurned 
}: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        icon={<Dumbbell className="h-5 w-5 text-fitness-primary mb-1" />}
        value={workoutsCompleted}
        label="Workouts"
      />
      
      <StatCard 
        icon={<Clock className="h-5 w-5 text-fitness-primary mb-1" />}
        value={totalMinutes}
        label="Minutes"
      />
      
      <StatCard 
        icon={<Calendar className="h-5 w-5 text-fitness-primary mb-1" />}
        value={streakDays}
        label="Day Streak"
      />
      
      <StatCard 
        icon={<Flame className="h-5 w-5 text-fitness-primary mb-1" />}
        value={caloriesBurned}
        label="Calories"
      />
    </div>
  );
};

export default StatsGrid;
