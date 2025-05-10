
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ExerciseFull } from "@/types/exercise";
import { searchExercisesFull } from "@/hooks/exercise-library/services/exercise-search-service";

export interface WorkoutExerciseDetail {
  id: string;
  exercise_id: number;
  order_index: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight?: string;
  notes?: string;
  exercise?: ExerciseFull;
}

export interface WorkoutDetail {
  id?: string;
  title: string;
  description?: string;
  difficulty: string;
  category: string;
  duration_minutes?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export const useWorkoutBuilder = (workoutId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Workout info state
  const [workout, setWorkout] = useState<WorkoutDetail>({
    title: "",
    difficulty: "beginner",
    category: "strength",
    description: ""
  });
  
  // Workout exercises state
  const [exercises, setExercises] = useState<WorkoutExerciseDetail[]>([]);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExerciseFull[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all_muscle_groups");
  const [selectedEquipment, setSelectedEquipment] = useState("all_equipment");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all_difficulties");
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load workout data if editing an existing workout
  const loadWorkout = useCallback(async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch the workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (workoutError) throw workoutError;
      
      if (workoutData) {
        setWorkout({
          id: workoutData.id,
          title: workoutData.title,
          description: workoutData.description || "",
          difficulty: workoutData.difficulty,
          category: workoutData.category,
          duration_minutes: workoutData.duration_minutes,
          created_at: workoutData.created_at,
          updated_at: workoutData.updated_at
        });
        
        // Fetch the workout exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('prepared_workout_exercises')
          .select(`
            id,
            exercise_id,
            sets,
            reps,
            rest_seconds,
            notes,
            order_index
          `)
          .eq('workout_id', id)
          .order('order_index');
        
        if (exercisesError) throw exercisesError;
        
        if (exercisesData && exercisesData.length > 0) {
          // Get all unique exercise IDs
          const exerciseIds = exercisesData.map(ex => ex.exercise_id);
          
          // Fetch exercise details for all exercises at once
          const { data: exerciseDetails, error: exerciseDetailsError } = await supabase
            .from('exercises_full')
            .select('*')
            .in('id', exerciseIds);
            
          if (exerciseDetailsError) throw exerciseDetailsError;
          
          // Map exercise details to workout exercises
          const workoutExercises = exercisesData.map(ex => {
            const exerciseDetail = exerciseDetails?.find(detail => detail.id === ex.exercise_id);
            return {
              ...ex,
              exercise: exerciseDetail
            } as WorkoutExerciseDetail;
          });
          
          setExercises(workoutExercises);
        }
      }
    } catch (error) {
      console.error("Error loading workout:", error);
      toast({
        title: "Error",
        description: "Failed to load workout details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  // Reset workout to default values
  const resetWorkout = useCallback(() => {
    setWorkout({
      title: "",
      difficulty: "beginner",
      category: "strength",
      description: ""
    });
    setExercises([]);
  }, []);
  
  // Update workout info
  const setWorkoutInfo = useCallback((info: Partial<WorkoutDetail>) => {
    setWorkout(prev => ({ ...prev, ...info }));
  }, []);
  
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
  }, [toast]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((filter: string, value: string) => {
    switch (filter) {
      case 'muscleGroup':
        setSelectedMuscleGroup(value);
        break;
      case 'equipment':
        setSelectedEquipment(value);
        break;
      case 'difficulty':
        setSelectedDifficulty(value);
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
  }, [toast]);
  
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
  }, []);
  
  // Update exercise details
  const updateExerciseDetails = useCallback((exerciseId: string, updates: Partial<WorkoutExerciseDetail>) => {
    setExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, ...updates }
          : ex
      )
    );
  }, []);
  
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
  }, []);
  
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
  }, []);
  
  // Save workout
  const saveWorkout = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save workouts.",
        variant: "destructive"
      });
      return;
    }
    
    if (exercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "Please add at least one exercise to your workout.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      let workoutId = workout.id;
      let isNewWorkout = !workoutId;
      
      // Calculate estimated duration based on sets, reps and rest time
      const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
      const avgRestSeconds = exercises.reduce((acc, ex) => acc + ex.rest_seconds, 0) / exercises.length;
      const estimatedDuration = Math.ceil((totalSets * 45 + (totalSets - exercises.length) * avgRestSeconds) / 60);
      
      // Save or update workout info
      if (isNewWorkout) {
        const { data: workoutData, error: workoutError } = await supabase
          .from('prepared_workouts')
          .insert({
            title: workout.title,
            description: workout.description,
            difficulty: workout.difficulty,
            category: workout.category,
            goal: workout.category, // Using category as goal for now
            duration_minutes: estimatedDuration || 30,
          })
          .select();
        
        if (workoutError) throw workoutError;
        workoutId = workoutData?.[0]?.id;
      } else {
        const { error: workoutError } = await supabase
          .from('prepared_workouts')
          .update({
            title: workout.title,
            description: workout.description,
            difficulty: workout.difficulty,
            category: workout.category,
            goal: workout.category, // Using category as goal for now
            duration_minutes: estimatedDuration || 30,
            updated_at: new Date().toISOString()
          })
          .eq('id', workoutId);
        
        if (workoutError) throw workoutError;
      }
      
      if (!workoutId) throw new Error("Failed to create workout");
      
      // If updating, delete existing exercise entries first
      if (!isNewWorkout) {
        const { error: deleteError } = await supabase
          .from('prepared_workout_exercises')
          .delete()
          .eq('workout_id', workoutId);
          
        if (deleteError) throw deleteError;
      }
      
      // Insert exercise entries
      const exercisesToInsert = exercises.map((ex, index) => ({
        workout_id: workoutId,
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes,
        order_index: index
      }));
      
      const { error: exerciseError } = await supabase
        .from('prepared_workout_exercises')
        .insert(exercisesToInsert);
      
      if (exerciseError) throw exerciseError;
      
      // Return updated workout with ID for navigation
      return {
        ...workout,
        id: workoutId
      };
      
    } catch (error) {
      console.error("Error saving workout:", error);
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [workout, exercises, user, toast]);
  
  return {
    workout,
    exercises,
    searchResults,
    searchQuery,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    isLoading,
    isSaving,
    
    setWorkoutInfo,
    handleSearchChange,
    handleFilterChange,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails,
    moveExerciseUp,
    moveExerciseDown,
    saveWorkout,
    resetWorkout,
    loadWorkout,
  };
};
