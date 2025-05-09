
import { useState, useCallback, useMemo } from 'react';
import { ExerciseFull, Exercise, ExerciseFilters } from '@/types/exercise';
import { searchExercisesFull } from '../services/exercise-search-service';
import { useToast } from '@/components/ui/use-toast';

export interface UseExerciseLibraryReturn {
  exercises: ExerciseFull[];
  isLoading: boolean;
  searchQuery: string;
  activeTab: string;
  filters: ExerciseFilters;
  availableMuscleGroups: string[];
  availableEquipment: string[];
  setActiveTab: (tab: string) => void;
  setFilters: (filters: Partial<ExerciseFilters>) => void;
  resetFilters: () => void;
  getFilteredExercises: (muscleGroup?: string) => ExerciseFull[];
  handleSearchChange: (value: string) => void;
  handleSearch: (searchTerm: string) => Promise<Exercise[]>;
}

export const useExerciseLibraryImpl = (): UseExerciseLibraryReturn => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFiltersState] = useState<ExerciseFilters>({
    muscleGroup: '',
    equipment: '',
    difficulty: '',
  });

  const availableMuscleGroups = useMemo(() => {
    const groups = Array.from(
      new Set(
        exercises
          .map((ex) => ex.prime_mover_muscle || ex.target_muscle_group)
          .filter(Boolean)
      )
    );
    return groups.sort();
  }, [exercises]);

  const availableEquipment = useMemo(() => {
    const equipment = Array.from(
      new Set(exercises.map((ex) => ex.primary_equipment).filter(Boolean))
    );
    return equipment.sort();
  }, [exercises]);

  const setFilters = useCallback((newFilters: Partial<ExerciseFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({
      muscleGroup: '',
      equipment: '',
      difficulty: '',
    });
  }, []);

  const getFilteredExercises = useCallback(
    (muscleGroup?: string) => {
      return exercises.filter((exercise) => {
        const matchesMuscleGroup =
          !muscleGroup ||
          (exercise.prime_mover_muscle &&
            exercise.prime_mover_muscle.toLowerCase() === muscleGroup.toLowerCase()) ||
          (exercise.target_muscle_group &&
            exercise.target_muscle_group.toLowerCase() === muscleGroup.toLowerCase());

        const matchesFilter =
          (!filters.muscleGroup ||
            (exercise.prime_mover_muscle &&
              exercise.prime_mover_muscle.toLowerCase() === filters.muscleGroup.toLowerCase()) ||
            (exercise.target_muscle_group &&
              exercise.target_muscle_group.toLowerCase() === filters.muscleGroup.toLowerCase())) &&
          (!filters.equipment ||
            (exercise.primary_equipment &&
              exercise.primary_equipment.toLowerCase() === filters.equipment.toLowerCase())) &&
          (!filters.difficulty ||
            (exercise.difficulty &&
              exercise.difficulty.toLowerCase() === filters.difficulty.toLowerCase()));

        return matchesMuscleGroup && matchesFilter;
      });
    },
    [exercises, filters]
  );

  const handleSearch = useCallback(async (searchTerm: string): Promise<Exercise[]> => {
    setIsLoading(true);
    try {
      const results = await searchExercisesFull(searchTerm);
      return results;
    } catch (error) {
      console.error('Error searching exercises:', error);
      toast({
        title: 'Search Failed',
        description: 'Unable to search exercises. Please try again.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return {
    exercises,
    isLoading,
    searchQuery,
    activeTab,
    filters,
    availableMuscleGroups,
    availableEquipment,
    setActiveTab,
    setFilters,
    resetFilters,
    getFilteredExercises,
    handleSearchChange,
    handleSearch,
  };
};
