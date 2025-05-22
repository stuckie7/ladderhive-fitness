
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ExerciseFull, Exercise, ExerciseFilters } from '@/types/exercise';
import { searchExercisesFull } from '../services/exercise-search-service';
import { useToast } from '@/components/ui/use-toast';
import { mapExerciseFullToExercise } from '../mappers';

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface UseExerciseLibraryReturn {
  exercises: ExerciseFull[];
  isLoading: boolean;
  searchQuery: string;
  activeTab: string;
  filters: ExerciseFilters;
  availableMuscleGroups: string[];
  availableEquipment: string[];
  pagination: PaginationState;
  setActiveTab: (tab: string) => void;
  setFilters: (filters: Partial<ExerciseFilters>) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  setPagination: (pagination: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  resetFilters: () => void;
  getFilteredExercises: (muscleGroup?: string) => ExerciseFull[];
  handleSearchChange: (value: string) => void;
  handleSearch: (searchTerm: string) => Promise<Exercise[]>;
  getPaginatedExercises: () => ExerciseFull[];
}

// Rename to match what's being imported elsewhere
export const useExerciseLibrary = (): UseExerciseLibraryReturn => {
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
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 9, // Default to 9 items per page (3x3 grid)
    totalItems: 0,
    totalPages: 1,
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

  const getFilteredExercises = useCallback((muscleGroup?: string) => {
    let filtered = [...exercises];

    if (muscleGroup) {
      filtered = filtered.filter(
        (ex) => 
          ex.prime_mover_muscle === muscleGroup || 
          ex.target_muscle_group === muscleGroup
      );
    }

    if (filters.muscleGroup) {
      filtered = filtered.filter(
        (ex) => 
          ex.prime_mover_muscle === filters.muscleGroup || 
          ex.target_muscle_group === filters.muscleGroup
      );
    }

    if (filters.equipment) {
      filtered = filtered.filter(ex => ex.primary_equipment === filters.equipment);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(ex => ex.difficulty_level === filters.difficulty);
    }

    // Update pagination total items
    setPagination(prev => ({
      ...prev,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.itemsPerPage),
      currentPage: 1, // Reset to first page when filters change
    }));

    return filtered;
  }, [exercises, filters]);

  const handleSearch = useCallback(async (searchTerm: string): Promise<Exercise[]> => {
    setIsLoading(true);
    try {
      const results = await searchExercisesFull(searchTerm);
      // Convert ExerciseFull[] to Exercise[] using the mapper
      return results.map(mapExerciseFullToExercise);
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

  // Get paginated exercises based on current page and items per page
  const getPaginatedExercises = useCallback(() => {
    const filtered = getFilteredExercises();
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [getFilteredExercises, pagination.currentPage, pagination.itemsPerPage]);

  // Handle page change
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages)),
    }));
  }, []);

  // Handle items per page change
  const setItemsPerPage = useCallback((itemsPerPage: number) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: Math.max(1, itemsPerPage),
      currentPage: 1, // Reset to first page when changing items per page
    }));
  }, []);

  // Update total pages when items per page changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalPages: Math.ceil(prev.totalItems / prev.itemsPerPage),
      currentPage: Math.min(prev.currentPage, Math.ceil(prev.totalItems / prev.itemsPerPage) || 1),
    }));
  }, [pagination.itemsPerPage, pagination.totalItems]);

  return {
    exercises: getPaginatedExercises(),
    isLoading,
    searchQuery,
    activeTab,
    filters,
    availableMuscleGroups,
    availableEquipment,
    pagination,
    setActiveTab,
    setFilters: (newFilters: Partial<ExerciseFilters>) => {
      setFiltersState(prev => ({ ...prev, ...newFilters }));
    },
    setPage,
    setItemsPerPage,
    setPagination,
    resetFilters: () => {
      setFiltersState({
        muscleGroup: '',
        equipment: '',
        difficulty: '',
      });
      setPage(1);
    },
    getFilteredExercises,
    handleSearchChange,
    handleSearch,
    getPaginatedExercises,
  };
};
