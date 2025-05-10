
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ExerciseFull } from "@/types/exercise";
import { WorkoutStateType } from "./use-workout-state";
import { WorkoutExerciseDetail } from "./types";
import { searchExercisesFull } from "@/hooks/exercise-library/services/exercise-search-service";

export const useExerciseManagement = (
  { 
    exercises,
    setExercises,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    setIsLoading
  }: Pick<WorkoutStateType, 
    'exercises' | 'setExercises' | 
    'searchQuery' | 'setSearchQuery' | 
    'searchResults' | 'setSearchResults' |
    'setIsLoading'
  >
) => {
  const { toast } = useToast();
  
  // Handle search input change
  const handleSearchChange = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await searchExercisesFull(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search exercises. Please try again.",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, setSearchQuery, setSearchResults, setIsLoading]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((filter: string, value: string) => {
    switch (filter) {
      case 'muscleGroup':
        // setSelectedMuscleGroup(value);
        break;
      case 'equipment':
        // setSelectedEquipment(value);
        break;
      case 'difficulty':
        // setSelectedDifficulty(value);
        break;
    }
    
    // Re-run search with filters
    if (searchQuery.length >= 2) {
      handleSearchChange(searchQuery);
    }
  }, [searchQuery, handleSearchChange]);
  
  // Add exercise to workout
  const addExerciseToWorkout = useCallback((exercise: ExerciseFull) => {
    setExercises(prev => {
      // Check if the exercise is already in the workout
      const exists = prev.some(ex => ex.exercise_id === exercise.id);
      if (exists) {
        toast({
          title: "Already Added",
          description: "This exercise is already in your workout.",
        });
        return prev;
      }
      
      // Add the new exercise
      const newExercise: WorkoutExerciseDetail = {
        id: `temp_${Date.now()}`, // Temporary ID until saved
        exercise_id: exercise.id,
        order_index: prev.length,
        sets: 3,
        reps: "10",
        rest_seconds: 60,
        exercise: exercise
      };
      
      return [...prev, newExercise];
    });
  }, [toast, setExercises]);
  
  // Remove exercise from workout
  const removeExerciseFromWorkout = useCallback((exerciseId: string) => {
    setExercises(prev => {
      const filtered = prev.filter(ex => ex.id !== exerciseId);
      
      // Reorder the remaining exercises
      return filtered.map((ex, index) => ({
        ...ex,
        order_index: index
      }));
    });
  }, [setExercises]);
  
  // Update exercise details
  const updateExerciseDetails = useCallback((exerciseId: string, updates: Partial<WorkoutExerciseDetail>) => {
    setExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, ...updates }
          : ex
      )
    );
  }, [setExercises]);
  
  // Move exercise up in the order
  const moveExerciseUp = useCallback((exerciseId: string) => {
    setExercises(prev => {
      const index = prev.findIndex(ex => ex.id === exerciseId);
      if (index <= 0) return prev;
      
      const newExercises = [...prev];
      const temp = newExercises[index];
      newExercises[index] = newExercises[index - 1];
      newExercises[index - 1] = temp;
      
      // Update order_index for all exercises
      return newExercises.map((ex, i) => ({
        ...ex,
        order_index: i
      }));
    });
  }, [setExercises]);
  
  // Move exercise down in the order
  const moveExerciseDown = useCallback((exerciseId: string) => {
    setExercises(prev => {
      const index = prev.findIndex(ex => ex.id === exerciseId);
      if (index === -1 || index >= prev.length - 1) return prev;
      
      const newExercises = [...prev];
      const temp = newExercises[index];
      newExercises[index] = newExercises[index + 1];
      newExercises[index + 1] = temp;
      
      // Update order_index for all exercises
      return newExercises.map((ex, i) => ({
        ...ex,
        order_index: i
      }));
    });
  }, [setExercises]);
  
  // Reorder exercises with drag and drop
  const reorderExercises = useCallback((startIndex: number, endIndex: number) => {
    setExercises(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Update order_index for all exercises
      return result.map((ex, i) => ({
        ...ex,
        order_index: i
      }));
    });
  }, [setExercises]);

  return {
    handleSearchChange,
    handleFilterChange,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails,
    moveExerciseUp,
    moveExerciseDown,
    reorderExercises
  };
};
