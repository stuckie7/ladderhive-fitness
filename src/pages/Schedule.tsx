
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import { ScheduledWorkoutCard } from "@/components/schedule/ScheduledWorkoutCard";
import { useScheduledWorkouts } from "@/hooks/use-scheduled-workouts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarGrid } from "@/components/schedule/CalendarGrid";
import { DayExpansionPanel } from "@/components/schedule/DayExpansionPanel";
import { CalendarNavigation } from "@/components/schedule/CalendarNavigation";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
    video_url?: string;
  } | null;
}

const Schedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [expandedDate, setExpandedDate] = useState<Date | null>(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState<ScheduledWorkout[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use the custom hook for fetching scheduled workouts
  const { 
    scheduledWorkouts: calendarWorkouts, 
    isLoading: isLoadingCalendar, 
    refetch: refetchCalendar 
  } = useScheduledWorkouts({ month: calendarDate });

  const { 
    scheduledWorkouts: selectedDateWorkouts, 
    isLoading: isLoadingScheduled, 
    refetch: refetchScheduled 
  } = useScheduledWorkouts({ selectedDate: date });
  
  // Get self-planned workouts for the selected date (from a different table)
  const { data: plannedWorkouts, isLoading: isLoadingPlanned } = useQuery({
    queryKey: ['planned-workouts', date?.toISOString()],
    queryFn: async () => {
      if (!user || !date) return [];
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('user_workouts')
        .select('*, workout:workouts(*)')
        .eq('user_id', user.id)
        .eq('status', 'planned')
        .gte('planned_for', startOfDay.toISOString())
        .lte('planned_for', endOfDay.toISOString());
      
      if (error) {
        console.error('Error fetching planned workouts:', error);
        return [];
      }
      
      return data as any[];
    },
    enabled: !!user && !!date,
  });
  
  const formattedDate = date ? format(date, 'PPP') : 'Select a date';
  
  const handleDayExpand = (date: Date, workouts: ScheduledWorkout[]) => {
    setExpandedDate(date);
    setExpandedWorkouts(workouts);
  };
  
  const handleCloseDayExpansion = () => {
    setExpandedDate(null);
    setExpandedWorkouts([]);
  };
  
  const handleStatusUpdate = async (workoutId: string, status: 'completed' | 'skipped') => {
    try {
      const { error } = await supabase
        .from('scheduled_workouts')
        .update({ status })
        .eq('id', workoutId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Workout marked as ${status}`,
      });

      refetchScheduled();
      refetchCalendar();
      
      // Update expanded workouts if needed
      if (expandedWorkouts.length > 0) {
        const updatedWorkouts = expandedWorkouts.map(w => 
          w.id === workoutId ? { ...w, status } : w
        );
        setExpandedWorkouts(updatedWorkouts);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workout status',
        variant: 'destructive',
      });
    }
  };
  
  const handleStartWorkout = (workout: ScheduledWorkout) => {
    if (!workout.prepared_workouts?.id) {
      toast({
        title: "Cannot Start Workout",
        description: "This scheduled item is missing workout details.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/workouts/${workout.prepared_workouts.id}`);
  };

  // Refetch calendar workouts when calendar date changes
  useEffect(() => {
    refetchCalendar();
  }, [calendarDate, refetchCalendar]);
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Workout Schedule</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {formattedDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="scheduled">Admin Scheduled</TabsTrigger>
            <TabsTrigger value="planned">Self Planned</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CalendarNavigation 
                  currentDate={calendarDate}
                  onDateChange={setCalendarDate}
                />
              </CardHeader>
              <CardContent>
                {isLoadingCalendar ? (
                  <div className="flex items-center justify-center py-8">
                    <p>Loading calendar...</p>
                  </div>
                ) : (
                  <>
                    <CalendarGrid
                      selectedDate={calendarDate}
                      scheduledWorkouts={calendarWorkouts || []}
                      onDateSelect={setDate}
                      onDayExpand={handleDayExpand}
                    />
                    
                    {expandedDate && expandedWorkouts.length > 0 && (
                      <DayExpansionPanel
                        date={expandedDate}
                        workouts={expandedWorkouts}
                        onClose={handleCloseDayExpansion}
                        onStatusUpdate={handleStatusUpdate}
                        onStartWorkout={handleStartWorkout}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Workouts for {formattedDate}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingScheduled ? (
                  <p>Loading scheduled workouts...</p>
                ) : selectedDateWorkouts && selectedDateWorkouts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedDateWorkouts.map((scheduledWorkout) => (
                      <ScheduledWorkoutCard 
                        key={scheduledWorkout.id} 
                        scheduledWorkout={scheduledWorkout}
                        onStatusUpdate={() => {
                          refetchScheduled();
                          refetchCalendar();
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No admin-scheduled workouts for this day.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="planned" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Self-Planned Workouts for {formattedDate}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPlanned ? (
                  <p>Loading workouts...</p>
                ) : plannedWorkouts && plannedWorkouts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plannedWorkouts.map((item) => (
                      <WorkoutCard 
                        key={item.id} 
                        workout={{
                          ...item.workout,
                          date: format(new Date(item.planned_for), 'MMM dd, yyyy'),
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No self-planned workouts for this day.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate('/workouts')}
                    >
                      Add Workout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Schedule;
