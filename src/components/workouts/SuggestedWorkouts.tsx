import React, { useState } from 'react';
import { useSuggestedWorkouts } from '@/hooks/useSuggestedWorkouts';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

interface SuggestedWorkoutsProps {
  limit?: number;
  onWorkoutScheduled?: () => void;
}

export const SuggestedWorkouts: React.FC<SuggestedWorkoutsProps> = ({ 
  limit = 3,
  onWorkoutScheduled 
}) => {
  const { suggestedWorkouts, loading, error, scheduleWorkout } = useSuggestedWorkouts(limit);
  const [scheduling, setScheduling] = useState<Record<string, boolean>>({});
  const [selectedDates, setSelectedDates] = useState<Record<string, Date | undefined>>({});

  const handleSchedule = async (workoutId: string) => {
    const date = selectedDates[workoutId];
    if (!date) return;

    try {
      setScheduling(prev => ({ ...prev, [workoutId]: true }));
      await scheduleWorkout(workoutId, date.toISOString());
      setSelectedDates(prev => ({ ...prev, [workoutId]: undefined }));
      onWorkoutScheduled?.();
    } catch (error) {
      console.error('Error scheduling workout:', error);
    } finally {
      setScheduling(prev => ({ ...prev, [workoutId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Failed to load suggested workouts. Please try again later.
      </div>
    );
  }

  if (suggestedWorkouts.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No workout suggestions available at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Suggested Workouts</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suggestedWorkouts.map((workout) => (
          <div key={workout.id} className="border rounded-lg p-4 space-y-3">
            {workout.image_url && (
              <img
                src={workout.image_url}
                alt={workout.name}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
            )}
            <h4 className="font-medium">{workout.name}</h4>
            <p className="text-sm text-muted-foreground">
              {workout.duration} min • {workout.difficulty}
            </p>
            {workout.description && (
              <p className="text-sm mt-2 line-clamp-2">{workout.description}</p>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDates[workout.id] ? (
                      format(selectedDates[workout.id]!, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDates[workout.id]}
                    onSelect={(date) => 
                      setSelectedDates(prev => ({ ...prev, [workout.id]: date || undefined }))
                    }
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button
                onClick={() => handleSchedule(workout.id)}
                disabled={!selectedDates[workout.id] || scheduling[workout.id]}
                className="flex-1"
              >
                {scheduling[workout.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Schedule'
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
