
import { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import { useToast } from "@/components/ui/use-toast";

const Schedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get planned workouts for the selected date
  const { data: plannedWorkouts, isLoading } = useQuery({
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
        toast({
          title: 'Error',
          description: 'Failed to load your planned workouts.',
          variant: 'destructive',
        });
        return [];
      }
      
      return data as any[];
    },
    enabled: !!user && !!date,
  });
  
  const formattedDate = date ? format(date, 'PPP') : 'Select a date';
  
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
        
        <Card>
          <CardHeader>
            <CardTitle>Workouts for {formattedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                  No workouts scheduled for this day.
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => window.location.href = '/workouts'}
                >
                  Add Workout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Schedule;
