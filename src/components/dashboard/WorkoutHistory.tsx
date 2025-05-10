
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { format, subDays, addDays, isToday, isThisWeek, parseISO, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
}

const WorkoutHistory = ({ workouts = [], isLoading, onSelectDate }: WorkoutHistoryProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const handleDateChange = (days: number) => {
    const newDate = days > 0 ? addDays(selectedDate, days) : subDays(selectedDate, Math.abs(days));
    setSelectedDate(newDate);
    if (onSelectDate) {
      onSelectDate(newDate);
    }
  };
  
  // Get workouts for the selected date
  const todaysWorkouts = workouts.filter(workout => {
    const workoutDate = parseISO(workout.date);
    return isSameDay(workoutDate, selectedDate);
  });
  
  return (
    <Card className="glass-panel h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2 text-fitness-secondary">
          <CalendarDays className="h-5 w-5" />
          <span>Workout History</span>
        </CardTitle>
        <div className="flex items-center gap-2">
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
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : todaysWorkouts.length > 0 ? (
          <div className="space-y-3">
            {todaysWorkouts.map((workout) => (
              <div 
                key={workout.id} 
                className="p-3 border border-gray-800/50 rounded-lg hover:border-fitness-secondary/50 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{workout.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {workout.exercises} exercises · {workout.duration} minutes
                    </p>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400">
                    {workout.completed ? "Completed" : "Planned"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No workouts for this date</p>
            <Button variant="outline" className="mt-3" size="sm">
              Schedule a Workout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutHistory;
