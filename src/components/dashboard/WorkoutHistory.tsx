import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Dumbbell } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { format, subDays, addDays, isToday, parseISO, isSameDay, startOfWeek, addWeeks, subWeeks, endOfWeek, eachDayOfInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface WorkoutData {
  id: string;
  date: string;
  title: string;
  duration: number;
  exercises: number;
  completed: boolean;
}

interface WorkoutHistoryProps {
  workouts?: WorkoutData[];
  isLoading: boolean;
  onSelectDate?: (date: Date) => void;
  onSelectWorkout?: (id: string) => void;
}

type ViewMode = 'day' | 'week';

const WorkoutHistory = ({ 
  workouts = [], 
  isLoading, 
  onSelectDate,
  onSelectWorkout 
}: WorkoutHistoryProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  
  const handleDateChange = (days: number) => {
    const newDate = days > 0 ? addDays(selectedDate, days) : subDays(selectedDate, Math.abs(days));
    setSelectedDate(newDate);
    if (onSelectDate) {
      onSelectDate(newDate);
    }
  };

  const handleWeekChange = (weeks: number) => {
    const newDate = weeks > 0 ? addWeeks(selectedDate, weeks) : subWeeks(selectedDate, Math.abs(weeks));
    setSelectedDate(newDate);
    if (onSelectDate) {
      onSelectDate(newDate);
    }
  };
  
  // Get workouts for the selected date or week
  const getFilteredWorkouts = useCallback(() => {
    if (viewMode === 'day') {
      // Return workouts for the selected date
      return workouts.filter(workout => {
        const workoutDate = parseISO(workout.date);
        return isSameDay(workoutDate, selectedDate);
      });
    } else {
      // Return workouts for the selected week
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday as first day
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      
      return workouts.filter(workout => {
        const workoutDate = parseISO(workout.date);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });
    }
  }, [workouts, selectedDate, viewMode]);

  const filteredWorkouts = getFilteredWorkouts();
  
  const weekDays = useCallback(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({
      start,
      end: endOfWeek(selectedDate, { weekStartsOn: 1 })
    });
  }, [selectedDate]);
  
  const handleWorkoutClick = (id: string) => {
    if (onSelectWorkout) {
      onSelectWorkout(id);
    }
  };

  const getWorkoutsForDay = (day: Date) => {
    return workouts.filter(workout => {
      const workoutDate = parseISO(workout.date);
      return isSameDay(workoutDate, day);
    });
  };

  return (
    <Card className="glass-panel h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2 text-fitness-secondary">
          <CalendarDays className="h-5 w-5" />
          <span>Workout History</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center mr-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-7 px-2 rounded-r-none ${viewMode === 'day' ? 'bg-fitness-secondary/20' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-7 px-2 rounded-l-none ${viewMode === 'week' ? 'bg-fitness-secondary/20' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
          </div>
          
          {viewMode === 'day' ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => handleDateChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className={`text-sm font-medium ${isToday(selectedDate) ? "text-fitness-primary" : ""}`}>
                {format(selectedDate, "MMM d, yyyy")}
                {isToday(selectedDate) && " (Today)"}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => handleDateChange(1)}
                disabled={isToday(selectedDate)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => handleWeekChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "MMM d")} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "MMM d")}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => handleWeekChange(1)}
                disabled={isToday(endOfWeek(selectedDate, { weekStartsOn: 1 }))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : viewMode === 'day' ? (
          // Day view
          <>
            {filteredWorkouts.length > 0 ? (
              <div className="space-y-3">
                {filteredWorkouts.map((workout) => (
                  <div 
                    key={workout.id} 
                    className="p-3 border border-gray-800/50 rounded-lg hover:border-fitness-secondary/50 transition-all cursor-pointer"
                    onClick={() => handleWorkoutClick(workout.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{workout.title}</h4>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Dumbbell className="h-3.5 w-3.5 mr-1" />
                          {workout.exercises} exercises
                          <span className="mx-1">•</span>
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {workout.duration} minutes
                        </p>
                      </div>
                      <Badge variant={workout.completed ? "success" : "outline"} className="text-xs">
                        {workout.completed ? "Completed" : "Planned"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No workouts for {format(selectedDate, "MMM d, yyyy")}</p>
                <Link to="/schedule">
                  <Button variant="outline" className="mt-3" size="sm">
                    Schedule a Workout
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          // Week view
          <div className="grid grid-cols-7 gap-1">
            {weekDays().map((day) => {
              const dayWorkouts = getWorkoutsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              
              return (
                <div 
                  key={format(day, 'yyyy-MM-dd')} 
                  className={`p-1 text-center rounded cursor-pointer hover:bg-gray-800/30 ${
                    isSelected ? 'bg-fitness-secondary/10 border border-fitness-secondary/30' : 
                    isToday(day) ? 'bg-fitness-primary/10' : ''
                  }`}
                  onClick={() => {
                    setSelectedDate(day);
                    setViewMode('day');
                    if (onSelectDate) onSelectDate(day);
                  }}
                >
                  <div className="mb-1 text-xs font-medium">{format(day, 'EEE')}</div>
                  <div className={`text-sm ${isToday(day) ? 'text-fitness-primary font-bold' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="mt-1">
                    {dayWorkouts.length > 0 ? (
                      <Badge variant="secondary" className="text-[10px] h-4">
                        {dayWorkouts.length}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-gray-500">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutHistory;
