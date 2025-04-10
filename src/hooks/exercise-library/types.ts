
import { Exercise, ExerciseFilters } from "@/types/exercise";
import { ExerciseFull } from "@/hooks/use-exercises-full";

export interface ExerciseFilterOptions {
  muscleGroups: string[];
  equipmentTypes: string[];
  difficultyLevels: string[];
}

export interface ExerciseFetchers {
  searchExercises: (query: string) => Promise<Exercise[]>;
  getExercisesByMuscleGroup: (muscleGroup: string) => Promise<Exercise[]>;
  getExercisesByEquipment: (equipment: string) => Promise<Exercise[]>;
  searchExercisesFull: (searchTerm: string, limit?: number) => Promise<ExerciseFull[]>;
  fetchExercisesFull: (limit?: number, offset?: number) => Promise<ExerciseFull[]>;
}

export interface ExerciseLibraryState {
  searchQuery: string;
  activeTab: string;
  filters: ExerciseFilters;
  exercises: Exercise[] | undefined;
  isLoading: boolean;
  availableMuscleGroups: string[];
  availableEquipment: string[];
}

export interface ExerciseLibraryActions {
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  setFilters: (filters: ExerciseFilters) => void;
  resetFilters: () => void;
  getFilteredExercises: (muscleGroup: string) => Exercise[];
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  refetch: () => void;
}

export type ExerciseLibraryHook = ExerciseLibraryState & ExerciseLibraryActions;
