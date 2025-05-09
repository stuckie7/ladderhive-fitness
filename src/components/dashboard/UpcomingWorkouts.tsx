
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, ChevronRight, Dumbbell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { format, parseISO, isToday, isTomorrow, addDays, isBefore, differenceInDays } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface UpcomingWorkout {
  id: string;
  title: string;
  date: string;
  duration: number;
  difficulty: string;
}

interface UpcomingWorkoutsProps {
  workouts: UpcomingWorkout[];
  isLoading: boolean;
  onScheduleWorkout?: () => void;
}

const UpcomingWorkouts = ({ 
  workouts, 
  isLoading,
  onScheduleWorkout
}: UpcomingWorkoutsProps) => {
  const { toast } = useToast();
  
  const getFormattedDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    
    const daysAway = differenceInDays(date, new Date());
    if (daysAway < 7) return format(date, 'EEEE'); // Day name if within a week
    
    return format(date, 'E, MMM d');
  };

  // Sort workouts by date, closest first
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Only show upcoming workouts (today or future)
  const upcomingWorkouts = sortedWorkouts.filter(workout => 
    !isBefore(parseISO(workout.date), addDays(new Date(), -1))
  );
  
  // Limit to 3 for display
  const displayWorkouts = upcomingWorkouts.slice(0, 3);
  
  const handleQuickSchedule = () => {
    if (onScheduleWorkout) {
      onScheduleWorkout();
    } else {
      toast({
        title: "Coming soon!",
        description: "Quick workout scheduling will be available soon.",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-900/30 text-green-400';
      case 'intermediate':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'advanced':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-blue-900/30 text-blue-400';
    }
  };

  return (
    <Card className="glass-panel h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2 text-fitness-secondary">
          <Calendar className="h-5 w-5" />
          <span>Upcoming Workouts</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2" 
            onClick={handleQuickSchedule}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            <span>Quick Add</span>
          </Button>
          <Link to="/schedule">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <span>Schedule</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : displayWorkouts.length > 0 ? (
          <div className="space-y-3">
            {displayWorkouts.map((workout) => (
              <Link
                key={workout.id}
                to={`/workouts/${workout.id}`}
                className="block p-3 border border-gray-800/50 rounded-lg hover:border-fitness-secondary/50 hover:bg-gray-900/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium group-hover:text-fitness-secondary transition-colors">
                      {workout.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {workout.duration} minutes
                      </p>
                      <Badge className={`text-xs px-2 py-0.5 ${getDifficultyColor(workout.difficulty)}`}>
                        {workout.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs px-3 py-1.5 rounded-md bg-fitness-secondary/10 text-fitness-secondary">
                    {getFormattedDate(workout.date)}
                  </div>
                </div>
              </Link>
            ))}
            
            {displayWorkouts.length < upcomingWorkouts.length && (
              <Link to="/schedule" className="block text-center pt-2 text-sm text-muted-foreground hover:text-fitness-secondary transition-colors">
                View {upcomingWorkouts.length - displayWorkouts.length} more upcoming workouts
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-white">No upcoming workouts</h3>
            <p className="mt-2 text-gray-400">
              Schedule your next workout session
            </p>
            <Button className="mt-6 btn-fitness-secondary" onClick={handleQuickSchedule}>
              Schedule Workout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingWorkouts;
