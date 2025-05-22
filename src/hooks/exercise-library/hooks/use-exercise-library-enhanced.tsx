
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Exercise, ExerciseFull } from '@/types/exercise';
import { useToast } from '@/components/ui/use-toast';
import { useExerciseFiltersState } from './use-exercise-filters-state';
import { supabase } from '@/integrations/supabase/client';
import { ensureNumber } from '../exercise-form-helpers';

export const useExerciseLibraryEnhanced = () => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const ITEMS_PER_PAGE = 12;
  
  // Get filter states
  const {
    searchQuery, 
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    currentPage,
    setCurrentPage,
    setSearchQuery,
    setSelectedMuscleGroup,
    setSelectedEquipment,
    setSelectedDifficulty,
    handleSearchChange,
    handleFilterChange,
    resetFilters
  } = useExerciseFiltersState();

  // Load exercises
  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      // Build query
      let query = supabase.from('exercises_full').select('*');
      
      // Apply search filter
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      // Apply muscle group filter
      if (selectedMuscleGroup && selectedMuscleGroup !== 'all') {
        query = query.ilike('prime_mover_muscle', `%${selectedMuscleGroup}%`);
      }
      
      // Apply equipment filter
      if (selectedEquipment && selectedEquipment !== 'all') {
        query = query.ilike('primary_equipment', `%${selectedEquipment}%`);
      }
      
      // Apply difficulty filter
      if (selectedDifficulty && selectedDifficulty !== 'all') {
        query = query.eq('difficulty', selectedDifficulty);
      }
      
      // Add pagination
      const start = currentPage * ITEMS_PER_PAGE;
      query = query.range(start, start + ITEMS_PER_PAGE - 1);
      
      // Add ordering
      query = query.order('name');
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      // Map database results to Exercise type
      const mappedExercises: Exercise[] = (data || []).map(item => ({
        id: String(item.id),
        name: item.name || 'Unknown Exercise',
        description: '',  // Default value
        muscle_group: item.prime_mover_muscle || '',
        equipment: item.primary_equipment || '',
        difficulty: item.difficulty || '',
        instructions: [],  // Default value
        video_url: item.short_youtube_demo || '',
        image_url: item.youtube_thumbnail_url || '',
        prime_mover_muscle: item.prime_mover_muscle || '',
        primary_equipment: item.primary_equipment || '',
        target_muscle_group: item.prime_mover_muscle || '',
        video_demonstration_url: item.short_youtube_demo || ''
      }));
      
      setExercises(mappedExercises);
      if (count !== null) {
        setTotalCount(count);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast({
        title: "Error",
        description: "Failed to load exercises",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery, 
    selectedMuscleGroup, 
    selectedEquipment, 
    selectedDifficulty,
    currentPage,
    ITEMS_PER_PAGE,
    toast
  ]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // Form handling and CRUD operations
  const handleAddExercise = useCallback(async (formData: Record<string, any>) => {
    try {
      setLoading(true);
      // Prepare data
      const exerciseData = {
        name: formData.name,
        prime_mover_muscle: formData.prime_mover_muscle,
        secondary_muscle: Array.isArray(formData.secondary_muscles) ? formData.secondary_muscles[0] : undefined,
        tertiary_muscle: Array.isArray(formData.secondary_muscles) && formData.secondary_muscles.length > 1 ? 
                         formData.secondary_muscles[1] : undefined,
        primary_equipment: formData.primary_equipment,
        difficulty: formData.difficulty,
        exercise_classification: formData.exercise_type,
        description: formData.description,
        short_youtube_demo: formData.video_url,
      };
      
      // Insert into database - Convert string ID to number
      const { error } = await supabase.from('exercises_full').insert(exerciseData);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Exercise added successfully",
      });
      
      // Reload exercises
      loadExercises();
    } catch (error) {
      console.error('Error adding exercise:', error);
      toast({
        title: "Error",
        description: "Failed to add exercise",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [loadExercises, toast]);

  const handleEditExercise = useCallback(async (formData: Record<string, any>) => {
    if (!currentExercise) return;
    
    try {
      setLoading(true);
      
      // Prepare data
      const exerciseData = {
        name: formData.name,
        prime_mover_muscle: formData.prime_mover_muscle,
        secondary_muscle: Array.isArray(formData.secondary_muscles) ? formData.secondary_muscles[0] : undefined,
        tertiary_muscle: Array.isArray(formData.secondary_muscles) && formData.secondary_muscles.length > 1 ? 
                         formData.secondary_muscles[1] : undefined,
        primary_equipment: formData.primary_equipment,
        difficulty: formData.difficulty,
        exercise_classification: formData.exercise_type,
        description: formData.description,
        short_youtube_demo: formData.video_url,
      };
      
      // Update in database - Convert string ID to number if needed
      const idAsNumber = typeof currentExercise.id === 'string' ? parseInt(currentExercise.id, 10) : currentExercise.id;
      
      const { error } = await supabase
        .from('exercises_full')
        .update(exerciseData)
        .eq('id', idAsNumber);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Exercise updated successfully",
      });
      
      // Reset current exercise
      setCurrentExercise(null);
      
      // Reload exercises
      loadExercises();
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast({
        title: "Error",
        description: "Failed to update exercise",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentExercise, loadExercises, toast]);

  const handleDeleteExercise = useCallback(async () => {
    if (!currentExercise) return;
    
    try {
      setLoading(true);
      
      // Delete from database - Convert string ID to number if needed
      const idAsNumber = typeof currentExercise.id === 'string' ? parseInt(currentExercise.id, 10) : currentExercise.id;
      
      const { error } = await supabase
        .from('exercises_full')
        .delete()
        .eq('id', idAsNumber);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      });
      
      // Reset current exercise
      setCurrentExercise(null);
      
      // Reload exercises
      loadExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast({
        title: "Error",
        description: "Failed to delete exercise",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentExercise, loadExercises, toast]);

  // Open dialogs with exercise data
  const openEditDialog = useCallback((exercise: Exercise) => {
    setCurrentExercise(exercise);
  }, []);

  const openDeleteDialog = useCallback((exercise: Exercise) => {
    setCurrentExercise(exercise);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadExercises();
  }, [loadExercises]);

  const handleFormChange = useCallback((field: string, value: any) => {
    // Placeholder for form change handling
    console.log('Form field changed:', field, value);
  }, []);

  return {
    exercises,
    loading,
    searchQuery,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    currentPage,
    totalCount,
    currentExercise,
    ITEMS_PER_PAGE,
    handleSearchChange,
    handleFilterChange,
    resetFilters,
    handleFormChange,
    handleAddExercise,
    handleEditExercise,
    handleDeleteExercise,
    openEditDialog,
    openDeleteDialog,
    handleRefresh,
    setCurrentPage
  };
};
