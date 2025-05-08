
import { useState, useEffect } from "react";
import { loadFilterOptions } from "../services/exercise-enhanced-service";

export const useExerciseFiltersState = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<string[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);

  // Load filter options on initial render
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const options = await loadFilterOptions();
      setMuscleGroups(options.muscleGroups);
      setEquipmentTypes(options.equipmentTypes);
      setDifficultyLevels(options.difficultyLevels);
    };
    
    fetchFilterOptions();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on new search
  };
  
  // Handle filter change
  const handleFilterChange = (key: "muscleGroup" | "equipment" | "difficulty", value: string) => {
    setCurrentPage(0); // Reset to first page when filter changes
    
    switch (key) {
      case "muscleGroup":
        setSelectedMuscleGroup(value);
        break;
      case "equipment":
        setSelectedEquipment(value);
        break;
      case "difficulty":
        setSelectedDifficulty(value);
        break;
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedMuscleGroup("all");
    setSelectedEquipment("all");
    setSelectedDifficulty("all");
    setCurrentPage(0);
  };

  return {
    searchQuery,
    muscleGroups,
    equipmentTypes,
    difficultyLevels,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    currentPage,
    setCurrentPage,
    handleSearchChange,
    handleFilterChange,
    resetFilters
  };
};
