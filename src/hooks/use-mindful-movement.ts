
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { YogaWorkout } from "./use-yoga-workouts";

export type TimeFilter = "quick" | "short" | "long" | null;
export type IntensityFilter = "gentle" | "moderate" | "restorative" | null;
export type StressTypeFilter = "work" | "sleep" | "refresh" | null;

export interface MoodType {
  id: string;
  name: string;
  description: string;
  recommendedSequences: string[];
}

export const useGetMindfulMovement = () => {
  const [workouts, setWorkouts] = useState<YogaWorkout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<YogaWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(null);
  const [intensityFilter, setIntensityFilter] = useState<IntensityFilter>(null);
  const [stressTypeFilter, setStressTypeFilter] = useState<StressTypeFilter>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { toast } = useToast();
  
  // Sample mood options for the "How are you feeling?" quiz
  const moodOptions: MoodType[] = [
    {
      id: "overwhelmed",
      name: "Overwhelmed",
      description: "Feeling like there's too much going on",
      recommendedSequences: ["quick", "gentle", "work"]
    },
    {
      id: "anxious",
      name: "Anxious",
      description: "Feeling worried or uneasy",
      recommendedSequences: ["short", "moderate", "work"]
    },
    {
      id: "tired",
      name: "Tired",
      description: "Low on energy",
      recommendedSequences: ["quick", "gentle", "refresh"]
    },
    {
      id: "restless",
      name: "Restless",
      description: "Having trouble settling down",
      recommendedSequences: ["long", "moderate", "sleep"]
    },
    {
      id: "stressed",
      name: "Stressed",
      description: "Feeling pressure or tension",
      recommendedSequences: ["short", "restorative", "work"]
    }
  ];
  
  const fetchYogaWorkouts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('yoga_workouts')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      const workoutsWithDuration = data.map(workout => {
        // Add duration categories based on difficulty for this example
        // In a real app, you might have actual duration data
        let timeCategory: TimeFilter = null;
        if (workout.difficulty === "Beginner") timeCategory = "quick";
        else if (workout.difficulty === "Intermediate") timeCategory = "short";
        else if (workout.difficulty === "Advanced") timeCategory = "long";
        
        // Add stress type categories based on body region
        let stressCategory: StressTypeFilter = null;
        if (workout.body_region?.includes("Upper")) stressCategory = "work";
        else if (workout.body_region?.includes("Lower")) stressCategory = "sleep";
        else stressCategory = "refresh";
        
        // Add intensity based on difficulty
        let intensityCategory: IntensityFilter = null;
        if (workout.difficulty === "Beginner") intensityCategory = "gentle";
        else if (workout.difficulty === "Intermediate") intensityCategory = "moderate";
        else intensityCategory = "restorative";
        
        return {
          ...workout,
          timeCategory,
          stressCategory,
          intensityCategory
        };
      });
      
      setWorkouts(workoutsWithDuration);
      setFilteredWorkouts(workoutsWithDuration);
    } catch (error: any) {
      console.error("Error fetching yoga workouts:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Failed to load yoga workouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply filters whenever they change
  useEffect(() => {
    if (workouts.length === 0) return;
    
    let result = [...workouts];
    
    if (timeFilter) {
      result = result.filter(workout => workout.timeCategory === timeFilter);
    }
    
    if (intensityFilter) {
      result = result.filter(workout => workout.intensityCategory === intensityFilter);
    }
    
    if (stressTypeFilter) {
      result = result.filter(workout => workout.stressCategory === stressTypeFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        workout => 
          workout.name.toLowerCase().includes(query) ||
          (workout.prime_mover_muscle && workout.prime_mover_muscle.toLowerCase().includes(query)) ||
          (workout.body_region && workout.body_region.toLowerCase().includes(query))
      );
    }
    
    setFilteredWorkouts(result);
  }, [workouts, timeFilter, intensityFilter, stressTypeFilter, searchQuery]);
  
  useEffect(() => {
    fetchYogaWorkouts();
  }, []);
  
  return {
    workouts: filteredWorkouts,
    isLoading,
    error,
    fetchYogaWorkouts,
    timeFilter,
    setTimeFilter,
    intensityFilter,
    setIntensityFilter,
    stressTypeFilter,
    setStressTypeFilter,
    searchQuery,
    setSearchQuery,
    moodOptions
  };
};
