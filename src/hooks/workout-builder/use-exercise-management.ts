
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkoutExerciseDetail } from './types';

interface ExerciseManagementProps {
  exercises: WorkoutExerciseDetail[];
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExerciseDetail[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: any[];
  setSearchResults: React.Dispatch<React.SetStateAction<any[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useExerciseManagement = ({
  exercises,
  setExercises,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  setIsLoading
}: ExerciseManagementProps) => {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Handle search input change
  const handleSearchChange = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!query && !selectedMuscleGroup && !selectedEquipment && !selectedDifficulty) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .or(`name.ilike.%${query}%, prime_mover_muscle.ilike.%${query}%`)
        .limit(20);
        
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching exercises:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [setSearchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, setSearchResults, setIsLoading]);

  // Handle filter changes
  const handleFilterChange = useCallback(async (type: string, value: string | null) => {
    switch(type) {
      case 'muscleGroup':
        setSelectedMuscleGroup(value);
        break;
      case 'equipment':
        setSelectedEquipment(value);
        break;
      case 'difficulty':
        setSelectedDifficulty(value);
        break;
      default:
        return;
    }
    
    setIsLoading(true);
    try {
      let query = supabase.from('exercises_full').select('*');
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%, prime_mover_muscle.ilike.%${searchQuery}%`);
      }
      
      if (type === 'muscleGroup' && value || type !== 'muscleGroup' && selectedMuscleGroup) {
        const muscleGroup = type === 'muscleGroup' ? value : selectedMuscleGroup;
        query = query.or(`prime_mover_muscle.ilike.%${muscleGroup}%, body_region.ilike.%${muscleGroup}%`);
      }
      
      if (type === 'equipment' && value || type !== 'equipment' && selectedEquipment) {
        const equipment = type === 'equipment' ? value : selectedEquipment;
        query = query.or(`primary_equipment.ilike.%${equipment}%, secondary_equipment.ilike.%${equipment}%`);
      }
      
      if (type === 'difficulty' && value || type !== 'difficulty' && selectedDifficulty) {
        const difficulty = type === 'difficulty' ? value : selectedDifficulty;
        query = query.eq('difficulty', difficulty);
      }
      
      const { data, error } = await query.limit(20);
        
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error filtering exercises:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, setSearchResults, setIsLoading]);

  // Add exercise to workout
  const addExerciseToWorkout = useCallback((exercise: any) => {
    const newExercise: WorkoutExerciseDetail = {
      id: `temp-${Date.now()}`,
      exercise_id: exercise.id.toString(), // Convert to string
      name: exercise.name,
      sets: 3,
      reps: "10",
      rest_seconds: 60,
      order_index: exercises.length,
      exercise: exercise // Include the full exercise object
    };
    
    setExercises([...exercises, newExercise]);
  }, [exercises, setExercises]);

  // Remove exercise from workout
  const removeExerciseFromWorkout = useCallback((id: string) => {
    const updatedExercises = exercises.filter(ex => ex.id !== id);
    setExercises(updatedExercises);
  }, [exercises, setExercises]);

  // Update exercise details
  const updateExerciseDetails = useCallback((id: string, updates: Partial<WorkoutExerciseDetail>) => {
    const updatedExercises = exercises.map(ex => 
      ex.id === id ? { ...ex, ...updates } : ex
    );
    setExercises(updatedExercises);
  }, [exercises, setExercises]);

  // Move exercise up in list
  const moveExerciseUp = useCallback((id: string) => {
    const index = exercises.findIndex(ex => ex.id === id);
    if (index <= 0) return;
    
    const updatedExercises = [...exercises];
    [updatedExercises[index - 1], updatedExercises[index]] = [updatedExercises[index], updatedExercises[index - 1]];
    
    // Update order_index
    updatedExercises.forEach((ex, i) => {
      ex.order_index = i;
    });
    
    setExercises(updatedExercises);
  }, [exercises, setExercises]);

  // Move exercise down in list
  const moveExerciseDown = useCallback((id: string) => {
    const index = exercises.findIndex(ex => ex.id === id);
    if (index === -1 || index === exercises.length - 1) return;
    
    const updatedExercises = [...exercises];
    [updatedExercises[index], updatedExercises[index + 1]] = [updatedExercises[index + 1], updatedExercises[index]];
    
    // Update order_index
    updatedExercises.forEach((ex, i) => {
      ex.order_index = i;
    });
    
    setExercises(updatedExercises);
  }, [exercises, setExercises]);

  // Reorder exercise list (for drag and drop)
  const reorderExercises = useCallback((startIndex: number, endIndex: number) => {
    const result = Array.from(exercises);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update order_index
    result.forEach((ex, i) => {
      ex.order_index = i;
    });
    
    setExercises(result);
  }, [exercises, setExercises]);

  return {
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    handleSearchChange,
    handleFilterChange,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails,
    moveExerciseUp,
    moveExerciseDown,
    reorderExercises,
  };
};
