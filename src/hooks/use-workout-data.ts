
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Workout, UserWorkout } from "@/types/workout";

export const useWorkoutData = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<UserWorkout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<UserWorkout[]>([]);
  const [plannedWorkouts, setPlannedWorkouts] = useState<UserWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get all workouts
        const { data: allWorkouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (workoutsError) throw workoutsError;
        
        // Get user's saved, completed, and planned workouts
        const { data: userWorkouts, error: userWorkoutsError } = await supabase
          .from('user_workouts')
          .select(`
            id,
            user_id,
            workout_id,
            status,
            completed_at,
            planned_for,
            workout:workouts(*)
          `)
          .eq('user_id', user.id);
        
        if (userWorkoutsError) throw userWorkoutsError;
        
        const typedWorkouts = allWorkouts as Workout[];
        const typedUserWorkouts = userWorkouts as unknown as UserWorkout[];
        
        // Filter user workouts by status
        const saved = typedUserWorkouts.filter(uw => uw.status === 'saved');
        
        const completed = typedUserWorkouts
          .filter(uw => uw.status === 'completed')
          .map(w => ({
            ...w,
            date: w.completed_at ? format(new Date(w.completed_at), 'MMM dd, yyyy') : undefined
          }));
        
        const planned = typedUserWorkouts
          .filter(uw => uw.status === 'planned')
          .map(w => ({
            ...w,
            date: w.planned_for ? format(new Date(w.planned_for), 'MMM dd, yyyy') : undefined
          }));
        
        setSavedWorkouts(saved);
        setCompletedWorkouts(completed);
        setPlannedWorkouts(planned);
        
        // Get list of saved workout IDs to mark workouts as saved
        const savedIds = saved.map(sw => sw.workout_id);
        
        // Update allWorkouts with isSaved property
        setWorkouts(typedWorkouts.map(w => ({
          ...w,
          isSaved: savedIds.includes(w.id)
        })));
        
      } catch (error: any) {
        console.error("Error fetching workouts:", error);
        toast({
          title: "Error",
          description: "Failed to load workouts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkouts();
  }, [user, toast]);

  return {
    activeTab,
    setActiveTab,
    workouts,
    savedWorkouts,
    completedWorkouts,
    plannedWorkouts,
    isLoading
  };
};
