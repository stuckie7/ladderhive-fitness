
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export interface MindfulYogaWorkout {
  id: string;
  title: string;
  description: string;
  duration: string;
  intensity: string;
  timeNeeded: string;
  stressType: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export const useYogaMindfulMovements = () => {
  const [workouts, setWorkouts] = useState<MindfulYogaWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Fetch data from yoga_workouts table
  useEffect(() => {
    const fetchYogaMindfulMovements = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('yoga_workouts')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        // Map the yoga_workouts data to our MindfulYogaWorkout interface
        const mappedWorkouts: MindfulYogaWorkout[] = data?.map(workout => {
          // Determine time category based on complexity or just set a default
          const timeCategory = workout.difficulty === "Beginner" ? "quick" : 
                             workout.difficulty === "Intermediate" ? "medium" : "extended";
          
          // Determine intensity based on difficulty
          const intensity = workout.difficulty === "Beginner" ? "gentle" : 
                          workout.difficulty === "Intermediate" ? "moderate" : "vigorous";
          
          // Determine stress type based on body region or muscle focus
          let stressType = "focus"; // default
          if (workout.body_region?.toLowerCase().includes('core')) {
            stressType = "anxiety";
          } else if (workout.body_region?.toLowerCase().includes('leg')) {
            stressType = "energy";
          } else if (workout.prime_mover_muscle?.toLowerCase().includes('back')) {
            stressType = "relaxation";
          } else if (workout.body_region?.toLowerCase().includes('chest')) {
            stressType = "sleep";
          }
          
          return {
            id: workout.id,
            title: workout.name,
            description: `Focus on ${workout.body_region || 'full body'} with emphasis on ${workout.prime_mover_muscle || 'multiple muscle groups'}.`,
            duration: "15-20 mins",
            intensity: intensity,
            timeNeeded: timeCategory,
            stressType: stressType,
            thumbnailUrl: workout.youtube_thumbnail_url || undefined,
            videoUrl: workout.short_youtube_demo || workout.in_depth_youtube_exp || undefined
          };
        }) || [];
        
        // Apply search filter
        let filtered = [...mappedWorkouts];
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(workout => 
            workout.title.toLowerCase().includes(query) || 
            workout.description.toLowerCase().includes(query)
          );
        }
        
        setWorkouts(filtered);
      } catch (err: any) {
        console.error("Error fetching yoga mindful movements:", err);
        setError(err);
        toast({
          title: "Error",
          description: "Failed to load mindful movement practices",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchYogaMindfulMovements();
  }, [searchQuery, toast]);
  
  return {
    workouts,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
  };
};
