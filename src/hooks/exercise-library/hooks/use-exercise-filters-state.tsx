
import { useState, useCallback, ChangeEvent } from 'react';

export const useExerciseFiltersState = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<string[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Updated to accept ChangeEvent<HTMLInputElement> instead of just string
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((key: 'equipment' | 'muscleGroup' | 'difficulty', value: string) => {
    switch (key) {
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
        break;
    }
    setCurrentPage(0); // Reset page when filter changes
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedMuscleGroup('all');
    setSelectedEquipment('all');
    setSelectedDifficulty('all');
    setCurrentPage(0);
  }, []);

  return {
    searchQuery,
    muscleGroups,
    equipmentTypes,
    difficultyLevels,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    currentPage,
    setSearchQuery,
    setSelectedMuscleGroup,
    setSelectedEquipment,
    setSelectedDifficulty,
    setMuscleGroups,
    setEquipmentTypes,
    setDifficultyLevels,
    setCurrentPage,
    handleSearchChange,
    handleFilterChange,
    resetFilters
  };
};
