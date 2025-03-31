import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  exercises: number;
  difficulty: string;
}

interface UserWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  status: string;
  completed_at: string | null;
  planned_for: string | null;
  workout: Workout;
}

const Workouts = () => {
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
          .select('*, workout:workouts(*)')
          .eq('user_id', user.id);
        
        if (userWorkoutsError) throw userWorkoutsError;
        
        const typedWorkouts = allWorkouts as Workout[];
        const typedUserWorkouts = userWorkouts as unknown as UserWorkout[];
        
        setWorkouts(typedWorkouts);
        
        // Filter user workouts by status
        const saved = typedUserWorkouts.filter(uw => uw.status === 'saved');
        const completed = typedUserWorkouts.filter(uw => uw.status === 'completed')
          .map(w => ({
            ...w,
            date: w.completed_at ? format(new Date(w.completed_at), 'MMM dd, yyyy') : undefined
          }));
        
        const planned = typedUserWorkouts.filter(uw => uw.status === 'planned')
          .map(w => ({
            ...w,
            date: w.planned_for ? format(new Date(w.planned_for), 'MMM dd, yyyy') : undefined
          }));
        
        setSavedWorkouts(saved);
        setCompletedWorkouts(completed);
        setPlannedWorkouts(planned);
        
        // Get list of saved workout IDs to mark workouts as saved
        const savedIds = saved.map(sw => sw.workout.id);
        
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
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading workouts...</p>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full max-w-md mx-auto">
          <TabsTrigger value="all" className="flex-1">All Workouts</TabsTrigger>
          <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
          <TabsTrigger value="planned" className="flex-1">Planned</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading workouts...</p>
            ) : workouts.length > 0 ? (
              workouts.map((workout: any) => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout} 
                  isSaved={workout.isSaved}
                />
              ))
            ) : (
              <p>No workouts available.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading saved workouts...</p>
            ) : savedWorkouts.length > 0 ? (
              savedWorkouts.map((userWorkout) => (
                <WorkoutCard 
                  key={userWorkout.id} 
                  workout={userWorkout.workout} 
                  isSaved={true}
                />
              ))
            ) : (
              <p>No saved workouts. Save a workout to see it here.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading completed workouts...</p>
            ) : completedWorkouts.length > 0 ? (
              completedWorkouts.map((userWorkout) => (
                <WorkoutCard 
                  key={userWorkout.id} 
                  workout={{
                    ...userWorkout.workout,
                    date: format(new Date(userWorkout.completed_at!), 'MMM dd, yyyy') 
                  }}
                />
              ))
            ) : (
              <p>No completed workouts. Complete a workout to see it here.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="planned" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading planned workouts...</p>
            ) : plannedWorkouts.length > 0 ? (
              plannedWorkouts.map((userWorkout) => (
                <WorkoutCard 
                  key={userWorkout.id} 
                  workout={{
                    ...userWorkout.workout,
                    date: format(new Date(userWorkout.planned_for!), 'MMM dd, yyyy')
                  }}
                />
              ))
            ) : (
              <p>No planned workouts. Schedule a workout to see it here.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Workouts;
