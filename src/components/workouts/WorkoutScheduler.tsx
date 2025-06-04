import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useWorkoutSchedules } from '@/hooks/useWorkoutSchedules';
import { Workout } from '@/types/workout';
import { AccessibleDialog } from '../ui/AccessibleDialog';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';

interface WorkoutSchedulerProps {
  workouts: Workout[];
  userId: string;
}

export function WorkoutScheduler({ workouts, userId }: WorkoutSchedulerProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { 
    schedules, 
    loading, 
    error, 
    createSchedule, 
    updateSchedule, 
    deleteSchedule 
  } = useWorkoutSchedules();

  const handleScheduleWorkout = async () => {
    if (!selectedWorkout || !scheduledDate) return;
    
    await createSchedule({
      user_id: userId,
      workout_id: selectedWorkout.id,
      scheduled_date: scheduledDate.toISOString(),
      completed: false,
    });
    
    setIsDialogOpen(false);
    setSelectedWorkout(null);
  };

  const toggleComplete = async (schedule: any) => {
    await updateSchedule(schedule.id, { 
      completed: !schedule.completed 
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this scheduled workout?')) {
      await deleteSchedule(id);
    }
  };

  if (loading && schedules.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          <p className="ml-3 text-sm text-red-700">
            Error loading workout schedules: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Workout Schedule</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Workout
        </Button>
      </div>

      {schedules.length === 0 ? (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <Calendar className="h-5 w-5 text-blue-400" aria-hidden="true" />
            <p className="ml-3 text-sm text-blue-700">
              No workouts scheduled yet. Click the button above to schedule one.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => {
            const workout = workouts.find(w => w.id === schedule.workout_id);
            if (!workout) return null;
            
            const scheduleDate = new Date(schedule.scheduled_date);
            const isPastDue = !schedule.completed && scheduleDate < new Date();
            
            return (
              <Card key={schedule.id} className={cn(
                'relative overflow-hidden',
                schedule.completed ? 'opacity-75' : '',
                isPastDue ? 'border-2 border-amber-500' : ''
              )}>
                {schedule.completed && (
                  <div className="absolute right-2 top-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{workout.title}</CardTitle>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleComplete(schedule)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={schedule.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {schedule.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Delete schedule"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {workout.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{format(scheduleDate, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{workout.duration} minutes</span>
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                      {workout.difficulty}
                    </span>
                  </div>
                  {isPastDue && !schedule.completed && (
                    <div className="mt-2 text-xs text-amber-600">
                      Past due
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Schedule Workout Dialog */}
      <AccessibleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Schedule a Workout"
        description="Select a workout and choose a date to schedule it."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Select Workout</label>
            <select
              className="w-full rounded-md border p-2"
              value={selectedWorkout?.id || ''}
              onChange={(e) => {
                const workout = workouts.find(w => w.id === e.target.value);
                setSelectedWorkout(workout || null);
              }}
            >
              <option value="">Select a workout</option>
              {workouts.map((workout) => (
                <option key={workout.id} value={workout.id}>
                  {workout.title} ({workout.difficulty})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium">Scheduled Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !scheduledDate && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {scheduledDate ? (
                    format(scheduledDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleWorkout}
              disabled={!selectedWorkout || !scheduledDate}
            >
              Schedule Workout
            </Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}
