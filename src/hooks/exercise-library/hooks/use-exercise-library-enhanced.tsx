
import { useState, useEffect, useCallback } from "react";
import { ExerciseFull } from "@/types/exercise";
import { useToast } from "@/components/ui/use-toast";
import { checkExercisesFullTableExists } from "@/hooks/exercise-library/services/exercise-fetch-service";
import { useExerciseFiltersState } from "./use-exercise-filters-state";
import { useExerciseCrud } from "./use-exercise-crud";
import { loadExerciseData, getExercisesCount, loadFilterOptions } from "../services/exercise-enhanced-service";

const ITEMS_PER_PAGE = 12;

export const useExerciseLibraryEnhanced = () => {
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [tableExists, setTableExists] = useState(true);
  
  const { toast } = useToast();
  
  // Use the filter state hook
  const filterState = useExerciseFiltersState();
  
  // Handle data reload
  const loadExerciseDataWithState = useCallback(async () => {
    setLoading(true);
    
    try {
      // Check if the table exists first
      const exists = await checkExercisesFullTableExists();
      setTableExists(exists);
      
      if (!exists) {
        toast({
          title: "Table Not Found",
          description: "The exercises_full table does not exist in your database.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Load exercise data
      const data = await loadExerciseData(
        filterState.selectedMuscleGroup,
        filterState.selectedEquipment, 
        filterState.selectedDifficulty,
        filterState.searchQuery,
        filterState.currentPage,
        ITEMS_PER_PAGE
      );
      
      setExercises(data);
      
      // Get total count for pagination
      const count = await getExercisesCount(
        filterState.selectedMuscleGroup,
        filterState.selectedEquipment,
        filterState.selectedDifficulty,
        filterState.searchQuery
      );
      
      setTotalCount(count);
      
    } catch (error) {
      console.error("Failed to load exercise data:", error);
      toast({
        title: "Error",
        description: "Failed to load exercise data. Check the console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [
    filterState.selectedMuscleGroup, 
    filterState.selectedEquipment, 
    filterState.selectedDifficulty, 
    filterState.searchQuery, 
    filterState.currentPage,
    toast
  ]);
  
  // Load exercises and filter options
  useEffect(() => {
    loadExerciseDataWithState();
  }, [loadExerciseDataWithState]);
  
  // Refresh database to requery for exercises
  const handleRefresh = useCallback(() => {
    setLoading(true);
    filterState.setCurrentPage(0); // Reset to first page
    
    // Reload filter options and exercise data
    const refreshData = async () => {
      try {
        await loadFilterOptions(); // Removed argument here
        loadExerciseDataWithState();
      } catch (error) {
        console.error("Failed to refresh data:", error);
        setLoading(false);
      }
    };
    
    refreshData();
  }, [filterState, loadExerciseDataWithState]);

  // Use the CRUD operations hook
  const crudOperations = useExerciseCrud(loadExerciseDataWithState);

  return {
    exercises,
    loading,
    totalCount,
    tableExists,
    ITEMS_PER_PAGE,
    handleRefresh,
    ...filterState,
    ...crudOperations
  };
};
