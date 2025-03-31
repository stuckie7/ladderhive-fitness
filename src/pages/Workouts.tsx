
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  exercises: number;
  difficulty: string;
  date?: string;
}

const Workouts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("any");
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<Workout[]>([]);
  const [plannedWorkouts, setPlannedWorkouts] = useState<Workout[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        // Fetch all workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*');
        
        if (workoutsError) throw workoutsError;
        
        // Fetch user workouts (completed, planned, saved)
        const { data: userWorkoutsData, error: userWorkoutsError } = await supabase
          .from('user_workouts')
          .select('*, workout:workouts(*)')
          .eq('user_id', user?.id || '');
        
        if (userWorkoutsError) throw userWorkoutsError;
        
        // Process workouts data
        setAllWorkouts(workoutsData as Workout[]);
        
        // Process user workouts
        const completed = userWorkoutsData
          .filter(uw => uw.status === 'completed')
          .map(uw => ({
            ...uw.workout,
            description: `Completed on ${new Date(uw.completed_at).toLocaleDateString()}`,
          }));
        
        const planned = userWorkoutsData
          .filter(uw => uw.status === 'planned')
          .map(uw => ({
            ...uw.workout,
            date: new Date(uw.planned_for).toLocaleDateString(),
          }));
        
        const saved = userWorkoutsData
          .filter(uw => uw.status === 'saved')
          .map(uw => uw.workout);
        
        setCompletedWorkouts(completed);
        setPlannedWorkouts(planned);
        setSavedWorkouts(saved);
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
  
  const filteredWorkouts = allWorkouts.filter(workout => {
    // Apply search filter
    if (searchQuery && !workout.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply difficulty filter
    if (difficultyFilter !== "all" && workout.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()) {
      return false;
    }
    
    // Apply duration filter
    if (durationFilter !== "any") {
      if (durationFilter === "lt30" && workout.duration >= 30) {
        return false;
      } else if (durationFilter === "30-45" && (workout.duration < 30 || workout.duration > 45)) {
        return false;
      } else if (durationFilter === "gt45" && workout.duration <= 45) {
        return false;
      }
    }
    
    return true;
  });
  
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search workouts..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Difficulty</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={durationFilter} onValueChange={setDurationFilter}>
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Duration</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Duration</SelectItem>
                <SelectItem value="lt30">&lt; 30 min</SelectItem>
                <SelectItem value="30-45">30-45 min</SelectItem>
                <SelectItem value="gt45">&gt; 45 min</SelectItem>
              </SelectContent>
            </Select>
            
            {(searchQuery || difficultyFilter !== "all" || durationFilter !== "any") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setDifficultyFilter("all");
                  setDurationFilter("any");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Workouts</TabsTrigger>
            <TabsTrigger value="my-plan">My Plan</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {filteredWorkouts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No workouts found matching your filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setDifficultyFilter("all");
                    setDurationFilter("any");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-plan">
            {plannedWorkouts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plannedWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You don't have any planned workouts yet.</p>
                <Button 
                  className="mt-4 bg-fitness-primary hover:bg-fitness-primary/90"
                  onClick={() => document.querySelector('[value="all"]')?.dispatchEvent(new MouseEvent('click'))}
                >
                  Browse Workouts
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedWorkouts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't completed any workouts yet.</p>
                <Button 
                  className="mt-4 bg-fitness-primary hover:bg-fitness-primary/90"
                  onClick={() => document.querySelector('[value="all"]')?.dispatchEvent(new MouseEvent('click'))}
                >
                  Start a Workout
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved">
            {savedWorkouts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't saved any workouts yet.</p>
                <Button 
                  className="mt-4 bg-fitness-primary hover:bg-fitness-primary/90"
                  onClick={() => document.querySelector('[value="all"]')?.dispatchEvent(new MouseEvent('click'))}
                >
                  Browse Workouts
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Workouts;
