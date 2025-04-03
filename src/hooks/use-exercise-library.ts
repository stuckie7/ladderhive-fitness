
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Exercise, ExerciseFilters } from "@/types/exercise";
import { useExercises } from "./use-exercises";
import { getBodyParts, getEquipmentList } from "@/integrations/exercisedb/client";

// Default muscle groups and equipment
const defaultMuscleGroups = [
  "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body", "Cardio"
];

const defaultEquipmentTypes = [
  "Bodyweight", "Dumbbells", "Barbell", "Kettlebell", "Resistance Bands", 
  "Cable Machine", "Smith Machine", "Machine", "Medicine Ball", "Foam Roller"
];

export const useExerciseLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<ExerciseFilters>({
    muscleGroup: "all_muscle_groups",
    equipment: "all_equipment",
    difficulty: "all_difficulties"
  });
  const [availableMuscleGroups, setAvailableMuscleGroups] = useState<string[]>(defaultMuscleGroups);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(defaultEquipmentTypes);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const { 
    getExercisesByMuscleGroup, 
    getExercisesByEquipment, 
    searchExercises 
  } = useExercises();

  // Fetch available muscle groups and equipment from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [bodyParts, equipment] = await Promise.all([
          getBodyParts(),
          getEquipmentList()
        ]);
        
        if (bodyParts.length) {
          // Capitalize first letter of each body part for display
          setAvailableMuscleGroups(
            bodyParts.map(part => part.charAt(0).toUpperCase() + part.slice(1))
          );
        }
        
        if (equipment.length) {
          // Capitalize first letter of each equipment for display
          setAvailableEquipment(
            equipment.map(eq => eq.charAt(0).toUpperCase() + eq.slice(1))
          );
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };
    
    fetchFilterOptions();
  }, []);

  const fetchExercises = async () => {
    if (searchQuery) {
      return await searchExercises(searchQuery);
    }
    
    // If the muscleGroup filter is set to a real value (not the "all" option)
    if (filters.muscleGroup && filters.muscleGroup !== "all_muscle_groups") {
      return await getExercisesByMuscleGroup(filters.muscleGroup.toLowerCase());
    }
    
    // If the equipment filter is set to a real value (not the "all" option)
    if (filters.equipment && filters.equipment !== "all_equipment") {
      return await getExercisesByEquipment(filters.equipment.toLowerCase());
    }
    
    // Default: fetch exercises for the first muscle group
    const firstBodyPart = availableMuscleGroups[0]?.toLowerCase() || 'back';
    const exercises = await getExercisesByMuscleGroup(firstBodyPart);
    
    let filteredData = exercises;
    
    // Apply client-side filtering for difficulty if set
    if (filters.difficulty && filters.difficulty !== "all_difficulties") {
      filteredData = filteredData.filter(ex => 
        ex.difficulty === filters.difficulty
      );
    }
    
    return filteredData;
  };

  const { data: exercises, isLoading, refetch } = useQuery({
    queryKey: ['exercises', filters, searchQuery, availableMuscleGroups[0]],
    queryFn: fetchExercises,
    enabled: availableMuscleGroups.length > 0
  });

  const resetFilters = () => {
    setFilters({
      muscleGroup: "all_muscle_groups",
      equipment: "all_equipment",
      difficulty: "all_difficulties"
    });
    setSearchQuery("");
  };

  const getFilteredExercises = (muscleGroup: string) => {
    if (!exercises) return [];
    
    if (muscleGroup === "all") {
      return exercises;
    }
    
    return exercises.filter(ex => 
      ex.muscle_group?.toLowerCase() === muscleGroup.toLowerCase() ||
      ex.bodyPart?.toLowerCase() === muscleGroup.toLowerCase()
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    refetch();
  }, [filters, searchQuery, refetch]);

  return {
    exercises,
    isLoading,
    searchQuery,
    activeTab,
    filters,
    availableMuscleGroups,
    availableEquipment,
    importDialogOpen,
    setSearchQuery,
    setActiveTab,
    setFilters,
    setImportDialogOpen,
    resetFilters,
    getFilteredExercises,
    handleSearchChange,
    refetch
  };
};
