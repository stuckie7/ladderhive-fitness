
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScheduledWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  scheduled_date: string;
  status: string;
  admin_message: string | null;
  created_at: string;
  scheduled_by_admin: string | null;
  prepared_workouts: {
    id: string;
    title: string;
    difficulty: string;
    duration_minutes: number;
    description?: string;
    thumbnail_url?: string;
  } | null;
}

interface CalendarGridProps {
  selectedDate: Date;
  scheduledWorkouts: ScheduledWorkout[];
  onDateSelect: (date: Date) => void;
  onDayExpand: (date: Date, workouts: ScheduledWorkout[]) => void;
}

export function CalendarGrid({ selectedDate, scheduledWorkouts, onDateSelect, onDayExpand }: CalendarGridProps) {
  const [expandedDate, setExpandedDate] = useState<Date | null>(null);
  
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getWorkoutsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return scheduledWorkouts.filter(workout => workout.scheduled_date === dateStr);
  };
  
  const handleDayClick = (date: Date) => {
    const dayWorkouts = getWorkoutsForDate(date);
    onDateSelect(date);
    
    if (dayWorkouts.length > 0) {
      if (expandedDate && isSameDay(expandedDate, date)) {
        setExpandedDate(null);
      } else {
        setExpandedDate(date);
        onDayExpand(date, dayWorkouts);
      }
    }
  };
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">{format(selectedDate, 'MMMM yyyy')}</h2>
      </div>
      
      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayWorkouts = getWorkoutsForDate(day);
          const hasWorkouts = dayWorkouts.length > 0;
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const isExpanded = expandedDate && isSameDay(expandedDate, day);
          
          return (
            <Card 
              key={day.toISOString()}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md relative min-h-[80px]",
                isSelected && "ring-2 ring-primary",
                isTodayDate && "bg-blue-50 dark:bg-blue-950",
                isExpanded && "ring-2 ring-accent"
              )}
              onClick={() => handleDayClick(day)}
            >
              <CardContent className="p-2">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm font-medium",
                      isTodayDate && "text-primary font-bold"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasWorkouts && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-xs text-muted-foreground">
                          {dayWorkouts.length}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {hasWorkouts && (
                    <div className="space-y-1 mt-1">
                      {dayWorkouts.slice(0, 2).map(workout => (
                        <div key={workout.id} className="text-xs">
                          <Badge variant="outline" className="text-xs p-1 h-auto">
                            {workout.prepared_workouts?.title.slice(0, 15)}...
                          </Badge>
                        </div>
                      ))}
                      {dayWorkouts.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayWorkouts.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
