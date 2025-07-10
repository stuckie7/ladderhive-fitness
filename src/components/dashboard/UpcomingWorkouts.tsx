
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, ChevronRight, Dumbbell, PlusCircle, RefreshCw, Activity, Heart, Sparkles } from "lucide-react";
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
  type: 'wod' | 'workout' | 'mindful' | 'yoga'; // Added more workout types
  thumbnail?: string;
}

interface UpcomingWorkoutsProps {
  workouts: UpcomingWorkout[];
  isLoading: boolean;
  onScheduleWorkout?: () => void;
  onRefresh?: () => void;
  onViewWorkout: (id: string) => void;
}

const UpcomingWorkouts = ({ 
  workouts, 
  isLoading,
  onScheduleWorkout,
  onRefresh,
  onViewWorkout
}: UpcomingWorkoutsProps) => {
  const { toast } = useToast();
  
  // Disable auto-refresh for now to prevent constant reloading
  // We'll implement a manual refresh button instead
  
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
  
  const handleQuickSchedule = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onScheduleWorkout) {
      onScheduleWorkout();
    } else {
      toast({
        title: "Scheduling a workout",
        description: "Adding this workout to your personal routine"
      });
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast({
        description: "Refreshed workout recommendations",
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

  const getTypeColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'wod':
        return 'bg-purple-900/30 text-purple-400';
      case 'workout':
        return 'bg-blue-900/30 text-blue-400';
      case 'mindful':
        return 'bg-teal-900/30 text-teal-400';
      case 'yoga':
        return 'bg-green-900/30 text-green-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  // Get appropriate icon based on workout type
  const getWorkoutIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch(type.toLowerCase()) {
      case 'wod':
        return <Activity className={iconClass} />;
      case 'workout':
        return <Dumbbell className={iconClass} />;
      case 'mindful':
        return <Heart className={`${iconClass} text-pink-400`} />;
      case 'yoga':
        return <Sparkles className={`${iconClass} text-green-400`} />;
      default:
        return <Dumbbell className={iconClass} />;
    }
  };

  // Get a placeholder gradient based on workout type
  const getPlaceholderGradient = (type: string) => {
    switch(type.toLowerCase()) {
      case 'wod':
        return 'bg-gradient-to-br from-purple-900 to-purple-700';
      case 'workout':
        return 'bg-gradient-to-br from-blue-900 to-blue-700';
      case 'mindful':
        return 'bg-gradient-to-br from-teal-900 to-teal-700';
      case 'yoga':
        return 'bg-gradient-to-br from-green-900 to-green-700';
      default:
        return 'bg-gradient-to-br from-gray-900 to-gray-700';
    }
  };

  // Function to determine the correct link based on workout type
  // This is currently not used but kept for future reference
  // const getWorkoutLink = (workout: UpcomingWorkout) => {
  //   switch (workout.type) {
  //     case 'wod':
  //       return `/wods/${workout.id}`;
  //     case 'mindful':
  //       return `/mindful-movement/${workout.id}`;
  //     case 'yoga':
  //       return `/yoga/${workout.id}`;
  //     default:
  //       return `/workouts/${workout.id}`;
  //   }
  // };

  return (
    <Card className="glass-panel h-full flex flex-col">
      <CardHeader className="z-10 bg-background/80 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2 text-fitness-secondary">
            <Calendar className="h-5 w-5" />
            <span>Recommended Workouts</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 hover:bg-gray-800/50"
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={!onRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              <span>Refresh</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 hover:bg-green-900/30 hover:text-green-400"
              onClick={handleQuickSchedule}
              disabled={!onScheduleWorkout}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              <span>Quick Add</span>
            </Button>
            <Link to="/schedule">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 hover:bg-gray-800/50"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Schedule</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : displayWorkouts.length > 0 ? (
          <div className="space-y-3">
            {displayWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="block p-3 border border-gray-800/50 rounded-lg hover:border-fitness-secondary/50 hover:bg-gray-900/30 transition-all group cursor-pointer"
                onClick={() => onViewWorkout(workout.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                      {workout.thumbnail ? (
                        <>
                          <img 
                            src={workout.thumbnail} 
                            alt={workout.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              try {
                                const target = e.target as HTMLImageElement;
                                if (target) {
                                  target.style.display = 'none';
                                  const placeholder = target.nextElementSibling as HTMLElement;
                                  if (placeholder && placeholder.classList.contains('workout-thumbnail-placeholder')) {
                                    placeholder.style.display = 'flex';
                                  }
                                }
                              } catch (error) {
                                console.error('Error handling image load:', error);
                              }
                            }}
                          />
                          <div 
                            className={`${getPlaceholderGradient(workout.type)} w-full h-full hidden items-center justify-center workout-thumbnail-placeholder`}
                          >
                            {getWorkoutIcon(workout.type)}
                          </div>
                        </>
                      ) : (
                        <div 
                          className={`${getPlaceholderGradient(workout.type)} w-full h-full flex items-center justify-center workout-thumbnail-placeholder`}
                        >
                          {getWorkoutIcon(workout.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium group-hover:text-fitness-secondary transition-colors truncate">
                        {workout.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1 items-center text-sm text-muted-foreground">
                        <p className="text-xs flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          {workout.duration} min
                        </p>
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${getDifficultyColor(workout.difficulty)}`}>
                          {workout.difficulty}
                        </Badge>
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${getTypeColor(workout.type)}`}>
                          {workout.type === 'wod' ? 'WOD' : 
                           workout.type === 'mindful' ? 'Mindful' : 
                           workout.type === 'yoga' ? 'Yoga' : 'Workout'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-md bg-fitness-secondary/10 text-fitness-secondary whitespace-nowrap ml-2">
                    {getFormattedDate(workout.date)}
                  </div>
                </div>
              </div>
            ))}
            
            {displayWorkouts.length < upcomingWorkouts.length && (
              <Link to="/schedule" className="block text-center pt-2 text-sm text-muted-foreground hover:text-fitness-secondary transition-colors">
                View {upcomingWorkouts.length - displayWorkouts.length} more recommended workouts
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-white">No recommended workouts</h3>
            <p className="mt-2 text-gray-400">
              Click refresh to see some workout suggestions
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button className="btn-fitness-secondary" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleQuickSchedule}>
                Schedule Custom Workout
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingWorkouts;
