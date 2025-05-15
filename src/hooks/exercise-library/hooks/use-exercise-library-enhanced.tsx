
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Exercise, ExerciseFull } from '@/types/exercise';
import { useToast } from '@/components/ui/use-toast';
import { loadExerciseData, getExercisesCount, loadFilterOptions } from '../services/exercise-enhanced-service';
import { checkExercisesFullTableExists } from '../services/exercise-fetch-service';
import { useExerciseCrud } from './use-exercise-crud';
import { useExerciseFiltersState } from './use-exercise-filters-state';

export const useExerciseLibraryEnhanced = () => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableExists, setTableExists] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<ExerciseFull | null>(null);
  const ITEMS_PER_PAGE = 12;
  
  // Get filter states
  const {
    searchQuery, 
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    muscleGroups,
    equipmentTypes,
    difficultyLevels,
    setSearchQuery,
    setSelectedMuscleGroup,
    setSelectedEquipment,
    setSelectedDifficulty,
    setMuscleGroups,
    setEquipmentTypes,
    setDifficultyLevels
  } = useExerciseFiltersState();
  
  // Get CRUD operations
  const {
    formState,
    handleFormChange,
    initFormWithExercise,
    handleAddExercise,
    handleEditExercise,
    handleDeleteExercise,
    resetForm,
  } = useExerciseCrud();

  // Check if table exists
  useEffect(() => {
    const checkTable = async () => {
      try {
        const exists = await checkExercisesFullTableExists();
        setTableExists(exists);
        if (!exists) {
          toast({
            title: "Database table not found",
            description: "The exercises_full table doesn't exist in your database",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking table:', error);
        setTableExists(false);
      }
    };
    
    checkTable();
  }, [toast]);

  // Load filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!tableExists) return;
      
      try {
        const options = await loadFilterOptions();
        setMuscleGroups(options.muscleGroups);
        setEquipmentTypes(options.equipmentTypes);
        setDifficultyLevels(options.difficultyLevels);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    
    fetchFilterOptions();
  }, [tableExists]);

  // Load exercises
  const loadExercises = useCallback(async () => {
    if (!tableExists) return;
    
    setLoading(true);
    try {
      // Fetch exercises with current filters
      const exercisesData = await loadExerciseData(
        selectedMuscleGroup,
        selectedEquipment,
        selectedDifficulty,
        searchQuery,
        currentPage,
        ITEMS_PER_PAGE
      );
      
      setExercises(exercisesData);
      
      // Fetch total count for pagination
      const count = await getExercisesCount(
        selectedMuscleGroup,
        selectedEquipment,
        selectedDifficulty,
        searchQuery
      );
      
      setTotalCount(count);
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
    tableExists, 
    selectedMuscleGroup, 
    selectedEquipment, 
    selectedDifficulty,
    searchQuery,
    currentPage,
    ITEMS_PER_PAGE,
    toast
  ]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // Handle search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(0); // Reset to first page on search change
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    switch (filterType) {
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
    setCurrentPage(0); // Reset to first page on filter change
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedMuscleGroup('all');
    setSelectedEquipment('all');
    setSelectedDifficulty('all');
    setCurrentPage(0);
  }, []);

  // Open dialogs with exercise data
  const openEditDialog = useCallback((exercise: Exercise) => {
    const exerciseFull = exercise as ExerciseFull;
    setCurrentExercise(exerciseFull);
    initFormWithExercise(exerciseFull);
  }, [initFormWithExercise]);

  const openDeleteDialog = useCallback((exercise: Exercise) => {
    const exerciseFull = exercise as ExerciseFull;
    setCurrentExercise(exerciseFull);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadExercises();
  }, [loadExercises]);

  return {
    exercises,
    loading,
    searchQuery,
    muscleGroups,
    equipmentTypes,
    difficultyLevels,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    currentPage,
    totalCount,
    tableExists,
    formState,
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
